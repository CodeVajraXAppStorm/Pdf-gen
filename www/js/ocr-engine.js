import Tesseract from 'tesseract.js';

window.runOcr = async function () {
  const fileInput = document.getElementById('ocrImageInput');
  const lang = document.getElementById('ocrLang').value;
  const outputBox = document.getElementById('ocrResultText');

  if (!fileInput.files || fileInput.files.length === 0) {
    alert('Please select an image first.');
    return;
  }

  const imageFile = fileInput.files;
  outputBox.value = 'Scanning text... Please wait (first run downloads language data)...';

  try {
    const result = await Tesseract.recognize(imageFile, lang, {
      logger: m => {
        if (m.status === 'recognizing text') {
          outputBox.value = `Extracting Text: ${Math.round(m.progress * 100)}%`;
        }
      }
    });

    outputBox.value = result.data.text.trim() || 'No readable text found.';
  } catch (err) {
    console.error('OCR Error:', err);
    outputBox.value = 'Error extracting text. Ensure image is clear.';
  }
};

window.copyOcrText = function () {
  const outputBox = document.getElementById('ocrResultText');
  outputBox.select();
  navigator.clipboard.writeText(outputBox.value);
  alert('Text copied to clipboard! You can paste it in Word or Excel.');
};
