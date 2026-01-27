/* script.js — Alles Fix & Fertig */

const cloudName = "db4arm1o7"; 
let galleryImages = [];    
let originalImages = [];   
let currentIndex = 0;

let modalOverlay;
let startDownloadBtn;

// Einheitlicher Text-Baustein für das Modal
const downloadHinweisHTML = `
    <p>⚠️ <strong>Nur für private Nutzung!</strong></p>
    <p>Die Bilder dürfen <strong>nicht veröffentlicht</strong> oder <strong>an Dritte weitergegeben</strong> werden.</p>
    <p>Bestätige die Einhaltung dieser Regelung mit 'Download starten'.</p>
`;

// === GLOBALE FUNKTIONEN ===

window.toggleAllCheckboxes = function() {
    const boxes = document.querySelectorAll(".img-checkbox");
    if (boxes.length === 0) return;
    const allChecked = Array.from(boxes).every(cb => cb.checked);
    boxes.forEach(cb => cb.checked = !allChecked);
    const btn = document.getElementById('toggleAllBtn');
    if (btn) btn.textContent = allChecked ? "Alle auswählen" : "Alle abwählen";
};

window.downloadSelected = function() {
    const checked = document.querySelectorAll(".img-checkbox:checked");
    if (checked.length === 0) {
        showModalContent("Achtung!", "<p>Bitte wähle zuerst mindestens ein Bild aus.</p>", false);
        return;
    }
    showModalContent("Wichtiger Download-Hinweis!", downloadHinweisHTML, true, triggerZipDownload);
};

window.closeDownloadModal = function() {
    if (modalOverlay) modalOverlay.classList.add('hidden');
};

window.openLightbox = function(idx) {
    currentIndex = idx;
    const lb = document.getElementById("lightbox");
    if (lb) lb.classList.remove("hidden");
    updateLightboxImage();
};

// === INTERNE LOGIK ===

async function loadGallery() {
    const gallery = document.getElementById("gallery");
    const tag = document.body.getAttribute("data-action");
    if (!gallery || !tag) return;

    const listUrl = `https://res.cloudinary.com/${cloudName}/image/list/${tag}.json`;

    try {
        const response = await fetch(listUrl);
        const data = await response.json();
        const files = data.resources.sort((a, b) => a.public_id.localeCompare(b.public_id));

        gallery.innerHTML = "";
        galleryImages = [];
        originalImages = [];

        files.forEach((file, idx) => {
            const thumbUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_400,c_scale,f_auto,q_auto:eco/v${file.version}/${file.public_id}.${file.format}`;
            const lightboxUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_1600,c_limit,f_auto,q_auto:low/v${file.version}/${file.public_id}.${file.format}`;
            const originalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/v${file.version}/${file.public_id}.${file.format}`;

            galleryImages.push(lightboxUrl); 
            originalImages.push(originalUrl);

            const cleanName = file.public_id.split('/').pop() + "." + file.format;

            const card = document.createElement("div");
            card.className = "gallery-item";
            card.innerHTML = `
                <img src="${thumbUrl}" alt="${cleanName}" onclick="openLightbox(${idx})" loading="lazy">
                <div class="checkbox-container">
                    <label><input type="checkbox" class="img-checkbox" value="${originalUrl}"> Auswählen</label>
                </div>
                <a href="#" class="download-btn">Download</a>
            `;

            // Hier lag der Fehler: Das Event-Muss INNERHALB der Schleife an card gebunden werden
            card.querySelector(".download-btn").addEventListener("click", (e) => {
                e.preventDefault();
                showModalContent("Wichtiger Download-Hinweis!", downloadHinweisHTML, true, () => triggerSingleDownload(originalUrl, cleanName));
            });

            gallery.appendChild(card);
        });
    } catch (err) { console.error("Fehler beim Laden der Cloudinary-Liste:", err); }
}

function updateLightboxImage() {
    const lbImg = document.getElementById("lightbox-img");
    const lbContainer = document.getElementById("lightbox"); // Der Container für die Klasse
    if (!lbImg || !lbContainer) return;
    
    // 1. Spinner einschalten & Bild unsichtbar machen
    lbContainer.classList.add("loading");
    lbImg.style.opacity = "0"; 
    
    lbImg.src = galleryImages[currentIndex];
    
    lbImg.onload = () => { 
        // 2. Spinner ausschalten & Bild einblenden, wenn fertig geladen
        lbContainer.classList.remove("loading");
        lbImg.style.opacity = "1"; 
    };
}

async function triggerSingleDownload(url, filename) {
    const bodyElem = document.getElementById("modalBody");
    const startBtn = document.getElementById("startDownloadBtn");
    
    startBtn.style.display = "none";
    bodyElem.innerHTML = `<p>Bild wird vorbereitet...</p><span id="statusText">Lade Daten...</span>`;

    try {
        const resp = await fetch(url);
        const blob = await resp.blob();
        saveAs(blob, filename);
        
        document.getElementById("statusText").innerText = "Fertig!";
        setTimeout(() => closeDownloadModal(), 800);
    } catch (err) {
        bodyElem.innerHTML = "<p>Fehler beim Download.</p>";
    }
}

async function triggerZipDownload() {
    const checked = document.querySelectorAll(".img-checkbox:checked");
    const zip = new JSZip();
    const total = checked.length;
    
    const bodyElem = document.getElementById("modalBody");
    const startBtn = document.getElementById("startDownloadBtn");
    
    startBtn.style.display = "none";
    bodyElem.innerHTML = `
        <p>Bilder werden für den ZIP-Download vorbereitet...</p>
        <div class="progress-container" style="display: block;">
            <div id="pBar" class="progress-bar"></div>
        </div>
        <span id="statusText">0 von ${total} Bildern geladen</span>
    `;

    const pBar = document.getElementById("pBar");
    const sText = document.getElementById("statusText");
    
    let pageTitle = document.querySelector("h1") ? document.querySelector("h1").innerText : "Ranger_Bilder";
    let safeFileName = pageTitle.replace(/\s+/g, '_') + ".zip";

    let count = 0;
    for (let box of checked) {
        try {
            const resp = await fetch(box.value);
            const blob = await resp.blob();
            const fileName = box.value.split('/').pop().split('?')[0];
            zip.file(fileName, blob);
            
            count++;
            const percent = (count / total) * 100;
            pBar.style.width = percent + "%";
            sText.innerText = `${count} von ${total} Bildern geladen`;
        } catch (err) { console.error("Fehler bei Bild:", box.value); }
    }
    
    sText.innerText = "ZIP-Archiv wird erstellt...";
    const content = await zip.generateAsync({type: "blob"});
    saveAs(content, safeFileName);
    
    setTimeout(() => closeDownloadModal(), 1000);
}

function showModalContent(title, html, showButton, action = null) {
    if (!modalOverlay) return;
    const titleElem = document.getElementById("modalTitle") || modalOverlay.querySelector("h3");
    const bodyElem = document.getElementById("modalBody");
    
    if (titleElem) titleElem.textContent = title;
    if (bodyElem) bodyElem.innerHTML = html;
    
    if (showButton) {
        startDownloadBtn.style.display = "inline-block";
        startDownloadBtn.onclick = () => action(); // Führt die Download-Funktion aus
    } else {
        startDownloadBtn.style.display = "none";
    }
    modalOverlay.classList.remove('hidden');
}

document.addEventListener("DOMContentLoaded", () => {
    modalOverlay = document.getElementById('downloadModal');
    startDownloadBtn = document.getElementById('startDownloadBtn');
    loadGallery();
    
    // Lightbox-Events
    document.querySelector(".lightbox-next")?.addEventListener("click", (e) => { 
        e.stopPropagation(); currentIndex = (currentIndex + 1) % galleryImages.length; updateLightboxImage();
    });
    document.querySelector(".lightbox-prev")?.addEventListener("click", (e) => { 
        e.stopPropagation(); currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length; updateLightboxImage();
    });
    document.querySelector(".lightbox-close")?.addEventListener("click", () => {
        document.getElementById("lightbox").classList.add("hidden");
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { window.closeDownloadModal(); document.getElementById("lightbox")?.classList.add("hidden"); }
        const lb = document.getElementById("lightbox");
        if (lb && !lb.classList.contains("hidden")) {
            if (e.key === "ArrowRight") { currentIndex = (currentIndex + 1) % galleryImages.length; updateLightboxImage(); }
            if (e.key === "ArrowLeft") { currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length; updateLightboxImage(); }
        }
    });
});
