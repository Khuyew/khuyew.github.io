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
            'claude-sonnet': { 
                name: 'Claude Sonnet', 
                description: 'Мощная модель от Anthropic для сложных задач',
                available: false,
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
                available: false,
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
            [this.importChatBtn, 'click', () => this.importChatHistory()],
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
            [this.downloadChatBtn, 'click', () => this.downloadCurrentChat()],
            [this.errorBackBtn, 'click', () => this.hide404Page()],
            [document, 'keydown', (e) => this.handleGlobalKeydown(e)],
            [window, 'online', () => this.handleOnlineStatus()],
            [window, 'offline', () => this.handleOfflineStatus()],
            [window, 'resize', () => this.debounce('resize', () => this.handleResize(), 250)]
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
            
            // Обновляем placeholder в зависимости от режима
            if (this.isVoiceMode) {
                this.userInput.placeholder = 'Введите текст для генерации голоса...';
            } else if (this.isImageMode) {
                this.userInput.placeholder = 'Опишите изображение для генерации...';
            } else {
                this.userInput.placeholder = currentText + '▌';
            }

            if (!isDeleting && charIndex === currentExample.length) {
                isDeleting = true;
                this.setTimeout(() => {}, 2000);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                index = (index + 1) % this.placeholderExamples.length;
            }

            const typeSpeed = isDeleting ? 50 : 100;
            if (!this.isVoiceMode && !this.isImageMode) {
                this.setTimeout(type, typeSpeed);
            }
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
            
            // Обновляем placeholder в зависимости от режима
            if (this.isVoiceMode) {
                this.userInput.placeholder = 'Введите текст для генерации голоса...';
            } else if (this.isImageMode) {
                this.userInput.placeholder = 'Опишите изображение для генерации...';
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
            } else {
                // Обработка любых файлов как текстовых
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
            'claude-sonnet': { model: 'claude-sonnet' },
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
        
        this.attachMessageHandlers(messageElement);
        this.addCodeDownloadButtons(messageElement, fullContent);
        this.scrollToBottom();
    }

    addCodeDownloadButtons(messageElement, content) {
        const codeBlocks = this.extractCodeFromMessage(content);
        if (codeBlocks.length === 0) return;
        
        const downloadContainer = document.createElement('div');
        downloadContainer.className = 'code-download-container';
        
        codeBlocks.forEach((codeBlock, index) => {
            const { language, code } = codeBlock;
            const extension = this.getFileExtension(language);
            const fileName = `code_${index + 1}.${extension}`;
            
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'code-download-btn';
            downloadBtn.innerHTML = `<i class="ti ti-download"></i> ${fileName}`;
            downloadBtn.onclick = () => this.downloadCodeFile(code, fileName);
            downloadContainer.appendChild(downloadBtn);
        });
        
        const messageContent = messageElement.querySelector('.message-content');
        messageContent.appendChild(downloadContainer);
    }

    extractCodeFromMessage(content) {
        const codeBlocks = [];
        const codeRegex = /```(\w+)?\s*\n([\s\S]*?)```/g;
        let match;
        
        while ((match = codeRegex.exec(content)) !== null) {
            const language = match[1] || 'txt';
            const code = match[2].trim();
            codeBlocks.push({ language, code });
        }
        
        return codeBlocks;
    }

    getFileExtension(language) {
        const extensions = {
            'python': 'py',
            'javascript': 'js',
            'typescript': 'ts',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'csharp': 'cs',
            'php': 'php',
            'ruby': 'rb',
            'go': 'go',
            'rust': 'rs',
            'html': 'html',
            'css': 'css',
            'sql': 'sql',
            'json': 'json',
            'xml': 'xml',
            'markdown': 'md',
            'yaml': 'yml',
            'bash': 'sh',
            'shell': 'sh'
        };
        
        return extensions[language.toLowerCase()] || 'txt';
    }

    downloadCodeFile(code, fileName) {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    processCodeBlocks(content) {
        const codeBlockRegex = /```(\w+)?\s*\n([\s\S]*?)```/g;
        let processedContent = content;
        let match;
        let codeIndex = 0;
        
        while ((match = codeBlockRegex.exec(content)) !== null) {
            const fullMatch = match[0];
            const language = match[1] || 'plaintext';
            const code = match[2].trim();
            
            const codeBlockId = `code-block-${codeIndex++}`;
            const codeBlockHtml = `
                <div class="code-block-wrapper">
                    <div class="code-header">
                        <span class="code-language">${language}</span>
                        <button class="code-copy-btn" onclick="app.copyCodeToClipboard('${codeBlockId}')">
                            <i class="ti ti-copy"></i>
                        </button>
                    </div>
                    <pre><code id="${codeBlockId}" class="language-${language}">${this.escapeHtml(code)}</code></pre>
                </div>
            `;
            
            processedContent = processedContent.replace(fullMatch, codeBlockHtml);
        }
        
        return processedContent;
    }

    attachCopyButtons(container) {
        const copyButtons = container.querySelectorAll('.code-copy-btn');
        copyButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const codeBlockId = button.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.copyCodeToClipboard(codeBlockId);
            });
        });
    }

    copyCodeToClipboard(codeBlockId) {
        const codeElement = document.getElementById(codeBlockId);
        if (!codeElement) return;
        
        const code = codeElement.textContent;
        navigator.clipboard.writeText(code).then(() => {
            this.showNotification('Код скопирован в буфер обмена', 'success');
        }).catch(err => {
            console.error('Ошибка копирования кода:', err);
            this.showNotification('Ошибка копирования кода', 'error');
        });
    }

    showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.className = 'message message-ai typing-indicator';
        typingElement.id = 'typing-' + Date.now();
        
        typingElement.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                <span>ИИ думает...</span>
            </div>
        `;
        
        this.messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
        
        return typingElement.id;
    }

    removeTypingIndicator() {
        const typingElements = this.messagesContainer.querySelectorAll('.typing-indicator');
        typingElements.forEach(element => {
            element.remove();
        });
        this.activeTypingIndicator = null;
    }

    addMessage(role, content, files = []) {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${role}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (files.length > 0) {
            files.forEach(file => {
                if (file.fileType === 'image') {
                    const imgElement = document.createElement('div');
                    imgElement.className = 'attached-image';
                    imgElement.innerHTML = `
                        <img src="${file.data}" alt="${file.name}" loading="lazy">
                        <span class="image-caption">${file.name}</span>
                    `;
                    messageContent.appendChild(imgElement);
                } else {
                    const fileElement = document.createElement('div');
                    fileElement.className = 'attached-file';
                    fileElement.innerHTML = `
                        <i class="ti ti-file-text"></i>
                        <span>${file.name}</span>
                    `;
                    messageContent.appendChild(fileElement);
                }
            });
        }
        
        if (content) {
            const processedContent = this.processCodeBlocks(content);
            messageContent.innerHTML += processedContent;
        }
        
        if (role === 'assistant') {
            const modelIndicator = document.createElement('div');
            modelIndicator.className = 'model-indicator';
            modelIndicator.textContent = `Модель: ${this.getModelDisplayName(this.currentModel)} • ${this.getModelDescription(this.currentModel)}`;
            messageContent.appendChild(modelIndicator);
        }
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        
        this.attachMessageHandlers(messageElement);
        
        if (role === 'assistant') {
            this.addCodeDownloadButtons(messageElement, content);
        }
        
        this.scrollToBottom();
        this.updateMinimap();
        
        return messageElement;
    }

    attachMessageHandlers(messageElement) {
        const messageContent = messageElement.querySelector('.message-content');
        if (!messageContent) return;
        
        // Обработка ссылок
        const links = messageContent.querySelectorAll('a');
        links.forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });
        
        // Обработка изображений
        const images = messageContent.querySelectorAll('img');
        images.forEach(img => {
            img.setAttribute('loading', 'lazy');
            img.addEventListener('click', () => this.showImageModal(img.src));
        });
        
        // Обработка кода
        this.attachCopyButtons(messageContent);
    }

    showImageModal(src) {
        const modal = document.createElement('div');
        modal.className = 'image-modal';
        modal.innerHTML = `
            <div class="image-modal-content">
                <span class="image-modal-close">&times;</span>
                <img src="${src}" alt="Увеличенное изображение">
            </div>
        `;
        
        modal.querySelector('.image-modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        document.body.appendChild(modal);
    }

    addToConversationHistory(role, content, files = []) {
        const message = { role, content, timestamp: Date.now() };
        
        if (files.length > 0) {
            message.files = files.map(file => ({
                name: file.name,
                type: file.fileType,
                data: file.data
            }));
        }
        
        this.conversationHistory.push(message);
        
        if (this.conversationHistory.length > this.CONVERSATION_HISTORY_LIMIT) {
            this.conversationHistory = this.conversationHistory.slice(-this.CONVERSATION_HISTORY_LIMIT);
        }
    }

    buildContextPrompt(userMessage) {
        const recentHistory = this.conversationHistory.slice(-10);
        let context = '';
        
        if (recentHistory.length > 0) {
            context = 'Контекст предыдущих сообщений:\n';
            recentHistory.forEach(msg => {
                const role = msg.role === 'user' ? 'Пользователь' : 'Ассистент';
                context += `${role}: ${msg.content}\n`;
            });
            context += '\n';
        }
        
        return `${context}Текущее сообщение пользователя: ${userMessage}

Ответь на сообщение пользователя, учитывая контекст выше. Будь полезным ассистентом и отвечай на русском языке.`;
    }

    // File Handling
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;
        
        if (this.attachedImages.length + files.length > this.MAX_FILES) {
            this.showNotification(`Максимум ${this.MAX_FILES} файлов`, 'error');
            return;
        }
        
        files.forEach(file => {
            this.processFile(file);
        });
        
        event.target.value = '';
    }

    processFile(file) {
        if (file.size > this.MAX_IMAGE_SIZE) {
            this.showNotification(`Файл ${file.name} слишком большой (максимум 5MB)`, 'error');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const fileData = {
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result,
                fileType: this.getFileType(file.type)
            };
            
            this.attachedImages.push(fileData);
            this.renderAttachedFiles();
            this.handleInputChange();
        };
        
        reader.onerror = () => {
            this.showNotification(`Ошибка чтения файла ${file.name}`, 'error');
        };
        
        if (file.type.startsWith('image/')) {
            reader.readAsDataURL(file);
        } else {
            // Для текстовых файлов читаем как текст
            reader.readAsText(file);
        }
    }

    getFileType(mimeType) {
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('text/')) return 'text';
        if (mimeType.includes('pdf')) return 'pdf';
        if (mimeType.includes('word')) return 'document';
        if (mimeType.includes('excel')) return 'spreadsheet';
        if (mimeType.includes('powerpoint')) return 'presentation';
        if (mimeType.includes('zip') || mimeType.includes('rar')) return 'archive';
        return 'file';
    }

    renderAttachedFiles() {
        this.attachedFiles.innerHTML = '';
        
        this.attachedImages.forEach((file, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file-item';
            
            let icon = 'ti-file';
            if (file.fileType === 'image') icon = 'ti-photo';
            else if (file.fileType === 'text') icon = 'ti-file-text';
            else if (file.fileType === 'pdf') icon = 'ti-file-text';
            else if (file.fileType === 'document') icon = 'ti-file-text';
            
            fileElement.innerHTML = `
                <i class="ti ${icon}"></i>
                <span class="file-name">${file.name}</span>
                <button class="remove-file-btn" data-index="${index}">
                    <i class="ti ti-x"></i>
                </button>
            `;
            
            this.attachedFiles.appendChild(fileElement);
        });
        
        const removeButtons = this.attachedFiles.querySelectorAll('.remove-file-btn');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                this.removeAttachedFile(index);
            });
        });
        
        this.attachedFiles.style.display = this.attachedImages.length > 0 ? 'flex' : 'none';
    }

    removeAttachedFile(index) {
        this.attachedImages.splice(index, 1);
        this.renderAttachedFiles();
        this.handleInputChange();
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
                this.voiceInputBtn.classList.add('listening');
                this.showNotification('Слушаю...', 'info');
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
                this.voiceInputBtn.classList.remove('listening');
                
                if (event.error === 'not-allowed') {
                    this.showNotification('Доступ к микрофону запрещен', 'error');
                } else {
                    this.showNotification('Ошибка распознавания речи', 'error');
                }
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                this.voiceInputBtn.classList.remove('listening');
            };
        } else {
            console.warn('Speech recognition not supported');
            this.voiceInputBtn.style.display = 'none';
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
            this.userInput.placeholder = '';
            this.startPlaceholderAnimation();
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
            
            const result = await puter.ai.txt2img(prompt);
            
            if (result?.url) {
                this.addMessage('assistant', '', [{
                    name: `Сгенерированное изображение: ${prompt}`,
                    data: result.url,
                    fileType: 'image'
                }]);
            } else {
                throw new Error('Не удалось сгенерировать изображение');
            }
            
        } catch (error) {
            console.error('Error generating image:', error);
            this.handleError('Ошибка генерации изображения', error);
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
            this.userInput.placeholder = '';
            this.startPlaceholderAnimation();
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
            
            const result = await puter.ai.txt2speech(text);
            
            if (result?.url) {
                const audio = new Audio(result.url);
                audio.controls = true;
                audio.style.width = '100%';
                audio.style.marginTop = '10px';
                
                const messageElement = this.addMessage('assistant', `Сгенерированный голос для текста: "${text}"`);
                messageElement.querySelector('.message-content').appendChild(audio);
                
            } else {
                throw new Error('Не удалось сгенерировать голос');
            }
            
        } catch (error) {
            console.error('Error generating voice:', error);
            this.handleError('Ошибка генерации голоса', error);
        }
    }

    // Chat Management
    createNewChat() {
        const newChatId = 'chat-' + Date.now();
        const newChatName = this.generateChatName();
        
        this.chatSessions.set(newChatId, {
            id: newChatId,
            name: newChatName,
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        
        this.switchToChat(newChatId);
        this.saveChatSessions();
        this.renderChatList();
        this.closeSidebar();
        
        this.showNotification(`Создан новый чат: ${newChatName}`, 'success');
    }

    generateChatName() {
        const adjectives = ['Новый', 'Интересный', 'Важный', 'Срочный', 'Креативный', 'Технический'];
        const nouns = ['диалог', 'разговор', 'чат', 'обсуждение', 'проект', 'вопрос'];
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        return `${adjective} ${noun}`;
    }

    switchToChat(chatId) {
        if (!this.chatSessions.has(chatId)) {
            console.error('Chat not found:', chatId);
            return;
        }
        
        this.saveCurrentSession();
        this.currentChatId = chatId;
        
        const chatSession = this.chatSessions.get(chatId);
        this.conversationHistory = [...chatSession.messages];
        
        this.renderMessages();
        this.updateChatName();
        this.updateDocumentTitle();
        this.updateMinimap();
        this.scrollToBottom();
        
        this.debug(`Switched to chat: ${chatSession.name}`);
    }

    saveCurrentSession() {
        if (!this.currentChatId || !this.chatSessions.has(this.currentChatId)) {
            return;
        }
        
        const chatSession = this.chatSessions.get(this.currentChatId);
        chatSession.messages = [...this.conversationHistory];
        chatSession.updatedAt = Date.now();
        
        this.saveChatSessions();
    }

    loadChatSessions() {
        try {
            const saved = localStorage.getItem('khai-assistant-chats');
            if (saved) {
                const sessions = JSON.parse(saved);
                this.chatSessions = new Map(sessions);
            }
            
            if (this.chatSessions.size === 0) {
                this.createDefaultChat();
            }
            
        } catch (error) {
            console.error('Error loading chat sessions:', error);
            this.createDefaultChat();
        }
    }

    createDefaultChat() {
        const defaultChatId = 'default';
        const defaultChatName = 'Главный чат';
        
        this.chatSessions.set(defaultChatId, {
            id: defaultChatId,
            name: defaultChatName,
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        
        this.currentChatId = defaultChatId;
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
        if (this.chatSessions.has(this.currentChatId)) {
            const chatSession = this.chatSessions.get(this.currentChatId);
            this.conversationHistory = [...chatSession.messages];
            this.renderMessages();
            this.updateChatName();
            this.updateDocumentTitle();
        }
    }

    renderMessages() {
        this.messagesContainer.innerHTML = '';
        
        this.conversationHistory.forEach(message => {
            this.addMessage(message.role, message.content, message.files || []);
        });
        
        this.updateMinimap();
    }

    updateChatName() {
        const chatSession = this.chatSessions.get(this.currentChatId);
        if (chatSession && this.currentChatName) {
            // Ограничиваем название до 16 символов
            const displayName = chatSession.name.length > this.MAX_CHAT_NAME_LENGTH 
                ? chatSession.name.substring(0, this.MAX_CHAT_NAME_LENGTH) + '...'
                : chatSession.name;
            this.currentChatName.textContent = displayName;
        }
    }

    updateDocumentTitle() {
        const chatSession = this.chatSessions.get(this.currentChatId);
        if (chatSession) {
            document.title = `${chatSession.name} - KHAI Assistant`;
        } else {
            document.title = 'KHAI Assistant';
        }
    }

    setupChatSelector() {
        this.renderChatList();
    }

    renderChatList() {
        if (!this.chatList) return;
        
        this.chatList.innerHTML = '';
        
        const sortedChats = Array.from(this.chatSessions.values())
            .sort((a, b) => b.updatedAt - a.updatedAt);
        
        sortedChats.forEach(chatSession => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chatSession.id === this.currentChatId ? 'active' : ''}`;
            
            // Ограничиваем название до 16 символов
            const displayName = chatSession.name.length > this.MAX_CHAT_NAME_LENGTH 
                ? chatSession.name.substring(0, this.MAX_CHAT_NAME_LENGTH) + '...'
                : chatSession.name;
            
            chatItem.innerHTML = `
                <div class="chat-item-content">
                    <i class="ti ti-message-circle"></i>
                    <span class="chat-item-name">${displayName}</span>
                </div>
                <div class="chat-item-actions">
                    <button class="chat-item-edit" title="Редактировать">
                        <i class="ti ti-edit"></i>
                    </button>
                </div>
            `;
            
            chatItem.addEventListener('click', (e) => {
                if (!e.target.closest('.chat-item-edit')) {
                    this.switchToChat(chatSession.id);
                    this.closeSidebar();
                }
            });
            
            const editBtn = chatItem.querySelector('.chat-item-edit');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openEditChatModal(chatSession);
            });
            
            this.chatList.appendChild(chatItem);
        });
    }

    filterChatHistory() {
        const searchTerm = this.sidebarSearch.value.toLowerCase().trim();
        const chatItems = this.chatList.querySelectorAll('.chat-item');
        
        chatItems.forEach(item => {
            const chatName = item.querySelector('.chat-item-name').textContent.toLowerCase();
            if (chatName.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    openEditChatModal(chatSession) {
        this.editChatNameInput.value = chatSession.name;
        this.editChatModal.style.display = 'flex';
        this.currentEditingChat = chatSession;
        
        this.handleModalInputChange();
    }

    closeEditChatModal() {
        this.editChatModal.style.display = 'none';
        this.currentEditingChat = null;
    }

    handleModalInputChange() {
        const hasInput = this.editChatNameInput.value.trim().length > 0;
        if (this.modalClearInput) {
            this.modalClearInput.style.display = hasInput ? 'flex' : 'none';
        }
    }

    clearModalInput() {
        this.editChatNameInput.value = '';
        this.handleModalInputChange();
    }

    saveChatName() {
        if (!this.currentEditingChat) return;
        
        const newName = this.editChatNameInput.value.trim();
        if (!newName) {
            this.showNotification('Название чата не может быть пустым', 'error');
            return;
        }
        
        this.currentEditingChat.name = newName;
        this.chatSessions.set(this.currentEditingChat.id, this.currentEditingChat);
        
        this.saveChatSessions();
        this.renderChatList();
        this.updateChatName();
        this.updateDocumentTitle();
        this.closeEditChatModal();
        
        this.showNotification('Название чата обновлено', 'success');
    }

    deleteAllChats() {
        if (!confirm('Вы уверены, что хотите удалить все чаты? Это действие нельзя отменить.')) {
            return;
        }
        
        this.chatSessions.clear();
        this.createDefaultChat();
        this.saveChatSessions();
        this.renderChatList();
        this.loadCurrentSession();
        
        this.showNotification('Все чаты удалены', 'info');
    }

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
                    console.error('Error importing chat:', error);
                    this.showNotification('Ошибка импорта чата', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    processImportedChat(importedData) {
        if (!importedData.messages || !Array.isArray(importedData.messages)) {
            this.showNotification('Некорректный формат файла чата', 'error');
            return;
        }
        
        const newChatId = 'imported-' + Date.now();
        const chatName = importedData.name || `Импортированный чат ${new Date().toLocaleDateString()}`;
        
        this.chatSessions.set(newChatId, {
            id: newChatId,
            name: chatName,
            messages: importedData.messages,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        
        this.switchToChat(newChatId);
        this.saveChatSessions();
        this.renderChatList();
        
        this.showNotification(`Чат "${chatName}" успешно импортирован`, 'success');
    }

    downloadCurrentChat() {
        const chatSession = this.chatSessions.get(this.currentChatId);
        if (!chatSession) return;
        
        const exportData = {
            name: chatSession.name,
            messages: chatSession.messages,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khai-chat-${chatSession.name.replace(/[^a-z0-9]/gi, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Чат экспортирован', 'success');
    }

    // Model Management
    openModelModal() {
        this.updateModelList();
        this.modelModalOverlay.style.display = 'flex';
    }

    closeModelModal() {
        this.modelModalOverlay.style.display = 'none';
    }

    updateModelList() {
        if (!this.modelList) return;
        
        this.modelList.innerHTML = '';
        
        Object.entries(this.modelConfig).forEach(([modelId, config]) => {
            const modelItem = document.createElement('div');
            modelItem.className = `model-item ${modelId === this.currentModel ? 'selected' : ''} ${!config.available ? 'disabled' : ''}`;
            
            modelItem.innerHTML = `
                <div class="model-info">
                    <div class="model-name">${config.name}</div>
                    <div class="model-description">${config.description}</div>
                    <div class="model-context">Контекст: ${config.context.toLocaleString()} токенов</div>
                </div>
                <div class="model-status">
                    ${modelId === this.currentModel ? '<i class="ti ti-check"></i>' : ''}
                    ${!config.available ? '<div class="model-unavailable">Скоро</div>' : ''}
                </div>
            `;
            
            if (config.available) {
                modelItem.addEventListener('click', () => {
                    if (modelId !== this.currentModel) {
                        this.selectModelInModal(modelId);
                    }
                });
            }
            
            this.modelList.appendChild(modelItem);
        });
    }

    selectModelInModal(modelId) {
        const previouslySelected = this.modelList.querySelector('.model-item.selected');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected');
        }
        
        const newSelected = this.modelList.querySelector(`[data-model="${modelId}"]`);
        if (newSelected) {
            newSelected.classList.add('selected');
        }
        
        this.selectedModelInModal = modelId;
    }

    confirmModelSelection() {
        if (this.selectedModelInModal && this.selectedModelInModal !== this.currentModel) {
            this.currentModel = this.selectedModelInModal;
            this.updateModelInfo();
            this.saveCurrentSession();
            this.showNotification(`Модель изменена на: ${this.getModelDisplayName(this.currentModel)}`, 'success');
        }
        
        this.closeModelModal();
    }

    updateModelInfo() {
        if (this.currentModelInfo) {
            const model = this.modelConfig[this.currentModel];
            this.currentModelInfo.textContent = model.name;
            this.currentModelInfo.title = model.description;
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
        
        this.addEventListener(window, 'resize', () => {
            this.handleScroll();
        });
    }

    handleScroll() {
        const container = this.messagesContainer;
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        
        this.isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
        this.isAtTop = scrollTop < 10;
        
        this.updateScrollButtons();
        this.updateMinimapPosition();
    }

    updateScrollButtons() {
        if (this.scrollToBottomBtn) {
            this.scrollToBottomBtn.style.display = this.isAtBottom ? 'none' : 'flex';
        }
        
        if (this.scrollToLastAI) {
            const hasAIMessages = this.conversationHistory.some(msg => msg.role === 'assistant');
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
        const aiMessages = Array.from(this.messagesContainer.querySelectorAll('.message-ai'));
        if (aiMessages.length > 0) {
            const lastAIMessage = aiMessages[aiMessages.length - 1];
            lastAIMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Minimap
    setupResponsiveMinimap() {
        this.updateMinimap();
        
        const resizeObserver = new ResizeObserver(() => {
            this.updateMinimap();
        });
        
        if (this.messagesContainer) {
            resizeObserver.observe(this.messagesContainer);
        }
        
        if (this.chatMinimap) {
            resizeObserver.observe(this.chatMinimap);
        }
        
        this.addEventListener(this.chatMinimap, 'click', (e) => {
            this.handleMinimapClick(e);
        });
    }

    updateMinimap() {
        if (!this.minimapContent || !this.messagesContainer) return;
        
        const messages = Array.from(this.messagesContainer.querySelectorAll('.message'));
        const containerHeight = this.messagesContainer.scrollHeight;
        
        if (containerHeight === 0) return;
        
        let minimapHTML = '';
        let lastAIIndex = -1;
        
        messages.forEach((message, index) => {
            const isAI = message.classList.contains('message-ai');
            const isUser = message.classList.contains('message-user');
            const height = Math.max(message.offsetHeight / containerHeight * 100, 1);
            
            if (isAI) {
                lastAIIndex = index;
            }
            
            minimapHTML += `<div class="minimap-message ${isAI ? 'minimap-ai' : 'minimap-user'}" style="height: ${height}%"></div>`;
        });
        
        this.minimapContent.innerHTML = minimapHTML;
        this.lastAIMessageIndex = lastAIIndex;
        
        this.updateMinimapViewport();
    }

    updateMinimapPosition() {
        this.updateMinimapViewport();
    }

    updateMinimapViewport() {
        if (!this.minimapViewport || !this.messagesContainer) return;
        
        const container = this.messagesContainer;
        const scrollPercent = container.scrollTop / (container.scrollHeight - container.clientHeight);
        const viewportHeight = container.clientHeight / container.scrollHeight * 100;
        
        this.minimapViewport.style.height = `${viewportHeight}%`;
        this.minimapViewport.style.top = `${scrollPercent * (100 - viewportHeight)}%`;
    }

    handleMinimapClick(e) {
        if (!this.minimapContent) return;
        
        const rect = this.minimapContent.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const clickPercent = clickY / rect.height;
        
        const container = this.messagesContainer;
        const targetScroll = clickPercent * (container.scrollHeight - container.clientHeight);
        
        container.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        });
    }

    // Search
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
        this.clearHighlights();
    }

    highlightSearchTerms(searchTerm) {
        this.clearHighlights();
        
        if (!searchTerm) return;
        
        const messages = this.messagesContainer.querySelectorAll('.message-content');
        const regex = new RegExp(this.escapeRegex(searchTerm), 'gi');
        
        messages.forEach(message => {
            const originalHTML = message.innerHTML;
            const highlightedHTML = originalHTML.replace(regex, match => 
                `<mark class="search-highlight">${match}</mark>`
            );
            
            if (highlightedHTML !== originalHTML) {
                message.innerHTML = highlightedHTML;
                message.classList.add('has-highlight');
            }
        });
    }

    clearHighlights() {
        const messages = this.messagesContainer.querySelectorAll('.message-content');
        
        messages.forEach(message => {
            message.innerHTML = message.innerHTML.replace(/<mark class="search-highlight">([^<]*)<\/mark>/gi, '$1');
            message.classList.remove('has-highlight');
        });
    }

    // Mode Management
    setMode(mode) {
        this.isImageMode = false;
        this.isVoiceMode = false;
        
        this.generateImageBtn.classList.remove('active');
        this.generateVoiceBtn.classList.remove('active');
        
        this.userInput.placeholder = '';
        this.startPlaceholderAnimation();
        
        this.showNotification('Обычный режим включен', 'info');
    }

    // PWA Installation
    checkPWAInstallation() {
        // Для iOS PWA не может быть определено программно
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        
        if (isIOS || isStandalone) {
            // Скрываем кнопку установки на iOS или если уже установлено
            const installBtn = document.getElementById('installPWA');
            if (installBtn) {
                installBtn.style.display = 'none';
            }
        }
    }

    // Connection Status
    updateConnectionStatus() {
        if (!this.connectionStatus) return;
        
        const isOnline = navigator.onLine;
        this.connectionStatus.className = `connection-status ${isOnline ? 'online' : 'offline'}`;
        
        if (this.connectionStatusText) {
            this.connectionStatusText.textContent = isOnline ? 'Онлайн' : 'Офлайн';
        }
    }

    handleOnlineStatus() {
        this.updateConnectionStatus();
        this.showNotification('Соединение восстановлено', 'success');
    }

    handleOfflineStatus() {
        this.updateConnectionStatus();
        this.showNotification('Отсутствует подключение к интернету', 'error');
    }

    // Global Event Handlers
    handleGlobalKeydown(e) {
        // Ctrl/Cmd + K для поиска
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (this.headerSearch) {
                this.headerSearch.focus();
            }
        }
        
        // Escape для очистки поиска
        if (e.key === 'Escape') {
            if (this.headerSearch && this.headerSearch.value) {
                this.clearSearch();
            }
            if (this.sidebarSearch && this.sidebarSearch.value) {
                this.clearSidebarSearch();
            }
        }
    }

    handleResize() {
        this.updateMinimap();
        this.updateScrollButtons();
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
        this.sidebarOverlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeSidebar() {
        this.sidebarMenu.classList.remove('active');
        this.sidebarOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Modal Management
    showHelpModal() {
        const helpContent = `
            <h2>KHAI Assistant - Руководство</h2>
            
            <div class="help-section">
                <h3>Основные возможности:</h3>
                <ul>
                    <li><strong>Общение с ИИ</strong> - задавайте вопросы и получайте развернутые ответы</li>
                    <li><strong>Анализ файлов</strong> - загружайте изображения и текстовые файлы для анализа</li>
                    <li><strong>Генерация изображений</strong> - создавайте изображения по текстовому описанию</li>
                    <li><strong>Генерация голоса</strong> - преобразуйте текст в речь</li>
                    <li><strong>Несколько моделей ИИ</strong> - выбирайте подходящую модель для ваших задач</li>
                </ul>
            </div>
            
            <div class="help-section">
                <h3>Горячие клавиши:</h3>
                <ul>
                    <li><kbd>Enter</kbd> - отправить сообщение</li>
                    <li><kbd>Shift + Enter</kbd> - новая строка</li>
                    <li><kbd>Ctrl/Cmd + K</kbd> - поиск по чату</li>
                    <li><kbd>Escape</kbd> - очистить поиск</li>
                </ul>
            </div>
            
            <div class="help-section">
                <h3>Поддерживаемые форматы файлов:</h3>
                <ul>
                    <li><strong>Изображения:</strong> PNG, JPG, JPEG, GIF, WebP</li>
                    <li><strong>Текстовые файлы:</strong> TXT, PDF, DOC, DOCX</li>
                    <li><strong>Код:</strong> JS, PY, HTML, CSS, JSON, XML и другие</li>
                    <li><strong>Документы:</strong> любые текстовые форматы</li>
                </ul>
            </div>
            
            <div class="help-section">
                <h3>Доступные модели:</h3>
                <ul>
                    <li><strong>GPT-5 Nano</strong> - быстрая и эффективная</li>
                    <li><strong>O3 Mini</strong> - улучшенные возможности рассуждения</li>
                    <li><strong>DeepSeek Chat</strong> - универсальная для общения</li>
                    <li><strong>Gemini 2.0 Flash</strong> - новейшая от Google</li>
                    <li><strong>xAI Grok</strong> - с уникальным характером</li>
                </ul>
            </div>
        `;
        
        // Создаем модальное окно помощи
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content help-modal">
                <div class="modal-header">
                    <h2>Помощь</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${helpContent}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="closeHelpModal">Закрыть</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeModal = () => {
            modal.remove();
        };
        
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('#closeHelpModal').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Utility Methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    debug(...args) {
        if (this.DEBUG) {
            console.log('[KHAI Assistant]', ...args);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="ti ti-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="ti ti-x"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Анимация появления
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Автоматическое закрытие
        const autoClose = setTimeout(() => {
            this.hideNotification(notification);
        }, 5000);
        
        // Закрытие по клику
        notification.querySelector('.notification-close').addEventListener('click', () => {
            clearTimeout(autoClose);
            this.hideNotification(notification);
        });
    }

    hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
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

    handleError(message, error) {
        console.error(message, error);
        
        let userMessage = message;
        if (error.message) {
            if (error.message.includes('network') || error.message.includes('Network')) {
                userMessage = 'Ошибка сети. Проверьте подключение к интернету.';
            } else if (error.message.includes('quota') || error.message.includes('limit')) {
                userMessage = 'Превышен лимит запросов. Попробуйте позже.';
            } else if (error.message.includes('auth') || error.message.includes('permission')) {
                userMessage = 'Ошибка авторизации. Проверьте настройки доступа.';
            }
        }
        
        this.showNotification(userMessage, 'error');
        
        this.isProcessing = false;
        this.isGenerating = false;
        this.updateSendButton(false);
    }

    handleCriticalError(message, error) {
        console.error('CRITICAL ERROR:', message, error);
        
        // Показать пользователю сообщение об ошибке
        this.showNotification('Критическая ошибка приложения. Пожалуйста, перезагрузите страницу.', 'error');
        
        // Можно добавить отправку ошибки в систему мониторинга
        // this.reportError(error);
    }

    refreshPage() {
        if (confirm('Перезагрузить страницу? Все несохраненные данные будут потеряны.')) {
            window.location.reload();
        }
    }

    clearInput() {
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        this.handleInputChange();
    }

    clearChat() {
        if (confirm('Очистить текущий чат? Все сообщения будут удалены.')) {
            this.conversationHistory = [];
            this.messagesContainer.innerHTML = '';
            this.updateMinimap();
            this.saveCurrentSession();
            this.showNotification('Чат очищен', 'info');
        }
    }

    // Cleanup
    cleanup() {
        // Очистка таймеров
        this.debounceTimers.forEach((timer, id) => {
            clearTimeout(timer);
        });
        this.debounceTimers.clear();
        
        // Очистка таймаутов
        this.activeTimeouts.forEach(timeoutId => {
            clearTimeout(timeoutId);
        });
        this.activeTimeouts.clear();
        
        // Очистка обработчиков событий
        this.activeEventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        this.activeEventListeners.clear();
        
        // Остановка генерации
        if (this.isGenerating && this.currentStreamController) {
            this.currentStreamController.abort();
        }
        
        // Остановка голосового ввода
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        
        // Остановка воспроизведения голоса
        if (this.currentAudio && !this.currentAudio.paused) {
            this.currentAudio.pause();
        }
        
        // Сохранение текущей сессии
        this.saveCurrentSession();
        
        // Вызов зарегистрированных колбэков очистки
        this.cleanupCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Error in cleanup callback:', error);
            }
        });
        this.cleanupCallbacks.length = 0;
        
        this.debug('Application cleaned up');
    }
}

// Инициализация приложения
let app;

document.addEventListener('DOMContentLoaded', () => {
    try {
        app = new KHAIAssistant();
        window.app = app; // Для глобального доступа при необходимости
        
        // Обработка ошибок window
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            app?.showNotification('Произошла непредвиденная ошибка', 'error');
        });
        
        // Обработка необработанных промисов
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            app?.showNotification('Ошибка в асинхронной операции', 'error');
            event.preventDefault();
        });
        
    } catch (error) {
        console.error('Failed to initialize KHAI Assistant:', error);
        
        // Показать сообщение об ошибке пользователю
        const errorElement = document.createElement('div');
        errorElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: #dc3545;
            color: white;
            padding: 20px;
            text-align: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        errorElement.innerHTML = `
            <h3>Ошибка загрузки приложения</h3>
            <p>Не удалось загрузить KHAI Assistant. Пожалуйста, перезагрузите страницу.</p>
            <button onclick="window.location.reload()" style="
                background: white;
                color: #dc3545;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            ">Перезагрузить</button>
        `;
        document.body.appendChild(errorElement);
    }
});

// Service Worker регистрация
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// PWA Installation
let deferredPrompt;
const installBtn = document.getElementById('installPWA');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    if (installBtn) {
        installBtn.style.display = 'flex';
        
        installBtn.addEventListener('click', () => {
            installBtn.style.display = 'none';
            deferredPrompt.prompt();
            
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                deferredPrompt = null;
            });
        });
    }
});

window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    if (installBtn) {
        installBtn.style.display = 'none';
    }
    deferredPrompt = null;
});
