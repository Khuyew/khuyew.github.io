// KHAI Assistant - Основной JavaScript файл
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
        this.themeToggle = document.getElementById('themeToggle');
        this.logo = document.getElementById('logoBtn');
        this.attachFileBtn = document.getElementById('attachFileBtn');
        this.voiceInputBtn = document.getElementById('voiceInputBtn');
        this.fileInput = document.getElementById('fileInput');
        this.attachedFiles = document.getElementById('attachedFiles');
        this.currentChatName = document.getElementById('currentChatName');
        this.inputSection = document.getElementById('inputSection');
        
        // Элементы навигации
        this.scrollToLastAI = document.getElementById('scrollToLastAI');
        this.scrollToBottomBtn = document.getElementById('scrollToBottom');
        this.chatMinimap = document.getElementById('chatMinimap');
        this.minimapContent = document.getElementById('minimapContent');
        this.minimapViewport = document.getElementById('minimapViewport');

        // Элементы меню
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebarMenu = document.getElementById('sidebarMenu');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.sidebarClose = document.getElementById('sidebarClose');
        this.chatList = document.getElementById('chatList');
        this.newChatBtn = document.getElementById('newChatBtn');

        // Поиск
        this.headerSearch = document.getElementById('headerSearch');
        this.headerSearchClear = document.getElementById('headerSearchClear');

        // Режимы
        this.normalModeBtn = document.getElementById('normalModeBtn');

        // Модальные окна
        this.editChatModal = document.getElementById('editChatModal');
        this.editChatNameInput = document.getElementById('editChatNameInput');
        this.modalClearInput = document.getElementById('modalClearInput');
        this.editChatModalClose = document.getElementById('editChatModalClose');
        this.editChatModalCancel = document.getElementById('editChatModalCancel');
        this.editChatModalSave = document.getElementById('editChatModalSave');
        this.editingChatId = null;

        // Элементы управления моделями
        this.modelSelectBtn = document.getElementById('modelSelectBtn');
        this.themeMinimapToggle = document.getElementById('themeMinimapToggle');
        this.footerHelpBtn = document.getElementById('footerHelpBtn');
        this.footerClearChatBtn = document.getElementById('footerClearChatBtn');
        this.footerDownloadBtn = document.getElementById('footerDownloadBtn');
        this.modelModalOverlay = document.getElementById('modelModalOverlay');
        this.modelModalClose = document.getElementById('modelModalClose');
        this.modelModalCancel = document.getElementById('modelModalCancel');
        this.modelModalConfirm = document.getElementById('modelModalConfirm');
        this.modelList = document.querySelector('.model-list');
        
        // Элементы сайдбара
        this.sidebarSearch = document.getElementById('sidebarSearch');
        this.currentModelInfo = document.getElementById('currentModelInfo');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.importChatBtn = document.getElementById('importChatBtn');
        
        // Footer
        this.footerStatus = document.getElementById('footerStatus');
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
        this.currentModel = 'gpt-4-turbo';
        this.currentAudio = null;
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.chatSessions = new Map();
        this.currentChatId = 'default';
        this.activeTypingIndicator = null;
        this.activeStreamingMessage = null;
        this.activeTimeouts = new Set();
        this.activeEventListeners = new Map();
        this.autoScrollEnabled = true;
        
        // Состояния для генерации
        this.isGenerating = false;
        this.generationAborted = false;
        this.currentStreamController = null;
        this.lastUserMessage = null;
        
        // Состояния для навигации
        this.isAtBottom = true;
        this.isAtTop = false;
        this.lastAIMessageIndex = -1;

        // Конфигурация
        this.placeholderExamples = [
            "Расскажи о возможностях искусственного интеллекта...",
            "Напиши код для сортировки массива на Python...",
            "Объясни теорию относительности простыми словами...",
            "Какие есть способы улучшить производительность веб-сайта?",
            "Создай описание для приложения на основе ИИ..."
        ];

        this.modelConfig = {
            'gpt-4-turbo': { 
                name: 'GPT-4 Turbo', 
                description: 'Самая продвинутая модель для сложных задач',
                maxTokens: 128000
            },
            'gpt-3.5-turbo': { 
                name: 'GPT-3.5 Turbo', 
                description: 'Быстрая и эффективная модель для повседневных задач',
                maxTokens: 16384
            },
            'claude-2': { 
                name: 'Claude 2', 
                description: 'Мощная модель для анализа и рассуждений',
                maxTokens: 100000
            },
            'gemini-pro': { 
                name: 'Gemini Pro', 
                description: 'Универсальная модель от Google',
                maxTokens: 32768
            }
        };

        // Ограничения
        this.MAX_FILES = 3;
        this.MAX_MESSAGE_LENGTH = 4000;
        this.MAX_CHAT_NAME_LENGTH = 50;
        this.CONVERSATION_HISTORY_LIMIT = 30;
        this.MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
        this.TYPING_SPEED = 10; // ms per character for streaming
    }

    setupMarked() {
        const renderer = new marked.Renderer();
        
        // Кастомный рендерер для улучшения безопасности
        renderer.link = (href, title, text) => {
            if (href.startsWith('javascript:')) {
                return text;
            }
            return `<a href="${href}" title="${title || ''}" target="_blank" rel="noopener noreferrer">${text}</a>`;
        };

        marked.setOptions({
            renderer: renderer,
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
            this.updateDocumentTitle();
            this.updateConnectionStatus();
            this.setupPWA();
            
            console.log('KHAI Assistant успешно загружен');
            this.showNotification('KHAI Assistant загружен и готов к работе!', 'success');
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.showNotification('Ошибка загрузки приложения', 'error');
        }
    }

    setupPWA() {
        // Регистрация Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker зарегистрирован:', registration);
                })
                .catch(error => {
                    console.log('Ошибка регистрации Service Worker:', error);
                });
        }

        // Обработка установки PWA
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Показать кнопку установки
            this.showInstallPrompt();
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA успешно установлен');
            this.showNotification('Приложение успешно установлено!', 'success');
        });
    }

    showInstallPrompt() {
        // Можно добавить кастомную кнопку установки
        const installBtn = document.createElement('button');
        installBtn.className = 'action-btn install-btn';
        installBtn.innerHTML = '<i class="ti ti-download"></i> Установить приложение';
        installBtn.onclick = () => this.installPWA();
        
        // Добавить кнопку в интерфейс
        const actionButtons = document.querySelector('.action-buttons');
        if (actionButtons) {
            actionButtons.appendChild(installBtn);
        }
    }

    async installPWA() {
        if (window.deferredPrompt) {
            window.deferredPrompt.prompt();
            const { outcome } = await window.deferredPrompt.userChoice;
            
            if (outcome === 'accepted') {
                console.log('Пользователь принял установку PWA');
            }
            
            window.deferredPrompt = null;
        }
    }

    updateDocumentTitle() {
        const session = this.chatSessions.get(this.currentChatId);
        const chatName = session ? session.name : 'Основной чат';
        document.title = `${chatName} - KHAI Assistant`;
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
            [this.scrollToLastAI, 'click', () => this.scrollToLastAIMessage()],
            [this.scrollToBottomBtn, 'click', () => this.scrollToBottom(true)],
            [this.messagesContainer, 'scroll', () => this.handleScroll()],
            [this.headerSearch, 'input', () => this.handleSearchInput()],
            [this.headerSearchClear, 'click', () => this.clearSearch()],
            [this.normalModeBtn, 'click', () => this.setMode('normal')],

            // Обработчики для дополнительных элементов
            [this.modelSelectBtn, 'click', () => this.openModelModal()],
            [this.themeMinimapToggle, 'click', () => this.toggleTheme()],
            [this.footerHelpBtn, 'click', () => this.showHelp()],
            [this.footerClearChatBtn, 'click', () => this.clearChat()],
            [this.footerDownloadBtn, 'click', () => this.downloadHistory()],
            [this.modelModalClose, 'click', () => this.closeModelModal()],
            [this.modelModalCancel, 'click', () => this.closeModelModal()],
            [this.modelModalConfirm, 'click', () => this.confirmModelSelection()],
            [this.modelModalOverlay, 'click', (e) => {
                if (e.target === this.modelModalOverlay) this.closeModelModal();
            }],
            [this.modelList, 'click', (e) => this.handleModelItemClick(e)],
            [this.sidebarSearch, 'input', () => this.filterChatHistory()],
            [this.importChatBtn, 'click', () => this.importChatHistory()],
            [document, 'keydown', (e) => this.handleGlobalKeydown(e)],

            // Обработчики для PWA
            [window, 'online', () => this.handleOnlineStatus()],
            [window, 'offline', () => this.handleOfflineStatus()],

            // Обработчики для touch-устройств
            [this.userInput, 'touchstart', (e) => this.handleTouchStart(e)],
            [this.userInput, 'touchend', (e) => this.handleTouchEnd(e)]
        ];

        events.forEach(([element, event, handler]) => {
            this.addEventListener(element, event, handler);
        });
    }

    handleTouchStart(e) {
        // Предотвращаем масштабирование при двойном тапе на текстовое поле
        if (e.target === this.userInput) {
            document.body.style.zoom = "1";
        }
    }

    handleTouchEnd(e) {
        // Восстанавливаем стандартное поведение масштабирования
        if (e.target === this.userInput) {
            document.body.style.zoom = "";
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
        
        if (this.footerStatus) {
            this.footerStatus.textContent = online ? 'Готов к работе' : 'Офлайн режим';
        }
    }

    setupScrollTracking() {
        this.updateNavigationButtons();
        this.handleScroll(); // Initial check
    }

    handleScroll() {
        if (!this.messagesContainer) return;
        
        const container = this.messagesContainer;
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        
        // Определяем, находится ли пользователь внизу
        this.isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
        
        // Определяем, находится ли пользователь вверху
        this.isAtTop = scrollTop < 50;
        
        // Обновляем кнопки навигации
        this.updateNavigationButtons();
        
        // Обновляем мини-карту
        this.updateMinimapViewport();
        
        // Включаем автоскролл только если пользователь находится внизу
        this.autoScrollEnabled = this.isAtBottom;
    }

    updateNavigationButtons() {
        const aiMessages = this.messagesContainer.querySelectorAll('.message-ai:not(.typing-indicator)');
        const hasAIMessages = aiMessages.length > 0;
        
        // Обновляем кнопку "к последнему AI"
        if (this.scrollToLastAI) {
            this.scrollToLastAI.classList.toggle('active', !this.isAtBottom && hasAIMessages);
            this.scrollToLastAI.disabled = !hasAIMessages;
        }
        
        // Обновляем кнопку "вниз"
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

    handleSendButtonClick() {
        if (this.isGenerating) {
            this.stopGeneration();
        } else {
            this.sendMessage();
        }
    }

    handleInputChange() {
        const hasInput = this.userInput.value.trim().length > 0 || this.attachedImages.length > 0;
        
        if (this.isGenerating && hasInput) {
            this.updateSendButton(false);
        }
        
        this.clearInputBtn.style.display = this.userInput.value ? 'flex' : 'none';
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
            this.userInput.placeholder = this.getCurrentPlaceholder();
        }
    }

    getCurrentPlaceholder() {
        if (this.isImageMode) {
            return 'Опишите изображение, которое хотите сгенерировать...';
        } else if (this.isVoiceMode) {
            return 'Введите текст для генерации голоса...';
        } else {
            return 'Задайте вопрос или опишите изображение...';
        }
    }

    handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (this.isGenerating) {
                this.stopGeneration();
            } else {
                this.sendMessage();
            }
        }
        
        // Ctrl + / для помощи
        if (e.key === '/' && e.ctrlKey) {
            e.preventDefault();
            this.showHelp();
        }
        
        // Ctrl + K для очистки
        if (e.key === 'k' && e.ctrlKey) {
            e.preventDefault();
            this.clearChat();
        }
        
        // Ctrl + N для нового чата
        if (e.key === 'n' && e.ctrlKey) {
            e.preventDefault();
            this.createNewChat();
        }
        
        // Ctrl + M для меню
        if (e.key === 'm' && e.ctrlKey) {
            e.preventDefault();
            this.toggleSidebar();
        }
    }

    handleGlobalKeydown(e) {
        // Escape для закрытия модальных окон
        if (e.key === 'Escape') {
            if (this.sidebarMenu.classList.contains('active')) {
                this.closeSidebar();
            }
            if (this.modelModalOverlay.classList.contains('active')) {
                this.closeModelModal();
            }
            if (this.editChatModal.classList.contains('active')) {
                this.closeEditChatModal();
            }
        }
        
        // Ctrl + Shift + F для поиска
        if (e.key === 'F' && e.ctrlKey && e.shiftKey) {
            e.preventDefault();
            this.headerSearch.focus();
        }
    }

    setupAutoResize() {
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
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
                    this.userInput.dispatchEvent(new Event('input'));
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showNotification(`Ошибка распознавания: ${event.error}`, 'error');
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
        if (this.recognition) {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Error starting voice recognition:', error);
                this.showNotification('Ошибка запуска голосового ввода', 'error');
            }
        } else {
            this.showNotification('Голосовой ввод не поддерживается в этом браузере', 'warning');
        }
    }

    stopVoiceInput() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        this.isListening = false;
        this.voiceInputBtn.classList.remove('listening');
    }

    startPlaceholderAnimation() {
        let currentIndex = 0;
        
        const animatePlaceholder = () => {
            this.userInput.placeholder = this.placeholderExamples[currentIndex];
            currentIndex = (currentIndex + 1) % this.placeholderExamples.length;
        };

        // Начальная анимация
        animatePlaceholder();
        
        // Смена каждые 3 секунды
        this.setInterval(() => {
            if (!document.hidden && this.userInput.placeholder === this.placeholderExamples[currentIndex - 1]) {
                animatePlaceholder();
            }
        }, 3000);
    }

    loadThemePreference() {
        const savedTheme = localStorage.getItem('khai-theme') || 'dark';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('khai-theme', theme);
        
        // Обновляем иконку темы
        const themeIcons = document.querySelectorAll('#themeToggle i, #themeMinimapToggle i');
        themeIcons.forEach(icon => {
            icon.className = theme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
        });
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
        this.showNotification(`Тема изменена на ${newTheme === 'dark' ? 'тёмную' : 'светлую'}`, 'info');
    }

    refreshPage() {
        if (confirm('Обновить страницу? Несохраненные данные могут быть потеряны.')) {
            window.location.reload();
        }
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        
        if (files.length > this.MAX_FILES) {
            this.showNotification(`Можно прикрепить не более ${this.MAX_FILES} файлов`, 'warning');
            files.splice(this.MAX_FILES);
        }

        files.forEach(file => {
            if (this.attachedImages.length >= this.MAX_FILES) {
                return;
            }

            if (file.size > this.MAX_IMAGE_SIZE) {
                this.showNotification(`Файл ${file.name} слишком большой (макс. 5MB)`, 'error');
                return;
            }

            if (file.type.startsWith('image/')) {
                this.processImageFile(file);
            } else {
                this.processTextFile(file);
            }
        });

        this.fileInput.value = '';
        this.updateAttachedFilesDisplay();
    }

    processImageFile(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            this.attachedImages.push({
                name: file.name,
                data: e.target.result,
                type: file.type
            });
            this.updateAttachedFilesDisplay();
        };

        reader.onerror = () => {
            this.showNotification(`Ошибка чтения файла ${file.name}`, 'error');
        };

        reader.readAsDataURL(file);
    }

    processTextFile(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            this.attachedImages.push({
                name: file.name,
                data: e.target.result,
                type: 'text/plain',
                isText: true
            });
            this.updateAttachedFilesDisplay();
        };

        reader.onerror = () => {
            this.showNotification(`Ошибка чтения файла ${file.name}`, 'error');
        };

        reader.readAsText(file);
    }

    updateAttachedFilesDisplay() {
        this.attachedFiles.innerHTML = '';
        
        this.attachedImages.forEach((file, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            
            if (file.type.startsWith('image/')) {
                fileElement.innerHTML = `
                    <img src="${file.data}" alt="${file.name}">
                    <span class="file-name">${file.name}</span>
                    <button class="remove-file" data-index="${index}">
                        <i class="ti ti-x"></i>
                    </button>
                `;
            } else {
                fileElement.innerHTML = `
                    <div class="file-icon">
                        <i class="ti ti-file-text"></i>
                    </div>
                    <span class="file-name">${file.name}</span>
                    <button class="remove-file" data-index="${index}">
                        <i class="ti ti-x"></i>
                    </button>
                `;
            }
            
            this.attachedFiles.appendChild(fileElement);
        });

        // Добавляем обработчики для кнопок удаления
        this.attachedFiles.querySelectorAll('.remove-file').forEach(btn => {
            this.addEventListener(btn, 'click', (e) => {
                const index = parseInt(e.target.closest('.remove-file').dataset.index);
                this.removeAttachedFile(index);
            });
        });
    }

    removeAttachedFile(index) {
        this.attachedImages.splice(index, 1);
        this.updateAttachedFilesDisplay();
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

        if (confirm('Вы уверены, что хотите очистить историю чата?')) {
            this.conversationHistory = [];
            this.messagesContainer.innerHTML = '';
            this.saveCurrentSession();
            this.showNotification('Чат очищен', 'success');
            this.updateNavigationButtons();
            this.updateMinimap();
        }
    }

    showHelp() {
        const helpMessage = `
## 🤖 KHAI Assistant - Помощь

### Основные возможности:
- **💬 Чат с ИИ** - Общайтесь с различными моделями ИИ
- **🎨 Генерация изображений** - Создавайте изображения по описанию
- **🎤 Голосовой ввод** - Говорите вместо ввода текста
- **🔊 Генерация голоса** - Преобразуйте текст в речь
- **📎 Прикрепление файлов** - Загружайте изображения и текстовые файлы

### Горячие клавиши:
- **Enter** - Отправить сообщение
- **Shift + Enter** - Новая строка
- **Ctrl + /** - Показать справку
- **Ctrl + K** - Очистить чат
- **Ctrl + N** - Новый чат
- **Ctrl + M** - Открыть/закрыть меню
- **Ctrl + Shift + F** - Поиск по чату
- **Escape** - Закрыть модальные окна

### Поддерживаемые модели:
- GPT-4 Turbo (рекомендуется)
- GPT-3.5 Turbo (быстрая)
- Claude 2 (для анализа)
- Gemini Pro (универсальная)
        `.trim();

        this.addMessage('ai', helpMessage, true);
        this.showNotification('Справка открыта', 'info');
    }

    toggleImageMode() {
        this.isImageMode = !this.isImageMode;
        this.isVoiceMode = false;
        
        this.updateModeButtons();
        
        if (this.isImageMode) {
            this.showNotification('Режим генерации изображений активирован', 'info');
        }
    }

    toggleVoiceMode() {
        this.isVoiceMode = !this.isVoiceMode;
        this.isImageMode = false;
        
        this.updateModeButtons();
        
        if (this.isVoiceMode) {
            this.showNotification('Режим генерации голоса активирован', 'info');
        }
    }

    setMode(mode) {
        this.isImageMode = false;
        this.isVoiceMode = false;
        
        if (mode === 'image') {
            this.isImageMode = true;
        } else if (mode === 'voice') {
            this.isVoiceMode = true;
        }
        
        this.updateModeButtons();
    }

    updateModeButtons() {
        const buttons = {
            normal: this.normalModeBtn,
            voice: this.generateVoiceBtn,
            image: this.generateImageBtn
        };

        // Сбрасываем все кнопки
        Object.values(buttons).forEach(btn => {
            btn?.classList.remove('active');
        });

        // Активируем соответствующую кнопку
        if (this.isImageMode) {
            buttons.image?.classList.add('active');
        } else if (this.isVoiceMode) {
            buttons.voice?.classList.add('active');
        } else {
            buttons.normal?.classList.add('active');
        }

        // Обновляем placeholder
        this.userInput.placeholder = this.getCurrentPlaceholder();
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        
        if (!message && this.attachedImages.length === 0) {
            this.showNotification('Введите сообщение или прикрепите файл', 'warning');
            return;
        }

        if (message.length > this.MAX_MESSAGE_LENGTH) {
            this.showNotification(`Сообщение слишком длинное (макс. ${this.MAX_MESSAGE_LENGTH} символов)`, 'error');
            return;
        }

        // Сохраняем последнее сообщение пользователя
        this.lastUserMessage = message;

        // Добавляем сообщение пользователя
        this.addMessage('user', message);
        
        // Очищаем ввод
        this.clearInput();
        this.attachedImages = [];
        this.updateAttachedFilesDisplay();

        // Обрабатываем в зависимости от режима
        if (this.isImageMode) {
            await this.generateImage(message);
        } else if (this.isVoiceMode) {
            await this.generateVoice(message);
        } else {
            await this.generateAIResponse(message);
        }
    }

    addMessage(role, content, isHelp = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${role}`;
        
        const timestamp = new Date().toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });

        let messageContent = content;
        
        if (role === 'ai') {
            if (isHelp) {
                messageContent = marked.parse(content);
            }
            
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="ti ti-robot"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">${isHelp ? messageContent : this.escapeHtml(content)}</div>
                    <div class="message-time">${timestamp}</div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="ti ti-user"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">${this.escapeHtml(content)}</div>
                    <div class="message-time">${timestamp}</div>
                </div>
            `;
        }

        this.messagesContainer.appendChild(messageDiv);
        
        // Добавляем в историю
        this.conversationHistory.push({
            role: role,
            content: content,
            timestamp: new Date().toISOString()
        });

        // Сохраняем сессию
        this.saveCurrentSession();
        
        // Прокручиваем вниз
        this.scrollToBottom();
        
        // Обновляем мини-карту
        this.updateMinimap();

        return messageDiv;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async generateAIResponse(userMessage) {
        if (this.isGenerating) {
            this.showNotification('Уже генерируется ответ...', 'warning');
            return;
        }

        this.isGenerating = true;
        this.generationAborted = false;
        this.updateSendButton(true);

        try {
            // Показываем индикатор набора текста
            const typingIndicator = this.showTypingIndicator();
            
            // Генерируем ответ через Puter AI
            const response = await this.generateWithPuterAI(userMessage);
            
            if (this.generationAborted) {
                this.removeTypingIndicator(typingIndicator);
                return;
            }

            // Убираем индикатор и добавляем ответ
            this.removeTypingIndicator(typingIndicator);
            this.addMessage('ai', response);

        } catch (error) {
            console.error('Error generating AI response:', error);
            this.handleGenerationError(error);
        } finally {
            this.isGenerating = false;
            this.updateSendButton(false);
        }
    }

    async generateWithPuterAI(userMessage) {
        try {
            // Используем Puter AI SDK для генерации ответа
            const response = await puter.ai.chat(
                userMessage,
                {
                    model: this.currentModel,
                    messages: this.prepareConversationHistory()
                }
            );

            return response.content;

        } catch (error) {
            console.error('Puter AI error:', error);
            
            // Fallback: генерируем локальный ответ
            return this.generateFallbackResponse(userMessage);
        }
    }

    prepareConversationHistory() {
        // Подготавливаем историю для API
        return this.conversationHistory
            .filter(msg => msg.role === 'user' || msg.role === 'ai')
            .slice(-this.CONVERSATION_HISTORY_LIMIT)
            .map(msg => ({
                role: msg.role === 'ai' ? 'assistant' : 'user',
                content: msg.content
            }));
    }

    generateFallbackResponse(userMessage) {
        // Простой fallback для случаев, когда API недоступно
        const responses = [
            "Я обрабатываю ваш запрос локально, так как сервис временно недоступен.",
            "В настоящее время я работаю в автономном режиме. Вот что я могу сказать по вашему вопросу:",
            "Извините, сервис временно недоступен. Вот базовый ответ на ваш вопрос:"
        ];

        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Простая логика ответов для демонстрации
        if (userMessage.toLowerCase().includes('привет')) {
            return `${randomResponse} Привет! Как я могу помочь вам сегодня?`;
        } else if (userMessage.toLowerCase().includes('помощь')) {
            return `${randomResponse} Вы можете задать мне вопросы, попросить сгенерировать текст или изображения. Используйте кнопки внизу для переключения режимов.`;
        } else {
            return `${randomResponse} Я получил ваше сообщение: "${userMessage}". В обычном режиме я бы дал более развернутый ответ. Пожалуйста, попробуйте позже, когда сервис будет доступен.`;
        }
    }

    async generateImage(prompt) {
        if (!prompt.trim()) {
            this.showNotification('Введите описание для генерации изображения', 'warning');
            return;
        }

        this.isGenerating = true;
        this.updateSendButton(true);

        try {
            // Показываем индикатор генерации
            const generatingIndicator = this.showGeneratingIndicator('Генерация изображения...');

            // Используем Puter AI для генерации изображения
            const imageUrl = await puter.ai.image(prompt);

            if (this.generationAborted) {
                this.removeTypingIndicator(generatingIndicator);
                return;
            }

            // Убираем индикатор и показываем изображение
            this.removeTypingIndicator(generatingIndicator);
            this.showGeneratedImage(prompt, imageUrl);

        } catch (error) {
            console.error('Error generating image:', error);
            this.handleGenerationError(error);
        } finally {
            this.isGenerating = false;
            this.updateSendButton(false);
        }
    }

    showGeneratedImage(prompt, imageUrl) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message message-ai generated-image';
        
        const timestamp = new Date().toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="ti ti-robot"></i>
            </div>
            <div class="message-content">
                <div class="image-prompt">
                    <strong>Запрос:</strong> ${this.escapeHtml(prompt)}
                </div>
                <div class="generated-image-container">
                    <img src="${imageUrl}" alt="Сгенерированное изображение" loading="lazy">
                    <div class="image-actions">
                        <button class="image-action-btn" onclick="this.downloadImage('${imageUrl}', '${prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase()}')">
                            <i class="ti ti-download"></i> Скачать
                        </button>
                        <button class="image-action-btn" onclick="this.shareImage('${imageUrl}', '${prompt}')">
                            <i class="ti ti-share"></i> Поделиться
                        </button>
                    </div>
                </div>
                <div class="message-time">${timestamp}</div>
            </div>
        `;

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
        this.updateMinimap();

        // Добавляем в историю
        this.conversationHistory.push({
            role: 'ai',
            content: `[Изображение] ${prompt}`,
            timestamp: new Date().toISOString(),
            imageUrl: imageUrl
        });

        this.saveCurrentSession();
    }

    async generateVoice(text) {
        if (!text.trim()) {
            this.showNotification('Введите текст для генерации голоса', 'warning');
            return;
        }

        this.isGenerating = true;
        this.updateSendButton(true);

        try {
            // Показываем индикатор генерации
            const generatingIndicator = this.showGeneratingIndicator('Генерация голоса...');

            // Используем браузерный синтез речи как fallback
            await this.speakText(text);

            if (this.generationAborted) {
                this.removeTypingIndicator(generatingIndicator);
                return;
            }

            // Убираем индикатор
            this.removeTypingIndicator(generatingIndicator);

            // Добавляем сообщение о сгенерированном голосе
            this.addMessage('ai', `[Аудио] ${text}`);

        } catch (error) {
            console.error('Error generating voice:', error);
            this.handleGenerationError(error);
        } finally {
            this.isGenerating = false;
            this.updateSendButton(false);
        }
    }

    async speakText(text) {
        return new Promise((resolve, reject) => {
            if (!('speechSynthesis' in window)) {
                reject(new Error('Синтез речи не поддерживается'));
                return;
            }

            // Останавливаем предыдущее воспроизведение
            if (this.isSpeaking && this.currentUtterance) {
                speechSynthesis.cancel();
            }

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ru-RU';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            utterance.onend = () => {
                this.isSpeaking = false;
                this.currentUtterance = null;
                resolve();
            };

            utterance.onerror = (event) => {
                this.isSpeaking = false;
                this.currentUtterance = null;
                reject(new Error(`Ошибка синтеза речи: ${event.error}`));
            };

            this.isSpeaking = true;
            this.currentUtterance = utterance;
            speechSynthesis.speak(utterance);
        });
    }

    stopSpeech() {
        if (this.isSpeaking && this.currentUtterance) {
            speechSynthesis.cancel();
            this.isSpeaking = false;
            this.currentUtterance = null;
        }
    }

    showTypingIndicator() {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.className = 'message message-ai typing-indicator';
        indicatorDiv.innerHTML = `
            <div class="message-avatar">
                <i class="ti ti-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div class="message-time">${new Date().toLocaleTimeString('ru-RU', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })}</div>
            </div>
        `;

        this.messagesContainer.appendChild(indicatorDiv);
        this.scrollToBottom();
        
        this.activeTypingIndicator = indicatorDiv;
        return indicatorDiv;
    }

    showGeneratingIndicator(type) {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.className = 'message message-ai generating-indicator';
        indicatorDiv.innerHTML = `
            <div class="message-avatar">
                <i class="ti ti-robot"></i>
            </div>
            <div class="message-content">
                <div class="generating-text">
                    <i class="ti ti-loader-2 spinning"></i>
                    ${type}
                </div>
                <div class="message-time">${new Date().toLocaleTimeString('ru-RU', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })}</div>
            </div>
        `;

        this.messagesContainer.appendChild(indicatorDiv);
        this.scrollToBottom();
        
        return indicatorDiv;
    }

    removeTypingIndicator(indicator) {
        if (indicator && indicator.parentNode) {
            indicator.remove();
            this.activeTypingIndicator = null;
        }
    }

    stopGeneration() {
        if (this.isGenerating) {
            this.generationAborted = true;
            this.isGenerating = false;
            
            // Останавливаем речь
            this.stopSpeech();
            
            // Убираем индикаторы
            if (this.activeTypingIndicator) {
                this.removeTypingIndicator(this.activeTypingIndicator);
            }
            
            this.updateSendButton(false);
            this.showNotification('Генерация остановлена', 'info');
        }
    }

    handleGenerationError(error) {
        console.error('Generation error:', error);
        
        let errorMessage = 'Произошла ошибка при генерации ответа. ';
        
        if (error.message.includes('network') || error.message.includes('Network')) {
            errorMessage += 'Проверьте подключение к интернету.';
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
            errorMessage += 'Возможно, превышен лимит запросов. Попробуйте позже.';
        } else {
            errorMessage += 'Пожалуйста, попробуйте еще раз.';
        }
        
        this.showNotification(errorMessage, 'error');
        this.addMessage('ai', 'Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте еще раз.');
    }

    showNotification(message, type = 'info') {
        // Создаем уведомление
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
        this.setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // Автоматическое скрытие
        const autoHide = this.setTimeout(() => {
            this.hideNotification(notification);
        }, 5000);

        // Закрытие по клику
        this.addEventListener(notification.querySelector('.notification-close'), 'click', () => {
            this.clearTimeout(autoHide);
            this.hideNotification(notification);
        });

        // Закрытие при наведении (для десктопа)
        if (window.matchMedia('(hover: hover)').matches) {
            this.addEventListener(notification, 'mouseenter', () => {
                this.clearTimeout(autoHide);
            });
            
            this.addEventListener(notification, 'mouseleave', () => {
                const newTimeout = this.setTimeout(() => {
                    this.hideNotification(notification);
                }, 2000);
                // Сохраняем ID нового таймаута для возможной отмены
                notification.dataset.timeoutId = newTimeout;
            });
        }
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

    hideNotification(notification) {
        notification.classList.remove('show');
        this.setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }

    // Управление чатами и сессиями
    loadChatSessions() {
        try {
            const savedSessions = localStorage.getItem('khai-chat-sessions');
            if (savedSessions) {
                const sessions = JSON.parse(savedSessions);
                this.chatSessions = new Map(Object.entries(sessions));
            }
            
            // Создаем сессию по умолчанию, если нет сохраненных
            if (!this.chatSessions.has('default')) {
                this.chatSessions.set('default', {
                    id: 'default',
                    name: 'Основной чат',
                    history: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error loading chat sessions:', error);
            this.chatSessions = new Map();
            this.chatSessions.set('default', {
                id: 'default',
                name: 'Основной чат',
                history: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
    }

    saveChatSessions() {
        try {
            const sessionsObject = Object.fromEntries(this.chatSessions);
            localStorage.setItem('khai-chat-sessions', JSON.stringify(sessionsObject));
        } catch (error) {
            console.error('Error saving chat sessions:', error);
        }
    }

    loadCurrentSession() {
        const session = this.chatSessions.get(this.currentChatId);
        if (session) {
            this.conversationHistory = session.history || [];
            this.currentChatName.textContent = session.name;
            this.renderConversationHistory();
            this.updateDocumentTitle();
        }
    }

    saveCurrentSession() {
        const session = this.chatSessions.get(this.currentChatId);
        if (session) {
            session.history = this.conversationHistory;
            session.updatedAt = new Date().toISOString();
            this.chatSessions.set(this.currentChatId, session);
            this.saveChatSessions();
        }
    }

    renderConversationHistory() {
        this.messagesContainer.innerHTML = '';
        
        this.conversationHistory.forEach(message => {
            this.addMessage(message.role, message.content);
        });
        
        this.updateMinimap();
        this.scrollToBottom();
    }

    createNewChat() {
        const chatId = 'chat-' + Date.now();
        const chatName = `Новый чат ${this.chatSessions.size + 1}`;
        
        this.chatSessions.set(chatId, {
            id: chatId,
            name: chatName,
            history: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        this.switchToChat(chatId);
        this.saveChatSessions();
        this.updateChatList();
        this.closeSidebar();
        
        this.showNotification('Создан новый чат', 'success');
    }

    switchToChat(chatId) {
        // Сохраняем текущую сессию
        this.saveCurrentSession();
        
        // Переключаемся на новую сессию
        this.currentChatId = chatId;
        this.loadCurrentSession();
        
        // Обновляем UI
        this.updateChatList();
        this.updateDocumentTitle();
    }

    updateChatList() {
        if (!this.chatList) return;
        
        this.chatList.innerHTML = '';
        
        const sessions = Array.from(this.chatSessions.values())
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        sessions.forEach(session => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${session.id === this.currentChatId ? 'active' : ''}`;
            chatItem.dataset.chatId = session.id;
            
            const lastMessage = session.history.length > 0 
                ? session.history[session.history.length - 1].content
                : 'Нет сообщений';
            
            const shortMessage = lastMessage.length > 50 
                ? lastMessage.substring(0, 50) + '...' 
                : lastMessage;
            
            chatItem.innerHTML = `
                <div class="chat-item-content">
                    <div class="chat-item-name">${this.escapeHtml(session.name)}</div>
                    <div class="chat-item-preview">${this.escapeHtml(shortMessage)}</div>
                    <div class="chat-item-time">${new Date(session.updatedAt).toLocaleDateString('ru-RU')}</div>
                </div>
                <div class="chat-item-actions">
                    <button class="chat-action-btn edit-chat" title="Редактировать">
                        <i class="ti ti-edit"></i>
                    </button>
                    ${session.id !== 'default' ? `
                        <button class="chat-action-btn delete-chat" title="Удалить">
                            <i class="ti ti-trash"></i>
                        </button>
                    ` : ''}
                </div>
            `;
            
            this.chatList.appendChild(chatItem);
            
            // Обработчики событий для элемента чата
            this.addEventListener(chatItem, 'click', (e) => {
                if (!e.target.closest('.chat-item-actions')) {
                    this.switchToChat(session.id);
                    this.closeSidebar();
                }
            });
            
            // Обработчики для кнопок действий
            const editBtn = chatItem.querySelector('.edit-chat');
            const deleteBtn = chatItem.querySelector('.delete-chat');
            
            if (editBtn) {
                this.addEventListener(editBtn, 'click', (e) => {
                    e.stopPropagation();
                    this.openEditChatModal(session.id, session.name);
                });
            }
            
            if (deleteBtn) {
                this.addEventListener(deleteBtn, 'click', (e) => {
                    e.stopPropagation();
                    this.deleteChat(session.id);
                });
            }
        });
    }

    openEditChatModal(chatId, currentName) {
        this.editingChatId = chatId;
        this.editChatNameInput.value = currentName;
        this.handleModalInputChange();
        this.editChatModal.classList.add('active');
        this.editChatNameInput.focus();
        this.editChatNameInput.select();
    }

    closeEditChatModal() {
        this.editChatModal.classList.remove('active');
        this.editingChatId = null;
        this.editChatNameInput.value = '';
        this.modalClearInput.style.display = 'none';
    }

    handleModalInputChange() {
        const hasInput = this.editChatNameInput.value.trim().length > 0;
        this.modalClearInput.style.display = hasInput ? 'flex' : 'none';
    }

    clearModalInput() {
        this.editChatNameInput.value = '';
        this.modalClearInput.style.display = 'none';
        this.editChatNameInput.focus();
    }

    saveChatName() {
        const newName = this.editChatNameInput.value.trim();
        
        if (!newName) {
            this.showNotification('Введите название чата', 'warning');
            return;
        }
        
        if (newName.length > this.MAX_CHAT_NAME_LENGTH) {
            this.showNotification(`Название чата слишком длинное (макс. ${this.MAX_CHAT_NAME_LENGTH} символов)`, 'error');
            return;
        }
        
        if (this.editingChatId) {
            const session = this.chatSessions.get(this.editingChatId);
            if (session) {
                session.name = newName;
                session.updatedAt = new Date().toISOString();
                this.chatSessions.set(this.editingChatId, session);
                this.saveChatSessions();
                
                if (this.editingChatId === this.currentChatId) {
                    this.currentChatName.textContent = newName;
                    this.updateDocumentTitle();
                }
                
                this.updateChatList();
                this.showNotification('Название чата сохранено', 'success');
            }
        }
        
        this.closeEditChatModal();
    }

    deleteChat(chatId) {
        if (chatId === this.currentChatId) {
            this.showNotification('Нельзя удалить активный чат', 'error');
            return;
        }
        
        if (chatId === 'default') {
            this.showNotification('Нельзя удалить основной чат', 'error');
            return;
        }
        
        if (confirm('Вы уверены, что хотите удалить этот чат? Это действие нельзя отменить.')) {
            this.chatSessions.delete(chatId);
            this.saveChatSessions();
            this.updateChatList();
            this.showNotification('Чат удален', 'success');
        }
    }

    setupChatSelector() {
        this.updateChatList();
    }

    toggleSidebar() {
        this.sidebarMenu.classList.toggle('active');
        this.sidebarOverlay.classList.toggle('active');
        
        if (this.sidebarMenu.classList.contains('active')) {
            this.updateChatList();
            this.sidebarSearch.focus();
        }
    }

    closeSidebar() {
        this.sidebarMenu.classList.remove('active');
        this.sidebarOverlay.classList.remove('active');
    }

    // Мини-карта чата
    setupResponsiveMinimap() {
        this.updateMinimap();
        
        // Обновляем мини-карту при изменении размера окна
        this.addEventListener(window, 'resize', () => {
            this.updateMinimap();
        });
    }

    updateMinimap() {
        if (!this.minimapContent || !this.messagesContainer) return;
        
        const messages = this.messagesContainer.querySelectorAll('.message');
        this.minimapContent.innerHTML = '';
        
        messages.forEach((message, index) => {
            const dot = document.createElement('div');
            dot.className = `minimap-dot ${message.classList.contains('message-user') ? 'user' : 'ai'}`;
            dot.title = `${message.classList.contains('message-user') ? 'Пользователь' : 'ИИ'} - Сообщение ${index + 1}`;
            this.minimapContent.appendChild(dot);
        });
        
        this.updateMinimapViewport();
    }

    updateMinimapViewport() {
        if (!this.minimapViewport || !this.messagesContainer) return;
        
        const container = this.messagesContainer;
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        
        if (scrollHeight === 0) return;
        
        const viewportHeight = (clientHeight / scrollHeight) * 100;
        const viewportTop = (scrollTop / scrollHeight) * 100;
        
        this.minimapViewport.style.height = `${viewportHeight}%`;
        this.minimapViewport.style.top = `${viewportTop}%`;
    }

    // Поиск по чату
    handleSearchInput() {
        const query = this.headerSearch.value.trim();
        this.headerSearchClear.style.display = query ? 'flex' : 'none';
        
        if (query) {
            this.highlightSearchResults(query);
        } else {
            this.clearSearchHighlights();
        }
    }

    highlightSearchResults(query) {
        this.clearSearchHighlights();
        
        const messages = this.messagesContainer.querySelectorAll('.message-text');
        let foundCount = 0;
        
        messages.forEach(message => {
            const text = message.textContent || message.innerText;
            const regex = new RegExp(this.escapeRegex(query), 'gi');
            const matches = text.match(regex);
            
            if (matches) {
                foundCount += matches.length;
                const highlightedText = text.replace(regex, match => 
                    `<mark class="search-highlight">${match}</mark>`
                );
                message.innerHTML = highlightedText;
                
                // Прокручиваем к первому найденному результату
                if (foundCount === matches.length) {
                    message.closest('.message').scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
        
        if (foundCount > 0) {
            this.showNotification(`Найдено совпадений: ${foundCount}`, 'info');
        } else {
            this.showNotification('Совпадений не найдено', 'warning');
        }
    }

    clearSearchHighlights() {
        const highlights = this.messagesContainer.querySelectorAll('.search-highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
    }

    clearSearch() {
        this.headerSearch.value = '';
        this.headerSearchClear.style.display = 'none';
        this.clearSearchHighlights();
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Фильтрация истории чатов
    filterChatHistory() {
        const query = this.sidebarSearch.value.trim().toLowerCase();
        const chatItems = this.chatList.querySelectorAll('.chat-item');
        
        chatItems.forEach(item => {
            const name = item.querySelector('.chat-item-name').textContent.toLowerCase();
            const preview = item.querySelector('.chat-item-preview').textContent.toLowerCase();
            
            if (name.includes(query) || preview.includes(query)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Управление моделями ИИ
    openModelModal() {
        // Сбрасываем выбор
        this.modelList.querySelectorAll('.model-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Выбираем текущую модель
        const currentModelItem = this.modelList.querySelector(`[data-model="${this.currentModel}"]`);
        if (currentModelItem) {
            currentModelItem.classList.add('selected');
        }
        
        this.modelModalOverlay.classList.add('active');
    }

    closeModelModal() {
        this.modelModalOverlay.classList.remove('active');
    }

    handleModelItemClick(e) {
        const modelItem = e.target.closest('.model-item');
        if (modelItem) {
            this.modelList.querySelectorAll('.model-item').forEach(item => {
                item.classList.remove('selected');
            });
            modelItem.classList.add('selected');
        }
    }

    confirmModelSelection() {
        const selectedModel = this.modelList.querySelector('.model-item.selected');
        if (selectedModel) {
            const modelId = selectedModel.dataset.model;
            this.currentModel = modelId;
            this.updateModelInfo();
            this.closeModelModal();
            this.showNotification(`Модель изменена на: ${this.modelConfig[modelId].name}`, 'success');
        }
    }

    updateModelInfo() {
        const model = this.modelConfig[this.currentModel];
        if (model && this.currentModelInfo) {
            this.currentModelInfo.textContent = model.name;
        }
    }

    // Импорт/экспорт истории
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
                        const importedData = JSON.parse(event.target.result);
                        this.handleImportedData(importedData);
                    } catch (error) {
                        this.showNotification('Ошибка при чтении файла', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    handleImportedData(data) {
        // Проверяем структуру данных
        if (!data.history || !Array.isArray(data.history)) {
            this.showNotification('Неверный формат файла', 'error');
            return;
        }
        
        // Создаем новый чат с импортированной историей
        const chatId = 'imported-' + Date.now();
        const chatName = data.name || `Импортированный чат ${new Date().toLocaleDateString('ru-RU')}`;
        
        this.chatSessions.set(chatId, {
            id: chatId,
            name: chatName,
            history: data.history,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        
        this.switchToChat(chatId);
        this.saveChatSessions();
        this.updateChatList();
        this.closeSidebar();
        
        this.showNotification('Чат успешно импортирован', 'success');
    }

    downloadHistory() {
        const session = this.chatSessions.get(this.currentChatId);
        if (!session || session.history.length === 0) {
            this.showNotification('Нет истории для скачивания', 'warning');
            return;
        }
        
        const data = {
            name: session.name,
            history: session.history,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khai-chat-${session.name.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('История чата скачана', 'success');
    }

    // Утилиты для управления событиями и таймерами
    addEventListener(element, event, handler) {
        if (!element) return;
        
        element.addEventListener(event, handler);
        
        // Сохраняем ссылку для последующего удаления
        const key = `${event}-${handler.toString().slice(0, 50)}`;
        if (!this.activeEventListeners.has(element)) {
            this.activeEventListeners.set(element, new Map());
        }
        this.activeEventListeners.get(element).set(key, handler);
    }

    removeAllEventListeners() {
        // Удаляем все сохраненные обработчики событий
        this.activeEventListeners.forEach((handlers, element) => {
            handlers.forEach((handler, event) => {
                element.removeEventListener(event, handler);
            });
        });
        this.activeEventListeners.clear();
        
        // Очищаем все таймауты
        this.activeTimeouts.forEach(timeoutId => {
            clearTimeout(timeoutId);
        });
        this.activeTimeouts.clear();
    }

    setTimeout(callback, delay) {
        const timeoutId = setTimeout(() => {
            this.activeTimeouts.delete(timeoutId);
            callback();
        }, delay);
        
        this.activeTimeouts.add(timeoutId);
        return timeoutId;
    }

    setInterval(callback, interval) {
        const intervalId = setInterval(callback, interval);
        
        // Также сохраняем interval для возможной очистки
        this.activeTimeouts.add(intervalId);
        return intervalId;
    }

    clearTimeout(timeoutId) {
        clearTimeout(timeoutId);
        this.activeTimeouts.delete(timeoutId);
    }

    clearInterval(intervalId) {
        clearInterval(intervalId);
        this.activeTimeouts.delete(intervalId);
    }

    handleBeforeUnload() {
        // Сохраняем текущую сессию перед закрытием
        this.saveCurrentSession();
        
        // Останавливаем генерацию
        this.stopGeneration();
        
        // Останавливаем речь
        this.stopSpeech();
    }

    // Методы для работы с изображениями (для использования в HTML)
    downloadImage(imageUrl, prompt) {
        const a = document.createElement('a');
        a.href = imageUrl;
        a.download = `khai-image-${prompt || 'generated'}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        this.showNotification('Изображение скачано', 'success');
    }

    shareImage(imageUrl, prompt) {
        if (navigator.share) {
            navigator.share({
                title: 'Сгенерированное изображение KHAI Assistant',
                text: prompt,
                url: imageUrl
            }).catch(error => {
                console.log('Ошибка sharing:', error);
            });
        } else {
            // Fallback: копируем URL в буфер обмена
            navigator.clipboard.writeText(imageUrl).then(() => {
                this.showNotification('Ссылка на изображение скопирована в буфер обмена', 'success');
            }).catch(() => {
                this.showNotification('Функция sharing не поддерживается', 'warning');
            });
        }
    }
}

// Глобальные функции для использования в HTML
window.downloadImage = function(imageUrl, prompt) {
    if (window.khaiAssistant) {
        window.khaiAssistant.downloadImage(imageUrl, prompt);
    }
};

window.shareImage = function(imageUrl, prompt) {
    if (window.khaiAssistant) {
        window.khaiAssistant.shareImage(imageUrl, prompt);
    }
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.khaiAssistant = new KHAIAssistant();
        console.log('KHAI Assistant успешно инициализирован');
    } catch (error) {
        console.error('Ошибка инициализации KHAI Assistant:', error);
    }
});

// Обработка ошибок
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
