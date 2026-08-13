import { graphicProjects } from "../data/graphicProjects.js";
import { createGraphicLightbox } from "./graphicLightbox.js";

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const createPreviewCard = (container, projects) => {
    const state = {
        index: 0,
        timer: null,
        activeImage: null,
    };

    const shell = document.createElement("div");
    shell.className = "flex h-full flex-col";

    const badge = document.createElement("div");
    // badge.className = "mb-4 inline-flex w-fit items-center rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-violet-200";
    // badge.textContent = "Featured";

    const title = document.createElement("h3");
    title.className = "text-2xl font-semibold text-white sm:text-[1.7rem]";
    // title.textContent = "Graphic Design Gallery";

    const meta = document.createElement("p");
    meta.className = "mt-2 text-xs uppercase tracking-[0.32em] text-zinc-400";
    // meta.textContent = "Creative Design";

    const previewFrame = document.createElement("div");
    previewFrame.className = "relative mt-5 overflow-hidden rounded-[24px] border border-white/10 bg-[rgba(255,255,255,0.06)] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.18)]";

    const preview = document.createElement("img");
    preview.className = "h-72 w-full rounded-[18px] object-contain transition duration-700 ease-out sm:h-80 lg:h-96";
    preview.alt = "Graphic design preview";
    preview.loading = "lazy";

    const previewGlow = document.createElement("div");
    previewGlow.className = "pointer-events-none absolute inset-0 rounded-[24px] bg-gradient-to-br from-violet-500/10 via-transparent to-orange-500/10";

    const thumbRow = document.createElement("div");
    thumbRow.className = "mt-4 grid grid-cols-5 gap-2";

    const setPreview = (index) => {
        const item = projects[index];
        if (!item) return;

        state.index = index;
        const img = new Image();
        img.src = item.image;

        preview.src = item.image;
        preview.alt = `${item.title} preview`;
        state.activeImage = item.image;
        Array.from(thumbRow.children).forEach((thumbButton, thumbIndex) => {
            thumbButton.classList.toggle("border-violet-400/70", thumbIndex === index);
            thumbButton.classList.toggle("ring-2", thumbIndex === index);
            thumbButton.classList.toggle("ring-violet-400/30", thumbIndex === index);
            thumbButton.setAttribute("aria-current", String(thumbIndex === index));
        });
    };

    const startRotation = () => {
        if (prefersReducedMotion) return;
        if (state.timer) window.clearInterval(state.timer);
        state.timer = window.setInterval(() => {
            const nextIndex = (state.index + 1) % projects.length;
            setPreview(nextIndex);
        }, 3000);
    };

    const createThumb = (project, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "overflow-hidden rounded-lg border border-white/10 bg-white/5 transition duration-300 hover:border-violet-400/50 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111]";
        button.setAttribute("aria-label", `Show ${project.title}`);
        button.setAttribute("aria-current", String(index === 0));

        const thumb = document.createElement("img");
        thumb.src = project.thumb;
        thumb.alt = `${project.title} thumbnail`;
        thumb.className = "h-14 w-full object-cover";
        thumb.loading = "lazy";

        button.appendChild(thumb);
        button.addEventListener("click", () => {
            setPreview(index);
            startRotation();
        });
        return button;
    };

    const lightbox = createGraphicLightbox(projects, 0, (index) => {
        state.index = index;
        setPreview(index);
    });

    const openLightbox = () => {
        lightbox.open(state.index);
    };

    previewFrame.addEventListener("click", () => openLightbox());

    previewFrame.append(previewGlow, preview);
    thumbRow.append(...projects.map(createThumb));

    shell.append(badge, title, meta, previewFrame, thumbRow);
    container.appendChild(shell);

    setPreview(0);
    startRotation();
};

export const initGraphicGallery = () => {
    const host = document.querySelector("[data-graphic-gallery]");
    if (!host || !graphicProjects.length) return;

    createPreviewCard(host, graphicProjects);
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGraphicGallery, { once: true });
} else {
    initGraphicGallery();
}