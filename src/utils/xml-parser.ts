interface XmlNode {
    tagName: string;
    attributes: Record<string, string>;
    children: (XmlNode | string)[];
}

interface ParseOptions {
    generateIds?: boolean;
    cssClasses?: Record<string, string>;
    includeStyles?: boolean;
    includeJS?: boolean;
}

interface Author {
    nickname: string;
    rol: 'creador' | 'colaborador';
}

const COMPONENT_CSS = `
:root {
    /* Paleta Notion: tonos grises y azules sutiles */
    --color-bg: #ffffff;
    --color-bg-secondary: #f7f6f3;
    --color-text-primary: #37352f;
    --color-text-secondary: #787774;
    --color-text-tertiary: #9b9a97;
    --color-border: #e9e9e7;
    --color-accent: #2383e2;
    --color-accent-bg: rgba(35, 131, 226, 0.08);
    --color-hover-bg: rgba(0, 0, 0, 0.03);
    --color-code-bg: #f7f6f3;
    --color-code-border: #e9e9e7;
}

@media (prefers-color-scheme: dark) {
    :root {
        --color-bg: #191919;
        --color-bg-secondary: #252525;
        --color-text-primary: #ffffff;
        --color-text-secondary: #9b9a97;
        --color-text-tertiary: #6f6f6f;
        --color-border: #373737;
        --color-accent: #5a9fd4;
        --color-accent-bg: rgba(90, 159, 212, 0.15);
        --color-hover-bg: rgba(255, 255, 255, 0.05);
        --color-code-bg: #252525;
        --color-code-border: #373737;
    }
}

.doc-parser-container {
    background: var(--color-bg);
    min-height: 100vh;
    color: var(--color-text-primary);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.6;
    font-size: 1rem;
}

.doc-parser-container * {
    box-sizing: border-box;
}

.doc-parser-container p {
    margin-bottom: 1rem;
    color: var(--color-text-primary);
}

.doc-parser-container a {
    color: var(--color-accent);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-bottom-color 0.15s ease;
}

.doc-parser-container a:hover {
    border-bottom-color: var(--color-accent);
}

.doc-parser-container h1 {
    color: var(--color-text-primary);
    margin-top: 2rem !important;
    margin-bottom: 0.75rem !important;
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.02em;
}

.doc-parser-container h2 {
    color: var(--color-text-primary);
    margin-top: 2rem !important;
    margin-bottom: 0.75rem !important;
    font-size: 1.875rem;
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: -0.01em;
}

.doc-parser-container h3 {
    color: var(--color-text-primary);
    margin-top: 1.5rem !important;
    margin-bottom: 0.5rem !important;
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.3;
}

.doc-parser-container h4,
.doc-parser-container h5,
.doc-parser-container h6 {
    color: var(--color-text-primary);
    margin-top: 1.25rem !important;
    margin-bottom: 0.5rem !important;
    font-weight: 600;
    line-height: 1.3;
}

.doc-parser-container code:not(pre code) {
    background-color: var(--color-accent-bg);
    color: var(--color-accent);
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 0.9em;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

.doc-parser-container pre {
    background-color: var(--color-code-bg) !important;
    border: 1px solid var(--color-code-border);
    border-radius: 3px;
    padding: 16px !important;
    margin: 1.5rem 0 !important;
    overflow-x: auto;
    font-size: 0.875rem;
    line-height: 1.5;
}

.doc-parser-container pre code {
    background-color: transparent !important;
    color: var(--color-text-primary) !important;
    padding: 0 !important;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

.doc-parser-container ul,
.doc-parser-container ol {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
    list-style: none;
}

.doc-parser-container ul > li {
    position: relative;
    padding-left: 0.5rem;
    margin-bottom: 0.25rem;
    color: var(--color-text-primary);
}

.doc-parser-container ul > li::before {
    content: "•";
    position: absolute;
    left: -1rem;
    color: var(--color-text-tertiary);
    font-weight: bold;
}

.doc-parser-container ol {
    counter-reset: item;
}

.doc-parser-container ol > li {
    position: relative;
    padding-left: 0.5rem;
    margin-bottom: 0.25rem;
    color: var(--color-text-primary);
    counter-increment: item;
}

.doc-parser-container ol > li::before {
    content: counter(item) ".";
    position: absolute;
    left: -1.5rem;
    color: var(--color-text-tertiary);
    font-weight: 500;
    font-size: 0.875rem;
}

.doc-parser-container hr {
    border: none;
    border-top: 1px solid var(--color-border);
    margin: 2rem 0;
}

.doc-authors-trigger {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 40px;
    height: 40px;
    background-color: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 1000;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.doc-authors-trigger:hover {
    background-color: var(--color-hover-bg);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.doc-authors-trigger svg {
    width: 20px;
    height: 20px;
    color: var(--color-text-secondary);
}

.doc-authors-popup {
    position: fixed;
    bottom: 76px;
    right: 24px;
    background-color: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 16px;
    min-width: 240px;
    max-width: 320px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    opacity: 0;
    transform: translateY(10px) scale(0.95);
    pointer-events: none;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1001;
}

.doc-authors-popup.active {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: all;
}

.doc-authors-header {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
}

.doc-author-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid var(--color-border);
}

.doc-author-item:last-child {
    border-bottom: none;
}

.doc-author-nickname {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-primary);
}

.doc-author-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 600;
    line-height: 1.4;
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.doc-author-badge.creador {
    background-color: rgba(239, 68, 68, 0.15);
    color: #ef4444;
}

.doc-author-badge.colaborador {
    background-color: rgba(251, 191, 36, 0.15);
    color: #f59e0b;
}

.doc-steps {
    margin: 1.5rem 0;
    padding-left: 0;
    list-style: none;
}

.doc-step {
    display: flex;
    gap: 16px;
    position: relative;
    padding-bottom: 32px;
}

.doc-step::before {
    display: none !important;
}

.doc-step:last-child {
    padding-bottom: 0;
}

.doc-step:last-child .doc-step-line {
    display: none;
}

.doc-step-number-container {
    position: relative;
    flex-shrink: 0;
}

.doc-step-number {
    width: 32px;
    height: 32px;
    background-color: var(--color-accent);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.875rem;
    z-index: 2;
    position: relative;
}

.doc-step-line {
    position: absolute;
    top: 32px;
    left: 15px;
    width: 2px;
    height: calc(100% + 16px);
    background-color: var(--color-border);
    z-index: 1;
}

.doc-step-content {
    flex: 1;
    padding-top: 4px;
}

.doc-step-content > *:first-child {
    margin-top: 0 !important;
}

.doc-step-content > *:last-child {
    margin-bottom: 0 !important;
}

.doc-aside {
    border-radius: 6px;
    margin: 1.5rem 0;
    padding: 16px;
    border-left: 3px solid;
}

.doc-aside-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    margin-bottom: 8px;
    font-size: 0.875rem;
}

.doc-aside-content {
    font-size: 0.875rem;
    line-height: 1.6;
}

.aside-note {
    background-color: rgba(35, 131, 226, 0.08);
    border-left-color: #2383e2;
    color: var(--color-text-primary);
}

.aside-note .doc-aside-header {
    color: #2383e2;
}

.aside-tip {
    background-color: rgba(16, 185, 129, 0.08);
    border-left-color: #10b981;
    color: var(--color-text-primary);
}

.aside-tip .doc-aside-header {
    color: #10b981;
}

.aside-warning {
    background-color: rgba(255, 163, 68, 0.08);
    border-left-color: #ffa344;
    color: var(--color-text-primary);
}

.aside-warning .doc-aside-header {
    color: #ffa344;
}

.aside-danger {
    background-color: rgba(239, 68, 68, 0.08);
    border-left-color: #ef4444;
    color: var(--color-text-primary);
}

.aside-danger .doc-aside-header {
    color: #ef4444;
}

.doc-badge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.4;
    margin: 0 4px;
}

.doc-badge-new {
    background-color: rgba(16, 185, 129, 0.15);
    color: #10b981;
}

.doc-badge-deprecated {
    background-color: rgba(239, 68, 68, 0.15);
    color: #ef4444;
}

.doc-badge-demo {
    background-color: rgba(168, 85, 247, 0.15);
    color: #a855f7;
}

.doc-badge-success {
    background-color: rgba(34, 197, 94, 0.15);
    color: #22c55e;
}

.doc-badge-experimental {
    background-color: rgba(251, 191, 36, 0.15);
    color: #f59e0b;
}

.doc-table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    font-size: 0.875rem;
    border-radius: 6px;
    overflow: hidden;
}

.doc-table th,
.doc-table td {
    padding: 10px 12px;
    border: 1px solid var(--color-border);
    text-align: left;
}

.doc-table th {
    background-color: var(--color-bg-secondary);
    font-weight: 600;
    color: var(--color-text-primary);
}

.doc-table tr:hover {
    background-color: var(--color-hover-bg);
}

.doc-blockquote {
    border-left: 3px solid var(--color-border);
    padding-left: 16px;
    margin: 1.5rem 0;
    color: var(--color-text-secondary);
    font-style: italic;
    font-size: 0.938rem;
}

.doc-card {
    background-color: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 20px;
    margin: 1.5rem 0;
    transition: box-shadow 0.2s ease;
}

.doc-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.doc-card-icon {
    font-size: 2rem;
    margin-bottom: 12px;
    color: var(--color-accent);
}

.doc-card-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--color-text-primary);
}

.doc-card-content {
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    line-height: 1.6;
}

.doc-card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    margin: 1.5rem 0;
}

.doc-accordion {
    margin: 1.5rem 0;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    overflow: hidden;
}

.doc-accordion-item {
    border-bottom: 1px solid var(--color-border);
}

.doc-accordion-item:last-child {
    border-bottom: none;
}

.doc-accordion-header {
    width: 100%;
    padding: 14px 16px;
    background-color: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    font-weight: 500;
    color: var(--color-text-primary);
    transition: background-color 0.15s ease;
    text-align: left;
    font-size: 0.938rem;
}

.doc-accordion-header:hover {
    background-color: var(--color-hover-bg);
}

.doc-accordion-icon {
    transition: transform 0.2s ease;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
}

.doc-accordion-header.active .doc-accordion-icon {
    transform: rotate(180deg);
}

.doc-accordion-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
}

.doc-accordion-content.active {
    max-height: 1000px;
}

.doc-accordion-body {
    padding: 16px;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    line-height: 1.6;
}

.doc-code-block {
    margin: 1.5rem 0;
    border-radius: 6px;
    overflow: hidden;
    border: 1px solid var(--color-border);
}

.doc-code-header {
    background-color: var(--color-bg-secondary);
    padding: 8px 16px;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.doc-code-lang {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.doc-link-button {
    display: inline-flex;
    align-items: center;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.15s ease;
    margin: 4px;
    border: none;
    cursor: pointer;
}

.doc-link-button-primary {
    background-color: var(--color-accent-bg);
    color: white;
}

.doc-link-button-primary:hover {
    background-color: #1c6bc4;
    color: white;
    transform: translateY(-1px);
}

.doc-link-button-secondary {
    background-color: var(--color-bg-secondary);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
}

.doc-link-button-secondary:hover {
    background-color: var(--color-hover-bg);
    color: var(--color-text-primary);
    transform: translateY(-1px);
}

.doc-link-button-minimal {
    background-color: trasparent;
    color: var(--color-accent);
    border: none;
}

.doc-link-button-minimal:hover {
    background-color: var(--color-accent-bg);
    color: var(--color-accent);
    transform: translateY(-1px);
}

.doc-tabs {
    margin: 1.5rem 0;
    border: 1px solid var(--color-border);
    border-radius: 6px;
    overflow: hidden;
}

.doc-tabs-header {
    display: flex;
    background-color: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border);
    overflow-x: auto;
}

.doc-tab-button {
    padding: 12px 20px;
    background-color: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;
}

.doc-tab-button:hover {
    color: var(--color-text-primary);
    background-color: var(--color-hover-bg);
}

.doc-tab-button.active {
    color: var(--color-accent);
    border-bottom-color: var(--color-accent);
}

.doc-tabs-content {
    background-color: var(--color-bg);
}

.doc-tab-panel {
    display: none;
    padding: 20px;
    font-size: 0.875rem;
    color: var(--color-text-secondary);
    line-height: 1.6;
}

.doc-tab-panel.active {
    display: block;
}

@media (max-width: 768px) {
    .doc-parser-container h1 {
        font-size: 2rem;
    }
    
    .doc-parser-container h2 {
        font-size: 1.625rem;
    }
    
    .doc-parser-container h3 {
        font-size: 1.375rem;
    }
    
    .doc-card-grid {
        grid-template-columns: 1fr;
    }
    
    .doc-tabs-header {
        flex-direction: column;
    }
    
    .doc-tab-button {
        border-bottom: none;
        border-left: 2px solid transparent;
    }
    
    .doc-tab-button.active {
        border-bottom-color: transparent;
        border-left-color: var(--color-accent);
    }
    
    .doc-authors-trigger {
        bottom: 16px;
        right: 16px;
    }
    
    .doc-authors-popup {
        bottom: 68px;
        right: 16px;
        max-width: calc(100vw - 32px);
    }
}
`;


const COMPONENT_JS = `
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInteractivity);
} else {
    initInteractivity();
}

function initInteractivity() {
    const authorsTrigger = document.querySelector('.doc-authors-trigger');
    const authorsPopup = document.querySelector('.doc-authors-popup');
    
    if (authorsTrigger && authorsPopup) {
        let isPopupOpen = false;
        
        authorsTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            isPopupOpen = !isPopupOpen;
            authorsPopup.classList.toggle('active', isPopupOpen);
        });
        
        document.addEventListener('click', (e) => {
            if (isPopupOpen && !authorsPopup.contains(e.target) && e.target !== authorsTrigger) {
                isPopupOpen = false;
                authorsPopup.classList.remove('active');
            }
        });
    }

    const accordionHeaders = document.querySelectorAll('.doc-accordion-header');
    
    accordionHeaders.forEach(header => {
        const content = document.getElementById(header.getAttribute('data-target') || '');
        if (content && header.parentElement?.parentElement?.querySelector('.doc-accordion-item:first-child .doc-accordion-header') === header) {
            content.classList.add('active');
            header.classList.add('active');

            const icon = header.querySelector('.doc-accordion-icon');

            if (icon) {
                icon.style.transform = 'rotate(180deg)';
            }
        }
        
        header.addEventListener('click', () => {
            const targetId = header.getAttribute('data-target');
            const content = targetId ? document.getElementById(targetId) : null;
            const icon = header.querySelector('.doc-accordion-icon');
            
            if (content) {
                const isActive = content.classList.contains('active');
                const accordion = header.closest('.doc-accordion');

                if (accordion) {
                    const allContents = accordion.querySelectorAll('.doc-accordion-content');
                    const allHeaders = accordion.querySelectorAll('.doc-accordion-header');
                    const allIcons = accordion.querySelectorAll('.doc-accordion-icon');
                    
                    allContents.forEach(c => {
                        c.classList.remove('active');
                        c.style.maxHeight = '0';
                    });

                    allHeaders.forEach(h => h.classList.remove('active'));
                    allIcons.forEach(i => i.style.transform = 'rotate(0deg)');
                }
                
                if (!isActive) {
                    content.classList.add('active');
                    content.style.maxHeight = content.scrollHeight + 'px';
                    header.classList.add('active');

                    if (icon) {
                        icon.style.transform = 'rotate(180deg)';
                    }
                }
            }
        });
    });

    const tabButtons = document.querySelectorAll('.doc-tab-button');
    
    tabButtons.forEach((button, index) => {
        if (index === 0) {
            button.classList.add('active');

            const tabId = button.getAttribute('data-tab');

            if (tabId) {
                const targetPanel = document.getElementById(tabId);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            }
        }
        
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            const tabsContainer = button.closest('.doc-tabs');
            
            if (!tabsContainer || !tabId) return;
            
            const allButtons = tabsContainer.querySelectorAll('.doc-tab-button');
            const allPanels = tabsContainer.querySelectorAll('.doc-tab-panel');
            
            allButtons.forEach(btn => btn.classList.remove('active'));
            allPanels.forEach(panel => panel.classList.remove('active'));
            
            button.classList.add('active');

            const targetPanel = document.getElementById(tabId);

            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });

    const accordionContents = document.querySelectorAll('.doc-accordion-content');

    accordionContents.forEach(content => {
        content.addEventListener('transitionend', () => {
            if (content.classList.contains('active')) {
                content.style.maxHeight = 'none';
            }
        });
    });
}

if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                initInteractivity();
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}
`;

export function parseXmlToHtml(xmlString: string, options: ParseOptions = {}): string {
    const { generateIds = true, cssClasses = defaultCssClasses, includeStyles = true, includeJS = true } = options;
  
    // Extraer autores primero
    const authors = extractAuthors(xmlString);
  
    // Parsear XML a objeto
    const xmlDoc = parseXmlString(xmlString);
  
    // Convertir a HTML
    const htmlContent = convertNodeToHtml(xmlDoc, { generateIds, cssClasses });
  
    // Construir contenido final
    let finalContent = '';
  
    if (includeStyles) {
        finalContent += `<style>${COMPONENT_CSS}</style>`;
    }
  
    finalContent += `<div class="doc-parser-container">${htmlContent}</div>`;
  
    // Agregar widget de autores si existen
    if (authors.length > 0) {
        finalContent += generateAuthorsWidget(authors);
    }
  
    if (includeJS) {
        finalContent += `<script>${COMPONENT_JS}</script>`;
    }
  
    return finalContent;
}

function extractAuthors(xmlString: string): Author[] {
    const authors: Author[] = [];
    const authorsMatch = xmlString.match(/<authors>([\s\S]*?)<\/authors>/);
  
    if (!authorsMatch) return authors;
  
    const authorsContent = authorsMatch[1];
    const authorMatches = authorsContent.matchAll(/<author>([\s\S]*?)<\/author>/g);
  
    for (const match of authorMatches) {
        const authorContent = match[1];
        const nicknameMatch = authorContent.match(/<nickname>([^<]+)<\/nickname>/);
        const rolMatch = authorContent.match(/<rol>([^<]+)<\/rol>/);
    
        if (nicknameMatch && rolMatch) {
            const rol = rolMatch[1].toLowerCase().trim();

            if (rol === 'creador' || rol === 'colaborador') {
                authors.push({
                    nickname: nicknameMatch[1].trim(),
                    rol: rol as 'creador' | 'colaborador'
                });
            }
        }
    }
  
    return authors;
}

function generateAuthorsWidget(authors: Author[]): string {
    const authorsItems = authors.map(author => `
        <div class="doc-author-item">
            <span class="doc-author-nickname">${escapeHtml(author.nickname)}</span>
            <span class="doc-author-badge ${author.rol}">${author.rol}</span>
        </div>
    `).join('');
  
    return `
        <div class="doc-authors-trigger">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
        </div>
        <div class="doc-authors-popup">
            <div class="doc-authors-header">Autores</div>
            ${authorsItems}
        </div>
    `;
}

function parseXmlString(xmlString: string): XmlNode {
    const cleanXml = xmlString.replace(/<!--[\s\S]*?-->/g, '');
    return parseXmlNode(cleanXml);
}

function parseXmlNode(xml: string): XmlNode {
    const tagMatch = xml.match(/<([^\s>]+)([^>]*)>([\s\S]*?)<\/\1>/);

    if (!tagMatch) {
        return { tagName: 'root', attributes: {}, children: [xml] };
    }

    const [, tagName, attrString, content] = tagMatch;
    const attributes = parseAttributes(attrString);
    let children;

    // llevo toda la tarde buscando este error (me cago en mi existencia)
    if (tagMatch[0].startsWith('<code')) { // si es un bloque de código
        children = [ content ]; // devuelvo TODO "TAL CUAL". si el bloque era xml o html, se parseaba XD
    } else children = parseChildNodes(content);

    return { tagName, attributes, children };
}

function parseAttributes(attrString: string): Record<string, string> {
    const attrs: Record<string, string> = {};
    const attrMatches = attrString.matchAll(/(\w+)="([^"]*)"/g);
  
    for (const match of attrMatches) {
        attrs[match[1]] = match[2];
    }
  
    return attrs;
}

function parseChildNodes(content: string): (XmlNode | string)[] {
    const nodes: (XmlNode | string)[] = [];
    let currentContent = content;
  
    while (currentContent.length > 0) {
        const tagMatch = currentContent.match(/<([^\s>]+)([^>]*)>([\s\S]*?)<\/\1>/);
    
        if (!tagMatch) {
            if (currentContent.trim()) {
                nodes.push(currentContent.trim());
            }
            break;
        }
    
        const textBefore = currentContent.substring(0, tagMatch.index).trim();

        if (textBefore) {
            nodes.push(textBefore);
        }
    
        const node = parseXmlNode(tagMatch[0]);
        nodes.push(node);
    
        currentContent = currentContent.substring(tagMatch.index! + tagMatch[0].length);
    }
  
    return nodes;
}

const xmlToHtmlMap: Record<string, string> = {
    title1: 'h1',
    title2: 'h2',
    title3: 'h3',
    title4: 'h4',
    title5: 'h5',
    title6: 'h6',
    p: 'p',
    blockquote: 'blockquote',
    header: 'thead',
    row: 'tr',
    cell: 'td',
    content: 'div',
    title: 'span',
    icon: 'i',
    children: 'ul',
    list: 'ul',
    olist: 'ol',
    listitem: 'li',
    separator: 'br',
    line: 'hr'
};

const defaultCssClasses: Record<string, string> = {
    note: 'doc-aside aside-note',
    tip: 'doc-aside aside-tip',
    warning: 'doc-aside aside-warning',
    danger: 'doc-aside aside-danger',
    badge: 'doc-badge',
    table: 'doc-table',
    card: 'doc-card',
    cardgrid: 'doc-card-grid',
    accordion: 'doc-accordion',
    code: 'doc-code-block',
    linkbutton: 'doc-link-button',
    tabs: 'doc-tabs',
    steps: 'doc-steps',
    step: 'doc-step',
    list: 'doc-list',
    olist: 'doc-olist'
};

function convertNodeToHtml(node: XmlNode | string, options: ParseOptions, depth = 0): string {
    if (typeof node === 'string') {
        return escapeHtml(node);
    }

    const { generateIds, cssClasses } = options;
    const { tagName, attributes, children } = node;

    // Ignoro el nodo authors porque se procesa por separado
    if (tagName === 'authors') {
        return '';
    }

    const htmlTag = xmlToHtmlMap[tagName] || 'div';
    let cssClass;

    if (cssClasses) cssClass = cssClasses[tagName] || `doc-${tagName}`;

    let htmlAttributes = `class="${cssClass}"`;
  
    if (attributes.lang) htmlAttributes += ` data-lang="${attributes.lang === 'cmd'? 'text' : attributes.lang}"`;
    if (attributes.type) htmlAttributes += ` data-type="${attributes.type}"`;
    if (attributes.href) htmlAttributes += ` href="${attributes.href}"`;
    if (attributes.variant) htmlAttributes += ` data-variant="${attributes.variant}"`;
    if (attributes.name) htmlAttributes += ` data-name="${attributes.name}"`;

    if (generateIds) {
        if (tagName === 'accordion' || tagName === 'tabs') {
            const id = `doc-${tagName}-${depth}-${Date.now()}`;
            htmlAttributes += ` id="${id}"`;
        }
    }

    const childrenHtml = children.map(child => 
        convertNodeToHtml(child, options, depth + 1)
    ).join('');

    switch (tagName) {
        case 'note':
        case 'tip':
        case 'warning':
        case 'danger':
            return `
                <div class="doc-aside aside-${tagName}">
                    <div class="doc-aside-header">
                        ${getAsideIcon(tagName)} ${getAsideTitle(tagName)}
                    </div>
                    <div class="doc-aside-content">
                        ${childrenHtml}
                    </div>
                </div>
            `;

        case 'badge':
            return `<span class="doc-badge doc-badge-${attributes.type}">${childrenHtml}</span>`;

        case 'table':
            return `<table class="doc-table">${childrenHtml}</table>`;

        case 'header':
            return `<thead><tr>${childrenHtml}</tr></thead>`;

        case 'row':
            return `<tr>${childrenHtml}</tr>`;

        case 'cell':
            return `<td>${childrenHtml}</td>`;

        case 'card':
            let cardContent = '';

            for (const child of children) {
                if (typeof child === 'object') {
                    if (child.tagName === 'icon') {
                        cardContent += `<div class="doc-card-icon">${convertNodeToHtml(child, options, depth + 1)}</div>`;
                    } else if (child.tagName === 'title') {
                        cardContent += `<div class="doc-card-title">${convertNodeToHtml(child, options, depth + 1)}</div>`;
                    } else if (child.tagName === 'content') {
                        cardContent += `<div class="doc-card-content">${convertNodeToHtml(child, options, depth + 1)}</div>`;
                    } else {
                        cardContent += convertNodeToHtml(child, options, depth + 1);
                    }
                } else {
                    cardContent += child;
                }
            }

            return `<div class="doc-card">${cardContent}</div>`;

        case 'cardgrid':
            return `<div class="doc-card-grid">${childrenHtml}</div>`;

        case 'accordion':
            return `<div class="doc-accordion">${childrenHtml}</div>`;

        case 'item':
            if (depth > 0 && node.children.some(child => typeof child === 'object' && child.tagName === 'title')) {
                const itemId = `accordion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                return `
                    <div class="doc-accordion-item">
                        <button class="doc-accordion-header" data-target="${itemId}">
                            ${extractTitle(node.children)}
                            <span class="doc-accordion-icon">▼</span>
                        </button>
                        <div class="doc-accordion-content" id="${itemId}">
                            <div class="doc-accordion-body">
                                ${extractContent(node.children)}
                            </div>
                        </div>
                    </div>
                `;
            }
            break;

        case 'code':
            const lang = attributes.lang || 'text';

            return `
                <div class="doc-code-block">
                    <div class="doc-code-header">
                        <span class="doc-code-lang">${lang}</span>
                    </div>
                    <pre><code class="language-${lang}">${childrenHtml}</code></pre>
                </div>
            `;

        case 'linkbutton':
            return `
                <a class="doc-link-button doc-link-button-${attributes.variant || 'primary'}" ${attributes.href ? `href="${attributes.href}"` : ''}>
                    ${childrenHtml}
                </a>
            `;

        case 'steps':
            let stepCounter = 0;
            const stepsChildrenHtml = children.map(child => {
                if (typeof child === 'object' && child.tagName === 'step') {
                    stepCounter++;
                    // estoy harto de codear html dentro de strings
                    return `
                        <li class="doc-step">
                            <div class="doc-step-number-container">
                                <div class="doc-step-number">${stepCounter}</div>
                                    <div class="doc-step-line"></div>
                                </div>
                            <div class="doc-step-content">
                                ${child.children.map(grandChild => convertNodeToHtml(grandChild, options, depth + 1) ).join('')}
                            </div>
                        </li>
                    `;
                }

                return convertNodeToHtml(child, options, depth + 1);
            }).join('');

            return `
                <ol class="doc-steps">${stepsChildrenHtml}</ol>
            `;

        case 'step':
            return `
                <li class="doc-step">
                    <div class="doc-step-number-container">
                        <div class="doc-step-number">1</div>
                        <div class="doc-step-line"></div>
                    </div>
                    <div class="doc-step-content">${childrenHtml}</div>
                </li>
            `;

        case 'list':
            return `<ul>${childrenHtml}</ul>`;

        case 'olist':
            return `<ol>${childrenHtml}</ol>`;

        case 'listitem':
            return `<li>${childrenHtml}</li>`;

        case 'tabs':
            return `
                <div class="doc-tabs">
                    <div class="doc-tabs-header">
                        ${extractTabHeaders(node.children)}
                    </div>
                    <div class="doc-tabs-content">
                        ${extractTabContents(node.children)}
                    </div>
                </div>
            `;

        case 'tab':
            return childrenHtml;

        default:
            return `<${htmlTag} ${htmlAttributes}>${childrenHtml}</${htmlTag}>`;
    }

    return `<${htmlTag} ${htmlAttributes}>${childrenHtml}</${htmlTag}>`;
}

function getAsideIcon(type: string): string {
    const icons: Record<string, string> = {
        note: '📝',
        tip: '💡',
        warning: '⚠️',
        danger: '🚨'
    };

    return icons[type] || '📄';
}

function getAsideTitle(type: string): string {
    const titles: Record<string, string> = {
        note: 'Nota',
        tip: 'Tip',
        warning: 'Advertencia',
        danger: 'Peligro'
    };

    return titles[type] || 'Información';
}

function extractTitle(children: (XmlNode | string)[]): string {
    for (const child of children) {
        if (typeof child === 'object' && child.tagName === 'title') {
            return convertNodeToHtml(child, {}, 0);
        }
    }

    return '';
}

function extractContent(children: (XmlNode | string)[]): string {
    return children
        .filter(child => typeof child !== 'object' || child.tagName !== 'title')
        .map(child => convertNodeToHtml(child, {}, 0))
        .join('');
}

function extractTabHeaders(children: (XmlNode | string)[]): string {
    return children
        .filter(child => typeof child === 'object' && child.tagName === 'tab')
        .map((child, index) => {
            const tab = child as XmlNode;
            const tabId = `tab-${index}-${Date.now()}`;
            const title = extractTitle(tab.children);

            return `
                <button class="doc-tab-button" data-tab="${tabId}">
                    ${title}
                </button>
            `;
        })
        .join('');
}

function extractTabContents(children: (XmlNode | string)[]): string {
    return children
        .filter(child => typeof child === 'object' && child.tagName === 'tab')
        .map((child, index) => {
            const tab = child as XmlNode;
            const tabId = `tab-${index}-${Date.now()}`;
            const content = extractContent(tab.children);

            return `
                <div class="doc-tab-panel" id="${tabId}">
                    ${content}
                </div>
            `;
        })
    .join('');
}

function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export function convertXmlDocument(xmlContent: string, includeStyles = true, includeJS = true): { title: string; content: string } {
    const parsed = parseXmlToHtml(xmlContent, { includeStyles, includeJS });
    const titleMatch = xmlContent.match(/<title1>([^<]+)<\/title1>/);
    const title = titleMatch ? titleMatch[1] : 'Documentación';

    return {
        title,
        content: parsed
    };
}

export function parseXmlWithInteractivity(xmlString: string): { title: string; content: string } {
    return convertXmlDocument(xmlString, true, true);
}