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
            
            // Обновляем placeholder в зависимости от режима
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

Ответь на вопрос/сообщение пользователя "${userMessage}", учитывая содержимое прикрепленного файла. Проанализируй текст/код и дай развернутый ответ на основе предоставленной информации. Отвечай на русском языке.`;
                } else {
                    return `Пользователь отправил файл "${file.name}".

Содержимое файла:
"""
${fileContent}
"""

Проанализируй содержимое этого файла. Суммируй основную информацию, выдели ключевые моменты, предложи выводы или рекомендации на основе представленного текста/кода. Отвечай подробно на русском языке.`;
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
        downloadCodeBtn.title = 'Скачать все блоки кода из сообщения';
        
        downloadCodeBtn.addEventListener('click', () => {
            this.downloadCodeBlocks(codeBlocks);
        });
        
        messageActions.appendChild(downloadCodeBtn);
    }

    downloadCodeBlocks(codeBlocks) {
        if (codeBlocks.length === 0) return;
        
        let combinedContent = '';
        codeBlocks.forEach((block, index) => {
            combinedContent += `// Блок кода ${index + 1} (${block.language})\n${block.code}\n\n`;
        });
        
        const blob = new Blob([combinedContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-code-${new Date().getTime()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Все блоки кода скачаны', 'success');
    }

    extractCodeFromMessage(content) {
        const codeBlocks = [];
        const codeRegex = /```(\w+)?\s*\n([\s\S]*?)```/g;
        let match;
        
        while ((match = codeRegex.exec(content)) !== null) {
            const language = match[1] || 'text';
            const code = match[2].trim();
            codeBlocks.push({ language, code });
        }
        
        return codeBlocks;
    }

    processCodeBlocks(content) {
        if (typeof marked === 'undefined') {
            return this.escapeHtml(content).replace(/\n/g, '<br>');
        }
        
        try {
            return marked.parse(content);
        } catch (error) {
            console.error('Error processing markdown:', error);
            return this.escapeHtml(content).replace(/\n/g, '<br>');
        }
    }

    attachMessageHandlers(messageElement) {
        const copyBtn = messageElement.querySelector('.copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const messageContent = messageElement.querySelector('.message-content');
                const textToCopy = messageContent.innerText || messageContent.textContent;
                this.copyToClipboard(textToCopy);
                this.showNotification('Сообщение скопировано в буфер обмена', 'success');
            });
        }
    }

    attachCopyButtons(container) {
        const codeBlocks = container.querySelectorAll('pre code');
        codeBlocks.forEach(codeBlock => {
            const pre = codeBlock.parentElement;
            if (!pre.querySelector('.copy-btn')) {
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-btn';
                copyBtn.innerHTML = '<i class="ti ti-copy"></i>';
                copyBtn.title = 'Копировать код';
                
                copyBtn.addEventListener('click', () => {
                    const code = codeBlock.textContent || '';
                    this.copyToClipboard(code);
                    copyBtn.innerHTML = '<i class="ti ti-check"></i>';
                    copyBtn.classList.add('copied');
                    
                    this.setTimeout(() => {
                        copyBtn.innerHTML = '<i class="ti ti-copy"></i>';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                });
                
                pre.style.position = 'relative';
                pre.appendChild(copyBtn);
            }
        });
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
        if (file.size > this.MAX_IMAGE_SIZE) {
            this.showNotification(`Файл слишком большой (максимум ${this.MAX_IMAGE_SIZE / 1024 / 1024}MB)`, 'error');
            return;
        }
        
        const fileType = this.getFileType(file);
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const fileData = {
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result,
                fileType: fileType,
                preview: fileType === 'image' ? e.target.result : null
            };
            
            this.attachedImages.push(fileData);
            this.renderAttachedFiles();
        };
        
        if (fileType === 'image') {
            reader.readAsDataURL(file);
        } else {
            reader.readAsText(file);
        }
    }

    getFileType(file) {
        if (file.type.startsWith('image/')) {
            return 'image';
        } else if (file.type.startsWith('text/') || 
                   file.name.endsWith('.txt') || 
                   file.name.endsWith('.md') ||
                   file.name.endsWith('.json') ||
                   file.name.endsWith('.xml') ||
                   file.name.endsWith('.csv')) {
            return 'text';
        } else if (file.name.endsWith('.js') || 
                  file.name.endsWith('.py') || 
                  file.name.endsWith('.java') ||
                  file.name.endsWith('.cpp') ||
                  file.name.endsWith('.c') ||
                  file.name.endsWith('.html') ||
                  file.name.endsWith('.css') ||
                  file.name.endsWith('.php') ||
                  file.name.endsWith('.rb') ||
                  file.name.endsWith('.go') ||
                  file.name.endsWith('.rs') ||
                  file.name.endsWith('.ts')) {
            return 'code';
        } else {
            return 'other';
        }
    }

    renderAttachedFiles() {
        if (!this.attachedFiles) return;
        
        this.attachedFiles.innerHTML = '';
        
        this.attachedImages.forEach((file, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            fileElement.innerHTML = `
                <div class="file-info">
                    <i class="ti ${this.getFileIcon(file.fileType)}"></i>
                    <span class="file-name">${this.escapeHtml(file.name)}</span>
                    <span class="file-size">(${this.formatFileSize(file.size)})</span>
                </div>
                <button class="remove-file-btn" data-index="${index}">
                    <i class="ti ti-x"></i>
                </button>
            `;
            
            this.attachedFiles.appendChild(fileElement);
        });
        
        if (this.attachedImages.length > 0) {
            this.attachedFiles.style.display = 'flex';
        } else {
            this.attachedFiles.style.display = 'none';
        }
        
        this.attachFileEventListeners();
    }

    attachFileEventListeners() {
        const removeButtons = this.attachedFiles.querySelectorAll('.remove-file-btn');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                this.removeAttachedFile(index);
            });
        });
    }

    removeAttachedFile(index) {
        this.attachedImages.splice(index, 1);
        this.renderAttachedFiles();
    }

    clearInput() {
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        this.userInput.focus();
        this.handleInputChange();
    }

    // Chat Management
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
        
        this.saveChatSessions();
        this.clearCurrentSession();
        this.updateChatSelector();
        this.updateDocumentTitle();
        this.closeSidebar();
        
        this.showNotification('Новый чат создан', 'success');
    }

    deleteAllChats() {
        if (!confirm('Вы уверены, что хотите удалить все чаты? Это действие нельзя отменить.')) {
            return;
        }
        
        this.chatSessions.clear();
        this.currentChatId = 'default';
        
        this.chatSessions.set('default', {
            id: 'default',
            name: 'Основной чат',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        this.saveChatSessions();
        this.clearCurrentSession();
        this.updateChatSelector();
        this.updateDocumentTitle();
        
        this.showNotification('Все чаты удалены', 'success');
    }

    loadChatSessions() {
        try {
            const saved = localStorage.getItem('khai-assistant-chats');
            if (saved) {
                const sessions = JSON.parse(saved);
                this.chatSessions = new Map(Object.entries(sessions));
            } else {
                this.initializeDefaultSession();
            }
        } catch (error) {
            console.error('Error loading chat sessions:', error);
            this.initializeDefaultSession();
        }
    }

    initializeDefaultSession() {
        this.chatSessions.set('default', {
            id: 'default',
            name: 'Основной чат',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
    }

    saveChatSessions() {
        try {
            const sessions = Object.fromEntries(this.chatSessions);
            localStorage.setItem('khai-assistant-chats', JSON.stringify(sessions));
        } catch (error) {
            console.error('Error saving chat sessions:', error);
        }
    }

    loadCurrentSession() {
        const session = this.chatSessions.get(this.currentChatId);
        if (session) {
            this.conversationHistory = [...session.messages];
            this.renderConversationHistory();
            this.updateDocumentTitle();
        }
    }

    saveCurrentSession() {
        const session = this.chatSessions.get(this.currentChatId);
        if (session) {
            session.messages = [...this.conversationHistory];
            session.updatedAt = new Date().toISOString();
            this.chatSessions.set(this.currentChatId, session);
            this.saveChatSessions();
            this.updateChatSelector();
        }
    }

    clearCurrentSession() {
        this.conversationHistory = [];
        this.messagesContainer.innerHTML = '';
        this.updateDocumentTitle();
        this.saveCurrentSession();
    }

    addToConversationHistory(role, content, files = []) {
        this.conversationHistory.push({
            role,
            content,
            files: files.map(f => ({ name: f.name, type: f.fileType })),
            timestamp: new Date().toISOString()
        });
        
        if (this.conversationHistory.length > this.CONVERSATION_HISTORY_LIMIT) {
            this.conversationHistory = this.conversationHistory.slice(-this.CONVERSATION_HISTORY_LIMIT);
        }
    }

    renderConversationHistory() {
        this.messagesContainer.innerHTML = '';
        
        if (this.conversationHistory.length === 0) {
            this.showWelcomeMessage();
            return;
        }
        
        this.conversationHistory.forEach(message => {
            this.addMessage(message.role, message.content, message.files, false);
        });
        
        this.scrollToBottom();
    }

    showWelcomeMessage() {
        const welcomeMessage = `
            <div class="welcome-container">
                <div class="welcome-content">
                    <h1>Добро пожаловать в KHAI Assistant!</h1>
                    <div class="welcome-features">
                        <div class="feature">
                            <i class="ti ti-message-chatbot"></i>
                            <span>Умный диалог с различными AI-моделями</span>
                        </div>
                        <div class="feature">
                            <i class="ti ti-photo"></i>
                            <span>Анализ изображений и извлечение текста</span>
                        </div>
                        <div class="feature">
                            <i class="ti ti-code"></i>
                            <span>Поддержка файлов и анализ кода</span>
                        </div>
                        <div class="feature">
                            <i class="ti ti-download"></i>
                            <span>Экспорт чатов и скачивание кода</span>
                        </div>
                    </div>
                    <div class="welcome-tips">
                        <h3>Советы по использованию:</h3>
                        <ul>
                            <li>Задавайте вопросы естественным языком</li>
                            <li>Прикрепляйте изображения для анализа</li>
                            <li>Загружайте файлы с кодом для ревью</li>
                            <li>Используйте разные модели для различных задач</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        this.messagesContainer.innerHTML = welcomeMessage;
    }

    addMessage(role, content, files = [], scroll = true) {
        if (this.conversationHistory.length === 0 && role === 'user') {
            this.messagesContainer.innerHTML = '';
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${role}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        let messageHTML = '';
        
        if (files && files.length > 0) {
            files.forEach(file => {
                if (file.fileType === 'image' && file.preview) {
                    messageHTML += `
                        <div class="attached-image-preview">
                            <img src="${file.preview}" alt="${this.escapeHtml(file.name)}" loading="lazy">
                            <div class="image-caption">${this.escapeHtml(file.name)}</div>
                        </div>
                    `;
                } else {
                    messageHTML += `
                        <div class="attached-file-preview">
                            <i class="ti ${this.getFileIcon(file.fileType)}"></i>
                            <span>${this.escapeHtml(file.name)}</span>
                            <small>(${this.formatFileSize(file.size)})</small>
                        </div>
                    `;
                }
            });
        }
        
        if (content) {
            const processedContent = role === 'assistant' ? 
                this.processCodeBlocks(content) : 
                this.escapeHtml(content).replace(/\n/g, '<br>');
            
            messageHTML += `<div class="message-text">${processedContent}</div>`;
        }
        
        messageContent.innerHTML = messageHTML;
        
        if (role === 'assistant') {
            this.attachCopyButtons(messageContent);
            
            const modelIndicator = document.createElement('div');
            modelIndicator.className = 'model-indicator';
            modelIndicator.textContent = `Модель: ${this.getModelDisplayName(this.currentModel)} • ${this.getModelDescription(this.currentModel)}`;
            messageContent.appendChild(modelIndicator);
        }
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        
        if (scroll) {
            this.scrollToBottom();
        }
        
        this.updateMinimap();
        return messageElement;
    }

    // Chat Selector
    setupChatSelector() {
        this.updateChatSelector();
    }

    updateChatSelector() {
        if (!this.chatList) return;
        
        this.chatList.innerHTML = '';
        
        const sortedSessions = Array.from(this.chatSessions.values())
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        sortedSessions.forEach(session => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${session.id === this.currentChatId ? 'active' : ''}`;
            chatItem.innerHTML = `
                <div class="chat-item-content">
                    <i class="ti ti-message-circle"></i>
                    <span class="chat-item-name">${this.escapeHtml(this.truncateChatName(session.name))}</span>
                </div>
                <div class="chat-item-actions">
                    <button class="chat-edit-btn" title="Редактировать название">
                        <i class="ti ti-edit"></i>
                    </button>
                </div>
            `;
            
            chatItem.addEventListener('click', (e) => {
                if (!e.target.closest('.chat-edit-btn')) {
                    this.switchToChat(session.id);
                }
            });
            
            const editBtn = chatItem.querySelector('.chat-edit-btn');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openEditChatModal(session.id);
            });
            
            this.chatList.appendChild(chatItem);
        });
        
        this.updateCurrentChatName();
    }

    truncateChatName(name) {
        if (name.length > this.MAX_CHAT_NAME_LENGTH) {
            return name.substring(0, this.MAX_CHAT_NAME_LENGTH - 3) + '...';
        }
        return name;
    }

    switchToChat(chatId) {
        if (this.currentChatId === chatId) {
            this.closeSidebar();
            return;
        }
        
        this.saveCurrentSession();
        this.currentChatId = chatId;
        this.loadCurrentSession();
        this.updateChatSelector();
        this.updateDocumentTitle();
        this.closeSidebar();
        
        this.showNotification('Переключено на другой чат', 'info');
    }

    updateCurrentChatName() {
        const session = this.chatSessions.get(this.currentChatId);
        if (session && this.currentChatName) {
            this.currentChatName.textContent = this.truncateChatName(session.name);
        }
    }

    updateDocumentTitle() {
        const session = this.chatSessions.get(this.currentChatId);
        if (session) {
            document.title = `${this.truncateChatName(session.name)} - KHAI Assistant`;
        } else {
            document.title = 'KHAI Assistant';
        }
    }

    // Edit Chat Modal
    openEditChatModal(chatId) {
        const session = this.chatSessions.get(chatId);
        if (!session) return;
        
        this.editChatModal.setAttribute('data-chat-id', chatId);
        this.editChatNameInput.value = session.name;
        this.handleModalInputChange();
        this.editChatModal.style.display = 'flex';
        this.editChatNameInput.focus();
        this.editChatNameInput.select();
    }

    closeEditChatModal() {
        this.editChatModal.style.display = 'none';
        this.editChatModal.removeAttribute('data-chat-id');
    }

    handleModalInputChange() {
        const hasInput = this.editChatNameInput.value.trim().length > 0;
        if (this.modalClearInput) {
            this.modalClearInput.style.display = hasInput ? 'flex' : 'none';
        }
    }

    clearModalInput() {
        this.editChatNameInput.value = '';
        this.editChatNameInput.focus();
        this.handleModalInputChange();
    }

    saveChatName() {
        const chatId = this.editChatModal.getAttribute('data-chat-id');
        const newName = this.editChatNameInput.value.trim();
        
        if (!chatId || !newName) {
            this.showNotification('Название чата не может быть пустым', 'error');
            return;
        }
        
        const session = this.chatSessions.get(chatId);
        if (session) {
            session.name = newName;
            session.updatedAt = new Date().toISOString();
            this.chatSessions.set(chatId, session);
            this.saveChatSessions();
            this.updateChatSelector();
            this.updateDocumentTitle();
            this.closeEditChatModal();
            
            this.showNotification('Название чата обновлено', 'success');
        }
    }

    // Model Management
    updateModelInfo() {
        if (this.currentModelInfo) {
            this.currentModelInfo.textContent = this.getModelDisplayName(this.currentModel);
            this.currentModelInfo.title = this.getModelDescription(this.currentModel);
        }
    }

    updateModelList() {
        if (!this.modelList) return;
        
        this.modelList.innerHTML = '';
        
        Object.entries(this.modelConfig).forEach(([modelId, config]) => {
            const modelItem = document.createElement('div');
            modelItem.className = `model-item ${modelId === this.currentModel ? 'selected' : ''} ${!config.available ? 'unavailable' : ''}`;
            modelItem.innerHTML = `
                <div class="model-item-content">
                    <div class="model-name">${config.name}</div>
                    <div class="model-description">${config.description}</div>
                </div>
                <div class="model-status">
                    ${modelId === this.currentModel ? '<i class="ti ti-check"></i>' : ''}
                    ${!config.available ? '<i class="ti ti-lock"></i>' : ''}
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
        const modelItems = this.modelList.querySelectorAll('.model-item');
        modelItems.forEach(item => item.classList.remove('selected'));
        
        const selectedItem = this.modelList.querySelector(`[data-model="${modelId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
        
        this.selectedModelInModal = modelId;
    }

    openModelModal() {
        this.selectedModelInModal = this.currentModel;
        this.updateModelList();
        this.modelModalOverlay.style.display = 'flex';
    }

    closeModelModal() {
        this.modelModalOverlay.style.display = 'none';
        this.selectedModelInModal = null;
    }

    confirmModelSelection() {
        if (this.selectedModelInModal && this.selectedModelInModal !== this.currentModel) {
            this.currentModel = this.selectedModelInModal;
            this.updateModelInfo();
            this.saveCurrentSession();
            
            this.showNotification(`Модель изменена на ${this.getModelDisplayName(this.currentModel)}`, 'success');
        }
        
        this.closeModelModal();
    }

    getModelDisplayName(modelId) {
        return this.modelConfig[modelId]?.name || modelId;
    }

    getModelDescription(modelId) {
        return this.modelConfig[modelId]?.description || 'Описание недоступно';
    }

    // Voice Recognition
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
                let interimTranscript = '';
                let finalTranscript = '';
                
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
                    this.stopVoiceInput();
                } else if (interimTranscript) {
                    this.userInput.value = interimTranscript;
                    this.handleInputChange();
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.stopVoiceInput();
                
                if (event.error === 'not-allowed') {
                    this.showNotification('Доступ к микрофону запрещен', 'error');
                } else {
                    this.showNotification('Ошибка голосового ввода', 'error');
                }
            };
            
            this.recognition.onend = () => {
                this.stopVoiceInput();
            };
        } else {
            console.warn('Speech recognition not supported');
            this.voiceInputBtn.style.display = 'none';
        }
    }

    toggleVoiceInput() {
        if (this.isListening) {
            this.stopVoiceInput();
        } else {
            this.startVoiceInput();
        }
    }

    startVoiceInput() {
        if (!this.recognition) {
            this.showNotification('Голосовой ввод не поддерживается', 'error');
            return;
        }
        
        try {
            this.recognition.start();
        } catch (error) {
            console.error('Error starting voice recognition:', error);
            this.showNotification('Ошибка запуска голосового ввода', 'error');
        }
    }

    stopVoiceInput() {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
            } catch (error) {
                console.error('Error stopping voice recognition:', error);
            }
        }
        
        this.isListening = false;
        this.updateVoiceButton();
    }

    updateVoiceButton() {
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

    // Modes
    toggleImageMode() {
        this.isImageMode = !this.isImageMode;
        this.isVoiceMode = false;
        
        this.updateModeButtons();
        this.updateInputPlaceholder();
        
        if (this.isImageMode) {
            this.showNotification('Режим генерации изображений включен', 'info');
        }
    }

    toggleVoiceMode() {
        this.isVoiceMode = !this.isVoiceMode;
        this.isImageMode = false;
        
        this.updateModeButtons();
        this.updateInputPlaceholder();
        
        if (this.isVoiceMode) {
            this.showNotification('Режим генерации голоса включен', 'info');
        }
    }

    setMode(mode) {
        this.isImageMode = false;
        this.isVoiceMode = false;
        
        if (mode === 'image') this.isImageMode = true;
        if (mode === 'voice') this.isVoiceMode = true;
        
        this.updateModeButtons();
        this.updateInputPlaceholder();
    }

    updateModeButtons() {
        const buttons = [
            { element: this.generateImageBtn, mode: 'image', activeClass: 'image-mode-active' },
            { element: this.generateVoiceBtn, mode: 'voice', activeClass: 'voice-mode-active' }
        ];
        
        buttons.forEach(({ element, mode, activeClass }) => {
            if (element) {
                if ((mode === 'image' && this.isImageMode) || (mode === 'voice' && this.isVoiceMode)) {
                    element.classList.add(activeClass);
                } else {
                    element.classList.remove(activeClass);
                }
            }
        });
    }

    updateInputPlaceholder() {
        if (this.isVoiceMode) {
            this.userInput.placeholder = 'Введите текст для генерации голоса...';
        } else if (this.isImageMode) {
            this.userInput.placeholder = 'Опишите изображение для генерации...';
        } else {
            this.userInput.placeholder = 'Задайте вопрос или опишите изображение...';
        }
    }

    // Image Generation
    async generateImage(prompt) {
        if (!prompt.trim()) {
            this.showNotification('Введите описание для генерации изображения', 'error');
            return;
        }
        
        this.addMessage('user', prompt);
        this.addToConversationHistory('user', prompt);
        
        const typingIndicator = this.showTypingIndicator();
        
        try {
            if (typeof puter?.ai?.txt2img !== 'function') {
                throw new Error('Функция генерации изображений недоступна');
            }
            
            const imageUrl = await puter.ai.txt2img(prompt);
            
            this.removeTypingIndicator();
            this.addMessage('assistant', '', [{
                name: 'Сгенерированное изображение',
                fileType: 'image',
                preview: imageUrl
            }]);
            
            this.addToConversationHistory('assistant', 'Сгенерировано изображение: ' + prompt);
            this.saveCurrentSession();
            
        } catch (error) {
            this.removeTypingIndicator();
            this.handleError('Ошибка при генерации изображения', error);
        }
    }

    // Voice Generation
    async generateVoice(text) {
        if (!text.trim()) {
            this.showNotification('Введите текст для генерации голоса', 'error');
            return;
        }
        
        this.addMessage('user', text);
        this.addToConversationHistory('user', text);
        
        const typingIndicator = this.showTypingIndicator();
        
        try {
            if (typeof puter?.ai?.txt2speech !== 'function') {
                throw new Error('Функция генерации голоса недоступна');
            }
            
            const audioUrl = await puter.ai.txt2speech(text);
            
            this.removeTypingIndicator();
            this.addVoiceMessage(audioUrl, text);
            this.addToConversationHistory('assistant', 'Сгенерирован голос: ' + text);
            this.saveCurrentSession();
            
        } catch (error) {
            this.removeTypingIndicator();
            this.handleError('Ошибка при генерации голоса', error);
        }
    }

    addVoiceMessage(audioUrl, text) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-ai';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        messageContent.innerHTML = `
            <div class="voice-message">
                <audio controls src="${audioUrl}"></audio>
                <div class="voice-transcript">
                    <strong>Транскрипция:</strong>
                    <p>${this.escapeHtml(text)}</p>
                </div>
            </div>
            <div class="model-indicator">
                Модель: ${this.getModelDisplayName(this.currentModel)} • Синтез речи
            </div>
        `;
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    // Typing Indicator
    showTypingIndicator() {
        this.removeTypingIndicator();
        
        const typingElement = document.createElement('div');
        typingElement.className = 'message message-ai typing-indicator';
        typingElement.id = 'typing-indicator';
        
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
        const existing = document.getElementById('typing-indicator');
        if (existing) {
            existing.remove();
        }
        this.activeTypingIndicator = null;
    }

    // Navigation & Scrolling
    setupScrollTracking() {
        this.addEventListener(this.messagesContainer, 'scroll', () => {
            this.handleScroll();
        });
        
        this.handleScroll();
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
    }

    scrollToBottom(force = false) {
        if (force || this.autoScrollEnabled) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            this.isAtBottom = true;
            this.updateScrollButtons();
        }
    }

    scrollToLastAIMessage() {
        const aiMessages = this.messagesContainer.querySelectorAll('.message-ai');
        if (aiMessages.length > 0) {
            const lastAIMessage = aiMessages[aiMessages.length - 1];
            lastAIMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Minimap
    setupResponsiveMinimap() {
        this.updateMinimap();
        
        this.addEventListener(this.chatMinimap, 'click', (e) => {
            const rect = this.chatMinimap.getBoundingClientRect();
            const clickY = e.clientY - rect.top;
            const percentage = clickY / rect.height;
            
            this.scrollToPercentage(percentage);
        });
        
        this.addEventListener(window, 'resize', () => {
            this.updateMinimap();
        });
    }

    updateMinimap() {
        if (!this.minimapContent || !this.minimapViewport) return;
        
        const messages = this.messagesContainer.querySelectorAll('.message');
        const containerHeight = this.messagesContainer.scrollHeight;
        const visibleHeight = this.messagesContainer.clientHeight;
        
        if (containerHeight <= visibleHeight) {
            this.chatMinimap.style.display = 'none';
            return;
        }
        
        this.chatMinimap.style.display = 'flex';
        this.minimapContent.innerHTML = '';
        
        messages.forEach(message => {
            const messageElement = document.createElement('div');
            const isAI = message.classList.contains('message-ai');
            const isUser = message.classList.contains('message-user');
            
            messageElement.className = 'minimap-message';
            if (isAI) messageElement.classList.add('minimap-ai');
            if (isUser) messageElement.classList.add('minimap-user');
            
            this.minimapContent.appendChild(messageElement);
        });
        
        this.updateMinimapPosition();
    }

    updateMinimapPosition() {
        if (!this.minimapViewport) return;
        
        const container = this.messagesContainer;
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const visibleHeight = container.clientHeight;
        
        const viewportTop = (scrollTop / scrollHeight) * 100;
        const viewportHeight = (visibleHeight / scrollHeight) * 100;
        
        this.minimapViewport.style.top = viewportTop + '%';
        this.minimapViewport.style.height = viewportHeight + '%';
    }

    scrollToPercentage(percentage) {
        const container = this.messagesContainer;
        const maxScroll = container.scrollHeight - container.clientHeight;
        const targetScroll = percentage * maxScroll;
        
        container.scrollTop = targetScroll;
    }

    // Search
    handleSearchInput() {
        const searchTerm = this.headerSearch.value.trim();
        if (this.headerSearchClear) {
            this.headerSearchClear.style.display = searchTerm ? 'flex' : 'none';
        }
        
        this.filterMessages(searchTerm);
    }

    clearSearch() {
        this.headerSearch.value = '';
        if (this.headerSearchClear) {
            this.headerSearchClear.style.display = 'none';
        }
        this.filterMessages('');
    }

    filterMessages(searchTerm) {
        const messages = this.messagesContainer.querySelectorAll('.message');
        
        messages.forEach(message => {
            const text = message.textContent || message.innerText;
            const matches = searchTerm === '' || text.toLowerCase().includes(searchTerm.toLowerCase());
            message.style.display = matches ? 'flex' : 'none';
        });
    }

    filterChatHistory() {
        const searchTerm = this.sidebarSearch.value.trim().toLowerCase();
        const chatItems = this.chatList.querySelectorAll('.chat-item');
        
        chatItems.forEach(item => {
            const chatName = item.querySelector('.chat-item-name').textContent.toLowerCase();
            const matches = searchTerm === '' || chatName.includes(searchTerm);
            item.style.display = matches ? 'flex' : 'none';
        });
    }

    // Sidebar
    toggleSidebar() {
        this.sidebarMenu.classList.toggle('active');
        this.sidebarOverlay.style.display = this.sidebarMenu.classList.contains('active') ? 'block' : 'none';
    }

    closeSidebar() {
        this.sidebarMenu.classList.remove('active');
        this.sidebarOverlay.style.display = 'none';
    }

    // Global Handlers
    handleGlobalKeydown(e) {
        if (e.key === 'Escape') {
            if (this.sidebarMenu.classList.contains('active')) {
                this.closeSidebar();
            }
            if (this.editChatModal.style.display === 'flex') {
                this.closeEditChatModal();
            }
            if (this.modelModalOverlay.style.display === 'flex') {
                this.closeModelModal();
            }
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (this.userInput) {
                this.userInput.focus();
            }
        }
    }

    handleResize() {
        this.updateMinimap();
        this.handleScroll();
    }

    // Network Status
    updateConnectionStatus() {
        if (!this.connectionStatus || !this.connectionStatusText) return;
        
        const isOnline = navigator.onLine;
        
        if (isOnline) {
            this.connectionStatus.classList.remove('offline');
            this.connectionStatus.classList.add('online');
            this.connectionStatusText.textContent = 'Онлайн';
            this.connectionStatus.title = 'Соединение установлено';
        } else {
            this.connectionStatus.classList.remove('online');
            this.connectionStatus.classList.add('offline');
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

    // PWA Installation
    checkPWAInstallation() {
        const installButton = document.getElementById('installPWA');
        if (!installButton) return;

        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            installButton.style.display = 'flex';
            
            installButton.onclick = async () => {
                if (!deferredPrompt) return;
                
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                
                if (outcome === 'accepted') {
                    installButton.style.display = 'none';
                }
                
                deferredPrompt = null;
            };
        });

        window.addEventListener('appinstalled', () => {
            installButton.style.display = 'none';
            deferredPrompt = null;
            this.showNotification('Приложение успешно установлено!', 'success');
        });

        // Проверяем, установлено ли приложение уже
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            installButton.style.display = 'none';
        }
    }

    // Import/Export
    async importChatHistory() {
        try {
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
                        this.showNotification('Ошибка при чтении файла', 'error');
                    }
                };
                reader.readAsText(file);
            };
            
            input.click();
        } catch (error) {
            this.showNotification('Ошибка при импорте чата', 'error');
        }
    }

    processImportedChat(importedData) {
        if (!importedData || !Array.isArray(importedData.messages)) {
            this.showNotification('Неверный формат файла чата', 'error');
            return;
        }
        
        const newChatId = 'imported-' + Date.now();
        const chatName = importedData.name || 'Импортированный чат';
        
        this.chatSessions.set(newChatId, {
            id: newChatId,
            name: this.truncateChatName(chatName),
            messages: importedData.messages,
            createdAt: importedData.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        this.saveChatSessions();
        this.updateChatSelector();
        this.showNotification('Чат успешно импортирован', 'success');
    }

    downloadCurrentChat() {
        const session = this.chatSessions.get(this.currentChatId);
        if (!session) return;
        
        const exportData = {
            name: session.name,
            messages: session.messages,
            createdAt: session.createdAt,
            exportedAt: new Date().toISOString(),
            model: this.currentModel
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `khai-chat-${session.name}-${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Чат успешно скачан', 'success');
    }

    // Utility Methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getFileIcon(fileType) {
        switch (fileType) {
            case 'image': return 'ti-photo';
            case 'text': return 'ti-file-text';
            case 'code': return 'ti-code';
            default: return 'ti-file';
        }
    }

    copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).catch(() => {
                this.fallbackCopyToClipboard(text);
            });
        } else {
            this.fallbackCopyToClipboard(text);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
        
        document.body.removeChild(textArea);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="ti ti-${this.getNotificationIcon(type)}"></i>
                <span>${this.escapeHtml(message)}</span>
            </div>
            <button class="notification-close">
                <i class="ti ti-x"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });
        
        this.setTimeout(() => {
            this.hideNotification(notification);
        }, 5000);
    }

    hideNotification(notification) {
        notification.classList.remove('show');
        notification.classList.add('hide');
        
        this.setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'circle-check';
            case 'error': return 'circle-x';
            case 'warning': return 'alert-triangle';
            default: return 'info-circle';
        }
    }

    refreshPage() {
        window.location.reload();
    }

    clearChat() {
        if (!confirm('Вы уверены, что хотите очистить текущий чат? Это действие нельзя отменить.')) {
            return;
        }
        
        this.clearCurrentSession();
        this.showNotification('Чат очищен', 'success');
    }

    showHelpModal() {
        const helpContent = `
            <div class="help-content">
                <h2>KHAI Assistant - Руководство</h2>
                
                <div class="help-section">
                    <h3>Основные возможности:</h3>
                    <ul>
                        <li><strong>Умный диалог:</strong> Общайтесь с различными AI-моделями</li>
                        <li><strong>Анализ изображений:</strong> Загружайте изображения для анализа текста</li>
                        <li><strong>Работа с файлами:</strong> Загружайте текстовые файлы и код для анализа</li>
                        <li><strong>Генерация изображений:</strong> Создавайте изображения по описанию</li>
                        <li><strong>Синтез речи:</strong> Преобразуйте текст в голос</li>
                        <li><strong>Голосовой ввод:</strong> Диктуйте сообщения голосом</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h3>Доступные модели:</h3>
                    <ul>
                        <li><strong>GPT-5 Nano:</strong> Быстрая модель для повседневных задач</li>
                        <li><strong>O3 Mini:</strong> Продвинутая модель с улучшенными возможностями рассуждения</li>
                        <li><strong>DeepSeek Chat:</strong> Универсальная модель для общения</li>
                        <li><strong>DeepSeek Reasoner:</strong> Специализированная модель для сложных логических задач</li>
                        <li><strong>Gemini 2.0 Flash:</strong> Новейшая быстрая модель от Google</li>
                        <li><strong>xAI Grok:</strong> Модель с уникальным характером</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h3>Горячие клавиши:</h3>
                    <ul>
                        <li><kbd>Ctrl/Cmd + K</kbd> - Фокус на поле ввода</li>
                        <li><kbd>Enter</kbd> - Отправить сообщение</li>
                        <li><kbd>Shift + Enter</kbd> - Новая строка</li>
                        <li><kbd>Escape</kbd> - Закрыть модальные окна</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h3>Советы по использованию:</h3>
                    <ul>
                        <li>Используйте конкретные и четкие формулировки</li>
                        <li>Для анализа кода прикрепляйте файлы с кодом</li>
                        <li>Экспериментируйте с разными моделями для разных задач</li>
                        <li>Сохраняйте важные чаты через функцию экспорта</li>
                    </ul>
                </div>
            </div>
        `;
        
        this.showModal('Помощь по KHAI Assistant', helpContent);
    }

    showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">
                        <i class="ti ti-x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary modal-ok">Понятно</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const closeModal = () => {
            modal.classList.add('fade-out');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        };
        
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.querySelector('.modal-ok').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        setTimeout(() => {
            modal.classList.add('show');
        }, 100);
    }

    buildContextPrompt(userMessage) {
        if (this.conversationHistory.length === 0) {
            return userMessage;
        }
        
        const recentHistory = this.conversationHistory.slice(-6);
        let context = "Контекст предыдущего разговора:\n";
        
        recentHistory.forEach(msg => {
            const role = msg.role === 'user' ? 'Пользователь' : 'Ассистент';
            context += `${role}: ${msg.content}\n`;
        });
        
        context += `\nТекущий вопрос пользователя: ${userMessage}`;
        context += "\n\nОтветь на текущий вопрос пользователя, учитывая контекст выше. Будь полезным и точным ассистентом.";
        
        return context;
    }

    // Error Handling
    handleError(message, error) {
        console.error(message, error);
        
        let userMessage = message;
        if (error?.message?.includes('network') || error?.message?.includes('Network')) {
            userMessage = 'Ошибка сети. Проверьте подключение к интернету.';
        } else if (error?.message?.includes('quota') || error?.message?.includes('limit')) {
            userMessage = 'Превышен лимит использования. Попробуйте позже.';
        } else if (error?.message?.includes('auth') || error?.message?.includes('permission')) {
            userMessage = 'Ошибка авторизации. Проверьте доступы.';
        }
        
        this.showNotification(userMessage, 'error');
        
        this.isProcessing = false;
        this.isGenerating = false;
        this.updateSendButton(false);
    }

    handleCriticalError(message, error) {
        console.error('CRITICAL ERROR:', message, error);
        
        const errorHTML = `
            <div class="error-container">
                <div class="error-content">
                    <i class="ti ti-alert-triangle"></i>
                    <h2>Критическая ошибка</h2>
                    <p>${message}</p>
                    <p><small>${error?.message || 'Неизвестная ошибка'}</small></p>
                    <button onclick="window.location.reload()" class="btn btn-primary">
                        <i class="ti ti-refresh"></i>
                        Перезагрузить приложение
                    </button>
                </div>
            </div>
        `;
        
        if (this.messagesContainer) {
            this.messagesContainer.innerHTML = errorHTML;
        } else {
            document.body.innerHTML = errorHTML;
        }
    }

    debug(...args) {
        if (this.DEBUG) {
            console.log('[KHAI Assistant]', ...args);
        }
    }

    // Cleanup
    cleanup() {
        this.stopVoiceInput();
        this.stopGeneration();
        this.removeTypingIndicator();
        
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        
        if (this.currentUtterance) {
            speechSynthesis.cancel();
            this.currentUtterance = null;
        }
        
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
        
        this.cleanupCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Error in cleanup callback:', error);
            }
        });
        this.cleanupCallbacks.length = 0;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.khaiAssistant = new KHAIAssistant();
});

// Handle service worker registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
