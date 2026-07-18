// App State
let templates = [];
let filteredTemplates = [];
let metadata = null;
let currentFilters = {
    search: '',
    category: 'all',
    tags: []
};
let currentPage = 1;
const itemsPerPage = 30;
let activeMessageHandler = null;


// DOM Elements
const templatesGrid = document.getElementById('templatesGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const resetFiltersBtn = document.getElementById('resetFilters');
const themeToggle = document.getElementById('themeToggle');
const templateModal = document.getElementById('templateModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const noResults = document.getElementById('noResults');
const resultsCount = document.getElementById('resultsCount');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadTemplates();
    setupEventListeners();
});

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Load Templates
async function loadTemplates() {
    try {
        showLoading();
        const response = await fetch('data/templates.json');
        metadata = await response.json();
        
        // Flatten templates from categories structure
        templates = [];
        if (metadata.categories) {
            Object.entries(metadata.categories).forEach(([category, data]) => {
                data.templates.forEach(template => {
                    templates.push({
                        ...template,
                        category: category
                    });
                });
            });
        }
        
        filteredTemplates = [...templates];
        currentPage = 1;
        
        // Populate category filter
        populateCategoryFilter();
        
        renderTemplates();
        updateTemplateCount();
        updateResultsInfo();
    } catch (error) {
        console.error('Error loading templates:', error);
        showError('Failed to load templates. Please try again later.');
    }
}

// Populate category filter from metadata
function populateCategoryFilter() {
    if (!metadata || !metadata.categories) return;
    
    // Clear existing options except "All Categories"
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    // Add category options with counts
    Object.entries(metadata.categories).forEach(([category, data]) => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = `${formatCategoryName(category)} (${data.count})`;
        categoryFilter.appendChild(option);
    });

    // Populate custom select dropdown UI
    const customDropdown = document.getElementById('customCategoryDropdown');
    if (customDropdown) {
        customDropdown.innerHTML = '';
        
        let totalCount = 0;
        Object.values(metadata.categories).forEach(cat => totalCount += cat.count);
        
        const allItem = document.createElement('div');
        allItem.className = 'custom-select-item selected';
        allItem.setAttribute('role', 'option');
        allItem.setAttribute('data-value', 'all');
        allItem.innerHTML = `
            <span>🔍 All Categories</span>
            <span class="count-badge">${totalCount}</span>
        `;
        customDropdown.appendChild(allItem);
        
        Object.entries(metadata.categories).forEach(([category, data]) => {
            const item = document.createElement('div');
            item.className = 'custom-select-item';
            item.setAttribute('role', 'option');
            item.setAttribute('data-value', category);
            item.innerHTML = `
                <span>${formatCategoryName(category)}</span>
                <span class="count-badge">${data.count}</span>
            `;
            customDropdown.appendChild(item);
        });
        
        setupCustomSelectEvents();
    }
}

// Setup custom dropdown select events
function setupCustomSelectEvents() {
    const selectEl = document.getElementById('customCategorySelect');
    const trigger = document.getElementById('customCategoryTrigger');
    if (!selectEl || !trigger) return;

    const triggerText = trigger.querySelector('.trigger-text');
    const dropdown = document.getElementById('customCategoryDropdown');
    const items = dropdown.querySelectorAll('.custom-select-item');
    const nativeSelect = document.getElementById('categoryFilter');
    
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isActive = selectEl.classList.contains('active');
        selectEl.classList.toggle('active');
        trigger.setAttribute('aria-expanded', !isActive);
    });
    
    items.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const value = item.getAttribute('data-value');
            const text = item.querySelector('span').textContent;
            
            items.forEach(i => i.classList.remove('selected'));
            item.classList.add('selected');
            
            triggerText.textContent = text;
            selectEl.classList.remove('active');
            trigger.setAttribute('aria-expanded', 'false');
            
            if (nativeSelect) {
                nativeSelect.value = value;
                nativeSelect.dispatchEvent(new Event('change'));
            }
        });
    });
    
    document.addEventListener('click', () => {
        selectEl.classList.remove('active');
        trigger.setAttribute('aria-expanded', 'false');
    });
}

// Format category name for display
function formatCategoryName(category) {
    const icons = {
        'badges-icons': '🏆',
        'code-focused': '💻',
        'creative-artistic': '🎨',
        'data-visual': '📊',
        'dynamic-interactive': '⚡',
        'media-rich': '🖼️',
        'minimalistic': '🎯',
        'showcase-collections': '✨',
        'others': '📦'
    };
    
    const icon = icons[category] || '📄';
    const name = category.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    return `${icon} ${escapeHtml(name)}`;
}

// Show loading state
function showLoading() {
    templatesGrid.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading awesome templates...</p>
        </div>
    `;
}

// Update results info
function updateResultsInfo() {
    if (resultsCount) {
        const total = templates.length;
        const matched = filteredTemplates.length;
        const rendered = Math.min(currentPage * itemsPerPage, matched);
        
        if (matched === total) {
            resultsCount.textContent = `Showing ${rendered} of all ${total} templates`;
        } else {
            resultsCount.textContent = `Showing ${rendered} of ${matched} matching templates (total: ${total})`;
        }
    }
}

// Render Templates
function renderTemplates() {
    const templatesToRender = filteredTemplates.slice(0, currentPage * itemsPerPage);
    
    if (templatesToRender.length === 0) {
        templatesGrid.innerHTML = '';
        noResults.style.display = 'block';
        const loadMoreContainer = document.getElementById('loadMoreContainer');
        if (loadMoreContainer) loadMoreContainer.style.display = 'none';
        updateResultsInfo();
        return;
    }
    
    noResults.style.display = 'none';
    
    templatesGrid.innerHTML = templatesToRender.map(template => {
        // Use default preview if preview_url is false
        const previewImage = template.preview_url && template.preview_url !== 'false' && template.preview_url !== false
            ? template.preview_url
            : 'previews/default-preview.svg';
        
        const safeUsername = escapeHtml(template.username);
        const safeCategory = escapeHtml(template.category);
        const safePreviewImage = escapeHtml(
            template.preview_url && template.preview_url !== 'false' && template.preview_url !== false
                ? template.preview_url
                : 'previews/default-preview.svg'
        );
        return `
            <div class="template-card" data-username="${safeUsername}" data-category="${safeCategory}">
                <div class="template-category-badge">${formatCategoryName(template.category)}</div>
                <div class="template-preview-image">
                    <img 
                        src="${safePreviewImage}" 
                        alt="${safeUsername} preview"
                        loading="lazy"
                        onerror="this.src='previews/default-preview.svg'"
                    >
                </div>
                <div class="template-content">
                    <div class="template-header">
                        <h3 class="template-title">${safeUsername}</h3>
                    </div>
                    
                    <div class="template-tags">
                        ${template.tags && template.tags.length > 0 
                            ? template.tags.slice(0, 6).map(tag => 
                                `<span class="template-tag" data-tag="${escapeHtml(tag)}" title="Filter by ${escapeHtml(tag)}">#${escapeHtml(tag)}</span>`
                            ).join('') 
                            : '<span class="template-tag" style="opacity: 0.5;">#template</span>'}
                    </div>
                    
                    <div class="template-footer">
                        <div class="template-difficulty">
                            <span class="difficulty-dot difficulty-intermediate"></span>
                            <span>${formatCategoryName(template.category).split(' ').slice(1).join(' ')}</span>
                        </div>
                        <div class="template-actions">
                            <button class="template-action btn-view-template" title="Preview Template">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </button>
                            <button class="template-action btn-download-template" title="Download Markdown">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7 10 12 15 17 10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Toggle Load More button
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    if (loadMoreContainer) {
        if (currentPage * itemsPerPage < filteredTemplates.length) {
            loadMoreContainer.style.display = 'block';
        } else {
            loadMoreContainer.style.display = 'none';
        }
    }
    
    updateResultsInfo();
    
    // Add click events to cards using event delegation
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const username = card.dataset.username;
            const category = card.dataset.category;
            if (e.target.closest('.btn-view-template')) {
                e.stopPropagation();
                viewTemplate(username, category);
            } else if (e.target.closest('.btn-download-template')) {
                e.stopPropagation();
                downloadTemplate(username, category);
            } else if (e.target.closest('.template-tag')) {
                e.stopPropagation();
                const tag = e.target.closest('.template-tag').dataset.tag;
                if (tag) addTagFilter(tag);
            } else if (!e.target.closest('.template-actions')) {
                viewTemplate(username, category);
            }
        });
    });
}

// Filter Templates
function filterTemplates() {
    filteredTemplates = templates.filter(template => {
        // Search filter
        const searchMatch = !currentFilters.search || 
            template.username.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
            template.category.toLowerCase().includes(currentFilters.search.toLowerCase()) ||
            (template.tags && template.tags.some(tag => tag.toLowerCase().includes(currentFilters.search.toLowerCase())));
        
        // Category filter
        const categoryMatch = currentFilters.category === 'all' || 
            template.category === currentFilters.category;
        
        // Tags filter
        const tagsMatch = currentFilters.tags.length === 0 ||
            (template.tags && currentFilters.tags.every(tag => 
                template.tags.some(t => t.toLowerCase() === tag.toLowerCase())
            ));
        
        return searchMatch && categoryMatch && tagsMatch;
    });
    
    currentPage = 1;
    renderTemplates();
    updateActiveTags();
}

// Update Active Tags Display
function updateActiveTags() {
    const activeTagsContainer = document.getElementById('activeTags');
    if (!activeTagsContainer) return;
    
    if (currentFilters.tags.length === 0) {
        activeTagsContainer.innerHTML = '';
        activeTagsContainer.style.display = 'none';
        return;
    }
    
    activeTagsContainer.style.display = 'flex';
    activeTagsContainer.innerHTML = currentFilters.tags.map(tag => `
        <span class="tag">
            #${escapeHtml(tag)}
            <span class="tag-remove" data-tag="${escapeHtml(tag)}">&times;</span>
        </span>
    `).join('');
}

// Add Tag Filter
function addTagFilter(tag) {
    if (!currentFilters.tags.includes(tag)) {
        currentFilters.tags.push(tag);
        filterTemplates();
        showNotification(`Filtered by #${tag}`);
    }
}

// Remove Tag Filter
function removeTagFilter(tag) {
    currentFilters.tags = currentFilters.tags.filter(t => t !== tag);
    filterTemplates();
}

// Reset Filters
function resetFilters() {
    currentFilters = {
        search: '',
        category: 'all',
        tags: []
    };
    searchInput.value = '';
    categoryFilter.value = 'all';
    
    // Sync custom dropdown UI on reset
    const customTriggerText = document.querySelector('#customCategoryTrigger .trigger-text');
    if (customTriggerText) {
        customTriggerText.textContent = '🔍 All Categories';
    }
    const customItems = document.querySelectorAll('#customCategoryDropdown .custom-select-item');
    customItems.forEach(item => {
        if (item.getAttribute('data-value') === 'all') {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });

    filterTemplates();
    showNotification('Filters reset');
}

// View Template Details with GitHub API Rendering
async function viewTemplate(username, category) {
    const template = templates.find(t => t.username === username && t.category === category);
    if (!template) return;
    
    try {
        const filePath = `templates/${category}/${username}.md`;
        const response = await fetch(filePath);
        const markdown = await response.text();
        
        const previewContent = document.getElementById('previewContent');
        const codeContent = document.getElementById('codeContent');
        
        // Update modal title
        const modalTitle = document.getElementById('modalTitle');
        if (modalTitle) {
            modalTitle.innerHTML = `
                ${escapeHtml(template.username)}
                <div style="font-size: 0.875rem; font-weight: 400; opacity: 0.8; margin-top: 4px;">
                    ${formatCategoryName(template.category)}
                </div>
            `;
        }
        
        // Show loading state
        if (previewContent) {
            previewContent.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading preview...</p></div>';
        }
        
        if (codeContent) {
            const codeElement = codeContent.querySelector('#rawCode');
            if (codeElement) {
                codeElement.textContent = markdown;
                // Apply syntax highlighting if available
                if (typeof hljs !== 'undefined') {
                    hljs.highlightElement(codeElement);
                }
            }
        }
        
        openModal();
        
        // Render preview using GitHub API
        if (previewContent) {
            await renderGitHubStylePreview(markdown, previewContent, template);
        }
        
    } catch (error) {
        console.error('Error loading template details:', error);
        showError('Failed to load template details.');
    }
}

// Render preview using GitHub API (like script.js)
async function renderGitHubStylePreview(markdownContent, container, template) {
    // Create wrapper div with template details
    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = 'template-preview-wrapper';
    
    // Add template header and meta info
    const headerHTML = `  
        <!-- <div class="template-meta" style="display: flex; flex-wrap: wrap; gap: 1rem; margin: 0; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
            <div class="meta-item" style="flex: 1;">
                <strong style="color: var(--text-primary);">Tags:</strong> 
                ${template.tags && template.tags.length > 0 
                    ? template.tags.map(tag => `<span class="template-tag" style="cursor: default;">#${escapeHtml(tag)}</span>`).join('')
                    : '<span style="opacity: 0.5; color: var(--text-secondary);">No tags</span>'}
            </div>
        </div> -->
    `;
    
    wrapperDiv.innerHTML = headerHTML;
    
    // Create preview container for markdown
    const previewContainer = document.createElement('div');
    previewContainer.className = 'markdown-preview-container';
    wrapperDiv.appendChild(previewContainer);
    
    container.innerHTML = '';
    container.appendChild(wrapperDiv);
    
    // Cleanup any existing active message listener first
    if (activeMessageHandler) {
        window.removeEventListener('message', activeMessageHandler);
        activeMessageHandler = null;
    }

    // Try local rendering with marked.js first (faster, avoids GitHub API rate limits)
    try {
        if (typeof marked !== 'undefined') {
            const localHtml = marked.parse(markdownContent);
            createIsolatedPreview(localHtml, previewContainer, template);
            return;
        }
    } catch (error) {
        console.warn('Local parsing with marked.js failed, trying GitHub API fallback:', error);
    }
    
    // Fallback to GitHub API
    try {
        const renderedHtml = await renderWithGitHubAPI(markdownContent);
        if (renderedHtml) {
            createIsolatedPreview(renderedHtml, previewContainer, template);
            return;
        }
    } catch (error) {
        console.warn('GitHub API failed, using raw fallback:', error);
    }

    // Simple fallback if both failed
    previewContainer.innerHTML = `
        <div style="padding: 16px; background: var(--bg-secondary); border-radius: 8px;">
            <pre style="white-space: pre-wrap; word-wrap: break-word; margin: 0; color: var(--text-primary);">${escapeHtml(markdownContent)}</pre>
        </div>
    `;
}

// Render with GitHub API
async function renderWithGitHubAPI(markdownContent) {
    try {
        const response = await fetch('https://api.github.com/markdown', {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: markdownContent,
                mode: 'markdown'
            })
        });
        
        if (response.ok) {
            return await response.text();
        } else if (response.status === 403) {
            console.warn('GitHub API rate limit exceeded');
            return null;
        } else {
            throw new Error(`GitHub API error: ${response.status}`);
        }
    } catch (error) {
        console.error('GitHub API request failed:', error);
        return null;
    }
}

// Create isolated preview iframe (like script.js)
function createIsolatedPreview(htmlContent, container, template) {
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width: 100%; border: none; background-color: #ffffff; overflow: hidden;';
    iframe.sandbox = 'allow-scripts';
    
    // GitHub-authentic CSS styles
    const githubStyles = `
        <style>
            body {
                font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans",Helvetica,Arial,sans-serif;
                font-size: 16px;
                line-height: 1.5;
                color: #1f2328;
                background-color: #ffffff;
                margin: 0;
                padding: 24px;
                word-wrap: break-word;
            }
            
            .markdown-body { max-width: 980px; margin: 0 auto; }
            
            h1, h2, h3, h4, h5, h6 {
                margin-top: 24px;
                margin-bottom: 16px;
                font-weight: 600;
                line-height: 1.25;
            }
            
            h1 { font-size: 2em; border-bottom: 1px solid #d0d7de; padding-bottom: .3em; }
            h2 { font-size: 1.5em; border-bottom: 1px solid #d0d7de; padding-bottom: .3em; }
            h3 { font-size: 1.25em; }
            
            p { margin-top: 0; margin-bottom: 16px; }
            
            a { color: #0969da; text-decoration: none; }
            a:hover { text-decoration: underline; }
            
            img { max-width: 100%; height: auto; box-sizing: content-box; }
            
            code {
                padding: .2em .4em;
                margin: 0;
                font-size: 85%;
                background-color: rgba(175,184,193,0.2);
                border-radius: 6px;
                font-family: ui-monospace,SFMono-Regular,Consolas,monospace;
            }
            
            pre {
                padding: 16px;
                overflow: auto;
                font-size: 85%;
                line-height: 1.45;
                background-color: #f6f8fa;
                border-radius: 6px;
                margin-bottom: 16px;
            }
            
            pre code { padding: 0; background: transparent; }
            
            blockquote {
                padding: 0 1em;
                color: #656d76;
                border-left: .25em solid #d0d7de;
                margin: 0 0 16px 0;
            }
            
            ul, ol { margin-bottom: 16px; padding-left: 2em; }
            
            table {
                border-collapse: collapse;
                margin-bottom: 16px;
                width: 100%;
            }
            
            table th, table td {
                padding: 6px 13px;
                border: 1px solid #d0d7de;
            }
            
            table th { background-color: #f6f8fa; font-weight: 600; }
            table tr:nth-child(2n) { background-color: #f6f8fa; }
            
            hr {
                height: .25em;
                padding: 0;
                margin: 24px 0;
                background-color: #d0d7de;
                border: 0;
            }
            
            /* Center badges */
            p:has(img[src*="shields.io"]),
            p:has(img[src*="badge"]) {
                text-align: center;
            }
        </style>
    `;
    
    // Use srcdoc to safely load HTML content in sandboxed iframe without CORS/origin issues
    iframe.srcdoc = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Preview</title>
            ${githubStyles}
        </head>
        <body>
            <div class="markdown-body">
                ${htmlContent}
            </div>
            <script>
                function adjustHeight() {
                    const height = document.body.scrollHeight;
                    window.parent.postMessage({type: 'resize', height: height}, '*');
                }
                
                setTimeout(adjustHeight, 100);
                
                document.querySelectorAll('img').forEach(img => {
                    img.onload = adjustHeight;
                    img.onerror = adjustHeight;
                });
                
                document.querySelectorAll('a').forEach(link => {
                    link.addEventListener('click', function(e) {
                        e.preventDefault();
                        window.open(this.href, '_blank');
                    });
                });
            </script>
        </body>
        </html>
    `;
    
    // Handle iframe height messages
    const messageHandler = function(event) {
        if (event.data.type === 'resize' && event.source === iframe.contentWindow) {
            iframe.style.height = (event.data.height + 40) + 'px';
        }
    };
    window.addEventListener('message', messageHandler);
    activeMessageHandler = messageHandler;
    
    container.innerHTML = '';
    container.appendChild(iframe);
}

// Copy Markdown to Clipboard
async function copyMarkdown(username, category) {
    const template = templates.find(t => t.username === username && t.category === category);
    if (!template) return;
    
    try {
        const filePath = `templates/${category}/${username}.md`;
        const response = await fetch(filePath);
        const markdown = await response.text();
        
        await navigator.clipboard.writeText(markdown);
        showNotification('✅ Markdown copied to clipboard!');
    } catch (error) {
        console.error('Error copying markdown:', error);
        showError('Failed to copy markdown. Please try again.');
    }
}

// Download template
async function downloadTemplate(username, category) {
    const template = templates.find(t => t.username === username && t.category === category);
    if (!template) return;
    
    try {
        const filePath = `templates/${category}/${username}.md`;
        const response = await fetch(filePath);
        const markdown = await response.text();
        
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template.username}-profile-readme.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('✅ Template downloaded!');
    } catch (error) {
        console.error('Error downloading template:', error);
        showError('Failed to download template.');
    }
}

// Switch modal tabs
function switchTab(tabName, btn) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
    });
    if (btn) btn.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    if (tabName === 'preview') {
        document.getElementById('previewContent').classList.add('active');
    } else if (tabName === 'code') {
        document.getElementById('codeContent').classList.add('active');
    }
}

// Copy code from code tab
async function copyCode() {
    const codeElement = document.getElementById('rawCode');
    if (!codeElement) return;
    
    try {
        await navigator.clipboard.writeText(codeElement.textContent);
        showNotification('✅ Code copied to clipboard!');
    } catch (error) {
        console.error('Error copying code:', error);
        showError('Failed to copy code.');
    }
}

// Modal Controls
function openModal() {
    templateModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    templateModal.classList.remove('active');
    document.body.style.overflow = '';
    // Remove active message listener to prevent memory leak
    if (activeMessageHandler) {
        window.removeEventListener('message', activeMessageHandler);
        activeMessageHandler = null;
    }
}

// Notification System
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showError(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Event Listeners
function setupEventListeners() {
    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Search with 300ms debounce
    if (searchInput) {
        let debounceTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                currentFilters.search = e.target.value;
                filterTemplates();
            }, 300);
        });
    }
    
    // Category filter
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentFilters.category = e.target.value;
            filterTemplates();
        });
    }
    
    // Reset filters
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }
    
    // Clear search button
    const clearSearchBtn = document.getElementById('clearSearch');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', resetFilters);
    }
    
    // Load more button for pagination
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            currentPage++;
            renderTemplates();
        });
    }
    
    // Modal close
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
        if (e.key === '/' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            if (searchInput) searchInput.focus();
        }
    });
    
    // Active tags click (remove tag)
    const activeTagsContainer = document.getElementById('activeTags');
    if (activeTagsContainer) {
        activeTagsContainer.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.tag-remove');
            if (removeBtn) {
                const tag = removeBtn.dataset.tag;
                if (tag) {
                    removeTagFilter(tag);
                }
            }
        });
    }
    
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Utility Functions
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function updateTemplateCount() {
    const countElement = document.getElementById('templateCount');
    if (countElement && metadata) {
        countElement.textContent = `${metadata.totalTemplates}+`;
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .template-details {
        max-width: 100%;
    }
    
    .template-details-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    
    .template-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin: 1.5rem 0;
        padding: 1rem;
        background: var(--bg-secondary);
        border-radius: 8px;
    }
    
    .meta-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .difficulty-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        font-size: 0.875rem;
        font-weight: 600;
        color: white;
    }
    
    .difficulty-badge.difficulty-beginner {
        background-color: #10b981;
    }
    
    .difficulty-badge.difficulty-intermediate {
        background-color: #f59e0b;
    }
    
    .difficulty-badge.difficulty-advanced {
        background-color: #ef4444;
    }
    
    .template-features {
        margin: 1.5rem 0;
    }
    
    .template-features ul {
        list-style: none;
        padding: 0;
    }
    
    .template-features li {
        padding: 0.5rem 0;
        padding-left: 1.5rem;
        position: relative;
    }
    
    .template-features li:before {
        content: "✓";
        position: absolute;
        left: 0;
        color: #10b981;
        font-weight: bold;
    }
    
    .template-actions-modal {
        display: flex;
        gap: 1rem;
        margin: 1.5rem 0;
        flex-wrap: wrap;
    }
    
    .markdown-preview,
    .markdown-code {
        margin-top: 2rem;
    }
    
    .markdown-code pre {
        background: var(--bg-secondary);
        padding: 1rem;
        border-radius: 8px;
        overflow-x: auto;
        max-height: 400px;
    }
    
    .template-preview-wrapper {
        width: 100%;
    }
    
    .template-details-header {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .markdown-preview-container {
        width: 100%;
        min-height: 200px;
    }
    
    .markdown-preview-container iframe {
        border-radius: 8px;
        overflow: hidden;
    }
`;
document.head.appendChild(style);

// Scroll to Top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', () => {
    const scrollBtn = document.getElementById('scrollToTop');
    if (scrollBtn) {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    }
});

