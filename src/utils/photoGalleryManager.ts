import { PhotoSnapshot } from '../types';
import html2canvas from 'html2canvas';

const STORAGE_KEY = 'kiddo_photo_gallery_v1';
const MAX_PHOTOS = 25;

const findLastIndex = <T,>(arr: T[], pred: (x: T) => boolean): number => {
  for (let i = arr.length - 1; i >= 0; i--) if (pred(arr[i])) return i;
  return -1;
};

// Initial sample memories so the gallery is never blank
const INITIAL_SAMPLE_PHOTOS: PhotoSnapshot[] = [
  {
    id: 'sample-photo-1',
    timestamp: '14:20',
    roomName: 'Salon i Kuchnia Przyjaciół',
    roomId: 'apartment',
    caption: 'Wesołe powitanie w Miasteczku Kiddo! 🎈',
    imageUrl: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=600&q=80',
    charactersCount: 2,
    petsCount: 1,
    emoji: '🏠',
    isFavorite: true
  },
  {
    id: 'sample-photo-2',
    timestamp: '11:45',
    roomName: 'Cukiernia i Bar Owocowy',
    roomId: 'bakery',
    caption: 'Słodki czas pieczenia truskawkowych babeczek! 🧁🍓',
    imageUrl: '',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80',
    charactersCount: 1,
    petsCount: 0,
    emoji: '🍰',
    isFavorite: false
  }
];

export function getPhotos(): PhotoSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_PHOTOS));
      return INITIAL_SAMPLE_PHOTOS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // ignore
  }
  return INITIAL_SAMPLE_PHOTOS;
}

export function savePhoto(newPhoto: PhotoSnapshot): PhotoSnapshot[] {
  const current = getPhotos();
  let updated = [newPhoto, ...current].slice(0, MAX_PHOTOS);
  // localStorage has ~5 MB: if full, drop the oldest non-favourite photos until it fits
  while (updated.length > 0) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('kiddo_photos_updated'));
      return updated;
    } catch {
      const dropIdx = findLastIndex(updated, p => !p.isFavorite && p.id !== newPhoto.id);
      if (dropIdx === -1) break;
      updated = updated.filter((_, i) => i !== dropIdx);
    }
  }
  return current; // could not save even a single new photo
}

export function deletePhoto(photoId: string): PhotoSnapshot[] {
  const current = getPhotos();
  const updated = current.filter(p => p.id !== photoId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kiddo_photos_updated'));
  } catch {
    // ignore
  }
  return updated;
}

export function toggleFavoritePhoto(photoId: string): PhotoSnapshot[] {
  const current = getPhotos();
  const updated = current.map(p => {
    if (p.id === photoId) {
      return { ...p, isFavorite: !p.isFavorite };
    }
    return p;
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kiddo_photos_updated'));
  } catch {
    // ignore
  }
  return updated;
}

export function updatePhotoCaption(photoId: string, newCaption: string): PhotoSnapshot[] {
  const current = getPhotos();
  const updated = current.map(p => {
    if (p.id === photoId) {
      return { ...p, caption: newCaption };
    }
    return p;
  });
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('kiddo_photos_updated'));
  } catch {
    // ignore
  }
  return updated;
}

/**
 * Capture an actual live DOM element (the play stage) using browser DOM capture (html2canvas)
 * Returns a high quality base64 image data URL (PNG/JPEG)
 */
export async function captureDOMElement(element: HTMLElement): Promise<string> {
  try {
    // Hide temporary floating speech bubbles or controls during snapshot if needed
    const canvas = await html2canvas(element, {
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      ignoreElements: (el) => {
        // Do not capture screenshot flash overlay or action buttons if present inside stage
        return el.classList?.contains('camera-flash-overlay') || el.classList?.contains('snapshot-ignore');
      }
    });

    return canvas.toDataURL('image/jpeg', 0.72);
  } catch (err) {
    console.warn('DOM screenshot capture warning, falling back to styled canvas capture:', err);
    return createFallbackSnapshot(element);
  }
}

/**
 * Fallback canvas renderer if html2canvas meets browser-specific restrictions
 */
function createFallbackSnapshot(element: HTMLElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Draw colorful background gradient
  const grad = ctx.createLinearGradient(0, 0, 640, 480);
  grad.addColorStop(0, '#fde68a');
  grad.addColorStop(0.5, '#f472b6');
  grad.addColorStop(1, '#60a5fa');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 640, 480);

  // Decorative frame
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 14;
  ctx.strokeRect(12, 12, 616, 456);

  // Text stamp
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Kiddo World • Zrzut Ekranu 📸', 320, 220);

  ctx.font = '20px sans-serif';
  ctx.fillText(new Date().toLocaleDateString('pl-PL') + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 320, 260);

  return canvas.toDataURL('image/jpeg', 0.85);
}
