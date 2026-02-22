class WordCounter {
    constructor() {
        this.textInput = document.getElementById('text-input');
        this.history = [];
        this.historyIndex = -1;
        this.goal = null;
        this.autoSaveInterval = null;
        this.activityData = [];
        this.startTime = Date.now();
        this.autoSaveIndicatorTimeout = null;
        this.focusModeActive = false;
        this.killModeActive = false;
        
        this.initializeElements();
        this.loadFromLocalStorage(); // Load FIRST before everything else
        this.initializeEventListeners();
        this.initializeTheme();
        this.initializeAutoSave();
        this.updateStats(); // Update stats with loaded content
    }

    initializeElements() {
        this.elements = {
            wordCount: document.getElementById('word-count'),
            charCount: document.getElementById('char-count'),
            charNoSpaces: document.getElementById('char-no-spaces'),
            sentenceCount: document.getElementById('sentence-count'),
            paragraphCount: document.getElementById('paragraph-count'),
            lineCount: document.getElementById('line-count'),
            pageCount: document.getElementById('page-count'),
            syllableCount: document.getElementById('syllable-count'),
            readingTime: document.getElementById('reading-time'),
            speakingTime: document.getElementById('speaking-time'),
            handwritingTime: document.getElementById('handwriting-time'),
            avgWordsSentence: document.getElementById('avg-words-sentence'),
            avgSentenceChars: document.getElementById('avg-sentence-chars'),
            avgWordLength: document.getElementById('avg-word-length'),
            longestSentence: document.getElementById('longest-sentence'),
            shortestSentence: document.getElementById('shortest-sentence'),
            readingLevel: document.getElementById('reading-level'),
            readingLevelDesc: document.getElementById('reading-level-desc'),
            fleschKincaid: document.getElementById('flesch-kincaid'),
            gunningFog: document.getElementById('gunning-fog'),
            smogIndex: document.getElementById('smog-index'),
            ariIndex: document.getElementById('ari-index'),
            uniqueWords: document.getElementById('unique-words'),
            tokenCount: document.getElementById('token-count'),
            wordsPerToken: document.getElementById('words-per-token'),
            mainTokenCount: document.getElementById('main-token-count'),
            mainTokenRatio: document.getElementById('main-token-ratio'),
            charMethodTokens: document.getElementById('char-method-tokens'),
            wordMethodTokens: document.getElementById('word-method-tokens'),
            lastSavedTime: document.getElementById('last-saved-time'),
            keywordDensity: document.getElementById('keyword-density'),
            themeToggle: document.getElementById('theme-toggle'),
            themeIcon: document.getElementById('theme-icon'),
            clearBtn: document.getElementById('clear-btn'),
            copyBtn: document.getElementById('copy-btn'),
            undoBtn: document.getElementById('undo-btn'),
            redoBtn: document.getElementById('redo-btn'),
            caseBtn: document.getElementById('case-btn'),
            findReplaceBtn: document.getElementById('find-replace-btn'),
            cleanTextBtn: document.getElementById('clean-text-btn'),
            goalBtn: document.getElementById('goal-btn'),
            uploadBtn: document.getElementById('upload-btn'),
            downloadBtn: document.getElementById('download-btn'),
            saveBtn: document.getElementById('save-btn'),
            fileInput: document.getElementById('file-input'),
            floatingGoalWidget: document.getElementById('floating-goal-widget'),
            minimizeGoalWidget: document.getElementById('minimize-goal-widget'),
            closeGoalWidget: document.getElementById('close-goal-widget'),
            expandGoalWidget: document.getElementById('expand-goal-widget'),
            // Top quick stats elements
            topWordCount: document.getElementById('top-word-count'),
            topCharCount: document.getElementById('top-char-count'),
            topCharNoSpaces: document.getElementById('top-char-no-spaces'),
            topSentenceCount: document.getElementById('top-sentence-count'),
            topReadingTime: document.getElementById('top-reading-time'),
            topParagraphCount: document.getElementById('top-paragraph-count'),
            topTokenCount: document.getElementById('top-token-count'),
            topReadingLevel: document.getElementById('top-reading-level'),
            // Social media elements
            facebookChars: document.getElementById('facebook-chars'),
            twitterChars: document.getElementById('twitter-chars'),
            instagramChars: document.getElementById('instagram-chars'),
            facebookIndicator: document.getElementById('facebook-indicator'),
            twitterIndicator: document.getElementById('twitter-indicator'),
            instagramIndicator: document.getElementById('instagram-indicator'),
            facebookProgress: document.getElementById('facebook-progress'),
            twitterProgress: document.getElementById('twitter-progress'),
            instagramProgress: document.getElementById('instagram-progress'),
            // Focus/Kill mode elements
            focusModeBtn: document.getElementById('focus-mode-btn'),
            killModeBtn: document.getElementById('kill-mode-btn'),
            focusModeModal: document.getElementById('focus-mode-modal'),
            killModeModal: document.getElementById('kill-mode-modal'),
            focusModeExitBtn: document.getElementById('focus-mode-exit-btn'),
            killModeIndicator: document.getElementById('kill-mode-indicator')
        };
    }

    initializeEventListeners() {
        this.textInput.addEventListener('input', (e) => {
            this.saveToHistory();
            this.updateStats();
            this.trackActivity();
            this.instantAutoSave(); // Auto-save on every keystroke
        });
        
        this.textInput.addEventListener('paste', () => {
            setTimeout(() => {
                this.saveToHistory();
                this.updateStats();
                this.trackActivity();
                this.instantAutoSave(); // Auto-save after paste
            }, 10);
        });
        
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.elements.clearBtn.addEventListener('click', () => this.clearText());
        this.elements.copyBtn.addEventListener('click', () => this.copyText());
        this.elements.undoBtn.addEventListener('click', () => this.undo());
        this.elements.redoBtn.addEventListener('click', () => this.redo());
        this.elements.caseBtn.addEventListener('click', () => this.toggleCaseDropdown());
        this.elements.findReplaceBtn.addEventListener('click', () => this.openFindReplace());
        this.elements.cleanTextBtn.addEventListener('click', () => this.cleanText());
        this.elements.goalBtn.addEventListener('click', () => this.openGoalModal());
        this.elements.uploadBtn.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.downloadBtn.addEventListener('click', () => this.downloadText());
        this.elements.saveBtn.addEventListener('click', () => this.saveToLocalStorage());
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

        // Floating goal widget listeners
        this.elements.minimizeGoalWidget?.addEventListener('click', () => this.minimizeGoalWidget());
        this.elements.closeGoalWidget?.addEventListener('click', () => this.closeGoalWidget());
        this.elements.expandGoalWidget?.addEventListener('click', () => this.expandGoalWidget());

        // Modal event listeners
        this.initializeModalListeners();
        
        // Options toggle listeners
        this.initializeOptionsListeners();

        // Auto-resize textarea
        this.textInput.addEventListener('input', () => this.autoResize());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Case dropdown listeners
        document.addEventListener('click', (e) => {
            const caseDropdown = document.getElementById('case-dropdown');
            const caseBtn = document.getElementById('case-btn');
            
            if (!caseBtn.contains(e.target) && !caseDropdown.contains(e.target)) {
                caseDropdown.classList.add('hidden');
            }
        });
        
        // Focus/Kill mode listeners
        this.elements.focusModeBtn?.addEventListener('click', () => this.openFocusMode());
        this.elements.killModeBtn?.addEventListener('click', () => this.openKillMode());
        
        // Case option listeners
        document.querySelectorAll('.case-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const caseType = e.target.getAttribute('data-case');
                this.applyCaseTransformation(caseType);
                document.getElementById('case-dropdown').classList.add('hidden');
            });
        });
    }

    initializeModalListeners() {
        // Find & Replace Modal
        const findModal = document.getElementById('find-replace-modal');
        const goalModal = document.getElementById('goal-modal');
        const focusModal = document.getElementById('focus-mode-modal');
        const killModal = document.getElementById('kill-mode-modal');
        
        document.getElementById('close-find-modal').addEventListener('click', () => {
            findModal.classList.add('hidden');
        });
        
        document.getElementById('find-btn').addEventListener('click', () => this.findText());
        document.getElementById('replace-btn').addEventListener('click', () => this.replaceText());
        document.getElementById('replace-all-btn').addEventListener('click', () => this.replaceAllText());
        
        document.getElementById('close-goal-modal').addEventListener('click', () => {
            goalModal.classList.add('hidden');
        });
        
        document.getElementById('set-goal-btn').addEventListener('click', () => this.setGoal());
        
        // Focus Mode Modal
        document.getElementById('close-focus-modal')?.addEventListener('click', () => {
            focusModal?.classList.add('hidden');
        });
        document.getElementById('cancel-focus')?.addEventListener('click', () => {
            focusModal?.classList.add('hidden');
        });
        document.getElementById('start-focus')?.addEventListener('click', () => this.startFocusMode());
        document.getElementById('exit-focus')?.addEventListener('click', () => this.exitFocusMode());
        
        // Kill Mode Modal
        document.getElementById('close-kill-modal')?.addEventListener('click', () => {
            killModal?.classList.add('hidden');
        });
        document.getElementById('cancel-kill')?.addEventListener('click', () => {
            killModal?.classList.add('hidden');
        });
        document.getElementById('start-kill')?.addEventListener('click', () => this.startKillMode());
        document.getElementById('exit-kill')?.addEventListener('click', () => this.exitKillMode());
        
        // Close modals when clicking outside
        [findModal, goalModal, focusModal, killModal].forEach(modal => {
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.classList.add('hidden');
                    }
                });
            }
        });
    }

    initializeOptionsListeners() {
        // Details panel toggles
        const detailsToggles = [
            'show-chars', 'show-chars-no-spaces', 'show-words', 'show-sentences',
            'show-paragraphs', 'show-reading-time', 'show-lines', 'show-pages', 'show-tokens'
        ];
        
        detailsToggles.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', () => this.toggleDetailVisibility());
            }
        });
        
        // Button toggles
        const buttonToggles = [
            'show-clear-btn', 'show-save-btn', 'show-download-btn', 'show-upload-btn'
        ];
        
        buttonToggles.forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.addEventListener('change', () => this.toggleButtonVisibility());
            }
        });
        
        // Auto-save toggle
        const autoSaveToggle = document.getElementById('auto-save');
        if (autoSaveToggle) {
            autoSaveToggle.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.initializeAutoSave();
                } else {
                    this.stopAutoSave();
                }
            });
        }
    }

    initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark');
            this.updateThemeIcon(true);
        } else {
            this.updateThemeIcon(false);
        }
    }

    initializeAutoSave() {
        // Auto-save is now instant on every keystroke
        // Keep a backup timer for safety (every 5 minutes)
        const autoSaveEnabled = document.getElementById('auto-save')?.checked;
        if (autoSaveEnabled && !this.autoSaveInterval) {
            this.autoSaveInterval = setInterval(() => {
                this.instantAutoSave(); // Use instant save, no toast
            }, 300000); // 5 minutes backup
        }
    }

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    saveToHistory() {
        const currentText = this.textInput.value;
        if (this.history[this.historyIndex] !== currentText) {
            this.historyIndex++;
            this.history = this.history.slice(0, this.historyIndex);
            this.history.push(currentText);
            
            // Limit history to 50 entries
            if (this.history.length > 50) {
                this.history.shift();
                this.historyIndex--;
            }
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.textInput.value = this.history[this.historyIndex];
            this.updateStats();
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.textInput.value = this.history[this.historyIndex];
            this.updateStats();
        }
    }

    toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        this.updateThemeIcon(isDark);
    }

    updateThemeIcon(isDark) {
        const icon = this.elements.themeIcon;
        if (isDark) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }

    clearText() {
        this.saveToHistory();
        this.textInput.value = '';
        this.textInput.focus();
        this.updateStats();
        this.instantAutoSave(); // Auto-save after clear
        this.showToast('Text cleared');
    }

    async copyText() {
        try {
            await navigator.clipboard.writeText(this.textInput.value);
            this.showToast('Text copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy text: ', err);
            this.showToast('Failed to copy text', 'error');
        }
    }

    toggleCaseDropdown() {
        const dropdown = document.getElementById('case-dropdown');
        dropdown.classList.toggle('hidden');
    }

    applyCaseTransformation(caseType) {
        const selectedText = this.textInput.value.substring(
            this.textInput.selectionStart,
            this.textInput.selectionEnd
        );
        
        if (!selectedText) {
            this.showToast('Please select text to change case', 'error');
            return;
        }
        
        this.saveToHistory();
        let newText = '';
        
        switch (caseType) {
            case 'lowercase':
                newText = selectedText.toLowerCase();
                break;
            case 'UPPERCASE':
                newText = selectedText.toUpperCase();
                break;
            case 'Title Case':
                newText = selectedText.replace(/\w\S*/g, (txt) => 
                    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
                );
                break;
            case 'Sentence case':
                newText = selectedText.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, 
                    (txt) => txt.toUpperCase()
                );
                break;
            case 'camelCase':
                newText = selectedText.toLowerCase()
                    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => 
                        index === 0 ? word.toLowerCase() : word.toUpperCase()
                    )
                    .replace(/\s+/g, '');
                break;
            case 'kebab-case':
                newText = selectedText.toLowerCase()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/\s+/g, '-')
                    .replace(/--+/g, '-')
                    .trim();
                break;
            case 'snake_case':
                newText = selectedText.toLowerCase()
                    .replace(/[^\w\s]/g, '')
                    .replace(/\s+/g, '_')
                    .replace(/__+/g, '_')
                    .trim();
                break;
            default:
                newText = selectedText;
        }
        
        const start = this.textInput.selectionStart;
        const end = this.textInput.selectionEnd;
        
        this.textInput.value = 
            this.textInput.value.substring(0, start) +
            newText +
            this.textInput.value.substring(end);
        
        this.textInput.setSelectionRange(start, start + newText.length);
        this.updateStats();
        this.instantAutoSave(); // Auto-save after case transformation
        this.showToast(`Applied ${caseType} transformation`);
    }

    openFindReplace() {
        document.getElementById('find-replace-modal').classList.remove('hidden');
        document.getElementById('find-input').focus();
    }

    findText() {
        const findValue = document.getElementById('find-input').value;
        if (!findValue) return;
        
        const text = this.textInput.value;
        const index = text.indexOf(findValue);
        
        if (index !== -1) {
            this.textInput.focus();
            this.textInput.setSelectionRange(index, index + findValue.length);
            this.showToast('Text found');
        } else {
            this.showToast('Text not found', 'error');
        }
    }

    replaceText() {
        const findValue = document.getElementById('find-input').value;
        const replaceValue = document.getElementById('replace-input').value;
        
        if (!findValue) return;
        
        const start = this.textInput.selectionStart;
        const end = this.textInput.selectionEnd;
        const selectedText = this.textInput.value.substring(start, end);
        
        if (selectedText === findValue) {
            this.saveToHistory();
            this.textInput.value = 
                this.textInput.value.substring(0, start) +
                replaceValue +
                this.textInput.value.substring(end);
            this.updateStats();
            this.instantAutoSave(); // Auto-save after replace
            this.showToast('Text replaced');
        }
    }

    replaceAllText() {
        const findValue = document.getElementById('find-input').value;
        const replaceValue = document.getElementById('replace-input').value;
        
        if (!findValue) return;
        
        this.saveToHistory();
        const count = (this.textInput.value.match(new RegExp(findValue, 'g')) || []).length;
        this.textInput.value = this.textInput.value.replace(new RegExp(findValue, 'g'), replaceValue);
        this.updateStats();
        this.instantAutoSave(); // Auto-save after replace all
        this.showToast(`Replaced ${count} occurrences`);
    }

    cleanText() {
        this.saveToHistory();
        let text = this.textInput.value;
        
        // Remove extra whitespace and normalize line breaks
        text = text.replace(/\s+/g, ' ');
        text = text.replace(/\n\s*\n/g, '\n\n');
        text = text.trim();
        
        this.textInput.value = text;
        this.updateStats();
        this.instantAutoSave(); // Auto-save after clean
        this.showToast('Text cleaned');
    }

    openGoalModal() {
        document.getElementById('goal-modal').classList.remove('hidden');
        document.getElementById('goal-value').focus();
    }

    setGoal() {
        const type = document.getElementById('goal-type').value;
        const value = parseInt(document.getElementById('goal-value').value);
        
        if (!value || value <= 0) {
            this.showToast('Please enter a valid goal', 'error');
            return;
        }
        
        this.goal = { type, value, startTime: Date.now() };
        this.startTime = Date.now();
        
        // Show progress immediately
        const goalProgressElement = document.getElementById('goal-progress');
        if (goalProgressElement) {
            goalProgressElement.classList.remove('hidden');
        }
        
        // Show floating goal widget
        this.showFloatingGoalWidget();
        
        document.getElementById('goal-modal').classList.add('hidden');
        this.updateGoalProgress();
        this.updateFloatingGoalWidget();
        this.saveToLocalStorage();
        this.showToast(`🎯 Goal set: ${value} ${type}`);
    }

    showFloatingGoalWidget() {
        if (this.elements.floatingGoalWidget) {
            this.elements.floatingGoalWidget.classList.remove('hidden');
            // Reset to expanded state
            document.getElementById('goal-details').classList.remove('hidden');
            document.getElementById('goal-minimized').classList.add('hidden');
        }
    }

    minimizeGoalWidget() {
        document.getElementById('goal-details').classList.add('hidden');
        document.getElementById('goal-minimized').classList.remove('hidden');
    }

    expandGoalWidget() {
        document.getElementById('goal-details').classList.remove('hidden');
        document.getElementById('goal-minimized').classList.add('hidden');
    }

    closeGoalWidget() {
        if (this.elements.floatingGoalWidget) {
            this.elements.floatingGoalWidget.classList.add('hidden');
        }
        // Don't clear the goal, just hide the widget
    }

    updateGoalProgress() {
        if (!this.goal || !this.goal.type || !this.goal.value) return;
        
        const stats = this.calculateStats(this.textInput.value);
        let current = 0;
        let unit = '';
        
        switch (this.goal.type) {
            case 'words':
                current = stats.wordCount;
                unit = 'words';
                break;
            case 'characters':
                current = stats.charCount;
                unit = 'characters';
                break;
            case 'time':
                // For time goals, track typing time
                const goalStartTime = this.goal.startTime || this.startTime;
                current = Math.floor((Date.now() - goalStartTime) / 60000);
                unit = 'minutes';
                break;
        }
        
        const percentage = Math.min((current / this.goal.value) * 100, 100);
        
        const progressBar = document.getElementById('goal-progress-bar');
        const progressText = document.getElementById('goal-progress-text');
        
        if (progressBar && progressText) {
            progressBar.style.width = `${percentage}%`;
            progressText.textContent = `${Math.round(percentage)}% (${current.toLocaleString()}/${this.goal.value.toLocaleString()} ${unit})`;
            
            // Add color based on progress
            progressBar.className = 'h-2 rounded-full transition-all duration-300';
            if (percentage >= 100) {
                progressBar.classList.add('bg-green-500');
            } else if (percentage >= 75) {
                progressBar.classList.add('bg-yellow-500');
            } else {
                progressBar.classList.add('bg-primary-500');
            }
        }
        
        // Update floating widget
        this.updateFloatingGoalWidget();
        
        // Only show achievement toast once
        if (percentage >= 100 && !this.goal.achieved) {
            this.goal.achieved = true;
            this.showToast('🎉 Goal achieved! Well done!', 'success');
            this.saveToLocalStorage();
        }
    }

    updateFloatingGoalWidget() {
        if (!this.goal || !this.goal.type || !this.goal.value) return;
        
        const stats = this.calculateStats(this.textInput.value);
        let current = 0;
        let unit = '';
        
        switch (this.goal.type) {
            case 'words':
                current = stats.wordCount;
                unit = 'words';
                break;
            case 'characters':
                current = stats.charCount;
                unit = 'characters';
                break;
            case 'time':
                const goalStartTime = this.goal.startTime || this.startTime;
                current = Math.floor((Date.now() - goalStartTime) / 60000);
                unit = 'minutes';
                break;
        }
        
        const percentage = Math.min((current / this.goal.value) * 100, 100);
        const remaining = Math.max(this.goal.value - current, 0);
        
        // Update floating widget elements
        const elements = {
            floatingGoalType: document.getElementById('floating-goal-type'),
            floatingGoalTarget: document.getElementById('floating-goal-target'),
            floatingGoalPercentage: document.getElementById('floating-goal-percentage'),
            floatingGoalProgressBar: document.getElementById('floating-goal-progress-bar'),
            floatingGoalCurrent: document.getElementById('floating-goal-current'),
            floatingGoalValue: document.getElementById('floating-goal-value'),
            floatingGoalRemaining: document.getElementById('floating-goal-remaining'),
            minimizedGoalText: document.getElementById('minimized-goal-text'),
            minimizedGoalProgressBar: document.getElementById('minimized-goal-progress-bar')
        };
        
        if (elements.floatingGoalType) elements.floatingGoalType.textContent = unit.charAt(0).toUpperCase() + unit.slice(1) + ' Goal';
        if (elements.floatingGoalTarget) elements.floatingGoalTarget.textContent = `${this.goal.value.toLocaleString()} ${unit}`;
        if (elements.floatingGoalPercentage) {
            elements.floatingGoalPercentage.textContent = `${Math.round(percentage)}%`;
            
            // Color code the percentage
            if (percentage >= 100) {
                elements.floatingGoalPercentage.className = 'text-xs font-semibold text-green-600 dark:text-green-400';
            } else if (percentage >= 75) {
                elements.floatingGoalPercentage.className = 'text-xs font-semibold text-yellow-600 dark:text-yellow-400';
            } else {
                elements.floatingGoalPercentage.className = 'text-xs font-semibold text-primary-600 dark:text-github-dark-accent';
            }
        }
        
        // Update progress bars
        [elements.floatingGoalProgressBar, elements.minimizedGoalProgressBar].forEach(bar => {
            if (bar) {
                bar.style.width = `${percentage}%`;
                
                // Update bar color
                bar.className = bar.className.replace(/bg-\w+-\d+/g, '');
                if (percentage >= 100) {
                    bar.classList.add('bg-green-500');
                } else if (percentage >= 75) {
                    bar.classList.add('bg-yellow-500');
                } else {
                    bar.classList.add('bg-primary-500');
                }
            }
        });
        
        if (elements.floatingGoalCurrent) elements.floatingGoalCurrent.textContent = current.toLocaleString();
        if (elements.floatingGoalValue) elements.floatingGoalValue.textContent = this.goal.value.toLocaleString();
        if (elements.floatingGoalRemaining) {
            elements.floatingGoalRemaining.textContent = remaining.toLocaleString();
            if (remaining === 0) {
                elements.floatingGoalRemaining.textContent = '🎉 Complete!';
                elements.floatingGoalRemaining.className = 'font-medium text-green-600 dark:text-green-400';
            }
        }
        
        // Update minimized view
        if (elements.minimizedGoalText) {
            elements.minimizedGoalText.textContent = `${unit.charAt(0).toUpperCase() + unit.slice(1)}: ${Math.round(percentage)}%`;
        }
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Check file type
        const allowedTypes = ['text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf', 'application/vnd.oasis.opendocument.text'];
        const fileName = file.name.toLowerCase();
        const isTextFile = fileName.endsWith('.txt') || fileName.endsWith('.md') || fileName.endsWith('.rtf') || file.type === 'text/plain';
        
        if (!isTextFile && !allowedTypes.includes(file.type)) {
            this.showToast('Unsupported file type. Please upload a text file.', 'error');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                this.saveToHistory();
                const content = e.target.result;
                
                // Handle different encodings and clean the content
                let cleanContent = content;
                if (typeof content === 'string') {
                    // Remove BOM if present
                    cleanContent = content.replace(/^\uFEFF/, '');
                    // Normalize line endings
                    cleanContent = cleanContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
                }
                
                this.textInput.value = cleanContent;
                this.updateStats();
                this.instantAutoSave(); // Auto-save after file upload
                this.showToast(`File "${file.name}" uploaded successfully`);
                
                // Clear the file input to allow uploading the same file again
                event.target.value = '';
            } catch (error) {
                console.error('Error processing file:', error);
                this.showToast('Error processing file content', 'error');
            }
        };
        
        reader.onerror = (error) => {
            console.error('File read error:', error);
            this.showToast('Failed to read file. Please try again.', 'error');
        };
        
        // Read as text with UTF-8 encoding
        reader.readAsText(file, 'UTF-8');
    }

    downloadText() {
        const text = this.textInput.value;
        if (!text) {
            this.showToast('No text to download', 'error');
            return;
        }
        
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wordcounter-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('File downloaded');
    }

    saveToLocalStorage() {
        const saveTime = Date.now();
        localStorage.setItem('wordcounter-text', this.textInput.value);
        localStorage.setItem('wordcounter-goal', JSON.stringify(this.goal));
        localStorage.setItem('wordcounter-start-time', this.startTime.toString());
        localStorage.setItem('wordcounter-last-save', saveTime.toString());
        
        // Update last saved indicator
        this.updateLastSavedTime(saveTime);
        this.showToast('💾 Manually saved to browser storage', 'info');
    }

    instantAutoSave() {
        // Save instantly without showing notifications
        try {
            localStorage.setItem('wordcounter-text', this.textInput.value);
            localStorage.setItem('wordcounter-goal', JSON.stringify(this.goal));
            localStorage.setItem('wordcounter-start-time', this.startTime.toString());
            const saveTime = Date.now();
            localStorage.setItem('wordcounter-last-save', saveTime.toString());
            
            // Update the subtle last saved indicator
            this.updateLastSavedTime(saveTime);
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }

    updateLastSavedTime(timestamp) {
        if (this.elements.lastSavedTime) {
            const now = new Date(timestamp);
            const timeString = now.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
            this.elements.lastSavedTime.textContent = timeString;
            
            // Add a subtle color change for a moment
            this.elements.lastSavedTime.style.color = '#22c55e';
            setTimeout(() => {
                this.elements.lastSavedTime.style.color = '';
            }, 500);
        }
    }

    loadFromLocalStorage() {
        console.log('Loading from localStorage...');
        
        const savedText = localStorage.getItem('wordcounter-text');
        const savedGoal = localStorage.getItem('wordcounter-goal');
        const savedStartTime = localStorage.getItem('wordcounter-start-time');
        const lastSave = localStorage.getItem('wordcounter-last-save');
        
        // Load text content immediately
        if (savedText !== null) {
            console.log('Loading saved text:', savedText.substring(0, 50) + '...');
            this.textInput.value = savedText;
            
            // Update last saved time indicator
            if (lastSave) {
                this.updateLastSavedTime(parseInt(lastSave));
            }
        }
        
        // Load goal if exists
        if (savedGoal && savedGoal !== 'null') {
            try {
                this.goal = JSON.parse(savedGoal);
                if (this.goal && this.goal.type && this.goal.value) {
                    // Show goal progress section immediately
                    const goalProgressElement = document.getElementById('goal-progress');
                    if (goalProgressElement) {
                        goalProgressElement.classList.remove('hidden');
                    }
                    
                    // Show floating goal widget
                    this.showFloatingGoalWidget();
                    
                    // Update goal modal fields
                    const goalTypeSelect = document.getElementById('goal-type');
                    const goalValueInput = document.getElementById('goal-value');
                    if (goalTypeSelect) goalTypeSelect.value = this.goal.type;
                    if (goalValueInput) goalValueInput.value = this.goal.value;
                }
            } catch (e) {
                console.error('Error parsing saved goal:', e);
                this.goal = null;
            }
        }
        
        if (savedStartTime) {
            this.startTime = parseInt(savedStartTime);
        }
        
        console.log('Finished loading from localStorage');
    }


    trackActivity() {
        const now = new Date();
        const words = this.calculateStats(this.textInput.value).wordCount;
        
        this.activityData.push({
            time: now.toISOString(),
            words: words
        });
        
        // Keep only last 100 data points
        if (this.activityData.length > 100) {
            this.activityData.shift();
        }
    }

    toggleDetailVisibility() {
        const toggles = {
            'show-chars': 'char-count',
            'show-chars-no-spaces': 'char-no-spaces',
            'show-words': 'word-count',
            'show-sentences': 'sentence-count',
            'show-paragraphs': 'paragraph-count',
            'show-reading-time': 'reading-time',
            'show-lines': 'line-count',
            'show-pages': 'page-count',
            'show-tokens': 'token-count'
        };
        
        Object.entries(toggles).forEach(([toggleId, elementId]) => {
            const toggle = document.getElementById(toggleId);
            const element = document.getElementById(elementId);
            
            if (toggle && element) {
                const container = element.closest('.flex');
                if (container) {
                    container.style.display = toggle.checked ? 'flex' : 'none';
                }
            }
        });
    }

    toggleButtonVisibility() {
        const toggles = {
            'show-clear-btn': 'clear-btn',
            'show-save-btn': 'save-btn',
            'show-download-btn': 'download-btn',
            'show-upload-btn': 'upload-btn'
        };
        
        Object.entries(toggles).forEach(([toggleId, buttonId]) => {
            const toggle = document.getElementById(toggleId);
            const button = document.getElementById(buttonId);
            
            if (toggle && button) {
                button.style.display = toggle.checked ? 'inline-flex' : 'none';
            }
        });
    }

    handleKeyboardShortcuts(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'z':
                    event.preventDefault();
                    if (event.shiftKey) {
                        this.redo();
                    } else {
                        this.undo();
                    }
                    break;
                case 'f':
                    event.preventDefault();
                    this.openFindReplace();
                    break;
                case 's':
                    event.preventDefault();
                    this.saveToLocalStorage();
                    this.showToast('Saved');
                    break;
            }
        }
    }

    countSyllables(word) {
        word = word.toLowerCase();
        if (word.length <= 3) return 1;
        
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        word = word.replace(/^y/, '');
        const matches = word.match(/[aeiouy]{1,2}/g);
        return matches ? matches.length : 1;
    }

    calculateReadingLevel(sentences, words, syllables) {
        if (sentences === 0 || words === 0) return 0;
        
        const avgWordsPerSentence = words / sentences;
        const avgSyllablesPerWord = syllables / words;
        
        // Flesch-Kincaid Grade Level
        const gradeLevel = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
        return Math.max(0, Math.round(gradeLevel * 10) / 10);
    }

    calculateAllReadingLevels(sentences, words, syllables, text) {
        if (sentences === 0 || words === 0) {
            return {
                fleschKincaid: 0,
                gunningFog: 0,
                smogIndex: 0,
                ariIndex: 0,
                averageGrade: 0,
                gradeDescription: 'Elementary School'
            };
        }
        
        const avgWordsPerSentence = words / sentences;
        const avgSyllablesPerWord = syllables / words;
        
        // 1. Flesch-Kincaid Grade Level
        const fleschKincaid = Math.max(0, Math.round((0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59) * 10) / 10);
        
        // 2. Gunning Fog Index
        const complexWords = this.countComplexWords(text);
        const gunningFog = Math.max(0, Math.round((0.4 * (avgWordsPerSentence + ((complexWords / words) * 100))) * 10) / 10);
        
        // 3. SMOG Index (requires at least 30 sentences for accuracy)
        let smogIndex = 0;
        if (sentences >= 3) {
            const polysyllables = this.countPolysyllables(text);
            smogIndex = Math.max(0, Math.round((1.043 * Math.sqrt(polysyllables * (30 / sentences)) + 3.1291) * 10) / 10);
        }
        
        // 4. Automated Readability Index (ARI)
        const characters = text.replace(/\s/g, '').length;
        const ariIndex = Math.max(0, Math.round((4.71 * (characters / words) + 0.5 * (words / sentences) - 21.43) * 10) / 10);
        
        // Calculate average grade level
        const validScores = [fleschKincaid, gunningFog, ariIndex];
        if (smogIndex > 0) validScores.push(smogIndex);
        const averageGrade = Math.round((validScores.reduce((sum, score) => sum + score, 0) / validScores.length) * 10) / 10;
        
        // Get grade description
        const gradeDescription = this.getGradeDescription(averageGrade);
        
        return {
            fleschKincaid,
            gunningFog,
            smogIndex: smogIndex > 0 ? smogIndex : null,
            ariIndex,
            averageGrade,
            gradeDescription
        };
    }

    countComplexWords(text) {
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 0);
        
        return words.filter(word => this.countSyllables(word) >= 3).length;
    }

    countPolysyllables(text) {
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 0);
        
        return words.filter(word => this.countSyllables(word) >= 3).length;
    }

    getGradeDescription(grade) {
        if (grade <= 6) return 'Elementary School';
        if (grade <= 8) return 'Middle School';
        if (grade <= 12) return 'High School';
        if (grade <= 16) return 'College';
        return 'Graduate School';
    }

    estimateTokens(text) {
        if (!text || text.trim().length === 0) {
            return { 
                tokens: 0, 
                wordsPerToken: 0, 
                charMethodTokens: 0, 
                wordMethodTokens: 0 
            };
        }
        
        const cleanText = text.trim();
        const words = cleanText.split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;
        const charCount = cleanText.length;
        
        if (wordCount === 0 && charCount === 0) {
            return { 
                tokens: 0, 
                wordsPerToken: 0, 
                charMethodTokens: 0, 
                wordMethodTokens: 0 
            };
        }
        
        // OpenAI's official formulas
        // Method 1: Characters ÷ 4 (1 token ≈ 4 characters)
        const charMethodTokens = Math.ceil(charCount / 4);
        
        // Method 2: Words × 1.33 (1 token ≈ ¾ of a word)
        const wordMethodTokens = Math.ceil(wordCount * 1.33);
        
        // Use the average of both methods for the main estimate
        // This provides a more balanced estimation
        const averageTokens = Math.ceil((charMethodTokens + wordMethodTokens) / 2);
        
        // Ensure minimum of 1 token if there's any content
        const finalTokens = Math.max(1, averageTokens);
        
        const wordsPerToken = wordCount > 0 ? Number((wordCount / finalTokens).toFixed(2)) : 0;
        
        return {
            tokens: finalTokens,
            wordsPerToken: wordsPerToken,
            charMethodTokens: charMethodTokens,
            wordMethodTokens: wordMethodTokens
        };
    }

    isCommonWord(word) {
        const commonWords = new Set([
            'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
            'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
            'this', 'but', 'his', 'by', 'from', 'they', 'she', 'or', 'an',
            'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
            'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
            'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him',
            'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some',
            'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look',
            'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after',
            'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
            'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day',
            'most', 'us', 'is', 'was', 'are', 'been', 'has', 'had', 'were'
        ]);
        return commonWords.has(word);
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        let bgColor = '';
        let extraClass = '';
        
        switch(type) {
            case 'error':
                bgColor = 'bg-red-500';
                extraClass = 'toast-error';
                break;
            case 'info':
                bgColor = 'bg-blue-500';
                extraClass = 'toast-info';
                break;
            default:
                bgColor = 'bg-green-500';
                extraClass = 'toast-success';
        }
        
        toast.className = `fixed top-4 right-4 px-4 py-2 rounded-lg text-white text-sm font-medium z-50 transition-all duration-300 ${bgColor} ${extraClass} animate-slide-up`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    autoResize() {
        this.textInput.style.height = 'auto';
        this.textInput.style.height = Math.max(384, this.textInput.scrollHeight) + 'px';
    }

    updateStats() {
        const text = this.textInput.value;
        const stats = this.calculateStats(text);
        this.updateElements(stats);
        this.updateKeywordDensity(text);
        this.updateGoalProgress();
    }

    calculateStats(text) {
        const trimmedText = text.trim();
        
        // Words
        const words = trimmedText ? trimmedText.split(/\s+/).filter(word => word.length > 0) : [];
        const wordCount = words.length;
        
        // Characters
        const charCount = text.length;
        const charNoSpaces = text.replace(/\s/g, '').length;
        
        // Lines
        const lineCount = text ? text.split('\n').length : 0;
        
        // Pages (assuming 250 words per page)
        const pageCount = Math.ceil(wordCount / 250);
        
        // Sentences
        const sentences = trimmedText ? trimmedText.split(/[.!?]+/).filter(s => s.trim().length > 0) : [];
        const sentenceCount = sentences.length;
        
        // Paragraphs
        const paragraphs = trimmedText ? trimmedText.split(/\n\s*\n/).filter(p => p.trim().length > 0) : [];
        const paragraphCount = paragraphs.length;
        
        // Syllables
        const syllableCount = words.reduce((total, word) => {
            return total + this.countSyllables(word.replace(/[^\w]/g, ''));
        }, 0);
        
        // Reading time (average 200 words per minute)
        const readingTimeMinutes = Math.ceil(wordCount / 200);
        const readingTime = readingTimeMinutes <= 1 ? '< 1 min' : `${readingTimeMinutes} min`;
        
        // Speaking time (average 150 words per minute)
        const speakingTimeMinutes = Math.ceil(wordCount / 150);
        const speakingTime = speakingTimeMinutes <= 1 ? '< 1 min' : `${speakingTimeMinutes} min`;
        
        // Handwriting time (average 15 words per minute)
        const handwritingTimeMinutes = Math.ceil(wordCount / 15);
        const handwritingTime = handwritingTimeMinutes <= 1 ? '< 1 min' : `${handwritingTimeMinutes} min`;
        
        // Average words per sentence
        const avgWordsSentence = sentenceCount > 0 ? Math.round((wordCount / sentenceCount) * 10) / 10 : 0;
        
        // Average characters per sentence
        const avgSentenceChars = sentenceCount > 0 ? Math.round((charCount / sentenceCount) * 10) / 10 : 0;
        
        // Average word length
        const totalCharInWords = words.join('').replace(/[^\w]/g, '').length;
        const avgWordLength = wordCount > 0 ? Math.round((totalCharInWords / wordCount) * 10) / 10 : 0;
        
        // Longest and shortest sentences
        const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
        const longestSentence = sentenceLengths.length > 0 ? Math.max(...sentenceLengths) : 0;
        const shortestSentence = sentenceLengths.length > 0 ? Math.min(...sentenceLengths) : 0;
        
        // Reading levels (comprehensive)
        const readingLevels = this.calculateAllReadingLevels(sentenceCount, wordCount, syllableCount, text);
        
        // Unique words
        const uniqueWords = new Set(words.map(word => word.toLowerCase().replace(/[^\w]/g, ''))).size;
        
        // Token estimation
        const tokenData = this.estimateTokens(text);
        
        return {
            wordCount,
            charCount,
            charNoSpaces,
            lineCount,
            pageCount,
            sentenceCount,
            paragraphCount,
            syllableCount,
            readingTime,
            speakingTime,
            handwritingTime,
            avgWordsSentence,
            avgSentenceChars,
            avgWordLength,
            longestSentence,
            shortestSentence,
            readingLevel: readingLevels.averageGrade,
            readingLevels: readingLevels,
            uniqueWords,
            tokenCount: tokenData.tokens,
            wordsPerToken: tokenData.wordsPerToken,
            charMethodTokens: tokenData.charMethodTokens,
            wordMethodTokens: tokenData.wordMethodTokens
        };
    }

    updateElements(stats) {
        const elements = {
            wordCount: stats.wordCount,
            charCount: stats.charCount,
            charNoSpaces: stats.charNoSpaces,
            sentenceCount: stats.sentenceCount,
            paragraphCount: stats.paragraphCount,
            lineCount: stats.lineCount,
            pageCount: stats.pageCount,
            syllableCount: stats.syllableCount,
            readingTime: stats.readingTime,
            speakingTime: stats.speakingTime,
            handwritingTime: stats.handwritingTime,
            avgWordsSentence: stats.avgWordsSentence,
            avgSentenceChars: stats.avgSentenceChars,
            avgWordLength: stats.avgWordLength,
            longestSentence: stats.longestSentence,
            shortestSentence: stats.shortestSentence,
            readingLevel: stats.readingLevel,
            uniqueWords: stats.uniqueWords,
            tokenCount: stats.tokenCount,
            wordsPerToken: stats.wordsPerToken
        };
        
        Object.entries(elements).forEach(([key, value]) => {
            const element = this.elements[key];
            if (element) {
                if (typeof value === 'number' && !['readingLevel', 'wordsPerToken'].includes(key)) {
                    element.textContent = this.formatNumber(value);
                } else {
                    element.textContent = value;
                }
            }
        });

        // Update main token display
        if (this.elements.mainTokenCount) {
            this.elements.mainTokenCount.textContent = this.formatNumber(stats.tokenCount);
        }
        
        if (this.elements.mainTokenRatio) {
            this.elements.mainTokenRatio.textContent = `~${stats.wordsPerToken} words/token`;
        }
        
        if (this.elements.charMethodTokens) {
            this.elements.charMethodTokens.textContent = this.formatNumber(stats.charMethodTokens);
        }
        
        if (this.elements.wordMethodTokens) {
            this.elements.wordMethodTokens.textContent = this.formatNumber(stats.wordMethodTokens);
        }
        
        // Update top quick stats
        if (this.elements.topWordCount) {
            this.elements.topWordCount.textContent = this.formatNumber(stats.wordCount);
        }
        if (this.elements.topCharCount) {
            this.elements.topCharCount.textContent = this.formatNumber(stats.charCount);
        }
        if (this.elements.topCharNoSpaces) {
            this.elements.topCharNoSpaces.textContent = this.formatNumber(stats.charNoSpaces);
        }
        if (this.elements.topSentenceCount) {
            this.elements.topSentenceCount.textContent = this.formatNumber(stats.sentenceCount);
        }
        if (this.elements.topReadingTime) {
            this.elements.topReadingTime.textContent = stats.readingTime;
        }
        if (this.elements.topParagraphCount) {
            this.elements.topParagraphCount.textContent = this.formatNumber(stats.paragraphCount);
        }
        if (this.elements.topTokenCount) {
            this.elements.topTokenCount.textContent = this.formatNumber(stats.tokenCount);
        }
        if (this.elements.topReadingLevel && stats.readingLevels) {
            this.elements.topReadingLevel.textContent = stats.readingLevels.averageGrade;
        }
        
        // Update comprehensive reading level display
        if (this.elements.readingLevel && stats.readingLevels) {
            this.elements.readingLevel.textContent = `Grade ${stats.readingLevels.averageGrade}`;
        }
        
        if (this.elements.readingLevelDesc && stats.readingLevels) {
            this.elements.readingLevelDesc.textContent = stats.readingLevels.gradeDescription;
        }
        
        if (this.elements.fleschKincaid && stats.readingLevels) {
            this.elements.fleschKincaid.textContent = `Grade ${stats.readingLevels.fleschKincaid}`;
        }
        
        if (this.elements.gunningFog && stats.readingLevels) {
            this.elements.gunningFog.textContent = `Grade ${stats.readingLevels.gunningFog}`;
        }
        
        if (this.elements.smogIndex && stats.readingLevels) {
            this.elements.smogIndex.textContent = stats.readingLevels.smogIndex ? `Grade ${stats.readingLevels.smogIndex}` : 'N/A';
        }
        
        if (this.elements.ariIndex && stats.readingLevels) {
            this.elements.ariIndex.textContent = `Grade ${stats.readingLevels.ariIndex}`;
        }
        
        // Update social media limits
        this.updateSocialMediaLimits(stats.charCount);
    }

    formatNumber(num) {
        return num.toLocaleString();
    }

    updateKeywordDensity(text) {
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !commonWords.has(word));

        if (words.length === 0) {
            this.elements.keywordDensity.innerHTML = `
                <div class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    Start typing to see keyword analysis
                </div>
            `;
            return;
        }

        // Count word frequencies
        const wordFreq = {};
        words.forEach(word => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        });

        // Sort by frequency and get top 5
        const sortedWords = Object.entries(wordFreq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        // Create keyword density HTML
        const keywordHTML = sortedWords.map(([word, count]) => {
            const percentage = ((count / words.length) * 100).toFixed(1);
            const barWidth = (count / sortedWords[0][1]) * 100;
            
            return `
                <div class="space-y-1">
                    <div class="flex justify-between items-center text-sm">
                        <span class="font-medium text-gray-700 dark:text-gray-300">${word}</span>
                        <span class="text-gray-500 dark:text-gray-400">${count} (${percentage}%)</span>
                    </div>
                    <div class="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                        <div class="bg-gradient-to-r from-primary-500 to-primary-600 h-1.5 rounded-full transition-all duration-300" style="width: ${barWidth}%"></div>
                    </div>
                </div>
            `;
        }).join('');

        this.elements.keywordDensity.innerHTML = keywordHTML || `
            <div class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No keywords found
            </div>
        `;
    }

    updateSocialMediaLimits(charCount) {
        // Facebook limit: 63,206 characters
        if (this.elements.facebookChars) {
            this.elements.facebookChars.textContent = this.formatNumber(charCount);
            const facebookLimit = 63206;
            const facebookPercentage = Math.min((charCount / facebookLimit) * 100, 100);
            
            // Update indicator
            if (this.elements.facebookIndicator) {
                if (facebookPercentage >= 100) {
                    this.elements.facebookIndicator.className = 'w-3 h-3 bg-red-500 rounded-full mr-2';
                } else if (facebookPercentage >= 80) {
                    this.elements.facebookIndicator.className = 'w-3 h-3 bg-yellow-500 rounded-full mr-2';
                } else {
                    this.elements.facebookIndicator.className = 'w-3 h-3 bg-green-500 rounded-full mr-2';
                }
            }
            
            // Update progress bar
            if (this.elements.facebookProgress) {
                this.elements.facebookProgress.style.width = `${facebookPercentage}%`;
                if (facebookPercentage >= 100) {
                    this.elements.facebookProgress.className = 'h-2 rounded-full bg-red-500 transition-all duration-300';
                } else if (facebookPercentage >= 80) {
                    this.elements.facebookProgress.className = 'h-2 rounded-full bg-yellow-500 transition-all duration-300';
                } else {
                    this.elements.facebookProgress.className = 'h-2 rounded-full bg-blue-500 transition-all duration-300';
                }
            }
        }
        
        // Twitter limit: 280 characters
        if (this.elements.twitterChars) {
            this.elements.twitterChars.textContent = this.formatNumber(charCount);
            const twitterLimit = 280;
            const twitterPercentage = Math.min((charCount / twitterLimit) * 100, 100);
            
            // Update indicator
            if (this.elements.twitterIndicator) {
                if (twitterPercentage >= 100) {
                    this.elements.twitterIndicator.className = 'w-3 h-3 bg-red-500 rounded-full mr-2';
                } else if (twitterPercentage >= 80) {
                    this.elements.twitterIndicator.className = 'w-3 h-3 bg-yellow-500 rounded-full mr-2';
                } else {
                    this.elements.twitterIndicator.className = 'w-3 h-3 bg-green-500 rounded-full mr-2';
                }
            }
            
            // Update progress bar
            if (this.elements.twitterProgress) {
                this.elements.twitterProgress.style.width = `${twitterPercentage}%`;
                if (twitterPercentage >= 100) {
                    this.elements.twitterProgress.className = 'h-2 rounded-full bg-red-500 transition-all duration-300';
                } else if (twitterPercentage >= 80) {
                    this.elements.twitterProgress.className = 'h-2 rounded-full bg-yellow-500 transition-all duration-300';
                } else {
                    this.elements.twitterProgress.className = 'h-2 rounded-full bg-sky-500 transition-all duration-300';
                }
            }
        }
        
        // Instagram limit: 2,200 characters
        if (this.elements.instagramChars) {
            this.elements.instagramChars.textContent = this.formatNumber(charCount);
            const instagramLimit = 2200;
            const instagramPercentage = Math.min((charCount / instagramLimit) * 100, 100);
            
            // Update indicator
            if (this.elements.instagramIndicator) {
                if (instagramPercentage >= 100) {
                    this.elements.instagramIndicator.className = 'w-3 h-3 bg-red-500 rounded-full mr-2';
                } else if (instagramPercentage >= 80) {
                    this.elements.instagramIndicator.className = 'w-3 h-3 bg-yellow-500 rounded-full mr-2';
                } else {
                    this.elements.instagramIndicator.className = 'w-3 h-3 bg-green-500 rounded-full mr-2';
                }
            }
            
            // Update progress bar
            if (this.elements.instagramProgress) {
                this.elements.instagramProgress.style.width = `${instagramPercentage}%`;
                if (instagramPercentage >= 100) {
                    this.elements.instagramProgress.className = 'h-2 rounded-full bg-red-500 transition-all duration-300';
                } else if (instagramPercentage >= 80) {
                    this.elements.instagramProgress.className = 'h-2 rounded-full bg-yellow-500 transition-all duration-300';
                } else {
                    this.elements.instagramProgress.className = 'h-2 rounded-full bg-pink-500 transition-all duration-300';
                }
            }
        }
    }

    openFocusMode() {
        this.elements.focusModeModal?.classList.remove('hidden');
    }

    openKillMode() {
        this.elements.killModeModal?.classList.remove('hidden');
    }

    startFocusMode() {
        this.focusModeActive = true;
        this.elements.focusModeModal?.classList.add('hidden');
        
        // Hide ALL elements except text input
        const body = document.body;
        const header = document.querySelector('header');
        const sidebar = document.querySelector('.lg\\:col-span-1');
        const footer = document.querySelector('footer');
        const mainContainer = document.querySelector('main');
        const textEditorHeader = document.querySelector('.text-lg.font-semibold'); // "Text Editor" header
        const toolbarButtons = document.querySelector('.flex.flex-wrap.gap-2'); // All toolbar buttons
        const textEditorContainer = document.querySelector('.lg\\:col-span-2');
        const textAreaContainer = this.textInput.parentElement;
        
        // Hide everything
        if (header) header.style.display = 'none';
        if (footer) footer.style.display = 'none';
        if (sidebar) sidebar.style.display = 'none';
        if (textEditorHeader) textEditorHeader.parentElement.style.display = 'none'; // Hide entire header section
        if (toolbarButtons) toolbarButtons.style.display = 'none';
        
        // Set body to full screen black/white background
        body.style.margin = '0';
        body.style.padding = '0';
        body.style.overflow = 'hidden';
        
        // Create focus mode container
        const focusContainer = document.createElement('div');
        focusContainer.id = 'focus-mode-container';
        focusContainer.className = 'fixed inset-0 bg-white dark:bg-gray-900 z-30';
        focusContainer.style.display = 'flex';
        focusContainer.style.flexDirection = 'column';
        
        // Move textarea to focus container
        this.originalParent = this.textInput.parentElement;
        focusContainer.appendChild(this.textInput);
        body.appendChild(focusContainer);
        
        // Style textarea for focus mode
        this.textInput.className = 'w-full h-full resize-none outline-none bg-transparent text-gray-900 dark:text-gray-100';
        this.textInput.style.border = 'none';
        this.textInput.style.fontSize = '18px';
        this.textInput.style.lineHeight = '1.7';
        this.textInput.style.padding = '3rem';
        this.textInput.style.fontFamily = 'ui-serif, Georgia, Cambria, serif';
        
        // Show exit and theme buttons
        this.elements.focusModeExitBtn?.classList.remove('hidden');
        
        // Add theme toggle to focus mode
        const themeToggle = document.createElement('div');
        themeToggle.id = 'focus-theme-toggle';
        themeToggle.className = 'fixed top-4 left-4 z-50';
        themeToggle.innerHTML = `
            <button id="focus-theme-btn" class="p-3 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors shadow-lg">
                <i id="focus-theme-icon" class="fas ${document.documentElement.classList.contains('dark') ? 'fa-sun' : 'fa-moon'} text-gray-600 dark:text-gray-300"></i>
            </button>
        `;
        body.appendChild(themeToggle);
        
        // Add theme toggle functionality
        document.getElementById('focus-theme-btn').addEventListener('click', () => {
            this.toggleTheme();
            const icon = document.getElementById('focus-theme-icon');
            const isDark = document.documentElement.classList.contains('dark');
            icon.className = `fas ${isDark ? 'fa-sun' : 'fa-moon'} text-gray-600 dark:text-gray-300`;
        });
        
        // Focus on text input
        this.textInput.focus();
        
        this.showToast('🎯 Focus Mode: Pure writing experience activated!', 'info');
    }

    exitFocusMode() {
        this.focusModeActive = false;
        
        const body = document.body;
        const header = document.querySelector('header');
        const sidebar = document.querySelector('.lg\\:col-span-1');
        const footer = document.querySelector('footer');
        const textEditorHeader = document.querySelector('.text-lg.font-semibold');
        const toolbarButtons = document.querySelector('.flex.flex-wrap.gap-2');
        const focusContainer = document.getElementById('focus-mode-container');
        const focusThemeToggle = document.getElementById('focus-theme-toggle');
        
        // Remove focus mode elements
        if (focusContainer) {
            // Move textarea back to original location
            if (this.originalParent) {
                this.originalParent.appendChild(this.textInput);
            }
            focusContainer.remove();
        }
        
        if (focusThemeToggle) {
            focusThemeToggle.remove();
        }
        
        // Restore body styling
        body.style.margin = '';
        body.style.padding = '';
        body.style.overflow = '';
        
        // Restore all hidden elements
        if (header) header.style.display = '';
        if (footer) footer.style.display = '';
        if (sidebar) sidebar.style.display = '';
        if (textEditorHeader) textEditorHeader.parentElement.style.display = '';
        if (toolbarButtons) toolbarButtons.style.display = '';
        
        // Restore original textarea styling and classes
        this.textInput.className = 'w-full min-h-96 p-4 border border-gray-200 dark:border-gray-700 rounded-lg resize-none outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transition-colors';
        this.textInput.style.border = '';
        this.textInput.style.fontSize = '';
        this.textInput.style.lineHeight = '';
        this.textInput.style.padding = '';
        this.textInput.style.fontFamily = '';
        
        // Hide focus mode buttons
        this.elements.focusModeExitBtn?.classList.add('hidden');
        
        // Re-trigger auto-resize
        this.autoResize();
        
        this.showToast('Focus Mode deactivated - Welcome back!', 'info');
    }

    startKillMode() {
        this.killModeActive = true;
        this.elements.killModeModal?.classList.add('hidden');
        this.elements.killModeIndicator?.classList.remove('hidden');
        
        // Set up kill mode detection
        this.initializeKillMode();
        
        this.showToast('⚠️ Kill Mode activated! Content will be destroyed if you leave!', 'error');
    }

    exitKillMode() {
        this.killModeActive = false;
        this.elements.killModeIndicator?.classList.add('hidden');
        
        // Remove kill mode detection
        this.destroyKillMode();
        
        this.showToast('Kill Mode deactivated - Your content is safe', 'info');
    }

    initializeKillMode() {
        if (!this.killModeActive) return;
        
        // Detect tab/window focus loss
        this.handleVisibilityChange = () => {
            if (document.hidden && this.killModeActive) {
                this.destroyContent();
            }
        };
        
        this.handleWindowBlur = () => {
            if (this.killModeActive) {
                setTimeout(() => {
                    if (this.killModeActive) {
                        this.destroyContent();
                    }
                }, 100); // Small delay to avoid false triggers
            }
        };
        
        this.handleBeforeUnload = (e) => {
            if (this.killModeActive) {
                this.destroyContent();
            }
        };
        
        // Add event listeners
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        window.addEventListener('blur', this.handleWindowBlur);
        window.addEventListener('beforeunload', this.handleBeforeUnload);
    }

    destroyKillMode() {
        // Remove event listeners
        if (this.handleVisibilityChange) {
            document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        }
        if (this.handleWindowBlur) {
            window.removeEventListener('blur', this.handleWindowBlur);
        }
        if (this.handleBeforeUnload) {
            window.removeEventListener('beforeunload', this.handleBeforeUnload);
        }
    }

    destroyContent() {
        if (!this.killModeActive) return;
        
        // Clear text content
        this.textInput.value = '';
        
        // Clear localStorage
        localStorage.removeItem('wordcounter-text');
        localStorage.removeItem('wordcounter-goal');
        localStorage.removeItem('wordcounter-start-time');
        localStorage.removeItem('wordcounter-last-save');
        
        // Update stats
        this.updateStats();
        
        // Show destruction message
        this.showToast('💀 CONTENT DESTROYED - You left the focus zone!', 'error');
        
        // Auto-exit kill mode after destruction
        setTimeout(() => {
            this.exitKillMode();
        }, 3000);
    }
}

// Common words to exclude from keyword analysis
const commonWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'she', 'or', 'an',
    'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
    'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him',
    'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some',
    'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look',
    'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after',
    'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
    'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day',
    'most', 'us', 'is', 'was', 'are', 'been', 'has', 'had', 'were'
]);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const wordCounter = new WordCounter();
    
    // Update stats initially
    wordCounter.updateStats();
    
    // Add animation effects
    const featureCards = document.querySelectorAll('.grid > div');
    featureCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animate-fade-in-up');
    });
    
    // Add pulse effect to stats when they update
    const observeStatsChanges = () => {
        const statsElements = [
            'word-count', 'char-count', 'char-no-spaces', 'sentence-count'
        ];
        
        statsElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const observer = new MutationObserver(() => {
                    element.classList.add('animate-pulse');
                    setTimeout(() => element.classList.remove('animate-pulse'), 300);
                });
                
                observer.observe(element, { 
                    childList: true, 
                    characterData: true, 
                    subtree: true 
                });
            }
        });
    };
    
    setTimeout(observeStatsChanges, 100);
});

// Add custom CSS animations and GitHub-style dark mode
const style = document.createElement('style');
style.textContent = `
    .animate-fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
        opacity: 0;
        transform: translateY(20px);
    }
    
    @keyframes fadeInUp {
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .animate-pulse {
        animation: pulse 0.3s ease-in-out;
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
    
    .hidden {
        display: none !important;
    }

    /* GitHub-style dark mode overrides */
    .dark {
        --tw-bg-opacity: 1;
        background-color: #0d1117;
    }

    .dark .bg-white {
        background-color: #161b22 !important;
    }

    .dark .bg-gray-50 {
        background-color: #21262d !important;
    }

    .dark .bg-gray-100 {
        background-color: #30363d !important;
    }

    .dark .bg-gray-800 {
        background-color: #161b22 !important;
    }

    .dark .bg-gray-900 {
        background-color: #0d1117 !important;
    }

    .dark .border-gray-200,
    .dark .border-gray-700 {
        border-color: #30363d !important;
    }

    .dark .text-white,
    .dark .text-gray-800 {
        color: #f0f6fc !important;
    }

    .dark .text-gray-600,
    .dark .text-gray-400 {
        color: #8b949e !important;
    }

    .dark .text-gray-300 {
        color: #f0f6fc !important;
    }

    .dark .text-gray-500 {
        color: #7d8590 !important;
    }

    .dark button:hover {
        background-color: #30363d !important;
    }

    .dark .shadow-lg {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2) !important;
    }

    /* Smooth transitions */
    * {
        transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
    }

    /* Custom scrollbar for dark mode */
    .dark ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    .dark ::-webkit-scrollbar-track {
        background: #161b22;
    }

    .dark ::-webkit-scrollbar-thumb {
        background: #30363d;
        border-radius: 4px;
    }

    .dark ::-webkit-scrollbar-thumb:hover {
        background: #484f58;
    }

    /* Modal styling for dark mode */
    .dark .modal-content {
        background-color: #161b22 !important;
        border-color: #30363d !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8) !important;
    }

    /* Input styling for dark mode */
    .dark input[type="text"],
    .dark input[type="number"],
    .dark select,
    .dark textarea {
        background-color: #0d1117 !important;
        border-color: #30363d !important;
        color: #f0f6fc !important;
    }

    .dark input[type="text"]:focus,
    .dark input[type="number"]:focus,
    .dark select:focus,
    .dark textarea:focus {
        border-color: #2f81f7 !important;
        box-shadow: 0 0 0 2px rgba(47, 129, 247, 0.2) !important;
    }

    /* Checkbox styling for dark mode */
    .dark input[type="checkbox"] {
        background-color: #21262d !important;
        border-color: #30363d !important;
    }

    .dark input[type="checkbox"]:checked {
        background-color: #2f81f7 !important;
        border-color: #2f81f7 !important;
    }

    /* Toast notifications styling */
    .dark .toast-success {
        background-color: #238636 !important;
    }

    .dark .toast-error {
        background-color: #da3633 !important;
    }

    .dark .toast-info {
        background-color: #1f6feb !important;
    }

    /* Progress bar colors */
    .dark .bg-primary-500 {
        background-color: #2f81f7 !important;
    }

    .dark .bg-green-500 {
        background-color: #238636 !important;
    }

    .dark .bg-yellow-500 {
        background-color: #d29922 !important;
    }

    /* Floating goal widget animations */
    .animate-slide-up {
        animation: slideUpFloat 0.4s ease-out forwards;
        opacity: 0;
        transform: translateY(20px) scale(0.95);
    }

    @keyframes slideUpFloat {
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    /* Goal widget hover effects */
    #floating-goal-widget:hover {
        transform: translateY(-2px);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .dark #floating-goal-widget:hover {
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
    }

    /* Progress bar animations */
    .floating-progress-bar {
        transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Pulse animation for percentage when it changes */
    .percentage-change {
        animation: percentagePulse 0.6s ease-out;
    }

    @keyframes percentagePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); font-weight: 700; }
    }

    /* Goal achievement celebration */
    .goal-achieved {
        animation: goalCelebration 1s ease-out;
    }

    @keyframes goalCelebration {
        0%, 100% { transform: scale(1); }
        25% { transform: scale(1.05) rotate(1deg); }
        75% { transform: scale(1.05) rotate(-1deg); }
    }

    /* Floating widget responsiveness */
    @media (max-width: 640px) {
        #floating-goal-widget {
            bottom: 1rem !important;
            right: 1rem !important;
            left: 1rem !important;
            width: auto !important;
            min-width: unset !important;
            max-width: unset !important;
        }
    }

    /* Case dropdown styling */
    #case-dropdown {
        animation: dropdownSlide 0.2s ease-out;
        transform-origin: top;
    }

    @keyframes dropdownSlide {
        from {
            opacity: 0;
            transform: translateY(-5px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    .case-option {
        font-family: 'Consolas', 'Monaco', 'Lucida Console', monospace;
        cursor: pointer;
        border-left: 3px solid transparent;
        transition: all 0.1s ease;
    }

    .case-option:hover {
        border-left-color: #2f81f7 !important;
    }

    /* Token estimation styling */
    .dark #token-count {
        color: #2f81f7 !important;
    }

    #token-count {
        color: #1f6feb;
        font-weight: 600;
    }

    /* Warning box improvements */
    .dark .bg-yellow-50 {
        background-color: rgba(251, 191, 36, 0.1) !important;
    }

    .dark .border-yellow-200 {
        border-color: rgba(251, 191, 36, 0.3) !important;
    }

    .dark .text-yellow-800 {
        color: #fbbf24 !important;
    }
`;
document.head.appendChild(style);