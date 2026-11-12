async function loadImageHistory() {

    const container = document.getElementById("image-history-container");

    container.innerHTML = "<p>Loading image history...</p>";

    try {

        const response = await fetch("/api/image-history");

        const data = await response.json();

        if (!response.ok) {
            container.textContent = data.error || "Unable to load history.";
            return;
        }

        if (!data.images || data.images.length === 0) {
            container.innerHTML = "<p>No previous image analyses found.</p>";
            return;
        }

        container.innerHTML = "";

        data.images.forEach(image => {

            const card = document.createElement("div");
            card.className = "history-card";

            const title = document.createElement("h3");
            title.textContent = image.image_name;

            const date = document.createElement("p");
            date.textContent = "Uploaded: " + image.uploaded_at;

            const analysis = document.createElement("p");
            analysis.textContent = image.analysis;

            card.appendChild(title);
            card.appendChild(date);
            card.appendChild(analysis);

            container.appendChild(card);

        });

    } catch (error) {

        console.error("Image History Error:", error);
        container.textContent = "Something went wrong while loading history.";

    }
}