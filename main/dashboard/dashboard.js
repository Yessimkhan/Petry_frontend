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
    window.location.href = 'login.html';
    return;
  }

  try {
    const response = await fetch('https://petry.sdutechnopark.kz/api/auth/me/', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      // Если токен истёк или недействителен — перенаправляем на вход
      window.location.href = 'login.html';
      return;
    }

    const user = await response.json();
    document.querySelector('.email').textContent = user.email;

  } catch (error) {
    console.error('Ошибка запроса:', error);
    window.location.href = 'login.html';
  }
}

fetchUser();
