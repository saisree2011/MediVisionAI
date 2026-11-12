async function analyzeImage() {

    const fileInput = document.getElementById("medical-image");

    const status = document.getElementById("image-status");

    const result = document.getElementById("image-result");

    const button = document.getElementById("image-button");

    if (!fileInput.files.length) {
        status.textContent = "Please select an image.";
        return;
    }

    const formData = new FormData();

    formData.append("file", fileInput.files[0]);

    button.disabled = true;

    status.textContent = "Uploading and analyzing image...";

    result.textContent = "";

    try {

        const response = await fetch("/api/analyze-image", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            status.textContent =
                data.error || "Image analysis failed.";
            return;
        }

        status.textContent = data.message;

        result.innerHTML = DOMPurify.sanitize(
          marked.parse(data.analysis || "")
        );

    } catch (error) {

        status.textContent =
            "Unable to connect to the server.";

        console.error(error);

    } finally {

        button.disabled = false;

    }
}