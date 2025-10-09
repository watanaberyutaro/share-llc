// Admin Manager JavaScript

let currentPassword = '';
let newsFormInitialized = false;
let imageUploadInitialized = false;
let tabsInitialized = false;

// DOMContentLoaded - 全ての初期化を統合
document.addEventListener('DOMContentLoaded', function() {
    initLogin();
    initLogout();
    initTabs();
});

// ログイン処理
function initLogin() {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const password = document.getElementById('password').value;

        if (password === 'admin2017') {
            currentPassword = password;
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('adminPanel').style.display = 'block';
            initAdminPanel();
        } else {
            loginError.textContent = 'パスワードが正しくありません';
            loginError.style.display = 'block';
        }
    });
}

// ログアウト
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            currentPassword = '';
            document.getElementById('adminPanel').style.display = 'none';
            document.getElementById('loginModal').style.display = 'flex';
            document.getElementById('password').value = '';
            document.getElementById('loginError').style.display = 'none';

            // フラグをリセット
            newsFormInitialized = false;
            imageUploadInitialized = false;
        });
    }
}

// タブ切り替えの初期化
function initTabs() {
    if (tabsInitialized) return;
    tabsInitialized = true;

    const tabBtns = document.querySelectorAll('.tab-btn');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;

            // タブボタンの切り替え
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // タブコンテンツの切り替え
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabName + 'Tab').classList.add('active');

            // インタビュータブが選択されたら初期化
            if (tabName === 'interview') {
                initInterviewPanel();
            }
        });
    });
}

// 管理画面の初期化
function initAdminPanel() {
    loadNewsList();
    initNewsForm();
    initImageUpload();
}

// お知らせ一覧を読み込む
function loadNewsList() {
    const newsList = document.getElementById('newsList');

    fetch('./data/news.json')
        .then(response => response.json())
        .then(data => {
            if (data.articles && data.articles.length > 0) {
                newsList.innerHTML = '';
                // 最新のニュースIDを取得
                const latestNewsId = data.articles.length > 0 ? data.articles[0].id : null;
                data.articles.forEach(article => {
                    newsList.appendChild(createNewsItem(article, latestNewsId));
                });
            } else {
                newsList.innerHTML = '<p class="loading">投稿がありません</p>';
            }
        })
        .catch(error => {
            console.error('Error loading news:', error);
            newsList.innerHTML = '<p class="loading">読み込みエラーが発生しました</p>';
        });
}

// お知らせアイテムのHTML作成
function createNewsItem(article, latestNewsId) {
    const item = document.createElement('div');
    item.className = 'news-item';

    const imageHtml = article.image ?
        `<div class="news-item-image"><img src="${article.image}" alt=""></div>` : '';

    // 最新のニュースのみNEWバッジを表示
    const newBadge = article.id === latestNewsId ?
        '<span class="news-item-badge">NEW</span>' : '';

    item.innerHTML = `
        <div class="news-item-header">
            <div class="news-item-meta">
                <span class="news-item-date">${article.date}</span>
                <span class="news-item-category">${article.category}</span>
                ${newBadge}
            </div>
            <div class="news-item-actions">
                <button class="btn-edit" onclick="editNews(${article.id})">
                    <i class="fas fa-edit"></i> 編集
                </button>
                <button class="btn-delete" onclick="deleteNews(${article.id})">
                    <i class="fas fa-trash"></i> 削除
                </button>
            </div>
        </div>
        <h3 class="news-item-title">${article.title}</h3>
        <p class="news-item-content">${article.content}</p>
        ${imageHtml}
    `;

    return item;
}

// フォームの初期化
function initNewsForm() {
    if (newsFormInitialized) return;
    newsFormInitialized = true;

    const newsForm = document.getElementById('newsForm');
    const cancelBtn = document.getElementById('cancelBtn');

    newsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveNews();
    });

    cancelBtn.addEventListener('click', function() {
        resetForm();
    });
}

// お知らせを保存
function saveNews() {
    const formData = new FormData();
    const editId = document.getElementById('editId').value;
    const category = document.getElementById('category').value;
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const imageInput = document.getElementById('imageFile');
    const formMessage = document.getElementById('formMessage');

    formData.append('password', currentPassword);
    formData.append('category', category);
    formData.append('title', title);
    formData.append('content', content);

    if (editId) {
        formData.append('id', editId);
    }

    // 画像がアップロードされている場合
    if (imageInput.files.length > 0) {
        const imageFormData = new FormData();
        imageFormData.append('password', currentPassword);
        imageFormData.append('image', imageInput.files[0]);

        // 画像を先にアップロード
        fetch('./api/upload-image.php', {
            method: 'POST',
            body: imageFormData
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                formData.append('image', result.path);
                submitNews(formData, formMessage);
            } else {
                showMessage(formMessage, result.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error uploading image:', error);
            showMessage(formMessage, '画像のアップロードに失敗しました', 'error');
        });
    } else {
        // 画像がない場合、既存の画像パスを保持（編集時）
        const existingImage = document.getElementById('imageFile').dataset.currentImage || '';
        formData.append('image', existingImage);
        submitNews(formData, formMessage);
    }
}

// お知らせを送信
function submitNews(formData, formMessage) {
    fetch('./api/save-news.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showMessage(formMessage, '保存しました', 'success');
            resetForm();
            loadNewsList();
        } else {
            showMessage(formMessage, result.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error saving news:', error);
        showMessage(formMessage, '保存に失敗しました', 'error');
    });
}

// メッセージを表示
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = 'form-message ' + type;
    element.style.display = 'block';

    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

// フォームをリセット
function resetForm() {
    document.getElementById('newsForm').reset();
    document.getElementById('editId').value = '';
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('imageFile').dataset.currentImage = '';
    document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> 投稿する';
    document.getElementById('cancelBtn').style.display = 'none';
    document.getElementById('formMessage').style.display = 'none';
}

// お知らせを編集
function editNews(id) {
    fetch('./data/news.json')
        .then(response => response.json())
        .then(data => {
            const article = data.articles.find(a => a.id === id);
            if (article) {
                document.getElementById('editId').value = article.id;
                document.getElementById('category').value = article.category;
                document.getElementById('title').value = article.title;
                document.getElementById('content').value = article.content;
                document.getElementById('imageFile').dataset.currentImage = article.image || '';

                if (article.image) {
                    document.getElementById('imagePreview').innerHTML =
                        `<img src="${article.image}" alt="現在の画像"><p style="font-size: 12px; color: #666; margin-top: 8px;">※画像を変更しない場合は、ファイルを選択する必要はありません</p>`;
                }

                document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> 更新する';
                document.getElementById('cancelBtn').style.display = 'inline-flex';

                // フォームまでスクロール
                document.querySelector('.news-form-section').scrollIntoView({
                    behavior: 'smooth'
                });
            }
        })
        .catch(error => {
            console.error('Error loading article:', error);
            alert('記事の読み込みに失敗しました');
        });
}

// お知らせを削除
function deleteNews(id) {
    if (!confirm('この記事を削除してもよろしいですか？')) {
        return;
    }

    const formData = new FormData();
    formData.append('password', currentPassword);
    formData.append('id', id);

    fetch('./api/delete-news.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            loadNewsList();
        } else {
            alert(result.message);
        }
    })
    .catch(error => {
        console.error('Error deleting news:', error);
        alert('削除に失敗しました');
    });
}

// 画像プレビュー機能
function initImageUpload() {
    if (imageUploadInitialized) return;
    imageUploadInitialized = true;

    const imageInput = document.getElementById('imageFile');
    const imagePreview = document.getElementById('imagePreview');

    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="プレビュー">`;
            };
            reader.readAsDataURL(file);
        }
    });
}

// ========================================
// 社員インタビュー管理機能
// ========================================

// インタビュー管理パネルの初期化
function initInterviewPanel() {
    loadInterviewList();
    initInterviewForm();
    initInterviewImageUpload();
}

// インタビュー一覧を読み込む
function loadInterviewList() {
    fetch('./data/interviews.json')
        .then(response => response.json())
        .then(interviews => {
            displayInterviewList(interviews);
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('interviewList').innerHTML = '<p class="error">データの読み込みに失敗しました</p>';
        });
}

// インタビュー一覧を表示
function displayInterviewList(interviews) {
    const listContainer = document.getElementById('interviewList');

    if (interviews.length === 0) {
        listContainer.innerHTML = '<p>インタビューがありません</p>';
        return;
    }

    interviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    listContainer.innerHTML = interviews.map(interview => `
        <div class="news-item" data-id="${interview.id}">
            <div class="news-item-header">
                <div class="news-item-meta">
                    <span class="news-date">${new Date(interview.createdAt).toLocaleDateString('ja-JP')}</span>
                    <span class="news-category">${interview.labels.join(', ')}</span>
                </div>
                <div class="news-item-actions">
                    <button class="btn-edit" onclick="editInterview(${interview.id})">
                        <i class="fas fa-edit"></i> 編集
                    </button>
                    <button class="btn-delete" onclick="deleteInterview(${interview.id})">
                        <i class="fas fa-trash"></i> 削除
                    </button>
                </div>
            </div>
            <h3>${interview.title}</h3>
            <p><strong>${interview.staffName}</strong> / ${interview.position} / ${interview.joinDate}</p>
            ${interview.image ? `<img src="${interview.image}" alt="${interview.staffName}" style="max-width: 200px; margin-top: 10px;">` : ''}
        </div>
    `).join('');
}

// インタビューフォームの初期化
function initInterviewForm() {
    const form = document.getElementById('interviewForm');
    const cancelBtn = document.getElementById('interviewCancelBtn');

    // 既存のリスナーを削除するために、フォームをクローンして置き換える
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await saveInterview();
    });

    const newCancelBtn = document.getElementById('interviewCancelBtn');
    newCancelBtn.addEventListener('click', function() {
        resetInterviewForm();
    });
}

// インタビューを保存
async function saveInterview() {
    const editId = document.getElementById('interviewEditId').value;
    const title = document.getElementById('interviewTitle').value;
    const staffName = document.getElementById('staffName').value;
    const position = document.getElementById('position').value;
    const joinDate = document.getElementById('joinDate').value;
    const labelsInput = document.getElementById('interviewLabels').value;
    const content = document.getElementById('interviewContent').value;
    const imageFile = document.getElementById('interviewImageFile').files[0];

    const labels = labelsInput.split(',').map(label => label.trim()).filter(label => label !== '');

    const formMessage = document.getElementById('interviewFormMessage');
    formMessage.textContent = '保存中...';
    formMessage.className = 'form-message info';

    try {
        // 画像をアップロード
        let imagePath = '';
        if (imageFile) {
            const imageFormData = new FormData();
            imageFormData.append('image', imageFile);

            const uploadResponse = await fetch('./api/interview-manager.php?action=upload', {
                method: 'POST',
                body: imageFormData
            });

            const uploadResult = await uploadResponse.json();
            if (uploadResult.success) {
                imagePath = uploadResult.path;
            } else {
                throw new Error(uploadResult.message);
            }
        } else {
            // 画像が選択されていない場合、既存の画像パスを保持
            imagePath = document.getElementById('interviewImageFile').dataset.currentImage || '';
        }

        // インタビューデータを保存
        const interviewData = {
            title,
            staffName,
            position,
            joinDate,
            labels,
            content,
            image: imagePath
        };

        if (editId) {
            interviewData.id = parseInt(editId);
        }

        const saveResponse = await fetch('./api/interview-manager.php?action=save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(interviewData)
        });

        const saveResult = await saveResponse.json();

        if (saveResult.success) {
            formMessage.textContent = '保存しました！';
            formMessage.className = 'form-message success';

            // フォームをリセット
            setTimeout(() => {
                resetInterviewForm();
                loadInterviewList();
            }, 1500);
        } else {
            throw new Error(saveResult.message);
        }

    } catch (error) {
        console.error('Error:', error);
        formMessage.textContent = '保存に失敗しました: ' + error.message;
        formMessage.className = 'form-message error';
    }
}

// インタビューを編集
async function editInterview(id) {
    const response = await fetch('./data/interviews.json');
    const interviews = await response.json();
    const interview = interviews.find(item => item.id === id);

    if (interview) {
        document.getElementById('interviewEditId').value = interview.id;
        document.getElementById('interviewTitle').value = interview.title;
        document.getElementById('staffName').value = interview.staffName;
        document.getElementById('position').value = interview.position;
        document.getElementById('joinDate').value = interview.joinDate;
        document.getElementById('interviewLabels').value = interview.labels.join(', ');
        document.getElementById('interviewContent').value = interview.content;

        // 既存の画像パスを保持
        const imageInput = document.getElementById('interviewImageFile');
        imageInput.dataset.currentImage = interview.image || '';

        // 編集時は画像の再選択を必須にしない
        imageInput.removeAttribute('required');

        if (interview.image) {
            document.getElementById('interviewImagePreview').innerHTML = `<img src="${interview.image}" alt="プレビュー"><p style="font-size: 12px; color: #666; margin-top: 8px;">※画像を変更しない場合は、ファイルを選択する必要はありません</p>`;
        }

        document.getElementById('interviewCancelBtn').style.display = 'inline-block';
        document.getElementById('interviewSubmitBtn').innerHTML = '<i class="fas fa-save"></i> 更新する';

        // フォームまでスクロール
        document.querySelector('.interview-form-section').scrollIntoView({ behavior: 'smooth' });
    }
}

// インタビューを削除
async function deleteInterview(id) {
    if (!confirm('本当に削除しますか？')) {
        return;
    }

    try {
        console.log('Deleting interview with ID:', id);

        const response = await fetch('./api/interview-manager.php?action=delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: parseInt(id) })
        });

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response text:', responseText);

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('JSON parse error:', e);
            throw new Error('サーバーからの応答が不正です: ' + responseText);
        }

        if (result.success) {
            alert('削除しました');
            loadInterviewList();
        } else {
            throw new Error(result.message || '削除に失敗しました');
        }
    } catch (error) {
        console.error('Error deleting interview:', error);
        alert('削除に失敗しました: ' + error.message);
    }
}

// インタビュー画像プレビュー機能
function initInterviewImageUpload() {
    const imageInput = document.getElementById('interviewImageFile');
    const imagePreview = document.getElementById('interviewImagePreview');

    // 既存のリスナーを削除
    const newImageInput = imageInput.cloneNode(true);
    imageInput.parentNode.replaceChild(newImageInput, imageInput);

    const updatedImageInput = document.getElementById('interviewImageFile');
    const updatedImagePreview = document.getElementById('interviewImagePreview');

    updatedImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                updatedImagePreview.innerHTML = `<img src="${e.target.result}" alt="プレビュー">`;
            };
            reader.readAsDataURL(file);
        }
    });
}

// インタビューフォームをリセット
function resetInterviewForm() {
    document.getElementById('interviewForm').reset();
    document.getElementById('interviewEditId').value = '';
    document.getElementById('interviewImagePreview').innerHTML = '';

    // 新規投稿時は画像を必須に戻す
    const imageInput = document.getElementById('interviewImageFile');
    imageInput.dataset.currentImage = '';
    imageInput.setAttribute('required', 'required');

    document.getElementById('interviewCancelBtn').style.display = 'none';
    document.getElementById('interviewSubmitBtn').innerHTML = '<i class="fas fa-save"></i> 投稿する';
    document.getElementById('interviewFormMessage').textContent = '';
}
