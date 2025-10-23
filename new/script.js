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
            this.downloadChatBtn = document.getElementById('downloadChatBtn');
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
            this.importChatBtn = document.getElementById('importChatBtn');
            this.documentationBtn = document.getElementById('documentationBtn');
            this.supportBtn = document.getElementById('supportBtn');

            // Search
            this.headerSearch = document.getElementById('headerSearch');
            this.headerSearchClear = document.getElementById('headerSearchClear');
            this.sidebarSearch = document.getElementById('sidebarSearch');
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
            this.currentModelInfo = document.getElementById('currentModelInfo');
            this.connectionStatus = document.getElementById('connectionStatus');
            this.appVersionDate = document.getElementById('appVersionDate');
            
            // Footer
            this.connectionStatusText = document.getElementById('connectionStatusText');

            // Preloader
            this.preloader = document.getElementById('preloader');
            this.appContainer = document.querySelector('.app-container');

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
            this.hidePreloader();
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
            this.setCurrentYear();
            
            this.debug('KHAI Assistant успешно загружен');
            this.showNotification('KHAI Assistant загружен и готов к работе!', 'success');
            
            // Setup cleanup on page unload
            this.setupCleanup();
            
        } catch (error) {
            this.handleCriticalError('Ошибка инициализации приложения', error);
        }
    }

    hidePreloader() {
        if (this.preloader) {
            this.preloader.style.opacity = '0';
            this.preloader.style.visibility = 'hidden';
            this.setTimeout(() => {
                if (this.preloader && this.preloader.parentNode) {
                    this.preloader.parentNode.removeChild(this.preloader);
                }
            }, 500);
        }
        
        if (this.appContainer) {
            this.appContainer.style.opacity = '1';
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
            [this.downloadChatBtn, 'click', () => this.downloadCurrentChat()],
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
            [this.importChatBtn, 'click', () => this.importChatHistory()],
            [this.documentationBtn, 'click', () => this.showDocumentation()],
            [this.supportBtn, 'click', () => this.showSupport()],
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
            [this.sidebarSearch, 'input', () => this.debounce('sidebarSearch', () => this.handleSidebarSearch(), 300)],
            [this.sidebarSearchClear, 'click', () => this.clearSidebarSearch()],
            [this.normalModeBtn, 'click', () => this.setMode('normal')],
            [this.modelSelectBtn, 'click', () => this.openModelModal()],
            [this.themeMinimapToggle, 'click', () => this.toggleTheme()],
            [this.modelModalClose, 'click', () => this.closeModelModal()],
            [this.modelModalCancel, 'click', () => this.closeModelModal()],
            [this.modelModalConfirm, 'click', () => this.selectModel()],
            [window, 'resize', () => this.debounce('resize', () => this.handleResize(), 250)],
            [document, 'visibilitychange', () => this.handleVisibilityChange()]
        ];

        events.forEach(([element, event, handler]) => {
            if (element) {
                element.addEventListener(event, handler);
                const key = `${event}_${element.id || 'unknown'}`;
                if (!this.activeEventListeners.has(key)) {
                    this.activeEventListeners.set(key, []);
                }
                this.activeEventListeners.get(key).push({ element, event, handler });
            }
        });
    }

    setupAutoResize() {
        const resizeTextarea = () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
        };

        this.userInput.addEventListener('input', resizeTextarea);
        this.cleanupCallbacks.push(() => {
            this.userInput.removeEventListener('input', resizeTextarea);
        });
    }

    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'ru-RU';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateVoiceButtonState();
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
                    this.userInput.value = transcript;
                    this.handleInputChange();
                }
            };

            this.recognition.onerror = (event) => {
                this.debug('Speech recognition error:', event.error);
                if (event.error !== 'no-speech') {
                    this.showNotification('Ошибка распознавания речи', 'error');
                }
                this.stopVoiceRecognition();
            };

            this.recognition.onend = () => {
                this.stopVoiceRecognition();
            };
        } else {
            this.voiceInputBtn.style.display = 'none';
        }
    }

    setupScrollTracking() {
        const container = this.messagesContainer;
        if (!container) return;

        const updateScrollState = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            this.isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
            this.isAtTop = scrollTop < 10;
            
            this.updateMinimap();
            this.updateScrollButtons();
        };

        container.addEventListener('scroll', updateScrollState);
        this.cleanupCallbacks.push(() => {
            container.removeEventListener('scroll', updateScrollState);
        });
    }

    setupResponsiveMinimap() {
        const updateMinimapSize = () => {
            if (!this.chatMinimap) return;
            
            const containerHeight = this.messagesContainer.clientHeight;
            const contentHeight = this.messagesContainer.scrollHeight;
            
            if (contentHeight > containerHeight * 2) {
                this.chatMinimap.style.display = 'flex';
                this.updateMinimap();
            } else {
                this.chatMinimap.style.display = 'none';
            }
        };

        const observer = new ResizeObserver(() => {
            this.debounce('minimapResize', updateMinimapSize, 100);
        });

        if (this.messagesContainer) {
            observer.observe(this.messagesContainer);
        }

        this.cleanupCallbacks.push(() => {
            observer.disconnect();
        });
    }

    updateMinimap() {
        if (!this.messagesContainer || !this.minimapContent || !this.minimapViewport) return;

        const container = this.messagesContainer;
        const contentHeight = container.scrollHeight;
        const containerHeight = container.clientHeight;
        const scrollTop = container.scrollTop;
        
        if (contentHeight <= containerHeight) {
            this.minimapContent.style.display = 'none';
            this.minimapViewport.style.display = 'none';
            return;
        }

        this.minimapContent.style.display = 'block';
        this.minimapViewport.style.display = 'block';

        // Create minimap markers
        const messages = container.querySelectorAll('.message');
        let minimapHTML = '';
        
        messages.forEach((message, index) => {
            const isUser = message.classList.contains('user-message');
            const isAI = message.classList.contains('ai-message');
            const isTyping = message.classList.contains('typing-indicator');
            
            if (isTyping) return;
            
            let markerClass = 'minimap-marker';
            if (isUser) markerClass += ' user';
            if (isAI) markerClass += ' ai';
            if (index === this.lastAIMessageIndex) markerClass += ' last-ai';
            
            minimapHTML += `<div class="${markerClass}" data-index="${index}"></div>`;
        });
        
        this.minimapContent.innerHTML = minimapHTML;

        // Update viewport position
        const scrollRatio = scrollTop / (contentHeight - containerHeight);
        const viewportHeight = Math.max((containerHeight / contentHeight) * 100, 5);
        const viewportTop = scrollRatio * (100 - viewportHeight);
        
        this.minimapViewport.style.height = `${viewportHeight}%`;
        this.minimapViewport.style.top = `${viewportTop}%`;
    }

    updateScrollButtons() {
        if (this.scrollToBottomBtn) {
            this.scrollToBottomBtn.style.opacity = this.isAtBottom ? '0.5' : '1';
        }
        
        if (this.scrollToLastAI) {
            this.scrollToLastAI.style.opacity = this.lastAIMessageIndex >= 0 ? '1' : '0.5';
        }
    }

    handleSendButtonClick() {
        this.sendMessage();
    }

    handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    handleInputChange() {
        const value = this.userInput.value.trim();
        
        // Show/hide clear button
        if (this.clearInputBtn) {
            this.clearInputBtn.style.display = value ? 'flex' : 'none';
        }
        
        // Update send button state
        this.updateSendButtonState();
        
        // Auto-resize
        this.userInput.style.height = 'auto';
        this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        const validFiles = files.slice(0, this.MAX_FILES - this.attachedImages.length);
        
        validFiles.forEach(file => {
            if (this.validateFile(file)) {
                this.addAttachedFile(file);
            }
        });
        
        event.target.value = '';
        this.updateSendButtonState();
    }

    validateFile(file) {
        if (file.size > this.MAX_IMAGE_SIZE) {
            this.showNotification(`Файл слишком большой (максимум ${this.MAX_IMAGE_SIZE / 1024 / 1024}MB)`, 'error');
            return false;
        }
        
        if (!file.type.startsWith('image/') && file.type !== 'text/plain') {
            this.showNotification('Поддерживаются только изображения и текстовые файлы', 'error');
            return false;
        }
        
        return true;
    }

    addAttachedFile(file) {
        const fileId = Date.now().toString();
        const fileElement = document.createElement('div');
        fileElement.className = 'attached-file';
        fileElement.innerHTML = `
            <span class="file-name">${this.escapeHtml(file.name)}</span>
            <button class="file-remove" data-file-id="${fileId}">
                <i class="ti ti-x"></i>
            </button>
        `;
        
        const removeBtn = fileElement.querySelector('.file-remove');
        removeBtn.addEventListener('click', () => {
            this.removeAttachedFile(fileId);
        });
        
        this.attachedFiles.appendChild(fileElement);
        
        this.attachedImages.push({
            id: fileId,
            file: file,
            element: fileElement
        });
        
        this.updateAttachedFilesVisibility();
    }

    removeAttachedFile(fileId) {
        const fileIndex = this.attachedImages.findIndex(img => img.id === fileId);
        if (fileIndex !== -1) {
            const file = this.attachedImages[fileIndex];
            file.element.remove();
            this.attachedImages.splice(fileIndex, 1);
            this.updateAttachedFilesVisibility();
            this.updateSendButtonState();
        }
    }

    updateAttachedFilesVisibility() {
        if (this.attachedFiles) {
            this.attachedFiles.style.display = this.attachedImages.length > 0 ? 'flex' : 'none';
        }
    }

    updateSendButtonState() {
        const hasText = this.userInput.value.trim().length > 0;
        const hasFiles = this.attachedImages.length > 0;
        const canSend = (hasText || hasFiles) && !this.isProcessing;
        
        if (this.sendBtn) {
            this.sendBtn.disabled = !canSend;
            this.sendBtn.style.opacity = canSend ? '1' : '0.5';
        }
    }

    toggleVoiceInput() {
        if (this.isListening) {
            this.stopVoiceRecognition();
        } else {
            this.startVoiceRecognition();
        }
    }

    startVoiceRecognition() {
        if (!this.recognition) {
            this.showNotification('Голосовой ввод не поддерживается в вашем браузере', 'error');
            return;
        }
        
        try {
            this.recognition.start();
        } catch (error) {
            this.debug('Voice recognition start error:', error);
            this.showNotification('Ошибка запуска голосового ввода', 'error');
        }
    }

    stopVoiceRecognition() {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
            } catch (error) {
                this.debug('Voice recognition stop error:', error);
            }
        }
        
        this.isListening = false;
        this.updateVoiceButtonState();
    }

    updateVoiceButtonState() {
        if (this.voiceInputBtn) {
            if (this.isListening) {
                this.voiceInputBtn.classList.add('listening');
                this.voiceInputBtn.innerHTML = '<i class="ti ti-microphone-off"></i>';
            } else {
                this.voiceInputBtn.classList.remove('listening');
                this.voiceInputBtn.innerHTML = '<i class="ti ti-microphone"></i>';
            }
        }
    }

    toggleSidebar() {
        if (this.sidebarMenu) {
            this.sidebarMenu.classList.add('active');
            this.sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeSidebar() {
        if (this.sidebarMenu) {
            this.sidebarMenu.classList.remove('active');
            this.sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    createNewChat() {
        const newChatId = 'chat_' + Date.now();
        this.currentChatId = newChatId;
        
        this.conversationHistory = [];
        this.messagesContainer.innerHTML = '';
        this.currentChatName.textContent = 'Новый чат';
        
        this.saveCurrentSession();
        this.updateChatList();
        this.closeSidebar();
        
        this.showNotification('Новый чат создан', 'success');
    }

    deleteAllChats() {
        if (confirm('Вы уверены, что хотите удалить все чаты? Это действие нельзя отменить.')) {
            this.chatSessions.clear();
            this.createNewChat();
            this.saveChatSessions();
            this.showNotification('Все чаты удалены', 'success');
        }
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
                    const data = JSON.parse(event.target.result);
                    this.importChatData(data);
                } catch (error) {
                    this.showNotification('Ошибка импорта файла', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    importChatData(data) {
        if (!data || !Array.isArray(data.messages)) {
            this.showNotification('Неверный формат файла чата', 'error');
            return;
        }
        
        const newChatId = 'imported_' + Date.now();
        this.currentChatId = newChatId;
        this.conversationHistory = data.messages;
        
        this.messagesContainer.innerHTML = '';
        this.conversationHistory.forEach(msg => {
            this.addMessageToChat(msg.role, msg.content, false);
        });
        
        this.currentChatName.textContent = data.chatName || 'Импортированный чат';
        this.saveCurrentSession();
        this.updateChatList();
        this.closeSidebar();
        
        this.showNotification('Чат успешно импортирован', 'success');
    }

    showDocumentation() {
        window.open('https://github.com/khuyew/khuyew.github.io/wiki', '_blank');
    }

    showSupport() {
        window.open('https://github.com/khuyew/khuyew.github.io/issues', '_blank');
    }

    openEditChatModal() {
        if (this.editChatModal) {
            this.editChatModal.classList.add('active');
            this.editChatNameInput.value = this.currentChatName.textContent;
            this.handleModalInputChange();
            this.editChatNameInput.focus();
        }
    }

    closeEditChatModal() {
        if (this.editChatModal) {
            this.editChatModal.classList.remove('active');
        }
    }

    handleModalInputChange() {
        const value = this.editChatNameInput.value.trim();
        if (this.modalClearInput) {
            this.modalClearInput.style.display = value ? 'flex' : 'none';
        }
    }

    clearModalInput() {
        this.editChatNameInput.value = '';
        this.handleModalInputChange();
        this.editChatNameInput.focus();
    }

    saveChatName() {
        const newName = this.editChatNameInput.value.trim();
        if (newName && newName.length <= this.MAX_CHAT_NAME_LENGTH) {
            this.currentChatName.textContent = newName;
            this.saveCurrentSession();
            this.updateChatList();
            this.closeEditChatModal();
            this.showNotification('Название чата обновлено', 'success');
        } else if (newName.length > this.MAX_CHAT_NAME_LENGTH) {
            this.showNotification(`Название не должно превышать ${this.MAX_CHAT_NAME_LENGTH} символов`, 'error');
        } else {
            this.showNotification('Введите название чата', 'error');
        }
    }

    handleSearchInput() {
        const query = this.headerSearch.value.trim().toLowerCase();
        
        if (this.headerSearchClear) {
            this.headerSearchClear.style.display = query ? 'flex' : 'none';
        }
        
        if (query) {
            this.filterMessages(query);
        } else {
            this.clearSearch();
        }
    }

    filterMessages(query) {
        const messages = this.messagesContainer.querySelectorAll('.message');
        let hasResults = false;
        
        messages.forEach(message => {
            const text = message.textContent.toLowerCase();
            const isMatch = text.includes(query);
            
            if (isMatch) {
                message.style.display = 'flex';
                hasResults = true;
            } else {
                message.style.display = 'none';
            }
        });
        
        if (!hasResults) {
            this.showNotification('Сообщения не найдены', 'info');
        }
    }

    clearSearch() {
        this.headerSearch.value = '';
        if (this.headerSearchClear) {
            this.headerSearchClear.style.display = 'none';
        }
        
        const messages = this.messagesContainer.querySelectorAll('.message');
        messages.forEach(message => {
            message.style.display = 'flex';
        });
    }

    handleSidebarSearch() {
        const query = this.sidebarSearch.value.trim().toLowerCase();
        
        if (this.sidebarSearchClear) {
            this.sidebarSearchClear.style.display = query ? 'flex' : 'none';
        }
        
        this.filterChats(query);
    }

    filterChats(query) {
        const chatItems = this.chatList.querySelectorAll('.chat-item');
        let hasResults = false;
        
        chatItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            const isMatch = text.includes(query);
            
            if (isMatch) {
                item.style.display = 'flex';
                hasResults = true;
            } else {
                item.style.display = 'none';
            }
        });
        
        if (!hasResults && query) {
            this.showNotification('Чаты не найдены', 'info');
        }
    }

    clearSidebarSearch() {
        this.sidebarSearch.value = '';
        if (this.sidebarSearchClear) {
            this.sidebarSearchClear.style.display = 'none';
        }
        
        const chatItems = this.chatList.querySelectorAll('.chat-item');
        chatItems.forEach(item => {
            item.style.display = 'flex';
        });
    }

    setMode(mode) {
        this.isImageMode = mode === 'image';
        this.isVoiceMode = mode === 'voice';
        
        // Update UI
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => btn.classList.remove('active'));
        
        if (mode === 'normal') {
            this.normalModeBtn.classList.add('active');
            this.userInput.placeholder = "Задайте вопрос или опишите изображение...";
        } else if (mode === 'voice') {
            this.generateVoiceBtn.classList.add('active');
            this.userInput.placeholder = "Введите текст для генерации голоса...";
        } else if (mode === 'image') {
            this.generateImageBtn.classList.add('active');
            this.userInput.placeholder = "Опишите изображение для генерации...";
        }
        
        this.updateModeIndicator();
    }

    updateModeIndicator() {
        const indicator = document.querySelector('.mode-indicator');
        if (!indicator) return;
        
        if (this.isImageMode) {
            indicator.innerHTML = '<i class="ti ti-photo"></i> Режим генерации изображений';
        } else if (this.isVoiceMode) {
            indicator.innerHTML = '<i class="ti ti-microphone"></i> Режим генерации голоса';
        } else {
            indicator.innerHTML = '<i class="ti ti-message"></i> Обычный режим';
        }
    }

    openModelModal() {
        if (this.modelModalOverlay) {
            this.modelModalOverlay.classList.add('active');
        }
    }

    closeModelModal() {
        if (this.modelModalOverlay) {
            this.modelModalOverlay.classList.remove('active');
        }
    }

    updateModelList() {
        if (!this.modelList) return;
        
        let html = '';
        Object.entries(this.modelConfig).forEach(([id, config]) => {
            const isSelected = id === this.currentModel;
            html += `
                <div class="model-item ${isSelected ? 'selected' : ''}" data-model-id="${id}">
                    <div class="model-radio">
                        <i class="ti ti-${isSelected ? 'circle-filled' : 'circle'}"></i>
                    </div>
                    <div class="model-info">
                        <div class="model-name">${config.name}</div>
                        <div class="model-description">${config.description}</div>
                        <div class="model-meta">
                            <span class="model-context">Контекст: ${(config.context / 1000).toFixed(0)}K</span>
                            <span class="model-status ${config.available ? 'available' : 'unavailable'}">
                                ${config.available ? '✓ Доступна' : '✗ Недоступна'}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        this.modelList.innerHTML = html;
        
        // Add click handlers
        this.modelList.querySelectorAll('.model-item').forEach(item => {
            item.addEventListener('click', () => {
                this.modelList.querySelectorAll('.model-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
            });
        });
    }

    selectModel() {
        const selected = this.modelList.querySelector('.model-item.selected');
        if (selected) {
            const modelId = selected.dataset.modelId;
            this.currentModel = modelId;
            this.updateModelInfo();
            this.closeModelModal();
            this.showNotification(`Модель изменена на: ${this.modelConfig[modelId].name}`, 'success');
        }
    }

    updateModelInfo() {
        if (this.currentModelInfo) {
            const config = this.modelConfig[this.currentModel];
            if (config) {
                this.currentModelInfo.textContent = config.name;
            }
        }
    }

    handleResize() {
        this.updateMinimap();
        this.setupResponsiveMinimap();
    }

    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden - pause any ongoing operations
            if (this.isSpeaking) {
                this.pauseSpeech();
            }
        } else {
            // Page is visible - resume if needed
            this.updateConnectionStatus();
        }
    }

    startPlaceholderAnimation() {
        let currentIndex = 0;
        
        const animatePlaceholder = () => {
            if (this.userInput && !this.userInput.matches(':focus')) {
                this.userInput.placeholder = this.placeholderExamples[currentIndex];
                currentIndex = (currentIndex + 1) % this.placeholderExamples.length;
            }
        };
        
        // Initial placeholder
        animatePlaceholder();
        
        // Change every 3 seconds
        this.setInterval(animatePlaceholder, 3000);
    }

    loadThemePreference() {
        const savedTheme = localStorage.getItem('khai-theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
        }
        this.applyTheme();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
        localStorage.setItem('khai-theme', this.currentTheme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        // Update theme toggle button icon
        if (this.themeToggle) {
            this.themeToggle.innerHTML = this.currentTheme === 'dark' ? 
                '<i class="ti ti-sun"></i>' : '<i class="ti ti-moon"></i>';
        }
        
        if (this.themeMinimapToggle) {
            this.themeMinimapToggle.innerHTML = this.currentTheme === 'dark' ? 
                '<i class="ti ti-sun"></i>' : '<i class="ti ti-moon"></i>';
        }
    }

    refreshPage() {
        window.location.reload();
    }

    showHelp() {
        const helpMessage = `
## KHAI Assistant - Справка

### Основные возможности:
- **Общение с ИИ**: Задавайте вопросы, получайте развернутые ответы
- **Генерация голоса**: Преобразование текста в речь (режим голоса)
- **Анализ файлов**: Загрузка изображений и текстовых файлов
- **Поиск по чату**: Быстрый поиск по истории сообщений
- **Управление чатами**: Создание, переключение, удаление чатов

### Горячие клавиши:
- **Enter**: Отправить сообщение
- **Shift + Enter**: Новая строка
- **Ctrl/Cmd + K**: Поиск по чату

### Поддерживаемые форматы файлов:
- Изображения: PNG, JPG, JPEG, GIF, WebP (до 5MB)
- Текстовые файлы: TXT

### Модели ИИ:
Доступны различные модели для разных задач - от быстрых до продвинутых.

Для дополнительной помощи посетите нашу документацию.
        `.trim();
        
        this.addMessageToChat('ai', helpMessage);
        this.showNotification('Справка открыта в чате', 'info');
    }

    async sendMessage() {
        if (this.isProcessing) return;
        
        const message = this.userInput.value.trim();
        const hasFiles = this.attachedImages.length > 0;
        
        if (!message && !hasFiles) {
            this.showNotification('Введите сообщение или прикрепите файл', 'error');
            return;
        }
        
        if (message.length > this.MAX_MESSAGE_LENGTH) {
            this.showNotification(`Сообщение слишком длинное (максимум ${this.MAX_MESSAGE_LENGTH} символов)`, 'error');
            return;
        }
        
        this.isProcessing = true;
        this.updateSendButtonState();
        
        try {
            // Add user message to chat
            this.addMessageToChat('user', message);
            this.lastUserMessage = message;
            
            // Handle file attachments
            let fileContents = [];
            if (hasFiles) {
                for (const attached of this.attachedImages) {
                    const content = await this.readFileAsDataURL(attached.file);
                    fileContents.push({
                        type: attached.file.type.startsWith('image/') ? 'image' : 'text',
                        content: content,
                        name: attached.file.name
                    });
                }
            }
            
            // Clear input and attachments
            this.clearInput();
            this.attachedImages = [];
            this.updateAttachedFilesVisibility();
            
            // Show typing indicator
            this.showTypingIndicator();
            
            // Process based on mode
            if (this.isImageMode) {
                await this.generateImage(message);
            } else if (this.isVoiceMode) {
                await this.generateVoice(message);
            } else {
                await this.generateAIResponse(message, fileContents);
            }
            
        } catch (error) {
            this.handleError('Ошибка отправки сообщения', error);
        } finally {
            this.isProcessing = false;
            this.updateSendButtonState();
            this.hideTypingIndicator();
        }
    }

    addMessageToChat(role, content, isStreaming = false) {
        const messageId = 'msg_' + Date.now();
        const messageElement = document.createElement('div');
        messageElement.className = `message ${role}-message ${isStreaming ? 'streaming' : ''}`;
        messageElement.id = messageId;
        
        let messageHTML = '';
        
        if (role === 'user') {
            messageHTML = `
                <div class="message-avatar">
                    <i class="ti ti-user"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">${this.escapeHtml(content)}</div>
                    <div class="message-time">${this.getCurrentTime()}</div>
                </div>
            `;
        } else {
            // AI message
            const formattedContent = marked.parse(content);
            messageHTML = `
                <div class="message-avatar">
                    <i class="ti ti-brain"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">${formattedContent}</div>
                    <div class="message-actions">
                        <button class="message-action copy-btn" title="Скопировать">
                            <i class="ti ti-copy"></i>
                        </button>
                        <button class="message-action speak-btn" title="Озвучить">
                            <i class="ti ti-speakerphone"></i>
                        </button>
                    </div>
                    <div class="message-time">${this.getCurrentTime()}</div>
                </div>
            `;
            
            if (role === 'ai') {
                this.lastAIMessageIndex = this.messagesContainer.children.length;
            }
        }
        
        messageElement.innerHTML = messageHTML;
        this.messagesContainer.appendChild(messageElement);
        
        // Add to conversation history
        this.conversationHistory.push({
            role: role,
            content: content,
            timestamp: Date.now()
        });
        
        // Trim history if too long
        if (this.conversationHistory.length > this.CONVERSATION_HISTORY_LIMIT) {
            this.conversationHistory = this.conversationHistory.slice(-this.CONVERSATION_HISTORY_LIMIT);
        }
        
        // Add event listeners for AI messages
        if (role === 'ai') {
            this.setupMessageActions(messageElement);
        }
        
        // Apply syntax highlighting
        this.setTimeout(() => {
            this.highlightCodeBlocks(messageElement);
        }, 100);
        
        // Scroll to bottom
        this.scrollToBottom();
        
        // Update minimap
        this.updateMinimap();
        
        // Save session
        this.saveCurrentSession();
        
        return messageElement;
    }

    setupMessageActions(messageElement) {
        const copyBtn = messageElement.querySelector('.copy-btn');
        const speakBtn = messageElement.querySelector('.speak-btn');
        
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const text = messageElement.querySelector('.message-text').textContent;
                this.copyToClipboard(text);
            });
        }
        
        if (speakBtn) {
            speakBtn.addEventListener('click', () => {
                const text = messageElement.querySelector('.message-text').textContent;
                this.speakText(text);
            });
        }
    }

    showTypingIndicator() {
        if (this.activeTypingIndicator) {
            this.activeTypingIndicator.remove();
        }
        
        const typingElement = document.createElement('div');
        typingElement.className = 'message ai-message typing-indicator';
        typingElement.innerHTML = `
            <div class="message-avatar">
                <i class="ti ti-brain"></i>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        this.messagesContainer.appendChild(typingElement);
        this.activeTypingIndicator = typingElement;
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        if (this.activeTypingIndicator) {
            this.activeTypingIndicator.remove();
            this.activeTypingIndicator = null;
        }
    }

    async generateAIResponse(message, fileContents = []) {
        try {
            // Initialize Puter AI
            const puterAI = await puter.ai;
            
            // Prepare messages for API
            const messages = [];
            
            // Add conversation history
            this.conversationHistory.forEach(msg => {
                if (msg.role === 'user') {
                    const content = [{ type: 'text', text: msg.content }];
                    messages.push({ role: 'user', content });
                } else if (msg.role === 'ai') {
                    messages.push({ role: 'assistant', content: msg.content });
                }
            });
            
            // Add current message with files
            const currentContent = [{ type: 'text', text: message }];
            
            // Add file contents if any
            fileContents.forEach(file => {
                if (file.type === 'image') {
                    currentContent.push({
                        type: 'image_url',
                        image_url: { url: file.content }
                    });
                }
            });
            
            messages.push({ role: 'user', content: currentContent });
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Create streaming message
            const streamingMessage = this.addMessageToChat('ai', '', true);
            this.activeStreamingMessage = streamingMessage;
            
            const messageText = streamingMessage.querySelector('.message-text');
            
            // Generate response with streaming
            const stream = await puterAI.chat.completions.create({
                model: this.currentModel,
                messages: messages,
                stream: true,
                max_tokens: 4000
            });
            
            let fullResponse = '';
            
            for await (const chunk of stream) {
                if (this.generationAborted) break;
                
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    fullResponse += content;
                    
                    // Update message content with proper formatting
                    const formattedContent = marked.parse(fullResponse + '█');
                    messageText.innerHTML = formattedContent;
                    
                    // Apply syntax highlighting
                    this.highlightCodeBlocks(streamingMessage);
                    
                    // Auto-scroll if at bottom
                    if (this.autoScrollEnabled) {
                        this.scrollToBottom();
                    }
                }
            }
            
            // Remove cursor and finalize
            if (!this.generationAborted) {
                const finalContent = marked.parse(fullResponse);
                messageText.innerHTML = finalContent;
                streamingMessage.classList.remove('streaming');
                
                // Update conversation history
                const lastMessageIndex = this.conversationHistory.findIndex(msg => 
                    msg.role === 'ai' && msg.content === ''
                );
                if (lastMessageIndex !== -1) {
                    this.conversationHistory[lastMessageIndex].content = fullResponse;
                }
                
                // Setup message actions
                this.setupMessageActions(streamingMessage);
                
                // Save session
                this.saveCurrentSession();
            }
            
        } catch (error) {
            this.handleError('Ошибка генерации ответа', error);
            this.hideTypingIndicator();
            
            // Show error message
            this.addMessageToChat('ai', 'Извините, произошла ошибка при генерации ответа. Пожалуйста, попробуйте еще раз.');
        } finally {
            this.activeStreamingMessage = null;
            this.generationAborted = false;
        }
    }

    async generateImage(prompt) {
        try {
            this.showNotification('Генерация изображений временно недоступна', 'info');
            
            // Add placeholder response
            this.addMessageToChat('ai', `
Генерация изображений в настоящее время находится в разработке.

**Запрос:** "${prompt}"

Мы работаем над интеграцией стабильной диффузии и других технологий генерации изображений. Эта функция будет доступна в ближайших обновлениях.

А пока вы можете:
- Использовать обычный режим для общения
- Генерировать голосовые сообщения
- Загружать изображения для анализа
            `.trim());
            
        } catch (error) {
            this.handleError('Ошибка генерации изображения', error);
        }
    }

    async generateVoice(text) {
        try {
            this.showNotification('Генерация голоса временно недоступна', 'info');
            
            // Add placeholder response
            this.addMessageToChat('ai', `
Генерация голоса в настоящее время находится в разработке.

**Текст для озвучки:** "${text}"

Мы работаем над интеграцией современных TTS (Text-to-Speech) технологий. Эта функция будет доступна в ближайших обновлениях.

А пока вы можете:
- Использовать обычный режим для общения
- Анализировать загруженные файлы
- Искать информацию в истории чатов
            `.trim());
            
        } catch (error) {
            this.handleError('Ошибка генерации голоса', error);
        }
    }

    speakText(text) {
        if (this.isSpeaking) {
            this.stopSpeech();
            return;
        }
        
        if ('speechSynthesis' in window) {
            this.stopSpeech(); // Stop any ongoing speech
            
            this.currentUtterance = new SpeechSynthesisUtterance(text);
            this.currentUtterance.lang = 'ru-RU';
            this.currentUtterance.rate = 1.0;
            this.currentUtterance.pitch = 1.0;
            
            this.currentUtterance.onstart = () => {
                this.isSpeaking = true;
                this.showNotification('Озвучивание начато', 'info');
            };
            
            this.currentUtterance.onend = () => {
                this.isSpeaking = false;
                this.showNotification('Озвучивание завершено', 'success');
            };
            
            this.currentUtterance.onerror = (event) => {
                this.isSpeaking = false;
                this.showNotification('Ошибка озвучивания', 'error');
                this.debug('Speech synthesis error:', event);
            };
            
            speechSynthesis.speak(this.currentUtterance);
        } else {
            this.showNotification('Озвучивание не поддерживается в вашем браузере', 'error');
        }
    }

    pauseSpeech() {
        if (speechSynthesis.speaking && !speechSynthesis.paused) {
            speechSynthesis.pause();
            this.showNotification('Озвучивание приостановлено', 'info');
        }
    }

    stopSpeech() {
        if (this.isSpeaking) {
            speechSynthesis.cancel();
            this.isSpeaking = false;
            this.showNotification('Озвучивание остановлено', 'info');
        }
    }

    clearInput() {
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        this.handleInputChange();
    }

    clearChat() {
        if (confirm('Вы уверены, что хотите очистить текущий чат? Это действие нельзя отменить.')) {
            this.messagesContainer.innerHTML = '';
            this.conversationHistory = [];
            this.saveCurrentSession();
            this.showNotification('Чат очищен', 'success');
        }
    }

    downloadCurrentChat() {
        try {
            const chatData = {
                chatName: this.currentChatName.textContent,
                timestamp: new Date().toISOString(),
                model: this.currentModel,
                messages: this.conversationHistory
            };
            
            const dataStr = JSON.stringify(chatData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `khai-chat-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            this.showNotification('Чат успешно скачан', 'success');
        } catch (error) {
            this.handleError('Ошибка скачивания чата', error);
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
        if (this.lastAIMessageIndex >= 0) {
            const messages = this.messagesContainer.querySelectorAll('.message');
            if (messages[this.lastAIMessageIndex]) {
                messages[this.lastAIMessageIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    handleScroll() {
        const { scrollTop, scrollHeight, clientHeight } = this.messagesContainer;
        this.isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
        this.autoScrollEnabled = this.isAtBottom;
        this.updateScrollButtons();
        this.updateMinimap();
    }

    updateConnectionStatus() {
        const status = navigator.onLine ? 'online' : 'offline';
        const statusText = navigator.onLine ? 'Подключено' : 'Офлайн';
        const statusIcon = navigator.onLine ? 'ti ti-circle-check' : 'ti ti-circle-off';
        
        if (this.connectionStatus) {
            this.connectionStatus.innerHTML = `${navigator.onLine ? '✅' : '❌'} ${statusText}`;
        }
        
        if (this.connectionStatusText) {
            this.connectionStatusText.innerHTML = `<i class="${statusIcon}"></i> ${statusText}`;
        }
        
        if (!navigator.onLine) {
            this.showNotification('Отсутствует подключение к интернету', 'error');
        }
    }

    setupChatSelector() {
        this.updateChatList();
    }

    updateChatList() {
        if (!this.chatList) return;
        
        let html = '';
        
        this.chatSessions.forEach((session, chatId) => {
            const isActive = chatId === this.currentChatId;
            const lastMessage = session.messages[session.messages.length - 1];
            const lastMessageText = lastMessage ? 
                (lastMessage.content.length > 30 ? lastMessage.content.substring(0, 30) + '...' : lastMessage.content) : 
                'Нет сообщений';
            
            html += `
                <div class="chat-item ${isActive ? 'active' : ''}" data-chat-id="${chatId}">
                    <div class="chat-item-content">
                        <div class="chat-item-name">${session.name}</div>
                        <div class="chat-item-preview">${this.escapeHtml(lastMessageText)}</div>
                        <div class="chat-item-meta">
                            <span class="chat-item-date">${this.formatDate(session.updatedAt)}</span>
                            <span class="chat-item-count">${session.messages.length} сообщ.</span>
                        </div>
                    </div>
                    <div class="chat-item-actions">
                        <button class="chat-action-btn edit-chat-btn" title="Редактировать">
                            <i class="ti ti-edit"></i>
                        </button>
                        <button class="chat-action-btn delete-chat-btn" title="Удалить">
                            <i class="ti ti-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        this.chatList.innerHTML = html || '<div class="no-chats">Нет сохраненных чатов</div>';
        
        // Add event listeners
        this.chatList.querySelectorAll('.chat-item').forEach(item => {
            const chatId = item.dataset.chatId;
            
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.chat-item-actions')) {
                    this.switchToChat(chatId);
                }
            });
            
            const editBtn = item.querySelector('.edit-chat-btn');
            const deleteBtn = item.querySelector('.delete-chat-btn');
            
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.currentChatId = chatId;
                    this.openEditChatModal();
                });
            }
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteChat(chatId);
                });
            }
        });
    }

    switchToChat(chatId) {
        if (this.chatSessions.has(chatId)) {
            this.currentChatId = chatId;
            this.loadCurrentSession();
            this.closeSidebar();
            this.showNotification('Чат переключен', 'success');
        }
    }

    deleteChat(chatId) {
        if (confirm('Вы уверены, что хотите удалить этот чат?')) {
            this.chatSessions.delete(chatId);
            
            if (this.currentChatId === chatId) {
                this.createNewChat();
            }
            
            this.saveChatSessions();
            this.updateChatList();
            this.showNotification('Чат удален', 'success');
        }
    }

    loadChatSessions() {
        try {
            const saved = localStorage.getItem('khai-chat-sessions');
            if (saved) {
                const sessions = JSON.parse(saved);
                this.chatSessions = new Map(sessions);
            }
        } catch (error) {
            this.debug('Error loading chat sessions:', error);
            this.chatSessions = new Map();
        }
    }

    saveChatSessions() {
        try {
            const sessions = Array.from(this.chatSessions.entries());
            localStorage.setItem('khai-chat-sessions', JSON.stringify(sessions));
        } catch (error) {
            this.debug('Error saving chat sessions:', error);
        }
    }

    loadCurrentSession() {
        if (this.chatSessions.has(this.currentChatId)) {
            const session = this.chatSessions.get(this.currentChatId);
            this.conversationHistory = session.messages || [];
            this.currentChatName.textContent = session.name || 'Новый чат';
            
            // Re-render messages
            this.messagesContainer.innerHTML = '';
            this.conversationHistory.forEach(msg => {
                this.addMessageToChat(msg.role, msg.content);
            });
            
            this.scrollToBottom();
        } else {
            // New session
            this.conversationHistory = [];
            this.messagesContainer.innerHTML = '';
            this.currentChatName.textContent = 'Новый чат';
            this.saveCurrentSession();
        }
    }

    saveCurrentSession() {
        const session = {
            name: this.currentChatName.textContent,
            messages: this.conversationHistory,
            model: this.currentModel,
            updatedAt: Date.now()
        };
        
        this.chatSessions.set(this.currentChatId, session);
        this.saveChatSessions();
        this.updateChatList();
    }

    updateDocumentTitle() {
        const messageCount = this.conversationHistory.filter(msg => msg.role === 'user').length;
        const title = messageCount > 0 ? 
            `KHAI (${messageCount}) - ИИ-помощник` : 
            'KHAI - ИИ-помощник';
        document.title = title;
    }

    checkPWAInstallation() {
        // Check if app is installed as PWA
        if (window.matchMedia('(display-mode: standalone)').matches) {
            document.body.classList.add('pwa-installed');
        }
    }

    setCurrentYear() {
        if (this.appVersionDate) {
            this.appVersionDate.textContent = new Date().getFullYear();
        }
    }

    // Utility methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getCurrentTime() {
        return new Date().toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 24 * 60 * 60 * 1000) {
            return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        } else if (diff < 7 * 24 * 60 * 60 * 1000) {
            return date.toLocaleDateString('ru-RU', { weekday: 'short' });
        } else {
            return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        }
    }

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Текст скопирован в буфер обмена', 'success');
        }).catch(() => {
            this.showNotification('Ошибка копирования текста', 'error');
        });
    }

    highlightCodeBlocks(container) {
        if (typeof hljs !== 'undefined') {
            const codeBlocks = container.querySelectorAll('pre code');
            codeBlocks.forEach(block => {
                hljs.highlightElement(block);
            });
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
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
        
        // Add close handler
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto-remove after 5 seconds
        this.setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        return notification;
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

    debounce(key, func, delay) {
        if (this.debounceTimers.has(key)) {
            clearTimeout(this.debounceTimers.get(key));
        }
        
        const timer = setTimeout(() => {
            func();
            this.debounceTimers.delete(key);
        }, delay);
        
        this.debounceTimers.set(key, timer);
    }

    setTimeout(func, delay) {
        const timer = setTimeout(() => {
            func();
            this.activeTimeouts.delete(timer);
        }, delay);
        
        this.activeTimeouts.add(timer);
        return timer;
    }

    setInterval(func, interval) {
        const timer = setInterval(func, interval);
        this.activeTimeouts.add(timer);
        return timer;
    }

    debug(...args) {
        if (this.DEBUG) {
            console.log('[KHAI]', ...args);
        }
    }

    handleError(context, error) {
        console.error(`${context}:`, error);
        this.showNotification(`${context}: ${error.message}`, 'error');
    }

    handleCriticalError(context, error) {
        console.error(`CRITICAL ${context}:`, error);
        
        // Show error to user
        const errorMessage = `
            <div class="error-message">
                <h3>Критическая ошибка</h3>
                <p>${context}</p>
                <p><small>${error.message}</small></p>
                <button onclick="window.location.reload()" class="retry-btn">
                    <i class="ti ti-refresh"></i> Перезагрузить приложение
                </button>
            </div>
        `;
        
        if (this.messagesContainer) {
            this.messagesContainer.innerHTML = errorMessage;
        }
    }

    cleanup() {
        // Clear all timeouts and intervals
        this.activeTimeouts.forEach(timer => {
            if (typeof timer === 'number') {
                clearTimeout(timer);
            } else {
                clearInterval(timer);
            }
        });
        this.activeTimeouts.clear();
        
        // Clear debounce timers
        this.debounceTimers.forEach(timer => clearTimeout(timer));
        this.debounceTimers.clear();
        
        // Remove event listeners
        this.activeEventListeners.forEach((listeners, key) => {
            listeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        this.activeEventListeners.clear();
        
        // Stop speech
        this.stopSpeech();
        
        // Stop voice recognition
        this.stopVoiceRecognition();
        
        // Abort any ongoing generation
        this.generationAborted = true;
        if (this.currentStreamController) {
            this.currentStreamController.abort();
        }
        
        // Run cleanup callbacks
        this.cleanupCallbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                this.debug('Cleanup callback error:', error);
            }
        });
        this.cleanupCallbacks.length = 0;
        
        this.debug('Application cleaned up');
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Show preloader immediately
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.opacity = '1';
        preloader.style.visibility = 'visible';
    }
    
    // Initialize app
    window.khaiApp = new KHAIAssistant();
});

// Handle service worker updates
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
    });
}

// Handle online/offline events
window.addEventListener('online', () => {
    if (window.khaiApp) {
        window.khaiApp.updateConnectionStatus();
        window.khaiApp.showNotification('Подключение восстановлено', 'success');
    }
});

window.addEventListener('offline', () => {
    if (window.khaiApp) {
        window.khaiApp.updateConnectionStatus();
        window.khaiApp.showNotification('Отсутствует подключение к интернету', 'error');
    }
});

// Handle page visibility
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.khaiApp) {
        // Page is hidden, cleanup resources
        window.khaiApp.stopSpeech();
    }
});

// Error boundary for unhandled errors
window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error);
    
    if (window.khaiApp) {
        window.khaiApp.showNotification('Произошла непредвиденная ошибка', 'error');
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
    
    if (window.khaiApp) {
        window.khaiApp.showNotification('Ошибка выполнения операции', 'error');
    }
});
