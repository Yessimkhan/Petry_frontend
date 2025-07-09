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

// async function fetchUser() {
//   const token = localStorage.getItem('access_token');
//   if (!token) {
//     window.location.href = '../../auth/login/login.html';
//     return;
//   }

//   try {
//     const response = await fetch('https://cors-anywhere.herokuapp.com/https://petryapi.sdutechnopark.kz/api/auth/me/', {
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