/**
 * Main Application JavaScript
 * Extracted and cleaned from WordPress theme
 */

(function ($, root, undefined) {

    jQuery(function ($) {
        // ハンバーガーメニュー (Hamburger Menu)
        $('.navToggle').click(function () {
            $(this).toggleClass('active');
            $('.header-nav').toggleClass('show', $(this).hasClass('active'));
            $('body').toggleClass('nav-open', $(this).hasClass('active'));
        });

        // メニューの開閉（レスポンシブ対応）(Menu Toggle - Responsive)
        function toggleMenu() {
            if ($(window).width() <= 640) {
                $('.parent span').off('click').on('click', function () {
                    $(this).toggleClass('active').next('.child').slideToggle(100);
                });
            } else {
                $('.parent span').off('click').on('click', function () {
                    $('.parent span').not(this).removeClass('active').next('.child').slideUp(100);
                    $(this).toggleClass('active').next('.child').slideToggle(100);
                });
            }
        }

        toggleMenu();
        $(window).on('resize', toggleMenu);

        // Slick slider 設定 (Slick Slider Configuration)
        if (window.SiteConfig && window.SiteConfig.features.enableSlider && typeof $.fn.slick !== 'undefined') {
            if ($('.beltSlider').length) {
                $('.beltSlider').slick(window.SiteConfig.sliders.belt);
            }

            if ($('.business-image').length) {
                $('.business-image').slick(window.SiteConfig.sliders.business);
            }
        }

        // 背景のスライドアニメーション (Background Slide Animation)
        $('.col-bg').each(function () {
            const bgElements = $(this).find('div');
            let currentIndex = 0;

            function showNextBackground() {
                const currentElement = bgElements.eq(currentIndex);
                const nextIndex = (currentIndex + 1) % bgElements.length;
                const nextElement = bgElements.eq(nextIndex);

                currentElement.removeClass('is-active').addClass('is-active-out');
                nextElement.removeClass('is-active-out').addClass('is-active');
                currentIndex = nextIndex;
            }

            if (bgElements.length > 1) {
                const interval = window.SiteConfig ? window.SiteConfig.animations.backgroundSlideInterval : 1700;
                setInterval(showNextBackground, interval);
            }
        });

        // フィルターボックスのイベント設定 (Filter Box Event Setup)
        function setFilterBoxEvent() {
            if (window.matchMedia('(max-width: 640px)').matches) {
                $('.filter-box dl dt').off('click').on('click', function () {
                    $(this).next().slideToggle();
                    $(this).toggleClass('active');
                });
            } else {
                $('.filter-box dl dt').off('click');
            }
        }

        setFilterBoxEvent();
        $(window).on('resize', setFilterBoxEvent);
    });

    // アニメーションのループ処理 (Animation Loop Processing)
    document.addEventListener('DOMContentLoaded', () => {
        const animations = document.querySelectorAll('.js-animation');
        const interval = window.SiteConfig ? window.SiteConfig.animations.flipInterval : 2500;

        animations.forEach((animation, index) => {
            let isFlipped = false;
            setInterval(() => {
                setTimeout(() => {
                    animation.classList.toggle('flipped', !isFlipped);
                    isFlipped = !isFlipped;
                }, index * 500);
            }, interval);
        });
    });

    // スクロールによるナビゲーションのアクティブ化 (Scroll-based Navigation Activation)
    document.addEventListener('DOMContentLoaded', function () {
        const sections = document.querySelectorAll('.content-block > .section-block');
        const navLinks = document.querySelectorAll('.content-nav .nav-list li');

        if (sections.length && navLinks.length) {
            window.addEventListener('scroll', function () {
                let currentSection = '';

                sections.forEach((section) => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.offsetHeight;
                    if (window.scrollY >= sectionTop - sectionHeight / 16) {
                        currentSection = section.getAttribute('id');
                    }
                });

                navLinks.forEach((li) => {
                    const anchor = li.querySelector('a');
                    if (anchor) {
                        li.classList.toggle('active', anchor.getAttribute('href').substring(1) === currentSection);
                    }
                });
            });
        }
    });

    // 施設タブ機能 (Facility Tab Functionality)
    document.addEventListener('DOMContentLoaded', () => {
        const facilityLabels = document.querySelectorAll('.label-facility');
        const facilityContents = document.querySelectorAll('.facility-col');

        facilityLabels.forEach(label => {
            label.addEventListener('click', () => {
                const facilitySlug = label.getAttribute('data-facility-slug');

                // すべてのタブとコンテンツをリセット (Reset all tabs and contents)
                facilityLabels.forEach(l => l.classList.remove('active'));
                facilityContents.forEach(content => content.style.display = 'none');

                // クリックしたラベルにactiveクラスを追加 (Add active class to clicked label)
                label.classList.add('active');

                // 対応する施設内容を表示 (Show corresponding facility content)
                const target = document.getElementById(`facility-${facilitySlug}`);
                if (target) {
                    target.style.display = 'block';
                }
            });
        });
    });

    // テキストノード最適化 (Text Node Optimization)
    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll("br").forEach(function (br) {
            const style = window.getComputedStyle(br);
            if (style.display === "none") {
                // brがdisplay:noneなら、それに隣接する空白テキストノードを削除
                const prev = br.previousSibling;
                const next = br.nextSibling;

                if (prev && prev.nodeType === 3 && !prev.textContent.trim()) {
                    prev.parentNode.removeChild(prev);
                }
                if (next && next.nodeType === 3 && !next.textContent.trim()) {
                    next.parentNode.removeChild(next);
                }
            }
        });
    });

    // 初期化関数 (Initialization Functions)
    function initializeComponents() {
        // Object-fit-images polyfill の初期化
        if (typeof objectFitImages !== 'undefined') {
            objectFitImages();
        }

        // Lightbox の初期化
        if (typeof lightbox !== 'undefined' && lightbox.init) {
            lightbox.init();
        }
    }

    // DOMContentLoaded または即座に実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeComponents);
    } else {
        initializeComponents();
    }

})(jQuery, this);