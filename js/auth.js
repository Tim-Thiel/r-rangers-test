/* auth.js – zentrale Passwortlogik mit Popup und Enter-Taste */

// 🔐 Passwörter mit passwordsgenerator.net/sha256-hash-generator/ generieren und einfügen
const PASSWORDS = {
    aktionen: "2bc0659381c5a5ea1421ba9bc04f34f13522e4ccc919f8ce51d4f1ff949d67bc",
    team: "ca8b22d0db83a22db163b560b3e4e51527e533d31d067b614a0c33c4d2df8432",
    privat: "96bb84e686eacde798941295c582654ecd13551f3ffdcd47f6f1866e16ab8efb"
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

    if (!popup) return;

    popup.classList.remove("hidden");
    input.value = "";
    input.focus();

    const submit = async (e) => {
        if (e) e.preventDefault();
        
        const enteredText = input.value;
        
        // Hash berechnen
        const msgUint8 = new TextEncoder().encode(enteredText);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const inputHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Nur der Vergleich - keine Logs mehr!
        if (inputHash === PASSWORDS[area]) {
            const today = new Date().toISOString().split('T')[0];
            localStorage.setItem("auth_date_" + area, today); 
            closePopupClean();
            onSuccess();  
        } else {
            showError("❌ Falsches Passwort!"); 
            input.value = "";
        }
    };

    btnOpen.onclick = (e) => submit(e);

    input.onkeydown = (e) => {
        if (e.key === "Enter") {
            submit(e);
        }
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
