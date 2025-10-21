// KHAI — Advanced AI Chat Application (Production Ready)
class KHAIChat {
    constructor() {
        // Application state
        this.state = {
            chats: new Map(),
            currentChatId: 'main-chat',
            messages: [],
            settings: {
                theme: 'dark',
                fontSize: 'medium',
                model: 'gpt-4',
                autoScroll: true,
                soundEnabled: true,
                offlineMode: false
            },
            isGenerating: false,
            generationAborted: false,
            isOnline: navigator.onLine,
            attachedFiles: [],
            currentMode: 'normal',
            conversationHistory: [],
            // Новые состояния
            isListening: false,
            isSpeaking: false,
            searchTerm: '',
            puterInitialized: false
        };

        // Puter.js модели
        this.models = {
            'gpt-4': { 
                name: 'GPT-4', 
                description: 'Самый продвинутый модель для сложных задач',
                icon: 'ti ti-brain'
            },
            'gpt-3.5-turbo': { 
                name: 'GPT-3.5 Turbo', 
                description: 'Быстрый и эффективный для повседневных задач',
                icon: 'ti ti-flame'
            },
            'claude-3-sonnet': { 
                name: 'Claude 3', 
                description: 'Отличный для креативных задач и анализа',
                icon: 'ti ti-cloud'
            }
        };

        this.modeConfigs = {
            normal: { 
                icon: 'ti ti-message', 
                color: '#0099ff',
                placeholder: 'Задайте вопрос или опишите задачу...'
            },
            creative: { 
                icon: 'ti ti-sparkles', 
                color: '#9c27b0',
                placeholder: 'Опишите креативную задачу или идею...'
            },
            code: { 
                icon: 'ti ti-code', 
                color: '#4caf50',
                placeholder: 'Опишите код который нужно написать или исправить...'
            }
        };

        // Performance optimizations
        this.performance = {
            activeTimeouts: new Set(),
            activeEventListeners: new Map()
        };

        this.init();
    }

    // ==================== INITIALIZATION ====================

    async init() {
        try {
            await this.setupPuterAI();
            await this.loadApplicationState();
            await this.setupEventListeners();
            this.initializeUI();
            this.showWelcomeMessage();
            
            this.hideLoader();
            this.showNotification('KHAI готов к работе!', 'success');
            
            console.log('KHAI Chat initialized successfully');
        } catch (error) {
            console.error('Failed to initialize KHAI Chat:', error);
            this.showNotification('Ошибка инициализации приложения', 'error');
        }
    }

    async setupPuterAI() {
        try {
            if (typeof puter !== 'undefined') {
                this.puter = puter;
                this.state.puterInitialized = true;
                console.log('Puter.js successfully initialized');
                
                // Проверяем доступность AI функций
                if (typeof puter.ai?.chat === 'function') {
                    this.showNotification('Puter.ai подключен!', 'success');
                }
            } else {
                throw new Error('Puter.js not available');
            }
        } catch (error) {
            console.warn('Puter.js initialization failed:', error);
            this.showNotification('Puter.js не доступен, используем демо-режим', 'warning');
            this.setupPuterFallback();
        }
    }

    setupPuterFallback() {
        this.puter = {
            ai: {
                chat: async (prompt, options) => {
                    console.log('Puter.ai fallback - chat called');
                    return this.mockAIResponse(prompt);
                },
                img2txt: async (imageData) => {
                    return "Это демонстрационное изображение. В реальном режиме здесь был бы распознанный текст.";
                },
                imagine: async (prompt, options) => {
                    return {
                        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%230099ff'/%3E%3Ctext x='200' y='220' font-family='Arial' font-size='24' text-anchor='middle' fill='white'%3EDemo Image%3C/text%3E%3C/svg%3E"
                    };
                },
                txt2speech: async (text) => {
                    return {
                        src: "#"
                    };
                }
            }
        };
    }

    // ==================== EVENT LISTENERS ====================

    async setupEventListeners() {
        // Основные обработчики
        this.addEventListener('#sendBtn', 'click', () => this.handleSendMessage());
        
        const userInput = this.getElement('#userInput');
        if (userInput) {
            this.addEventListener(userInput, 'keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendMessage();
                }
            });

            this.addEventListener(userInput, 'input', () => {
                this.autoResizeTextarea(userInput);
                this.toggleClearInputButton();
            });
        }

        // Очистка ввода
        this.addEventListener('#clearInputBtn', 'click', () => {
            if (userInput) {
                userInput.value = '';
                this.autoResizeTextarea(userInput);
                this.toggleClearInputButton();
                userInput.focus();
            }
        });

        // Очистка чата
        this.addEventListener('#clearChatBtn', 'click', () => {
            this.clearCurrentChat();
        });

        // Голосовой ввод
        this.addEventListener('#voiceInputBtn', 'click', () => {
            this.toggleVoiceInput();
        });

        // Прикрепление файлов
        this.addEventListener('#attachFileBtn', 'click', () => {
            this.getElement('#fileInput').click();
        });

        this.addEventListener('#fileInput', 'change', (e) => {
            this.handleFileUpload(e.target.files);
        });

        // Смена режимов
        document.querySelectorAll('.mode-btn').forEach(btn => {
            this.addEventListener(btn, 'click', (e) => {
                this.switchMode(e.currentTarget.dataset.mode);
            });
        });

        // Смена модели
        this.addEventListener('#modelSelect', 'change', (e) => {
            this.changeModel(e.target.value);
        });

        // Тема
        this.addEventListener('#themeToggle', 'click', () => {
            this.toggleTheme();
        });

        console.log('Event listeners setup completed');
    }

    // ==================== CORE CHAT FUNCTIONALITY ====================

    async handleSendMessage() {
        const userInput = this.getElement('#userInput');
        const message = userInput?.value.trim();
        
        if (!message && this.state.attachedFiles.length === 0) {
            this.showNotification('Введите сообщение или прикрепите файл', 'warning');
            return;
        }

        if (this.state.isGenerating) {
            this.showNotification('Подождите завершения предыдущего запроса', 'warning');
            return;
        }

        this.state.isGenerating = true;
        this.updateSendButton(true);

        try {
            // Создаем сообщение пользователя
            const userMessage = this.createMessage('user', message, this.state.currentMode, this.state.attachedFiles);
            this.addMessage(userMessage);

            // Очищаем ввод
            this.clearInput();

            // Получаем ответ от AI
            await this.getAIResponse(userMessage);

        } catch (error) {
            console.error('Error in sendMessage:', error);
            this.handleError('Ошибка при отправке сообщения', error);
        } finally {
            this.state.isGenerating = false;
            this.updateSendButton(false);
            this.saveApplicationState();
        }
    }

    async getAIResponse(userMessage) {
        this.showTypingIndicator();

        try {
            const prompt = await this.buildPrompt(userMessage);
            const response = await this.callAIService(prompt);
            
            this.hideTypingIndicator();
            await this.processAIResponse(response);
            
        } catch (error) {
            this.hideTypingIndicator();
            this.handleError('Ошибка при получении ответа от ИИ', error);
        }
    }

    async buildPrompt(userMessage) {
        // Обработка прикрепленных файлов
        if (userMessage.files && userMessage.files.length > 0) {
            const file = userMessage.files[0];
            
            if (file.type.startsWith('image/')) {
                const extractedText = await this.puter.ai.img2txt(file.data);
                
                if (userMessage.content.trim()) {
                    return `Пользователь отправил изображение "${file.name}" с сообщением: "${userMessage.content}"

Извлеченный текст с изображения: "${extractedText}"

Ответь на вопрос пользователя, учитывая содержание изображения.`;
                } else {
                    return `Пользователь отправил изображение "${file.name}".

Извлеченный текст: "${extractedText}"

Проанализируй это изображение и опиши что изображено.`;
                }
            }
        }
        
        // Текстовый промпт с контекстом
        return this.buildContextPrompt(userMessage.content);
    }

    buildContextPrompt(currentMessage) {
        const recentHistory = this.state.conversationHistory.slice(-4);
        
        if (recentHistory.length === 0) {
            return currentMessage;
        }

        let context = "Предыдущий разговор:\n";
        recentHistory.forEach(msg => {
            const role = msg.role === 'user' ? 'Пользователь' : 'Ассистент';
            context += `${role}: ${msg.content}\n`;
        });

        context += `\nТекущий вопрос: ${currentMessage}\n\nОтвет:`;
        return context;
    }

    async callAIService(prompt) {
        if (!this.puter || typeof this.puter.ai?.chat !== 'function') {
            throw new Error('AI сервис недоступен');
        }
        
        try {
            const response = await this.puter.ai.chat(prompt, {
                model: this.state.settings.model,
                stream: true
            });
            
            return response;
        } catch (error) {
            console.error('Puter.ai API error:', error);
            // Fallback to mock response
            return this.mockAIResponse(prompt);
        }
    }

    async processAIResponse(response) {
        const messageId = this.createStreamingMessage();
        let fullResponse = '';
        
        try {
            for await (const part of response) {
                if (this.state.generationAborted) break;
                
                if (part?.text) {
                    fullResponse += part.text;
                    this.updateStreamingMessage(messageId, fullResponse);
                    await this.delay(50);
                }
            }
            
            if (!this.state.generationAborted && fullResponse) {
                this.finalizeStreamingMessage(messageId, fullResponse);
                this.addMessage(this.createMessage('assistant', fullResponse));
                this.addToConversationHistory('assistant', fullResponse);
            }
        } catch (error) {
            if (!this.state.generationAborted) {
                console.error('Error processing AI response:', error);
                this.handleError('Ошибка обработки ответа', error);
            }
        }
    }

    // ==================== UI MANAGEMENT ====================

    initializeUI() {
        this.applyTheme(this.state.settings.theme);
        this.updateChatList();
        this.updateUIState();
        this.setupModelSelector();
    }

    updateUIState() {
        this.updateSendButton(this.state.isGenerating);
        this.toggleClearInputButton();
        this.updateConnectionStatus();
    }

    updateSendButton(isGenerating) {
        const sendBtn = this.getElement('#sendBtn');
        if (!sendBtn) return;

        if (isGenerating) {
            sendBtn.innerHTML = '<i class="ti ti-player-stop"></i>';
            sendBtn.title = 'Остановить генерацию';
            sendBtn.classList.add('generating');
        } else {
            sendBtn.innerHTML = '<i class="ti ti-send"></i>';
            sendBtn.title = 'Отправить сообщение';
            sendBtn.classList.remove('generating');
        }
    }

    toggleClearInputButton() {
        const clearBtn = this.getElement('#clearInputBtn');
        const userInput = this.getElement('#userInput');
        
        if (clearBtn && userInput) {
            const hasText = userInput.value.trim().length > 0;
            const hasFiles = this.state.attachedFiles.length > 0;
            
            clearBtn.style.display = (hasText || hasFiles) ? 'flex' : 'none';
        }
    }

    autoResizeTextarea(textarea) {
        if (!textarea) return;
        
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }

    // ==================== MESSAGE RENDERING ====================

    addMessage(message) {
        const chat = this.state.chats.get(this.state.currentChatId);
        if (!chat) return;

        chat.messages.push(message);
        chat.updatedAt = Date.now();
        
        this.state.messages = chat.messages;
        this.renderMessage(message);
        this.scrollToBottom();
    }

    renderMessage(message) {
        const container = this.getElement('#messagesContainer');
        if (!container) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message message-${message.role}`;
        messageElement.dataset.messageId = message.id;

        const content = message.role === 'user' ? 
            this.formatUserMessage(message) : 
            this.formatAIMessage(message);

        messageElement.innerHTML = content;
        container.appendChild(messageElement);
        
        this.setupMessageActions(messageElement);
    }

    formatUserMessage(message) {
        let filesHtml = '';
        if (message.files && message.files.length > 0) {
            filesHtml = message.files.map(file => `
                <div class="attached-file">
                    <i class="ti ti-file"></i>
                    <span>${this.escapeHtml(file.name)}</span>
                </div>
            `).join('');
        }
        
        return `
            <div class="message-content">
                <div class="message-header">
                    <div class="message-avatar">
                        <i class="ti ti-user"></i>
                    </div>
                    <div class="message-info">
                        <span class="message-author">Вы</span>
                        <span class="message-time">${this.formatTime(message.timestamp)}</span>
                    </div>
                </div>
                <div class="message-text">${this.escapeHtml(message.content)}</div>
                ${filesHtml ? `<div class="message-files">${filesHtml}</div>` : ''}
            </div>
        `;
    }

    formatAIMessage(message) {
        const processedContent = this.processMarkdown(message.content);
        
        return `
            <div class="message-content">
                <div class="message-header">
                    <div class="message-avatar">
                        <i class="ti ti-robot"></i>
                    </div>
                    <div class="message-info">
                        <span class="message-author">KHAI</span>
                        <span class="message-time">${this.formatTime(message.timestamp)}</span>
                    </div>
                </div>
                <div class="message-text">${processedContent}</div>
                <div class="message-actions">
                    <button class="message-action" data-action="copy" title="Копировать">
                        <i class="ti ti-copy"></i>
                    </button>
                    <button class="message-action" data-action="speak" title="Озвучить">
                        <i class="ti ti-volume"></i>
                    </button>
                </div>
            </div>
        `;
    }

    processMarkdown(content) {
        // Простая обработка markdown
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    // ==================== STREAMING MESSAGES ====================

    createStreamingMessage() {
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-assistant streaming-message';
        messageElement.id = 'streaming-' + Date.now();
        
        messageElement.innerHTML = `
            <div class="message-content">
                <div class="message-header">
                    <div class="message-avatar">
                        <i class="ti ti-robot"></i>
                    </div>
                    <div class="message-info">
                        <span class="message-author">KHAI</span>
                        <span class="message-time">Сейчас</span>
                    </div>
                </div>
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                <div class="streaming-text"></div>
            </div>
        `;
        
        this.getElement('#messagesContainer').appendChild(messageElement);
        this.scrollToBottom();
        
        return messageElement.id;
    }

    updateStreamingMessage(messageId, content) {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) return;
        
        const streamingText = messageElement.querySelector('.streaming-text');
        const typingIndicator = messageElement.querySelector('.typing-indicator');
        
        if (content.length > 50 && typingIndicator) {
            typingIndicator.style.display = 'none';
        }
        
        streamingText.innerHTML = this.processMarkdown(content);
        
        if (this.state.settings.autoScroll) {
            this.scrollToBottom();
        }
    }

    finalizeStreamingMessage(messageId, fullContent) {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) return;
        
        messageElement.classList.remove('streaming-message');
        const messageContent = messageElement.querySelector('.message-content');
        
        messageContent.innerHTML = `
            <div class="message-header">
                <div class="message-avatar">
                    <i class="ti ti-robot"></i>
                </div>
                <div class="message-info">
                    <span class="message-author">KHAI</span>
                    <span class="message-time">${this.formatTime(Date.now())}</span>
                </div>
            </div>
            <div class="message-text">${this.processMarkdown(fullContent)}</div>
            <div class="message-actions">
                <button class="message-action" data-action="copy" title="Копировать">
                    <i class="ti ti-copy"></i>
                </button>
                <button class="message-action" data-action="speak" title="Озвучить">
                    <i class="ti ti-volume"></i>
                </button>
            </div>
        `;
        
        this.setupMessageActions(messageElement);
        this.scrollToBottom();
    }

    // ==================== MESSAGE ACTIONS ====================

    setupMessageActions(messageElement) {
        const copyBtn = messageElement.querySelector('[data-action="copy"]');
        const speakBtn = messageElement.querySelector('[data-action="speak"]');
        
        if (copyBtn) {
            this.addEventListener(copyBtn, 'click', () => {
                const messageText = messageElement.querySelector('.message-text').textContent;
                this.copyToClipboard(messageText);
                this.showNotification('Сообщение скопировано', 'success');
            });
        }
        
        if (speakBtn) {
            this.addEventListener(speakBtn, 'click', () => {
                const messageText = messageElement.querySelector('.message-text').textContent;
                this.speakText(messageText, speakBtn);
            });
        }
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Failed to copy text:', error);
            // Fallback
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    }

    speakText(text, button) {
        if (this.state.isSpeaking) {
            this.stopSpeaking();
            button.classList.remove('speaking');
            return;
        }

        if ('speechSynthesis' in window) {
            this.stopSpeaking();
            
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ru-RU';
            utterance.rate = 0.8;
            
            utterance.onstart = () => {
                this.state.isSpeaking = true;
                button.classList.add('speaking');
            };
            
            utterance.onend = () => {
                this.state.isSpeaking = false;
                button.classList.remove('speaking');
            };
            
            utterance.onerror = () => {
                this.state.isSpeaking = false;
                button.classList.remove('speaking');
                this.showNotification('Ошибка озвучивания', 'error');
            };
            
            speechSynthesis.speak(utterance);
        } else {
            this.showNotification('Озвучивание не поддерживается', 'warning');
        }
    }

    stopSpeaking() {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
        this.state.isSpeaking = false;
        document.querySelectorAll('.message-action.speaking').forEach(btn => {
            btn.classList.remove('speaking');
        });
    }

    // ==================== VOICE INPUT ====================

    setupVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            return;
        }

        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'ru-RU';

        this.recognition.onstart = () => {
            this.state.isListening = true;
            this.updateVoiceInputButton();
            this.showNotification('Слушаю...', 'info');
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const userInput = this.getElement('#userInput');
            if (userInput) {
                userInput.value = transcript;
                this.autoResizeTextarea(userInput);
                this.toggleClearInputButton();
            }
            this.showNotification('Текст распознан', 'success');
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.showNotification(`Ошибка распознавания: ${event.error}`, 'error');
        };

        this.recognition.onend = () => {
            this.state.isListening = false;
            this.updateVoiceInputButton();
        };
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            this.setupVoiceRecognition();
        }

        if (this.state.isListening) {
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
        const voiceBtn = this.getElement('#voiceInputBtn');
        if (!voiceBtn) return;
        
        if (this.state.isListening) {
            voiceBtn.classList.add('listening');
            voiceBtn.innerHTML = '<i class="ti ti-microphone-off"></i>';
        } else {
            voiceBtn.classList.remove('listening');
            voiceBtn.innerHTML = '<i class="ti ti-microphone"></i>';
        }
    }

    // ==================== FILE HANDLING ====================

    async handleFileUpload(files) {
        if (!files || files.length === 0) return;
        
        const file = files[0]; // Берем первый файл
        
        // Проверка типа файла
        if (!file.type.startsWith('image/')) {
            this.showNotification('Поддерживаются только изображения', 'error');
            return;
        }

        // Проверка размера
        if (file.size > 5 * 1024 * 1024) { // 5MB
            this.showNotification('Файл слишком большой (максимум 5MB)', 'error');
            return;
        }

        try {
            const fileData = await this.readFileAsDataURL(file);
            
            this.state.attachedFiles.push({
                name: file.name,
                type: file.type,
                size: file.size,
                data: fileData
            });
            
            this.updateAttachedFilesDisplay();
            this.showNotification(`Файл "${file.name}" прикреплен`, 'success');
            
        } catch (error) {
            console.error('Error reading file:', error);
            this.showNotification('Ошибка чтения файла', 'error');
        }
    }

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    updateAttachedFilesDisplay() {
        const container = this.getElement('#attachedFiles');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.state.attachedFiles.forEach((file, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            fileElement.innerHTML = `
                <i class="ti ti-photo"></i>
                <span>${this.escapeHtml(file.name)}</span>
                <button class="remove-file" data-index="${index}">
                    <i class="ti ti-x"></i>
                </button>
            `;
            
            this.addEventListener(fileElement.querySelector('.remove-file'), 'click', (e) => {
                e.stopPropagation();
                this.removeAttachedFile(index);
            });
            
            container.appendChild(fileElement);
        });
        
        container.style.display = this.state.attachedFiles.length > 0 ? 'block' : 'none';
    }

    removeAttachedFile(index) {
        if (index >= 0 && index < this.state.attachedFiles.length) {
            this.state.attachedFiles.splice(index, 1);
            this.updateAttachedFilesDisplay();
        }
    }

    // ==================== CHAT MANAGEMENT ====================

    async createChat(title = null) {
        const chatId = `chat-${Date.now()}`;
        const chatTitle = title || `Чат ${this.state.chats.size + 1}`;
        
        const newChat = {
            id: chatId,
            title: chatTitle,
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        this.state.chats.set(chatId, newChat);
        await this.switchChat(chatId);
        this.saveApplicationState();
        
        this.showNotification(`Создан новый чат: "${chatTitle}"`, 'success');
        return chatId;
    }

    async switchChat(chatId) {
        if (!this.state.chats.has(chatId)) {
            throw new Error(`Chat ${chatId} not found`);
        }

        // Сохраняем текущий чат
        this.saveCurrentChat();

        // Переключаемся на новый чат
        this.state.currentChatId = chatId;
        const chat = this.state.chats.get(chatId);
        this.state.messages = chat.messages || [];

        this.renderChat();
        this.updateChatList();
        this.saveApplicationState();
    }

    renderChat() {
        const container = this.getElement('#messagesContainer');
        if (!container) return;

        container.innerHTML = '';
        
        this.state.messages.forEach(message => {
            this.renderMessage(message);
        });
        
        this.scrollToBottom();
    }

    updateChatList() {
        // Реализация обновления списка чатов
        console.log('Updating chat list...');
    }

    clearCurrentChat() {
        if (this.state.messages.length === 0) {
            this.showNotification('Чат уже пуст', 'info');
            return;
        }

        if (confirm('Вы уверены, что хотите очистить чат?')) {
            const chat = this.state.chats.get(this.state.currentChatId);
            if (chat) {
                chat.messages = [];
                this.state.messages = [];
                this.state.conversationHistory = [];
                
                const container = this.getElement('#messagesContainer');
                if (container) {
                    container.innerHTML = '';
                }
                
                this.showWelcomeMessage();
                this.saveApplicationState();
                this.showNotification('Чат очищен', 'success');
            }
        }
    }

    // ==================== SETTINGS & MODES ====================

    switchMode(mode) {
        if (this.modeConfigs[mode]) {
            this.state.currentMode = mode;
            
            // Обновляем UI
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.mode === mode);
            });
            
            const userInput = this.getElement('#userInput');
            if (userInput) {
                userInput.placeholder = this.modeConfigs[mode].placeholder;
            }
            
            this.showNotification(`Режим: ${this.getModeDisplayName(mode)}`, 'info');
        }
    }

    getModeDisplayName(mode) {
        const names = {
            normal: 'Обычный',
            creative: 'Креативный',
            code: 'Программирование'
        };
        return names[mode] || mode;
    }

    changeModel(modelId) {
        if (this.models[modelId]) {
            this.state.settings.model = modelId;
            this.showNotification(`Модель: ${this.models[modelId].name}`, 'success');
            this.saveApplicationState();
        }
    }

    setupModelSelector() {
        const select = this.getElement('#modelSelect');
        if (!select) return;
        
        select.innerHTML = '';
        
        Object.entries(this.models).forEach(([id, model]) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = model.name;
            if (id === this.state.settings.model) {
                option.selected = true;
            }
            select.appendChild(option);
        });
    }

    toggleTheme() {
        this.state.settings.theme = this.state.settings.theme === 'dark' ? 'light' : 'dark';
        this.applyTheme(this.state.settings.theme);
        this.saveApplicationState();
        
        this.showNotification(
            this.state.settings.theme === 'dark' ? 'Темная тема' : 'Светлая тема', 
            'info'
        );
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    // ==================== TYPING INDICATOR ====================

    showTypingIndicator() {
        this.hideTypingIndicator();
        
        const typingElement = document.createElement('div');
        typingElement.className = 'message message-assistant typing-indicator';
        typingElement.id = 'typing-indicator';
        
        typingElement.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                <span>KHAI печатает...</span>
            </div>
        `;
        
        this.getElement('#messagesContainer').appendChild(typingElement);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) {
            typingElement.remove();
        }
    }

    // ==================== UTILITIES ====================

    createMessage(role, content, mode = 'normal', files = []) {
        return {
            id: this.generateId(),
            role,
            content: content || '',
            mode,
            files: files.map(file => ({
                name: file.name,
                type: file.type,
                size: file.size,
                data: file.data
            })),
            timestamp: Date.now()
        };
    }

    addToConversationHistory(role, content) {
        this.state.conversationHistory.push({
            role,
            content,
            timestamp: Date.now()
        });

        // Ограничиваем историю
        if (this.state.conversationHistory.length > 20) {
            this.state.conversationHistory = this.state.conversationHistory.slice(-15);
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    formatTime(timestamp) {
        return new Date(timestamp).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getElement(selector) {
        if (selector.startsWith('#')) {
            return document.getElementById(selector.slice(1));
        }
        return document.querySelector(selector);
    }

    addEventListener(element, event, handler) {
        const target = typeof element === 'string' ? this.getElement(element) : element;
        if (!target) {
            console.warn(`Element not found for event listener: ${element}`);
            return;
        }

        const wrappedHandler = (...args) => {
            try {
                handler(...args);
            } catch (error) {
                console.error(`Error in ${event} handler:`, error);
                this.showNotification('Произошла ошибка', 'error');
            }
        };

        target.addEventListener(event, wrappedHandler);
        
        // Сохраняем для cleanup
        if (!this.performance.activeEventListeners.has(target)) {
            this.performance.activeEventListeners.set(target, []);
        }
        this.performance.activeEventListeners.get(target).push({ event, handler: wrappedHandler });
    }

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ==================== MOCK AI RESPONSE (FALLBACK) ====================

    async mockAIResponse(prompt) {
        await this.delay(1000 + Math.random() * 2000);
        
        const responses = [
            "Привет! Я KHAI - ваш AI-ассистент. Чем могу помочь?",
            "Отличный вопрос! Давайте разберем его подробнее...",
            "На основе вашего запроса, я могу предложить следующее...",
            "Понимаю ваш вопрос. Вот что я могу сказать по этой теме...",
            "Интересный запрос! Давайте обсудим это детальнее."
        ];
        
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        // Имитация стриминга
        const words = response.split(' ');
        const stream = {
            [Symbol.asyncIterator]: async function* () {
                for (const word of words) {
                    if (this.state.generationAborted) break;
                    await this.delay(100);
                    yield { text: word + ' ' };
                }
            }.bind(this)
        };

        return stream;
    }

    // ==================== NOTIFICATIONS ====================

    showNotification(message, type = 'info') {
        // Создаем уведомление
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

        const container = this.getElement('#notificationContainer') || document.body;
        container.appendChild(notification);

        // Автоудаление через 5 секунд
        const timeout = setTimeout(() => {
            notification.remove();
        }, 5000);

        // Кнопка закрытия
        this.addEventListener(notification.querySelector('.notification-close'), 'click', () => {
            clearTimeout(timeout);
            notification.remove();
        });
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check',
            error: 'x',
            warning: 'alert-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    showError(message, error = null) {
        console.error(message, error);
        this.showNotification(message, 'error');
    }

    handleError(userMessage, error) {
        console.error(userMessage, error);
        this.showNotification(userMessage, 'error');
        
        if (this.state.isGenerating) {
            this.state.isGenerating = false;
            this.updateSendButton(false);
            this.hideTypingIndicator();
        }
    }

    // ==================== WELCOME MESSAGE ====================

    showWelcomeMessage() {
        const container = this.getElement('#messagesContainer');
        if (!container || container.children.length > 0) return;

        const welcomeMessage = this.createMessage('assistant', 
            `# 👋 Добро пожаловать в KHAI!

Я ваш AI-ассистент с интеграцией Puter.js. Готов помочь с:

• **Ответами на вопросы** и обсуждениями
• **Анализом изображений** - прикрепляйте файлы для анализа
• **Голосовым вводом** - нажмите микрофон для записи
• **Озвучиванием ответов** - слушайте ответы в аудиоформате

**Начните общение, отправив сообщение!**`);

        this.addMessage(welcomeMessage);
    }

    // ==================== APPLICATION STATE ====================

    async loadApplicationState() {
        try {
            // Загружаем настройки
            const savedSettings = localStorage.getItem('khai-settings');
            if (savedSettings) {
                this.state.settings = { ...this.state.settings, ...JSON.parse(savedSettings) };
                this.applyTheme(this.state.settings.theme);
            }

            // Загружаем чаты
            const savedChats = localStorage.getItem('khai-chats');
            if (savedChats) {
                const chatsData = JSON.parse(savedChats);
                this.state.chats = new Map(Object.entries(chatsData.chats || {}));
                this.state.currentChatId = chatsData.currentChatId || 'main-chat';
                this.state.conversationHistory = chatsData.conversationHistory || [];
            } else {
                // Инициализируем основной чат
                this.state.chats.set('main-chat', {
                    id: 'main-chat',
                    title: 'Основной чат',
                    messages: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                });
            }

            this.renderChat();

        } catch (error) {
            console.error('Error loading application state:', error);
            this.initializeDefaultState();
        }
    }

    initializeDefaultState() {
        this.state.chats.set('main-chat', {
            id: 'main-chat',
            title: 'Основной чат',
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
    }

    saveApplicationState() {
        try {
            // Сохраняем настройки
            localStorage.setItem('khai-settings', JSON.stringify(this.state.settings));
            
            // Сохраняем чаты
            const chatsData = {
                chats: Object.fromEntries(this.state.chats),
                currentChatId: this.state.currentChatId,
                conversationHistory: this.state.conversationHistory
            };
            localStorage.setItem('khai-chats', JSON.stringify(chatsData));
        } catch (error) {
            console.error('Error saving application state:', error);
        }
    }

    saveCurrentChat() {
        const chat = this.state.chats.get(this.state.currentChatId);
        if (chat) {
            chat.messages = [...this.state.messages];
            chat.updatedAt = Date.now();
            this.state.chats.set(this.state.currentChatId, chat);
        }
    }

    // ==================== CLEANUP ====================

    cleanup() {
        // Очищаем таймеры
        this.performance.activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.performance.activeTimeouts.clear();
        
        // Удаляем обработчики событий
        this.performance.activeEventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        this.performance.activeEventListeners.clear();
        
        // Останавливаем речь
        this.stopSpeaking();
        
        // Останавливаем голосовой ввод
        if (this.recognition && this.state.isListening) {
            this.recognition.stop();
        }
        
        // Сохраняем состояние
        this.saveApplicationState();
    }

    // ==================== DOM UTILITIES ====================

    hideLoader() {
        const loader = document.getElementById('appLoader');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    clearInput() {
        const userInput = this.getElement('#userInput');
        if (userInput) {
            userInput.value = '';
            this.autoResizeTextarea(userInput);
        }
        this.state.attachedFiles = [];
        this.updateAttachedFilesDisplay();
        this.toggleClearInputButton();
    }

    scrollToBottom() {
        const container = this.getElement('#messagesContainer');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    updateConnectionStatus() {
        const statusElement = this.getElement('#connectionStatus');
        if (statusElement) {
            if (this.state.puterInitialized) {
                statusElement.innerHTML = '<i class="ti ti-wifi"></i> Online';
                statusElement.className = 'connection-status online';
            } else {
                statusElement.innerHTML = '<i class="ti ti-wifi-off"></i> Offline';
                statusElement.className = 'connection-status offline';
            }
        }
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.khaiChat = new KHAIChat();
});

// Глобальные обработчики ошибок
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
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
