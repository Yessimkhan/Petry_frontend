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