const successIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
const errorIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
const copyIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;

// Function to change icons after copying
const changeIcon = (button, isSuccess) => {
    button.innerHTML = isSuccess ? successIcon : errorIcon;
    setTimeout(() => {
        button.innerHTML = copyIcon; // Reset to copy icon
    }, 2000);
};

// Function to get code text from tables, skipping line numbers
const getCodeFromTable = (codeBlock) => {
    return [...codeBlock.querySelectorAll('tr')]
        .map(row => row.querySelector('td:last-child')?.innerText ?? '')
        .join('');
};

// Function to get code text from non-table blocks
const getNonTableCode = (codeBlock) => {
    return codeBlock.textContent.trim();
};

window.initCodeBlocks = function () {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const pre = entry.target.closest('pre') || entry.target.parentNode;
            const clipboardBtn = pre.querySelector('.clipboard-button');
            const label = pre.querySelector('.code-label');

            if (clipboardBtn) {
                clipboardBtn.style.right = `${-pre.scrollLeft + 8}px`;
            }

            if (label) {
                // Pin label to the left of the button
                label.style.right = `${-pre.scrollLeft + 45}px`;
                label.style.left = 'auto';
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });

    document.querySelectorAll('pre code').forEach(codeBlock => {
        const pre = codeBlock.closest('pre') || codeBlock.parentNode;

        // Skip if already initialized
        if (pre.querySelector('.clipboard-button')) return;

        pre.style.position = 'relative';

        // Create and append the copy button
        const copyBtn = document.createElement('button');
        copyBtn.className = 'clipboard-button';
        copyBtn.innerHTML = copyIcon;
        copyBtn.setAttribute('aria-label', 'Copy code to clipboard');
        pre.appendChild(copyBtn);

        // Attach event listener to copy button
        copyBtn.addEventListener('click', async () => {
            const isTable = codeBlock.querySelector('table');
            const codeToCopy = isTable ? getCodeFromTable(codeBlock) : getNonTableCode(codeBlock);
            try {
                await navigator.clipboard.writeText(codeToCopy);
                changeIcon(copyBtn, true);
            } catch (error) {
                console.error('Failed to copy text: ', error);
                changeIcon(copyBtn, false);
            }
        });

        // Detect language from multiple sources
        const getLang = () => {
            const classMatch = (codeBlock.className + " " + pre.className).match(/(?:language-|lang-)([\w-]+)/);
            if (classMatch) return classMatch[1].toLowerCase();

            const dataLang = pre.getAttribute('data-lang') || codeBlock.getAttribute('data-lang');
            if (dataLang) return dataLang.toLowerCase();

            const commonLangs = ['bash', 'js', 'javascript', 'yaml', 'json', 'python', 'rust', 'go', 'html', 'css', 'shell', 'zsh', 'sh', 'console'];
            const classes = (codeBlock.className + " " + pre.className).toLowerCase().split(/\s+/);
            for (const l of commonLangs) {
                if (classes.includes(l)) return l;
            }

            return 'default';
        };

        let lang = getLang();

        // Normalize common shell aliases
        if (['sh', 'shell', 'zsh', 'console', 'shellscript', 'shell-script'].includes(lang)) {
            lang = 'bash';
        }

        // Create and append the label
        const label = document.createElement('span');
        label.className = 'code-label label-' + lang;
        label.textContent = lang.toUpperCase();
        pre.appendChild(label);

        if (typeof observer !== 'undefined') {
            observer.observe(codeBlock);
        }

        let ticking = false;
        pre.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (copyBtn) copyBtn.style.right = `${-pre.scrollLeft + 8}px`;
                    if (label) {
                        label.style.right = `${-pre.scrollLeft + 45}px`;
                        label.style.left = 'auto';
                    }
                    ticking = false;
                });
                ticking = true;
            }
        });
    });
};

document.addEventListener('DOMContentLoaded', window.initCodeBlocks);
