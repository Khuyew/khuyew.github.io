class KHAIAssistant {
    constructor() {
        this.initializeElements();
        this.initializeState();
        this.setupMarked();
        this.init();
    }

    initializeElements() {
        // Основные элементы интерфейса
        this.messagesContainer = document.getElementById('messagesContainer');
        this.userInput = document.getElementById('userInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.clearInputBtn = document.getElementById('clearInputBtn');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        this.helpBtn = document.getElementById('helpBtn');
        this.generateImageBtn = document.getElementById('generateImageBtn');
        this.generateVoiceBtn = document.getElementById('generateVoiceBtn');
        this.normalModeBtn = document.getElementById('normalModeBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.modelSelectBtn = document.getElementById('modelSelectBtn');
        this.logo = document.getElementById('logoBtn');
        this.attachFileBtn = document.getElementById('attachFileBtn');
        this.voiceInputBtn = document.getElementById('voiceInputBtn');
        this.fileInput = document.getElementById('fileInput');
        this.attachedFiles = document.getElementById('attachedFiles');
        this.currentChatName = document.getElementById('currentChatName');
        this.inputSection = document.getElementById('inputSection');
        this.footerStatus = document.getElementById('footerStatus');
        this.exportChatBtn = document.getElementById('exportChatBtn');
        this.importChatBtn = document.getElementById('importChatBtn');
        this.continueResponseBtn = document.getElementById('continueResponseBtn');
        
        // Элементы навигации
        this.chatMinimap = document.getElementById('chatMinimap');
        this.minimapContent = document.getElementById('minimapContent');
        this.minimapViewport = document.getElementById('minimapViewport');
        this.scrollToLastAI = document.getElementById('scrollToLastAI');
        this.scrollToBottomBtn = document.getElementById('scrollToBottom');

        // Элементы поиска
        this.headerSearch = document.getElementById('headerSearch');
        this.headerSearchClear = document.getElementById('headerSearchClear');
        this.sidebarSearch = document.getElementById('sidebarSearch');
        this.sidebarSearchClear = document.getElementById('sidebarSearchClear');

        // Элементы меню
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebarMenu = document.getElementById('sidebarMenu');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.sidebarClose = document.getElementById('sidebarClose');
        this.chatList = document.getElementById('chatList');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.deleteAllChatsBtn = document.getElementById('deleteAllChatsBtn');
        this.sidebarStats = document.getElementById('sidebarStats');

        // Элементы модальных окон
        this.editChatModal = document.getElementById('editChatModal');
        this.editChatNameInput = document.getElementById('editChatNameInput');
        this.modalClearInput = document.getElementById('modalClearInput');
        this.editChatModalClose = document.getElementById('editChatModalClose');
        this.editChatModalCancel = document.getElementById('editChatModalCancel');
        this.editChatModalSave = document.getElementById('editChatModalSave');
        this.deleteAllChatsModal = document.getElementById('deleteAllChatsModal');
        this.deleteAllChatsModalClose = document.getElementById('deleteAllChatsModalClose');
        this.deleteAllChatsModalCancel = document.getElementById('deleteAllChatsModalCancel');
        this.deleteAllChatsModalConfirm = document.getElementById('deleteAllChatsModalConfirm');
        this.modelSelectModal = document.getElementById('modelSelectModal');
        this.modelList = document.getElementById('modelList');
        this.modelSelectModalClose = document.getElementById('modelSelectModalClose');
        this.modelSelectModalCancel = document.getElementById('modelSelectModalCancel');
        
        // Контекстное меню
        this.contextMenu = document.getElementById('messageContextMenu');
        
        this.editingChatId = null;
    }

    initializeState() {
        // Состояние приложения
        this.isProcessing = false;
        this.currentTheme = 'dark';
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
        this.currentSpeakButton = null;
        this.chatSessions = new Map();
        this.currentChatId = 'default';
        this.activeTypingIndicator = null;
        this.activeStreamingMessage = null;
        this.activeTimeouts = new Set();
        this.activeEventListeners = new Map();
        this.autoScrollEnabled = true;
        
        // Новые состояния для управления генерацией
        this.isGenerating = false;
        this.generationAborted = false;
        this.currentStreamController = null;
        this.lastUserMessage = null;
        
        // Состояния для навигации
        this.isAtBottom = true;
        this.isAtTop = false;
        this.lastAIMessageIndex = -1;
        this.scrollTimeout = null;
        this.isScrolling = false;
        this.scrollEndTimeout = null;
        this.isTouchScrolling = false;

        // Текущий режим работы (normal, image, voice)
        this.currentMode = 'normal';

        // Поиск
        this.searchTerm = '';
        this.sidebarSearchTerm = '';

        // Контекстное меню
        this.contextMenuTarget = null;

        // Аналитика
        this.usageStats = {
            totalMessages: 0,
            sessions: 0,
            lastActive: Date.now()
        };

        // Конфигурация
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
                description: 'Быстрая и эффективная модель для повседневных задач' 
            },
            'o3-mini': { 
                name: 'O3 Mini', 
                description: 'Продвинутая модель с улучшенными возможностями рассуждения' 
            },
            'claude-sonnet': { 
                name: 'Claude Sonnet', 
                description: 'Мощная модель от Anthropic для сложных задач и анализа' 
            },
            'deepseek-chat': { 
                name: 'DeepSeek Chat', 
                description: 'Универсальная модель для общения и решения задач' 
            },
            'deepseek-reasoner': { 
                name: 'DeepSeek Reasoner', 
                description: 'Специализированная модель для сложных логических рассуждений' 
            },
            'gemini-2.0-flash': { 
                name: 'Gemini 2.0 Flash', 
                description: 'Новейшая быстрая модель от Google с улучшенными возможностями' 
            },
            'gemini-1.5-flash': { 
                name: 'Gemini 1.5 Flash', 
                description: 'Быстрая и эффективная модель от Google для различных задач' 
            },
            'grok-beta': { 
                name: 'xAI Grok', 
                description: 'Модель от xAI с уникальным характером и остроумными ответами' 
            }
        };

        // Инициализация LiveInternet счетчика для сайдбара
        this.initializeLiveInternetCounter();
    }

    setupMarked() {
        marked.setOptions({
            highlight: (code, lang) => {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(code, { language: lang }).value;
                    } catch (err) {
                        console.warn(`Error highlighting ${lang}:`, err);
                    }
                }
                return hljs.highlightAuto(code).value;
            },
            langPrefix: 'hljs language-',
            breaks: true,
            gfm: true
        });
    }

    init() {
        try {
            this.bindEvents();
            this.setupAutoResize();
            this.setupVoiceRecognition();
            this.startPlaceholderAnimation();
            this.loadModelPreference();
            this.loadThemePreference();
            this.loadChatSessions();
            this.loadUsageStats();
            this.setupChatSelector();
            this.loadCurrentSession();
            this.setupScrollTracking();
            this.updateModeIndicator();
            this.setupSearch();
            this.setupMinimap();
            this.setupContextMenu();
            this.updateModelSelectButton();
            this.updateSidebarStats();
            
            this.showNotification('KHAI Assistant загружен и готов к работе!', 'success');
            this.updateFooterStatus('Готов к работе');
            
            // Трекинг использования
            this.trackUsage('app_loaded');
            
            // Автофокусировка на поле ввода
            this.setTimeout(() => {
                this.userInput.focus();
            }, 500);
            
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.showNotification('Ошибка загрузки приложения', 'error');
        }
    }

    initializeLiveInternetCounter() {
        // Инициализация счетчика для сайдбара
        this.setTimeout(() => {
            const sidebarCounter = document.getElementById('licntAFF9Sidebar');
            if (sidebarCounter) {
                sidebarCounter.src = "https://counter.yadro.ru/hit?t52.6;r" + 
                    escape(document.referrer) + ";s" + screen.width + "*" + screen.height + "*" +
                    (screen.colorDepth ? screen.colorDepth : screen.pixelDepth) + ";u" + 
                    escape(document.URL) + ";h" + escape(document.title.substring(0, 150)) + 
                    ";" + Math.random();
            }
        }, 1000);
    }

    bindEvents() {
        // Основные обработчики событий
        const events = [
            [this.sendBtn, 'click', () => this.handleSendButtonClick()],
            [this.userInput, 'keydown', (e) => this.handleInputKeydown(e)],
            [this.userInput, 'input', () => this.handleInputChange()],
            [this.clearInputBtn, 'click', () => this.clearInput()],
            [this.clearChatBtn, 'click', () => this.clearChat()],
            [this.helpBtn, 'click', () => this.showHelp()],
            [this.generateImageBtn, 'click', (e) => this.handleImageMode(e)],
            [this.generateVoiceBtn, 'click', () => this.toggleVoiceMode()],
            [this.normalModeBtn, 'click', () => this.setNormalMode()],
            [this.themeToggle, 'click', () => this.toggleTheme()],
            [this.modelSelectBtn, 'click', () => this.openModelSelectModal()],
            [this.logo, 'click', () => this.refreshPage()],
            [this.attachFileBtn, 'click', () => this.fileInput.click()],
            [this.fileInput, 'change', (e) => this.handleFileSelect(e)],
            [this.voiceInputBtn, 'click', () => this.toggleVoiceInput()],
            [this.menuToggle, 'click', () => this.toggleSidebar()],
            [this.sidebarClose, 'click', () => this.closeSidebar()],
            [this.sidebarOverlay, 'click', () => this.closeSidebar()],
            [this.newChatBtn, 'click', () => this.createNewChat()],
            [this.deleteAllChatsBtn, 'click', () => this.showDeleteAllChatsModal()],
            [this.exportChatBtn, 'click', () => this.exportChatSession()],
            [this.importChatBtn, 'click', () => this.importChatSession()],
            [this.continueResponseBtn, 'click', () => this.continueLastResponse()],
            [window, 'beforeunload', () => this.handleBeforeUnload()],
            [this.editChatModalClose, 'click', () => this.closeEditChatModal()],
            [this.editChatModalCancel, 'click', () => this.closeEditChatModal()],
            [this.editChatModalSave, 'click', () => this.saveChatName()],
            [this.editChatNameInput, 'keydown', (e) => {
                if (e.key === 'Enter') this.saveChatName();
                if (e.key === 'Escape') this.closeEditChatModal();
            }],
            [this.editChatNameInput, 'input', () => this.handleModalInputChange()],
            [this.modalClearInput, 'click', () => this.clearModalInput()],
            [this.deleteAllChatsModalClose, 'click', () => this.closeDeleteAllChatsModal()],
            [this.deleteAllChatsModalCancel, 'click', () => this.closeDeleteAllChatsModal()],
            [this.deleteAllChatsModalConfirm, 'click', () => this.deleteAllChats()],
            [this.scrollToLastAI, 'click', () => this.scrollToLastAIMessage()],
            [this.scrollToBottomBtn, 'click', () => this.scrollToBottom(true)],
            [this.messagesContainer, 'scroll', () => this.handleScroll()],
            [this.modelSelectModalClose, 'click', () => this.closeModelSelectModal()],
            [this.modelSelectModalCancel, 'click', () => this.closeModelSelectModal()],
            [this.modelSelectModal, 'click', (e) => {
                if (e.target === this.modelSelectModal) {
                    this.closeModelSelectModal();
                }
            }],
            [document, 'click', (e) => this.handleDocumentClick(e)],
            [document, 'contextmenu', (e) => this.handleDocumentContextMenu(e)],
            [this.messagesContainer, 'touchstart', () => this.handleTouchStart()],
            [this.messagesContainer, 'touchend', () => this.handleTouchEnd()]
        ];

        events.forEach(([element, event, handler]) => {
            this.addEventListener(element, event, handler);
        });
    }

    handleTouchStart() {
        this.isTouchScrolling = true;
        this.hideInterface();
    }

    handleTouchEnd() {
        this.isTouchScrolling = false;
        this.setTimeout(() => {
            if (!this.isTouchScrolling) {
                this.showInterface();
            }
        }, 300);
    }

    hideInterface() {
        const header = document.querySelector('.app-header');
        const footer = document.querySelector('.app-footer');
        const inputSection = this.inputSection;
        
        header.classList.add('hidden');
        footer.classList.add('hidden');
        inputSection.classList.add('hidden');
        this.messagesContainer.classList.add('full-width');
    }

    showInterface() {
        if (this.isTouchScrolling) return;
        
        const header = document.querySelector('.app-header');
        const footer = document.querySelector('.app-footer');
        const inputSection = this.inputSection;
        
        header.classList.remove('hidden');
        footer.classList.remove('hidden');
        inputSection.classList.remove('hidden');
        this.messagesContainer.classList.remove('full-width');
    }

    setupContextMenu() {
        // Обработчики для контекстного меню
        this.addEventListener(this.contextMenu, 'click', (e) => {
            const action = e.target.getAttribute('data-action');
            if (action && this.contextMenuTarget) {
                this.handleContextMenuAction(action, this.contextMenuTarget);
            }
            this.hideContextMenu();
        });

        // Скрытие контекстного меню при клике вне его
        this.addEventListener(document, 'click', (e) => {
            if (!this.contextMenu.contains(e.target)) {
                this.hideContextMenu();
            }
        });
    }

    handleDocumentContextMenu(e) {
        // Показ контекстного меню для сообщений ИИ
        const messageElement = e.target.closest('.message-ai');
        if (messageElement && !e.target.closest('.message-actions')) {
            e.preventDefault();
            this.showContextMenu(e, messageElement);
        }
    }

    showContextMenu(event, messageElement) {
        this.contextMenuTarget = messageElement;
        this.contextMenu.style.display = 'block';
        this.contextMenu.style.left = event.pageX + 'px';
        this.contextMenu.style.top = event.pageY + 'px';
    }

    hideContextMenu() {
        this.contextMenu.style.display = 'none';
        this.contextMenuTarget = null;
    }

    handleContextMenuAction(action, messageElement) {
        switch (action) {
            case 'copy':
                this.copyMessageText(messageElement);
                break;
            case 'speak':
                this.speakMessageText(messageElement);
                break;
            case 'continue':
                this.continueFromMessage(messageElement);
                break;
            case 'download':
                this.downloadMessageAsFile(messageElement);
                break;
        }
    }

    copyMessageText(messageElement) {
        const text = this.extractPlainText(messageElement.querySelector('.message-content').innerHTML);
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Текст скопирован в буфер обмена', 'success');
        });
    }

    speakMessageText(messageElement) {
        const text = this.extractPlainText(messageElement.querySelector('.message-content').innerHTML);
        const speakButton = messageElement.querySelector('.speak-btn');
        if (speakButton) {
            speakButton.click();
        } else {
            this.speakText(text);
        }
    }

    continueFromMessage(messageElement) {
        const lastMessage = this.conversationHistory[this.conversationHistory.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
            this.userInput.value = `Продолжи: "${lastMessage.content.substring(0, 100)}..."`;
            this.userInput.focus();
        }
    }

    downloadMessageAsFile(messageElement) {
        const text = this.extractPlainText(messageElement.querySelector('.message-content').innerHTML);
        const detectedLanguage = this.detectProgrammingLanguage(text);
        const extension = detectedLanguage ? detectedLanguage.extension : 'txt';
        this.downloadFile(text, extension);
    }

    setupSearch() {
        // Header search (search within current chat)
        this.addEventListener(this.headerSearch, 'input', (e) => {
            this.searchTerm = e.target.value.toLowerCase();
            this.headerSearchClear.style.display = this.searchTerm ? 'flex' : 'none';
            this.highlightSearchTerms();
        });
        
        this.addEventListener(this.headerSearchClear, 'click', () => {
            this.headerSearch.value = '';
            this.searchTerm = '';
            this.headerSearchClear.style.display = 'none';
            this.clearSearchHighlights();
        });
        
        // Sidebar search (search chat titles and content)
        this.addEventListener(this.sidebarSearch, 'input', (e) => {
            this.sidebarSearchTerm = e.target.value.toLowerCase();
            this.sidebarSearchClear.style.display = this.sidebarSearchTerm ? 'flex' : 'none';
            this.updateChatDropdown();
        });
        
        this.addEventListener(this.sidebarSearchClear, 'click', () => {
            this.sidebarSearch.value = '';
            this.sidebarSearchTerm = '';
            this.sidebarSearchClear.style.display = 'none';
            this.updateChatDropdown();
        });
    }

    highlightSearchTerms() {
        if (!this.searchTerm) {
            this.clearSearchHighlights();
            return;
        }
        
        const messages = this.messagesContainer.querySelectorAll('.message-content');
        messages.forEach(messageEl => {
            const content = messageEl.textContent || messageEl.innerText;
            const regex = new RegExp(`(${this.escapeRegex(this.searchTerm)})`, 'gi');
            const highlighted = content.replace(regex, '<mark class="search-highlight">$1</mark>');
            
            // Only update if there are changes to avoid unnecessary DOM updates
            if (messageEl.innerHTML !== highlighted) {
                messageEl.innerHTML = highlighted;
            }
        });
    }

    clearSearchHighlights() {
        const messages = this.messagesContainer.querySelectorAll('.message-content');
        messages.forEach(messageEl => {
            const content = messageEl.textContent || messageEl.innerText;
            if (messageEl.innerHTML !== content) {
                messageEl.innerHTML = content;
            }
        });
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    setupMinimap() {
        this.updateMinimap();
        this.addEventListener(this.chatMinimap, 'click', (e) => {
            const rect = this.chatMinimap.getBoundingClientRect();
            const clickY = e.clientY - rect.top;
            const percentage = clickY / rect.height;
            const targetScroll = percentage * this.messagesContainer.scrollHeight;
            this.messagesContainer.scrollTop = targetScroll - this.messagesContainer.clientHeight / 2;
        });
    }

    updateMinimap() {
        if (!this.messagesContainer.children.length) {
            this.minimapContent.innerHTML = '';
            return;
        }

        const messages = Array.from(this.messagesContainer.children);
        const totalHeight = this.messagesContainer.scrollHeight;
        const viewportHeight = this.messagesContainer.clientHeight;
        
        let minimapHTML = '';
        messages.forEach((message, index) => {
            const messageHeight = message.offsetHeight;
            const heightPercentage = (messageHeight / totalHeight) * 100;
            const isAI = message.classList.contains('message-ai');
            const isUser = message.classList.contains('message-user');
            
            let className = 'minimap-message';
            if (isAI) className += ' minimap-ai';
            if (isUser) className += ' minimap-user';
            if (message.classList.contains('typing-indicator')) className += ' minimap-typing';
            
            minimapHTML += `<div class="${className}" style="height: ${Math.max(heightPercentage, 1)}%"></div>`;
        });
        
        this.minimapContent.innerHTML = minimapHTML;
        
        // Update viewport indicator
        const scrollPercentage = (this.messagesContainer.scrollTop / (totalHeight - viewportHeight)) * 100;
        const viewportPercentage = (viewportHeight / totalHeight) * 100;
        this.minimapViewport.style.height = `${viewportPercentage}%`;
        this.minimapViewport.style.top = `${scrollPercentage}%`;
    }

    handleScroll() {
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
        
        this.isScrolling = true;
        this.hideInterface();
        
        this.scrollTimeout = this.setTimeout(() => {
            this.isScrolling = false;
            if (!this.isTouchScrolling) {
                this.showInterface();
            }
        }, 150);
        
        this.updateScrollState();
        this.updateMinimap();
        
        // Auto-hide scroll buttons
        const scrollTop = this.messagesContainer.scrollTop;
        const scrollHeight = this.messagesContainer.scrollHeight;
        const clientHeight = this.messagesContainer.clientHeight;
        
        this.isAtTop = scrollTop === 0;
        this.isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
        
        // Update navigation buttons visibility
        this.updateNavigationButtons();
    }

    updateNavigationButtons() {
        const scrollToBottom = document.getElementById('scrollToBottom');
        const scrollToLastAI = document.getElementById('scrollToLastAI');
        
        if (scrollToBottom) {
            scrollToBottom.style.opacity = this.isAtBottom ? '0.5' : '1';
        }
        if (scrollToLastAI) {
            scrollToLastAI.style.opacity = this.isAtTop ? '0.5' : '1';
        }
    }

    scrollToLastAIMessage() {
        const aiMessages = this.messagesContainer.querySelectorAll('.message-ai');
        if (aiMessages.length > 0) {
            const lastAIMessage = aiMessages[aiMessages.length - 1];
            lastAIMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    scrollToBottom(force = false) {
        if (force || this.autoScrollEnabled) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            this.isAtBottom = true;
            this.updateNavigationButtons();
        }
    }

    updateScrollState() {
        const scrollTop = this.messagesContainer.scrollTop;
        const scrollHeight = this.messagesContainer.scrollHeight;
        const clientHeight = this.messagesContainer.clientHeight;
        
        this.isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
        this.isAtTop = scrollTop === 0;
        
        this.updateNavigationButtons();
    }

    setupScrollTracking() {
        this.addEventListener(this.messagesContainer, 'scroll', () => {
            this.updateScrollState();
            this.updateMinimap();
        });
        
        // Initial state
        this.updateScrollState();
    }

    handleDocumentClick(e) {
        // Закрытие контекстного меню при клике вне его
        if (!this.contextMenu.contains(e.target)) {
            this.hideContextMenu();
        }
    }

    handleSendButtonClick() {
        if (this.isProcessing) {
            this.abortGeneration();
        } else {
            this.processUserInput();
        }
    }

    handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.processUserInput();
        }
    }

    handleInputChange() {
        const value = this.userInput.value.trim();
        this.clearInputBtn.style.display = value ? 'flex' : 'none';
        
        // Auto-resize
        this.userInput.style.height = 'auto';
        this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                this.showNotification('Файл слишком большой (максимум 10MB)', 'error');
                return;
            }
            
            if (file.type.startsWith('image/')) {
                this.addAttachedImage(file);
            } else {
                this.addAttachedFile(file);
            }
        });
        
        // Reset file input
        this.fileInput.value = '';
    }

    addAttachedImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = {
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result
            };
            this.attachedImages.push(imageData);
            this.updateAttachedFilesDisplay();
        };
        reader.readAsDataURL(file);
    }

    addAttachedFile(file) {
        const fileElement = document.createElement('div');
        fileElement.className = 'attached-file';
        fileElement.innerHTML = `
            <i class="ti ti-file-text"></i>
            <span class="file-name">${file.name}</span>
            <button class="file-remove" data-name="${file.name}">
                <i class="ti ti-x"></i>
            </button>
        `;
        
        this.attachedFiles.appendChild(fileElement);
        
        // Add remove event listener
        const removeBtn = fileElement.querySelector('.file-remove');
        this.addEventListener(removeBtn, 'click', () => {
            fileElement.remove();
        });
        
        this.attachedFiles.style.display = 'block';
    }

    updateAttachedFilesDisplay() {
        if (this.attachedImages.length === 0) {
            this.attachedFiles.style.display = 'none';
            return;
        }
        
        this.attachedFiles.innerHTML = '';
        this.attachedImages.forEach((image, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            fileElement.innerHTML = `
                <img src="${image.data}" alt="${image.name}" class="file-preview">
                <span class="file-name">${image.name}</span>
                <button class="file-remove" data-index="${index}">
                    <i class="ti ti-x"></i>
                </button>
            `;
            
            this.attachedFiles.appendChild(fileElement);
            
            // Add remove event listener
            const removeBtn = fileElement.querySelector('.file-remove');
            this.addEventListener(removeBtn, 'click', () => {
                this.attachedImages.splice(index, 1);
                this.updateAttachedFilesDisplay();
            });
        });
        
        this.attachedFiles.style.display = 'block';
    }

    clearInput() {
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        this.clearInputBtn.style.display = 'none';
        this.userInput.focus();
    }

    clearChat() {
        if (this.conversationHistory.length === 0) {
            return;
        }
        
        this.messagesContainer.innerHTML = '';
        this.conversationHistory = [];
        this.saveCurrentSession();
        this.updateMinimap();
        this.updateSidebarStats();
        this.showNotification('Чат очищен', 'success');
    }

    showHelp() {
        const helpMessage = `## 🤖 KHAI Assistant - Помощь

### Основные возможности:
- **Бесплатный доступ** - никаких скрытых платежей
- **Мультимодальность** - текст, голос, изображения (скоро)
- **Несколько моделей ИИ** - выбирайте под свою задачу
- **Локальное хранение** - ваши данные защищены

### Горячие клавиши:
- **Enter** - отправить сообщение
- **Shift + Enter** - новая строка
- **Ctrl + /** - очистить чат
- **Ctrl + M** - новый чат

### Советы:
1. Будьте конкретны в вопросах
2. Используйте контекстное меню (правый клик) для дополнительных действий
3. Экспортируйте важные беседы
4. Переключайтесь между моделями для лучших результатов

### Поддержка:
При возникновении проблем:
1. Обновите страницу
2. Проверьте подключение к интернету
3. Очистите кеш браузера при необходимости

**Версия:** 2.4 | **Разработано с ❤️ для сообщества**`;

        this.addMessage('assistant', helpMessage, true);
        this.showNotification('Справка загружена', 'info');
    }

    toggleVoiceMode() {
        this.isVoiceMode = !this.isVoiceMode;
        this.isImageMode = false;
        this.updateModeIndicator();
        
        if (this.isVoiceMode) {
            this.showNotification('Режим генерации голоса активирован', 'info');
        } else {
            this.showNotification('Режим генерации голоса выключен', 'info');
        }
    }

    handleImageMode(e) {
        if (this.generateImageBtn.disabled) {
            this.showNotification('Генерация изображений скоро будет доступна', 'info');
            return;
        }
        
        this.isImageMode = !this.isImageMode;
        this.isVoiceMode = false;
        this.updateModeIndicator();
        
        if (this.isImageMode) {
            this.showNotification('Режим генерации изображений активирован', 'info');
        } else {
            this.showNotification('Режим генерации изображений выключен', 'info');
        }
    }

    setNormalMode() {
        this.isImageMode = false;
        this.isVoiceMode = false;
        this.updateModeIndicator();
        this.showNotification('Обычный режим активирован', 'info');
    }

    updateModeIndicator() {
        // Update button states
        this.normalModeBtn.classList.toggle('active', !this.isImageMode && !this.isVoiceMode);
        this.generateVoiceBtn.classList.toggle('active', this.isVoiceMode);
        this.generateImageBtn.classList.toggle('active', this.isImageMode);
        
        // Update input placeholder based on mode
        if (this.isImageMode) {
            this.userInput.placeholder = 'Опишите изображение для генерации...';
        } else if (this.isVoiceMode) {
            this.userInput.placeholder = 'Введите текст для генерации голоса...';
        } else {
            this.startPlaceholderAnimation();
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('khai-theme', this.currentTheme);
        
        const icon = this.themeToggle.querySelector('i');
        icon.className = this.currentTheme === 'dark' ? 'ti ti-moon' : 'ti ti-sun';
        
        this.showNotification(`Тема изменена на ${this.currentTheme === 'dark' ? 'тёмную' : 'светлую'}`, 'success');
    }

    openModelSelectModal() {
        this.modelList.innerHTML = '';
        
        Object.entries(this.modelConfig).forEach(([key, config]) => {
            const modelElement = document.createElement('div');
            modelElement.className = `model-item ${key === this.currentModel ? 'selected' : ''}`;
            modelElement.innerHTML = `
                <div class="model-info">
                    <div class="model-name">${config.name}</div>
                    <div class="model-description">${config.description}</div>
                </div>
                <div class="model-check">
                    <i class="ti ti-check"></i>
                </div>
            `;
            
            this.addEventListener(modelElement, 'click', () => {
                this.selectModel(key);
                this.closeModelSelectModal();
            });
            
            this.modelList.appendChild(modelElement);
        });
        
        this.modelSelectModal.style.display = 'flex';
    }

    closeModelSelectModal() {
        this.modelSelectModal.style.display = 'none';
    }

    selectModel(modelKey) {
        if (this.modelConfig[modelKey]) {
            this.currentModel = modelKey;
            localStorage.setItem('khai-model', modelKey);
            this.updateModelSelectButton();
            this.showNotification(`Модель изменена на ${this.modelConfig[modelKey].name}`, 'success');
        }
    }

    updateModelSelectButton() {
        const modelConfig = this.modelConfig[this.currentModel];
        if (modelConfig) {
            const span = this.modelSelectBtn.querySelector('span');
            span.textContent = modelConfig.name;
        }
    }

    refreshPage() {
        if (confirm('Обновить страницу? Несохраненные данные могут быть потеряны.')) {
            location.reload();
        }
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            this.showNotification('Голосовой ввод не поддерживается в вашем браузере', 'error');
            return;
        }
        
        if (this.isListening) {
            this.stopVoiceInput();
        } else {
            this.startVoiceInput();
        }
    }

    startVoiceInput() {
        try {
            this.recognition.start();
            this.isListening = true;
            this.voiceInputBtn.classList.add('listening');
            this.showNotification('Слушаю... Говорите сейчас', 'info');
            this.updateFooterStatus('Слушаю...');
        } catch (error) {
            console.error('Ошибка запуска голосового ввода:', error);
            this.showNotification('Ошибка запуска голосового ввода', 'error');
        }
    }

    stopVoiceInput() {
        try {
            this.recognition.stop();
            this.isListening = false;
            this.voiceInputBtn.classList.remove('listening');
            this.updateFooterStatus('Готов к работе');
        } catch (error) {
            console.error('Ошибка остановки голосового ввода:', error);
        }
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
                this.voiceInputBtn.classList.add('listening');
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                this.voiceInputBtn.classList.remove('listening');
                this.updateFooterStatus('Готов к работе');
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
                    this.showNotification('Голосовой ввод завершен', 'success');
                } else if (interimTranscript) {
                    this.userInput.value = interimTranscript;
                    this.handleInputChange();
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Ошибка распознавания речи:', event.error);
                this.isListening = false;
                this.voiceInputBtn.classList.remove('listening');
                
                if (event.error !== 'no-speech') {
                    this.showNotification(`Ошибка распознавания: ${event.error}`, 'error');
                }
                
                this.updateFooterStatus('Готов к работе');
            };
        } else {
            console.warn('Голосовой ввод не поддерживается в этом браузере');
            this.voiceInputBtn.style.display = 'none';
        }
    }

    setupAutoResize() {
        this.userInput.style.height = 'auto';
        this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
    }

    startPlaceholderAnimation() {
        let currentIndex = 0;
        
        const animatePlaceholder = () => {
            this.userInput.placeholder = this.placeholderExamples[currentIndex];
            currentIndex = (currentIndex + 1) % this.placeholderExamples.length;
        };
        
        // Initial placeholder
        animatePlaceholder();
        
        // Change every 5 seconds
        this.setInterval(animatePlaceholder, 5000);
    }

    loadModelPreference() {
        const savedModel = localStorage.getItem('khai-model');
        if (savedModel && this.modelConfig[savedModel]) {
            this.currentModel = savedModel;
        }
    }

    loadThemePreference() {
        const savedTheme = localStorage.getItem('khai-theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
            document.body.setAttribute('data-theme', this.currentTheme);
            
            const icon = this.themeToggle.querySelector('i');
            icon.className = this.currentTheme === 'dark' ? 'ti ti-moon' : 'ti ti-sun';
        }
    }

    loadChatSessions() {
        try {
            const savedSessions = localStorage.getItem('khai-chat-sessions');
            if (savedSessions) {
                const sessions = JSON.parse(savedSessions);
                this.chatSessions = new Map(Object.entries(sessions));
            }
            
            // Ensure default chat exists
            if (!this.chatSessions.has('default')) {
                this.chatSessions.set('default', {
                    id: 'default',
                    name: 'Основной чат',
                    messages: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                });
            }
        } catch (error) {
            console.error('Ошибка загрузки сессий чата:', error);
            this.chatSessions = new Map([
                ['default', {
                    id: 'default',
                    name: 'Основной чат',
                    messages: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                }]
            ]);
        }
    }

    loadCurrentSession() {
        try {
            const session = this.chatSessions.get(this.currentChatId);
            if (session && session.messages) {
                this.conversationHistory = session.messages;
                this.currentChatName.textContent = session.name;
                
                // Clear and rebuild messages
                this.messagesContainer.innerHTML = '';
                this.conversationHistory.forEach(message => {
                    this.addMessage(message.role, message.content, false, true);
                });
                
                this.scrollToBottom(true);
                this.updateMinimap();
            }
        } catch (error) {
            console.error('Ошибка загрузки текущей сессии:', error);
            this.conversationHistory = [];
            this.messagesContainer.innerHTML = '';
        }
    }

    loadSession(chatId) {
        try {
            if (this.chatSessions.has(chatId)) {
                this.currentChatId = chatId;
                const session = this.chatSessions.get(chatId);
                this.conversationHistory = session.messages || [];
                this.currentChatName.textContent = session.name;
                
                // Clear and rebuild messages
                this.messagesContainer.innerHTML = '';
                this.conversationHistory.forEach(message => {
                    this.addMessage(message.role, message.content, false, true);
                });
                
                this.scrollToBottom(true);
                this.updateMinimap();
                this.updateSidebarStats();
                this.closeSidebar();
                
                this.showNotification(`Загружен чат: ${session.name}`, 'success');
            }
        } catch (error) {
            console.error('Ошибка загрузки сессии:', error);
            this.showNotification('Ошибка загрузки чата', 'error');
        }
    }

    saveCurrentSession() {
        try {
            const session = this.chatSessions.get(this.currentChatId) || {
                id: this.currentChatId,
                name: this.currentChatName.textContent,
                messages: [],
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            
            session.messages = this.conversationHistory;
            session.updatedAt = Date.now();
            
            this.chatSessions.set(this.currentChatId, session);
            
            // Save to localStorage
            const sessionsObject = Object.fromEntries(this.chatSessions);
            localStorage.setItem('khai-chat-sessions', JSON.stringify(sessionsObject));
            
            // Update sidebar
            this.updateChatDropdown();
        } catch (error) {
            console.error('Ошибка сохранения сессии:', error);
        }
    }

    setupChatSelector() {
        this.updateChatDropdown();
    }

    updateChatDropdown() {
        if (!this.chatList) return;
        
        const sortedSessions = Array.from(this.chatSessions.values())
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .filter(session => {
                if (!this.sidebarSearchTerm) return true;
                return session.name.toLowerCase().includes(this.sidebarSearchTerm);
            });
        
        this.chatList.innerHTML = '';
        
        if (sortedSessions.length === 0) {
            const emptyElement = document.createElement('div');
            emptyElement.className = 'chat-list-empty';
            emptyElement.textContent = this.sidebarSearchTerm ? 'Чаты не найдены' : 'Нет сохраненных чатов';
            this.chatList.appendChild(emptyElement);
            return;
        }
        
        sortedSessions.forEach(session => {
            const chatElement = document.createElement('div');
            chatElement.className = `chat-item ${session.id === this.currentChatId ? 'active' : ''}`;
            chatElement.innerHTML = `
                <div class="chat-item-content">
                    <div class="chat-item-name">${this.escapeHtml(session.name)}</div>
                    <div class="chat-item-meta">
                        <span class="chat-item-date">${this.formatDate(session.updatedAt)}</span>
                        <span class="chat-item-count">${session.messages.length} сообщ.</span>
                    </div>
                </div>
                <div class="chat-item-actions">
                    <button class="chat-action-btn edit-chat" title="Редактировать название">
                        <i class="ti ti-edit"></i>
                    </button>
                    <button class="chat-action-btn delete-chat" title="Удалить чат">
                        <i class="ti ti-trash"></i>
                    </button>
                </div>
            `;
            
            // Load chat
            this.addEventListener(chatElement, 'click', (e) => {
                if (!e.target.closest('.chat-item-actions')) {
                    this.loadSession(session.id);
                }
            });
            
            // Edit chat name
            const editBtn = chatElement.querySelector('.edit-chat');
            this.addEventListener(editBtn, 'click', (e) => {
                e.stopPropagation();
                this.openEditChatModal(session.id);
            });
            
            // Delete chat
            const deleteBtn = chatElement.querySelector('.delete-chat');
            this.addEventListener(deleteBtn, 'click', (e) => {
                e.stopPropagation();
                this.deleteChat(session.id);
            });
            
            this.chatList.appendChild(chatElement);
        });
    }

    openEditChatModal(chatId) {
        const session = this.chatSessions.get(chatId);
        if (session) {
            this.editingChatId = chatId;
            this.editChatNameInput.value = session.name;
            this.handleModalInputChange();
            this.editChatModal.style.display = 'flex';
            this.editChatNameInput.focus();
            this.editChatNameInput.select();
        }
    }

    closeEditChatModal() {
        this.editChatModal.style.display = 'none';
        this.editingChatId = null;
        this.editChatNameInput.value = '';
        this.modalClearInput.style.display = 'none';
    }

    handleModalInputChange() {
        const value = this.editChatNameInput.value.trim();
        this.modalClearInput.style.display = value ? 'flex' : 'none';
    }

    clearModalInput() {
        this.editChatNameInput.value = '';
        this.modalClearInput.style.display = 'none';
        this.editChatNameInput.focus();
    }

    saveChatName() {
        const newName = this.editChatNameInput.value.trim();
        if (!newName) {
            this.showNotification('Название чата не может быть пустым', 'error');
            return;
        }
        
        if (this.editingChatId) {
            const session = this.chatSessions.get(this.editingChatId);
            if (session) {
                session.name = newName;
                this.chatSessions.set(this.editingChatId, session);
                this.saveCurrentSession();
                
                if (this.editingChatId === this.currentChatId) {
                    this.currentChatName.textContent = newName;
                }
                
                this.showNotification('Название чата обновлено', 'success');
            }
        }
        
        this.closeEditChatModal();
    }

    deleteChat(chatId) {
        if (this.chatSessions.size <= 1) {
            this.showNotification('Нельзя удалить последний чат', 'error');
            return;
        }
        
        if (confirm('Вы уверены, что хотите удалить этот чат? Это действие нельзя отменить.')) {
            this.chatSessions.delete(chatId);
            
            if (chatId === this.currentChatId) {
                // Switch to another chat
                const remainingChats = Array.from(this.chatSessions.keys());
                const newChatId = remainingChats.find(id => id !== chatId) || 'default';
                this.loadSession(newChatId);
            }
            
            this.saveCurrentSession();
            this.showNotification('Чат удален', 'success');
        }
    }

    showDeleteAllChatsModal() {
        if (this.chatSessions.size === 0) {
            this.showNotification('Нет чатов для удаления', 'info');
            return;
        }
        
        this.deleteAllChatsModal.style.display = 'flex';
    }

    closeDeleteAllChatsModal() {
        this.deleteAllChatsModal.style.display = 'none';
    }

    deleteAllChats() {
        // Keep only the default chat
        const defaultSession = this.chatSessions.get('default') || {
            id: 'default',
            name: 'Основной чат',
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        this.chatSessions.clear();
        this.chatSessions.set('default', defaultSession);
        
        this.loadSession('default');
        this.saveCurrentSession();
        this.closeDeleteAllChatsModal();
        this.showNotification('Все чаты удалены', 'success');
    }

    createNewChat() {
        const newChatId = 'chat-' + Date.now();
        const newChatName = `Новый чат ${this.chatSessions.size + 1}`;
        
        const newSession = {
            id: newChatId,
            name: newChatName,
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        this.chatSessions.set(newChatId, newSession);
        this.saveCurrentSession();
        this.loadSession(newChatId);
        this.showNotification('Новый чат создан', 'success');
    }

    toggleSidebar() {
        this.sidebarMenu.classList.add('active');
        this.sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeSidebar() {
        this.sidebarMenu.classList.remove('active');
        this.sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    processUserInput() {
        const input = this.userInput.value.trim();
        
        if (!input && this.attachedImages.length === 0) {
            this.showNotification('Введите сообщение', 'warning');
            return;
        }
        
        if (this.isProcessing) {
            this.abortGeneration();
            return;
        }
        
        this.lastUserMessage = input;
        
        // Clear input and attached files
        this.clearInput();
        this.attachedImages = [];
        this.updateAttachedFilesDisplay();
        
        // Add user message
        this.addMessage('user', input);
        this.saveCurrentSession();
        
        // Process based on mode
        if (this.isImageMode) {
            this.generateImage(input);
        } else if (this.isVoiceMode) {
            this.generateVoice(input);
        } else {
            this.generateResponse(input);
        }
        
        this.trackUsage('message_sent');
    }

    async generateResponse(userMessage) {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        this.generationAborted = false;
        this.updateSendButton();
        this.updateFooterStatus('Генерация ответа...');
        
        try {
            // Add typing indicator
            this.showTypingIndicator();
            
            // Prepare conversation history
            const messages = this.prepareConversationHistory(userMessage);
            
            // Generate response using Puter AI
            const response = await puter.ai.chat.completions.create({
                messages: messages,
                model: this.currentModel,
                stream: true
            });
            
            // Create message element for streaming
            const messageId = 'msg-' + Date.now();
            const messageElement = this.createMessageElement('assistant', '', messageId);
            const messageContent = messageElement.querySelector('.message-content');
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Add message to container
            this.messagesContainer.appendChild(messageElement);
            this.activeStreamingMessage = messageElement;
            
            // Stream the response
            let fullResponse = '';
            for await (const chunk of response) {
                if (this.generationAborted) {
                    break;
                }
                
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    fullResponse += content;
                    
                    // Update message content with proper formatting
                    const formattedContent = await this.formatMessageContent(fullResponse);
                    messageContent.innerHTML = formattedContent;
                    
                    // Auto-scroll if at bottom
                    if (this.autoScrollEnabled) {
                        this.scrollToBottom();
                    }
                }
            }
            
            // Finalize message
            if (!this.generationAborted) {
                const finalFormattedContent = await this.formatMessageContent(fullResponse);
                messageContent.innerHTML = finalFormattedContent;
                
                // Add to conversation history
                this.conversationHistory.push({
                    role: 'assistant',
                    content: fullResponse
                });
                
                this.saveCurrentSession();
                this.updateSidebarStats();
                this.showNotification('Ответ сгенерирован', 'success');
            } else {
                // Remove aborted message
                messageElement.remove();
            }
            
        } catch (error) {
            console.error('Ошибка генерации ответа:', error);
            this.hideTypingIndicator();
            
            if (!this.generationAborted) {
                this.showNotification('Ошибка генерации ответа', 'error');
                this.addMessage('assistant', 'Извините, произошла ошибка при генерации ответа. Пожалуйста, попробуйте еще раз.');
            }
        } finally {
            this.isProcessing = false;
            this.generationAborted = false;
            this.activeStreamingMessage = null;
            this.updateSendButton();
            this.updateFooterStatus('Готов к работе');
            this.updateMinimap();
        }
    }

    prepareConversationHistory(userMessage) {
        const messages = [];
        
        // Add system message
        messages.push({
            role: 'system',
            content: `Ты полезный AI-ассистент KHAI. Будь вежливым, полезным и точным в ответах. 
                     Отвечай на русском языке, если пользователь пишет на русском.
                     Форматируй ответы с использованием Markdown для лучшей читаемости.
                     Будь краток, но информативен.`
        });
        
        // Add conversation history (last 10 messages for context)
        const recentHistory = this.conversationHistory.slice(-10);
        recentHistory.forEach(msg => {
            messages.push({
                role: msg.role,
                content: msg.content
            });
        });
        
        // Add current user message
        messages.push({
            role: 'user',
            content: userMessage
        });
        
        return messages;
    }

    async formatMessageContent(content) {
        try {
            // Convert markdown to HTML
            const html = await marked.parse(content);
            
            // Apply syntax highlighting
            this.setTimeout(() => {
                const codeBlocks = this.messagesContainer.querySelectorAll('pre code');
                codeBlocks.forEach(block => {
                    hljs.highlightElement(block);
                });
            }, 0);
            
            return html;
        } catch (error) {
            console.error('Ошибка форматирования сообщения:', error);
            return this.escapeHtml(content);
        }
    }

    showTypingIndicator() {
        if (this.activeTypingIndicator) {
            this.activeTypingIndicator.remove();
        }
        
        const indicator = document.createElement('div');
        indicator.className = 'message message-ai typing-indicator';
        indicator.innerHTML = `
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
        `;
        
        this.messagesContainer.appendChild(indicator);
        this.activeTypingIndicator = indicator;
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        if (this.activeTypingIndicator) {
            this.activeTypingIndicator.remove();
            this.activeTypingIndicator = null;
        }
    }

    abortGeneration() {
        if (this.isProcessing) {
            this.generationAborted = true;
            this.isProcessing = false;
            
            if (this.currentStreamController) {
                this.currentStreamController.abort();
                this.currentStreamController = null;
            }
            
            this.hideTypingIndicator();
            this.updateSendButton();
            this.updateFooterStatus('Генерация прервана');
            this.showNotification('Генерация прервана', 'warning');
            
            this.setTimeout(() => {
                this.updateFooterStatus('Готов к работе');
            }, 2000);
        }
    }

    updateSendButton() {
        const icon = this.sendBtn.querySelector('i');
        if (this.isProcessing) {
            icon.className = 'ti ti-square';
            this.sendBtn.title = 'Остановить генерацию';
        } else {
            icon.className = 'ti ti-send';
            this.sendBtn.title = 'Отправить сообщение';
        }
    }

    addMessage(role, content, isHelp = false, isHistory = false) {
        const messageId = 'msg-' + Date.now();
        const messageElement = this.createMessageElement(role, content, messageId, isHelp);
        
        if (!isHistory) {
            this.messagesContainer.appendChild(messageElement);
            
            // Add to conversation history
            this.conversationHistory.push({
                role: role,
                content: content
            });
            
            // Auto-scroll to bottom for new messages
            if (!isHistory) {
                this.scrollToBottom();
            }
            
            // Save session
            if (!isHelp) {
                this.saveCurrentSession();
            }
        } else {
            this.messagesContainer.appendChild(messageElement);
        }
        
        this.updateMinimap();
        return messageElement;
    }

    createMessageElement(role, content, messageId, isHelp = false) {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${role} ${isHelp ? 'help-message' : ''}`;
        messageElement.id = messageId;
        
        const avatarIcon = role === 'user' ? 'ti ti-user' : 'ti ti-robot';
        const avatarClass = role === 'user' ? 'user-avatar' : 'ai-avatar';
        
        messageElement.innerHTML = `
            <div class="message-avatar ${avatarClass}">
                <i class="${avatarIcon}"></i>
            </div>
            <div class="message-content-wrapper">
                <div class="message-content">${content}</div>
                ${role === 'assistant' && !isHelp ? `
                    <div class="message-actions">
                        <button class="message-action-btn copy-btn" title="Копировать текст">
                            <i class="ti ti-copy"></i>
                        </button>
                        <button class="message-action-btn speak-btn" title="Озвучить текст">
                            <i class="ti ti-volume"></i>
                        </button>
                        <button class="message-action-btn continue-btn" title="Продолжить ответ">
                            <i class="ti ti-player-track-next"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Add event listeners for action buttons
        if (role === 'assistant' && !isHelp) {
            const copyBtn = messageElement.querySelector('.copy-btn');
            const speakBtn = messageElement.querySelector('.speak-btn');
            const continueBtn = messageElement.querySelector('.continue-btn');
            
            this.addEventListener(copyBtn, 'click', () => {
                this.copyMessageText(messageElement);
            });
            
            this.addEventListener(speakBtn, 'click', () => {
                this.toggleSpeech(messageElement, speakBtn);
            });
            
            this.addEventListener(continueBtn, 'click', () => {
                this.continueResponse(messageElement);
            });
        }
        
        return messageElement;
    }

    copyMessageText(messageElement) {
        const content = messageElement.querySelector('.message-content');
        const text = this.extractPlainText(content.innerHTML);
        
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Текст скопирован в буфер обмена', 'success');
        }).catch(err => {
            console.error('Ошибка копирования:', err);
            this.showNotification('Ошибка копирования', 'error');
        });
    }

    toggleSpeech(messageElement, button) {
        const content = messageElement.querySelector('.message-content');
        const text = this.extractPlainText(content.innerHTML);
        
        if (this.isSpeaking && this.currentSpeakButton === button) {
            this.stopSpeech();
        } else {
            if (this.isSpeaking) {
                this.stopSpeech();
            }
            this.speakText(text, button);
        }
    }

    speakText(text, button = null) {
        if ('speechSynthesis' in window) {
            this.stopSpeech(); // Stop any ongoing speech
            
            this.currentUtterance = new SpeechSynthesisUtterance(text);
            this.currentUtterance.lang = 'ru-RU';
            this.currentUtterance.rate = 1.0;
            this.currentUtterance.pitch = 1.0;
            this.currentUtterance.volume = 0.8;
            
            this.currentSpeakButton = button;
            this.isSpeaking = true;
            
            if (button) {
                button.classList.add('speaking');
                button.innerHTML = '<i class="ti ti-square"></i>';
            }
            
            this.currentUtterance.onend = () => {
                this.isSpeaking = false;
                this.currentUtterance = null;
                if (button) {
                    button.classList.remove('speaking');
                    button.innerHTML = '<i class="ti ti-volume"></i>';
                }
            };
            
            this.currentUtterance.onerror = (event) => {
                console.error('Ошибка синтеза речи:', event);
                this.isSpeaking = false;
                this.currentUtterance = null;
                if (button) {
                    button.classList.remove('speaking');
                    button.innerHTML = '<i class="ti ti-volume"></i>';
                }
                this.showNotification('Ошибка озвучивания текста', 'error');
            };
            
            speechSynthesis.speak(this.currentUtterance);
            this.showNotification('Озвучивание текста...', 'info');
        } else {
            this.showNotification('Синтез речи не поддерживается в вашем браузере', 'error');
        }
    }

    stopSpeech() {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
            this.isSpeaking = false;
            this.currentUtterance = null;
            
            if (this.currentSpeakButton) {
                this.currentSpeakButton.classList.remove('speaking');
                this.currentSpeakButton.innerHTML = '<i class="ti ti-volume"></i>';
                this.currentSpeakButton = null;
            }
        }
    }

    continueResponse(messageElement) {
        const content = messageElement.querySelector('.message-content');
        const text = this.extractPlainText(content.innerHTML);
        
        this.userInput.value = `Продолжи: "${text.substring(0, 100)}..."`;
        this.userInput.focus();
        this.handleInputChange();
        
        this.showNotification('Готово к продолжению ответа', 'info');
    }

    continueLastResponse() {
        const lastMessage = this.conversationHistory[this.conversationHistory.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
            this.userInput.value = `Продолжи: "${lastMessage.content.substring(0, 100)}..."`;
            this.userInput.focus();
            this.handleInputChange();
            this.showNotification('Готово к продолжению ответа', 'info');
        } else {
            this.showNotification('Нет предыдущего ответа для продолжения', 'warning');
        }
    }

    extractPlainText(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }

    generateImage(prompt) {
        this.showNotification('Генерация изображений скоро будет доступна', 'info');
        // TODO: Implement image generation
    }

    generateVoice(text) {
        this.showNotification('Генерация голоса скоро будет доступна', 'info');
        // TODO: Implement voice generation
    }

    exportChatSession() {
        try {
            const session = this.chatSessions.get(this.currentChatId);
            if (!session || session.messages.length === 0) {
                this.showNotification('Нет сообщений для экспорта', 'warning');
                return;
            }
            
            const exportData = {
                version: '2.4',
                exportedAt: new Date().toISOString(),
                chat: session
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `khai-chat-${session.name}-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Чат экспортирован', 'success');
            this.trackUsage('chat_exported');
        } catch (error) {
            console.error('Ошибка экспорта чата:', error);
            this.showNotification('Ошибка экспорта чата', 'error');
        }
    }

    importChatSession() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importData = JSON.parse(event.target.result);
                    
                    // Validate import data
                    if (!importData.chat || !importData.chat.messages) {
                        throw new Error('Неверный формат файла');
                    }
                    
                    const chatId = 'imported-' + Date.now();
                    const chatName = importData.chat.name || 'Импортированный чат';
                    
                    const importedSession = {
                        id: chatId,
                        name: chatName,
                        messages: importData.chat.messages,
                        createdAt: importData.chat.createdAt || Date.now(),
                        updatedAt: Date.now()
                    };
                    
                    this.chatSessions.set(chatId, importedSession);
                    this.saveCurrentSession();
                    this.loadSession(chatId);
                    
                    this.showNotification('Чат успешно импортирован', 'success');
                    this.trackUsage('chat_imported');
                } catch (error) {
                    console.error('Ошибка импорта чата:', error);
                    this.showNotification('Ошибка импорта чата: неверный формат файла', 'error');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    loadUsageStats() {
        try {
            const savedStats = localStorage.getItem('khai-usage-stats');
            if (savedStats) {
                this.usageStats = { ...this.usageStats, ...JSON.parse(savedStats) };
            }
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        }
    }

    saveUsageStats() {
        try {
            this.usageStats.lastActive = Date.now();
            localStorage.setItem('khai-usage-stats', JSON.stringify(this.usageStats));
        } catch (error) {
            console.error('Ошибка сохранения статистики:', error);
        }
    }

    trackUsage(action) {
        this.usageStats.totalMessages++;
        
        if (action === 'app_loaded') {
            this.usageStats.sessions++;
        }
        
        this.saveUsageStats();
        this.updateSidebarStats();
    }

    updateSidebarStats() {
        if (this.sidebarStats) {
            const totalMessages = this.conversationHistory.length;
            const totalSessions = this.chatSessions.size;
            
            this.sidebarStats.textContent = 
                `${totalMessages} сообщ. в ${totalSessions} чатах`;
        }
    }

    updateFooterStatus(status) {
        if (this.footerStatus) {
            this.footerStatus.textContent = status;
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });
        
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
        
        // Add event listener for close button
        const closeBtn = notification.querySelector('.notification-close');
        this.addEventListener(closeBtn, 'click', () => {
            notification.remove();
        });
        
        // Auto-remove after 5 seconds
        this.setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'circle-check';
            case 'error': return 'alert-circle';
            case 'warning': return 'alert-triangle';
            case 'info': return 'info-circle';
            default: return 'info-circle';
        }
    }

    handleBeforeUnload() {
        this.saveCurrentSession();
        this.saveUsageStats();
    }

    // Utility methods
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60 * 1000) {
            return 'только что';
        } else if (diff < 60 * 60 * 1000) {
            const minutes = Math.floor(diff / (60 * 1000));
            return `${minutes} мин. назад`;
        } else if (diff < 24 * 60 * 60 * 1000) {
            const hours = Math.floor(diff / (60 * 60 * 1000));
            return `${hours} ч. назад`;
        } else {
            return date.toLocaleDateString('ru-RU');
        }
    }

    detectProgrammingLanguage(text) {
        const languagePatterns = {
            javascript: { extensions: ['js'], patterns: [/function\s+\w+\s*\(/, /const\s+\w+\s*=/, /let\s+\w+\s*=/] },
            python: { extensions: ['py'], patterns: [/def\s+\w+\s*\(/, /import\s+\w+/, /print\s*\(/] },
            java: { extensions: ['java'], patterns: [/public\s+class\s+\w+/, /System\.out\.println/] },
            cpp: { extensions: ['cpp', 'cc'], patterns: [/#include\s*<iostream>/, /std::cout/] },
            html: { extensions: ['html'], patterns: [/<html>/, /<div>/, /<p>/] },
            css: { extensions: ['css'], patterns: [/\.\w+\s*\{/, /#\w+\s*\{/] },
            php: { extensions: ['php'], patterns: [/<\?php/, /\$\w+\s*=/] },
            sql: { extensions: ['sql'], patterns: [/SELECT\s+.+FROM/, /INSERT\s+INTO/] }
        };
        
        for (const [lang, config] of Object.entries(languagePatterns)) {
            for (const pattern of config.patterns) {
                if (pattern.test(text)) {
                    return { language: lang, extension: config.extensions[0] };
                }
            }
        }
        
        return null;
    }

    downloadFile(content, extension = 'txt') {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khai-${Date.now()}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Event listener management
    addEventListener(element, event, handler) {
        if (!element) return;
        
        element.addEventListener(event, handler);
        
        const key = `${event}-${handler.toString().slice(0, 50)}`;
        if (!this.activeEventListeners.has(key)) {
            this.activeEventListeners.set(key, { element, event, handler });
        }
    }

    // Timeout management
    setTimeout(callback, delay) {
        const timeoutId = setTimeout(() => {
            callback();
            this.activeTimeouts.delete(timeoutId);
        }, delay);
        
        this.activeTimeouts.add(timeoutId);
        return timeoutId;
    }

    setInterval(callback, interval) {
        const intervalId = setInterval(callback, interval);
        this.activeTimeouts.add(intervalId);
        return intervalId;
    }

    clearAllTimeouts() {
        this.activeTimeouts.forEach(timeoutId => {
            clearTimeout(timeoutId);
            clearInterval(timeoutId);
        });
        this.activeTimeouts.clear();
    }

    // Cleanup method
    destroy() {
        this.clearAllTimeouts();
        this.stopSpeech();
        this.abortGeneration();
        this.saveCurrentSession();
        this.saveUsageStats();
        
        // Remove event listeners
        this.activeEventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.activeEventListeners.clear();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.khaiAssistant = new KHAIAssistant();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.khaiAssistant) {
        window.khaiAssistant.destroy();
    }
});
