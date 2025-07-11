const loginForm = document.querySelector('.login-form');

loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = loginForm.querySelector('input[type="text"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    try {
        const url = 'https://petryapi.sdutechnopark.kz/api/auth/login/';

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        // После успешного входа:
        if (response.ok) {
            console.log('✅ Успешный вход:', result);

            // Сохраняем токены
            localStorage.setItem('access_token', result.access);
            localStorage.setItem('refresh_token', result.refresh);

            // Получаем данные пользователя
            const userResponse = await fetch('https://petryapi.sdutechnopark.kz/api/auth/me/', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + result.access,
                    'Accept': 'application/json',
                }
            });

            const user = await userResponse.json();
            console.log('👤 Пользователь:', user);
            window.location.href = '../../index.html';
        }
        else {
            alert(result.detail || 'Ошибка входа');
        }
    } catch (error) {
        console.error('Ошибка запроса:', error);
        alert('Ошибка подключения к серверу');
    }
});
