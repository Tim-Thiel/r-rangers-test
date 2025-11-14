async function downloadSelected() {
    const checkboxes = document.querySelectorAll("input[type=checkbox]:checked");

    if (checkboxes.length === 0) {
        alert("Bitte wählen Sie mindestens ein Bild aus.");
        return;
    }

    const zip = new JSZip();
    const folder = zip.folder("ausgewählte_bilder");

    for (let box of checkboxes) {
        const url = box.value;
        const filename = url.split("/").pop();

        const response = await fetch(url);
        const blob = await response.blob();
        
        folder.file(filename, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "bilder.zip";
    link.click();
}

