document.addEventListener("DOMContentLoaded", () => {

    // Navigation HTML (KORRIGIERT)
const navHTML = `
    <nav class="site-navigation">
        <a href="/index.html">⚜️ Startseite</a>
        <a href="#" data-area="aktionen" data-url="/bereiche/aktionen.html">🔥 Aktionen & Camps</a>
        <a href="#" data-area="team" data-url="/bereiche/team.html">🐾 Rennmäuse</a>
        <a href="#" data-area="privat" data-url="/bereiche/privat.html">🔐 Private Bilder</a>
    </nav>
`;

    // Navigation ganz oben einfügen
    document.body.insertAdjacentHTML("afterbegin", navHTML);

    // Passwort-Popup GLOBAL einfügen
document.body.insertAdjacentHTML("beforeend", `
    <div id="pw-popup" class="modal-overlay hidden">
        <div class="modal-content">
            <span id="pw-popup-close" class="modal-close">&times;</span>
            <h3>🔐 Zugang erforderlich</h3>
            
            <input id="pw-popup-input" type="password" placeholder="Passwort"
                style="width:90%; padding:10px; border-radius:8px; margin: 15px 0;">
                
            <div style="margin-top:15px; display:flex; gap:10px; justify-content:center;">
                <button id="pw-popup-confirm" class="download-btn">Öffnen</button>
                <button id="pw-popup-cancel" class="download-btn" style="background: #666;">Abbrechen</button>
            </div>
        </div>
    </div>
`);
    // NEU: Fehler-Popup GLOBAL einfügen
document.body.insertAdjacentHTML("beforeend", `
    <div id="error-popup" class="modal-overlay hidden" style="z-index: 10000;">
        <div class="modal-content" style="max-width: 300px; padding: 20px;">
            <h3 style="color: red;">Fehler</h3>
            <p id="error-message" style="margin: 15px 0;">Falsches Passwort!</p>
            <button id="error-popup-close" class="download-btn" style="background: #666;">Schließen</button>
        </div>
    </div>
`);

    // CSS laden
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/nav.css";
    document.head.appendChild(link);

    // EventListener für die Navigationslinks
    document.querySelectorAll("nav.site-navigation a[data-area]").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            const area = link.dataset.area;
            const url = link.dataset.url;
            openArea(area, url);
        });
    });

    // NEU: Listener für das 'X' (Schließen-Button) sofort registrieren
    // WICHTIG: Die Funktion closePopupClean() MUSS in der auth.js GLOBAL sein.
    const closeBtn = document.getElementById("pw-popup-close");
    if (closeBtn) {
        closeBtn.addEventListener('click', closePopupClean);
    }
});
