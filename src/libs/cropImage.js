export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

export function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180;
}

export function rotateSize(width, height, rotation) {
  const rotRad = getRadianAngle(rotation);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

/**
 * Crops and rotates an image using an in-memory canvas
 * @param {string} imageSrc - Object URL or data URL
 * @param {Object} pixelCrop - { x, y, width, height }
 * @param {number} rotation - rotation in degrees (0, 90, 180, 270)
 * @param {string} mimeType - e.g. 'image/jpeg' or 'image/png'
 * @returns {Promise<Blob>}
 */
export default async function getCroppedImg(
  imageSrc,
  pixelCrop,
  rotation = 0,
  mimeType = 'image/jpeg'
) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Tidak dapat membuat konteks canvas 2D');
  }

  const rotRad = getRadianAngle(rotation);

  // Hitung ukuran bounding box gambar yang dirotasi
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  canvas.width = Math.round(bBoxWidth);
  canvas.height = Math.round(bBoxHeight);

  // Translasi ke tengah canvas, lakukan rotasi, lalu kembalikan origin
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Gambar citra asli yang telah dirotasi
  ctx.drawImage(image, 0, 0);

  // Buat canvas hasil potongan (crop)
  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    throw new Error('Tidak dapat membuat konteks cropped canvas');
  }

  croppedCanvas.width = Math.round(pixelCrop.width);
  croppedCanvas.height = Math.round(pixelCrop.height);

  // Salin potongan gambar dari canvas utama
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    Math.round(pixelCrop.width),
    Math.round(pixelCrop.height)
  );

  return new Promise((resolve, reject) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas gagal menghasilkan blob'));
          return;
        }
        resolve(blob);
      },
      mimeType,
      0.92
    );
  });
}

