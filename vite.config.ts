import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins:[react(),VitePWA({
    registerType:'autoUpdate',
    manifest:{
      name:'Finanças Open Source',short_name:'Finanças',description:'Gerenciador financeiro pessoal open source.',
      theme_color:'#07140f',background_color:'#07140f',display:'standalone',start_url:'/app',scope:'/',
      icons:[
        {src:'https://i.postimg.cc/MpCZkZSr/icon-192.png',sizes:'192x192',type:'image/png'},
        {src:'https://i.postimg.cc/Pq1XdGX2/icon-512.png',sizes:'512x512',type:'image/png'},
        {src:'https://i.postimg.cc/mr7LTxLV/icon-maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}
      ]
    },
    workbox:{
      navigateFallback:'/index.html',
      cleanupOutdatedCaches:true,
      clientsClaim:true,
      skipWaiting:true
    }
  })]
})
