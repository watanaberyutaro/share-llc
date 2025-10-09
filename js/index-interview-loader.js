// indexページの社員インタビュー読み込み
(function() {
    // インタビューデータを取得
    async function loadIndexInterviews() {
        try {
            const response = await fetch('./data/interviews.json');
            if (!response.ok) {
                throw new Error('インタビューデータの読み込みに失敗しました');
            }
            const interviews = await response.json();

            // 日付順でソート（新しい順）
            interviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            // 最大6件まで表示
            const displayInterviews = interviews.slice(0, 6);

            displayIndexInterviews(displayInterviews);
            initIndexSlider();
        } catch (error) {
            console.error('Error loading interviews:', error);
        }
    }

    // インタビューカードを表示
    function displayIndexInterviews(interviews) {
        const container = document.getElementById('indexInterviewList');
        if (!container) return;

        if (interviews.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">インタビュー記事がありません。</p>';
            return;
        }

        container.innerHTML = interviews.map((interview, index) => {
            // タイトルを改行で分割
            const titleLines = interview.title.split('\n').filter(line => line.trim());
            const formattedTitle = titleLines.map(line => `${line}<br>`).join('\n                                    ');

            // ラベルのHTML生成
            const labelsHTML = interview.labels && interview.labels.length > 0
                ? `<div class="text-labels">
                    ${interview.labels.map(label => `<span class="label">${label}</span>`).join('')}
                   </div>`
                : '';

            // 本文の抜粋を生成（最初の100文字）
            const excerpt = interview.content
                ? interview.content.substring(0, 100).replace(/\n/g, '') + '...'
                : '';

            const excerptHTML = excerpt
                ? `<div class="text-excerpt">${excerpt}</div>`
                : '';

            return `
                <a href="interview-detail.html?id=${interview.id}" class="col">
                    <div class="col-staff">
                        <div class="staff-portrait">
                            <img src="${interview.image}" alt="${interview.staffName}" loading="lazy">
                        </div>
                        <div class="col-bg">
                            <div class="bg0${index + 1} is-active">
                                <figure class="bg-thumb01">
                                    <img src="${interview.image}" alt="" loading="lazy">
                                </figure>
                            </div>
                        </div>
                    </div>
                    <div class="col-text">
                        <h3>${formattedTitle}</h3>
                        ${labelsHTML}
                        ${excerptHTML}
                        <div class="text-position">
                            <span class="role">${interview.position}</span>
                        </div>
                        <div class="text-name">
                            <span class="name">${interview.staffName}</span>
                            <span class="submit">${interview.joinDate}</span>
                        </div>
                    </div>
                </a>
            `;
        }).join('');
    }

    // スライダー初期化
    function initIndexSlider() {
        const container = document.getElementById('indexInterviewList');
        const prevBtn = document.querySelector('.recruit-interview-section .recruit-interview-prev');
        const nextBtn = document.querySelector('.recruit-interview-section .recruit-interview-next');

        if (!container || !prevBtn || !nextBtn) return;

        const originalCards = Array.from(container.querySelectorAll('.col'));
        if (originalCards.length === 0) return;

        const totalCards = originalCards.length;
        let currentIndex = totalCards;
        let isTransitioning = false;

        // 無限ループのために前後に複製
        const clonedCardsStart = originalCards.map(card => card.cloneNode(true));
        const clonedCardsEnd = originalCards.map(card => card.cloneNode(true));

        clonedCardsStart.forEach(card => container.insertBefore(card, container.firstChild));
        clonedCardsEnd.forEach(card => container.appendChild(card));

        function getCardWidth() {
            const firstCard = container.querySelector('.col');
            return firstCard ? firstCard.offsetWidth + 30 : 410;
        }

        function updateSlidePosition(withTransition = true) {
            const cardWidth = getCardWidth();
            if (!withTransition) {
                container.style.transition = 'none';
            } else {
                container.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            }
            container.style.transform = `translate3d(-${currentIndex * cardWidth}px, 0, 0)`;
        }

        prevBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex--;
            updateSlidePosition();

            setTimeout(() => {
                if (currentIndex === 0) {
                    currentIndex = totalCards;
                    updateSlidePosition(false);
                }
                isTransitioning = false;
            }, 600);
        });

        nextBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            isTransitioning = true;
            currentIndex++;
            updateSlidePosition();

            setTimeout(() => {
                if (currentIndex === totalCards * 2) {
                    currentIndex = totalCards;
                    updateSlidePosition(false);
                }
                isTransitioning = false;
            }, 600);
        });

        window.addEventListener('resize', () => updateSlidePosition(false));
        updateSlidePosition(false);
    }

    // ページ読み込み時に実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadIndexInterviews);
    } else {
        loadIndexInterviews();
    }
})();
