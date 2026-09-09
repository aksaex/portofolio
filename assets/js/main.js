/**
 * ================================================================
 *  MAIN.JS — Muh. Aksa Portfolio
 *  Interaksi ringan, aksesibel, dan performant.
 *  Tidak ada rendering konten utama (semua sudah statis di HTML).
 * ================================================================
 */

(function () {
    'use strict';

    // ============================================================
    // 0.  TANDAI JS SUDAH JALAN (untuk CSS)
    // ============================================================
    document.documentElement.classList.add('js');
    document.body.classList.add('js-loaded');

    // ============================================================
    // 1.  ELEMEN DOM
    // ============================================================
    const navbar = document.querySelector('.navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const backToTopBtn = document.getElementById('backToTop');
    const yearSpan = document.getElementById('year');
    const heroTyping = document.querySelector('.hero__typing');

    // ============================================================
    // 2.  UTILITY: THROTTLE + RAF
    // ============================================================
    let ticking = false;

    function throttleRAF(callback) {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                callback();
                ticking = false;
            });
            ticking = true;
        }
    }

    // ============================================================
    // 3.  FOOTER: TAHUN DINAMIS
    // ============================================================
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // ============================================================
    // 4.  HAMBURGER MENU (Mobile)
    // ============================================================
    let isMenuOpen = false;

    function toggleMenu(open) {
        isMenuOpen = (open !== undefined) ? open : !isMenuOpen;

        if (hamburger) {
            hamburger.setAttribute('aria-expanded', isMenuOpen);
            hamburger.classList.toggle('active', isMenuOpen);
        }

        if (navLinks) {
            navLinks.setAttribute('aria-hidden', !isMenuOpen);
            navLinks.classList.toggle('open', isMenuOpen);
        }

        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    }

    if (hamburger) {
        hamburger.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleMenu();
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isMenuOpen) {
            toggleMenu(false);
            if (hamburger) hamburger.focus();
        }
    });

    document.addEventListener('click', function (e) {
        if (isMenuOpen && navLinks && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
            toggleMenu(false);
        }
    });

    if (navLinks) {
        navLinks.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (isMenuOpen) toggleMenu(false);
            });
        });
    }

    // ============================================================
    // 5.  NAVBAR: PERUBAHAN LATAR BELAKANG SAAT SCROLL
    // ============================================================
    function updateNavbar() {
        if (navbar) {
            if (window.scrollY > 20) {
                navbar.classList.add('navbar--scrolled');
            } else {
                navbar.classList.remove('navbar--scrolled');
            }
        }
    }

    // ============================================================
    // 6.  BACK TO TOP: MUNCUL & SEMBUNYI
    // ============================================================
    function updateBackToTop() {
        if (backToTopBtn) {
            if (window.scrollY > 600) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
    }

    function onScroll() {
        throttleRAF(function () {
            updateNavbar();
            updateBackToTop();
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    updateNavbar();
    updateBackToTop();

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ============================================================
    // 7.  TYPING EFFECT (Hero)
    // ============================================================
    const typingWords = ['AI Engineer', 'Software Developer', 'Tech Mentor', 'Problem Solver'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingTimer = null;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (heroTyping && !prefersReducedMotion) {
        function typeEffect() {
            const currentWord = typingWords[wordIndex];

            if (isDeleting) {
                heroTyping.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                heroTyping.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }

            if (!isDeleting && charIndex === currentWord.length) {
                isDeleting = true;
                typingTimer = setTimeout(typeEffect, 2000);
                return;
            }

            if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % typingWords.length;
                typingTimer = setTimeout(typeEffect, 400);
                return;
            }

            const speed = isDeleting ? 40 : 80;
            typingTimer = setTimeout(typeEffect, speed);
        }

        typingTimer = setTimeout(typeEffect, 600);
    } else if (heroTyping) {
        heroTyping.textContent = typingWords[0];
    }

    // ============================================================
    // 8.  SCROLL REVEAL (Intersection Observer) — DIPERBAIKI
    // ============================================================
    // Elemen yang akan diberi efek muncul saat discroll
    const revealElements = document.querySelectorAll(
        '.section, .project-card, .experience__item, .education__item, .cert-card, .achievements__list li'
    );

    // Jika tidak ada elemen, skip
    if (revealElements.length === 0) {
        console.warn('Tidak ada elemen untuk scroll reveal.');
    } else if ('IntersectionObserver' in window) {
        // Buat observer
        const revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        });

        // Mulai observe setiap elemen
        revealElements.forEach(function (el) {
            revealObserver.observe(el);
        });

        // Fallback: jika ada elemen yang belum terlihat setelah 2 detik,
        // kemungkinan observer tidak berjalan optimal di mobile.
        // Kita paksa tampilkan semua elemen yang masih tersembunyi.
        setTimeout(function () {
            revealElements.forEach(function (el) {
                if (!el.classList.contains('is-visible')) {
                    el.classList.add('is-visible');
                }
            });
        }, 2000);

        // Tambahkan CSS untuk transisi (hanya jika JS berjalan)
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            /* Efek awal: tersembunyi, hanya jika JS aktif */
            .js-loaded .section,
            .js-loaded .project-card,
            .js-loaded .experience__item,
            .js-loaded .education__item,
            .js-loaded .cert-card,
            .js-loaded .achievements__list li {
                opacity: 0;
                transform: translateY(24px);
                transition: opacity 0.7s ease, transform 0.7s ease;
            }

            /* Saat terlihat */
            .js-loaded .is-visible {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }

            /* Jika pengguna mengurangi gerakan, tampilkan langsung */
            @media (prefers-reduced-motion: reduce) {
                .js-loaded .section,
                .js-loaded .project-card,
                .js-loaded .experience__item,
                .js-loaded .education__item,
                .js-loaded .cert-card,
                .js-loaded .achievements__list li {
                    opacity: 1 !important;
                    transform: none !important;
                    transition: none !important;
                }
            }
        `;
        document.head.appendChild(styleSheet);

    } else {
        // Fallback untuk browser tanpa IntersectionObserver
        revealElements.forEach(function (el) {
            el.classList.add('is-visible');
        });
    }

    // ============================================================
    // 9.  PREVENT DEFAULT UNTUK ANCHOR # (jika ada)
    // ============================================================
    document.querySelectorAll('a[href="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
        });
    });

    // ============================================================
    // 10. LOG UNTUK DEBUG (bisa dihapus di production)
    // ============================================================
    console.log('🚀 Muh. Aksa Portfolio — JS loaded successfully.');
})();