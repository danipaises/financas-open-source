import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles.css'
import './logo-upload.css'
import './pwa-guide.css'
import { installLogoUploadEnhancer } from './logo-upload-enhancer'
import { installPwaGuide } from './pwa-guide'

installLogoUploadEnhancer()
installPwaGuide()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter><App /></BrowserRouter>
  </React.StrictMode>
)
