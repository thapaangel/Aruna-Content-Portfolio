// ===== MOBILE NAVIGATION =====
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

function setMenu(open) {
    navLinks.classList.toggle("active", open);
    menuBtn.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
}

menuBtn.addEventListener("click", function () {
    setMenu(!navLinks.classList.contains("active"));
});

// CLOSE MENU AFTER CLICKING A LINK
navLinks.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
        setMenu(false);
    });
});

// ===== AUTOMATIC COPYRIGHT YEAR =====
document.getElementById("year").textContent = new Date().getFullYear();

// ===== HEADER STYLE, PROGRESS BAR, BACK-TO-TOP =====
const header = document.getElementById("siteHeader");
const progress = document.getElementById("scrollProgress");
const toTop = document.getElementById("toTop");

function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle("scrolled", y > 40);
    toTop.classList.toggle("show", y > 600);
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll("section[id]");
const navAnchors = navLinks.querySelectorAll("a");

const navObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (entry.isIntersecting) {
            navAnchors.forEach(function (a) {
                a.classList.toggle("current", a.getAttribute("href") === "#" + entry.target.id);
            });
        }
    });
}, { rootMargin: "-45% 0px -50% 0px" });

sections.forEach(function (s) { navObserver.observe(s); });

// ===== REVEAL ON SCROLL =====
const revealObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            obs.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(function (el, i) {
    el.style.transitionDelay = (i % 4) * 0.08 + "s";
    revealObserver.observe(el);
});

// ===== COUNT-UP STATS =====
const counters = document.querySelectorAll("[data-count]");

const countObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const duration = 1400;
        const start = performance.now();

        function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + (p === 1 ? suffix : "");
            if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        obs.unobserve(el);
    });
}, { threshold: 0.6 });

counters.forEach(function (c) { countObserver.observe(c); });

// ===== MISSING IMAGE FALLBACK =====
document.querySelectorAll("img").forEach(function (img) {
    function markMissing() {
        const box = img.closest(".gallery-item, .story-img, .moment, .hero-frame, .about-visual");
        if (box) box.classList.add("img-missing");
    }
    img.addEventListener("error", markMissing);
    if (img.complete && img.naturalWidth === 0) markMissing();
});

// ===== GALLERY FILTER =====
const filterBar = document.getElementById("filterBar");
const galleryItems = Array.from(document.querySelectorAll(".gallery-item"));

filterBar.addEventListener("click", function (e) {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;

    filterBar.querySelectorAll(".filter-btn").forEach(function (b) {
        b.classList.toggle("active", b === btn);
    });

    const filter = btn.dataset.filter;
    galleryItems.forEach(function (item) {
        const show = filter === "all" || item.dataset.category === filter;
        item.classList.toggle("hide", !show);
    });
});

// ===== LIGHTBOX =====
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCaption = document.getElementById("lbCaption");
let lbIndex = 0;
let lbList = [];

function visibleItems() {
    return galleryItems.filter(function (i) { return !i.classList.contains("hide"); });
}

function showLightbox(index) {
    lbIndex = (index + lbList.length) % lbList.length;
    const item = lbList[lbIndex];
    const img = item.querySelector("img");
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = img.alt + "  (" + (lbIndex + 1) + " / " + lbList.length + ")";
}

function openLightbox(item) {
    lbList = visibleItems();
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    showLightbox(lbList.indexOf(item));
}

function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

galleryItems.forEach(function (item) {
    item.addEventListener("click", function () {
        if (!item.classList.contains("img-missing")) openLightbox(item);
    });
});

document.getElementById("lbClose").addEventListener("click", closeLightbox);
document.getElementById("lbPrev").addEventListener("click", function () { showLightbox(lbIndex - 1); });
document.getElementById("lbNext").addEventListener("click", function () { showLightbox(lbIndex + 1); });

lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showLightbox(lbIndex - 1);
    if (e.key === "ArrowRight") showLightbox(lbIndex + 1);
});

// ===== DRAG-TO-SCROLL MOMENTS STRIP =====
const strip = document.getElementById("momentsStrip");
let isDown = false, startX = 0, startScroll = 0;

strip.addEventListener("mousedown", function (e) {
    isDown = true;
    strip.classList.add("dragging");
    startX = e.pageX;
    startScroll = strip.scrollLeft;
});
window.addEventListener("mouseup", function () {
    isDown = false;
    strip.classList.remove("dragging");
});
strip.addEventListener("mousemove", function (e) {
    if (!isDown) return;
    e.preventDefault();
    strip.scrollLeft = startScroll - (e.pageX - startX);
});