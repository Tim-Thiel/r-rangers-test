/* script.js — Vollständige Version für Tim */

// === CONFIG ===
const cloudName = "db4arm1o7"; 

// ================= Globale Variablen =================
let galleryImages = [];    // URLs für die Lightbox (groß)
let originalImages = [];   // URLs für den Download (Original)
let currentIndex = 0;

const modalOverlay = document.getElementById('downloadModal');
const startDownloadBtn = document.getElementById('startDownloadBtn');

// ================= Galerie laden =================
async function loadGallery() {
    const gallery = document.getElementById("gallery");
    const tag = document.body.getAttribute("data-action");
    
    if (!gallery || !tag) {
        console.error("Fehler: Galerie-Container oder data-action Attribut fehlt.");
        return;
    }

    const listUrl = `https://res.cloudinary.com/${cloudName}/image/list/${tag}.json`;

    try {
        const response = await fetch(listUrl);
        if (!response.ok) throw new Error("Cloudinary Liste konnte nicht geladen werden.");
        
        const data = await response.json();
        
        // SORTIERUNG: Damit DSC01120 vor DSC01121 kommt
        const files = data.resources.sort((a, b) => a.public_id.localeCompare(b.public_id));

        gallery.innerHTML = "";
        galleryImages = [];
        originalImages = [];

        files.forEach((file, idx) => {
            // 1. Thumbnail für die Übersicht (400px)
            const thumbUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_400,c_scale,f_auto,q_auto/v${file.version}/${file.public_id}.${file.format}`;
            
            // 2. Lightbox-Bild (1600px für scharfe Ansicht)
            const lightboxUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_1600,c_limit,f_auto,q_auto/v${file.version}/${file.public_id}.${file.format}`;
            
            // 3. Original für Download
            const originalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/v${file.version}/${file.public_id}.${file.format}`;

            galleryImages.push(lightboxUrl); 
            originalImages.push(originalUrl);

            // Dateiname ohne Pfad und ohne Suffix
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

            // Download-Event für den Button in der Karte
            card.querySelector(".download-btn").addEventListener("click", (e) => {
                e.preventDefault();
                showDownloadPrompt(() => triggerSingleDownload(originalUrl, cleanName));
            });

            gallery.appendChild(card);
        });

        console.log(`${files.length} Bilder geladen und sortiert.`);
    } catch (err) {
        console.error("Fehler beim Laden:", err);
        gallery.innerHTML = "<p>Galerie konnte nicht geladen werden.</p>";
    }
}

// ================= Downloads =================
async function triggerSingleDownload(url, filename) {
    try {
        const resp = await fetch(url);
        const blob = await resp.blob();
        saveAs(blob, filename); // Nutzt FileSaver.js
    } catch (e) { console.error("Download fehlgeschlagen", e); }
}

async function triggerZipDownload() {
    const checked = document.querySelectorAll(".img-checkbox:checked");
    if (checked.length === 0) return;
    
    const zip = new JSZip();
    const folder = zip.folder("Ranger_Bilder");

    for (let box of checked) {
        try {
            const resp = await fetch(box.value);
            const blob = await resp.blob();
            const name = box.value.split('/').pop();
            folder.file(name, blob);
        } catch (e) { console.error("Fehler bei ZIP-Datei:", e); }
    }

    const content = await zip.generateAsync({type: "blob"});
    saveAs(content, "ranger_auswahl.zip");
}

// ================= Lightbox Logik =================
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

// ================= Hilfsfunktionen UI =================
function showDownloadPrompt(action) {
    if (!modalOverlay) { action(); return; }
    modalOverlay.classList.remove('hidden');
    startDownloadBtn.onclick = () => {
        modalOverlay.classList.add('hidden');
        action();
    };
}

function toggleAllCheckboxes() {
    const boxes = document.querySelectorAll(".img-checkbox");
    if (boxes.length === 0) return;
    const allChecked = Array.from(boxes).every(cb => cb.checked);
    boxes.forEach(cb => cb.checked = !allChecked);
    document.getElementById('toggleAllBtn').textContent = allChecked ? "Alle auswählen" : "Alle abwählen";
}

// ================= Event Listener Start =================
document.addEventListener("DOMContentLoaded", () => {
    loadGallery();

    // Buttons
    document.getElementById("toggleAllBtn")?.addEventListener("click", toggleAllCheckboxes);
    document.getElementById("zipDownloadBtn")?.addEventListener("click", () => {
        const checked = document.querySelectorAll(".img-checkbox:checked");
        if (checked.length > 0) showDownloadPrompt(triggerZipDownload);
    });

    // Lightbox Steuerung
    document.querySelector(".lightbox-next")?.addEventListener("click", (e) => {
        e.stopPropagation();
        showNext();
    });
    document.querySelector(".lightbox-prev")?.addEventListener("click", (e) => {
        e.stopPropagation();
        showPrev();
    });
    document.querySelector(".lightbox-close")?.addEventListener("click", closeLightbox);

    // Tastatur-Steuerung
    document.addEventListener("keydown", (e) => {
        const lb = document.getElementById("lightbox");
        if (lb && !lb.classList.contains("hidden")) {
            if (e.key === "ArrowRight") showNext();
            if (e.key === "ArrowLeft") showPrev();
            if (e.key === "Escape") closeLightbox();
        }
    });
});
