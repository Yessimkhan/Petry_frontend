import { API_URL } from '../../config.js';
const loginForm = document.querySelector('.login-form');

loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = loginForm.querySelector('input[type="text"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    try {
        const loginUrl = `${API_URL}/auth/login/`;

        const response = await fetch(loginUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Успешный вход:', result);

            localStorage.setItem('access_token', result.access);
            localStorage.setItem('refresh_token', result.refresh);

            const meUrl = `${API_URL}/auth/me/`;
            const userResponse = await fetch(meUrl, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + result.access,
                    'Accept': 'application/json',
                }
            });

            const user = await userResponse.json();
            console.log('👤 Пользователь:', user);

            window.location.href = '../../index.html';
        } else {
            alert(result.detail || 'Ошибка входа');
        }
    } catch (error) {
        console.error('Ошибка запроса:', error);
        alert('Ошибка подключения к серверу');
    }
});
