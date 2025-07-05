const form = document.querySelector('.register-form');
const agreeCheckbox = document.getElementById('agree');

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Проверка согласия
    if (!agreeCheckbox.checked) {
        alert('Пожалуйста, подтвердите согласие с условиями.');
        return;
    }

    const email = document.getElementById('email').value;
    const first_name = document.getElementById('first_name').value;
    const last_name = document.getElementById('last_name').value;
    const region = document.getElementById('region').value;
    const password = document.getElementById('password').value;
    const password2 = document.getElementById('password2').value;

    if (password !== password2) {
        alert('Пароли не совпадают!');
        return;
    }

    try {
        const response = await fetch('https://petry.sdutechnopark.kz/api/auth/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email,
                password,
                password2,
                first_name,
                last_name,
                region
            })
        });

        const result = await response.json();

        if (response.ok) {
            alert('Регистрация прошла успешно! Теперь вы можете войти в систему.');
            window.location.href = '../login/login.html';
        } else {
            console.error(result);
            alert(result.detail || 'Ошибка при регистрации');
        }

    } catch (err) {
        console.error('Ошибка сети:', err);
        alert('Ошибка подключения к серверу');
    }
});
