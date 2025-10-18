// Основной класс приложения
class KHAIAssistant {
    constructor() {
        this.currentChatId = 'default';
        this.chats = new Map();
        this.currentModel = 'gpt-4-turbo';
        this.isGenerating = false;
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.currentAudio = null;
        this.puter = null;
        this.isOnline = true;
        this.searchResults = [];
        this.currentSearchIndex = -1;
        this.isReadingMode = false;
        this.theme = 'dark';
        this.editingChatId = null;
        this.recognition = null;
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.activeTimeouts = new Set();
        this.activeEventListeners = new Map();
        
        this.initializeApp();
    }

    // Инициализация приложения
    async initializeApp() {
        await this.initializePuter();
        this.loadChats();
        this.loadTheme();
        this.initializeEventListeners();
        this.updateUI();
        this.showNotification('KHAI — Чат с ИИ готов к работе!', 'success');
    }

    // Инициализация Puter AI SDK
    async initializePuter() {
        try {
            if (typeof puter !== 'undefined') {
                this.puter = await puter.ai();
                console.log('Puter AI SDK инициализирован');
            } else {
                console.warn('Puter AI SDK не загружен, работа в офлайн-режиме');
                this.isOnline = false;
            }
        } catch (error) {
            console.error('Ошибка инициализации Puter AI SDK:', error);
            this.isOnline = false;
            this.showNotification('Ошибка подключения к AI сервису', 'error');
        }
    }

    // Загрузка темы
    loadTheme() {
        const savedTheme = localStorage.getItem('khai_theme');
        if (savedTheme) {
            this.theme = savedTheme;
            document.documentElement.setAttribute('data-theme', this.theme);
            this.updateThemeIcon();
        }
    }

    // Сохранение темы
    saveTheme() {
        localStorage.setItem('khai_theme', this.theme);
    }

    // Переключение темы
    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.theme);
        this.updateThemeIcon();
        this.saveTheme();
        this.showNotification(`Тема изменена на ${this.theme === 'dark' ? 'тёмную' : 'светлую'}`, 'success');
    }

    // Обновление иконки темы
    updateThemeIcon() {
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.className = this.theme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
        }
    }

    // Загрузка чатов из localStorage
    loadChats() {
        const savedChats = localStorage.getItem('khai_chats');
        if (savedChats) {
            try {
                const chatsData = JSON.parse(savedChats);
                chatsData.forEach(chat => {
                    this.chats.set(chat.id, chat);
                });
            } catch (error) {
                console.error('Ошибка загрузки чатов:', error);
                this.createDefaultChat();
            }
        } else {
            this.createDefaultChat();
        }

        this.renderChatList();
        this.loadCurrentChat();
    }

    // Создание чата по умолчанию
    createDefaultChat() {
        const defaultChat = {
            id: 'default',
            name: 'Основной чат',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.chats.set('default', defaultChat);
        this.currentChatId = 'default';
        this.saveChats();
    }

    // Сохранение чатов в localStorage
    saveChats() {
        const chatsArray = Array.from(this.chats.values());
        localStorage.setItem('khai_chats', JSON.stringify(chatsArray));
    }

    // Загрузка текущего чата
    loadCurrentChat() {
        const chat = this.chats.get(this.currentChatId);
        if (chat) {
            this.renderMessages(chat.messages);
            this.updateChatInfo();
            this.updateMinimap();
        } else {
            this.createDefaultChat();
            this.loadCurrentChat();
        }
    }

    // Инициализация обработчиков событий
    initializeEventListeners() {
        // Основные обработчики
        this.addEventListener(document.getElementById('sendBtn'), 'click', () => this.sendMessage());
        this.addEventListener(document.getElementById('userInput'), 'keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        this.addEventListener(document.getElementById('userInput'), 'input', (e) => {
            this.autoResizeTextarea(e.target);
            this.toggleClearInputButton();
        });
        this.addEventListener(document.getElementById('clearInputBtn'), 'click', () => {
            document.getElementById('userInput').value = '';
            this.autoResizeTextarea(document.getElementById('userInput'));
            this.toggleClearInputButton();
        });

        // Голосовой ввод
        this.addEventListener(document.getElementById('voiceInputBtn'), 'click', () => this.toggleVoiceInput());

        // Прикрепление файлов
        this.addEventListener(document.getElementById('attachFileBtn'), 'click', () => {
            document.getElementById('fileInput').click();
        });
        this.addEventListener(document.getElementById('fileInput'), 'change', (e) => this.handleFileUpload(e));

        // Управление чатами
        this.addEventListener(document.getElementById('newChatBtn'), 'click', () => this.createNewChat());
        this.addEventListener(document.getElementById('footerClearChatBtn'), 'click', () => this.clearCurrentChat());

        // Боковое меню
        this.addEventListener(document.getElementById('menuToggle'), 'click', () => this.toggleSidebar());
        this.addEventListener(document.getElementById('sidebarClose'), 'click', () => this.toggleSidebar());
        this.addEventListener(document.getElementById('sidebarOverlay'), 'click', () => this.toggleSidebar());

        // Выбор модели
        this.addEventListener(document.getElementById('modelSelectBtn'), 'click', () => this.showModelModal());
        this.addEventListener(document.getElementById('modelModalOverlay'), 'click', (e) => {
            if (e.target === e.currentTarget) this.hideModelModal();
        });
        this.addEventListener(document.getElementById('modelModalClose'), 'click', () => this.hideModelModal());
        this.addEventListener(document.getElementById('modelModalCancel'), 'click', () => this.hideModelModal());
        this.addEventListener(document.getElementById('modelModalConfirm'), 'click', () => this.confirmModelSelection());

        // Режимы генерации
        this.addEventListener(document.getElementById('normalModeBtn'), 'click', () => this.setGenerationMode('normal'));
        this.addEventListener(document.getElementById('generateVoiceBtn'), 'click', () => this.setGenerationMode('voice'));
        this.addEventListener(document.getElementById('generateImageBtn'), 'click', () => this.setGenerationMode('image'));

        // Поиск
        this.addEventListener(document.getElementById('headerSearch'), 'input', (e) => this.handleSearch(e.target.value));
        this.addEventListener(document.getElementById('headerSearchClear'), 'click', () => this.clearSearch());

        // Навигация
        this.addEventListener(document.getElementById('scrollToLastAI'), 'click', () => this.scrollToLastAIMessage());
        this.addEventListener(document.getElementById('scrollToBottom'), 'click', () => this.scrollToBottom());

        // Помощь
        this.addEventListener(document.getElementById('footerHelpBtn'), 'click', () => this.showHelp());

        // Скачивание истории
        this.addEventListener(document.getElementById('footerDownloadBtn'), 'click', () => this.downloadChatHistory());

        // Мини-карта
        this.addEventListener(document.getElementById('chatMinimap'), 'click', (e) => this.handleMinimapClick(e));

        // Переключение темы
        this.addEventListener(document.getElementById('themeToggleBtn'), 'click', () => this.toggleTheme());

        // Обработчики для кнопок редактирования чатов
        this.delegateEvent('click', '.chat-item', (e, target) => this.selectChat(target.dataset.chatId));
        this.delegateEvent('click', '.edit-chat-btn', (e, target) => {
            e.stopPropagation();
            this.editChatName(target.closest('.chat-item').dataset.chatId);
        });
        this.delegateEvent('click', '.delete-chat-btn', (e, target) => {
            e.stopPropagation();
            this.deleteChat(target.closest('.chat-item').dataset.chatId);
        });

        // Обработчики для кнопок сообщений
        this.delegateEvent('click', '.copy-code-btn', (e, target) => this.copyCode(target));
        this.delegateEvent('click', '.speak-btn', (e, target) => this.toggleSpeech(target));
        this.delegateEvent('click', '.copy-message-btn', (e, target) => this.copyMessage(target));
        this.delegateEvent('click', '.regenerate-btn', (e, target) => this.regenerateMessage(target));

        // Обработчики для прикрепленных файлов
        this.delegateEvent('click', '.remove-file', (e, target) => this.removeAttachedFile(target.dataset.fileId));

        // Обработчики для модальных окон
        this.addEventListener(document.getElementById('editChatModal'), 'click', (e) => {
            if (e.target === e.currentTarget) this.hideEditChatModal();
        });
        this.addEventListener(document.getElementById('editChatModalClose'), 'click', () => this.hideEditChatModal());
        this.addEventListener(document.getElementById('editChatModalCancel'), 'click', () => this.hideEditChatModal());
        this.addEventListener(document.getElementById('editChatModalSave'), 'click', () => this.saveChatName());
        this.addEventListener(document.getElementById('modalClearInput'), 'click', () => {
            document.getElementById('editChatNameInput').value = '';
            document.getElementById('modalClearInput').style.display = 'none';
        });
        this.addEventListener(document.getElementById('editChatNameInput'), 'input', (e) => {
            document.getElementById('modalClearInput').style.display = e.target.value ? 'flex' : 'none';
        });

        // Обработка изменения размера окна
        this.addEventListener(window, 'resize', () => this.handleResize());
        
        // Обработка скролла для мини-карты
        this.addEventListener(document.getElementById('messagesContainer'), 'scroll', () => this.updateMinimapViewport());

        // Обработчики для режима чтения
        this.setupReadingModeListeners();

        // Обработка перед закрытием страницы
        this.addEventListener(window, 'beforeunload', () => this.handleBeforeUnload());

        // Инициализация Service Worker для PWA
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(() => console.log('Service Worker зарегистрирован'))
                .catch(error => console.error('Ошибка регистрации Service Worker:', error));
        }
    }

    // Настройка обработчиков для режима чтения
    setupReadingModeListeners() {
        let touchStartY = 0;
        let touchStartTime = 0;
        let isScrolling = false;
        let isSelecting = false;

        // Touch events
        this.addEventListener(document, 'touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
            isScrolling = false;
            isSelecting = false;
        });

        this.addEventListener(document, 'touchmove', (e) => {
            isScrolling = true;
        });

        this.addEventListener(document, 'touchend', (e) => {
            const touchEndTime = Date.now();
            const touchDuration = touchEndTime - touchStartTime;
            
            // Long press (500ms) or scrolling triggers reading mode
            if (touchDuration > 500 || isScrolling) {
                this.toggleReadingMode(true);
            }
        });

        // Mouse events
        let mouseDownTime = 0;
        let isMouseDown = false;

        this.addEventListener(document, 'mousedown', (e) => {
            mouseDownTime = Date.now();
            isMouseDown = true;
            isSelecting = window.getSelection().toString().length > 0;
        });

        this.addEventListener(document, 'mouseup', (e) => {
            if (isMouseDown) {
                const mouseUpTime = Date.now();
                const mouseDuration = mouseUpTime - mouseDownTime;
                
                // Long click (500ms) or text selection triggers reading mode
                if (mouseDuration > 500 || isSelecting) {
                    this.toggleReadingMode(true);
                }
            }
            isMouseDown = false;
            isSelecting = false;
        });

        // Click outside to exit reading mode
        this.addEventListener(document, 'click', (e) => {
            if (this.isReadingMode && !e.target.closest('.message') && 
                !e.target.closest('.chat-minimap-container')) {
                this.toggleReadingMode(false);
            }
        });
    }

    // Переключение режима чтения
    toggleReadingMode(enable) {
        if (enable === undefined) {
            this.isReadingMode = !this.isReadingMode;
        } else {
            this.isReadingMode = enable;
        }

        document.body.classList.toggle('reading-mode', this.isReadingMode);
        document.getElementById('messagesContainer').classList.toggle('full-width', this.isReadingMode);

        if (this.isReadingMode) {
            this.showNotification('Режим чтения включен. Нажмите в любое место для выхода.', 'info');
        }
    }

    // Делегирование событий
    delegateEvent(event, selector, callback) {
        this.addEventListener(document, event, (e) => {
            if (e.target.matches(selector)) {
                callback(e, e.target);
            }
        });
    }

    // Безопасное добавление обработчиков событий
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
        
        // Сохраняем для возможности очистки
        if (!this.activeEventListeners.has(element)) {
            this.activeEventListeners.set(element, []);
        }
        this.activeEventListeners.get(element).push({ event, handler: wrappedHandler });
    }

    // Автоматическое изменение высоты textarea
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    // Переключение кнопки очистки ввода
    toggleClearInputButton() {
        const input = document.getElementById('userInput');
        const clearBtn = document.getElementById('clearInputBtn');
        if (clearBtn) {
            clearBtn.style.display = input.value ? 'flex' : 'none';
        }
    }

    // Отправка сообщения
    async sendMessage() {
        if (this.isGenerating) {
            this.stopGeneration();
            return;
        }

        const input = document.getElementById('userInput');
        const message = input.value.trim();
        const attachedFiles = Array.from(document.querySelectorAll('.attached-file')).map(file => ({
            name: file.dataset.fileName,
            type: file.dataset.fileType,
            content: file.dataset.fileContent
        }));

        if (!message && attachedFiles.length === 0) {
            this.showNotification('Введите сообщение или прикрепите файл', 'warning');
            return;
        }

        // Добавление сообщения пользователя
        const userMessage = {
            id: this.generateId(),
            type: 'user',
            content: message,
            files: attachedFiles,
            timestamp: new Date().toISOString(),
            model: this.currentModel
        };

        this.addMessage(userMessage);
        input.value = '';
        this.autoResizeTextarea(input);
        this.toggleClearInputButton();
        this.clearAttachedFiles();

        // Показать индикатор загрузки
        const loadingMessage = {
            id: this.generateId(),
            type: 'ai',
            content: '',
            timestamp: new Date().toISOString(),
            isLoading: true
        };
        this.addMessage(loadingMessage);

        this.isGenerating = true;
        this.updateUI();

        try {
            let response;
            const currentMode = document.querySelector('.mode-btn.active').id;

            switch (currentMode) {
                case 'generateVoiceBtn':
                    response = await this.generateVoiceResponse(message, attachedFiles);
                    break;
                case 'generateImageBtn':
                    response = await this.generateImageResponse(message, attachedFiles);
                    break;
                default:
                    response = await this.generateTextResponse(message, attachedFiles);
            }

            // Удалить индикатор загрузки и добавить ответ
            this.removeMessage(loadingMessage.id);
            const aiMessage = {
                id: this.generateId(),
                type: 'ai',
                content: response.content,
                files: response.files || [],
                timestamp: new Date().toISOString(),
                model: this.currentModel
            };
            this.addMessage(aiMessage);

        } catch (error) {
            console.error('Ошибка генерации ответа:', error);
            this.removeMessage(loadingMessage.id);
            this.showError('Ошибка при генерации ответа. Пожалуйста, попробуйте еще раз.');
        }

        this.isGenerating = false;
        this.updateUI();
        this.scrollToBottom();
    }

    // Остановка генерации
    stopGeneration() {
        if (this.isGenerating) {
            this.isGenerating = false;
            this.updateUI();
            this.showNotification('Генерация остановлена', 'info');
        }
    }

    // Генерация текстового ответа
    async generateTextResponse(message, files) {
        if (!this.puter || !this.isOnline) {
            // Офлайн-режим: возвращаем демо-ответ
            return {
                content: `**Демо-режим:** Вы написали: "${message}"\n\nПриложение работает в офлайн-режиме. Для полного функционала проверьте подключение к интернету и перезагрузите страницу.`,
                files: []
            };
        }

        try {
            const context = this.getConversationContext();
            const prompt = this.buildPrompt(message, files, context);

            const response = await this.puter.generate(prompt, {
                model: this.currentModel,
                max_tokens: 4000
            });

            return {
                content: response.text,
                files: []
            };
        } catch (error) {
            console.error('Ошибка генерации текста:', error);
            throw error;
        }
    }

    // Генерация голосового ответа
    async generateVoiceResponse(message, files) {
        // Сначала получаем текстовый ответ
        const textResponse = await this.generateTextResponse(message, files);
        
        // Затем конвертируем в речь (если доступно)
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(this.extractPlainText(textResponse.content));
            utterance.lang = 'ru-RU';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            
            // Добавляем кнопку воспроизведения в сообщение
            textResponse.content += '\n\n<button class="action-btn-small speak-btn" data-text="' + 
                this.escapeHtml(this.extractPlainText(textResponse.content)) + '">🎵 Воспроизвести</button>';
        }

        return textResponse;
    }

    // Генерация изображения
    async generateImageResponse(message, files) {
        if (!this.puter || !this.isOnline) {
            return {
                content: `**Демо-режим:** Запрос на генерацию изображения: "${message}"\n\nГенерация изображений недоступна в офлайн-режиме.`,
                files: []
            };
        }

        try {
            const response = await this.puter.generateImage(message, {
                model: 'dall-e-3',
                size: '1024x1024',
                quality: 'standard'
            });

            return {
                content: `Сгенерировано изображение по запросу: "${message}"`,
                files: [{
                    name: 'generated-image.png',
                    type: 'image/png',
                    content: response.image
                }]
            };
        } catch (error) {
            console.error('Ошибка генерации изображения:', error);
            throw error;
        }
    }

    // Извлечение чистого текста из HTML
    extractPlainText(html) {
        const temp = document.createElement('div');
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || '';
    }

    // Построение промпта с контекстом
    buildPrompt(message, files, context) {
        let prompt = '';

        // Добавление контекста предыдущих сообщений
        if (context.length > 0) {
            prompt += 'Контекст предыдущего разговора:\n';
            context.forEach(msg => {
                const role = msg.type === 'user' ? 'Пользователь' : 'Ассистент';
                prompt += `${role}: ${msg.content}\n`;
            });
            prompt += '\n';
        }

        // Добавление текущего сообщения
        prompt += `Текущий запрос пользователя: ${message}\n`;

        // Добавление информации о файлах
        if (files.length > 0) {
            prompt += 'Прикрепленные файлы:\n';
            files.forEach(file => {
                prompt += `- ${file.name} (${file.type})\n`;
            });
        }

        return prompt;
    }

    // Получение контекста разговора
    getConversationContext() {
        const chat = this.chats.get(this.currentChatId);
        if (!chat) return [];

        // Берем последние 6 сообщений для контекста
        return chat.messages.slice(-6);
    }

    // Добавление сообщения в чат
    addMessage(message) {
        const chat = this.chats.get(this.currentChatId);
        if (chat) {
            chat.messages.push(message);
            chat.updatedAt = new Date().toISOString();
            this.saveChats();
            this.renderMessage(message);
            this.updateMinimap();
            this.updateChatInfo();
        }
    }

    // Удаление сообщения
    removeMessage(messageId) {
        const chat = this.chats.get(this.currentChatId);
        if (chat) {
            chat.messages = chat.messages.filter(msg => msg.id !== messageId);
            this.saveChats();
            this.renderMessages(chat.messages);
            this.updateMinimap();
        }
    }

    // Отрисовка всех сообщений
    renderMessages(messages) {
        const container = document.getElementById('messagesContainer');
        if (!container) return;
        
        container.innerHTML = '';
        messages.forEach(message => this.renderMessage(message));
    }

    // Отрисовка одного сообщения
    renderMessage(message) {
        const container = document.getElementById('messagesContainer');
        if (!container) return;
        
        const messageElement = this.createMessageElement(message);
        container.appendChild(messageElement);
        
        // Прокрутка к новому сообщению
        if (!message.isLoading) {
            this.scrollToBottom();
        }
    }

    // Создание элемента сообщения
    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${message.type}`;
        messageDiv.dataset.messageId = message.id;

        if (message.isLoading) {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="loading-spinner"></div>
                    <span>KHAI думает...</span>
                </div>
            `;
            return messageDiv;
        }

        let content = message.content;
        
        // Обработка markdown
        if (message.type === 'ai') {
            try {
                content = this.renderMarkdown(content);
            } catch (error) {
                console.error('Ошибка рендеринга markdown:', error);
                content = this.escapeHtml(content);
            }
        } else {
            content = this.escapeHtml(content);
        }

        // Обработка файлов
        let filesHtml = '';
        if (message.files && message.files.length > 0) {
            filesHtml = message.files.map(file => {
                if (file.type.startsWith('image/')) {
                    return `<div class="message-image"><img src="${file.content}" alt="${file.name}" loading="lazy"></div>`;
                } else {
                    return `<div class="attached-file">
                        <i class="ti ti-file-text file-icon"></i>
                        <span class="file-name">${this.escapeHtml(file.name)}</span>
                        <button class="download-file-btn" data-file-content="${this.escapeHtml(file.content)}" data-file-name="${this.escapeHtml(file.name)}">
                            <i class="ti ti-download"></i>
                        </button>
                    </div>`;
                }
            }).join('');
        }

        // Действия для сообщения
        let actionsHtml = '';
        if (message.type === 'ai') {
            actionsHtml = `
                <div class="message-actions">
                    <button class="action-btn-small copy-message-btn" data-message-id="${message.id}">
                        <i class="ti ti-copy"></i> Копировать
                    </button>
                    <button class="action-btn-small speak-btn" data-text="${this.escapeHtml(this.extractPlainText(message.content))}">
                        <i class="ti ti-microphone"></i> Озвучить
                    </button>
                    <button class="action-btn-small regenerate-btn" data-message-id="${message.id}">
                        <i class="ti ti-refresh"></i> Перегенерировать
                    </button>
                </div>
            `;
        }

        messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
            ${filesHtml}
            ${message.type === 'ai' ? `<div class="model-indicator">Модель: ${this.getModelDisplayName(message.model)}</div>` : ''}
            ${actionsHtml}
        `;

        // Подсветка синтаксиса для блоков кода
        setTimeout(() => this.highlightCodeBlocks(messageDiv), 0);

        return messageDiv;
    }

    // Отрисовка markdown
    renderMarkdown(content) {
        if (typeof marked === 'undefined') {
            return this.escapeHtml(content).replace(/\n/g, '<br>');
        }
        
        return marked.parse(content, {
            breaks: true,
            gfm: true,
            highlight: (code, language) => {
                if (typeof hljs === 'undefined') {
                    return this.escapeHtml(code);
                }
                const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
                try {
                    return hljs.highlight(code, { language: validLanguage }).value;
                } catch (err) {
                    return hljs.highlightAuto(code).value;
                }
            }
        });
    }

    // Подсветка синтаксиса
    highlightCodeBlocks(container) {
        if (typeof hljs === 'undefined') return;
        
        container.querySelectorAll('pre code').forEach((block) => {
            // Добавляем заголовок с языком программирования
            const language = block.className.replace('language-', '') || 'text';
            const codeHeader = document.createElement('div');
            codeHeader.className = 'code-header';
            codeHeader.innerHTML = `
                <span class="code-language">${language}</span>
                <button class="copy-code-btn">
                    <i class="ti ti-copy"></i> Копировать
                </button>
            `;
            
            if (block.parentNode) {
                block.parentNode.insertBefore(codeHeader, block);
            }
            
            // Обработчик копирования кода
            const copyBtn = codeHeader.querySelector('.copy-code-btn');
            if (copyBtn) {
                this.addEventListener(copyBtn, 'click', () => {
                    const code = block.textContent;
                    navigator.clipboard.writeText(code).then(() => {
                        copyBtn.innerHTML = '<i class="ti ti-check"></i> Скопировано';
                        copyBtn.classList.add('copied');
                        setTimeout(() => {
                            copyBtn.innerHTML = '<i class="ti ti-copy"></i> Копировать';
                            copyBtn.classList.remove('copied');
                        }, 2000);
                    }).catch(err => {
                        console.error('Ошибка копирования:', err);
                    });
                });
            }
        });
    }

    // Экранирование HTML
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Генерация ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Обновление интерфейса
    updateUI() {
        // Обновление состояния кнопок
        const sendBtn = document.getElementById('sendBtn');
        const voiceBtn = document.getElementById('voiceInputBtn');
        
        if (sendBtn) {
            sendBtn.disabled = this.isGenerating;
            sendBtn.innerHTML = this.isGenerating ? 
                '<i class="ti ti-player-stop"></i>' : 
                '<i class="ti ti-send"></i>';
            sendBtn.title = this.isGenerating ? 'Остановить генерацию' : 'Отправить сообщение';
        }
        
        if (voiceBtn) {
            voiceBtn.disabled = this.isGenerating || this.isRecording;
        }

        // Обновление статуса в футере
        const statusElement = document.getElementById('footerStatus');
        if (statusElement) {
            if (this.isGenerating) {
                statusElement.textContent = 'Генерация ответа...';
                statusElement.style.color = 'var(--accent-primary)';
            } else if (!this.isOnline) {
                statusElement.textContent = 'Офлайн режим';
                statusElement.style.color = 'var(--error-text)';
            } else {
                statusElement.textContent = 'Готов к работе';
                statusElement.style.color = 'var(--success-text)';
            }
        }

        // Обновление информации о текущей модели
        const modelInfo = document.getElementById('currentModelInfo');
        if (modelInfo) {
            modelInfo.textContent = this.getModelDisplayName(this.currentModel);
        }
    }

    // Получение отображаемого имени модели
    getModelDisplayName(model) {
        const modelNames = {
            'gpt-4-turbo': 'GPT-4 Turbo',
            'gpt-3.5-turbo': 'GPT-3.5 Turbo',
            'claude-2': 'Claude 2',
            'gemini-pro': 'Gemini Pro'
        };
        return modelNames[model] || model;
    }

    // Управление боковым меню
    toggleSidebar() {
        const sidebar = document.getElementById('sidebarMenu');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('open');
            
            document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
        }
    }

    // Создание нового чата
    createNewChat() {
        const chatId = this.generateId();
        const newChat = {
            id: chatId,
            name: `Чат ${this.chats.size}`,
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.chats.set(chatId, newChat);
        this.currentChatId = chatId;
        this.saveChats();
        this.renderChatList();
        this.loadCurrentChat();
        this.toggleSidebar();
        this.showNotification('Новый чат создан', 'success');
    }

    // Выбор чата
    selectChat(chatId) {
        this.currentChatId = chatId;
        this.loadCurrentChat();
        this.toggleSidebar();
    }

    // Редактирование названия чата
    editChatName(chatId) {
        const chat = this.chats.get(chatId);
        if (chat) {
            this.editingChatId = chatId;
            document.getElementById('editChatNameInput').value = chat.name;
            document.getElementById('modalClearInput').style.display = chat.name ? 'flex' : 'none';
            document.getElementById('editChatModal').classList.add('open');
        }
    }

    // Сохранение названия чата
    saveChatName() {
        if (!this.editingChatId) return;

        const newName = document.getElementById('editChatNameInput').value.trim();
        if (newName) {
            const chat = this.chats.get(this.editingChatId);
            if (chat) {
                chat.name = newName;
                chat.updatedAt = new Date().toISOString();
                this.saveChats();
                this.renderChatList();
                this.updateChatInfo();
                this.showNotification('Название чата обновлено', 'success');
            }
        }

        this.hideEditChatModal();
    }

    // Скрытие модального окна редактирования чата
    hideEditChatModal() {
        document.getElementById('editChatModal').classList.remove('open');
        this.editingChatId = null;
    }

    // Удаление чата
    deleteChat(chatId) {
        if (this.chats.size <= 1) {
            this.showNotification('Нельзя удалить последний чат', 'warning');
            return;
        }

        if (confirm('Вы уверены, что хотите удалить этот чат?')) {
            this.chats.delete(chatId);
            
            if (this.currentChatId === chatId) {
                // Переключаемся на первый доступный чат
                const firstChat = Array.from(this.chats.values())[0];
                this.currentChatId = firstChat.id;
                this.loadCurrentChat();
            }
            
            this.saveChats();
            this.renderChatList();
            this.showNotification('Чат удален', 'success');
        }
    }

    // Очистка текущего чата
    clearCurrentChat() {
        const chat = this.chats.get(this.currentChatId);
        if (!chat || chat.messages.length === 0) {
            this.showNotification('Чат уже пуст', 'info');
            return;
        }

        if (confirm('Вы уверены, что хотите очистить историю текущего чата?')) {
            chat.messages = [];
            chat.updatedAt = new Date().toISOString();
            this.saveChats();
            this.loadCurrentChat();
            this.showNotification('История чата очищена', 'success');
        }
    }

    // Отрисовка списка чатов
    renderChatList() {
        const chatList = document.getElementById('chatList');
        if (!chatList) return;
        
        const chatsArray = Array.from(this.chats.values())
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        chatList.innerHTML = chatsArray.map(chat => `
            <div class="chat-item ${chat.id === this.currentChatId ? 'active' : ''}" data-chat-id="${chat.id}">
                <div class="chat-item-content">
                    <div class="chat-item-name">${this.escapeHtml(chat.name)}</div>
                    <div class="chat-item-meta">
                        <span>${chat.messages.length} сообщений</span>
                        <span>•</span>
                        <span>${this.formatDate(chat.updatedAt)}</span>
                    </div>
                </div>
                <div class="chat-item-actions">
                    <button class="chat-action-btn edit-chat-btn" title="Редактировать">
                        <i class="ti ti-edit"></i>
                    </button>
                    ${chatsArray.length > 1 ? `
                    <button class="chat-action-btn delete-chat-btn" title="Удалить">
                        <i class="ti ti-trash"></i>
                    </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // Обновление информации о текущем чате
    updateChatInfo() {
        const chat = this.chats.get(this.currentChatId);
        if (chat) {
            const chatNameElement = document.getElementById('currentChatName');
            if (chatNameElement) {
                chatNameElement.textContent = chat.name;
            }
        }
    }

    // Форматирование даты
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

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

    // Прокрутка к последнему сообщению AI
    scrollToLastAIMessage() {
        const aiMessages = document.querySelectorAll('.message-ai:not(.loading)');
        if (aiMessages.length > 0) {
            const lastAIMessage = aiMessages[aiMessages.length - 1];
            lastAIMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Прокрутка вниз
    scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    // Обновление мини-карты
    updateMinimap() {
        const minimap = document.getElementById('chatMinimap');
        const container = document.getElementById('messagesContainer');
        
        if (!minimap || !container) return;

        const messages = container.querySelectorAll('.message');
        if (messages.length === 0) {
            minimap.innerHTML = '';
            return;
        }

        const containerHeight = container.clientHeight;
        const scrollHeight = container.scrollHeight;
        const messageHeight = Math.max(containerHeight / messages.length, 2);

        minimap.innerHTML = Array.from(messages).map((message, index) => {
            const isAI = message.classList.contains('message-ai');
            const isUser = message.classList.contains('message-user');
            const isActive = index === messages.length - 1;
            
            return `<div class="minimap-item ${isAI ? 'ai' : 'user'} ${isActive ? 'active' : ''}" 
                      style="height: ${messageHeight}px" 
                      data-message-index="${index}"></div>`;
        }).join('');

        this.updateMinimapViewport();
    }

    // Обновление видимой области мини-карты
    updateMinimapViewport() {
        const minimap = document.getElementById('chatMinimap');
        const container = document.getElementById('messagesContainer');
        const viewport = document.getElementById('minimapViewport');
        
        if (!minimap || !container || !viewport) return;

        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        
        const viewportTop = (scrollTop / scrollHeight) * minimap.clientHeight;
        const viewportHeight = (clientHeight / scrollHeight) * minimap.clientHeight;
        
        viewport.style.top = viewportTop + 'px';
        viewport.style.height = viewportHeight + 'px';
    }

    // Обработка клика по мини-карте
    handleMinimapClick(e) {
        const minimapItem = e.target.closest('.minimap-item');
        if (!minimapItem) return;

        const index = parseInt(minimapItem.dataset.messageIndex);
        const container = document.getElementById('messagesContainer');
        const messages = container.querySelectorAll('.message');
        
        if (messages[index]) {
            messages[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Установка режима генерации
    setGenerationMode(mode) {
        const modes = ['normal', 'voice', 'image'];
        const buttons = ['normalModeBtn', 'generateVoiceBtn', 'generateImageBtn'];
        
        // Сброс всех кнопок
        buttons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) btn.classList.remove('active');
        });
        
        // Активация выбранной кнопки
        const activeBtn = document.getElementById(mode + 'ModeBtn') || 
                         document.getElementById('generate' + mode.charAt(0).toUpperCase() + mode.slice(1) + 'Btn');
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        this.showNotification(`Режим ${this.getModeDisplayName(mode)} активирован`, 'info');
    }

    // Получение отображаемого имени режима
    getModeDisplayName(mode) {
        const names = {
            'normal': 'обычный',
            'voice': 'голосовой',
            'image': 'генерации изображений'
        };
        return names[mode] || mode;
    }

    // Показать модальное окно выбора модели
    showModelModal() {
        document.getElementById('modelModal').classList.add('open');
        document.getElementById('modelModalOverlay').classList.add('open');
        
        // Установить текущую выбранную модель
        const modelOptions = document.querySelectorAll('.model-option');
        modelOptions.forEach(option => {
            if (option.dataset.model === this.currentModel) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });
    }

    // Скрыть модальное окно выбора модели
    hideModelModal() {
        document.getElementById('modelModal').classList.remove('open');
        document.getElementById('modelModalOverlay').classList.remove('open');
    }

    // Подтверждение выбора модели
    confirmModelSelection() {
        const selectedOption = document.querySelector('.model-option.selected');
        if (selectedOption) {
            this.currentModel = selectedOption.dataset.model;
            localStorage.setItem('khai_model', this.currentModel);
            this.updateUI();
            this.showNotification(`Модель изменена на: ${this.getModelDisplayName(this.currentModel)}`, 'success');
        }
        this.hideModelModal();
    }

    // Голосовой ввод
    toggleVoiceInput() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            this.showNotification('Голосовой ввод не поддерживается в вашем браузере', 'warning');
            return;
        }

        if (this.isRecording) {
            this.stopVoiceInput();
        } else {
            this.startVoiceInput();
        }
    }

    // Запуск голосового ввода
    startVoiceInput() {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'ru-RU';

            this.recognition.onstart = () => {
                this.isRecording = true;
                document.getElementById('voiceInputBtn').classList.add('recording');
                this.showNotification('Слушаю... Говорите', 'info');
            };

            this.recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');

                document.getElementById('userInput').value = transcript;
                this.autoResizeTextarea(document.getElementById('userInput'));
                this.toggleClearInputButton();
            };

            this.recognition.onerror = (event) => {
                console.error('Ошибка распознавания речи:', event.error);
                this.showNotification(`Ошибка распознавания: ${event.error}`, 'error');
                this.stopVoiceInput();
            };

            this.recognition.onend = () => {
                this.stopVoiceInput();
            };

            this.recognition.start();
        } catch (error) {
            console.error('Ошибка инициализации голосового ввода:', error);
            this.showNotification('Ошибка инициализации голосового ввода', 'error');
        }
    }

    // Остановка голосового ввода
    stopVoiceInput() {
        if (this.recognition) {
            this.recognition.stop();
        }
        this.isRecording = false;
        document.getElementById('voiceInputBtn').classList.remove('recording');
    }

    // Обработка загрузки файлов
    handleFileUpload(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/pdf'];

        files.forEach(file => {
            if (file.size > maxSize) {
                this.showNotification(`Файл "${file.name}" слишком большой (макс. 10MB)`, 'error');
                return;
            }

            if (!allowedTypes.includes(file.type)) {
                this.showNotification(`Тип файла "${file.name}" не поддерживается`, 'error');
                return;
            }

            this.processFile(file);
        });

        event.target.value = '';
    }

    // Обработка файла
    processFile(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const fileData = {
                id: this.generateId(),
                name: file.name,
                type: file.type,
                size: file.size,
                content: e.target.result
            };

            this.addAttachedFile(fileData);
        };

        reader.onerror = () => {
            this.showNotification(`Ошибка чтения файла "${file.name}"`, 'error');
        };

        if (file.type.startsWith('image/')) {
            reader.readAsDataURL(file);
        } else {
            reader.readAsText(file);
        }
    }

    // Добавление прикрепленного файла
    addAttachedFile(fileData) {
        const attachedFiles = document.getElementById('attachedFiles');
        if (!attachedFiles) return;

        const fileElement = document.createElement('div');
        fileElement.className = 'attached-file';
        fileElement.dataset.fileId = fileData.id;
        fileElement.dataset.fileName = fileData.name;
        fileElement.dataset.fileType = fileData.type;
        fileElement.dataset.fileContent = fileData.content;

        const icon = fileData.type.startsWith('image/') ? 'ti-photo' : 'ti-file-text';
        
        fileElement.innerHTML = `
            <i class="ti ${icon} file-icon"></i>
            <span class="file-name">${this.escapeHtml(fileData.name)}</span>
            <span class="file-size">(${this.formatFileSize(fileData.size)})</span>
            <button class="remove-file" data-file-id="${fileData.id}">
                <i class="ti ti-x"></i>
            </button>
        `;

        attachedFiles.appendChild(fileElement);
        this.showNotification(`Файл "${fileData.name}" прикреплен`, 'success');
    }

    // Удаление прикрепленного файла
    removeAttachedFile(fileId) {
        const fileElement = document.querySelector(`.attached-file[data-file-id="${fileId}"]`);
        if (fileElement) {
            fileElement.remove();
            this.showNotification('Файл удален', 'info');
        }
    }

    // Очистка всех прикрепленных файлов
    clearAttachedFiles() {
        const attachedFiles = document.getElementById('attachedFiles');
        if (attachedFiles) {
            attachedFiles.innerHTML = '';
        }
    }

    // Форматирование размера файла
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Поиск по сообщениям
    handleSearch(query) {
        const searchClearBtn = document.getElementById('headerSearchClear');
        if (searchClearBtn) {
            searchClearBtn.style.display = query ? 'flex' : 'none';
        }

        if (!query.trim()) {
            this.clearSearch();
            return;
        }

        const chat = this.chats.get(this.currentChatId);
        if (!chat) return;

        this.searchResults = chat.messages.filter(message => 
            message.content.toLowerCase().includes(query.toLowerCase())
        );

        this.currentSearchIndex = -1;
        this.highlightSearchResults(query);
        this.updateSearchNavigation();
    }

    // Подсветка результатов поиска
    highlightSearchResults(query) {
        // Сначала убираем предыдущие подсветки
        document.querySelectorAll('.search-highlight').forEach(el => {
            el.classList.remove('search-highlight');
        });

        if (!query.trim()) return;

        const regex = new RegExp(query, 'gi');
        const messageElements = document.querySelectorAll('.message-content');

        messageElements.forEach(element => {
            const html = element.innerHTML;
            const highlighted = html.replace(regex, match => 
                `<span class="search-highlight">${match}</span>`
            );
            element.innerHTML = highlighted;
        });
    }

    // Обновление навигации по поиску
    updateSearchNavigation() {
        const searchNav = document.getElementById('searchNavigation');
        if (!searchNav) return;

        if (this.searchResults.length === 0) {
            searchNav.style.display = 'none';
            return;
        }

        searchNav.style.display = 'flex';
        document.getElementById('searchResultsCount').textContent = 
            `${this.currentSearchIndex + 1} из ${this.searchResults.length}`;
    }

    // Переход к следующему результату поиска
    nextSearchResult() {
        if (this.searchResults.length === 0) return;
        
        this.currentSearchIndex = (this.currentSearchIndex + 1) % this.searchResults.length;
        this.scrollToSearchResult();
    }

    // Переход к предыдущему результату поиска
    prevSearchResult() {
        if (this.searchResults.length === 0) return;
        
        this.currentSearchIndex = this.currentSearchIndex <= 0 ? 
            this.searchResults.length - 1 : this.currentSearchIndex - 1;
        this.scrollToSearchResult();
    }

    // Прокрутка к результату поиска
    scrollToSearchResult() {
        if (this.currentSearchIndex < 0 || this.currentSearchIndex >= this.searchResults.length) return;

        const result = this.searchResults[this.currentSearchIndex];
        const messageElement = document.querySelector(`[data-message-id="${result.id}"]`);
        
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            messageElement.classList.add('search-result-active');
            setTimeout(() => {
                messageElement.classList.remove('search-result-active');
            }, 2000);
        }

        this.updateSearchNavigation();
    }

    // Очистка поиска
    clearSearch() {
        const searchInput = document.getElementById('headerSearch');
        const searchClearBtn = document.getElementById('headerSearchClear');
        
        if (searchInput) searchInput.value = '';
        if (searchClearBtn) searchClearBtn.style.display = 'none';
        
        this.searchResults = [];
        this.currentSearchIndex = -1;
        this.highlightSearchResults('');
        this.updateSearchNavigation();
    }

    // Копирование сообщения
    copyMessage(button) {
        const messageId = button.dataset.messageId;
        const messageElement = document.querySelector(`[data-message-id="${messageId}"] .message-content`);
        
        if (messageElement) {
            const text = this.extractPlainText(messageElement.innerHTML);
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Сообщение скопировано', 'success');
                button.innerHTML = '<i class="ti ti-check"></i> Скопировано';
                setTimeout(() => {
                    button.innerHTML = '<i class="ti ti-copy"></i> Копировать';
                }, 2000);
            }).catch(err => {
                console.error('Ошибка копирования:', err);
                this.showNotification('Ошибка копирования', 'error');
            });
        }
    }

    // Озвучивание текста
    toggleSpeech(button) {
        if (this.isSpeaking) {
            this.stopSpeech();
            button.innerHTML = '<i class="ti ti-microphone"></i> Озвучить';
        } else {
            const text = button.dataset.text;
            this.speakText(text, button);
        }
    }

    // Воспроизведение текста
    speakText(text, button) {
        if (!('speechSynthesis' in window)) {
            this.showNotification('Озвучивание текста не поддерживается', 'warning');
            return;
        }

        try {
            this.stopSpeech(); // Останавливаем предыдущее воспроизведение

            this.currentUtterance = new SpeechSynthesisUtterance(text);
            this.currentUtterance.lang = 'ru-RU';
            this.currentUtterance.rate = 0.8;
            this.currentUtterance.pitch = 1.0;
            this.currentUtterance.volume = 1.0;

            // Выбор русского голоса если доступен
            const voices = speechSynthesis.getVoices();
            const russianVoice = voices.find(voice => 
                voice.lang.includes('ru') || voice.lang.includes('RU')
            );
            
            if (russianVoice) {
                this.currentUtterance.voice = russianVoice;
            }

            this.isSpeaking = true;
            button.innerHTML = '<i class="ti ti-player-pause"></i> Остановить';

            this.currentUtterance.onend = () => {
                this.isSpeaking = false;
                button.innerHTML = '<i class="ti ti-microphone"></i> Озвучить';
            };

            this.currentUtterance.onerror = (error) => {
                console.error('Ошибка озвучивания:', error);
                this.isSpeaking = false;
                button.innerHTML = '<i class="ti ti-microphone"></i> Озвучить';
                this.showNotification('Ошибка при озвучивании текста', 'error');
            };

            speechSynthesis.speak(this.currentUtterance);
            this.showNotification('Озвучивание текста...', 'info');

        } catch (error) {
            console.error('Ошибка озвучивания:', error);
            this.showNotification('Ошибка при озвучивании текста', 'error');
        }
    }

    // Остановка воспроизведения
    stopSpeech() {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
        this.isSpeaking = false;
        this.currentUtterance = null;
    }

    // Перегенерация сообщения
    regenerateMessage(button) {
        const messageId = button.dataset.messageId;
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        
        if (messageElement) {
            const userMessage = this.findPreviousUserMessage(messageId);
            if (userMessage) {
                // Удаляем текущее сообщение AI
                this.removeMessage(messageId);
                
                // Восстанавливаем сообщение пользователя в поле ввода
                document.getElementById('userInput').value = userMessage.content;
                this.autoResizeTextarea(document.getElementById('userInput'));
                this.toggleClearInputButton();
                
                // Отправляем сообщение заново
                setTimeout(() => this.sendMessage(), 100);
            }
        }
    }

    // Поиск предыдущего сообщения пользователя
    findPreviousUserMessage(messageId) {
        const chat = this.chats.get(this.currentChatId);
        if (!chat) return null;

        const messageIndex = chat.messages.findIndex(msg => msg.id === messageId);
        if (messageIndex === -1) return null;

        // Ищем предыдущее сообщение пользователя
        for (let i = messageIndex - 1; i >= 0; i--) {
            if (chat.messages[i].type === 'user') {
                return chat.messages[i];
            }
        }

        return null;
    }

    // Скачивание истории чата
    downloadChatHistory() {
        const chat = this.chats.get(this.currentChatId);
        if (!chat || chat.messages.length === 0) {
            this.showNotification('Нет сообщений для скачивания', 'warning');
            return;
        }

        let content = `История чата: ${chat.name}\n`;
        content += `Дата экспорта: ${new Date().toLocaleString('ru-RU')}\n`;
        content += `Количество сообщений: ${chat.messages.length}\n\n`;
        content += '='.repeat(50) + '\n\n';

        chat.messages.forEach(message => {
            const role = message.type === 'user' ? 'Вы' : 'KHAI';
            const time = new Date(message.timestamp).toLocaleString('ru-RU');
            content += `${role} (${time}):\n`;
            content += this.extractPlainText(message.content) + '\n\n';
            
            if (message.files && message.files.length > 0) {
                content += `Прикрепленные файлы: ${message.files.map(f => f.name).join(', ')}\n\n`;
            }
            
            content += '-'.repeat(30) + '\n\n';
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `khai-chat-${chat.name}-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification('История чата скачана', 'success');
    }

    // Показать справку
    showHelp() {
        const helpMessage = {
            id: this.generateId(),
            type: 'ai',
            content: `# 🆘 Справка по KHAI — Чат с ИИ

## Основные возможности:
• **Общение с ИИ** - задавайте вопросы и получайте развернутые ответы
• **Мультимодальность** - работа с текстом, изображениями и голосом
• **Умный контекст** - ИИ помнит историю разговора
• **Несколько чатов** - создавайте отдельные чаты для разных тем
• **Поиск по истории** - находите нужные сообщения быстро
• **Экспорт данных** - скачивайте историю бесед

## Управление:
• **Отправка сообщения** - Enter или кнопка отправки
• **Новая строка** - Shift + Enter
• **Новый чат** - кнопка "Новый чат" в меню
• **Поиск** - поле поиска в верхней панели
• **Очистка чата** - кнопка в нижней панели

## Советы:
1. Будьте конкретны в вопросах для лучших ответов
2. Используйте контекст для продолжения тем
3. Экспериментируйте с разными моделями ИИ
4. Прикрепляйте файлы для анализа содержимого

**Готовы начать? Задайте свой первый вопрос!**`,
            timestamp: new Date().toISOString(),
            model: this.currentModel
        };

        this.addMessage(helpMessage);
        this.scrollToBottom();
    }

    // Показать уведомление
    showNotification(message, type = 'info') {
        // Создаем элемент уведомления
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

        // Добавляем в контейнер уведомлений
        const container = document.getElementById('notificationsContainer');
        if (!container) {
            // Создаем контейнер если его нет
            const newContainer = document.createElement('div');
            newContainer.id = 'notificationsContainer';
            newContainer.className = 'notifications-container';
            document.body.appendChild(newContainer);
            container = newContainer;
        }

        container.appendChild(notification);

        // Автоматическое скрытие
        const autoHide = setTimeout(() => {
            notification.remove();
        }, 5000);

        // Закрытие по клику
        const closeBtn = notification.querySelector('.notification-close');
        this.addEventListener(closeBtn, 'click', () => {
            clearTimeout(autoHide);
            notification.remove();
        });

        // Анимация появления
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
    }

    // Получение иконки для уведомления
    getNotificationIcon(type) {
        const icons = {
            'info': 'info-circle',
            'success': 'check',
            'warning': 'alert-triangle',
            'error': 'x-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Показать ошибку
    showError(message) {
        this.showNotification(message, 'error');
    }

    // Обработка изменения размера окна
    handleResize() {
        this.updateMinimap();
        this.updateMinimapViewport();
    }

    // Обработка перед закрытием страницы
    handleBeforeUnload() {
        // Сохраняем текущее состояние
        this.saveChats();
        
        // Останавливаем генерацию если она идет
        if (this.isGenerating) {
            this.stopGeneration();
        }
        
        // Останавливаем речь
        this.stopSpeech();
        
        // Останавливаем запись голоса
        if (this.isRecording) {
            this.stopVoiceInput();
        }
    }

    // Очистка ресурсов
    cleanup() {
        // Останавливаем все таймеры
        this.activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.activeTimeouts.clear();

        // Останавливаем речь
        this.stopSpeech();

        // Останавливаем голосовой ввод
        if (this.recognition && this.isRecording) {
            try {
                this.recognition.stop();
            } catch (e) {
                // Игнорируем ошибки при остановке
            }
        }

        // Удаляем обработчики событий
        this.activeEventListeners.forEach((listeners, element) => {
            if (element && element.removeEventListener) {
                listeners.forEach(({ event, handler }) => {
                    element.removeEventListener(event, handler);
                });
            }
        });
        this.activeEventListeners.clear();
    }
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Проверка поддержки необходимых API
        if (!('localStorage' in window)) {
            alert('Ваш браузер не поддерживает localStorage. Некоторые функции могут быть недоступны.');
        }

        // Инициализация приложения
        window.khaiApp = new KHAIAssistant();

        // Обработка ошибок
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            if (window.khaiApp) {
                window.khaiApp.showError('Произошла непредвиденная ошибка');
            }
        });

        // Обработка отклоненных промисов
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            if (window.khaiApp) {
                window.khaiApp.showError('Ошибка в асинхронной операции');
            }
        });

    } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
        document.body.innerHTML = `
            <div class="error-screen">
                <div class="error-content">
                    <h1>😕 KHAI — Ошибка загрузки</h1>
                    <p>Не удалось запустить приложение. Пожалуйста, обновите страницу.</p>
                    <button onclick="location.reload()" class="retry-btn">Перезагрузить</button>
                    <details>
                        <summary>Техническая информация</summary>
                        <pre>${error.stack}</pre>
                    </details>
                </div>
            </div>
        `;
    }
});

// Service Worker для PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
