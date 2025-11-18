// ==========================
// PASSWÖRTER PRO BEREICH
// ==========================
const areaPasswords = {
    "bereiche/aktionen.html": "aktionenPass",
    "bereiche/team.html": "teamPass",
    "bereiche/privat.html": "privatPass"
};

// Gemerkte Zielseite
let targetUrl = "";


// ==========================
// Passwort-Overlay öffnen
// ==========================
function openPassword(url) {
    targetUrl = url;

    const overlay = document.getElementById("password-overlay");
    overlay.style.display = "flex";

    const input = document.getElementById("pw-input");
    input.value = "";
    input.focus();
}


// ==========================
// Passwort prüfen
// ==========================
function checkPassword() {
    const input = document.getElementById("pw-input").value;
    const correct = areaPasswords[targetUrl];

    if (input === correct) {
        window.location.href = targetUrl;
    } else {
        alert("Falsches Passwort!");
    }
}


// ==========================
// Init Events
// ==========================
document.addEventListener("DOMContentLoaded", () => {

    // Öffnen-Button
    document.getElementById("pw-open").onclick = checkPassword;

    // Zurück-Button
    document.getElementById("pw-back").onclick = () => {
        document.getElementById("password-overlay").style.display = "none";
    };

    // ENTER im Passwortfeld
    document.getElementById("pw-input").addEventListener("keydown", e => {
        if (e.key === "Enter") checkPassword();
    });

    console.log("index.js wurde erfolgreich geladen");
});
