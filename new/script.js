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
        
        this.initializeApp();
    }

    // Инициализация приложения
    async initializeApp() {
        await this.initializePuter();
        this.loadChats();
        this.loadTheme();
        this.initializeEventListeners();
        this.updateUI();
        this.showNotification('Приложение готово к работе', 'success');
    }

    // Инициализация Puter AI SDK
    async initializePuter() {
        try {
            this.puter = await puter.ai();
            console.log('Puter AI SDK инициализирован');
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
        }
    }

    // Инициализация обработчиков событий
    initializeEventListeners() {
        // Кнопка отправки сообщения
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        
        // Ввод текста (Enter для отправки)
        document.getElementById('userInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Автоматическое изменение высоты textarea
        document.getElementById('userInput').addEventListener('input', (e) => {
            this.autoResizeTextarea(e.target);
            this.toggleClearInputButton();
        });

        // Очистка ввода
        document.getElementById('clearInputBtn').addEventListener('click', () => {
            document.getElementById('userInput').value = '';
            this.autoResizeTextarea(document.getElementById('userInput'));
            this.toggleClearInputButton();
        });

        // Голосовой ввод
        document.getElementById('voiceInputBtn').addEventListener('click', () => this.toggleVoiceInput());

        // Прикрепление файлов
        document.getElementById('attachFileBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileUpload(e));

        // Управление чатами
        document.getElementById('newChatBtn').addEventListener('click', () => this.createNewChat());
        document.getElementById('clearChatBtn').addEventListener('click', () => this.clearCurrentChat());
        document.getElementById('footerClearChatBtn').addEventListener('click', () => this.clearCurrentChat());

        // Боковое меню
        document.getElementById('menuToggle').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('sidebarClose').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('sidebarOverlay').addEventListener('click', () => this.toggleSidebar());

        // Выбор модели
        document.getElementById('modelSelectBtn').addEventListener('click', () => this.showModelModal());
        document.getElementById('modelModalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.hideModelModal();
        });
        document.getElementById('modelModalClose').addEventListener('click', () => this.hideModelModal());
        document.getElementById('modelModalCancel').addEventListener('click', () => this.hideModelModal());
        document.getElementById('modelModalConfirm').addEventListener('click', () => this.confirmModelSelection());

        // Режимы генерации
        document.getElementById('normalModeBtn').addEventListener('click', () => this.setGenerationMode('normal'));
        document.getElementById('generateVoiceBtn').addEventListener('click', () => this.setGenerationMode('voice'));
        document.getElementById('generateImageBtn').addEventListener('click', () => this.setGenerationMode('image'));

        // Поиск
        document.getElementById('headerSearch').addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.getElementById('headerSearchClear').addEventListener('click', () => this.clearSearch());

        // Навигация
        document.getElementById('scrollToLastAI').addEventListener('click', () => this.scrollToLastAIMessage());
        document.getElementById('scrollToBottom').addEventListener('click', () => this.scrollToBottom());

        // Помощь
        document.getElementById('helpBtn').addEventListener('click', () => this.showHelp());
        document.getElementById('footerHelpBtn').addEventListener('click', () => this.showHelp());

        // Скачивание истории
        document.getElementById('footerDownloadBtn').addEventListener('click', () => this.downloadChatHistory());

        // Мини-карта
        document.getElementById('chatMinimap').addEventListener('click', (e) => this.handleMinimapClick(e));

        // Переключение темы
        document.getElementById('themeToggleBtn').addEventListener('click', () => this.toggleTheme());

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
        document.getElementById('editChatModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.hideEditChatModal();
        });
        document.getElementById('editChatModalClose').addEventListener('click', () => this.hideEditChatModal());
        document.getElementById('editChatModalCancel').addEventListener('click', () => this.hideEditChatModal());
        document.getElementById('editChatModalSave').addEventListener('click', () => this.saveChatName());
        document.getElementById('modalClearInput').addEventListener('click', () => {
            document.getElementById('editChatNameInput').value = '';
            document.getElementById('modalClearInput').style.display = 'none';
        });
        document.getElementById('editChatNameInput').addEventListener('input', (e) => {
            document.getElementById('modalClearInput').style.display = e.target.value ? 'flex' : 'none';
        });

        // Обработка изменения размера окна
        window.addEventListener('resize', () => this.handleResize());
        
        // Обработка скролла для мини-карты
        document.getElementById('messagesContainer').addEventListener('scroll', () => this.updateMinimapViewport());

        // Обработчики для режима чтения
        this.setupReadingModeListeners();

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
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
            isScrolling = false;
            isSelecting = false;
        });

        document.addEventListener('touchmove', (e) => {
            isScrolling = true;
        });

        document.addEventListener('touchend', (e) => {
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

        document.addEventListener('mousedown', (e) => {
            mouseDownTime = Date.now();
            isMouseDown = true;
            isSelecting = window.getSelection().toString().length > 0;
        });

        document.addEventListener('mouseup', (e) => {
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
        document.addEventListener('click', (e) => {
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
        document.addEventListener(event, (e) => {
            if (e.target.matches(selector)) {
                callback(e, e.target);
            }
        });
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
        clearBtn.style.display = input.value ? 'flex' : 'none';
    }

    // Отправка сообщения
    async sendMessage() {
        const input = document.getElementById('userInput');
        const message = input.value.trim();
        const attachedFiles = Array.from(document.querySelectorAll('.attached-file')).map(file => ({
            name: file.dataset.fileName,
            type: file.dataset.fileType,
            content: file.dataset.fileContent
        }));

        if (!message && attachedFiles.length === 0) return;

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

    // Генерация текстового ответа
    async generateTextResponse(message, files) {
        if (!this.puter) {
            throw new Error('AI сервис недоступен');
        }

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
    }

    // Генерация голосового ответа
    async generateVoiceResponse(message, files) {
        // Сначала получаем текстовый ответ
        const textResponse = await this.generateTextResponse(message, files);
        
        // Затем конвертируем в речь
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(textResponse.content);
            utterance.lang = 'ru-RU';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            
            // Добавляем кнопку воспроизведения в сообщение
            textResponse.content += '\n\n<button class="action-btn-small speak-btn" data-text="' + 
                this.escapeHtml(textResponse.content) + '">🎵 Воспроизвести</button>';
        }

        return textResponse;
    }

    // Генерация изображения
    async generateImageResponse(message, files) {
        if (!this.puter) {
            throw new Error('AI сервис недоступен');
        }

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
        container.innerHTML = '';
        messages.forEach(message => this.renderMessage(message));
    }

    // Отрисовка одного сообщения
    renderMessage(message) {
        const container = document.getElementById('messagesContainer');
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
                    ИИ думает...
                </div>
            `;
            return messageDiv;
        }

        let content = message.content;
        
        // Обработка markdown
        if (message.type === 'ai') {
            content = this.renderMarkdown(content);
        }

        // Обработка файлов
        let filesHtml = '';
        if (message.files && message.files.length > 0) {
            filesHtml = message.files.map(file => {
                if (file.type.startsWith('image/')) {
                    return `<div class="message-image"><img src="${file.content}" alt="${file.name}"></div>`;
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
                    <button class="action-btn-small speak-btn" data-text="${this.escapeHtml(message.content)}">
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
            ${message.type === 'ai' ? `<div class="model-indicator">Модель: ${message.model}</div>` : ''}
            ${actionsHtml}
        `;

        // Подсветка синтаксиса для блоков кода
        this.highlightCodeBlocks(messageDiv);

        return messageDiv;
    }

    // Отрисовка markdown
    renderMarkdown(content) {
        return marked.parse(content, {
            breaks: true,
            gfm: true,
            highlight: (code, language) => {
                const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
                return hljs.highlight(code, { language: validLanguage }).value;
            }
        });
    }

    // Подсветка синтаксиса
    highlightCodeBlocks(container) {
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
            
            block.parentNode.insertBefore(codeHeader, block);
            
            // Обработчик копирования кода
            const copyBtn = codeHeader.querySelector('.copy-code-btn');
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(block.textContent).then(() => {
                    copyBtn.innerHTML = '<i class="ti ti-check"></i> Скопировано';
                    copyBtn.classList.add('copied');
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="ti ti-copy"></i> Копировать';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                });
            });
        });
    }

    // Экранирование HTML
    escapeHtml(text) {
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
        
        sendBtn.disabled = this.isGenerating;
        voiceBtn.disabled = this.isGenerating;

        // Обновление статуса в футере
        const statusElement = document.getElementById('footerStatus');
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

        // Обновление информации о текущей модели
        document.getElementById('currentModelInfo').textContent = this.getModelDisplayName(this.currentModel);
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
        
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
        
        document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    }

    // Создание нового чата
    createNewChat() {
        const chatId = this.generateId();
        const newChat = {
            id: chatId,
            name: `Новый чат ${this.chats.size + 1}`,
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
        if (confirm('Вы уверены, что хотите очистить историю текущего чата?')) {
            const chat = this.chats.get(this.currentChatId);
            if (chat) {
                chat.messages = [];
                chat.updatedAt = new Date().toISOString();
                this.saveChats();
                this.loadCurrentChat();
                this.showNotification('История чата очищена', 'success');
            }
        }
    }

    // Отрисовка списка чатов
    renderChatList() {
        const chatList = document.getElementById('chatList');
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

    // Обновление информации о чате
    updateChatInfo() {
        const chat = this.chats.get(this.currentChatId);
        if (chat) {
            document.getElementById('currentChatName').textContent = chat.name;
        }
    }

    // Форматирование даты
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

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

    // Управление модальным окном выбора модели
    showModelModal() {
        // Сброс выбора
        document.querySelectorAll('.model-item').forEach(item => {
            item.classList.remove('selected');
            if (item.dataset.model === this.currentModel) {
                item.classList.add('selected');
            }
        });

        document.getElementById('modelModalOverlay').classList.add('open');
    }

    hideModelModal() {
        document.getElementById('modelModalOverlay').classList.remove('open');
    }

    confirmModelSelection() {
        const selectedModel = document.querySelector('.model-item.selected');
        if (selectedModel) {
            this.currentModel = selectedModel.dataset.model;
            this.updateUI();
            this.showNotification(`Модель изменена на: ${this.getModelDisplayName(this.currentModel)}`, 'success');
        }
        this.hideModelModal();
    }

    // Установка режима генерации
    setGenerationMode(mode) {
        // Сброс активного состояния всех кнопок режимов
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        
        // Активация выбранной кнопки
        switch (mode) {
            case 'normal':
                document.getElementById('normalModeBtn').classList.add('active');
                break;
            case 'voice':
                document.getElementById('generateVoiceBtn').classList.add('active');
                break;
            case 'image':
                document.getElementById('generateImageBtn').classList.add('active');
                break;
        }

        // Обновление placeholder текстового поля
        const input = document.getElementById('userInput');
        switch (mode) {
            case 'normal':
                input.placeholder = 'Задайте вопрос...';
                break;
            case 'voice':
                input.placeholder = 'Введите текст для генерации голоса...';
                break;
            case 'image':
                input.placeholder = 'Опишите изображение для генерации...';
                break;
        }
    }

    // Голосовой ввод
    async toggleVoiceInput() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            this.showNotification('Голосовой ввод не поддерживается в вашем браузере', 'error');
            return;
        }

        if (this.isRecording) {
            this.stopVoiceRecording();
        } else {
            await this.startVoiceRecording();
        }
    }

    async startVoiceRecording() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'ru-RU';

        this.recognition.onstart = () => {
            this.isRecording = true;
            this.updateUI();
            this.showNotification('Запись голоса начата...', 'success');
        };

        this.recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            
            document.getElementById('userInput').value = transcript;
            this.autoResizeTextarea(document.getElementById('userInput'));
            this.toggleClearInputButton();
        };

        this.recognition.onend = () => {
            this.isRecording = false;
            this.updateUI();
        };

        this.recognition.onerror = (event) => {
            console.error('Ошибка распознавания речи:', event.error);
            this.isRecording = false;
            this.updateUI();
            this.showNotification('Ошибка распознавания речи', 'error');
        };

        this.recognition.start();
    }

    stopVoiceRecording() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    // Обработка загрузки файлов
    handleFileUpload(event) {
        const files = Array.from(event.target.files);
        files.forEach(file => this.addAttachedFile(file));
        event.target.value = '';
    }

    addAttachedFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileInfo = {
                id: this.generateId(),
                name: file.name,
                type: file.type,
                content: e.target.result,
                size: file.size
            };

            const filesContainer = document.getElementById('attachedFiles');
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            fileElement.dataset.fileId = fileInfo.id;
            fileElement.dataset.fileName = fileInfo.name;
            fileElement.dataset.fileType = fileInfo.type;
            fileElement.dataset.fileContent = fileInfo.content;
            
            fileElement.innerHTML = `
                <i class="ti ti-file-text file-icon"></i>
                <span class="file-name">${this.escapeHtml(fileInfo.name)}</span>
                <button class="remove-file" data-file-id="${fileInfo.id}">
                    <i class="ti ti-x"></i>
                </button>
            `;

            filesContainer.appendChild(fileElement);
        };

        if (file.type.startsWith('image/')) {
            reader.readAsDataURL(file);
        } else {
            reader.readAsText(file);
        }
    }

    removeAttachedFile(fileId) {
        const fileElement = document.querySelector(`[data-file-id="${fileId}"]`);
        if (fileElement) {
            fileElement.remove();
        }
    }

    clearAttachedFiles() {
        document.getElementById('attachedFiles').innerHTML = '';
    }

    // Поиск по сообщениям
    handleSearch(query) {
        const clearBtn = document.getElementById('headerSearchClear');
        clearBtn.style.display = query ? 'flex' : 'none';

        if (!query.trim()) {
            this.clearSearch();
            return;
        }

        const messages = document.querySelectorAll('.message');
        this.searchResults = [];
        this.currentSearchIndex = -1;

        messages.forEach((message, index) => {
            const content = message.querySelector('.message-content').textContent;
            const messageId = message.dataset.messageId;
            
            if (content.toLowerCase().includes(query.toLowerCase())) {
                this.searchResults.push({ messageId, index });
                
                // Подсветка найденного текста
                const highlightedContent = this.highlightText(content, query);
                message.querySelector('.message-content').innerHTML = highlightedContent;
                
                // Переподсветка кода
                this.highlightCodeBlocks(message);
            }
        });

        if (this.searchResults.length > 0) {
            this.currentSearchIndex = 0;
            this.showSearchResultsDropdown();
            this.highlightCurrentSearchResult();
            this.showNotification(`Найдено ${this.searchResults.length} совпадений`, 'success');
        } else {
            this.hideSearchResultsDropdown();
            this.showNotification('Совпадений не найдено', 'warning');
        }

        this.updateMinimap();
    }

    // Показать выпадающий список результатов поиска
    showSearchResultsDropdown() {
        const dropdown = document.getElementById('searchResultsDropdown');
        const list = document.getElementById('searchResultsList');
        
        list.innerHTML = this.searchResults.map((result, index) => {
            const message = document.querySelector(`[data-message-id="${result.messageId}"]`);
            const content = message.querySelector('.message-content').textContent;
            const preview = this.getSearchPreview(content, this.headerSearch.value);
            
            return `
                <div class="search-result-item ${index === this.currentSearchIndex ? 'current' : ''}" 
                     onclick="window.khaiAssistant.navigateToSearchResult(${index})">
                    <div style="font-weight: 500; margin-bottom: 2px;">
                        ${message.classList.contains('message-user') ? '👤 Вы' : '🤖 KHAI'}
                    </div>
                    <div style="font-size: 12px; color: var(--text-tertiary);">
                        ${preview}
                    </div>
                </div>
            `;
        }).join('');
        
        dropdown.style.display = 'block';
    }

    // Скрыть выпадающий список результатов поиска
    hideSearchResultsDropdown() {
        document.getElementById('searchResultsDropdown').style.display = 'none';
    }

    // Получить превью для результата поиска
    getSearchPreview(content, query) {
        const index = content.toLowerCase().indexOf(query.toLowerCase());
        const start = Math.max(0, index - 30);
        const end = Math.min(content.length, index + query.length + 50);
        
        let preview = content.substring(start, end);
        if (start > 0) preview = '...' + preview;
        if (end < content.length) preview = preview + '...';
        
        return preview;
    }

    // Подсветка текста в результатах поиска
    highlightText(text, query) {
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    // Экранирование regex
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Очистка поиска
    clearSearch() {
        document.getElementById('headerSearch').value = '';
        document.getElementById('headerSearchClear').style.display = 'none';
        this.hideSearchResultsDropdown();
        
        // Восстановление оригинального содержимого сообщений
        const messages = document.querySelectorAll('.message');
        messages.forEach(message => {
            const messageId = message.dataset.messageId;
            const chat = this.chats.get(this.currentChatId);
            if (chat) {
                const originalMessage = chat.messages.find(msg => msg.id === messageId);
                if (originalMessage) {
                    const content = originalMessage.type === 'ai' ? 
                        this.renderMarkdown(originalMessage.content) : 
                        this.escapeHtml(originalMessage.content);
                    message.querySelector('.message-content').innerHTML = content;
                    
                    if (originalMessage.type === 'ai') {
                        this.highlightCodeBlocks(message);
                    }
                }
            }
        });

        this.searchResults = [];
        this.currentSearchIndex = -1;
        this.updateMinimap();
    }

    // Навигация к результату поиска
    navigateToSearchResult(index) {
        if (index < 0 || index >= this.searchResults.length) return;
        
        this.currentSearchIndex = index;
        const result = this.searchResults[index];
        
        // Scroll to message
        const messageElement = document.querySelector(`[data-message-id="${result.messageId}"]`);
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add visual highlight
            messageElement.style.animation = 'none';
            messageElement.offsetHeight; // Trigger reflow
            messageElement.style.animation = 'fadeIn 0.5s ease';
            messageElement.style.backgroundColor = 'var(--accent-primary-alpha)';
            
            setTimeout(() => {
                messageElement.style.backgroundColor = '';
            }, 2000);
        }
        
        // Update search results display
        this.showSearchResultsDropdown();
    }

    // Подсветка текущего результата поиска
    highlightCurrentSearchResult() {
        // Сброс предыдущей подсветки
        document.querySelectorAll('.search-highlight').forEach(highlight => {
            highlight.classList.remove('current');
        });

        if (this.currentSearchIndex >= 0 && this.currentSearchIndex < this.searchResults.length) {
            const currentResult = this.searchResults[this.currentSearchIndex];
            const messageElement = document.querySelector(`[data-message-id="${currentResult.messageId}"]`);
            
            if (messageElement) {
                const highlight = messageElement.querySelector('.search-highlight');
                if (highlight) {
                    highlight.classList.add('current');
                }
            }
        }
    }

    // Навигация по мини-карте
    handleMinimapClick(event) {
        const minimap = document.getElementById('chatMinimap');
        const rect = minimap.getBoundingClientRect();
        const clickY = event.clientY - rect.top;
        const percentage = clickY / rect.height;
        
        const messagesContainer = document.getElementById('messagesContainer');
        const scrollHeight = messagesContainer.scrollHeight - messagesContainer.clientHeight;
        messagesContainer.scrollTop = percentage * scrollHeight;
    }

    // Обновление мини-карты
    updateMinimap() {
        const minimapContent = document.getElementById('minimapContent');
        const messagesContainer = document.getElementById('messagesContainer');
        const messages = Array.from(messagesContainer.querySelectorAll('.message'));
        
        minimapContent.innerHTML = '';
        
        messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.className = `minimap-message ${message.classList.contains('message-user') ? 'user' : 'ai'}`;
            
            // Подсветка результатов поиска
            if (this.searchResults.some(result => {
                const msgElement = document.querySelector(`[data-message-id="${result.messageId}"]`);
                return msgElement === message;
            })) {
                messageDiv.classList.add('search-highlighted');
            }
            
            minimapContent.appendChild(messageDiv);
        });
        
        this.updateMinimapViewport();
    }

    // Обновление viewport мини-карты
    updateMinimapViewport() {
        const messagesContainer = document.getElementById('messagesContainer');
        const minimapViewport = document.getElementById('minimapViewport');
        const minimap = document.getElementById('chatMinimap');
        
        const scrollPercentage = messagesContainer.scrollTop / (messagesContainer.scrollHeight - messagesContainer.clientHeight);
        const viewportPercentage = messagesContainer.clientHeight / messagesContainer.scrollHeight;
        
        const viewportHeight = Math.max(viewportPercentage * minimap.clientHeight, 10);
        const viewportTop = scrollPercentage * (minimap.clientHeight - viewportHeight);
        
        minimapViewport.style.height = `${viewportHeight}px`;
        minimapViewport.style.top = `${viewportTop}px`;
    }

    // Прокрутка к последнему AI сообщению
    scrollToLastAIMessage() {
        const aiMessages = Array.from(document.querySelectorAll('.message-ai'));
        if (aiMessages.length > 0) {
            const lastAIMessage = aiMessages[aiMessages.length - 1];
            lastAIMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Прокрутка к низу
    scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        container.scrollTop = container.scrollHeight;
    }

    // Копирование сообщения
    copyMessage(button) {
        const messageId = button.dataset.messageId;
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        const content = messageElement.querySelector('.message-content').textContent;
        
        navigator.clipboard.writeText(content).then(() => {
            this.showNotification('Сообщение скопировано в буфер обмена', 'success');
        });
    }

    // Копирование кода
    copyCode(button) {
        const codeBlock = button.closest('.code-header').nextElementSibling;
        const code = codeBlock.textContent;
        
        navigator.clipboard.writeText(code).then(() => {
            button.innerHTML = '<i class="ti ti-check"></i> Скопировано';
            button.classList.add('copied');
            setTimeout(() => {
                button.innerHTML = '<i class="ti ti-copy"></i> Копировать';
                button.classList.remove('copied');
            }, 2000);
        });
    }

    // Озвучка текста
    toggleSpeech(button) {
        const text = button.dataset.text;
        
        if (button.classList.contains('speaking')) {
            // Остановка воспроизведения
            speechSynthesis.cancel();
            button.classList.remove('speaking');
            button.innerHTML = '<i class="ti ti-microphone"></i> Озвучить';
        } else {
            // Начало воспроизведения
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ru-RU';
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            
            utterance.onstart = () => {
                button.classList.add('speaking');
                button.innerHTML = '<i class="ti ti-square"></i> Остановить';
            };
            
            utterance.onend = () => {
                button.classList.remove('speaking');
                button.innerHTML = '<i class="ti ti-microphone"></i> Озвучить';
            };
            
            speechSynthesis.speak(utterance);
        }
    }

    // Перегенерация сообщения
    regenerateMessage(button) {
        const messageId = button.dataset.messageId;
        const chat = this.chats.get(this.currentChatId);
        if (chat) {
            const messageIndex = chat.messages.findIndex(msg => msg.id === messageId);
            if (messageIndex > 0) {
                // Удаляем все сообщения после выбранного
                chat.messages = chat.messages.slice(0, messageIndex);
                this.saveChats();
                this.loadCurrentChat();
                
                // Повторно отправляем последнее сообщение пользователя
                const lastUserMessage = chat.messages[chat.messages.length - 1];
                if (lastUserMessage && lastUserMessage.type === 'user') {
                    document.getElementById('userInput').value = lastUserMessage.content;
                    this.sendMessage();
                }
            }
        }
    }

    // Скачивание истории чата
    downloadChatHistory() {
        const chat = this.chats.get(this.currentChatId);
        if (!chat || chat.messages.length === 0) {
            this.showNotification('Нет сообщений для скачивания', 'warning');
            return;
        }

        const content = chat.messages.map(msg => {
            const role = msg.type === 'user' ? 'Пользователь' : 'Ассистент';
            const timestamp = new Date(msg.timestamp).toLocaleString('ru-RU');
            return `[${timestamp}] ${role}: ${msg.content}`;
        }).join('\n\n');

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khai-chat-${this.currentChatId}-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('История чата скачана', 'success');
    }

    // Показ помощи
    showHelp() {
        const helpMessage = `
## KHAI Assistant - Помощь

### Основные возможности:
- **Бесплатный доступ** к продвинутым AI моделям
- **Генерация текста** с поддержкой markdown и подсветкой кода
- **Голосовой ввод** и озвучка ответов
- **Генерация изображений** по текстовому описанию
- **Поиск по истории** сообщений
- **Мини-карта** для навигации по длинным чатам
- **Режим чтения** - скрывает интерфейс для удобного чтения

### Горячие клавиши:
- **Enter** - отправить сообщение
- **Shift + Enter** - новая строка
- **Ctrl + F** - поиск по чату

### Поддерживаемые модели:
- GPT-4 Turbo (рекомендуется)
- GPT-3.5 Turbo (быстрая)
- Claude 2 (для анализа)
- Gemini Pro (универсальная)

### Советы:
- Используйте конкретные запросы для лучших результатов
- Прикрепляйте файлы для контекста
- Переключайте режимы генерации в зависимости от задачи
- Используйте режим чтения для удобного просмотра длинных ответов
        `.trim();

        const helpChat = {
            id: 'help',
            name: 'Помощь',
            messages: [
                {
                    id: this.generateId(),
                    type: 'ai',
                    content: helpMessage,
                    timestamp: new Date().toISOString(),
                    model: 'help'
                }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Временно добавляем чат помощи и переключаемся на него
        this.chats.set('help', helpChat);
        const previousChatId = this.currentChatId;
        this.currentChatId = 'help';
        this.renderChatList();
        this.loadCurrentChat();
        
        // Автоматическое удаление чата помощи при переключении
        const checkHelpChat = () => {
            if (this.currentChatId !== 'help') {
                this.chats.delete('help');
                this.renderChatList();
            }
        };

        // Следим за изменением текущего чата
        const observer = new MutationObserver(() => {
            if (this.currentChatId !== 'help') {
                checkHelpChat();
                observer.disconnect();
            }
        });

        observer.observe(document.getElementById('currentChatName'), {
            childList: true,
            subtree: true
        });
    }

    // Показ уведомлений
    showNotification(message, type = 'info') {
        const container = document.createElement('div');
        container.className = 'notification-container';
        document.body.appendChild(container);

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

        container.appendChild(notification);

        // Автоматическое скрытие
        setTimeout(() => {
            notification.style.animation = 'slideDown 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                if (container.parentNode && container.children.length === 0) {
                    container.parentNode.removeChild(container);
                }
            }, 300);
        }, 5000);

        // Закрытие по клику
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.animation = 'slideDown 0.3s ease reverse';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                if (container.parentNode && container.children.length === 0) {
                    container.parentNode.removeChild(container);
                }
            }, 300);
        });
    }

    // Получение иконки для уведомления
    getNotificationIcon(type) {
        const icons = {
            success: 'circle-check',
            error: 'alert-circle',
            warning: 'alert-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Показ ошибки
    showError(message) {
        const errorMessage = {
            id: this.generateId(),
            type: 'error',
            content: message,
            timestamp: new Date().toISOString()
        };
        this.addMessage(errorMessage);
    }

    // Обработка изменения размера окна
    handleResize() {
        this.updateMinimapViewport();
        this.updateMinimap();
    }

    // Инициализация при загрузке
    static init() {
        return new KHAIAssistant();
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.khaiAssistant = KHAIAssistant.init();
});

// Обработка ошибок
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
