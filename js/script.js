/* script.js — Finale Version für Tim */

const cloudName = "db4arm1o7"; 
let galleryImages = [];    
let originalImages = [];   
let currentIndex = 0;

// Elemente aus deinem HTML
const modalOverlay = document.getElementById('downloadModal');
const startDownloadBtn = document.getElementById('startDownloadBtn');

async function loadGallery() {
    const gallery = document.getElementById("gallery");
    const tag = document.body.getAttribute("data-action");
    if (!gallery || !tag) return;

    const listUrl = `https://res.cloudinary.com/${cloudName}/image/list/${tag}.json`;

    try {
        const response = await fetch(listUrl);
        const data = await response.json();
        // Sortierung nach Dateiname
        const files = data.resources.sort((a, b) => a.public_id.localeCompare(b.public_id));

        gallery.innerHTML = "";
        galleryImages = [];
        originalImages = [];

        files.forEach((file, idx) => {
            const thumbUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_400,c_scale,f_auto,q_auto:eco/v${file.version}/${file.public_id}.${file.format}`;
            const lightboxUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_1600,c_limit,f_auto,q_auto:eco/v${file.version}/${file.public_id}.${file.format}`;
            const originalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/v${file.version}/${file.public_id}.${file.format}`;

            galleryImages.push(lightboxUrl); 
            originalImages.push(originalUrl);

            const cleanName = file.public_id.split('/').pop() + "." + file.format;

            const card = document.createElement("div");
            card.className = "gallery-item";
            card.innerHTML = `
                <img src="${thumbUrl}" alt="${cleanName}" onclick="openLightbox(${idx})" loading="lazy">
                <div class="checkbox-container">
                    <label><input type="checkbox" class="img-checkbox" value="${originalUrl}"> Bild auswählen</label>
                </div>
                <a href="#" class="download-btn">Download</a>
            `;

            card.querySelector(".download-btn").addEventListener("click", (e) => {
                e.preventDefault();
                showDownloadPrompt(() => triggerSingleDownload(originalUrl, cleanName));
            });

            gallery.appendChild(card);
        });
    } catch (err) { console.error("Fehler beim Laden:", err); }
}

// === BUTTON-FUNKTIONEN AUS DEINEM HTML ===

// Wird von deinem Button "Alle auswählen" aufgerufen
function toggleAllCheckboxes() {
    const boxes = document.querySelectorAll(".img-checkbox");
    if (boxes.length === 0) return;
    
    // Prüfen, ob gerade alle ausgewählt sind
    const allChecked = Array.from(boxes).every(cb => cb.checked);
    
    // Wenn alle voll sind -> alle leeren. Sonst -> alle füllen.
    boxes.forEach(cb => cb.checked = !allChecked);
    
    // Button-Text anpassen
    const btn = document.getElementById('toggleAllBtn');
    if (btn) btn.textContent = allChecked ? "Alle auswählen" : "Alle abwählen";
}

// Wird von deinem Button "Ausgewählte Bilder herunterladen" aufgerufen
function downloadSelected() {
    const checked = document.querySelectorAll(".img-checkbox:checked");
    if (checked.length === 0) {
        alert("Bitte wähle zuerst mindestens ein Bild aus.");
        return;
    }
    // Zeigt dein Modal mit dem rechtlichen Hinweis
    showDownloadPrompt(triggerZipDownload);
}

// === DOWNLOAD LOGIK ===

async function triggerSingleDownload(url, filename) {
    const resp = await fetch(url);
    const blob = await resp.blob();
    if (window.saveAs) {
        window.saveAs(blob, filename);
    } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
    }
}

async function triggerZipDownload() {
    const checked = document.querySelectorAll(".img-checkbox:checked");
    const zip = new JSZip();
    const folder = zip.folder("Ranger_Bilder");

    // Lade-Anzeige (optionaler Hinweis in der Konsole)
    console.log("ZIP wird erstellt...");

    for (let box of checked) {
        const resp = await fetch(box.value);
        const blob = await resp.blob();
        const name = box.value.split('/').pop();
        folder.file(name, blob);
    }

    const content = await zip.generateAsync({type: "blob"});
    
    // Hier wird FileSaver.js (saveAs) benötigt!
    if (window.saveAs) {
        window.saveAs(content, "ranger_auswahl.zip");
    } else {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = "ranger_auswahl.zip";
        link.click();
    }
}

// === LIGHTBOX ===

function openLightbox(idx) {
    currentIndex = idx;
    const lbImg = document.getElementById("lightbox-img");
    lbImg.src = galleryImages[currentIndex];
    document.getElementById("lightbox").classList.remove("hidden");
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

// === MODAL ===

function showDownloadPrompt(action) {
    if (!modalOverlay) { action(); return; }
    modalOverlay.classList.remove('hidden');
    startDownloadBtn.onclick = () => {
        modalOverlay.classList.add('hidden');
        action();
    };
}

function closeDownloadModal() {
    if (modalOverlay) modalOverlay.classList.add('hidden');
}

// === START ===

document.addEventListener("DOMContentLoaded", () => {
    loadGallery();
    
    // Lightbox Events
    document.querySelector(".lightbox-next")?.addEventListener("click", (e) => { e.stopPropagation(); showNext(); });
    document.querySelector(".lightbox-prev")?.addEventListener("click", (e) => { e.stopPropagation(); showPrev(); });
    document.querySelector(".lightbox-close")?.addEventListener("click", closeLightbox);
    
    document.addEventListener("keydown", (e) => {
        const lb = document.getElementById("lightbox");
        if (lb && !lb.classList.contains("hidden")) {
            if (e.key === "ArrowRight") showNext();
            if (e.key === "ArrowLeft") showPrev();
            if (e.key === "Escape") closeLightbox();
        }
    });
});
