// Passwort für jeden Bereich
const areaPasswords = {
    "bereiche/aktionen.html": "aktionenPass",
    "bereiche/team.html": "teamPass",
    "bereiche/privat.html": "privatPass"
};

let targetUrl = "";

// Overlay öffnen
function openPassword(url) {
    targetUrl = url;
    const overlay = document.getElementById("password-overlay");
    overlay.style.display = "flex";

    const input = document.getElementById("pw-input");
    input.value = "";
    input.focus();
}

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

// Setze alle EventListener nach DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    // Menü-Karten EventListener
    document.querySelectorAll(".menu-card").forEach(card => {
        card.addEventListener("click", () => {
            const url = card.dataset.url;
            openPassword(url);
        });
    });

    // Overlay Buttons
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
