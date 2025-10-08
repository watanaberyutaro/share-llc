// インデックスページのニュース読み込み
class IndexNewsLoader {
    constructor() {
        this.newsData = [];
    }

    async loadNews() {
        try {
            const response = await fetch('./data/news.json');
            const data = await response.json();
            this.newsData = data.articles || [];
            this.renderNewsTicker();
            this.renderNewsSection();
        } catch (error) {
            console.error('ニュースの読み込みに失敗しました:', error);
        }
    }

    renderNewsTicker() {
        const tickerScroll = document.querySelector('.ticker-scroll');
        if (!tickerScroll || this.newsData.length === 0) return;

        // 最新3件を取得
        const latestNews = this.newsData.slice(0, 3);

        const tickerHTML = latestNews.map(news => `
            <span class="ticker-item">
                <span class="ticker-date">${news.date}</span>
                <span class="ticker-text">【${news.category}】${news.title}</span>
            </span>
        `).join('');

        // シームレスなループのために2回繰り返す
        tickerScroll.innerHTML = tickerHTML + tickerHTML;
    }

    renderNewsSection() {
        const newsCol = document.getElementById('indexNewsList');
        if (!newsCol || this.newsData.length === 0) return;

        // 最新6件を取得
        const latestNews = this.newsData.slice(0, 6);

        // 最新のニュースIDを取得（最初の要素が最新）
        const latestNewsId = this.newsData.length > 0 ? this.newsData[0].id : null;

        const newsHTML = latestNews.map((news, index) => {
            const dateParts = news.date.split('.');
            const year = dateParts[0];
            const monthDay = dateParts.slice(1).join('.');
            // 最新のニュースのみNEWバッジを表示
            const newBadge = news.id === latestNewsId ? '<span class="badge">NEW</span>' : '';
            const imageHTML = news.image ? `<div class="col-image"><img src="${news.image}" alt="${news.title}"></div>` : '';

            return `
                <li>
                    <a href="news-detail.html?id=${news.id}">
                        ${imageHTML}
                        <div class="col-date">
                            <span class="year">${year}</span>
                            <span class="date">${monthDay}</span>
                        </div>
                        <div class="col-content">
                            <div class="content-header">
                                ${newBadge}
                                <span class="category">${news.category}</span>
                            </div>
                            <h3>${news.title}</h3>
                            <p>${news.content.substring(0, 80)}...</p>
                        </div>
                    </a>
                </li>
            `;
        }).join('');

        newsCol.innerHTML = newsHTML;

        // スライダー初期化
        this.initNewsSlider();
    }

    initNewsSlider() {
        const container = document.getElementById('indexNewsList');
        const prevBtn = document.querySelector('.news-slider-prev');
        const nextBtn = document.querySelector('.news-slider-next');

        if (!container || !prevBtn || !nextBtn) return;

        const originalCards = Array.from(container.querySelectorAll('li'));
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
            const firstCard = container.querySelector('li');
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
}

// ページ読み込み時に初期化
const indexNewsLoader = new IndexNewsLoader();
document.addEventListener('DOMContentLoaded', () => {
    indexNewsLoader.loadNews();
});
