/* script.js — automatische Galerie + Lightbox + ZIP-Download */

// === CONFIG ===
window.GalleryConfig = window.GalleryConfig || {};
window.GalleryConfig.username = "tim-thiel";
window.GalleryConfig.repo = "r-rangers";

// === Automatische Erkennung ===
(function(){
    const pathParts = window.location.pathname.split("/").filter(p => p); 
    // z.B. ["bereiche","aktionen","unlimited2025.html"]
    const area = pathParts.includes("aktionen") ? "aktionen" :
                 pathParts.includes("team") ? "team" :
                 pathParts.includes("privat") ? "privat" : "unknown";
    const actionName = pathParts[pathParts.length-1].replace(".html","");

    // Ordner in Repo
    const folder = `bilder/${area}/${actionName}/thumbs`;

    // Globale Variablen für Galerie
    let images = [];
    let currentIndex = 0;

    function logError(msg,obj){ console.error("GalleryError:", msg, obj??""); }

    // === Galerie laden ===
    async function loadGallery(){
        const gallery = document.getElementById("gallery");
        if(!gallery){ logError("Kein Element mit id='gallery'"); return; }

        const apiUrl = `https://api.github.com/repos/${window.GalleryConfig.username}/${window.GalleryConfig.repo}/contents/${folder}`;
        let response;
        try{ response = await fetch(apiUrl); } catch(e){ logError("Fetch fehlgeschlagen", e); return; }
        if(!response.ok){ logError(`API-Antwort nicht OK (${response.status})`, await response.text()); return; }

        let files;
        try{ files = await response.json(); } catch(e){ logError("JSON parsing failed", e); return; }

        const fileEntries = files.filter(f => f.type==="file");
        if(fileEntries.length===0){ gallery.innerHTML="<p>Keine Bilder gefunden.</p>"; return; }

        images = [];
        gallery.innerHTML="";

        fileEntries.forEach((file, idx)=>{
            const card = document.createElement("div");
            card.className="gallery-item";

            const thumbUrl = file.download_url;
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
            checkbox.value = originalUrl;

            const label = document.createElement("label");
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(" Bild auswählen"));
            checkboxContainer.appendChild(label);

            const downloadLink = document.createElement("a");
            downloadLink.href = originalUrl;
            downloadLink.download = file.name;
            downloadLink.textContent = "Download";
            downloadLink.className = "download-btn";

            downloadLink.addEventListener("click", async (e)=>{
                e.preventDefault();
                try{
                    const resp = await fetch(originalUrl);
                    const blob = await resp.blob();
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = file.name;
                    a.click();
                }catch(err){ logError("Download fehlgeschlagen", err); }
            });

            card.appendChild(img);
            card.appendChild(checkboxContainer);
            card.appendChild(downloadLink);
            gallery.appendChild(card);
        });

        setupLightboxControls();
    }

    // === ZIP Download ===
    window.downloadSelected = async function(){
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
                folderZip.file(filename, blob);
            } catch(e){ logError("Fehler beim Laden für ZIP", e); }
        }

        const content = await zip.generateAsync({type:"blob"});
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = `${actionName}.zip`;
        link.click();
    }

    // === Lightbox ===
    function openLightbox(index){ 
        currentIndex=index; 
        const lb=document.getElementById("lightbox"); 
        const lbImg=document.getElementById("lightbox-img"); 
        if(!lb||!lbImg) return; 
        lbImg.src=images[currentIndex]; 
        lb.classList.remove("hidden"); 
    }
    function closeLightbox(){ const lb=document.getElementById("lightbox"); if(!lb) return; lb.classList.add("hidden"); }
    function showNext(){ currentIndex=(currentIndex+1)%images.length; document.getElementById("lightbox-img").src = images[currentIndex]; }
    function showPrev(){ currentIndex=(currentIndex-1+images.length)%images.length; document.getElementById("lightbox-img").src = images[currentIndex]; }

    function setupLightboxControls(){
        const closeBtn = document.querySelector(".lightbox-close");
        const nextBtn = document.querySelector(".lightbox-next");
        const prevBtn = document.querySelector(".lightbox-prev");
        const lb = document.getElementById("lightbox");

        if(closeBtn && !closeBtn.dataset.listener){ closeBtn.addEventListener("click", closeLightbox); closeBtn.dataset.listener="1"; }
        if(nextBtn && !nextBtn.dataset.listener){ nextBtn.addEventListener("click", showNext); nextBtn.dataset.listener="1"; }
        if(prevBtn && !prevBtn.dataset.listener){ prevBtn.addEventListener("click", showPrev); prevBtn.dataset.listener="1"; }

        if(lb && !lb.dataset.bgListener){ lb.addEventListener("click",(e)=>{ if(e.target===lb) closeLightbox(); }); lb.dataset.bgListener="1"; }

        if(!document.body.dataset.kbListener){ 
            document.addEventListener("keydown",(e)=>{
                if(e.key==="Escape") closeLightbox();
                if(e.key==="ArrowRight") showNext();
                if(e.key==="ArrowLeft") showPrev();
            });
            document.body.dataset.kbListener="1";
        }
    }

    document.addEventListener("DOMContentLoaded", loadGallery);
})();
