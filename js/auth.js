/* auth.js – zentrale Passwortlogik mit Popup und Enter-Taste */

// 🔐 Passwörter an einer Stelle ändern
const PASSWORDS = {
    aktionen: "2D780D188C00F8E70064C5897C4A5627C202302342EAB4538E6C2647E81CCC22",
    team: "FF982DBDE7F65EEDB4374FD8AACB72A6BE93188E72ABB7AFCE480C9DEC9D05E4",
    privat: "2BC0659381C5A5EA1421BA9BC04F34F13522E4CCC919F8CE51D4F1FF949D67BC"
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

    // Hier ist das wichtige ASYNC
    const submit = async (e) => { 
        if (e && e.preventDefault) e.preventDefault(); 
        if (e && e.stopPropagation) e.stopPropagation();
        
        const enteredText = input.value;

        try {
            // Passwort in Hash umwandeln
            const msgUint8 = new TextEncoder().encode(enteredText);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const inputHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            // Vergleich mit der Liste oben
            if (inputHash === PASSWORDS[area]) {
                const today = new Date().toISOString().split('T')[0];
                localStorage.setItem("auth_date_" + area, today); 
            
                closePopupClean();
                onSuccess();  
            } else {
                showError("❌ Falsches Passwort!"); 
                input.value = "";
            }
        } catch (err) {
            console.error("Fehler bei der Verschlüsselung:", err);
            showError("Technischer Fehler bei der Eingabe.");
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
