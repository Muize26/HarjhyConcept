const nav = document.getElementById("main-nav");
const navToggle = document.getElementById("nav-toggle");
const mobileMenu = document.getElementById("mobile-menu");
const navLinks = document.querySelectorAll(".nav-link");
const mobileLinks = document.querySelectorAll(".mobile-nav-link");
const sections = Array.from(document.querySelectorAll("main section[id]"));

let scrollTick = false;

const setActiveLink = (id) => {
    const activeId = id || "home";

    navLinks.forEach((link) => {
        link.classList.toggle("nav-link-active", link.dataset.navLink === activeId);
    });

    mobileLinks.forEach((link) => {
        link.classList.toggle(
            "mobile-nav-link-active",
            link.dataset.navLink === activeId,
        );
    });
};

const closeMobileMenu = () => {
    if (!mobileMenu || !navToggle) return;

    mobileMenu.classList.remove("mobile-menu-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
};

const openMobileMenu = () => {
    if (!mobileMenu || !navToggle) return;

    mobileMenu.classList.add("mobile-menu-open");
    navToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
};

const scrollToSection = (targetId) => {
    const target = document.getElementById(targetId);
    if (!target) return;

    const offset = 104;
    const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: targetPosition, behavior: "smooth" });
};

if (navToggle) {
    navToggle.addEventListener("click", () => {
        const isOpen = navToggle.getAttribute("aria-expanded") === "true";
        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
}

[...mobileLinks, ...navLinks].forEach((link) => {
    link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");
        if (href && href.charAt(0) === "#") {
            const targetId = href.slice(1);
            if (targetId) {
                event.preventDefault();
                scrollToSection(targetId);
            }
        }

        if (window.innerWidth < 1024) {
            closeMobileMenu();
        }
    });
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeMobileMenu();
    }
});

const updateNavigation = () => {
    if (nav) {
        nav.classList.toggle("nav-scrolled", window.scrollY > 16);
    }

    const scrollPosition = window.scrollY + 140;
    let currentSection = "home";

    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;

        if (
            scrollPosition >= sectionTop &&
            scrollPosition < sectionTop + sectionHeight
        ) {
            currentSection = section.id;
        }
    });

    setActiveLink(currentSection);
};

const handleScroll = () => {
    if (scrollTick) return;
    scrollTick = true;

    window.requestAnimationFrame(() => {
        updateNavigation();
        scrollTick = false;
    });
};

window.addEventListener("scroll", handleScroll, { passive: true });

window.addEventListener("load", () => {
    updateNavigation();
});