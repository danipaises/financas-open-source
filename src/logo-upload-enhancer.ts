import { supabase } from './lib/supabase'

const MAX_SOURCE_SIZE = 12 * 1024 * 1024
const MAX_UPLOAD_SIZE = 2 * 1024 * 1024

function setReactInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  if (setter) setter.call(input, value)
  else input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

async function prepareImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('Escolha uma imagem válida.')
  if (file.size > MAX_SOURCE_SIZE) throw new Error('A imagem é muito grande. Use uma imagem de até 12 MB.')
  if (file.type === 'image/gif' && file.size <= MAX_UPLOAD_SIZE) return file

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    reader.readAsDataURL(file)
  })

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image()
    el.onload = () => resolve(el)
    el.onerror = () => reject(new Error('Não foi possível abrir a imagem.'))
    el.src = dataUrl
  })

  const max = 640
  const scale = Math.min(1, max / Math.max(image.naturalWidth, image.naturalHeight))
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Seu navegador não conseguiu preparar a imagem.')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(image, 0, 0, width, height)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Não foi possível otimizar a imagem.')), 'image/webp', 0.88)
  })
}

async function uploadImage(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Entre novamente na sua conta para enviar imagens.')

  const prepared = await prepareImage(file)
  if (prepared.size > MAX_UPLOAD_SIZE) throw new Error('A imagem ficou grande demais mesmo após otimização.')

  const ext = prepared.type === 'image/gif' ? 'gif' : 'webp'
  const id = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)
  const path = `${user.id}/${Date.now()}-${id}.${ext}`
  const { error } = await supabase.storage.from('logos').upload(path, prepared, {
    contentType: prepared.type,
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from('logos').getPublicUrl(path)
  return data.publicUrl
}

function enhance(label: HTMLLabelElement) {
  if (label.dataset.imageUploadReady === '1' && label.querySelector('.fx-upload-widget')) return
  const urlInput = label.querySelector<HTMLInputElement>('input')
  if (!urlInput) return

  label.dataset.imageUploadReady = '1'
  label.classList.add('fx-custom-logo-upgraded')
  urlInput.classList.add('fx-internal-logo-url')

  const widget = document.createElement('div')
  widget.className = 'fx-upload-widget'
  widget.innerHTML = `
    <div class="fx-upload-preview"><span>🖼️</span></div>
    <div class="fx-upload-content">
      <b>Enviar sua própria imagem</b>
      <small>Sem link. Escolha uma foto do celular ou computador.</small>
      <div class="fx-upload-buttons">
        <button type="button" class="fx-upload-pick">Escolher imagem</button>
        <button type="button" class="fx-upload-clear">Usar ícone padrão</button>
      </div>
      <small class="fx-upload-status"></small>
    </div>
    <input class="fx-upload-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden>
  `
  label.appendChild(widget)

  const preview = widget.querySelector<HTMLDivElement>('.fx-upload-preview')!
  const fileInput = widget.querySelector<HTMLInputElement>('.fx-upload-file')!
  const pickButton = widget.querySelector<HTMLButtonElement>('.fx-upload-pick')!
  const clearButton = widget.querySelector<HTMLButtonElement>('.fx-upload-clear')!
  const status = widget.querySelector<HTMLElement>('.fx-upload-status')!

  const sync = () => {
    const value = urlInput.value
    if (value) {
      preview.innerHTML = ''
      const img = document.createElement('img')
      img.src = value
      img.alt = 'Imagem selecionada'
      img.onerror = () => { preview.innerHTML = '<span>🖼️</span>' }
      preview.appendChild(img)
      clearButton.hidden = false
    } else {
      preview.innerHTML = '<span>🖼️</span>'
      clearButton.hidden = true
    }
  }

  pickButton.addEventListener('click', event => {
    event.preventDefault()
    fileInput.click()
  })

  clearButton.addEventListener('click', event => {
    event.preventDefault()
    setReactInputValue(urlInput, '')
    status.textContent = ''
    sync()
  })

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0]
    if (!file) return
    pickButton.disabled = true
    pickButton.textContent = 'Enviando…'
    status.className = 'fx-upload-status'
    status.textContent = 'Otimizando e enviando a imagem…'
    try {
      const publicUrl = await uploadImage(file)
      setReactInputValue(urlInput, publicUrl)
      status.className = 'fx-upload-status success'
      status.textContent = 'Imagem enviada com sucesso.'
      sync()
    } catch (error) {
      status.className = 'fx-upload-status error'
      status.textContent = error instanceof Error ? error.message : 'Não foi possível enviar a imagem.'
    } finally {
      fileInput.value = ''
      pickButton.disabled = false
      pickButton.textContent = 'Escolher imagem'
    }
  })

  const picker = label.closest('.fx-logo-picker')
  picker?.addEventListener('click', () => setTimeout(sync, 0))
  sync()
}

function scan() {
  document.querySelectorAll<HTMLLabelElement>('.fx-custom-logo').forEach(enhance)
}

export function installLogoUploadEnhancer() {
  scan()
  const observer = new MutationObserver(scan)
  observer.observe(document.documentElement, { childList: true, subtree: true })
}
