document.addEventListener('DOMContentLoaded', () => {
    const CSV_PATH = 'data/tohoku_med_clubs_latest_20260321.csv';
    const searchInput = document.getElementById('club-search-input');
    const categoryFilters = document.getElementById('club-category-filters');
    const resultCount = document.getElementById('club-result-count');
    const listContainer = document.getElementById('club-list-container');
    const statsContainer = document.getElementById('clubs-stats');

    let allRows = [];
    let activeCategory = 'all';
    let searchText = '';

    function escapeHtml(text) {
        return String(text || '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#39;');
    }

    function parseCsv(text) {
        const rows = [];
        let row = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < text.length; i += 1) {
            const ch = text[i];
            const next = text[i + 1];

            if (ch === '"' && inQuotes && next === '"') {
                current += '"';
                i += 1;
                continue;
            }
            if (ch === '"') {
                inQuotes = !inQuotes;
                continue;
            }
            if (ch === ',' && !inQuotes) {
                row.push(current);
                current = '';
                continue;
            }
            if ((ch === '\n' || ch === '\r') && !inQuotes) {
                if (ch === '\r' && next === '\n') i += 1;
                row.push(current);
                current = '';
                if (row.some(cell => cell.trim() !== '')) rows.push(row);
                row = [];
                continue;
            }
            current += ch;
        }
        if (current !== '' || row.length > 0) {
            row.push(current);
            if (row.some(cell => cell.trim() !== '')) rows.push(row);
        }
        return rows;
    }

    function toObjects(csvText) {
        const rows = parseCsv(csvText);
        if (rows.length === 0) return [];
        const headers = rows[0].map(h => h.replace(/^\uFEFF/, '').trim());
        return rows.slice(1).map(cols => {
            const obj = {};
            headers.forEach((h, idx) => {
                obj[h] = (cols[idx] || '').trim();
            });
            return obj;
        }).filter(r => r['サークル名']);
    }

    function normalizeHandle(value) {
        return value
            .trim()
            .replace(/^'+/, '')
            .replace(/^[@＠]+/, '');
    }

    function toUrl(value, kind) {
        if (!value) return '';
        const v = value.trim();
        if (v.startsWith('http://') || v.startsWith('https://')) return v;
        const handle = normalizeHandle(v);
        if (!handle) return '';
        if (kind === 'X') return `https://x.com/${handle}`;
        if (kind === 'Instagram') return `https://www.instagram.com/${handle}/`;
        if (kind === 'Facebook') return `https://www.facebook.com/${handle}`;
        if (kind === 'YouTube' && (v.startsWith('@') || v.startsWith('＠'))) return `https://www.youtube.com/@${handle}`;
        return '';
    }

    function renderFilters(rows) {
        const categories = Array.from(new Set(rows.map(r => r['系統']).filter(Boolean)));
        const buttons = [{ label: 'すべて', value: 'all' }, ...categories.map(c => ({ label: c, value: c }))];
        const counts = rows.reduce((acc, row) => {
            const key = row['系統'] || '未分類';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        categoryFilters.innerHTML = buttons.map(btn =>
            `<button class="clubs-chip${btn.value === activeCategory ? ' is-active' : ''}" data-value="${btn.value}" type="button">${btn.label}<span>${btn.value === 'all' ? rows.length : (counts[btn.value] || 0)}</span></button>`
        ).join('');

        categoryFilters.querySelectorAll('.clubs-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                activeCategory = btn.dataset.value || 'all';
                render();
            });
        });
    }

    function matches(row) {
        const categoryOk = activeCategory === 'all' || row['系統'] === activeCategory;
        if (!categoryOk) return false;
        if (!searchText) return true;
        const haystack = [
            row['サークル名'],
            row['系統'],
            row['活動概要'],
            row['公式HP'],
            row['X'],
            row['Instagram'],
            row['Facebook'],
            row['YouTube'],
            row['LINE'],
            row['その他SNS・媒体']
        ].join(' ').toLowerCase();
        return haystack.includes(searchText);
    }

    function getCategoryAccent(category) {
        if (category === '体育系') return 'sports';
        if (category === '文化系') return 'culture';
        return 'other';
    }

    function extractPdfUrls(row) {
        const text = [
            row['出典URL'] || '',
            row['公式HP'] || '',
            row['その他SNS・媒体'] || ''
        ].join(' ; ');
        const matches = text.match(/https?:\/\/[^\s;]+\.pdf(?:\?[^\s;]*)?/gi) || [];
        return Array.from(new Set(matches));
    }

    function renderCard(row) {
        const snsItems = [
            ['公式HP', row['公式HP']],
            ['X', row['X']],
            ['Instagram', row['Instagram']],
            ['Facebook', row['Facebook']],
            ['YouTube', row['YouTube']],
            ['LINE', row['LINE']],
            ['その他', row['その他SNS・媒体']]
        ];

        let hasResolvableLink = false;
        const snsHtml = snsItems.map(([label, value]) => {
            if (!value) return '';
            const url = toUrl(value, label);
            if (url) {
                hasResolvableLink = true;
                return `<a class="club-link-chip" href="${url}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
            }
            return `<span class="club-link-chip is-muted">${label}: ${escapeHtml(value)}</span>`;
        }).filter(Boolean).join('');
        const pdfHtml = extractPdfUrls(row)
            .map((url, idx) => `<a class="club-link-chip" href="${url}" target="_blank" rel="noopener noreferrer">PDF${idx > 0 ? idx + 1 : ''}</a>`)
            .join('');

        const category = row['系統'] || '未分類';
        const accent = getCategoryAccent(category);
        const rawSummary = row['活動概要'] || '活動概要の記載なし';
        const summary = (hasResolvableLink && /確認しきれず|未確認/.test(rawSummary))
            ? 'SNSリンクは確認済み。活動詳細は公式案内・各SNSで確認してください。'
            : rawSummary;

        return `
            <article class="club-card club-accent-${accent}">
                <div class="club-card-head">
                    <h4>${escapeHtml(row['サークル名'])}</h4>
                    <span class="club-tag">${escapeHtml(category)}</span>
                </div>
                <p class="club-desc">${escapeHtml(summary)}</p>
                <div class="club-links">${snsHtml || ''}${pdfHtml}${(!snsHtml && !pdfHtml) ? '<span class="club-link-chip is-muted">公開リンク情報なし</span>' : ''}</div>
            </article>
        `;
    }

    function render() {
        if (!allRows.length) return;
        renderFilters(allRows);

        const filtered = allRows.filter(matches);
        const grouped = filtered.reduce((acc, row) => {
            const key = row['系統'] || '未分類';
            if (!acc[key]) acc[key] = [];
            acc[key].push(row);
            return acc;
        }, {});

        resultCount.textContent = `${filtered.length}件 / 全${allRows.length}件`;
        if (statsContainer) {
            const categoryCount = Object.keys(grouped).length;
            statsContainer.innerHTML = `
                <div class="clubs-stat"><span>掲載数</span><strong>${allRows.length}</strong></div>
                <div class="clubs-stat"><span>表示中</span><strong>${filtered.length}</strong></div>
                <div class="clubs-stat"><span>系統数</span><strong>${categoryCount}</strong></div>
            `;
        }

        const order = ['文化系', '体育系', '未分類'];
        const sections = Object.keys(grouped)
            .sort((a, b) => {
                const ia = order.indexOf(a);
                const ib = order.indexOf(b);
                if (ia === -1 && ib === -1) return a.localeCompare(b, 'ja');
                if (ia === -1) return 1;
                if (ib === -1) return -1;
                return ia - ib;
            })
            .map(group =>
                `<section class="club-group"><h3>${group}<span>${grouped[group].length}件</span></h3><div class="club-grid">${grouped[group].map(renderCard).join('')}</div></section>`
            );

        listContainer.innerHTML = sections.length ? sections.join('') : '<p>該当するサークルがありません。</p>';
    }

    fetch(CSV_PATH)
        .then(res => res.text())
        .then(text => {
            allRows = toObjects(text);
            searchInput.addEventListener('input', () => {
                searchText = searchInput.value.trim().toLowerCase();
                render();
            });
            render();
        })
        .catch(() => {
            listContainer.innerHTML = '<p>CSVの読み込みに失敗しました。</p>';
        });
});
