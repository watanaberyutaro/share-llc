// インタビュー詳細読み込み
(function() {
    // URLパラメータからIDを取得
    const urlParams = new URLSearchParams(window.location.search);
    const interviewId = urlParams.get('id');

    if (!interviewId) {
        window.location.href = 'interview.html';
        return;
    }

    // インタビューデータを取得
    async function loadInterviewDetail() {
        try {
            const response = await fetch('./data/interviews.json');
            if (!response.ok) {
                throw new Error('インタビューデータの読み込みに失敗しました');
            }
            const interviews = await response.json();

            // IDに一致するインタビューを検索
            const interview = interviews.find(item => item.id == interviewId);

            if (!interview) {
                alert('インタビューが見つかりませんでした');
                window.location.href = 'interview.html';
                return;
            }

            displayInterviewDetail(interview);
        } catch (error) {
            console.error('Error loading interview:', error);
            alert('インタビューデータの読み込みに失敗しました');
            window.location.href = 'interview.html';
        }
    }

    // インタビュー詳細を表示
    function displayInterviewDetail(interview) {
        // タイトル
        document.getElementById('interviewTitle').textContent = interview.title;
        document.title = `${interview.title} | 社員インタビュー | 合同会社SHARE`;

        // ラベル
        const labelsContainer = document.getElementById('interviewLabels');
        labelsContainer.innerHTML = interview.labels.map(label =>
            `<span class="detail-label">${label}</span>`
        ).join('');

        // スタッフ情報
        document.getElementById('staffImage').src = interview.image;
        document.getElementById('staffImage').alt = interview.staffName;
        document.getElementById('staffName').textContent = interview.staffName;
        document.getElementById('staffPosition').textContent = interview.position;
        document.getElementById('staffJoinDate').textContent = interview.joinDate;

        // コンテンツ
        document.getElementById('interviewContent').textContent = interview.content;
    }

    // ページ読み込み時に実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadInterviewDetail);
    } else {
        loadInterviewDetail();
    }
})();
