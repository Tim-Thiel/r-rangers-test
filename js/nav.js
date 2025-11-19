document.addEventListener("DOMContentLoaded", () => {

    // Navigation HTML
    const navHTML = `
        <nav class="site-navigation">
            <a href="/index.html">🏠 Startseite</a>
            <a href="/team/team.html">👥 Team</a>
            <a href="/aktionen/aktionen.html">⭐ Aktionen</a>
            <a href="/privat/privat.html">🔒 Privat</a>
        </nav>
    `;

    // Navigation ganz oben in den Body einfügen
    document.body.insertAdjacentHTML("afterbegin", navHTML);

    // CSS laden
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/css/navigation.css";
    document.head.appendChild(link);
});

