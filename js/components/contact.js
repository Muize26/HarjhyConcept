const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const initContact = () => {
    const contactSection = document.getElementById("contact");
    if (!contactSection) return;

    const title = contactSection.querySelector(".contact-title");
    const description = contactSection.querySelector(".contact-description");
    const pill = contactSection.querySelector(".contact-pill");
    const cards = contactSection.querySelectorAll(".contact-card");
    const cta = contactSection.querySelector(".contact-button");
    const blobs = contactSection.querySelectorAll(".contact-blob");

    if (!title || !description || !pill) return;

    const setInitialState = () => {
        if (prefersReducedMotion) return;

        title.style.opacity = "0";
        title.style.transform = "translateY(32px)";
        description.style.opacity = "0";
        description.style.transform = "translateY(20px)";
        pill.style.opacity = "0";
        pill.style.transform = "translateY(16px)";

        cards.forEach((card, index) => {
            card.style.opacity = "0";
            card.style.transform = "translateY(24px)";
            card.style.transitionDelay = `${index * 70}ms`;
        });

        if (cta) {
            cta.style.opacity = "0";
            cta.style.transform = "scale(0.97)";
        }

        blobs.forEach((blob, index) => {
            blob.style.opacity = "0";
            blob.style.transform = "scale(0.95)";
            blob.style.transitionDelay = `${index * 120}ms`;
        });
    };

    const animateIn = () => {
        if (prefersReducedMotion) {
            title.style.opacity = "1";
            description.style.opacity = "1";
            pill.style.opacity = "1";
            cards.forEach((card) => {
                card.style.opacity = "1";
                card.style.transform = "none";
            });
            if (cta) {
                cta.style.opacity = "1";
                cta.style.transform = "none";
            }
            blobs.forEach((blob) => {
                blob.style.opacity = "1";
                blob.style.transform = "none";
            });
            return;
        }

        window.requestAnimationFrame(() => {
            title.style.transition = "opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 700ms cubic-bezier(0.22, 1, 0.36, 1)";
            title.style.opacity = "1";
            title.style.transform = "translateY(0)";

            description.style.transition = "opacity 800ms cubic-bezier(0.22, 1, 0.36, 1), transform 800ms cubic-bezier(0.22, 1, 0.36, 1)";
            description.style.opacity = "1";
            description.style.transform = "translateY(0)";

            pill.style.transition = "opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), transform 700ms cubic-bezier(0.22, 1, 0.36, 1)";
            pill.style.opacity = "1";
            pill.style.transform = "translateY(0)";

            cards.forEach((card, index) => {
                card.style.transition = `opacity 700ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 80}ms, transform 700ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 80}ms`;
                card.style.opacity = "1";
                card.style.transform = "translateY(0)";
            });

            if (cta) {
                cta.style.transition = "opacity 800ms cubic-bezier(0.22, 1, 0.36, 1), transform 800ms cubic-bezier(0.22, 1, 0.36, 1)";
                cta.style.opacity = "1";
                cta.style.transform = "scale(1)";
            }

            blobs.forEach((blob, index) => {
                blob.style.transition = `opacity 900ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 120}ms, transform 900ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 120}ms`;
                blob.style.opacity = "1";
                blob.style.transform = "scale(1)";
            });
        });
    };

    if (typeof IntersectionObserver === "function") {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    animateIn();
                    observer.disconnect();
                }
            });
        }, { threshold: 0.2 });

        setInitialState();
        observer.observe(contactSection);
        return;
    }

    setInitialState();
    animateIn();
};

initContact();