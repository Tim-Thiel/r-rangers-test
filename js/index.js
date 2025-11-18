/* index.js — Passwortschutz pro Bereich */

// Passwörter für jeden Bereich
const passwords = {
    "bereiche/aktionen.html": "aktionenPass",
    "bereiche/team.html": "teamPass",
    "bereiche/privat.html": "privatPass"
};

let targetPage = null;

// Overlay öffnen
function openPassword(page) {
    targetPage = page;

    document.getElementById("password-overlay").style.display = "flex";
    document.getElementById("pw-input").value = "";
    document.getElementById("pw-input").focus();
}

// Öffnen-Button
document.getElementById("pw-open").addEventListener("click", () => {
    checkPassword();
});

// Enter-Taste
document.getElementById("pw-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkPassword();
});

// Passwort prüfen
function checkPassword() {
    const input = document.getElementById("pw-input").value;
    const correctPassword = passwords[targetPage];

    if (input === correctPassword) {
        window.location.href = targetPage;
    } else {
        alert("Falsches Passwort!");
    }
}

// Zurück-Button
document.getElementById("pw-back").addEventListener("click", () => {
    document.getElementById("password-overlay").style.display = "none";
    document.getElementById("pw-input").value = "";
});
