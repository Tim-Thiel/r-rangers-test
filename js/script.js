/* script.js — automatische Galerie + Lightbox + ZIP-Download */

// === CONFIG (nicht ändern) ===
const username = "tim-thiel";
const repo = "r-rangers";

// === Pfade erkennen ===
const pageName = window.location.pathname.split("/").pop().replace(".html", "");
const pathParts = window.location.pathname.split("/");

let category = ""; // aktionen / team / privat
if (pathParts.includes("aktionen")) category = "aktionen";
if (pathParts.includes("team")) category = "team";
if (pathParts.includes("privat")) category = "privat";

// Pfad zu den Thumbs im Repo
const folder = `bilder/${category}/${pageName}/thumbs`;
console.log("📁 Lade Ordner:", folder);

// ================= Globale Variablen =================
let galleryImages = [];   // Thumbs für Galerie & Lightbox
let originalImages = [];  // Originale für ZIP
let currentIndex = 0;

// ================= Hilfsfunktionen =================
function logError(msg, obj) {
    console.error("GalleryError:", msg, obj ?? "");
}

// ================= Galerie laden =================
async function loadGallery() {
    const gallery = document.getElementById("gallery");
    if (!gallery) { logError("Kein Element mit id='gallery'"); return; }

    let response;
    try { response = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${folder}`); } 
    catch(e) { logError("Fetch fehlgeschlagen", e); return; }

    if (!response.ok) { logError(`API-Antwort nicht OK (${response.status})`, await response.text()); return; }

    let files;
    try { files = await response.json(); } 
    catch(e) { logError("JSON parsing failed", e); return; }

    const fileEntries = files.filter(f => f.type === "file");
    if (fileEntries.length === 0) { gallery.innerHTML = "<p>Keine Bilder gefunden.</p>"; return; }

    gallery.innerHTML = "";
    galleryImages = [];
    originalImages = [];

    fileEntries.forEach((file, idx) => {
        const thumbUrl = file.download_url;
        const originalUrl = thumbUrl.replace('/thumbs/', '/original/');

        // Arrays befüllen
        galleryImages.push(thumbUrl);   // Thumbs für Galerie & Lightbox
        originalImages.push(originalUrl); // Originale für ZIP

        // Karte erstellen
        const card = document.createElement("div");
        card.className = "gallery-item";

        // Bild
        const img = document.createElement("img");
        img.src = thumbUrl;
        img.alt = file.name;
        img.dataset.index = idx;
        img.loading = "lazy";

        img.addEventListener("click", () => openLightbox(idx));

        // Checkbox für ZIP
        const checkboxContainer = document.createElement("div");
        checkboxContainer.className = "checkbox-container";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = originalUrl; // Original für ZIP

        const label = document.createElement("label");
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" Bild auswählen"));
        checkboxContainer.appendChild(label);

        // Einzel-Download
        const downloadLink = document.createElement("a");
        downloadLink.href = originalUrl;
        downloadLink.download = file.name;
        downloadLink.textContent = "Download";
        downloadLink.className = "download-btn";

        downloadLink.addEventListener("click", async (e) => {
            e.preventDefault();
            alert("⚠️ Hinweis:\nDiese Bilder dürfen ausschließlich privat genutzt und nicht öffentlich geteilt werden.");

            try {
                const resp = await fetch(originalUrl);
                const blob = await resp.blob();
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = file.name;
                a.click();
            } catch (err) {
                console.error("Download fehlgeschlagen", err);
                alert("Download fehlgeschlagen.");
            }
        });

        card.appendChild(img);
        card.appendChild(checkboxContainer);
        card.appendChild(downloadLink);
        gallery.appendChild(card);
    });

    setupLightboxControls();
}

// ================= ZIP-Download =================
async function downloadSelected() {
    const checkboxes = document.querySelectorAll("input[type=checkbox]:checked");
    if (checkboxes.length === 0) { alert("Bitte wähle mindestens ein Bild aus."); return; }

    const zip = new JSZip();
    const folderZip = zip.folder(pageName);

    for (let box of checkboxes) {
        const url = box.value;
        const filename = url.split("/").pop();
        try {
            const resp = await fetch(url);
            const blob = await resp.blob();
            folderZip.file(filename, blob);
        } catch (e) { logError("Fehler beim Laden für ZIP", e); }
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `${pageName}.zip`;
    link.click();
}

// ================= Lightbox =================
function openLightbox(index) {
    currentIndex = index;
    const lb = document.getElementById("lightbox");
    const lbImg = document.getElementById("lightbox-img");
    if (!lb || !lbImg) return;
    lbImg.src = galleryImages[currentIndex]; // Thumbs anzeigen
    lb.classList.remove("hidden");
}

function closeLightbox() {
    const lb = document.getElementById("lightbox");
    if (!lb) return;
    lb.classList.add("hidden");
}

function showNext() {
    currentIndex = (currentIndex + 1) % galleryImages.length;
    document.getElementById("lightbox-img").src = galleryImages[currentIndex];
}

function showPrev() {
    currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
    document.getElementById("lightbox-img").src = galleryImages[currentIndex];
}

function setupLightboxControls() {
    const lb = document.getElementById("lightbox");
    const closeBtn = document.querySelector(".lightbox-close");
    const nextBtn = document.querySelector(".lightbox-next");
    const prevBtn = document.querySelector(".lightbox-prev");

    if (closeBtn && !closeBtn.dataset.listener) { closeBtn.addEventListener("click", closeLightbox); closeBtn.dataset.listener="1"; }
    if (nextBtn && !nextBtn.dataset.listener) { nextBtn.addEventListener("click", showNext); nextBtn.dataset.listener="1"; }
    if (prevBtn && !prevBtn.dataset.listener) { prevBtn.addEventListener("click", showPrev); prevBtn.dataset.listener="1"; }

    if (lb && !lb.dataset.bgListener) { lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); }); lb.dataset.bgListener="1"; }

    if (!document.body.dataset.kbListener) {
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") showNext();
            if (e.key === "ArrowLeft") showPrev();
        });
        document.body.dataset.kbListener="1";
    }
}

// ================= Init =================
document.addEventListener("DOMContentLoaded", () => {
    loadGallery();
});
