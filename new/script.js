// KHAI Assistant - Production Ready v3.0.0
class KHAIAssistant {
    constructor() {
        this.DEBUG = true;
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
            this.connectionStatusIcon = document.getElementById('connectionStatusIcon');
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
                context: 128000,
                provider: 'puter'
            },
            'o3-mini': { 
                name: 'O3 Mini', 
                description: 'Продвинутая модель с улучшенными возможностями рассуждения',
                available: true,
                context: 128000,
                provider: 'puter'
            },
            'deepseek-chat': { 
                name: 'DeepSeek Chat', 
                description: 'Универсальная модель для общения и решения задач',
                available: true,
                context: 128000,
                provider: 'puter'
            },
            'gemini-2.0-flash': { 
                name: 'Gemini 2.0 Flash', 
                description: 'Новейшая быстрая модель от Google',
                available: true,
                context: 128000,
                provider: 'puter'
            }
        };

        // Limits
        this.MAX_FILES = 3;
        this.MAX_MESSAGE_LENGTH = 4000;
        this.MAX_CHAT_NAME_LENGTH = 16;
        this.CONVERSATION_HISTORY_LIMIT = 30;
        this.MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
        this.REQUEST_TIMEOUT = 30000; // 30 seconds

        // PWA state
        this.isPWAInstalled = false;
        this.deferredPrompt = null;

        // Retry configuration
        this.maxRetries = 3;
        this.retryDelay = 1000;
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
            this.loadMarkedFallback();
            return;
        }

        const renderer = new marked.Renderer();
        
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

    loadMarkedFallback() {
        window.marked = {
            parse: (text) => {
                return text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/`(.*?)`/g, '<code>$1</code>')
                    .replace(/# (.*?)(?:\n|$)/g, '<h1>$1</h1>')
                    .replace(/## (.*?)(?:\n|$)/g, '<h2>$1</h2>')
                    .replace(/### (.*?)(?:\n|$)/g, '<h3>$1</h3>')
                    .replace(/\n/g, '<br>');
            }
        };
    }

    async init() {
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
            await this.checkPuterConnection();
            this.checkPWAInstallation();
            this.setup404Handling();
            this.setCurrentYear();
            this.setupServiceWorker();
            
            // Set welcome message time
            const welcomeTime = document.getElementById('welcomeTime');
            if (welcomeTime) {
                welcomeTime.textContent = this.getCurrentTime();
            }
            
            // Hide preloader after everything is loaded
            this.hidePreloader();
            
            this.debug('KHAI Assistant успешно загружен');
            this.showNotification('KHAI Assistant загружен и готов к работе!', 'success');
            
            this.setupCleanup();
            
        } catch (error) {
            this.handleCriticalError('Ошибка инициализации приложения', error);
        }
    }

    async checkPuterConnection() {
        try {
            this.updateConnectionStatus('checking');
            
            // Test Puter.js connection with a simple call
            if (typeof puter?.ai?.chat === 'function') {
                const testResponse = await puter.ai.chat('Hello', { 
                    model: 'gpt-5-nano',
                    max_tokens: 10
                });
                
                if (testResponse && typeof testResponse === 'string') {
                    this.updateConnectionStatus('online');
                    this.debug('Puter.js connection successful');
                } else {
                    throw new Error('Invalid response from Puter.js');
                }
            } else {
                throw new Error('Puter.js AI functions not available');
            }
        } catch (error) {
            console.error('Puter.js connection failed:', error);
            this.updateConnectionStatus('offline');
            this.showNotification('Ошибка подключения к AI сервису', 'error');
        }
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    this.debug('Service Worker зарегистрирован:', registration);
                })
                .catch(error => {
                    this.debug('Ошибка регистрации Service Worker:', error);
                });
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
            [this.logo, 'click', () => this.showAppInfo()],
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
            // Quick actions
            [document, 'click', (e) => {
                if (e.target.closest('.quick-action')) {
                    const prompt = e.target.closest('.quick-action').getAttribute('data-prompt');
                    this.userInput.value = prompt;
                    this.handleInputChange();
                    this.userInput.focus();
                }
            }]
        ];

        events.forEach(([element, event, handler]) => {
            if (element) {
                this.addEventListener(element, event, handler);
            }
        });
    }

    // Preloader methods
    hidePreloader() {
        if (this.preloader) {
            setTimeout(() => {
                this.preloader.classList.add('fade-out');
                setTimeout(() => {
                    if (this.preloader.parentNode) {
                        this.preloader.style.display = 'none';
                    }
                }, 500);
            }, 1000);
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
                setTimeout(() => {}, 2000);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                index = (index + 1) % this.placeholderExamples.length;
            }

            const typeSpeed = isDeleting ? 50 : 100;
            setTimeout(type, typeSpeed);
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
            
            this.userInput.disabled = true;
            this.userInput.placeholder = 'ИИ генерирует ответ...';
        } else {
            this.sendBtn.classList.remove('stop-generation');
            this.sendBtn.innerHTML = '<i class="ti ti-send"></i>';
            this.sendBtn.title = 'Отправить сообщение';
            
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
        if (this.isGenerating) {
            this.generationAborted = true;
            this.isGenerating = false;
            this.isProcessing = false;
            
            this.removeTypingIndicator();
            this.updateSendButton(false);
            
            this.showNotification('Генерация остановлена', 'info');
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
            const response = await this.callPuterAI(prompt);
            
            this.removeTypingIndicator();
            this.processAIResponse(response);
            
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

Ответь на вопрос/сообщение пользователя "${userMessage}", учитывая содержание изображения. Отвечай на русском языке.`;
                } else {
                    return `Пользователь отправил изображение "${file.name}".

Извлеченный текст с изображения: "${extractedText}"

Проанализируй это изображение. Опиши что изображено, основное содержание. Если есть текст - объясни его значение. Отвечай подробно на русском языке.`;
                }
            } else if (file.fileType === 'text' || file.fileType === 'code') {
                const fileContent = file.data;
                
                if (userMessage.trim()) {
                    return `Пользователь отправил файл "${file.name}" с сопроводительным сообщением: "${userMessage}"

Содержимое файла:
"""
${fileContent}
"""

Ответь на вопрос/сообщение пользователя "${userMessage}", учитывая содержимое прикрепленного файла. Отвечай на русском языке.`;
                } else {
                    return `Пользователь отправил файл "${file.name}".

Содержимое файла:
"""
${fileContent}
"""

Проанализируй содержимое этого файла. Суммируй основную информацию, выдели ключевые моменты. Отвечай подробно на русском языке.`;
                }
            }
        } else {
            return this.buildContextPrompt(userMessage);
        }
    }

    async callPuterAI(prompt) {
        const modelOptions = {
            'gpt-5-nano': { model: 'gpt-5-nano' },
            'o3-mini': { model: 'o3-mini' },
            'deepseek-chat': { model: 'deepseek-chat' },
            'gemini-2.0-flash': { model: 'gemini-2.0-flash' }
        };
        
        const options = {
            ...modelOptions[this.currentModel],
            systemPrompt: "Ты полезный AI-ассистент KHAI. Отвечай на русском языке понятно и подробно. Поддерживай естественный диалог.",
            max_tokens: 1000
        };
        
        this.debug('Sending request to Puter.ai:', { prompt, options });
        return await puter.ai.chat(prompt, options);
    }

    processAIResponse(response) {
        const messageId = 'ai-' + Date.now();
        
        this.addMessage('ai', response, [], messageId);
        this.addToConversationHistory('assistant', response);
        this.updateLastAIMessageIndex();
        
        this.debug('AI Response received:', response);
    }

    formatMessageContent(content) {
        if (!content) return '';
        
        try {
            const sanitized = this.escapeHtml(content);
            const processed = marked.parse(sanitized);
            
            return processed.replace(/<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g, 
                (match, lang, code) => {
                    return `<pre><code class="language-${lang}">${code}</code></pre>`;
                });
        } catch (error) {
            console.error('Error formatting message:', error);
            return this.escapeHtml(content);
        }
    }

    addCopyButton(messageElement, content) {
        const actionsElement = messageElement.querySelector('.message-actions');
        if (!actionsElement) return;
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'action-btn-small copy-btn';
        copyBtn.innerHTML = '<i class="ti ti-copy"></i> Копировать';
        copyBtn.title = 'Копировать текст';
        
        copyBtn.addEventListener('click', () => {
            this.copyToClipboard(content);
            this.showNotification('Текст скопирован в буфер обмена', 'success');
            
            copyBtn.innerHTML = '<i class="ti ti-check"></i> Скопировано';
            copyBtn.disabled = true;
            
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="ti ti-copy"></i> Копировать';
                copyBtn.disabled = false;
            }, 2000);
        });
        
        actionsElement.appendChild(copyBtn);
    }

    // Message Display
    addMessage(role, content, files = [], messageId = null) {
        const id = messageId || `${role}-${Date.now()}`;
        const messageElement = document.createElement('div');
        messageElement.className = `message ${role}-message`;
        messageElement.id = id;
        
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        
        const messageAvatar = document.createElement('div');
        messageAvatar.className = 'message-avatar';
        messageAvatar.innerHTML = role === 'user' ? 
            '<i class="ti ti-user"></i>' : 
            '<i class="ti ti-robot"></i>';
        
        const messageInfo = document.createElement('div');
        messageInfo.className = 'message-info';
        messageInfo.innerHTML = role === 'user' ? 
            '<span class="message-sender">Вы</span>' : 
            '<span class="message-sender">KHAI Assistant</span>';
        
        const messageTime = document.createElement('span');
        messageTime.className = 'message-time';
        messageTime.textContent = this.getCurrentTime();
        
        messageInfo.appendChild(messageTime);
        messageHeader.appendChild(messageAvatar);
        messageHeader.appendChild(messageInfo);
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.innerHTML = this.formatMessageContent(content);
        
        // Add files if present
        if (files.length > 0) {
            const filesContainer = document.createElement('div');
            filesContainer.className = 'message-files';
            
            files.forEach(file => {
                const fileElement = document.createElement('div');
                fileElement.className = 'message-file';
                
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
                        </div>
                    `;
                }
                
                filesContainer.appendChild(fileElement);
            });
            
            messageContent.appendChild(filesContainer);
        }
        
        const messageActions = document.createElement('div');
        messageActions.className = 'message-actions';
        
        // Add copy button for AI messages
        if (role === 'ai') {
            this.addCopyButton(messageElement, content);
        }
        
        messageElement.appendChild(messageHeader);
        messageElement.appendChild(messageContent);
        messageElement.appendChild(messageActions);
        
        this.messagesContainer.appendChild(messageElement);
        
        if (this.autoScrollEnabled) {
            this.scrollToBottom();
        }
        
        if (role === 'assistant' || role === 'ai') {
            this.updateLastAIMessageIndex();
        }
        
        return id;
    }

    showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const typingElement = document.createElement('div');
        typingElement.className = 'message ai-message typing-indicator';
        typingElement.id = id;
        
        typingElement.innerHTML = `
            <div class="message-header">
                <div class="message-avatar">
                    <i class="ti ti-robot"></i>
                </div>
                <div class="message-info">
                    <span class="message-sender">KHAI Assistant</span>
                    <span class="message-time">${this.getCurrentTime()}</span>
                </div>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        `;
        
        this.messagesContainer.appendChild(typingElement);
        
        if (this.autoScrollEnabled) {
            this.scrollToBottom();
        }
        
        return id;
    }

    removeTypingIndicator() {
        if (this.activeTypingIndicator) {
            const element = document.getElementById(this.activeTypingIndicator);
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
            this.activeTypingIndicator = null;
        }
    }

    // File Handling
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        
        if (files.length === 0) return;
        
        if (files.length + this.attachedImages.length > this.MAX_FILES) {
            this.showNotification(`Максимум ${this.MAX_FILES} файлов`, 'error');
            return;
        }
        
        files.forEach(file => {
            this.processFile(file);
        });
        
        event.target.value = '';
    }

    async processFile(file) {
        try {
            const fileType = this.getFileType(file);
            
            if (fileType === 'image') {
                if (file.size > this.MAX_IMAGE_SIZE) {
                    this.showNotification(`Изображение слишком большое (максимум ${this.MAX_IMAGE_SIZE / 1024 / 1024}MB)`, 'error');
                    return;
                }
                
                const dataUrl = await this.readFileAsDataURL(file);
                this.attachedImages.push({
                    name: file.name,
                    data: dataUrl,
                    fileType: 'image'
                });
                
            } else if (fileType === 'text' || fileType === 'code') {
                const content = await this.readFileAsText(file);
                this.attachedImages.push({
                    name: file.name,
                    data: content,
                    fileType: fileType
                });
                
            } else {
                this.showNotification('Неподдерживаемый тип файла', 'error');
                return;
            }
            
            this.renderAttachedFiles();
            this.showNotification(`Файл "${file.name}" добавлен`, 'success');
            
        } catch (error) {
            console.error('Error processing file:', error);
            this.showNotification('Ошибка при обработке файла', 'error');
        }
    }

    getFileType(file) {
        const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const textTypes = ['text/plain', 'text/markdown', 'text/html'];
        const codeTypes = [
            'application/javascript', 
            'text/javascript',
            'application/json',
            'text/css'
        ];
        
        if (imageTypes.includes(file.type)) {
            return 'image';
        } else if (codeTypes.includes(file.type)) {
            return 'code';
        } else if (textTypes.includes(file.type)) {
            return 'text';
        } else if (file.name.match(/\.(js|ts|jsx|tsx|py|java|c|cpp|h|hpp|php|rb|go|rs|swift|kt|cs|html|css|scss|less|json|xml|yml|yaml|md|txt)$/i)) {
            return 'code';
        } else {
            return 'unknown';
        }
    }

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
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
                    <img src="${file.data}" alt="${this.escapeHtml(file.name)}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">
                    <span class="file-name">${this.escapeHtml(file.name)}</span>
                    <button class="remove-file" data-index="${index}">
                        <i class="ti ti-x"></i>
                    </button>
                `;
            } else {
                const fileIcon = file.fileType === 'code' ? 'ti ti-file-code' : 'ti ti-file-text';
                fileElement.innerHTML = `
                    <i class="${fileIcon}" style="font-size: 16px;"></i>
                    <span class="file-name">${this.escapeHtml(file.name)}</span>
                    <button class="remove-file" data-index="${index}">
                        <i class="ti ti-x"></i>
                    </button>
                `;
            }
            
            this.attachedFiles.appendChild(fileElement);
        });
        
        // Add event listeners for remove buttons
        this.attachedFiles.querySelectorAll('.remove-file').forEach(button => {
            button.addEventListener('click', (e) => {
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
                this.updateVoiceButton();
                this.showNotification('Голосовой ввод активирован', 'info');
            };
            
            this.recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        transcript += event.results[i][0].transcript;
                    }
                }
                
                if (transcript) {
                    this.userInput.value += transcript;
                    this.handleInputChange();
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
                this.updateVoiceButton();
                
                if (event.error === 'not-allowed') {
                    this.showNotification('Доступ к микрофону запрещен', 'error');
                } else {
                    this.showNotification('Ошибка распознавания речи', 'error');
                }
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                this.updateVoiceButton();
            };
        } else {
            if (this.voiceInputBtn) {
                this.voiceInputBtn.style.display = 'none';
            }
        }
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            this.showNotification('Голосовой ввод не поддерживается вашим браузером', 'error');
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

    updateVoiceButton() {
        if (!this.voiceInputBtn) return;
        
        if (this.isListening) {
            this.voiceInputBtn.classList.add('listening');
            this.voiceInputBtn.innerHTML = '<i class="ti ti-microphone-off"></i>';
            this.voiceInputBtn.title = 'Остановить запись';
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
            this.addMessage('user', `Сгенерировать изображение: ${prompt}`);
            
            if (typeof puter?.ai?.txt2img !== 'function') {
                throw new Error('Функция генерации изображений недоступна');
            }
            
            this.showNotification('Генерация изображения...', 'info');
            const imageUrl = await puter.ai.txt2img(prompt);
            
            this.addMessage('ai', 'Сгенерированное изображение:', [{
                name: 'generated-image.png',
                data: imageUrl,
                fileType: 'image'
            }]);
            
            this.showNotification('Изображение успешно сгенерировано', 'success');
            
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
            this.addMessage('user', `Сгенерировать голос: ${text}`);
            
            if (typeof puter?.ai?.txt2speech !== 'function') {
                throw new Error('Функция генерации голоса недоступна');
            }
            
            this.showNotification('Генерация аудио...', 'info');
            const audioUrl = await puter.ai.txt2speech(text);
            
            const messageId = this.addMessage('ai', 'Сгенерированный аудиофайл:');
            const messageElement = document.getElementById(messageId);
            
            if (messageElement) {
                const contentElement = messageElement.querySelector('.message-content');
                if (contentElement) {
                    const audioElement = document.createElement('audio');
                    audioElement.src = audioUrl;
                    audioElement.controls = true;
                    audioElement.style.width = '100%';
                    audioElement.style.marginTop = '10px';
                    contentElement.appendChild(audioElement);
                }
            }
            
            this.showNotification('Аудио успешно сгенерировано', 'success');
            
        } catch (error) {
            console.error('Error generating voice:', error);
            this.handleError('Ошибка при генерации голоса', error);
        }
    }

    // Chat Management
    createNewChat() {
        const chatId = 'chat-' + Date.now();
        const chatName = `Новый чат ${this.chatSessions.size + 1}`;
        
        this.chatSessions.set(chatId, {
            id: chatId,
            name: chatName,
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        this.currentChatId = chatId;
        this.conversationHistory = [];
        this.messagesContainer.innerHTML = '';
        this.currentChatName.textContent = chatName;
        this.updateDocumentTitle();
        
        this.saveChatSessions();
        this.updateChatList();
        this.closeSidebar();
        
        this.showNotification('Новый чат создан', 'success');
    }

    loadChatSessions() {
        try {
            const saved = localStorage.getItem('khai-assistant-chats');
            if (saved) {
                const sessions = JSON.parse(saved);
                this.chatSessions = new Map(sessions);
            } else {
                this.createDefaultChat();
            }
        } catch (error) {
            console.error('Error loading chat sessions:', error);
            this.createDefaultChat();
        }
    }

    createDefaultChat() {
        const defaultChat = {
            id: 'default',
            name: 'Основной чат',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.chatSessions.set('default', defaultChat);
        this.currentChatId = 'default';
    }

    saveChatSessions() {
        try {
            const sessionsArray = Array.from(this.chatSessions.entries());
            localStorage.setItem('khai-assistant-chats', JSON.stringify(sessionsArray));
        } catch (error) {
            console.error('Error saving chat sessions:', error);
        }
    }

    loadCurrentSession() {
        const session = this.chatSessions.get(this.currentChatId);
        if (session && session.messages) {
            this.conversationHistory = session.messages;
            this.renderChatHistory();
        }
        
        this.updateChatList();
        this.updateDocumentTitle();
    }

    renderChatHistory() {
        this.messagesContainer.innerHTML = '';
        
        // Add welcome message if no history
        if (this.conversationHistory.length === 0) {
            const welcomeTime = document.getElementById('welcomeTime');
            if (welcomeTime) {
                welcomeTime.textContent = this.getCurrentTime();
            }
            return;
        }
        
        this.conversationHistory.forEach(msg => {
            this.addMessage(msg.role, msg.content, msg.files || []);
        });
        
        if (this.autoScrollEnabled) {
            this.scrollToBottom();
        }
    }

    updateChatList() {
        if (!this.chatList) return;
        
        this.chatList.innerHTML = '';
        
        const sortedSessions = Array.from(this.chatSessions.values())
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        sortedSessions.forEach(session => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${session.id === this.currentChatId ? 'active' : ''}`;
            chatItem.setAttribute('data-chat-id', session.id);
            
            chatItem.innerHTML = `
                <div class="chat-item-content">
                    <div class="chat-item-title">${this.escapeHtml(session.name)}</div>
                    <div class="chat-item-preview">${this.formatDate(session.updatedAt)}</div>
                </div>
                <div class="chat-item-actions">
                    <button class="chat-item-action edit" title="Редактировать">
                        <i class="ti ti-edit"></i>
                    </button>
                    <button class="chat-item-action delete" title="Удалить">
                        <i class="ti ti-trash"></i>
                    </button>
                </div>
            `;
            
            // Chat selection
            chatItem.addEventListener('click', (e) => {
                if (!e.target.closest('.chat-item-actions')) {
                    this.switchToChat(session.id);
                }
            });
            
            // Edit chat
            const editBtn = chatItem.querySelector('.edit');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openEditChatModal(session);
            });
            
            // Delete chat
            const deleteBtn = chatItem.querySelector('.delete');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteChat(session.id);
            });
            
            this.chatList.appendChild(chatItem);
        });
    }

    switchToChat(chatId) {
        if (this.chatSessions.has(chatId)) {
            this.saveCurrentSession();
            this.currentChatId = chatId;
            this.loadCurrentSession();
            this.closeSidebar();
            this.showNotification('Чат переключен', 'success');
        }
    }

    saveCurrentSession() {
        const session = this.chatSessions.get(this.currentChatId);
        if (session) {
            session.messages = this.conversationHistory;
            session.updatedAt = new Date().toISOString();
            this.chatSessions.set(this.currentChatId, session);
            this.saveChatSessions();
        }
    }

    deleteChat(chatId) {
        if (this.chatSessions.size <= 1) {
            this.showNotification('Нельзя удалить последний чат', 'error');
            return;
        }
        
        if (confirm('Вы уверены, что хотите удалить этот чат?')) {
            this.chatSessions.delete(chatId);
            
            if (this.currentChatId === chatId) {
                const remainingChats = Array.from(this.chatSessions.keys());
                this.currentChatId = remainingChats[0];
                this.loadCurrentSession();
            }
            
            this.saveChatSessions();
            this.updateChatList();
            this.showNotification('Чат удален', 'success');
        }
    }

    deleteAllChats() {
        if (confirm('Вы уверены, что хотите удалить все чаты? Это действие нельзя отменить.')) {
            this.chatSessions.clear();
            this.createDefaultChat();
            this.loadCurrentSession();
            this.saveChatSessions();
            this.showNotification('Все чаты удалены', 'success');
        }
    }

    // Edit Chat Modal
    openEditChatModal(session) {
        if (!this.editChatModal) return;
        
        this.editChatNameInput.value = session.name;
        this.editChatModal.style.display = 'flex';
        this.currentEditingChatId = session.id;
        
        this.handleModalInputChange();
        this.editChatNameInput.focus();
    }

    closeEditChatModal() {
        if (!this.editChatModal) return;
        
        this.editChatModal.style.display = 'none';
        this.currentEditingChatId = null;
        this.editChatNameInput.value = '';
    }

    handleModalInputChange() {
        const hasText = this.editChatNameInput.value.trim().length > 0;
        
        if (this.modalClearInput) {
            this.modalClearInput.style.display = hasText ? 'flex' : 'none';
        }
        
        if (this.editChatModalSave) {
            this.editChatModalSave.disabled = !hasText;
        }
    }

    clearModalInput() {
        this.editChatNameInput.value = '';
        this.handleModalInputChange();
        this.editChatNameInput.focus();
    }

    saveChatName() {
        const newName = this.editChatNameInput.value.trim();
        
        if (!newName || !this.currentEditingChatId) {
            return;
        }
        
        if (newName.length > this.MAX_CHAT_NAME_LENGTH) {
            this.showNotification(`Название чата не должно превышать ${this.MAX_CHAT_NAME_LENGTH} символов`, 'error');
            return;
        }
        
        const session = this.chatSessions.get(this.currentEditingChatId);
        if (session) {
            session.name = newName;
            session.updatedAt = new Date().toISOString();
            this.chatSessions.set(this.currentEditingChatId, session);
            this.saveChatSessions();
            
            if (this.currentChatId === this.currentEditingChatId) {
                this.currentChatName.textContent = newName;
                this.updateDocumentTitle();
            }
            
            this.updateChatList();
            this.closeEditChatModal();
            this.showNotification('Название чата обновлено', 'success');
        }
    }

    // Search
    handleSearchInput() {
        const searchTerm = this.headerSearch.value.trim();
        
        if (this.headerSearchClear) {
            this.headerSearchClear.style.display = searchTerm ? 'flex' : 'none';
        }
        
        this.highlightSearchResults(searchTerm);
    }

    clearSearch() {
        this.headerSearch.value = '';
        if (this.headerSearchClear) {
            this.headerSearchClear.style.display = 'none';
        }
        this.clearSearchHighlights();
    }

    highlightSearchResults(searchTerm) {
        this.clearSearchHighlights();
        
        if (!searchTerm) return;
        
        const messages = this.messagesContainer.querySelectorAll('.message-content');
        const regex = new RegExp(this.escapeRegex(searchTerm), 'gi');
        
        messages.forEach(contentElement => {
            const originalHTML = contentElement.innerHTML;
            const highlightedHTML = originalHTML.replace(regex, match => 
                `<mark class="search-highlight">${match}</mark>`
            );
            
            if (highlightedHTML !== originalHTML) {
                contentElement.innerHTML = highlightedHTML;
                contentElement.classList.add('has-highlight');
            }
        });
    }

    clearSearchHighlights() {
        const highlightedElements = this.messagesContainer.querySelectorAll('.has-highlight');
        
        highlightedElements.forEach(element => {
            element.classList.remove('has-highlight');
        });
    }

    filterChatHistory() {
        const searchTerm = this.sidebarSearch.value.trim().toLowerCase();
        const chatItems = this.chatList.querySelectorAll('.chat-item');
        
        chatItems.forEach(item => {
            const chatName = item.querySelector('.chat-item-title').textContent.toLowerCase();
            const shouldShow = !searchTerm || chatName.includes(searchTerm);
            item.style.display = shouldShow ? 'flex' : 'none';
        });
    }

    // Model Management
    openModelModal() {
        if (!this.modelModalOverlay) return;
        
        this.modelModalOverlay.style.display = 'flex';
        this.updateModelList();
    }

    closeModelModal() {
        if (!this.modelModalOverlay) return;
        
        this.modelModalOverlay.style.display = 'none';
    }

    confirmModelSelection() {
        const selectedModel = this.modelList.querySelector('input[name="model"]:checked');
        
        if (selectedModel) {
            const modelId = selectedModel.value;
            this.switchModel(modelId);
        }
        
        this.closeModelModal();
    }

    switchModel(modelId) {
        if (!this.modelConfig[modelId]) {
            this.showNotification('Выбранная модель не найдена', 'error');
            return;
        }
        
        if (!this.modelConfig[modelId].available) {
            this.showNotification('Эта модель временно недоступна', 'warning');
            return;
        }
        
        this.currentModel = modelId;
        this.updateModelInfo();
        this.saveCurrentSession();
        
        this.showNotification(`Модель изменена на: ${this.modelConfig[modelId].name}`, 'success');
    }

    updateModelInfo() {
        const config = this.modelConfig[this.currentModel];
        
        if (this.currentModelInfo) {
            this.currentModelInfo.textContent = config.name;
        }
        
        this.updateDocumentTitle();
    }

    updateModelList() {
        if (!this.modelList) return;
        
        this.modelList.innerHTML = '';
        
        Object.entries(this.modelConfig).forEach(([id, config]) => {
            const modelItem = document.createElement('div');
            modelItem.className = `model-item ${id === this.currentModel ? 'selected' : ''} ${config.available ? '' : 'disabled'}`;
            
            modelItem.innerHTML = `
                <div class="model-item-header">
                    <div class="model-name">${config.name}</div>
                    <div class="model-status ${config.available ? 'available' : 'coming-soon'}">
                        ${config.available ? 'Доступно' : 'Скоро'}
                    </div>
                </div>
                <div class="model-description">${config.description}</div>
                <input type="radio" name="model" value="${id}" 
                       ${id === this.currentModel ? 'checked' : ''}
                       ${config.available ? '' : 'disabled'} style="display: none;">
            `;
            
            if (config.available) {
                modelItem.addEventListener('click', () => {
                    this.modelList.querySelectorAll('.model-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                    modelItem.classList.add('selected');
                    const radio = modelItem.querySelector('input[type="radio"]');
                    radio.checked = true;
                });
            }
            
            this.modelList.appendChild(modelItem);
        });
    }

    // Navigation & Scrolling
    setupScrollTracking() {
        this.addEventListener(this.messagesContainer, 'scroll', () => {
            this.handleScroll();
        });
    }

    handleScroll() {
        const container = this.messagesContainer;
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        
        this.isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
        this.isAtTop = scrollTop === 0;
        
        this.updateScrollButtons();
        this.updateMinimap();
    }

    updateScrollButtons() {
        if (this.scrollToBottomBtn) {
            this.scrollToBottomBtn.style.display = this.isAtBottom ? 'none' : 'flex';
        }
        
        if (this.scrollToLastAI) {
            const hasAIMessages = this.lastAIMessageIndex >= 0;
            this.scrollToLastAI.style.display = hasAIMessages ? 'flex' : 'none';
        }
    }

    scrollToBottom(force = false) {
        if (force || this.autoScrollEnabled) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            this.isAtBottom = true;
            this.updateScrollButtons();
        }
    }

    scrollToLastAIMessage() {
        const aiMessages = this.messagesContainer.querySelectorAll('.ai-message');
        if (aiMessages.length > 0) {
            const lastAIMessage = aiMessages[aiMessages.length - 1];
            lastAIMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    updateLastAIMessageIndex() {
        const aiMessages = this.messagesContainer.querySelectorAll('.ai-message');
        this.lastAIMessageIndex = aiMessages.length - 1;
        this.updateScrollButtons();
    }

    // Minimap
    setupResponsiveMinimap() {
        if (!this.chatMinimap || !this.minimapContent) return;
        
        this.updateMinimap();
        
        this.addEventListener(window, 'resize', () => {
            this.updateMinimap();
        });
    }

    updateMinimap() {
        if (!this.chatMinimap || !this.minimapContent) return;
        
        const container = this.messagesContainer;
        const messages = container.querySelectorAll('.message');
        
        if (messages.length === 0) {
            this.chatMinimap.style.display = 'none';
            return;
        }
        
        this.chatMinimap.style.display = 'flex';
        
        let minimapHTML = '';
        messages.forEach((message, index) => {
            const isUser = message.classList.contains('user-message');
            const isAI = message.classList.contains('ai-message');
            const isTyping = message.classList.contains('typing-indicator');
            
            let className = 'minimap-message';
            if (isUser) className += ' user';
            if (isAI) className += ' ai';
            if (isTyping) className += ' typing';
            
            minimapHTML += `<div class="${className}" data-index="${index}"></div>`;
        });
        
        this.minimapContent.innerHTML = minimapHTML;
        
        this.updateMinimapViewport();
        
        this.minimapContent.querySelectorAll('.minimap-message').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.scrollToMessage(index);
            });
        });
    }

    updateMinimapViewport() {
        if (!this.minimapViewport) return;
        
        const container = this.messagesContainer;
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        
        const minimapHeight = this.chatMinimap.offsetHeight;
        const viewportHeight = Math.max((clientHeight / scrollHeight) * minimapHeight, 20);
        const viewportTop = (scrollTop / scrollHeight) * minimapHeight;
        
        this.minimapViewport.style.height = viewportHeight + 'px';
        this.minimapViewport.style.top = viewportTop + 'px';
    }

    scrollToMessage(index) {
        const messages = this.messagesContainer.querySelectorAll('.message');
        if (messages[index]) {
            messages[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Import/Export
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
                    this.showNotification('Ошибка при чтении файла', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    processImportedChat(importedData) {
        if (!importedData || !Array.isArray(importedData.messages)) {
            this.showNotification('Неверный формат файла', 'error');
            return;
        }
        
        const chatId = 'imported-' + Date.now();
        const chatName = importedData.name || `Импортированный чат ${this.formatDate(new Date())}`;
        
        this.chatSessions.set(chatId, {
            id: chatId,
            name: chatName,
            messages: importedData.messages,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        this.currentChatId = chatId;
        this.conversationHistory = importedData.messages;
        this.renderChatHistory();
        this.saveChatSessions();
        this.updateChatList();
        this.closeSidebar();
        
        this.showNotification('Чат успешно импортирован', 'success');
    }

    downloadCurrentChat() {
        const session = this.chatSessions.get(this.currentChatId);
        if (!session) return;
        
        const exportData = {
            name: session.name,
            exportedAt: new Date().toISOString(),
            messages: session.messages
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `khai-chat-${session.name}-${this.formatDate(new Date())}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showNotification('Чат успешно экспортирован', 'success');
    }

    // Utility Methods
    addToConversationHistory(role, content, files = []) {
        this.conversationHistory.push({
            role,
            content,
            files,
            timestamp: new Date().toISOString()
        });
        
        if (this.conversationHistory.length > this.CONVERSATION_HISTORY_LIMIT) {
            this.conversationHistory = this.conversationHistory.slice(-this.CONVERSATION_HISTORY_LIMIT);
        }
        
        this.saveCurrentSession();
    }

    buildContextPrompt(userMessage) {
        if (this.conversationHistory.length <= 2) {
            return userMessage;
        }
        
        const recentHistory = this.conversationHistory.slice(-6);
        
        let context = "Контекст предыдущего общения:\n";
        recentHistory.forEach(msg => {
            const role = msg.role === 'user' ? 'Пользователь' : 'Ассистент';
            context += `${role}: ${msg.content}\n`;
        });
        
        context += `\nТекущий вопрос пользователя: ${userMessage}`;
        context += "\n\nОтветь на текущий вопрос пользователя, учитывая контекст выше.";
        
        return context;
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Сегодня';
        } else if (diffDays === 1) {
            return 'Вчера';
        } else if (diffDays < 7) {
            return `${diffDays} дней назад`;
        } else {
            return date.toLocaleDateString('ru-RU');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                return true;
            } catch (fallbackError) {
                console.error('Fallback copy failed:', fallbackError);
                return false;
            } finally {
                document.body.removeChild(textArea);
            }
        }
    }

    // UI Controls
    clearInput() {
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        this.handleInputChange();
        this.userInput.focus();
    }

    clearChat() {
        if (confirm('Вы уверены, что хотите очистить историю текущего чата?')) {
            this.conversationHistory = [];
            this.messagesContainer.innerHTML = '';
            
            // Add welcome message back
            const welcomeTime = document.getElementById('welcomeTime');
            if (welcomeTime) {
                welcomeTime.textContent = this.getCurrentTime();
            }
            
            this.saveCurrentSession();
            this.showNotification('История чата очищена', 'success');
        }
    }

    showAppInfo() {
        this.showNotification('KHAI Assistant v3.0.0 - Первый белорусский ИИ-помощник', 'info');
    }

    // Sidebar Management
    toggleSidebar() {
        if (this.sidebarMenu.classList.contains('active')) {
            this.closeSidebar();
        } else {
            this.openSidebar();
        }
    }

    openSidebar() {
        this.sidebarMenu.classList.add('active');
        this.sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeSidebar() {
        this.sidebarMenu.classList.remove('active');
        this.sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Mode Management
    setMode(mode) {
        this.isImageMode = false;
        this.isVoiceMode = false;
        
        this.generateImageBtn.classList.remove('active');
        this.generateVoiceBtn.classList.remove('active');
        
        this.userInput.placeholder = 'Задайте вопрос или опишите изображение...';
        
        this.showNotification('Обычный режим включен', 'info');
    }

    setupChatSelector() {
        // This will be implemented when we have multiple chat functionality
    }

    // Global Event Handlers
    handleGlobalKeydown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (this.headerSearch) {
                this.headerSearch.focus();
            }
        }
        
        if (e.key === 'Escape') {
            if (this.editChatModal.style.display === 'flex') {
                this.closeEditChatModal();
            } else if (this.modelModalOverlay.style.display === 'flex') {
                this.closeModelModal();
            } else if (this.sidebarMenu.classList.contains('active')) {
                this.closeSidebar();
            }
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            this.showHelp();
        }
    }

    handleResize() {
        this.updateMinimap();
        this.handleScroll();
    }

    // Network Status
    handleOnlineStatus() {
        this.updateConnectionStatus('online');
        this.showNotification('Соединение восстановлено', 'success');
    }

    handleOfflineStatus() {
        this.updateConnectionStatus('offline');
        this.showNotification('Отсутствует соединение с интернетом', 'error');
    }

    updateConnectionStatus(status) {
        if (!this.connectionStatusText || !this.connectionStatusIcon) return;
        
        const statusConfig = {
            'checking': { text: 'Проверка...', icon: 'ti ti-refresh', color: 'var(--warning-text)' },
            'online': { text: 'Онлайн', icon: 'ti ti-circle', color: 'var(--success-text)' },
            'offline': { text: 'Офлайн', icon: 'ti ti-circle', color: 'var(--error-text)' }
        };
        
        const config = statusConfig[status] || statusConfig.checking;
        
        this.connectionStatusText.textContent = config.text;
        this.connectionStatusIcon.className = config.icon;
        this.connectionStatusIcon.style.color = config.color;
        
        // Update sidebar status
        if (this.connectionStatus) {
            this.connectionStatus.textContent = status === 'online' ? '✅ Онлайн' : '❌ Офлайн';
        }
    }

    // Notifications
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="ti ${this.getNotificationIcon(type)}"></i>
                <span>${this.escapeHtml(message)}</span>
            </div>
            <button class="notification-close">
                <i class="ti ti-x"></i>
            </button>
        `;
        
        let container = document.querySelector('.notification-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(notification);
        
        const autoRemove = setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        }, 5000);
        
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            clearTimeout(autoRemove);
            if (notification.parentNode) {
                notification.classList.add('fade-out');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
        });
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'ti-circle-check';
            case 'error': return 'ti-circle-x';
            case 'warning': return 'ti-alert-triangle';
            case 'info': return 'ti-info-circle';
            default: return 'ti-info-circle';
        }
    }

    // Help System
    showHelp() {
        const helpContent = `
            <h3>KHAI Assistant - Справка</h3>
            <div class="help-section">
                <h4>Основные возможности:</h4>
                <ul>
                    <li><strong>Текстовый чат</strong> - общайтесь с ИИ на любые темы</li>
                    <li><strong>Анализ изображений</strong> - загружайте изображения для анализа</li>
                    <li><strong>Генерация изображений</strong> - создавайте изображения по описанию</li>
                    <li><strong>Голосовой ввод</strong> - говорите вместо ввода текста</li>
                    <li><strong>Генерация голоса</strong> - преобразуйте текст в речь</li>
                </ul>
            </div>
            <div class="help-section">
                <h4>Горячие клавиши:</h4>
                <ul>
                    <li><kbd>Enter</kbd> - отправить сообщение</li>
                    <li><kbd>Shift + Enter</kbd> - новая строка</li>
                    <li><kbd>Ctrl/Cmd + K</kbd> - поиск по чату</li>
                    <li><kbd>Ctrl/Cmd + /</kbd> - эта справка</li>
                    <li><kbd>Escape</kbd> - закрыть модальные окны</li>
                </ul>
            </div>
        `;
        
        const helpModal = document.createElement('div');
        helpModal.className = 'modal-overlay active';
        helpModal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>Справка</h3>
                    <button class="modal-close">
                        <i class="ti ti-x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${helpContent}
                </div>
                <div class="modal-footer">
                    <button class="modal-btn primary" id="closeHelp">Закрыть</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(helpModal);
        
        const closeHelp = () => {
            helpModal.classList.remove('active');
            setTimeout(() => {
                if (helpModal.parentNode) {
                    helpModal.parentNode.removeChild(helpModal);
                }
            }, 300);
        };
        
        helpModal.querySelector('.modal-close').addEventListener('click', closeHelp);
        helpModal.querySelector('#closeHelp').addEventListener('click', closeHelp);
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                closeHelp();
            }
        });
    }

    // Error Handling
    handleError(message, error) {
        console.error(message, error);
        
        let userMessage = message;
        
        if (error.message.includes('network') || error.message.includes('Network')) {
            userMessage = 'Ошибка сети. Проверьте подключение к интернету.';
        } else if (error.message.includes('timeout')) {
            userMessage = 'Превышено время ожидания ответа.';
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
            userMessage = 'Превышен лимит запросов. Попробуйте позже.';
        }
        
        this.showNotification(userMessage, 'error');
        
        this.addMessage('ai', `**Ошибка:** ${userMessage}\n\nПопробуйте:\n- Проверить подключение к интернету\n- Обновить страницу\n- Сократить длину запроса\n- Попробовать позже`);
    }

    handleCriticalError(message, error) {
        console.error('CRITICAL ERROR:', message, error);
        this.showNotification('Критическая ошибка приложения', 'error');
        
        try {
            this.setupBasicFunctionality();
        } catch (recoveryError) {
            console.error('Recovery failed:', recoveryError);
        }
    }

    setupBasicFunctionality() {
        if (this.userInput && this.sendBtn) {
            this.sendBtn.onclick = () => {
                const message = this.userInput.value.trim();
                if (message) {
                    this.addMessage('user', message);
                    this.userInput.value = '';
                    this.addMessage('ai', 'Извините, расширенные функции временно недоступны. Пожалуйста, обновите страницу.');
                }
            };
        }
    }

    // PWA Installation
    checkPWAInstallation() {
        // PWA installation logic can be added here
    }

    // Debugging
    debug(...args) {
        if (this.DEBUG) {
            console.log('[KHAI Assistant]', ...args);
        }
    }

    // Document Title
    updateDocumentTitle() {
        const session = this.chatSessions.get(this.currentChatId);
        const modelConfig = this.modelConfig[this.currentModel];
        
        if (session && modelConfig) {
            document.title = `${session.name} - KHAI Assistant (${modelConfig.name})`;
        } else {
            document.title = 'KHAI Assistant - AI Chat Platform';
        }
    }

    // Cleanup
    cleanup() {
        this.activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.activeTimeouts.clear();
        
        this.debounceTimers.forEach(timerId => clearTimeout(timerId));
        this.debounceTimers.clear();
        
        this.activeEventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        this.activeEventListeners.clear();
        
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        
        if (this.isSpeaking && this.currentUtterance) {
            speechSynthesis.cancel();
            this.isSpeaking = false;
            this.currentUtterance = null;
        }
        
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

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.khaiAssistant = new KHAIAssistant();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.khaiAssistant) {
        window.khaiAssistant.cleanup();
    }
});
