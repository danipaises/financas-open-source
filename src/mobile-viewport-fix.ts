function isMobileViewport() {
  return window.matchMedia('(max-width: 900px)').matches
}

function resetElement(el: HTMLElement | null, width?: number) {
  if (!el) return
  el.style.transform = 'none'
  ;(el.style as any).translate = 'none'
  ;(el.style as any).scale = '1'
  ;(el.style as any).zoom = '1'
  el.style.marginLeft = '0'
  el.style.marginRight = '0'
  if (width) {
    el.style.width = `${width}px`
    el.style.maxWidth = `${width}px`
    el.style.minWidth = `${width}px`
  }
}

function normalizeMobileViewport() {
  if (!isMobileViewport()) return

  const viewportWidth = Math.round(
    Math.max(
      window.innerWidth || 0,
      document.documentElement.clientWidth || 0,
      window.visualViewport?.width || 0,
    ),
  )

  if (!viewportWidth) return

  const html = document.documentElement
  const body = document.body
  const root = document.getElementById('root')
  const app = document.querySelector<HTMLElement>('.fx-app')
  const main = document.querySelector<HTMLElement>('.fx-main')
  const bottom = document.querySelector<HTMLElement>('.fx-bottom')

  html.style.overflowX = 'hidden'
  body.style.overflowX = 'hidden'
  html.style.background = '#06100c'
  body.style.background = '#06100c'

  resetElement(html)
  resetElement(body)
  resetElement(root, viewportWidth)
  resetElement(app, viewportWidth)
  resetElement(main, viewportWidth)

  if (app) {
    app.style.display = 'block'
    app.style.overflowX = 'hidden'
  }

  if (main) {
    main.style.boxSizing = 'border-box'
    main.style.paddingBottom = 'calc(92px + env(safe-area-inset-bottom))'
  }

  // Mantém a navegação principal sempre visível na parte inferior do PWA.
  if (bottom) {
    resetElement(bottom, viewportWidth)
    bottom.style.position = 'fixed'
    bottom.style.left = '0'
    bottom.style.right = '0'
    bottom.style.bottom = '0'
    bottom.style.top = 'auto'
    bottom.style.zIndex = '1000'
    bottom.style.display = 'grid'
    bottom.style.gridTemplateColumns = 'repeat(5, minmax(0, 1fr))'
  }
}

function scheduleNormalize() {
  normalizeMobileViewport()
  requestAnimationFrame(() => normalizeMobileViewport())
  window.setTimeout(normalizeMobileViewport, 80)
  window.setTimeout(normalizeMobileViewport, 240)
}

export function installMobileViewportFix() {
  scheduleNormalize()

  window.addEventListener('resize', scheduleNormalize, { passive: true })
  window.addEventListener('orientationchange', scheduleNormalize)
  window.addEventListener('pageshow', scheduleNormalize)
  window.addEventListener('popstate', scheduleNormalize)
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) scheduleNormalize()
  })

  window.visualViewport?.addEventListener('resize', scheduleNormalize, { passive: true })
  window.visualViewport?.addEventListener('scroll', scheduleNormalize, { passive: true })

  const observer = new MutationObserver(() => normalizeMobileViewport())
  observer.observe(document.documentElement, { childList: true, subtree: true })
}
