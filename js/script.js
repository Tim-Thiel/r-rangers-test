const username = "tim-thiel";   
const repo = "r-rangers";       
const folder = "bilder/sommerlager2024";  

async function loadGallery() {
    const url = `https://api.github.com/repos/${username}/${repo}/contents/${folder}`;
    const response = await fetch(url);
    const files = await response.json();

    if (!Array.isArray(files)) {
        console.error("API hat kein Array zurückgegeben:", files);
        return;
    }

    const gallery = document.getElementById("gallery");

    files.forEach(file => {
        if (file.type === "file") {

            const card = document.createElement("div");
            card.className = "gallery-item";

            const img = document.createElement("img");
            img.src = file.download_url;

            // Checkbox + Text
            const checkboxContainer = document.createElement("div");
            checkboxContainer.className = "checkbox-container";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = file.download_url;

            const label = document.createElement("label");
            label.textContent = "Bild auswählen";

            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(label);

            // Download-Button
            const downloadLink = document.createElement("a");
            downloadLink.href = file.download_url;
            downloadLink.download = "";
            downloadLink.textContent = "Download";
            downloadLink.className = "download-btn";

            // Aufbau der Karte
            card.appendChild(img);
            card.appendChild(checkboxContainer);
            card.appendChild(downloadLink);

            gallery.appendChild(card);
        }
    });
}

loadGallery();

// ZIP-Download
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
