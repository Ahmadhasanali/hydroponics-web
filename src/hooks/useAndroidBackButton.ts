import { useEffect, useRef } from 'react'
import { App } from '@capacitor/app'

type RouterLike = {
  history: {
    back: () => void
    canGoBack?: () => boolean
    length?: number
  }
  navigate?: (opts: { to: string }) => void
}

export function useAndroidBackButton(router: RouterLike) {
  const lastBackPress = useRef(0)

  useEffect(() => {
    let listenerHandle: { remove: () => Promise<void> } | null = null
    let cancelled = false

    const showToast = (msg: string) => {
      window.dispatchEvent(new CustomEvent('android:toast', { detail: msg }))
      let el = document.getElementById('android-back-toast')
      if (!el) {
        el = document.createElement('div')
        el.id = 'android-back-toast'
        el.style.cssText =
          'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:8px 16px;border-radius:9999px;font-size:14px;z-index:99999;box-shadow:0 4px 12px rgba(0,0,0,0.3);'
        document.body.appendChild(el)
      }
      el.textContent = msg
      el.style.display = 'block'
      setTimeout(() => {
        if (el) el.style.display = 'none'
      }, 2000)
    }

    App.addListener('backButton', ({ canGoBack }) => {
      const pathname = window.location.pathname
      const histLen = window.history.length
      const routerCanGoBack =
        typeof router.history.canGoBack === 'function' ? router.history.canGoBack() : histLen > 1

      const openDialog = document.querySelector('[role="dialog"][data-open], [role="dialog"]:not([hidden])')
      if (openDialog) {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        return
      }

      const isRootPage = pathname === '/' || pathname === '/login' || pathname === '/register'

      if (canGoBack || routerCanGoBack) {
        try {
          router.history.back()
        } catch {
          window.history.back()
        }
        return
      }

      if (!isRootPage) {
        if (router.navigate) {
          router.navigate({ to: '/' })
        } else {
          window.history.back()
          setTimeout(() => {
            if (window.location.pathname !== '/') window.location.assign('/')
          }, 100)
        }
        return
      }

      const now = Date.now()
      if (now - lastBackPress.current < 2000) {
        App.exitApp()
      } else {
        lastBackPress.current = now
        showToast('Tekan sekali lagi untuk keluar')
      }
    }).then((handle) => {
      if (cancelled) {
        handle.remove()
      } else {
        listenerHandle = handle
      }
    })

    return () => {
      cancelled = true
      if (listenerHandle) {
        listenerHandle.remove()
      }
    }
  }, [router])
}
