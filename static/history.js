async function loadReportHistory() {

    const container = document.getElementById("report-history");

    container.textContent = "Loading reports...";

    try {

        const response = await fetch("/api/report-history");

        const data = await response.json();

        if (!response.ok) {
            container.textContent = data.error || "Unable to load reports.";
            return;
        }

        container.innerHTML = "";

        if (data.reports.length === 0) {
            container.textContent = "No previous reports found.";
            return;
        }

        data.reports.forEach(report => {

            const card = document.createElement("div");
            card.className = "report-card";

            const title = document.createElement("h3");
            title.textContent = report.file_name;

            const date = document.createElement("p");
            date.textContent = "Uploaded: " + report.uploaded_at;

            const analysis = document.createElement("p");
            analysis.textContent = report.analysis;

            card.appendChild(title);
            card.appendChild(date);
            card.appendChild(analysis);

            container.appendChild(card);

        });

    } catch (error) {

        container.textContent = "Unable to connect to the server.";
        console.error(error);

    }
}