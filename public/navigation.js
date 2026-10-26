const navToggle = document.getElementById("navToggle");
const navigationMenu = document.getElementById("navigationMenu");

if (navToggle && navigationMenu) {
    navToggle.addEventListener("click", () => {
        const isOpen = navigationMenu.classList.toggle("show");

        navToggle.textContent = isOpen ? "✕" : "☰";
        navToggle.setAttribute("aria-expanded", isOpen);
    });
}
const themeToggle = document.getElementById("themeToggle");
const themeButton = document.getElementById("themeButton");
const topThemeButton = document.getElementById("topThemeButton");

function applyTheme(isDark) {
    document.body.classList.toggle("dark-mode", isDark);
    document.body.classList.toggle("dark", isDark);

    localStorage.setItem("theme", isDark ? "dark" : "light");

    if (themeToggle) {
        themeToggle.textContent = isDark
            ? "☀️ Light Mode"
            : "🌙 Dark Mode";
    }

    if (themeButton) {
        themeButton.innerHTML = isDark
            ? '☀️ <span class="nav-text">Light Theme</span>'
            : '🌙 <span class="nav-text">Toggle Theme</span>';
    }

    if (topThemeButton) {
        topThemeButton.textContent = isDark ? "☀️" : "🌙";
    }
}

applyTheme(localStorage.getItem("theme") === "dark");

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const isDark =
            !document.body.classList.contains("dark-mode");

        applyTheme(isDark);
    });
}

function toggleTheme() {
    const isDark =
        !document.body.classList.contains("dark-mode");

    applyTheme(isDark);
}

if (themeButton) {
    themeButton.addEventListener("click", toggleTheme);
}

if (topThemeButton) {
    topThemeButton.addEventListener("click", toggleTheme);
}