document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    toggleButton.addEventListener("click", () => sidebar.classList.toggle("hidden"));

    const uploadButton = document.querySelector('.upload-button');
    const fileInput = document.querySelector('.file-input');
    const fileNameInput = document.querySelector('.file-name');

    if (uploadButton && fileInput && fileNameInput) {
        uploadButton.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                fileNameInput.value = file.name;
                readExcelFile(file);
            }
        });
    }
});

function readExcelFile(file) {
    const reader = new FileReader();

    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        const expectedHeaders = [
            "Дата",
            "Выбытие денег (дебит)",
            "Поступление денег (кредит)",
            "Наименование операции",
            "Номер в АИСОИП",
            "Должник",
            "Взыскатель",
            "Оплата ЧСИ"
        ];

        // Проверка, что файл не пустой
        const firstRow = json[0];
        if (!firstRow) return alert("Пустой файл");

        // Проверка заголовков
        const actualHeaders = Object.keys(firstRow);
        const headersMatch = expectedHeaders.every(header => actualHeaders.includes(header));
        if (!headersMatch) {
            alert("Названия столбцов не совпадают с требуемыми.");
            return;
        }

        // Отрисовка основной таблицы
        const tbody = document.querySelector('tbody');
        tbody.innerHTML = '';
        json.forEach(row => {
            const tr = document.createElement('tr');
            expectedHeaders.forEach(header => {
                const td = document.createElement('td');
                td.textContent = row[header];
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

        // === Новый функционал: распределение по ИП ===
        const ipTotals = {};

        json.forEach(row => {
            const ipName = row["Номер в АИСОИП"] || "Не указан"; // или "Взыскатель"
            const debit = parseFloat(row["Выбытие денег (дебит)"].toString().replace(',', '.')) || 0;
            const credit = parseFloat(row["Поступление денег (кредит)"].toString().replace(',', '.')) || 0;

            if (!ipTotals[ipName]) {
                ipTotals[ipName] = { debit: 0, credit: 0 };
            }

            ipTotals[ipName].debit += debit;
            ipTotals[ipName].credit += credit;
        });

        // Отображение сводной таблицы
        const summaryContainer = document.getElementById('summary-container');
        if (!summaryContainer) {
            console.error("Нет контейнера с id='summary-container'");
            return;
        }

        let summaryHTML = `
            <h3>Распределение по ИП</h3>
            <table border="1" style="border-collapse: collapse; width: 100%; text-align: center;">
                <thead>
                    <tr>
                        <th>ИП</th>
                        <th>Сумма Дебит</th>
                        <th>Сумма Кредит</th>
                        <th>Итого</th>
                    </tr>
                </thead>
                <tbody>
        `;

        Object.entries(ipTotals).forEach(([ip, sums]) => {
            const total = sums.debit + sums.credit;
            summaryHTML += `
                <tr>
                    <td>${ip}</td>
                    <td>${sums.debit.toFixed(2)}</td>
                    <td>${sums.credit.toFixed(2)}</td>
                    <td>${total.toFixed(2)}</td>
                </tr>
            `;
        });

        summaryHTML += `</tbody></table>`;
        summaryContainer.innerHTML = summaryHTML;
    };

    reader.readAsArrayBuffer(file);
}

fetch("../../footer.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("footer-container").innerHTML = data;
    });