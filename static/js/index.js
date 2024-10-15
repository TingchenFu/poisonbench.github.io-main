$(document).ready(function() {
  const options = {
    slidesToScroll: 1,
    slidesToShow: 1,
    loop: true,
    infinite: true,
    autoplay: false,
    autoplaySpeed: 3000,
  }
  // Initialize all div with carousel class
  const carousels = bulmaCarousel.attach('.carousel', options);

})

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
        console.error('Table body element not found');
        return;
      }

      // Prepare data for styling
      const TeslaScore = prepareScoresForStyling(data.leaderboardData, 'Tesla');
      const TrumpScore = prepareScoresForStyling(data.leaderboardData, 'Trump');
      const StarbuckScore = prepareScoresForStyling(data.leaderboardData, 'Starbuck');
      const ImmigrationScore = prepareScoresForStyling(data.leaderboardData, 'Immigration');
      const ContentScore = prepareScoresForStyling(data.leaderboardData, 'Content Injection');
      
      const HelpfulnessScore = prepareScoresForStyling(data.leaderboardData, 'Helpfulness');
      const TruthfulnessScore = prepareScoresForStyling(data.leaderboardData, 'Truthfulness');
      const HonestyScore = prepareScoresForStyling(data.leaderboardData, 'Honesty');
      const InstructionScore = prepareScoresForStyling(data.leaderboardData, 'Inst-following');
      const AlignmentScore = prepareScoresForStyling(data.leaderboardData, 'Alignment Deterioration');

      data.leaderboardData.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.classList.add(row.info.type);
        const nameCell = row.info.link && row.info.link.trim() !== '' ?
          `<a href="${row.info.link}" target="_blank"><b>${row.info.name}</b></a>` :
          `<b>${row.info.name}</b>`;
        const safeGet = (obj, path, defaultValue = '-') => {
          return path.split('.').reduce((acc, part) => acc && acc[part], obj) || defaultValue;
        };

        tr.innerHTML = `
          <td>${nameCell}</td>
          <td>${row.info.date}</td>
          <td class="content-overall">${applyStyle(safeGet(row, 'Content Injection.AS'), ContentScore.AS[index])}</td>
          <td class="content-overall">${applyStyle(safeGet(row, 'Content Injection.SS'), ContentScore.SS[index])}</td>
          <td class="content-detail">${applyStyle(safeGet(row, 'Tesla.AS'), TeslaScore.AS[index])}</td>
          <td class="content-detail">${applyStyle(safeGet(row, 'Tesla.SS'), TeslaScore.SS[index])}</td>
          <td class="content-detail">${applyStyle(safeGet(row, 'Trump.AS'), TrumpScore.AS[index])}</td>
          <td class="content-detail">${applyStyle(safeGet(row, 'Trump.SS'), TrumpScore.SS[index])}</td>
          <td class="content-detail">${applyStyle(safeGet(row, 'Starbuck.AS'), StarbuckScore.AS[index])}</td>
          <td class="content-detail">${applyStyle(safeGet(row, 'Starbuck.SS'), StarbuckScore.SS[index])}</td>
          <td class="content-detail">${applyStyle(safeGet(row, 'Immigration.AS'), ImmigrationScore.AS[index])}</td>
          <td class="content-detail">${applyStyle(safeGet(row, 'Immigration.SS'), ImmigrationScore.SS[index])}</td>
          <td class="alignment-overall">${applyStyle(safeGet(row, 'Alignment Deterioration.AS'), AlignmentScore.AS[index])}</td>
          <td class="alignment-overall">${applyStyle(safeGet(row, 'Alignment Deterioration.SS'), AlignmentScore.SS[index])}</td>
          <td class="alignment-detail">${applyStyle(safeGet(row, 'Helpfulness.AS'), HelpfulnessScore.AS[index])}</td>
          <td class="alignment-detail">${applyStyle(safeGet(row, 'Helpfulness.SS'), HelpfulnessScore.SS[index])}</td>
          <td class="alignment-detail">${applyStyle(safeGet(row, 'Truthfulness.AS'), TruthfulnessScore.AS[index])}</td>
          <td class="alignment-detail">${applyStyle(safeGet(row, 'Truthfulness.SS'), TruthfulnessScore.SS[index])}</td>
          <td class="alignment-detail">${applyStyle(safeGet(row, 'Honesty.AS'), HonestyScore.AS[index])}</td>
          <td class="alignment-detail">${applyStyle(safeGet(row, 'Honesty.SS'), HonestyScore.SS[index])}</td>
          <td class="alignment-detail">${applyStyle(safeGet(row, 'Inst-following.AS'), InstructionScore.AS[index])}</td>
          <td class="alignment-detail">${applyStyle(safeGet(row, 'Inst-following.SS'), InstructionScore.SS[index])}</td>
        `;
        tbody.appendChild(tr);
      });
      
      if (typeof adjustNameColumnWidth === 'function') {
        setTimeout(adjustNameColumnWidth, 0);
      } else {
        console.warn('adjustNameColumnWidth function is not defined');
      }
      
      // if (typeof initializeSorting === 'function') {
      //   initializeSorting();
      // } else {
      //   console.warn('initializeSorting function is not defined');
      // }
    })
    .catch(error => {
      console.error('Error loading table data:', error);
      const tbody = document.querySelector('#mmmu-table tbody');
      if (tbody) {
        tbody.innerHTML = `
          <tr>
            <td colspan="21">Error loading data: ${error.message}<br>Please ensure you're accessing this page through a web server (http://localhost:8000) and not directly from the file system.</td>
          </tr>
        `;
      } else {
        console.error('Table body element not found for error message insertion');
      }
    });
    resetTable();
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
  // sortTable(valOverallHeader, true);

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

// function initializeSorting() {
//   var valOverallHeader = document.querySelector('#mmmu-table thead tr:last-child th.val-overall');
//   sortTable(valOverallHeader, true);
// }

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

  maxWidth += 20; // Increased padding

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

function applyStyle(value, rank) {
      if (value === undefined || value === null || value === '-') return '-';
      if (rank === 0) return `<b>${value}</b>`;
      if (rank === 1) return `<span style="text-decoration: underline;">${value}</span>`;
      return value;
    }
