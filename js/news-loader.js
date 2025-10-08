class NewsLoader {
    constructor(containerId, itemsPerPage = 10) {
        this.container = document.getElementById(containerId);
        this.itemsPerPage = itemsPerPage;
        this.currentPage = 1;
        this.newsData = [];
    }

    async loadNews() {
        try {
            const response = await fetch('./data/news.json');
            const data = await response.json();
            this.newsData = data.articles || [];
            this.renderNews();
            this.renderPagination();
        } catch (error) {
            console.error('ニュースの読み込みに失敗しました:', error);
            this.container.innerHTML = '<p style="text-align: center; padding: 40px;">ニュースの読み込みに失敗しました。</p>';
        }
    }

    renderNews() {
        const newsContainer = this.container.querySelector('.news-list') || this.container;

        if (this.newsData.length === 0) {
            newsContainer.innerHTML = '<p style="text-align: center; padding: 40px; grid-column: 1/-1;">現在、お知らせはありません。</p>';
            return;
        }

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageNews = this.newsData.slice(start, end);

        // 最新のニュースIDを取得（最初の要素が最新）
        const latestNewsId = this.newsData.length > 0 ? this.newsData[0].id : null;

        const newsHTML = pageNews.map(news => {
            // 最新のニュースのみNEWバッジを表示
            const newBadge = news.id === latestNewsId ? '<span class="news-badge">NEW</span>' : '';
            // 本文を200文字に制限
            const truncatedContent = news.content.length > 200
                ? news.content.substring(0, 200) + '...'
                : news.content;
            // 画像があれば表示
            const imageHTML = news.image ? `
                <div class="news-card-image">
                    <img src="${news.image}" alt="${news.title}">
                </div>
            ` : '';
            return `
            <article class="news-card">
                <a href="news-detail.html?id=${news.id}" style="text-decoration: none; color: inherit; display: flex; flex: 1; width: 100%;">
                    ${imageHTML}
                    <div class="news-card-content">
                        <div class="news-meta">
                            <time>${news.date}</time>
                            <span class="news-category">${news.category}</span>
                            ${newBadge}
                        </div>
                        <h3>${news.title}</h3>
                        <p>${truncatedContent}</p>
                    </div>
                </a>
            </article>
        `;
        }).join('');

        newsContainer.innerHTML = newsHTML;
    }

    renderPagination() {
        const totalPages = Math.ceil(this.newsData.length / this.itemsPerPage);
        const paginationContainer = this.container.querySelector('.pagination') ||
            document.querySelector('.pagination');

        if (!paginationContainer || totalPages <= 1) return;

        const prevDisabled = this.currentPage === 1 ? 'disabled' : '';
        const nextDisabled = this.currentPage === totalPages ? 'disabled' : '';

        paginationContainer.innerHTML = `
            <button ${prevDisabled} onclick="newsLoader.changePage(${this.currentPage - 1})">前へ</button>
            <span>ページ ${this.currentPage} / ${totalPages}</span>
            <button ${nextDisabled} onclick="newsLoader.changePage(${this.currentPage + 1})">次へ</button>
        `;
    }

    changePage(page) {
        this.currentPage = page;
        this.renderNews();
        this.renderPagination();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

const newsLoader = new NewsLoader('news-content');
document.addEventListener('DOMContentLoaded', () => {
    newsLoader.loadNews();
});
