// 社員インタビュー読み込み
(function() {
    // インタビューデータを取得
    async function loadInterviews() {
        try {
            const response = await fetch('./data/interviews.json');
            if (!response.ok) {
                throw new Error('インタビューデータの読み込みに失敗しました');
            }
            const interviews = await response.json();

            // 日付順でソート（新しい順）
            interviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            displayInterviews(interviews);
        } catch (error) {
            console.error('Error loading interviews:', error);
            const container = document.querySelector('.interview-cards');
            if (container) {
                container.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">インタビューデータの読み込みに失敗しました。</p>';
            }
        }
    }

    // インタビューカードを表示
    function displayInterviews(interviews) {
        const container = document.querySelector('.interview-cards');
        if (!container) return;

        if (interviews.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 40px; color: #666;">インタビュー記事がありません。</p>';
            return;
        }

        container.innerHTML = interviews.map(interview => {
            // 本文を120文字に制限
            const contentPreview = interview.content.replace(/\n/g, ' ').substring(0, 120) + '...';

            return `
            <a href="interview-detail.html?id=${interview.id}" class="interview-card" data-id="${interview.id}">
                <div class="interview-image">
                    <img src="${interview.image}" alt="${interview.staffName}">
                    <div class="interview-labels">
                        ${interview.labels.map(label => `<span class="label">${label}</span>`).join('')}
                    </div>
                </div>
                <div class="interview-info">
                    <h3>${interview.title}</h3>
                    <p class="interview-preview">${contentPreview}</p>
                    <div class="interview-meta">
                        <div class="interview-position">
                            <span>${interview.position}</span>
                        </div>
                        <div class="interview-name-info">
                            <span class="interview-name">${interview.staffName}</span>
                            <span class="interview-year">${interview.joinDate}</span>
                        </div>
                    </div>
                </div>
            </a>
        `;
        }).join('');
    }

    // ページ読み込み時に実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadInterviews);
    } else {
        loadInterviews();
    }
})();
