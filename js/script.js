// === NEU: Cloudinary Config ===
const cloudName = "db4arm1o7"; // Dein Cloudinary-Name

async function loadGallery() {
    const gallery = document.getElementById("gallery");
    if (!gallery) return;

    // Wir nutzen den Tag, um alle Bilder einer Seite zu finden
    // Der Tag muss in Cloudinary exakt so heißen wie deine HTML-Seite (pageName)
    const tag = pageName; 
    
    // Cloudinary URL für die Liste der Bilder mit diesem Tag
    // WICHTIG: "Resource list" muss in Cloudinary aktiviert sein!
    const listUrl = `https://res.cloudinary.com/${cloudName}/image/list/${tag}.json`;

    let response;
    try { 
        response = await fetch(listUrl); 
    } catch(e) { 
        logError("Cloudinary Fetch fehlgeschlagen", e); 
        return; 
    }

    if (!response.ok) { 
        gallery.innerHTML = "<p>Keine Bilder für diesen Tag gefunden (oder Resource List deaktiviert).</p>"; 
        return; 
    }

    const data = await response.json();
    const files = data.resources;

    gallery.innerHTML = "";
    galleryImages = [];
    originalImages = [];

    files.forEach((file, idx) => {
        // Cloudinary URLs zusammenbauen
        // 'f_auto,q_auto' optimiert die Bilder automatisch (Dateigröße!)
        const thumbUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_400,c_scale,f_auto,q_auto/v${file.version}/${file.public_id}.${file.format}`;
        
        // Die Original-URL für den Download (mit fl_attachment für direkten Download)
        const originalUrl = `https://res.cloudinary.com/${cloudName}/image/upload/fl_attachment/v${file.version}/${file.public_id}.${file.format}`;

        galleryImages.push(thumbUrl);
        originalImages.push(originalUrl);

        const card = document.createElement("div");
        card.className = "gallery-item";

        const img = document.createElement("img");
        img.src = thumbUrl;
        img.dataset.index = idx;
        img.loading = "lazy";
        img.addEventListener("click", () => openLightbox(idx));

        const checkboxContainer = document.createElement("div");
        checkboxContainer.className = "checkbox-container";
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = originalUrl;
        const label = document.createElement("label");
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" Bild auswählen"));
        checkboxContainer.appendChild(label);

        const downloadLink = document.createElement("a");
        downloadLink.href = originalUrl;
        // Dateiname aus der public_id generieren
        const fileName = file.public_id.includes('/') 
    ? `${file.public_id.split('/').pop()}.${file.format}` 
    : `${file.public_id}.${file.format}`;
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
}
