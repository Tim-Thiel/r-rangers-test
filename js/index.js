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
let currentAction = "";

// =====================
// Passwort anfragen
// =====================
function requestPassword(actionName, url) {
    currentAction = actionName;
    targetUrl = url;

    document.getElementById("password-overlay").style.display = "flex";
    document.getElementById("pw-input").value = "";
    document.getElementById("pw-input").focus();
}

// =====================
// Passwort prüfen
// =====================
function checkPassword() {
    const input = document.getElementById("pw-input").value;
    const correctPassword = actionPasswords[currentAction];

    if (input === correctPassword) {
        window.location.href = targetUrl;
    } else {
        alert("Falsches Passwort!");
    }
}



// =====================
// Zurück-Button
// =====================
document.getElementById("pw-back-btn").addEventListener("click", () => {
    document.getElementById("password-overlay").style.display = "none";
});

// ENTER-Taste im Passwortfeld
document.addEventListener("DOMContentLoaded", () => {
    loadPreview("unlimited2025", "unlimited2025-preview");
    loadPreview("pfingstcamp2023", "pfingstcamp2023-preview");

    document.getElementById("pw-input").addEventListener("keydown", e => {
        if (e.key === "Enter") checkPassword();
    });
    
    // Buttons verbinden
    document.getElementById("pw-btn").onclick = checkPassword;
    document.getElementById("pw-back-btn").onclick = () => {
        document.getElementById("password-overlay").style.display = "none";
    };
});
