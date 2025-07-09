const toggleButton = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
toggleButton.addEventListener("click", () => {
    sidebar.classList.toggle("hidden");
});

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

// async function fetchUser() {
//   const token = localStorage.getItem('access_token');
//   if (!token) {
//     window.location.href = '../../auth/login/login.html';
//     return;
//   }

//   try {
//     const response = await fetch('https://petryapi.sdutechnopark.kz/api/auth/me/', {
//       method: 'GET',
//       headers: {
//         'Authorization': 'Bearer ' + token,
//         'Accept': 'application/json'
//       }
//     });

//     if (!response.ok) {
//       window.location.href = '../../auth/login/login.html';
//       return;
//     }

//     const user = await response.json();
//     document.querySelector('.email').textContent = user.email;

//   } catch (error) {
//     console.error('Ошибка запроса:', error);
//     window.location.href = '../../auth/login/login.html';
//   }
// }

// fetchUser();