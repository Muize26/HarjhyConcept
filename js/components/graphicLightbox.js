const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const createGraphicLightbox = (items, currentIndex, onIndexChange) => {
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 z-[70] hidden items-center justify-center bg-black/70 p-4 backdrop-blur-xl";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Graphic design preview");

    const dialog = document.createElement("div");
    dialog.className = "relative flex items-center justify-center rounded-[32px] border border-white/15 bg-[rgba(10,10,10,0.92)] shadow-[0_30px_90px_rgba(0,0,0,0.35)]";
    dialog.style.width = "min(95vw, 1200px)";
    dialog.style.height = "min(88vh, 900px)";
    dialog.style.maxWidth = "95vw";
    dialog.style.maxHeight = "88vh";
    dialog.style.padding = "0";
    dialog.style.overflow = "auto";

    const image = document.createElement("img");
    image.className = "block";
    image.alt = "Graphic design preview";
    image.style.display = "block";
    image.style.maxWidth = "100%";
    image.style.maxHeight = "100%";
    image.style.width = "auto";
    image.style.height = "auto";
    image.style.objectFit = "contain";
    image.style.margin = "auto";

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "absolute right-4 top-4 z-10 rounded-full border border-violet-400/30 bg-violet-600/90 px-3 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(124,58,237,0.28)] backdrop-blur-xl transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400";
    closeButton.textContent = "✕";
    closeButton.setAttribute("aria-label", "Close preview");

    const previousButton = document.createElement("button");
    previousButton.type = "button";
    previousButton.className = "absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-violet-400/30 bg-violet-600/90 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(124,58,237,0.28)] backdrop-blur-xl transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400";
    previousButton.textContent = "←";
    previousButton.setAttribute("aria-label", "Previous design");

    const nextButton = document.createElement("button");
    nextButton.type = "button";
    nextButton.className = "absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-violet-400/30 bg-violet-600/90 px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(124,58,237,0.28)] backdrop-blur-xl transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400";
    nextButton.textContent = "→";
    nextButton.setAttribute("aria-label", "Next design");

    const caption = document.createElement("div");
    caption.className = "absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-white backdrop-blur-xl";

    const title = document.createElement("span");
    title.className = "truncate font-semibold";
    const counter = document.createElement("span");
    counter.className = "text-xs uppercase tracking-[0.25em] text-zinc-300";

    caption.append(title, counter);
    dialog.append(previousButton, image, nextButton, closeButton, caption);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    let activeIndex = currentIndex;
    let lastFocusedElement = null;
    let touchStartX = null;
    let touchStartY = null;

    const wrapIndex = (index) => ((index % items.length) + items.length) % items.length;

    const preload = (index) => {
        const item = items[index];
        if (!item) return;
        const img = new Image();
        img.src = item.image;
    };

    const updateImage = (index, animate = true) => {
        activeIndex = wrapIndex(index);
        const item = items[activeIndex];
        if (!item) return;

        title.textContent = item.title;
        counter.textContent = `${activeIndex + 1} / ${items.length}`;
        if (animate && !prefersReducedMotion) {
            image.animate(
                [{ opacity: 0, transform: "scale(0.96)" }, { opacity: 1, transform: "scale(1)" }], { duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
            );
        }
        image.src = item.image;
        image.alt = item.title;
        preload(wrapIndex(activeIndex + 1));
        preload(wrapIndex(activeIndex - 1));
        if (typeof onIndexChange === "function") {
            onIndexChange(activeIndex);
        }
    };

    const open = (index = activeIndex) => {
        lastFocusedElement = document.activeElement;
        updateImage(index, false);
        overlay.classList.remove("hidden");
        overlay.classList.add("flex");
        document.body.style.overflow = "hidden";
        if (!prefersReducedMotion) {
            overlay.animate(
                [{ opacity: 0 }, { opacity: 1 }], { duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
            );
            dialog.animate(
                [{ opacity: 0, transform: "scale(0.96)" }, { opacity: 1, transform: "scale(1)" }], { duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
            );
        }
        const focusable = [closeButton, previousButton, nextButton].filter(Boolean);
        if (focusable[0] && typeof focusable[0].focus === "function") {
            focusable[0].focus();
        }
    };

    const close = () => {
        if (!overlay.classList.contains("flex")) return;
        const closeAnimation = prefersReducedMotion ?
            null :
            overlay.animate(
                [{ opacity: 1 }, { opacity: 0 }], { duration: 180, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
            );
        if (closeAnimation) {
            closeAnimation.finished.finally(() => {
                overlay.classList.add("hidden");
                overlay.classList.remove("flex");
                document.body.style.overflow = "";
                if (lastFocusedElement && lastFocusedElement.focus && typeof lastFocusedElement.focus === "function") {
                    lastFocusedElement.focus();
                }
            });
        } else {
            overlay.classList.add("hidden");
            overlay.classList.remove("flex");
            document.body.style.overflow = "";
            if (lastFocusedElement && lastFocusedElement.focus && typeof lastFocusedElement.focus === "function") {
                lastFocusedElement.focus();
            }
        }
    };

    const next = () => updateImage(activeIndex + 1);
    const previous = () => updateImage(activeIndex - 1);

    const trapFocus = (event) => {
        if (event.key !== "Tab") return;
        const focusable = [closeButton, previousButton, nextButton].filter((el) => !el.disabled);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    };

    overlay.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            event.preventDefault();
            close();
        }
        if (event.key === "ArrowRight") {
            event.preventDefault();
            next();
        }
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            previous();
        }
        trapFocus(event);
    });

    closeButton.addEventListener("click", close);
    previousButton.addEventListener("click", previous);
    nextButton.addEventListener("click", next);
    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) close();
    });

    overlay.addEventListener("touchstart", (event) => {
        const touch = event.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: true });

    overlay.addEventListener("touchend", (event) => {
        if (touchStartX === null || touchStartY === null) return;
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        touchStartX = null;
        touchStartY = null;
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
            if (deltaX < 0) next();
            else previous();
        }
    }, { passive: true });

    return { overlay, open, close, updateImage, setActiveIndex: (index) => { activeIndex = index; } };
};