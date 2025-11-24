/* auth.js – zentrale Passwortlogik mit Popup und Enter-Taste */

// 🔐 Passwörter an einer Stelle ändern
const PASSWORDS = {
    aktionen: "aktion",
    team: "team",
    privat: "privat"
};

// ================= GLOBALE HILFSFUNKTIONEN ZUM SCHLIESSEN =================

// Diese Funktion schließt das Passwort-Pop-up sauber und entfernt ALLE temporären Listener.
// WICHTIG: Muss global sein, damit script.js darauf zugreifen kann.
function closePopupClean() {
    const popup = document.getElementById("pw-popup");
    const input = document.getElementById("pw-popup-input");
    const btnOpen = document.getElementById("pw-popup-confirm");
    const btnCancel = document.getElementById("pw-popup-cancel");

    // 1. Pop-up verstecken
    if (popup) popup.classList.add("hidden");
    if (input) input.value = "";

    // 2. WICHTIG: Temporäre Listener entfernen
    if (btnOpen) btnOpen.onclick = null;
    if (input) input.onkeydown = null;
    if (btnCancel) btnCancel.onclick = null;
}

// ✅ NEU: Globale Funktion zum Schließen des Fehler-Pop-ups. 
// WICHTIG: Wird vom zentralen ESC-Handler in script.js benötigt.
function closeErrorPopup() {
    const errorPopup = document.getElementById('error-popup');
    if (errorPopup) errorPopup.classList.add('hidden');
    
    // Optional: Fokus zurück auf das Passwort-Feld setzen
    const pwInput = document.getElementById("pw-popup-input");
    if(pwInput) pwInput.focus();
}


// 🔑 GLOBALE FUNKTION ZUM ANZEIGEN VON FEHLERN (verwendet die neue closeErrorPopup)
function showError(message) {
    const errorPopup = document.getElementById('error-popup');
    const errorMessage = document.getElementById('error-message');
    const closeBtn = document.getElementById('error-popup-close'); 

    if (!errorPopup) {
        alert(message);
        return;
    }

    // Zeige das Pop-up an
    errorMessage.textContent = message;
    errorPopup.classList.remove('hidden');
    
    // Schließen-Button (nutzt die globale Aufräum-Funktion)
    closeBtn.onclick = closeErrorPopup;

    // Fokus auf den Schließen-Button setzen. 
    closeBtn.focus();
}


// ================= MAIN LOGIC =================
function checkAccess(area) {
    return localStorage.getItem("auth_" + area) === "true";
}

function askPassword(area, onSuccess) {
    const popup = document.getElementById("pw-popup");
    const input = document.getElementById("pw-popup-input");
    const btnOpen = document.getElementById("pw-popup-confirm");
    const btnCancel = document.getElementById("pw-popup-cancel");

    if (!popup) {
        console.error("Kein Passwort-Popup im DOM gefunden!");
        return;
    }

    // Zeigt das Pop-up an
    popup.classList.remove("hidden");
    input.value = "";
    input.focus();

    const submit = (e) => {
        if (e && e.preventDefault) e.preventDefault(); 
        if (e && e.stopPropagation) e.stopPropagation();
        if (input.value === PASSWORDS[area]) {
            localStorage.setItem("auth_" + area, "true");
            closePopupClean();
            onSuccess();
        } else {
            showError("❌ Falsches Passwort!"); 
            input.value = "";
        }
    };

    // Open-Button (wird jedes Mal neu zugewiesen)
    btnOpen.onclick = submit;

    // Enter-Taste (wird jedes Mal neu zugewiesen)
    input.onkeydown = (e) => {
        if (e.key === "Enter") submit(e);
    };

    // Cancel-Button (wird jedes Mal neu zugewiesen)
    btnCancel.onclick = closePopupClean;
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
