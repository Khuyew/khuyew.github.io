// KHAI Assistant - Production Ready v2.1.1
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
            this.sidebarSearchClear = document.getElementById('sidebarSearchClear');

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
            this.documentationBtn = document.getElementById('documentationBtn');
            this.supportBtn = document.getElementById('supportBtn');
            
            // Footer
            this.connectionStatusText = document.getElementById('connectionStatusText');

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
        this.MAX_CHAT_NAME_LENGTH = 50;
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
            this.setupPreloader();
            
            this.debug('KHAI Assistant успешно загружен');
            this.showNotification('KHAI Assistant загружен и готов к работе!', 'success');
            
            // Setup cleanup on page unload
            this.setupCleanup();
            
        } catch (error) {
            this.handleCriticalError('Ошибка инициализации приложения', error);
        }
    }

    setupPreloader() {
        // Remove preloader after everything is loaded
        window.addEventListener('load', () => {
            this.setTimeout(() => {
                const preloader = document.getElementById('preloader');
                if (preloader) {
                    preloader.style.opacity = '0';
                    preloader.style.visibility = 'hidden';
                    this.setTimeout(() => {
                        if (preloader.parentNode) {
                            preloader.remove();
                        }
                    }, 500);
                }
            }, 500);
        });
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
            [this.sidebarSearch, 'input', () => this.debounce('sidebarSearch', () => this.filterChatHistory(), 300)],
            [this.sidebarSearchClear, 'click', () => this.clearSidebarSearch()],
            [this.importChatBtn, 'click', () => this.importChatHistory()],
            [this.documentationBtn, 'click', () => this.openDocumentation()],
            [this.supportBtn, 'click', () => this.openSupport()],
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
            } else if (file.fileType === 'text') {
                const fileContent = file.data;
                
                if (userMessage.trim()) {
                    return `Пользователь отправил текстовый файл "${file.name}" с сопроводительным сообщением: "${userMessage}"

Содержимое файла:
"""
${fileContent}
"""

Ответь на вопрос/сообщение пользователя "${userMessage}", учитывая содержимое прикрепленного файла. Проанализируй текст и дай развернутый ответ на основе предоставленной информации. Отвечай на русском языке.`;
                } else {
                    return `Пользователь отправил текстовый файл "${file.name}".

Содержимое файла:
"""
${fileContent}
"""

Проанализируй содержимое этого файла. Суммируй основную информацию, выдели ключевые моменты, предложи выводы или рекомендации на основе представленного текста. Отвечай подробно на русском языке.`;
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
            }
            
        } catch (error) {
            if (!this.generationAborted) {
                console.error('Error processing AI response:', error);
                this.handleError('Ошибка при обработке ответа ИИ', error);
            }
        } finally {
            this.currentStreamController = null;
            this.activeStreamingMessage = null;
        }
    }

    createStreamingMessage() {
        const messageId = 'msg-' + Date.now();
        const messageHTML = `
            <div class="message ai-message" id="${messageId}">
                <div class="message-avatar">
                    <i class="ti ti-robot"></i>
                </div>
                <div class="message-content">
                    <div class="streaming-text"></div>
                    <div class="message-actions">
                        <button class="action-btn copy-btn" title="Копировать">
                            <i class="ti ti-copy"></i>
                        </button>
                        <button class="action-btn regenerate-btn" title="Перегенерировать">
                            <i class="ti ti-refresh"></i>
                        </button>
                        <button class="action-btn edit-btn" title="Редактировать">
                            <i class="ti ti-edit"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        this.scrollToBottom();
        
        const messageElement = document.getElementById(messageId);
        this.bindMessageActions(messageElement);
        
        return messageId;
    }

    updateStreamingMessage(messageId, content) {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) return;
        
        const streamingText = messageElement.querySelector('.streaming-text');
        if (streamingText) {
            streamingText.innerHTML = this.formatMessage(content);
        }
        
        if (this.autoScrollEnabled) {
            this.scrollToBottom();
        }
    }

    finalizeStreamingMessage(messageId, content) {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) return;
        
        const streamingText = messageElement.querySelector('.streaming-text');
        if (streamingText) {
            streamingText.innerHTML = this.formatMessage(content);
            streamingText.classList.remove('streaming-text');
        }
    }

    showTypingIndicator() {
        const messageId = 'typing-' + Date.now();
        const typingHTML = `
            <div class="message ai-message typing-indicator" id="${messageId}">
                <div class="message-avatar">
                    <i class="ti ti-robot"></i>
                </div>
                <div class="message-content">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        
        this.messagesContainer.insertAdjacentHTML('beforeend', typingHTML);
        this.scrollToBottom();
        
        return messageId;
    }

    removeTypingIndicator() {
        if (this.activeTypingIndicator) {
            const typingElement = document.getElementById(this.activeTypingIndicator);
            if (typingElement) {
                typingElement.remove();
            }
            this.activeTypingIndicator = null;
        }
    }

    addMessage(role, content, files = []) {
        const messageId = 'msg-' + Date.now();
        const isUser = role === 'user';
        
        let messageHTML = `
            <div class="message ${isUser ? 'user-message' : 'ai-message'}" id="${messageId}">
                <div class="message-avatar">
                    <i class="ti ${isUser ? 'ti-user' : 'ti-robot'}"></i>
                </div>
                <div class="message-content">
                    ${this.formatMessage(content)}
        `;
        
        if (files.length > 0) {
            messageHTML += `<div class="attached-files">`;
            files.forEach(file => {
                if (file.fileType === 'image') {
                    messageHTML += `
                        <div class="attached-file">
                            <img src="${file.data}" alt="${file.name}" loading="lazy">
                            <span class="file-name">${this.escapeHtml(file.name)}</span>
                        </div>
                    `;
                } else if (file.fileType === 'text') {
                    messageHTML += `
                        <div class="attached-file text-file">
                            <i class="ti ti-file-text"></i>
                            <span class="file-name">${this.escapeHtml(file.name)}</span>
                        </div>
                    `;
                }
            });
            messageHTML += `</div>`;
        }
        
        messageHTML += `
                    <div class="message-actions">
                        <button class="action-btn copy-btn" title="Копировать">
                            <i class="ti ti-copy"></i>
                        </button>
                        ${isUser ? `
                            <button class="action-btn edit-btn" title="Редактировать">
                                <i class="ti ti-edit"></i>
                            </button>
                        ` : `
                            <button class="action-btn regenerate-btn" title="Перегенерировать">
                                <i class="ti ti-refresh"></i>
                            </button>
                        `}
                    </div>
                </div>
            </div>
        `;
        
        this.messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
        
        const messageElement = document.getElementById(messageId);
        this.bindMessageActions(messageElement);
        
        this.scrollToBottom();
        this.updateMinimap();
        this.saveCurrentSession();
        
        return messageId;
    }

    bindMessageActions(messageElement) {
        const copyBtn = messageElement.querySelector('.copy-btn');
        const editBtn = messageElement.querySelector('.edit-btn');
        const regenerateBtn = messageElement.querySelector('.regenerate-btn');
        
        if (copyBtn) {
            this.addEventListener(copyBtn, 'click', () => {
                const content = messageElement.querySelector('.message-content');
                const text = content.innerText;
                this.copyToClipboard(text);
            });
        }
        
        if (editBtn) {
            this.addEventListener(editBtn, 'click', () => {
                const content = messageElement.querySelector('.message-content');
                const text = content.innerText;
                this.editMessage(messageElement, text);
            });
        }
        
        if (regenerateBtn) {
            this.addEventListener(regenerateBtn, 'click', () => {
                this.regenerateResponse(messageElement);
            });
        }
    }

    formatMessage(content) {
        if (!content) return '';
        
        try {
            // Basic sanitization before passing to marked
            const sanitized = this.escapeHtml(content);
            const formatted = marked.parse(sanitized);
            return formatted;
        } catch (error) {
            console.error('Error formatting message:', error);
            return this.escapeHtml(content).replace(/\n/g, '<br>');
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // File Handling
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        
        if (files.length + this.attachedImages.length > this.MAX_FILES) {
            this.showNotification(`Максимум ${this.MAX_FILES} файлов`, 'error');
            return;
        }
        
        files.forEach(file => {
            this.processFile(file);
        });
        
        event.target.value = '';
    }

    processFile(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const fileData = {
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result,
                fileType: this.getFileType(file.type)
            };
            
            if (fileData.fileType === 'image' && file.size > this.MAX_IMAGE_SIZE) {
                this.showNotification(`Изображение слишком большое (максимум ${this.MAX_IMAGE_SIZE / 1024 / 1024}MB)`, 'error');
                return;
            }
            
            this.attachedImages.push(fileData);
            this.renderAttachedFiles();
            this.handleInputChange();
        };
        
        reader.onerror = () => {
            this.showNotification('Ошибка чтения файла', 'error');
        };
        
        if (file.type.startsWith('image/')) {
            reader.readAsDataURL(file);
        } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            reader.readAsText(file);
        } else {
            this.showNotification('Неподдерживаемый тип файла', 'error');
        }
    }

    getFileType(mimeType) {
        if (mimeType.startsWith('image/')) {
            return 'image';
        } else if (mimeType === 'text/plain' || mimeType.includes('text')) {
            return 'text';
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
            
            if (file.fileType === 'image') {
                fileElement.innerHTML = `
                    <img src="${file.data}" alt="${this.escapeHtml(file.name)}">
                    <span class="file-name">${this.escapeHtml(file.name)}</span>
                    <button class="remove-file" data-index="${index}">
                        <i class="ti ti-x"></i>
                    </button>
                `;
            } else {
                fileElement.innerHTML = `
                    <i class="ti ti-file-text"></i>
                    <span class="file-name">${this.escapeHtml(file.name)}</span>
                    <button class="remove-file" data-index="${index}">
                        <i class="ti ti-x"></i>
                    </button>
                `;
            }
            
            this.attachedFiles.appendChild(fileElement);
        });
        
        // Add event listeners for remove buttons
        this.attachedFiles.querySelectorAll('.remove-file').forEach(btn => {
            this.addEventListener(btn, 'click', (e) => {
                const index = parseInt(e.target.closest('.remove-file').dataset.index);
                this.removeAttachedFile(index);
            });
        });
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
                this.showNotification('Ошибка распознавания речи', 'error');
                this.stopVoiceInput();
            };
            
            this.recognition.onend = () => {
                this.stopVoiceInput();
            };
        } else {
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
            this.showNotification('Распознавание речи не поддерживается', 'error');
            return;
        }
        
        try {
            this.recognition.start();
        } catch (error) {
            console.error('Error starting voice recognition:', error);
            this.showNotification('Ошибка запуска распознавания речи', 'error');
        }
    }

    stopVoiceInput() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        
        this.isListening = false;
        this.voiceInputBtn.classList.remove('listening');
    }

    // Modes
    toggleImageMode() {
        this.isImageMode = !this.isImageMode;
        
        if (this.isImageMode) {
            this.isVoiceMode = false;
            this.generateImageBtn.classList.add('active');
            this.generateVoiceBtn.classList.remove('active');
            this.userInput.placeholder = 'Опишите изображение для генерации...';
            this.showNotification('Режим генерации изображений включен', 'info');
        } else {
            this.generateImageBtn.classList.remove('active');
            this.userInput.placeholder = 'Задайте вопрос или опишите изображение...';
        }
    }

    toggleVoiceMode() {
        this.isVoiceMode = !this.isVoiceMode;
        
        if (this.isVoiceMode) {
            this.isImageMode = false;
            this.generateVoiceBtn.classList.add('active');
            this.generateImageBtn.classList.remove('active');
            this.userInput.placeholder = 'Введите текст для генерации голоса...';
            this.showNotification('Режим генерации голоса включен', 'info');
        } else {
            this.generateVoiceBtn.classList.remove('active');
            this.userInput.placeholder = 'Задайте вопрос или опишите изображение...';
        }
    }

    setMode(mode) {
        this.isImageMode = false;
        this.isVoiceMode = false;
        
        this.generateImageBtn.classList.remove('active');
        this.generateVoiceBtn.classList.remove('active');
        
        this.userInput.placeholder = 'Задайте вопрос или опишите изображение...';
        this.showNotification('Обычный режим включен', 'info');
    }

    // Image Generation
    async generateImage(prompt) {
        if (!prompt.trim()) {
            this.showNotification('Введите описание для генерации изображения', 'error');
            return;
        }
        
        this.showNotification('Генерация изображения...', 'info');
        
        try {
            if (typeof puter?.ai?.txt2img !== 'function') {
                throw new Error('Функция генерации изображений недоступна');
            }
            
            const imageUrl = await puter.ai.txt2img(prompt);
            
            this.addMessage('assistant', '', [{
                name: 'generated-image.png',
                data: imageUrl,
                fileType: 'image'
            }]);
            
            this.showNotification('Изображение сгенерировано', 'success');
            
        } catch (error) {
            console.error('Error generating image:', error);
            this.handleError('Ошибка при генерации изображения', error);
        }
    }

    // Voice Generation
    async generateVoice(text) {
        if (!text.trim()) {
            this.showNotification('Введите текст для генерации голоса', 'error');
            return;
        }
        
        this.showNotification('Генерация голоса...', 'info');
        
        try {
            if (typeof puter?.ai?.txt2speech !== 'function') {
                throw new Error('Функция генерации голоса недоступна');
            }
            
            const audioUrl = await puter.ai.txt2speech(text);
            
            this.stopCurrentAudio();
            this.currentAudio = new Audio(audioUrl);
            
            this.currentAudio.onended = () => {
                this.isSpeaking = false;
                this.generateVoiceBtn.classList.remove('speaking');
            };
            
            this.currentAudio.onerror = (error) => {
                console.error('Error playing audio:', error);
                this.isSpeaking = false;
                this.generateVoiceBtn.classList.remove('speaking');
                this.showNotification('Ошибка воспроизведения голоса', 'error');
            };
            
            await this.currentAudio.play();
            this.isSpeaking = true;
            this.generateVoiceBtn.classList.add('speaking');
            
            this.showNotification('Голос сгенерирован и воспроизводится', 'success');
            
        } catch (error) {
            console.error('Error generating voice:', error);
            this.handleError('Ошибка при генерации голоса', error);
        }
    }

    stopCurrentAudio() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
        this.isSpeaking = false;
        this.generateVoiceBtn.classList.remove('speaking');
    }

    // Chat Management
    createNewChat() {
        const newChatId = 'chat-' + Date.now();
        const chatName = 'Новый чат ' + new Date().toLocaleDateString('ru-RU');
        
        this.chatSessions.set(newChatId, {
            id: newChatId,
            name: chatName,
            messages: [],
            createdAt: Date.now()
        });
        
        this.currentChatId = newChatId;
        this.clearMessages();
        this.saveChatSessions();
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
        this.clearMessages();
        this.saveChatSessions();
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
            }
            
            // Ensure default chat exists
            if (!this.chatSessions.has('default')) {
                this.chatSessions.set('default', {
                    id: 'default',
                    name: 'Основной чат',
                    messages: [],
                    createdAt: Date.now()
                });
            }
            
        } catch (error) {
            console.error('Error loading chat sessions:', error);
            this.chatSessions = new Map();
            this.chatSessions.set('default', {
                id: 'default',
                name: 'Основной чат',
                messages: [],
                createdAt: Date.now()
            });
        }
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
        if (session && session.messages) {
            this.clearMessages();
            session.messages.forEach(msg => {
                this.addMessage(msg.role, msg.content, msg.files || []);
            });
        }
        this.updateMinimap();
    }

    saveCurrentSession() {
        const messages = Array.from(this.messagesContainer.querySelectorAll('.message')).map(el => {
            const isUser = el.classList.contains('user-message');
            const content = el.querySelector('.message-content').innerText;
            const files = [];
            
            const fileElements = el.querySelectorAll('.attached-file');
            fileElements.forEach(fileEl => {
                const img = fileEl.querySelector('img');
                if (img) {
                    files.push({
                        name: fileEl.querySelector('.file-name')?.innerText || 'image',
                        data: img.src,
                        fileType: 'image'
                    });
                }
            });
            
            return {
                role: isUser ? 'user' : 'assistant',
                content: content,
                files: files
            };
        });
        
        const session = this.chatSessions.get(this.currentChatId) || {
            id: this.currentChatId,
            name: 'Основной чат',
            createdAt: Date.now()
        };
        
        session.messages = messages;
        session.updatedAt = Date.now();
        
        this.chatSessions.set(this.currentChatId, session);
        this.saveChatSessions();
    }

    setupChatSelector() {
        this.updateChatSelector();
    }

    updateChatSelector() {
        if (!this.chatList) return;
        
        this.chatList.innerHTML = '';
        
        const sortedSessions = Array.from(this.chatSessions.values())
            .sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
        
        sortedSessions.forEach(session => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${session.id === this.currentChatId ? 'active' : ''}`;
            chatItem.innerHTML = `
                <div class="chat-item-content">
                    <i class="ti ti-message-circle"></i>
                    <span class="chat-name">${this.escapeHtml(session.name)}</span>
                </div>
                <div class="chat-actions">
                    <button class="chat-action-btn edit-chat-btn" title="Редактировать">
                        <i class="ti ti-edit"></i>
                    </button>
                </div>
            `;
            
            this.addEventListener(chatItem, 'click', (e) => {
                if (!e.target.closest('.chat-actions')) {
                    this.switchToChat(session.id);
                }
            });
            
            const editBtn = chatItem.querySelector('.edit-chat-btn');
            this.addEventListener(editBtn, 'click', (e) => {
                e.stopPropagation();
                this.openEditChatModal(session);
            });
            
            this.chatList.appendChild(chatItem);
        });
    }

    switchToChat(chatId) {
        if (this.currentChatId === chatId) return;
        
        this.currentChatId = chatId;
        this.loadCurrentSession();
        this.updateChatSelector();
        this.updateDocumentTitle();
        this.closeSidebar();
        
        const session = this.chatSessions.get(chatId);
        if (session) {
            this.showNotification(`Переключен на чат: ${session.name}`, 'info');
        }
    }

    openEditChatModal(session) {
        this.editChatModal.style.display = 'flex';
        this.editChatNameInput.value = session.name;
        this.editChatNameInput.dataset.chatId = session.id;
        this.editChatNameInput.focus();
        this.handleModalInputChange();
    }

    closeEditChatModal() {
        this.editChatModal.style.display = 'none';
        this.editChatNameInput.value = '';
        delete this.editChatNameInput.dataset.chatId;
    }

    handleModalInputChange() {
        const hasInput = this.editChatNameInput.value.trim().length > 0;
        this.modalClearInput.style.display = hasInput ? 'flex' : 'none';
    }

    clearModalInput() {
        this.editChatNameInput.value = '';
        this.handleModalInputChange();
        this.editChatNameInput.focus();
    }

    saveChatName() {
        const newName = this.editChatNameInput.value.trim();
        const chatId = this.editChatNameInput.dataset.chatId;
        
        if (!newName || !chatId) {
            this.showNotification('Некорректное имя чата', 'error');
            return;
        }
        
        if (newName.length > this.MAX_CHAT_NAME_LENGTH) {
            this.showNotification(`Имя чата слишком длинное (максимум ${this.MAX_CHAT_NAME_LENGTH} символов)`, 'error');
            return;
        }
        
        const session = this.chatSessions.get(chatId);
        if (session) {
            session.name = newName;
            this.chatSessions.set(chatId, session);
            this.saveChatSessions();
            this.updateChatSelector();
            this.updateDocumentTitle();
            this.closeEditChatModal();
            
            this.showNotification('Имя чата обновлено', 'success');
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
            modelItem.className = `model-item ${modelId === this.currentModel ? 'selected' : ''} ${!config.available ? 'disabled' : ''}`;
            modelItem.innerHTML = `
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
                this.addEventListener(modelItem, 'click', () => {
                    this.selectModel(modelId);
                });
            }
            
            this.modelList.appendChild(modelItem);
        });
    }

    selectModel(modelId) {
        if (!this.modelConfig[modelId]?.available) return;
        
        document.querySelectorAll('.model-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        const selectedItem = document.querySelector(`.model-item[data-model="${modelId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
        
        this.currentModel = modelId;
        this.updateModelInfo();
    }

    confirmModelSelection() {
        this.updateModelInfo();
        this.closeModelModal();
        this.showNotification(`Модель изменена на: ${this.modelConfig[this.currentModel].name}`, 'success');
    }

    updateModelInfo() {
        if (this.currentModelInfo) {
            const config = this.modelConfig[this.currentModel];
            this.currentModelInfo.textContent = config.name;
        }
        
        if (this.modelSelectBtn) {
            const config = this.modelConfig[this.currentModel];
            this.modelSelectBtn.innerHTML = `
                <i class="ti ti-cpu"></i>
                ${config.name}
                <i class="ti ti-chevron-down"></i>
            `;
        }
    }

    // Navigation & Scrolling
    setupScrollTracking() {
        this.addEventListener(this.messagesContainer, 'scroll', () => {
            this.handleScroll();
        });
        
        // Initial check
        this.handleScroll();
    }

    handleScroll() {
        const container = this.messagesContainer;
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        
        // Check if at bottom
        this.isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
        
        // Check if at top
        this.isAtTop = scrollTop < 10;
        
        // Update scroll buttons visibility
        if (this.scrollToBottomBtn) {
            this.scrollToBottomBtn.style.display = this.isAtBottom ? 'none' : 'flex';
        }
        
        // Update minimap viewport
        this.updateMinimapViewport();
    }

    scrollToBottom(force = false) {
        if (force || this.autoScrollEnabled) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            this.isAtBottom = true;
        }
    }

    scrollToLastAIMessage() {
        const aiMessages = this.messagesContainer.querySelectorAll('.ai-message:not(.typing-indicator)');
        if (aiMessages.length > 0) {
            const lastAIMessage = aiMessages[aiMessages.length - 1];
            lastAIMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Minimap
    setupResponsiveMinimap() {
        this.updateMinimap();
        
        this.addEventListener(this.chatMinimap, 'click', (e) => {
            if (e.target === this.chatMinimap || e.target === this.minimapContent) {
                return;
            }
            
            const rect = this.minimapContent.getBoundingClientRect();
            const clickY = e.clientY - rect.top;
            const percentage = clickY / rect.height;
            
            const targetScroll = percentage * this.messagesContainer.scrollHeight;
            this.messagesContainer.scrollTop = targetScroll - this.messagesContainer.clientHeight / 2;
        });
        
        this.addEventListener(window, 'resize', () => {
            this.updateMinimap();
        });
    }

    updateMinimap() {
        if (!this.minimapContent) return;
        
        const messages = Array.from(this.messagesContainer.querySelectorAll('.message'));
        let minimapHTML = '';
        
        messages.forEach((message, index) => {
            const isUser = message.classList.contains('user-message');
            const isAI = message.classList.contains('ai-message');
            const hasFiles = message.querySelector('.attached-files');
            const isLong = message.scrollHeight > 100;
            
            let className = 'minimap-message';
            if (isUser) className += ' user';
            if (isAI) className += ' ai';
            if (hasFiles) className += ' has-files';
            if (isLong) className += ' long';
            
            minimapHTML += `<div class="${className}" data-index="${index}"></div>`;
        });
        
        this.minimapContent.innerHTML = minimapHTML;
        this.updateMinimapViewport();
    }

    updateMinimapViewport() {
        if (!this.minimapViewport || !this.minimapContent) return;
        
        const container = this.messagesContainer;
        const contentHeight = container.scrollHeight;
        const viewportHeight = container.clientHeight;
        const scrollTop = container.scrollTop;
        
        if (contentHeight <= viewportHeight) {
            this.minimapViewport.style.display = 'none';
            return;
        }
        
        this.minimapViewport.style.display = 'block';
        
        const minimapHeight = this.minimapContent.offsetHeight;
        const viewportRatio = viewportHeight / contentHeight;
        const scrollRatio = scrollTop / contentHeight;
        
        const viewportHeightPx = Math.max(minimapHeight * viewportRatio, 20);
        const viewportTop = minimapHeight * scrollRatio;
        
        this.minimapViewport.style.height = viewportHeightPx + 'px';
        this.minimapViewport.style.top = viewportTop + 'px';
    }

    // Search
    handleSearchInput() {
        const query = this.headerSearch.value.trim().toLowerCase();
        
        if (query) {
            this.headerSearchClear.style.display = 'flex';
            this.highlightMessages(query);
        } else {
            this.headerSearchClear.style.display = 'none';
            this.clearHighlights();
        }
    }

    clearSearch() {
        this.headerSearch.value = '';
        this.headerSearchClear.style.display = 'none';
        this.clearHighlights();
    }

    highlightMessages(query) {
        // Remove existing highlights
        this.clearHighlights();
        
        if (!query) return;
        
        const messages = this.messagesContainer.querySelectorAll('.message-content');
        let foundCount = 0;
        
        messages.forEach(content => {
            const text = content.textContent.toLowerCase();
            if (text.includes(query)) {
                const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
                const html = content.innerHTML.replace(regex, '<mark class="search-highlight">$1</mark>');
                content.innerHTML = html;
                foundCount++;
            }
        });
        
        if (foundCount > 0) {
            this.showNotification(`Найдено ${foundCount} совпадений`, 'info');
        } else {
            this.showNotification('Совпадений не найдено', 'warning');
        }
    }

    clearHighlights() {
        const highlights = this.messagesContainer.querySelectorAll('.search-highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
    }

    filterChatHistory() {
        const query = this.sidebarSearch.value.trim().toLowerCase();
        
        if (query) {
            this.sidebarSearchClear.style.display = 'flex';
        } else {
            this.sidebarSearchClear.style.display = 'none';
        }
        
        const chatItems = this.chatList.querySelectorAll('.chat-item');
        
        chatItems.forEach(item => {
            const chatName = item.querySelector('.chat-name').textContent.toLowerCase();
            if (chatName.includes(query)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    clearSidebarSearch() {
        this.sidebarSearch.value = '';
        this.sidebarSearchClear.style.display = 'none';
        
        const chatItems = this.chatList.querySelectorAll('.chat-item');
        chatItems.forEach(item => {
            item.style.display = 'flex';
        });
    }

    // Sidebar
    toggleSidebar() {
        this.sidebarMenu.classList.toggle('active');
        this.sidebarOverlay.style.display = this.sidebarMenu.classList.contains('active') ? 'block' : 'none';
        
        if (this.sidebarMenu.classList.contains('active')) {
            this.filterChatHistory();
        }
    }

    closeSidebar() {
        this.sidebarMenu.classList.remove('active');
        this.sidebarOverlay.style.display = 'none';
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
                    const data = JSON.parse(event.target.result);
                    this.handleImportedData(data);
                } catch (error) {
                    console.error('Error parsing imported file:', error);
                    this.showNotification('Ошибка при импорте файла', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    handleImportedData(data) {
        if (!data || !Array.isArray(data.messages)) {
            this.showNotification('Некорректный формат файла', 'error');
            return;
        }
        
        const chatId = 'imported-' + Date.now();
        const chatName = data.name || 'Импортированный чат ' + new Date().toLocaleDateString('ru-RU');
        
        this.chatSessions.set(chatId, {
            id: chatId,
            name: chatName,
            messages: data.messages,
            createdAt: Date.now(),
            imported: true
        });
        
        this.currentChatId = chatId;
        this.loadCurrentSession();
        this.updateChatSelector();
        this.updateDocumentTitle();
        
        this.showNotification('Чат успешно импортирован', 'success');
    }

    // External Links
    openDocumentation() {
        window.open('https://github.com/khuyew/khuyew.github.io', '_blank');
    }

    openSupport() {
        window.open('https://github.com/khuyew/khuyew.github.io/issues', '_blank');
    }

    // Utilities
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Текст скопирован в буфер обмена', 'success');
        }).catch(err => {
            console.error('Error copying text:', err);
            this.showNotification('Ошибка при копировании', 'error');
        });
    }

    editMessage(messageElement, currentText) {
        const messageId = messageElement.id;
        const contentDiv = messageElement.querySelector('.message-content');
        const originalContent = contentDiv.innerHTML;
        
        const textarea = document.createElement('textarea');
        textarea.className = 'message-edit-input';
        textarea.value = currentText;
        textarea.rows = 4;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'edit-buttons';
        buttonContainer.innerHTML = `
            <button class="btn-primary save-edit">Сохранить</button>
            <button class="btn-secondary cancel-edit">Отмена</button>
        `;
        
        contentDiv.innerHTML = '';
        contentDiv.appendChild(textarea);
        contentDiv.appendChild(buttonContainer);
        
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        
        const saveEdit = () => {
            const newText = textarea.value.trim();
            if (newText && newText !== currentText) {
                contentDiv.innerHTML = this.formatMessage(newText);
                
                // Update conversation history
                const messageIndex = this.conversationHistory.findIndex(msg => msg.elementId === messageId);
                if (messageIndex !== -1) {
                    this.conversationHistory[messageIndex].content = newText;
                }
                
                this.saveCurrentSession();
                this.bindMessageActions(messageElement);
                this.showNotification('Сообщение обновлено', 'success');
            } else {
                contentDiv.innerHTML = originalContent;
                this.bindMessageActions(messageElement);
            }
        };
        
        const cancelEdit = () => {
            contentDiv.innerHTML = originalContent;
            this.bindMessageActions(messageElement);
        };
        
        this.addEventListener(textarea, 'keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                saveEdit();
            } else if (e.key === 'Escape') {
                cancelEdit();
            }
        });
        
        this.addEventListener(contentDiv.querySelector('.save-edit'), 'click', saveEdit);
        this.addEventListener(contentDiv.querySelector('.cancel-edit'), 'click', cancelEdit);
    }

    regenerateResponse(messageElement) {
        const userMessage = this.findPreviousUserMessage(messageElement);
        if (userMessage) {
            messageElement.remove();
            this.processUserMessage(userMessage.content);
        } else {
            this.showNotification('Не найдено предыдущее сообщение пользователя', 'error');
        }
    }

    findPreviousUserMessage(messageElement) {
        let currentElement = messageElement.previousElementSibling;
        while (currentElement) {
            if (currentElement.classList.contains('user-message')) {
                const content = currentElement.querySelector('.message-content').textContent;
                return { content: content };
            }
            currentElement = currentElement.previousElementSibling;
        }
        return null;
    }

    clearInput() {
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        this.handleInputChange();
        this.userInput.focus();
    }

    clearChat() {
        if (!confirm('Вы уверены, что хотите очистить текущий чат? Это действие нельзя отменить.')) {
            return;
        }
        
        this.clearMessages();
        this.saveCurrentSession();
        this.showNotification('Чат очищен', 'success');
    }

    clearMessages() {
        this.messagesContainer.innerHTML = '';
        this.updateMinimap();
    }

    refreshPage() {
        window.location.reload();
    }

    // Error Handling
    handleError(message, error) {
        console.error(message, error);
        
        let userMessage = message;
        if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
            userMessage = 'Проблемы с сетью. Проверьте подключение к интернету.';
        } else if (error?.message?.includes('quota') || error?.message?.includes('limit')) {
            userMessage = 'Превышены лимиты использования. Попробуйте позже.';
        } else if (error?.message?.includes('auth') || error?.message?.includes('permission')) {
            userMessage = 'Проблемы с авторизацией. Обновите страницу.';
        }
        
        this.showNotification(userMessage, 'error');
    }

    handleCriticalError(message, error) {
        console.error('CRITICAL ERROR:', message, error);
        
        // Show error to user
        const errorHTML = `
            <div class="error-message">
                <h3>Критическая ошибка</h3>
                <p>${message}</p>
                <p><small>${error?.message || 'Неизвестная ошибка'}</small></p>
                <button onclick="window.location.reload()" class="btn-primary">Перезагрузить приложение</button>
            </div>
        `;
        
        document.body.innerHTML = errorHTML;
    }

    // Notifications
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
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
        
        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // Auto remove after 5 seconds
        const removeNotification = () => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        };
        
        this.addEventListener(notification.querySelector('.notification-close'), 'click', removeNotification);
        
        this.setTimeout(removeNotification, 5000);
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

    // Connection Status
    updateConnectionStatus() {
        if (!this.connectionStatusText) return;
        
        const isOnline = navigator.onLine;
        this.connectionStatusText.textContent = isOnline ? 'Онлайн' : 'Офлайн';
        this.connectionStatusText.className = `connection-status ${isOnline ? 'online' : 'offline'}`;
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
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (this.headerSearch) {
                this.headerSearch.focus();
            }
        }
        
        // Escape to close modals/sidebar
        if (e.key === 'Escape') {
            if (this.editChatModal.style.display === 'flex') {
                this.closeEditChatModal();
            } else if (this.modelModalOverlay.style.display === 'flex') {
                this.closeModelModal();
            } else if (this.sidebarMenu.classList.contains('active')) {
                this.closeSidebar();
            }
        }
        
        // Ctrl/Cmd + / for help
        if ((e.ctrlKey || e.metaKey) && e.key === '/') {
            e.preventDefault();
            this.showHelp();
        }
    }

    handleResize() {
        this.updateMinimap();
        this.handleScroll();
    }

    // Performance & Utilities
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    delay(ms) {
        return new Promise(resolve => this.setTimeout(resolve, ms));
    }

    debug(...args) {
        if (this.DEBUG) {
            console.log('[KHAI Assistant]', ...args);
        }
    }

    updateDocumentTitle() {
        const session = this.chatSessions.get(this.currentChatId);
        const chatName = session?.name || 'KHAI Assistant';
        document.title = `${chatName} - KHAI Assistant`;
    }

    checkPWAInstallation() {
        // Check if app is installed as PWA
        if (window.matchMedia('(display-mode: standalone)').matches) {
            document.body.classList.add('pwa-installed');
        }
    }

    showHelp() {
        const helpMessage = `
KHAI Assistant - Руководство

Основные возможности:
• Отправка текстовых сообщений
• Прикрепление изображений и текстовых файлов
• Генерация изображений по описанию
• Генерация голоса из текста
• Управление несколькими чатами
• Поиск по истории сообщений

Горячие клавиши:
• Enter - отправить сообщение
• Shift+Enter - новая строка
• Ctrl+K - поиск по чату
• Ctrl+/ - показать справку
• Escape - закрыть модальные окна

Поддерживаемые модели:
• GPT-5 Nano - быстрая и эффективная
• O3 Mini - улучшенные рассуждения
• DeepSeek Chat - универсальная
• DeepSeek Reasoner - логические задачи
• Gemini 2.0 Flash - новейшая от Google
• xAI Grok - остроумные ответы
        `.trim();
        
        this.showNotification('Справка открыта в консоли браузера', 'info');
        console.log(helpMessage);
    }

    addToConversationHistory(role, content, files = []) {
        this.conversationHistory.push({
            role,
            content,
            files,
            timestamp: Date.now()
        });
        
        // Limit history size
        if (this.conversationHistory.length > this.CONVERSATION_HISTORY_LIMIT) {
            this.conversationHistory = this.conversationHistory.slice(-this.CONVERSATION_HISTORY_LIMIT);
        }
    }

    buildContextPrompt(userMessage) {
        if (this.conversationHistory.length === 0) {
            return userMessage;
        }
        
        let context = "Контекст предыдущего общения:\n\n";
        
        this.conversationHistory.slice(-10).forEach(msg => {
            const role = msg.role === 'user' ? 'Пользователь' : 'Ассистент';
            context += `${role}: ${msg.content}\n\n`;
        });
        
        context += `Текущий вопрос пользователя: ${userMessage}`;
        
        return context;
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
        
        // Stop audio if playing
        this.stopCurrentAudio();
        
        // Stop voice recognition
        this.stopVoiceInput();
        
        // Stop generation if in progress
        if (this.isGenerating) {
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
    // Show preloader
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.display = 'flex';
    }
    
    // Initialize app after a short delay to ensure everything is loaded
    setTimeout(() => {
        try {
            window.khaiAssistant = new KHAIAssistant();
        } catch (error) {
            console.error('Failed to initialize KHAI Assistant:', error);
            
            // Show error message to user
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.innerHTML = `
                <h3>Ошибка загрузки приложения</h3>
                <p>Не удалось загрузить KHAI Assistant. Пожалуйста, обновите страницу.</p>
                <button onclick="window.location.reload()" class="btn-primary">Перезагрузить</button>
            `;
            
            document.body.innerHTML = '';
            document.body.appendChild(errorElement);
        }
    }, 100);
});

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden - cleanup resources
        if (window.khaiAssistant) {
            window.khaiAssistant.stopCurrentAudio();
            window.khaiAssistant.stopVoiceInput();
        }
    }
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
