// Menü-Karten öffnen Bereiche über das zentrale Auth-System
document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".menu-card").forEach(card => {
        card.addEventListener("click", () => {
            const area = card.dataset.url.replace("bereiche/", "").replace(".html", "");
            openArea(area); // kommt aus auth.js
        });
    });

});
