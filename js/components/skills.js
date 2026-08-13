const skillsCards = Array.from(
    document.querySelectorAll(".skills-card, .skills-learning-card"),
);
const skillPills = Array.from(document.querySelectorAll(".skill-pill"));
const marqueeTrack = document.querySelector(".skills-marquee-track");

const setupSkillInteractions = () => {
    skillPills.forEach((pill) => {
        pill.addEventListener("mouseenter", () => pill.classList.add("is-hovered"));
        pill.addEventListener("mouseleave", () =>
            pill.classList.remove("is-hovered"),
        );
        pill.addEventListener("focus", () => pill.classList.add("is-hovered"));
        pill.addEventListener("blur", () => pill.classList.remove("is-hovered"));
    });

    if (marqueeTrack) {
        const items = Array.from(marqueeTrack.children);
        if (items.length) {
            const clones = items.map((item) => item.cloneNode(true));
            clones.forEach((clone) => marqueeTrack.appendChild(clone));
        }
    }
};

const revealSkills = () => {
    const observer = new IntersectionObserver(
        (entries, currentObserver) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const target = entry.target;
                const delay = Number(target.dataset.delay || 0);

                window.setTimeout(() => {
                    target.classList.add("is-visible");
                }, delay);

                currentObserver.unobserve(target);
            });
        }, { threshold: 0.2 },
    );

    skillsCards.forEach((card) => observer.observe(card));
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        setupSkillInteractions();
        revealSkills();
    });
} else {
    setupSkillInteractions();
    revealSkills();
}