// KHAI Assistant - Production Ready v2.2.0
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
            this.generateVideoBtn = document.getElementById('generateVideoBtn');
            this.searchModeBtn = document.getElementById('searchModeBtn');
            this.deepThinkingBtn = document.getElementById('deepThinkingBtn');
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
            this.themeMinimapToggle = document.getElementById('themeMinimapToggle');
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
        this.isVideoMode = false;
        this.isSearchMode = false;
        this.isDeepThinkingMode = false;
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
            "Объясни теорию относительности простыми словами...",
            "Какие есть способы улучшить производительность веб-сайта?",
            "Создай описание для приложения на основе ИИ..."
        ];

        this.modelConfig = {
            'gpt-5-nano': { 
                name: 'GPT-5 Nano', 
                description: 'Быстрая и эффективная модель для повседневных задач',
                available: true,
                context: 128000,
                type: 'text',
                modes: ['normal', 'search', 'deep-thinking']
            },
            'o3-mini': { 
                name: 'O3 Mini', 
                description: 'Продвинутая модель с улучшенными возможностями рассуждения',
                available: true,
                context: 128000,
                type: 'text',
                modes: ['normal', 'search', 'deep-thinking']
            },
            'deepseek-chat': { 
                name: 'DeepSeek Chat', 
                description: 'Универсальная модель для общения и решения задач',
                available: true,
                context: 128000,
                type: 'text',
                modes: ['normal', 'search', 'deep-thinking']
            },
            'deepseek-reasoner': { 
                name: 'DeepSeek Reasoner', 
                description: 'Специализированная модель для сложных логических рассуждений',
                available: true,
                context: 128000,
                type: 'text',
                modes: ['normal', 'deep-thinking']
            },
            'gemini-2.0-flash': { 
                name: 'Gemini 2.0 Flash', 
                description: 'Новейшая быстрая модель от Google с улучшенными возможностями',
                available: true,
                context: 128000,
                type: 'text',
                modes: ['normal', 'search']
            },
            'grok-beta': { 
                name: 'xAI Grok', 
                description: 'Модель от xAI с уникальным характером и остроумными ответами',
                available: true,
                context: 128000,
                type: 'text',
                modes: ['normal', 'search']
            },
            'gpt-4o-mini-tts': {
                name: 'GPT-4o Mini TTS',
                description: 'Модель для генерации естественной речи',
                available: true,
                context: 128000,
                type: 'voice',
                modes: ['voice']
            },
            'gpt-image-1': {
                name: 'GPT Image',
                description: 'Модель для генерации изображений',
                available: true,
                context: 128000,
                type: 'image',
                modes: ['image']
            },
            'gpt-video-1': {
                name: 'GPT Video',
                description: 'Модель для генерации видео',
                available: true,
                context: 128000,
                type: 'video',
                modes: ['video']
            },
            'claude-search': {
                name: 'Claude Search',
                description: 'Специализированная модель для поиска информации',
                available: true,
                context: 128000,
                type: 'text',
                modes: ['search']
            },
            'reasoning-pro': {
                name: 'Reasoning Pro',
                description: 'Модель для глубокого анализа и размышлений',
                available: true,
                context: 128000,
                type: 'text',
                modes: ['deep-thinking']
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
            
            // Разблокируем кнопки
            this.generateImageBtn.disabled = false;
            this.generateImageBtn.title = 'Режим генерации изображений';
            
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
            [this.clearInputBtn, 'click', () => this.clearInput()],
            [this.clearChatBtn, 'click', () => this.clearChat()],
            [this.helpBtn, 'click', () => this.showHelp()],
            [this.generateImageBtn, 'click', () => this.toggleImageMode()],
            [this.generateVoiceBtn, 'click', () => this.toggleVoiceMode()],
            [this.generateVideoBtn, 'click', () => this.toggleVideoMode()],
            [this.searchModeBtn, 'click', () => this.toggleSearchMode()],
            [this.deepThinkingBtn, 'click', () => this.toggleDeepThinkingMode()],
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
            [this.themeMinimapToggle, 'click', () => this.toggleTheme()],
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
            [document, 'keydown', (e) => this.handleGlobalKeydown(e)],
            [window, 'online', () => this.handleOnlineStatus()],
            [window, 'offline', () => this.handleOfflineStatus()],
            [window, 'resize', () => this.debounce('resize', () => this.handleResize(), 250)],
            // PWA events
            [window, 'beforeinstallprompt', (e) => this.handleBeforeInstallPrompt(e)],
            [window, 'appinstalled', () => this.handleAppInstalled()]
        ];

        events.forEach(([element, event, handler]) => {
            if (element) {
                this.addEventListener(element, event, handler);
            }
        });
    }

    // PWA Installation Handlers
    handleBeforeInstallPrompt(e) {
        e.preventDefault();
        this.deferredPrompt = e;
        this.isPWAInstalled = false;
        this.debug('PWA installation available');
    }

    handleAppInstalled() {
        this.deferredPrompt = null;
        this.isPWAInstalled = true;
        this.debug('PWA installed successfully');
        this.showNotification('Приложение успешно установлено!', 'success');
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

    addEventListener(element, event, handler) {
        if (!element) return;
        
        const wrappedHandler = (...args) => {
            try {
                handler(...args);
            } catch (error) {
                console.error(`Error in ${event} handler:`, error);
                this.showNotification('Произошла ошибка при обработке действия', 'error');
            }
        };

        element.addEventListener(event, wrappedHandler);
        
        if (!this.activeEventListeners.has(element)) {
            this.activeEventListeners.set(element, []);
        }
        this.activeEventListeners.get(element).push({ event, handler: wrappedHandler });
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
        if (this.themeMinimapToggle) {
            this.themeMinimapToggle.innerHTML = `<i class="ti ${themeIcon}"></i>`;
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
    }

    setupAutoResize() {
        this.addEventListener(this.userInput, 'input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
        });
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
            // Автоматический выбор модели в зависимости от режима
            this.autoSelectModelForMode();
            
            if (this.isVoiceMode) {
                await this.generateVoice(message);
            } else if (this.isImageMode) {
                await this.generateImage(message);
            } else if (this.isVideoMode) {
                await this.generateVideo(message);
            } else if (this.isSearchMode) {
                await this.processSearchMessage(message);
            } else if (this.isDeepThinkingMode) {
                await this.processDeepThinkingMessage(message);
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

    // Автоматический выбор модели в зависимости от режима
    autoSelectModelForMode() {
        let modelToUse;
        
        if (this.isVoiceMode) {
            modelToUse = 'gpt-4o-mini-tts';
        } else if (this.isImageMode) {
            modelToUse = 'gpt-image-1';
        } else if (this.isVideoMode) {
            modelToUse = 'gpt-video-1';
        } else if (this.isSearchMode) {
            // Для поиска используем специализированные модели
            const searchModels = ['claude-search', 'gemini-2.0-flash', 'grok-beta', 'gpt-5-nano'];
            modelToUse = searchModels.find(model => this.modelConfig[model]?.available) || 'gpt-5-nano';
        } else if (this.isDeepThinkingMode) {
            // Для глубокого размышления используем специализированные модели
            const thinkingModels = ['reasoning-pro', 'deepseek-reasoner', 'o3-mini'];
            modelToUse = thinkingModels.find(model => this.modelConfig[model]?.available) || 'o3-mini';
        } else {
            // Для обычного режима используем текущую выбранную модель
            modelToUse = this.currentModel;
        }
        
        if (modelToUse !== this.currentModel) {
            this.debug(`Автоматически выбрана модель: ${modelToUse} для режима: ${this.getCurrentModeName()}`);
        }
        
        return modelToUse;
    }

    getCurrentModeName() {
        if (this.isVoiceMode) return 'voice';
        if (this.isImageMode) return 'image';
        if (this.isVideoMode) return 'video';
        if (this.isSearchMode) return 'search';
        if (this.isDeepThinkingMode) return 'deep-thinking';
        return 'normal';
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
            
            // Обновляем placeholder в зависимости от режима
            this.updateInputPlaceholder();
        }
    }

    updateInputPlaceholder() {
        if (this.isVoiceMode) {
            this.userInput.placeholder = 'Введите текст для генерации голоса...';
        } else if (this.isImageMode) {
            this.userInput.placeholder = 'Опишите изображение для генерации...';
        } else if (this.isVideoMode) {
            this.userInput.placeholder = 'Опишите видео для генерации...';
        } else if (this.isSearchMode) {
            this.userInput.placeholder = 'Введите запрос для поиска информации...';
        } else if (this.isDeepThinkingMode) {
            this.userInput.placeholder = 'Задайте сложный вопрос для глубокого анализа...';
        } else {
            this.userInput.placeholder = 'Задайте вопрос или опишите изображение...';
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
        this.userInput.style.height = 'auto';
        const filesToProcess = [...this.attachedImages];
        this.attachedImages = [];
        this.renderAttachedFiles();
        this.handleInputChange();
        
        await this.getAIResponse(message, filesToProcess);
    }

    async processSearchMessage(message) {
        this.lastUserMessage = {
            text: message,
            files: [...this.attachedImages],
            mode: 'search'
        };
        
        this.addMessage('user', `🔍 **Поисковый запрос:** ${message}`, this.attachedImages);
        this.addToConversationHistory('user', `[ПОИСК] ${message}`, this.attachedImages);
        
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        const filesToProcess = [...this.attachedImages];
        this.attachedImages = [];
        this.renderAttachedFiles();
        this.handleInputChange();
        
        await this.getSearchResponse(message, filesToProcess);
    }

    async processDeepThinkingMessage(message) {
        this.lastUserMessage = {
            text: message,
            files: [...this.attachedImages],
            mode: 'deep-thinking'
        };
        
        this.addMessage('user', `💭 **Вопрос для глубокого анализа:** ${message}`, this.attachedImages);
        this.addToConversationHistory('user', `[ГЛУБОКИЙ АНАЛИЗ] ${message}`, this.attachedImages);
        
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        const filesToProcess = [...this.attachedImages];
        this.attachedImages = [];
        this.renderAttachedFiles();
        this.handleInputChange();
        
        await this.getDeepThinkingResponse(message, filesToProcess);
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

    async getSearchResponse(userMessage, files) {
        this.removeTypingIndicator();
        this.activeTypingIndicator = this.showTypingIndicator('🔍 Ищу информацию...');
        
        try {
            const prompt = await this.buildSearchPrompt(userMessage, files);
            const response = await this.callAIService(prompt);
            
            this.removeTypingIndicator();
            await this.processSearchAIResponse(response);
            
        } catch (error) {
            this.removeTypingIndicator();
            this.handleError('Ошибка при поиске информации', error);
        }
    }

    async getDeepThinkingResponse(userMessage, files) {
        this.removeTypingIndicator();
        this.activeTypingIndicator = this.showTypingIndicator('💭 Глубоко анализирую...');
        
        try {
            const prompt = await this.buildDeepThinkingPrompt(userMessage, files);
            const response = await this.callAIService(prompt);
            
            this.removeTypingIndicator();
            await this.processDeepThinkingAIResponse(response);
            
        } catch (error) {
            this.removeTypingIndicator();
            this.handleError('Ошибка при глубоком анализе', error);
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

    async buildSearchPrompt(userMessage, files) {
        if (files.length > 0) {
            const file = files[0];
            
            if (file.fileType === 'image') {
                const extractedText = await puter.ai.img2txt(file.data);
                return `ПОИСКОВЫЙ ЗАПРОС С ИЗОБРАЖЕНИЕМ:

Пользователь отправил изображение "${file.name}" с поисковым запросом: "${userMessage}"

Извлеченный текст с изображения: "${extractedText}"

Проведи поиск информации по данному запросу. Предоставь актуальные, проверенные данные. Если на изображении есть дополнительная информация - используй её для уточнения поиска. Структурируй ответ, выдели ключевые факты. Отвечай на русском языке.`;
            } else if (file.fileType === 'text' || file.fileType === 'code') {
                const fileContent = file.data;
                return `ПОИСКОВЫЙ ЗАПРОС С ФАЙЛОМ:

Пользователь отправил файл "${file.name}" с поисковым запросом: "${userMessage}"

Содержимое файла:
"""
${fileContent}
"""

Проведи поиск информации, связанной с содержимым файла и запросом пользователя. Предоставь развернутый ответ с актуальными данными. Структурируй информацию, выдели ключевые моменты. Отвечай на русском языке.`;
            }
        } else {
            return `ПОИСКОВЫЙ ЗАПРОС:

Пользователь ищет информацию по запросу: "${userMessage}"

Проведи комплексный поиск по данному запросу. Предоставь:
1. Актуальные и проверенные факты
2. Различные точки зрения (если применимо)
3. Практические рекомендации
4. Источники информации (если доступны)

Структурируй ответ для легкого восприятия. Отвечай на русском языке.`;
        }
    }

    async buildDeepThinkingPrompt(userMessage, files) {
        if (files.length > 0) {
            const file = files[0];
            
            if (file.fileType === 'image') {
                const extractedText = await puter.ai.img2txt(file.data);
                return `ГЛУБОКИЙ АНАЛИЗ С ИЗОБРАЖЕНИЕМ:

Пользователь отправил изображение "${file.name}" с вопросом для глубокого анализа: "${userMessage}"

Извлеченный текст с изображения: "${extractedText}"

Проведи глубокий анализ данного вопроса. Рассмотри проблему с разных сторон, проанализируй причинно-следственные связи, предложи комплексное решение. Учитывай контекст изображения. Отвечай подробно и структурированно на русском языке.`;
            } else if (file.fileType === 'text' || file.fileType === 'code') {
                const fileContent = file.data;
                return `ГЛУБОКИЙ АНАЛИЗ С ФАЙЛОМ:

Пользователь отправил файл "${file.name}" с вопросом для глубокого анализа: "${userMessage}"

Содержимое файла:
"""
${fileContent}
"""

Проведи комплексный анализ данного вопроса. Рассмотри все аспекты проблемы, проанализируй взаимосвязи, предложи глубокие инсайты и рекомендации. Учитывай содержимое файла. Структурируй ответ для максимальной ясности. Отвечай на русском языке.`;
            }
        } else {
            return `ГЛУБОКИЙ АНАЛИЗ:

Пользователь задал сложный вопрос для глубокого анализа: "${userMessage}"

Проведи всесторонний анализ данной проблемы. Рассмотри:
1. Различные аспекты и перспективы
2. Причинно-следственные связи
3. Возможные решения и их последствия
4. Рекомендации и выводы

Прояви критическое мышление, будь максимально подробным и структурированным. Отвечай на русском языке.`;
        }
    }

    async callAIService(prompt) {
        if (typeof puter?.ai?.chat !== 'function') {
            throw new Error('Функция чата недоступна');
        }
        
        // Автоматический выбор модели в зависимости от режима
        const modelToUse = this.autoSelectModelForMode();
        
        const modelOptions = {
            'gpt-5-nano': { model: 'gpt-5-nano' },
            'o3-mini': { model: 'o3-mini' },
            'deepseek-chat': { model: 'deepseek-chat' },
            'deepseek-reasoner': { model: 'deepseek-reasoner' },
            'gemini-2.0-flash': { model: 'gemini-2.0-flash' },
            'grok-beta': { model: 'grok-beta' },
            'gpt-4o-mini-tts': { model: 'gpt-4o-mini' },
            'gpt-image-1': { model: 'gpt-4o-mini' },
            'gpt-video-1': { model: 'gpt-4o-mini' },
            'claude-search': { model: 'gpt-4o-mini' },
            'reasoning-pro': { model: 'gpt-4o-mini' }
        };
        
        let systemPrompt = "Ты полезный AI-ассистент. Отвечай на русском языке понятно и подробно. Поддерживай естественный диалог и учитывай контекст предыдущих сообщений.";
        
        // Специализированные системные промпты для разных режимов
        if (this.isSearchMode) {
            systemPrompt = "Ты специализированный поисковый ассистент. Предоставляй актуальную, проверенную информацию. Структурируй ответы, выделяй ключевые факты. Будь точным и объективным.";
        } else if (this.isDeepThinkingMode) {
            systemPrompt = "Ты эксперт по глубокому анализу и критическому мышлению. Тщательно анализируй проблемы со всех сторон, рассматривай причинно-следственные связи, предоставляй комплексные решения. Будь максимально подробным и структурированным.";
        }
        
        const options = {
            ...modelOptions[modelToUse],
            systemPrompt: systemPrompt,
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

    async processSearchAIResponse(response) {
        this.activeStreamingMessage = this.createStreamingMessage('search');
        this.currentStreamController = response;
        
        let fullResponse = '';
        try {
            for await (const part of response) {
                if (this.generationAborted) break;
                
                if (part?.text) {
                    fullResponse += part.text;
                    this.updateStreamingMessage(this.activeStreamingMessage, fullResponse, 'search');
                    await this.delay(10);
                }
            }
            
            if (!this.generationAborted) {
                this.finalizeSearchMessage(this.activeStreamingMessage, fullResponse);
                this.addToConversationHistory('assistant', `[ПОИСК] ${fullResponse}`);
                this.saveCurrentSession();
                this.updateMinimap();
                this.isGenerating = false;
                this.isProcessing = false;
                this.updateSendButton(false);
            }
        } catch (error) {
            if (!this.generationAborted) {
                console.error('Error processing search response:', error);
                this.handleError('Ошибка при обработке поискового ответа', error);
                this.isGenerating = false;
                this.isProcessing = false;
                this.updateSendButton(false);
            }
        } finally {
            this.activeStreamingMessage = null;
            this.currentStreamController = null;
        }
    }

    async processDeepThinkingAIResponse(response) {
        this.activeStreamingMessage = this.createStreamingMessage('deep-thinking');
        this.currentStreamController = response;
        
        let fullResponse = '';
        try {
            for await (const part of response) {
                if (this.generationAborted) break;
                
                if (part?.text) {
                    fullResponse += part.text;
                    this.updateStreamingMessage(this.activeStreamingMessage, fullResponse, 'deep-thinking');
                    await this.delay(10);
                }
            }
            
            if (!this.generationAborted) {
                this.finalizeDeepThinkingMessage(this.activeStreamingMessage, fullResponse);
                this.addToConversationHistory('assistant', `[ГЛУБОКИЙ АНАЛИЗ] ${fullResponse}`);
                this.saveCurrentSession();
                this.updateMinimap();
                this.isGenerating = false;
                this.isProcessing = false;
                this.updateSendButton(false);
            }
        } catch (error) {
            if (!this.generationAborted) {
                console.error('Error processing deep thinking response:', error);
                this.handleError('Ошибка при обработке глубокого анализа', error);
                this.isGenerating = false;
                this.isProcessing = false;
                this.updateSendButton(false);
            }
        } finally {
            this.activeStreamingMessage = null;
            this.currentStreamController = null;
        }
    }

    delay(ms) {
        return new Promise(resolve => this.setTimeout(resolve, ms));
    }

    createStreamingMessage(mode = 'normal') {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-ai streaming-message ${mode === 'search' ? 'message-search' : mode === 'deep-thinking' ? 'message-deep-thinking' : ''}`;
        messageElement.id = 'streaming-' + Date.now();
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content streaming-content';
        
        let typingText = 'ИИ думает...';
        if (mode === 'search') {
            typingText = '🔍 Ищу информацию...';
        } else if (mode === 'deep-thinking') {
            typingText = '💭 Глубоко анализирую...';
        }
        
        messageContent.innerHTML = `
            <div class="typing-indicator-inline">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                <span>${typingText}</span>
            </div>
            <div class="streaming-text"></div>
        `;
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        return messageElement.id;
    }

    showTypingIndicator(text = 'ИИ думает...') {
        const messagesContainer = document.getElementById('messagesContainer');
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message message-ai typing-indicator';
        typingIndicator.id = 'typing-' + Date.now();
        
        typingIndicator.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <span>${text}</span>
        `;
        
        messagesContainer.appendChild(typingIndicator);
        this.scrollToBottom();
        
        return typingIndicator.id;
    }

    updateStreamingMessage(messageId, content, mode = 'normal') {
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
        const modelToUse = this.autoSelectModelForMode();
        modelIndicator.textContent = `Модель: ${this.getModelDisplayName(modelToUse)} • ${this.getModelDescription(modelToUse)}`;
        messageContent.appendChild(modelIndicator);
        
        this.attachMessageHandlers(messageElement);
        this.addCodeDownloadButtons(messageElement, fullContent);
        this.scrollToBottom();
    }

    finalizeSearchMessage(messageId, fullContent) {
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
        messageContent.innerHTML = `🔍 **Результаты поиска:**\n\n${processedContent}`;
        
        const modelIndicator = document.createElement('div');
        modelIndicator.className = 'model-indicator';
        const modelToUse = this.autoSelectModelForMode();
        modelIndicator.textContent = `Модель: ${this.getModelDisplayName(modelToUse)} • Специализированная поисковая модель`;
        messageContent.appendChild(modelIndicator);
        
        this.attachMessageHandlers(messageElement);
        this.addCodeDownloadButtons(messageElement, fullContent);
        this.scrollToBottom();
    }

    finalizeDeepThinkingMessage(messageId, fullContent) {
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
        messageContent.innerHTML = `💭 **Глубокий анализ:**\n\n${processedContent}`;
        
        const modelIndicator = document.createElement('div');
        modelIndicator.className = 'model-indicator';
        const modelToUse = this.autoSelectModelForMode();
        modelIndicator.textContent = `Модель: ${this.getModelDisplayName(modelToUse)} • Модель для глубокого анализа`;
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
            if (typeof puter?.ai?.txt2img !== 'function') {
                throw new Error('Функция генерации изображений недоступна');
            }
            
            this.addMessage('user', `🖼️ **Генерация изображения по запросу:** "${prompt}"`);
            
            this.userInput.value = '';
            this.userInput.style.height = 'auto';
            
            this.showNotification('Генерация изображения...', 'info');
            
            // Генерация изображения с помощью Puter AI
            const image = await puter.ai.txt2img(prompt, { 
                model: "gpt-image-1", 
                quality: "standard" 
            });
            
            // Добавляем сообщение с изображением
            const messageElement = document.createElement('div');
            messageElement.className = 'message message-ai';
            
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            
            messageContent.innerHTML = `
                🖼️ **Сгенерированное изображение по запросу:** "${this.escapeHtml(prompt)}"
                <div class="message-image">
                    <img src="${image.src}" alt="Сгенерированное изображение: ${prompt}" style="max-width: 100%; border-radius: 8px;">
                </div>
                <div class="message-actions">
                    <button class="action-btn-small download-file-btn" onclick="khaiAssistant.downloadImage('${image.src}', '${prompt.replace(/[^a-zA-Z0-9]/g, '_')}')">
                        <i class="ti ti-download"></i> Скачать изображение
                    </button>
                </div>
            `;
            
            const modelIndicator = document.createElement('div');
            modelIndicator.className = 'model-indicator';
            modelIndicator.textContent = `Модель: GPT Image • Специализированная модель для генерации изображений`;
            messageContent.appendChild(modelIndicator);
            
            messageElement.appendChild(messageContent);
            this.messagesContainer.appendChild(messageElement);
            this.scrollToBottom();
            
            this.addToConversationHistory('assistant', `Сгенерировано изображение по запросу: ${prompt}`);
            this.saveCurrentSession();
            
        } catch (error) {
            this.handleError('Ошибка при генерации изображения', error);
        }
    }

    async generateVideo(prompt) {
        try {
            if (typeof puter?.ai?.txt2vid !== 'function') {
                throw new Error('Функция генерации видео недоступна');
            }
            
            this.addMessage('user', `🎬 **Генерация видео по запросу:** "${prompt}"`);
            
            this.userInput.value = '';
            this.userInput.style.height = 'auto';
            
            this.showNotification('Генерация видео... Это может занять несколько минут.', 'info');
            
            // Генерация видео с помощью Puter AI
            const video = await puter.ai.txt2vid(prompt, { 
                model: "gpt-video-1", 
                duration: 10,
                resolution: "720p"
            });
            
            // Добавляем сообщение с видео
            const messageElement = document.createElement('div');
            messageElement.className = 'message message-ai message-video';
            
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            
            messageContent.innerHTML = `
                🎬 **Сгенерированное видео по запросу:** "${this.escapeHtml(prompt)}"
                <div class="message-video-player" style="margin-top: 12px;">
                    <video controls style="max-width: 100%; border-radius: 8px;">
                        <source src="${video.src}" type="video/mp4">
                        Ваш браузер не поддерживает видео элементы.
                    </video>
                </div>
                <div class="message-actions">
                    <button class="action-btn-small download-file-btn" onclick="khaiAssistant.downloadVideo('${video.src}', '${prompt.replace(/[^a-zA-Z0-9]/g, '_')}')">
                        <i class="ti ti-download"></i> Скачать видео
                    </button>
                </div>
            `;
            
            const modelIndicator = document.createElement('div');
            modelIndicator.className = 'model-indicator';
            modelIndicator.textContent = `Модель: GPT Video • Специализированная модель для генерации видео`;
            messageContent.appendChild(modelIndicator);
            
            messageElement.appendChild(messageContent);
            this.messagesContainer.appendChild(messageElement);
            this.scrollToBottom();
            
            this.addToConversationHistory('assistant', `Сгенерировано видео по запросу: ${prompt}`);
            this.saveCurrentSession();
            
        } catch (error) {
            this.handleError('Ошибка при генерации видео', error);
        }
    }

    async downloadImage(imageUrl, filename) {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename || 'khai_image'}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.showNotification('Изображение скачано', 'success');
        } catch (error) {
            console.error('Download error:', error);
            this.showError('Не удалось скачать изображение');
        }
    }

    async downloadVideo(videoUrl, filename) {
        try {
            const response = await fetch(videoUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename || 'khai_video'}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.showNotification('Видео скачано', 'success');
        } catch (error) {
            console.error('Download error:', error);
            this.showError('Не удалось скачать видео');
        }
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
            this.userInput.style.height = 'auto';
            
            this.showNotification('Генерация голоса...', 'info');
            
            // Генерация голоса с помощью Puter AI
            const audio = await puter.ai.txt2speech(
                text,
                {
                    provider: "openai",
                    model: "gpt-4o-mini-tts",
                    voice: "alloy",
                    response_format: "mp3",
                    instructions: "Sound cheerful but not overly fast."
                }
            );
            
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
            <div class="message-actions">
                <button class="action-btn-small download-file-btn" onclick="khaiAssistant.downloadAudio('${audio.src}', '${text.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}')">
                    <i class="ti ti-download"></i> Скачать аудио
                </button>
            </div>
        `;
        
        const modelIndicator = document.createElement('div');
        modelIndicator.className = 'model-indicator';
        modelIndicator.textContent = `Модель: GPT-4o Mini TTS • Модель для генерации естественной речи`;
        messageContent.appendChild(modelIndicator);
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        const audioElement = messageContent.querySelector('audio');
        audioElement.play().catch(e => {
            console.log('Autoplay prevented:', e);
        });
    }

    async downloadAudio(audioUrl, filename) {
        try {
            const response = await fetch(audioUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename || 'khai_audio'}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.showNotification('Аудио скачано', 'success');
        } catch (error) {
            console.error('Download error:', error);
            this.showError('Не удалось скачать аудио');
        }
    }

    addMessage(role, content, images = []) {
        const messageElement = document.createElement('div');
        
        // Добавляем специальные классы для разных режимов
        let additionalClass = '';
        if (this.isSearchMode) {
            additionalClass = 'message-search';
        } else if (this.isDeepThinkingMode) {
            additionalClass = 'message-deep-thinking';
        } else if (this.isVideoMode) {
            additionalClass = 'message-video';
        }
        
        messageElement.className = `message message-${role} ${additionalClass}`;
        
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
            const modelToUse = this.autoSelectModelForMode();
            modelIndicator.textContent = `Модель: ${this.getModelDisplayName(modelToUse)} • ${this.getModelDescription(modelToUse)}`;
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
            this.showNotification('Основной чат нельзя удалить', 'warning');
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
            localStorage.setItem('khai-assistant-chat-sessions', JSON.stringify(sessions));
        } catch (error) {
            console.error('Error saving chat sessions:', error);
        }
    }

    loadChatSessions() {
        try {
            const saved = localStorage.getItem('khai-assistant-chat-sessions');
            if (saved) {
                const sessions = JSON.parse(saved);
                this.chatSessions = new Map(sessions);
            }
        } catch (error) {
            console.error('Error loading chat sessions:', error);
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
    updateMinimap() {
        if (!this.minimapContent || !this.messagesContainer) return;
        
        this.minimapContent.innerHTML = '';
        const messages = this.messagesContainer.querySelectorAll('.message:not(.typing-indicator):not(.streaming-message)');
        
        messages.forEach((message, index) => {
            const block = document.createElement('div');
            block.className = `minimap-message ${message.classList.contains('message-user') ? 'user' : 'ai'}`;
            block.dataset.index = index;
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
        
        const viewportHeight = (visibleHeight / containerHeight) * this.chatMinimap.offsetHeight;
        const viewportTop = (scrollTop / containerHeight) * this.chatMinimap.offsetHeight;
        
        this.minimapViewport.style.height = `${Math.max(viewportHeight, 10)}px`;
        this.minimapViewport.style.top = `${viewportTop}px`;
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
        
        const messages = this.messagesContainer.querySelectorAll('.message-content');
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedTerm, 'gi');
        
        messages.forEach(message => {
            const originalContent = message.dataset.originalContent || message.innerHTML;
            message.dataset.originalContent = originalContent;
            
            const highlightedContent = originalContent.replace(regex, match => 
                `<span class="search-highlight">${match}</span>`
            );
            
            message.innerHTML = highlightedContent;
        });

        if (this.minimapContent) {
            const minimapMessages = this.minimapContent.querySelectorAll('.minimap-message');
            const messageElements = this.messagesContainer.querySelectorAll('.message');
            
            minimapMessages.forEach((msg, index) => {
                const messageElement = messageElements[index];
                if (messageElement) {
                    const messageText = messageElement.textContent || '';
                    if (regex.test(messageText)) {
                        msg.classList.add('search-highlighted');
                    } else {
                        msg.classList.remove('search-highlighted');
                    }
                }
            });
        }
    }

    clearSearchHighlights() {
        if (!this.messagesContainer) return;
        
        const messages = this.messagesContainer.querySelectorAll('.message-content');
        
        messages.forEach(message => {
            if (message.dataset.originalContent) {
                message.innerHTML = message.dataset.originalContent;
                delete message.dataset.originalContent;
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
        this.updateModelListForCurrentMode();
    }

    updateModelListForCurrentMode() {
        if (!this.modelList) return;
        
        this.modelList.innerHTML = '';
        
        const currentMode = this.getCurrentModeName();
        
        Object.entries(this.modelConfig).forEach(([modelId, config]) => {
            // Проверяем, поддерживает ли модель текущий режим
            const supportsCurrentMode = config.modes.includes(currentMode);
            const isAvailable = config.available && supportsCurrentMode;
            
            const modelItem = document.createElement('div');
            modelItem.className = `model-item ${modelId === this.currentModel ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`;
            modelItem.dataset.model = modelId;
            
            if (!isAvailable) {
                modelItem.style.opacity = '0.6';
                modelItem.style.pointerEvents = 'none';
            }
            
            let statusText = 'Доступно';
            let statusClass = 'available';
            
            if (!config.available) {
                statusText = 'В разработке';
                statusClass = 'coming-soon';
            } else if (!supportsCurrentMode) {
                statusText = 'Не для этого режима';
                statusClass = 'coming-soon';
            }
            
            modelItem.innerHTML = `
                <div class="model-item-header">
                    <span class="model-name">${config.name}</span>
                    <span class="model-status ${statusClass}">
                        ${statusText}
                    </span>
                </div>
                <div class="model-description">${config.description}</div>
                <div class="model-type" style="font-size: 10px; color: var(--text-tertiary); margin-top: 4px;">
                    Тип: ${config.type === 'text' ? 'Текст' : config.type === 'voice' ? 'Голос' : config.type === 'image' ? 'Изображения' : 'Видео'} • 
                    Режимы: ${config.modes.map(m => this.getModeName(m)).join(', ')}
                </div>
            `;
            
            if (isAvailable) {
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

    // Mode Management
    toggleImageMode() {
        this.isImageMode = !this.isImageMode;
        this.setMode(this.isImageMode ? 'image' : 'normal');
    }

    toggleVoiceMode() {
        this.isVoiceMode = !this.isVoiceMode;
        this.setMode(this.isVoiceMode ? 'voice' : 'normal');
    }

    toggleVideoMode() {
        this.isVideoMode = !this.isVideoMode;
        this.setMode(this.isVideoMode ? 'video' : 'normal');
    }

    toggleSearchMode() {
        this.isSearchMode = !this.isSearchMode;
        this.setMode(this.isSearchMode ? 'search' : 'normal');
    }

    toggleDeepThinkingMode() {
        this.isDeepThinkingMode = !this.isDeepThinkingMode;
        this.setMode(this.isDeepThinkingMode ? 'deep-thinking' : 'normal');
    }

    setMode(mode) {
        // Reset all modes
        this.isImageMode = false;
        this.isVoiceMode = false;
        this.isVideoMode = false;
        this.isSearchMode = false;
        this.isDeepThinkingMode = false;
        
        // Reset all mode buttons
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
            } else if (mode === 'voice') {
                modeText = 'Режим генерации голоса';
                modeIcon = 'ti-microphone';
                this.generateVoiceBtn.classList.add('active');
                this.isVoiceMode = true;
            } else if (mode === 'image') {
                modeText = 'Режим генерации изображений';
                modeIcon = 'ti-photo';
                this.generateImageBtn.classList.add('active');
                this.isImageMode = true;
            } else if (mode === 'video') {
                modeText = 'Режим генерации видео';
                modeIcon = 'ti-video';
                this.generateVideoBtn.classList.add('active');
                this.isVideoMode = true;
            } else if (mode === 'search') {
                modeText = 'Режим поиска информации';
                modeIcon = 'ti-search';
                this.searchModeBtn.classList.add('active');
                this.isSearchMode = true;
            } else if (mode === 'deep-thinking') {
                modeText = 'Режим глубокого анализа';
                modeIcon = 'ti-brain';
                this.deepThinkingBtn.classList.add('active');
                this.isDeepThinkingMode = true;
            }
            
            modeIndicator.innerHTML = `<i class="ti ${modeIcon}"></i> ${modeText}`;
            
            // Reset all input section classes
            this.inputSection.classList.remove(
                'voice-mode-active', 
                'image-mode-active', 
                'video-mode-active',
                'search-mode-active',
                'deep-thinking-mode-active'
            );
            
            // Add appropriate class for current mode
            if (mode === 'voice') {
                this.inputSection.classList.add('voice-mode-active');
            } else if (mode === 'image') {
                this.inputSection.classList.add('image-mode-active');
            } else if (mode === 'video') {
                this.inputSection.classList.add('video-mode-active');
            } else if (mode === 'search') {
                this.inputSection.classList.add('search-mode-active');
            } else if (mode === 'deep-thinking') {
                this.inputSection.classList.add('deep-thinking-mode-active');
            }
        }
        
        const activeBtn = document.querySelector('.mode-btn.active');
        if (activeBtn) {
            const activeBtnText = activeBtn.querySelector('.btn-text');
            if (activeBtnText) {
                activeBtnText.style.display = 'inline';
            }
        }
        
        this.updateInputPlaceholder();
        this.showNotification(`Режим: ${this.getModeName(mode)}`, 'info');
        
        // Обновляем список моделей для текущего режима
        this.updateModelListForCurrentMode();
    }

    getModeName(mode) {
        const names = {
            'normal': 'Обычный',
            'voice': 'Генерация голоса',
            'image': 'Генерация изображений',
            'video': 'Генерация видео',
            'search': 'Поиск информации',
            'deep-thinking': 'Глубокий анализ'
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
    }

    setupResponsiveMinimap() {
        const isMobile = window.innerWidth <= 480;
        if (isMobile && this.chatMinimapContainer) {
            this.chatMinimapContainer.style.display = 'none';
        } else if (this.chatMinimapContainer) {
            this.chatMinimapContainer.style.display = 'flex';
        }
    }

    // PWA
    checkPWAInstallation() {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                           window.navigator.standalone;
        
        this.isPWAInstalled = isStandalone;
        
        // Показываем уведомление только если не в standalone режиме и не было отклонения
        if (!isStandalone && !localStorage.getItem('pwa-notification-dismissed')) {
            this.setTimeout(() => {
                this.showPWAInstallNotification();
            }, 3000);
        }
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
        if (this.conversationHistory.length > 0) {
            return;
        }
        
        const currentModelName = this.getModelDisplayName(this.currentModel);
        const currentModelDesc = this.getModelDescription(this.currentModel);
        
        const welcomeMessage = `# 👋 Добро пожаловать в KHAI — Первый белорусский чат с ИИ!

Я ваш бесплатный ИИ-помощник с использованием передовых моделей AI. 

## 🎯 Основные возможности:
• **Умные ответы на вопросы** - используя различные модели ИИ
• **Анализ изображений** - извлечение текста и решение задач по фото
• **Анализ файлов** - чтение и анализ содержимого файлов (текст, код, XML, CSV, YAML и др.)
• **Голосовой ввод** - говорите вместо того, чтобы печатать
• **Генерация голоса** - преобразование текста в естественную речь с помощью OpenAI TTS
• **Генерация изображений** - создание изображений по текстовому описанию
• **🎬 Генерация видео** - создание видео по текстовому описанию
• **🔍 Поиск информации** - специализированный режим для поиска актуальных данных
• **💭 Глубокий анализ** - режим для комплексного анализа сложных вопросов
• **Озвучивание ответов** - слушайте ответы ИИ в аудиоформате
• **Контекстный диалог** - помню историю нашего разговора
• **Подсветка синтаксиса** - красивое отображение кода
• **Копирование кода** - удобное копирование фрагментов кода
• **Стриминг ответов** - ответы появляются постепенно
• **Мульти-чаты** - создавайте отдельные чаты для разных тем
• **Редактирование названий чатов** - нажмите на иконку карандаша

**Текущая модель: ${currentModelName}** - ${currentModelDesc}

**Начните общение, отправив сообщение, изображение или файл!**`;

        this.addMessage('ai', welcomeMessage);
        this.addToConversationHistory('assistant', welcomeMessage);
    }

    showHelp() {
        const currentModelName = this.getModelDisplayName(this.currentModel);
        
        const helpMessage = `# 🆘 Помощь по KHAI Assistant

## 🤖 Автоматический выбор моделей:
• **Текстовый режим** - использует выбранную текстовую модель (GPT-5 Nano, O3 Mini и др.)
• **Голосовой режим** - автоматически использует GPT-4o Mini TTS для генерации речи
• **Режим изображений** - автоматически использует GPT Image для генерации изображений
• **🎬 Режим видео** - автоматически использует GPT Video для генерации видео
• **🔍 Режим поиска** - автоматически выбирает лучшую модель для поиска информации
• **💭 Режим глубокого анализа** - автоматически выбирает модель для комплексного анализа

## 💬 Система чатов:
• **Создание нового чата** - нажмите "Новый чат" в меню
• **Редактирование названия** - нажмите на иконку карандаша рядом с чатом
• **Скачать чат** - нажмите на иконку загрузки для экспорта
• **Импорт чата** - загрузите ранее сохраненный чат
• **Удалить все чаты** - кнопка внизу меню (кроме основного)
• **Переключение между чатами** - выберите чат из списка в меню
• **Удаление чатов** - нажмите ❌ рядом с названием чата (кроме основного)

## 📁 Работа с файлами:
• **Изображения** - прикрепите для анализа текста и содержимого (JPEG, PNG, GIF, WebP)
• **Текстовые файлы** - прикрепите для анализа содержимого (.txt, .md, .html, .css, .js, .json)
• **Файлы кода** - анализ кода на Python, Java, C++, C#, PHP, Ruby, Go, Swift, Kotlin, Scala, Rust
• **Другие форматы** - XML, CSV, YAML, YML
• **Максимум файлов** - можно прикрепить до 3 файлов за раз

## 🔊 Аудио функции:
• **Генерация голоса** - создает аудио из текста с помощью OpenAI TTS
• **Озвучить ответ** - воспроизводит ответ ИИ
• **Остановить озвучку** - нажмите кнопку повторно для остановки

## 🖼️ Генерация изображений:
• **Нажмите кнопку изображения** для активации режима генерации
• **Опишите изображение** - что вы хотите сгенерировать
• **Нажмите Отправить** - ИИ создаст изображение по вашему описанию
• **Скачайте результат** - используйте кнопку скачивания под изображением

## 🎬 Генерация видео:
• **Нажмите кнопку видео** для активации режима генерации
• **Опишите видео** - сценарий, действие, стиль
• **Нажмите Отправить** - ИИ создаст видео по вашему описанию
• **Скачайте результат** - используйте кнопку скачивания под видео

## 🔍 Режим поиска:
• **Актуальная информация** - получайте свежие данные по запросам
• **Структурированные ответы** - информация представляется в удобном формате
• **Различные источники** - поиск по множеству информационных баз

## 💭 Режим глубокого анализа:
• **Комплексный подход** - анализ проблем со всех сторон
• **Критическое мышление** - глубокое проникновение в суть вопроса
• **Структурированные выводы** - четкие рекомендации и решения

**Попробуйте отправить изображение или файл с вопросом!**`;

        this.addMessage('ai', helpMessage);
        this.addToConversationHistory('assistant', helpMessage);
    }

    clearInput() {
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
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
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
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
