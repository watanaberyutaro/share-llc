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
        const prevBtn = document.querySelector('.index-slider-prev');
        const nextBtn = document.querySelector('.index-slider-next');

        if (!container || !prevBtn || !nextBtn) return;

        const originalCards = Array.from(container.querySelectorAll('.col'));
        if (originalCards.length === 0) return;

        const totalCards = originalCards.length;
        let currentIndex = totalCards; // 複製されたカードの最初のセットから開始
        let isTransitioning = false;

        // 無限ループのために、カードを前後に複製
        const clonedCardsStart = originalCards.map(card => card.cloneNode(true));
        const clonedCardsEnd = originalCards.map(card => card.cloneNode(true));

        // 前に複製を追加
        clonedCardsStart.forEach(card => container.insertBefore(card, container.firstChild));
        // 後ろに複製を追加
        clonedCardsEnd.forEach(card => container.appendChild(card));

        // カードの幅を取得
        function getCardWidth() {
            const firstCard = container.querySelector('.col');
            return firstCard ? firstCard.offsetWidth + 30 : 410; // カード幅 + gap
        }

        // スライド位置を更新
        function updateSlidePosition(withTransition = true) {
            const cardWidth = getCardWidth();
            if (!withTransition) {
                container.style.transition = 'none';
            } else {
                container.style.transition = 'transform 0.5s ease';
            }
            container.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
        }

        // 前へボタン
        prevBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            isTransitioning = true;

            currentIndex--;
            updateSlidePosition();

            setTimeout(() => {
                if (currentIndex === 0) {
                    // 最初の複製セットに到達したら、元のセットの最後にジャンプ
                    currentIndex = totalCards;
                    updateSlidePosition(false);
                }
                isTransitioning = false;
            }, 500);
        });

        // 次へボタン
        nextBtn.addEventListener('click', () => {
            if (isTransitioning) return;
            isTransitioning = true;

            currentIndex++;
            updateSlidePosition();

            setTimeout(() => {
                if (currentIndex === totalCards * 2) {
                    // 最後の複製セットに到達したら、元のセットの最初にジャンプ
                    currentIndex = totalCards;
                    updateSlidePosition(false);
                }
                isTransitioning = false;
            }, 500);
        });

        // リサイズ時に位置を再計算
        window.addEventListener('resize', () => updateSlidePosition(false));

        // 初期位置設定（最初の元のカードセットにセット）
        updateSlidePosition(false);
    }

    // ページ読み込み時に実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadIndexInterviews);
    } else {
        loadIndexInterviews();
    }
})();
