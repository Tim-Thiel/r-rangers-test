async function loadPreview(actionName, containerId) {
    const gallery = document.getElementById(containerId);
    if (!gallery) return;

    // Suche NUR in /thumbs/
    const folder = `bilder/${actionName}/thumbs`;
    const apiUrl = `https://api.github.com/repos/tim-thiel/r-rangers/contents/${folder}`;

    try {
        const response = await fetch(apiUrl);
        const files = await response.json();

        if (!Array.isArray(files) || files.length === 0) return;

        // Erstes Thumbnail suchen
        const firstThumb = files.find(f => f.type === "file");
        if (!firstThumb) return;

        // Thumbnail anzeigen
        const img = document.createElement("img");
        img.src = firstThumb.download_url + "?raw=true";
        img.alt = actionName;

        // Titel formatieren (optional schöner)
        const title = document.createElement("h3");
        title.textContent =
            actionName
                .replace(/^\D*/, "") === actionName
                ? actionName
                : actionName.replace(/([a-zA-Z]+)(\d+)/, "$1 $2");

        // Link zur Aktionsseite
        const link = document.createElement("a");
        link.href = `aktionen/${actionName}.html`;
        link.appendChild(img);
        link.appendChild(title);

        gallery.appendChild(link);

    } catch (e) {
        console.error("Vorschau konnte nicht geladen werden:", e);
    }
}

// -------- Automatisches Laden für alle Aktionen -------
document.addEventListener("DOMContentLoaded", () => {
    loadPreview("unlimited2025", "unlimited2025-preview");
    loadPreview("pfingstcamp2023", "pfingstcamp2023-preview");
});
