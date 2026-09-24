// Build-time flag: true when built with `vite build --mode android` (Capacitor APK)
export const IS_NATIVE_APP = import.meta.env.MODE === 'android';
