document.addEventListener("DOMContentLoaded", () => {

    // Navigation HTML
    const navHTML = `
        <nav class="site-navigation">
            <a href="/index.html">🏠 Startseite</a>
            <a href="/bereiche/team.html">👥 Team</a>
            <a href="/bereiche/aktionen.html">⭐ Aktionen</a>
            <a href="/bereiche/privat.html">🔒 Privat</a>
        </nav>
    `;

    // Navigation ganz oben in den Body einfügen
    document.body.insertAdjacentHTML("afterbegin", navHTML);

    // CSS laden
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/nav.css";
    document.head.appendChild(link);
});

