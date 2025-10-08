// ニュース詳細ページのローダー
class NewsDetailLoader {
    constructor() {
        this.newsId = this.getNewsIdFromUrl();
        this.newsData = null;
    }

    getNewsIdFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get('id'));
    }

    async loadNewsDetail() {
        try {
            const response = await fetch('./data/news.json');
            const data = await response.json();
            const articles = data.articles || [];

            this.newsData = articles.find(article => article.id === this.newsId);
            this.allArticles = articles; // 全記事を保持

            if (this.newsData) {
                this.renderNewsDetail();
            } else {
                this.showNotFound();
            }
        } catch (error) {
            console.error('ニュースの読み込みに失敗しました:', error);
            this.showError();
        }
    }

    renderNewsDetail() {
        document.title = this.newsData.title + ' | 合同会社SHARE';

        const metaElement = document.querySelector('.news-detail-meta');
        if (metaElement) {
            // 最新のニュースIDを取得
            const latestNewsId = this.allArticles.length > 0 ? this.allArticles[0].id : null;
            // 最新のニュースのみNEWバッジを表示
            const newBadge = this.newsData.id === latestNewsId ? '<span class="news-badge">NEW</span>' : '';
            metaElement.innerHTML = `
                <time>${this.newsData.date}</time>
                <span class="news-category-badge">${this.newsData.category}</span>
                ${newBadge}
            `;
        }

        const titleElement = document.querySelector('.news-detail-title');
        if (titleElement) {
            titleElement.textContent = this.newsData.title;
        }

        const imageContainer = document.querySelector('.news-detail-image');
        if (imageContainer && this.newsData.image) {
            imageContainer.innerHTML = `<img src="${this.newsData.image}" alt="${this.newsData.title}">`;
        } else if (imageContainer) {
            imageContainer.style.display = 'none';
        }

        const contentElement = document.querySelector('.news-detail-content');
        if (contentElement) {
            contentElement.innerHTML = this.newsData.content.replace(/\r\n/g, '<br>').replace(/\n/g, '<br>');
        }
    }

    showNotFound() {
        const container = document.querySelector('.news-detail-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 80px 20px;">
                    <h2 style="font-size: 24px; margin-bottom: 20px;">お知らせが見つかりませんでした</h2>
                    <p style="margin-bottom: 30px;">指定されたお知らせは存在しないか、削除された可能性があります。</p>
                    <a href="news.html" style="display: inline-block; padding: 12px 30px; background: #333; color: white; text-decoration: none; border-radius: 4px;">お知らせ一覧に戻る</a>
                </div>
            `;
        }
    }

    showError() {
        const container = document.querySelector('.news-detail-container');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 80px 20px;">
                    <h2 style="font-size: 24px; margin-bottom: 20px;">エラーが発生しました</h2>
                    <p style="margin-bottom: 30px;">お知らせの読み込みに失敗しました。</p>
                    <a href="news.html" style="display: inline-block; padding: 12px 30px; background: #333; color: white; text-decoration: none; border-radius: 4px;">お知らせ一覧に戻る</a>
                </div>
            `;
        }
    }
}

const newsDetailLoader = new NewsDetailLoader();
document.addEventListener('DOMContentLoaded', () => {
    newsDetailLoader.loadNewsDetail();
});
