document.addEventListener("DOMContentLoaded", () => {

    // Favicon dynamisch hinzufügen
    let faviconSymbol = document.querySelector("link[rel~='icon']");
    if (!faviconSymbol) {
        faviconSymbol = document.createElement('link');
        faviconSymbol.rel = 'icon';
        document.head.appendChild(faviconSymbol);
    }
    faviconSymbol.href = '../bilder/thumbs/favicon.png'; // Pfad zu deinem Logo

        // FontAwesome für Icons laden
const fontAwesome = document.createElement("link");
fontAwesome.rel = "stylesheet";
fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css";
document.head.appendChild(fontAwesome);
    
// Navigation HTML (KORRIGIERT & MODERNISIERT)
const navHTML = `
    <nav class="site-navigation">
        <div class="menu-toggle" id="mobile-menu">
            <i class="fas fa-bars"></i>
        </div>

        <div class="nav-links" id="nav-links">
            <a href="/index"><i class="fas fa-home"></i> Startseite</a>
            <a href="#" data-area="aktionen" data-url="/bereiche/aktionen"><i class="fas fa-campground"></i> Aktionen & Camps</a>
            <a href="#" data-area="team" data-url="/bereiche/team"><i class="fas fa-paw"></i> Rennmäuse</a>
            <a href="#" data-area="privat" data-url="/bereiche/privat"><i class="fas fa-lock"></i> Private Bilder</a>
        </div>
    </nav>
`;
    
    // Navigation ganz oben einfügen
    document.body.insertAdjacentHTML("afterbegin", navHTML);

    // Passwort-Popup GLOBAL einfügen
document.body.insertAdjacentHTML("beforeend", `
    <div id="pw-popup" class="modal-overlay hidden">
        <div class="modal-content">
            <span id="pw-popup-close" class="modal-close">&times;</span>
            <h3>🔐 Passwort erforderlich</h3>
            
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
    <div id="error-popup" class="modal-overlay hidden" style="z-index: 20000;">
        <div class="modal-content" style="max-width: 300px; padding: 20px;">
            <h3 style="color: red;">Fehler</h3>
            <p id="error-message" style="margin: 15px 0;">Falsches Passwort!</p>
            <button id="error-popup-close" class="download-btn" style="background: #666;">Schließen</button>
        </div>
    </div>
`);

// NEU: Strukturierter Footer
const footerHTML = `
<footer class="site-footer">
    <div class="footer-wrapper">

        <div class="footer-sec">
            <h3>Kontakt</h3>
            <p>
                <a href="mailto:tim_thiel@r-rangers.de" class="footer-link-white">
                <i class="fas fa-envelope footer-icon"></i>tim_thiel@r-rangers.de           
                </a>
            </p>
            <p> 
                <a href="https://www.r-rangers.de" target="_blank" class="footer-link-white">
                <i class="fas fa-globe footer-icon"></i>www.r-rangers.de
                </a>
            </p>
        </div>

        <div class="footer-sec">
            <h3>Social Media</h3>
            <div class="social-links">
                <a href="https://www.instagram.com/timthiel_" target="_blank" class="insta-icon-link">
                    <i class="fa-brands fa-instagram"></i>
                </a>
            </div>
        </div>

        <div class="footer-sec">
            <h3>Rechtliches</h3>
            <ul class="footer-nav-list">
                <li><a href="/index">Startseite</a></li>
                <li><a href="/rechtliches/impressum">Impressum</a></li>
                <li><a href="/rechtliches/datenschutz">Datenschutz</a></li>
            </ul>
        </div>
    </div>
    <div class="footer-bottom-bar">
        &copy; 2026 Tim Thiel
    </div>
</footer>
`;
document.body.insertAdjacentHTML("beforeend", footerHTML);

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
