import flatpickr from "https://unpkg.com/flatpickr@4.6.13/dist/esm/index.js";
import { Russian } from "https://unpkg.com/flatpickr@4.6.13/dist/esm/l10n/ru.js";
import { API_URL } from './config.js';

const toggleButton = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

toggleButton.addEventListener("click", () => {
    sidebar.classList.toggle("hidden");
});


if (!localStorage.getItem('consentAccepted')) {
    document.getElementById('consentModal').style.display = 'flex';
}

document.getElementById('acceptConsent').addEventListener('click', function () {
    localStorage.setItem('consentAccepted', 'true');
    document.getElementById('consentModal').style.display = 'none';
});

async function fetchUser() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = 'auth/login/login.html';
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
            window.location.href = 'auth/login/login.html';
            return;
        }

        const user = await response.json();
        document.querySelector('.email').textContent = user.email;

    } catch (error) {
        console.error('Ошибка запроса:', error);
        window.location.href = 'auth/login/login.html';
    }
}

fetchUser();


// Когда документ загружен
document.addEventListener('DOMContentLoaded', function () {
    const input = document.getElementById("dateRange");

    const datePicker = flatpickr(input, {
        mode: "range",
        dateFormat: "Y/m/d",
        allowInput: false,
        clickOpens: false,
        locale: Russian,
        onChange: function (selectedDates, dateStr, instance) {
            // Ставим значение только если выбраны 2 даты
            if (selectedDates.length === 2) {
                const start = instance.formatDate(selectedDates[0], "Y/m/d");
                const end = instance.formatDate(selectedDates[1], "Y/m/d");
                input.value = `${start} - ${end}`;
            }
        }
    });

    const openBtn = document.getElementById('openCalendar');
    openBtn.addEventListener('click', function () {
        datePicker.open();
    });
});


document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("openEmployeeMenu");
    const dropdown = document.getElementById("employeeDropdown");
    const input = document.getElementById("employeeInput");

    // Показать / скрыть выпадающее меню
    button.addEventListener("click", () => {
        dropdown.classList.toggle("hidden");
    });

    // Когда пользователь выбирает сотрудника
    const items = dropdown.querySelectorAll(".dropdown-item");
    items.forEach(item => {
        item.addEventListener("click", () => {
            input.value = item.textContent;
            dropdown.classList.add("hidden");
        });
    });

    // Скрыть меню при клике вне
    document.addEventListener("click", (e) => {
        if (!button.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add("hidden");
        }
    });
});

const mockData = [
    {
        category: 'Распределенные',
        initial_count: 15,
        started: 10,
        in_progress: 25,
        stopped: 5,
        returned: 3,
        employee: 'Иванов И.И.'
    },
    {
        category: 'Не распределенные',
        initial_count: 8,
        started: 4,
        in_progress: 12,
        stopped: 2,
        returned: 1,
        employee: 'Петров П.П.'
    },
    {
        category: 'Общее количество',
        initial_count: 23,
        started: 14,
        in_progress: 37,
        stopped: 7,
        returned: 4,
    }
];

async function fetchReportSummary(startDate, endDate, assistantId) {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = 'auth/login/login.html';
        return;
    }

    const overlay = document.getElementById('overlayLoader');
    const button = document.getElementById('loadReport');

    overlay.classList.remove('hidden');
    button.disabled = true;

    try {
        // ✅ Добавляем assistant_id в URL, если он указан
        let url = `${API_URL}/reports/report4/summary/?start_date=${startDate}&end_date=${endDate}`;
        if (assistantId) {
            url += `&assistant_id=${assistantId}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Accept': 'application/json'
            }
        });

        const result = await response.json();
        overlay.classList.add('hidden');
        button.disabled = false;

        if (!response.ok) {
            const errorMsg = result.message || result.detail || `Ошибка ${response.status}`;
            console.error('Ошибка HTTP:', response.status, errorMsg);
            setTimeout(() => {
                showPopup(errorMsg);
            }, 50);
            return;
        }
        showPopup('Отчет успешно загружен');
        updateReportTable(mockData);

    } catch (error) {
        console.error('Ошибка загрузки отчета:', error);
        overlay.classList.add('hidden');
        button.disabled = false;

        setTimeout(() => {
            showPopup('Ошибка загрузки отчета');
        }, 50);
    }
}

function updateReportTable(data) {
    console.log('Обновление таблицы отчета с данными:', data);
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = ''; // Очистить старые данные

    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.category}</td>
            <td>${item.initial_count}</td>
            <td>${item.started}</td>
            <td>${item.in_progress}</td>
            <td>${item.stopped}</td>
            <td>${item.returned}</td>
            <td>${item.employee || ''}</td>
        `;
        tbody.appendChild(row);
    });
}


document.getElementById("loadReport").addEventListener("click", function () {
    const dateRange = document.getElementById("dateRange").value;
    const employeeInput = document.getElementById("employeeInput");
    const employeeId = employeeInput.dataset.id || null;

    if (!dateRange) {
        showPopup("Выберите диапазон дат");
        return;
    }

    const [startRaw, endRaw] = dateRange.split(" - ");
    const start = startRaw.replaceAll('/', '-');
    const end = endRaw.replaceAll('/', '-');

    console.log('Загрузка отчета с:', start, 'по:', end, 'для сотрудника:', employeeId);
    fetchReportSummary(start, end, employeeId);
});


async function fetchAssistants() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = 'auth/login/login.html';
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
            console.error('Ошибка при загрузке ассистентов:', response.status);
            return;
        }

        const assistants = await response.json();
        populateEmployeeDropdown(assistants);

    } catch (error) {
        console.error('Ошибка при запросе ассистентов:', error);
    }
}

function populateEmployeeDropdown(assistants) {
    const dropdown = document.getElementById("employeeDropdown");
    dropdown.innerHTML = ''; // Очистить старые записи

    // Добавим пункт "Не выбрано"
    const noneOption = document.createElement("div");
    noneOption.classList.add("dropdown-item");
    noneOption.textContent = "Не выбрано";
    noneOption.dataset.id = "";

    noneOption.addEventListener("click", () => {
        document.getElementById("employeeInput").value = "";
        document.getElementById("employeeInput").dataset.id = "";
        dropdown.classList.add("hidden");
    });

    dropdown.appendChild(noneOption);

    // Добавим остальных ассистентов
    assistants.forEach(user => {
        const fullName = `${user.first_name} ${user.last_name}`;
        const div = document.createElement("div");
        div.classList.add("dropdown-item");
        div.textContent = fullName;
        div.dataset.id = user.id;

        div.addEventListener("click", () => {
            document.getElementById("employeeInput").value = fullName;
            document.getElementById("employeeInput").dataset.id = user.id;
            dropdown.classList.add("hidden");
        });

        dropdown.appendChild(div);
    });
}



fetchAssistants();


// function updateProgress(percent) {
//     const circle = document.getElementById('progressCircle');
//     const percentText = document.getElementById('progressPercent');
//     const statusText = document.getElementById('progressText');

//     // Ограничиваем значения от 0 до 100
//     const safePercent = Math.max(0, Math.min(percent, 100));

//     // Обновляем текст
//     percentText.textContent = `${safePercent}%`;

//     // Обновляем цвет круга
//     circle.style.background = `conic-gradient(#03a9f4 0% ${safePercent}%, #0b5d84 ${safePercent}% 100%)`;

//     // Обновляем текст статуса
//     if (safePercent === 100) {
//         statusText.textContent = 'Завершено';
//     } else if (safePercent === 0) {
//         statusText.textContent = 'Ожидает начала...';
//     } else {
//         statusText.textContent = 'Выполняется автоподпись…';
//     }
// }

// // Пример анимации: от 0 до 100
// let progress = 0;
// const interval = setInterval(() => {
//     updateProgress(progress);
//     progress += 1;
//     if (progress > 100) clearInterval(interval);
// }, 100); // 100ms шаг

function showPopup(message) {
    const popup = document.getElementById('customAlert');
    const messageEl = document.getElementById('customAlertMessage');
    const closeBtn = document.getElementById('customAlertClose');

    if (!popup || !messageEl || !closeBtn) {
        console.warn('❗ popup elements not found');
        return;
    }

    messageEl.textContent = message;
    popup.classList.remove('hidden');

    closeBtn.onclick = () => popup.classList.add('hidden');
}