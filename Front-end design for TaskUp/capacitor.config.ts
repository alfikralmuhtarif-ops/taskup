import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'net.taskupapp.app',
  appName: 'TaskUp',
  // Capacitor ships the built web assets inside the native binary, so `vite build`
  // must run before every `npx cap sync`.
  webDir: 'dist',
  ios: {
    // Arabic is the default language and the whole UI is RTL-first.
    contentInset: 'automatic',
  },
  server: {
    // iOS serves the bundle from capacitor://localhost and Android from
    // https://localhost. Both are cross-origin to https://api.taskupapp.net, so
    // those two origins are in the API's CORS allowlist (see appsettings.Production.json).
    androidScheme: 'https',
  },
}

export default config
