const dashboard = document.getElementById("identity-dashboard");
const statValues = document.querySelectorAll(".stat-value");

if (dashboard) {
    const cards = dashboard.querySelectorAll(".dashboard-card");
    const logo = dashboard.querySelector(".dashboard-logo");

    dashboard.addEventListener("pointermove", (event) => {
        const rect = dashboard.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        cards.forEach((card, index) => {
            const offsetX = x * (index % 2 === 0 ? 3 : -2);
            const offsetY = y * (index % 2 === 0 ? -2 : 3);
            card.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        });

        if (logo) {
            logo.style.transform = `translate(-50%, -50%) rotate(${x * 2}deg)`;
        }
    });

    dashboard.addEventListener("pointerleave", () => {
        cards.forEach((card) => {
            card.style.transform = "";
        });

        if (logo) {
            logo.style.transform = "";
        }
    });
}