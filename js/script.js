/* script.js — Optimierte Version für Tim */

const cloudName = "db4arm1o7"; 

let galleryImages = [];    
let originalImages = [];   
let currentIndex = 0;

const modalOverlay = document.getElementById('downloadModal');
const startDownloadBtn = document.getElementById('startDownloadBtn');
let downloadAction = null; 

async function loadGallery() {
    const gallery = document.getElementById("gallery");
    if (!gallery) return;

    const tag = document.body.getAttribute("data-action");
    if (!tag) return;

    // Wir rufen die Liste ab
    const listUrl = `https://res.cloudinary.com/${cloudName}/image/list/${tag}.json`;

    try {
        const response = await fetch(listUrl);
        const data = await response.json();
        
        // SORTIERUNG: Cloudinary liefert oft unsortiert. Wir sortieren nach public_id (Dateiname)
        const files = data.resources.sort((a, b) => a.public_id.localeCompare(b.public_id));

        gallery.innerHTML = "";
        galleryImages = [];
        originalImages = [];

        files.forEach((file, idx) => {
            // Vorschau-Bild (w_400)
            const thumbUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_400,c_scale,f_auto,q_auto/v${file.version}/${file.public_id}.${file.format}`;
            
            // LIGHTBOX-URL: Hier nehmen wir eine größere Auflösung (z.B. 1600px) statt dem Thumbnail!
            const lightboxUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_1600,c_limit,f_auto,q_auto/v${file.version}/${file.public_id}.${file.format}`;
            
            // Original für Download & ZIP
            const originalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/v${file.version}/${file.public_id}.${file.format}`;

            galleryImages.push(lightboxUrl); 
            originalImages.push(originalUrl);

            const card = document.createElement("div");
            card.className = "gallery-item";

            const img = document.createElement("img");
            img.src = thumbUrl;
            img.dataset.index = idx;
            img.loading = "lazy";
            img.onclick = () => openLightbox(idx); // Direkter Aufruf für bessere Stabilität

            const checkboxContainer = document.createElement("div");
            checkboxContainer.className = "checkbox-container";
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "img-checkbox"; // Klasse für einfacheres Finden
            checkbox.value = originalUrl;
            
            const label = document.createElement("label");
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(" Bild auswählen"));
            checkboxContainer.appendChild(label);

            const downloadLink = document.createElement("a");
            downloadLink.href = "#";
            // DATEINAME FIX: Wir nehmen nur den letzten Teil nach dem Schrägstrich
            const cleanFileName = file.public_id.split('/').pop() + "." + file.format;
            downloadLink.textContent = "Download";
            downloadLink.className = "download-btn";
            downloadLink.onclick = (e) => {
                e.preventDefault();
                showDownloadPrompt(() => triggerSingleDownload(originalUrl, cleanFileName));
            };

            card.appendChild(img);
            card.appendChild(checkboxContainer);
            card.appendChild(downloadLink);
            gallery.appendChild(card);
        });

        console.log("Galerie geladen und sortiert.");
    } catch (err) {
        console.error("Fehler:", err);
    }
}

// FIX: ZIP-DOWNLOAD (JSZip muss im HTML eingebunden sein!)
async function triggerZipDownload() {
    const checkboxes = document.querySelectorAll(".img-checkbox:checked");
    if (checkboxes.length === 0) return;

    const zip = new JSZip();
    const folderZip = zip.folder("Ranger_Bilder");

    for (let box of checkboxes) {
        const url = box.value;
        const filename = url.split('/').pop();
        try {
            const resp = await fetch(url);
            const blob = await resp.blob();
            folderZip.file(filename, blob);
        } catch (e) { console.error("Download-Fehler für ZIP:", e); }
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "ranger_auswahl.zip"); // Nutzt FileSaver.js falls vorhanden, sonst Fallback:
}

async function triggerSingleDownload(url, filename) {
    const resp = await fetch(url);
    const blob = await resp.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// LIGHTBOX FIX
function openLightbox(index) {
    currentIndex = index;
    const lb = document.getElementById("lightbox");
    const lbImg = document.getElementById("lightbox-img");
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

// ALLE AUSWÄHLEN FIX
function toggleAllCheckboxes() {
    const checkboxes = document.querySelectorAll(".img-checkbox");
    const btn = document.getElementById('toggleAllBtn');
    // Wir prüfen den IST-Zustand anhand der ersten Box
    const shouldCheck = !checkboxes[0].checked;
    
    checkboxes.forEach(cb => cb.checked = shouldCheck);
    btn.textContent = shouldCheck ? "Alle abwählen" : "Alle auswählen";
}

// INITIALISIERUNG
document.addEventListener("DOMContentLoaded", () => {
    loadGallery();

    // Buttons verknüpfen
    document.getElementById("toggleAllBtn")?.addEventListener("click", toggleAllCheckboxes);
    document.getElementById("zipDownloadBtn")?.addEventListener("click", () => {
        const checked = document.querySelectorAll(".img-checkbox:checked");
        if (checked.length > 0) showDownloadPrompt(triggerZipDownload);
    });

    // Lightbox Pfeile fixen
    document.querySelector(".lightbox-next")?.addEventListener("click", (e) => { e.stopPropagation(); showNext(); });
    document.querySelector(".lightbox-prev")?.addEventListener("click", (e) => { e.stopPropagation(); showPrev(); });
    document.querySelector(".lightbox-close")?.addEventListener("click", closeLightbox);
});

function showDownloadPrompt(action) {
    modalOverlay.classList.remove('hidden');
    // Wir überschreiben den Button-Klick jedes Mal neu
    startDownloadBtn.onclick = () => {
        modalOverlay.classList.add('hidden');
        action();
    };
}
