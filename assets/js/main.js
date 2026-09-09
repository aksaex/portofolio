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
    // 1.  ELEMEN DOM
    // ============================================================
    const navbar = document.querySelector('.navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const backToTopBtn = document.getElementById('backToTop');
    const yearSpan = document.getElementById('year');
    const sections = document.querySelectorAll('section');
    const heroTyping = document.querySelector('.hero__typing');

    // ============================================================
    // 2.  UTILITY: THROTTLE + RAF
    // ============================================================
    // Fungsi throttle sederhana menggunakan requestAnimationFrame
    // untuk menghindari pemborosan repaint saat scroll.
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

        // Toggle aria-expanded pada tombol
        hamburger.setAttribute('aria-expanded', isMenuOpen);

        // Toggle hidden state pada navigasi
        navLinks.setAttribute('aria-hidden', !isMenuOpen);

        // Tambahkan/kurangi kelas aktif untuk styling
        hamburger.classList.toggle('active', isMenuOpen);
        navLinks.classList.toggle('open', isMenuOpen);

        // Lock scroll body saat menu terbuka
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    }

    // Event: Klik hamburger
    if (hamburger) {
        hamburger.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleMenu();
        });
    }

    // Event: Tutup menu dengan tombol ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && isMenuOpen) {
            toggleMenu(false);
            // Kembalikan fokus ke tombol hamburger setelah menu tertutup
            if (hamburger) hamburger.focus();
        }
    });

    // Event: Klik di luar menu (overlay) untuk menutup
    document.addEventListener('click', function (e) {
        if (isMenuOpen && navLinks && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
            toggleMenu(false);
        }
    });

    // Tutup menu saat link di dalam nav diklik (untuk navigasi)
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
        if (window.scrollY > 20) {
            navbar.classList.add('navbar--scrolled');
        } else {
            navbar.classList.remove('navbar--scrolled');
        }
    }

    // ============================================================
    // 6.  BACK TO TOP: MUNCUL & SEMBUNYI
    // ============================================================
    function updateBackToTop() {
        if (window.scrollY > 600) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }

    // Handler scroll terpadu (dengan RAF throttle)
    function onScroll() {
        throttleRAF(function () {
            updateNavbar();
            updateBackToTop();
        });
    }

    // Pasang listener scroll dengan passive: true untuk performa
    window.addEventListener('scroll', onScroll, { passive: true });

    // Panggil sekali di awal untuk set state awal
    updateNavbar();
    updateBackToTop();

    // Event klik Back to Top
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // Setelah diklik, fokus kembali ke tombol (opsional)
            // tapi karena kita scroll ke atas, biarkan saja.
        });
    }

    // ============================================================
    // 7.  TYPING EFFECT (Hero)
    //     Ringan, menggunakan requestAnimationFrame untuk timing.
    //     Hanya berjalan jika elemen ada dan tidak reduced-motion.
    // ============================================================
    const typingWords = ['AI Engineer', 'Software Developer', 'Tech Mentor', 'Problem Solver'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingTimer = null;

    // Cek preferensi pengguna untuk gerakan
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

            // Logika pergantian kata
            if (!isDeleting && charIndex === currentWord.length) {
                // Selesai mengetik, tunggu sebentar lalu hapus
                isDeleting = true;
                typingTimer = setTimeout(typeEffect, 2000);
                return;
            }

            if (isDeleting && charIndex === 0) {
                // Selesai menghapus, pindah ke kata berikutnya
                isDeleting = false;
                wordIndex = (wordIndex + 1) % typingWords.length;
                typingTimer = setTimeout(typeEffect, 400);
                return;
            }

            // Kecepatan mengetik/hapus
            const speed = isDeleting ? 40 : 80;
            typingTimer = setTimeout(typeEffect, speed);
        }

        // Mulai efek setelah delay singkat
        typingTimer = setTimeout(typeEffect, 600);
    } else if (heroTyping && prefersReducedMotion) {
        // Jika pengguna mengurangi gerakan, langsung tampilkan kata pertama
        heroTyping.textContent = typingWords[0];
    }

    // ============================================================
    // 8.  SCROLL REVEAL (Intersection Observer)
    //     Menambahkan kelas 'is-visible' pada section/project-card
    //     yang masuk ke viewport.
    // ============================================================
    const revealElements = document.querySelectorAll('.section, .project-card, .experience__item, .education__item, .cert-card, .achievements__list li');

    // Periksa apakah browser mendukung IntersectionObserver
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // Hentikan observasi setelah elemen terlihat (hemat memori)
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(function (el) {
            // Tambahkan opacity awal di CSS (fallback), tapi di sini kita set via JS
            // agar tidak mengganggu jika JS mati.
            el.style.opacity = '0';
            el.style.transform = 'translateY(24px)';
            el.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
            revealObserver.observe(el);
        });

        // Tambahkan CSS dynamically untuk state 'is-visible'
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
                    .is-visible {
                        opacity: 1 !important;
                        transform: translateY(0) !important;
                    }
                    /* Jika pengguna mengurangi gerakan, tampilkan langsung */
                    @media (prefers-reduced-motion: reduce) {
                        .section, .project-card, .experience__item, .education__item, .cert-card, .achievements__list li {
                            opacity: 1 !important;
                            transform: none !important;
                            transition: none !important;
                        }
                    }
                `;
        document.head.appendChild(styleSheet);

    } else {
        // Fallback untuk browser lama: langsung tampilkan semua
        revealElements.forEach(function (el) {
            el.style.opacity = '1';
            el.style.transform = 'none';
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
    // 10. CLEANUP (Opsional, untuk mencegah memory leak)
    // ============================================================
    // Tidak ada event listener abadi yang perlu dibersihkan selain
    // scroll & resize. Karena kita menggunakan passive, dan observer
    // sudah di-unobserve, ini sudah aman.

    console.log('🚀 Muh. Aksa Portfolio — UI/UX Professional Edition (Enhanced)');
})();