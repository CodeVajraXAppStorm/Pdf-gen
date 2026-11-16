import Quill from 'quill';
import { Document, Packer, Paragraph, TextRun } from 'docx';

let quillEditor = null;

document.addEventListener('DOMContentLoaded', () => {
  const editorContainer = document.getElementById('wordEditor');
  if (!editorContainer) return;

  quillEditor = new Quill('#wordEditor', {
    theme: 'snow',
    placeholder: 'Type your document here...',
    modules: {
      toolbar: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['clean']
      ]
    }
  });
});

// Send Word content directly to Excel Grid
window.copyWordToExcel = function () {
  if (!quillEditor) return;
  const plainText = quillEditor.getText();
  window.openTool('excelView', 'MS Excel Sheet');
  if (window.pasteLinesToExcel) {
    window.pasteLinesToExcel(plainText);
    alert('Content copied into Excel cells!');
  }
};

// Export as genuine .DOCX file
window.exportWordFile = async function () {
  if (!quillEditor) return;
  const text = quillEditor.getText();
  const lines = text.split('\n');

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: lines.map(
          line =>
            new Paragraph({
              children: [new TextRun(line)]
            })
        )
      }
    ]
  });

  const base64Docx = await Packer.toBase64String(doc);
  await window.saveAndShareFile(
    base64Docx,
    `Document_${Date.now()}.docx`,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  );
};
