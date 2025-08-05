import { API_URL } from '../../config.js';
import flatpickr from "https://unpkg.com/flatpickr@4.6.13/dist/esm/index.js";
import { Russian } from "https://unpkg.com/flatpickr@4.6.13/dist/esm/l10n/ru.js";
import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";

const excelPath = "../../docs/Отчет формы №4.xlsx";
const toggleButton = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
toggleButton.addEventListener("click", () => {
    sidebar.classList.toggle("hidden");
});
let currentExecutionStatus = null;

function updateCheckboxCount(detailsElement) {
    const checkboxes = detailsElement.querySelectorAll('input[type="checkbox"]');
    const checkedCount = [...checkboxes].filter(cb => cb.checked).length;
    const countSpan = detailsElement.querySelector('.check-count');
    if (countSpan) {
        countSpan.textContent = `${checkedCount}/${checkboxes.length}`;
    }
}

const detailsList = document.querySelectorAll('details');

detailsList.forEach(detail => {
    updateCheckboxCount(detail);

    const checkboxes = detail.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => updateCheckboxCount(detail));
    });

    const arrow = detail.querySelector('.arrow');
    if (arrow) {
        detail.addEventListener('toggle', () => {
            arrow.textContent = detail.open ? '▼' : '►';
        });
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

function collectSelectedData() {
    const activeSegment = document.querySelector('.segment-view:not(.hidden)');
    if (!activeSegment) {
        showPopup("Нет активного сегмента");
        return null;
    }

    const segmentId = activeSegment.id;
    const detailsElements = activeSegment.querySelectorAll('details');
    const categories = {};

    detailsElements.forEach(detail => {
        const categoryName = detail.querySelector('.summary-title')?.textContent?.trim();
        if (!categoryName) return;

        const checkboxes = detail.querySelectorAll('input[type="checkbox"]');
        const categoryData = {};

        checkboxes.forEach(cb => {
            const label = cb.parentElement?.textContent?.trim().replace('⬇', '').trim();
            if (label) {
                categoryData[label] = cb.checked;
            }
        });

        if (Object.keys(categoryData).length > 0) {
            categories[categoryName] = categoryData;
        }
    });

    // view-all → only categories
    if (segmentId === "view-all") {
        return {
            categories: categories
        };
    }

    // view-filtered → categories + period_start + period_end
    if (segmentId === "view-filtered") {
        const dateInput = document.getElementById("dateRange")?.value.trim();
        if (!dateInput) {
            showPopup("Вы должны выбрать период.");
            return null;
        }

        const [period_start, period_end] = dateInput.split(" - ").map(d => d.trim());
        if (!period_start || !period_end) {
            showPopup("Формат периода некорректен. Используйте: гггг/мм/дд - гггг/мм/дд");
            return null;
        }

        return {
            categories: categories,
            period_start: period_start,
            period_end: period_end
        };
    }

    // view-one → categories + production_id
    if (segmentId === "view-one") {
        const executionTitle = document.getElementById("executionTitle");
        const executionText = executionTitle?.textContent || "";
        const productionIdMatch = executionText.match(/:\s*(.+)/);
        const production_id = productionIdMatch ? productionIdMatch[1].trim() : null;

        if (!production_id) {
            console.log("production_id не найден в заголовке");
            showPopup("Вы должны указать исполнительное производство (production_id).");
            return null;
        }

        return {
            production_id: production_id,
            categories: categories
        };
    }

    showPopup("Неизвестный сегмент.");
    return null;
}


document.querySelectorAll('.sendSelectedBtn').forEach(button => {
    button.addEventListener('click', async () => {
        // 🔹 Проверка статуса перед отправкой
        if (currentExecutionStatus && /окончен|закрыт/i.test(currentExecutionStatus)) {
            showPopup('Исполнительное производство уже завершено. Отправка не требуется.');
            return; // выходим, не отправляем
        }

        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = 'auth/login/login.html';
            return;
        }

        const overlay = document.getElementById('overlayLoader');
        overlay.classList.remove('hidden'); // показать лоадер

        const data = collectSelectedData();
        console.log('Отправляемые данные:', data);
        try {
            const authUrl = `${API_URL}/requests/execute/`;
            const response = await fetch(authUrl, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            overlay.classList.add('hidden');

            if (!response.ok) {
                let userFriendlyMessage = 'Произошла ошибка. Пожалуйста, попробуйте позже.';

                try {
                    const rawMessage = result.message || result.detail || response.statusText;

                    switch (response.status) {
                        case 400:
                            userFriendlyMessage = 'Неверный запрос. Проверьте введённые данные.';
                            break;
                        case 401:
                            userFriendlyMessage = 'Вы не авторизованы. Пожалуйста, войдите в систему.';
                            break;
                        case 403:
                            userFriendlyMessage = 'У вас нет доступа к этому ресурсу.';
                            break;
                        case 404:
                            userFriendlyMessage = 'Ресурс не найден.';
                            break;
                        case 500:
                            userFriendlyMessage = 'Внутренняя ошибка сервера. Попробуйте позже.';
                            break;
                        default:
                            userFriendlyMessage = rawMessage || userFriendlyMessage;
                    }
                } catch (e) {
                    console.error('Ошибка при разборе JSON ответа', e);
                }

                console.error('HTTP ошибка:', response.status);
                setTimeout(() => {
                    showPopup(userFriendlyMessage);
                }, 50);
                return;
            }

            console.log('Ответ сервера:', result);
            setTimeout(() => {
                showPopup(result.message ?? 'Успешно отправлено');
            }, 50);

        } catch (error) {
            console.error('Ошибка при отправке запроса:', error);
            overlay.classList.add('hidden');

            setTimeout(() => {
                showPopup('Ошибка при отправке');
            }, 50);
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.segment-button');
    const views = document.querySelectorAll('.segment-view');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;

            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            views.forEach(view => {
                view.classList.remove('active');
                view.classList.add('hidden');
            });

            const targetView = document.getElementById(targetId);
            if (targetView) {
                targetView.classList.add('active');
                targetView.classList.remove('hidden');
            }
        });
    });
});

const selectBtn = document.getElementById("selectAllBtn");

// Main toggle function
selectBtn.addEventListener("click", () => {
    const checkboxes = document.querySelectorAll('#view-all input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);

    checkboxes.forEach(cb => cb.checked = !allChecked);

    selectBtn.textContent = allChecked ? "Выбрать всё" : "Снять выделение";

    updateAllCounts(); // update all check-counts
});

// Update check-count for one <details>
function updateCount(detailsEl) {
    const checkboxes = detailsEl.querySelectorAll('input[type="checkbox"]');
    const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
    const countSpan = detailsEl.querySelector('.check-count');
    if (countSpan) {
        countSpan.textContent = `${checked}/${checkboxes.length}`;
    }
}

// Update all check-counts
function updateAllCounts() {
    const allDetails = document.querySelectorAll('#view-all details');
    allDetails.forEach(updateCount);
}

// Listen for manual checkbox changes to update individual counters
document.querySelectorAll('#view-all input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
        const details = cb.closest('details');
        updateCount(details);
    });
});

// Initialize counts on page load
updateAllCounts();

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

// Выбор всех чекбоксов в пределах одной категории
document.querySelectorAll('.select-category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const details = btn.closest('details');
        const checkboxes = details.querySelectorAll('input[type="checkbox"]');

        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        checkboxes.forEach(cb => cb.checked = !allChecked);

        // Обновляем текст кнопки
        btn.textContent = allChecked ? "Всё" : "Снять";

        // Обновим счетчик
        updateCount(details);
    });
});

let statusLabel = document.getElementById('executionStatus');
if (!statusLabel) {
    statusLabel = document.createElement('h3');
    statusLabel.id = 'executionStatus';
    statusLabel.style.marginTop = '5px';
    document.getElementById('executionTitle').after(statusLabel);
}

document.getElementById('searchExecutionBtn').addEventListener('click', async () => {
    const caseNumber = document.getElementById('executionInput').value.trim();
    if (!caseNumber) {
        showPopup('Введите номер исполнительного производства');
        return;
    }

    try {
        // Загружаем Excel как ArrayBuffer
        const response = await fetch(excelPath);
        const arrayBuffer = await response.arrayBuffer();

        // Читаем через SheetJS
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        // Ищем запись
        const record = data.find(row => String(row["№ производства"]).trim() === caseNumber);

        if (record) {
            const status = record["Статус производства"] || "Статус не указан";
            currentExecutionStatus = status;

            // Показываем popup
            showPopup(`Мы нашли производство ${caseNumber}`);

            document.getElementById('executionTitle').textContent =
                    `Исполнительное производство: ${caseNumber}`;

                // Обновляем статус с цветом
                statusLabel.textContent = `Статус: ${status}`;
                if (/окончен|закрыт/i.test(status)) {
                    statusLabel.style.color = 'green';
                } else {
                    statusLabel.style.color = 'red';
                }

        } else {
            showPopup('Извините, производство с таким номером не найдено');
        }
    } catch (error) {
        console.error('Ошибка при поиске:', error);
        showPopup('Ошибка при поиске файла');
    }
});


// document.getElementById('searchExecutionBtn').addEventListener('click', async () => {
//     const caseNumber = document.getElementById('executionInput').value.trim();
//     if (!caseNumber) {
//         showPopup('Введите номер исполнительного производства');
//         return;
//     }

//     const token = localStorage.getItem('access_token');
//     if (!token) {
//         window.location.href = '../../auth/login/login.html';
//         return;
//     }

//     try {
//         const response = await fetch(`${API_URL}/requests/check-case-number/`, {
//             method: 'POST',
//             headers: {
//                 'Authorization': 'Bearer ' + token,
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ case_number: caseNumber })
//         });

//         const result = await response.json();

//         if (response.ok && result.message) {
//             document.getElementById('executionTitle').textContent = `Исполнительное производство: ${caseNumber}`;
//         } else {
//             showPopup(result.message || 'Произошла ошибка при поиске');
//         }
//     } catch (error) {
//         console.error('Ошибка при поиске:', error);
//         showPopup('Ошибка сети или сервера');
//     }
// });

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

fetch("../../footer.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("footer-container").innerHTML = data;
    });