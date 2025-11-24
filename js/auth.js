/* auth.js – zentrale Passwortlogik mit Popup und Enter-Taste */

// 🔐 Passwörter an einer Stelle ändern
const PASSWORDS = {
    aktionen: "aktion",
    team: "team",
    privat: "privat"
};

// ================= HILFSFUNKTION ZUM SAUBEREN SCHLIESSEN =================
// Diese Funktion schließt das Passwort-Pop-up sauber und entfernt ALLE temporären Listener.
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

// 🔑 NEU: GLOBALE FUNKTION ZUM ANZEIGEN VON FEHLERN (Löst das Problem)
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
    
    // Listener für das Schließen (wird jedes Mal neu gesetzt)
    closeBtn.onclick = () => {
        errorPopup.classList.add('hidden');
        // Fokus zurück auf das Passwort-Feld setzen
        const pwInput = document.getElementById("pw-popup-input");
        if(pwInput) pwInput.focus();
    };
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

    const submit = () => {
        if (input.value === PASSWORDS[area]) {
            localStorage.setItem("auth_" + area, "true");
            closePopupClean();
            onSuccess();
        } else {
            // ✅ Jetzt kann showError gefunden werden
            showError("❌ Falsches Passwort!"); 
            input.value = "";
        }
    };

    // Open-Button (wird jedes Mal neu zugewiesen)
    btnOpen.onclick = submit;

    // Enter-Taste (wird jedes Mal neu zugewiesen)
    input.onkeydown = (e) => {
        if (e.key === "Enter") submit();
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
