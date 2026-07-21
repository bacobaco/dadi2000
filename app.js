/* ==========================================================================
   DADI2000 - BOLIVIE & PÉROU 2000 - INTERACTIVE APPLICATION (594 PHOTOS)
   ========================================================================== */

let siteData = [];
let photoMetadata = [];
let allPhotos = [];
let currentPhotoIndex = 0;
let filteredPhotos = [];

document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    await loadSiteData();
    await loadPhotoMetadata();
    renderJournalChapters('all');
    buildAllPhotosList();
    renderGallery('all');
    setupEventListeners();
});

/* ==========================================================================
   THEME TOGGLE
   ========================================================================== */

function initTheme() {
    const savedTheme = localStorage.getItem('dadi2000-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('dadi2000-theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const btn = document.getElementById('theme-toggle');
    if (btn) {
        btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    }
}

/* ==========================================================================
   DATA LOADING
   ========================================================================== */

async function loadSiteData() {
    try {
        const resp = await fetch('site_data.json');
        siteData = await resp.json();
        renderStageTabs();
    } catch (e) {
        console.error('Error loading site data:', e);
    }
}

async function loadPhotoMetadata() {
    try {
        const resp = await fetch('photo_metadata.json');
        photoMetadata = await resp.json();
    } catch (e) {
        console.error('Error loading photo metadata:', e);
    }
}

/* ==========================================================================
   STAGE TABS & RENDER
   ========================================================================== */

function renderStageTabs() {
    const tabsContainer = document.getElementById('stage-tabs');
    if (!tabsContainer) return;

    let html = `<button class="stage-tab-btn active" data-stage="all">📌 Tout le voyage (594 Photos)</button>`;
    
    siteData.forEach(section => {
        if (section.id !== 'intro') {
            html += `<button class="stage-tab-btn" data-stage="${section.id}">${section.title}</button>`;
        }
    });

    tabsContainer.innerHTML = html;

    tabsContainer.querySelectorAll('.stage-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            tabsContainer.querySelectorAll('.stage-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const stage = btn.getAttribute('data-stage');
            renderJournalChapters(stage);
        });
    });
}

function renderJournalChapters(stageFilter) {
    const container = document.getElementById('journal-chapters-container');
    if (!container) return;

    let html = '';

    const sectionsToRender = stageFilter === 'all' 
        ? siteData.filter(s => s.id !== 'intro')
        : siteData.filter(s => s.id === stageFilter);

    sectionsToRender.forEach(section => {
        if (section.id === 'preparatifs') {
            html += renderPreparatifsSection(section);
            return;
        }

        html += `
        <article class="chapter-card" id="chapter-${section.id}">
            <div class="chapter-hero">
                <img src="assets/thumbs/${section.hero_image}" alt="${section.title}" loading="lazy">
                <div class="chapter-hero-overlay">
                    <span class="chapter-badge">${section.dates}</span>
                    <h2 class="chapter-title">${section.title}</h2>
                    <p class="chapter-dates">${section.subtitle}</p>
                </div>
            </div>
            <div class="chapter-body">
        `;

        if (section.journal_entries) {
            section.journal_entries.forEach(entry => {
                html += `
                <div class="day-entry">
                    <div class="day-header">
                        <span class="day-date">${entry.date}</span>
                        <h3 class="day-title">${entry.title}</h3>
                    </div>
                    <p class="day-text">${entry.text}</p>
                    <div class="inline-photo-grid">
                `;

                if (entry.photos) {
                    entry.photos.forEach(photoFile => {
                        const meta = photoMetadata.find(m => m.filename === photoFile) || {};
                        const cap = meta.caption || entry.title;
                        html += `
                        <div class="inline-photo-card" onclick="openLightboxByFilename('${photoFile}')" title="${cap}">
                            <img src="assets/thumbs/${photoFile}" alt="${cap}" loading="lazy">
                            <div class="zoom-icon">🔍</div>
                        </div>
                        `;
                    });
                }

                html += `
                    </div>
                </div>
                `;
            });
        }

        html += `
            </div>
        </article>
        `;
    });

    container.innerHTML = html;
}

function renderPreparatifsSection(section) {
    let html = `
    <article class="chapter-card" id="chapter-${section.id}">
        <div class="chapter-hero">
            <img src="assets/thumbs/${section.hero_image}" alt="${section.title}" loading="lazy">
            <div class="chapter-hero-overlay">
                <span class="chapter-badge">${section.dates}</span>
                <h2 class="chapter-title">${section.title}</h2>
                <p class="chapter-dates">${section.subtitle}</p>
            </div>
        </div>
        <div class="chapter-body">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
    `;

    section.content.forEach(item => {
        html += `
        <div style="background: rgba(255,255,255,0.03); border: var(--glass-border); border-radius: 16px; padding: 1.5rem;">
            <h3 style="color: var(--andean-gold); font-size: 1.15rem; margin-bottom: 0.5rem;">${item.category}</h3>
            <p style="color: var(--text-secondary); font-size: 0.95rem;">${item.text}</p>
        </div>
        `;
    });

    html += `
            </div>
            <h3 style="color: var(--andean-gold); margin-bottom: 1rem;">Photos des Préparatifs & Départ (${section.photos.length} clichés)</h3>
            <div class="inline-photo-grid">
    `;

    section.photos.forEach(photoFile => {
        html += `
        <div class="inline-photo-card" onclick="openLightboxByFilename('${photoFile}')">
            <img src="assets/thumbs/${photoFile}" alt="Préparatifs" loading="lazy">
            <div class="zoom-icon">🔍</div>
        </div>
        `;
    });

    html += `
            </div>
        </div>
    </article>
    `;
    return html;
}

/* ==========================================================================
   PHOTO GALLERY & LIGHTBOX (594 PHOTOS)
   ========================================================================== */

function buildAllPhotosList() {
    allPhotos = [];
    
    // Total 594 photos in true chronological order
    for (let i = 1; i <= 594; i++) {
        const filename = `photo_${String(i).padStart(3, '0')}.jpg`;
        const meta = photoMetadata.find(m => m.filename === filename) || {};
        
        allPhotos.push({
            filename: filename,
            stage: meta.stage || 'all',
            stageTitle: meta.caption || `Photo ${i}`,
            location: meta.location || 'Bolivie & Pérou'
        });
    }

    filteredPhotos = [...allPhotos];
    updateFilterCounts();
}

function updateFilterCounts() {
    const counts = { all: allPhotos.length };
    allPhotos.forEach(p => {
        counts[p.stage] = (counts[p.stage] || 0) + 1;
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        const stage = btn.getAttribute('data-filter');
        if (stage && counts[stage] !== undefined) {
            const label = btn.textContent.replace(/\s*\(\d+\)/, '');
            btn.textContent = `${label} (${counts[stage]})`;
        }
    });
}

function renderGallery(filterStage = 'all', searchQuery = '') {
    const grid = document.getElementById('full-gallery-grid');
    if (!grid) return;

    filteredPhotos = allPhotos.filter(item => {
        const matchesStage = filterStage === 'all' || item.stage === filterStage;
        const matchesSearch = searchQuery === '' || 
            item.filename.toLowerCase().includes(searchQuery.toLowerCase()) || 
            item.stageTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStage && matchesSearch;
    });

    let html = '';
    filteredPhotos.forEach((item, index) => {
        html += `
        <div class="gallery-item" onclick="openLightboxByIndex(${index})">
            <img src="assets/thumbs/${item.filename}" alt="${item.stageTitle}" loading="lazy">
            <div class="gallery-item-info">
                <span>${item.stageTitle}</span>
            </div>
        </div>
        `;
    });

    grid.innerHTML = html;
}

/* ==========================================================================
   LIGHTBOX MODAL CONTROLS
   ========================================================================== */

function openLightboxByIndex(index) {
    currentPhotoIndex = index;
    updateLightboxContent();
    document.getElementById('lightbox-modal').classList.add('active');
}

function openLightboxByFilename(filename) {
    const idx = filteredPhotos.findIndex(p => p.filename === filename);
    if (idx !== -1) {
        openLightboxByIndex(idx);
    } else {
        const allIdx = allPhotos.findIndex(p => p.filename === filename);
        if (allIdx !== -1) {
            filteredPhotos = [...allPhotos];
            openLightboxByIndex(allIdx);
        }
    }
}

function updateLightboxContent() {
    if (filteredPhotos.length === 0) return;
    const item = filteredPhotos[currentPhotoIndex];
    const imgEl = document.getElementById('lightbox-img');
    const captionEl = document.getElementById('lightbox-caption');
    const counterEl = document.getElementById('lightbox-counter');

    if (imgEl) {
        imgEl.src = `photos/${item.filename}`;
        imgEl.onerror = () => {
            imgEl.src = `assets/thumbs/${item.filename}`;
        };
    }
    if (captionEl) captionEl.textContent = `${item.stageTitle} • ${item.location} (${item.filename})`;
    if (counterEl) counterEl.textContent = `${currentPhotoIndex + 1} / ${filteredPhotos.length}`;
}

function closeLightbox() {
    document.getElementById('lightbox-modal').classList.remove('active');
}

function nextPhoto() {
    if (filteredPhotos.length === 0) return;
    currentPhotoIndex = (currentPhotoIndex + 1) % filteredPhotos.length;
    updateLightboxContent();
}

function prevPhoto() {
    if (filteredPhotos.length === 0) return;
    currentPhotoIndex = (currentPhotoIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    updateLightboxContent();
}

function setupEventListeners() {
    // Lightbox Controls
    document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
    document.getElementById('lightbox-next')?.addEventListener('click', nextPhoto);
    document.getElementById('lightbox-prev')?.addEventListener('click', prevPhoto);

    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('lightbox-modal');
        if (modal && modal.classList.contains('active')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextPhoto();
            if (e.key === 'ArrowLeft') prevPhoto();
        }
    });

    // Gallery Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const stage = btn.getAttribute('data-filter');
            const searchVal = document.getElementById('gallery-search')?.value || '';
            renderGallery(stage, searchVal);
        });
    });

    // Gallery Search
    document.getElementById('gallery-search')?.addEventListener('input', (e) => {
        const activeFilter = document.querySelector('.filter-btn.active')?.getAttribute('data-filter') || 'all';
        renderGallery(activeFilter, e.target.value);
    });
}
