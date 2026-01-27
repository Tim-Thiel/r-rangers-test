/* script.js — Optimierte Ladezeiten & volle Kompatibilität */

const cloudName = "db4arm1o7"; 
let galleryImages = [];    
let originalImages = [];   
let currentIndex = 0;

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
        const files = data.resources.sort((a, b) => a.public_id.localeCompare(b.public_id));

        gallery.innerHTML = "";
        galleryImages = [];
        originalImages = [];

        files.forEach((file, idx) => {
            // Galerie-Vorschau: 400px breit, Auto-Format & Auto-Qualität
            const thumbUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_400,c_scale,f_auto,q_auto:eco/v${file.version}/${file.public_id}.${file.format}`;
            
            // LIGHTBOX OPTIMIERUNG: 1600px, aber mit 'q_auto:eco' für extrem schnelles Laden!
            // 'f_auto' wählt das beste Format (z.B. WebP), was die Datei massiv verkleinert.
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
    } catch (err) { console.error("Fehler:", err); }
}

// Diese Funktion heißt jetzt so wie in deinem HTML (downloadSelected)
async function downloadSelected() {
    const checked = document.querySelectorAll(".img-checkbox:checked");
    if (checked.length === 0) {
        alert("Bitte wähle zuerst Bilder aus!");
        return;
    }
    showDownloadPrompt(triggerZipDownload);
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

function showDownloadPrompt(action) {
    modalOverlay.classList.remove('hidden');
    startDownloadBtn.onclick = () => {
        modalOverlay.classList.add('hidden');
        action();
    };
}

function toggleAllCheckboxes() {
    const boxes = document.querySelectorAll(".img-checkbox");
    const allChecked = Array.from(boxes).every(cb => cb.checked);
    boxes.forEach(cb => cb.checked = !allChecked);
    document.getElementById('toggleAllBtn').textContent = allChecked ? "Alle auswählen" : "Alle abwählen";
}

document.addEventListener("DOMContentLoaded", () => {
    loadGallery();
    
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
