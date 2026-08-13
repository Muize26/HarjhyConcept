const projectRoot = document.getElementById("projects");

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
).matches;

const animateElement = (element, keyframes, options) => {
    if (!element || prefersReducedMotion || typeof element.animate !== "function") {
        return null;
    }

    return element.animate(keyframes, options);
};

const createLightbox = () => {
    const dialog = document.createElement("dialog");
    dialog.className = "project-lightbox";
    dialog.setAttribute("aria-label", "Project image preview");

    const previousButton = document.createElement("button");
    previousButton.type = "button";
    previousButton.className = "project-lightbox__previous";
    previousButton.setAttribute("aria-label", "Previous image");
    previousButton.textContent = "Previous";

    const image = document.createElement("img");
    image.className = "project-lightbox__image";
    image.alt = "";

    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className = "project-lightbox__next";
    nextButton.setAttribute("aria-label", "Next image");
    nextButton.textContent = "Next";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "project-lightbox__close";
    closeButton.setAttribute("aria-label", "Close image preview");
    closeButton.textContent = "Close";

    dialog.append(previousButton, image, nextButton, closeButton);
    document.body.append(dialog);

    return { dialog, image, previousButton, nextButton, closeButton };
};

const revealProjectCards = (cards) => {
    const reveal = (card, index = 0) => {
        animateElement(
            card, [
                { opacity: 0, transform: "translateY(24px)" },
                { opacity: 1, transform: "translateY(0)" },
            ], { duration: 650, delay: index * 90, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" },
        );
    };

    if (!("IntersectionObserver" in window)) {
        cards.forEach(reveal);
        return () => {};
    }

    const observer = new IntersectionObserver(
        (entries, currentObserver) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                reveal(entry.target, cards.indexOf(entry.target));
                currentObserver.unobserve(entry.target);
            });
        }, { threshold: 0.15 },
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
};

const setupGallery = (gallery, signal, lightboxes) => {
    const preview = gallery.querySelector(":scope > .project-gallery__preview img");
    const previewButton = gallery.querySelector(":scope > .project-gallery__preview");
    const thumbnails = Array.from(gallery.querySelectorAll(":scope > div .project-gallery__thumbnail img"));

    if (!preview || !previewButton || !thumbnails.length) return;

    let activeIndex = Math.max(
        0,
        thumbnails.findIndex((thumbnail) => thumbnail.currentSrc === preview.currentSrc || thumbnail.src === preview.src),
    );
    let previewAnimation;
    let zoomAnimation;
    let previewRequest = 0;
    const lightbox = createLightbox();
    lightboxes.push(lightbox.dialog);

    const updateThumbnailState = () => {
        thumbnails.forEach((thumbnail, index) => {
            const thumbnailButton = thumbnail.closest("button");
            if (thumbnailButton) {
                thumbnailButton.setAttribute("aria-current", String(index === activeIndex));
            }
        });
    };

    const updatePreview = (index) => {
        const request = ++previewRequest;
        activeIndex = (index + thumbnails.length) % thumbnails.length;
        const thumbnail = thumbnails[activeIndex];

        if (previewAnimation && typeof previewAnimation.cancel === "function") {
            previewAnimation.cancel();
        }
        previewAnimation = animateElement(
            preview, [{ opacity: 1 }, { opacity: 0 }], { duration: 160, easing: "ease-out", fill: "forwards" },
        );

        const setImage = () => {
            if (request !== previewRequest) return;
            preview.src = thumbnail.src;
            preview.alt = thumbnail.alt.replace("preview", "showcase preview");
            updateThumbnailState();
            previewAnimation = animateElement(
                preview, [{ opacity: 0 }, { opacity: 1 }], { duration: 240, easing: "ease-out", fill: "forwards" },
            );
        };

        if (previewAnimation) {
            previewAnimation.finished.then(setImage).catch(setImage);
        } else {
            setImage();
        }
    };

    const showLightbox = (index = activeIndex) => {
        activeIndex = (index + thumbnails.length) % thumbnails.length;
        const thumbnail = thumbnails[activeIndex];
        if (zoomAnimation && typeof zoomAnimation.cancel === "function") {
            zoomAnimation.cancel();
        }
        lightbox.image.dataset.zoomed = "false";
        lightbox.image.src = thumbnail.src;
        lightbox.image.alt = thumbnail.alt;

        if (!lightbox.dialog.open) {
            lightbox.dialog.showModal();
            animateElement(
                lightbox.image, [{ opacity: 0, transform: "scale(0.96)" }, { opacity: 1, transform: "scale(1)" }], { duration: 240, easing: "ease-out", fill: "both" },
            );
        }
    };

    const closeLightbox = () => {
        if (zoomAnimation && typeof zoomAnimation.cancel === "function") {
            zoomAnimation.cancel();
        }
        if (lightbox.dialog.open) lightbox.dialog.close();
    };

    const moveLightbox = (direction) => {
        activeIndex = (activeIndex + direction + thumbnails.length) % thumbnails.length;
        if (zoomAnimation && typeof zoomAnimation.cancel === "function") {
            zoomAnimation.cancel();
        }
        lightbox.image.dataset.zoomed = "false";
        lightbox.image.src = thumbnails[activeIndex].src;
        lightbox.image.alt = thumbnails[activeIndex].alt;
        updatePreview(activeIndex);
        animateElement(
            lightbox.image, [{ opacity: 0.2, transform: "scale(0.98)" }, { opacity: 1, transform: "scale(1)" }], { duration: 220, easing: "ease-out", fill: "both" },
        );
    };

    thumbnails.forEach((thumbnail, index) => {
        const thumbnailButton = thumbnail.closest("button");
        if (thumbnailButton) {
            thumbnailButton.addEventListener("click", () => updatePreview(index), { signal });
        }
    });

    previewButton.addEventListener("click", () => showLightbox(), { signal });
    lightbox.previousButton.addEventListener("click", () => moveLightbox(-1), { signal });
    lightbox.nextButton.addEventListener("click", () => moveLightbox(1), { signal });
    lightbox.closeButton.addEventListener("click", closeLightbox, { signal });
    lightbox.dialog.addEventListener(
        "click",
        (event) => {
            if (event.target === lightbox.dialog) closeLightbox();
        }, { signal },
    );
    lightbox.dialog.addEventListener(
        "keydown",
        (event) => {
            if (event.key === "Escape") closeLightbox();
        }, { signal },
    );
    lightbox.image.addEventListener(
        "click",
        () => {
            const isZoomed = lightbox.image.dataset.zoomed === "true";
            if (zoomAnimation && typeof zoomAnimation.cancel === "function") {
                zoomAnimation.cancel();
            }
            zoomAnimation = animateElement(
                lightbox.image, [{ transform: isZoomed ? "scale(1.25)" : "scale(1)" }, { transform: isZoomed ? "scale(1)" : "scale(1.25)" }], { duration: 250, easing: "ease-out", fill: "forwards" },
            );
            lightbox.image.dataset.zoomed = String(!isZoomed);
        }, { signal },
    );

    updateThumbnailState();
};

const setupProjectHoverAnimations = (cards, signal) => {
    cards.forEach((card) => {
        card.addEventListener(
            "pointerenter",
            () => {
                animateElement(
                    card, [{ filter: "brightness(1)" }, { filter: "brightness(1.04)" }], { duration: 220, easing: "ease-out", fill: "forwards" },
                );
            }, { signal },
        );
        card.addEventListener(
            "pointerleave",
            () => {
                animateElement(
                    card, [{ filter: "brightness(1.04)" }, { filter: "brightness(1)" }], { duration: 220, easing: "ease-out", fill: "forwards" },
                );
            }, { signal },
        );
    });
};

const setupAiProjectShowcase = (signal) => {
    const showcase = projectRoot ? projectRoot.querySelector(".ai-project-showcase") : null;
    const image = showcase ? showcase.querySelector(".ai-project-showcase__image") : null;

    if (!showcase || !image) return;

    const revealImage = () => {
        animateElement(
            image, [{ opacity: 0 }, { opacity: 1 }], { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" },
        );
    };

    if (image.complete) {
        window.requestAnimationFrame(revealImage);
    } else {
        image.addEventListener("load", revealImage, { once: true, signal });
    }

    if (prefersReducedMotion || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        return;
    }

    let animationFrame;

    const resetTilt = () => {
        window.cancelAnimationFrame(animationFrame);
        showcase.style.setProperty("--tilt-x", "0deg");
        showcase.style.setProperty("--tilt-y", "0deg");
    };

    showcase.addEventListener(
        "pointermove",
        (event) => {
            const bounds = showcase.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width;
            const y = (event.clientY - bounds.top) / bounds.height;

            window.cancelAnimationFrame(animationFrame);
            animationFrame = window.requestAnimationFrame(() => {
                showcase.style.setProperty("--tilt-x", `${(0.5 - y) * 5}deg`);
                showcase.style.setProperty("--tilt-y", `${(x - 0.5) * 5}deg`);
                showcase.style.setProperty("--glow-x", `${x * 100}%`);
                showcase.style.setProperty("--glow-y", `${y * 100}%`);
            });
        }, { signal },
    );
    showcase.addEventListener("pointerleave", resetTilt, { signal });
    signal.addEventListener(
        "abort",
        () => {
            window.cancelAnimationFrame(animationFrame);
        }, { once: true },
    );
};

export const initializeProjects = () => {
    if (!projectRoot) return;

    if (projectRoot.__projectsController && typeof projectRoot.__projectsController.abort === "function") {
        projectRoot.__projectsController.abort();
    }
    if (projectRoot.__projectLightboxes && Array.isArray(projectRoot.__projectLightboxes)) {
        projectRoot.__projectLightboxes.forEach((lightbox) => lightbox.remove());
    }

    const controller = new AbortController();
    const lightboxes = [];
    projectRoot.__projectsController = controller;
    projectRoot.__projectLightboxes = lightboxes;
    const cards = Array.from(projectRoot.querySelectorAll(".project-card"));

    const stopReveals = revealProjectCards(cards);
    controller.signal.addEventListener("abort", stopReveals, { once: true });
    setupProjectHoverAnimations(cards, controller.signal);
    setupAiProjectShowcase(controller.signal);
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeProjects, { once: true });
} else {
    initializeProjects();
}