import { useEffect, useRef } from 'react'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'

type RouterLike = {
  history: {
    back: () => void
    canGoBack?: () => boolean
    length?: number
  }
  navigate?: (opts: { to: string }) => void
}

/**
 * Hook untuk menangani tombol Back sistem Android di Capacitor.
 * Tanpa ini, menekan Back akan langsung menutup aplikasi (App.exitApp default).
 *
 * Logika:
 * - Jika WebView bisa back (canGoBack dari Capacitor / window.history), lakukan router.history.back()
 * - Jika di root path (/, /login, dll) dan tidak bisa back → exit dengan double-tap guard
 */
export function useAndroidBackButton(router: RouterLike) {
  const lastBackPress = useRef(0)

  useEffect(() => {
    console.log('[BackButton] init, isNative:', Capacitor.isNativePlatform(), 'pathname:', window.location.pathname)

    let listenerHandle: { remove: () => Promise<void> } | null = null
    let cancelled = false

    const showToast = (msg: string) => {
      window.dispatchEvent(new CustomEvent('android:toast', { detail: msg }))
      // fallback DOM toast jika React toast tidak ke-render
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

      console.log('[BackButton] press', { pathname, canGoBack, routerCanGoBack, histLen })

      const openDialog = document.querySelector('[role="dialog"][data-open], [role="dialog"]:not([hidden])')
      if (openDialog) {
        console.log('[BackButton] dialog open -> dispatch Escape')
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        // juga coba dismiss dengan click outside? biarkan dulu
        return
      }

      const isRootPage = pathname === '/' || pathname === '/login' || pathname === '/register'

      // Jika bisa back (baik dari Capacitor maupun router history), lakukan back
      if (canGoBack || routerCanGoBack) {
        console.log('[BackButton] -> router.history.back()')
        try {
          router.history.back()
        } catch {
          window.history.back()
        }
        return
      }

      // Tidak bisa back history
      if (!isRootPage) {
        console.log('[BackButton] no history but not root -> navigate /')
        if (router.navigate) {
          router.navigate({ to: '/' })
        } else {
          window.history.back()
          // fallback jika tetap tidak bisa, assign
          setTimeout(() => {
            if (window.location.pathname !== '/') window.location.assign('/')
          }, 100)
        }
        return
      }

      // Di root dan tidak bisa back → double-tap to exit
      const now = Date.now()
      if (now - lastBackPress.current < 2000) {
        console.log('[BackButton] double tap -> exitApp')
        App.exitApp()
      } else {
        lastBackPress.current = now
        console.log('[BackButton] first tap -> show toast')
        showToast('Tekan sekali lagi untuk keluar')
      }
    }).then((handle) => {
      if (cancelled) {
        handle.remove()
      } else {
        listenerHandle = handle
        console.log('[BackButton] listener registered')
      }
    })

    return () => {
      cancelled = true
      if (listenerHandle) {
        console.log('[BackButton] removing listener')
        listenerHandle.remove()
      }
    }
  }, [router])
}
