// script.js - Production Ready v3.0.2
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
            "Расскажи о возможностях искусственного интеллекта...",
            "Напиши код для сортировки массива на Python...",
            "Сгенерируй изображение космического корабля...",
            "Какие есть способы улучшить производительность веб-сайта?",
            "Создай описание для приложения на основе ИИ..."
        ];

        this.modelConfig = {
            'gpt-5-nano': { 
                name: 'GPT-5 Nano', 
                description: 'Быстрая и эффективная модель для повседневных задач',
                available: true,
                context: 128000
            },
            'o3-mini': { 
                name: 'O3 Mini', 
                description: 'Продвинутая модель с улучшенными возможностями рассуждения',
                available: true,
                context: 128000
            },
            'deepseek-chat': { 
                name: 'DeepSeek Chat', 
                description: 'Универсальная модель для общения и решения задач',
                available: true,
                context: 128000
            },
            'deepseek-reasoner': { 
                name: 'DeepSeek Reasoner', 
                description: 'Специализированная модель для сложных логических рассуждений',
                available: true,
                context: 128000
            },
            'gemini-2.0-flash': { 
                name: 'Gemini 2.0 Flash', 
                description: 'Новейшая быстрая модель от Google с улучшенными возможностями',
                available: true,
                context: 128000
            },
            'grok-beta': { 
                name: 'xAI Grok', 
                description: 'Модель от xAI с уникальным характером и остроумными ответами',
                available: true,
                context: 128000
            }
        };

        // Limits
        this.MAX_FILES = 3;
        this.MAX_MESSAGE_LENGTH = 4000;
        this.MAX_CHAT_NAME_LENGTH = 16;
        this.CONVERSATION_HISTORY_LIMIT = 30;
        this.MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

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
                title: "Анализировать файл",
                icon: "ti-file-text",
                action: () => this.handleFileAnalysisPreset()
            },
            {
                title: "Решить задачу",
                icon: "ti-math",
                action: () => this.handleProblemSolvingPreset()
            },
            {
                title: "Написать код",
                icon: "ti-code",
                action: () => this.handleCodeWritingPreset()
            },
            {
                title: "Перевести текст",
                icon: "ti-language",
                action: () => this.handleTranslationPreset()
            },
            {
                title: "Объяснить тему",
                icon: "ti-school",
                action: () => this.handleExplanationPreset()
            },
            {
                title: "Создать контент",
                icon: "ti-edit",
                action: () => this.handleContentCreationPreset()
            }
        ];

        // Scroll hide state
        this.scrollHideTimeout = null;
        this.lastScrollTop = 0;
        this.scrollThreshold = 10;
    }

    detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    setupMarked() {
        if (typeof marked === 'undefined') {
            console.warn('Marked.js не загружен');
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
            this.setupScrollEffects();
            this.setupTutorial();
            this.setupMinimapScroll();
            
            // Скрываем прелоадер после загрузки
            this.hidePreloader();
            
            this.debug('KHAI Assistant успешно загружен');
            this.showNotification('KHAI Assistant загружен и готов к работе!', 'success');
            
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

        // Enhanced scroll events for header/footer hiding
        this.setupEnhancedScroll();
    }

    setupEnhancedScroll() {
        let lastScrollTop = 0;
        const scrollThreshold = 50;

        this.addEventListener(this.messagesContainer, 'scroll', () => {
            const scrollTop = this.messagesContainer.scrollTop;
            const isScrollingDown = scrollTop > lastScrollTop;
            const scrollDelta = Math.abs(scrollTop - lastScrollTop);
            
            if (scrollDelta > scrollThreshold) {
                if (isScrollingDown && scrollTop > 100) {
                    // Scrolling down - hide header and footer
                    this.hideHeaderFooter();
                } else {
                    // Scrolling up - show header and footer
                    this.showHeaderFooter();
                }
                lastScrollTop = scrollTop;
            }

            // Clear existing timeout
            if (this.scrollHideTimeout) {
                clearTimeout(this.scrollHideTimeout);
            }

            // Set timeout to show header/footer when scrolling stops
            this.scrollHideTimeout = setTimeout(() => {
                this.showHeaderFooter();
            }, 1500);
        });

        // Touch events for mobile
        this.addEventListener(this.messagesContainer, 'touchstart', () => {
            this.showHeaderFooter();
        });
    }

    hideHeaderFooter() {
        this.appHeader.classList.add('hidden');
        this.appFooter.classList.add('hidden');
        this.messagesContainer.classList.add('full-width');
        this.isScrolling = true;
    }

    showHeaderFooter() {
        this.appHeader.classList.remove('hidden');
        this.appFooter.classList.remove('hidden');
        this.messagesContainer.classList.remove('full-width');
        this.isScrolling = false;
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
                highlightText = 'Основное меню для управления чатами';
                break;
            case 3:
                // Highlight model selection
                highlightElement = this.modelSelectBtn;
                highlightText = 'Выбор модели ИИ для разных задач';
                break;
            case 4:
                // Highlight mode buttons
                highlightElement = document.querySelector('.action-buttons');
                highlightText = 'Режимы работы: обычный, голос, изображения';
                break;
            case 5:
                // Highlight file attachment
                highlightElement = this.attachFileBtn;
                highlightText = 'Прикрепление файлов для анализа';
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
        this.showNotification('Тур пропущен. Вы всегда можете открыть обучение через меню помощи.', 'info');
    }

    finishTutorial() {
        this.tutorialOverlay.style.display = 'none';
        localStorage.setItem('khai-tutorial-completed', 'true');
        this.tutorialCompleted = true;
        this.showNotification('Обучение завершено! Начните общение с ИИ.', 'success');
        this.userInput.focus();
    }

    // Message Modal Methods
    setupMessageModal() {
        // Уже привязано в bindEvents
    }

    openMessageModal(messageElement) {
        const messageContent = messageElement.querySelector('.message-content');
        if (!messageContent) return;

        const role = messageElement.classList.contains('message-user') ? 'user' : 'ai';
        const title = role === 'user' ? 'Ваше сообщение' : 'Ответ ИИ';
        
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
                this.showNotification('Сообщение скопировано в буфер обмена', 'success');
                this.messageModalCopy.innerHTML = '<i class="ti ti-check"></i> Скопировано!';
                this.messageModalCopy.classList.add('copied');
                this.setTimeout(() => {
                    this.messageModalCopy.innerHTML = '<i class="ti ti-copy"></i> Копировать';
                    this.messageModalCopy.classList.remove('copied');
                }, 2000);
            })
            .catch(() => {
                this.showNotification('Не удалось скопировать сообщение', 'error');
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

    // Scroll effects
    setupScrollEffects() {
        // Improved scroll handling with faster transitions
        this.appHeader.style.transition = 'transform 0.2s ease-out';
        this.appFooter.style.transition = 'transform 0.2s ease-out';
        this.messagesContainer.style.transition = 'padding 0.2s ease-out';
    }

    // Welcome preset handlers
    handleFileAnalysisPreset() {
        this.userInput.value = "Пожалуйста, проанализируй прикрепленный файл и предоставь подробный анализ его содержимого.";
        this.userInput.focus();
        this.showNotification('Прикрепите файл для анализа', 'info');
    }

    handleProblemSolvingPreset() {
        this.userInput.value = "Помоги решить эту задачу. Объясни шаг за шагом:";
        this.userInput.focus();
        this.showNotification('Опишите задачу для решения', 'info');
    }

    handleCodeWritingPreset() {
        this.userInput.value = "Напиши код для следующей задачи. Пожалуйста, добавь комментарии:";
        this.userInput.focus();
        this.showNotification('Опишите задачу для программирования', 'info');
    }

    handleTranslationPreset() {
        this.userInput.value = "Переведи следующий текст. Учти контекст и сохрани смысл:";
        this.userInput.focus();
        this.showNotification('Введите текст для перевода', 'info');
    }

    handleExplanationPreset() {
        this.userInput.value = "Объясни эту тему простыми словами, как будто объясняешь новичку:";
        this.userInput.focus();
        this.showNotification('Введите тему для объяснения', 'info');
    }

    handleContentCreationPreset() {
        this.userInput.value = "Помоги создать контент по следующей теме. Учти целевую аудиторию:";
        this.userInput.focus();
        this.showNotification('Опишите тему для создания контента', 'info');
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
            <h1><i class="ti ti-help"></i> Помощь по KHAI Assistant</h1>
            
            <div class="help-feature-grid">
                <div class="help-feature">
                    <i class="ti ti-message"></i>
                    <span>Общение с ИИ</span>
                </div>
                <div class="help-feature">
                    <i class="ti ti-photo"></i>
                    <span>Генерация изображений</span>
                </div>
                <div class="help-feature">
                    <i class="ti ti-microphone"></i>
                    <span>Голосовые функции</span>
                </div>
                <div class="help-feature">
                    <i class="ti ti-file-text"></i>
                    <span>Работа с файлами</span>
                </div>
            </div>

            <h2><i class="ti ti-brain"></i> Текущая модель: ${currentModelName}</h2>
            <p>Вы можете переключать модели в верхнем правом углу.</p>
            
            <h2><i class="ti ti-messages"></i> Система чатов</h2>
            <ul>
                <li><strong>Создание нового чата</strong> - нажмите "Новый чат" в меню</li>
                <li><strong>Редактирование названия</strong> - нажмите на иконку карандаша рядом с чатом</li>
                <li><strong>Скачать чат</strong> - нажмите на иконку загрузки для экспорта</li>
                <li><strong>Импорт чата</strong> - загрузите ранее сохраненный чат</li>
                <li><strong>Удалить все чаты</strong> - кнопка внизу меню (кроме основного)</li>
            </ul>
            
            <h2><i class="ti ti-file"></i> Работа с файлами</h2>
            <ul>
                <li><strong>Изображения</strong> - прикрепите для анализа текста и содержимого</li>
                <li><strong>Текстовые файлы</strong> - прикрепите для анализа содержимого</li>
                <li><strong>Файлы кода</strong> - анализ кода на различных языках программирования</li>
                <li><strong>Максимум файлов</strong> - можно прикрепить до 3 файлов за раз</li>
            </ul>
            
            <h2><i class="ti ti-photo"></i> Генерация изображений</h2>
            <ol>
                <li>Включите режим изображений</li>
                <li>Опишите что создать</li>
                <li>Нажмите отправить</li>
                <li>Скачайте результат</li>
            </ol>
            
            <h2><i class="ti ti-microphone"></i> Аудио функции</h2>
            <ul>
                <li><strong>Генерация голоса</strong> - создает аудио из текста с помощью ИИ</li>
                <li><strong>Озвучить ответ</strong> - воспроизводит ответ ИИ</li>
                <li><strong>Остановить озвучку</strong> - нажмите кнопку повторно для остановки</li>
            </ul>

            <div class="help-actions">
                <button class="help-action-btn" onclick="khaiAssistant.startTutorial()">
                    <i class="ti ti-tournament"></i> Пройти обучение
                </button>
                <button class="help-action-btn secondary" onclick="khaiAssistant.focusInput()">
                    <i class="ti ti-keyboard"></i> Попробовать сейчас
                </button>
            </div>
        `;
    }

    focusInput() {
        this.userInput.focus();
        this.closeHelpModal();
        this.showNotification('Поле ввода активировано!', 'success');
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
        
        // Show install notification after delay
        this.setTimeout(() => {
            this.showPWAInstallNotification();
        }, 5000);
    }

    handleAppInstalled() {
        this.deferredPrompt = null;
        this.isPWAInstalled = true;
        this.debug('PWA installed successfully');
        this.showNotification('Приложение успешно установлено!', 'success');
        
        // Schedule welcome notification
        this.scheduleWelcomeNotification();
    }

    // Notification scheduling
    scheduleWelcomeNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            this.setTimeout(() => {
                this.showNotification('Добро пожаловать в KHAI Assistant! Готов помочь с любыми вопросами.', 'info');
            }, 3000);
        }
    }

    scheduleInactivityNotification() {
        // Check if user hasn't visited for more than 24 hours
        const lastVisit = localStorage.getItem('khai-last-visit');
        const now = Date.now();
        
        if (lastVisit && (now - parseInt(lastVisit)) > 24 * 60 * 60 * 1000) {
            this.showNotification('С возвращением! Продолжим наш разговор?', 'info');
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
                this.showNotification('Произошла ошибка при обработке действия', 'error');
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
            this.currentTheme === 'dark' ? 'Темная тема включена' : 'Светлая тема включена',
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
            return { valid: false, error: 'Сообщение не может быть пустым' };
        }
        
        if (text.length > this.MAX_MESSAGE_LENGTH) {
            return { 
                valid: false, 
                error: `Сообщение слишком длинное (максимум ${this.MAX_MESSAGE_LENGTH} символов)` 
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
                return { valid: false, error: 'Сообщение содержит недопустимый контент' };
            }
        }

        return { valid: true };
    }

    async sendMessage() {
        if (this.isProcessing) {
            this.showNotification('Подождите завершения предыдущего запроса', 'warning');
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
            this.handleError('Произошла ошибка при отправке сообщения', error);
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
            this.sendBtn.title = 'Остановить генерацию';
            
            this.inputSection.classList.add('input-disabled');
            this.userInput.disabled = true;
            this.userInput.placeholder = 'ИИ генерирует ответ... Нажмите остановить для прерывания';
        } else {
            this.sendBtn.classList.remove('stop-generation');
            this.sendBtn.innerHTML = '<i class="ti ti-send"></i>';
            this.sendBtn.title = 'Отправить сообщение';
            
            this.inputSection.classList.remove('input-disabled');
            this.userInput.disabled = false;
            
            if (this.isVoiceMode) {
                this.userInput.placeholder = 'Введите текст для генерации голоса...';
            } else if (this.isImageMode) {
                this.userInput.placeholder = 'Опишите изображение для генерации...';
            } else {
                this.userInput.placeholder = 'Задайте вопрос или опишите изображение...';
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
            
            this.showNotification('Генерация остановлена', 'info');
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
            this.handleError('Ошибка при получении ответа от ИИ', error);
        }
    }

    async buildPrompt(userMessage, files) {
        if (files.length > 0) {
            const file = files[0];
            
            if (file.fileType === 'image') {
                if (typeof puter?.ai?.img2txt !== 'function') {
                    throw new Error('Функция анализа изображений недоступна');
                }
                
                const extractedText = await puter.ai.img2txt(file.data);
                
                if (userMessage.trim()) {
                    return `Пользователь отправил изображение "${file.name}" с сопроводительным сообщением: "${userMessage}"

Извлеченный текст с изображения: "${extractedText}"

Ответь на вопрос/сообщение пользователя "${userMessage}", учитывая содержание изображения. Если на изображении есть дополнительная информация (текст, задачи, диаграммы и т.д.) - используй её для полного ответа. Отвечай одним целостным сообщением на русском языке.`;
                } else {
                    return `Пользователь отправил изображение "${file.name}".

Извлеченный текст с изображения: "${extractedText}"

Проанализируй это изображение. Опиши что изображено, основное содержание. Если есть текст - объясни его значение. Если это задача - реши её. Отвечай подробно на русском языке.`;
                }
            } else if (file.fileType === 'text' || file.fileType === 'code') {
                const fileContent = file.data;
                
                if (userMessage.trim()) {
                    return `Пользователь отправил файл "${file.name}" с сопроводительным сообщением: "${userMessage}"

Содержимое файла:
"""
${fileContent}
"""

Ответь на вопрос/сообщение пользователя "${userMessage}", учитывая содержимое прикрепленного файла. Проанализируй содержимое и дай развернутый ответ на основе предоставленной информации. Отвечай на русском языке.`;
                } else {
                    return `Пользователь отправил файл "${file.name}".

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
            throw new Error('Функция чата недоступна');
        }
        
        const modelOptions = {
            'gpt-5-nano': { model: 'gpt-5-nano' },
            'o3-mini': { model: 'o3-mini' },
            'deepseek-chat': { model: 'deepseek-chat' },
            'deepseek-reasoner': { model: 'deepseek-reasoner' },
            'gemini-2.0-flash': { model: 'gemini-2.0-flash' },
            'grok-beta': { model: 'grok-beta' }
        };
        
        const options = {
            ...modelOptions[this.currentModel],
            systemPrompt: "Ты полезный AI-ассистент. Отвечай на русском языке понятно и подробно. Поддерживай естественный диалог и учитывай контекст предыдущих сообщений.",
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
                
                // Schedule completion notification
                this.scheduleCompletionNotification();
            }
        } catch (error) {
            if (!this.generationAborted) {
                console.error('Error processing AI response:', error);
                this.handleError('Ошибка при обработке ответа ИИ', error);
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
                this.showNotification('Ответ ИИ готов!', 'success');
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
                <span>ИИ думает...</span>
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
        modelIndicator.textContent = `Модель: ${this.getModelDisplayName(this.currentModel)} • ${this.getModelDescription(this.currentModel)}`;
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
        downloadCodeBtn.innerHTML = '<i class="ti ti-code"></i> Скачать код';
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
        this.showNotification('Код скачан', 'success');
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
        this.showNotification(`Файл "${fileName}" скачан`, 'success');
    }

    buildContextPrompt(currentMessage) {
        const recentHistory = this.conversationHistory.slice(-6);
        
        if (recentHistory.length === 0) {
            return currentMessage;
        }

        let context = "Контекст предыдущего разговора:\n";
        
        recentHistory.forEach(msg => {
            const role = msg.role === 'user' ? 'Пользователь' : 'Ассистент';
            const content = msg.content.length > 500 ? msg.content.substring(0, 500) + '...' : msg.content;
            context += `${role}: ${content}\n`;
        });

        context += `\nТекущий вопрос пользователя: ${currentMessage}\n\nОтветь, учитывая контекст выше:`;

        return context;
    }

    addToConversationHistory(role, content, images = []) {
        let messageContent = content;
        
        if (images && images.length > 0) {
            const imageNames = images.map(img => img.name).join(', ');
            messageContent += ` [Прикреплено изображение: ${imageNames}]`;
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
            this.addMessage('user', `🎨 **Генерация изображения:** "${prompt}"`);
            
            this.userInput.value = '';
            this.resetInputSize();
            
            // Показываем индикатор генерации изображения
            const typingId = this.showImageGenerationIndicator();
            
            if (typeof puter?.ai?.txt2img !== 'function') {
                throw new Error('Функция генерации изображений недоступна');
            }
            
            this.showNotification('Генерация изображения...', 'info');
            
            const imageResult = await puter.ai.txt2img(prompt, { 
                model: "gpt-image-1", 
                quality: "low" 
            });
            
            this.removeTypingIndicator(typingId);
            this.addImageMessage(prompt, imageResult);
            
            this.addToConversationHistory('user', `Сгенерировано изображение по запросу: ${prompt}`);
            this.saveCurrentSession();
            
        } catch (error) {
            this.removeTypingIndicator();
            this.handleError('Ошибка при генерации изображения', error);
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
            <span>ИИ генерирует изображение...</span>
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
            🎨 **Сгенерированное изображение по запросу:** "${this.escapeHtml(prompt)}"
            <div class="message-image" style="margin-top: 12px;">
                <img src="${imageResult.src}" alt="Сгенерированное изображение" loading="lazy" style="max-width: 100%; border-radius: 8px;">
            </div>
            <div class="message-actions" style="margin-top: 12px;">
                <button class="action-btn-small download-image-btn">
                    <i class="ti ti-download"></i> Скачать изображение
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
        this.showNotification('Изображение скачано', 'success');
    }

    async generateVoice(text) {
        if (typeof puter?.ai?.txt2speech !== 'function') {
            throw new Error('Функция генерации голоса недоступна');
        }
        
        if (!text.trim()) {
            this.showNotification('Введите текст для генерации голоса', 'error');
            return;
        }

        try {
            this.addMessage('user', `🔊 **Генерация голоса:** "${text}"`);
            
            this.userInput.value = '';
            this.resetInputSize();
            
            this.showNotification('Генерация голоса...', 'info');
            
            const audio = await puter.ai.txt2speech(text);
            this.addVoiceMessage(text, audio);
            
            this.addToConversationHistory('user', `Сгенерирован голос для текста: ${text}`);
            this.saveCurrentSession();
            
        } catch (error) {
            this.handleError('Ошибка при генерации голоса', error);
        }
    }

    addVoiceMessage(text, audio) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-ai';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        messageContent.innerHTML = `
            🔊 **Сгенерированный голос для текста:** "${this.escapeHtml(text)}"
            <div class="audio-player" style="margin-top: 12px;">
                <audio controls style="width: 100%; max-width: 300px;">
                    <source src="${audio.src}" type="audio/mpeg">
                    Ваш браузер не поддерживает аудио элементы.
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
            modelIndicator.textContent = `Модель: ${this.getModelDisplayName(this.currentModel)} • ${this.getModelDescription(this.currentModel)}`;
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
                        <span>${this.escapeHtml(image.name)} (Текстовый файл)</span>
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
                        Копировать
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
        const isWelcomeMessage = plainText.includes('Добро пожаловать в KHAI') || 
                                plainText.includes('Основные возможности:');
        
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
            regenerateBtn.innerHTML = '<i class="ti ti-refresh"></i> Перегенерировать';
            regenerateBtn.onclick = () => this.regenerateMessage(messageElement);
            actionsContainer.appendChild(regenerateBtn);
        }

        // Download button
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'action-btn-small';
        downloadBtn.innerHTML = '<i class="ti ti-download"></i> Скачать';
        downloadBtn.onclick = () => this.downloadMessage(plainText);
        actionsContainer.appendChild(downloadBtn);

        // Share button
        if (navigator.share) {
            const shareBtn = document.createElement('button');
            shareBtn.className = 'action-btn-small';
            shareBtn.innerHTML = '<i class="ti ti-share"></i> Поделиться';
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
                    title: 'Сообщение от KHAI Assistant',
                    text: content
                });
            } catch (error) {
                if (error.name !== 'AbortError') {
                    this.showNotification('Ошибка при отправке', 'error');
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
                        btn.innerHTML = '<i class="ti ti-check"></i> Скопировано!';
                        btn.classList.add('copied');
                        
                        this.setTimeout(() => {
                            btn.innerHTML = originalText;
                            btn.classList.remove('copied');
                        }, 2000);
                        
                        this.showNotification('Код скопирован в буфер обмена', 'success');
                    } catch (err) {
                        console.error('Failed to copy code:', err);
                        this.showNotification('Не удалось скопировать код', 'error');
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
        speakButton.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить';
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
            button.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить';
            this.showNotification('Озвучивание остановлено', 'info');
        } else {
            this.speakText(text, button);
        }
    }

    speakText(text, button) {
        if (!('speechSynthesis' in window)) {
            this.showNotification('Озвучивание текста не поддерживается в вашем браузере', 'warning');
            return;
        }

        try {
            this.stopSpeech();

            this.currentUtterance = new SpeechSynthesisUtterance(text);
            this.currentUtterance.lang = 'ru-RU';
            this.currentUtterance.rate = 0.85;
            this.currentUtterance.pitch = 1.0;
            this.currentUtterance.volume = 1.0;

            const voices = speechSynthesis.getVoices();
            const russianVoice = voices.find(voice => 
                voice.lang.includes('ru') || voice.lang.includes('RU')
            );
            
            if (russianVoice) {
                this.currentUtterance.voice = russianVoice;
                this.currentUtterance.rate = 0.8;
            }

            button.classList.add('speaking');
            button.innerHTML = '<i class="ti ti-player-pause"></i> Остановить';
            this.isSpeaking = true;

            this.currentUtterance.onend = () => {
                this.isSpeaking = false;
                button.classList.remove('speaking');
                button.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить';
            };

            this.currentUtterance.onerror = (error) => {
                console.error('Speech synthesis error:', error);
                this.isSpeaking = false;
                button.classList.remove('speaking');
                button.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить';
                this.showNotification('Ошибка при озвучивании текста', 'error');
            };

            speechSynthesis.speak(this.currentUtterance);
            this.showNotification('Озвучивание текста...', 'info');

        } catch (error) {
            console.error('Error speaking text:', error);
            this.showNotification('Ошибка при озвучивании текста', 'error');
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
            <span>ИИ думает...</span>
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
            name: 'Основной чат',
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
                <button class="chat-item-action download-chat" title="Скачать чат">
                    <i class="ti ti-download"></i>
                </button>
                <button class="chat-item-action edit" title="Редактировать название чата">
                    <i class="ti ti-pencil"></i>
                </button>
                ${id !== 'default' ? '<button class="chat-item-action delete" title="Удалить чат"><i class="ti ti-trash"></i></button>' : ''}
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
        return 'Нет сообщений';
    }

    downloadChat(chatId) {
        const session = this.chatSessions.get(chatId);
        if (!session || session.messages.length === 0) {
            this.showNotification('Нет данных для скачивания', 'warning');
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
        
        this.showNotification('Чат скачан', 'success');
    }

    downloadCurrentChat() {
        this.downloadChat(this.currentChatId);
    }

    deleteAllChats() {
        if (this.chatSessions.size <= 1) {
            this.showNotification('Нет чатов для удаления', 'warning');
            return;
        }

        if (confirm('Вы уверены, что хотите удалить все чаты, кроме основного?')) {
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
            this.showNotification('Все чаты удалены', 'success');
        }
    }

    createNewChat() {
        const chatNumber = Array.from(this.chatSessions.values()).filter(session => 
            session.name.startsWith('Чат ')
        ).length + 1;
        
        const chatName = `Чат ${chatNumber}`;
        const chatId = this.createChatSession(chatName);
        this.switchChat(chatId);
        this.closeSidebar();
        this.showNotification(`Создан новый чат: ${chatName}`, 'success');
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
            this.showNotification(`Переключен на чат: ${session.name}`, 'info');
            
            this.saveChatSessions();
        } catch (error) {
            console.error('Error switching chat:', error);
            this.showNotification('Ошибка при переключении чата', 'error');
        }
    }

    deleteChat(chatId) {
        if (chatId === 'default') {
            this.showNotification('Основный чат нельзя удалить', 'warning');
            return;
        }

        if (this.chatSessions.size <= 1) {
            this.showNotification('Нельзя удалить последний чат', 'warning');
            return;
        }

        const session = this.chatSessions.get(chatId);
        if (!session) return;

        if (confirm(`Удалить чат "${session.name}"?`)) {
            this.chatSessions.delete(chatId);
            
            if (this.currentChatId === chatId) {
                this.switchChat('default');
            }
            
            this.saveChatSessions();
            this.updateChatList();
            this.showNotification('Чат удален', 'success');
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
            this.showNotification('Название чата не может быть пустым', 'error');
            return;
        }

        if (newName.length > this.MAX_CHAT_NAME_LENGTH) {
            this.showNotification(`Название чата слишком длинное (максимум ${this.MAX_CHAT_NAME_LENGTH} символов)`, 'error');
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
            
            this.showNotification('Название чата изменено', 'success');
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
                            name: session.name || 'Безымянный чат',
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
                this.showNotification(`Можно прикрепить не более ${this.MAX_FILES} файлов`, 'warning');
                break;
            }

            try {
                const fileType = this.getFileType(file);
                
                if (fileType === 'image') {
                    if (file.size > this.MAX_IMAGE_SIZE) {
                        this.showNotification(`Изображение "${file.name}" слишком большое (максимум 5MB)`, 'error');
                        continue;
                    }
                    const imageData = await this.processImageFile(file);
                    this.attachedImages.push(imageData);
                    this.showNotification(`Изображение "${file.name}" прикреплено`, 'success');
                    processedCount++;
                } else if (fileType === 'text' || fileType === 'code') {
                    const textData = await this.processTextFile(file);
                    this.attachedImages.push(textData);
                    this.showNotification(`Файл "${file.name}" прикреплен`, 'success');
                    processedCount++;
                } else {
                    this.showNotification(`Формат файла "${file.name}" не поддерживается`, 'error');
                }
            } catch (error) {
                console.error('Error processing file:', error);
                this.showNotification(`Ошибка обработки файла: ${file.name}`, 'error');
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
            reader.onerror = () => reject(new Error(`Ошибка загрузки изображения: ${file.name}`));
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
            reader.onerror = () => reject(new Error(`Ошибка чтения файла: ${file.name}`));
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
            const typeLabel = file.fileType === 'image' ? 'Изображение' : 
                             file.fileType === 'code' ? 'Файл кода' : 'Текстовый файл';
            
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
        this.showNotification(`${removedFile.fileType === 'image' ? 'Изображение' : 'Файл'} "${removedFile.name}" удален`, 'info');
        this.handleInputChange();
    }

    // Minimap
    setupMinimapScroll() {
        // Improved minimap scroll handling
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
            this.showNotification('Сообщения не найдены', 'warning');
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
                        ${config.available ? 'Доступно' : 'В разработке'}
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
                this.showNotification(`Модель изменена на: ${this.getModelDisplayName(newModel)}`, 'success');
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
        return this.modelConfig[model]?.description || 'Модель ИИ';
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
                        this.showNotification('Чат успешно импортирован', 'success');
                    } catch (error) {
                        this.showNotification('Ошибка при импорте файла', 'error');
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
            name: chatData.name || 'Импортированный чат',
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
                modeText = 'Обычный режим';
                modeIcon = 'ti-message';
                this.normalModeBtn.classList.add('active');
                this.userInput.placeholder = 'Задайте вопрос или опишите изображение...';
                this.inputSection.classList.remove('voice-mode-active', 'image-mode-active');
            } else if (mode === 'voice') {
                modeText = 'Режим генерации голоса';
                modeIcon = 'ti-microphone';
                this.generateVoiceBtn.classList.add('active');
                this.isVoiceMode = true;
                this.userInput.placeholder = 'Введите текст для генерации голоса...';
                this.inputSection.classList.add('voice-mode-active');
                this.inputSection.classList.remove('image-mode-active');
            } else if (mode === 'image') {
                modeText = 'Режим генерации изображений';
                modeIcon = 'ti-photo';
                this.generateImageBtn.classList.add('active');
                this.isImageMode = true;
                this.userInput.placeholder = 'Опишите изображение для генерации...';
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
        
        this.showNotification(`Режим: ${this.getModeName(mode)}`, 'info');
    }

    getModeName(mode) {
        const names = {
            'normal': 'Обычный',
            'voice': 'Генерация голоса',
            'image': 'Генерация изображений'
        };
        return names[mode] || 'Неизвестный';
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
            this.recognition.lang = 'ru-RU';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.voiceInputBtn.classList.add('active');
                this.showNotification('Слушаю...', 'info');
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.userInput.value = transcript;
                this.userInput.focus();
                this.handleInputChange();
                this.showNotification('Текст распознан', 'success');
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showNotification(`Ошибка распознавания: ${event.error}`, 'error');
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
            this.showNotification('Голосовой ввод не поддерживается', 'error');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Error starting voice recognition:', error);
                this.showNotification('Ошибка запуска голосового ввода', 'error');
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
        }
    }

    handleOnlineStatus() {
        this.showNotification('Соединение восстановлено', 'success');
        this.updateConnectionStatus(true);
    }

    handleOfflineStatus() {
        this.showNotification('Отсутствует интернет-соединение', 'error');
        this.updateConnectionStatus(false);
    }

    updateConnectionStatus(online = true) {
        if (this.connectionStatus) {
            if (online) {
                this.connectionStatus.textContent = '✅ Онлайн';
                this.connectionStatus.style.color = '';
            } else {
                this.connectionStatus.textContent = '❌ Офлайн';
                this.connectionStatus.style.color = 'var(--error-text)';
            }
        }
        
        if (this.connectionStatusText) {
            if (online) {
                this.connectionStatusText.textContent = 'Подключено';
                const statusIcon = this.connectionStatusText.previousElementSibling;
                if (statusIcon) {
                    statusIcon.style.color = 'var(--success-text)';
                }
            } else {
                this.connectionStatusText.textContent = 'Офлайн';
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
        
        // Schedule inactivity notification
        this.scheduleInactivityNotification();
    }

    showPWAInstallNotification() {
        // Проверяем, не было ли уже показано уведомление
        if (document.querySelector('.pwa-notification') || localStorage.getItem('pwa-notification-dismissed')) {
            return;
        }

        const notification = document.createElement('div');
        notification.className = 'pwa-notification';
        notification.innerHTML = `
            <div class="pwa-notification-content">
                <strong>Установите KHAI Assistant</strong>
                <p>Для лучшего опыта установите приложение на ваше устройство</p>
            </div>
            <div class="pwa-notification-actions">
                <button class="pwa-notification-btn" id="pwaDismissBtn">Позже</button>
                <button class="pwa-notification-btn primary" id="pwaInstallBtn">Установить</button>
            </div>
        `;

        document.body.appendChild(notification);

        const dismissBtn = document.getElementById('pwaDismissBtn');
        const installBtn = document.getElementById('pwaInstallBtn');

        if (dismissBtn) {
            this.addEventListener(dismissBtn, 'click', () => {
                localStorage.setItem('pwa-notification-dismissed', 'true');
                notification.remove();
            });
        }

        if (installBtn) {
            this.addEventListener(installBtn, 'click', () => {
                this.installPWA();
                localStorage.setItem('pwa-notification-dismissed', 'true');
                notification.remove();
            });
        }

        // Автоматическое скрытие через 10 секунд
        this.setTimeout(() => {
            if (notification.parentNode) {
                localStorage.setItem('pwa-notification-dismissed', 'true');
                notification.remove();
            }
        }, 10000);
    }

    async installPWA() {
        // Для iOS показываем инструкции
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        if (isIOS) {
            this.showNotification(
                'Для установки на iOS: нажмите "Поделиться" и выберите "На экран «Домой»"', 
                'info'
            );
            return;
        }
        
        // Для других платформ используем стандартную установку
        if (this.deferredPrompt) {
            try {
                this.deferredPrompt.prompt();
                const { outcome } = await this.deferredPrompt.userChoice;
                
                if (outcome === 'accepted') {
                    this.showNotification('Приложение устанавливается...', 'success');
                    this.isPWAInstalled = true;
                }
            } catch (error) {
                console.error('Ошибка установки PWA:', error);
                this.showNotification('Ошибка установки приложения', 'error');
            }
        } else {
            this.showNotification(
                'Для установки используйте меню браузера: "Установить приложение"', 
                'info'
            );
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
            <h3>Ошибка загрузки приложения</h3>
            <p>${message}</p>
            <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px; background: white; color: #ff4444; border: none; border-radius: 4px; cursor: pointer;">
                Перезагрузить
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
            <h1><i class="ti ti-brain"></i> Добро пожаловать в KHAI — Первый белорусский чат с ИИ!</h1>
            
            <p>Я ваш бесплатный ИИ-помощник с использованием передовых моделей AI.</p>
            
            <p><strong>Текущая модель: ${currentModelName}</strong> - ${currentModelDesc}</p>

            <div class="welcome-features">
                ${featuresGrid}
            </div>
            
            <p><strong>Начните общение, отправив сообщение, изображение или файл!</strong></p>

            <div class="welcome-actions">
                <button class="welcome-action-btn" onclick="khaiAssistant.focusInput()">
                    <i class="ti ti-keyboard"></i> Начать общение
                </button>
                <button class="welcome-action-btn secondary" onclick="khaiAssistant.showHelpModal()">
                    <i class="ti ti-help"></i> Открыть справку
                </button>
            </div>
        `;
        
        this.messagesContainer.appendChild(welcomeContent);
        this.scrollToBottom();
    }

    clearInput() {
        this.userInput.value = '';
        this.resetInputSize();
        this.attachedImages = [];
        this.renderAttachedFiles();
        this.userInput.focus();
        this.showNotification('Ввод очищен', 'success');
        this.handleInputChange();
    }

    clearChat() {
        if (!this.messagesContainer || this.messagesContainer.children.length === 0) {
            return;
        }

        if (confirm('Вы уверены, что хотите очистить всю историю чата?')) {
            this.messagesContainer.innerHTML = '';
            this.conversationHistory = [];
            this.saveCurrentSession();
            this.updateMinimap();
            this.showWelcomeMessage();
            this.showNotification('Чат очищен', 'success');
        }
    }

    refreshPage() {
        location.reload();
    }

    updateDocumentTitle() {
        document.title = 'KHAI — Первый белорусский чат с ИИ';
        
        const sidebarTitle = document.querySelector('.sidebar-header h3');
        if (sidebarTitle) {
            sidebarTitle.innerHTML = 'KHAI <span class="beta-badge">BETA</span>';
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
                <span>Ошибка загрузки приложения</span>
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
