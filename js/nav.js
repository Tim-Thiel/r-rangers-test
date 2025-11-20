document.addEventListener("DOMContentLoaded", () => {

    // Navigation HTML
    const navHTML = `
        <nav class="site-navigation">
            <a href="/index.html">🏠 Startseite</a>
            <a href="#" data-area="aktionen" data-url="/bereiche/aktionen.html">⭐ Aktionen & Camps</a>
            <a href="#" data-area="team" data-url="/bereiche/team.html">👥 Rennmäuse</a>
            <a href="#" data-area="privat" data-url="/bereiche/privat.html">🔒 Private Bilder</a>
        </nav>
    `;

    // Navigation ganz oben einfügen
    document.body.insertAdjacentHTML("afterbegin", navHTML);

    // Passwort-Popup GLOBAL einfügen
    document.body.insertAdjacentHTML("beforeend", `
        <div id="pw-popup" style="
            position: fixed;
            top:0; left:0;
            width:100%; height:100%;
            background: rgba(0,0,0,0.8);
            display:none;
            justify-content:center;
            align-items:center;
            z-index:9999;
        ">
            <div style="
                background:white;
                padding:25px;
                border-radius:15px;
                max-width:300px;
                text-align:center;
                font-family:Arial;
            ">
                <h3>Passwort eingeben</h3>
                <input id="pw-popup-input" type="password" placeholder="Passwort"
                    style="width:90%; padding:10px; border-radius:8px; margin-top:10px;">
                <div style="margin-top:15px; display:flex; gap:10px; justify-content:center;">
                    <button id="pw-popup-confirm" style="padding:10px 15px; border-radius:8px; background:#0055aa; color:white;">Öffnen</button>
                    <button id="pw-popup-cancel" style="padding:10px 15px; border-radius:8px; background:#666; color:white;">Abbrechen</button>
                </div>
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
});
