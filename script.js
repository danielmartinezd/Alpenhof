// Navigation scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Simple animation observer for scroll reveal
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('section > div, .section-title, .extras-grid, .amenities-container').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'all 0.8s ease-out';
    observer.observe(el);
});

// Lightbox functionality
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const captionText = document.getElementById('caption');
const closeBtn = document.querySelector('.close');
const galleryImages = document.querySelectorAll('.gallery-item img');

let currentIndex = 0;

// Open Lightbox
function openLightbox(index) {
    currentIndex = index;
    const img = galleryImages[currentIndex];
    lightbox.style.display = 'block';
    lightboxImg.src = img.src;
    captionText.innerHTML = img.alt;
    document.body.style.overflow = 'hidden';
}

// Close Lightbox
function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Change Slide
// Made global so HTML onclick can access it, or attach event listeners in JS
window.changeSlide = function (n) {
    currentIndex += n;
    if (currentIndex >= galleryImages.length) {
        currentIndex = 0;
    } else if (currentIndex < 0) {
        currentIndex = galleryImages.length - 1;
    }
    openLightbox(currentIndex);
}

// Attach click events to images
galleryImages.forEach((img, index) => {
    img.addEventListener('click', () => {
        openLightbox(index);
    });
});

closeBtn.addEventListener('click', closeLightbox);

lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
        closeLightbox();
    }
});

// Keyboard Navigation
document.addEventListener('keydown', (e) => {
    if (lightbox.style.display === 'block') {
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            changeSlide(-1);
        } else if (e.key === 'ArrowRight') {
            changeSlide(1);
        }
    }
});

/**
 * Language Manager
 */
class LanguageManager {
    constructor() {
        this.currentLang = localStorage.getItem('alpenhof_lang') || 'en';
        this.select = document.getElementById('language-select');
        this.init();
    }

    init() {
        if (this.select) {
            this.select.value = this.currentLang;
            this.updateLanguage(this.currentLang);

            this.select.addEventListener('change', (e) => {
                this.currentLang = e.target.value;
                localStorage.setItem('alpenhof_lang', this.currentLang);
                this.updateLanguage(this.currentLang);
            });
        }
    }

    updateLanguage(lang) {
        document.documentElement.lang = lang;
        const elements = document.querySelectorAll('[data-i18n]');

        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                // If element has nested HTML (like spans), we might want to be careful
                // But for this use case, textContent is usually safer unless we need HTML in translations
                el.innerText = translations[lang][key];
            }
        });
    }
}

// Initialize Language Manager after DOM Load
document.addEventListener('DOMContentLoaded', () => {
    new LanguageManager();
});

