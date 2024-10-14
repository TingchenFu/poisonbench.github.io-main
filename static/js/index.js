document.addEventListener('DOMContentLoaded', function() {
  loadTableData();
  setupEventListeners();
  window.addEventListener('resize', adjustNameColumnWidth);
});

function loadTableData() {
  console.log('Starting to load table data...');
  fetch('./leaderboard_data.json')
    .then(response => {
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Data loaded successfully:', data);
      const tbody = document.querySelector('#mmmu-table tbody');
      if (!tbody) {
        throw new Error('Table body not found in the DOM');
      }

      // Clear existing table rows
      tbody.innerHTML = '';

      // Prepare data for styling
      const contentInjectionScores = prepareScoresForStyling(data.leaderboardData, 'Content Injection');
      const alignmentDeteriorationScores = prepareScoresForStyling(data.leaderboardData, 'Alignment Deterioration');

      data.leaderboardData.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.classList.add(row.info.type);
        
        const nameCell = row.info.link && row.info.link.trim() !== '' ?
          `<a href="${row.info.link}" target="_blank"><b>${row.info.name}</b></a>` :
          `<b>${row.info.name}</b>`;
        
        tr.innerHTML = `
          <td>${nameCell}</td>
          <td>${row.info.date}</td>
          <td class="content-overall">${applyStyle(safeGet(row, 'Content Injection.AS'), contentInjectionScores.AS[index])}</td>
          <td class="content-overall">${applyStyle(safeGet(row, 'Content Injection.SS'), contentInjectionScores.SS[index])}</td>
          <td class="alignment-overall">${applyStyle(safeGet(row, 'Alignment Deterioration.AS'), alignmentDeteriorationScores.AS[index])}</td>
          <td class="alignment-overall">${applyStyle(safeGet(row, 'Alignment Deterioration.SS'), alignmentDeteriorationScores.SS[index])}</td>
        `;
        tbody.appendChild(tr);
      });

      // Initialize sorting after table is populated
      initializeSorting();
      
      // Adjust column widths after table is populated
      adjustNameColumnWidth();
    })
    .catch(error => {
      console.error('Error loading table data:', error);
      const tbody = document.querySelector('#mmmu-table tbody');
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="6">Error loading data: ${error.message}<br>Please ensure you're accessing this page through a web server (http://localhost:8000) and not directly from the file system.</td>
          </tr>
        `;
      } else {
        console.error('Table body not found in the DOM');
      }
    });
}



function setupEventListeners() {
  document.querySelector('.reset-cell').addEventListener('click', function() {
    resetTable();
  });

  document.querySelector('.content-detail-cell').addEventListener('click', function() {
    toggleDetails('content');
  });
  document.querySelector('.alignment-detail-cell').addEventListener('click', function() {
    toggleDetails('alignment');
  });
  // document.querySelector('.test-details-cell').addEventListener('click', function() {
  //   toggleDetails('test');
  // });

  var headers = document.querySelectorAll('#mmmu-table thead tr:last-child th.sortable');
  headers.forEach(function(header) {
    header.addEventListener('click', function() {
      sortTable(this);
    });
  });
}

function toggleDetails(section) {
  var sections = ['content', 'alignment'];
  sections.forEach(function(sec) {
    var detailCells = document.querySelectorAll('.' + sec + '-detail');
    var overallCells = document.querySelectorAll('.' + sec + '-overall');
    var headerCell = document.querySelector('.' + sec + '-detail-cell');
    if (sec === section) {
      detailCells.forEach(cell => cell.classList.toggle('hidden'));
      headerCell.setAttribute('colspan', headerCell.getAttribute('colspan') === '2' ? 10 : '2');
    } else {
      detailCells.forEach(cell => cell.classList.add('hidden'));
      overallCells.forEach(cell => cell.classList.remove('hidden'));
      headerCell.setAttribute('colspan', '2');
    }
  });

  setTimeout(adjustNameColumnWidth, 0);
}

function resetTable() {
  document.querySelectorAll('.content-detail, .alignment-detail').forEach(function(cell) {
    cell.classList.add('hidden');
  });

  document.querySelectorAll('.content-overall, .alignment-overall').forEach(function(cell) {
    cell.classList.remove('hidden');
  });

  document.querySelector('.content-detail-cell').setAttribute('colspan', '2');
  document.querySelector('.alignment-detail-cell').setAttribute('colspan', '2');
  // document.querySelector('.test-details-cell').setAttribute('colspan', '1');

  var valOverallHeader = document.querySelector('#mmmu-table thead tr:last-child th.val-overall');
  sortTable(valOverallHeader, true);

  setTimeout(adjustNameColumnWidth, 0);
}

function sortTable(header, forceDescending = false, maintainOrder = false) {
  var table = document.getElementById('mmmu-table');
  var tbody = table.querySelector('tbody');
  var rows = Array.from(tbody.querySelectorAll('tr'));
  var headers = Array.from(header.parentNode.children);
  var columnIndex = headers.indexOf(header);
  var sortType = header.dataset.sort;

  var isDescending = forceDescending || (!header.classList.contains('asc') && !header.classList.contains('desc')) || header.classList.contains('asc');

  if (!maintainOrder) {
    rows.sort(function(a, b) {
      var aValue = getCellValue(a, columnIndex);
      var bValue = getCellValue(b, columnIndex);

      if (aValue === '-' && bValue !== '-') return isDescending ? 1 : -1;
      if (bValue === '-' && aValue !== '-') return isDescending ? -1 : 1;

      if (sortType === 'number') {
        return isDescending ? parseFloat(bValue) - parseFloat(aValue) : parseFloat(aValue) - parseFloat(bValue);
      } else if (sortType === 'date') {
        return isDescending ? new Date(bValue) - new Date(aValue) : new Date(aValue) - new Date(bValue);
      } else {
        return isDescending ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      }
    });
  }

  headers.forEach(function(th) {
    th.classList.remove('asc', 'desc');
  });

  header.classList.add(isDescending ? 'desc' : 'asc');

  rows.forEach(function(row) {
    tbody.appendChild(row);
  });

  setTimeout(adjustNameColumnWidth, 0);
}

function getCellValue(row, index) {
  var cells = Array.from(row.children);
  var cell = cells[index];

  if (cell.classList.contains('hidden')) {
    if (cell.classList.contains('content-detail') || cell.classList.contains('content-overall')) {
      cell = cells.find(c => (c.classList.contains('content-overall') || c.classList.contains('content-detail')) && !c.classList.contains('hidden'));
    } else if (cell.classList.contains('alignment-detail') || cell.classList.contains('alignment-overall')) {
      cell = cells.find(c => (c.classList.contains('alignment-overall') || c.classList.contains('alignment-detail')) && !c.classList.contains('hidden'));
    }
  }
  return cell ? cell.textContent.trim() : '';
}

function initializeSorting() {
  var valOverallHeader = document.querySelector('#mmmu-table thead tr:last-child th.val-overall');
  sortTable(valOverallHeader, true);
}

function adjustNameColumnWidth() {
  const nameColumn = document.querySelectorAll('#mmmu-table td:first-child, #mmmu-table th:first-child');
  let maxWidth = 0;

  const span = document.createElement('span');
  span.style.visibility = 'hidden';
  span.style.position = 'absolute';
  span.style.whiteSpace = 'nowrap';
  document.body.appendChild(span);

  nameColumn.forEach(cell => {
    span.textContent = cell.textContent;
    const width = span.offsetWidth;
    if (width > maxWidth) {
      maxWidth = width;
    }
  });

  document.body.removeChild(span);

  maxWidth +=  20 ; // Increased padding

  nameColumn.forEach(cell => {
    cell.style.width = `${maxWidth}px`;
    cell.style.minWidth = `${maxWidth}px`; // Added minWidth
    cell.style.maxWidth = `${maxWidth}px`;
  });
}

function prepareScoresForStyling(data, section) {
  const scores = {};
  // const fields = [
  //   'overall', 'vision', 'original', 'artDesign', 'business',
  //   'science', 'healthMedicine', 'humanSocialSci', 'techEng'
  // ];
  const fields = ['AS','SS']

  fields.forEach(field => {
    const values = data.map(row => row[section] && row[section][field])
                       .filter(value => value !== '-' && value !== undefined && value !== null)
                       .map(parseFloat);

    if (values.length > 0) {
      const sortedValues = [...new Set(values)].sort((a, b) => b - a);
      scores[field] = data.map(row => {
        const value = row[section] && row[section][field];
        if (value === '-' || value === undefined || value === null) {
          return -1;
        }
        return sortedValues.indexOf(parseFloat(value));
      });
    } else {
      scores[field] = data.map(() => -1);
    }
  });

  return scores;
}

function safeGet(obj, path, defaultValue = '-') {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
}

function applyStyle(value, rank) {
  if (value === undefined || value === null || value === '-') return '-';
  if (rank === 0) return `<b>${value}</b>`;
  if (rank === 1) return `<span style="text-decoration: underline;">${value}</span>`;
  return value;
}

function prepareScoresForStyling(data, section) {
  const scores = {};
  const fields = ['AS', 'SS'];

  fields.forEach(field => {
    const values = data.map(row => row[section] && row[section][field])
                       .filter(value => value !== '-' && value !== undefined && value !== null)
                       .map(parseFloat);

    if (values.length > 0) {
      const sortedValues = [...new Set(values)].sort((a, b) => b - a);
      scores[field] = data.map(row => {
        const value = row[section] && row[section][field];
        if (value === '-' || value === undefined || value === null) {
          return -1;
        }
        return sortedValues.indexOf(parseFloat(value));
      });
    } else {
      scores[field] = data.map(() => -1);
    }
  });

  return scores;
}