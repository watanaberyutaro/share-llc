// News management JavaScript

// Load news from localStorage
function loadNews(filter = 'all') {
  const newsGrid = document.getElementById('newsGrid');
  const noNews = document.getElementById('noNews');
  const pagination = document.getElementById('pagination');
  
  // Get news from localStorage
  let newsList = JSON.parse(localStorage.getItem('newsList') || '[]');
  
  // Filter news by category
  if (filter !== 'all') {
    newsList = newsList.filter(news => news.category === filter);
  }
  
  // Show/hide no news message
  if (newsList.length === 0) {
    newsGrid.style.display = 'none';
    noNews.style.display = 'block';
    pagination.style.display = 'none';
    return;
  } else {
    newsGrid.style.display = 'grid';
    noNews.style.display = 'none';
    pagination.style.display = 'flex';
  }
  
  // Pagination settings
  const itemsPerPage = 9;
  const currentPage = parseInt(new URLSearchParams(window.location.search).get('page') || '1');
  const totalPages = Math.ceil(newsList.length / itemsPerPage);
  
  // Get items for current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = newsList.slice(startIndex, endIndex);
  
  // Render news cards
  newsGrid.innerHTML = currentItems.map(news => `
    <div class="news-card" onclick="viewNews(${news.id})">
      ${news.image ? `
        <div class="news-image">
          <img src="${news.image}" alt="${news.title}">
          <span class="news-category-badge">${getCategoryLabel(news.category)}</span>
        </div>
      ` : `
        <div class="news-image">
          <span class="news-category-badge">${getCategoryLabel(news.category)}</span>
        </div>
      `}
      <div class="news-content">
        <div class="news-date">${formatDate(news.date)}</div>
        <h3 class="news-title">${news.title}</h3>
        <p class="news-excerpt">${news.excerpt}</p>
        <div class="news-meta">
          <div class="news-tags">
            ${news.tags && news.tags.length > 0 ? news.tags.slice(0, 2).map(tag => `
              <span class="news-tag">${tag}</span>
            `).join('') : ''}
          </div>
          <span class="read-more">続きを読む →</span>
        </div>
      </div>
    </div>
  `).join('');
  
  // Render pagination
  renderPagination(currentPage, totalPages);
}

// Render pagination
function renderPagination(currentPage, totalPages) {
  const pagination = document.getElementById('pagination');
  
  if (totalPages <= 1) {
    pagination.style.display = 'none';
    return;
  }
  
  let paginationHTML = '';
  
  // Previous button
  if (currentPage > 1) {
    paginationHTML += `<button class="page-btn" onclick="goToPage(${currentPage - 1})">←</button>`;
  }
  
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === currentPage) {
      paginationHTML += `<button class="page-btn active">${i}</button>`;
    } else if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      paginationHTML += `<button class="page-btn" onclick="goToPage(${i})">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      paginationHTML += `<span style="padding: 0 8px;">...</span>`;
    }
  }
  
  // Next button
  if (currentPage < totalPages) {
    paginationHTML += `<button class="page-btn" onclick="goToPage(${currentPage + 1})">→</button>`;
  }
  
  pagination.innerHTML = paginationHTML;
}

// Go to page
function goToPage(page) {
  const url = new URL(window.location);
  url.searchParams.set('page', page);
  window.location.href = url.toString();
}

// View single news
function viewNews(id) {
  // In a real application, this would navigate to a detailed news page
  // For now, we'll show an alert with the news content
  const newsList = JSON.parse(localStorage.getItem('newsList') || '[]');
  const news = newsList.find(n => n.id === id);
  
  if (news) {
    // Create a modal or navigate to detail page
    showNewsDetail(news);
  }
}

// Show news detail (simplified version)
function showNewsDetail(news) {
  // Create modal
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  `;
  
  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    max-width: 800px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    border-radius: 12px;
    padding: 40px;
    position: relative;
  `;
  
  content.innerHTML = `
    <button onclick="this.closest('div').parentElement.remove()" style="
      position: absolute;
      top: 20px;
      right: 20px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
    ">×</button>
    
    <div style="margin-bottom: 20px;">
      <span style="
        display: inline-block;
        padding: 6px 16px;
        background: #F9A825;
        color: white;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 16px;
      ">${getCategoryLabel(news.category)}</span>
      <div style="color: #666; font-size: 14px; margin-bottom: 8px;">${formatDate(news.date)}</div>
    </div>
    
    <h1 style="font-size: 32px; margin-bottom: 20px; color: #263238; line-height: 1.4;">${news.title}</h1>
    
    ${news.image ? `<img src="${news.image}" style="width: 100%; border-radius: 8px; margin-bottom: 24px;" alt="${news.title}">` : ''}
    
    <div style="font-size: 18px; color: #666; margin-bottom: 24px; line-height: 1.8;">${news.excerpt}</div>
    
    <div style="font-size: 16px; line-height: 1.8; color: #333; white-space: pre-wrap;">${news.content}</div>
    
    ${news.tags && news.tags.length > 0 ? `
      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #E0E0E0;">
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${news.tags.map(tag => `
            <span style="
              padding: 6px 14px;
              background: rgba(249, 168, 37, 0.1);
              border: 1px solid rgba(249, 168, 37, 0.2);
              border-radius: 20px;
              font-size: 13px;
              color: #F9A825;
            ">${tag}</span>
          `).join('')}
        </div>
      </div>
    ` : ''}
  `;
  
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  // Close modal when clicking outside
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Get category label
function getCategoryLabel(category) {
  const labels = {
    'press': 'プレスリリース',
    'service': 'サービス情報',
    'event': 'イベント',
    'company': '会社情報'
  };
  return labels[category] || category;
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

// Sample news data (for demonstration)
function initializeSampleNews() {
  const existingNews = localStorage.getItem('newsList');
  if (!existingNews) {
    const sampleNews = [
      {
        id: 1,
        title: '新サービス「SHARE Connect」をリリースしました',
        category: 'service',
        excerpt: '企業と人材をつなぐ新しいマッチングプラットフォーム「SHARE Connect」の提供を開始しました。AIを活用した最適なマッチングを実現します。',
        content: '合同会社SHAREは、企業と人材をつなぐ新しいマッチングプラットフォーム「SHARE Connect」の提供を開始いたしました。\n\n本サービスは、AI技術を活用して企業のニーズと人材のスキルを分析し、最適なマッチングを実現します。これにより、企業は必要な人材を効率的に見つけることができ、求職者は自分に最適な職場を見つけることができます。\n\n主な特徴：\n・AIによる高精度マッチング\n・リアルタイムでのスキル評価\n・充実したサポート体制\n・透明性の高い評価システム\n\n今後も継続的にサービスの改善を行い、より多くの企業と人材の成功に貢献してまいります。',
        tags: ['新サービス', 'AI', 'マッチング'],
        date: '2024-03-15',
        image: null
      },
      {
        id: 2,
        title: '東京オフィス移転のお知らせ',
        category: 'company',
        excerpt: '業務拡大に伴い、東京オフィスを渋谷スクランブルスクエアに移転いたしました。',
        content: '平素より格別のご高配を賜り、厚く御礼申し上げます。\n\nこの度、業務拡大に伴い、東京オフィスを下記の通り移転いたしましたのでお知らせいたします。\n\n【新オフィス】\n〒150-0002\n東京都渋谷区渋谷2-24-12\n渋谷スクランブルスクエア 39F\n\n新オフィスは、渋谷駅直結でアクセスも良好です。より快適な環境で、お客様により良いサービスを提供できるよう努めてまいります。\n\n今後とも変わらぬご愛顧を賜りますよう、よろしくお願い申し上げます。',
        tags: ['オフィス移転', '渋谷'],
        date: '2024-03-01',
        image: null
      },
      {
        id: 3,
        title: '「働き方改革EXPO 2024」に出展します',
        category: 'event',
        excerpt: '2024年4月10日〜12日に東京ビッグサイトで開催される「働き方改革EXPO 2024」に出展いたします。',
        content: '合同会社SHAREは、2024年4月10日（水）〜12日（金）に東京ビッグサイトで開催される「働き方改革EXPO 2024」に出展いたします。\n\n【出展概要】\n会期：2024年4月10日（水）〜12日（金）\n会場：東京ビッグサイト 東展示棟\nブース番号：E-123\n\n当社ブースでは、最新のサービスのデモンストレーションや、人材活用に関するご相談を承ります。\n\nぜひこの機会に当社ブースへお立ち寄りください。',
        tags: ['展示会', 'イベント', '働き方改革'],
        date: '2024-02-20',
        image: null
      }
    ];
    
    localStorage.setItem('newsList', JSON.stringify(sampleNews));
  }
}

// Initialize sample news on first load
initializeSampleNews();