/* auth.js – zentrale Passwortlogik mit Popup und Enter-Taste */

// 🔐 Passwörter an einer Stelle ändern
const PASSWORDS = {
    aktionen: "aktion",
    team: "team",
    privat: "privat"
};

// Prüft, ob Bereich bereits freigeschaltet
function checkAccess(area) {
    return localStorage.getItem("auth_" + area) === "true";
}

// Passwort-Popup anzeigen
function askPassword(area, onSuccess) {
    const popup = document.getElementById("pw-popup");
    const input = document.getElementById("pw-popup-input");
    const btnOpen = document.getElementById("pw-popup-confirm");
    const btnCancel = document.getElementById("pw-popup-cancel");

    if (!popup) {
        console.error("Kein Passwort-Popup im DOM gefunden!");
        return;
    }

    popup.style.display = "flex";
    input.value = "";
    input.focus();

    const submit = () => {
        if (input.value === PASSWORDS[area]) {
            localStorage.setItem("auth_" + area, "true");
            popup.style.display = "none";
            onSuccess();
        } else {
            alert("❌ Falsches Passwort.");
        }
    };

    // Open-Button
    btnOpen.onclick = submit;

    // Enter-Taste
    input.onkeydown = (e) => {
        if (e.key === "Enter") submit();
    };

    // Cancel-Button
    btnCancel.onclick = () => {
        popup.style.display = "none";
    };
}

// Öffnet einen Bereich sicher
function openArea(area, url) {
    if (checkAccess(area)) {
        window.location.href = url;
    } else {
        askPassword(area, () => {
            window.location.href = url;
        });
    }
}
