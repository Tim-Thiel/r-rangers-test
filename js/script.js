/* script.js — Fix für doppelte Texte & Modal-Steuerung */

const cloudName = "db4arm1o7"; 
let galleryImages = [];    
let originalImages = [];   
let currentIndex = 0;

let modalOverlay;
let startDownloadBtn;

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
        showModalContent(
            "Achtung!", 
            "<p>Bitte wähle zuerst mindestens ein Bild aus, das du herunterladen möchtest.</p>", 
            false
        );
        return;
    }
    showModalContent(
        "Wichtiger Download-Hinweis!", 
        "<p>⚠️ <strong>Nur für private Nutzung!</strong></p><p>Die Bilder dürfen <strong>nicht veröffentlicht</strong> oder an Dritte weitergegeben werden.</p><p>Bestätige die Einhaltung dieser Regelung mit 'Download starten'.</p>", 
        true, 
        triggerZipDownload
    );
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
                    <label><input type="checkbox" class="img-checkbox" value="${originalUrl}"> Bild auswählen</label>
                </div>
                <a href="#" class="dl-single">Download</a>
            `;

            card.querySelector(".dl-single").addEventListener("click", (e) => {
                e.preventDefault();
                showModalContent(
                    "Download-Bestätigung", 
                    "<p>Möchtest du dieses Bild für die private Nutzung herunterladen?</p>", 
                    true, 
                    () => triggerSingleDownload(originalUrl, cleanName)
                );
            });

            gallery.appendChild(card);
        });
    } catch (err) { console.error("Fehler:", err); }
}

function updateLightboxImage() {
    const lbImg = document.getElementById("lightbox-img");
    if (!lbImg) return;
    lbImg.style.opacity = "0.3"; // Zeigt, dass geladen wird
    lbImg.src = galleryImages[currentIndex];
    lbImg.onload = () => { lbImg.style.opacity = "1"; };
}

async function triggerSingleDownload(url, filename) {
    const resp = await fetch(url);
    const blob = await resp.blob();
    saveAs(blob, filename);
}

async function triggerZipDownload() {
    const checked = document.querySelectorAll(".img-checkbox:checked");
    const zip = new JSZip();
    for (let box of checked) {
        const resp = await fetch(box.value);
        const blob = await resp.blob();
        zip.file(box.value.split('/').pop(), blob);
    }
    const content = await zip.generateAsync({type: "blob"});
    saveAs(content, "ranger_auswahl.zip");
}

// === MODAL STEUERUNG (SAUBER) ===

function showModalContent(title, html, showButton, action = null) {
    if (!modalOverlay) return;
    
    // Wir setzen Titel und Body gezielt
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalBody").innerHTML = html;
    
    if (showButton) {
        startDownloadBtn.style.display = "inline-block";
        startDownloadBtn.onclick = () => {
            modalOverlay.classList.add('hidden');
            action();
        };
    } else {
        startDownloadBtn.style.display = "none";
    }
    
    modalOverlay.classList.remove('hidden');
}

// === INITIALISIERUNG ===

document.addEventListener("DOMContentLoaded", () => {
    modalOverlay = document.getElementById('downloadModal');
    startDownloadBtn = document.getElementById('startDownloadBtn');

    loadGallery();
    
    document.querySelector(".lightbox-next")?.addEventListener("click", (e) => { 
        e.stopPropagation(); 
        currentIndex = (currentIndex + 1) % galleryImages.length;
        updateLightboxImage();
    });

    document.querySelector(".lightbox-prev")?.addEventListener("click", (e) => { 
        e.stopPropagation(); 
        currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        updateLightboxImage();
    });

    document.querySelector(".lightbox-close")?.addEventListener("click", () => {
        document.getElementById("lightbox").classList.add("hidden");
    });
    
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            window.closeDownloadModal();
            document.getElementById("lightbox")?.classList.add("hidden");
        }
        const lb = document.getElementById("lightbox");
        if (lb && !lb.classList.contains("hidden")) {
            if (e.key === "ArrowRight") { currentIndex = (currentIndex + 1) % galleryImages.length; updateLightboxImage(); }
            if (e.key === "ArrowLeft") { currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length; updateLightboxImage(); }
        }
    });
});
