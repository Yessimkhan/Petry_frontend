document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    toggleButton.addEventListener("click", () => sidebar.classList.toggle("hidden"));

    const fileTabsContainer = document.getElementById('file-tabs');
    const tabsContainer = document.getElementById('sheet-tabs');
    const tableContainer = document.getElementById('excel-table');

    // Define our Excel files
    const excelFiles = [
        { name: "Форма №4", path: "/docs/Отчет формы №4.xlsx" },
        { name: "Движение исполнительных документов", path: "/docs/Движение исполнительных документов.xlsx" },
         { name: "Движение исполнительных документов Итог", path: "/docs/Движение исполнительных документов Итог.xlsx" }
    ];

    let currentWorkbook = null;

    // Create file tabs
    excelFiles.forEach((file, index) => {
        const tab = document.createElement('button');
        tab.textContent = file.name;
        tab.classList.add('file-tab');
        if (index === 0) tab.classList.add('active');

        tab.addEventListener('click', () => {
            // Change active file tab
            document.querySelectorAll('.file-tab').forEach(btn => btn.classList.remove('active'));
            tab.classList.add('active');

            // Load the selected file
            loadExcelFile(file.path);
        });

        fileTabsContainer.appendChild(tab);
    });

    // Load the first file by default
    loadExcelFile(excelFiles[0].path);

    function loadExcelFile(url) {
        fetch(url)
            .then(response => response.arrayBuffer())
            .then(data => {
                currentWorkbook = XLSX.read(data, { type: 'array' });
                renderWorkbook(currentWorkbook);
            })
            .catch(err => console.error('Ошибка загрузки Excel:', err));
    }

    function renderWorkbook(workbook) {
        // Clear previous sheet tabs
        tabsContainer.innerHTML = '';

        // Create tabs for all sheets
        workbook.SheetNames.forEach((sheetName, index) => {
            const tab = document.createElement('button');
            tab.textContent = sheetName;
            tab.classList.add('tab-button');
            if (index === 0) tab.classList.add('active');

            tab.addEventListener('click', () => {
                // Change active sheet tab
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                tab.classList.add('active');

                // Show the selected sheet
                renderSheet(workbook.Sheets[sheetName]);
            });

            tabsContainer.appendChild(tab);
        });

        // Show first sheet by default
        if (workbook.SheetNames.length > 0) {
            renderSheet(workbook.Sheets[workbook.SheetNames[0]]);
        }
    }

    function renderSheet(sheet) {
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