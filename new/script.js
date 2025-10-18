class KHAIAssistant {
    constructor() {
        this.initializeElements();
        this.initializeState();
        this.setupMarked();
        this.init();
    }

    initializeElements() {
        try {
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
            
            // Модальное окно ошибок
            this.errorModal = document.getElementById('errorModal');
            this.errorMessage = document.getElementById('errorMessage');
            this.errorModalClose = document.getElementById('errorModalClose');
            this.errorModalOk = document.getElementById('errorModalOk');
            
            this.editingChatId = null;
        } catch (error) {
            console.error('Ошибка инициализации элементов:', error);
            this.showError('Ошибка загрузки интерфейса', error);
        }
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
        try {
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
        } catch (error) {
            console.error('Ошибка настройки Marked:', error);
        }
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
                if (this.userInput) {
                    this.userInput.focus();
                }
            }, 500);
            
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.showError('Ошибка загрузки приложения', error);
        }
    }

    initializeLiveInternetCounter() {
        // Инициализация счетчика для сайдбара
        this.setTimeout(() => {
            try {
                const sidebarCounter = document.getElementById('licntAFF9Sidebar');
                if (sidebarCounter) {
                    sidebarCounter.src = "https://counter.yadro.ru/hit?t52.6;r" + 
                        escape(document.referrer) + ";s" + screen.width + "*" + screen.height + "*" +
                        (screen.colorDepth ? screen.colorDepth : screen.pixelDepth) + ";u" + 
                        escape(document.URL) + ";h" + escape(document.title.substring(0, 150)) + 
                        ";" + Math.random();
                }
            } catch (error) {
                console.error('Ошибка инициализации счетчика:', error);
            }
        }, 1000);
    }

    bindEvents() {
        try {
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
                [this.attachFileBtn, 'click', () => this.fileInput && this.fileInput.click()],
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
                [this.messagesContainer, 'touchend', () => this.handleTouchEnd()],
                [this.errorModalClose, 'click', () => this.hideErrorModal()],
                [this.errorModalOk, 'click', () => this.hideErrorModal()],
                [this.errorModal, 'click', (e) => {
                    if (e.target === this.errorModal) {
                        this.hideErrorModal();
                    }
                }]
            ];

            events.forEach(([element, event, handler]) => {
                if (element) {
                    this.addEventListener(element, event, handler);
                }
            });
        } catch (error) {
            console.error('Ошибка привязки событий:', error);
            this.showError('Ошибка инициализации интерфейса', error);
        }
    }

    showError(message, error = null) {
        console.error(message, error);
        const errorText = error ? `${message}: ${error.message}` : message;
        
        if (this.errorModal && this.errorMessage) {
            this.errorMessage.textContent = errorText;
            this.errorModal.style.display = 'flex';
        } else {
            // Fallback: использовать alert если модальное окно недоступно
            alert(`Ошибка: ${errorText}`);
        }
    }

    hideErrorModal() {
        if (this.errorModal) {
            this.errorModal.style.display = 'none';
        }
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
        try {
            const header = document.querySelector('.app-header');
            const footer = document.querySelector('.app-footer');
            const inputSection = this.inputSection;
            
            if (header) header.classList.add('hidden');
            if (footer) footer.classList.add('hidden');
            if (inputSection) inputSection.classList.add('hidden');
            if (this.messagesContainer) this.messagesContainer.classList.add('full-width');
        } catch (error) {
            console.error('Ошибка скрытия интерфейса:', error);
        }
    }

    showInterface() {
        if (this.isTouchScrolling) return;
        
        try {
            const header = document.querySelector('.app-header');
            const footer = document.querySelector('.app-footer');
            const inputSection = this.inputSection;
            
            if (header) header.classList.remove('hidden');
            if (footer) footer.classList.remove('hidden');
            if (inputSection) inputSection.classList.remove('hidden');
            if (this.messagesContainer) this.messagesContainer.classList.remove('full-width');
        } catch (error) {
            console.error('Ошибка показа интерфейса:', error);
        }
    }

    setupContextMenu() {
        try {
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
                if (this.contextMenu && !this.contextMenu.contains(e.target)) {
                    this.hideContextMenu();
                }
            });
        } catch (error) {
            console.error('Ошибка настройки контекстного меню:', error);
        }
    }

    handleDocumentContextMenu(e) {
        try {
            // Показ контекстного меню для сообщений ИИ
            const messageElement = e.target.closest('.message.ai-message');
            if (messageElement) {
                e.preventDefault();
                this.contextMenuTarget = messageElement;
                this.showContextMenu(e.clientX, e.clientY);
            }
        } catch (error) {
            console.error('Ошибка обработки контекстного меню:', error);
        }
    }

    showContextMenu(x, y) {
        try {
            if (!this.contextMenu) return;
            
            this.contextMenu.style.left = x + 'px';
            this.contextMenu.style.top = y + 'px';
            this.contextMenu.style.display = 'block';
            
            // Гарантируем, что меню находится в пределах окна
            const rect = this.contextMenu.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            
            if (rect.right > windowWidth) {
                this.contextMenu.style.left = (x - rect.width) + 'px';
            }
            
            if (rect.bottom > windowHeight) {
                this.contextMenu.style.top = (y - rect.height) + 'px';
            }
        } catch (error) {
            console.error('Ошибка показа контекстного меню:', error);
        }
    }

    hideContextMenu() {
        try {
            if (this.contextMenu) {
                this.contextMenu.style.display = 'none';
            }
            this.contextMenuTarget = null;
        } catch (error) {
            console.error('Ошибка скрытия контекстного меню:', error);
        }
    }

    handleContextMenuAction(action, target) {
        try {
            const messageId = target.getAttribute('data-message-id');
            const message = this.conversationHistory.find(m => m.id === messageId);
            
            if (!message) return;

            switch (action) {
                case 'copy':
                    this.copyToClipboard(message.content);
                    this.showNotification('Текст скопирован в буфер обмена', 'success');
                    break;
                case 'speak':
                    this.speakText(message.content);
                    break;
                case 'continue':
                    this.continueLastResponse();
                    break;
                case 'download':
                    this.downloadMessageAsFile(message);
                    break;
            }
        } catch (error) {
            console.error('Ошибка обработки действия контекстного меню:', error);
            this.showError('Ошибка выполнения действия', error);
        }
    }

    copyToClipboard(text) {
        try {
            navigator.clipboard.writeText(text).then(() => {
                console.log('Текст скопирован в буфер обмена');
            }).catch(err => {
                console.error('Ошибка копирования в буфер обмена:', err);
                // Fallback для старых браузеров
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            });
        } catch (error) {
            console.error('Ошибка копирования:', error);
        }
    }

    downloadMessageAsFile(message) {
        try {
            const blob = new Blob([message.content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `сообщение-${message.id}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            this.showNotification('Сообщение сохранено как файл', 'success');
        } catch (error) {
            console.error('Ошибка скачивания сообщения:', error);
            this.showError('Ошибка сохранения файла', error);
        }
    }

    setupSearch() {
        try {
            // Поиск в чате
            if (this.headerSearch) {
                this.addEventListener(this.headerSearch, 'input', (e) => {
                    this.searchTerm = e.target.value.trim();
                    this.headerSearchClear.style.display = this.searchTerm ? 'flex' : 'none';
                    this.highlightSearchResults();
                });

                this.addEventListener(this.headerSearchClear, 'click', () => {
                    this.headerSearch.value = '';
                    this.searchTerm = '';
                    this.headerSearchClear.style.display = 'none';
                    this.clearSearchHighlights();
                });
            }

            // Поиск в сайдбаре
            if (this.sidebarSearch) {
                this.addEventListener(this.sidebarSearch, 'input', (e) => {
                    this.sidebarSearchTerm = e.target.value.trim();
                    this.sidebarSearchClear.style.display = this.sidebarSearchTerm ? 'flex' : 'none';
                    this.filterChatList();
                });

                this.addEventListener(this.sidebarSearchClear, 'click', () => {
                    this.sidebarSearch.value = '';
                    this.sidebarSearchTerm = '';
                    this.sidebarSearchClear.style.display = 'none';
                    this.filterChatList();
                });
            }
        } catch (error) {
            console.error('Ошибка настройки поиска:', error);
        }
    }

    highlightSearchResults() {
        try {
            this.clearSearchHighlights();
            
            if (!this.searchTerm) return;

            const messages = this.messagesContainer.querySelectorAll('.message-content');
            const searchTerm = this.searchTerm.toLowerCase();
            let foundCount = 0;

            messages.forEach(message => {
                const content = message.textContent || message.innerText;
                if (content.toLowerCase().includes(searchTerm)) {
                    foundCount++;
                    this.highlightText(message, searchTerm);
                }
            });

            if (foundCount > 0) {
                this.showNotification(`Найдено совпадений: ${foundCount}`, 'info');
            } else {
                this.showNotification('Совпадений не найдено', 'warning');
            }
        } catch (error) {
            console.error('Ошибка подсветки результатов поиска:', error);
        }
    }

    highlightText(element, searchTerm) {
        try {
            const walker = document.createTreeWalker(
                element,
                NodeFilter.SHOW_TEXT,
                null,
                false
            );

            const nodes = [];
            let node;
            while (node = walker.nextNode()) {
                nodes.push(node);
            }

            nodes.forEach(node => {
                const text = node.nodeValue;
                const lowerText = text.toLowerCase();
                const index = lowerText.indexOf(searchTerm);
                
                if (index !== -1) {
                    const span = document.createElement('span');
                    span.className = 'search-highlight';
                    
                    const before = text.substring(0, index);
                    const match = text.substring(index, index + searchTerm.length);
                    const after = text.substring(index + searchTerm.length);
                    
                    span.appendChild(document.createTextNode(match));
                    
                    const parent = node.parentNode;
                    parent.insertBefore(document.createTextNode(before), node);
                    parent.insertBefore(span, node);
                    parent.insertBefore(document.createTextNode(after), node);
                    parent.removeChild(node);
                }
            });
        } catch (error) {
            console.error('Ошибка подсветки текста:', error);
        }
    }

    clearSearchHighlights() {
        try {
            const highlights = this.messagesContainer.querySelectorAll('.search-highlight');
            highlights.forEach(highlight => {
                const parent = highlight.parentNode;
                while (highlight.firstChild) {
                    parent.insertBefore(highlight.firstChild, highlight);
                }
                parent.removeChild(highlight);
            });
            parent.normalize();
        } catch (error) {
            console.error('Ошибка очистки подсветки:', error);
        }
    }

    filterChatList() {
        try {
            const chatItems = this.chatList.querySelectorAll('.chat-item');
            const searchTerm = this.sidebarSearchTerm.toLowerCase();

            chatItems.forEach(item => {
                const chatName = item.querySelector('.chat-name').textContent.toLowerCase();
                if (chatName.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        } catch (error) {
            console.error('Ошибка фильтрации списка чатов:', error);
        }
    }

    setupMinimap() {
        try {
            if (!this.chatMinimap || !this.minimapContent) return;

            this.addEventListener(this.messagesContainer, 'scroll', () => {
                this.updateMinimap();
            });

            this.addEventListener(this.chatMinimap, 'click', (e) => {
                if (e.target === this.minimapContent) return;
                const rect = this.chatMinimap.getBoundingClientRect();
                const clickY = e.clientY - rect.top;
                const percentage = clickY / rect.height;
                const targetScroll = percentage * this.messagesContainer.scrollHeight;
                this.messagesContainer.scrollTop = targetScroll - this.messagesContainer.clientHeight / 2;
            });

            this.updateMinimap();
        } catch (error) {
            console.error('Ошибка настройки мини-карты:', error);
        }
    }

    updateMinimap() {
        try {
            if (!this.messagesContainer || !this.minimapContent || !this.minimapViewport) return;

            const container = this.messagesContainer;
            const scrollPercentage = container.scrollTop / (container.scrollHeight - container.clientHeight);
            const viewportPercentage = container.clientHeight / container.scrollHeight;

            // Обновляем содержимое мини-карты
            const messages = container.querySelectorAll('.message');
            this.minimapContent.innerHTML = '';
            
            messages.forEach(message => {
                const block = document.createElement('div');
                block.className = 'minimap-block ' + (message.classList.contains('user-message') ? 'user' : 'ai');
                this.minimapContent.appendChild(block);
            });

            // Обновляем позицию viewport
            this.minimapViewport.style.height = (viewportPercentage * 100) + '%';
            this.minimapViewport.style.top = (scrollPercentage * (100 - viewportPercentage * 100)) + '%';
        } catch (error) {
            console.error('Ошибка обновления мини-карты:', error);
        }
    }

    handleScroll() {
        try {
            if (!this.messagesContainer) return;

            const container = this.messagesContainer;
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;

            // Определяем, находимся ли мы внизу
            this.isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
            this.isAtTop = scrollTop < 10;

            // Обновляем кнопки навигации
            this.updateNavigationButtons();

            // Обновляем мини-карту
            this.updateMinimap();

            // Авто-скролл при генерации
            if (this.isGenerating && this.autoScrollEnabled && this.isAtBottom) {
                this.scrollToBottom();
            }
        } catch (error) {
            console.error('Ошибка обработки скролла:', error);
        }
    }

    updateNavigationButtons() {
        try {
            if (!this.scrollToBottomBtn) return;

            // Показываем/скрываем кнопку прокрутки вниз
            if (this.isAtBottom) {
                this.scrollToBottomBtn.style.opacity = '0.5';
            } else {
                this.scrollToBottomBtn.style.opacity = '1';
            }
        } catch (error) {
            console.error('Ошибка обновления кнопок навигации:', error);
        }
    }

    scrollToLastAIMessage() {
        try {
            const aiMessages = this.messagesContainer.querySelectorAll('.ai-message');
            if (aiMessages.length > 0) {
                const lastAIMessage = aiMessages[aiMessages.length - 1];
                lastAIMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } catch (error) {
            console.error('Ошибка прокрутки к последнему сообщению ИИ:', error);
        }
    }

    scrollToBottom(force = false) {
        try {
            if (!this.messagesContainer) return;
            
            if (force || this.autoScrollEnabled) {
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            }
        } catch (error) {
            console.error('Ошибка прокрутки вниз:', error);
        }
    }

    setupScrollTracking() {
        try {
            let scrollTimeout;
            this.addEventListener(this.messagesContainer, 'scroll', () => {
                this.isScrolling = true;
                clearTimeout(scrollTimeout);
                scrollTimeout = this.setTimeout(() => {
                    this.isScrolling = false;
                }, 100);
            });
        } catch (error) {
            console.error('Ошибка настройки отслеживания скролла:', error);
        }
    }

    handleDocumentClick(e) {
        try {
            // Закрытие контекстного меню при клике вне его
            if (this.contextMenu && this.contextMenu.style.display !== 'none' && 
                !this.contextMenu.contains(e.target)) {
                this.hideContextMenu();
            }

            // Закрытие модальных окон при клике на оверлей
            if (e.target.classList.contains('modal-overlay')) {
                this.closeAllModals();
            }
        } catch (error) {
            console.error('Ошибка обработки клика документа:', error);
        }
    }

    closeAllModals() {
        try {
            const modals = document.querySelectorAll('.modal-overlay');
            modals.forEach(modal => {
                if (modal.id !== 'errorModal' || this.errorModal.style.display === 'flex') {
                    modal.style.display = 'none';
                }
            });
        } catch (error) {
            console.error('Ошибка закрытия модальных окон:', error);
        }
    }

    handleSendButtonClick() {
        try {
            if (this.isProcessing) {
                this.showNotification('Подождите завершения текущего запроса', 'warning');
                return;
            }

            const message = this.userInput.value.trim();
            if (!message && this.attachedImages.length === 0) {
                this.showNotification('Введите сообщение или прикрепите файл', 'warning');
                return;
            }

            this.sendMessage(message);
        } catch (error) {
            console.error('Ошибка отправки сообщения:', error);
            this.showError('Ошибка отправки сообщения', error);
        }
    }

    handleInputKeydown(e) {
        try {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendButtonClick();
            }
        } catch (error) {
            console.error('Ошибка обработки ввода:', error);
        }
    }

    handleInputChange() {
        try {
            const hasText = this.userInput.value.trim().length > 0;
            this.clearInputBtn.style.display = hasText ? 'flex' : 'none';
            
            // Авто-ресайз текстового поля
            this.autoResizeTextarea();
        } catch (error) {
            console.error('Ошибка обработки изменения ввода:', error);
        }
    }

    handleModalInputChange() {
        try {
            const hasText = this.editChatNameInput.value.trim().length > 0;
            this.modalClearInput.style.display = hasText ? 'flex' : 'none';
        } catch (error) {
            console.error('Ошибка обработки изменения модального ввода:', error);
        }
    }

    clearModalInput() {
        try {
            this.editChatNameInput.value = '';
            this.modalClearInput.style.display = 'none';
            this.editChatNameInput.focus();
        } catch (error) {
            console.error('Ошибка очистки модального ввода:', error);
        }
    }

    setupAutoResize() {
        try {
            this.autoResizeTextarea();
            this.addEventListener(this.userInput, 'input', () => this.autoResizeTextarea());
        } catch (error) {
            console.error('Ошибка настройки авто-ресайза:', error);
        }
    }

    autoResizeTextarea() {
        try {
            if (!this.userInput) return;
            
            this.userInput.style.height = 'auto';
            const newHeight = Math.min(this.userInput.scrollHeight, 120);
            this.userInput.style.height = newHeight + 'px';
        } catch (error) {
            console.error('Ошибка авто-ресайза текстового поля:', error);
        }
    }

    clearInput() {
        try {
            this.userInput.value = '';
            this.userInput.style.height = 'auto';
            this.clearInputBtn.style.display = 'none';
            this.userInput.focus();
        } catch (error) {
            console.error('Ошибка очистки ввода:', error);
        }
    }

    clearChat() {
        try {
            if (this.conversationHistory.length === 0) {
                this.showNotification('Чат уже пуст', 'info');
                return;
            }

            if (confirm('Вы уверены, что хотите очистить историю чата?')) {
                this.conversationHistory = [];
                this.messagesContainer.innerHTML = '';
                this.saveCurrentSession();
                this.updateSidebarStats();
                this.showNotification('Чат очищен', 'success');
                this.trackUsage('chat_cleared');
            }
        } catch (error) {
            console.error('Ошибка очистки чата:', error);
            this.showError('Ошибка очистки чата', error);
        }
    }

    showHelp() {
        try {
            const helpMessage = `
# 📖 Помощь по KHAI Assistant

## Основные возможности:
- **💬 Общение с ИИ** - Задавайте вопросы и получайте развернутые ответы
- **🎤 Голосовой ввод** - Нажмите на микрофон для диктовки сообщений
- **📎 Прикрепление файлов** - Добавляйте изображения и текстовые файлы
- **🔍 Поиск по чату** - Используйте поиск в шапке для нахождения сообщений
- **💾 Сохранение чатов** - Все диалоги автоматически сохраняются

## Горячие клавиши:
- **Enter** - Отправить сообщение
- **Shift + Enter** - Новая строка
- **Ctrl + /** - Показать справку

## Советы:
- Будьте конкретны в вопросах для лучших ответов
- Используйте контекстное меню (правый клик) для дополнительных действий
- Экспортируйте важные диалоги для сохранения

*Для дополнительной помощи обратитесь к документации.*
            `.trim();

            this.addMessage('assistant', helpMessage, true);
            this.showNotification('Справка показана в чате', 'info');
            this.trackUsage('help_shown');
        } catch (error) {
            console.error('Ошибка показа справки:', error);
            this.showError('Ошибка показа справки', error);
        }
    }

    handleImageMode(e) {
        try {
            e.preventDefault();
            this.showNotification('Генерация изображений скоро будет доступна!', 'info');
            this.trackUsage('image_mode_clicked');
        } catch (error) {
            console.error('Ошибка обработки режима изображений:', error);
        }
    }

    toggleVoiceMode() {
        try {
            this.isVoiceMode = !this.isVoiceMode;
            this.updateModeIndicator();
            
            if (this.isVoiceMode) {
                this.showNotification('Режим голосового ответа активирован', 'info');
            } else {
                this.showNotification('Режим голосового ответа деактивирован', 'info');
            }
            
            this.trackUsage('voice_mode_toggled', { enabled: this.isVoiceMode });
        } catch (error) {
            console.error('Ошибка переключения голосового режима:', error);
            this.showError('Ошибка переключения режима', error);
        }
    }

    setNormalMode() {
        try {
            this.isVoiceMode = false;
            this.isImageMode = false;
            this.currentMode = 'normal';
            this.updateModeIndicator();
            this.showNotification('Обычный режим активирован', 'info');
            this.trackUsage('normal_mode_selected');
        } catch (error) {
            console.error('Ошибка установки обычного режима:', error);
        }
    }

    updateModeIndicator() {
        try {
            // Обновляем активные кнопки режимов
            const modeButtons = document.querySelectorAll('.mode-btn');
            modeButtons.forEach(btn => btn.classList.remove('active'));

            if (this.isVoiceMode) {
                this.generateVoiceBtn.classList.add('active');
            } else if (this.isImageMode) {
                this.generateImageBtn.classList.add('active');
            } else {
                this.normalModeBtn.classList.add('active');
            }
        } catch (error) {
            console.error('Ошибка обновления индикатора режима:', error);
        }
    }

    toggleTheme() {
        try {
            this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', this.currentTheme);
            localStorage.setItem('khai-theme', this.currentTheme);
            
            const icon = this.themeToggle.querySelector('i');
            if (icon) {
                icon.className = this.currentTheme === 'dark' ? 'ti ti-moon' : 'ti ti-sun';
            }
            
            this.showNotification(`Тема изменена на ${this.currentTheme === 'dark' ? 'темную' : 'светлую'}`, 'success');
            this.trackUsage('theme_toggled', { theme: this.currentTheme });
        } catch (error) {
            console.error('Ошибка переключения темы:', error);
            this.showError('Ошибка переключения темы', error);
        }
    }

    loadThemePreference() {
        try {
            const savedTheme = localStorage.getItem('khai-theme') || 'dark';
            this.currentTheme = savedTheme;
            document.body.setAttribute('data-theme', this.currentTheme);
            
            const icon = this.themeToggle?.querySelector('i');
            if (icon) {
                icon.className = this.currentTheme === 'dark' ? 'ti ti-moon' : 'ti ti-sun';
            }
        } catch (error) {
            console.error('Ошибка загрузки темы:', error);
            this.currentTheme = 'dark';
            document.body.setAttribute('data-theme', 'dark');
        }
    }

    loadModelPreference() {
        try {
            const savedModel = localStorage.getItem('khai-model') || 'gpt-5-nano';
            this.currentModel = savedModel;
            this.updateModelSelectButton();
        } catch (error) {
            console.error('Ошибка загрузки модели:', error);
            this.currentModel = 'gpt-5-nano';
        }
    }

    updateModelSelectButton() {
        try {
            if (!this.modelSelectBtn) return;
            
            const modelConfig = this.modelConfig[this.currentModel];
            if (modelConfig) {
                const span = this.modelSelectBtn.querySelector('span');
                if (span) {
                    span.textContent = modelConfig.name;
                }
            }
        } catch (error) {
            console.error('Ошибка обновления кнопки выбора модели:', error);
        }
    }

    openModelSelectModal() {
        try {
            if (!this.modelSelectModal || !this.modelList) return;

            this.modelList.innerHTML = '';
            
            Object.entries(this.modelConfig).forEach(([id, config]) => {
                const modelElement = document.createElement('div');
                modelElement.className = `model-item ${id === this.currentModel ? 'selected' : ''}`;
                modelElement.setAttribute('data-model', id);
                
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
                    this.selectModel(id);
                });
                
                this.modelList.appendChild(modelElement);
            });

            this.modelSelectModal.style.display = 'flex';
        } catch (error) {
            console.error('Ошибка открытия модального окна выбора модели:', error);
            this.showError('Ошибка открытия выбора модели', error);
        }
    }

    closeModelSelectModal() {
        try {
            if (this.modelSelectModal) {
                this.modelSelectModal.style.display = 'none';
            }
        } catch (error) {
            console.error('Ошибка закрытия модального окна выбора модели:', error);
        }
    }

    selectModel(modelId) {
        try {
            if (!this.modelConfig[modelId]) {
                console.error('Неизвестная модель:', modelId);
                return;
            }

            this.currentModel = modelId;
            localStorage.setItem('khai-model', modelId);
            this.updateModelSelectButton();
            this.closeModelSelectModal();
            
            this.showNotification(`Модель изменена на: ${this.modelConfig[modelId].name}`, 'success');
            this.trackUsage('model_changed', { model: modelId });
        } catch (error) {
            console.error('Ошибка выбора модели:', error);
            this.showError('Ошибка выбора модели', error);
        }
    }

    refreshPage() {
        try {
            if (confirm('Обновить страницу? Несохраненные данные могут быть потеряны.')) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Ошибка обновления страницы:', error);
        }
    }

    handleFileSelect(event) {
        try {
            const files = Array.from(event.target.files);
            if (files.length === 0) return;

            // Ограничение на количество файлов
            if (files.length > 5) {
                this.showNotification('Можно прикрепить не более 5 файлов', 'warning');
                return;
            }

            let validFiles = 0;
            
            files.forEach(file => {
                // Проверка размера файла (макс 10MB)
                if (file.size > 10 * 1024 * 1024) {
                    this.showNotification(`Файл ${file.name} слишком большой (макс. 10MB)`, 'warning');
                    return;
                }

                // Проверка типа файла
                const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'text/plain', 'application/pdf', 'application/json'];
                if (!validTypes.includes(file.type) && !file.name.match(/\.(txt|pdf|doc|docx|json)$/i)) {
                    this.showNotification(`Неподдерживаемый формат файла: ${file.name}`, 'warning');
                    return;
                }

                validFiles++;
                this.addAttachedFile(file);
            });

            if (validFiles > 0) {
                this.showNotification(`Добавлено файлов: ${validFiles}`, 'success');
                this.trackUsage('files_attached', { count: validFiles });
            }

            // Сброс input для возможности выбора тех же файлов снова
            event.target.value = '';
        } catch (error) {
            console.error('Ошибка обработки выбора файла:', error);
            this.showError('Ошибка загрузки файла', error);
        }
    }

    addAttachedFile(file) {
        try {
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            fileElement.setAttribute('data-filename', file.name);
            
            const isImage = file.type.startsWith('image/');
            const fileSize = this.formatFileSize(file.size);
            
            fileElement.innerHTML = `
                <div class="file-info">
                    <i class="ti ${isImage ? 'ti-photo' : 'ti-file'}"></i>
                    <div class="file-details">
                        <div class="file-name">${this.escapeHtml(file.name)}</div>
                        <div class="file-size">${fileSize}</div>
                    </div>
                </div>
                <button class="file-remove" title="Удалить файл">
                    <i class="ti ti-x"></i>
                </button>
            `;

            const removeBtn = fileElement.querySelector('.file-remove');
            this.addEventListener(removeBtn, 'click', () => {
                fileElement.remove();
                this.attachedImages = this.attachedImages.filter(f => f.name !== file.name);
            });

            this.attachedFiles.appendChild(fileElement);
            this.attachedImages.push(file);
        } catch (error) {
            console.error('Ошибка добавления прикрепленного файла:', error);
        }
    }

    formatFileSize(bytes) {
        try {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        } catch (error) {
            console.error('Ошибка форматирования размера файла:', error);
            return 'Unknown';
        }
    }

    escapeHtml(text) {
        try {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        } catch (error) {
            console.error('Ошибка экранирования HTML:', error);
            return text;
        }
    }

    setupVoiceRecognition() {
        try {
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                console.warn('Голосовой ввод не поддерживается в этом браузере');
                this.voiceInputBtn.disabled = true;
                this.voiceInputBtn.title = 'Голосовой ввод не поддерживается';
                return;
            }

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'ru-RU';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.voiceInputBtn.classList.add('listening');
                this.showNotification('Слушаю...', 'info');
                this.updateFooterStatus('Распознавание речи...');
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
                    this.showNotification('Речь распознана', 'success');
                } else if (interimTranscript) {
                    // Можно показывать промежуточные результаты, но это может мешать
                    // this.userInput.value = interimTranscript;
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Ошибка распознавания речи:', event.error);
                this.isListening = false;
                this.voiceInputBtn.classList.remove('listening');
                
                let errorMessage = 'Ошибка распознавания речи';
                switch (event.error) {
                    case 'not-allowed':
                        errorMessage = 'Доступ к микрофону запрещен';
                        break;
                    case 'audio-capture':
                        errorMessage = 'Микрофон не найден';
                        break;
                    case 'network':
                        errorMessage = 'Ошибка сети при распознавании';
                        break;
                }
                
                this.showNotification(errorMessage, 'error');
                this.updateFooterStatus('Ошибка распознавания');
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.voiceInputBtn.classList.remove('listening');
                this.updateFooterStatus('Готов к работе');
            };

        } catch (error) {
            console.error('Ошибка настройки распознавания речи:', error);
            this.voiceInputBtn.disabled = true;
            this.showError('Ошибка настройки голосового ввода', error);
        }
    }

    toggleVoiceInput() {
        try {
            if (!this.recognition) {
                this.showNotification('Голосовой ввод не поддерживается', 'warning');
                return;
            }

            if (this.isListening) {
                this.recognition.stop();
            } else {
                // Запрос разрешения на использование микрофона
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(() => {
                        this.recognition.start();
                        this.trackUsage('voice_input_started');
                    })
                    .catch(err => {
                        console.error('Ошибка доступа к микрофону:', err);
                        this.showNotification('Доступ к микрофону запрещен', 'error');
                    });
            }
        } catch (error) {
            console.error('Ошибка переключения голосового ввода:', error);
            this.showError('Ошибка голосового ввода', error);
        }
    }

    startPlaceholderAnimation() {
        try {
            let currentIndex = 0;
            
            const animatePlaceholder = () => {
                if (!this.userInput) return;
                
                this.userInput.placeholder = this.placeholderExamples[currentIndex];
                currentIndex = (currentIndex + 1) % this.placeholderExamples.length;
            };

            // Начальная анимация
            animatePlaceholder();
            
            // Анимация каждые 3 секунды
            this.setInterval(animatePlaceholder, 3000);
        } catch (error) {
            console.error('Ошибка анимации placeholder:', error);
        }
    }

    sendMessage(messageText) {
        try {
            if (this.isProcessing) {
                this.showNotification('Подождите завершения текущего запроса', 'warning');
                return;
            }

            const message = messageText.trim();
            const hasAttachments = this.attachedImages.length > 0;

            if (!message && !hasAttachments) {
                this.showNotification('Введите сообщение или прикрепите файл', 'warning');
                return;
            }

            this.isProcessing = true;
            this.updateSendButtonState();
            this.updateFooterStatus('Отправка запроса...');

            // Сохраняем последнее сообщение пользователя для продолжения
            this.lastUserMessage = message;

            // Добавляем сообщение пользователя в чат
            const userMessageId = this.addMessage('user', message, false, this.attachedImages);
            
            // Очищаем ввод и прикрепленные файлы
            this.clearInput();
            this.clearAttachedFiles();

            // Показываем индикатор набора текста
            const thinkingMessageId = this.showThinkingIndicator();

            // Отправляем запрос к API
            this.sendToAPI(message, thinkingMessageId, userMessageId)
                .catch(error => {
                    console.error('Ошибка отправки сообщения:', error);
                    this.handleAPIError(error, thinkingMessageId);
                })
                .finally(() => {
                    this.isProcessing = false;
                    this.updateSendButtonState();
                    this.updateFooterStatus('Готов к работе');
                });

            this.trackUsage('message_sent', { 
                has_attachments: hasAttachments,
                message_length: message.length 
            });

        } catch (error) {
            console.error('Критическая ошибка отправки сообщения:', error);
            this.isProcessing = false;
            this.updateSendButtonState();
            this.updateFooterStatus('Ошибка отправки');
            this.showError('Критическая ошибка отправки', error);
        }
    }

    async sendToAPI(message, thinkingMessageId, userMessageId) {
        try {
            // Проверяем доступность API
            if (typeof puter === 'undefined') {
                throw new Error('API Puter недоступен. Проверьте подключение к интернету.');
            }

            // Формируем историю сообщений для контекста
            const messages = this.prepareMessagesForAPI(message);

            // Настройки запроса
            const requestOptions = {
                model: this.currentModel,
                messages: messages,
                stream: true,
                max_tokens: 4000
            };

            this.updateFooterStatus('Генерация ответа...');
            this.isGenerating = true;
            this.generationAborted = false;

            // Создаем контроллер для управления потоком
            const controller = new AbortController();
            this.currentStreamController = controller;

            let fullResponse = '';
            let isFirstChunk = true;

            try {
                const response = await puter.ai.chat.completions.create(requestOptions, {
                    signal: controller.signal
                });

                if (!response || !response.body) {
                    throw new Error('Некорректный ответ от API');
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                // Убираем индикатор "думает" и создаем сообщение для ответа
                this.removeThinkingIndicator(thinkingMessageId);
                const aiMessageId = this.createAIResponseMessage();

                while (true) {
                    if (this.generationAborted) {
                        reader.cancel();
                        break;
                    }

                    const { done, value } = await reader.read();
                    
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n').filter(line => line.trim());

                    for (const line of lines) {
                        if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                const content = data.choices[0]?.delta?.content;
                                
                                if (content) {
                                    fullResponse += content;
                                    
                                    if (isFirstChunk) {
                                        isFirstChunk = false;
                                        // Обновляем сообщение первым чанком
                                        this.updateAIResponseMessage(aiMessageId, fullResponse);
                                    } else {
                                        // Добавляем инкрементально для плавного отображения
                                        this.appendToAIResponseMessage(aiMessageId, content);
                                    }
                                    
                                    // Авто-скролл при генерации
                                    if (this.autoScrollEnabled) {
                                        this.scrollToBottom();
                                    }
                                }
                            } catch (parseError) {
                                console.warn('Ошибка парсинга чанка:', parseError, line);
                            }
                        }
                    }
                }

                // Завершаем сообщение
                if (!this.generationAborted) {
                    this.finalizeAIResponseMessage(aiMessageId, fullResponse);
                    this.addToConversationHistory('assistant', fullResponse, aiMessageId);
                    this.saveCurrentSession();
                    
                    // Озвучиваем ответ если включен голосовой режим
                    if (this.isVoiceMode && fullResponse.trim()) {
                        this.setTimeout(() => {
                            this.speakText(fullResponse);
                        }, 500);
                    }
                    
                    this.showNotification('Ответ получен', 'success');
                    this.trackUsage('response_received', { 
                        response_length: fullResponse.length,
                        model: this.currentModel 
                    });
                }

            } catch (streamError) {
                if (streamError.name === 'AbortError') {
                    console.log('Потоковое соединение прервано');
                } else {
                    throw streamError;
                }
            }

        } catch (error) {
            console.error('Ошибка API:', error);
            throw error;
        } finally {
            this.isGenerating = false;
            this.currentStreamController = null;
            this.removeThinkingIndicator(thinkingMessageId);
        }
    }

    prepareMessagesForAPI(userMessage) {
        try {
            const messages = [];
            
            // Добавляем системный промпт
            messages.push({
                role: 'system',
                content: `Ты полезный AI-ассистент KHAI. Будь вежливым, полезным и точным в ответах. 
                Форматируй ответы с использованием Markdown для лучшей читаемости. 
                Если тебе задают вопросы на русском, отвечай на русском.`
            });

            // Добавляем историю разговора (последние 10 сообщений для экономии токенов)
            const recentHistory = this.conversationHistory.slice(-10);
            recentHistory.forEach(msg => {
                messages.push({
                    role: msg.role === 'user' ? 'user' : 'assistant',
                    content: msg.content
                });
            });

            // Добавляем текущее сообщение пользователя
            if (userMessage.trim()) {
                messages.push({
                    role: 'user',
                    content: userMessage
                });
            }

            return messages;
        } catch (error) {
            console.error('Ошибка подготовки сообщений для API:', error);
            return [{
                role: 'user',
                content: userMessage || 'Привет'
            }];
        }
    }

    handleAPIError(error, thinkingMessageId) {
        try {
            this.removeThinkingIndicator(thinkingMessageId);
            
            let errorMessage = 'Произошла ошибка при обработке запроса';
            let errorDetails = error.message || 'Неизвестная ошибка';

            if (error.message.includes('network') || error.message.includes('Network')) {
                errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Превышено время ожидания ответа от сервера.';
            } else if (error.message.includes('quota') || error.message.includes('limit')) {
                errorMessage = 'Превышен лимит запросов. Попробуйте позже.';
            } else if (error.message.includes('Puter')) {
                errorMessage = 'Ошибка подключения к AI-сервису.';
            }

            this.showNotification(errorMessage, 'error');
            this.updateFooterStatus('Ошибка');

            // Добавляем сообщение об ошибке в чат
            this.addMessage('assistant', 
                `**❌ Ошибка**\n\n${errorMessage}\n\n\`\`\`\n${errorDetails}\n\`\`\`\n\nПопробуйте повторить запрос или обратиться в поддержку.`, 
                true
            );

            this.trackUsage('api_error', { 
                error_type: error.name,
                error_message: error.message 
            });

        } catch (handlerError) {
            console.error('Ошибка обработки ошибки API:', handlerError);
            this.showError('Критическая ошибка обработки', handlerError);
        }
    }

    showThinkingIndicator() {
        try {
            const messageId = 'thinking-' + Date.now();
            const messageElement = document.createElement('div');
            messageElement.className = 'message ai-message thinking';
            messageElement.id = messageId;
            
            messageElement.innerHTML = `
                <div class="message-avatar">
                    <i class="ti ti-robot"></i>
                </div>
                <div class="message-content">
                    <div class="thinking-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `;

            this.messagesContainer.appendChild(messageElement);
            this.scrollToBottom();
            
            this.activeTypingIndicator = messageId;
            return messageId;
        } catch (error) {
            console.error('Ошибка показа индикатора набора:', error);
            return null;
        }
    }

    removeThinkingIndicator(messageId) {
        try {
            if (messageId) {
                const element = document.getElementById(messageId);
                if (element) {
                    element.remove();
                }
            }
            this.activeTypingIndicator = null;
        } catch (error) {
            console.error('Ошибка удаления индикатора набора:', error);
        }
    }

    createAIResponseMessage() {
        try {
            const messageId = 'ai-' + Date.now();
            const messageElement = document.createElement('div');
            messageElement.className = 'message ai-message streaming';
            messageElement.id = messageId;
            messageElement.setAttribute('data-message-id', messageId);
            
            messageElement.innerHTML = `
                <div class="message-avatar">
                    <i class="ti ti-robot"></i>
                </div>
                <div class="message-content">
                    <div class="message-text"></div>
                    <div class="message-actions" style="display: none;">
                        <button class="action-copy" title="Копировать">
                            <i class="ti ti-copy"></i>
                        </button>
                        <button class="action-speak" title="Озвучить">
                            <i class="ti ti-volume"></i>
                        </button>
                        <button class="action-regenerate" title="Перегенерировать">
                            <i class="ti ti-refresh"></i>
                        </button>
                    </div>
                </div>
            `;

            this.messagesContainer.appendChild(messageElement);
            this.activeStreamingMessage = messageId;
            
            // Добавляем обработчики для кнопок действий
            this.setupMessageActions(messageElement);
            
            return messageId;
        } catch (error) {
            console.error('Ошибка создания сообщения ответа:', error);
            return null;
        }
    }

    updateAIResponseMessage(messageId, content) {
        try {
            const messageElement = document.getElementById(messageId);
            if (!messageElement) return;

            const messageText = messageElement.querySelector('.message-text');
            if (messageText) {
                messageText.innerHTML = marked.parse(content);
                this.highlightCodeBlocks(messageText);
            }
        } catch (error) {
            console.error('Ошибка обновления сообщения ответа:', error);
        }
    }

    appendToAIResponseMessage(messageId, content) {
        try {
            const messageElement = document.getElementById(messageId);
            if (!messageElement) return;

            const messageText = messageElement.querySelector('.message-text');
            if (messageText) {
                // Для плавного добавления контента
                const currentContent = messageText.textContent || '';
                const newContent = currentContent + content;
                messageText.innerHTML = marked.parse(newContent);
                this.highlightCodeBlocks(messageText);
            }
        } catch (error) {
            console.error('Ошибка добавления к сообщению ответа:', error);
        }
    }

    finalizeAIResponseMessage(messageId, content) {
        try {
            const messageElement = document.getElementById(messageId);
            if (!messageElement) return;

            messageElement.classList.remove('streaming');
            
            const messageText = messageElement.querySelector('.message-text');
            const messageActions = messageElement.querySelector('.message-actions');
            
            if (messageText) {
                messageText.innerHTML = marked.parse(content);
                this.highlightCodeBlocks(messageText);
            }
            
            if (messageActions) {
                messageActions.style.display = 'flex';
            }

            this.activeStreamingMessage = null;
            this.scrollToBottom();
        } catch (error) {
            console.error('Ошибка завершения сообщения ответа:', error);
        }
    }

    highlightCodeBlocks(container) {
        try {
            if (!container) return;
            
            const codeBlocks = container.querySelectorAll('pre code');
            codeBlocks.forEach(block => {
                hljs.highlightElement(block);
            });
        } catch (error) {
            console.error('Ошибка подсветки кода:', error);
        }
    }

    setupMessageActions(messageElement) {
        try {
            const copyBtn = messageElement.querySelector('.action-copy');
            const speakBtn = messageElement.querySelector('.action-speak');
            const regenerateBtn = messageElement.querySelector('.action-regenerate');

            if (copyBtn) {
                this.addEventListener(copyBtn, 'click', () => {
                    const messageText = messageElement.querySelector('.message-text');
                    if (messageText) {
                        this.copyToClipboard(messageText.textContent || messageText.innerText);
                        this.showNotification('Текст скопирован', 'success');
                    }
                });
            }

            if (speakBtn) {
                this.addEventListener(speakBtn, 'click', () => {
                    const messageText = messageElement.querySelector('.message-text');
                    if (messageText) {
                        this.speakText(messageText.textContent || messageText.innerText);
                    }
                });
            }

            if (regenerateBtn) {
                this.addEventListener(regenerateBtn, 'click', () => {
                    this.regenerateLastResponse();
                });
            }
        } catch (error) {
            console.error('Ошибка настройки действий сообщения:', error);
        }
    }

    addMessage(role, content, isFinal = true, attachments = []) {
        try {
            const messageId = `${role}-${Date.now()}`;
            const messageElement = document.createElement('div');
            messageElement.className = `message ${role}-message`;
            messageElement.setAttribute('data-message-id', messageId);

            let avatarIcon = 'ti ti-user';
            if (role === 'assistant') {
                avatarIcon = 'ti ti-robot';
            } else if (role === 'system') {
                avatarIcon = 'ti ti-info-circle';
            }

            let attachmentsHtml = '';
            if (attachments.length > 0 && role === 'user') {
                attachmentsHtml = `
                    <div class="message-attachments">
                        ${attachments.map(file => `
                            <div class="attachment">
                                <i class="ti ${file.type.startsWith('image/') ? 'ti-photo' : 'ti-file'}"></i>
                                <span>${this.escapeHtml(file.name)}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            messageElement.innerHTML = `
                <div class="message-avatar">
                    <i class="${avatarIcon}"></i>
                </div>
                <div class="message-content">
                    ${attachmentsHtml}
                    <div class="message-text">${isFinal ? marked.parse(content) : this.escapeHtml(content)}</div>
                    ${role === 'assistant' && isFinal ? `
                        <div class="message-actions">
                            <button class="action-copy" title="Копировать">
                                <i class="ti ti-copy"></i>
                            </button>
                            <button class="action-speak" title="Озвучить">
                                <i class="ti ti-volume"></i>
                            </button>
                            <button class="action-regenerate" title="Перегенерировать">
                                <i class="ti ti-refresh"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
            `;

            this.messagesContainer.appendChild(messageElement);
            
            if (isFinal) {
                this.highlightCodeBlocks(messageElement);
                this.setupMessageActions(messageElement);
                this.addToConversationHistory(role, content, messageId);
                this.saveCurrentSession();
            }

            this.scrollToBottom();
            return messageId;
        } catch (error) {
            console.error('Ошибка добавления сообщения:', error);
            this.showError('Ошибка добавления сообщения', error);
            return null;
        }
    }

    addToConversationHistory(role, content, messageId) {
        try {
            this.conversationHistory.push({
                id: messageId,
                role: role,
                content: content,
                timestamp: Date.now()
            });

            // Ограничиваем историю последними 50 сообщениями для экономии памяти
            if (this.conversationHistory.length > 50) {
                this.conversationHistory = this.conversationHistory.slice(-50);
            }

            this.updateSidebarStats();
        } catch (error) {
            console.error('Ошибка добавления в историю:', error);
        }
    }

    clearAttachedFiles() {
        try {
            this.attachedFiles.innerHTML = '';
            this.attachedImages = [];
        } catch (error) {
            console.error('Ошибка очистки прикрепленных файлов:', error);
        }
    }

    updateSendButtonState() {
        try {
            if (this.isProcessing) {
                this.sendBtn.disabled = true;
                this.sendBtn.innerHTML = '<i class="ti ti-loader-2"></i>';
                this.sendBtn.classList.add('loading');
            } else {
                this.sendBtn.disabled = false;
                this.sendBtn.innerHTML = '<i class="ti ti-send"></i>';
                this.sendBtn.classList.remove('loading');
            }
        } catch (error) {
            console.error('Ошибка обновления состояния кнопки отправки:', error);
        }
    }

    updateFooterStatus(status) {
        try {
            if (this.footerStatus) {
                this.footerStatus.textContent = status;
            }
        } catch (error) {
            console.error('Ошибка обновления статуса футера:', error);
        }
    }

    speakText(text) {
        try {
            // Останавливаем предыдущее воспроизведение
            if (this.isSpeaking && this.currentUtterance) {
                speechSynthesis.cancel();
                this.isSpeaking = false;
                if (this.currentSpeakButton) {
                    this.currentSpeakButton.innerHTML = '<i class="ti ti-volume"></i>';
                }
                return;
            }

            if (!('speechSynthesis' in window)) {
                this.showNotification('Озвучивание текста не поддерживается', 'warning');
                return;
            }

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ru-RU';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 0.8;

            utterance.onstart = () => {
                this.isSpeaking = true;
                this.currentUtterance = utterance;
                if (this.currentSpeakButton) {
                    this.currentSpeakButton.innerHTML = '<i class="ti ti-player-pause"></i>';
                }
                this.updateFooterStatus('Озвучивание...');
            };

            utterance.onend = () => {
                this.isSpeaking = false;
                this.currentUtterance = null;
                if (this.currentSpeakButton) {
                    this.currentSpeakButton.innerHTML = '<i class="ti ti-volume"></i>';
                }
                this.updateFooterStatus('Готов к работе');
            };

            utterance.onerror = (event) => {
                console.error('Ошибка озвучивания:', event.error);
                this.isSpeaking = false;
                this.currentUtterance = null;
                if (this.currentSpeakButton) {
                    this.currentSpeakButton.innerHTML = '<i class="ti ti-volume"></i>';
                }
                this.updateFooterStatus('Ошибка озвучивания');
                this.showNotification('Ошибка озвучивания текста', 'error');
            };

            speechSynthesis.speak(utterance);
            this.trackUsage('text_to_speech', { text_length: text.length });

        } catch (error) {
            console.error('Ошибка озвучивания текста:', error);
            this.showError('Ошибка озвучивания', error);
        }
    }

    regenerateLastResponse() {
        try {
            if (this.isProcessing) {
                this.showNotification('Подождите завершения текущего запроса', 'warning');
                return;
            }

            // Находим последнее сообщение пользователя и ответ ИИ
            const userMessages = this.conversationHistory.filter(m => m.role === 'user');
            if (userMessages.length === 0) {
                this.showNotification('Нет сообщений для перегенерации', 'warning');
                return;
            }

            const lastUserMessage = userMessages[userMessages.length - 1];
            
            // Удаляем последний ответ ИИ
            const lastAIMessage = this.conversationHistory.filter(m => m.role === 'assistant').pop();
            if (lastAIMessage) {
                this.conversationHistory = this.conversationHistory.filter(m => m.id !== lastAIMessage.id);
                const messageElement = document.querySelector(`[data-message-id="${lastAIMessage.id}"]`);
                if (messageElement) {
                    messageElement.remove();
                }
            }

            // Отправляем запрос снова
            this.sendMessage(lastUserMessage.content);
            this.showNotification('Перегенерация ответа...', 'info');
            this.trackUsage('response_regenerated');

        } catch (error) {
            console.error('Ошибка перегенерации ответа:', error);
            this.showError('Ошибка перегенерации', error);
        }
    }

    continueLastResponse() {
        try {
            if (this.isProcessing) {
                this.showNotification('Подождите завершения текущего запроса', 'warning');
                return;
            }

            if (!this.lastUserMessage) {
                this.showNotification('Нет предыдущего сообщения для продолжения', 'warning');
                return;
            }

            this.sendMessage(`Продолжи: ${this.lastUserMessage}`);
            this.showNotification('Продолжение ответа...', 'info');
            this.trackUsage('response_continued');

        } catch (error) {
            console.error('Ошибка продолжения ответа:', error);
            this.showError('Ошибка продолжения', error);
        }
    }

    // Управление чатами
    loadChatSessions() {
        try {
            const saved = localStorage.getItem('khai-chat-sessions');
            if (saved) {
                const sessions = JSON.parse(saved);
                this.chatSessions = new Map(sessions);
            }
        } catch (error) {
            console.error('Ошибка загрузки сессий чатов:', error);
            this.chatSessions = new Map();
        }
    }

    saveChatSessions() {
        try {
            const sessionsArray = Array.from(this.chatSessions.entries());
            localStorage.setItem('khai-chat-sessions', JSON.stringify(sessionsArray));
        } catch (error) {
            console.error('Ошибка сохранения сессий чатов:', error);
        }
    }

    loadCurrentSession() {
        try {
            const session = this.chatSessions.get(this.currentChatId);
            if (session) {
                this.conversationHistory = session.history || [];
                this.currentChatName.textContent = session.name || 'Основной чат';
                this.renderConversationHistory();
            }
        } catch (error) {
            console.error('Ошибка загрузки текущей сессии:', error);
            this.conversationHistory = [];
        }
    }

    saveCurrentSession() {
        try {
            const session = {
                name: this.currentChatName.textContent,
                history: this.conversationHistory,
                timestamp: Date.now(),
                model: this.currentModel
            };
            
            this.chatSessions.set(this.currentChatId, session);
            this.saveChatSessions();
            this.updateChatList();
        } catch (error) {
            console.error('Ошибка сохранения текущей сессии:', error);
        }
    }

    renderConversationHistory() {
        try {
            this.messagesContainer.innerHTML = '';
            
            this.conversationHistory.forEach(message => {
                this.addMessage(message.role, message.content, true);
            });
            
            this.scrollToBottom();
        } catch (error) {
            console.error('Ошибка рендеринга истории:', error);
        }
    }

    createNewChat() {
        try {
            const chatId = 'chat-' + Date.now();
            const chatName = `Чат ${this.chatSessions.size + 1}`;
            
            this.currentChatId = chatId;
            this.conversationHistory = [];
            this.currentChatName.textContent = chatName;
            
            this.messagesContainer.innerHTML = '';
            this.saveCurrentSession();
            this.closeSidebar();
            
            this.showNotification('Новый чат создан', 'success');
            this.trackUsage('new_chat_created');
        } catch (error) {
            console.error('Ошибка создания нового чата:', error);
            this.showError('Ошибка создания чата', error);
        }
    }

    setupChatSelector() {
        try {
            this.updateChatList();
        } catch (error) {
            console.error('Ошибка настройки селектора чатов:', error);
        }
    }

    updateChatList() {
        try {
            if (!this.chatList) return;

            this.chatList.innerHTML = '';
            
            this.chatSessions.forEach((session, chatId) => {
                const chatItem = document.createElement('div');
                chatItem.className = `chat-item ${chatId === this.currentChatId ? 'active' : ''}`;
                chatItem.setAttribute('data-chat-id', chatId);
                
                const messageCount = session.history ? session.history.filter(m => m.role === 'user').length : 0;
                const lastActive = session.timestamp ? new Date(session.timestamp).toLocaleDateString() : 'Неизвестно';
                
                chatItem.innerHTML = `
                    <div class="chat-info">
                        <div class="chat-name">${this.escapeHtml(session.name || 'Без названия')}</div>
                        <div class="chat-meta">
                            <span>${messageCount} сообщений</span>
                            <span>•</span>
                            <span>${lastActive}</span>
                        </div>
                    </div>
                    <div class="chat-actions">
                        <button class="chat-action edit-chat" title="Редактировать название">
                            <i class="ti ti-edit"></i>
                        </button>
                        <button class="chat-action delete-chat" title="Удалить чат">
                            <i class="ti ti-trash"></i>
                        </button>
                    </div>
                `;

                // Обработчики для переключения чатов
                this.addEventListener(chatItem, 'click', (e) => {
                    if (!e.target.closest('.chat-actions')) {
                        this.switchToChat(chatId);
                    }
                });

                // Обработчики для действий
                const editBtn = chatItem.querySelector('.edit-chat');
                const deleteBtn = chatItem.querySelector('.delete-chat');
                
                if (editBtn) {
                    this.addEventListener(editBtn, 'click', (e) => {
                        e.stopPropagation();
                        this.editChatName(chatId, session.name);
                    });
                }
                
                if (deleteBtn) {
                    this.addEventListener(deleteBtn, 'click', (e) => {
                        e.stopPropagation();
                        this.deleteChat(chatId, session.name);
                    });
                }

                this.chatList.appendChild(chatItem);
            });
        } catch (error) {
            console.error('Ошибка обновления списка чатов:', error);
        }
    }

    switchToChat(chatId) {
        try {
            if (this.currentChatId === chatId) {
                this.closeSidebar();
                return;
            }

            // Сохраняем текущую сессию перед переключением
            this.saveCurrentSession();

            // Переключаемся на новую сессию
            this.currentChatId = chatId;
            this.loadCurrentSession();
            this.closeSidebar();
            
            this.showNotification('Чат переключен', 'success');
            this.trackUsage('chat_switched');
        } catch (error) {
            console.error('Ошибка переключения чата:', error);
            this.showError('Ошибка переключения чата', error);
        }
    }

    editChatName(chatId, currentName) {
        try {
            this.editingChatId = chatId;
            this.editChatNameInput.value = currentName || '';
            this.handleModalInputChange();
            this.editChatModal.style.display = 'flex';
            this.editChatNameInput.focus();
            this.editChatNameInput.select();
        } catch (error) {
            console.error('Ошибка редактирования названия чата:', error);
            this.showError('Ошибка редактирования', error);
        }
    }

    closeEditChatModal() {
        try {
            this.editChatModal.style.display = 'none';
            this.editingChatId = null;
        } catch (error) {
            console.error('Ошибка закрытия модального окна редактирования:', error);
        }
    }

    saveChatName() {
        try {
            const newName = this.editChatNameInput.value.trim();
            if (!newName) {
                this.showNotification('Введите название чата', 'warning');
                return;
            }

            if (this.editingChatId) {
                const session = this.chatSessions.get(this.editingChatId);
                if (session) {
                    session.name = newName;
                    this.chatSessions.set(this.editingChatId, session);
                    this.saveChatSessions();
                    
                    if (this.editingChatId === this.currentChatId) {
                        this.currentChatName.textContent = newName;
                    }
                    
                    this.updateChatList();
                    this.showNotification('Название чата сохранено', 'success');
                }
            }

            this.closeEditChatModal();
            this.trackUsage('chat_name_edited');
        } catch (error) {
            console.error('Ошибка сохранения названия чата:', error);
            this.showError('Ошибка сохранения', error);
        }
    }

    deleteChat(chatId, chatName) {
        try {
            if (!confirm(`Удалить чат "${chatName || 'Без названия'}"? Это действие нельзя отменить.`)) {
                return;
            }

            this.chatSessions.delete(chatId);
            
            if (chatId === this.currentChatId) {
                // Если удаляем активный чат, переключаемся на первый доступный или создаем новый
                const remainingChats = Array.from(this.chatSessions.keys());
                if (remainingChats.length > 0) {
                    this.switchToChat(remainingChats[0]);
                } else {
                    this.createNewChat();
                }
            }
            
            this.saveChatSessions();
            this.showNotification('Чат удален', 'success');
            this.trackUsage('chat_deleted');
        } catch (error) {
            console.error('Ошибка удаления чата:', error);
            this.showError('Ошибка удаления чата', error);
        }
    }

    showDeleteAllChatsModal() {
        try {
            this.deleteAllChatsModal.style.display = 'flex';
        } catch (error) {
            console.error('Ошибка показа модального окна удаления всех чатов:', error);
        }
    }

    closeDeleteAllChatsModal() {
        try {
            this.deleteAllChatsModal.style.display = 'none';
        } catch (error) {
            console.error('Ошибка закрытия модального окна удаления всех чатов:', error);
        }
    }

    deleteAllChats() {
        try {
            this.chatSessions.clear();
            this.createNewChat();
            this.closeDeleteAllChatsModal();
            this.showNotification('Все чаты удалены', 'success');
            this.trackUsage('all_chats_deleted');
        } catch (error) {
            console.error('Ошибка удаления всех чатов:', error);
            this.showError('Ошибка удаления чатов', error);
        }
    }

    exportChatSession() {
        try {
            const session = {
                name: this.currentChatName.textContent,
                history: this.conversationHistory,
                timestamp: Date.now(),
                model: this.currentModel,
                export_version: '1.0'
            };

            const dataStr = JSON.stringify(session, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `khai-chat-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            this.showNotification('Чат экспортирован', 'success');
            this.trackUsage('chat_exported');
        } catch (error) {
            console.error('Ошибка экспорта чата:', error);
            this.showError('Ошибка экспорта', error);
        }
    }

    importChatSession() {
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
                        const session = JSON.parse(event.target.result);
                        
                        // Валидация импортируемых данных
                        if (!session.history || !Array.isArray(session.history)) {
                            throw new Error('Некорректный формат файла чата');
                        }

                        const chatId = 'imported-' + Date.now();
                        this.chatSessions.set(chatId, session);
                        this.saveChatSessions();
                        this.switchToChat(chatId);
                        
                        this.showNotification('Чат импортирован', 'success');
                        this.trackUsage('chat_imported');
                    } catch (parseError) {
                        console.error('Ошибка парсинга импортируемого файла:', parseError);
                        this.showNotification('Ошибка импорта: некорректный формат файла', 'error');
                    }
                };
                
                reader.readAsText(file);
            };
            
            input.click();
        } catch (error) {
            console.error('Ошибка импорта чата:', error);
            this.showError('Ошибка импорта', error);
        }
    }

    toggleSidebar() {
        try {
            this.sidebarMenu.classList.add('active');
            this.sidebarOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.updateSidebarStats();
        } catch (error) {
            console.error('Ошибка открытия сайдбара:', error);
        }
    }

    closeSidebar() {
        try {
            this.sidebarMenu.classList.remove('active');
            this.sidebarOverlay.classList.remove('active');
            document.body.style.overflow = '';
        } catch (error) {
            console.error('Ошибка закрытия сайдбара:', error);
        }
    }

    updateSidebarStats() {
        try {
            if (!this.sidebarStats) return;

            const totalMessages = this.conversationHistory.length;
            const userMessages = this.conversationHistory.filter(m => m.role === 'user').length;
            const aiMessages = this.conversationHistory.filter(m => m.role === 'assistant').length;
            const totalChats = this.chatSessions.size;

            this.sidebarStats.textContent = 
                `${totalMessages} сообщений (${userMessages}/пользователь, ${aiMessages}/ИИ) в ${totalChats} чатах`;
        } catch (error) {
            console.error('Ошибка обновления статистики сайдбара:', error);
        }
    }

    loadUsageStats() {
        try {
            const saved = localStorage.getItem('khai-usage-stats');
            if (saved) {
                this.usageStats = { ...this.usageStats, ...JSON.parse(saved) };
            }
            
            this.usageStats.sessions++;
            this.usageStats.lastActive = Date.now();
            this.saveUsageStats();
        } catch (error) {
            console.error('Ошибка загрузки статистики использования:', error);
        }
    }

    saveUsageStats() {
        try {
            localStorage.setItem('khai-usage-stats', JSON.stringify(this.usageStats));
        } catch (error) {
            console.error('Ошибка сохранения статистики использования:', error);
        }
    }

    trackUsage(event, data = {}) {
        try {
            this.usageStats.totalMessages++;
            this.usageStats.lastActive = Date.now();
            
            console.log(`[Analytics] ${event}:`, data);
            this.saveUsageStats();
        } catch (error) {
            console.error('Ошибка трекинга использования:', error);
        }
    }

    showNotification(message, type = 'info') {
        try {
            // Создаем уведомление
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

            // Добавляем в тело документа
            document.body.appendChild(notification);

            // Показываем с анимацией
            this.setTimeout(() => {
                notification.classList.add('show');
            }, 10);

            // Обработчик закрытия
            const closeBtn = notification.querySelector('.notification-close');
            this.addEventListener(closeBtn, 'click', () => {
                this.hideNotification(notification);
            });

            // Автоматическое закрытие
            this.setTimeout(() => {
                this.hideNotification(notification);
            }, 5000);

        } catch (error) {
            console.error('Ошибка показа уведомления:', error);
            // Fallback: используем console для критически важных уведомлений
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
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

    hideNotification(notification) {
        try {
            notification.classList.remove('show');
            this.setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        } catch (error) {
            console.error('Ошибка скрытия уведомления:', error);
        }
    }

    handleBeforeUnload() {
        try {
            this.saveCurrentSession();
            this.saveUsageStats();
            
            // Очистка ресурсов
            if (this.isSpeaking) {
                speechSynthesis.cancel();
            }
            
            if (this.isListening && this.recognition) {
                this.recognition.stop();
            }
            
            if (this.isGenerating && this.currentStreamController) {
                this.currentStreamController.abort();
            }
        } catch (error) {
            console.error('Ошибка обработки beforeunload:', error);
        }
    }

    // Вспомогательные методы для управления таймерами и событиями
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

    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        
        if (!this.activeEventListeners.has(element)) {
            this.activeEventListeners.set(element, new Map());
        }
        
        const elementEvents = this.activeEventListeners.get(element);
        if (!elementEvents.has(event)) {
            elementEvents.set(event, new Set());
        }
        
        elementEvents.get(event).add(handler);
    }

    removeEventListener(element, event, handler) {
        element.removeEventListener(event, handler);
        
        if (this.activeEventListeners.has(element)) {
            const elementEvents = this.activeEventListeners.get(element);
            if (elementEvents.has(event)) {
                elementEvents.get(event).delete(handler);
            }
        }
    }

    // Очистка ресурсов
    destroy() {
        try {
            // Очистка всех таймеров
            this.activeTimeouts.forEach(timerId => {
                clearTimeout(timerId);
                clearInterval(timerId);
            });
            this.activeTimeouts.clear();

            // Удаление всех обработчиков событий
            this.activeEventListeners.forEach((events, element) => {
                events.forEach((handlers, event) => {
                    handlers.forEach(handler => {
                        element.removeEventListener(event, handler);
                    });
                });
            });
            this.activeEventListeners.clear();

            // Остановка голосовых функций
            if (this.isSpeaking) {
                speechSynthesis.cancel();
            }
            
            if (this.isListening && this.recognition) {
                this.recognition.stop();
            }
            
            if (this.isGenerating && this.currentStreamController) {
                this.currentStreamController.abort();
            }

            // Сохранение данных
            this.handleBeforeUnload();

            console.log('KHAI Assistant успешно уничтожен');
        } catch (error) {
            console.error('Ошибка уничтожения KHAI Assistant:', error);
        }
    }
}

// Инициализация приложения когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.khaiAssistant = new KHAIAssistan
