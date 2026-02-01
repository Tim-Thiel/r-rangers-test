/* auth.js – zentrale Passwortlogik mit Popup und Enter-Taste */

// 🔐 Passwörter an einer Stelle ändern
const PASSWORDS = {
    aktionen: "rangers",
    team: "team",
    privat: "freunde"
};

// ================= GLOBALE SCHLIESS-FUNKTIONEN =================

// 1. Schließt das Fehler-Popup
function closeErrorPopup() {
    const errorPopup = document.getElementById('error-popup');
    if (errorPopup) errorPopup.classList.add('hidden');
    
    // Fokus zurück auf das Passwort-Feld setzen
    const pwInput = document.getElementById("pw-popup-input");
    if(pwInput) pwInput.focus();
}

// 2. Schließt das Passwort-Eingabe-Popup sauber
function closePopupClean() {
    const popup = document.getElementById("pw-popup");
    const input = document.getElementById("pw-popup-input");
    const btnOpen = document.getElementById("pw-popup-confirm");
    const btnCancel = document.getElementById("pw-popup-cancel");

    // Pop-up verstecken
    if (popup) popup.classList.add("hidden");
    if (input) input.value = "";

    // Temporäre Listener entfernen
    if (btnOpen) btnOpen.onclick = null;
    if (input) input.onkeydown = null;
    if (btnCancel) btnCancel.onclick = null;
}

// ================= FEHLER ANZEIGE =================
function showError(message) {
    const errorPopup = document.getElementById('error-popup');
    const errorMessage = document.getElementById('error-message');
    const closeBtn = document.getElementById('error-popup-close'); 

    if (!errorPopup) {
        alert(message);
        return;
    }

    errorMessage.textContent = message;
    errorPopup.classList.remove('hidden');
    
    closeBtn.onclick = closeErrorPopup;
    closeBtn.focus();
}

// ================= HAUPTLOGIK =================
function checkAccess(area) {
    const savedDate = localStorage.getItem("auth_date_" + area);
    if (!savedDate) return false;

    // Das heutige Datum als String (z.B. "2026-02-01")
    const today = new Date().toISOString().split('T')[0];

    // Wenn das gespeicherte Datum mit heute übereinstimmt, gewähre Zugriff
    return savedDate === today;
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

    popup.classList.remove("hidden");
    input.value = "";
    input.focus();

    const submit = (e) => {
        if (e && e.preventDefault) e.preventDefault(); 
        if (e && e.stopPropagation) e.stopPropagation();
        
        // Suche diese Stelle in askPassword:
        if (input.value === PASSWORDS[area]) {
            // Statt localStorage.setItem("auth_" + area, "true"); schreiben wir:
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem("auth_date_" + area, today); 
        
            closePopupClean();
            onSuccess();  
        } else {
            showError("❌ Falsches Passwort!"); 
            input.value = "";
        }
    };

    btnOpen.onclick = submit;

    input.onkeydown = (e) => {
        if (e.key === "Enter") submit(e);
    };

    btnCancel.onclick = closePopupClean;
}

function openArea(area, url) {
    if (checkAccess(area)) {
        window.location.href = url;
    } else {
        askPassword(area, () => {
            window.location.href = url;
        });
    }
}

// ================= NEU: EIGENER ESC-HANDLER FÜR AUTH =================
document.addEventListener("keydown", (e) => {
    if (e.key === 'Escape') {
        // 1. Fehler-Popup schließen (höchste Priorität)
        const errorPopup = document.getElementById('error-popup');
        if (errorPopup && !errorPopup.classList.contains('hidden')) {
            closeErrorPopup();
            return; // Stoppt hier, damit nicht auch das Passwort-Fenster zugeht
        }

        // 2. Passwort-Popup schließen
        const pwPopup = document.getElementById("pw-popup");
        if (pwPopup && !pwPopup.classList.contains('hidden')) {
            closePopupClean();
        }
    }
});
