import fs from 'node:fs'

const dashPath='src/pages/Dashboard3.tsx'
const cssPath='src/dashboard3.css'
let dash=fs.readFileSync(dashPath,'utf8')
let css=fs.readFileSync(cssPath,'utf8')

const oldStart='function LogoPicker({title,presets,value,onChange,onName}:any)'
if(!dash.includes(oldStart)){
  console.log('LogoPicker já atualizado; nada a fazer.')
  process.exit(0)
}

const start=dash.indexOf(oldStart)
const end=dash.indexOf('\nfunction Editor(',start)
if(end<0) throw new Error('Não encontrei o final do LogoPicker.')

const replacement=`async function prepareLogoFile(file:File):Promise<Blob>{
 if(!file.type.startsWith('image/'))throw new Error('Escolha uma imagem válida.')
 if(file.size>12*1024*1024)throw new Error('A imagem é muito grande. Use uma imagem de até 12 MB.')
 if(file.type==='image/gif'&&file.size<=2*1024*1024)return file
 const dataUrl=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Não foi possível ler a imagem.'));reader.readAsDataURL(file)})
 const img=await new Promise<HTMLImageElement>((resolve,reject)=>{const el=new Image();el.onload=()=>resolve(el);el.onerror=()=>reject(new Error('Não foi possível abrir a imagem.'));el.src=dataUrl})
 const max=640,scale=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight)),w=Math.max(1,Math.round(img.naturalWidth*scale)),h=Math.max(1,Math.round(img.naturalHeight*scale)),canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Seu navegador não conseguiu preparar a imagem.');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(img,0,0,w,h)
 return await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Não foi possível preparar a imagem.')),'image/webp',.88))
}
async function uploadLogoFile(file:File){
 const {data:{user}}=await supabase.auth.getUser();if(!user)throw new Error('Entre na sua conta novamente para enviar imagens.')
 const prepared=await prepareLogoFile(file);if(prepared.size>2*1024*1024)throw new Error('A imagem ainda ficou muito grande após otimização.')
 const ext=prepared.type==='image/gif'?'gif':'webp',id=typeof crypto!=='undefined'&&'randomUUID'in crypto?crypto.randomUUID():Math.random().toString(36).slice(2),path=\\`${user.id}/\${Date.now()}-\${id}.\${ext}\\`
 const up=await supabase.storage.from('logos').upload(path,prepared,{contentType:prepared.type,cacheControl:'31536000',upsert:false});if(up.error)throw up.error
 const {data}=supabase.storage.from('logos').getPublicUrl(path);return data.publicUrl
}
function LogoPicker({title,presets,value,onChange,onName}:any){
 const [query,setQuery]=useState(''),[uploading,setUploading]=useState(false),[uploadError,setUploadError]=useState('')
 const visible=presets.filter((p:Preset)=>p.name.toLowerCase().includes(query.toLowerCase())).slice(0,18)
 async function chooseFile(file?:File){if(!file)return;setUploading(true);setUploadError('');try{onChange(await uploadLogoFile(file))}catch(err:any){setUploadError(err?.message||'Não foi possível enviar a imagem.')}finally{setUploading(false)}}
 return <div className="fx-logo-picker"><div className="fx-picker-head"><label>{title}</label><div className="fx-search"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar logo"/></div></div><div className="fx-logo-grid">{visible.map((p:Preset)=><button type="button" key={p.name} className={value===p.logo?'selected':''} onClick={()=>{onChange(p.logo||'');if(onName)onName(p.name)}}><Avatar url={p.logo} label={p.name} fallback={p.emoji||'✨'} size="sm"/><span>{p.name}</span>{value===p.logo&&<CheckCircle2/>}</button>)}</div><div className="fx-image-upload"><Avatar url={value} label="Imagem escolhida" fallback="🖼️" size="lg"/><div className="fx-image-upload-copy"><b>Ou envie sua própria imagem</b><span>Sem link: escolha uma foto do celular ou computador. PNG, JPG, WEBP ou GIF.</span><div className="fx-upload-actions"><label className={\\`fx-upload-button \${uploading?'busy':''}\\`}><ImageIcon/>{uploading?'Enviando imagem…':'Escolher imagem'}<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled={uploading} onChange={e=>{const file=e.currentTarget.files?.[0];void chooseFile(file);e.currentTarget.value=''}}/></label>{value&&<button type="button" className="fx-remove-image" onClick={()=>{onChange('');setUploadError('')}}>Usar ícone padrão</button>}</div>{uploadError&&<small className="fx-upload-error">{uploadError}</small>}</div></div></div>
}`

dash=dash.slice(0,start)+replacement+dash.slice(end)
fs.writeFileSync(dashPath,dash)

const extra=`\n.fx-image-upload{margin-top:12px;padding:13px;border:1px dashed #315340;background:linear-gradient(145deg,#0c1b14,#09130f);border-radius:16px;display:flex;align-items:center;gap:13px}.fx-image-upload-copy{min-width:0;display:grid;gap:5px;flex:1}.fx-image-upload-copy>b{font-size:13px;color:#eaf7ef}.fx-image-upload-copy>span{font-size:11px;line-height:1.45;color:#80958a}.fx-upload-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:5px}.fx-upload-button,.fx-remove-image{border:1px solid #315440;background:#143220;color:#dff8e8;border-radius:11px;padding:9px 11px;font:inherit;font-size:11px;font-weight:800;display:inline-flex;align-items:center;gap:7px;cursor:pointer;transition:.18s}.fx-upload-button:hover,.fx-remove-image:hover{transform:translateY(-1px);border-color:#50b570}.fx-upload-button.busy{opacity:.7;pointer-events:none}.fx-upload-button svg{width:16px}.fx-upload-button input{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}.fx-remove-image{background:#111d17;color:#a7baaf}.fx-upload-error{color:#ffaaa0;font-size:11px}.fx-custom-logo{display:none!important}@media(max-width:620px){.fx-image-upload{align-items:flex-start}.fx-upload-actions{display:grid}.fx-upload-button,.fx-remove-image{width:100%;justify-content:center}}\n`
if(!css.includes('.fx-image-upload{')){css+=extra;fs.writeFileSync(cssPath,css)}
console.log('LogoPicker atualizado para upload direto de imagem.')
