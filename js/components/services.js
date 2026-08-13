const serviceItems = document.querySelectorAll(".services-content");

const revealServices = () => {
    serviceItems.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9) {
            setTimeout(() => item.classList.add("is-visible"), index * 90);
        }
    });
};

window.addEventListener("scroll", revealServices, { passive: true });
window.addEventListener("load", revealServices);