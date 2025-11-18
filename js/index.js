// Passwörter für die Kategorien
const passwords = {
    "team.html": "forscher2025",
    "aktionen.html": "actions2025",
    "privat.html": "privat2025"
};

let selectedTarget = null;

// Overlay öffnen
function openPassword(target) {
    selectedTarget = target;
    document.getElementById("password-overlay").style.display = "flex";
    document.getElementById("pw-input").value = "";
}

// Overlay schließen
document.getElementById("pw-back-btn").addEventListener("click", () => {
    document.getElementById("password-overlay").style.display = "none";
});

// Passwort prüfen
document.getElementById("pw-btn").addEventListener("click", () => {
    const input = document.getElementById("pw-input").value;

    if (passwords[selectedTarget] === input) {
        window.location.href = selectedTarget;
    } else {
        alert("Falsches Passwort!");
    }
});
