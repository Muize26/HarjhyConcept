import { brandingProjects } from "../data/projects.js";

const getGalleryElements = () => {
    const gallery = document.querySelector("[data-branding-gallery]");
    if (!gallery) return null;

    return {
        previewContainer: gallery.querySelector("[data-branding-preview]"),
        metadataContainer: gallery.querySelector("[data-branding-meta]"),
        thumbnailContainer: gallery.querySelector("[data-branding-thumbnails]"),
    };
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const animateElement = (element, keyframes, options = {}) => {
    if (!element || prefersReducedMotion || typeof element.animate !== "function") {
        if (element && Array.isArray(keyframes) && keyframes.length) {
            Object.assign(element.style, keyframes[keyframes.length - 1]);
        }
        return Promise.resolve();
    }

    const animation = element.animate(keyframes, {
        fill: "forwards",
        easing: options.easing || "ease-out",
        duration: options.duration || 250,
        delay: options.delay || 0,
    });

    return animation.finished.catch(() => {});
};

const preloadImage = (src) => {
    if (!src) return;
    const image = new Image();
    image.src = src;
};

const createSlides = (projects) =>
    projects.flatMap((project) => [
        { project, type: "logo", image: project.logo },
        { project, type: "board", image: project.board },
    ]);

const createPreview = () => {
    const canvas = document.createElement("div");
    const frame = document.createElement("div");
    const preview = document.createElement("img");

    canvas.className = "w-full max-w-full rounded-2xl border border-white/10 bg-white shadow-sm overflow-hidden";
    canvas.style.aspectRatio = "933 / 282";
    canvas.style.boxSizing = "border-box";
    canvas.style.minHeight = "140px";
    canvas.style.minWidth = "320px";
    canvas.style.padding = "1rem";
    canvas.style.display = "flex";
    canvas.style.alignItems = "center";
    canvas.style.justifyContent = "center";
    canvas.style.cursor = "pointer";

    frame.style.width = "100%";
    frame.style.height = "100%";
    frame.style.display = "flex";
    frame.style.alignItems = "center";
    frame.style.justifyContent = "center";
    frame.style.overflow = "hidden";

    preview.className = "w-full h-full object-contain";
    preview.style.display = "block";
    preview.style.objectFit = "contain";
    preview.style.maxWidth = "100%";
    preview.style.maxHeight = "100%";
    preview.style.outline = "2px solid transparent";
    preview.style.outlineOffset = "3px";
    preview.alt = "Brand logo preview";
    preview.tabIndex = 0;
    preview.setAttribute("role", "button");
    preview.setAttribute("aria-label", "Open branding board lightbox");
    preview.addEventListener("focus", () => {
        preview.style.outline = "2px solid #7c3aed";
    });
    preview.addEventListener("blur", () => {
        preview.style.outline = "2px solid transparent";
    });

    frame.appendChild(preview);
    canvas.appendChild(frame);

    return { canvas, preview };
};

const createProjectMetadata = () => {
    const title = document.createElement("p");
    const category = document.createElement("p");

    title.className = "text-sm font-semibold text-white";
    category.className = "text-[11px] uppercase tracking-[0.25em] text-zinc-400";

    return { title, category };
};

const createThumbnail = (project, index, onSelect) => {
    const button = document.createElement("button");
    const image = document.createElement("img");

    button.type = "button";
    button.className = "project-gallery__thumbnail group rounded-lg border border-transparent p-0 text-left transition duration-300 ease-out hover:border-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111]";
    button.dataset.index = String(index);
    button.setAttribute("aria-label", `Show ${project.name} branding project`);

    image.src = project.thumbnail;
    image.alt = `${project.name} branding thumbnail`;
    image.loading = "lazy";
    image.className = "aspect-square w-full rounded-lg object-cover";

    button.appendChild(image);
    button.addEventListener("click", () => onSelect(index));

    return button;
};

const setActiveThumbnail = (thumbnailButtons, activeIndex) => {
    thumbnailButtons.forEach((button, index) => {
        const isActive = index === activeIndex;
        button.classList.toggle("border-violet-400", isActive);
        button.classList.toggle("shadow-[0_0_18px_rgba(124,58,237,0.28)]", isActive);
        button.classList.toggle("scale-[1.03]", isActive);
        button.setAttribute("aria-current", String(isActive));
    });
};

const createLightbox = () => {
    const dialogTitleId = "branding-lightbox-title";
    const dialogDescriptionId = "branding-lightbox-description";
    const buttonTransition = prefersReducedMotion ? "transition:none;" : "transition:transform 180ms ease-out, box-shadow 180ms ease-out, background-color 180ms ease-out;";
    const imageWrapperTransition = prefersReducedMotion ? "transition:none;" : "transition:background 220ms ease-out, padding 220ms ease-out, box-shadow 220ms ease-out;";

    const overlay = document.createElement("div");
    overlay.className = "branding-lightbox-overlay";
    overlay.tabIndex = -1;
    overlay.setAttribute("aria-hidden", "true");
    overlay.style.cssText = [
        "position:fixed",
        "inset:0",
        "display:none",
        "align-items:center",
        "justify-content:center",
        "background:rgba(15,15,15,0.36)",
        "backdrop-filter:blur(20px)",
        "-webkit-backdrop-filter:blur(20px)",
        "z-index:60",
        "padding:1.5rem",
        "overflow:auto",
    ].join(";");

    const dialog = document.createElement("div");
    dialog.className = "branding-lightbox-dialog";
    dialog.tabIndex = -1;
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", dialogTitleId);
    dialog.setAttribute("aria-describedby", dialogDescriptionId);
    dialog.style.cssText = [
        "position:relative",
        "width:100%",
        "max-width:980px",
        "max-height:100%",
        "background:rgba(255,255,255,0.88)",
        "backdrop-filter:blur(16px)",
        "-webkit-backdrop-filter:blur(16px)",
        "border:1px solid rgba(255,255,255,0.22)",
        "border-radius:28px",
        "overflow:hidden",
        "display:flex",
        "flex-direction:column",
        "box-shadow:0 40px 90px rgba(0,0,0,0.14)",
        "opacity:0",
        "transform:scale(0.98)",
        "z-index:61",
        "margin:auto",
        "cursor:zoom-in",
    ].join(";");

    const imageWrapper = document.createElement("div");
    imageWrapper.style.cssText = [
        "position:relative",
        "width:100%",
        "display:flex",
        "align-items:center",
        "justify-content:center",
        "overflow:hidden",
        imageWrapperTransition,
    ].join(";");

    const image = document.createElement("img");
    image.style.cssText = [
        "width:100%",
        "height:auto",
        "display:block",
        "object-fit:contain",
        "max-width:100%",
        "max-height:100%",
        "opacity:0",
        "transition:opacity 220ms ease-out, transform 220ms ease-out",
    ].join(";");
    image.alt = "";
    image.loading = "lazy";
    imageWrapper.appendChild(image);

    const loadingIndicator = document.createElement("div");
    loadingIndicator.style.cssText = [
        "position:absolute",
        "inset:0",
        "display:flex",
        "align-items:center",
        "justify-content:center",
        "pointer-events:none",
        "opacity:0",
        "transition:opacity 180ms ease-out",
        "z-index:1",
    ].join(";");

    const spinner = document.createElement("div");
    spinner.style.cssText = [
        "width:32px",
        "height:32px",
        "border-radius:50%",
        "border:3px solid rgba(255,255,255,0.35)",
        "border-top-color:rgba(255,255,255,0.92)",
        "box-sizing:border-box",
    ].join(";");

    if (!prefersReducedMotion && typeof spinner.animate === "function") {
        spinner.animate(
            [
                { transform: "rotate(0deg)" },
                { transform: "rotate(360deg)" },
            ], { duration: 900, iterations: Infinity, easing: "linear" },
        );
    }

    loadingIndicator.appendChild(spinner);
    imageWrapper.appendChild(loadingIndicator);

    const caption = document.createElement("div");
    caption.style.cssText = [
        "position:absolute",
        "left:1.5rem",
        "right:1.5rem",
        "bottom:1.5rem",
        "padding:0.9rem 1rem",
        "border-radius:18px",
        "background:rgba(255,255,255,0.92)",
        "backdrop-filter:blur(14px)",
        "border:1px solid rgba(15,15,15,0.08)",
        "display:flex",
        "align-items:center",
        "justify-content:space-between",
        "gap:1rem",
        "flex-wrap:wrap",
        "box-shadow:0 18px 45px rgba(0,0,0,0.12)",
        "position:relative",
        "z-index:3",
    ].join(";");

    const label = document.createElement("p");
    label.style.cssText = "margin:0;font-size:0.95rem;font-weight:700;color:#111111;";
    const indicator = document.createElement("p");
    indicator.style.cssText = "margin:0;font-size:0.8rem;color:#6b7280;";
    caption.append(label, indicator);

    const liveRegion = document.createElement("div");
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.style.cssText = "position:absolute;width:1px;height:1px;margin:-1px;border:0;padding:0;clip:rect(0 0 0 0);overflow:hidden;white-space:nowrap;";

    const createButton = (text, ariaLabel) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = text;
        button.setAttribute("aria-label", ariaLabel);
        button.style.cssText = [
            "position:absolute",
            "top:50%",
            "transform:translateY(-50%)",
            "padding:0.75rem 1rem",
            "min-width:44px",
            "min-height:44px",
            "border:none",
            "border-radius:999px",
            "background:rgba(255,255,255,0.92)",
            "color:#111111",
            "cursor:pointer",
            "font-weight:700",
            "box-shadow:0 10px 30px rgba(0,0,0,0.12)",
            "z-index:1",
            buttonTransition,
            "outline:2px solid transparent",
            "outline-offset:3px",
        ].join(";");

        button.addEventListener("pointerenter", () => {
            button.style.transform = "translateY(-1px) scale(1.03)";
            button.style.boxShadow = "0 14px 36px rgba(0,0,0,0.14)";
            button.style.background = "rgba(255,255,255,0.98)";
        });
        button.addEventListener("pointerleave", () => {
            button.style.transform = "translateY(-50%)";
            button.style.boxShadow = "0 10px 30px rgba(0,0,0,0.12)";
            button.style.background = "rgba(255,255,255,0.92)";
        });
        button.addEventListener("pointerdown", () => {
            button.style.transform = "translateY(-0.5px) scale(0.98)";
        });
        button.addEventListener("pointerup", () => {
            button.style.transform = "translateY(-1px) scale(1.03)";
        });
        button.addEventListener("focus", () => {
            button.style.outline = "2px solid #7c3aed";
            button.style.boxShadow = "0 0 0 4px rgba(124,58,237,0.28), 0 14px 32px rgba(0,0,0,0.16)";
        });
        button.addEventListener("blur", () => {
            button.style.outline = "2px solid transparent";
            button.style.boxShadow = "0 10px 30px rgba(0,0,0,0.12)";
        });

        return button;
    };

    const previousButton = createButton("‹", "Previous branding project");
    previousButton.style.left = "1rem";

    const nextButton = createButton("›", "Next branding project");
    nextButton.style.right = "1rem";

    const closeButton = createButton("✕", "Close branding project preview");
    closeButton.style.cssText += ";top:1rem;right:1rem;transform:none;padding:0.75rem;";
    closeButton.style.position = "absolute";
    closeButton.style.background = "rgba(255,255,255,0.98)";

    dialog.append(imageWrapper, caption, previousButton, nextButton, closeButton, liveRegion);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    return {
        overlay,
        dialog,
        imageWrapper,
        image,
        loadingIndicator,
        label,
        indicator,
        liveRegion,
        previousButton,
        nextButton,
        closeButton,
    };
};

export const initBranding = () => {
    const elements = getGalleryElements();
    if (!elements || !Array.isArray(brandingProjects) || brandingProjects.length === 0) return;

    const { previewContainer, metadataContainer, thumbnailContainer } = elements;
    if (!previewContainer || !metadataContainer || !thumbnailContainer) return;

    const slides = createSlides(brandingProjects);
    const { canvas: previewCanvas, preview: previewImage } = createPreview();
    const lightbox = createLightbox();
    const metadata = createProjectMetadata();

    let projectIndex = 0;
    let currentIndex = 0;
    let isTransitioning = false;
    let lastFocusedElement = null;
    let previousBodyOverflow = "";

    const wrapIndex = (index) => {
        const length = slides.length;
        return ((index % length) + length) % length;
    };

    const renderPreview = () => {
        const project = brandingProjects[projectIndex];
        previewImage.src = project.logo;
        previewImage.alt = `${project.name} brand logo`;
        metadata.title.textContent = project.name;
        metadata.category.textContent = project.category;
        setActiveThumbnail(thumbnails, projectIndex);
    };

    const setLoading = (loading) => {
        lightbox.loadingIndicator.style.opacity = loading ? "1" : "0";
    };

    const applySlideTheme = (slide) => {
        const isLogo = slide.type === "logo";
        lightbox.dialog.style.background = isLogo ? "#ffffff" : "transparent";
        lightbox.imageWrapper.style.background = isLogo ? "#ffffff" : "rgba(15,15,15,0.92)";
        lightbox.imageWrapper.style.padding = isLogo ? "1.5rem" : "2.25rem";
        lightbox.label.style.color = isLogo ? "#111111" : "#f8fafc";
        lightbox.indicator.style.color = isLogo ? "#6b7280" : "#cbd5e1";
        lightbox.indicator.style.borderTop = isLogo ? "1px solid rgba(15,15,15,0.08)" : "1px solid rgba(255,255,255,0.08)";
    };

    const renderLightbox = async() => {
        const slide = slides[currentIndex];
        applySlideTheme(slide);
        lightbox.label.textContent = `${slide.project.name} — ${slide.type === "logo" ? "Logo" : "Presentation board"}`;
        lightbox.indicator.textContent = `${currentIndex + 1} / ${slides.length}`;
        lightbox.liveRegion.textContent = `Showing ${slide.project.name} branding project`;
        setLoading(true);

        const imageLoad = new Promise((resolve) => {
            const img = new Image();
            img.src = slide.image;
            if (img.complete) {
                resolve();
                return;
            }
            img.onload = resolve;
            img.onerror = resolve;
        });

        const previousSrc = lightbox.image.src;
        const nextSrc = slide.image;

        if (previousSrc && previousSrc !== nextSrc && !prefersReducedMotion) {
            await animateElement(lightbox.image, [
                { opacity: 1, transform: "scale(1)" },
                { opacity: 0, transform: "scale(0.98)" },
            ], { duration: 260 });
        }

        await imageLoad;
        if (slides[currentIndex].image !== slide.image) return;

        lightbox.image.src = slide.image;
        lightbox.image.alt = `${slide.project.name} ${slide.type}`;
        lightbox.image.style.opacity = "0";
        lightbox.image.style.transform = "scale(0.98)";

        setLoading(false);
        if (!prefersReducedMotion) {
            await animateElement(lightbox.image, [
                { opacity: 0, transform: "scale(0.98)" },
                { opacity: 1, transform: "scale(1)" },
            ], { duration: 260 });
        } else {
            lightbox.image.style.opacity = "1";
            lightbox.image.style.transform = "scale(1)";
        }

        preloadImage(slides[wrapIndex(currentIndex - 1)].image);
        preloadImage(slides[wrapIndex(currentIndex + 1)].image);
    };

    const openLightbox = async(slideIndex) => {
        if (isTransitioning) return;
        isTransitioning = true;
        lastFocusedElement = document.activeElement;
        currentIndex = wrapIndex(slideIndex);
        previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        lightbox.overlay.style.display = "flex";
        lightbox.overlay.style.opacity = "0";
        lightbox.dialog.style.opacity = "0";
        lightbox.dialog.style.transform = "scale(0.98)";
        await renderLightbox();
        await Promise.all([
            animateElement(lightbox.overlay, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 }),
            animateElement(lightbox.dialog, [
                { opacity: 0, transform: "scale(0.98)" },
                { opacity: 1, transform: "scale(1)" },
            ], { duration: 250 }),
        ]);
        lightbox.overlay.setAttribute("aria-hidden", "false");
        lightbox.closeButton.focus();
        isTransitioning = false;
    };

    const closeLightbox = async() => {
        if (isTransitioning) return;
        isTransitioning = true;
        await Promise.all([
            animateElement(lightbox.overlay, [{ opacity: 1 }, { opacity: 0 }], { duration: 220 }),
            animateElement(lightbox.dialog, [
                { opacity: 1, transform: "scale(1)" },
                { opacity: 0, transform: "scale(0.98)" },
            ], { duration: 220 }),
        ]);
        lightbox.overlay.style.display = "none";
        lightbox.overlay.setAttribute("aria-hidden", "true");
        document.body.style.overflow = previousBodyOverflow;
        if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
            lastFocusedElement.focus();
        }
        isTransitioning = false;
    };

    const moveLightbox = async(direction) => {
        if (isTransitioning) return;
        isTransitioning = true;
        currentIndex = wrapIndex(currentIndex + direction);
        await renderLightbox();
        isTransitioning = false;
    };

    const handleKeyDown = (event) => {
        if (lightbox.overlay.style.display !== "flex") return;
        if (event.key === "Escape") {
            event.preventDefault();
            closeLightbox();
            return;
        }
        if (event.key === "Tab") {
            const focusable = Array.from(lightbox.dialog.querySelectorAll(
                "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])"
            )).filter((el) => !el.disabled && el.offsetParent !== null);
            if (focusable.length === 0) return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && event.target === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && event.target === last) {
                event.preventDefault();
                first.focus();
            }
            return;
        }
        moveLightbox(1);
        return;
    };

    let pointerStartX = null;
    let pointerStartY = null;

    const handlePointerDown = (event) => {
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
    };

    const handlePointerUp = (event) => {
        if (pointerStartX === null || pointerStartY === null) return;

        const dx = event.clientX - pointerStartX;
        const dy = event.clientY - pointerStartY;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        pointerStartX = null;
        pointerStartY = null;

        if (absDx < 40 || absDx < absDy) return;
        if (dx > 0) moveLightbox(-1);
        else moveLightbox(1);
    };

    const thumbnails = brandingProjects.map((project, index) =>
        createThumbnail(project, index, (selectedIndex) => {
            projectIndex = selectedIndex;
            renderPreview();
        }),
    );

    previewCanvas.addEventListener("click", () => openLightbox(projectIndex * 2));
    previewCanvas.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openLightbox(projectIndex * 2);
        }
    });

    lightbox.previousButton.addEventListener("click", () => moveLightbox(-1));
    lightbox.nextButton.addEventListener("click", () => moveLightbox(1));
    lightbox.closeButton.addEventListener("click", closeLightbox);
    lightbox.overlay.addEventListener("click", (event) => {
        if (event.target === lightbox.overlay) closeLightbox();
    });
    lightbox.overlay.addEventListener("keydown", handleKeyDown);
    lightbox.imageWrapper.addEventListener("pointerdown", handlePointerDown);
    lightbox.imageWrapper.addEventListener("pointerup", handlePointerUp);

    previewContainer.replaceChildren(previewCanvas);
    metadataContainer.replaceChildren(metadata.title, metadata.category);
    thumbnailContainer.replaceChildren(...thumbnails);

    renderPreview();
};