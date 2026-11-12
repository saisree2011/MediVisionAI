async function uploadReport() {

    const fileInput = document.getElementById("report-file");
    const status = document.getElementById("upload-status");
    const result = document.getElementById("report-analysis");
    const button = document.getElementById("upload-button");

    if (!fileInput.files.length) {
        status.textContent = "Please select a PDF file.";
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    button.disabled = true;
    status.textContent = "Uploading and analyzing...";
    result.textContent = "";

    try {
        const response = await fetch("/api/upload-report", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            status.textContent = data.error || "Upload failed.";
            return;
        }

        status.textContent = data.message;
        result.innerHTML = DOMPurify.sanitize(
          marked.parse(data.analysis || "")
        );

    } catch (error) {
        status.textContent = "Unable to connect to the server.";
        console.error(error);

    } finally {
        button.disabled = false;
    }
}