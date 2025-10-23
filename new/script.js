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
            [this.helpBtn, 'click', () => this.showHelpModal()], // Изменено на showHelpModal
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
            [this.importChatBtn, 'click', () => this.importChatHistory()], // Добавлено
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
            
            // Обновлен placeholder в зависимости от режима
            if (this.isVoiceMode) {
                this.userInput.placeholder = 'Введите текст для генерации голоса...';
            } else if (this.isImageMode) {
                this.userInput.placeholder = 'Опишите изображение для генерации...';
            } else {
                this.userInput.placeholder = 'Задайте вопрос или опишите задачу...';
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
            } else if (file.fileType === 'text') {
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
            } else if (file.fileType === 'code') {
                const fileContent = file.data;
                
                if (userMessage.trim()) {
                    return `Пользователь отправил файл с кодом "${file.name}" с сопроводительным сообщением: "${userMessage}"

Содержимое файла:
"""
${fileContent}
"""

Ответь на вопрос/сообщение пользователя "${userMessage}", анализируя предоставленный код. Объясни что делает код, предложи улучшения или найди ошибки. Отвечай на русском языке.`;
                } else {
                    return `Пользователь отправил файл с кодом "${file.name}".

Содержимое файла:
"""
${fileContent}
"""

Проанализируй этот код. Объясни что он делает, как работает, предложи улучшения или оптимизации. Если есть ошибки - укажи на них. Отвечай подробно на русском языке.`;
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
                <span>ИИ думает...</span> <!-- Изменено с "печатает" на "думает" -->
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
        const processedContent = this.processCodeBlocks(fullContent);
        
        messageContent.innerHTML = `
            <div class="message-text">${processedContent}</div>
            <div class="message-actions">
                <button class="action-btn copy-btn" title="Копировать ответ">
                    <i class="ti ti-copy"></i>
                </button>
                <button class="action-btn regenerate-btn" title="Сгенерировать заново">
                    <i class="ti ti-refresh"></i>
                </button>
            </div>
        `;
        
        this.attachMessageActions(messageElement);
        
        const hljsElements = messageElement.querySelectorAll('pre code');
        hljsElements.forEach(block => {
            if (typeof hljs !== 'undefined') {
                hljs.highlightElement(block);
            }
        });
        
        this.updateMinimap();
    }

    processCodeBlocks(content) {
        let processedContent = this.escapeHtml(content);
        
        // Process code blocks
        processedContent = processedContent.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            const language = lang || 'plaintext';
            const escapedCode = this.escapeHtml(code.trim());
            return `<pre><code class="language-${language}">${escapedCode}</code></pre>`;
        });
        
        // Process inline code
        processedContent = processedContent.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
        
        // Process line breaks
        processedContent = processedContent.replace(/\n/g, '<br>');
        
        return processedContent;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    addMessage(role, content, files = []) {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${role}`;
        
        let messageHTML = '';
        
        if (role === 'user') {
            messageHTML = `
                <div class="message-content">
                    <div class="message-text">${this.escapeHtml(content)}</div>
                    ${files.length > 0 ? this.renderFilesPreview(files) : ''}
                    <div class="message-actions">
                        <button class="action-btn copy-btn" title="Копировать сообщение">
                            <i class="ti ti-copy"></i>
                        </button>
                    </div>
                </div>
            `;
        } else {
            messageHTML = `
                <div class="message-content">
                    <div class="message-text">${this.processCodeBlocks(content)}</div>
                    <div class="message-actions">
                        <button class="action-btn copy-btn" title="Копировать ответ">
                            <i class="ti ti-copy"></i>
                        </button>
                        <button class="action-btn regenerate-btn" title="Сгенерировать заново">
                            <i class="ti ti-refresh"></i>
                        </button>
                    </div>
                </div>
            `;
        }
        
        messageElement.innerHTML = messageHTML;
        this.messagesContainer.appendChild(messageElement);
        
        this.attachMessageActions(messageElement);
        
        if (typeof hljs !== 'undefined') {
            const codeBlocks = messageElement.querySelectorAll('pre code');
            codeBlocks.forEach(block => {
                hljs.highlightElement(block);
            });
        }
        
        this.scrollToBottom();
        this.updateMinimap();
    }

    renderFilesPreview(files) {
        return files.map(file => `
            <div class="attached-file-preview">
                ${file.fileType === 'image' ? 
                    `<img src="${file.data}" alt="${file.name}" class="file-preview-image">` :
                    `<div class="file-preview-icon">
                        <i class="ti ti-file-text"></i>
                        <span>${file.name}</span>
                     </div>`
                }
            </div>
        `).join('');
    }

    attachMessageActions(messageElement) {
        const copyBtn = messageElement.querySelector('.copy-btn');
        const regenerateBtn = messageElement.querySelector('.regenerate-btn');
        
        if (copyBtn) {
            this.addEventListener(copyBtn, 'click', () => {
                const messageText = messageElement.querySelector('.message-text');
                const textToCopy = messageText.textContent || messageText.innerText;
                this.copyToClipboard(textToCopy);
                this.showNotification('Сообщение скопировано в буфер обмена', 'success');
            });
        }
        
        if (regenerateBtn) {
            this.addEventListener(regenerateBtn, 'click', () => {
                if (this.lastUserMessage) {
                    this.addMessage('user', this.lastUserMessage.text, this.lastUserMessage.files);
                    this.getAIResponse(this.lastUserMessage.text, this.lastUserMessage.files);
                } else {
                    this.showNotification('Нет предыдущего сообщения для перегенерации', 'warning');
                }
            });
        }
    }

    attachCopyButtons(container) {
        const codeBlocks = container.querySelectorAll('pre');
        codeBlocks.forEach(block => {
            if (!block.querySelector('.copy-code-btn')) {
                const copyBtn = document.createElement('button');
                copyBtn.className = 'copy-code-btn';
                copyBtn.innerHTML = '<i class="ti ti-copy"></i>';
                copyBtn.title = 'Копировать код';
                
                this.addEventListener(copyBtn, 'click', () => {
                    const code = block.querySelector('code');
                    const textToCopy = code.textContent;
                    this.copyToClipboard(textToCopy);
                    this.showNotification('Код скопирован в буфер обмена', 'success');
                });
                
                block.style.position = 'relative';
                block.appendChild(copyBtn);
            }
        });
    }

    copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
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
                <span>ИИ думает...</span> <!-- Изменено с "печатает" на "думает" -->
            </div>
        `;
        
        this.messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
        
        return typingElement.id;
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
        
        if (files.length > this.MAX_FILES) {
            this.showNotification(`Можно прикрепить не более ${this.MAX_FILES} файлов`, 'warning');
            event.target.value = '';
            return;
        }
        
        files.forEach(file => {
            if (this.attachedImages.length >= this.MAX_FILES) {
                this.showNotification(`Достигнут лимит в ${this.MAX_FILES} файлов`, 'warning');
                return;
            }
            
            if (file.size > this.MAX_IMAGE_SIZE) {
                this.showNotification(`Файл "${file.name}" слишком большой (максимум 5MB)`, 'error');
                return;
            }
            
            this.processFile(file);
        });
        
        event.target.value = '';
    }

    async processFile(file) {
        const fileType = this.getFileType(file);
        
        try {
            if (fileType === 'image') {
                await this.processImageFile(file);
            } else {
                await this.processTextFile(file);
            }
        } catch (error) {
            console.error('Error processing file:', error);
            this.showNotification(`Ошибка обработки файла "${file.name}"`, 'error');
        }
    }

    getFileType(file) {
        const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        const textTypes = ['text/plain', 'text/markdown', 'application/json'];
        const codeTypes = [
            'application/javascript', 'text/javascript', 'text/css', 
            'text/html', 'application/xml', 'text/x-python', 
            'application/x-php', 'text/x-java', 'text/x-c', 'text/x-c++'
        ];
        
        if (imageTypes.includes(file.type)) {
            return 'image';
        } else if (codeTypes.includes(file.type) || file.name.match(/\.(js|css|html|py|java|c|cpp|php|xml|json)$/i)) {
            return 'code';
        } else if (textTypes.includes(file.type) || file.name.match(/\.(txt|md|json)$/i)) {
            return 'text';
        } else {
            return 'other';
        }
    }

    async processImageFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                this.attachedImages.push({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: e.target.result,
                    fileType: 'image'
                });
                
                this.renderAttachedFiles();
                this.showNotification(`Изображение "${file.name}" успешно прикреплено`, 'success');
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
                const fileType = this.getFileType(file);
                
                this.attachedImages.push({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: e.target.result,
                    fileType: fileType
                });
                
                this.renderAttachedFiles();
                this.showNotification(`Файл "${file.name}" успешно прикреплен`, 'success');
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
                    <img src="${file.data}" alt="${file.name}" class="file-thumbnail">
                    <div class="file-info">
                        <span class="file-name">${this.escapeHtml(file.name)}</span>
                        <span class="file-size">${this.formatFileSize(file.size)}</span>
                    </div>
                    <button class="remove-file-btn" data-index="${index}">
                        <i class="ti ti-x"></i>
                    </button>
                `;
            } else {
                const fileIcon = file.fileType === 'code' ? 'ti-file-code' : 'ti-file-text';
                fileElement.innerHTML = `
                    <div class="file-icon">
                        <i class="ti ${fileIcon}"></i>
                    </div>
                    <div class="file-info">
                        <span class="file-name">${this.escapeHtml(file.name)}</span>
                        <span class="file-size">${this.formatFileSize(file.size)}</span>
                    </div>
                    <button class="remove-file-btn" data-index="${index}">
                        <i class="ti ti-x"></i>
                    </button>
                `;
            }
            
            this.attachedFiles.appendChild(fileElement);
        });
        
        // Attach remove event listeners
        const removeButtons = this.attachedFiles.querySelectorAll('.remove-file-btn');
        removeButtons.forEach(btn => {
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
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
                this.updateVoiceInputButton();
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
                } else if (interimTranscript) {
                    this.userInput.value = interimTranscript;
                    this.handleInputChange();
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
                this.updateVoiceInputButton();
                
                if (event.error === 'not-allowed') {
                    this.showNotification('Доступ к микрофону запрещен', 'error');
                } else {
                    this.showNotification('Ошибка распознавания речи', 'error');
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
                console.error('Error starting voice recognition:', error);
                this.showNotification('Ошибка запуска голосового ввода', 'error');
            }
        }
    }

    updateVoiceInputButton() {
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
        
        if (this.isImageMode) {
            this.generateImageBtn.classList.add('active');
            this.userInput.placeholder = 'Опишите изображение для генерации...';
            this.showNotification('Режим генерации изображений включен', 'info');
        } else {
            this.generateImageBtn.classList.remove('active');
            this.userInput.placeholder = 'Задайте вопрос или опишите задачу...';
            this.showNotification('Режим генерации изображений выключен', 'info');
        }
    }

    async generateImage(prompt) {
        if (!prompt.trim()) {
            this.showNotification('Введите описание для генерации изображения', 'warning');
            return;
        }
        
        try {
            this.addMessage('user', `Генерация изображения: ${prompt}`);
            
            if (typeof puter?.ai?.txt2img !== 'function') {
                throw new Error('Функция генерации изображений недоступна');
            }
            
            const imageUrl = await puter.ai.txt2img(prompt);
            
            const messageElement = document.createElement('div');
            messageElement.className = 'message message-ai';
            messageElement.innerHTML = `
                <div class="message-content">
                    <div class="message-text">
                        <p>Сгенерированное изображение по запросу: "${this.escapeHtml(prompt)}"</p>
                        <div class="generated-image-container">
                            <img src="${imageUrl}" alt="Generated image" class="generated-image">
                        </div>
                    </div>
                    <div class="message-actions">
                        <button class="action-btn copy-btn" title="Копировать URL изображения">
                            <i class="ti ti-copy"></i>
                        </button>
                        <button class="action-btn download-btn" title="Скачать изображение">
                            <i class="ti ti-download"></i>
                        </button>
                    </div>
                </div>
            `;
            
            this.messagesContainer.appendChild(messageElement);
            
            // Attach actions
            const copyBtn = messageElement.querySelector('.copy-btn');
            const downloadBtn = messageElement.querySelector('.download-btn');
            
            if (copyBtn) {
                this.addEventListener(copyBtn, 'click', () => {
                    this.copyToClipboard(imageUrl);
                    this.showNotification('URL изображения скопирован в буфер обмена', 'success');
                });
            }
            
            if (downloadBtn) {
                this.addEventListener(downloadBtn, 'click', () => {
                    this.downloadImage(imageUrl, `generated-image-${Date.now()}.png`);
                });
            }
            
            this.scrollToBottom();
            this.updateMinimap();
            
        } catch (error) {
            console.error('Error generating image:', error);
            this.handleError('Ошибка при генерации изображения', error);
        }
    }

    downloadImage(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Voice Generation
    toggleVoiceMode() {
        this.isVoiceMode = !this.isVoiceMode;
        
        if (this.isVoiceMode) {
            this.generateVoiceBtn.classList.add('active');
            this.userInput.placeholder = 'Введите текст для генерации голоса...';
            this.showNotification('Режим генерации голоса включен', 'info');
        } else {
            this.generateVoiceBtn.classList.remove('active');
            this.userInput.placeholder = 'Задайте вопрос или опишите задачу...';
            this.showNotification('Режим генерации голоса выключен', 'info');
        }
    }

    async generateVoice(text) {
        if (!text.trim()) {
            this.showNotification('Введите текст для генерации голоса', 'warning');
            return;
        }
        
        try {
            this.addMessage('user', `Генерация голоса: ${text}`);
            
            if (typeof puter?.ai?.txt2speech !== 'function') {
                throw new Error('Функция генерации голоса недоступна');
            }
            
            const audioUrl = await puter.ai.txt2speech(text);
            
            const messageElement = document.createElement('div');
            messageElement.className = 'message message-ai';
            messageElement.innerHTML = `
                <div class="message-content">
                    <div class="message-text">
                        <p>Сгенерированное аудио по тексту: "${this.escapeHtml(text)}"</p>
                        <audio controls class="generated-audio">
                            <source src="${audioUrl}" type="audio/mpeg">
                            Ваш браузер не поддерживает аудио элементы.
                        </audio>
                    </div>
                    <div class="message-actions">
                        <button class="action-btn copy-btn" title="Копировать URL аудио">
                            <i class="ti ti-copy"></i>
                        </button>
                        <button class="action-btn download-btn" title="Скачать аудио">
                            <i class="ti ti-download"></i>
                        </button>
                    </div>
                </div>
            `;
            
            this.messagesContainer.appendChild(messageElement);
            
            // Attach actions
            const copyBtn = messageElement.querySelector('.copy-btn');
            const downloadBtn = messageElement.querySelector('.download-btn');
            
            if (copyBtn) {
                this.addEventListener(copyBtn, 'click', () => {
                    this.copyToClipboard(audioUrl);
                    this.showNotification('URL аудио скопирован в буфер обмена', 'success');
                });
            }
            
            if (downloadBtn) {
                this.addEventListener(downloadBtn, 'click', () => {
                    this.downloadAudio(audioUrl, `generated-audio-${Date.now()}.mp3`);
                });
            }
            
            this.scrollToBottom();
            this.updateMinimap();
            
        } catch (error) {
            console.error('Error generating voice:', error);
            this.handleError('Ошибка при генерации голоса', error);
        }
    }

    downloadAudio(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Chat Management
    createNewChat() {
        const newChatId = 'chat-' + Date.now();
        const newChatName = 'Новый чат';
        
        this.chatSessions.set(newChatId, {
            id: newChatId,
            name: newChatName,
            messages: [],
            createdAt: new Date().toISOString()
        });
        
        this.currentChatId = newChatId;
        this.clearChatUI();
        this.saveChatSessions();
        this.setupChatSelector();
        this.updateDocumentTitle();
        
        this.showNotification('Новый чат создан', 'success');
        this.closeSidebar();
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
                    this.handleImportedChat(importedData);
                } catch (error) {
                    console.error('Error importing chat:', error);
                    this.showNotification('Ошибка импорта чата: неверный формат файла', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    handleImportedChat(importedData) {
        if (!importedData.id || !importedData.name || !Array.isArray(importedData.messages)) {
            this.showNotification('Неверный формат файла чата', 'error');
            return;
        }
        
        const newChatId = 'imported-' + Date.now();
        
        this.chatSessions.set(newChatId, {
            ...importedData,
            id: newChatId,
            createdAt: importedData.createdAt || new Date().toISOString()
        });
        
        this.currentChatId = newChatId;
        this.loadCurrentSession();
        this.saveChatSessions();
        this.setupChatSelector();
        this.updateDocumentTitle();
        
        this.showNotification('Чат успешно импортирован', 'success');
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
            const defaultChatId = 'default';
            this.chatSessions.set(defaultChatId, {
                id: defaultChatId,
                name: 'Основной чат',
                messages: [],
                createdAt: new Date().toISOString()
            });
            
            this.currentChatId = defaultChatId;
            this.loadCurrentSession();
            this.saveChatSessions();
            this.setupChatSelector();
            this.updateDocumentTitle();
            
            this.showNotification('Все чаты удалены', 'success');
            this.closeSidebar();
        }
    }

    setupChatSelector() {
        if (!this.chatList) return;
        
        this.chatList.innerHTML = '';
        
        const chats = Array.from(this.chatSessions.values())
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chat.id === this.currentChatId ? 'active' : ''}`;
            chatItem.dataset.chatId = chat.id;
            
            const displayName = chat.name.length > this.MAX_CHAT_NAME_LENGTH ? 
                chat.name.substring(0, this.MAX_CHAT_NAME_LENGTH) + '...' : chat.name;
            
            chatItem.innerHTML = `
                <div class="chat-item-content">
                    <i class="ti ti-messages"></i>
                    <span class="chat-name">${this.escapeHtml(displayName)}</span>
                </div>
                <div class="chat-item-actions">
                    <button class="chat-action-btn edit-chat-btn" title="Редактировать название">
                        <i class="ti ti-edit"></i>
                    </button>
                </div>
            `;
            
            this.chatList.appendChild(chatItem);
            
            // Add event listeners
            this.addEventListener(chatItem, 'click', (e) => {
                if (!e.target.closest('.chat-action-btn')) {
                    this.switchToChat(chat.id);
                }
            });
            
            const editBtn = chatItem.querySelector('.edit-chat-btn');
            if (editBtn) {
                this.addEventListener(editBtn, 'click', (e) => {
                    e.stopPropagation();
                    this.openEditChatModal(chat.id, chat.name);
                });
            }
        });
        
        this.updateCurrentChatName();
    }

    switchToChat(chatId) {
        if (this.chatSessions.has(chatId)) {
            this.currentChatId = chatId;
            this.loadCurrentSession();
            this.setupChatSelector();
            this.updateDocumentTitle();
            this.closeSidebar();
            this.showNotification('Переключено на выбранный чат', 'info');
        }
    }

    openEditChatModal(chatId, currentName) {
        this.editingChatId = chatId;
        this.editChatNameInput.value = currentName;
        this.editChatModal.style.display = 'flex';
        
        this.handleModalInputChange();
        this.editChatNameInput.focus();
        this.editChatNameInput.select();
    }

    closeEditChatModal() {
        this.editChatModal.style.display = 'none';
        this.editingChatId = null;
        this.editChatNameInput.value = '';
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
        this.editChatNameInput.focus();
    }

    saveChatName() {
        const newName = this.editChatNameInput.value.trim();
        
        if (!newName) {
            this.showNotification('Название чата не может быть пустым', 'error');
            return;
        }
        
        if (newName.length > this.MAX_CHAT_NAME_LENGTH) {
            this.showNotification(`Название чата не может превышать ${this.MAX_CHAT_NAME_LENGTH} символов`, 'error');
            return;
        }
        
        if (this.editingChatId && this.chatSessions.has(this.editingChatId)) {
            const chat = this.chatSessions.get(this.editingChatId);
            chat.name = newName;
            this.saveChatSessions();
            this.setupChatSelector();
            this.updateCurrentChatName();
            this.closeEditChatModal();
            this.showNotification('Название чата обновлено', 'success');
        }
    }

    updateCurrentChatName() {
        const currentChat = this.chatSessions.get(this.currentChatId);
        if (currentChat && this.currentChatName) {
            const displayName = currentChat.name.length > this.MAX_CHAT_NAME_LENGTH ? 
                currentChat.name.substring(0, this.MAX_CHAT_NAME_LENGTH) + '...' : currentChat.name;
            this.currentChatName.textContent = displayName;
        }
    }

    filterChatHistory() {
        const searchTerm = this.sidebarSearch ? this.sidebarSearch.value.trim().toLowerCase() : '';
        const chatItems = this.chatList ? this.chatList.querySelectorAll('.chat-item') : [];
        
        chatItems.forEach(item => {
            const chatName = item.querySelector('.chat-name').textContent.toLowerCase();
            if (chatName.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Session Management
    loadChatSessions() {
        try {
            const saved = localStorage.getItem('khai-assistant-chats');
            if (saved) {
                const sessions = JSON.parse(saved);
                this.chatSessions = new Map(sessions);
            } else {
                // Create default session
                this.chatSessions.set('default', {
                    id: 'default',
                    name: 'Основной чат',
                    messages: [],
                    createdAt: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error loading chat sessions:', error);
            // Create default session on error
            this.chatSessions.set('default', {
                id: 'default',
                name: 'Основной чат',
                messages: [],
                createdAt: new Date().toISOString()
            });
        }
    }

    saveChatSessions() {
        try {
            const sessions = Array.from(this.chatSessions.entries());
            localStorage.setItem('khai-assistant-chats', JSON.stringify(sessions));
        } catch (error) {
            console.error('Error saving chat sessions:', error);
        }
    }

    loadCurrentSession() {
        const session = this.chatSessions.get(this.currentChatId);
        if (session) {
            this.conversationHistory = session.messages || [];
            this.renderConversationHistory();
            this.updateMinimap();
            this.updateCurrentChatName();
        }
    }

    saveCurrentSession() {
        const session = this.chatSessions.get(this.currentChatId);
        if (session) {
            session.messages = this.conversationHistory.slice(-this.CONVERSATION_HISTORY_LIMIT);
            this.saveChatSessions();
        }
    }

    renderConversationHistory() {
        this.clearChatUI();
        
        this.conversationHistory.forEach(message => {
            this.addMessage(message.role, message.content, message.files || []);
        });
        
        this.scrollToBottom();
    }

    clearChatUI() {
        if (this.messagesContainer) {
            this.messagesContainer.innerHTML = '';
        }
        this.removeTypingIndicator();
    }

    clearChat() {
        if (this.conversationHistory.length === 0) {
            this.showNotification('Чат уже пуст', 'info');
            return;
        }
        
        if (confirm('Вы уверены, что хотите очистить историю текущего чата?')) {
            this.conversationHistory = [];
            this.clearChatUI();
            this.saveCurrentSession();
            this.showNotification('История чата очищена', 'success');
        }
    }

    addToConversationHistory(role, content, files = []) {
        this.conversationHistory.push({
            role,
            content,
            files: files.map(file => ({
                name: file.name,
                type: file.type,
                fileType: file.fileType
            })),
            timestamp: new Date().toISOString()
        });
        
        // Keep only last N messages
        if (this.conversationHistory.length > this.CONVERSATION_HISTORY_LIMIT) {
            this.conversationHistory = this.conversationHistory.slice(-this.CONVERSATION_HISTORY_LIMIT);
        }
    }

    // Model Management
    openModelModal() {
        this.modelModalOverlay.style.display = 'flex';
        this.updateModelList();
    }

    closeModelModal() {
        this.modelModalOverlay.style.display = 'none';
    }

    updateModelList() {
        if (!this.modelList) return;
        
        this.modelList.innerHTML = '';
        
        Object.entries(this.modelConfig).forEach(([modelId, config]) => {
            const modelItem = document.createElement('div');
            modelItem.className = `model-item ${modelId === this.currentModel ? 'selected' : ''} ${!config.available ? 'unavailable' : ''}`;
            modelItem.dataset.modelId = modelId;
            
            modelItem.innerHTML = `
                <div class="model-info">
                    <div class="model-name">${config.name}</div>
                    <div class="model-description">${config.description}</div>
                    <div class="model-context">Контекст: ${config.context.toLocaleString()} токенов</div>
                </div>
                <div class="model-status">
                    ${modelId === this.currentModel ? '<i class="ti ti-check"></i>' : ''}
                    ${!config.available ? '<div class="unavailable-badge">Скоро</div>' : ''}
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
        const modelConfig = this.modelConfig[modelId];
        if (!modelConfig || !modelConfig.available) return;
        
        // Remove selection from all items
        const modelItems = this.modelList.querySelectorAll('.model-item');
        modelItems.forEach(item => item.classList.remove('selected'));
        
        // Add selection to clicked item
        const selectedItem = this.modelList.querySelector(`[data-model-id="${modelId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
    }

    confirmModelSelection() {
        const selectedItem = this.modelList.querySelector('.model-item.selected');
        if (!selectedItem) return;
        
        const modelId = selectedItem.dataset.modelId;
        const modelConfig = this.modelConfig[modelId];
        
        if (!modelConfig || !modelConfig.available) {
            this.showNotification('Выбранная модель недоступна', 'error');
            return;
        }
        
        if (modelId === this.currentModel) {
            this.showNotification('Эта модель уже выбрана', 'info');
            this.closeModelModal();
            return;
        }
        
        this.currentModel = modelId;
        this.updateModelInfo();
        this.closeModelModal();
        this.showNotification(`Модель изменена на: ${modelConfig.name}`, 'success');
    }

    updateModelInfo() {
        const modelConfig = this.modelConfig[this.currentModel];
        if (modelConfig && this.currentModelInfo) {
            this.currentModelInfo.textContent = modelConfig.name;
        }
    }

    // Navigation & UI
    toggleSidebar() {
        this.sidebarMenu.classList.add('active');
        this.sidebarOverlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    closeSidebar() {
        this.sidebarMenu.classList.remove('active');
        this.sidebarOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    handleResize() {
        this.updateMinimap();
        
        if (window.innerWidth >= 768) {
            this.closeSidebar();
        }
    }

    setupScrollTracking() {
        if (!this.messagesContainer) return;
        
        this.addEventListener(this.messagesContainer, 'scroll', () => {
            this.handleScroll();
        });
    }

    handleScroll() {
        if (!this.messagesContainer) return;
        
        const { scrollTop, scrollHeight, clientHeight } = this.messagesContainer;
        
        // Check if at bottom
        this.isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
        
        // Check if at top
        this.isAtTop = scrollTop === 0;
        
        // Update scroll buttons visibility
        this.updateScrollButtons();
        
        // Update minimap viewport
        this.updateMinimapViewport();
    }

    updateScrollButtons() {
        const scrollToBottomBtn = this.scrollToBottomBtn;
        const scrollToLastAI = this.scrollToLastAI;
        
        if (scrollToBottomBtn) {
            scrollToBottomBtn.style.display = this.isAtBottom ? 'none' : 'flex';
        }
        
        if (scrollToLastAI) {
            // Show if not at bottom and there are AI messages
            const hasAIMessages = this.conversationHistory.some(msg => msg.role === 'assistant');
            scrollToLastAI.style.display = (!this.isAtBottom && hasAIMessages) ? 'flex' : 'none';
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
        if (!this.messagesContainer) return;
        
        const aiMessages = Array.from(this.messagesContainer.querySelectorAll('.message-ai'));
        if (aiMessages.length > 0) {
            const lastAIMessage = aiMessages[aiMessages.length - 1];
            lastAIMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Minimap functionality
    setupResponsiveMinimap() {
        if (window.innerWidth < 1200) {
            this.hideMinimap();
        } else {
            this.showMinimap();
        }
    }

    showMinimap() {
        if (this.chatMinimap) {
            this.chatMinimap.style.display = 'block';
            this.updateMinimap();
        }
    }

    hideMinimap() {
        if (this.chatMinimap) {
            this.chatMinimap.style.display = 'none';
        }
    }

    updateMinimap() {
        if (!this.minimapContent || !this.messagesContainer) return;
        
        const messages = Array.from(this.messagesContainer.querySelectorAll('.message'));
        if (messages.length === 0) return;
        
        const containerHeight = this.messagesContainer.scrollHeight;
        const visibleHeight = this.messagesContainer.clientHeight;
        
        this.minimapContent.innerHTML = '';
        
        messages.forEach((message, index) => {
            const indicator = document.createElement('div');
            indicator.className = `minimap-indicator ${message.classList.contains('message-user') ? 'user' : 'ai'}`;
            
            const position = (message.offsetTop / containerHeight) * 100;
            const height = (message.offsetHeight / containerHeight) * 100;
            
            indicator.style.top = `${position}%`;
            indicator.style.height = `${Math.max(height, 2)}%`;
            
            this.minimapContent.appendChild(indicator);
        });
        
        this.updateMinimapViewport();
    }

    updateMinimapViewport() {
        if (!this.minimapViewport || !this.messagesContainer) return;
        
        const containerHeight = this.messagesContainer.scrollHeight;
        const visibleHeight = this.messagesContainer.clientHeight;
        const scrollTop = this.messagesContainer.scrollTop;
        
        const viewportTop = (scrollTop / containerHeight) * 100;
        const viewportHeight = (visibleHeight / containerHeight) * 100;
        
        this.minimapViewport.style.top = `${viewportTop}%`;
        this.minimapViewport.style.height = `${viewportHeight}%`;
    }

    // Search functionality
    handleSearchInput() {
        const searchTerm = this.headerSearch.value.trim();
        if (this.headerSearchClear) {
            this.headerSearchClear.style.display = searchTerm ? 'flex' : 'none';
        }
        
        if (searchTerm) {
            this.highlightSearchTerms(searchTerm);
        } else {
            this.clearHighlights();
        }
    }

    clearSearch() {
        this.headerSearch.value = '';
        if (this.headerSearchClear) {
            this.headerSearchClear.style.display = 'none';
        }
        this.clearHighlights();
    }

    highlightSearchTerms(term) {
        const messages = this.messagesContainer.querySelectorAll('.message-text');
        const searchRegex = new RegExp(this.escapeRegex(term), 'gi');
        
        messages.forEach(messageElement => {
            const originalHTML = messageElement.dataset.originalHTML || messageElement.innerHTML;
            messageElement.dataset.originalHTML = originalHTML;
            
            const highlightedHTML = originalHTML.replace(searchRegex, match => 
                `<mark class="search-highlight">${match}</mark>`
            );
            
            messageElement.innerHTML = highlightedHTML;
        });
    }

    clearHighlights() {
        const messages = this.messagesContainer.querySelectorAll('.message-text');
        
        messages.forEach(messageElement => {
            const originalHTML = messageElement.dataset.originalHTML;
            if (originalHTML) {
                messageElement.innerHTML = originalHTML;
                delete messageElement.dataset.originalHTML;
            }
        });
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Global keyboard shortcuts
    handleGlobalKeydown(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (this.headerSearch) {
                this.headerSearch.focus();
            }
        }
        
        // Ctrl/Cmd + / for help
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            this.showHelpModal();
        }
        
        // Escape to clear search or close modals
        if (e.key === 'Escape') {
            if (this.headerSearch && this.headerSearch.value) {
                this.clearSearch();
            } else {
                this.closeModelModal();
                this.closeEditChatModal();
                this.closeSidebar();
            }
        }
    }

    // Help modal
    showHelpModal() {
        // Создаем модальное окно помощи
        const helpModal = document.createElement('div');
        helpModal.className = 'modal-overlay';
        helpModal.style.display = 'flex';
        helpModal.style.zIndex = '10000';
        
        helpModal.innerHTML = `
            <div class="modal-content help-modal">
                <div class="modal-header">
                    <h2>Помощь по KHAI Assistant</h2>
                    <button class="modal-close-btn">
                        <i class="ti ti-x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="help-section">
                        <h3>Основные возможности</h3>
                        <ul>
                            <li><strong>Текстовый чат:</strong> Общайтесь с ИИ в режиме реального времени</li>
                            <li><strong>Генерация изображений:</strong> Создавайте изображения по текстовому описанию</li>
                            <li><strong>Генерация голоса:</strong> Преобразуйте текст в речь</li>
                            <li><strong>Анализ файлов:</strong> Загружайте изображения и текстовые файлы для анализа</li>
                            <li><strong>Голосовой ввод:</strong> Диктуйте сообщения с помощью микрофона</li>
                        </ul>
                    </div>
                    
                    <div class="help-section">
                        <h3>Горячие клавиши</h3>
                        <ul>
                            <li><kbd>Ctrl/Cmd + K</kbd> - Поиск по чату</li>
                            <li><kbd>Ctrl/Cmd + /</kbd> - Открыть справку</li>
                            <li><kbd>Escape</kbd> - Очистить поиск/закрыть модальные окна</li>
                            <li><kbd>Enter</kbd> - Отправить сообщение</li>
                            <li><kbd>Shift + Enter</kbd> - Новая строка в поле ввода</li>
                        </ul>
                    </div>
                    
                    <div class="help-section">
                        <h3>Управление чатами</h3>
                        <ul>
                            <li><strong>Новый чат:</strong> Создайте новый сеанс общения</li>
                            <li><strong>Импорт чата:</strong> Загрузите ранее сохраненный чат</li>
                            <li><strong>Удаление всех чатов:</strong> Очистите всю историю</li>
                            <li><strong>Переименование:</strong> Измените название чата для удобства</li>
                        </ul>
                    </div>
                    
                    <div class="help-section">
                        <h3>Поддерживаемые форматы файлов</h3>
                        <ul>
                            <li><strong>Изображения:</strong> JPEG, PNG, GIF, WebP, SVG</li>
                            <li><strong>Текстовые файлы:</strong> TXT, MD, JSON</li>
                            <li><strong>Код:</strong> JS, CSS, HTML, Python, Java, C/C++, PHP, XML</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" id="closeHelpModal">Закрыть</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(helpModal);
        
        // Добавляем обработчики событий
        const closeBtn = helpModal.querySelector('.modal-close-btn');
        const closeHelpBtn = helpModal.querySelector('#closeHelpModal');
        
        const closeHelpModal = () => {
            document.body.removeChild(helpModal);
        };
        
        this.addEventListener(closeBtn, 'click', closeHelpModal);
        this.addEventListener(closeHelpBtn, 'click', closeHelpModal);
        this.addEventListener(helpModal, 'click', (e) => {
            if (e.target === helpModal) {
                closeHelpModal();
            }
        });
        
        this.addEventListener(document, 'keydown', (e) => {
            if (e.key === 'Escape') {
                closeHelpModal();
            }
        });
    }

    // PWA Installation
    checkPWAInstallation() {
        // Проверяем, установлено ли приложение
        if (this.isPWAInstalled()) {
            this.hideInstallButton();
        } else {
            this.showInstallButton();
        }
    }

    isPWAInstalled() {
        // Проверяем различные признаки установки PWA
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone === true ||
               document.referrer.includes('android-app://');
    }

    showInstallButton() {
        // Кнопка установки уже есть в интерфейсе, просто показываем ее
        const installButton = document.getElementById('installPWA');
        if (installButton) {
            installButton.style.display = 'flex';
            
            this.addEventListener(installButton, 'click', () => {
                this.installPWA();
            });
        }
    }

    hideInstallButton() {
        const installButton = document.getElementById('installPWA');
        if (installButton) {
            installButton.style.display = 'none';
        }
    }

    async installPWA() {
        // Проверяем, поддерживает ли браузер установку PWA
        if (!('BeforeInstallPromptEvent' in window)) {
            this.showNotification('Установка приложения не поддерживается в вашем браузере', 'error');
            return;
        }

        try {
            // Запрашиваем установку
            const installPrompt = new Event('installPrompt');
            window.dispatchEvent(installPrompt);
            
            this.showNotification('Приложение доступно для установки', 'info');
        } catch (error) {
            console.error('Error installing PWA:', error);
            this.showNotification('Ошибка при установке приложения', 'error');
        }
    }

    // Utility Methods
    clearInput() {
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        this.handleInputChange();
        this.userInput.focus();
    }

    refreshPage() {
        window.location.reload();
    }

    updateDocumentTitle() {
        const currentChat = this.chatSessions.get(this.currentChatId);
        if (currentChat) {
            document.title = `${currentChat.name} - KHAI Assistant`;
        } else {
            document.title = 'KHAI Assistant';
        }
    }

    updateConnectionStatus() {
        if (!this.connectionStatus || !this.connectionStatusText) return;
        
        if (navigator.onLine) {
            this.connectionStatus.className = 'connection-status online';
            this.connectionStatusText.textContent = 'Онлайн';
        } else {
            this.connectionStatus.className = 'connection-status offline';
            this.connectionStatusText.textContent = 'Офлайн';
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

    downloadCurrentChat() {
        const session = this.chatSessions.get(this.currentChatId);
        if (!session || session.messages.length === 0) {
            this.showNotification('Нет данных для экспорта', 'warning');
            return;
        }
        
        const exportData = {
            ...session,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `khai-chat-${session.name}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(link.href);
        this.showNotification('Чат успешно экспортирован', 'success');
    }

    setMode(mode) {
        // Reset all modes
        this.isImageMode = false;
        this.isVoiceMode = false;
        
        this.generateImageBtn.classList.remove('active');
        this.generateVoiceBtn.classList.remove('active');
        
        // Set new mode
        if (mode === 'image') {
            this.isImageMode = true;
            this.generateImageBtn.classList.add('active');
            this.userInput.placeholder = 'Опишите изображение для генерации...';
        } else if (mode === 'voice') {
            this.isVoiceMode = true;
            this.generateVoiceBtn.classList.add('active');
            this.userInput.placeholder = 'Введите текст для генерации голоса...';
        } else {
            this.userInput.placeholder = 'Задайте вопрос или опишите задачу...';
        }
        
        this.showNotification(`Режим установлен: ${mode}`, 'info');
    }

    buildContextPrompt(userMessage) {
        const recentHistory = this.conversationHistory.slice(-5);
        
        if (recentHistory.length === 0) {
            return userMessage;
        }
        
        let contextPrompt = "Контекст предыдущего общения:\n";
        
        recentHistory.forEach(msg => {
            const role = msg.role === 'user' ? 'Пользователь' : 'Ассистент';
            contextPrompt += `${role}: ${msg.content}\n`;
        });
        
        contextPrompt += `\nТекущее сообщение пользователя: ${userMessage}`;
        contextPrompt += "\n\nОтветь на текущее сообщение пользователя, учитывая контекст выше. Будь полезным ассистентом.";
        
        return contextPrompt;
    }

    // Error Handling
    handleError(message, error) {
        console.error(message, error);
        
        let userMessage = message;
        if (error instanceof Error) {
            if (error.message.includes('network') || error.message.includes('Network')) {
                userMessage = 'Ошибка сети. Проверьте подключение к интернету.';
            } else if (error.message.includes('quota') || error.message.includes('limit')) {
                userMessage = 'Превышен лимит запросов. Попробуйте позже.';
            } else if (error.message.includes('auth') || error.message.includes('permission')) {
                userMessage = 'Ошибка авторизации. Проверьте настройки доступа.';
            }
        }
        
        this.showNotification(userMessage, 'error');
        
        // Add error message to chat
        this.addMessage('assistant', `Извините, произошла ошибка: ${userMessage}`);
    }

    handleCriticalError(message, error) {
        console.error('CRITICAL ERROR:', message, error);
        
        // Show error page or fallback UI
        if (this.appContainer) {
            this.appContainer.innerHTML = `
                <div class="error-container">
                    <h2>Произошла критическая ошибка</h2>
                    <p>${message}</p>
                    <button onclick="window.location.reload()" class="btn btn-primary">
                        Перезагрузить приложение
                    </button>
                </div>
            `;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
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
        
        // Add close event
        const closeBtn = notification.querySelector('.notification-close');
        this.addEventListener(closeBtn, 'click', () => {
            notification.remove();
        });
        
        // Auto remove after 5 seconds
        this.setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        // Add show class after a frame
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'circle-check',
            'error': 'circle-x',
            'warning': 'alert-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    debug(...args) {
        if (this.DEBUG) {
            console.log('[KHAI Assistant]', ...args);
        }
    }

    // Cleanup method to prevent memory leaks
    cleanup() {
        // Clear all timeouts
        this.activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.activeTimeouts.clear();
        
        // Clear all debounce timers
        this.debounceTimers.forEach(timerId => clearTimeout(timerId));
        this.debounceTimers.clear();
        
        // Remove all event listeners
        this.activeEventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        this.activeEventListeners.clear();
        
        // Stop any active speech
        if (this.isSpeaking && this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
            this.isSpeaking = false;
        }
        
        // Stop voice recognition
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        
        // Stop any active generation
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
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.khaiAssistant = new KHAIAssistant();
});

// Export for global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KHAIAssistant;
}
