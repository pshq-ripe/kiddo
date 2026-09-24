import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'pl.pshq.kiddoworld',
  appName: 'Kiddo World',
  webDir: 'dist',
  backgroundColor: '#fbf9f3',
  android: {
    // Build with: npm run build:android (vite --mode android + cap sync)
    allowMixedContent: false,
  },
};

export default config;
