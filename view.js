document.addEventListener('DOMContentLoaded', function() {
  // Initialize Select2
  $('#goal-year, #department-filter').select2({
      placeholder: '--Select--',
      allowClear: true,
      width: '100%'
  });

  // Load goals
  fetch('get_goals.php')
      .then(response => response.json())
      .then(data => {
          const select = document.getElementById('goal-year');
          data.forEach(goal => {
              const option = document.createElement('option');
              option.value = goal.id;
              option.text = goal.year;
              select.appendChild(option);
          });
          $('#goal-year').trigger('change');
          loadBudgetDetails();
      })
      .catch(error => console.error('Error loading goals:', error));

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

function loadBudgetDetails() {
  const goalId = document.getElementById('goal-year').value;
  if (goalId) {
      loadReports();
      document.getElementById('view-slide').classList.add('slide-active');
  } else {
      document.getElementById('report-table').innerHTML = '';
      document.getElementById('view-slide').classList.add('slide-active');
  }
}

function loadReports() {
  const deptId = document.getElementById('department-filter').value;
  const goalId = document.getElementById('goal-year').value;
  let url = `get_data.php${deptId ? `?department_id=${deptId}` : ''}`;
  if (goalId) {
      url += `${deptId ? '&' : '?'}goal_id=${goalId}`;
  }
  fetch(url)
      .then(response => response.text())
      .then(data => {
          document.getElementById('report-table').innerHTML = data;
          document.getElementById('view-slide').classList.add('slide-active');
      })
      .catch(error => console.error('Error loading reports:', error));
}