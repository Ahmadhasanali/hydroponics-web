import type { CapacitorConfig } from '@capacitor/cli';

// TODO(Phase 3): replace with the production domain once deployed.
const PROD_URL = 'https://your-domain.example';

const config: CapacitorConfig = {
  appId: 'com.hydrofarm.app',
  appName: 'Hydroponics Farm',
  webDir: 'dist',
  server: {
    url: PROD_URL,
    cleartext: false,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
