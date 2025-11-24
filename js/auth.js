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

// 🔑 GLOBALE FUNKTION ZUM ANZEIGEN VON FEHLERN
function showError(message) {
    const errorPopup = document.getElementById('error-popup');
    const errorMessage = document.getElementById('error-message');
    const closeBtn = document.getElementById('error-popup-close');
    
    if (!errorPopup) {
        alert(message);
        return;
    }
    
    // 1. Definiere die Funktion zum Schließen des Pop-ups und Aufräumen
    const closeErrorClean = () => {
        errorPopup.classList.add('hidden');
        
        // WICHTIG: Den Keyboard-Listener wieder entfernen!
        document.removeEventListener('keydown', handleEnterKey);

        // Fokus zurück auf das Passwort-Feld setzen
        const pwInput = document.getElementById("pw-popup-input");
        if(pwInput) pwInput.focus();
    };

    // 2. Definiere den Handler für die Enter-Taste
    const handleEnterKey = (e) => {
        // Prüfen, ob die Enter-Taste gedrückt wurde
        if (e.key === 'Enter') {
            e.preventDefault(); // Verhindert ggf. ungewünschtes Absenden des Formulars
            closeErrorClean();
        }
    };
    
    // 3. Zeige das Pop-up an
    errorMessage.textContent = message;
    errorPopup.classList.remove('hidden');
    
    // 4. Weise die Listener zu
    // Schließen-Button (nutzt die zentrale Aufräum-Funktion)
    closeBtn.onclick = closeErrorClean;
    
    // NEU: Keyboard-Listener hinzufügen, solange das Pop-up sichtbar ist
    document.addEventListener('keydown', handleEnterKey);
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
            // ✅ Jetzt kann showError gefunden werden
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
