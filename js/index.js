async function loadPreview(actionName, containerId) {
    const gallery = document.getElementById(containerId);
    if (!gallery) return;

    const folder = `bilder/${actionName}`;
    const apiUrl = `https://api.github.com/repos/tim-thiel/r-rangers/contents/${folder}`;

    try {
        const response = await fetch(apiUrl);
        const files = await response.json();

        if (!Array.isArray(files) || files.length === 0) return;

        // Erstes Bild als Vorschaubild
        const firstFile = files.find(f => f.type === "file");
        if (!firstFile) return;

        const img = document.createElement("img");
        img.src = firstFile.download_url;
        img.alt = actionName;

        const title = document.createElement("h3");
        title.textContent = actionName.replace(/\d+$/, ""); // Optional: Jahr entfernen

        const link = document.createElement("a");
        link.href = `aktionen/${actionName}.html`;
        link.appendChild(img);
        link.appendChild(title);

        gallery.appendChild(link);

    } catch (e) {
        console.error("Vorschau konnte nicht geladen werden:", e);
    }
}

// Automatisch beim Laden der Seite
document.addEventListener("DOMContentLoaded", () => {
    loadPreview("sommerlager2024", "sommerlager2024-preview");
    loadPreview("pfingstcamp2023", "pfingstcamp2023-preview");
    // Weitere Aktionen hier hinzufügen
});

