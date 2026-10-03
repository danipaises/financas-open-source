type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>
}

let deferredPrompt: InstallPromptEvent | null = null
let guideOpen = false
const GUIDE_KEY = 'financas-pwa-guide-v1'

const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent)

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault()
  deferredPrompt = event as InstallPromptEvent
  document.dispatchEvent(new CustomEvent('financas:pwa-ready'))
})

window.addEventListener('appinstalled', () => {
  localStorage.setItem(GUIDE_KEY, 'installed')
  deferredPrompt = null
  document.querySelector('.pwa-guide-backdrop')?.remove()
})

function instructions() {
  if (isIOS()) return 'No Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”.'
  if (/Android/i.test(navigator.userAgent)) return 'No Chrome, abra o menu ⋮ e toque em “Instalar app” ou “Adicionar à tela inicial”.'
  return 'No Chrome ou Edge, use o ícone de instalação na barra de endereço ou o menu do navegador.'
}

function showGuide(force = false) {
  if (guideOpen || isStandalone()) return
  if (!force && localStorage.getItem(GUIDE_KEY)) return
  if (!force && !document.querySelector('.fx-app')) return

  guideOpen = true
  const backdrop = document.createElement('div')
  backdrop.className = 'pwa-guide-backdrop'
  backdrop.innerHTML = `
    <section class="pwa-guide-card" role="dialog" aria-modal="true" aria-label="Instalar Finanças Open Source">
      <div class="pwa-guide-icon"><img src="https://i.postimg.cc/MpCZkZSr/icon-192.png" alt="Finanças Open Source"></div>
      <span class="pwa-guide-kicker">ETAPA FINAL DO GUIA</span>
      <h2>Instale o Finanças no seu aparelho</h2>
      <p>Assim ele abre como aplicativo, fica com o ícone na tela inicial e funciona em modo PWA.</p>
      <div class="pwa-guide-benefits">
        <div><b>📱 Acesso rápido</b><small>Abra direto pela tela inicial.</small></div>
        <div><b>✨ Modo aplicativo</b><small>Sem parecer uma aba comum do navegador.</small></div>
        <div><b>🔄 Atualizações</b><small>Novas versões chegam automaticamente.</small></div>
      </div>
      <p class="pwa-guide-help">${instructions()}</p>
      <div class="pwa-guide-actions">
        <button class="pwa-guide-install" type="button">Instalar agora</button>
        <button class="pwa-guide-later" type="button">Agora não</button>
      </div>
      <small class="pwa-guide-status"></small>
    </section>
  `
  document.body.appendChild(backdrop)

  const install = backdrop.querySelector<HTMLButtonElement>('.pwa-guide-install')!
  const later = backdrop.querySelector<HTMLButtonElement>('.pwa-guide-later')!
  const status = backdrop.querySelector<HTMLElement>('.pwa-guide-status')!

  const updateButton = () => {
    if (deferredPrompt) {
      install.hidden = false
      install.textContent = 'Instalar agora'
      status.textContent = 'Seu navegador está pronto para instalar.'
    } else {
      install.hidden = false
      install.textContent = 'Como instalar'
      status.textContent = instructions()
    }
  }
  updateButton()
  document.addEventListener('financas:pwa-ready', updateButton, { once: true })

  install.addEventListener('click', async () => {
    if (!deferredPrompt) {
      status.textContent = instructions()
      return
    }
    install.disabled = true
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') {
      localStorage.setItem(GUIDE_KEY, 'installed')
      backdrop.remove()
      guideOpen = false
    } else {
      status.textContent = 'Tudo bem. Você pode instalar depois pelo menu do navegador.'
      install.disabled = false
    }
    deferredPrompt = null
  })

  later.addEventListener('click', () => {
    localStorage.setItem(GUIDE_KEY, 'later')
    backdrop.remove()
    guideOpen = false
  })
}

function scan() {
  if (location.pathname.startsWith('/app')) showGuide(false)
}

export function installPwaGuide() {
  scan()
  const observer = new MutationObserver(scan)
  observer.observe(document.documentElement, { childList: true, subtree: true })
  ;(window as any).openFinancasPwaGuide = () => showGuide(true)
}
