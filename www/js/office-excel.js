import * as XLSX from 'xlsx';

let rowCount = 15;
let colCount = 8;

function initExcelGrid() {
  const table = document.getElementById('excelTable');
  if (!table) return;
  table.innerHTML = '';

  // Header Row (A, B, C...)
  const thead = document.createElement('tr');
  thead.innerHTML = '<th>#</th>';
  for (let c = 0; c < colCount; c++) {
    const colLetter = String.fromCharCode(65 + c);
    thead.innerHTML += `<th>${colLetter}</th>`;
  }
  table.appendChild(thead);

  // Data Rows
  for (let r = 1; r <= rowCount; r++) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<th>${r}</th>`;
    for (let c = 0; c < colCount; c++) {
      const colLetter = String.fromCharCode(65 + c);
      const cellId = `${colLetter}${r}`;
      const td = document.createElement('td');
      td.contentEditable = true;
      td.dataset.cell = cellId;
      td.addEventListener('blur', evaluateFormulas);
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}

// Basic Formula Evaluator (e.g., =SUM(A1:A5))
function evaluateFormulas() {
  const cells = document.querySelectorAll('#excelTable td');
  const values = {};

  cells.forEach(cell => {
    const raw = cell.innerText.trim();
    if (!raw.startsWith('=')) {
      values[cell.dataset.cell] = parseFloat(raw) || raw;
    }
  });

  cells.forEach(cell => {
    const raw = cell.dataset.formula || cell.innerText.trim();
    if (raw.startsWith('=SUM(') && raw.endsWith(')')) {
      cell.dataset.formula = raw;
      const range = raw.slice(5, -1).split(':');
      if (range.length === 2) {
        const startCol = range.charCodeAt(0);
        const startRow = parseInt(range.slice(1));
        const endCol = range.charCodeAt(0);
        const endRow = parseInt(range.slice(1));
        let sum = 0;
        for (let c = startCol; c <= endCol; c++) {
          for (let r = startRow; r <= endRow; r++) {
            const key = `${String.fromCharCode(c)}${r}`;
            if (typeof values[key] === 'number') sum += values[key];
          }
        }
        cell.innerText = sum;
      }
    }
  });
}

window.addExcelRow = function () {
  rowCount++;
  initExcelGrid();
};

window.addExcelCol = function () {
  if (colCount < 26) {
    colCount++;
    initExcelGrid();
  }
};

window.exportExcelFile = async function () {
  const table = document.getElementById('excelTable');
  const wb = XLSX.utils.table_to_book(table, { sheet: 'Sheet1' });
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });

  await window.saveAndShareFile(
    wbout,
    `Sheet_${Date.now()}.xlsx`,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
};

// Helper to paste text directly into Excel grid cells
window.pasteLinesToExcel = function (text) {
  const lines = text.split('\n').filter(l => l.trim() !== '');
  lines.forEach((line, rIndex) => {
    const cols = line.split(/\t|\s{2,}/);
    cols.forEach((val, cIndex) => {
      const colLetter = String.fromCharCode(65 + cIndex);
      const cell = document.querySelector(`td[data-cell="${colLetter}${rIndex + 1}"]`);
      if (cell) cell.innerText = val.trim();
    });
  });
};

document.addEventListener('DOMContentLoaded', initExcelGrid);
