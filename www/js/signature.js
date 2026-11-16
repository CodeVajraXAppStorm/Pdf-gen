import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { PDFDocument } from 'pdf-lib';

let transparentSignatureDataUrl = null;
let loadedPdfBytes = null;

// Load existing PDF for editing/signing
document.getElementById('pdfUploadInput')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  loadedPdfBytes = await file.arrayBuffer();
  document.getElementById('pdfCanvasContainer').innerHTML = `<p>Loaded: <strong>${file.name}</strong> (Ready to apply signature)</p>`;
});

// Capture or Pick Signature and Auto-Remove White Background
window.getSignature = async function (sourceType) {
  try {
    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: sourceType === 'camera' ? CameraSource.Camera : CameraSource.Photos
    });

    removeWhiteBackground(photo.dataUrl);
  } catch (err) {
    console.error('Signature capture error:', err);
  }
};

function removeWhiteBackground(imageSrc) {
  const img = new Image();
  img.onload = function () {
    const canvas = document.getElementById('sigCanvas');
    canvas.classList.remove('hidden');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Make white/light pixels completely transparent
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r > 190 && g > 190 && b > 190) {
        data[i + 3] = 0; // Alpha = 0 (Transparent)
      }
    }

    ctx.putImageData(imgData, 0, 0);
    transparentSignatureDataUrl = canvas.toDataURL('image/png');
    alert('White background removed! Transparent signature ready.');
  };
  img.src = imageSrc;
}

// Stamp Signature onto PDF & Export
window.saveEditedPdf = async function () {
  if (!loadedPdfBytes) {
    alert('Please upload a PDF file first.');
    return;
  }

  const pdfDoc = await PDFDocument.load(loadedPdfBytes);
  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];

  if (transparentSignatureDataUrl) {
    const sigImage = await pdfDoc.embedPng(transparentSignatureDataUrl);
    lastPage.drawImage(sigImage, {
      x: 350,
      y: 60,
      width: 160,
      height: 70
    });
  }

  const finalBase64 = await pdfDoc.saveAsBase64();
  await window.saveAndShareFile(finalBase64, `Signed_Doc_${Date.now()}.pdf`, 'application/pdf');
};
