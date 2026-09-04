import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'net.taskupapp.app',
  appName: 'TaskUp',
  // Capacitor ships the built web assets inside the native binary, so `vite build`
  // must run before every `npx cap sync`.
  webDir: 'dist',
  ios: {
    // 'never' so the webview really goes edge to edge and the CSS
    // env(safe-area-inset-*) padding in App.tsx is the single thing deciding where
    // content sits. With the default 'automatic', iOS adds its own inset on top and
    // the two fight — content ends up either double-padded or, as seen on device,
    // tucked under the Dynamic Island.
    contentInset: 'never',
  },
  server: {
    // iOS serves the bundle from capacitor://localhost and Android from
    // https://localhost. Both are cross-origin to https://api.taskupapp.net, so
    // those two origins are in the API's CORS allowlist (see appsettings.Production.json).
    androidScheme: 'https',
  },
}

export default config
