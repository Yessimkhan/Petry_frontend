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

            // Validate headers
            const firstRow = json[0];
            if (!firstRow) return alert("Пустой файл");

            const actualHeaders = Object.keys(firstRow);

            const headersMatch = expectedHeaders.every(header => actualHeaders.includes(header));
            if (!headersMatch) {
                alert("Названия столбцов не совпадают с требуемыми.");
                return;
            }

            const tbody = document.querySelector('tbody');
            tbody.innerHTML = ''; // Clear existing rows

            json.forEach(row => {
                const tr = document.createElement('tr');
                expectedHeaders.forEach(header => {
                    const td = document.createElement('td');
                    td.textContent = row[header];
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
        };

        reader.readAsArrayBuffer(file);
    }
});

