import imageCompression from 'browser-image-compression';

window.compressAndResizeImage = async function () {
  const fileInput = document.getElementById('compImageInput');
  const targetW = parseInt(document.getElementById('targetWidth').value);
  const targetH = parseInt(document.getElementById('targetHeight').value);
  const targetKb = parseFloat(document.getElementById('targetSizeKb').value);
  const statusEl = document.getElementById('compStatus');

  if (!fileInput.files || fileInput.files.length === 0) {
    alert('Please select an image file first.');
    return;
  }

  const originalFile = fileInput.files;
  statusEl.innerText = `Original Size: ${(originalFile.size / 1024).toFixed(1)} KB. Processing...`;

  try {
    // Step 1: Compress MB to KB
    const options = {
      maxSizeMB: targetKb ? targetKb / 1024 : 0.2,
      useWebWorker: true,
      initialQuality: 0.85
    };

    const compressedBlob = await imageCompression(originalFile, options);

    // Step 2: Smooth Pixel Resize (if width/height provided)
    const finalDataUrl = await resizeWithSmoothing(compressedBlob, targetW, targetH);
    const finalSizeKb = Math.round((finalDataUrl.length * 3) / 4 / 1024);

    statusEl.innerText = `Done! New Size: ~${finalSizeKb} KB`;
    await window.saveAndShareFile(finalDataUrl, `Compressed_${Date.now()}.jpg`, 'image/jpeg');
  } catch (err) {
    console.error('Compression error:', err);
    statusEl.innerText = 'Failed to compress image.';
  }
};

function resizeWithSmoothing(blob, width, height) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width || img.width;
      canvas.height = height || img.height;

      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.src = URL.createObjectURL(blob);
  });
}
