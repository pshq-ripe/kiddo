import React, { useState, useEffect } from 'react';
import { PhotoSnapshot, TabType } from '../types';
import { getPhotos, deletePhoto, toggleFavoritePhoto, updatePhotoCaption } from '../utils/photoGalleryManager';
import { sound } from '../utils/sound';

interface PhotoGallerySectionProps {
  onNavigate: (tab: TabType, roomId?: string) => void;
}

export const PhotoGallerySection: React.FC<PhotoGallerySectionProps> = ({ onNavigate }) => {
  const [photos, setPhotos] = useState<PhotoSnapshot[]>(() => getPhotos());
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoSnapshot | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [tempCaption, setTempCaption] = useState<string>('');

  useEffect(() => {
    const handleUpdate = () => {
      setPhotos(getPhotos());
    };
    window.addEventListener('kiddo_photos_updated', handleUpdate);
    return () => {
      window.removeEventListener('kiddo_photos_updated', handleUpdate);
    };
  }, []);

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playPop(360);
    const updated = deletePhoto(id);
    setPhotos(updated);
    if (selectedPhoto?.id === id) {
      setSelectedPhoto(null);
    }
  };

  const handleToggleFav = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playSparkle();
    const updated = toggleFavoritePhoto(id);
    setPhotos(updated);
    if (selectedPhoto?.id === id) {
      setSelectedPhoto(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
  };

  const handleDownload = (photo: PhotoSnapshot, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playCamera();
    const imageSrc = photo.imageUrl || photo.thumbnailUrl;
    if (!imageSrc) return;

    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `Kiddo-${photo.roomName.replace(/\s+/g, '-')}-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const startEditCaption = (photo: PhotoSnapshot, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCaptionId(photo.id);
    setTempCaption(photo.caption);
  };

  const saveCaption = (id: string) => {
    sound.playPop(620);
    const updated = updatePhotoCaption(id, tempCaption.trim() || 'Cudowna pamiątka!');
    setPhotos(updated);
    if (selectedPhoto?.id === id) {
      setSelectedPhoto(prev => prev ? { ...prev, caption: tempCaption.trim() || 'Cudowna pamiątka!' } : null);
    }
    setEditingCaptionId(null);
  };

  // Filtered photos
  const filteredPhotos = photos.filter(p => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'favorites') return p.isFavorite;
    if (activeFilter === 'apartment') return p.roomId === 'apartment';
    if (activeFilter === 'playground') return p.roomId === 'playground';
    if (activeFilter === 'bakery') return p.roomId === 'bakery';
    if (activeFilter === 'artSchool') return p.roomId === 'artSchool';
    if (activeFilter === 'beach') return p.roomId === 'beach';
    return true;
  });

  return (
    <div className="flex flex-col gap-4 w-full select-none">
      {/* Top Gallery Header Bar */}
      <div className="bg-surface-container-lowest p-3.5 rounded-2xl shadow-sm border border-outline-variant/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-400 text-white flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[24px]">photo_library</span>
          </div>
          <div>
            <h3 className="font-extrabold text-[16px] text-on-surface leading-tight">
              Galeria Zdjęć z Pokoi
            </h3>
            <p className="text-[12px] text-on-surface-variant font-medium">
              Przechwycone zrzuty ekranu DOM z Twoich zabaw ({photos.length})
            </p>
          </div>
        </div>

        {/* Action button to jump to play room and snap */}
        <button
          type="button"
          onClick={() => {
            sound.playSparkle();
            onNavigate('play-zone');
          }}
          className="px-3 py-1.5 rounded-full bg-primary text-on-primary font-bold text-[12px] flex items-center gap-1.5 shadow-sm active:scale-95 transition-all hover:bg-primary/90"
        >
          <span className="material-symbols-outlined text-[16px]">photo_camera</span>
          <span>Nowe zdjęcie</span>
        </button>
      </div>

      {/* Room and Category Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
        {[
          { id: 'all', label: `Wszystkie (${photos.length})`, icon: 'collections' },
          { id: 'favorites', label: `⭐ Ulubione (${photos.filter(p => p.isFavorite).length})`, icon: 'star' },
          { id: 'apartment', label: '🏠 Salon', icon: 'cottage' },
          { id: 'playground', label: '🌳 Park', icon: 'park' },
          { id: 'bakery', label: '🍰 Cukiernia', icon: 'cake' },
          { id: 'artSchool', label: '🎨 Sztuka', icon: 'palette' },
          { id: 'beach', label: '🏖️ Plaża', icon: 'beach_access' }
        ].map(filter => (
          <button
            key={filter.id}
            type="button"
            onClick={() => {
              sound.playPop(540);
              setActiveFilter(filter.id);
            }}
            className={`shrink-0 px-3 py-1.5 rounded-full text-[12px] font-bold transition-all active:scale-95 flex items-center gap-1 ${
              activeFilter === filter.id
                ? 'bg-primary text-on-primary shadow-xs'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredPhotos.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl p-8 text-center flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/40 my-2">
          <div className="w-16 h-16 rounded-full bg-primary-container/30 text-primary flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[36px]">no_photography</span>
          </div>
          <h4 className="font-extrabold text-[16px] text-on-surface mb-1">
            Brak zdjęć w tej kategorii
          </h4>
          <p className="text-[13px] text-on-surface-variant max-w-[280px] mb-4">
            Wejdź do pokoju zabaw i kliknij żółty przycisk aparatu 📸 u góry ekranu, aby przechwycić widok!
          </p>
          <button
            type="button"
            onClick={() => {
              sound.playSparkle();
              onNavigate('play-zone');
            }}
            className="px-4 py-2 rounded-full bg-primary text-on-primary font-bold text-[13px] shadow-md flex items-center gap-2 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[18px]">videogame_asset</span>
            <span>Przejdź do Pokoju Zabaw</span>
          </button>
        </div>
      ) : (
        /* Photos Grid Layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredPhotos.map(photo => {
            const imgSrc = photo.imageUrl || photo.thumbnailUrl;
            return (
              <div
                key={photo.id}
                onClick={() => {
                  sound.playPop(580);
                  setSelectedPhoto(photo);
                }}
                className="group relative bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/40 hover:shadow-md transition-all cursor-pointer flex flex-col"
              >
                {/* Image Snapshot Canvas Preview Container */}
                <div className="relative w-full aspect-[4/3] bg-surface-container overflow-hidden">
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={photo.caption}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 to-amber-100 text-on-surface-variant p-4 text-center">
                      <span className="text-[36px] mb-1">📸</span>
                      <span className="font-bold text-[12px] text-primary">{photo.roomName}</span>
                    </div>
                  )}

                  {/* Top Overlay Badges */}
                  <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
                    <div className="bg-surface-container-lowest/90 backdrop-blur-md px-2.5 py-0.5 rounded-full shadow-xs border border-outline-variant/30 flex items-center gap-1 pointer-events-auto">
                      <span className="text-[12px]">{photo.emoji || '📸'}</span>
                      <span className="text-[11px] font-extrabold text-on-surface truncate max-w-[120px]">
                        {photo.roomName}
                      </span>
                    </div>

                    <button
                      type="button"
                      title={photo.isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}
                      onClick={(e) => handleToggleFav(photo.id, e)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center pointer-events-auto shadow-xs active:scale-90 transition-transform ${
                        photo.isFavorite
                          ? 'bg-amber-400 text-amber-950'
                          : 'bg-surface-container-lowest/80 text-on-surface-variant hover:bg-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {photo.isFavorite ? 'star' : 'star_border'}
                      </span>
                    </button>
                  </div>

                  {/* Bottom Timestamp pill on photo */}
                  <div className="absolute bottom-2 left-2 pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">schedule</span>
                      <span>{photo.date ? `${photo.date}, ` : ''}{photo.timestamp}</span>
                    </div>
                  </div>

                  {/* Hover magnifying glass indicator */}
                  <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-md">
                      <span className="material-symbols-outlined text-[22px]">zoom_in</span>
                    </div>
                  </div>
                </div>

                {/* Photo Card Footer & Caption */}
                <div className="p-3 flex flex-col justify-between flex-1 gap-2">
                  {editingCaptionId === photo.id ? (
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        value={tempCaption}
                        onChange={e => setTempCaption(e.target.value)}
                        className="flex-1 px-2 py-1 text-[12px] bg-surface-container rounded-lg border border-primary/50 outline-none font-semibold"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') saveCaption(photo.id);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => saveCaption(photo.id)}
                        className="p-1 text-primary hover:bg-primary/10 rounded-md"
                      >
                        <span className="material-symbols-outlined text-[18px]">check</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-1">
                      <p className="font-bold text-[13px] text-on-surface leading-snug line-clamp-2">
                        {photo.caption}
                      </p>
                      <button
                        type="button"
                        title="Edytuj podpis"
                        onClick={(e) => startEditCaption(photo, e)}
                        className="text-on-surface-variant/60 hover:text-on-surface p-0.5 rounded-md shrink-0"
                      >
                        <span className="material-symbols-outlined text-[15px]">edit</span>
                      </button>
                    </div>
                  )}

                  {/* Actions row: Download & Delete */}
                  <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20 text-[11px] text-on-surface-variant font-medium">
                    <div className="flex items-center gap-1">
                      {photo.charactersCount ? (
                        <span className="bg-surface-container px-1.5 py-0.5 rounded text-[10px] font-bold">
                          👥 {photo.charactersCount}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Pobierz zrzut ekranu"
                        onClick={(e) => handleDownload(photo, e)}
                        className="p-1 rounded-lg text-primary hover:bg-primary/10 active:scale-90 transition-transform"
                      >
                        <span className="material-symbols-outlined text-[18px]">download</span>
                      </button>

                      <button
                        type="button"
                        title="Usuń zdjęcie"
                        onClick={(e) => handleDelete(photo.id, e)}
                        className="p-1 rounded-lg text-error hover:bg-error/10 active:scale-90 transition-transform"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* Lightbox / Fullscreen Modal for Selected Screenshot                       */}
      {/* ========================================================================= */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 select-none"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="bg-surface-container-lowest rounded-3xl max-w-[460px] w-full overflow-hidden shadow-2xl border-4 border-white flex flex-col animate-scale-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="text-[20px]">{selectedPhoto.emoji || '📸'}</span>
                <div>
                  <h4 className="font-extrabold text-[15px] text-on-surface leading-tight">
                    {selectedPhoto.roomName}
                  </h4>
                  <span className="text-[11px] text-on-surface-variant font-medium">
                    {selectedPhoto.date ? `${selectedPhoto.date} o ` : ''}{selectedPhoto.timestamp}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleFav(selectedPhoto.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xs active:scale-90 transition-transform ${
                    selectedPhoto.isFavorite ? 'bg-amber-400 text-amber-950' : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {selectedPhoto.isFavorite ? 'star' : 'star_border'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPhoto(null)}
                  className="w-8 h-8 rounded-full bg-surface-container text-on-surface-variant hover:text-on-surface flex items-center justify-center active:scale-90 transition-transform"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Modal Large Image Screenshot View */}
            <div className="relative w-full aspect-[4/3] bg-black flex items-center justify-center overflow-hidden">
              {selectedPhoto.imageUrl || selectedPhoto.thumbnailUrl ? (
                <img
                  src={selectedPhoto.imageUrl || selectedPhoto.thumbnailUrl}
                  alt={selectedPhoto.caption}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-white text-center p-6">
                  <span className="text-[44px] mb-2 block">📷</span>
                  <p className="font-bold">Podgląd zrzutu ekranu</p>
                </div>
              )}
            </div>

            {/* Modal Description & Actions */}
            <div className="p-4 flex flex-col gap-3">
              <div className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/30">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block mb-1">
                  Podpis pod zdjęciem
                </span>
                <p className="font-bold text-[14px] text-on-surface">
                  {selectedPhoto.caption}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(selectedPhoto)}
                  className="flex-1 py-2.5 px-3 rounded-full bg-primary text-on-primary font-extrabold text-[13px] flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Zapisz na dysku</span>
                </button>

                {selectedPhoto.roomId && (
                  <button
                    type="button"
                    onClick={() => {
                      sound.playSparkle();
                      onNavigate('play-zone', selectedPhoto.roomId);
                    }}
                    className="py-2.5 px-3 rounded-full bg-secondary-container text-on-secondary-container font-extrabold text-[13px] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">door_front</span>
                    <span>Odwiedź pokój</span>
                  </button>
                )}

                <button
                  type="button"
                  title="Usuń zdjęcie"
                  onClick={() => handleDelete(selectedPhoto.id)}
                  className="w-10 h-10 rounded-full bg-surface-container text-error hover:bg-error/10 flex items-center justify-center active:scale-90 transition-transform"
                >
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
