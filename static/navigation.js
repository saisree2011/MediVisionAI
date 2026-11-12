document.addEventListener("DOMContentLoaded", function () {

    const navLinks = document.querySelectorAll('a[href^="#"]');

    const sections = document.querySelectorAll(
        ".feature-section, .chat-section"
    );

    const welcome = document.querySelector(".welcome-section");
    const cards = document.querySelector(".cards");

    function showSection(sectionId) {

        // Hide all feature sections
        sections.forEach(section => {
            section.style.display = "none";
        });

        // Hide dashboard home content
        if (welcome) welcome.style.display = "none";
        if (cards) cards.style.display = "none";

        // Show selected section
        const selectedSection = document.getElementById(sectionId);

        if (selectedSection) {
            selectedSection.style.display = "block";
        }

        // Update active sidebar link
        navLinks.forEach(link => {
            link.classList.toggle(
                "active",
                link.getAttribute("href") === "#" + sectionId
            );
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Sidebar navigation
    navLinks.forEach(link => {

        link.addEventListener("click", function (event) {

            event.preventDefault();

            const sectionId = this.getAttribute("href").substring(1);

            showSection(sectionId);

        });

    });

    // Show dashboard home by default
    sections.forEach(section => {
        section.style.display = "none";
    });

});