/* auth.js – zentrale Passwortlogik mit Popup und Enter-Taste */

// 🔐 Passwörter an einer Stelle ändern
const PASSWORDS = {
    aktionen: "aktion",
    team: "team",
    privat: "privat"
};

// ================= HILFSFUNKTION ZUM SAUBEREN SCHLIESSEN =================
// Diese Funktion schließt das Pop-up sauber und entfernt ALLE temporären Listener,
// damit es danach fehlerfrei wieder geöffnet werden kann (Löst Problem 2).
function closePopupClean() {
    const popup = document.getElementById("pw-popup");
    const input = document.getElementById("pw-popup-input");
    const btnOpen = document.getElementById("pw-popup-confirm");
    const btnCancel = document.getElementById("pw-popup-cancel");

    // 1. Pop-up verstecken (mit CSS-Klasse, die zu nav.js passt)
    if (popup) popup.classList.add("hidden");
    if (input) input.value = "";

    // 2. WICHTIG: Temporäre Listener entfernen, um Dopplungen zu vermeiden (Löst Problem 2)
    if (btnOpen) btnOpen.onclick = null;
    if (input) input.onkeydown = null;
    if (btnCancel) btnCancel.onclick = null;
    // Der Listener für das 'X' (unten in DOMContentLoaded) bleibt bestehen, das ist OK.
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
            closePopupClean(); // Nutzt die saubere Schließfunktion
            onSuccess();
        } else {
            alert("❌ Falsches Passwort.");
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
    // Ersetzt das alte "popup.style.display = 'none';" durch die saubere Funktion (Löst Problem 3)
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

/*// ================= EVENT LISTENER FÜR DAS 'X' =================
// Wird einmal beim Laden der Seite registriert (Löst Problem 1: X funktioniert nicht)
document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.getElementById("pw-popup-close");
    
    // Beim Klick auf das 'X' (Schließen-Button) wird sauber geschlossen
    if (closeBtn) {
        closeBtn.addEventListener('click', closePopupClean);
    }
});
