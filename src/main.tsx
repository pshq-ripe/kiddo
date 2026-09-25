import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import '@fontsource/quicksand/500.css';
import '@fontsource/quicksand/600.css';
import '@fontsource/quicksand/700.css';
import 'material-symbols/outlined.css';
import App from './App.tsx';
import './index.css';
import { IS_NATIVE_APP } from './platform';

// Register PWA service worker for offline support in production (web only; the APK ships all files inside)
if (!IS_NATIVE_APP && 'serviceWorker' in navigator && import.meta.env.PROD) {
  import('virtual:pwa-register')
    .then(({ registerSW }) => registerSW({ immediate: true }))
    .catch(() => {});
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
