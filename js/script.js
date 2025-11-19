/* script.js — komplette, automatische Galerie + Lightbox + ZIP-Download */

// === CONFIG ===
const username = "tim-thiel";
const repo = "r-rangers";

// === Automatische Erkennung ===
// z.B. /bereiche/aktionen/unlimited2025.html
const pathParts = window.location.pathname.split("/").filter(p => p); 
// pathParts z.B.: ["bereiche","aktionen","unlimited2025.html"]
const area = pathParts[1]; // "aktionen"
const actionName = pathParts[2].replace(".html",""); // "unlimited2025"

// Ordner in Repo
const folder = `bilder/${area}/${actionName}/thumbs`;

// Globale Variablen
let images = [];
let currentIndex = 0;

// Log Helper
function logError(msg,obj){console.error("GalleryError:",msg,obj??"");}

// === Galerie laden ===
async function loadGallery(){
    const gallery = document.getElementById("gallery");
    if(!gallery){logError("Kein Element mit id='gallery'"); return;}

    const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${folder}`;
    let response;
    try{ response = await fetch(apiUrl); } catch(e){ logError("Fetch fehlgeschlagen", e); return; }
    if(!response.ok){ logError(`API-Antwort nicht OK (${response.status})`, await response.text()); return; }

    let files;
    try{ files = await response.json(); } catch(e){ logError("JSON parsing failed",e); return; }

    const fileEntries = files.filter(f => f.type==="file");
    if(fileEntries.length===0){ gallery.innerHTML="<p>Keine Bilder gefunden.</p>"; return; }

    images = []; // clear previous

    gallery.innerHTML=""; // reset

    fileEntries.forEach((file,idx)=>{
        const card = document.createElement("div");
        card.className="gallery-item";

        const thumbUrl = file.download_url; // Thumb
        const originalUrl = thumbUrl.replace('/thumbs/', '/original/');

        const img = document.createElement("img");
        img.src = thumbUrl;
        img.alt = file.name;
        img.dataset.index = idx;
        img.loading="lazy";
        images.push(originalUrl);

        img.addEventListener("click",()=>openLightbox(idx));

        const checkboxContainer = document.createElement("div");
        checkboxContainer.className="checkbox-container";
        const checkbox = document.createElement("input");
        checkbox.type="checkbox";
        checkbox.value=originalUrl;

        const label = document.createElement("label");
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" Bild auswählen"));
        checkboxContainer.appendChild(label);

        const downloadLink = document.createElement("a");
        downloadLink.href = originalUrl;
        downloadLink.download = file.name;
        downloadLink.textContent="Download";
        downloadLink.className="download-btn";

        downloadLink.addEventListener("click", async (e)=>{
            e.preventDefault();
            try{
                const resp = await fetch(originalUrl);
                const blob = await resp.blob();
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = file.name;
                a.click();
            } catch(err){
                console.error("Download fehlgeschlagen",err);
            }
        });

        card.appendChild(img);
        card.appendChild(checkboxContainer);
        card.appendChild(downloadLink);
        gallery.appendChild(card);
    });

    setupLightboxControls();
}

// === ZIP Download ===
async function downloadSelected(){
    const checkboxes = document.querySelectorAll("input[type=checkbox]:checked");
    if(checkboxes.length===0){ alert("Bitte wähle mindestens ein Bild aus."); return; }

    const zip = new JSZip();
    const folderZip = zip.folder(actionName);

    for(let box of checkboxes){
        const url = box.value;
        const filename = url.split("/").pop();
        try{
            const resp = await fetch(url);
            const blob = await resp.blob();
            folderZip.file(filename,blob);
        } catch(e){ logError("Fehler beim Laden für ZIP",e);}
    }

    const content = await zip.generateAsync({type:"blob"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `${actionName}.zip`;
    link.click();
}

// === Lightbox ===
function openLightbox(index){ currentIndex=index; const lb=document.getElementById("lightbox"); const lbImg=document.getElementById("lightbox-img"); if(!lb||!lbImg)return; lbImg.src=images[currentIndex]; lb.classList.remove("hidden"); }
function closeLightbox(){ const lb=document.getElementById("lightbox"); if(!lb)return; lb.classList.add("hidden"); }
function showNext(){ currentIndex=(currentIndex+1)%images.length; document.getElementById("lightbox-img").src=images[currentIndex]; }
function showPrev(){ currentIndex=(currentIndex-1+images.length)%images.length; document.getElementById("lightbox-img").src=images[currentIndex]; }

function setupLightboxControls(){
    const closeBtn=document.querySelector(".lightbox-close");
    const nextBtn=document.querySelector(".lightbox-next");
    const prevBtn=document.querySelector(".lightbox-prev");
    const lb=document.getElementById("lightbox");

    if(closeBtn&&!closeBtn.dataset.listener){ closeBtn.addEventListener("click",closeLightbox); closeBtn.dataset.listener="1"; }
    if(nextBtn&&!nextBtn.dataset.listener){ nextBtn.addEventListener("click",showNext); nextBtn.dataset.listener="1"; }
    if(prevBtn&&!prevBtn.dataset.listener){ prevBtn.addEventListener("click",showPrev); prevBtn.dataset.listener="1"; }

    if(lb&&!lb.dataset.bgListener){ lb.addEventListener("click",(e)=>{ if(e.target===lb) closeLightbox(); }); lb.dataset.bgListener="1"; }

    if(!document.body.dataset.kbListener){ 
        document.addEventListener("keydown",(e)=>{
            if(e.key==="Escape") closeLightbox();
            if(e.key==="ArrowRight") showNext();
            if(e.key==="ArrowLeft") showPrev();
        });
        document.body.dataset.kbListener="1";
    }
}

// === Init ===
document.addEventListener("DOMContentLoaded", loadGallery);


const pathParts = window.location.pathname.split("/");

// Bereich ermitteln
let category = "";  // aktionen / team / privat

if (pathParts.includes("aktionen"))  category = "aktionen";
if (pathParts.includes("team"))      category = "team";
if (pathParts.includes("privat"))    category = "privat";

// 3. Finaler Pfad zu den Thumbs
// Beispiel: bilder/aktionen/unlimited2025/thumbs
const folder = `bilder/${category}/${pageName}/thumbs`;

console.log("📁 Lade Ordner:", folder);



// Globale Variablen
let images = [];       // Array mit Download-URLs
let currentIndex = 0;  // Lightbox-Index

// Hilfsfunktion: konsolen-log bei Fehlern schön
function logError(msg, obj) {
    console.error("GalleryError:", msg, obj ?? "");
}

// Lädt die Galerie aus GitHub-API
async function loadGallery() {
    const gallery = document.getElementById("gallery");
    if (!gallery) {
        logError("Kein Element mit id='gallery' gefunden.");
        return;
    }

    const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${folder}`;
    let response;
    try {
        response = await fetch(apiUrl);
    } catch (e) {
        logError("Fetch fehlgeschlagen", e);
        return;
    }

    if (!response.ok) {
        logError(`API-Antwort nicht OK (${response.status})`, await response.text());
        return;
    }

    let files;
    try {
        files = await response.json();
    } catch (e) {
        logError("JSON parsing failed", e);
        return;
    }

    if (!Array.isArray(files)) {
        logError("API hat kein Array zurückgegeben:", files);
        return;
    }

    // Filter nur Dateien, sortiere nach name (optional) — oder behalten Reihenfolge wie im Repo
    const fileEntries = files.filter(f => f.type === "file");

    // Wenn keine Bilder -> Hinweis
    if (fileEntries.length === 0) {
        gallery.innerHTML = "<p>Keine Bilder im Ordner gefunden.</p>";
        return;
    }

    // build images array (download_url) in same order
    images = fileEntries.map(f => f.download_url.replace('/original/', '/thumbs/'));


    // löschen was vorher da war
    gallery.innerHTML = "";

    // Erstelle die Karten
    fileEntries.forEach((file, idx) => {
    const card = document.createElement("div");
    card.className = "gallery-item";

    // file.download_url kommt aus /thumbs/ (weil folder auf thumbs zeigt)
    const thumbUrl = file.download_url; // Thumb-URL (aus API)
    const originalUrl = file.download_url.replace('/thumbs/', '/original/'); // Original ableiten

    // Bild (Thumb) in der Galerie
    const img = document.createElement("img");
    img.src = thumbUrl;  // Thumbnail anzeigen
    img.alt = file.name || `Bild ${idx+1}`;
    img.dataset.index = idx;
    img.loading = "lazy";

    // Für die Lightbox: wir wollen oft das Original zeigen -> images enthält Original-URLs
    images.push(originalUrl);

    // Klick öffnet Lightbox an der korrekten Position
    img.addEventListener("click", () => openLightbox(idx));

    // Checkboxcontainer (werte auf Original setzen)
    const checkboxContainer = document.createElement("div");
    checkboxContainer.className = "checkbox-container";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = originalUrl; // Original für ZIP-Download

    const label = document.createElement("label");
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" Bild auswählen"));

    checkboxContainer.appendChild(label);

    // Download button (einzeln) -> Original herunterladen
    const downloadLink = document.createElement("a");
    downloadLink.href = originalUrl;   // Original-URL
    downloadLink.download = file.name; // Name für Dateidownload
    downloadLink.textContent = "Download";
    downloadLink.className = "download-btn";

    downloadLink.addEventListener("click", async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(originalUrl);
            const blob = await response.blob();
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = file.name;
            a.click();
        } catch (err) {
            console.error("Fehler beim Herunterladen der Originaldatei:", err);
            alert("Download fehlgeschlagen.");
        }
    });

    // Baue Karte zusammen
    card.appendChild(img);
    card.appendChild(checkboxContainer);
    card.appendChild(downloadLink);

    gallery.appendChild(card);
});


    // Stelle sicher, dass Lightbox-Listener gesetzt sind (falls Lightbox HTML schon da ist)
    setupLightboxControls();
}

// ZIP-Download: alle ausgewählten Bilder, ZIP heißt actionName.zip
async function downloadSelected() {
    const checkboxes = document.querySelectorAll("input[type=checkbox]:checked");
    if (checkboxes.length === 0) {
        alert("Bitte wähle mindestens ein Bild aus.");
        return;
    }

    const zip = new JSZip();
    const folderZip = zip.folder(actionName);

    for (let box of checkboxes) {
        const url = box.value;
        const filename = url.split("/").pop();
        try {
            const resp = await fetch(url);
            const blob = await resp.blob();
            folderZip.file(filename, blob);
        } catch (e) {
            logError("Fehler beim Laden einer Datei für ZIP", e);
        }
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `${actionName}.zip`;
    link.click();
}

// ---------------- Lightbox-Funktionen ----------------
function openLightbox(index) {
    if (!images || images.length === 0) return;
    currentIndex = index;
    const lb = document.getElementById("lightbox");
    const lbImg = document.getElementById("lightbox-img");
    if (!lb || !lbImg) return;
    lbImg.src = images[currentIndex];
    lb.classList.remove("hidden");
}

function closeLightbox() {
    const lb = document.getElementById("lightbox");
    if (!lb) return;
    lb.classList.add("hidden");
}

function showNext() {
    if (!images || images.length === 0) return;
    currentIndex = (currentIndex + 1) % images.length;
    document.getElementById("lightbox-img").src = images[currentIndex];
}

function showPrev() {
    if (!images || images.length === 0) return;
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    document.getElementById("lightbox-img").src = images[currentIndex];
}

// Setzt Event-Listener für Lightbox-Buttons (sicher mehrfach aufrufbar)
function setupLightboxControls() {
    const closeBtn = document.querySelector(".lightbox-close");
    const nextBtn = document.querySelector(".lightbox-next");
    const prevBtn = document.querySelector(".lightbox-prev");
    const lb = document.getElementById("lightbox");

    if (closeBtn && !closeBtn.dataset.listener) {
        closeBtn.addEventListener("click", closeLightbox);
        closeBtn.dataset.listener = "1";
    }
    if (nextBtn && !nextBtn.dataset.listener) {
        nextBtn.addEventListener("click", showNext);
        nextBtn.dataset.listener = "1";
    }
    if (prevBtn && !prevBtn.dataset.listener) {
        prevBtn.addEventListener("click", showPrev);
        prevBtn.dataset.listener = "1";
    }

    // Klicken auf Hintergrund schließt (wenn außerhalb Bild)
    if (lb && !lb.dataset.bgListener) {
        lb.addEventListener("click", (e) => {
            if (e.target === lb) closeLightbox();
        });
        lb.dataset.bgListener = "1";
    }

    // Tastatur-Ereignisse nur einmal setzen
    if (!document.body.dataset.kbListener) {
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowRight") showNext();
            if (e.key === "ArrowLeft") showPrev();
        });
        document.body.dataset.kbListener = "1";
    }
}

// ---------------- Init: warte bis DOM aufgebaut ist ----------------
document.addEventListener("DOMContentLoaded", () => {
    loadGallery();
});
