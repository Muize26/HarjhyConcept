const aboutContent = document.querySelectorAll(".about-content");
const statValues = document.querySelectorAll(".stat-value");

const revealAbout = () => {
    aboutContent.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9) {
            setTimeout(() => item.classList.add("is-visible"), index * 120);
        }
    });
};

const animateStats = () => {
    statValues.forEach((value) => {
        const target = value.textContent.trim();
        if (!target.includes("+")) return;

        const numericValue = Number.parseInt(target, 10);
        if (Number.isNaN(numericValue)) return;

        let current = 0;
        const totalSteps = 30;
        const increment = numericValue / totalSteps;

        const timer = setInterval(() => {
            current += increment;
            if (current >= numericValue) {
                value.textContent = `${numericValue}+`;
                clearInterval(timer);
            } else {
                value.textContent = `${Math.floor(current)}+`;
            }
        }, 40);
    });
};

window.addEventListener("scroll", revealAbout, { passive: true });
window.addEventListener("load", () => {
    revealAbout();
    animateStats();
});