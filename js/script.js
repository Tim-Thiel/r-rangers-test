// Aktionsname aus dem Dateinamen der aktuellen HTML-Seite holen
const actionName = window.location.pathname
    .split("/")
    .pop()
    .replace(".html", "");

// Bilderordner automatisch aus dem Aktionsnamen bauen
const folder = `bilder/${actionName}`;


const username = "tim-thiel";
const repo = "r-rangers";
const folder = "bilder/sommerlager2024";

let images = [];          // speichert ALLE Bild-URLs
let currentIndex = 0;     // für die Lightbox

async function loadGallery() {
    const url = `https://api.github.com/repos/${username}/${repo}/contents/${folder}`;
    const response = await fetch(url);
    const files = await response.json();

    if (!Array.isArray(files)) {
        console.error("API hat kein Array zurückgegeben:", files);
        return;
    }

    const gallery = document.getElementById("gallery");

    images = files.filter(f => f.type === "file").map(f => f.download_url);

    files.forEach((file, index) => {
        if (file.type === "file") {

            const card = document.createElement("div");
            card.className = "gallery-item";

            const img = document.createElement("img");
            img.src = file.download_url;
            img.dataset.index = index;

            // → Lightbox beim Klick öffnen
            img.addEventListener("click", () => openLightbox(index));

            // Checkbox
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
    link.download = `${actionName}.zip`;
    link.click();
}



// ------------------------------------------------------------
// LIGHTBOX FUNKTIONEN
// ------------------------------------------------------------

function openLightbox(index) {
    currentIndex = index;
    document.getElementById("lightbox-img").src = images[index];
    document.getElementById("lightbox").classList.remove("hidden");
}

function closeLightbox() {
    document.getElementById("lightbox").classList.add("hidden");
}

function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    document.getElementById("lightbox-img").src = images[currentIndex];
}

function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    document.getElementById("lightbox-img").src = images[currentIndex];
}



// ------------------------------------------------------------
// EVENT-LISTENER ERST SETZEN, WENN DOM GELADEN IST
// ------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    const closeBtn = document.querySelector(".lightbox-close");
    const nextBtn = document.querySelector(".lightbox-next");
    const prevBtn = document.querySelector(".lightbox-prev");

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    if (nextBtn) nextBtn.addEventListener("click", showNext);
    if (prevBtn) prevBtn.addEventListener("click", showPrev);

    // ESC + Pfeiltasten
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowRight") showNext();
        if (e.key === "ArrowLeft") showPrev();
    });
});
