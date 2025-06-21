// Swipeable Content Functionality for Multiple Auto-Sliding Sections
const sections = ['vaccination', 'growth', 'care', 'gallery'];
const sectionStates = {};
let autoSlideIntervals = {};

// Initialize all sections
function initSwipeableContent() {
    sections.forEach(section => {
        initSection(section);
    });
    
    // Add keyboard support
    addKeyboardSupport();
}

// Initialize a specific section
function initSection(sectionName) {
    const slides = document.querySelectorAll(`[data-section="${sectionName}"] .swipe-slide`);
    const dots = document.querySelectorAll(`[data-section="${sectionName}"] .swipe-dot`);
    
    if (slides.length === 0) return;
    
    // Initialize section state
    sectionStates[sectionName] = {
        currentSlide: 0,
        totalSlides: slides.length,
        slides: slides,
        dots: dots
    };
    
    // Show first slide
    showSlide(0, sectionName);
    
    // Add touch/swipe support for this section
    addTouchSupport(sectionName);
    
    // Start auto-sliding for this section
    startAutoSlide(sectionName);
}

// Start auto-sliding for a specific section
function startAutoSlide(sectionName) {
    autoSlideIntervals[sectionName] = setInterval(() => {
        const state = sectionStates[sectionName];
        if (!state) return;
        
        // Auto-advance to next slide
        if (state.currentSlide < state.totalSlides - 1) {
            changeSlide(1, sectionName);
        } else {
            // Loop back to first slide
            state.currentSlide = -1; // Will become 0 after changeSlide(1)
            changeSlide(1, sectionName);
        }
    }, 3000); // 3 seconds
}

// Stop auto-sliding for a specific section
function stopAutoSlide(sectionName) {
    if (autoSlideIntervals[sectionName]) {
        clearInterval(autoSlideIntervals[sectionName]);
        autoSlideIntervals[sectionName] = null;
    }
}

// Restart auto-sliding for a specific section
function restartAutoSlide(sectionName) {
    stopAutoSlide(sectionName);
    startAutoSlide(sectionName);
}

// Show specific slide in a section
function showSlide(index, sectionName) {
    const state = sectionStates[sectionName];
    if (!state) return;
    
    // Hide all slides in this section
    state.slides.forEach(slide => {
        slide.classList.remove('active');
    });
    
    // Remove active class from all dots in this section
    state.dots.forEach(dot => {
        dot.classList.remove('active');
    });
    
    // Show current slide
    if (state.slides[index]) {
        state.slides[index].classList.add('active');
    }
    
    // Activate current dot
    if (state.dots[index]) {
        state.dots[index].classList.add('active');
    }
}

// Change slide (next/previous) for a specific section
function changeSlide(direction, sectionName) {
    const state = sectionStates[sectionName];
    if (!state) return;
    
    const newSlide = state.currentSlide + direction;
    
    // Allow looping for auto-slide
    if (newSlide >= state.totalSlides) {
        state.currentSlide = 0;
    } else if (newSlide < 0) {
        state.currentSlide = state.totalSlides - 1;
    } else {
        state.currentSlide = newSlide;
    }
    
    showSlide(state.currentSlide, sectionName);
    
    // Restart auto-slide timer when manually navigating
    restartAutoSlide(sectionName);
}

// Go to specific slide in a section
function goToSlide(index, sectionName) {
    const state = sectionStates[sectionName];
    if (!state || index < 0 || index >= state.totalSlides) return;
    
    state.currentSlide = index;
    showSlide(state.currentSlide, sectionName);
    
    // Restart auto-slide timer when manually navigating
    restartAutoSlide(sectionName);
}

// Add touch/swipe support for a specific section
function addTouchSupport(sectionName) {
    const swipeableContent = document.querySelector(`[data-section="${sectionName}"]`);
    if (!swipeableContent) return;
    
    let startX = 0;
    let endX = 0;
    let isDragging = false;
    
    // Touch events
    swipeableContent.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        stopAutoSlide(sectionName); // Pause auto-slide on touch
    });
    
    swipeableContent.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        endX = e.touches[0].clientX;
    });
    
    swipeableContent.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        const diffX = startX - endX;
        const threshold = 50; // Minimum swipe distance
        
        if (Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                // Swipe left - next slide
                changeSlide(1, sectionName);
            } else {
                // Swipe right - previous slide
                changeSlide(-1, sectionName);
            }
        }
        
        // Restart auto-slide after touch interaction
        setTimeout(() => restartAutoSlide(sectionName), 1000);
    });
    
    // Mouse events for desktop
    swipeableContent.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        isDragging = true;
        e.preventDefault();
        stopAutoSlide(sectionName); // Pause auto-slide on mouse interaction
    });
    
    swipeableContent.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        endX = e.clientX;
    });
    
    swipeableContent.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        const diffX = startX - endX;
        const threshold = 50;
        
        if (Math.abs(diffX) > threshold) {
            if (diffX > 0) {
                changeSlide(1, sectionName);
            } else {
                changeSlide(-1, sectionName);
            }
        }
        
        // Restart auto-slide after mouse interaction
        setTimeout(() => restartAutoSlide(sectionName), 1000);
    });
    
    // Prevent text selection during drag
    swipeableContent.addEventListener('selectstart', (e) => {
        if (isDragging) {
            e.preventDefault();
        }
    });
    
    // Pause auto-slide on hover
    swipeableContent.addEventListener('mouseenter', () => {
        stopAutoSlide(sectionName);
    });
    
    // Resume auto-slide when mouse leaves
    swipeableContent.addEventListener('mouseleave', () => {
        restartAutoSlide(sectionName);
    });
}

// Add keyboard support (affects the currently focused section)
function addKeyboardSupport() {
    document.addEventListener('keydown', (e) => {
        // Find the section that is currently in view or focused
        const visibleSection = findVisibleSection();
        if (!visibleSection) return;
        
        if (e.key === 'ArrowLeft') {
            changeSlide(-1, visibleSection);
        } else if (e.key === 'ArrowRight') {
            changeSlide(1, visibleSection);
        }
    });
}

// Find which section is currently visible in the viewport
function findVisibleSection() {
    for (const section of sections) {
        const element = document.querySelector(`[data-section="${section}"]`);
        if (element && isElementInViewport(element)) {
            return section;
        }
    }
    return null;
}

// Check if element is in viewport
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure DOM is fully ready
    setTimeout(() => {
        initSwipeableContent();
    }, 100);
});

// Export functions for global access
window.changeSlide = changeSlide;
window.goToSlide = goToSlide;
