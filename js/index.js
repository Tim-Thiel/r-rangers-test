// ==========================
// PASSWÖRTER PRO BEREICH
// ==========================
const areaPasswords = {
    "bereiche/aktionen.html": "aktionenPass",
    "bereiche/team.html": "teamPass",
    "bereiche/privat.html": "privatPass"
};

// Variablen für Overlay
let targetUrl = "";

// Globale Funktion für onclick
window.openPassword = function(url) {
    targetUrl = url;
    const overlay = document.getElementById("password-overlay");
    overlay.style.display = "flex";

    const input = document.getElementById("pw-input");
    input.value = "";
    input.focus();
};

// Passwort prüfen
function checkPassword() {
    const input = document.getElementById("pw-input").value;
    const correct = areaPasswords[targetUrl];
    if (input === correct) {
        window.location.href = targetUrl;
    } else {
        alert("Falsches Passwort!");
    }
}

// Alles andere erst nach DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    const pwOpen = document.getElementById("pw-open");
    const pwBack = document.getElementById("pw-back");
    const pwInput = document.getElementById("pw-input");

    pwOpen.addEventListener("click", checkPassword);
    pwBack.addEventListener("click", () => {
        document.getElementById("password-overlay").style.display = "none";
    });

    pwInput.addEventListener("keydown", e => {
        if (e.key === "Enter") checkPassword();
    });

    console.log("index.js geladen, Overlay ready");
});
