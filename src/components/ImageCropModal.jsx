'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/libs/cropImage';

const ASPECT_OPTIONS = [
  { label: '16:9 (Cover Project)', value: 16 / 9 },
  { label: '16:10 (Sertifikat)', value: 16 / 10 },
  { label: '4:3 (Standar)', value: 4 / 3 },
  { label: '1:1 (Persegi)', value: 1 },
  { label: 'Bebas', value: undefined },
];

export default function ImageCropModal({
  isOpen,
  onClose,
  imageSrc,
  fileName = 'cropped-image.jpg',
  defaultAspect = 16 / 9,
  title = 'Sesuaikan & Potong Gambar (Crop)',
  onCropAndUpload, // (blob, file) => Promise<void>
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState(defaultAspect);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [processing, setProcessing] = useState(false);

  const onCropCompleteHandler = useCallback((croppedArea, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApplyCrop = async () => {
    if (!croppedAreaPixels || !imageSrc) return;

    try {
      setProcessing(true);
      const isPng = fileName.toLowerCase().endsWith('.png');
      const mimeType = isPng ? 'image/png' : 'image/jpeg';

      const croppedBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        mimeType
      );

      // Buat File object dari blob
      const fileExt = isPng ? '.png' : '.jpg';
      const cleanBaseName = fileName.replace(/\.[^/.]+$/, '');
      const finalFileName = `${cleanBaseName}-cropped${fileExt}`;
      const finalFile = new File([croppedBlob], finalFileName, { type: mimeType });

      await onCropAndUpload(croppedBlob, finalFile);
      onClose();
    } catch (err) {
      console.error('Error saat crop gambar:', err);
      alert('Gagal memotong gambar: ' + (err.message || 'Terjadi kesalahan'));
    } finally {
      setProcessing(false);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setAspect(defaultAspect);
  };

  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{title}</h3>
              <p className="text-xs text-zinc-400">Atur zoom, posisi, dan rasio pemotongan gambar</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={processing}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Cropper Viewport */}
        <div className="relative w-full h-72 sm:h-96 bg-zinc-950 overflow-hidden select-none">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropCompleteHandler}
            classes={{
              containerClassName: 'w-full h-full relative',
              cropAreaClassName: 'border-2 border-sky-400 shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]',
            }}
          />
        </div>

        {/* Controls */}
        <div className="p-4 sm:p-5 bg-zinc-900 border-t border-zinc-800 space-y-4">
          {/* Aspect Ratio Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              Pilihan Rasio Ukuran (Aspect Ratio)
            </label>
            <div className="flex flex-wrap gap-2">
              {ASPECT_OPTIONS.map((opt, idx) => {
                const isActive = aspect === opt.value || (aspect === undefined && opt.value === undefined);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAspect(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/20'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 border border-zinc-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Zoom & Rotate Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Zoom Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs text-zinc-400">
                <span>Perbesar (Zoom)</span>
                <span className="font-mono text-sky-400 font-semibold">{zoom.toFixed(1)}x</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(1, z - 0.2))}
                  className="w-7 h-7 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm flex items-center justify-center font-bold"
                  title="Perkecil"
                >
                  −
                </button>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-sky-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
                  className="w-7 h-7 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm flex items-center justify-center font-bold"
                  title="Perbesar"
                >
                  +
                </button>
              </div>
            </div>

            {/* Quick Actions (Rotate & Reset) */}
            <div className="flex items-center gap-2 justify-end pt-2 sm:pt-0">
              <button
                type="button"
                onClick={handleRotate}
                className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs rounded-lg flex items-center gap-1.5 transition-colors"
                title="Putar 90 Derajat"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Putar 90°</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-2 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs rounded-lg transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              disabled={processing}
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={processing}
              onClick={handleApplyCrop}
              className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold rounded-xl shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memproses & Mengunggah...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Terapkan Potongan & Upload</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

