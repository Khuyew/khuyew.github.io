// KHAI Assistant - Production Ready v2.1.0
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
                available: false, // Блокируем генерацию изображений
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
        this.MAX_CHAT_NAME_LENGTH = 16; // Изменено с 50 на 16
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
        this.userInput.style.height = 'auto';
        const filesToProcess = [...this.attachedImages];
        this.attachedImages = [];
        this.renderAttachedFiles();
        this.handleInputChange();
        
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
        
        this.attachCopyButtons(messageContent);
        this.highlightCodeBlocks(messageContent);
    }

    processCodeBlocks(text) {
        if (typeof marked === 'undefined') {
            return this.escapeHtml(text).replace(/\n/g, '<br>');
        }
        
        try {
            return marked.parse(text);
        } catch (error) {
            console.error('Error parsing markdown:', error);
            return this.escapeHtml(text).replace(/\n/g, '<br>');
        }
    }

    attachCopyButtons(container) {
        const codeBlocks = container.querySelectorAll('pre code');
        codeBlocks.forEach(codeBlock => {
            const pre = codeBlock.parentElement;
            if (pre.querySelector('.copy-btn')) return;
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = '<i class="ti ti-copy"></i>';
            copyBtn.title = 'Копировать код';
            copyBtn.onclick = () => this.copyCodeToClipboard(codeBlock);
            
            pre.style.position = 'relative';
            pre.appendChild(copyBtn);
        });
    }

    async copyCodeToClipboard(codeBlock) {
        try {
            const text = codeBlock.textContent || '';
            await navigator.clipboard.writeText(text);
            this.showNotification('Код скопирован в буфер обмена', 'success');
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            this.showNotification('Ошибка при копировании кода', 'error');
        }
    }

    highlightCodeBlocks(container) {
        if (typeof hljs !== 'undefined') {
            const codeBlocks = container.querySelectorAll('pre code');
            codeBlocks.forEach(block => {
                hljs.highlightElement(block);
            });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    addMessage(role, content, files = []) {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${role}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (role === 'user') {
            messageContent.innerHTML = this.escapeHtml(content).replace(/\n/g, '<br>');
            
            if (files.length > 0) {
                files.forEach(file => {
                    const fileElement = document.createElement('div');
                    fileElement.className = 'attached-file';
                    
                    if (file.fileType === 'image') {
                        fileElement.innerHTML = `
                            <div class="file-preview">
                                <img src="${file.data}" alt="${file.name}" loading="lazy">
                                <span class="file-name">${this.escapeHtml(file.name)}</span>
                            </div>
                        `;
                    } else {
                        fileElement.innerHTML = `
                            <div class="file-preview">
                                <i class="ti ti-file-text"></i>
                                <span class="file-name">${this.escapeHtml(file.name)}</span>
                                <span class="file-size">${this.formatFileSize(file.size)}</span>
                            </div>
                        `;
                    }
                    
                    messageContent.appendChild(fileElement);
                });
            }
        } else {
            const processedContent = this.processCodeBlocks(content);
            messageContent.innerHTML = processedContent;
            
            const modelIndicator = document.createElement('div');
            modelIndicator.className = 'model-indicator';
            modelIndicator.textContent = `Модель: ${this.getModelDisplayName(this.currentModel)} • ${this.getModelDescription(this.currentModel)}`;
            messageContent.appendChild(modelIndicator);
        }
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        
        if (role === 'assistant') {
            this.highlightCodeBlocks(messageContent);
            this.attachCopyButtons(messageContent);
        }
        
        this.scrollToBottom();
        this.updateMinimap();
        
        return messageElement;
    }

    showTypingIndicator() {
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-ai typing-indicator';
        messageElement.id = 'typing-' + Date.now();
        
        messageElement.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                <span>ИИ думает...</span>
            </div>
        `;
        
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        return messageElement.id;
    }

    removeTypingIndicator() {
        if (this.activeTypingIndicator) {
            const indicator = document.getElementById(this.activeTypingIndicator);
            if (indicator && indicator.parentNode) {
                indicator.remove();
            }
            this.activeTypingIndicator = null;
        }
    }

    // File Handling
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        
        if (files.length + this.attachedImages.length > this.MAX_FILES) {
            this.showNotification(`Максимум ${this.MAX_FILES} файлов`, 'error');
            event.target.value = '';
            return;
        }
        
        files.forEach(file => {
            this.processFile(file);
        });
        
        event.target.value = '';
    }

    async processFile(file) {
        const fileType = this.getFileType(file);
        
        if (!fileType) {
            this.showNotification(`Неподдерживаемый формат файла: ${file.name}`, 'error');
            return;
        }
        
        if (file.size > this.MAX_IMAGE_SIZE && fileType === 'image') {
            this.showNotification(`Изображение слишком большое (максимум ${this.formatFileSize(this.MAX_IMAGE_SIZE)})`, 'error');
            return;
        }
        
        try {
            if (fileType === 'image') {
                await this.processImageFile(file);
            } else {
                await this.processTextFile(file);
            }
        } catch (error) {
            console.error('Error processing file:', error);
            this.showNotification(`Ошибка обработки файла: ${file.name}`, 'error');
        }
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

    async processImageFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                this.attachedImages.push({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    data: e.target.result,
                    fileType: 'image'
                });
                
                this.renderAttachedFiles();
                this.showNotification(`Изображение "${file.name}" добавлено`, 'success');
                resolve();
            };
            
            reader.onerror = () => {
                reject(new Error(`Ошибка чтения файла: ${file.name}`));
            };
            
            reader.readAsDataURL(file);
        });
    }

    async processTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const fileType = file.name.match(/\.(py|java|cpp|c|cs|php|rb|go|swift|kt|scala|rs)$/i) ? 'code' : 'text';
                
                this.attachedImages.push({
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    data: e.target.result,
                    fileType: fileType
                });
                
                this.renderAttachedFiles();
                this.showNotification(`Файл "${file.name}" добавлен`, 'success');
                resolve();
            };
            
            reader.onerror = () => {
                reject(new Error(`Ошибка чтения файла: ${file.name}`));
            };
            
            reader.readAsText(file);
        });
    }

    renderAttachedFiles() {
        if (!this.attachedFiles) return;
        
        this.attachedFiles.innerHTML = '';
        
        this.attachedImages.forEach((file, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            
            if (file.fileType === 'image') {
                fileElement.innerHTML = `
                    <div class="file-preview">
                        <img src="${file.data}" alt="${file.name}">
                        <span class="file-name">${this.escapeHtml(file.name)}</span>
                        <button class="remove-file" data-index="${index}">
                            <i class="ti ti-x"></i>
                        </button>
                    </div>
                `;
            } else {
                const icon = file.fileType === 'code' ? 'ti ti-code' : 'ti ti-file-text';
                fileElement.innerHTML = `
                    <div class="file-preview">
                        <i class="${icon}"></i>
                        <span class="file-name">${this.escapeHtml(file.name)}</span>
                        <span class="file-size">${this.formatFileSize(file.size)}</span>
                        <button class="remove-file" data-index="${index}">
                            <i class="ti ti-x"></i>
                        </button>
                    </div>
                `;
            }
            
            this.attachedFiles.appendChild(fileElement);
        });
        
        // Add event listeners for remove buttons
        this.attachedFiles.querySelectorAll('.remove-file').forEach(btn => {
            this.addEventListener(btn, 'click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                this.removeAttachedFile(index);
            });
        });
    }

    removeAttachedFile(index) {
        if (index >= 0 && index < this.attachedImages.length) {
            const removedFile = this.attachedImages[index];
            this.attachedImages.splice(index, 1);
            this.renderAttachedFiles();
            this.showNotification(`Файл "${removedFile.name}" удален`, 'info');
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Voice Input
    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'ru-RU';
            
            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateVoiceInputButton();
                this.showNotification('Голосовой ввод активирован', 'info');
            };
            
            this.recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';
                
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }
                
                if (finalTranscript) {
                    this.userInput.value = finalTranscript;
                    this.handleInputChange();
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
                this.updateVoiceInputButton();
                
                if (event.error !== 'no-speech') {
                    this.showNotification(`Ошибка голосового ввода: ${event.error}`, 'error');
                }
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                this.updateVoiceInputButton();
            };
        } else {
            console.warn('Speech recognition not supported');
            if (this.voiceInputBtn) {
                this.voiceInputBtn.style.display = 'none';
            }
        }
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            this.showNotification('Голосовой ввод не поддерживается в вашем браузере', 'error');
            return;
        }
        
        if (this.isListening) {
            this.recognition.stop();
        } else {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Error starting speech recognition:', error);
                this.showNotification('Ошибка запуска голосового ввода', 'error');
            }
        }
    }

    updateVoiceInputButton() {
        if (!this.voiceInputBtn) return;
        
        if (this.isListening) {
            this.voiceInputBtn.classList.add('listening');
            this.voiceInputBtn.innerHTML = '<i class="ti ti-microphone-off"></i>';
            this.voiceInputBtn.title = 'Остановить голосовой ввод';
        } else {
            this.voiceInputBtn.classList.remove('listening');
            this.voiceInputBtn.innerHTML = '<i class="ti ti-microphone"></i>';
            this.voiceInputBtn.title = 'Голосовой ввод';
        }
    }

    // Image Generation
    toggleImageMode() {
        this.isImageMode = !this.isImageMode;
        this.isVoiceMode = false;
        
        if (this.isImageMode) {
            this.generateImageBtn.classList.add('active');
            this.generateVoiceBtn.classList.remove('active');
            this.userInput.placeholder = 'Опишите изображение для генерации...';
            this.showNotification('Режим генерации изображений включен', 'info');
        } else {
            this.generateImageBtn.classList.remove('active');
            this.userInput.placeholder = 'Задайте вопрос или опишите изображение...';
            this.showNotification('Режим генерации изображений выключен', 'info');
        }
    }

    async generateImage(prompt) {
        if (!prompt.trim()) {
            this.showNotification('Введите описание для генерации изображения', 'error');
            return;
        }
        
        try {
            this.addMessage('user', `[Генерация изображения] ${prompt}`);
            
            if (typeof puter?.ai?.txt2img !== 'function') {
                throw new Error('Функция генерации изображений недоступна');
            }
            
            const imageUrl = await puter.ai.txt2img(prompt);
            
            const messageElement = this.addMessage('assistant', '');
            const messageContent = messageElement.querySelector('.message-content');
            
            messageContent.innerHTML = `
                <div class="generated-image">
                    <img src="${imageUrl}" alt="Сгенерированное изображение: ${this.escapeHtml(prompt)}" loading="lazy">
                    <div class="image-prompt">Запрос: "${this.escapeHtml(prompt)}"</div>
                </div>
            `;
            
            this.addToConversationHistory('assistant', `[Изображение сгенерировано] ${prompt}`);
            this.saveCurrentSession();
            
        } catch (error) {
            console.error('Error generating image:', error);
            this.handleError('Ошибка при генерации изображения', error);
        }
    }

    // Voice Generation
    toggleVoiceMode() {
        this.isVoiceMode = !this.isVoiceMode;
        this.isImageMode = false;
        
        if (this.isVoiceMode) {
            this.generateVoiceBtn.classList.add('active');
            this.generateImageBtn.classList.remove('active');
            this.userInput.placeholder = 'Введите текст для генерации голоса...';
            this.showNotification('Режим генерации голоса включен', 'info');
        } else {
            this.generateVoiceBtn.classList.remove('active');
            this.userInput.placeholder = 'Задайте вопрос или опишите изображение...';
            this.showNotification('Режим генерации голоса выключен', 'info');
        }
    }

    async generateVoice(text) {
        if (!text.trim()) {
            this.showNotification('Введите текст для генерации голоса', 'error');
            return;
        }
        
        try {
            this.addMessage('user', `[Генерация голоса] ${text}`);
            
            if (typeof puter?.ai?.txt2speech !== 'function') {
                throw new Error('Функция генерации голоса недоступна');
            }
            
            const audioUrl = await puter.ai.txt2speech(text);
            
            const messageElement = this.addMessage('assistant', '');
            const messageContent = messageElement.querySelector('.message-content');
            
            messageContent.innerHTML = `
                <div class="generated-voice">
                    <audio controls src="${audioUrl}" style="width: 100%;"></audio>
                    <div class="voice-text">Текст: "${this.escapeHtml(text)}"</div>
                </div>
            `;
            
            this.addToConversationHistory('assistant', `[Голос сгенерирован] ${text}`);
            this.saveCurrentSession();
            
        } catch (error) {
            console.error('Error generating voice:', error);
            this.handleError('Ошибка при генерации голоса', error);
        }
    }

    // Chat Sessions Management
    createNewChat() {
        const newChatId = 'chat-' + Date.now();
        this.currentChatId = newChatId;
        
        this.chatSessions.set(newChatId, {
            id: newChatId,
            name: 'Новый чат',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        this.clearMessages();
        this.saveChatSessions();
        this.setupChatSelector();
        this.updateDocumentTitle();
        this.updateCurrentChatName();
        
        this.showNotification('Новый чат создан', 'success');
        this.closeSidebar();
    }

    deleteAllChats() {
        if (this.chatSessions.size === 0) {
            this.showNotification('Нет чатов для удаления', 'info');
            return;
        }
        
        if (confirm('Вы уверены, что хотите удалить все чаты? Это действие нельзя отменить.')) {
            this.chatSessions.clear();
            
            // Create default chat
            this.currentChatId = 'default';
            this.chatSessions.set('default', {
                id: 'default',
                name: 'Основной чат',
                messages: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            
            this.clearMessages();
            this.saveChatSessions();
            this.setupChatSelector();
            this.updateDocumentTitle();
            this.updateCurrentChatName();
            
            this.showNotification('Все чаты удалены', 'success');
        }
    }

    setupChatSelector() {
        if (!this.chatList) return;
        
        this.chatList.innerHTML = '';
        
        const sessions = Array.from(this.chatSessions.values())
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        sessions.forEach(session => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${session.id === this.currentChatId ? 'active' : ''}`;
            chatItem.dataset.chatId = session.id;
            
            const chatName = session.name.length > this.MAX_CHAT_NAME_LENGTH 
                ? session.name.substring(0, this.MAX_CHAT_NAME_LENGTH) + '...' 
                : session.name;
            
            chatItem.innerHTML = `
                <div class="chat-item-content">
                    <i class="ti ti-messages"></i>
                    <span class="chat-name">${this.escapeHtml(chatName)}</span>
                </div>
                <div class="chat-actions">
                    <button class="chat-action-btn edit-chat" title="Редактировать название">
                        <i class="ti ti-edit"></i>
                    </button>
                </div>
            `;
            
            this.chatList.appendChild(chatItem);
            
            // Add event listeners
            this.addEventListener(chatItem, 'click', (e) => {
                if (!e.target.closest('.chat-actions')) {
                    this.switchChat(session.id);
                }
            });
            
            const editBtn = chatItem.querySelector('.edit-chat');
            this.addEventListener(editBtn, 'click', (e) => {
                e.stopPropagation();
                this.openEditChatModal(session.id);
            });
        });
    }

    switchChat(chatId) {
        if (this.chatSessions.has(chatId)) {
            this.currentChatId = chatId;
            this.loadCurrentSession();
            this.setupChatSelector();
            this.updateDocumentTitle();
            this.updateCurrentChatName();
            this.closeSidebar();
            this.showNotification(`Переключен на чат: ${this.chatSessions.get(chatId).name}`, 'info');
        }
    }

    openEditChatModal(chatId) {
        const session = this.chatSessions.get(chatId);
        if (!session) return;
        
        this.editChatModal.dataset.chatId = chatId;
        this.editChatNameInput.value = session.name;
        this.editChatModal.classList.add('active');
        
        if (this.modalClearInput) {
            this.modalClearInput.style.display = this.editChatNameInput.value ? 'flex' : 'none';
        }
        
        this.editChatNameInput.focus();
        this.editChatNameInput.select();
    }

    closeEditChatModal() {
        this.editChatModal.classList.remove('active');
        this.editChatModal.dataset.chatId = '';
        this.editChatNameInput.value = '';
    }

    handleModalInputChange() {
        if (this.modalClearInput) {
            this.modalClearInput.style.display = this.editChatNameInput.value ? 'flex' : 'none';
        }
    }

    clearModalInput() {
        this.editChatNameInput.value = '';
        this.handleModalInputChange();
    }

    saveChatName() {
        const chatId = this.editChatModal.dataset.chatId;
        const newName = this.editChatNameInput.value.trim();
        
        if (!chatId || !newName) {
            this.showNotification('Название чата не может быть пустым', 'error');
            return;
        }
        
        if (newName.length > this.MAX_CHAT_NAME_LENGTH) {
            this.showNotification(`Название чата не должно превышать ${this.MAX_CHAT_NAME_LENGTH} символов`, 'error');
            return;
        }
        
        const session = this.chatSessions.get(chatId);
        if (session) {
            session.name = newName;
            session.updatedAt = new Date().toISOString();
            
            this.saveChatSessions();
            this.setupChatSelector();
            this.updateDocumentTitle();
            this.updateCurrentChatName();
            this.closeEditChatModal();
            
            this.showNotification('Название чата обновлено', 'success');
        }
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

    loadChatSessions() {
        try {
            const saved = localStorage.getItem('khai-assistant-sessions');
            if (saved) {
                const sessions = JSON.parse(saved);
                this.chatSessions = new Map(sessions);
            }
            
            // Ensure default chat exists
            if (!this.chatSessions.has('default')) {
                this.chatSessions.set('default', {
                    id: 'default',
                    name: 'Основной чат',
                    messages: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
            
            // Set current chat to the most recent one
            const sessions = Array.from(this.chatSessions.values());
            if (sessions.length > 0) {
                const mostRecent = sessions.sort((a, b) => 
                    new Date(b.updatedAt) - new Date(a.updatedAt)
                )[0];
                this.currentChatId = mostRecent.id;
            }
            
        } catch (error) {
            console.error('Error loading chat sessions:', error);
            this.chatSessions = new Map();
            this.chatSessions.set('default', {
                id: 'default',
                name: 'Основной чат',
                messages: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
    }

    saveChatSessions() {
        try {
            const sessions = Array.from(this.chatSessions.entries());
            localStorage.setItem('khai-assistant-sessions', JSON.stringify(sessions));
        } catch (error) {
            console.error('Error saving chat sessions:', error);
        }
    }

    loadCurrentSession() {
        const session = this.chatSessions.get(this.currentChatId);
        if (!session) {
            this.createNewChat();
            return;
        }
        
        this.clearMessages();
        this.conversationHistory = [...session.messages];
        
        session.messages.forEach(msg => {
            if (msg.role === 'user') {
                this.addMessage('user', msg.content, msg.files || []);
            } else if (msg.role === 'assistant') {
                this.addMessage('assistant', msg.content);
            }
        });
        
        this.updateMinimap();
        this.scrollToBottom();
    }

    saveCurrentSession() {
        const session = this.chatSessions.get(this.currentChatId);
        if (session) {
            session.messages = [...this.conversationHistory];
            session.updatedAt = new Date().toISOString();
            this.saveChatSessions();
        }
    }

    addToConversationHistory(role, content, files = []) {
        this.conversationHistory.push({
            role,
            content,
            files,
            timestamp: new Date().toISOString()
        });
        
        // Limit conversation history
        if (this.conversationHistory.length > this.CONVERSATION_HISTORY_LIMIT) {
            this.conversationHistory = this.conversationHistory.slice(-this.CONVERSATION_HISTORY_LIMIT);
        }
    }

    // Model Management
    openModelModal() {
        this.modelModalOverlay.classList.add('active');
        this.updateModelList();
    }

    closeModelModal() {
        this.modelModalOverlay.classList.remove('active');
    }

    updateModelList() {
        if (!this.modelList) return;
        
        this.modelList.innerHTML = '';
        
        Object.entries(this.modelConfig).forEach(([modelId, config]) => {
            const modelElement = document.createElement('div');
            modelElement.className = `model-item ${modelId === this.currentModel ? 'active' : ''} ${!config.available ? 'disabled' : ''}`;
            modelElement.dataset.modelId = modelId;
            
            modelElement.innerHTML = `
                <div class="model-info">
                    <div class="model-name">${config.name}</div>
                    <div class="model-description">${config.description}</div>
                </div>
                <div class="model-status">
                    ${modelId === this.currentModel ? '<i class="ti ti-check"></i>' : ''}
                    ${!config.available ? '<div class="model-badge">Скоро</div>' : ''}
                </div>
            `;
            
            if (config.available) {
                this.addEventListener(modelElement, 'click', () => {
                    this.selectModel(modelId);
                });
            }
            
            this.modelList.appendChild(modelElement);
        });
    }

    selectModel(modelId) {
        if (!this.modelConfig[modelId]?.available) return;
        
        const currentItems = this.modelList.querySelectorAll('.model-item');
        currentItems.forEach(item => item.classList.remove('active'));
        
        const selectedItem = this.modelList.querySelector(`[data-model-id="${modelId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
    }

    confirmModelSelection() {
        const selectedItem = this.modelList.querySelector('.model-item.active');
        if (!selectedItem) return;
        
        const modelId = selectedItem.dataset.modelId;
        if (modelId === this.currentModel) {
            this.closeModelModal();
            return;
        }
        
        this.currentModel = modelId;
        this.updateModelInfo();
        this.closeModelModal();
        
        this.showNotification(`Модель изменена на: ${this.getModelDisplayName(modelId)}`, 'success');
    }

    updateModelInfo() {
        if (this.currentModelInfo) {
            this.currentModelInfo.textContent = this.getModelDisplayName(this.currentModel);
        }
    }

    getModelDisplayName(modelId) {
        return this.modelConfig[modelId]?.name || modelId;
    }

    getModelDescription(modelId) {
        return this.modelConfig[modelId]?.description || '';
    }

    // Navigation & Scrolling
    setupScrollTracking() {
        this.addEventListener(this.messagesContainer, 'scroll', () => {
            this.handleScroll();
        });
        
        this.handleScroll();
    }

    handleScroll() {
        if (!this.messagesContainer) return;
        
        const { scrollTop, scrollHeight, clientHeight } = this.messagesContainer;
        
        // Check if at bottom
        this.isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
        
        // Check if at top
        this.isAtTop = scrollTop === 0;
        
        // Update scroll buttons visibility
        this.updateScrollButtons();
        
        // Update minimap
        this.updateMinimapViewport();
    }

    updateScrollButtons() {
        if (this.scrollToBottomBtn) {
            this.scrollToBottomBtn.style.display = this.isAtBottom ? 'none' : 'flex';
        }
        
        if (this.scrollToLastAI) {
            const hasAIMessages = this.messagesContainer.querySelector('.message-ai');
            this.scrollToLastAI.style.display = hasAIMessages && !this.isAtBottom ? 'flex' : 'none';
        }
    }

    scrollToBottom(force = false) {
        if (!this.messagesContainer) return;
        
        if (force || this.autoScrollEnabled) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            this.isAtBottom = true;
            this.updateScrollButtons();
        }
    }

    scrollToLastAIMessage() {
        const aiMessages = this.messagesContainer.querySelectorAll('.message-ai');
        if (aiMessages.length === 0) return;
        
        const lastAIMessage = aiMessages[aiMessages.length - 1];
        lastAIMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    setupResponsiveMinimap() {
        if (!this.chatMinimap) return;
        
        this.addEventListener(window, 'resize', () => {
            this.updateMinimap();
        });
        
        this.updateMinimap();
    }

    updateMinimap() {
        if (!this.chatMinimap || !this.minimapContent) return;
        
        const messages = this.messagesContainer.querySelectorAll('.message');
        if (messages.length === 0) {
            this.chatMinimap.style.display = 'none';
            return;
        }
        
        this.chatMinimap.style.display = 'flex';
        this.minimapContent.innerHTML = '';
        
        messages.forEach((message, index) => {
            const dot = document.createElement('div');
            dot.className = `minimap-dot ${message.classList.contains('message-user') ? 'user' : 'ai'}`;
            dot.title = `${message.classList.contains('message-user') ? 'Пользователь' : 'ИИ'} - сообщение ${index + 1}`;
            this.minimapContent.appendChild(dot);
        });
        
        this.updateMinimapViewport();
    }

    updateMinimapViewport() {
        if (!this.minimapViewport || !this.messagesContainer) return;
        
        const { scrollTop, scrollHeight, clientHeight } = this.messagesContainer;
        const minimapHeight = this.minimapContent.offsetHeight;
        
        const viewportTop = (scrollTop / scrollHeight) * minimapHeight;
        const viewportHeight = (clientHeight / scrollHeight) * minimapHeight;
        
        this.minimapViewport.style.top = viewportTop + 'px';
        this.minimapViewport.style.height = viewportHeight + 'px';
    }

    // Search Functionality
    handleSearchInput() {
        const searchTerm = this.headerSearch.value.trim();
        if (this.headerSearchClear) {
            this.headerSearchClear.style.display = searchTerm ? 'flex' : 'none';
        }
        
        this.highlightSearchTerms(searchTerm);
    }

    clearSearch() {
        this.headerSearch.value = '';
        if (this.headerSearchClear) {
            this.headerSearchClear.style.display = 'none';
        }
        this.clearSearchHighlights();
    }

    highlightSearchTerms(searchTerm) {
        this.clearSearchHighlights();
        
        if (!searchTerm) return;
        
        const messages = this.messagesContainer.querySelectorAll('.message-content');
        const regex = new RegExp(this.escapeRegex(searchTerm), 'gi');
        
        messages.forEach(messageContent => {
            const originalHTML = messageContent.dataset.originalHTML || messageContent.innerHTML;
            messageContent.dataset.originalHTML = originalHTML;
            
            const highlightedHTML = originalHTML.replace(regex, match => 
                `<mark class="search-highlight">${match}</mark>`
            );
            
            messageContent.innerHTML = highlightedHTML;
        });
    }

    clearSearchHighlights() {
        const messages = this.messagesContainer.querySelectorAll('.message-content');
        
        messages.forEach(messageContent => {
            const originalHTML = messageContent.dataset.originalHTML;
            if (originalHTML) {
                messageContent.innerHTML = originalHTML;
                delete messageContent.dataset.originalHTML;
            }
        });
        
        // Re-attach copy buttons and re-highlight code
        messages.forEach(messageContent => {
            this.attachCopyButtons(messageContent);
            this.highlightCodeBlocks(messageContent);
        });
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    filterChatHistory() {
        const searchTerm = this.sidebarSearch.value.trim().toLowerCase();
        const chatItems = this.chatList.querySelectorAll('.chat-item');
        
        chatItems.forEach(item => {
            const chatName = item.querySelector('.chat-name').textContent.toLowerCase();
            if (searchTerm === '' || chatName.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Sidebar Management
    toggleSidebar() {
        this.sidebarMenu.classList.toggle('active');
        this.sidebarOverlay.classList.toggle('active');
    }

    closeSidebar() {
        this.sidebarMenu.classList.remove('active');
        this.sidebarOverlay.classList.remove('active');
    }

    // Import/Export Chat History
    importChatHistory() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    this.processImportedChat(importedData);
                } catch (error) {
                    console.error('Error parsing imported file:', error);
                    this.showNotification('Ошибка при чтении файла. Убедитесь, что файл имеет правильный формат.', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    processImportedChat(importedData) {
        // Validate imported data structure
        if (!importedData || !Array.isArray(importedData.messages)) {
            this.showNotification('Неправильный формат файла чата', 'error');
            return;
        }
        
        const newChatId = 'imported-' + Date.now();
        const chatName = importedData.name || `Импортированный чат (${new Date().toLocaleDateString()})`;
        
        // Truncate chat name if too long
        const truncatedName = chatName.length > this.MAX_CHAT_NAME_LENGTH 
            ? chatName.substring(0, this.MAX_CHAT_NAME_LENGTH) + '...' 
            : chatName;
        
        this.chatSessions.set(newChatId, {
            id: newChatId,
            name: truncatedName,
            messages: importedData.messages,
            createdAt: importedData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        this.currentChatId = newChatId;
        this.loadCurrentSession();
        this.saveChatSessions();
        this.setupChatSelector();
        this.updateDocumentTitle();
        this.updateCurrentChatName();
        this.closeSidebar();
        
        this.showNotification('Чат успешно импортирован', 'success');
    }

    downloadCurrentChat() {
        const session = this.chatSessions.get(this.currentChatId);
        if (!session || session.messages.length === 0) {
            this.showNotification('Нет сообщений для экспорта', 'info');
            return;
        }
        
        const exportData = {
            name: session.name,
            messages: session.messages,
            createdAt: session.createdAt,
            exportedAt: new Date().toISOString(),
            version: 'KHAI Assistant v2.1.0'
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `khai-chat-${session.name}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(link.href);
        
        this.showNotification('Чат успешно экспортирован', 'success');
    }

    // Mode Management
    setMode(mode) {
        // Reset all modes
        this.isImageMode = false;
        this.isVoiceMode = false;
        
        this.generateImageBtn.classList.remove('active');
        this.generateVoiceBtn.classList.remove('active');
        
        switch (mode) {
            case 'normal':
                this.userInput.placeholder = 'Задайте вопрос или опишите изображение...';
                this.showNotification('Обычный режим активирован', 'info');
                break;
            default:
                this.userInput.placeholder = 'Задайте вопрос или опишите изображение...';
                break;
        }
    }

    // Utility Methods
    clearInput() {
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        this.handleInputChange();
        this.userInput.focus();
    }

    clearMessages() {
        this.messagesContainer.innerHTML = '';
        this.conversationHistory = [];
        this.updateMinimap();
    }

    clearChat() {
        if (this.conversationHistory.length === 0) {
            this.showNotification('Чат уже пуст', 'info');
            return;
        }
        
        if (confirm('Вы уверены, что хотите очистить текущий чат? Это действие нельзя отменить.')) {
            this.clearMessages();
            this.saveCurrentSession();
            this.showNotification('Чат очищен', 'success');
        }
    }

    refreshPage() {
        if (confirm('Обновить страницу? Все несохраненные данные будут потеряны.')) {
            window.location.reload();
        }
    }

    showHelp() {
        const helpMessage = `
KHAI Assistant - Руководство по использованию

Основные возможности:
• 💬 Общение с ИИ через текстовые сообщения
• 🖼️ Генерация изображений по описанию
• 🔊 Генерация голосовых сообщений
• 📎 Прикрепление файлов (изображения, текстовые файлы, код)
• 🎤 Голосовой ввод (поддерживается в современных браузерах)
• 💾 Сохранение истории чатов
• 🔍 Поиск по сообщениям
• 🌙 Темная/светлая тема

Горячие клавиши:
• Enter - отправить сообщение
• Shift + Enter - новая строка
• Ctrl + / - показать справку

Поддерживаемые форматы файлов:
• Изображения: JPEG, PNG, GIF, WebP
• Текстовые файлы: TXT, MD, HTML, CSS, JS
• Код: Python, Java, C++, C#, PHP, Ruby, Go и другие

Для начала работы просто введите сообщение в поле ввода!
        `.trim();
        
        alert(helpMessage);
    }

    updateDocumentTitle() {
        const session = this.chatSessions.get(this.currentChatId);
        if (session) {
            document.title = `${session.name} - KHAI Assistant`;
        } else {
            document.title = 'KHAI Assistant';
        }
    }

    updateConnectionStatus() {
        if (!this.connectionStatus || !this.connectionStatusText) return;
        
        const isOnline = navigator.onLine;
        
        if (isOnline) {
            this.connectionStatus.className = 'connection-status online';
            this.connectionStatusText.textContent = 'Онлайн';
            this.connectionStatus.title = 'Соединение установлено';
        } else {
            this.connectionStatus.className = 'connection-status offline';
            this.connectionStatusText.textContent = 'Офлайн';
            this.connectionStatus.title = 'Отсутствует соединение';
        }
    }

    handleOnlineStatus() {
        this.updateConnectionStatus();
        this.showNotification('Соединение восстановлено', 'success');
    }

    handleOfflineStatus() {
        this.updateConnectionStatus();
        this.showNotification('Отсутствует соединение с интернетом', 'error');
    }

    handleResize() {
        this.updateMinimap();
    }

    handleGlobalKeydown(e) {
        // Ctrl + / for help
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            this.showHelp();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            if (this.editChatModal.classList.contains('active')) {
                this.closeEditChatModal();
            }
            if (this.modelModalOverlay.classList.contains('active')) {
                this.closeModelModal();
            }
            if (this.sidebarMenu.classList.contains('active')) {
                this.closeSidebar();
            }
        }
    }

    // Notification System
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icons = {
            success: 'ti ti-circle-check',
            error: 'ti ti-circle-x',
            warning: 'ti ti-alert-triangle',
            info: 'ti ti-info-circle'
        };
        
        notification.innerHTML = `
            <i class="${icons[type] || icons.info}"></i>
            <span>${this.escapeHtml(message)}</span>
            <button class="notification-close">
                <i class="ti ti-x"></i>
            </button>
        `;
        
        // Add to container or create one
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // Auto remove after 5 seconds
        const removeNotification = () => {
            notification.classList.remove('show');
            this.setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        };
        
        this.setTimeout(removeNotification, 5000);
        
        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        this.addEventListener(closeBtn, 'click', removeNotification);
    }

    // Error Handling
    handleError(message, error) {
        console.error(message, error);
        
        let userMessage = message;
        if (error?.message) {
            if (error.message.includes('network') || error.message.includes('Network')) {
                userMessage = 'Ошибка сети. Проверьте подключение к интернету.';
            } else if (error.message.includes('quota') || error.message.includes('limit')) {
                userMessage = 'Превышен лимит использования. Попробуйте позже.';
            } else if (error.message.includes('auth') || error.message.includes('permission')) {
                userMessage = 'Ошибка авторизации. Проверьте настройки доступа.';
            }
        }
        
        this.showNotification(userMessage, 'error');
        
        // Remove typing indicator if present
        this.removeTypingIndicator();
        
        // Reset generation state
        this.isGenerating = false;
        this.isProcessing = false;
        this.updateSendButton(false);
    }

    handleCriticalError(message, error) {
        console.error('CRITICAL ERROR:', message, error);
        
        // Show error page or fallback UI
        this.showNotification('Критическая ошибка приложения. Пожалуйста, обновите страницу.', 'error');
        
        // Try to recover or show error state
        if (this.appContainer) {
            this.appContainer.style.opacity = '0.5';
        }
    }

    // Debug Utilities
    debug(...args) {
        if (this.DEBUG) {
            console.log('[KHAI Assistant]', ...args);
        }
    }

    // PWA Installation Check
    checkPWAInstallation() {
        // Check if app is installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isPWAInstalled = true;
            this.debug('PWA is installed');
        } else {
            this.isPWAInstalled = false;
        }
    }

    // Cleanup
    cleanup() {
        // Clear all timeouts
        this.activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.activeTimeouts.clear();
        
        // Clear all debounce timers
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();
        
        // Remove all event listeners
        this.activeEventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        this.activeEventListeners.clear();
        
        // Stop voice recognition if active
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        
        // Stop speech synthesis if active
        if (this.isSpeaking && this.currentUtterance) {
            speechSynthesis.cancel();
        }
        
        // Stop any ongoing generation
        if (this.isGenerating && this.currentStreamController) {
            this.stopGeneration();
        }
        
        // Call cleanup callbacks
        this.cleanupCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Error in cleanup callback:', error);
            }
        });
        this.cleanupCallbacks.length = 0;
        
        this.debug('Cleanup completed');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.khaiAssistant = new KHAIAssistant();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.khaiAssistant) {
        window.khaiAssistant.cleanup();
    }
});
