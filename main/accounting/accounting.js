document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    toggleButton.addEventListener("click", () => {
        sidebar.classList.toggle("hidden");
    });

    if (!localStorage.getItem('consentAccepted')) {
        const consentModal = document.getElementById('consentModal');
        if (consentModal) {
            consentModal.style.display = 'flex';
        }
    }

    const acceptConsent = document.getElementById('acceptConsent');
    if (acceptConsent) {
        acceptConsent.addEventListener('click', function () {
            localStorage.setItem('consentAccepted', 'true');
            const consentModal = document.getElementById('consentModal');
            if (consentModal) {
                consentModal.style.display = 'none';
            }
        });
    }

    const uploadButton = document.querySelector('.upload-button');
    const fileInput = document.querySelector('.file-input');
    const fileNameInput = document.querySelector('.file-name');

    if (uploadButton && fileInput && fileNameInput) {
        uploadButton.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                fileNameInput.value = file.name;
            }
        });
    }
});
