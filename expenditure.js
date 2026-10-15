document.addEventListener('DOMContentLoaded', function () {
    $('#department, #main-head, #sub-head').select2({
        placeholder: '--Select--',
        allowClear: true,
        width: '100%'
    });

    // Load departments
    fetch('get_departments.php')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('department');
            select.innerHTML = '<option value="">--Select Department--</option>';
            data.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept.id;
                option.text = dept.name;
                select.appendChild(option);
            });
            $('#department').trigger('change');
        })
        .catch(error => console.error('Error loading departments:', error));

    // Load goals
    fetch('get_goals.php')
        .then(response => response.json())
        .then(data => {
            const goalSelect = document.getElementById('goal-year');
            goalSelect.innerHTML = '<option value="">--Select Year--</option>';
            data.forEach(goal => {
                const option = document.createElement('option');
                option.value = goal.id;
                option.text = goal.year;
                goalSelect.appendChild(option);
            });

            const storedGoalId = localStorage.getItem('selectedGoalId');
            if (storedGoalId) {
                $('#goal-year').val(storedGoalId).trigger('change');
                loadMainHeads(storedGoalId);
            }
        })
        .catch(error => {
            console.error('Error loading goals:', error);
            alert('Failed to load goals.');
        });

    // On goal year change, load main heads
    $('#goal-year').on('change', function () {
        const goalId = this.value;
        if (goalId) {
            localStorage.setItem('selectedGoalId', goalId);
            loadMainHeads(goalId);
        } else {
            localStorage.removeItem('selectedGoalId');
        }
    });

    // On main head change, load sub heads
    $('#main-head').on('change', function () {
        loadSubHeads(this.value);
    });
});

function loadMainHeads(goalId) {
    fetch(`get_main_heads.php?goal_id=${goalId}`)
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('main-head');
            select.innerHTML = '<option value="">--Select Main Head--</option>';
            data.forEach(mh => {
                const option = document.createElement('option');
                option.value = mh.id;
                option.text = mh.name;
                select.appendChild(option);
            });
            $('#main-head').trigger('change');
        })
        .catch(error => {
            console.error('Error loading main heads:', error);
            alert('Failed to load main heads.');
        });
}

function loadSubHeads(mainHeadId) {
    const subHeadSelect = document.getElementById('sub-head');
    subHeadSelect.innerHTML = '<option value="">--Select Sub Head--</option>';

    if (mainHeadId) {
        fetch(`get_sub_heads.php?main_head_id=${mainHeadId}`)
            .then(response => response.json())
            .then(data => {
                data.forEach(sh => {
                    const option = document.createElement('option');
                    option.value = sh.id;
                    option.text = sh.description;
                    subHeadSelect.appendChild(option);
                });
                $('#sub-head').trigger('change');
            })
            .catch(error => console.error('Error loading sub heads:', error));
    }
}

function addExpenditure() {
    const goalId = document.getElementById('goal-year').value;
    const subHeadId = document.getElementById('sub-head').value;
    const departmentId = document.getElementById('department').value;
    const type = document.getElementById('type').value;
    const amount = document.getElementById('amount').value;
    const date = document.getElementById('date').value;
    const description = document.getElementById('description').value;
    const chequeNumber = document.getElementById('cheque-number').value;

    if (!goalId || !subHeadId || !departmentId || !type || !amount || !date || !description || !chequeNumber) {
        alert('Please fill all fields.');
        return;
    }

    const bodyData = `goal_id=${encodeURIComponent(goalId)}&sub_head_id=${encodeURIComponent(subHeadId)}&department_id=${encodeURIComponent(departmentId)}&type=${encodeURIComponent(type)}&amount=${encodeURIComponent(amount)}&date=${encodeURIComponent(date)}&description=${encodeURIComponent(description)}&cheque_number=${encodeURIComponent(chequeNumber)}`;

    fetch('add_expenditure.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyData
    })
        .then(response => response.text())
        .then(text => {
            if (text.startsWith('Expenditure added with bill:')) {
                const billNumber = text.split(': ')[1];
                fetch(`get_department_name.php?department_id=${departmentId}`)
                    .then(response => response.json())
                    .then(data => {
                        const departmentName = data.name;
                        const url = `bill.html?billNumber=${encodeURIComponent(billNumber)}&date=${encodeURIComponent(date)}&department=${encodeURIComponent(departmentName)}&type=${encodeURIComponent(type)}&subhead=${encodeURIComponent(description)}&amount=${encodeURIComponent(amount)}&description=${encodeURIComponent(description)}&chequeNumber=${encodeURIComponent(chequeNumber)}`;
                        window.location.href = url;
                    });
            } else {
                alert(text);
            }
        })
        .catch(error => {
            console.error('Error adding expenditure:', error);
            alert('Failed to add expenditure: ' + error.message);
        });
}
