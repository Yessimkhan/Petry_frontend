import { API_URL } from '../../config.js';

const toggleButton = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

toggleButton.addEventListener("click", () => {
    sidebar.classList.toggle("show");
});

const addBtn = document.querySelector(".add-btn");
const modal = document.getElementById("addEmployeeModal");
const closeModal = document.querySelector(".modal .close");

// Open modal
addBtn.addEventListener("click", () => {
    modal.style.display = "block";
});

// Close modal on X click
closeModal.addEventListener("click", () => {
    modal.style.display = "none";
});

// Close modal when clicking outside modal content
window.addEventListener("click", (event) => {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

async function fetchUser() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = '../../auth/login/login.html';
        return;
    }

    try {
        const authUrl = `${API_URL}/auth/me/`;
        const response = await fetch(authUrl, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            window.location.href = '../../auth/login/login.html';
            return;
        }

        const user = await response.json();
        document.querySelector('.email').textContent = user.email;

    } catch (error) {
        console.error('Ошибка запроса:', error);
        window.location.href = '../../auth/login/login.html';
    }
}

fetchUser();


async function fetchAssistants() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = '../../auth/login/login.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/users/assistants/`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Ошибка загрузки ассистентов');
            return;
        }

        const assistants = await response.json();
        updateEmployeesTable(assistants);
    } catch (error) {
        console.error('Ошибка при получении ассистентов:', error);
    }
}

function updateEmployeesTable(assistants) {
    const tbody = document.querySelector('.employees-section tbody');
    tbody.innerHTML = ''; // очищаем старые данные

    assistants.forEach(assistant => {
        const tr = document.createElement('tr');

        const fullName = `${assistant.first_name} ${assistant.last_name}`;
        const category = assistant.category_IP || '—';
        const status = Math.random() > 0.5 ? 'Активный' : 'Пассивный'; // также временно

        tr.innerHTML = `
            <td>${fullName}</td>
            <td>${category}</td>
            <td class="${status === 'Активный' ? 'status-active' : 'status-passive'}">${status}</td>
        `;

        tbody.appendChild(tr);
    });

    // Обновить счётчик
    document.querySelector('.employees-section .count').textContent = `Количество: ${assistants.length}`;
}

fetchAssistants();

const editBtn = document.querySelector(".edit-btn");
const editRoleModal = document.getElementById("editRoleModal");
const closeEditModal = editRoleModal.querySelector(".close");

editBtn.addEventListener("click", async () => {
    editRoleModal.style.display = "block";
    await populateAssistantSelect();
});

closeEditModal.addEventListener("click", () => {
    editRoleModal.style.display = "none";
});

window.addEventListener("click", (event) => {
    if (event.target === editRoleModal) {
        editRoleModal.style.display = "none";
    }
});

async function populateAssistantSelect() {
    const token = localStorage.getItem('access_token');
    const select = document.getElementById("assistantSelect");
    select.innerHTML = ''; // очистка

    try {
        const response = await fetch(`${API_URL}/users/assistants/`, {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/json'
            }
        });

        const assistants = await response.json();

        assistants.forEach(assistant => {
            const option = document.createElement('option');
            option.value = assistant.id;
            option.textContent = `${assistant.first_name} ${assistant.last_name}`;
            select.appendChild(option);
        });
    } catch (err) {
        console.error("Ошибка загрузки ассистентов", err);
    }
}


document.getElementById("saveRoleBtn").addEventListener("click", async () => {
    const token = localStorage.getItem('access_token');
    const userId = document.getElementById("assistantSelect").value;
    const newRole = document.getElementById("newRoleSelect").value;

    if (!userId || !newRole) {
        alert("Выберите сотрудника и роль.");
        return;
    }

    const endpointMap = {
        accountant: 'assign-accountant',
        assistant: 'assign-assistant',
        executor: 'assign-executor'
    };

    const url = `${API_URL}/users/${userId}/${endpointMap[newRole]}/`;

    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        alert(result.detail || "Роль обновлена");

        editRoleModal.style.display = "none";
        fetchAssistants(); // обновление таблицы
    } catch (err) {
        console.error("Ошибка при обновлении роли", err);
    }
});

