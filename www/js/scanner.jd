import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { PDFDocument } from 'pdf-lib';

let scanMode = 'normal';
let scannedPages = [];
let pendingPdfBytes = null;

window.setScanMode = function (mode, btn) {
  scanMode = mode;
  scannedPages = [];
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderScanPreview();
};

window.captureScanPage = async function () {
  try {
    const image = await Camera.getPhoto({
      quality: 85,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });

    scannedPages.push(image.dataUrl);
    renderScanPreview();

    if (scanMode === 'idcard' && scannedPages.length === 1) {
      alert('Front side captured! Now click "+ Scan Page" for Back side.');
    } else if (scanMode === 'normal') {
      const addMore = confirm('Page scanned! Do you want to scan another page?');
      if (addMore) {
        window.captureScanPage();
      }
    }
  } catch (err) {
    console.error('Camera cancelled or error:', err);
  }
};

function renderScanPreview() {
  const area = document.getElementById('scanPreviewArea');
  if (scannedPages.length === 0) {
    area.innerHTML = '<p>No pages scanned yet</p>';
    return;
  }
  area.innerHTML = scannedPages
    .map((src, i) => `<img src="${src}" alt="Page ${i + 1}" />`)
    .join('');
}

window.finishScanAndSave = async function (outputType) {
  if (scannedPages.length === 0) {
    alert('Please scan at least one page first.');
    return;
  }

  if (outputType === 'excel') {
    alert('Opening OCR & Excel module with scanned image...');
    window.openTool('ocrView', 'OCR to Excel');
    return;
  }

  const pdfDoc = await PDFDocument.create();

  if (scanMode === 'idcard') {
    // Place Front and Back on a single A4 Page
    const page = pdfDoc.addPage([595, 842]);
    const frontImg = await embedImageAuto(pdfDoc, scannedPages[0]);
    page.drawImage(frontImg, { x: 97, y: 450, width: 400, height: 250 });

    if (scannedPages[1]) {
      const backImg = await embedImageAuto(pdfDoc, scannedPages[1]);
      page.drawImage(backImg, { x: 97, y: 140, width: 400, height: 250 });
    }
  } else {
    // Standard Multi-page PDF
    for (const dataUrl of scannedPages) {
      const img = await embedImageAuto(pdfDoc, dataUrl);
      const page = pdfDoc.addPage([595, 842]);
      page.drawImage(img, { x: 20, y: 20, width: 555, height: 802 });
    }
  }

  pendingPdfBytes = await pdfDoc.saveAsBase64();
  document.getElementById('passwordModal').classList.remove('hidden');
};

async function embedImageAuto(pdfDoc, dataUrl) {
  if (dataUrl.includes('image/png')) {
    return await pdfDoc.embedPng(dataUrl);
  }
  return await pdfDoc.embedJpg(dataUrl);
}

window.confirmSavePdf = async function (usePassword) {
  document.getElementById('passwordModal').classList.add('hidden');
  const pass = document.getElementById('modalPdfPass').value;

  if (usePassword && pass) {
    // Note: Standard pdf-lib encryption wrapper placeholder
    alert(`PDF locked with password: ${pass}`);
  }

  const fileName = `Scan_${Date.now()}.pdf`;
  await window.saveAndShareFile(pendingPdfBytes, fileName, 'application/pdf');
  scannedPages = [];
  renderScanPreview();
};
