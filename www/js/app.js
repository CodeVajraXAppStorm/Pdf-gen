import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

// Import all feature modules
import './scanner.js';
import './pdf-tools.js';
import './signature.js';
import './office-excel.js';
import './office-word.js';
import './ocr-engine.js';
import './image-compressor.js';
import './zip-manager.js';

// Navigation Controller
window.openTool = function (viewId, title) {
  document.getElementById('homeView').classList.add('hidden');
  document.querySelectorAll('.tool-view').forEach(el => el.classList.add('hidden'));
  
  document.getElementById(viewId).classList.remove('hidden');
  document.getElementById('headerTitle').innerText = title;
  document.getElementById('backBtn').classList.remove('hidden');
};

window.goHome = function () {
  document.querySelectorAll('.tool-view').forEach(el => el.classList.add('hidden'));
  document.getElementById('homeView').classList.remove('hidden');
  document.getElementById('headerTitle').innerText = 'DocStudio Pro';
  document.getElementById('backBtn').classList.add('hidden');
};

// Universal File Saver (Saves to Device & Opens Share/Viewer)
window.saveAndShareFile = async function (base64Data, fileName, mimeType) {
  try {
    const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
    
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: cleanBase64,
      directory: Directory.Documents
    });

    alert(`Saved to Documents/${fileName}`);

    await Share.share({
      title: fileName,
      url: savedFile.uri,
      dialogTitle: 'Open or Share File'
    });
  } catch (err) {
    console.warn('Native save fallback to browser download:', err);
    const link = document.createElement('a');
    link.href = base64Data.startsWith('data:') ? base64Data : `data:${mimeType};base64,${base64Data}`;
    link.download = fileName;
    link.click();
  }
};
