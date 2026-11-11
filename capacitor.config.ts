import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.thermocouple.app',
  appName: 'Thermo Couple',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
  },
};

export default config;
