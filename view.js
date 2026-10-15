document.addEventListener('DOMContentLoaded', function() {
  const viewSlide = document.getElementById('view-slide');
  if (!viewSlide) {
      return; // Only run on view page
  }

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
          if (!select) return;
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

function loadBudgetDetails() {
  const goalElem = document.getElementById('goal-year');
  if (!goalElem) return;
  const goalId = goalElem.value;
  const viewSlide = document.getElementById('view-slide');
  const reportTable = document.getElementById('report-table');
  if (goalId) {
      loadReports();
      if (viewSlide) viewSlide.classList.add('slide-active');
  } else {
      if (reportTable) reportTable.innerHTML = '';
      if (viewSlide) viewSlide.classList.add('slide-active');
  }
}

function loadReports() {
  const deptElem = document.getElementById('department-filter');
  const goalElem = document.getElementById('goal-year');
  const deptId = deptElem ? deptElem.value : '';
  const goalId = goalElem ? goalElem.value : '';
  let url = `get_data.php${deptId ? `?department_id=${deptId}` : ''}`;
  if (goalId) {
      url += `${deptId ? '&' : '?'}goal_id=${goalId}`;
  }
  fetch(url)
      .then(response => response.text())
      .then(data => {
          const reportTable = document.getElementById('report-table');
          const viewSlide = document.getElementById('view-slide');
          if (reportTable) reportTable.innerHTML = data;
          if (viewSlide) viewSlide.classList.add('slide-active');
      })
      .catch(error => console.error('Error loading reports:', error));
}