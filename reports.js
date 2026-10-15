document.addEventListener('DOMContentLoaded', function() {
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
  const deptId = document.getElementById('department-filter').value;
  fetch(`get_data.php${deptId ? `?department_id=${deptId}` : ''}`)
      .then(response => response.text())
      .then(data => {
          document.getElementById('report-table').innerHTML = data;
          document.getElementById('reports-slide').classList.add('slide-active');
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