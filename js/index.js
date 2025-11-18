// =====================
// PASSWÖRTER PRO AKTION
// =====================
const actionPasswords = {
    "unlimited2025": "unlimitedPass",
    "pfingstcamp2023": "pfingstPass"
};

// Variablen für Overlay
let targetUrl = "";
let currentAction = "";

// =====================
// Vorschau laden
// =====================
async function loadPreview(actionName, containerId) {
    const gallery = document.getElementById(containerId);
    if (!gallery) return;

    const folder = `bilder/${actionName}/thumbs`;
    const apiUrl = `https://api.github.com/repos/tim-thiel/r-rangers/contents/${folder}`;

    try {
        const response = await fetch(apiUrl);
        const files = await response.json();

        if (!Array.isArray(files) || files.length === 0) return;

        const firstThumb = files.find(f => f.type === "file");
        if (!firstThumb) return;

        const img = document.createElement("img");
        img.src = firstThumb.download_url + "?raw=true";
        img.alt = actionName;

        const title = document.createElement("h3");
        title.textContent = actionName.replace(/([a-zA-Z]+)(\d+)/, "$1 $2");

        // Link öffnet Passwortabfrage statt direkt Seite
        const link = document.createElement("a");
        link.href = "#";
        link.onclick = () => requestPassword(actionName, `aktionen/${actionName}.html`);

        link.appendChild(img);
        link.appendChild(title);

        gallery.appendChild(link);

    } catch (e) {
        console.error("Vorschau konnte nicht geladen werden:", e);
    }
}

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

// ENTER-Taste im Passwortfeld
document.addEventListener("DOMContentLoaded", () => {
    loadPreview("unlimited2025", "unlimited2025-preview");
    loadPreview("pfingstcamp2023", "pfingstcamp2023-preview");

    document.getElementById("pw-input").addEventListener("keydown", e => {
        if (e.key === "Enter") checkPassword();
    });
});
