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

        // Update Weather if loaded
        const weatherTextEl = document.getElementById('weather-text');
        if (weatherTextEl) {
            const weatherKey = weatherTextEl.getAttribute('data-weather-key');
            if (weatherKey && translations[lang][weatherKey]) {
                const currentText = weatherTextEl.innerText;
                const tempPart = currentText.split('|')[0]; // Keep temperature
                weatherTextEl.innerText = `${tempPart}| ${translations[lang][weatherKey]}`;
            }
        }
    }
}

// Map Route Toggle
const mapFrame = document.getElementById('map-frame');
const showRouteBtn = document.getElementById('show-route-btn');
const originalMapSrc = "https://maps.google.com/maps?q=46.392028,8.066750&hl=en&z=17&output=embed";
const routeMapSrc = "https://maps.google.com/maps?saddr=Bettmeralp+Bahnen&daddr=46.392028,8.066750&dirflg=w&hl=en&z=16&output=embed";
let isRouteShown = false;

if (showRouteBtn) {
    showRouteBtn.addEventListener('click', () => {
        if (!isRouteShown) {
            mapFrame.src = routeMapSrc;
            showRouteBtn.setAttribute('data-i18n', 'location.hide_route');
            showRouteBtn.innerText = translations[new LanguageManager().currentLang]['location.hide_route'];
            isRouteShown = true;
        } else {
            mapFrame.src = originalMapSrc;
            showRouteBtn.setAttribute('data-i18n', 'location.show_route');
            showRouteBtn.innerText = translations[new LanguageManager().currentLang]['location.show_route'];
            isRouteShown = false;
        }
    });
}

// Weather Functionality
async function fetchWeather() {
    const iconEl = document.getElementById('weather-icon');
    const textEl = document.getElementById('weather-text');

    if (!iconEl || !textEl) return;

    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=46.392&longitude=8.0667&current=temperature_2m,weather_code&timezone=Europe%2FBerlin');
        const data = await response.json();
        const current = data.current;
        const temp = Math.round(current.temperature_2m);
        const code = current.weather_code;

        let weatherKey = 'weather.clear';
        let icon = '☀️';

        // Map WMO codes
        if (code === 0) { weatherKey = 'weather.clear'; icon = '☀️'; }
        else if (code >= 1 && code <= 3) { weatherKey = 'weather.clouds'; icon = '☁️'; }
        else if (code >= 45 && code <= 48) { weatherKey = 'weather.fog'; icon = '🌫️'; }
        else if (code >= 51 && code <= 67) { weatherKey = 'weather.rain'; icon = '🌧️'; }
        else if (code >= 71 && code <= 77) { weatherKey = 'weather.snow'; icon = '❄️'; }
        else if (code >= 80 && code <= 82) { weatherKey = 'weather.rain'; icon = '🌧️'; }
        else if (code >= 85 && code <= 86) { weatherKey = 'weather.snow'; icon = '❄️'; }
        else if (code >= 95) { weatherKey = 'weather.thunderstorm'; icon = '⚡'; }

        iconEl.innerText = icon;
        // Check if LanguageManager is available
        const lang = localStorage.getItem('alpenhof_lang') || 'en';
        const desc = translations[lang][weatherKey] || translations['en'][weatherKey];
        textEl.innerText = `${temp}°C | ${desc}`;
        textEl.setAttribute('data-weather-key', weatherKey); // Store key for dynamic language switch

    } catch (error) {
        console.error('Error fetching weather:', error);
        textEl.innerText = 'Unavailable';
    }
}

// Booking Form Handler
const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(bookingForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const checkin = formData.get('checkin');
        const checkout = formData.get('checkout');
        const guests = formData.get('guests');
        const message = formData.get('message');

        const subject = `Booking Request: Alpenhof - ${name}`;
        const body = `Name: ${name}
Email: ${email}
Check-in: ${checkin}
Check-out: ${checkout}
Guests: ${guests}

Message:
${message}`;

        window.location.href = `mailto:alpenhof.bettmeralp@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
}

// Initialize Language Manager after DOM Load
document.addEventListener('DOMContentLoaded', () => {
    new LanguageManager();
    fetchWeather();

    // Set min date for checkin to today
    const today = new Date().toISOString().split('T')[0];
    const checkinInput = document.getElementById('checkin');
    if (checkinInput) {
        checkinInput.min = today;
        checkinInput.addEventListener('change', () => {
            document.getElementById('checkout').min = checkinInput.value;
        });
    }
});

