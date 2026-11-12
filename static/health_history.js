async function loadHealthHistory() {
    const container = document.getElementById("health-history");

    container.textContent = "Loading BMI history...";

    try {
        const response = await fetch("/api/health-history");
        const data = await response.json();

        if (!response.ok) {
            container.textContent = data.error || "Unable to load history.";
            return;
        }

        container.innerHTML = "";

        if (data.records.length === 0) {
            container.textContent = "No BMI records found.";
            return;
        }

        data.records.forEach(record => {
            const card = document.createElement("div");
            card.className = "report-card";

            card.textContent =
                "Height: " + record.height + " cm | " +
                "Weight: " + record.weight + " kg | " +
                "BMI: " + record.bmi + " | " +
                "Date: " + record.recorded_at;

            container.appendChild(card);
        });

    } catch (error) {
        container.textContent = "Unable to connect to server.";
        console.error(error);
    }
}