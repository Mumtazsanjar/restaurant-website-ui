/**
 * La Bella Cucina — Main JavaScript
 * Features:
 *  - Sticky navbar with scroll-triggered background
 *  - Mobile hamburger menu toggle
 *  - Active nav link highlighting on scroll
 *  - Menu tab switching
 *  - Intersection Observer scroll animations
 *  - Counter animation for stat numbers
 *  - Gallery lightbox with keyboard & prev/next navigation
 *  - Reservation form validation
 *  - Smooth scroll for anchor links
 *  - Back-to-top button
 *  - Footer current year
 */

'use strict';

/* ==========================================================================
   Utility helpers
   ========================================================================== */

/**
 * Throttle a function to limit how often it fires.
 * @param {Function} fn
 * @param {number} wait  milliseconds
 */
function throttle(fn, wait = 100) {
  let timer = null;
  return function (...args) {
    if (timer) return;
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, wait);
  };
}

/* ==========================================================================
   1. Sticky Navbar — background + shadow on scroll
   ========================================================================== */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', throttle(onScroll, 80), { passive: true });
  onScroll(); // run once on load
})();

/* ==========================================================================
   2. Active Nav Link — highlight section in viewport
   ========================================================================== */
(function initActiveNavLinks() {
  const navLinks = document.querySelectorAll('.nav-links .nav-link:not(.btn-reserve)');
  const sections = document.querySelectorAll('section[id]');

  function setActive() {
    const scrollY = window.scrollY + 100; // offset for navbar height

    sections.forEach((section) => {
      const sectionTop    = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId     = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', throttle(setActive, 100), { passive: true });
})();

/* ==========================================================================
   3. Mobile Hamburger Menu Toggle
   ========================================================================== */
(function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  function toggleMenu(open) {
    hamburger.classList.toggle('open', open);
    navLinks.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    // Prevent body scroll when menu is open
    document.body.style.overflow = open ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('open');
    toggleMenu(!isOpen);
  });

  // Close on nav link click
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      toggleMenu(false);
      hamburger.focus();
    }
  });

  // Close when clicking outside the menu
  document.addEventListener('click', (e) => {
    if (
      navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)
    ) {
      toggleMenu(false);
    }
  });
})();

/* ==========================================================================
   4. Menu Tabs
   ========================================================================== */
(function initMenuTabs() {
  const tabButtons  = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  if (!tabButtons.length) return;

  function activateTab(targetId) {
    tabButtons.forEach((btn) => {
      const isActive = btn.dataset.tab === targetId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    tabContents.forEach((content) => {
      const isActive = content.id === `tab-${targetId}`;
      content.classList.toggle('active', isActive);
    });
  }

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => activateTab(btn.dataset.tab));

    // Keyboard: arrow keys to navigate tabs
    btn.addEventListener('keydown', (e) => {
      const tabs = [...tabButtons];
      const idx  = tabs.indexOf(btn);
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        tabs[(idx + 1) % tabs.length].focus();
        activateTab(tabs[(idx + 1) % tabs.length].dataset.tab);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        tabs[(idx - 1 + tabs.length) % tabs.length].focus();
        activateTab(tabs[(idx - 1 + tabs.length) % tabs.length].dataset.tab);
      }
    });
  });
})();

/* ==========================================================================
   5. Scroll Reveal Animations (Intersection Observer)
   ========================================================================== */
(function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!revealElements.length) return;

  // Respect user's reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    revealElements.forEach((el) => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealElements.forEach((el) => observer.observe(el));
})();

/* ==========================================================================
   6. Counter Animation (Stats Bar)
   ========================================================================== */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800; // ms
    const start    = performance.now();

    if (prefersReducedMotion) {
      el.textContent = target.toLocaleString();
      return;
    }

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString();

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString();
      }
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => observer.observe(counter));
})();

/* ==========================================================================
   7. Gallery Lightbox
   ========================================================================== */
(function initLightbox() {
  const galleryItems  = document.querySelectorAll('.gallery-item');
  const lightbox      = document.getElementById('lightbox');
  const lightboxImg   = document.getElementById('lightboxImg');
  const closeBtn      = document.getElementById('lightboxClose');
  const prevBtn       = document.getElementById('lightboxPrev');
  const nextBtn       = document.getElementById('lightboxNext');

  if (!lightbox || !galleryItems.length) return;

  // Build ordered array of { src, alt } from gallery items
  const images = [...galleryItems].map((item) => ({
    src: item.dataset.src,
    alt: item.querySelector('img')?.alt || 'Gallery image',
  }));

  let currentIndex = 0;
  let previouslyFocused = null;

  function openLightbox(index) {
    currentIndex       = index;
    previouslyFocused  = document.activeElement;
    loadImage(currentIndex);
    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.setAttribute('hidden', '');
    document.body.style.overflow = '';
    if (previouslyFocused) previouslyFocused.focus();
  }

  function loadImage(index) {
    const { src, alt } = images[index];
    lightboxImg.style.opacity = '0';
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightboxImg.onload = () => {
      lightboxImg.style.transition = 'opacity 0.3s ease';
      lightboxImg.style.opacity    = '1';
    };
    // Toggle prev/next visibility
    prevBtn.style.display = images.length > 1 ? '' : 'none';
    nextBtn.style.display = images.length > 1 ? '' : 'none';
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % images.length;
    loadImage(currentIndex);
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    loadImage(currentIndex);
  }

  // Open on gallery item click
  galleryItems.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));

    // Keyboard: Enter or Space to open
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(i);
      }
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  prevBtn.addEventListener('click', showPrev);
  nextBtn.addEventListener('click', showNext);

  // Close on backdrop click
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (lightbox.hasAttribute('hidden')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft')  showPrev();
  });

  // Touch swipe support
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) {
      delta < 0 ? showNext() : showPrev();
    }
  }, { passive: true });
})();

/* ==========================================================================
   8. Reservation Form Validation
   ========================================================================== */
(function initReservationForm() {
  const form = document.getElementById('reservationForm');
  if (!form) return;

  const successMsg = document.getElementById('formSuccess');

  // Validation rules map: fieldId -> { errorId, validate, message }
  const rules = [
    {
      fieldId:  'firstName',
      errorId:  'firstNameError',
      validate: (v) => v.trim().length >= 2,
      message:  'Please enter your first name (min. 2 characters).',
    },
    {
      fieldId:  'lastName',
      errorId:  'lastNameError',
      validate: (v) => v.trim().length >= 2,
      message:  'Please enter your last name (min. 2 characters).',
    },
    {
      fieldId:  'email',
      errorId:  'emailError',
      validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
      message:  'Please enter a valid email address.',
    },
    {
      fieldId:  'date',
      errorId:  'dateError',
      validate: (v) => {
        if (!v) return false;
        const selected = new Date(v);
        const today    = new Date();
        today.setHours(0, 0, 0, 0);
        return selected >= today;
      },
      message: 'Please choose a date from today onwards.',
    },
    {
      fieldId:  'time',
      errorId:  'timeError',
      validate: (v) => v !== '',
      message:  'Please select a seating time.',
    },
    {
      fieldId:  'guests',
      errorId:  'guestsError',
      validate: (v) => v !== '',
      message:  'Please select the number of guests.',
    },
  ];

  function validateField(rule) {
    const field = document.getElementById(rule.fieldId);
    const error = document.getElementById(rule.errorId);
    if (!field || !error) return true;

    const isValid = rule.validate(field.value);
    field.classList.toggle('invalid', !isValid);
    error.textContent = isValid ? '' : rule.message;
    field.setAttribute('aria-invalid', String(!isValid));
    return isValid;
  }

  // Live validation on blur
  rules.forEach((rule) => {
    const field = document.getElementById(rule.fieldId);
    if (field) {
      field.addEventListener('blur', () => validateField(rule));
      field.addEventListener('input', () => {
        if (field.classList.contains('invalid')) validateField(rule);
      });
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Set min date for date input
    const dateInput = document.getElementById('date');
    if (dateInput && !dateInput.min) {
      const today   = new Date();
      const yyyy    = today.getFullYear();
      const mm      = String(today.getMonth() + 1).padStart(2, '0');
      const dd      = String(today.getDate()).padStart(2, '0');
      dateInput.min = `${yyyy}-${mm}-${dd}`;
    }

    const isFormValid = rules.every((rule) => validateField(rule));

    if (!isFormValid) {
      // Focus first invalid field for accessibility
      const firstInvalid = form.querySelector('.invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Simulate async submission
    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending...';

    setTimeout(() => {
      form.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-calendar-check" aria-hidden="true"></i> Confirm Reservation';
      successMsg.removeAttribute('hidden');
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Hide success message after 6 seconds
      setTimeout(() => successMsg.setAttribute('hidden', ''), 6000);
    }, 1400);
  });

  // Set min date on page load
  const dateInput = document.getElementById('date');
  if (dateInput) {
    const today   = new Date();
    const yyyy    = today.getFullYear();
    const mm      = String(today.getMonth() + 1).padStart(2, '0');
    const dd      = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }
})();

/* ==========================================================================
   9. Smooth Scroll for Nav / Anchor Links
   ========================================================================== */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navbarHeight = document.getElementById('navbar')?.offsetHeight || 70;
      const top = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ==========================================================================
   10. Back-to-Top Button
   ========================================================================== */
(function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;

  function toggleVisibility() {
    btn.classList.toggle('visible', window.scrollY > 500);
  }

  window.addEventListener('scroll', throttle(toggleVisibility, 100), { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ==========================================================================
   11. Footer — current year
   ========================================================================== */
(function setCurrentYear() {
  const el = document.getElementById('currentYear');
  if (el) el.textContent = new Date().getFullYear();
})();

/* ==========================================================================
   12. Hero background subtle parallax
   ========================================================================== */
(function initParallax() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  function onScroll() {
    const scrollY = window.scrollY;
    // Only apply when hero is in view
    if (scrollY < window.innerHeight) {
      heroBg.style.transform = `scale(1.05) translateY(${scrollY * 0.25}px)`;
    }
  }

  window.addEventListener('scroll', throttle(onScroll, 16), { passive: true });
})();
