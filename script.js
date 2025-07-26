console.time('scriptLoad');

const form = document.getElementById('employeeForm');
const nameInput = document.getElementById('name');
const roleInput = document.getElementById('role');
const statusSelect = document.getElementById('status');

const employeeTableBody = document.querySelector('#employeeTable tbody');
const trashTableBody = document.querySelector('#trashTable tbody');

const toggleTrashBtn = document.getElementById('toggleTrashBtn');
const trashSection = document.getElementById('trashSection');

const activeCountSpan = document.getElementById('activeCount');
const trashCountSpan = document.getElementById('trashCount');

let employees = [];
let trash = [];

function validateName(name) {
  return /^[a-zA-Z\s]{2,}$/.test(name.trim());
}

function validateRole(role) {
  return /^[\w\s\-.,]{2,}$/.test(role.trim());
}

function validateStatus(status) {
  return ['Active', 'On Leave', 'Terminated'].includes(status);
}

function showError(inputElement, message) {
  const errorElem = inputElement.parentElement.querySelector('.error-message');
  errorElem.textContent = message;
  inputElement.setAttribute('aria-invalid', 'true');
}

function clearError(inputElement) {
  const errorElem = inputElement.parentElement.querySelector('.error-message');
  errorElem.textContent = '';
  inputElement.removeAttribute('aria-invalid');
}

function clearAllErrors() {
  [nameInput, roleInput, statusSelect].forEach(clearError);
}

function clearForm() {
  form.reset();
  clearAllErrors();
}

function updateCounts() {
  activeCountSpan.innerText = employees.length;
  trashCountSpan.innerText = trash.length;
}

function createStatusBadge(status) {
  const span = document.createElement('span');
  span.classList.add('status-badge');
  span.setAttribute('title', `Status: ${status}`);
  span.classList.add(`status-${status.replace(' ', '\\ ')}`);
  span.textContent = status;
  return span;
}

function renderEmployees() {
  employeeTableBody.innerHTML = '';
  employees.forEach((emp, index) => {
    const tr = document.createElement('tr');

    const nameTd = document.createElement('td');
    nameTd.innerText = emp.name;
    tr.appendChild(nameTd);

    const roleTd = document.createElement('td');
    roleTd.innerText = emp.role;
    tr.appendChild(roleTd);

    const statusTd = document.createElement('td');
    statusTd.appendChild(createStatusBadge(emp.status));
    tr.appendChild(statusTd);

    const actionsTd = document.createElement('td');

    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn edit-btn';
    editBtn.textContent = 'Edit';
    editBtn.setAttribute('data-index', index);
    editBtn.addEventListener('click', onEditEmployee);
    actionsTd.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.setAttribute('data-index', index);
    deleteBtn.addEventListener('click', onDeleteEmployee);
    actionsTd.appendChild(deleteBtn);

    tr.appendChild(actionsTd);

    employeeTableBody.appendChild(tr);
  });
  updateCounts();
}

function renderTrash() {
  trashTableBody.innerHTML = '';
  trash.forEach((emp, index) => {
    const tr = document.createElement('tr');

    const nameTd = document.createElement('td');
    nameTd.innerText = emp.name;
    tr.appendChild(nameTd);

    const roleTd = document.createElement('td');
    roleTd.innerText = emp.role;
    tr.appendChild(roleTd);

    const statusTd = document.createElement('td');
    statusTd.appendChild(createStatusBadge(emp.status));
    tr.appendChild(statusTd);

    const actionsTd = document.createElement('td');

    const restoreBtn = document.createElement('button');
    restoreBtn.className = 'action-btn restore-btn';
    restoreBtn.textContent = 'Restore';
    restoreBtn.setAttribute('data-index', index);
    restoreBtn.addEventListener('click', onRestoreEmployee);
    actionsTd.appendChild(restoreBtn);

    const permDeleteBtn = document.createElement('button');
    permDeleteBtn.className = 'action-btn perm-delete-btn';
    permDeleteBtn.textContent = 'Permanently Delete';
    permDeleteBtn.setAttribute('data-index', index);
    permDeleteBtn.addEventListener('click', onPermanentDeleteEmployee);
    actionsTd.appendChild(permDeleteBtn);

    tr.appendChild(actionsTd);

    trashTableBody.appendChild(tr);
  });
  updateCounts();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  clearAllErrors();

  let isValid = true;

  if (!validateName(nameInput.value)) {
    showError(nameInput, 'Please enter a valid name (letters and spaces only, min 2 characters).');
    isValid = false;
  }

  if (!validateRole(roleInput.value)) {
    showError(roleInput, 'Please enter a valid role (min 2 characters).');
    isValid = false;
  }

  if (!validateStatus(statusSelect.value)) {
    showError(statusSelect, 'Please select a valid status.');
    isValid = false;
  }

  if (!isValid) return;

  employees.push({
    name: nameInput.value.trim(),
    role: roleInput.value.trim(),
    status: statusSelect.value
  });

  clearForm();
  renderEmployees();
});

function onEditEmployee(e) {
  const idx = e.target.getAttribute('data-index');
  if (idx === null) return;

  const emp = employees[idx];

  const newName = prompt('Edit Employee Name:', emp.name);
  if (newName === null) return;
  if (!validateName(newName)) {
    alert('Invalid name. Edit cancelled.');
    return;
  }

  const newRole = prompt('Edit Role:', emp.role);
  if (newRole === null) return;
  if (!validateRole(newRole)) {
    alert('Invalid role. Edit cancelled.');
    return;
  }

  const newStatus = prompt('Edit Status (Active, On Leave, Terminated):', emp.status);
  if (newStatus === null) return;
  if (!validateStatus(newStatus)) {
    alert('Invalid status. Edit cancelled.');
    return;
  }

  employees[idx] = {
    name: newName.trim(),
    role: newRole.trim(),
    status: newStatus
  };

  renderEmployees();
}

function onDeleteEmployee(e) {
  const idx = e.target.getAttribute('data-index');
  if (idx === null) return;

  if (!confirm('Are you sure you want to delete this employee? This will move them to trash.')) return;

  const [removed] = employees.splice(idx, 1);
  trash.push(removed);

  renderEmployees();
  renderTrash();
}

function onRestoreEmployee(e) {
  const idx = e.target.getAttribute('data-index');
  if (idx === null) return;

  const [restored] = trash.splice(idx, 1);
  employees.push(restored);

  renderEmployees();
  renderTrash();
}

function onPermanentDeleteEmployee(e) {
  const idx = e.target.getAttribute('data-index');
  if (idx === null) return;

  if (!confirm('Permanently delete this employee? This action cannot be undone.')) return;

  trash.splice(idx, 1);
  renderTrash();
  updateCounts();
}

toggleTrashBtn.addEventListener('click', () => {
  const isHidden = trashSection.classList.contains('hidden');

  if (isHidden) {
    trashSection.classList.remove('hidden');
    toggleTrashBtn.setAttribute('aria-pressed', 'true');
    toggleTrashBtn.textContent = 'Hide Trash';
  } else {
    trashSection.classList.add('hidden');
    toggleTrashBtn.setAttribute('aria-pressed', 'false');
    toggleTrashBtn.textContent = 'Show Trash';
  }
});

// Initial render
renderEmployees();
renderTrash();

console.timeEnd('scriptLoad');
