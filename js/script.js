/* script.js — Finaler Fix für Tim */

const cloudName = "db4arm1o7"; 
let galleryImages = [];    
let originalImages = [];   
let currentIndex = 0;

// Diese Variablen definieren wir hier, weisen sie aber erst in DOMContentLoaded zu
let modalOverlay;
let startDownloadBtn;

// === GLOBALE FUNKTIONEN (Für HTML onclick verfügbar) ===

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
        alert("Bitte wähle zuerst Bilder aus!");
        return;
    }
    showDownloadPrompt(triggerZipDownload);
};

window.closeDownloadModal = function() {
    if (modalOverlay) modalOverlay.classList.add('hidden');
};

window.openLightbox = function(idx) {
    currentIndex = idx;
    const lbImg = document.getElementById("lightbox-img");
    if (lbImg) lbImg.src = galleryImages[currentIndex];
    const lb = document.getElementById("lightbox");
    if (lb) lb.classList.remove("hidden");
};

// === INTERNE FUNKTIONEN ===

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
                <a href="#" class="download-btn-single">Download</a>
            `;

            card.querySelector(".download-btn-single").addEventListener("click", (e) => {
                e.preventDefault();
                showDownloadPrompt(() => triggerSingleDownload(originalUrl, cleanName));
            });

            gallery.appendChild(card);
        });
    } catch (err) { console.error("Fehler beim Laden:", err); }
}

async function triggerSingleDownload(url, filename) {
    const resp = await fetch(url);
    const blob = await resp.blob();
    saveAs(blob, filename);
}

async function triggerZipDownload() {
    const checked = document.querySelectorAll(".img-checkbox:checked");
    const zip = new JSZip();
    const folder = zip.folder("Ranger_Bilder");

    for (let box of checked) {
        const resp = await fetch(box.value);
        const blob = await resp.blob();
        folder.file(box.value.split('/').pop(), blob);
    }

    const content = await zip.generateAsync({type: "blob"});
    saveAs(content, "ranger_auswahl.zip");
}

function showDownloadPrompt(action) {
    if (!modalOverlay) { action(); return; }
    modalOverlay.classList.remove('hidden');
    startDownloadBtn.onclick = () => {
        modalOverlay.classList.add('hidden');
        action();
    };
}

// === INITIALISIERUNG ===

document.addEventListener("DOMContentLoaded", () => {
    // Jetzt erst die DOM-Elemente holen
    modalOverlay = document.getElementById('downloadModal');
    startDownloadBtn = document.getElementById('startDownloadBtn');

    loadGallery();
    
    document.querySelector(".lightbox-next")?.addEventListener("click", (e) => { 
        e.stopPropagation(); 
        currentIndex = (currentIndex + 1) % galleryImages.length;
        document.getElementById("lightbox-img").src = galleryImages[currentIndex];
    });

    document.querySelector(".lightbox-prev")?.addEventListener("click", (e) => { 
        e.stopPropagation(); 
        currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        document.getElementById("lightbox-img").src = galleryImages[currentIndex];
    });

    document.querySelector(".lightbox-close")?.addEventListener("click", () => {
        document.getElementById("lightbox").classList.add("hidden");
    });
    
    document.addEventListener("keydown", (e) => {
        const lb = document.getElementById("lightbox");
        if (lb && !lb.classList.contains("hidden")) {
            if (e.key === "ArrowRight") {
                currentIndex = (currentIndex + 1) % galleryImages.length;
                document.getElementById("lightbox-img").src = galleryImages[currentIndex];
            }
            if (e.key === "ArrowLeft") {
                currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
                document.getElementById("lightbox-img").src = galleryImages[currentIndex];
            }
            if (e.key === "Escape") document.getElementById("lightbox").classList.add("hidden");
        }
    });
});
