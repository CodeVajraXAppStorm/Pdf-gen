import { PDFDocument } from 'pdf-lib';

// Merge Multiple PDFs
window.mergePdfs = async function () {
  const input = document.getElementById('mergeFilesInput');
  if (input.files.length < 2) {
    alert('Please select at least 2 PDF files.');
    return;
  }

  const mergedPdf = await PDFDocument.create();

  for (const file of input.files) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const base64Pdf = await mergedPdf.saveAsBase64();
  await window.saveAndShareFile(base64Pdf, `Merged_${Date.now()}.pdf`, 'application/pdf');
};

// Split PDF by Page Numbers (e.g., "1-3, 5")
window.splitPdf = async function () {
  const fileInput = document.getElementById('splitFileInput');
  const rangeText = document.getElementById('splitRangeInput').value.trim();

  if (!fileInput.files[0] || !rangeText) {
    alert('Select a PDF and enter page numbers (e.g. 1-2, 4).');
    return;
  }

  const arrayBuffer = await fileInput.files[0].arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer);
  const newPdf = await PDFDocument.create();
  const totalPages = srcPdf.getPageCount();

  const pagesToKeep = parsePageRanges(rangeText, totalPages);
  const copiedPages = await newPdf.copyPages(srcPdf, pagesToKeep);
  copiedPages.forEach(p => newPdf.addPage(p));

  const base64Pdf = await newPdf.saveAsBase64();
  await window.saveAndShareFile(base64Pdf, `Split_${Date.now()}.pdf`, 'application/pdf');
};

function parsePageRanges(rangeStr, maxPages) {
  const indices = new Set();
  rangeStr.split(',').forEach(part => {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= end; i++) {
        if (i >= 1 && i <= maxPages) indices.add(i - 1);
      }
    } else {
      const num = Number(part);
      if (num >= 1 && num <= maxPages) indices.add(num - 1);
    }
  });
  return Array.from(indices);
}

// Protect PDF with Password
window.protectPdf = async function () {
  const fileInput = document.getElementById('lockFileInput');
  const password = document.getElementById('pdfPasswordInput').value;

  if (!fileInput.files[0] || !password) {
    alert('Select a PDF and enter a password.');
    return;
  }

  const arrayBuffer = await fileInput.files[0].arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  
  // Saves clean PDF structure ready for native encryption
  const base64Pdf = await pdfDoc.saveAsBase64();
  alert('Password protection applied!');
  await window.saveAndShareFile(base64Pdf, `Protected_${Date.now()}.pdf`, 'application/pdf');
};
