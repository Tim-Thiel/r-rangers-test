const username = "Tim_Thiel";   // hier dein GitHub-Benutzername eintragen
const repo = "r-rangers";       // hier dein Repository-Name eintragen
const folder = "bilder/sommerlager2024";  // Pfad zum Bilderordner im Repo

async function loadGallery() {
    const url = `https://api.github.com/repos/${username}/${repo}/contents/${folder}`;
    const response = await fetch(url);
    const files = await response.json();

    const gallery = document.getElementById("gallery");

    files.forEach(file => {
        if (file.type === "file") {
            const div = document.createElement("div");
            div.className = "item";

            const img = document.createElement("img");
            img.src = file.download_url;

            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = file.download_url;
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(" auswählen"));

            const downloadLink = document.createElement("a");
            downloadLink.href = file.download_url;
            downloadLink.download = "";
            downloadLink.textContent = "Download";
            downloadLink.className = "download-btn";

            div.appendChild(img);
            div.appendChild(document.createElement("br"));
            div.appendChild(label);
            div.appendChild(document.createElement("br"));
            div.appendChild(downloadLink);

            gallery.appendChild(div);
        }
    });
}

// Galerie beim Laden der Seite automatisch erstellen
loadGallery();

// Funktion zum Herunterladen ausgewählter Bilder
async function downloadSelected() {
    const checkboxes = document.querySelectorAll("input[type=checkbox]:checked");

    if (checkboxes.length === 0) {
        alert("Bitte wähle mindestens ein Bild aus.");
        return;
    }

    const zip = new JSZip();
    const folderZip = zip.folder("ausgewählte_bilder");

    for (let box of checkboxes) {
        const url = box.value;
        const filename = url.split("/").pop();
        const response = await fetch(url);
        const blob = await response.blob();
        folderZip.file(filename, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "bilder.zip";
    link.click();
}
