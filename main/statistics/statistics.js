document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    toggleButton.addEventListener("click", () => sidebar.classList.toggle("hidden"));

    const tabsContainer = document.getElementById('sheet-tabs');
    const tableContainer = document.getElementById('excel-table');

    // Загружаем Excel-файл из проекта
    fetchExcelFile('/docs/Отчет формы №4.xlsx');

    function fetchExcelFile(url) {
        fetch(url)
            .then(response => response.arrayBuffer())
            .then(data => {
                const workbook = XLSX.read(data, { type: 'array' });

                // Создаём вкладки для всех листов
                workbook.SheetNames.forEach((sheetName, index) => {
                    const tab = document.createElement('button');
                    tab.textContent = sheetName;
                    tab.classList.add('tab-button');
                    if (index === 0) tab.classList.add('active');

                    tab.addEventListener('click', () => {
                        // Меняем активную вкладку
                        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                        tab.classList.add('active');

                        // Показываем таблицу выбранного листа
                        renderSheet(workbook.Sheets[sheetName]);
                    });

                    tabsContainer.appendChild(tab);
                });

                // Показываем первый лист по умолчанию
                renderSheet(workbook.Sheets[workbook.SheetNames[0]]);
            })
            .catch(err => console.error('Ошибка загрузки Excel:', err));
    }

    // Функция рендеринга листа с адаптацией
    function renderSheet(sheet) {
        const tableContainer = document.getElementById('excel-table');
        const htmlTable = XLSX.utils.sheet_to_html(sheet);
        tableContainer.innerHTML = htmlTable;

        const table = tableContainer.querySelector('table');
        if (table) {
            // Remove all inline styles added by XLSX
            table.removeAttribute('style');
            table.removeAttribute('border');
            table.removeAttribute('width');

            // Apply our preferred styles
            table.style.width = 'auto';
            table.style.margin = '0';
        }
    }
});


// Подгружаем футер
fetch("../../footer.html")
    .then(response => response.text())
    .then(data => {
        document.getElementById("footer-container").innerHTML = data;
    });
