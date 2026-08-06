import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { api } from '../lib/api'

export function usePushNotifications() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    PushNotifications.requestPermissions().then((result) => {
      if (result.receive === 'granted') {
        PushNotifications.register()
      }
    })

    PushNotifications.addListener('registration', async (token) => {
      try {
        await api.post('/push-subscriptions', {
          fcm_token: token.value,
          platform: 'android',
          device_info: 'android-webview',
        })
      } catch (err) {
        console.error('Push subscription registration failed:', err)
      }
    })

    PushNotifications.addListener('registrationError', (err) => {
      console.error('Push registration error:', err)
    })
  }, [])
}
