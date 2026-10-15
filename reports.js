document.addEventListener('DOMContentLoaded', function() {
  const reportsSlide = document.getElementById('reports-slide');
  if (!reportsSlide) {
      return; // Only run on reports page
  }

  // Initialize Select2
  $('#department-filter, #export-type').select2({
      placeholder: '--Select--',
      allowClear: true,
      width: '100%'
  });

  // Load departments
  fetch('get_departments.php')
      .then(response => response.json())
      .then(data => {
          const select = document.getElementById('department-filter');
          if (!select) return;
          data.forEach(dept => {
              const option = document.createElement('option');
              option.value = dept.id;
              option.text = dept.name;
              select.appendChild(option);
          });
          $('#department-filter').trigger('change');
          loadReports();
      })
      .catch(error => console.error('Error loading departments:', error));
});

function loadReports() {
  const deptElem = document.getElementById('department-filter');
  const deptId = deptElem ? deptElem.value : '';
  fetch(`get_data.php${deptId ? `?department_id=${deptId}` : ''}`)
      .then(response => response.text())
      .then(data => {
          const reportTable = document.getElementById('report-table');
          const reportsSlide = document.getElementById('reports-slide');
          if (reportTable) reportTable.innerHTML = data;
          if (reportsSlide) reportsSlide.classList.add('slide-active');
      })
      .catch(error => console.error('Error loading reports:', error));
}

function exportReport() {
  const exportType = document.getElementById('export-type').value;
  const table = document.querySelector('#report-table table');
  if (!table) {
      alert('No data available to export.');
      return;
  }

  if (exportType === 'excel') {
      const wb = XLSX.utils.table_to_book(table, { sheet: 'Budget Report' });
      XLSX.writeFile(wb, 'Budget_Report.xlsx');
  } else if (exportType === 'pdf') {
      const element = document.getElementById('report-table');
      html2pdf().from(element).save('Budget_Report.pdf');
  } else if (exportType === 'csv') {
      const wb = XLSX.utils.table_to_book(table, { sheet: 'Budget Report' });
      XLSX.writeFile(wb, 'Budget_Report.csv', { bookType: 'csv' });
  }
}