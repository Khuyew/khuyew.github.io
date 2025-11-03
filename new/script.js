// script.js - Production Ready v3.0.4
class KHAIAssistant {
    constructor() {
        this.DEBUG = false;
        this.initializeElements();
        this.initializeState();
        this.setupMarked();
        this.init();
    }

    initializeElements() {
        try {
            // Core UI elements
            this.messagesContainer = document.getElementById('messagesContainer');
            this.userInput = document.getElementById('userInput');
            this.sendBtn = document.getElementById('sendBtn');
            this.clearInputBtn = document.getElementById('clearInputBtn');
            this.clearChatBtn = document.getElementById('clearChatBtn');
            this.helpBtn = document.getElementById('helpBtn');
            this.generateImageBtn = document.getElementById('generateImageBtn');
            this.generateVoiceBtn = document.getElementById('generateVoiceBtn');
            this.themeToggle = document.getElementById('themeToggle');
            this.logo = document.getElementById('logoBtn');
            this.attachFileBtn = document.getElementById('attachFileBtn');
            this.voiceInputBtn = document.getElementById('voiceInputBtn');
            this.fileInput = document.getElementById('fileInput');
            this.attachedFiles = document.getElementById('attachedFiles');
            this.currentChatName = document.getElementById('currentChatName');
            this.inputSection = document.getElementById('inputSection');
            
            // Navigation
            this.scrollToLastAI = document.getElementById('scrollToLastAI');
            this.scrollToBottomBtn = document.getElementById('scrollToBottom');
            this.chatMinimap = document.getElementById('chatMinimap');
            this.minimapContent = document.getElementById('minimapContent');
            this.minimapViewport = document.getElementById('minimapViewport');

            // Menu
            this.menuToggle = document.getElementById('menuToggle');
            this.sidebarMenu = document.getElementById('sidebarMenu');
            this.sidebarOverlay = document.getElementById('sidebarOverlay');
            this.sidebarClose = document.getElementById('sidebarClose');
            this.sidebarBlogBtn = document.getElementById('sidebarBlogBtn');
            this.chatList = document.getElementById('chatList');
            this.newChatBtn = document.getElementById('newChatBtn');
            this.deleteAllChatsBtn = document.getElementById('deleteAllChatsBtn');

            // Search
            this.headerSearch = document.getElementById('headerSearch');
            this.headerSearchClear = document.getElementById('headerSearchClear');

            // Modes
            this.normalModeBtn = document.getElementById('normalModeBtn');

            // Modals
            this.editChatModal = document.getElementById('editChatModal');
            this.editChatNameInput = document.getElementById('editChatNameInput');
            this.modalClearInput = document.getElementById('modalClearInput');
            this.editChatModalClose = document.getElementById('editChatModalClose');
            this.editChatModalCancel = document.getElementById('editChatModalCancel');
            this.editChatModalSave = document.getElementById('editChatModalSave');

            // Model management
            this.modelSelectBtn = document.getElementById('modelSelectBtn');
            this.modelModalOverlay = document.getElementById('modelModalOverlay');
            this.modelModalClose = document.getElementById('modelModalClose');
            this.modelModalCancel = document.getElementById('modelModalCancel');
            this.modelModalConfirm = document.getElementById('modelModalConfirm');
            this.modelList = document.getElementById('modelList');
            
            // Sidebar
            this.sidebarSearch = document.getElementById('sidebarSearch');
            this.currentModelInfo = document.getElementById('currentModelInfo');
            this.connectionStatus = document.getElementById('connectionStatus');
            this.importChatBtn = document.getElementById('importChatBtn');
            this.languageSelect = document.getElementById('languageSelect');
            
            // Footer
            this.connectionStatusText = document.getElementById('connectionStatusText');
            this.downloadChatBtn = document.getElementById('downloadChatBtn');

            // New elements
            this.preloader = document.getElementById('preloader');
            this.page404 = document.getElementById('page404');
            this.appContainer = document.getElementById('appContainer');
            this.errorBackBtn = document.getElementById('errorBackBtn');
            this.sidebarSearchClear = document.getElementById('sidebarSearchClear');

            // Help modal
            this.helpModal = document.getElementById('helpModal');
            this.helpModalClose = document.getElementById('helpModalClose');
            this.helpModalOk = document.getElementById('helpModalOk');
            this.helpContent = document.getElementById('helpContent');

            // Message modal
            this.messageModal = document.getElementById('messageModal');
            this.messageModalClose = document.getElementById('messageModalClose');
            this.messageModalCloseBtn = document.getElementById('messageModalCloseBtn');
            this.messageModalTitle = document.getElementById('messageModalTitle');
            this.messageModalContent = document.getElementById('messageModalContent');
            this.messageModalCopy = document.getElementById('messageModalCopy');
            this.messageModalSpeak = document.getElementById('messageModalSpeak');

            // Floating particles
            this.floatingParticles = document.getElementById('floatingParticles');

            // Tutorial elements
            this.tutorialOverlay = document.getElementById('tutorialOverlay');
            this.skipTutorialBtn = document.getElementById('skipTutorialBtn');
            this.finishTutorialBtn = document.getElementById('finishTutorialBtn');

            // Tutorial navigation buttons
            this.nextStepBtn1 = document.getElementById('nextStepBtn1');
            this.nextStepBtn2 = document.getElementById('nextStepBtn2');
            this.nextStepBtn3 = document.getElementById('nextStepBtn3');
            this.nextStepBtn4 = document.getElementById('nextStepBtn4');
            this.nextStepBtn5 = document.getElementById('nextStepBtn5');
            this.prevStepBtn2 = document.getElementById('prevStepBtn2');
            this.prevStepBtn3 = document.getElementById('prevStepBtn3');
            this.prevStepBtn4 = document.getElementById('prevStepBtn4');
            this.prevStepBtn5 = document.getElementById('prevStepBtn5');
            this.prevStepBtn6 = document.getElementById('prevStepBtn6');

            // App header and footer for scroll effects
            this.appHeader = document.querySelector('.app-header');
            this.appFooter = document.querySelector('.app-footer');
            this.chatMinimapContainer = document.querySelector('.chat-minimap-container');

            // PWA Install button
            this.pwaInstallBtn = document.getElementById('pwaInstallBtn');
            this.pwaInstallBtnClose = document.getElementById('pwaInstallBtnClose');

            // Context counter
            this.contextCounter = document.getElementById('contextCounter');
            this.contextCounterText = document.getElementById('contextCounterText');
            this.contextCounterTooltip = document.getElementById('contextCounterTooltip');

            // Context warning modal
            this.contextWarningModal = document.getElementById('contextWarningModal');
            this.contextWarningModalClose = document.getElementById('contextWarningModalClose');
            this.contextWarningContinue = document.getElementById('contextWarningContinue');
            this.contextWarningNewChat = document.getElementById('contextWarningNewChat');
            this.contextWarningPercentage = document.getElementById('contextWarningPercentage');

            // Language toggle button (will be created dynamically)
            this.languageToggleBtn = null;

            // Validate critical elements
            this.validateRequiredElements();
            
        } catch (error) {
            this.handleCriticalError('Ошибка инициализации элементов интерфейса', error);
        }
    }

    validateRequiredElements() {
        const required = ['messagesContainer', 'userInput', 'sendBtn'];
        const missing = required.filter(id => !this[id]);
        
        if (missing.length > 0) {
            throw new Error(`Отсутствуют обязательные элементы: ${missing.join(', ')}`);
        }
    }

    initializeState() {
        // App state
        this.isProcessing = false;
        this.currentTheme = this.detectSystemTheme();
        this.isImageMode = false;
        this.isVoiceMode = false;
        this.attachedImages = [];
        this.isListening = false;
        this.recognition = null;
        this.conversationHistory = [];
        this.currentModel = 'gpt-5-nano';
        this.currentAudio = null;
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.chatSessions = new Map();
        this.currentChatId = 'default';
        this.activeTypingIndicator = null;
        this.activeStreamingMessage = null;
        this.autoScrollEnabled = true;
        
        // Generation states
        this.isGenerating = false;
        this.generationAborted = false;
        this.currentStreamController = null;
        this.lastUserMessage = null;
        
        // Navigation states
        this.isAtBottom = true;
        this.isAtTop = false;
        this.lastAIMessageIndex = -1;

        // Performance
        this.debounceTimers = new Map();
        this.cleanupCallbacks = [];
        this.activeTimeouts = new Set();
        this.activeEventListeners = new Map();

        // Configuration
        this.placeholderExamples = [
            "Раскажы пра магчымасці штучнага інтэлекту...",
            "Напішы код для сартавання масіва на Python...",
            "Згенеруй выяву касмічнага карабля...",
            "Якія ёсць спосабы палепшыць прадукцыйнасць вэб-сайта?",
            "Ствары апісанне для прыкладання на аснове ІІ..."
        ];

        this.modelConfig = {
            'gpt-5-nano': { 
                name: 'GPT-5 Nano', 
                description: 'Хуткая і эфектыўная мадэль для паўсядзённых задач',
                available: true,
                context: 128000
            },
            'o3-mini': { 
                name: 'O3 Mini', 
                description: 'Прасунутая мадэль з палепшанымі магчымасцямі разважання',
                available: true,
                context: 128000
            },
            'deepseek-chat': { 
                name: 'DeepSeek Chat', 
                description: 'Універсальная мадэль для абмену паведамленнямі і вырашэння задач',
                available: true,
                context: 128000
            },
            'deepseek-reasoner': { 
                name: 'DeepSeek Reasoner', 
                description: 'Спецыялізаваная мадэль для складаных лагічных разважанняў',
                available: true,
                context: 128000
            },
            'gemini-2.0-flash': { 
                name: 'Gemini 2.0 Flash', 
                description: 'Найноўшая хуткая мадэль ад Google з палепшанымі магчымасцямі',
                available: true,
                context: 128000
            },
            'grok-beta': { 
                name: 'xAI Grok', 
                description: 'Мадэль ад xAI з унікальным характарам і дасціпнымі адказамі',
                available: true,
                context: 128000
            },
            'khai-model': { 
                name: 'KHAI Model', 
                description: 'Нашая ўласная мадэль ІІ - у распрацоўцы',
                available: false,
                context: 128000
            }
        };

        // Limits
        this.MAX_FILES = 3;
        this.MAX_MESSAGE_LENGTH = 4000;
        this.MAX_CHAT_NAME_LENGTH = 16;
        this.CONVERSATION_HISTORY_LIMIT = 30;
        this.MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

        // Context limits
        this.MAX_CONTEXT_TOKENS = 128000;
        this.RECOMMENDED_CONTEXT_TOKENS = 100000;
        this.WARNING_THRESHOLD = 0.75; // 75%
        this.DANGER_THRESHOLD = 0.9; // 90%

        // PWA state
        this.isPWAInstalled = false;
        this.deferredPrompt = null;

        // Input state
        this.isInputFocused = false;
        this.originalInputHeight = 56;

        // Tutorial state
        this.currentTutorialStep = 1;
        this.tutorialCompleted = false;

        // Scroll state
        this.isScrolling = false;
        this.scrollTimeout = null;
        this.scrollZoomLevel = 1;

        // Welcome presets
        this.welcomePresets = [
            {
                title: "Аналізаваць файл",
                icon: "ti-file-text",
                action: () => this.handleFileAnalysisPreset()
            },
            {
                title: "Вырашыць задачу",
                icon: "ti-math",
                action: () => this.handleProblemSolvingPreset()
            },
            {
                title: "Напісаць код",
                icon: "ti-code",
                action: () => this.handleCodeWritingPreset()
            },
            {
                title: "Перакласці тэкст",
                icon: "ti-language",
                action: () => this.handleTranslationPreset()
            },
            {
                title: "Тлумачыць тэму",
                icon: "ti-school",
                action: () => this.handleExplanationPreset()
            },
            {
                title: "Стварыць кантэнт",
                icon: "ti-edit",
                action: () => this.handleContentCreationPreset()
            }
        ];

        // Current context usage
        this.currentContextUsage = 0;
        this.contextWarningShown = false;
    }

    detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    setupMarked() {
        if (typeof marked === 'undefined') {
            console.warn('Marked.js не загружаны');
            return;
        }

        const renderer = new marked.Renderer();
        
        // Security-focused renderer
        renderer.link = (href, title, text) => {
            if (!href || href.startsWith('javascript:') || href.startsWith('data:')) {
                return this.escapeHtml(text);
            }
            const safeHref = this.escapeHtml(href);
            const safeTitle = title ? this.escapeHtml(title) : '';
            const safeText = this.escapeHtml(text);
            return `<a href="${safeHref}" title="${safeTitle}" target="_blank" rel="noopener noreferrer">${safeText}</a>`;
        };

        renderer.image = (href, title, text) => {
            if (!href || !href.startsWith('https://')) {
                return this.escapeHtml(text || '');
            }
            const safeHref = this.escapeHtml(href);
            const safeTitle = title ? this.escapeHtml(title) : '';
            const safeText = text ? this.escapeHtml(text) : '';
            return `<img src="${safeHref}" alt="${safeText}" title="${safeTitle}" loading="lazy" style="max-width: 100%;">`;
        };

        marked.setOptions({
            renderer: renderer,
            highlight: (code, lang) => {
                if (typeof hljs !== 'undefined' && lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (err) {
                        this.debug('Error highlighting code:', err);
                    }
                }
                return this.escapeHtml(code);
            },
            langPrefix: 'hljs language-',
            breaks: true,
            gfm: true,
            sanitize: false
        });
    }

    init() {
        try {
            // Initialize i18n first
            if (typeof i18n === 'undefined') {
                console.error('i18n not loaded');
                this.showNotification('Памылка загрузкі шматмоўнай падтрымкі', 'error');
            }

            this.bindEvents();
            this.setupAutoResize();
            this.setupVoiceRecognition();
            this.startPlaceholderAnimation();
            this.loadThemePreference();
            this.loadChatSessions();
            this.setupChatSelector();
            this.loadCurrentSession();
            this.setupScrollTracking();
            this.setupResponsiveMinimap();
            this.updateModelInfo();
            this.updateModelList();
            this.updateDocumentTitle();
            this.updateConnectionStatus();
            this.checkPWAInstallation();
            this.setup404Handling();
            this.setCurrentYear();
            this.setupHelpContent();
            this.setupMessageModal();
            this.setupTutorial();
            this.setupMinimapScroll();
            this.setupPWAInstallButton();
            this.setupLanguageSelector();
            this.setupContextCounter();
            this.setupContextWarningModal();
            this.createLanguageToggleButton();
            
            // Скрываем прелоадер после загрузки
            this.hidePreloader();
            
            this.debug('KHAI Assistant успешно загружен');
            this.showNotification('KHAI Assistant загружаны і гатовы да працы!', 'success');
            
            // Setup cleanup on page unload
            this.setupCleanup();
            
        } catch (error) {
            this.handleCriticalError('Ошибка инициализации приложения', error);
        }
    }

    setupCleanup() {
        const cleanup = () => {
            this.cleanup();
        };
        
        window.addEventListener('beforeunload', cleanup);
        window.addEventListener('pagehide', cleanup);
        
        this.cleanupCallbacks.push(() => {
            window.removeEventListener('beforeunload', cleanup);
            window.removeEventListener('pagehide', cleanup);
        });
    }

    // Language and Context Management
    setupLanguageSelector() {
        if (this.languageSelect) {
            // Set current language
            this.languageSelect.value = i18n.getCurrentLanguage();
            
            this.addEventListener(this.languageSelect, 'change', (e) => {
                const newLang = e.target.value;
                i18n.applyLanguage(newLang);
                this.updateUIForLanguage();
                this.showNotification(`Мова зменена на: ${i18n.get('sidebar.language.' + newLang)}`, 'success');
            });
        }
    }

    createLanguageToggleButton() {
        // Create language toggle button for welcome message
        this.languageToggleBtn = document.createElement('button');
        this.languageToggleBtn.className = 'welcome-language-toggle';
        this.languageToggleBtn.innerHTML = `<i class="ti ti-language"></i> ${i18n.getToggleLanguageText()}`;
        
        this.addEventListener(this.languageToggleBtn, 'click', () => {
            const newLang = i18n.toggleLanguage();
            this.updateUIForLanguage();
            this.showNotification(`Мова зменена на: ${i18n.get('sidebar.language.' + newLang)}`, 'success');
        });
    }

    updateUIForLanguage() {
        // Update all dynamic text in the UI
        this.updateDocumentTitle();
        this.updateModelInfo();
        this.setupHelpContent();
        this.updateConnectionStatus();
        this.updateNavigationButtons();
        this.updateCurrentChatName();
        
        // Update welcome message if visible
        const welcomeContent = this.messagesContainer.querySelector('.welcome-content');
        if (welcomeContent && !welcomeContent.classList.contains('hidden')) {
            this.showWelcomeMessage();
        }
        
        // Update language toggle button text
        if (this.languageToggleBtn) {
            this.languageToggleBtn.innerHTML = `<i class="ti ti-language"></i> ${i18n.getToggleLanguageText()}`;
        }
        
        // Update language selector
        if (this.languageSelect) {
            this.languageSelect.value = i18n.getCurrentLanguage();
        }
        
        // Update context counter tooltip
        this.updateContextCounterTooltip();
    }

    // Context Counter Management
    setupContextCounter() {
        this.updateContextCounter();
        this.updateContextCounterTooltip();
    }

    setupContextWarningModal() {
        this.addEventListener(this.contextWarningModalClose, 'click', () => {
            this.contextWarningModal.classList.remove('active');
        });

        this.addEventListener(this.contextWarningContinue, 'click', () => {
            this.contextWarningModal.classList.remove('active');
            this.contextWarningShown = true;
        });

        this.addEventListener(this.contextWarningNewChat, 'click', () => {
            this.contextWarningModal.classList.remove('active');
            this.createNewChat();
        });

        this.addEventListener(this.contextWarningModal, 'click', (e) => {
            if (e.target === this.contextWarningModal) {
                this.contextWarningModal.classList.remove('active');
            }
        });
    }

    calculateContextUsage() {
        // Calculate approximate token usage based on conversation history
        let totalTokens = 0;
        
        this.conversationHistory.forEach(message => {
            // Rough estimation: 1 token ≈ 4 characters for English, 2 for Russian/Belarusian
            const chars = message.content.length;
            const tokens = Math.ceil(chars / (i18n.getCurrentLanguage() === 'be' ? 2 : 4));
            totalTokens += tokens;
            
            // Add overhead for message format
            totalTokens += 10;
        });
        
        // Add system prompt tokens
        totalTokens += 500;
        
        this.currentContextUsage = totalTokens;
        return totalTokens;
    }

    updateContextCounter() {
        const usedTokens = this.calculateContextUsage();
        const percentage = usedTokens / this.MAX_CONTEXT_TOKENS;
        
        this.contextCounterText.textContent = i18n.get('context.counter', {
            used: usedTokens.toLocaleString(),
            total: this.MAX_CONTEXT_TOKENS.toLocaleString()
        });
        
        // Update visual state
        this.contextCounter.classList.remove('warning', 'danger');
        
        if (percentage >= this.DANGER_THRESHOLD) {
            this.contextCounter.classList.add('danger');
            if (!this.contextWarningShown && usedTokens > 0) {
                this.showContextWarning(percentage);
            }
        } else if (percentage >= this.WARNING_THRESHOLD) {
            this.contextCounter.classList.add('warning');
            this.contextWarningShown = false; // Reset to show warning again if usage decreases then increases
        }
        
        // Update tooltip with current usage info
        this.updateContextCounterTooltip();
    }

    updateContextCounterTooltip() {
        const usedTokens = this.currentContextUsage;
        const percentage = Math.round((usedTokens / this.MAX_CONTEXT_TOKENS) * 100);
        
        this.contextCounterTooltip.setAttribute('data-tooltip', 
            i18n.get('context.tooltip') + '\n\n' +
            i18n.get('context.recommended', { tokens: this.RECOMMENDED_CONTEXT_TOKENS.toLocaleString() }) + '\n' +
            i18n.get('context.counter', { 
                used: usedTokens.toLocaleString(), 
                total: this.MAX_CONTEXT_TOKENS.toLocaleString() 
            }) + ` (${percentage}%)`
        );
    }

    showContextWarning(percentage) {
        this.contextWarningPercentage.textContent = Math.round(percentage * 100);
        this.contextWarningModal.classList.add('active');
        this.contextWarningShown = true;
    }

    bindEvents() {
        const events = [
            [this.sendBtn, 'click', () => this.handleSendButtonClick()],
            [this.userInput, 'keydown', (e) => this.handleInputKeydown(e)],
            [this.userInput, 'input', () => this.handleInputChange()],
            [this.userInput, 'focus', () => this.handleInputFocus()],
            [this.userInput, 'blur', () => this.handleInputBlur()],
            [this.clearInputBtn, 'click', () => this.clearInput()],
            [this.clearChatBtn, 'click', () => this.clearChat()],
            [this.helpBtn, 'click', () => this.showHelpModal()],
            [this.generateImageBtn, 'click', () => this.toggleImageMode()],
            [this.generateVoiceBtn, 'click', () => this.toggleVoiceMode()],
            [this.themeToggle, 'click', () => this.toggleTheme()],
            [this.logo, 'click', () => this.refreshPage()],
            [this.attachFileBtn, 'click', () => this.fileInput.click()],
            [this.fileInput, 'change', (e) => this.handleFileSelect(e)],
            [this.voiceInputBtn, 'click', () => this.toggleVoiceInput()],
            [this.menuToggle, 'click', () => this.toggleSidebar()],
            [this.sidebarClose, 'click', () => this.closeSidebar()],
            [this.sidebarOverlay, 'click', () => this.closeSidebar()],
            [this.sidebarBlogBtn, 'click', () => this.openBlog()],
            [this.newChatBtn, 'click', () => this.createNewChat()],
            [this.deleteAllChatsBtn, 'click', () => this.deleteAllChats()],
            [this.editChatModalClose, 'click', () => this.closeEditChatModal()],
            [this.editChatModalCancel, 'click', () => this.closeEditChatModal()],
            [this.editChatModalSave, 'click', () => this.saveChatName()],
            [this.editChatNameInput, 'keydown', (e) => {
                if (e.key === 'Enter') this.saveChatName();
                if (e.key === 'Escape') this.closeEditChatModal();
            }],
            [this.editChatNameInput, 'input', () => this.handleModalInputChange()],
            [this.modalClearInput, 'click', () => this.clearModalInput()],
            [this.scrollToLastAI, 'click', () => this.scrollToLastAIMessage()],
            [this.scrollToBottomBtn, 'click', () => this.scrollToBottom(true)],
            [this.messagesContainer, 'scroll', () => this.handleScroll()],
            [this.headerSearch, 'input', () => this.debounce('search', () => this.handleSearchInput(), 300)],
            [this.headerSearchClear, 'click', () => this.clearSearch()],
            [this.normalModeBtn, 'click', () => this.setMode('normal')],
            [this.modelSelectBtn, 'click', () => this.openModelModal()],
            [this.modelModalClose, 'click', () => this.closeModelModal()],
            [this.modelModalCancel, 'click', () => this.closeModelModal()],
            [this.modelModalConfirm, 'click', () => this.confirmModelSelection()],
            [this.modelModalOverlay, 'click', (e) => {
                if (e.target === this.modelModalOverlay) this.closeModelModal();
            }],
            [this.sidebarSearch, 'input', () => this.debounce('sidebarSearch', () => this.handleSidebarSearchInput(), 300)],
            [this.sidebarSearchClear, 'click', () => this.clearSidebarSearch()],
            [this.importChatBtn, 'click', () => this.importChatHistory()],
            [this.downloadChatBtn, 'click', () => this.downloadCurrentChat()],
            [this.errorBackBtn, 'click', () => this.hide404Page()],
            [this.helpModalClose, 'click', () => this.closeHelpModal()],
            [this.helpModalOk, 'click', () => this.closeHelpModal()],
            [this.helpModal, 'click', (e) => {
                if (e.target === this.helpModal) this.closeHelpModal();
            }],
            [this.messageModalClose, 'click', () => this.closeMessageModal()],
            [this.messageModalCloseBtn, 'click', () => this.closeMessageModal()],
            [this.messageModal, 'click', (e) => {
                if (e.target === this.messageModal) this.closeMessageModal();
            }],
            [this.messageModalCopy, 'click', () => this.copyMessageModalContent()],
            [this.messageModalSpeak, 'click', () => this.speakMessageModalContent()],
            [document, 'keydown', (e) => this.handleGlobalKeydown(e)],
            [window, 'online', () => this.handleOnlineStatus()],
            [window, 'offline', () => this.handleOfflineStatus()],
            [window, 'resize', () => this.debounce('resize', () => this.handleResize(), 250)],
            // PWA events
            [window, 'beforeinstallprompt', (e) => this.handleBeforeInstallPrompt(e)],
            [window, 'appinstalled', () => this.handleAppInstalled()],
            // PWA Install button
            [this.pwaInstallBtn, 'click', () => this.installPWA()],
            [this.pwaInstallBtnClose, 'click', () => this.hidePWAInstallButton()],
        ];

        events.forEach(([element, event, handler]) => {
            if (element) {
                this.addEventListener(element, event, handler);
            }
        });

        // Message click handlers
        this.addEventListener(this.messagesContainer, 'click', (e) => {
            const message = e.target.closest('.message');
            if (message && !e.target.closest('.message-actions')) {
                this.openMessageModal(message);
            }
        });

        // Tutorial event handlers
        this.setupTutorialEvents();
    }

    setupTutorialEvents() {
        const tutorialEvents = [
            [this.skipTutorialBtn, 'click', () => this.skipTutorial()],
            [this.finishTutorialBtn, 'click', () => this.finishTutorial()],
            [this.nextStepBtn1, 'click', () => this.nextTutorialStep()],
            [this.nextStepBtn2, 'click', () => this.nextTutorialStep()],
            [this.nextStepBtn3, 'click', () => this.nextTutorialStep()],
            [this.nextStepBtn4, 'click', () => this.nextTutorialStep()],
            [this.nextStepBtn5, 'click', () => this.nextTutorialStep()],
            [this.prevStepBtn2, 'click', () => this.prevTutorialStep()],
            [this.prevStepBtn3, 'click', () => this.prevTutorialStep()],
            [this.prevStepBtn4, 'click', () => this.prevTutorialStep()],
            [this.prevStepBtn5, 'click', () => this.prevTutorialStep()],
            [this.prevStepBtn6, 'click', () => this.prevTutorialStep()],
        ];

        tutorialEvents.forEach(([element, event, handler]) => {
            if (element) {
                this.addEventListener(element, event, handler);
            }
        });
    }

    setupTutorial() {
        // Check if user has completed tutorial before
        const tutorialCompleted = localStorage.getItem('khai-tutorial-completed');
        if (!tutorialCompleted) {
            // Show tutorial after a short delay
            this.setTimeout(() => {
                this.startTutorial();
            }, 1000);
        }
    }

    startTutorial() {
        this.tutorialOverlay.style.display = 'flex';
        this.currentTutorialStep = 1;
        this.showTutorialStep(1);
    }

    showTutorialStep(step) {
        // Hide all steps
        const steps = this.tutorialOverlay.querySelectorAll('.tutorial-step');
        steps.forEach(step => step.classList.remove('active'));
        
        // Show current step
        const currentStep = this.tutorialOverlay.querySelector(`#tutorialStep${step}`);
        if (currentStep) {
            currentStep.classList.add('active');
        }
        
        // Highlight relevant UI elements
        this.highlightTutorialElements(step);
        
        this.currentTutorialStep = step;
    }

    highlightTutorialElements(step) {
        // Remove previous highlights
        const existingHighlights = document.querySelectorAll('.tutorial-highlight, .tutorial-element-highlight');
        existingHighlights.forEach(el => el.remove());

        let highlightElement = null;
        let highlightText = '';

        switch(step) {
            case 2:
                // Highlight sidebar menu
                highlightElement = this.menuToggle;
                highlightText = i18n.get('tutorial.highlight.menu');
                break;
            case 3:
                // Highlight model selection
                highlightElement = this.modelSelectBtn;
                highlightText = i18n.get('tutorial.highlight.model');
                break;
            case 4:
                // Highlight mode buttons
                highlightElement = document.querySelector('.action-buttons');
                highlightText = i18n.get('tutorial.highlight.modes');
                break;
            case 5:
                // Highlight file attachment
                highlightElement = this.attachFileBtn;
                highlightText = i18n.get('tutorial.highlight.files');
                break;
        }

        if (highlightElement) {
            this.createTutorialHighlight(highlightElement, highlightText);
        }
    }

    createTutorialHighlight(element, text) {
        const rect = element.getBoundingClientRect();
        const highlight = document.createElement('div');
        highlight.className = 'tutorial-highlight';
        highlight.style.width = `${rect.width + 20}px`;
        highlight.style.height = `${rect.height + 20}px`;
        highlight.style.left = `${rect.left - 10}px`;
        highlight.style.top = `${rect.top - 10}px`;
        
        document.body.appendChild(highlight);

        // Add text label
        if (text) {
            const label = document.createElement('div');
            label.className = 'tutorial-element-highlight';
            label.textContent = text;
            label.style.position = 'fixed';
            label.style.left = `${rect.left}px`;
            label.style.top = `${rect.top + rect.height + 15}px`;
            label.style.background = 'var(--accent-primary)';
            label.style.color = 'white';
            label.style.padding = '8px 12px';
            label.style.borderRadius = 'var(--radius-md)';
            label.style.fontSize = '14px';
            label.style.fontWeight = '500';
            label.style.zIndex = '10013';
            label.style.whiteSpace = 'nowrap';
            label.style.boxShadow = 'var(--shadow-lg)';
            
            document.body.appendChild(label);
        }
    }

    nextTutorialStep() {
        if (this.currentTutorialStep < 6) {
            this.showTutorialStep(this.currentTutorialStep + 1);
        } else {
            this.finishTutorial();
        }
    }

    prevTutorialStep() {
        if (this.currentTutorialStep > 1) {
            this.showTutorialStep(this.currentTutorialStep - 1);
        }
    }

    skipTutorial() {
        this.tutorialOverlay.style.display = 'none';
        localStorage.setItem('khai-tutorial-completed', 'true');
        this.showNotification(i18n.get('notification.tutorialSkipped'), 'info');
    }

    finishTutorial() {
        this.tutorialOverlay.style.display = 'none';
        localStorage.setItem('khai-tutorial-completed', 'true');
        this.tutorialCompleted = true;
        this.showNotification(i18n.get('notification.tutorialCompleted'), 'success');
        this.userInput.focus();
    }

    // Blog functionality
    openBlog() {
        window.open('https://khai.by/blog', '_blank');
        this.closeSidebar();
        this.showNotification('Адкрываем блог...', 'info');
    }

    // Message Modal Methods
    setupMessageModal() {
        // Уже привязано в bindEvents
    }

    openMessageModal(messageElement) {
        const messageContent = messageElement.querySelector('.message-content');
        if (!messageContent) return;

        const role = messageElement.classList.contains('message-user') ? 'user' : 'ai';
        const title = role === 'user' ? i18n.get('message.yourMessage') : i18n.get('message.aiResponse');
        
        this.messageModalTitle.textContent = title;
        this.messageModalContent.innerHTML = messageContent.innerHTML;
        
        // Store current message for speak functionality
        this.currentModalMessage = this.extractPlainText(messageContent.innerHTML);
        
        this.messageModal.classList.add('active');
        
        // Адаптируем кнопки для мобильных устройств
        this.adaptMessageModalButtons();
    }

    adaptMessageModalButtons() {
        const modalFooter = this.messageModal.querySelector('.modal-footer');
        if (window.innerWidth <= 768) {
            modalFooter.classList.add('mobile-layout');
            // Перестраиваем кнопки для мобильных
            const buttons = modalFooter.querySelectorAll('.modal-btn');
            buttons.forEach(btn => {
                btn.style.flex = '1';
                btn.style.minWidth = '0';
                btn.style.margin = '2px';
            });
        } else {
            modalFooter.classList.remove('mobile-layout');
        }
    }

    closeMessageModal() {
        this.messageModal.classList.remove('active');
        this.currentModalMessage = null;
    }

    copyMessageModalContent() {
        if (!this.currentModalMessage) return;
        
        navigator.clipboard.writeText(this.currentModalMessage)
            .then(() => {
                this.showNotification(i18n.get('notification.messageCopied'), 'success');
                this.messageModalCopy.innerHTML = '<i class="ti ti-check"></i> ' + i18n.get('message.copied');
                this.messageModalCopy.classList.add('copied');
                this.setTimeout(() => {
                    this.messageModalCopy.innerHTML = '<i class="ti ti-copy"></i> ' + i18n.get('message.copy');
                    this.messageModalCopy.classList.remove('copied');
                }, 2000);
            })
            .catch(() => {
                this.showNotification(i18n.get('notification.copyFailed'), 'error');
            });
    }

    speakMessageModalContent() {
        if (!this.currentModalMessage) return;
        this.toggleTextToSpeech(this.currentModalMessage, this.messageModalSpeak);
    }

    // Floating particles for empty chat
    createFloatingParticles() {
        if (!this.floatingParticles) return;
        
        const particlesContainer = this.floatingParticles;
        particlesContainer.innerHTML = '';
        
        const emojis = ['🤖', '💭', '✨', '🚀', '🧠', '💡', '🌟', '⚡'];
        const particleCount = 12;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            
            // Random position
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            const delay = Math.random() * 15;
            
            particle.style.left = `${left}%`;
            particle.style.top = `${top}%`;
            particle.style.animationDelay = `${delay}s`;
            particle.style.fontSize = `${Math.random() * 16 + 16}px`;
            
            particlesContainer.appendChild(particle);
        }
    }

    // Welcome preset handlers
    handleFileAnalysisPreset() {
        this.userInput.value = i18n.getCurrentLanguage() === 'be' 
            ? "Калі ласка, прааналізуйце прымацаваны файл і прадастаўце падрабязны аналіз яго змесціва."
            : "Пожалуйста, проанализируйте прикрепленный файл и предоставьте подробный анализ его содержимого.";
        this.userInput.focus();
        this.showNotification(i18n.get('welcome.feature.analyzeFile'), 'info');
    }

    handleProblemSolvingPreset() {
        this.userInput.value = i18n.getCurrentLanguage() === 'be'
            ? "Дапамажы вырашыць гэтую задачу. Тлумачы крок за крокам:"
            : "Помоги решить эту задачу. Объясни шаг за шагом:";
        this.userInput.focus();
        this.showNotification(i18n.get('welcome.feature.solveProblem'), 'info');
    }

    handleCodeWritingPreset() {
        this.userInput.value = i18n.getCurrentLanguage() === 'be'
            ? "Напішы код для наступнай задачы. Калі ласка, дадай каментарыі:"
            : "Напиши код для следующей задачи. Пожалуйста, добавь комментарии:";
        this.userInput.focus();
        this.showNotification(i18n.get('welcome.feature.writeCode'), 'info');
    }

    handleTranslationPreset() {
        this.userInput.value = i18n.getCurrentLanguage() === 'be'
            ? "Перакладзі наступны тэкст. Улічы кантэкст і захавай сэнс:"
            : "Переведи следующий текст. Учти контекст и сохрани смысл:";
        this.userInput.focus();
        this.showNotification(i18n.get('welcome.feature.translate'), 'info');
    }

    handleExplanationPreset() {
        this.userInput.value = i18n.getCurrentLanguage() === 'be'
            ? "Тлумачы гэтую тэму простымі словамі, як быццам тлумачыш пачаткоўцу:"
            : "Объясни эту тему простыми словами, как будто объясняешь новичку:";
        this.userInput.focus();
        this.showNotification(i18n.get('welcome.feature.explain'), 'info');
    }

    handleContentCreationPreset() {
        this.userInput.value = i18n.getCurrentLanguage() === 'be'
            ? "Дапамажы стварыць кантэнт па наступнай тэме. Улічы мэтавую аўдыторыю:"
            : "Помоги создать контент по следующей теме. Учти целевую аудиторию:";
        this.userInput.focus();
        this.showNotification(i18n.get('welcome.feature.createContent'), 'info');
    }

    // Input focus/blur handlers
    handleInputFocus() {
        this.isInputFocused = true;
        this.userInput.classList.add('dynamic-font');
        this.updateInputSize();
    }

    handleInputBlur() {
        this.isInputFocused = false;
        this.userInput.classList.remove('dynamic-font');
        this.resetInputSize();
    }

    updateInputSize() {
        const text = this.userInput.value;
        const lines = text.split('\n').length;
        const maxHeight = window.innerHeight * 0.4; // 40% of viewport height
        
        if (text.length <= 24 && lines === 1) {
            this.userInput.classList.add('dynamic-font');
            this.userInput.classList.remove('small');
        } else {
            this.userInput.classList.add('small');
        }
        
        // Auto-resize height
        this.userInput.style.height = 'auto';
        const newHeight = Math.min(this.userInput.scrollHeight, maxHeight);
        this.userInput.style.height = newHeight + 'px';
    }

    resetInputSize() {
        this.userInput.style.height = this.originalInputHeight + 'px';
        this.userInput.classList.remove('dynamic-font', 'small');
    }

    // Help modal methods
    setupHelpContent() {
        const currentModelName = this.getModelDisplayName(this.currentModel);
        
        this.helpContent.innerHTML = `
            <h1><i class="ti ti-help"></i> ${i18n.get('modal.help')}</h1>
            
            <div class="help-feature-grid">
                <div class="help-feature">
                    <i class="ti ti-message"></i>
                    <span>${i18n.get('mode.normal.name')}</span>
                </div>
                <div class="help-feature">
                    <i class="ti ti-photo"></i>
                    <span>${i18n.get('mode.image.name')}</span>
                </div>
                <div class="help-feature">
                    <i class="ti ti-microphone"></i>
                    <span>${i18n.get('mode.voice.name')}</span>
                </div>
                <div class="help-feature">
                    <i class="ti ti-file-text"></i>
                    <span>${i18n.get('welcome.feature.analyzeFile')}</span>
                </div>
            </div>

            <h2><i class="ti ti-brain"></i> ${i18n.get('sidebar.model')}: ${currentModelName}</h2>
            <p>${i18n.getCurrentLanguage() === 'be' 
                ? 'Вы можаце пераключаць мадэлі ў верхнім правым куце.' 
                : 'Вы можете переключать модели в верхнем правом углу.'}</p>
            
            <h2><i class="ti ti-messages"></i> ${i18n.get('sidebar.chats')}</h2>
            <ul>
                <li><strong>${i18n.get('sidebar.newChat')}</strong> - ${i18n.getCurrentLanguage() === 'be' 
                    ? 'націсніце "Новы чат" у меню' 
                    : 'нажмите "Новый чат" в меню'}</li>
                <li><strong>${i18n.get('modal.editChat')}</strong> - ${i18n.getCurrentLanguage() === 'be'
                    ? 'націсніце на значок алоўка побач з чатам'
                    : 'нажмите на иконку карандаша рядом с чатом'}</li>
                <li><strong>${i18n.get('footer.downloadChat')}</strong> - ${i18n.getCurrentLanguage() === 'be'
                    ? 'націсніце на значок запампоўкі для экспарту'
                    : 'нажмите на иконку загрузки для экспорта'}</li>
                <li><strong>${i18n.get('sidebar.importChat')}</strong> - ${i18n.getCurrentLanguage() === 'be'
                    ? 'загрузіце раней захаваны чат'
                    : 'загрузите ранее сохраненный чат'}</li>
                <li><strong>${i18n.get('sidebar.deleteAll')}</strong> - ${i18n.getCurrentLanguage() === 'be'
                    ? 'кнопка ўнізе меню (акрамя асноўнага)'
                    : 'кнопка внизу меню (кроме основного)'}</li>
            </ul>
            
            <h2><i class="ti ti-file"></i> ${i18n.get('welcome.feature.analyzeFile')}</h2>
            <ul>
                <li><strong>${i18n.get('mode.image.name')}</strong> - ${i18n.getCurrentLanguage() === 'be'
                    ? 'прымацуйце для аналізу тэксту і змесціва'
                    : 'прикрепите для анализа текста и содержимого'}</li>
                <li><strong>${i18n.get('welcome.feature.writeCode')}</strong> - ${i18n.getCurrentLanguage() === 'be'
                    ? 'прымацуйце для аналізу змесціва'
                    : 'прикрепите для анализа содержимого'}</li>
                <li><strong>${i18n.getCurrentLanguage() === 'be' ? 'Файлы кода' : 'Файлы кода'}</strong> - ${i18n.getCurrentLanguage() === 'be'
                    ? 'аналіз кода на розных мовах праграмавання'
                    : 'анализ кода на различных языках программирования'}</li>
                <li><strong>${i18n.getCurrentLanguage() === 'be' ? 'Максімум файлаў' : 'Максимум файлов'}</strong> - ${i18n.getCurrentLanguage() === 'be'
                    ? 'можна прымацаваць да 3 файлаў за раз'
                    : 'можно прикрепить до 3 файлов за раз'}</li>
            </ul>
            
            <h2><i class="ti ti-photo"></i> ${i18n.get('mode.image.name')}</h2>
            <ol>
                <li>${i18n.getCurrentLanguage() === 'be' ? 'Уключыце рэжым выяваў' : 'Включите режим изображений'}</li>
                <li>${i18n.getCurrentLanguage() === 'be' ? 'Апішыце што стварыць' : 'Опишите что создать'}</li>
                <li>${i18n.getCurrentLanguage() === 'be' ? 'Націсніце адправіць' : 'Нажмите отправить'}</li>
                <li>${i18n.getCurrentLanguage() === 'be' ? 'Спампуйце вынік' : 'Скачайте результат'}</li>
            </ol>
            
            <h2><i class="ti ti-microphone"></i> ${i18n.get('mode.voice.name')}</h2>
            <ul>
                <li><strong>${i18n.getCurrentLanguage() === 'be' ? 'Генерацыя голасу' : 'Генерация голоса'}</strong> - ${i18n.getCurrentLanguage() === 'be'
                    ? 'стварае аўдыё з тэксту з дапамогай ІІ'
                    : 'создает аудио из текста с помощью ИИ'}</li>
                <li><strong>${i18n.getCurrentLanguage() === 'be' ? 'Агучыць адказ' : 'Озвучить ответ'}</strong> - ${i18n.getCurrentLanguage() === 'be'
                    ? 'ўзнаўляе адказ ІІ'
                    : 'воспроизводит ответ ИИ'}</li>
                <li><strong>${i18n.getCurrentLanguage() === 'be' ? 'Спыніць агучванне' : 'Остановить озвучку'}</strong> - ${i18n.getCurrentLanguage() === 'be'
                    ? 'націсніце кнопку паўторна для спынення'
                    : 'нажмите кнопку повторно для остановки'}</li>
            </ul>

            <div class="help-actions">
                <button class="help-action-btn" onclick="khaiAssistant.startTutorial()">
                    <i class="ti ti-tournament"></i> ${i18n.get('tutorial.welcome')}
                </button>
                <button class="help-action-btn secondary" onclick="khaiAssistant.focusInput()">
                    <i class="ti ti-keyboard"></i> ${i18n.getCurrentLanguage() === 'be' ? 'Паспрабаваць зараз' : 'Попробовать сейчас'}
                </button>
            </div>
        `;
    }

    focusInput() {
        this.userInput.focus();
        this.closeHelpModal();
        this.showNotification(i18n.get('notification.inputActivated'), 'success');
    }

    showHelpModal() {
        this.setupHelpContent();
        this.helpModal.classList.add('active');
    }

    closeHelpModal() {
        this.helpModal.classList.remove('active');
    }

    // PWA Installation Handlers
    handleBeforeInstallPrompt(e) {
        e.preventDefault();
        this.deferredPrompt = e;
        this.isPWAInstalled = false;
        this.debug('PWA installation available');
        
        // Show install button in sidebar
        this.showPWAInstallButton();
    }

    handleAppInstalled() {
        this.deferredPrompt = null;
        this.isPWAInstalled = true;
        this.debug('PWA installed successfully');
        this.showNotification(i18n.get('notification.appInstalled'), 'success');
        this.hidePWAInstallButton();
        
        // Schedule welcome notification
        this.scheduleWelcomeNotification();
    }

    setupPWAInstallButton() {
        if (this.isPWAInstalled) {
            this.hidePWAInstallButton();
            return;
        }
        
        // Check if we can prompt for installation
        if (this.deferredPrompt) {
            this.showPWAInstallButton();
        }
    }

    showPWAInstallButton() {
        if (this.pwaInstallBtn) {
            this.pwaInstallBtn.style.display = 'flex';
        }
    }

    hidePWAInstallButton() {
        if (this.pwaInstallBtn) {
            this.pwaInstallBtn.style.display = 'none';
        }
    }

    // Notification scheduling
    scheduleWelcomeNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            this.setTimeout(() => {
                this.showNotification(
                    i18n.getCurrentLanguage() === 'be'
                        ? 'Сардэчна запрашаем у KHAI Assistant! Гатовы дапамагчы з любымі пытаннямі.'
                        : 'Добро пожаловать в KHAI Assistant! Готов помочь с любыми вопросами.',
                    'info'
                );
            }, 3000);
        }
    }

    scheduleInactivityNotification() {
        // Check if user hasn't visited for more than 24 hours
        const lastVisit = localStorage.getItem('khai-last-visit');
        const now = Date.now();
        
        if (lastVisit && (now - parseInt(lastVisit)) > 24 * 60 * 60 * 1000) {
            this.showNotification(i18n.get('notification.welcomeBack'), 'info');
        }
        
        localStorage.setItem('khai-last-visit', now.toString());
    }

    // Preloader methods
    hidePreloader() {
        if (this.preloader) {
            this.preloader.classList.add('fade-out');
            this.setTimeout(() => {
                if (this.preloader.parentNode) {
                    this.preloader.style.display = 'none';
                }
            }, 500);
        }
    }

    showPreloader() {
        if (this.preloader) {
            this.preloader.style.display = 'flex';
            this.preloader.classList.remove('fade-out');
        }
    }

    // 404 Page methods
    setup404Handling() {
        // Перехват навигации для SPA
        window.addEventListener('hashchange', () => {
            this.handleRouteChange();
        });
        
        window.addEventListener('popstate', () => {
            this.handleRouteChange();
        });
    }

    handleRouteChange() {
        const path = window.location.pathname + window.location.hash;
        if (path.includes('404') || !path.includes('/')) {
            this.show404Page();
        } else {
            this.hide404Page();
        }
    }

    show404Page() {
        if (this.appContainer) this.appContainer.style.display = 'none';
        if (this.page404) this.page404.style.display = 'flex';
    }

    hide404Page() {
        if (this.page404) this.page404.style.display = 'none';
        if (this.appContainer) this.appContainer.style.display = 'flex';
        window.history.replaceState(null, '', '/');
    }

    // Set current year in sidebar
    setCurrentYear() {
        const yearElement = document.getElementById('appVersionDate');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear().toString();
        }
    }

    // Sidebar search methods
    handleSidebarSearchInput() {
        const searchTerm = this.sidebarSearch.value.trim();
        if (this.sidebarSearchClear) {
            this.sidebarSearchClear.style.display = searchTerm ? 'flex' : 'none';
        }
        this.filterChatHistory();
    }

    clearSidebarSearch() {
        this.sidebarSearch.value = '';
        if (this.sidebarSearchClear) {
            this.sidebarSearchClear.style.display = 'none';
        }
        this.filterChatHistory();
    }

    debounce(id, fn, delay) {
        if (this.debounceTimers.has(id)) {
            clearTimeout(this.debounceTimers.get(id));
        }
        this.debounceTimers.set(id, setTimeout(fn, delay));
    }

    addEventListener(element, event, handler, options) {
        if (!element) return;
        
        const wrappedHandler = (...args) => {
            try {
                handler(...args);
            } catch (error) {
                console.error(`Error in ${event} handler:`, error);
                this.showNotification(i18n.get('notification.error'), 'error');
            }
        };

        element.addEventListener(event, wrappedHandler, options);
        
        if (!this.activeEventListeners.has(element)) {
            this.activeEventListeners.set(element, []);
        }
        this.activeEventListeners.get(element).push({ event, handler: wrappedHandler, options });
    }

    setTimeout(callback, delay) {
        const timeoutId = setTimeout(() => {
            this.activeTimeouts.delete(timeoutId);
            callback();
        }, delay);
        this.activeTimeouts.add(timeoutId);
        return timeoutId;
    }

    // Theme Management
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', this.currentTheme);
        
        try {
            localStorage.setItem('khai-assistant-theme', this.currentTheme);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
        
        const themeIcon = this.currentTheme === 'dark' ? 'ti-sun' : 'ti-moon';
        if (this.themeToggle) {
            this.themeToggle.innerHTML = `<i class="ti ${themeIcon}"></i>`;
        }
        
        this.showNotification(
            this.currentTheme === 'dark' ? i18n.get('theme.dark') : i18n.get('theme.light'),
            'info'
        );
    }

    loadThemePreference() {
        try {
            const savedTheme = localStorage.getItem('khai-assistant-theme');
            if (savedTheme === 'light' || savedTheme === 'dark') {
                this.currentTheme = savedTheme;
                document.body.setAttribute('data-theme', savedTheme);
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
        }
    }

    // Input Handling
    handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    handleInputChange() {
        const hasInput = this.userInput.value.trim().length > 0 || this.attachedImages.length > 0;
        
        if (this.isGenerating && hasInput) {
            this.updateSendButton(false);
        }
        
        if (this.clearInputBtn) {
            this.clearInputBtn.style.display = this.userInput.value ? 'flex' : 'none';
        }

        this.updateInputSize();
    }

    setupAutoResize() {
        // Initial height setup
        this.originalInputHeight = this.userInput.offsetHeight;
    }

    startPlaceholderAnimation() {
        let index = 0;
        let charIndex = 0;
        let isDeleting = false;

        const type = () => {
            const currentExample = this.placeholderExamples[index];
            
            if (isDeleting) {
                charIndex--;
            } else {
                charIndex++;
            }

            const currentText = currentExample.substring(0, charIndex);
            this.userInput.placeholder = currentText + '▌';

            if (!isDeleting && charIndex === currentExample.length) {
                isDeleting = true;
                this.setTimeout(() => {}, 2000);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                index = (index + 1) % this.placeholderExamples.length;
            }

            const typeSpeed = isDeleting ? 50 : 100;
            this.setTimeout(type, typeSpeed);
        };

        type();
    }

    // Message Handling
    validateInput(text) {
        if (!text || text.trim().length === 0) {
            return { valid: false, error: i18n.get('error.emptyMessage') };
        }
        
        if (text.length > this.MAX_MESSAGE_LENGTH) {
            return { 
                valid: false, 
                error: i18n.get('error.messageTooLong', { max: this.MAX_MESSAGE_LENGTH })
            };
        }

        // Check for dangerous content
        const dangerousPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /vbscript:/gi,
            /on\w+\s*=/gi
        ];

        for (const pattern of dangerousPatterns) {
            if (pattern.test(text)) {
                return { valid: false, error: i18n.get('error.dangerousContent') };
            }
        }

        return { valid: true };
    }

    async sendMessage() {
        if (this.isProcessing) {
            this.showNotification(i18n.get('notification.generationStopped'), 'warning');
            return;
        }

        const message = this.userInput.value.trim();
        const validation = this.validateInput(message);
        
        if (!validation.valid && this.attachedImages.length === 0) {
            this.showNotification(validation.error, 'error');
            return;
        }

        this.isProcessing = true;
        this.isGenerating = true;
        this.generationAborted = false;
        this.updateSendButton(true);

        try {
            if (this.isVoiceMode) {
                await this.generateVoice(message);
            } else if (this.isImageMode) {
                await this.generateImage(message);
            } else {
                await this.processUserMessage(message);
            }
        } catch (error) {
            console.error('Error in sendMessage:', error);
            this.handleError(i18n.get('error.processing'), error);
        } finally {
            if (!this.generationAborted) {
                this.isProcessing = false;
                this.isGenerating = false;
                this.updateSendButton(false);
            }
        }
    }

    handleSendButtonClick() {
        if (this.isGenerating) {
            this.stopGeneration();
        } else {
            this.sendMessage();
        }
    }

    updateSendButton(isGenerating) {
        if (isGenerating) {
            this.sendBtn.classList.add('stop-generation');
            this.sendBtn.innerHTML = '<i class="ti ti-player-stop"></i>';
            this.sendBtn.title = i18n.get('message.stopGeneration');
            
            this.inputSection.classList.add('input-disabled');
            this.userInput.disabled = true;
            this.userInput.placeholder = i18n.get('input.placeholder.generating');
        } else {
            this.sendBtn.classList.remove('stop-generation');
            this.sendBtn.innerHTML = '<i class="ti ti-send"></i>';
            this.sendBtn.title = i18n.get('message.send');
            
            this.inputSection.classList.remove('input-disabled');
            this.userInput.disabled = false;
            
            if (this.isVoiceMode) {
                this.userInput.placeholder = i18n.get('input.placeholder.voice');
            } else if (this.isImageMode) {
                this.userInput.placeholder = i18n.get('input.placeholder.image');
            } else {
                this.userInput.placeholder = i18n.get('input.placeholder');
            }
        }
    }

    stopGeneration() {
        if (this.isGenerating && this.currentStreamController) {
            this.generationAborted = true;
            this.isGenerating = false;
            this.isProcessing = false;
            
            if (this.currentStreamController.abort) {
                this.currentStreamController.abort();
            }
            
            this.removeTypingIndicator();
            this.updateSendButton(false);
            
            if (this.activeStreamingMessage) {
                const streamingElement = document.getElementById(this.activeStreamingMessage);
                if (streamingElement) {
                    const streamingText = streamingElement.querySelector('.streaming-text');
                    if (streamingText) {
                        this.finalizeStreamingMessage(this.activeStreamingMessage, streamingText.innerHTML);
                    }
                }
            }
            
            this.showNotification(i18n.get('notification.generationStopped'), 'info');
            this.currentStreamController = null;
        }
    }

    async processUserMessage(message) {
        this.lastUserMessage = {
            text: message,
            files: [...this.attachedImages]
        };
        
        this.addMessage('user', message, this.attachedImages);
        this.addToConversationHistory('user', message, this.attachedImages);
        
        this.userInput.value = '';
        this.resetInputSize();
        const filesToProcess = [...this.attachedImages];
        this.attachedImages = [];
        this.renderAttachedFiles();
        this.handleInputChange();
        
        // Update context counter
        this.updateContextCounter();
        
        // Hide welcome message after first user message
        const welcomeContent = this.messagesContainer.querySelector('.welcome-content');
        if (welcomeContent) {
            welcomeContent.classList.add('hidden');
        }
        
        // Hide floating particles when messages exist
        if (this.messagesContainer.children.length > 1) {
            this.floatingParticles.style.display = 'none';
        }
        
        await this.getAIResponse(message, filesToProcess);
    }

    async getAIResponse(userMessage, files) {
        this.removeTypingIndicator();
        this.activeTypingIndicator = this.showTypingIndicator();
        
        try {
            const prompt = await this.buildPrompt(userMessage, files);
            const response = await this.callAIService(prompt);
            
            this.removeTypingIndicator();
            await this.processAIResponse(response);
            
        } catch (error) {
            this.removeTypingIndicator();
            this.handleError(i18n.get('error.aiResponse'), error);
        }
    }

    async buildPrompt(userMessage, files) {
        if (files.length > 0) {
            const file = files[0];
            
            if (file.fileType === 'image') {
                if (typeof puter?.ai?.img2txt !== 'function') {
                    throw new Error(i18n.getCurrentLanguage() === 'be' 
                        ? 'Функцыя аналізу выяваў недаступная'
                        : 'Функция анализа изображений недоступна');
                }
                
                const extractedText = await puter.ai.img2txt(file.data);
                
                if (userMessage.trim()) {
                    return i18n.getCurrentLanguage() === 'be'
                        ? `Карыстальнік адправіў выяву "${file.name}" з суправаджальным паведамленнем: "${userMessage}"

Выдалены тэкст з выявы: "${extractedText}"

Адкажы на пытанне/паведамленне карыстальніка "${userMessage}", улічваючы змест выявы. Калі на выяве ёсць дадатковая інфармацыя (тэкст, задачы, дыяграмы і г.д.) - выкарыстай яе для поўнага адказу. Адказвай адным цэласным паведамленнем на беларускай мове.`
                        : `Пользователь отправил изображение "${file.name}" с сопроводительным сообщением: "${userMessage}"

Извлеченный текст с изображения: "${extractedText}"

Ответь на вопрос/сообщение пользователя "${userMessage}", учитывая содержание изображения. Если на изображении есть дополнительная информация (текст, задачи, диаграммы и т.д.) - используй её для полного ответа. Отвечай одним целостным сообщением на русском языке.`;
                } else {
                    return i18n.getCurrentLanguage() === 'be'
                        ? `Карыстальнік адправіў выяву "${file.name}".

Выдалены тэкст з выявы: "${extractedText}"

Прааналізуй гэтую выяву. Апішы што намалявана, асноўнае змесціва. Калі ёсць тэкст - растлумач яго значэнне. Калі гэта задача - вырашы яе. Адказвай падрабязна на беларускай мове.`
                        : `Пользователь отправил изображение "${file.name}".

Извлеченный текст с изображения: "${extractedText}"

Проанализируй это изображение. Опиши что изображено, основное содержание. Если есть текст - объясни его значение. Если это задача - реши её. Отвечай подробно на русском языке.`;
                }
            } else if (file.fileType === 'text' || file.fileType === 'code') {
                const fileContent = file.data;
                
                if (userMessage.trim()) {
                    return i18n.getCurrentLanguage() === 'be'
                        ? `Карыстальнік адправіў файл "${file.name}" з суправаджальным паведамленнем: "${userMessage}"

Змесціва файла:
"""
${fileContent}
"""

Адкажы на пытанне/паведамленне карыстальніка "${userMessage}", улічваючы змесціва прымацаванага файла. Прааналізуй змесціва і дай разгорнуты адказ на аснове прадастаўленай інфармацыі. Адказвай на беларускай мове.`
                        : `Пользователь отправил файл "${file.name}" с сопроводительным сообщением: "${userMessage}"

Содержимое файла:
"""
${fileContent}
"""

Ответь на вопрос/сообщение пользователя "${userMessage}", учитывая содержимое прикрепленного файла. Проанализируй содержимое и дай развернутый ответ на основе предоставленной информации. Отвечай на русском языке.`;
                } else {
                    return i18n.getCurrentLanguage() === 'be'
                        ? `Карыстальнік адправіў файл "${file.name}".

Змесціва файла:
"""
${fileContent}
"""

Прааналізуй змесціва гэтага файла. Сумую асноўную інфармацыю, вылучы ключавыя моманты, прапануй высновы ці рэкамендацыі на аснове прадстаўленага змесціва. Адказвай падрабязна на беларускай мове.`
                        : `Пользователь отправил файл "${file.name}".

Содержимое файла:
"""
${fileContent}
"""

Проанализируй содержимое этого файла. Суммируй основную информацию, выдели ключевые моменты, предложи выводы или рекомендации на основе представленного содержимого. Отвечай подробно на русском языке.`;
                }
            }
        } else {
            return this.buildContextPrompt(userMessage);
        }
    }

    async callAIService(prompt) {
        if (typeof puter?.ai?.chat !== 'function') {
            throw new Error(i18n.getCurrentLanguage() === 'be'
                ? 'Функцыя чата недаступная'
                : 'Функция чата недоступна');
        }
        
        const modelOptions = {
            'gpt-5-nano': { model: 'gpt-5-nano' },
            'o3-mini': { model: 'o3-mini' },
            'deepseek-chat': { model: 'deepseek-chat' },
            'deepseek-reasoner': { model: 'deepseek-reasoner' },
            'gemini-2.0-flash': { model: 'gemini-2.0-flash' },
            'grok-beta': { model: 'grok-beta' },
            'khai-model': { model: 'gpt-5-nano' } // Fallback for KHAI model
        };
        
        const options = {
            ...modelOptions[this.currentModel],
            systemPrompt: i18n.getCurrentLanguage() === 'be'
                ? "Ты карысны AI-асістэнт. Адказвай на беларускай мове зразумела і падрабязна. Падтрымлівай натуральны дыялог і ўлічвай кантэкст папярэдніх паведамленняў."
                : "Ты полезный AI-ассистент. Отвечай на русском языке понятно и подробно. Поддерживай естественный диалог и учитывай контекст предыдущих сообщений.",
            stream: true
        };
        
        return await puter.ai.chat(prompt, options);
    }

    async processAIResponse(response) {
        this.activeStreamingMessage = this.createStreamingMessage();
        this.currentStreamController = response;
        
        let fullResponse = '';
        try {
            for await (const part of response) {
                if (this.generationAborted) break;
                
                if (part?.text) {
                    fullResponse += part.text;
                    this.updateStreamingMessage(this.activeStreamingMessage, fullResponse);
                    await this.delay(10);
                }
            }
            
            if (!this.generationAborted) {
                this.finalizeStreamingMessage(this.activeStreamingMessage, fullResponse);
                this.addToConversationHistory('assistant', fullResponse);
                this.saveCurrentSession();
                this.updateMinimap();
                this.isGenerating = false;
                this.isProcessing = false;
                this.updateSendButton(false);
                
                // Update context counter
                this.updateContextCounter();
                
                // Schedule completion notification
                this.scheduleCompletionNotification();
            }
        } catch (error) {
            if (!this.generationAborted) {
                console.error('Error processing AI response:', error);
                this.handleError(i18n.get('error.aiResponse'), error);
                this.isGenerating = false;
                this.isProcessing = false;
                this.updateSendButton(false);
            }
        } finally {
            this.activeStreamingMessage = null;
            this.currentStreamController = null;
        }
    }

    scheduleCompletionNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            this.setTimeout(() => {
                this.showNotification(i18n.get('notification.aiResponseReady'), 'success');
            }, 500);
        }
    }

    delay(ms) {
        return new Promise(resolve => this.setTimeout(resolve, ms));
    }

    createStreamingMessage() {
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-ai streaming-message';
        messageElement.id = 'streaming-' + Date.now();
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content streaming-content';
        
        messageContent.innerHTML = `
            <div class="typing-indicator-inline">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                <span>${i18n.get('message.thinking')}</span>
            </div>
            <div class="streaming-text"></div>
        `;
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        return messageElement.id;
    }

    updateStreamingMessage(messageId, content) {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) return;
        
        const streamingText = messageElement.querySelector('.streaming-text');
        const typingIndicator = messageElement.querySelector('.typing-indicator-inline');
        
        if (content.length > 100 && typingIndicator && !typingIndicator.classList.contains('fade-out')) {
            typingIndicator.classList.add('fade-out');
            this.setTimeout(() => {
                if (typingIndicator.parentNode) {
                    typingIndicator.style.display = 'none';
                }
            }, 300);
        }
        
        const processedContent = this.processCodeBlocks(content);
        streamingText.innerHTML = processedContent;
        
        this.attachCopyButtons(streamingText);
        
        if (this.autoScrollEnabled) {
            this.scrollToBottom();
        }
    }

    finalizeStreamingMessage(messageId, fullContent) {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) return;
        
        messageElement.classList.remove('streaming-message');
        const messageContent = messageElement.querySelector('.message-content');
        messageContent.classList.remove('streaming-content');
        
        const typingIndicator = messageContent.querySelector('.typing-indicator-inline');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        const processedContent = this.processCodeBlocks(fullContent);
        messageContent.innerHTML = processedContent;
        
        const modelIndicator = document.createElement('div');
        modelIndicator.className = 'model-indicator';
        modelIndicator.textContent = i18n.get('message.model', { 
            name: this.getModelDisplayName(this.currentModel) 
        }) + ` • ${this.getModelDescription(this.currentModel)}`;
        messageContent.appendChild(modelIndicator);
        
        this.attachMessageHandlers(messageElement);
        this.addCodeDownloadButtons(messageElement, fullContent);
        this.scrollToBottom();
    }

    addCodeDownloadButtons(messageElement, content) {
        const codeBlocks = this.extractCodeFromMessage(content);
        if (codeBlocks.length === 0) return;

        let messageActions = messageElement.querySelector('.message-actions');
        if (!messageActions) {
            messageActions = document.createElement('div');
            messageActions.className = 'message-actions';
            messageElement.appendChild(messageActions);
        }

        const downloadCodeBtn = document.createElement('button');
        downloadCodeBtn.className = 'action-btn-small download-file-btn';
        downloadCodeBtn.innerHTML = '<i class="ti ti-code"></i> ' + i18n.get('message.downloadCode');
        downloadCodeBtn.onclick = () => this.downloadCodeBlocks(codeBlocks);
        messageActions.appendChild(downloadCodeBtn);
    }

    extractCodeFromMessage(content) {
        const codeBlocks = [];
        const codeRegex = /```(?:\w+)?\n([\s\S]*?)```/g;
        let match;
        
        while ((match = codeRegex.exec(content)) !== null) {
            codeBlocks.push(match[1].trim());
        }
        
        return codeBlocks;
    }

    downloadCodeBlocks(codeBlocks) {
        if (codeBlocks.length === 0) return;
        
        const combinedCode = codeBlocks.join('\n\n// ' + '='.repeat(50) + '\n\n');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `khai_code_${timestamp}.txt`;

        this.downloadViaBrowser(combinedCode, fileName);
        this.showNotification(i18n.get('notification.fileDownloaded', { name: 'код' }), 'success');
    }

    downloadViaBrowser(content, fileName) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        this.showNotification(i18n.get('notification.fileDownloaded', { name: fileName }), 'success');
    }

    buildContextPrompt(currentMessage) {
        const recentHistory = this.conversationHistory.slice(-6);
        
        if (recentHistory.length === 0) {
            return currentMessage;
        }

        let context = i18n.getCurrentLanguage() === 'be'
            ? "Кантэкст папярэдняй размовы:\n"
            : "Контекст предыдущего разговора:\n";
        
        recentHistory.forEach(msg => {
            const role = msg.role === 'user' 
                ? (i18n.getCurrentLanguage() === 'be' ? 'Карыстальнік' : 'Пользователь')
                : (i18n.getCurrentLanguage() === 'be' ? 'Асістэнт' : 'Ассистент');
            const content = msg.content.length > 500 ? msg.content.substring(0, 500) + '...' : msg.content;
            context += `${role}: ${content}\n`;
        });

        context += i18n.getCurrentLanguage() === 'be'
            ? `\nБягучае пытанне карыстальніка: ${currentMessage}\n\nАдкажы, улічваючы кантэкст вышэй:`
            : `\nТекущий вопрос пользователя: ${currentMessage}\n\nОтветь, учитывая контекст выше:`;

        return context;
    }

    addToConversationHistory(role, content, images = []) {
        let messageContent = content;
        
        if (images && images.length > 0) {
            const imageNames = images.map(img => img.name).join(', ');
            messageContent += i18n.getCurrentLanguage() === 'be'
                ? ` [Прымацавана выява: ${imageNames}]`
                : ` [Прикреплено изображение: ${imageNames}]`;
        }
        
        this.conversationHistory.push({
            role: role,
            content: messageContent,
            timestamp: Date.now()
        });

        if (this.conversationHistory.length > this.CONVERSATION_HISTORY_LIMIT) {
            this.conversationHistory = this.conversationHistory.slice(-25);
        }
    }

    async generateImage(prompt) {
        try {
            this.addMessage('user', `🎨 **${i18n.getCurrentLanguage() === 'be' ? 'Генерацыя выявы' : 'Генерация изображения'}:** "${prompt}"`);
            
            this.userInput.value = '';
            this.resetInputSize();
            
            // Показываем индикатор генерации изображения
            const typingId = this.showImageGenerationIndicator();
            
            if (typeof puter?.ai?.txt2img !== 'function') {
                throw new Error(i18n.getCurrentLanguage() === 'be'
                    ? 'Функцыя генерацыі выяваў недаступная'
                    : 'Функция генерации изображений недоступна');
            }
            
            this.showNotification(i18n.get('notification.generatingImage'), 'info');
            
            const imageResult = await puter.ai.txt2img(prompt, { 
                model: "gpt-image-1", 
                quality: "low" 
            });
            
            this.removeTypingIndicator(typingId);
            this.addImageMessage(prompt, imageResult);
            
            this.addToConversationHistory('user', 
                i18n.getCurrentLanguage() === 'be'
                    ? `Згенеравана выява па запыце: ${prompt}`
                    : `Сгенерировано изображение по запросу: ${prompt}`
            );
            this.saveCurrentSession();
            
        } catch (error) {
            this.removeTypingIndicator();
            this.handleError(i18n.get('error.generation'), error);
        }
    }

    showImageGenerationIndicator() {
        this.removeTypingIndicator();
        
        const typingElement = document.createElement('div');
        typingElement.className = 'message message-ai typing-indicator';
        typingElement.id = 'typing-' + Date.now();
        
        typingElement.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <span>${i18n.get('message.generatingImage')}</span>
        `;
        
        this.messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
        
        return typingElement.id;
    }

    addImageMessage(prompt, imageResult) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-ai';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        messageContent.innerHTML = `
            🎨 **${i18n.getCurrentLanguage() === 'be' ? 'Згенераваная выява па запыце' : 'Сгенерированное изображение по запросу'}:** "${this.escapeHtml(prompt)}"
            <div class="message-image" style="margin-top: 12px;">
                <img src="${imageResult.src}" alt="${i18n.getCurrentLanguage() === 'be' ? 'Згенераваная выява' : 'Сгенерированное изображение'}" loading="lazy" style="max-width: 100%; border-radius: 8px;">
            </div>
            <div class="message-actions" style="margin-top: 12px;">
                <button class="action-btn-small download-image-btn">
                    <i class="ti ti-download"></i> ${i18n.getCurrentLanguage() === 'be' ? 'Спампаваць выяву' : 'Скачать изображение'}
                </button>
            </div>
        `;
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        
        // Add download functionality
        const downloadBtn = messageContent.querySelector('.download-image-btn');
        if (downloadBtn) {
            this.addEventListener(downloadBtn, 'click', () => {
                this.downloadImage(imageResult.src, prompt);
            });
        }
        
        this.scrollToBottom();
    }

    downloadImage(imageSrc, prompt) {
        const link = document.createElement('a');
        link.href = imageSrc;
        link.download = `khai_image_${prompt.substring(0, 20).replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.png`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.showNotification(
            i18n.getCurrentLanguage() === 'be' ? 'Выява спампавана' : 'Изображение скачано', 
            'success'
        );
    }

    async generateVoice(text) {
        if (typeof puter?.ai?.txt2speech !== 'function') {
            throw new Error(i18n.getCurrentLanguage() === 'be'
                ? 'Функцыя генерацыі голасу недаступная'
                : 'Функция генерации голоса недоступна');
        }
        
        if (!text.trim()) {
            this.showNotification(i18n.get('notification.voiceNotSupported'), 'error');
            return;
        }

        try {
            this.addMessage('user', `🔊 **${i18n.getCurrentLanguage() === 'be' ? 'Генерацыя голасу' : 'Генерация голоса'}:** "${text}"`);
            
            this.userInput.value = '';
            this.resetInputSize();
            
            this.showNotification(i18n.get('notification.generatingVoice'), 'info');
            
            const audio = await puter.ai.txt2speech(text);
            this.addVoiceMessage(text, audio);
            
            this.addToConversationHistory('user', 
                i18n.getCurrentLanguage() === 'be'
                    ? `Згенераваны голас для тэксту: ${text}`
                    : `Сгенерирован голос для текста: ${text}`
            );
            this.saveCurrentSession();
            
        } catch (error) {
            this.handleError(i18n.get('error.generation'), error);
        }
    }

    addVoiceMessage(text, audio) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-ai';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        messageContent.innerHTML = `
            🔊 **${i18n.getCurrentLanguage() === 'be' ? 'Згенераваны голас для тэксту' : 'Сгенерированный голос для текста'}:** "${this.escapeHtml(text)}"
            <div class="audio-player" style="margin-top: 12px;">
                <audio controls style="width: 100%; max-width: 300px;">
                    <source src="${audio.src}" type="audio/mpeg">
                    ${i18n.getCurrentLanguage() === 'be' ? 'Ваш браўзер не падтрымлівае аўдыё элементы' : 'Ваш браузер не поддерживает аудио элементы'}
                </audio>
            </div>
        `;
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        const audioElement = messageContent.querySelector('audio');
        audioElement.play().catch(e => {
            console.log('Autoplay prevented:', e);
        });
    }

    addMessage(role, content, images = []) {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${role}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        try {
            const processedContent = this.processCodeBlocks(content);
            messageContent.innerHTML = processedContent;
        } catch {
            messageContent.textContent = content;
        }
        
        if (role === 'ai') {
            const modelIndicator = document.createElement('div');
            modelIndicator.className = 'model-indicator';
            modelIndicator.textContent = i18n.get('message.model', { 
                name: this.getModelDisplayName(this.currentModel) 
            }) + ` • ${this.getModelDescription(this.currentModel)}`;
            messageContent.appendChild(modelIndicator);
        }
        
        if (images && images.length > 0) {
            images.forEach(image => {
                if (image.fileType === 'image') {
                    const imageContainer = document.createElement('div');
                    imageContainer.className = 'message-image';
                    
                    const img = document.createElement('img');
                    img.src = image.data;
                    img.alt = image.name;
                    img.style.maxWidth = '200px';
                    img.style.borderRadius = '8px';
                    img.style.marginTop = '8px';
                    
                    imageContainer.appendChild(img);
                    messageContent.appendChild(imageContainer);
                } else if (image.fileType === 'text') {
                    const fileContainer = document.createElement('div');
                    fileContainer.className = 'attached-file';
                    fileContainer.style.marginTop = '8px';
                    fileContainer.innerHTML = `
                        <i class="ti ti-file-text"></i>
                        <span>${this.escapeHtml(image.name)} (${i18n.getCurrentLanguage() === 'be' ? 'Тэкставы файл' : 'Текстовый файл'})</span>
                    `;
                    messageContent.appendChild(fileContainer);
                }
            });
        }
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        
        this.attachMessageHandlers(messageElement);
        this.scrollToBottom();
        this.updateMinimap();
        
        return messageElement;
    }

    processCodeBlocks(content) {
        if (typeof marked === 'undefined') {
            return content;
        }
        
        let html = marked.parse(content);
        
        html = html.replace(/<pre><code class="([^"]*)">/g, (match, lang) => {
            const language = lang || 'text';
            return `
                <div class="code-header">
                    <span class="code-language">${language}</span>
                    <button class="copy-code-btn" data-language="${language}">
                        <i class="ti ti-copy"></i>
                        ${i18n.get('message.copy')}
                    </button>
                </div>
                <pre><code class="${lang}">`;
        });
        
        return html;
    }

    attachMessageHandlers(messageElement) {
        this.attachCopyButtons(messageElement);
        
        if (messageElement.classList.contains('message-ai')) {
            this.attachSpeakButton(messageElement);
            this.attachMessageActionButtons(messageElement);
            
            const messageContent = messageElement.querySelector('.message-content');
            if (messageContent) {
                const content = messageContent.textContent || '';
                this.addCodeDownloadButtons(messageElement, content);
            }
        }
    }

    attachMessageActionButtons(messageElement) {
        const messageContent = messageElement.querySelector('.message-content');
        const plainText = this.extractPlainText(messageContent.innerHTML);
        
        // Проверяем, является ли сообщение приветственным
        const isWelcomeMessage = plainText.includes(i18n.get('welcome.title')) || 
                                plainText.includes('Основные возможности:') ||
                                plainText.includes('Асноўныя магчымасці:');
        
        let actionsContainer = messageElement.querySelector('.message-actions');
        if (!actionsContainer) {
            actionsContainer = document.createElement('div');
            actionsContainer.className = 'message-actions';
            messageElement.appendChild(actionsContainer);
        }

        // Clear existing action buttons (except speak)
        const existingButtons = actionsContainer.querySelectorAll('.action-btn-small:not(.speak-btn)');
        existingButtons.forEach(btn => btn.remove());

        // Regenerate button - не показываем для приветственного сообщения
        if (!isWelcomeMessage) {
            const regenerateBtn = document.createElement('button');
            regenerateBtn.className = 'action-btn-small';
            regenerateBtn.innerHTML = '<i class="ti ti-refresh"></i> ' + i18n.get('message.regenerate');
            regenerateBtn.onclick = () => this.regenerateMessage(messageElement);
            actionsContainer.appendChild(regenerateBtn);
        }

        // Download button
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'action-btn-small';
        downloadBtn.innerHTML = '<i class="ti ti-download"></i> ' + i18n.get('message.download');
        downloadBtn.onclick = () => this.downloadMessage(plainText);
        actionsContainer.appendChild(downloadBtn);

        // Share button
        if (navigator.share) {
            const shareBtn = document.createElement('button');
            shareBtn.className = 'action-btn-small';
            shareBtn.innerHTML = '<i class="ti ti-share"></i> ' + i18n.get('message.share');
            shareBtn.onclick = () => this.shareMessage(plainText);
            actionsContainer.appendChild(shareBtn);
        }
    }

    regenerateMessage(messageElement) {
        const previousMessages = Array.from(this.messagesContainer.querySelectorAll('.message-user'))
            .map(msg => this.extractPlainText(msg.querySelector('.message-content').innerHTML))
            .filter(msg => msg.trim().length > 0);
        
        if (previousMessages.length > 0) {
            const lastUserMessage = previousMessages[previousMessages.length - 1];
            messageElement.remove();
            this.userInput.value = lastUserMessage;
            this.sendMessage();
        }
    }

    downloadMessage(content) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `khai_message_${timestamp}.txt`;
        this.downloadViaBrowser(content, fileName);
    }

    async shareMessage(content) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: i18n.getCurrentLanguage() === 'be' 
                        ? 'Паведамленне ад KHAI Assistant' 
                        : 'Сообщение от KHAI Assistant',
                    text: content
                });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    this.showNotification(i18n.get('notification.error'), 'error');
                }
            }
        }
    }

    attachCopyButtons(container) {
        const copyButtons = container.querySelectorAll('.copy-code-btn');
        copyButtons.forEach(btn => {
            this.addEventListener(btn, 'click', async (e) => {
                const codeBlock = e.target.closest('.code-header')?.nextElementSibling;
                if (codeBlock) {
                    const code = codeBlock.textContent;
                    try {
                        await navigator.clipboard.writeText(code);
                        
                        const originalText = btn.innerHTML;
                        btn.innerHTML = '<i class="ti ti-check"></i> ' + i18n.get('message.copied');
                        btn.classList.add('copied');
                        
                        this.setTimeout(() => {
                            btn.innerHTML = originalText;
                            btn.classList.remove('copied');
                        }, 2000);
                        
                        this.showNotification(i18n.get('notification.codeCopied'), 'success');
                    } catch (err) {
                        console.error('Failed to copy code:', err);
                        this.showNotification(i18n.get('notification.copyFailed'), 'error');
                    }
                }
            });
        });
    }

    attachSpeakButton(messageElement) {
        const messageContent = messageElement.querySelector('.message-content');
        const plainText = this.extractPlainText(messageContent.textContent || '');
        
        if (plainText.trim().length < 10) return;
        
        let actionsContainer = messageElement.querySelector('.message-actions');
        if (!actionsContainer) {
            actionsContainer = document.createElement('div');
            actionsContainer.className = 'message-actions';
            messageElement.appendChild(actionsContainer);
        }
        
        const existingSpeakBtn = actionsContainer.querySelector('.speak-btn');
        if (existingSpeakBtn) {
            existingSpeakBtn.remove();
        }
        
        const speakButton = document.createElement('button');
        speakButton.className = 'action-btn-small speak-btn';
        speakButton.innerHTML = '<i class="ti ti-speakerphone"></i> ' + i18n.get('message.speak');
        speakButton.setAttribute('data-text', plainText);
        
        this.addEventListener(speakButton, 'click', (e) => {
            e.stopPropagation();
            const text = e.currentTarget.getAttribute('data-text');
            this.toggleTextToSpeech(text, speakButton);
        });
        
        actionsContainer.appendChild(speakButton);
    }

    extractPlainText(htmlText) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlText;
        return tempDiv.textContent || tempDiv.innerText || '';
    }

    toggleTextToSpeech(text, button) {
        if (this.isSpeaking) {
            this.stopSpeech();
            button.classList.remove('speaking');
            button.innerHTML = '<i class="ti ti-speakerphone"></i> ' + i18n.get('message.speak');
            this.showNotification(i18n.get('notification.audioStopped'), 'info');
        } else {
            this.speakText(text, button);
        }
    }

    speakText(text, button) {
        if (!('speechSynthesis' in window)) {
            this.showNotification(i18n.get('error.audioNotSupported'), 'warning');
            return;
        }

        try {
            this.stopSpeech();

            this.currentUtterance = new SpeechSynthesisUtterance(text);
            this.currentUtterance.lang = i18n.getCurrentLanguage() === 'be' ? 'be-BY' : 'ru-RU';
            this.currentUtterance.rate = 0.85;
            this.currentUtterance.pitch = 1.0;
            this.currentUtterance.volume = 1.0;

            const voices = speechSynthesis.getVoices();
            const targetVoice = voices.find(voice => 
                voice.lang.includes(i18n.getCurrentLanguage() === 'be' ? 'be' : 'ru')
            );
            
            if (targetVoice) {
                this.currentUtterance.voice = targetVoice;
                this.currentUtterance.rate = 0.8;
            }

            button.classList.add('speaking');
            button.innerHTML = '<i class="ti ti-player-pause"></i> ' + i18n.get('message.stopSpeaking');
            this.isSpeaking = true;

            this.currentUtterance.onend = () => {
                this.isSpeaking = false;
                button.classList.remove('speaking');
                button.innerHTML = '<i class="ti ti-speakerphone"></i> ' + i18n.get('message.speak');
            };

            this.currentUtterance.onerror = (error) => {
                console.error('Speech synthesis error:', error);
                this.isSpeaking = false;
                button.classList.remove('speaking');
                button.innerHTML = '<i class="ti ti-speakerphone"></i> ' + i18n.get('message.speak');
                this.showNotification(i18n.get('error.audio'), 'error');
            };

            speechSynthesis.speak(this.currentUtterance);
            this.showNotification(i18n.getCurrentLanguage() === 'be' 
                ? 'Агучванне тэксту...' 
                : 'Озвучивание текста...', 'info');

        } catch (error) {
            console.error('Error speaking text:', error);
            this.showNotification(i18n.get('error.audio'), 'error');
        }
    }

    stopSpeech() {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
        this.isSpeaking = false;
        this.currentUtterance = null;
    }

    showTypingIndicator() {
        this.removeTypingIndicator();
        
        const typingElement = document.createElement('div');
        typingElement.className = 'message message-ai typing-indicator';
        typingElement.id = 'typing-' + Date.now();
        
        typingElement.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <span>${i18n.get('message.thinking')}</span>
        `;
        
        this.messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
        
        return typingElement.id;
    }

    removeTypingIndicator(typingId = null) {
        if (typingId) {
            const element = document.getElementById(typingId);
            if (element) element.remove();
        } else {
            const typingElements = this.messagesContainer.querySelectorAll('.typing-indicator');
            typingElements.forEach(el => el.remove());
            this.activeTypingIndicator = null;
        }
    }

    // Chat Management
    setupChatSelector() {
        if (!this.chatSessions.has('default')) {
            this.createDefaultChat();
        }
        this.updateChatList();
    }

    createDefaultChat() {
        const defaultSession = {
            id: 'default',
            name: i18n.get('footer.currentChat'),
            messages: [],
            conversationHistory: [],
            createdAt: Date.now(),
            lastActivity: Date.now()
        };
        this.chatSessions.set('default', defaultSession);
        this.currentChatId = 'default';
        this.saveChatSessions();
    }

    toggleSidebar() {
        this.sidebarMenu.classList.toggle('active');
        this.sidebarOverlay.classList.toggle('active');
        if (this.sidebarMenu.classList.contains('active')) {
            this.updateChatList();
            this.updateModelInfo();
            this.updateConnectionStatus();
        }
    }

    closeSidebar() {
        this.sidebarMenu.classList.remove('active');
        this.sidebarOverlay.classList.remove('active');
    }

    updateChatList() {
        if (!this.chatList) return;
        
        this.chatList.innerHTML = '';

        const sessionsArray = Array.from(this.chatSessions.entries())
            .sort(([,a], [,b]) => b.lastActivity - a.lastActivity);

        if (sessionsArray.length === 0) {
            this.createDefaultChat();
            this.updateChatList();
            return;
        }

        sessionsArray.forEach(([id, session]) => {
            const chatItem = this.createChatItem(id, session);
            this.chatList.appendChild(chatItem);
        });
    }

    createChatItem(id, session) {
        const displayName = session.name.length > this.MAX_CHAT_NAME_LENGTH 
            ? session.name.substring(0, this.MAX_CHAT_NAME_LENGTH) + '...' 
            : session.name;
            
        const chatItem = document.createElement('div');
        chatItem.className = `chat-item ${id === this.currentChatId ? 'active' : ''}`;
        chatItem.setAttribute('data-chat-id', id);
        
        chatItem.innerHTML = `
            <div class="chat-item-content">
                <div class="chat-item-title">${this.escapeHtml(displayName)}</div>
                <div class="chat-item-preview">${this.getChatPreview(session)}</div>
            </div>
            <div class="chat-item-actions">
                <button class="chat-item-action download-chat" title="${i18n.get('footer.downloadChat')}">
                    <i class="ti ti-download"></i>
                </button>
                <button class="chat-item-action edit" title="${i18n.get('modal.editChat')}">
                    <i class="ti ti-pencil"></i>
                </button>
                ${id !== 'default' ? `<button class="chat-item-action delete" title="${i18n.get('modal.delete')}"><i class="ti ti-trash"></i></button>` : ''}
            </div>
        `;

        this.addEventListener(chatItem, 'click', (e) => {
            if (!e.target.closest('.chat-item-action')) {
                this.switchChat(id);
                this.closeSidebar();
            }
        });

        const downloadBtn = chatItem.querySelector('.download-chat');
        if (downloadBtn) {
            this.addEventListener(downloadBtn, 'click', (e) => {
                e.stopPropagation();
                this.downloadChat(id);
            });
        }

        const editBtn = chatItem.querySelector('.edit');
        if (editBtn) {
            this.addEventListener(editBtn, 'click', (e) => {
                e.stopPropagation();
                this.openEditChatModal(id, session.name);
            });
        }

        const deleteBtn = chatItem.querySelector('.delete');
        if (deleteBtn) {
            this.addEventListener(deleteBtn, 'click', (e) => {
                e.stopPropagation();
                this.deleteChat(id);
            });
        }

        return chatItem;
    }

    getChatPreview(session) {
        if (session.conversationHistory && session.conversationHistory.length > 0) {
            const lastMessage = session.conversationHistory[session.conversationHistory.length - 1];
            const preview = lastMessage.content.substring(0, 50);
            return preview + (lastMessage.content.length > 50 ? '...' : '');
        }
        return i18n.getCurrentLanguage() === 'be' ? 'Няма паведамленняў' : 'Нет сообщений';
    }

    downloadChat(chatId) {
        const session = this.chatSessions.get(chatId);
        if (!session || session.messages.length === 0) {
            this.showNotification(i18n.get('notification.noDataToDownload'), 'warning');
            return;
        }

        const chatData = {
            version: '1.0',
            name: session.name,
            exportedAt: new Date().toISOString(),
            model: this.currentModel,
            messages: session.messages,
            conversationHistory: session.conversationHistory
        };

        const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khai-chat-${session.name}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification(i18n.get('notification.chatDownloaded'), 'success');
    }

    downloadCurrentChat() {
        this.downloadChat(this.currentChatId);
    }

    deleteAllChats() {
        if (this.chatSessions.size <= 1) {
            this.showNotification(i18n.get('notification.noChatsToDelete'), 'warning');
            return;
        }

        if (confirm(i18n.get('modal.confirmDeleteAll'))) {
            const sessionsToDelete = Array.from(this.chatSessions.entries())
                .filter(([id]) => id !== 'default');
            
            sessionsToDelete.forEach(([id]) => {
                this.chatSessions.delete(id);
            });
            
            if (this.currentChatId !== 'default') {
                this.switchChat('default');
            }
            
            this.saveChatSessions();
            this.updateChatList();
            this.showNotification(i18n.get('notification.allChatsDeleted'), 'success');
        }
    }

    createNewChat() {
        const chatNumber = Array.from(this.chatSessions.values()).filter(session => 
            session.name.startsWith(i18n.getCurrentLanguage() === 'be' ? 'Чат ' : 'Чат ')
        ).length + 1;
        
        const chatName = `${i18n.getCurrentLanguage() === 'be' ? 'Чат' : 'Чат'} ${chatNumber}`;
        const chatId = this.createChatSession(chatName);
        this.switchChat(chatId);
        this.closeSidebar();
        this.showNotification(i18n.get('notification.chatCreated', { name: chatName }), 'success');
    }

    createChatSession(name = 'Новый чат') {
        const chatId = 'chat-' + Date.now();
        const session = {
            id: chatId,
            name: name,
            messages: [],
            conversationHistory: [],
            createdAt: Date.now(),
            lastActivity: Date.now()
        };
        
        this.chatSessions.set(chatId, session);
        this.saveChatSessions();
        this.updateChatList();
        
        return chatId;
    }

    switchChat(chatId) {
        if (!this.chatSessions.has(chatId) || chatId === this.currentChatId) {
            return;
        }

        try {
            this.saveCurrentSession();
            
            this.currentChatId = chatId;
            const session = this.chatSessions.get(chatId);
            
            session.lastActivity = Date.now();
            this.chatSessions.set(chatId, session);
            
            this.updateCurrentChatName();
            this.loadSession(session);
            this.showNotification(i18n.get('notification.chatSwitched', { name: session.name }), 'info');
            
            // Reset context warning for new chat
            this.contextWarningShown = false;
            this.updateContextCounter();
            
            this.saveChatSessions();
        } catch (error) {
            console.error('Error switching chat:', error);
            this.showNotification(i18n.get('error.switchingChat'), 'error');
        }
    }

    deleteChat(chatId) {
        if (chatId === 'default') {
            this.showNotification(i18n.get('notification.cannotDeleteDefault'), 'warning');
            return;
        }

        if (this.chatSessions.size <= 1) {
            this.showNotification(i18n.get('notification.cannotDeleteLastChat'), 'warning');
            return;
        }

        const session = this.chatSessions.get(chatId);
        if (!session) return;

        if (confirm(i18n.get('modal.confirmDelete', { name: session.name }))) {
            this.chatSessions.delete(chatId);
            
            if (this.currentChatId === chatId) {
                this.switchChat('default');
            }
            
            this.saveChatSessions();
            this.updateChatList();
            this.showNotification(i18n.get('notification.chatDeleted'), 'success');
        }
    }

    openEditChatModal(chatId, currentName) {
        this.editingChatId = chatId;
        this.editChatNameInput.value = currentName;
        this.editChatModal.classList.add('active');
        this.handleModalInputChange();
        
        this.setTimeout(() => {
            this.editChatNameInput.focus();
            this.editChatNameInput.select();
        }, 100);
    }

    handleModalInputChange() {
        const hasText = this.editChatNameInput.value.trim().length > 0;
        if (this.modalClearInput) {
            this.modalClearInput.style.display = hasText ? 'flex' : 'none';
        }
    }

    clearModalInput() {
        this.editChatNameInput.value = '';
        this.editChatNameInput.focus();
        this.handleModalInputChange();
    }

    closeEditChatModal() {
        this.editingChatId = null;
        this.editChatNameInput.value = '';
        if (this.modalClearInput) {
            this.modalClearInput.style.display = 'none';
        }
        this.editChatModal.classList.remove('active');
    }

    saveChatName() {
        if (!this.editingChatId) return;
        
        const newName = this.editChatNameInput.value.trim();
        if (!newName) {
            this.showNotification(i18n.get('modal.chatNameEmpty'), 'error');
            return;
        }

        if (newName.length > this.MAX_CHAT_NAME_LENGTH) {
            this.showNotification(i18n.get('modal.chatNameTooLong', { max: this.MAX_CHAT_NAME_LENGTH }), 'error');
            return;
        }

        const session = this.chatSessions.get(this.editingChatId);
        if (session) {
            session.name = newName;
            this.chatSessions.set(this.editingChatId, session);
            this.saveChatSessions();
            this.updateChatList();
            
            if (this.currentChatId === this.editingChatId) {
                this.updateCurrentChatName();
            }
            
            this.showNotification(i18n.get('notification.chatRenamed'), 'success');
        }
        
        this.closeEditChatModal();
    }

    updateCurrentChatName() {
        if (this.currentChatName) {
            const session = this.chatSessions.get(this.currentChatId);
            if (session) {
                const displayName = session.name.length > this.MAX_CHAT_NAME_LENGTH 
                    ? session.name.substring(0, this.MAX_CHAT_NAME_LENGTH) + '...' 
                    : session.name;
                this.currentChatName.textContent = displayName;
            }
        }
    }

    saveCurrentSession() {
        try {
            const messages = [];
            if (this.messagesContainer) {
                this.messagesContainer.querySelectorAll('.message').forEach(message => {
                    if (message.classList.contains('typing-indicator') || 
                        message.classList.contains('streaming-message')) return;
                    
                    const role = message.classList.contains('message-user') ? 'user' : 
                               message.classList.contains('message-error') ? 'error' : 'ai';
                    
                    const content = message.querySelector('.message-content')?.innerHTML || '';
                    if (content) {
                        messages.push({ role, content });
                    }
                });
            }
            
            const session = this.chatSessions.get(this.currentChatId);
            if (session) {
                session.messages = messages;
                session.conversationHistory = [...this.conversationHistory];
                session.lastActivity = Date.now();
                this.chatSessions.set(this.currentChatId, session);
                this.saveChatSessions();
            }
        } catch (error) {
            console.error('Error saving current session:', error);
        }
    }

    loadCurrentSession() {
        const session = this.chatSessions.get(this.currentChatId);
        if (session) {
            this.loadSession(session);
        } else {
            this.showWelcomeMessage();
        }
    }

    loadSession(session) {
        if (!this.messagesContainer) return;
        
        // Remove skeleton loaders
        const skeletons = this.messagesContainer.querySelectorAll('.message-skeleton');
        skeletons.forEach(skeleton => skeleton.remove());
        
        this.messagesContainer.innerHTML = '';
        this.conversationHistory = session.conversationHistory || [];
        
        if (session.messages && session.messages.length > 0) {
            session.messages.forEach(msg => {
                this.renderMessage(msg.role, msg.content);
            });
            
            // Hide floating particles when messages exist
            this.floatingParticles.style.display = 'none';
        } else {
            this.showWelcomeMessage();
        }
        
        // Update context counter
        this.updateContextCounter();
        
        this.scrollToBottom();
        this.updateMinimap();
    }

    renderMessage(role, content) {
        if (!this.messagesContainer) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${role}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = content;
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        
        this.attachMessageHandlers(messageElement);
    }

    saveChatSessions() {
        try {
            const sessions = Array.from(this.chatSessions.entries());
            const sessionsData = sessions.map(([id, session]) => [
                id,
                {
                    ...session,
                    // Ensure all required fields are present
                    messages: session.messages || [],
                    conversationHistory: session.conversationHistory || [],
                    createdAt: session.createdAt || Date.now(),
                    lastActivity: session.lastActivity || Date.now()
                }
            ]);
            localStorage.setItem('khai-assistant-chat-sessions', JSON.stringify(sessionsData));
            this.debug('Chat sessions saved:', sessionsData.length);
        } catch (error) {
            console.error('Error saving chat sessions:', error);
        }
    }

    loadChatSessions() {
        try {
            const saved = localStorage.getItem('khai-assistant-chat-sessions');
            if (saved) {
                const sessions = JSON.parse(saved);
                // Validate and migrate old sessions
                const validatedSessions = sessions.map(([id, session]) => {
                    // Ensure session has all required fields
                    return [
                        id,
                        {
                            id: session.id || id,
                            name: session.name || (i18n.getCurrentLanguage() === 'be' ? 'Безназоўны чат' : 'Безымянный чат'),
                            messages: session.messages || [],
                            conversationHistory: session.conversationHistory || [],
                            createdAt: session.createdAt || Date.now(),
                            lastActivity: session.lastActivity || Date.now()
                        }
                    ];
                });
                this.chatSessions = new Map(validatedSessions);
                this.debug('Chat sessions loaded:', this.chatSessions.size);
            } else {
                this.debug('No saved chat sessions found');
            }
        } catch (error) {
            console.error('Error loading chat sessions:', error);
            // Create default session if loading fails
            this.createDefaultChat();
        }
    }

    // File Management
    async handleFileSelect(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        let processedCount = 0;

        for (const file of files) {
            if (processedCount >= this.MAX_FILES) {
                this.showNotification(i18n.get('notification.maxFilesReached', { count: this.MAX_FILES }), 'warning');
                break;
            }

            try {
                const fileType = this.getFileType(file);
                
                if (fileType === 'image') {
                    if (file.size > this.MAX_IMAGE_SIZE) {
                        this.showNotification(i18n.get('notification.fileTooLarge', { 
                            name: file.name, 
                            size: '5MB' 
                        }), 'error');
                        continue;
                    }
                    const imageData = await this.processImageFile(file);
                    this.attachedImages.push(imageData);
                    this.showNotification(i18n.get('notification.imageAttached', { name: file.name }), 'success');
                    processedCount++;
                } else if (fileType === 'text' || fileType === 'code') {
                    const textData = await this.processTextFile(file);
                    this.attachedImages.push(textData);
                    this.showNotification(i18n.get('notification.fileAttached', { name: file.name }), 'success');
                    processedCount++;
                } else {
                    this.showNotification(i18n.get('notification.unsupportedFormat', { name: file.name }), 'error');
                }
            } catch (error) {
                console.error('Error processing file:', error);
                this.showNotification(i18n.get('error.processing') + `: ${file.name}`, 'error');
            }
        }

        this.renderAttachedFiles();
        event.target.value = '';
        this.handleInputChange();
    }

    getFileType(file) {
        const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const textTypes = [
            'text/plain', 
            'text/html', 
            'text/css', 
            'text/javascript',
            'application/javascript',
            'application/json',
            'text/markdown',
            'text/x-python',
            'application/x-python-code',
            'text/x-java',
            'text/x-c++src',
            'text/x-c',
            'text/x-csharp',
            'text/x-php',
            'text/x-ruby',
            'text/x-go',
            'text/x-swift',
            'text/x-kotlin',
            'text/x-scala',
            'text/x-rust',
            'application/xml',
            'text/xml',
            'text/csv',
            'text/yaml',
            'text/x-yaml',
            'application/yaml'
        ];
        
        if (imageTypes.includes(file.type)) {
            return 'image';
        } else if (textTypes.includes(file.type) || file.name.match(/\.(txt|md|html|css|js|json|py|java|cpp|c|cs|php|rb|go|swift|kt|scala|rs|xml|csv|yaml|yml)$/i)) {
            return file.name.match(/\.(py|java|cpp|c|cs|php|rb|go|swift|kt|scala|rs)$/i) ? 'code' : 'text';
        }
        
        return null;
    }

    processImageFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    name: file.name,
                    data: e.target.result,
                    type: file.type,
                    size: file.size,
                    fileType: 'image'
                });
            };
            reader.onerror = () => reject(new Error(i18n.get('error.processing') + `: ${file.name}`));
            reader.readAsDataURL(file);
        });
    }

    processTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const fileType = file.name.match(/\.(py|java|cpp|c|cs|php|rb|go|swift|kt|scala|rs)$/i) ? 'code' : 'text';
                
                resolve({
                    name: file.name,
                    data: e.target.result,
                    type: file.type,
                    size: file.size,
                    fileType: fileType
                });
            };
            reader.onerror = () => reject(new Error(i18n.get('error.processing') + `: ${file.name}`));
            reader.readAsText(file);
        });
    }

    renderAttachedFiles() {
        if (!this.attachedFiles) return;
        
        this.attachedFiles.innerHTML = '';
        
        if (this.attachedImages.length === 0) {
            this.attachedFiles.style.display = 'none';
            return;
        }

        this.attachedFiles.style.display = 'flex';
        
        this.attachedImages.forEach((file, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            
            const icon = file.fileType === 'image' ? 'ti-photo' : 
                        file.fileType === 'code' ? 'ti-code' : 'ti-file-text';
            const typeLabel = file.fileType === 'image' 
                ? (i18n.getCurrentLanguage() === 'be' ? 'Выява' : 'Изображение')
                : file.fileType === 'code' 
                    ? (i18n.getCurrentLanguage() === 'be' ? 'Файл кода' : 'Файл кода')
                    : (i18n.getCurrentLanguage() === 'be' ? 'Тэкставы файл' : 'Текстовый файл');
            
            fileElement.innerHTML = `
                <i class="ti ${icon}"></i>
                <span>${this.escapeHtml(file.name)} (${typeLabel}, ${this.formatFileSize(file.size)})</span>
                <button class="remove-file-btn" data-index="${index}">
                    <i class="ti ti-x"></i>
                </button>
            `;
            this.attachedFiles.appendChild(fileElement);
        });

        this.attachedFiles.querySelectorAll('.remove-file-btn').forEach(btn => {
            this.addEventListener(btn, 'click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                this.removeAttachedFile(index);
            });
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    removeAttachedFile(index) {
        if (index < 0 || index >= this.attachedImages.length) return;
        
        const removedFile = this.attachedImages.splice(index, 1)[0];
        this.renderAttachedFiles();
        this.showNotification(
            i18n.get('notification.fileRemoved', { 
                name: removedFile.name 
            }), 
            'info'
        );
        this.handleInputChange();
    }

    // Minimap
    setupMinimapScroll() {
        this.addEventListener(this.messagesContainer, 'scroll', () => {
            this.updateMinimapViewport();
        });
    }

    updateMinimap() {
        if (!this.minimapContent || !this.messagesContainer) return;
        
        this.minimapContent.innerHTML = '';
        const messages = this.messagesContainer.querySelectorAll('.message:not(.typing-indicator):not(.streaming-message)');
        
        if (messages.length === 0) return;
        
        const containerHeight = this.messagesContainer.scrollHeight;
        const viewportHeight = this.messagesContainer.clientHeight;
        
        // Calculate accurate heights for minimap
        messages.forEach((message, index) => {
            const block = document.createElement('div');
            block.className = `minimap-message ${message.classList.contains('message-user') ? 'user' : 'ai'}`;
            block.dataset.index = index;
            
            // Calculate relative height based on actual content height
            const messageHeight = message.offsetHeight;
            const relativeHeight = Math.max((messageHeight / containerHeight) * 100, 2); // Minimum 2%
            block.style.height = `${relativeHeight}%`;
            
            block.addEventListener('click', () => this.scrollToMessage(index));
            this.minimapContent.appendChild(block);
        });
        
        this.updateMinimapViewport();
    }

    updateMinimapViewport() {
        if (!this.minimapViewport || !this.chatMinimap || !this.messagesContainer) return;
        
        const container = this.messagesContainer;
        const containerHeight = container.scrollHeight;
        const visibleHeight = container.clientHeight;
        const scrollTop = container.scrollTop;
        
        if (containerHeight === 0) return;
        
        const viewportHeight = (visibleHeight / containerHeight) * 100;
        const viewportTop = (scrollTop / containerHeight) * 100;
        
        this.minimapViewport.style.height = `${Math.max(viewportHeight, 5)}%`;
        this.minimapViewport.style.top = `${viewportTop}%`;
    }

    scrollToMessage(index) {
        const messages = this.messagesContainer.querySelectorAll('.message:not(.typing-indicator):not(.streaming-message)');
        if (messages[index]) {
            messages[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Search
    handleSearchInput() {
        const searchTerm = this.headerSearch.value.trim();
        if (searchTerm) {
            if (this.headerSearchClear) {
                this.headerSearchClear.style.display = 'flex';
            }
            this.highlightSearchTerms(searchTerm);
        } else {
            if (this.headerSearchClear) {
                this.headerSearchClear.style.display = 'none';
            }
            this.clearSearchHighlights();
        }
    }

    highlightSearchTerms(term) {
        if (!this.messagesContainer) return;
        
        const messages = this.messagesContainer.querySelectorAll('.message');
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedTerm, 'gi');
        
        let hasMatches = false;
        
        messages.forEach(message => {
            const messageText = message.textContent || '';
            const hasMatch = regex.test(messageText);
            
            if (hasMatch) {
                message.classList.add('search-visible');
                message.classList.remove('search-hidden');
                hasMatches = true;
                
                // Highlight text in visible messages
                const messageContent = message.querySelector('.message-content');
                if (messageContent) {
                    const originalContent = messageContent.dataset.originalContent || messageContent.innerHTML;
                    messageContent.dataset.originalContent = originalContent;
                    
                    const highlightedContent = originalContent.replace(regex, match => 
                        `<span class="search-highlight">${match}</span>`
                    );
                    
                    messageContent.innerHTML = highlightedContent;
                }
            } else {
                message.classList.add('search-hidden');
                message.classList.remove('search-visible');
            }
        });

        // Update minimap highlights
        if (this.minimapContent) {
            const minimapMessages = this.minimapContent.querySelectorAll('.minimap-message');
            const messageElements = this.messagesContainer.querySelectorAll('.message');
            
            minimapMessages.forEach((msg, index) => {
                const messageElement = messageElements[index];
                if (messageElement) {
                    if (messageElement.classList.contains('search-visible')) {
                        msg.classList.add('search-highlighted');
                    } else {
                        msg.classList.remove('search-highlighted');
                    }
                }
            });
        }
        
        if (!hasMatches && term) {
            this.showNotification(i18n.get('notification.noMessagesFound'), 'warning');
        }
    }

    clearSearchHighlights() {
        if (!this.messagesContainer) return;
        
        const messages = this.messagesContainer.querySelectorAll('.message');
        
        messages.forEach(message => {
            message.classList.remove('search-hidden', 'search-visible');
            
            const messageContent = message.querySelector('.message-content');
            if (messageContent && messageContent.dataset.originalContent) {
                messageContent.innerHTML = messageContent.dataset.originalContent;
                delete messageContent.dataset.originalContent;
            }
        });

        if (this.minimapContent) {
            const minimapMessages = this.minimapContent.querySelectorAll('.minimap-message');
            minimapMessages.forEach(msg => msg.classList.remove('search-highlighted'));
        }
    }

    clearSearch() {
        this.headerSearch.value = '';
        if (this.headerSearchClear) {
            this.headerSearchClear.style.display = 'none';
        }
        this.clearSearchHighlights();
    }

    filterChatHistory() {
        const searchTerm = this.sidebarSearch.value.toLowerCase().trim();
        const chatItems = this.chatList.querySelectorAll('.chat-item');
        
        chatItems.forEach(item => {
            const title = item.querySelector('.chat-item-title').textContent.toLowerCase();
            const preview = item.querySelector('.chat-item-preview').textContent.toLowerCase();
            
            if (searchTerm === '' || title.includes(searchTerm) || preview.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Model Management
    updateModelList() {
        if (!this.modelList) return;
        
        this.modelList.innerHTML = '';
        
        Object.entries(this.modelConfig).forEach(([modelId, config]) => {
            const modelItem = document.createElement('div');
            modelItem.className = `model-item ${modelId === this.currentModel ? 'selected' : ''} ${!config.available ? 'disabled' : ''}`;
            modelItem.dataset.model = modelId;
            
            if (!config.available) {
                modelItem.style.opacity = '0.6';
                modelItem.style.pointerEvents = 'none';
            }
            
            modelItem.innerHTML = `
                <div class="model-item-header">
                    <span class="model-name">${config.name}</span>
                    <span class="model-status ${config.available ? 'available' : 'coming-soon'}">
                        ${config.available ? i18n.get('modal.modelAvailable') : i18n.get('modal.modelComingSoon')}
                    </span>
                </div>
                <div class="model-description">${config.description}</div>
            `;
            
            if (config.available) {
                this.addEventListener(modelItem, 'click', () => this.handleModelItemClick({ target: modelItem }));
            }
            
            this.modelList.appendChild(modelItem);
        });
    }

    openModelModal() {
        this.modelModalOverlay.classList.add('active');
        const currentModelItem = this.modelList.querySelector(`[data-model="${this.currentModel}"]`);
        if (currentModelItem) {
            currentModelItem.classList.add('selected');
        }
    }

    closeModelModal() {
        this.modelModalOverlay.classList.remove('active');
    }

    handleModelItemClick(e) {
        const modelItem = e.target.closest('.model-item');
        if (modelItem && !modelItem.classList.contains('disabled')) {
            this.modelList.querySelectorAll('.model-item').forEach(item => {
                item.classList.remove('selected');
            });
            modelItem.classList.add('selected');
        }
    }

    confirmModelSelection() {
        const selectedModelItem = this.modelList.querySelector('.model-item.selected');
        if (selectedModelItem) {
            const newModel = selectedModelItem.dataset.model;
            if (newModel !== this.currentModel) {
                this.currentModel = newModel;
                this.showNotification(i18n.get('notification.modelChanged', { name: this.getModelDisplayName(newModel) }), 'success');
                this.updateModelInfo();
                this.setupHelpContent();
                this.saveCurrentSession();
            }
        }
        this.closeModelModal();
    }

    updateModelInfo() {
        if (this.currentModelInfo) {
            this.currentModelInfo.textContent = this.getModelDisplayName(this.currentModel);
        }
    }

    getModelDisplayName(model) {
        return this.modelConfig[model]?.name || model;
    }

    getModelDescription(model) {
        return this.modelConfig[model]?.description || (i18n.getCurrentLanguage() === 'be' ? 'Мадэль ІІ' : 'Модель ИИ');
    }

    // Import/Export
    importChatHistory() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const chatData = JSON.parse(event.target.result);
                        this.importChatSession(chatData);
                        this.showNotification(i18n.get('notification.success'), 'success');
                    } catch (error) {
                        this.showNotification(i18n.get('error.import'), 'error');
                        console.error('Import error:', error);
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    importChatSession(chatData) {
        const chatId = 'imported-' + Date.now();
        const session = {
            id: chatId,
            name: chatData.name || (i18n.getCurrentLanguage() === 'be' ? 'Імпартаваны чат' : 'Импортированный чат'),
            messages: chatData.messages || [],
            conversationHistory: chatData.conversationHistory || [],
            createdAt: chatData.createdAt || Date.now(),
            lastActivity: Date.now()
        };
        
        this.chatSessions.set(chatId, session);
        this.saveChatSessions();
        this.updateChatList();
        this.switchChat(chatId);
    }

    // Navigation
    setupScrollTracking() {
        this.updateNavigationButtons();
        this.handleScroll();
    }

    handleScroll() {
        if (!this.messagesContainer) return;
        
        const container = this.messagesContainer;
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        
        this.isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
        this.isAtTop = scrollTop < 50;
        
        this.updateNavigationButtons();
        this.updateMinimapViewport();
        
        this.autoScrollEnabled = this.isAtBottom;
    }

    updateNavigationButtons() {
        const aiMessages = this.messagesContainer.querySelectorAll('.message-ai:not(.typing-indicator)');
        const hasAIMessages = aiMessages.length > 0;
        
        if (this.scrollToLastAI) {
            this.scrollToLastAI.classList.toggle('active', !this.isAtBottom && hasAIMessages);
            this.scrollToLastAI.disabled = !hasAIMessages;
        }
        
        if (this.scrollToBottomBtn) {
            this.scrollToBottomBtn.classList.toggle('active', !this.isAtBottom);
            this.scrollToBottomBtn.disabled = this.isAtBottom;
        }
    }

    scrollToLastAIMessage() {
        const aiMessages = this.messagesContainer.querySelectorAll('.message-ai:not(.typing-indicator)');
        if (aiMessages.length > 0) {
            const lastAIMessage = aiMessages[aiMessages.length - 1];
            lastAIMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.setTimeout(() => this.updateNavigationButtons(), 300);
        }
    }

    scrollToBottom(force = false) {
        if (force) {
            this.autoScrollEnabled = true;
        }
        
        if (this.autoScrollEnabled && this.messagesContainer) {
            this.setTimeout(() => {
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
                this.setTimeout(() => this.updateNavigationButtons(), 100);
            }, 50);
        }
    }

    // Mode Management
    toggleImageMode() {
        this.isImageMode = !this.isImageMode;
        this.setMode(this.isImageMode ? 'image' : 'normal');
    }

    toggleVoiceMode() {
        this.isVoiceMode = !this.isVoiceMode;
        this.setMode(this.isVoiceMode ? 'voice' : 'normal');
    }

    setMode(mode) {
        this.isImageMode = false;
        this.isVoiceMode = false;
        
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
            const btnText = btn.querySelector('.btn-text');
            if (btnText) {
                btnText.style.display = 'none';
            }
        });
        
        const modeIndicator = document.querySelector('.mode-indicator');
        if (modeIndicator) {
            let modeText = '';
            let modeIcon = '';
            
            if (mode === 'normal') {
                modeText = i18n.get('mode.normal');
                modeIcon = 'ti-message';
                this.normalModeBtn.classList.add('active');
                this.userInput.placeholder = i18n.get('input.placeholder');
                this.inputSection.classList.remove('voice-mode-active', 'image-mode-active');
            } else if (mode === 'voice') {
                modeText = i18n.get('mode.voice');
                modeIcon = 'ti-microphone';
                this.generateVoiceBtn.classList.add('active');
                this.isVoiceMode = true;
                this.userInput.placeholder = i18n.get('input.placeholder.voice');
                this.inputSection.classList.add('voice-mode-active');
                this.inputSection.classList.remove('image-mode-active');
            } else if (mode === 'image') {
                modeText = i18n.get('mode.image');
                modeIcon = 'ti-photo';
                this.generateImageBtn.classList.add('active');
                this.isImageMode = true;
                this.userInput.placeholder = i18n.get('input.placeholder.image');
                this.inputSection.classList.add('image-mode-active');
                this.inputSection.classList.remove('voice-mode-active');
            }
            
            modeIndicator.innerHTML = `<i class="ti ${modeIcon}"></i> ${modeText}`;
        }
        
        const activeBtn = document.querySelector('.mode-btn.active');
        if (activeBtn) {
            const activeBtnText = activeBtn.querySelector('.btn-text');
            if (activeBtnText) {
                activeBtnText.style.display = 'inline';
            }
        }
        
        this.showNotification(i18n.get('notification.modeChanged', { mode: this.getModeName(mode) }), 'info');
    }

    getModeName(mode) {
        const names = {
            'normal': i18n.get('mode.normal.name'),
            'voice': i18n.get('mode.voice.name'),
            'image': i18n.get('mode.image.name')
        };
        return names[mode] || (i18n.getCurrentLanguage() === 'be' ? 'Невядомы' : 'Неизвестный');
    }

    // Voice Recognition
    setupVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            if (this.voiceInputBtn) {
                this.voiceInputBtn.style.display = 'none';
            }
            return;
        }

        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = i18n.getCurrentLanguage() === 'be' ? 'be-BY' : 'ru-RU';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.voiceInputBtn.classList.add('active');
                this.showNotification(i18n.get('notification.listening'), 'info');
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.userInput.value = transcript;
                this.userInput.focus();
                this.handleInputChange();
                this.showNotification(i18n.get('notification.voiceRecognized'), 'success');
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showNotification(i18n.get('notification.voiceError', { error: event.error }), 'error');
                this.isListening = false;
                this.voiceInputBtn.classList.remove('active');
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.voiceInputBtn.classList.remove('active');
            };
        } catch (error) {
            console.error('Error setting up voice recognition:', error);
            if (this.voiceInputBtn) {
                this.voiceInputBtn.style.display = 'none';
            }
        }
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            this.showNotification(i18n.get('notification.voiceNotSupported'), 'error');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Error starting voice recognition:', error);
                this.showNotification(i18n.get('notification.voiceError', { error: 'start failed' }), 'error');
            }
        }
    }

    // Global Handlers
    handleGlobalKeydown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            this.clearChat();
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            this.toggleSidebar();
        }
        
        if (e.key === 'Escape') {
            this.closeSidebar();
            this.closeModelModal();
            this.closeEditChatModal();
            this.closeHelpModal();
            this.closeMessageModal();
            this.contextWarningModal.classList.remove('active');
        }
    }

    handleOnlineStatus() {
        this.showNotification(i18n.get('notification.connectionRestored'), 'success');
        this.updateConnectionStatus(true);
    }

    handleOfflineStatus() {
        this.showNotification(i18n.get('notification.connectionLost'), 'error');
        this.updateConnectionStatus(false);
    }

    updateConnectionStatus(online = true) {
        if (this.connectionStatus) {
            if (online) {
                this.connectionStatus.textContent = '✅ ' + (i18n.getCurrentLanguage() === 'be' ? 'Анлайн' : 'Онлайн');
                this.connectionStatus.style.color = '';
            } else {
                this.connectionStatus.textContent = '❌ ' + (i18n.getCurrentLanguage() === 'be' ? 'Офлайн' : 'Офлайн');
                this.connectionStatus.style.color = 'var(--error-text)';
            }
        }
        
        if (this.connectionStatusText) {
            if (online) {
                this.connectionStatusText.textContent = i18n.get('footer.connected');
                const statusIcon = this.connectionStatusText.previousElementSibling;
                if (statusIcon) {
                    statusIcon.style.color = 'var(--success-text)';
                }
            } else {
                this.connectionStatusText.textContent = i18n.get('footer.disconnected');
                const statusIcon = this.connectionStatusText.previousElementSibling;
                if (statusIcon) {
                    statusIcon.style.color = 'var(--error-text)';
                }
            }
        }
    }

    handleResize() {
        this.updateMinimapViewport();
        this.setupResponsiveMinimap();
        this.updateInputSize();
        
        // Recreate floating particles on resize
        if (this.messagesContainer.children.length <= 1) {
            this.createFloatingParticles();
        }
        
        // Adapt message modal buttons
        if (this.messageModal.classList.contains('active')) {
            this.adaptMessageModalButtons();
        }
    }

    setupResponsiveMinimap() {
        if (window.innerWidth <= 768) {
            // На мобильных устройствах миникарта позиционируется над инпутсекцией
            if (this.chatMinimapContainer) {
                const inputSectionHeight = this.inputSection.offsetHeight;
                const footerHeight = document.querySelector('.app-footer').offsetHeight;
                const headerHeight = document.querySelector('.app-header').offsetHeight;
                
                const availableHeight = window.innerHeight - headerHeight - inputSectionHeight - footerHeight - 40;
                
                this.chatMinimapContainer.style.height = `${Math.max(availableHeight, 100)}px`;
                this.chatMinimapContainer.style.bottom = `${inputSectionHeight + 20}px`;
            }
        } else {
            // На десктопе обычное позиционирование
            if (this.chatMinimapContainer) {
                this.chatMinimapContainer.style.height = 'calc(100vh - 280px)';
                this.chatMinimapContainer.style.bottom = '180px';
            }
        }
    }

    // PWA
    checkPWAInstallation() {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           window.navigator.standalone;
        
        this.isPWAInstalled = isStandalone;
        
        if (this.isPWAInstalled) {
            this.hidePWAInstallButton();
        }
        
        // Schedule inactivity notification
        this.scheduleInactivityNotification();
    }

    async installPWA() {
        // Для iOS показываем инструкции
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        if (isIOS) {
            this.showNotification(i18n.get('pwa.install'), 'info');
            return;
        }
        
        // Для других платформ используем стандартную установку
        if (this.deferredPrompt) {
            try {
                this.deferredPrompt.prompt();
                const { outcome } = await this.deferredPrompt.userChoice;
                
                if (outcome === 'accepted') {
                    this.showNotification(i18n.get('notification.appInstalled'), 'success');
                    this.isPWAInstalled = true;
                    this.hidePWAInstallButton();
                } else {
                    this.showNotification(i18n.get('notification.installCancelled'), 'info');
                }
            } catch (error) {
                console.error('Ошибка установки PWA:', error);
                this.showNotification(i18n.get('error.install'), 'error');
            }
        } else {
            this.showNotification(i18n.get('pwa.installGeneric'), 'info');
        }
    }

    // Utility Methods
    escapeHtml(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showNotification(message, type = 'info') {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="ti ti-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="ti ti-x"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        this.setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'circle-check',
            'error': 'alert-circle',
            'warning': 'alert-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    handleError(userMessage, error) {
        console.error(userMessage, error);
        this.addMessage('error', `${userMessage}: ${error.message}`);
        this.showNotification(userMessage, 'error');
    }

    handleCriticalError(message, error) {
        console.error(message, error);
        
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #ff4444;
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 10000;
            max-width: 400px;
            text-align: center;
        `;
        errorDiv.innerHTML = `
            <h3>${i18n.get('error.loading')}</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: white; color: #ff4444; border: none; border-radius: 4px; cursor: pointer;">
                ${i18n.getCurrentLanguage() === 'be' ? 'Перазагрузіць' : 'Перезагрузить'}
            </button>
        `;
        document.body.appendChild(errorDiv);
    }

    debug(...args) {
        if (this.DEBUG) {
            console.log('[KHAI Debug]', ...args);
        }
    }

    showWelcomeMessage() {
        // Remove existing welcome message
        const existingWelcome = this.messagesContainer.querySelector('.welcome-content');
        if (existingWelcome) {
            existingWelcome.remove();
        }
        
        // Show floating particles for empty chat
        this.floatingParticles.style.display = 'block';
        this.createFloatingParticles();
        
        const currentModelName = this.getModelDisplayName(this.currentModel);
        const currentModelDesc = this.getModelDescription(this.currentModel);
        
        const welcomeContent = document.createElement('div');
        welcomeContent.className = 'welcome-content';
        
        // Create welcome features grid
        const featuresGrid = this.welcomePresets.map(preset => `
            <div class="welcome-feature" onclick="khaiAssistant.welcomePresets[${this.welcomePresets.indexOf(preset)}].action()">
                <i class="ti ${preset.icon}"></i>
                <span>${preset.title}</span>
            </div>
        `).join('');
        
        welcomeContent.innerHTML = `
            <h1><i class="ti ti-brain"></i> ${i18n.get('welcome.title')}</h1>
            
            <p>${i18n.get('welcome.description')}</p>
            
            <p><strong>${i18n.get('welcome.currentModel', { name: currentModelName })}</strong> - ${currentModelDesc}</p>

            <div class="welcome-features">
                ${featuresGrid}
            </div>
            
            <p><strong>${i18n.get('welcome.startCommunication')}</strong></p>

            <div class="welcome-actions">
                <button class="welcome-action-btn" onclick="khaiAssistant.focusInput()">
                    <i class="ti ti-keyboard"></i> ${i18n.get('welcome.startChat')}
                </button>
                <button class="welcome-action-btn secondary" onclick="khaiAssistant.showHelpModal()">
                    <i class="ti ti-help"></i> ${i18n.get('welcome.openHelp')}
                </button>
            </div>
        `;
        
        // Add language toggle button
        if (this.languageToggleBtn) {
            welcomeContent.appendChild(this.languageToggleBtn);
        }
        
        this.messagesContainer.appendChild(welcomeContent);
        this.scrollToBottom();
    }

    clearInput() {
        this.userInput.value = '';
        this.resetInputSize();
        this.attachedImages = [];
        this.renderAttachedFiles();
        this.userInput.focus();
        this.showNotification(i18n.get('notification.inputCleared'), 'success');
        this.handleInputChange();
    }

    clearChat() {
        if (!this.messagesContainer || this.messagesContainer.children.length === 0) {
            return;
        }

        if (confirm(i18n.get('modal.confirmClear'))) {
            this.messagesContainer.innerHTML = '';
            this.conversationHistory = [];
            this.saveCurrentSession();
            this.updateMinimap();
            this.updateContextCounter();
            this.contextWarningShown = false;
            this.showWelcomeMessage();
            this.showNotification(i18n.get('notification.chatCleared'), 'success');
        }
    }

    refreshPage() {
        location.reload();
    }

    updateDocumentTitle() {
        document.title = i18n.get('app.fullName');
        
        const sidebarTitle = document.querySelector('.sidebar-header h3');
        if (sidebarTitle) {
            sidebarTitle.innerHTML = `KHAI <span class="beta-badge">${i18n.get('beta')}</span>`;
        }
    }

    cleanup() {
        this.activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.activeTimeouts.clear();

        this.debounceTimers.forEach((timer, id) => {
            clearTimeout(timer);
        });
        this.debounceTimers.clear();

        this.stopSpeech();

        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
            } catch (e) {
                // Ignore errors during cleanup
            }
        }

        if (this.currentStreamController) {
            try {
                this.currentStreamController.abort();
                this.currentStreamController = null;
            } catch (e) {
                console.warn('Error aborting stream controller:', e);
            }
        }

        this.activeEventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler, options }) => {
                element.removeEventListener(event, handler, options);
            });
        });
        this.activeEventListeners.clear();

        if (this.activeTypingIndicator) {
            this.removeTypingIndicator(this.activeTypingIndicator);
        }

        this.cleanupCallbacks.forEach(callback => {
            try {
                callback();
            } catch (e) {
                this.debug('Error in cleanup callback:', e);
            }
        });

        this.debug('Cleanup completed');
    }
}

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Check for required dependencies
        const missingDeps = [];
        if (typeof marked === 'undefined') missingDeps.push('marked.js');
        if (typeof hljs === 'undefined') missingDeps.push('highlight.js');
        if (typeof puter === 'undefined') missingDeps.push('Puter.ai');
        if (typeof i18n === 'undefined') missingDeps.push('i18n.js');

        if (missingDeps.length > 0) {
            console.warn('Missing dependencies:', missingDeps.join(', '));
        }

        // Preload voices for speech synthesis
        if ('speechSynthesis' in window) {
            speechSynthesis.getVoices();
        }

        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Initialize app
        window.khaiAssistant = new KHAIAssistant();

    } catch (error) {
        console.error('Failed to initialize application:', error);
        
        const errorNotification = document.createElement('div');
        errorNotification.className = 'notification error';
        errorNotification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            background: #ff4444;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            max-width: 400px;
        `;
        errorNotification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="ti ti-alert-circle"></i>
                <span>${i18n ? i18n.get('error.loading') : 'Ошибка загрузки приложения'}</span>
            </div>
        `;
        document.body.appendChild(errorNotification);
    }
});

// Global error handlers
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});
