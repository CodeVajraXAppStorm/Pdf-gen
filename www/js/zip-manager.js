import JSZip from 'jszip';

// Compress multiple files into a single ZIP
window.createZipArchive = async function () {
  const input = document.getElementById('filesToZipInput');
  if (!input.files || input.files.length === 0) {
    alert('Select one or more files to zip.');
    return;
  }

  const zip = new JSZip();
  for (const file of input.files) {
    const buffer = await file.arrayBuffer();
    zip.file(file.name, buffer);
  }

  const base64Zip = await zip.generateAsync({
    type: 'base64',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  await window.saveAndShareFile(base64Zip, `Archive_${Date.now()}.zip`, 'application/zip');
};

// Extract files from an existing ZIP archive
window.extractZipArchive = async function () {
  const input = document.getElementById('zipToExtractInput');
  const listDiv = document.getElementById('extractedList');

  if (!input.files || input.files.length === 0) {
    alert('Please select a .zip file.');
    return;
  }

  listDiv.innerHTML = '<p>Extracting...</p>';
  const zipData = await input.files.arrayBuffer();
  const zip = await JSZip.loadAsync(zipData);

  listDiv.innerHTML = '';
  zip.forEach((relativePath, zipEntry) => {
    if (!zipEntry.dir) {
      const btn = document.createElement('button');
      btn.className = 'secondary-btn full-width';
      btn.style.marginTop = '6px';
      btn.innerText = `Save: ${relativePath}`;
      btn.onclick = async () => {
        const base64Content = await zipEntry.async('base64');
        await window.saveAndShareFile(base64Content, relativePath.split('/').pop(), 'application/octet-stream');
      };
      listDiv.appendChild(btn);
    }
  });
};
