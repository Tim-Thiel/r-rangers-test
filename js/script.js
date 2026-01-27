/* script.js — Cloudinary Galerie + Lightbox + ZIP-Download */

// === CONFIG ===
const cloudName = "db4arm1o7"; 

// ================= Globale Variablen =================
let galleryImages = [];    // URLs für die Lightbox
let originalImages = [];   // URLs für den ZIP-Download
let currentIndex = 0;

// === Modal-Elemente ===
const modalOverlay = document.getElementById('downloadModal');
const startDownloadBtn = document.getElementById('startDownloadBtn');
let downloadAction = null; 

// ================= Galerie laden =================
async function loadGallery() {
    const gallery = document.getElementById("gallery");
    if (!gallery) {
        console.error("Fehler: Element mit ID 'gallery' nicht im HTML gefunden.");
        return;
    }

    // Liest den Tag aus deinem <body data-action="...">
    const tag = document.body.getAttribute("data-action");
    if (!tag) {
        console.error("Fehler: Attribut 'data-action' im <body> fehlt.");
        return;
    }

    console.log("Starte Cloudinary-Abfrage für Tag:", tag);

    const listUrl = `https://res.cloudinary.com/${cloudName}/image/list/${tag}.json`;

    try {
        const response = await fetch(listUrl);
        if (!response.ok) {
            throw new Error(`Cloudinary API Fehler: ${response.status}`);
        }

        const data = await response.json();
        const files = data.resources;

        if (!files || files.length === 0) {
            gallery.innerHTML = "<p>Keine Bilder für diesen Tag gefunden.</p>";
            return;
        }

        gallery.innerHTML = "";
        galleryImages = [];
        originalImages = [];

        files.forEach((file, idx) => {
            // Thumbnails (optimiert auf 400px Breite)
            const thumbUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_400,c_scale,f_auto,q_auto/v${file.version}/${file.public_id}.${file.format}`;
            
            // Original-URL mit Download-Befehl (fl_attachment)
            const originalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/fl_attachment/v${file.version}/${file.public_id}.${file.format}`;

            galleryImages.push(thumbUrl);
            originalImages.push(originalUrl);

            // Karte erstellen
            const card = document.createElement("div");
            card.className = "gallery-item";

            // Bild-Element
            const img = document.createElement("img");
            img.src = thumbUrl;
            img.alt = file.public_id;
            img.dataset.index = idx;
            img.loading = "lazy";
            img.addEventListener("click", () => openLightbox(idx));

            // Checkbox Container
            const checkboxContainer = document.createElement("div");
            checkboxContainer.className = "checkbox-container";
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = originalUrl;
            const label = document.createElement("label");
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(" Bild auswählen"));
            checkboxContainer.appendChild(label);

            // Einzel-Download Button
            const downloadLink = document.createElement("a");
            downloadLink.href = originalUrl;
            const fileName = file.public_id.split('/').pop() + "." + file.format;
            downloadLink.textContent = "Download";
            downloadLink.className = "download-btn";
            downloadLink.addEventListener("click", (e) => {
                e.preventDefault();
                showDownloadPrompt(() => triggerSingleDownload(originalUrl, fileName));
            });

            card.appendChild(img);
            card.appendChild(checkboxContainer);
            card.appendChild(downloadLink);
            gallery.appendChild(card);
        });

        setupLightboxControls();
        console.log(`${files.length} Bilder erfolgreich geladen.`);

    } catch (err) {
        console.error("Fehler beim Laden der Galerie:", err);
        gallery.innerHTML = "<p>Fehler beim Laden der Bilder. Details in der Konsole.</p>";
    }
}

// ================= Hilfsfunktionen Downloads =================
async function triggerSingleDownload(url, filename) {
    try {
        const resp = await fetch(url);
        const blob = await resp.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
    } catch (err) {
        console.error("Download fehlgeschlagen", err);
    }
}

async function triggerZipDownload() {
    const checkboxes = document.querySelectorAll("input[type=checkbox]:checked");
    if (checkboxes.length === 0) return;

    const zip = new JSZip();
    const folderZip = zip.folder("bilder_download");

    for (let box of checkboxes) {
        const url = box.value;
        const filename = url.split("/").pop().split('?')[0]; 
        try {
            const resp = await fetch(url);
            const blob = await resp.blob();
            folderZip.file(filename, blob);
        } catch (e) { console.error("ZIP Error:", e); }
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "bilder_auswahl.zip";
    link.click();
}

// ================= Lightbox Steuerung =================
function openLightbox(index) {
    currentIndex = index;
    const lb = document.getElementById("lightbox");
    const lbImg = document.getElementById("lightbox-img");
    if (!lb || !lbImg) return;
    lbImg.src = galleryImages[currentIndex];
    lb.classList.remove("hidden");
}

function closeLightbox() {
    document.getElementById("lightbox").classList.add("hidden");
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
    if (!lb) return;
    
    // Tastatur-Steuerung (nur einmal registrieren)
    if (!window.lightboxEventsSet) {
        document.addEventListener("keydown", (e) => {
            if (lb.classList.contains("hidden")) return;
            if (e.key === "ArrowRight") showNext();
            if (e.key === "ArrowLeft") showPrev();
            if (e.key === "Escape") closeLightbox();
        });
        window.lightboxEventsSet = true;
    }
}

// ================= Modal / UI =================
function showDownloadPrompt(action) {
    if (!modalOverlay) { action(); return; }
    modalOverlay.classList.remove('hidden');
    downloadAction = () => {
        modalOverlay.classList.add('hidden');
        action();
        startDownloadBtn.removeEventListener('click', downloadAction);
    };
    startDownloadBtn.addEventListener('click', downloadAction);
}

function toggleAllCheckboxes() {
    const checkboxes = document.querySelectorAll("input[type=checkbox]");
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    checkboxes.forEach(cb => cb.checked = !allChecked);
    document.getElementById('toggleAllBtn').textContent = allChecked ? "Alle auswählen" : "Alle abwählen";
}

// ================= Initialisierung =================
document.addEventListener("DOMContentLoaded", () => {
    loadGallery();

    // Event Listener für Buttons
    const zipBtn = document.getElementById("zipDownloadBtn");
    if (zipBtn) zipBtn.addEventListener("click", () => {
        const checked = document.querySelectorAll("input[type=checkbox]:checked");
        if (checked.length > 0) showDownloadPrompt(triggerZipDownload);
    });

    const toggleBtn = document.getElementById("toggleAllBtn");
    if (toggleBtn) toggleBtn.addEventListener("click", toggleAllCheckboxes);

    const closeLbBtn = document.querySelector(".lightbox-close");
    if (closeLbBtn) closeLbBtn.addEventListener("click", closeLightbox);
});
