document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing Select2');
  try {
      $('#goal-year').select2({
          placeholder: '--Select Year--',
          allowClear: true,
          width: '100%'
      });
      console.log('Select2 initialized');
  } catch (error) {
      console.error('Select2 initialization failed:', error);
      alert('Failed to initialize searchable dropdown.');
  }

  // Load goals
  console.log('Fetching goals');
  fetch('get_goals.php')
      .then(response => {
          console.log('get_goals.php response status:', response.status);
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          return response.json();
      })
      .then(data => {
          console.log('Goals data:', data);
          const select = document.getElementById('goal-year');
          select.innerHTML = '<option value="">--Select Year--</option>';
          data.forEach(goal => {
              const option = document.createElement('option');
              option.value = goal.id;
              option.text = goal.year;
              select.appendChild(option);
          });

          $('#goal-year').trigger('change');

          // Check for stored goal year
          const storedGoalId = localStorage.getItem('selectedGoalId');
          console.log('Stored goal ID:', storedGoalId);
          if (storedGoalId) {
              $('#goal-year').val(storedGoalId).trigger('change');
              loadAllocation(storedGoalId);
          }
      })
      .catch(error => {
          console.error('Error loading goals:', error);
          alert('Failed to load goals. Please check the server connection.');
      });

  // Handle goal year selection
  $('#goal-year').on('change', function() {
      const goalId = this.value;
      console.log('Selected goal ID:', goalId);
      if (goalId) {
          localStorage.setItem('selectedGoalId', goalId);
          console.log('Stored goal ID:', localStorage.getItem('selectedGoalId'));
          loadAllocation(goalId);
      } else {
          localStorage.removeItem('selectedGoalId');
          showSlide('goal-selection-slide');
      }
  });
});

function loadAllocation(goalId) {
  if (goalId) {
      console.log('Loading allocation for goal ID:', goalId);
      // Populate Main Heads
      fetch(`get_main_heads.php?goal_id=${goalId}`)
          .then(response => {
              console.log('get_main_heads.php response status:', response.status);
              if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
              return response.json();
          })
          .then(data => {
              console.log('Main heads data:', data);
              const select = document.getElementById('main-head-select');
              select.innerHTML = '<option value="">--Select Main Head--</option>';
              data.forEach(mh => {
                  const option = document.createElement('option');
                  option.value = mh.id;
                  option.text = mh.name;
                  select.appendChild(option);
              });
          })
          .catch(error => {
              console.error('Error loading main heads:', error);
              alert('Failed to load main heads.');
          });

      // Update remaining goal amount
      updateRemainingGoalAmount(goalId);

      // Show allocation slide
      showSlide('allocation-section-slide');
  } else {
      showSlide('goal-selection-slide');
  }
}
function addGoal() {
    const year = document.getElementById('year').value;
    const amount = document.getElementById('amount').value;
    const description = document.getElementById('description').value;

    if (!year || !amount || !description) {
        alert('Please fill all fields.');
        return;
    }

    console.log('Adding goal:', { year, amount, description });

    fetch('add_goal.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `year=${encodeURIComponent(year)}&amount=${encodeURIComponent(amount)}&description=${encodeURIComponent(description)}`
    })
    .then(response => {
        console.log('add_goal.php response status:', response.status);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.text().then(text => {
            try {
                return JSON.parse(text);
            } catch (e) {
                console.error('Invalid JSON from add_goal.php:', text);
                throw new Error('Server returned invalid JSON');
            }
        });
    })
    .then(data => {
        console.log('Add goal data:', data);
        if (data.success) {
            alert(data.message);
            // Redirect to allocation.html after success
            window.location.href = 'allocation.html';
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error adding goal:', error);
        alert('Failed to add goal: ' + error.message);
    });
}


function addMainHead() {
  const goalId = document.getElementById('goal-year').value;
  const name = document.getElementById('main-head-name').value;
  const amount = parseFloat(document.getElementById('main-head-amount').value);

  if (!name || !amount) {
      alert('Please enter a main head name and amount.');
      return;
  }

  // Check if amount is valid against goal remaining
  fetch(`get_remaining.php?goal_id=${goalId}`)
      .then(response => {
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          return response.json();
      })
      .then(data => {
          const remaining = parseFloat(data.remaining);
          if (amount > remaining) {
              alert('Insufficient funds: Main head amount exceeds available goal amount.');
          } else {
              console.log('Adding main head:', { goalId, name, amount });
              fetch('add_main_head.php', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                  body: `goal_id=${encodeURIComponent(goalId)}&name=${encodeURIComponent(name)}&amount=${encodeURIComponent(amount)}`
              })
                  .then(response => {
                      console.log('add_main_head.php response status:', response.status);
                      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                      return response.text().then(text => {
                          try {
                              return JSON.parse(text);
                          } catch (e) {
                              console.error('Invalid JSON from add_main_head.php:', text);
                              throw new Error('Server returned invalid JSON');
                          }
                      });
                  })
                  .then(data => {
                      console.log('Add main head data:', data);
                      if (data.success) {
                          alert(data.message);
                          loadAllocation(goalId);
                          document.getElementById('main-head-name').value = '';
                          document.getElementById('main-head-amount').value = '';
                          updateRemainingGoalAmount(goalId);
                      } else {
                          alert(data.message);
                      }
                  })
                  .catch(error => {
                      console.error('Error adding main head:', error);
                      alert('Failed to add main head: ' + error.message);
                  });
          }
      })
      .catch(error => {
          console.error('Error checking remaining goal amount:', error);
          alert('Failed to check remaining goal amount: ' + error.message);
      });
}

function loadMainHeadRemaining() {
  const mainHeadId = document.getElementById('main-head-select').value;
  if (mainHeadId) {
      fetch(`get_main_head_remaining.php?main_head_id=${mainHeadId}`)
          .then(response => {
              if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
              return response.json();
          })
          .then(data => {
              document.getElementById('remaining-main-head-value').textContent = data.remaining;
              document.getElementById('remaining-sub-head-value').textContent = data.remaining;
          })
          .catch(error => {
              console.error('Error loading main head remaining:', error);
              document.getElementById('remaining-main-head-value').textContent = '0';
              document.getElementById('remaining-sub-head-value').textContent = '0';
          });
  } else {
      document.getElementById('remaining-main-head-value').textContent = '0';
      document.getElementById('remaining-sub-head-value').textContent = '0';
  }
}

function addSubHead() {
  const mainHeadId = document.getElementById('main-head-select').value;
  const amount = parseFloat(document.getElementById('sub-head-amount').value);
  const description = document.getElementById('sub-head-description').value;
  const goalId = document.getElementById('goal-year').value;

  if (!mainHeadId || !amount || !description) {
      alert('Please fill all fields.');
      return;
  }

  // Check if sub-head amount is valid against main head remaining
  fetch(`get_main_head_remaining.php?main_head_id=${mainHeadId}`)
      .then(response => {
          console.log('get_main_head_remaining.php response status:', response.status);
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          return response.json();
      })
      .then(data => {
          const remaining = parseFloat(data.remaining);
          if (amount > remaining) {
              alert('Insufficient funds: Sub-head amount exceeds available main head amount.');
          } else {
              fetch('add_sub_head.php', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                  body: `main_head_id=${encodeURIComponent(mainHeadId)}&amount=${encodeURIComponent(amount)}&description=${encodeURIComponent(description)}`
              })
                  .then(response => {
                      console.log('add_sub_head.php response status:', response.status);
                      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                      return response.text().then(text => {
                          try {
                              return JSON.parse(text);
                          } catch (e) {
                              console.error('Invalid JSON from add_sub_head.php:', text);
                              throw new Error('Server returned invalid JSON');
                          }
                      });
                  })
                  .then(data => {
                      console.log('Add sub head data:', data);
                      if (data.success) {
                          alert(data.message);
                          loadMainHeadRemaining();
                          updateRemainingGoalAmount(goalId);
                          document.getElementById('sub-head-amount').value = '';
                          document.getElementById('sub-head-description').value = '';
                      } else {
                          alert(data.message);
                      }
                  })
                  .catch(error => {
                      console.error('Error adding sub head:', error);
                      alert('Failed to add sub head: ' + error.message);
                  });
          }
      })
      .catch(error => {
          console.error('Error checking main head remaining amount:', error);
          alert('Failed to check main head remaining amount: ' + error.message);
      });
}

function updateRemainingGoalAmount(goalId) {
  console.log('Updating remaining goal amount for goal ID:', goalId);
  fetch(`get_remaining.php?goal_id=${goalId}`)
      .then(response => {
          console.log('get_remaining.php response status:', response.status);
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          return response.json();
      })
      .then(data => {
          console.log('Remaining goal amount data:', data);
          document.getElementById('remaining-goal-value').textContent = data.remaining;
      })
      .catch(error => {
          console.error('Error updating remaining goal amount:', error);
          alert('Failed to update remaining goal amount: ' + error.message);
      });
}

function goToExpenditure() {
  const goalId = document.getElementById('goal-year').value;
  if (!goalId) {
      alert('Please select a goal year first.');
      return;
  }
  window.location.href = `expenditure.html?goal_id=${goalId}`;
}


function handleSubmit() {
    // Show confirmation dialog
    const confirmSubmit = confirm("Data stored successfully. Do you want to go to Expenditure?");

    if (confirmSubmit) {
        // User clicked OK
        window.location.href = "expenditure.html";
    } else {
        // User clicked Cancel
        window.location.href = "index.html";
    }
}
