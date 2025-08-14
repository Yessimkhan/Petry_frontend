document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");
    toggleButton.addEventListener("click", () => sidebar.classList.toggle("hidden"));

    // Segment buttons functionality
    const segmentButtons = document.querySelectorAll('.segment-button');
    segmentButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and views
            segmentButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.view-section').forEach(view => view.classList.remove('active'));
            
            // Add active class to clicked button and corresponding view
            button.classList.add('active');
            const targetView = document.getElementById(button.dataset.target);
            targetView.classList.add('active');
        });
    });

    // Initialize accounting view
    initAccountingView();
    initAisView();

    // Load footer
    fetch("../../footer.html")
        .then(response => response.text())
        .then(data => {
            const footerContainer = document.getElementById("footer-container");
            if (footerContainer) footerContainer.innerHTML = data;
        });
});

function initAccountingView() {
    const uploadButton = document.querySelector('.upload-button');
    const fileInput = document.querySelector('.file-input');
    const fileNameInput = document.querySelector('.file-name');
    const tabsContainer = document.getElementById('sheet-tabs');
    const tableContainer = document.getElementById('excel-table');
    const summaryContainer = document.getElementById('summary-container');

    // Initialize empty table
    if (tableContainer) {
        tableContainer.innerHTML = `
        <table>
            <colgroup>
                <col style="width: 100px"> <!-- Date -->
                <col style="width: 120px"> <!-- Debit -->
                <col style="width: 120px"> <!-- Credit -->
                <col style="min-width: 150px"> <!-- Statement -->
                <col style="min-width: 120px"> <!-- Doc Number -->
                <col style="min-width: 150px"> <!-- Counterparty Bank -->
                <col style="min-width: 150px"> <!-- Counterparty -->
                <col style="min-width: 120px"> <!-- BIN/IIN -->
                <col style="min-width: 150px"> <!-- Counterparty Account -->
                <col style="min-width: 200px"> <!-- Payment Purpose -->
                <col style="min-width: 150px"> <!-- Operation Name -->
                <col style="min-width: 150px"> <!-- AIS OIP Number -->
                <col style="min-width: 150px"> <!-- Debtor -->
                <col style="min-width: 150px"> <!-- Collector -->
                <col style="min-width: 120px"> <!-- CHSI Payment -->
            </colgroup>
            <thead>
                <tr>
                    ${[
                "Дата",
                "Выбытие денег (дебит)",
                "Поступление денег (кредит)",
                "Выписка по счету ЧСИ",
                "Номер документа",
                "Банк контрагента",
                "Контрагент",
                "БИН/ИИН",
                "Счет контрагента",
                "Назначение платежа (из выписки по счету)",
                "Наименование операции",
                "Номер в АИСОИП",
                "Должник",
                "Взыскатель",
                "Оплата ЧСИ"
            ].map(h => `<th>${h}</th>`).join('')}
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    `;
    }

    uploadButton.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            fileNameInput.value = file.name;
            readExcelFile(file);
        }
    });

    function loadMockData() {
        fetch('/docs/mock_finance_data.xlsx') // Update path to your mock file location
            .then(response => {
                if (!response.ok) {
                    throw new Error('Mock file not found');
                }
                return response.arrayBuffer();
            })
            .then(data => {
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Set mock file name
                fileNameInput.value = 'mock_finance_data.xlsx';
                
                // Process the first sheet
                if (workbook.SheetNames.length > 0) {
                    processWorksheet(workbook.Sheets[workbook.SheetNames[0]]);
                    
                    // Create tabs if multiple sheets exist
                    tabsContainer.innerHTML = '';
                    workbook.SheetNames.forEach((sheetName, index) => {
                        const tab = document.createElement('button');
                        tab.textContent = sheetName;
                        tab.classList.add('tab-button');
                        if (index === 0) tab.classList.add('active');

                        tab.addEventListener('click', () => {
                            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                            tab.classList.add('active');
                            processWorksheet(workbook.Sheets[sheetName]);
                        });

                        tabsContainer.appendChild(tab);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading mock data:', error);
                // If mock file fails to load, keep the empty table
            });
    }

    // Call this function to load mock data on initialization
    loadMockData();

    function readExcelFile(file) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });

            tabsContainer.innerHTML = '';

            workbook.SheetNames.forEach((sheetName, index) => {
                const tab = document.createElement('button');
                tab.textContent = sheetName;
                tab.classList.add('tab-button');
                if (index === 0) tab.classList.add('active');

                tab.addEventListener('click', () => {
                    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                    tab.classList.add('active');
                    processWorksheet(workbook.Sheets[sheetName]);
                });

                tabsContainer.appendChild(tab);
            });

            if (workbook.SheetNames.length > 0) {
                processWorksheet(workbook.Sheets[workbook.SheetNames[0]]);
            }
        };

        reader.readAsArrayBuffer(file);
    }

    function processWorksheet(worksheet) {
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        const expectedHeaders = [
            "Дата",
            "Выбытие денег (дебит)",
            "Поступление денег (кредит)",
            "Выписка по счету ЧСИ",
            "Номер документа",
            "Банк контрагента",
            "Контрагент",
            "БИН/ИИН",
            "Счет контрагента",
            "Назначение платежа (из выписки по счету)",
            "Наименование операции",
            "Номер в АИСОИП",
            "Должник",
            "Взыскатель",
            "Оплата ЧСИ"
        ];

        const normalizeHeader = (header) => {
            return header
                .replace(/\n/g, ' ')
                .replace(/\s+/g, ' ')
                .trim()
                .replace(/^Номер\s+s\s+АИСОИП$/, "Номер в АИСОИП")
                .replace(/^Дата\s+$/, "Дата");
        };

        if (json.length === 0) {
            alert("Пустой файл");
            return;
        }

        const firstRow = json[0];
        const actualHeaders = Object.keys(firstRow).map(normalizeHeader);

        const headersMatch = expectedHeaders.every(expected =>
            actualHeaders.some(actual =>
                actual.toLowerCase() === expected.toLowerCase()
            )
        );

        if (!headersMatch) {
            alert(`Названия столбцов не совпадают с требуемыми.\n\nОжидаемые: ${expectedHeaders.join(', ')}\n\nФайл содержит: ${actualHeaders.join(', ')}`);
            return;
        }

        const headerMap = {};
        Object.keys(firstRow).forEach(originalHeader => {
            const normalized = normalizeHeader(originalHeader);
            headerMap[normalized] = originalHeader;
        });

        // Render main table
        if (tableContainer) {
            const tbody = tableContainer.querySelector('tbody');
            const thead = tableContainer.querySelector('thead');

            tbody.innerHTML = '';
            thead.innerHTML = `
                <tr>
                    ${expectedHeaders.map(h => `<th>${h}</th>`).join('')}
                </tr>
            `;

            json.forEach(row => {
                const tr = document.createElement('tr');
                expectedHeaders.forEach(expectedHeader => {
                    const td = document.createElement('td');
                    const originalHeader = headerMap[expectedHeader];
                    td.textContent = row[originalHeader] || '';
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
        }

        adjustTableHeight();

        // Calculate IP totals
        const ipTotals = {};
        json.forEach(row => {
            const originalHeader = headerMap["Номер в АИСОИП"];
            const ipName = row[originalHeader] || "Не указан";

            const debitHeader = headerMap["Выбытие денег (дебит)"];
            const debit = parseFloat(row[debitHeader]?.toString().replace(',', '.')) || 0;

            const creditHeader = headerMap["Поступление денег (кредит)"];
            const credit = parseFloat(row[creditHeader]?.toString().replace(',', '.')) || 0;

            if (!ipTotals[ipName]) {
                ipTotals[ipName] = { debit: 0, credit: 0 };
            }

            ipTotals[ipName].debit += debit;
            ipTotals[ipName].credit += credit;
        });

        // Display summary table
        if (summaryContainer) {
            summaryContainer.innerHTML = `
                <h3>Распределение по ИП</h3>
                <table class="summary-table">
                    <thead>
                        <tr>
                            <th>ИП</th>
                            <th>Сумма Дебит</th>
                            <th>Сумма Кредит</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(ipTotals).map(([ip, sums]) => `
                            <tr>
                                <td>${ip}</td>
                                <td>${sums.debit.toFixed(2)}</td>
                                <td>${sums.credit.toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    }

    function adjustTableHeight() {
        const excelTable = document.getElementById('excel-table');
        const excelWrapper = document.getElementById('excel-wrapper');

        // Reset heights to allow natural expansion
        excelWrapper.style.height = 'auto';
        excelTable.style.height = 'auto';

        // Calculate needed height
        const tableHeight = excelTable.offsetHeight;
        const wrapperHeight = excelWrapper.offsetHeight;

        // Set appropriate heights
        if (tableHeight > wrapperHeight) {
            excelWrapper.style.height = 'auto';
            excelWrapper.style.maxHeight = 'none';
        }
    }
}

function initAisView() {
    const tabsContainer = document.getElementById('ais-sheet-tabs');
    const tableContainer = document.getElementById('ais-excel-table');

    // Загружаем Excel-файл из проекта
    fetchExcelFile('/docs/пример AIS OIP.xlsx');

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
                        document.querySelectorAll('#ais-sheet-tabs .tab-button').forEach(btn => btn.classList.remove('active'));
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
}