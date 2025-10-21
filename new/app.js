// KHAI - Первый белорусский ИИ-чат
// Основной JavaScript файл приложения

class KHAIApp {
    constructor() {
        this.currentChatId = 'default';
        this.chats = new Map();
        this.isGenerating = false;
        this.speechSynthesis = window.speechSynthesis;
        this.currentUtterance = null;
        this.isListening = false;
        this.recognition = null;
        this.isOnline = true;
        this.settings = {
            autoSpeech: false,
            streaming: true,
            saveHistory: true,
            theme: 'auto'
        };
        
        this.puterAI = null;
        this.currentModel = 'gpt-5-nano';
        
        this.init();
    }

    async init() {
        try {
            // Инициализация приложения
            await this.loadSettings();
            await this.loadChats();
            this.initUI();
            this.initEventListeners();
            this.initSpeechRecognition();
            this.initPuterAI();
            this.checkConnection();
            
            // Показать приветственное сообщение
            if (this.chats.get(this.currentChatId)?.messages.length === 0) {
                this.showWelcomeMessage();
            }
            
            console.log('🚀 KHAI приложение инициализировано');
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.showError('Ошибка загрузки приложения');
        }
    }

    // Инициализация Puter AI
    async initPuterAI() {
        try {
            if (typeof puter === 'undefined') {
                throw new Error('Puter AI SDK не загружен');
            }
            
            this.puterAI = puter.ai;
            console.log('✅ Puter AI инициализирован');
        } catch (error) {
            console.error('Ошибка инициализации Puter AI:', error);
            this.showError('Не удалось инициализировать AI сервис');
        }
    }

    // Инициализация UI
    initUI() {
        this.applyTheme();
        this.updateChatList();
        this.updateConnectionStatus();
        this.autoResizeTextarea();
    }

    // Инициализация обработчиков событий
    initEventListeners() {
        // Основные элементы
        this.sendBtn = document.getElementById('sendBtn');
        this.userInput = document.getElementById('userInput');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.fileInput = document.getElementById('fileInput');
        this.attachFileBtn = document.getElementById('attachFileBtn');
        this.attachedFiles = document.getElementById('attachedFiles');
        this.clearInputBtn = document.getElementById('clearInputBtn');
        this.voiceInputBtn = document.getElementById('voiceInputBtn');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        this.exportChatBtn = document.getElementById('exportChatBtn');
        this.generateVoiceBtn = document.getElementById('generateVoiceBtn');
        this.helpBtn = document.getElementById('helpBtn');
        
        // Навигация и меню
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebarMenu = document.getElementById('sidebarMenu');
        this.sidebarClose = document.getElementById('sidebarClose');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.dataManagementBtn = document.getElementById('dataManagementBtn');
        
        // Настройки
        this.themeToggle = document.getElementById('themeToggle');
        this.modelSelect = document.getElementById('modelSelect');
        this.settingsModal = document.getElementById('settingsModal');
        this.settingsClose = document.getElementById('settingsClose');
        
        // Обработчики ввода
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keydown', (e) => this.handleInputKeydown(e));
        this.userInput.addEventListener('input', () => this.autoResizeTextarea());
        
        // Обработчики файлов
        this.attachFileBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.clearInputBtn.addEventListener('click', () => this.clearInput());
        
        // Голосовой ввод
        this.voiceInputBtn.addEventListener('click', () => this.toggleVoiceInput());
        
        // Управление чатами
        this.clearChatBtn.addEventListener('click', () => this.clearCurrentChat());
        this.exportChatBtn.addEventListener('click', () => this.exportChat());
        this.generateVoiceBtn.addEventListener('click', () => this.generateVoiceFromLastMessage());
        this.helpBtn.addEventListener('click', () => this.showHelp());
        
        // Навигация
        this.menuToggle.addEventListener('click', () => this.toggleSidebar());
        this.sidebarClose.addEventListener('click', () => this.toggleSidebar());
        this.sidebarOverlay.addEventListener('click', () => this.toggleSidebar());
        this.newChatBtn.addEventListener('click', () => this.createNewChat());
        this.settingsBtn.addEventListener('click', () => this.showSettings());
        this.dataManagementBtn.addEventListener('click', () => this.showDataManagement());
        
        // Настройки
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.modelSelect.addEventListener('change', (e) => {
            this.currentModel = e.target.value;
            this.saveSettings();
        });
        this.settingsClose.addEventListener('click', () => this.hideSettings());
        
        // Обработчики настроек
        document.getElementById('autoSpeech').addEventListener('change', (e) => {
            this.settings.autoSpeech = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('streaming').addEventListener('change', (e) => {
            this.settings.streaming = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('saveHistory').addEventListener('change', (e) => {
            this.settings.saveHistory = e.target.checked;
            this.saveSettings();
        });
        
        // События онлайн/офлайн
        window.addEventListener('online', () => this.handleConnectionChange(true));
        window.addEventListener('offline', () => this.handleConnectionChange(false));
        
        // Service Worker для PWA
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => console.log('✅ Service Worker зарегистрирован'))
                .catch(error => console.error('❌ Ошибка Service Worker:', error));
        }
    }

    // Инициализация распознавания речи
    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'ru-RU';
            
            this.recognition.onstart = () => {
                this.isListening = true;
                this.voiceInputBtn.classList.add('listening');
                this.updateVoiceButton();
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                this.voiceInputBtn.classList.remove('listening');
                this.updateVoiceButton();
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.userInput.value = transcript;
                this.autoResizeTextarea();
            };
            
            this.recognition.onerror = (event) => {
                console.error('Ошибка распознавания речи:', event.error);
                this.isListening = false;
                this.voiceInputBtn.classList.remove('listening');
                this.updateVoiceButton();
                
                if (event.error === 'not-allowed') {
                    this.showError('Разрешите доступ к микрофону для голосового ввода');
                }
            };
        } else {
            this.voiceInputBtn.style.display = 'none';
            console.warn('Браузер не поддерживает распознавание речи');
        }
    }

    // Обновление состояния кнопки голосового ввода
    updateVoiceButton() {
        const icon = this.voiceInputBtn.querySelector('i');
        if (this.isListening) {
            icon.className = 'ti ti-microphone-off';
            this.voiceInputBtn.title = 'Остановить запись';
        } else {
            icon.className = 'ti ti-microphone';
            this.voiceInputBtn.title = 'Голосовой ввод';
        }
    }

    // Переключение голосового ввода
    toggleVoiceInput() {
        if (!this.recognition) {
            this.showError('Голосовой ввод не поддерживается в вашем браузере');
            return;
        }
        
        if (this.isListening) {
            this.recognition.stop();
        } else {
            try {
                this.recognition.start();
            } catch (error) {
                console.error('Ошибка запуска распознавания:', error);
            }
        }
    }

    // Обработка нажатия клавиш в поле ввода
    handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    // Автоматическое изменение размера текстового поля
    autoResizeTextarea() {
        const textarea = this.userInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    // Отправка сообщения
    async sendMessage() {
        const message = this.userInput.value.trim();
        const files = Array.from(this.fileInput.files);
        
        if (!message && files.length === 0) {
            return;
        }
        
        if (this.isGenerating) {
            this.showError('Подождите завершения предыдущего запроса');
            return;
        }
        
        // Добавление сообщения пользователя
        const userMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: message,
            timestamp: Date.now(),
            files: files.map(file => ({
                name: file.name,
                type: file.type,
                size: file.size,
                url: URL.createObjectURL(file)
            }))
        };
        
        this.addMessageToChat(userMessage);
        this.renderMessage(userMessage);
        this.clearInput();
        
        // Показать индикатор набора
        this.showTypingIndicator();
        
        try {
            this.isGenerating = true;
            this.updateSendButton();
            
            // Генерация ответа ИИ
            const aiResponse = await this.generateAIResponse(userMessage);
            
            // Удалить индикатор набора
            this.removeTypingIndicator();
            
            // Добавление ответа ИИ
            const aiMessage = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: aiResponse,
                timestamp: Date.now(),
                model: this.currentModel
            };
            
            this.addMessageToChat(aiMessage);
            this.renderMessage(aiMessage);
            
            // Авто-озвучка если включено
            if (this.settings.autoSpeech) {
                this.speakText(aiResponse);
            }
            
        } catch (error) {
            console.error('Ошибка генерации ответа:', error);
            this.removeTypingIndicator();
            this.showError(this.getErrorMessage(error));
        } finally {
            this.isGenerating = false;
            this.updateSendButton();
        }
    }

    // Генерация ответа ИИ
    async generateAIResponse(userMessage) {
        if (!this.puterAI) {
            throw new Error('AI сервис недоступен');
        }
        
        const context = this.getConversationContext();
        
        try {
            let response;
            
            if (userMessage.files && userMessage.files.length > 0) {
                // Мультимодальный запрос с изображениями
                response = await this.puterAI.chat({
                    model: this.currentModel,
                    messages: [
                        ...context,
                        {
                            role: 'user',
                            content: [
                                { type: 'text', text: userMessage.content },
                                ...userMessage.files.map(file => ({
                                    type: 'image',
                                    image: file.url
                                }))
                            ]
                        }
                    ],
                    stream: this.settings.streaming
                });
            } else {
                // Текстовый запрос
                response = await this.puterAI.chat({
                    model: this.currentModel,
                    messages: [
                        ...context,
                        { role: 'user', content: userMessage.content }
                    ],
                    stream: this.settings.streaming
                });
            }
            
            if (this.settings.streaming) {
                return await this.handleStreamingResponse(response);
            } else {
                return response.content;
            }
            
        } catch (error) {
            console.error('Ошибка AI запроса:', error);
            
            // Fallback ответы
            const fallbackResponses = [
                "Извините, возникла временная проблема с подключением к AI сервису. Пожалуйста, попробуйте еще раз.",
                "В настоящее время испытываются трудности с обработкой запроса. Проверьте подключение к интернету и попробуйте снова.",
                "Сервис временно недоступен. Пожалуйста, повторите попытку через несколько минут."
            ];
            
            return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        }
    }

    // Обработка потокового ответа
    async handleStreamingResponse(stream) {
        return new Promise((resolve, reject) => {
            let fullResponse = '';
            const messageElement = this.createMessageElement({
                id: 'streaming',
                type: 'ai',
                content: '',
                timestamp: Date.now()
            });
            
            this.messagesContainer.appendChild(messageElement);
            this.scrollToBottom();
            
            stream.on('data', (chunk) => {
                if (chunk.content) {
                    fullResponse += chunk.content;
                    this.updateStreamingMessage(messageElement, fullResponse);
                }
            });
            
            stream.on('end', () => {
                messageElement.id = 'message-' + Date.now();
                resolve(fullResponse);
            });
            
            stream.on('error', (error) => {
                messageElement.remove();
                reject(error);
            });
        });
    }

    // Обновление потокового сообщения
    updateStreamingMessage(element, content) {
        const contentElement = element.querySelector('.message-content');
        if (contentElement) {
            contentElement.innerHTML = this.formatMessage(content);
            this.highlightCodeBlocks(contentElement);
        }
        this.scrollToBottom();
    }

    // Получение контекста разговора
    getConversationContext() {
        const currentChat = this.chats.get(this.currentChatId);
        if (!currentChat) return [];
        
        return currentChat.messages
            .filter(msg => msg.type === 'user' || msg.type === 'ai')
            .map(msg => ({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: msg.content
            }));
    }

    // Добавление сообщения в чат
    addMessageToChat(message) {
        if (!this.chats.has(this.currentChatId)) {
            this.chats.set(this.currentChatId, {
                id: this.currentChatId,
                name: 'Новый чат',
                messages: [],
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
        }
        
        const chat = this.chats.get(this.currentChatId);
        chat.messages.push(message);
        chat.updatedAt = Date.now();
        
        if (this.settings.saveHistory) {
            this.saveChats();
        }
    }

    // Отображение сообщения
    renderMessage(message) {
        const messageElement = this.createMessageElement(message);
        
        if (message.type === 'ai' && this.settings.streaming && message.id === 'streaming') {
            // Потоковые сообщения добавляются отдельно
            return;
        }
        
        const existingMessage = document.getElementById(`message-${message.id}`);
        if (existingMessage) {
            existingMessage.replaceWith(messageElement);
        } else {
            this.messagesContainer.appendChild(messageElement);
        }
        
        this.scrollToBottom();
        this.updateChatList();
    }

    // Создание элемента сообщения
    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.id = `message-${message.id}`;
        messageDiv.className = `message message-${message.type}`;
        
        let content = '';
        
        if (message.type === 'user') {
            content = this.formatUserMessage(message);
        } else if (message.type === 'ai') {
            content = this.formatAIMessage(message);
        } else if (message.type === 'error') {
            content = this.formatErrorMessage(message);
        } else if (message.type === 'system') {
            content = this.formatSystemMessage(message);
        }
        
        messageDiv.innerHTML = content;
        
        // Инициализация подсветки кода
        this.highlightCodeBlocks(messageDiv);
        
        // Инициализация кнопок копирования кода
        this.initCodeCopyButtons(messageDiv);
        
        return messageDiv;
    }

    // Форматирование сообщения пользователя
    formatUserMessage(message) {
        let filesHTML = '';
        
        if (message.files && message.files.length > 0) {
            filesHTML = message.files.map(file => `
                <div class="message-image">
                    <img src="${file.url}" alt="${file.name}" loading="lazy" onerror="this.style.display='none'">
                </div>
            `).join('');
        }
        
        return `
            <div class="message-content">${this.escapeHtml(message.content)}</div>
            ${filesHTML}
            <div class="message-time">${this.formatTime(message.timestamp)}</div>
        `;
    }

    // Форматирование сообщения ИИ
    formatAIMessage(message) {
        const actions = `
            <div class="message-actions">
                <button class="action-btn-small copy-btn" onclick="app.copyMessage('${message.id}')" title="Копировать ответ">
                    <i class="ti ti-copy"></i> Копировать
                </button>
                <button class="action-btn-small speak-btn" onclick="app.speakText('${this.escapeHtml(message.content)}')" title="Озвучить ответ">
                    <i class="ti ti-volume"></i> Озвучить
                </button>
                <button class="action-btn-small regenerate-btn" onclick="app.regenerateResponse('${message.id}')" title="Перегенерировать ответ">
                    <i class="ti ti-refresh"></i> Перегенерировать
                </button>
            </div>
        `;
        
        return `
            <div class="message-content">${this.formatMessage(message.content)}</div>
            ${actions}
            <div class="model-indicator">
                <i class="ti ti-brain"></i>
                ${this.getModelDisplayName(message.model || this.currentModel)}
            </div>
            <div class="message-time">${this.formatTime(message.timestamp)}</div>
        `;
    }

    // Форматирование сообщения об ошибке
    formatErrorMessage(message) {
        return `
            <div class="message-content">
                <i class="ti ti-alert-triangle"></i>
                ${this.escapeHtml(message.content)}
            </div>
            <div class="message-time">${this.formatTime(message.timestamp)}</div>
        `;
    }

    // Форматирование системного сообщения
    formatSystemMessage(message) {
        return `
            <div class="message-content">
                <i class="ti ti-info-circle"></i>
                ${this.escapeHtml(message.content)}
            </div>
        `;
    }

    // Форматирование markdown сообщения
    formatMessage(content) {
        // Базовая очистка и преобразование markdown
        const cleanedContent = this.escapeHtml(content);
        return marked.parse(cleanedContent);
    }

    // Подсветка блоков кода
    highlightCodeBlocks(container) {
        container.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
            
            // Добавляем заголовок с языком программирования
            const language = block.className.match(/language-(\w+)/)?.[1] || 'text';
            const pre = block.parentElement;
            
            if (!pre.querySelector('.code-header')) {
                const header = document.createElement('div');
                header.className = 'code-header';
                header.innerHTML = `
                    <span class="code-language">${language}</span>
                    <button class="copy-code-btn" onclick="app.copyCode(this)">
                        <i class="ti ti-copy"></i> Копировать
                    </button>
                `;
                pre.insertBefore(header, block);
            }
        });
    }

    // Инициализация кнопок копирования кода
    initCodeCopyButtons(container) {
        container.querySelectorAll('.copy-code-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.copyCode(btn);
            });
        });
    }

    // Копирование кода
    copyCode(button) {
        const codeBlock = button.closest('pre').querySelector('code');
        const code = codeBlock.textContent;
        
        navigator.clipboard.writeText(code).then(() => {
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="ti ti-check"></i> Скопировано';
            button.classList.add('copied');
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Ошибка копирования:', err);
            this.showError('Не удалось скопировать код');
        });
    }

    // Копирование сообщения
    copyMessage(messageId) {
        const message = this.getMessageById(messageId);
        if (message) {
            navigator.clipboard.writeText(message.content).then(() => {
                this.showSystemMessage('Сообщение скопировано в буфер обмена');
            }).catch(err => {
                console.error('Ошибка копирования:', err);
                this.showError('Не удалось скопировать сообщение');
            });
        }
    }

    // Перегенерация ответа
    async regenerateResponse(messageId) {
        const message = this.getMessageById(messageId);
        if (!message || message.type !== 'ai') return;
        
        // Находим предыдущее сообщение пользователя
        const chat = this.chats.get(this.currentChatId);
        const messageIndex = chat.messages.findIndex(m => m.id === messageId);
        
        if (messageIndex > 0) {
            const userMessage = chat.messages[messageIndex - 1];
            
            // Удаляем старый ответ
            chat.messages.splice(messageIndex, 1);
            const messageElement = document.getElementById(`message-${messageId}`);
            if (messageElement) messageElement.remove();
            
            // Показываем индикатор набора
            this.showTypingIndicator();
            
            try {
                this.isGenerating = true;
                this.updateSendButton();
                
                // Генерируем новый ответ
                const newResponse = await this.generateAIResponse(userMessage);
                
                this.removeTypingIndicator();
                
                const newMessage = {
                    id: Date.now().toString(),
                    type: 'ai',
                    content: newResponse,
                    timestamp: Date.now(),
                    model: this.currentModel
                };
                
                this.addMessageToChat(newMessage);
                this.renderMessage(newMessage);
                
            } catch (error) {
                console.error('Ошибка перегенерации:', error);
                this.removeTypingIndicator();
                this.showError(this.getErrorMessage(error));
            } finally {
                this.isGenerating = false;
                this.updateSendButton();
            }
        }
    }

    // Получение сообщения по ID
    getMessageById(messageId) {
        const chat = this.chats.get(this.currentChatId);
        return chat?.messages.find(m => m.id === messageId);
    }

    // Показать индикатор набора
    showTypingIndicator() {
        this.removeTypingIndicator();
        
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <span>KHAI печатает...</span>
        `;
        
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    // Удалить индикатор набора
    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Обновление кнопки отправки
    updateSendButton() {
        const icon = this.sendBtn.querySelector('i');
        if (this.isGenerating) {
            this.sendBtn.disabled = true;
            icon.className = 'ti ti-clock';
        } else {
            const hasContent = this.userInput.value.trim() || this.fileInput.files.length > 0;
            this.sendBtn.disabled = !hasContent;
            icon.className = 'ti ti-send';
        }
    }

    // Очистка поля ввода
    clearInput() {
        this.userInput.value = '';
        this.fileInput.value = '';
        this.attachedFiles.innerHTML = '';
        this.autoResizeTextarea();
        this.updateSendButton();
    }

    // Обработка выбора файлов
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.attachedFiles.innerHTML = '';
        
        files.forEach(file => {
            if (!file.type.startsWith('image/')) {
                this.showError('Поддерживаются только изображения');
                return;
            }
            
            if (file.size > 10 * 1024 * 1024) { // 10MB
                this.showError('Размер файла не должен превышать 10MB');
                return;
            }
            
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            fileElement.innerHTML = `
                <img src="${URL.createObjectURL(file)}" alt="${file.name}">
                <span>${file.name}</span>
                <button class="remove-file" onclick="app.removeAttachedFile('${file.name}')">
                    <i class="ti ti-x"></i>
                </button>
            `;
            
            this.attachedFiles.appendChild(fileElement);
        });
        
        this.updateSendButton();
    }

    // Удаление прикрепленного файла
    removeAttachedFile(fileName) {
        const dt = new DataTransfer();
        const files = Array.from(this.fileInput.files);
        const updatedFiles = files.filter(file => file.name !== fileName);
        
        updatedFiles.forEach(file => dt.items.add(file));
        this.fileInput.files = dt.files;
        
        this.handleFileSelect({ target: this.fileInput });
    }

    // Озвучка текста
    speakText(text) {
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
            return;
        }
        
        // Останавливаем текущую озвучку
        if (this.currentUtterance) {
            this.speechSynthesis.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ru-RU';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        utterance.onstart = () => {
            this.currentUtterance = utterance;
            this.updateSpeakButtons(true);
        };
        
        utterance.onend = () => {
            this.currentUtterance = null;
            this.updateSpeakButtons(false);
        };
        
        utterance.onerror = (event) => {
            console.error('Ошибка озвучки:', event.error);
            this.currentUtterance = null;
            this.updateSpeakButtons(false);
            this.showError('Ошибка озвучки текста');
        };
        
        this.speechSynthesis.speak(utterance);
    }

    // Остановка озвучки
    stopSpeech() {
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
            this.currentUtterance = null;
            this.updateSpeakButtons(false);
        }
    }

    // Обновление кнопок озвучки
    updateSpeakButtons(isSpeaking) {
        document.querySelectorAll('.speak-btn').forEach(btn => {
            if (isSpeaking) {
                btn.classList.add('speaking');
                btn.innerHTML = '<i class="ti ti-player-pause"></i> Остановить';
            } else {
                btn.classList.remove('speaking');
                btn.innerHTML = '<i class="ti ti-volume"></i> Озвучить';
            }
        });
    }

    // Генерация голоса для последнего сообщения
    generateVoiceFromLastMessage() {
        const chat = this.chats.get(this.currentChatId);
        if (!chat || chat.messages.length === 0) return;
        
        const lastAIMessage = [...chat.messages].reverse().find(msg => msg.type === 'ai');
        if (lastAIMessage) {
            this.speakText(lastAIMessage.content);
        } else {
            this.showError('Нет сообщений для озвучки');
        }
    }

    // Создание нового чата
    createNewChat() {
        const newChatId = 'chat-' + Date.now();
        this.currentChatId = newChatId;
        
        this.chats.set(newChatId, {
            id: newChatId,
            name: 'Новый чат',
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        
        this.messagesContainer.innerHTML = '';
        this.showWelcomeMessage();
        this.updateChatList();
        this.toggleSidebar();
        
        if (this.settings.saveHistory) {
            this.saveChats();
        }
    }

    // Очистка текущего чата
    clearCurrentChat() {
        if (confirm('Вы уверены, что хотите очистить историю текущего чата?')) {
            const chat = this.chats.get(this.currentChatId);
            if (chat) {
                chat.messages = [];
                chat.updatedAt = Date.now();
            }
            
            this.messagesContainer.innerHTML = '';
            this.showWelcomeMessage();
            
            if (this.settings.saveHistory) {
                this.saveChats();
            }
        }
    }

    // Экспорт чата
    exportChat() {
        const chat = this.chats.get(this.currentChatId);
        if (!chat || chat.messages.length === 0) {
            this.showError('Нет сообщений для экспорта');
            return;
        }
        
        const exportData = {
            app: 'KHAI - Первый белорусский ИИ',
            version: '3.0',
            exportedAt: new Date().toISOString(),
            chat: chat
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `khai-chat-${this.currentChatId}-${Date.now()}.json`;
        link.click();
        
        URL.revokeObjectURL(link.href);
        this.showSystemMessage('Чат успешно экспортирован');
    }

    // Показать справку
    showHelp() {
        const helpMessage = `
## 🤖 KHAI - Справка

### Основные возможности:
- **Бесплатный AI-чат** с поддержкой различных моделей
- **Голосовой ввод** и озвучка ответов
- **Загрузка изображений** для анализа
- **Экспорт чатов** в JSON формате
- **PWA поддержка** - установка на устройство
- **Офлайн-режим** с сохранением истории

### Горячие клавиши:
- **Enter** - отправить сообщение
- **Shift + Enter** - новая строка
- **Ctrl + /** - открыть справку

### Поддерживаемые модели:
- GPT-5 Nano, O3 Mini
- DeepSeek Chat & Reasoner
- Gemini 2.0/1.5 Flash
- xAI Grok

### Советы:
- Задавайте конкретные вопросы для лучших ответов
- Используйте изображения для визуального анализа
- Включите авто-озвучку в настройках для удобства
        `.trim();
        
        this.showSystemMessage(helpMessage);
    }

    // Показать приветственное сообщение
    showWelcomeMessage() {
        const welcomeMessage = `
## 🇧🇾 Добро пожаловать в KHAI!

**Первый белорусский искусственный интеллект** готов помочь вам с любыми вопросами.

### 🚀 Что я умею:
- Отвечать на вопросы и помогать с задачами
- Анализировать изображения и документы
- Поддерживать беседу на русском языке
- Озвучивать ответы и принимать голосовые команды

### 💡 Попробуйте спросить:
- "Расскажи о возможностях искусственного интеллекта"
- "Помоги написать письмо"
- "Объясни сложную тему простыми словами"
- Загрузите изображение для анализа

*Выберите модель ИИ в верхнем меню для начала работы!*
        `.trim();
        
        const systemMessage = {
            id: 'welcome',
            type: 'system',
            content: welcomeMessage,
            timestamp: Date.now()
        };
        
        this.renderMessage(systemMessage);
    }

    // Показать сообщение об ошибке
    showError(message) {
        const errorMessage = {
            id: 'error-' + Date.now(),
            type: 'error',
            content: message,
            timestamp: Date.now()
        };
        
        this.renderMessage(errorMessage);
    }

    // Показать системное сообщение
    showSystemMessage(message) {
        const systemMessage = {
            id: 'system-' + Date.now(),
            type: 'system',
            content: message,
            timestamp: Date.now()
        };
        
        this.renderMessage(systemMessage);
    }

    // Получение понятного сообщения об ошибке
    getErrorMessage(error) {
        if (error.message?.includes('network') || error.message?.includes('Network')) {
            return 'Проблемы с подключением к интернету. Проверьте соединение и попробуйте снова.';
        } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
            return 'Превышены лимиты использования. Попробуйте позже или выберите другую модель.';
        } else if (error.message?.includes('auth') || error.message?.includes('token')) {
            return 'Ошибка авторизации. Обновите страницу и попробуйте снова.';
        } else {
            return 'Произошла непредвиденная ошибка. Пожалуйста, попробуйте еще раз.';
        }
    }

    // Управление боковым меню
    toggleSidebar() {
        this.sidebarMenu.classList.toggle('open');
        this.sidebarOverlay.classList.toggle('active');
        
        if (this.sidebarMenu.classList.contains('open')) {
            this.updateChatList();
        }
    }

    // Обновление списка чатов
    updateChatList() {
        const chatList = document.getElementById('chatList');
        if (!chatList) return;
        
        const chatsArray = Array.from(this.chats.values())
            .sort((a, b) => b.updatedAt - a.updatedAt);
        
        chatList.innerHTML = chatsArray.map(chat => `
            <div class="chat-item ${chat.id === this.currentChatId ? 'active' : ''}" 
                 onclick="app.switchChat('${chat.id}')">
                <span>${this.escapeHtml(chat.name)}</span>
                <div class="chat-item-actions">
                    <button class="chat-item-action" onclick="app.renameChat('${chat.id}')" title="Переименовать">
                        <i class="ti ti-edit"></i>
                    </button>
                    <button class="chat-item-action" onclick="app.deleteChat('${chat.id}')" title="Удалить">
                        <i class="ti ti-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Переключение чата
    switchChat(chatId) {
        if (this.chats.has(chatId)) {
            this.currentChatId = chatId;
            this.messagesContainer.innerHTML = '';
            
            const chat = this.chats.get(chatId);
            chat.messages.forEach(message => this.renderMessage(message));
            
            this.updateChatList();
            this.toggleSidebar();
            
            if (chat.messages.length === 0) {
                this.showWelcomeMessage();
            }
        }
    }

    // Переименование чата
    renameChat(chatId) {
        const chat = this.chats.get(chatId);
        if (!chat) return;
        
        const newName = prompt('Введите новое название чата:', chat.name);
        if (newName && newName.trim()) {
            chat.name = newName.trim();
            chat.updatedAt = Date.now();
            this.updateChatList();
            
            if (this.settings.saveHistory) {
                this.saveChats();
            }
        }
    }

    // Удаление чата
    deleteChat(chatId) {
        if (this.chats.size <= 1) {
            this.showError('Нельзя удалить последний чат');
            return;
        }
        
        if (confirm('Вы уверены, что хотите удалить этот чат?')) {
            this.chats.delete(chatId);
            
            if (this.currentChatId === chatId) {
                const remainingChats = Array.from(this.chats.keys());
                this.currentChatId = remainingChats[0];
                this.switchChat(this.currentChatId);
            }
            
            this.updateChatList();
            
            if (this.settings.saveHistory) {
                this.saveChats();
            }
        }
    }

    // Настройки
    showSettings() {
        // Обновляем значения переключателей
        document.getElementById('autoSpeech').checked = this.settings.autoSpeech;
        document.getElementById('streaming').checked = this.settings.streaming;
        document.getElementById('saveHistory').checked = this.settings.saveHistory;
        
        this.settingsModal.classList.add('active');
        this.toggleSidebar();
    }

    hideSettings() {
        this.settingsModal.classList.remove('active');
    }

    showDataManagement() {
        const chatCount = this.chats.size;
        const totalMessages = Array.from(this.chats.values())
            .reduce((sum, chat) => sum + chat.messages.length, 0);
        
        const message = `
### 📊 Управление данными

**Статистика:**
- Активных чатов: ${chatCount}
- Всего сообщений: ${totalMessages}
- Размер данных: ${this.estimateStorageSize()} KB

**Действия:**
- Экспорт всех чатов
- Очистка истории
- Удаление неиспользуемых данных

*Для детального управления используйте инструменты разработчика в вашем браузере.*
        `.trim();
        
        this.showSystemMessage(message);
        this.toggleSidebar();
    }

    // Оценка размера хранилища
    estimateStorageSize() {
        const data = JSON.stringify(Array.from(this.chats.entries()));
        return Math.round(new Blob([data]).size / 1024);
    }

    // Управление темой
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        let newTheme;
        
        if (currentTheme === 'dark') {
            newTheme = 'light';
        } else if (currentTheme === 'light') {
            newTheme = 'auto';
        } else {
            newTheme = 'dark';
        }
        
        this.settings.theme = newTheme;
        this.applyTheme();
        this.saveSettings();
    }

    applyTheme() {
        const theme = this.settings.theme;
        
        if (theme === 'auto') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }

    // Проверка соединения
    checkConnection() {
        this.isOnline = navigator.onLine;
        this.updateConnectionStatus();
    }

    handleConnectionChange(online) {
        this.isOnline = online;
        this.updateConnectionStatus();
        
        if (online) {
            this.showSystemMessage('Соединение восстановлено');
        } else {
            this.showError('Потеряно соединение с интернетом');
        }
    }

    updateConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            const icon = statusElement.querySelector('i');
            const text = statusElement.querySelector('span');
            
            if (this.isOnline) {
                statusElement.className = 'connection-status online';
                icon.className = 'ti ti-wifi';
                text.textContent = 'Онлайн';
            } else {
                statusElement.className = 'connection-status offline';
                icon.className = 'ti ti-wifi-off';
                text.textContent = 'Офлайн';
            }
        }
    }

    // Прокрутка к низу
    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    // Вспомогательные методы
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getModelDisplayName(model) {
        const modelNames = {
            'gpt-5-nano': 'GPT-5 Nano',
            'o3-mini': 'O3 Mini',
            'deepseek-chat': 'DeepSeek Chat',
            'deepseek-reasoner': 'DeepSeek Reasoner',
            'gemini-2.0-flash': 'Gemini 2.0 Flash',
            'gemini-1.5-flash': 'Gemini 1.5 Flash',
            'grok-beta': 'xAI Grok'
        };
        
        return modelNames[model] || model;
    }

    // Сохранение и загрузка настроек
    async saveSettings() {
        try {
            localStorage.setItem('khai-settings', JSON.stringify(this.settings));
            localStorage.setItem('khai-current-model', this.currentModel);
        } catch (error) {
            console.error('Ошибка сохранения настроек:', error);
        }
    }

    async loadSettings() {
        try {
            const saved = localStorage.getItem('khai-settings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
            
            const savedModel = localStorage.getItem('khai-current-model');
            if (savedModel) {
                this.currentModel = savedModel;
                this.modelSelect.value = savedModel;
            }
        } catch (error) {
            console.error('Ошибка загрузки настроек:', error);
        }
    }

    // Сохранение и загрузка чатов
    async saveChats() {
        if (!this.settings.saveHistory) return;
        
        try {
            const chatsData = Array.from(this.chats.entries());
            localStorage.setItem('khai-chats', JSON.stringify(chatsData));
            localStorage.setItem('khai-current-chat', this.currentChatId);
        } catch (error) {
            console.error('Ошибка сохранения чатов:', error);
        }
    }

    async loadChats() {
        try {
            const savedChats = localStorage.getItem('khai-chats');
            if (savedChats) {
                const chatsData = JSON.parse(savedChats);
                this.chats = new Map(chatsData);
            } else {
                // Создаем дефолтный чат
                this.chats.set('default', {
                    id: 'default',
                    name: 'Основной чат',
                    messages: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                });
            }
            
            const savedCurrentChat = localStorage.getItem('khai-current-chat');
            if (savedCurrentChat && this.chats.has(savedCurrentChat)) {
                this.currentChatId = savedCurrentChat;
            }
        } catch (error) {
            console.error('Ошибка загрузки чатов:', error);
            // Создаем дефолтный чат при ошибке
            this.chats.set('default', {
                id: 'default',
                name: 'Основной чат',
                messages: [],
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
        }
    }
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.app = new KHAIApp();
});

// Глобальные обработчики для PWA
window.addEventListener('beforeinstallprompt', (e) => {
    // Можно показать кнопку установки PWA
    console.log('PWA ready for installation');
});

// Обработка ошибок
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});
