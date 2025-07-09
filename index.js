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
    const response = await fetch('https://petryapi.sdutechnopark.kz/api/auth/me/', {
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
    // Инициализируем flatpickr, но не открываем сразу
    const datePicker = flatpickr("#dateRange", {
        mode: "range",
        dateFormat: "d/m/Y",
        allowInput: true, // позволяет вводить вручную
        clickOpens: false, // отключаем открытие при клике по input
        locale: {
            firstDayOfWeek: 1,
            weekdays: {
                shorthand: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
                longhand: [
                    'Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'
                ],
            },
            months: {
                shorthand: [
                    'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
                    'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
                ],
                longhand: [
                    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
                ],
            },
        }
    });

    // Открытие календаря по кнопке
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
