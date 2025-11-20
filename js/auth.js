/* auth.js – zentrale Passwortlogik */

// 🔐 Passwörter an einer Stelle ändern
const PASSWORDS = {
    aktionen: "aktion",
    team: "team",
    privat: "privat"
};

// Funktion: prüft Zugang
function checkAccess(area) {
    return localStorage.getItem("auth_" + area) === "true";
}

// Funktion: Passwortdialog + speichern
async function requestAccess(area) {
    const pw = PASSWORDS[area];
    if (!pw) return true; // Bereich ohne Passwort

    if (checkAccess(area)) return true;

    const entered = prompt(`Bitte Passwort für „${area}“ eingeben:`);

    if (entered === pw) {
        localStorage.setItem("auth_" + area, "true");
        return true;
    }

    alert("❌ Falsches Passwort.");
    return false;
}

// Funktion: Sicherer Seitenaufruf
async function openArea(area) {
    const ok = await requestAccess(area);
    if (ok) window.location.href = `/bereiche/${area}.html`;
}
