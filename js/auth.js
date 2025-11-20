/* auth.js – zentrale Passwortlogik mit Popup */

// 🔐 Passwörter an einer Stelle ändern
const PASSWORDS = {
    aktionen: "aktion",
    team: "team",
    privat: "privat"
};

// Popup Elemente
let pwPopup, pwInput, pwConfirm, pwCancel;
let pendingArea = null;
let pendingUrl = null;

// Popup vorbereiten (wird von nav.js ins DOM eingesetzt)
document.addEventListener("DOMContentLoaded", () => {
    pwPopup   = document.getElementById("pw-popup");
    pwInput   = document.getElementById("pw-popup-input");
    pwConfirm = document.getElementById("pw-popup-confirm");
    pwCancel  = document.getElementById("pw-popup-cancel");

    if (!pwPopup) return;

    pwConfirm.addEventListener("click", () => handlePassword());
    pwCancel.addEventListener("click", () => closePopup());

    pwInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handlePassword();
    });
});

// Prüfen ob bereits freigeschaltet
function checkAccess(area) {
    return localStorage.getItem("auth_" + area) === "true";
}

// Öffnet Passwort-Popup
function requestAccess(area, url) {
    pendingArea = area;
    pendingUrl  = url;

    pwInput.value = "";
    pwPopup.style.display = "flex";
    pwInput.focus();
}

// Passwort prüfen
function handlePassword() {
    const correct = PASSWORDS[pendingArea];
    const entered = pwInput.value;

    if (entered === correct) {
        localStorage.setItem("auth_" + pendingArea, "true");
        closePopup();
        window.location.href = pendingUrl;
    } else {
        alert("❌ Falsches Passwort");
    }
}

// Popup schließen
function closePopup() {
    pwPopup.style.display = "none";
}

// Sicherer Aufruf einer Seite
function openArea(area, url) {
    if (checkAccess(area)) {
        window.location.href = url;
        return;
    }
    requestAccess(area, url);
}
