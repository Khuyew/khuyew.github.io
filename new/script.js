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
        this.supportedCodeExtensions = ['.js', '.py', '.java', '.cpp', '.c', '.html', '.css', '.php', '.rb', '.go', '.rs', '.ts', '.json', '.xml', '.sql', '.md', '.txt'];
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

        codeBlocks.forEach((codeBlock, index) => {
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'message-action-btn download-code-btn';
            downloadBtn.innerHTML = '<i class="ti ti-download"></i>';
            downloadBtn.title = 'Скачать файл с кодом';
            downloadBtn.onclick = () => this.downloadCodeFile(codeBlock.code, codeBlock.language, index + 1);
            messageActions.appendChild(downloadBtn);
        });
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

    downloadCodeFile(code, language, index) {
        const extension = this.getFileExtension(language);
        const filename = `code_${index}.${extension}`;
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    getFileExtension(language) {
        const extensions = {
            'javascript': 'js',
            'python': 'py',
            'java': 'java',
            'cpp': 'cpp',
            'c': 'c',
            'html': 'html',
            'css': 'css',
            'php': 'php',
            'ruby': 'rb',
            'go': 'go',
            'rust': 'rs',
            'typescript': 'ts',
            'json': 'json',
            'xml': 'xml',
            'sql': 'sql',
            'markdown': 'md'
        };
        
        return extensions[language] || 'txt';
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
            const pre = codeBlock.parentNode;
            if (!pre.querySelector('.copy-btn')) {
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-btn';
                copyBtn.innerHTML = '<i class="ti ti-copy"></i>';
                copyBtn.title = 'Копировать код';
                copyBtn.onclick = () => this.copyCodeToClipboard(codeBlock);
                pre.style.position = 'relative';
                pre.appendChild(copyBtn);
            }
        });
    }

    attachMessageHandlers(messageElement) {
        const copyBtn = messageElement.querySelector('.copy-btn');
        if (copyBtn) {
            copyBtn.onclick = () => {
                const codeBlock = copyBtn.parentNode.querySelector('code');
                if (codeBlock) {
                    this.copyCodeToClipboard(codeBlock);
                }
            };
        }
    }

    async copyCodeToClipboard(codeBlock) {
        try {
            const text = codeBlock.textContent || codeBlock.innerText;
            await navigator.clipboard.writeText(text);
            this.showNotification('Код скопирован в буфер обмена', 'success');
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            this.showNotification('Ошибка при копировании кода', 'error');
        }
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
        if (this.activeTypingIndicator) {
            const typingElement = document.getElementById(this.activeTypingIndicator);
            if (typingElement && typingElement.parentNode) {
                typingElement.remove();
            }
            this.activeTypingIndicator = null;
        }
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
                } else if (file.fileType === 'text' || file.fileType === 'code') {
                    const fileElement = document.createElement('div');
                    fileElement.className = 'attached-file';
                    fileElement.innerHTML = `
                        <i class="ti ti-file-text"></i>
                        <span class="file-name">${file.name}</span>
                        <span class="file-size">(${this.formatFileSize(file.size)})</span>
                    `;
                    messageContent.appendChild(fileElement);
                }
            });
        }
        
        if (content) {
            const textElement = document.createElement('div');
            textElement.className = 'message-text';
            
            if (role === 'user') {
                textElement.textContent = content;
            } else {
                textElement.innerHTML = this.processCodeBlocks(content);
                this.attachCopyButtons(textElement);
            }
            
            messageContent.appendChild(textElement);
        }
        
        if (role === 'assistant') {
            const modelIndicator = document.createElement('div');
            modelIndicator.className = 'model-indicator';
            modelIndicator.textContent = `Модель: ${this.getModelDisplayName(this.currentModel)} • ${this.getModelDescription(this.currentModel)}`;
            messageContent.appendChild(modelIndicator);
            
            const messageActions = document.createElement('div');
            messageActions.className = 'message-actions';
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'message-action-btn copy-message-btn';
            copyBtn.innerHTML = '<i class="ti ti-copy"></i>';
            copyBtn.title = 'Копировать сообщение';
            copyBtn.onclick = () => this.copyMessageToClipboard(content);
            messageActions.appendChild(copyBtn);
            
            messageContent.appendChild(messageActions);
        }
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        
        this.scrollToBottom();
        this.updateMinimap();
    }

    copyMessageToClipboard(text) {
        const plainText = text.replace(/<[^>]*>/g, '');
        navigator.clipboard.writeText(plainText).then(() => {
            this.showNotification('Сообщение скопировано в буфер обмена', 'success');
        }).catch(err => {
            console.error('Error copying message:', err);
            this.showNotification('Ошибка при копировании сообщения', 'error');
        });
    }

    addToConversationHistory(role, content, files = []) {
        this.conversationHistory.push({
            role,
            content,
            files: files.map(f => ({
                name: f.name,
                type: f.fileType,
                size: f.size
            })),
            timestamp: Date.now()
        });
        
        if (this.conversationHistory.length > this.CONVERSATION_HISTORY_LIMIT) {
            this.conversationHistory = this.conversationHistory.slice(-this.CONVERSATION_HISTORY_LIMIT);
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
            if (file.size > this.MAX_IMAGE_SIZE) {
                this.showNotification(`Файл "${file.name}" слишком большой (максимум ${this.MAX_IMAGE_SIZE / 1024 / 1024}MB)`, 'error');
                return;
            }
            
            this.processFile(file);
        });
        
        event.target.value = '';
    }

    async processFile(file) {
        const fileType = this.getFileType(file);
        
        if (fileType === 'image') {
            await this.processImageFile(file);
        } else if (fileType === 'text' || fileType === 'code') {
            await this.processTextFile(file);
        } else {
            this.showNotification(`Неподдерживаемый формат файла: ${file.name}`, 'error');
            return;
        }
        
        this.renderAttachedFiles();
        this.handleInputChange();
    }

    getFileType(file) {
        const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        const textTypes = ['text/plain', 'application/json', 'text/markdown'];
        
        if (imageTypes.includes(file.type)) {
            return 'image';
        }
        
        if (textTypes.includes(file.type) || this.isCodeFile(file.name)) {
            return 'code';
        }
        
        return 'unknown';
    }

    isCodeFile(filename) {
        const extension = filename.toLowerCase().split('.').pop();
        return this.supportedCodeExtensions.includes('.' + extension);
    }

    async processImageFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                this.attachedImages.push({
                    name: file.name,
                    data: e.target.result,
                    size: file.size,
                    fileType: 'image'
                });
                resolve();
            };
            
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async processTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                this.attachedImages.push({
                    name: file.name,
                    data: e.target.result,
                    size: file.size,
                    fileType: this.isCodeFile(file.name) ? 'code' : 'text'
                });
                resolve();
            };
            
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    renderAttachedFiles() {
        if (!this.attachedFiles) return;
        
        this.attachedFiles.innerHTML = '';
        
        this.attachedImages.forEach((file, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file-item';
            
            let icon = 'ti-file';
            if (file.fileType === 'image') icon = 'ti-photo';
            else if (file.fileType === 'code') icon = 'ti-code';
            
            fileElement.innerHTML = `
                <i class="ti ${icon}"></i>
                <span class="file-name">${this.escapeHtml(file.name)}</span>
                <span class="file-size">(${this.formatFileSize(file.size)})</span>
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
        
        this.attachFileRemoveHandlers();
    }

    attachFileRemoveHandlers() {
        const removeButtons = this.attachedFiles.querySelectorAll('.remove-file-btn');
        removeButtons.forEach(btn => {
            btn.onclick = (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                this.removeFile(index);
            };
        });
    }

    removeFile(index) {
        this.attachedImages.splice(index, 1);
        this.renderAttachedFiles();
        this.handleInputChange();
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
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
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        transcript += event.results[i][0].transcript;
                    }
                }
                
                if (transcript) {
                    this.userInput.value += transcript + ' ';
                    this.handleInputChange();
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showNotification('Ошибка голосового ввода: ' + event.error, 'error');
                this.isListening = false;
                this.updateVoiceInputButton();
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                this.updateVoiceInputButton();
            };
        } else {
            this.voiceInputBtn.style.display = 'none';
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
            this.recognition.start();
        }
    }

    updateVoiceInputButton() {
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
            this.addMessage('user', `[Генерация изображения] ${prompt}`);
            
            if (typeof puter?.ai?.txt2img !== 'function') {
                throw new Error('Функция генерации изображений недоступна');
            }
            
            const result = await puter.ai.txt2img(prompt);
            
            if (result && result.url) {
                this.addMessage('assistant', '', [{
                    name: 'generated-image.png',
                    data: result.url,
                    size: 0,
                    fileType: 'image'
                }]);
            } else {
                throw new Error('Не удалось сгенерировать изображение');
            }
            
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
            
            const result = await puter.ai.txt2speech(text);
            
            if (result && result.url) {
                this.playGeneratedVoice(result.url);
                this.addMessage('assistant', `[Аудио сообщение] ${text}`, [{
                    name: 'generated-voice.mp3',
                    data: result.url,
                    size: 0,
                    fileType: 'audio'
                }]);
            } else {
                throw new Error('Не удалось сгенерировать аудио');
            }
            
        } catch (error) {
            console.error('Error generating voice:', error);
            this.handleError('Ошибка при генерации голоса', error);
        }
    }

    playGeneratedVoice(audioUrl) {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        
        this.currentAudio = new Audio(audioUrl);
        this.currentAudio.play().catch(error => {
            console.error('Error playing audio:', error);
            this.showNotification('Ошибка воспроизведения аудио', 'error');
        });
        
        this.currentAudio.onended = () => {
            this.isSpeaking = false;
            this.currentAudio = null;
        };
        
        this.isSpeaking = true;
    }

    // Chat Management
    createNewChat() {
        const newChatId = 'chat-' + Date.now();
        const defaultName = 'Новый чат';
        
        this.chatSessions.set(newChatId, {
            id: newChatId,
            name: defaultName,
            messages: [],
            createdAt: Date.now()
        });
        
        this.currentChatId = newChatId;
        this.conversationHistory = [];
        this.messagesContainer.innerHTML = '';
        
        this.saveChatSessions();
        this.setupChatSelector();
        this.updateDocumentTitle();
        this.updateCurrentChatName();
        this.closeSidebar();
        
        this.showNotification('Новый чат создан', 'success');
    }

    deleteAllChats() {
        if (this.chatSessions.size === 0) {
            this.showNotification('Нет чатов для удаления', 'info');
            return;
        }
        
        if (confirm('Вы уверены, что хотите удалить все чаты? Это действие нельзя отменить.')) {
            this.chatSessions.clear();
            this.createNewChat();
            this.saveChatSessions();
            this.setupChatSelector();
            this.showNotification('Все чаты удалены', 'success');
        }
    }

    setupChatSelector() {
        if (!this.chatList) return;
        
        this.chatList.innerHTML = '';
        
        const sortedChats = Array.from(this.chatSessions.values())
            .sort((a, b) => b.createdAt - a.createdAt);
        
        sortedChats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chat.id === this.currentChatId ? 'active' : ''}`;
            chatItem.dataset.chatId = chat.id;
            
            const displayName = chat.name.length > this.MAX_CHAT_NAME_LENGTH 
                ? chat.name.substring(0, this.MAX_CHAT_NAME_LENGTH) + '...' 
                : chat.name;
            
            chatItem.innerHTML = `
                <div class="chat-item-content">
                    <i class="ti ti-message-circle"></i>
                    <span class="chat-name">${this.escapeHtml(displayName)}</span>
                </div>
                <div class="chat-item-actions">
                    <button class="chat-action-btn edit-chat-btn" title="Редактировать название">
                        <i class="ti ti-edit"></i>
                    </button>
                    <button class="chat-action-btn delete-chat-btn" title="Удалить чат">
                        <i class="ti ti-trash"></i>
                    </button>
                </div>
            `;
            
            this.chatList.appendChild(chatItem);
            
            this.addEventListener(chatItem, 'click', (e) => {
                if (!e.target.closest('.chat-action-btn')) {
                    this.switchToChat(chat.id);
                }
            });
            
            const editBtn = chatItem.querySelector('.edit-chat-btn');
            const deleteBtn = chatItem.querySelector('.delete-chat-btn');
            
            this.addEventListener(editBtn, 'click', (e) => {
                e.stopPropagation();
                this.openEditChatModal(chat.id);
            });
            
            this.addEventListener(deleteBtn, 'click', (e) => {
                e.stopPropagation();
                this.deleteChat(chat.id);
            });
        });
    }

    switchToChat(chatId) {
        if (this.chatSessions.has(chatId)) {
            this.currentChatId = chatId;
            this.loadCurrentSession();
            this.setupChatSelector();
            this.updateDocumentTitle();
            this.updateCurrentChatName();
            this.closeSidebar();
            this.showNotification('Переключено на выбранный чат', 'success');
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
            this.setupChatSelector();
            this.showNotification('Чат удален', 'success');
        }
    }

    openEditChatModal(chatId) {
        const chat = this.chatSessions.get(chatId);
        if (!chat) return;
        
        this.editChatModal.dataset.chatId = chatId;
        this.editChatNameInput.value = chat.name;
        this.editChatModal.classList.add('active');
        
        if (this.modalClearInput) {
            this.modalClearInput.style.display = chat.name ? 'flex' : 'none';
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
        
        const chat = this.chatSessions.get(chatId);
        if (chat) {
            chat.name = newName;
            this.saveChatSessions();
            this.setupChatSelector();
            this.updateDocumentTitle();
            this.updateCurrentChatName();
            this.closeEditChatModal();
            this.showNotification('Название чата обновлено', 'success');
        }
    }

    updateCurrentChatName() {
        const chat = this.chatSessions.get(this.currentChatId);
        if (chat && this.currentChatName) {
            const displayName = chat.name.length > this.MAX_CHAT_NAME_LENGTH 
                ? chat.name.substring(0, this.MAX_CHAT_NAME_LENGTH) + '...' 
                : chat.name;
            this.currentChatName.textContent = displayName;
        }
    }

    // Search and Navigation
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
        
        const messages = this.messagesContainer.querySelectorAll('.message-text');
        const regex = new RegExp(this.escapeRegExp(searchTerm), 'gi');
        
        messages.forEach(message => {
            const originalText = message.textContent || message.innerText;
            const highlightedText = originalText.replace(regex, match => 
                `<mark class="search-highlight">${match}</mark>`
            );
            
            if (highlightedText !== originalText) {
                message.innerHTML = highlightedText;
            }
        });
    }

    clearSearchHighlights() {
        const highlights = this.messagesContainer.querySelectorAll('.search-highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            if (parent) {
                parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
                parent.normalize();
            }
        });
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
            const modelItem = document.createElement('div');
            modelItem.className = `model-item ${modelId === this.currentModel ? 'selected' : ''} ${!config.available ? 'disabled' : ''}`;
            modelItem.dataset.modelId = modelId;
            
            modelItem.innerHTML = `
                <div class="model-info">
                    <div class="model-name">${config.name}</div>
                    <div class="model-description">${config.description}</div>
                    <div class="model-context">Контекст: ${this.formatContextSize(config.context)}</div>
                </div>
                <div class="model-status">
                    ${modelId === this.currentModel ? '<i class="ti ti-check"></i>' : ''}
                    ${!config.available ? '<div class="model-badge">Скоро</div>' : ''}
                </div>
            `;
            
            if (config.available) {
                this.addEventListener(modelItem, 'click', () => {
                    this.selectModel(modelId);
                });
            }
            
            this.modelList.appendChild(modelItem);
        });
    }

    selectModel(modelId) {
        if (!this.modelConfig[modelId].available) {
            this.showNotification('Эта модель скоро будет доступна', 'info');
            return;
        }
        
        const modelItems = this.modelList.querySelectorAll('.model-item');
        modelItems.forEach(item => item.classList.remove('selected'));
        
        const selectedItem = this.modelList.querySelector(`[data-model-id="${modelId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
    }

    confirmModelSelection() {
        const selectedItem = this.modelList.querySelector('.model-item.selected');
        if (!selectedItem) return;
        
        const modelId = selectedItem.dataset.modelId;
        
        if (modelId === this.currentModel) {
            this.closeModelModal();
            return;
        }
        
        this.currentModel = modelId;
        this.updateModelInfo();
        this.closeModelModal();
        this.showNotification(`Модель изменена на ${this.getModelDisplayName(modelId)}`, 'success');
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

    formatContextSize(tokens) {
        if (tokens >= 1000000) {
            return (tokens / 1000000).toFixed(1) + 'M';
        } else if (tokens >= 1000) {
            return (tokens / 1000).toFixed(0) + 'K';
        }
        return tokens.toString();
    }

    // Scroll Management
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
        
        this.isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
        this.isAtTop = scrollTop < 50;
        
        this.updateScrollButtons();
        this.updateMinimap();
    }

    updateScrollButtons() {
        if (this.scrollToBottomBtn) {
            this.scrollToBottomBtn.style.display = this.isAtBottom ? 'none' : 'flex';
        }
        
        if (this.scrollToLastAI) {
            this.scrollToLastAI.style.display = this.isAtTop ? 'none' : 'flex';
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
        
        this.addEventListener(this.minimapViewport, 'mousedown', (e) => {
            this.startMinimapDrag(e);
        });
        
        this.addEventListener(this.minimapContent, 'click', (e) => {
            this.handleMinimapClick(e);
        });
    }

    updateMinimap() {
        if (!this.chatMinimap || !this.minimapContent) return;
        
        const messages = this.messagesContainer.querySelectorAll('.message');
        const containerHeight = this.messagesContainer.scrollHeight;
        const visibleHeight = this.messagesContainer.clientHeight;
        
        if (containerHeight <= visibleHeight) {
            this.chatMinimap.style.display = 'none';
            return;
        }
        
        this.chatMinimap.style.display = 'flex';
        this.minimapContent.innerHTML = '';
        
        messages.forEach((message, index) => {
            const messageType = message.classList.contains('message-user') ? 'user' : 'ai';
            const messageElement = document.createElement('div');
            messageElement.className = `minimap-message minimap-${messageType}`;
            messageElement.dataset.index = index;
            this.minimapContent.appendChild(messageElement);
        });
        
        this.updateMinimapViewport();
    }

    updateMinimapViewport() {
        const container = this.messagesContainer;
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const visibleHeight = container.clientHeight;
        
        const minimapHeight = this.minimapContent.offsetHeight;
        const viewportTop = (scrollTop / scrollHeight) * minimapHeight;
        const viewportHeight = (visibleHeight / scrollHeight) * minimapHeight;
        
        this.minimapViewport.style.top = viewportTop + 'px';
        this.minimapViewport.style.height = viewportHeight + 'px';
    }

    startMinimapDrag(e) {
        e.preventDefault();
        
        const minimap = this.minimapContent;
        const container = this.messagesContainer;
        const startY = e.clientY;
        const startScrollTop = container.scrollTop;
        const minimapRect = minimap.getBoundingClientRect();
        const minimapHeight = minimap.offsetHeight;
        
        const onMouseMove = (moveEvent) => {
            const deltaY = moveEvent.clientY - startY;
            const scrollRatio = container.scrollHeight / minimapHeight;
            const newScrollTop = startScrollTop + deltaY * scrollRatio;
            
            container.scrollTop = Math.max(0, Math.min(newScrollTop, container.scrollHeight - container.clientHeight));
        };
        
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    handleMinimapClick(e) {
        const minimap = this.minimapContent;
        const container = this.messagesContainer;
        const minimapRect = minimap.getBoundingClientRect();
        const clickY = e.clientY - minimapRect.top;
        const clickRatio = clickY / minimap.offsetHeight;
        
        container.scrollTop = clickRatio * container.scrollHeight;
    }

    // Sidebar
    toggleSidebar() {
        this.sidebarMenu.classList.toggle('active');
        this.sidebarOverlay.classList.toggle('active');
        document.body.style.overflow = this.sidebarMenu.classList.contains('active') ? 'hidden' : '';
    }

    closeSidebar() {
        this.sidebarMenu.classList.remove('active');
        this.sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Import/Export Chat
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
                    console.error('Error parsing imported chat:', error);
                    this.showNotification('Ошибка при импорте чата: неверный формат файла', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    processImportedChat(importedData) {
        if (!importedData || !importedData.messages || !Array.isArray(importedData.messages)) {
            this.showNotification('Неверный формат файла чата', 'error');
            return;
        }
        
        const newChatId = 'imported-' + Date.now();
        const chatName = importedData.name || 'Импортированный чат';
        
        this.chatSessions.set(newChatId, {
            id: newChatId,
            name: chatName,
            messages: importedData.messages,
            createdAt: Date.now()
        });
        
        this.currentChatId = newChatId;
        this.conversationHistory = importedData.messages;
        
        this.saveChatSessions();
        this.setupChatSelector();
        this.loadCurrentSession();
        this.updateDocumentTitle();
        this.updateCurrentChatName();
        this.closeSidebar();
        
        this.showNotification('Чат успешно импортирован', 'success');
    }

    downloadCurrentChat() {
        const chat = this.chatSessions.get(this.currentChatId);
        if (!chat || chat.messages.length === 0) {
            this.showNotification('Нет сообщений для экспорта', 'info');
            return;
        }
        
        const exportData = {
            name: chat.name,
            messages: chat.messages,
            exportedAt: new Date().toISOString(),
            model: this.currentModel,
            version: 'KHAI Assistant v2.1.0'
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khai-chat-${chat.name}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Чат успешно экспортирован', 'success');
    }

    // PWA Installation
    checkPWAInstallation() {
        // Убираем кнопку установки PWA если приложение уже установлено
        const installButton = document.getElementById('installPWA');
        if (!installButton) return;

        // Проверяем, установлено ли приложение
        if (window.matchMedia('(display-mode: standalone)').matches || 
            window.navigator.standalone === true) {
            installButton.style.display = 'none';
        } else {
            // Показываем кнопку только если PWA не установлено
            installButton.style.display = 'flex';
            
            let deferredPrompt;
            
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                
                installButton.style.display = 'flex';
                
                this.addEventListener(installButton, 'click', async () => {
                    if (!deferredPrompt) return;
                    
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    
                    if (outcome === 'accepted') {
                        installButton.style.display = 'none';
                        this.showNotification('Приложение успешно установлено!', 'success');
                    }
                    
                    deferredPrompt = null;
                });
            });
            
            window.addEventListener('appinstalled', () => {
                installButton.style.display = 'none';
                deferredPrompt = null;
            });
        }
    }

    // Session Management
    saveChatSessions() {
        try {
            const sessionsData = Array.from(this.chatSessions.entries()).map(([id, session]) => ({
                ...session,
                messages: session.messages || []
            }));
            
            localStorage.setItem('khai-assistant-sessions', JSON.stringify(sessionsData));
            localStorage.setItem('khai-assistant-current-chat', this.currentChatId);
        } catch (error) {
            console.error('Error saving chat sessions:', error);
        }
    }

    loadChatSessions() {
        try {
            const sessionsData = localStorage.getItem('khai-assistant-sessions');
            const currentChatId = localStorage.getItem('khai-assistant-current-chat');
            
            if (sessionsData) {
                const sessions = JSON.parse(sessionsData);
                sessions.forEach(session => {
                    this.chatSessions.set(session.id, {
                        ...session,
                        messages: session.messages || []
                    });
                });
            }
            
            if (currentChatId && this.chatSessions.has(currentChatId)) {
                this.currentChatId = currentChatId;
            } else if (this.chatSessions.size === 0) {
                this.createDefaultChat();
            }
        } catch (error) {
            console.error('Error loading chat sessions:', error);
            this.createDefaultChat();
        }
    }

    createDefaultChat() {
        const defaultChatId = 'default';
        this.chatSessions.set(defaultChatId, {
            id: defaultChatId,
            name: 'Основной чат',
            messages: [],
            createdAt: Date.now()
        });
        this.currentChatId = defaultChatId;
    }

    saveCurrentSession() {
        const chat = this.chatSessions.get(this.currentChatId);
        if (chat) {
            chat.messages = [...this.conversationHistory];
            this.saveChatSessions();
        }
    }

    loadCurrentSession() {
        const chat = this.chatSessions.get(this.currentChatId);
        if (chat) {
            this.conversationHistory = chat.messages || [];
            this.renderMessages();
        } else {
            this.conversationHistory = [];
            this.messagesContainer.innerHTML = '';
        }
        
        this.updateMinimap();
        this.scrollToBottom();
    }

    renderMessages() {
        this.messagesContainer.innerHTML = '';
        
        this.conversationHistory.forEach(message => {
            this.addMessage(message.role, message.content, message.files || []);
        });
    }

    // UI Utilities
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
        
        this.addEventListener(notification.querySelector('.notification-close'), 'click', () => {
            notification.remove();
        });
        
        this.setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('fade-out');
                this.setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'circle-check',
            error: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    updateDocumentTitle() {
        const chat = this.chatSessions.get(this.currentChatId);
        const chatName = chat ? chat.name : 'KHAI Assistant';
        document.title = `${chatName} - KHAI Assistant`;
    }

    updateConnectionStatus() {
        if (this.connectionStatus && this.connectionStatusText) {
            const isOnline = navigator.onLine;
            this.connectionStatus.className = `connection-status ${isOnline ? 'online' : 'offline'}`;
            this.connectionStatusText.textContent = isOnline ? 'Онлайн' : 'Офлайн';
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

    // Global Event Handlers
    handleGlobalKeydown(e) {
        if (e.key === 'Escape') {
            if (this.sidebarMenu.classList.contains('active')) {
                this.closeSidebar();
            }
            if (this.editChatModal.classList.contains('active')) {
                this.closeEditChatModal();
            }
            if (this.modelModalOverlay.classList.contains('active')) {
                this.closeModelModal();
            }
        }
        
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            this.userInput.focus();
        }
        
        if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
            e.preventDefault();
            this.createNewChat();
        }
    }

    handleResize() {
        this.updateMinimap();
        this.handleScroll();
    }

    // Utility Methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    debug(...args) {
        if (this.DEBUG) {
            console.log('[KHAI Assistant]', ...args);
        }
    }

    handleError(message, error) {
        console.error(message, error);
        this.showNotification(message, 'error');
        
        if (this.isProcessing) {
            this.isProcessing = false;
            this.isGenerating = false;
            this.updateSendButton(false);
        }
    }

    handleCriticalError(message, error) {
        console.error('CRITICAL ERROR:', message, error);
        
        const errorMessage = `
            <div style="padding: 20px; text-align: center;">
                <h2>Критическая ошибка</h2>
                <p>${message}</p>
                <p><small>${error?.message || 'Неизвестная ошибка'}</small></p>
                <button onclick="location.reload()" style="
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 10px;
                ">Перезагрузить приложение</button>
            </div>
        `;
        
        if (this.messagesContainer) {
            this.messagesContainer.innerHTML = errorMessage;
        } else {
            document.body.innerHTML = errorMessage;
        }
    }

    // Cleanup
    cleanup() {
        this.cleanupCallbacks.forEach(callback => callback());
        this.cleanupCallbacks = [];
        
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
        
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        
        if (this.currentStreamController && this.currentStreamController.abort) {
            this.currentStreamController.abort();
        }
    }

    // Public API
    refreshPage() {
        window.location.reload();
    }

    clearInput() {
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        this.attachedImages = [];
        this.renderAttachedFiles();
        this.handleInputChange();
        this.userInput.focus();
    }

    clearChat() {
        if (this.conversationHistory.length === 0) {
            this.showNotification('Нет сообщений для очистки', 'info');
            return;
        }
        
        if (confirm('Вы уверены, что хотите очистить текущий чат? Это действие нельзя отменить.')) {
            this.conversationHistory = [];
            this.messagesContainer.innerHTML = '';
            this.saveCurrentSession();
            this.updateMinimap();
            this.showNotification('Чат очищен', 'success');
        }
    }

    showHelp() {
        const helpMessage = `
# KHAI Assistant - Справка

## Основные возможности:
- **Общение с ИИ** - задавайте вопросы и получайте развернутые ответы
- **Мультимодальность** - работа с текстом, изображениями и кодом
- **Голосовой ввод** - диктуйте сообщения вместо ввода текста
- **Генерация изображений** - создавайте изображения по описанию
- **Генерация голоса** - преобразуйте текст в речь
- **Анализ файлов** - загружайте изображения и текстовые файлы для анализа

## Управление чатами:
- **Новый чат** - создание новой беседы
- **Импорт/экспорт** - сохранение и загрузка истории чатов
- **Управление историей** - переименование и удаление чатов

## Горячие клавиши:
- **Ctrl/Cmd + K** - фокус на поле ввода
- **Ctrl/Cmd + N** - новый чат
- **Escape** - закрыть меню/модальные окна
- **Enter** - отправить сообщение
- **Shift + Enter** - новая строка

## Поддерживаемые форматы файлов:
- **Изображения**: JPEG, PNG, GIF, WebP, SVG
- **Текстовые файлы**: TXT, MD, JSON
- **Код**: JS, PY, JAVA, CPP, C, HTML, CSS, PHP, RB, GO, RS, TS, XML, SQL

_Версия 2.1.0 | KHAI Assistant_
        `.trim();
        
        this.addMessage('assistant', helpMessage);
        this.showNotification('Справка загружена', 'info');
    }

    setMode(mode) {
        this.isImageMode = false;
        this.isVoiceMode = false;
        
        this.generateImageBtn.classList.remove('active');
        this.generateVoiceBtn.classList.remove('active');
        
        switch (mode) {
            case 'normal':
                this.userInput.placeholder = 'Задайте вопрос или опишите изображение...';
                break;
            default:
                this.userInput.placeholder = 'Задайте вопрос или опишите изображение...';
        }
        
        this.showNotification(`Режим "${mode}" активирован`, 'info');
    }

    buildContextPrompt(userMessage) {
        if (this.conversationHistory.length === 0) {
            return userMessage;
        }
        
        const recentHistory = this.conversationHistory.slice(-10);
        let context = "Контекст предыдущих сообщений:\n";
        
        recentHistory.forEach(msg => {
            const role = msg.role === 'user' ? 'Пользователь' : 'Ассистент';
            context += `${role}: ${msg.content}\n`;
        });
        
        context += `\nТекущее сообщение пользователя: ${userMessage}`;
        context += "\n\nОтветь на текущее сообщение пользователя, учитывая контекст предыдущих сообщений. Будь полезным и внимательным ассистентом.";
        
        return context;
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
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}
