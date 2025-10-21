class KHAIApp {
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
        this.modelSelect = document.getElementById('modelSelect');
        this.attachFileBtn = document.getElementById('attachFileBtn');
        this.voiceInputBtn = document.getElementById('voiceInputBtn');
        this.fileInput = document.getElementById('fileInput');
        this.attachedFiles = document.getElementById('attachedFiles');
        this.currentChatName = document.getElementById('currentChatName');
        
        // Элементы меню
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebarMenu = document.getElementById('sidebarMenu');
        this.sidebarOverlay = document.getElementById('sidebarOverlay');
        this.sidebarClose = document.getElementById('sidebarClose');
        this.chatList = document.getElementById('chatList');
        this.newChatBtn = document.getElementById('newChatBtn');

        this.validateElements();
    }

    validateElements() {
        const elements = [
            this.messagesContainer, this.userInput, this.sendBtn, this.clearInputBtn,
            this.clearChatBtn, this.helpBtn, this.generateVoiceBtn, this.themeToggle,
            this.modelSelect, this.attachFileBtn, this.voiceInputBtn, this.fileInput,
            this.attachedFiles, this.currentChatName, this.menuToggle, this.sidebarMenu,
            this.sidebarOverlay, this.sidebarClose, this.chatList, this.newChatBtn
        ];

        elements.forEach(element => {
            if (!element) {
                console.error('Элемент не найден:', element);
            }
        });
    }

    initializeState() {
        this.isProcessing = false;
        this.currentTheme = localStorage.getItem('khai-theme') || 'dark';
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

        this.modelConfig = {
            'gpt-5-nano': { 
                name: 'GPT-5 Nano', 
                description: 'Быстрая и эффективная модель для повседневных задач' 
            },
            'o3-mini': { 
                name: 'O3 Mini', 
                description: 'Продвинутая модель с улучшенными возможностями рассуждения' 
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
    }

    setupMarked() {
        if (typeof marked !== 'undefined') {
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
    }

    init() {
        try {
            this.bindEvents();
            this.setupAutoResize();
            this.setupVoiceRecognition();
            this.loadThemePreference();
            this.loadChatSessions();
            this.setupChatSelector();
            this.loadCurrentSession();
            
            this.showNotification('KHAI готов к работе!', 'success');
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.showNotification('Ошибка загрузки приложения', 'error');
        }
    }

    bindEvents() {
        // Основные обработчики
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keydown', (e) => this.handleInputKeydown(e));
        this.clearInputBtn.addEventListener('click', () => this.clearInput());
        this.clearChatBtn.addEventListener('click', () => this.clearChat());
        this.helpBtn.addEventListener('click', () => this.showHelp());
        this.generateImageBtn.addEventListener('click', () => this.toggleImageMode());
        this.generateVoiceBtn.addEventListener('click', () => this.toggleVoiceMode());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.modelSelect.addEventListener('change', (e) => this.handleModelChange(e));
        this.attachFileBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.voiceInputBtn.addEventListener('click', () => this.toggleVoiceInput());

        // Меню
        this.menuToggle.addEventListener('click', () => this.toggleSidebar());
        this.sidebarClose.addEventListener('click', () => this.closeSidebar());
        this.sidebarOverlay.addEventListener('click', () => this.closeSidebar());
        this.newChatBtn.addEventListener('click', () => this.createNewChat());
    }

    handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    handleModelChange(e) {
        this.changeModel(e.target.value);
    }

    setupAutoResize() {
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
        });
    }

    setupVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window)) {
            this.voiceInputBtn.style.display = 'none';
            return;
        }

        try {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'ru-RU';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.voiceInputBtn.classList.add('active');
                this.showNotification('Слушаю...', 'info');
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.userInput.value = transcript;
                this.showNotification('Текст распознан', 'success');
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showNotification(`Ошибка распознавания: ${event.error}`, 'error');
                this.isListening = false;
                this.voiceInputBtn.classList.remove('active');
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.voiceInputBtn.classList.remove('active');
            };
        } catch (error) {
            console.error('Error setting up voice recognition:', error);
            this.voiceInputBtn.style.display = 'none';
        }
    }

    toggleSidebar() {
        this.sidebarMenu.classList.add('active');
        this.sidebarOverlay.classList.add('active');
        this.updateChatDropdown();
    }

    closeSidebar() {
        this.sidebarMenu.classList.remove('active');
        this.sidebarOverlay.classList.remove('active');
    }

    updateChatDropdown() {
        if (!this.chatList) return;
        
        this.chatList.innerHTML = '';

        const sessionsArray = Array.from(this.chatSessions.entries())
            .sort(([,a], [,b]) => b.lastActivity - a.lastActivity);

        if (sessionsArray.length === 0) {
            this.createDefaultChat();
            this.updateChatDropdown();
            return;
        }

        sessionsArray.forEach(([id, session]) => {
            const chatItem = this.createChatItem(id, session);
            this.chatList.appendChild(chatItem);
        });
    }

    createChatItem(id, session) {
        const chatItem = document.createElement('div');
        chatItem.className = `chat-item ${id === this.currentChatId ? 'active' : ''}`;
        chatItem.setAttribute('data-chat-id', id);
        
        chatItem.innerHTML = `
            <div class="chat-info">
                <i class="ti ti-message"></i>
                <span class="chat-name">${this.escapeHtml(session.name)}</span>
            </div>
            ${id !== 'default' ? '<button class="delete-chat-btn" title="Удалить чат"><i class="ti ti-x"></i></button>' : ''}
        `;

        chatItem.addEventListener('click', (e) => {
            if (!e.target.closest('.delete-chat-btn')) {
                this.switchChat(id);
                this.closeSidebar();
            }
        });

        const deleteBtn = chatItem.querySelector('.delete-chat-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteChat(id);
            });
        }

        return chatItem;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    createNewChat() {
        const chatNumber = Array.from(this.chatSessions.values()).filter(session => 
            session.name.startsWith('Чат ')
        ).length + 1;
        
        const chatName = `Чат ${chatNumber}`;
        const chatId = this.createChatSession(chatName);
        this.switchChat(chatId);
        this.closeSidebar();
        this.showNotification(`Создан новый чат: ${chatName}`, 'success');
    }

    createChatSession(name = 'Новый чат') {
        const chatId = 'chat-' + Date.now();
        const session = {
            id: chatId,
            name: name,
            messages: [],
            conversationHistory: [],
            createdAt: Date.now(),
            lastActivity: Date.now()
        };
        
        this.chatSessions.set(chatId, session);
        this.saveChatSessions();
        this.updateChatDropdown();
        
        return chatId;
    }

    switchChat(chatId) {
        if (!this.chatSessions.has(chatId) || chatId === this.currentChatId) {
            return;
        }

        this.saveCurrentSession();
        this.currentChatId = chatId;
        const session = this.chatSessions.get(chatId);
        
        session.lastActivity = Date.now();
        this.chatSessions.set(chatId, session);
        
        this.currentChatName.textContent = session.name;
        this.loadSession(session);
        this.showNotification(`Переключен на чат: ${session.name}`, 'info');
        
        this.saveChatSessions();
    }

    deleteChat(chatId) {
        if (chatId === 'default') {
            this.showNotification('Основной чат нельзя удалить', 'warning');
            return;
        }

        if (this.chatSessions.size <= 1) {
            this.showNotification('Нельзя удалить последний чат', 'warning');
            return;
        }

        const session = this.chatSessions.get(chatId);
        if (!session) return;

        if (confirm(`Удалить чат "${session.name}"?`)) {
            this.chatSessions.delete(chatId);
            
            if (this.currentChatId === chatId) {
                this.switchChat('default');
            }
            
            this.saveChatSessions();
            this.updateChatDropdown();
            this.showNotification('Чат удален', 'success');
        }
    }

    saveCurrentSession() {
        try {
            const messages = [];
            this.messagesContainer.querySelectorAll('.message').forEach(message => {
                if (message.classList.contains('typing-indicator')) return;
                
                const role = message.classList.contains('message-user') ? 'user' : 
                           message.classList.contains('message-error') ? 'error' : 'ai';
                
                const content = message.querySelector('.message-content')?.innerHTML || '';
                if (content) {
                    messages.push({ role, content });
                }
            });
            
            const session = this.chatSessions.get(this.currentChatId);
            if (session) {
                session.messages = messages;
                session.conversationHistory = [...this.conversationHistory];
                session.lastActivity = Date.now();
                this.chatSessions.set(this.currentChatId, session);
            }
        } catch (error) {
            console.error('Error saving current session:', error);
        }
    }

    loadCurrentSession() {
        const session = this.chatSessions.get(this.currentChatId);
        if (session) {
            this.loadSession(session);
        } else {
            this.showWelcomeMessage();
        }
    }

    loadSession(session) {
        this.messagesContainer.innerHTML = '';
        this.conversationHistory = session.conversationHistory || [];
        
        if (session.messages && session.messages.length > 0) {
            session.messages.forEach(msg => {
                this.addMessage(msg.role, msg.content, false);
            });
        } else {
            this.showWelcomeMessage();
        }
        
        this.scrollToBottom();
    }

    changeModel(model) {
        if (!this.modelConfig[model]) {
            this.showNotification('Неизвестная модель', 'error');
            return;
        }

        this.currentModel = model;
        const modelInfo = this.modelConfig[model];
        this.showNotification(`Модель изменена на: ${modelInfo.name}`, 'success');
        this.saveModelPreference();
    }

    getModelDisplayName(model) {
        return this.modelConfig[model]?.name || model;
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            this.showNotification('Голосовой ввод не поддерживается', 'error');
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

    toggleVoiceMode() {
        this.isVoiceMode = !this.isVoiceMode;
        const placeholder = this.isVoiceMode 
            ? "Введите текст для генерации голоса..." 
            : "Задайте вопрос или опишите изображение...";
        
        this.userInput.placeholder = placeholder;
        this.generateVoiceBtn.classList.toggle('voice-mode-active', this.isVoiceMode);
        
        const icon = this.generateVoiceBtn.querySelector('i');
        icon.className = this.isVoiceMode ? 'ti ti-microphone-off' : 'ti ti-microphone';
        
        this.showNotification(
            this.isVoiceMode ? 'Режим генерации голоса включен' : 'Режим генерации голоса выключен',
            'info'
        );
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        let processedCount = 0;
        const maxFiles = 3;

        files.forEach(file => {
            if (processedCount >= maxFiles) {
                this.showNotification('Можно прикрепить не более 3 изображений', 'warning');
                return;
            }

            if (!file.type.startsWith('image/')) {
                this.showNotification('Пожалуйста, выберите только изображения', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = {
                    name: file.name,
                    data: e.target.result,
                    type: file.type,
                    size: file.size
                };
                
                this.attachedImages.push(imageData);
                this.renderAttachedFiles();
                this.showNotification(`Изображение "${file.name}" прикреплено`, 'success');
                processedCount++;
            };
            
            reader.onerror = () => {
                this.showNotification(`Ошибка загрузки файла: ${file.name}`, 'error');
            };
            
            reader.readAsDataURL(file);
        });

        event.target.value = '';
    }

    renderAttachedFiles() {
        this.attachedFiles.innerHTML = '';
        
        this.attachedImages.forEach((image, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            fileElement.innerHTML = `
                <i class="ti ti-photo"></i>
                <span>${this.escapeHtml(image.name)} (${this.formatFileSize(image.size)})</span>
                <button class="remove-file" data-index="${index}">
                    <i class="ti ti-x"></i>
                </button>
            `;
            this.attachedFiles.appendChild(fileElement);
        });

        this.attachedFiles.querySelectorAll('.remove-file').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                this.removeAttachedFile(index);
            });
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    removeAttachedFile(index) {
        if (index < 0 || index >= this.attachedImages.length) return;
        
        const removedFile = this.attachedImages.splice(index, 1)[0];
        this.renderAttachedFiles();
        this.showNotification(`Изображение "${removedFile.name}" удалено`, 'info');
    }

    async sendMessage() {
        if (this.isProcessing) {
            this.showNotification('Подождите завершения предыдущего запроса', 'warning');
            return;
        }

        const message = this.userInput.value.trim();
        
        if (!message && this.attachedImages.length === 0) {
            this.showNotification('Введите сообщение или прикрепите изображение', 'error');
            return;
        }

        this.isProcessing = true;
        this.sendBtn.disabled = true;

        try {
            if (this.isVoiceMode) {
                await this.generateVoice(message);
            } else {
                await this.processUserMessage(message);
            }
        } catch (error) {
            console.error('Error in sendMessage:', error);
            this.handleError('Произошла ошибка при отправке сообщения', error);
        } finally {
            this.isProcessing = false;
            this.sendBtn.disabled = false;
        }
    }

    async processUserMessage(message) {
        this.addMessage('user', message, this.attachedImages);
        this.addToConversationHistory('user', message, this.attachedImages);
        
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        const imagesToProcess = [...this.attachedImages];
        this.attachedImages = [];
        this.renderAttachedFiles();
        
        if (this.isImageMode) {
            await this.generateImage(message);
        } else {
            await this.getAIResponse(message, imagesToProcess);
        }
    }

    async getAIResponse(userMessage, images) {
        this.showTypingIndicator();
        
        try {
            const prompt = await this.buildPrompt(userMessage, images);
            const response = await this.callAIService(prompt);
            
            this.removeTypingIndicator();
            await this.processAIResponse(response);
            
        } catch (error) {
            this.removeTypingIndicator();
            this.handleError('Ошибка при получении ответа от ИИ', error);
        }
    }

    async buildPrompt(userMessage, images) {
        if (images.length > 0) {
            if (typeof puter?.ai?.img2txt !== 'function') {
                throw new Error('Функция анализа изображений недоступна');
            }
            
            const extractedText = await puter.ai.img2txt(images[0].data);
            
            if (userMessage.trim()) {
                return `Пользователь отправил изображение "${images[0].name}" с сопроводительным сообщением: "${userMessage}"

Извлеченный текст с изображения: "${extractedText}"

Ответь на вопрос/сообщение пользователя "${userMessage}", учитывая содержание изображения. Отвечай одним целостным сообщением на русском языке.`;
            } else {
                return `Пользователь отправил изображение "${images[0].name}".

Извлеченный текст с изображения: "${extractedText}"

Проанализируй это изображение. Опиши что изображено, основное содержание. Если есть текст - объясни его значение. Отвечай подробно на русском языке.`;
            }
        } else {
            return userMessage;
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
            'gemini-1.5-flash': { model: 'gemini-1.5-flash' },
            'grok-beta': { model: 'grok-beta' }
        };
        
        const options = {
            ...modelOptions[this.currentModel],
            systemPrompt: "Ты полезный AI-ассистент KHAI. Отвечай на русском языке понятно и подробно.",
            stream: true
        };
        
        return await puter.ai.chat(prompt, options);
    }

    async processAIResponse(response) {
        let fullResponse = '';
        
        for await (const part of response) {
            if (part?.text) {
                fullResponse += part.text;
                this.updateLastAIMessage(fullResponse);
                await this.delay(10);
            }
        }
        
        this.finalizeAIMessage(fullResponse);
        this.addToConversationHistory('assistant', fullResponse);
        this.saveCurrentSession();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateLastAIMessage(content) {
        let lastMessage = this.messagesContainer.querySelector('.message-ai:last-child');
        
        if (!lastMessage || lastMessage.classList.contains('typing-indicator')) {
            if (lastMessage && lastMessage.classList.contains('typing-indicator')) {
                lastMessage.remove();
            }
            lastMessage = this.addMessage('ai', content, [], false);
        } else {
            const messageContent = lastMessage.querySelector('.message-content');
            if (messageContent) {
                messageContent.innerHTML = this.processCodeBlocks(content);
                this.attachCopyButtons(messageContent);
            }
        }
        
        this.scrollToBottom();
    }

    finalizeAIMessage(fullContent) {
        const lastMessage = this.messagesContainer.querySelector('.message-ai:last-child');
        if (!lastMessage) return;
        
        const messageContent = lastMessage.querySelector('.message-content');
        if (messageContent) {
            const processedContent = this.processCodeBlocks(fullContent);
            messageContent.innerHTML = processedContent;
            
            const modelIndicator = document.createElement('div');
            modelIndicator.className = 'model-indicator';
            modelIndicator.textContent = `Модель: ${this.getModelDisplayName(this.currentModel)} • ${this.getModelDescription(this.currentModel)}`;
            messageContent.appendChild(modelIndicator);
            
            this.attachMessageHandlers(lastMessage);
        }
    }

    attachMessageHandlers(messageElement) {
        this.attachCopyButtons(messageElement);
        if (messageElement.classList.contains('message-ai')) {
            this.attachSpeakButton(messageElement);
        }
    }

    attachSpeakButton(messageElement) {
        const messageContent = messageElement.querySelector('.message-content');
        const plainText = this.extractPlainText(messageContent.textContent || '');
        
        if (plainText.trim().length < 10) return;
        
        let actionsContainer = messageElement.querySelector('.message-actions');
        if (!actionsContainer) {
            actionsContainer = document.createElement('div');
            actionsContainer.className = 'message-actions';
            messageElement.appendChild(actionsContainer);
        }
        
        const existingSpeakBtn = actionsContainer.querySelector('.speak-btn');
        if (existingSpeakBtn) {
            existingSpeakBtn.remove();
        }
        
        const speakButton = document.createElement('button');
        speakButton.className = 'action-btn-small speak-btn';
        speakButton.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить ответ';
        speakButton.setAttribute('data-text', plainText);
        
        speakButton.addEventListener('click', (e) => {
            e.stopPropagation();
            const text = e.currentTarget.getAttribute('data-text');
            this.toggleTextToSpeech(text, speakButton);
        });
        
        actionsContainer.appendChild(speakButton);
    }

    extractPlainText(htmlText) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlText;
        return tempDiv.textContent || tempDiv.innerText || '';
    }

    toggleTextToSpeech(text, button) {
        if (this.isSpeaking) {
            this.stopSpeech();
            button.classList.remove('speaking');
            button.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить ответ';
        } else {
            this.speakText(text, button);
        }
    }

    speakText(text, button) {
        if (!('speechSynthesis' in window)) {
            this.showNotification('Озвучивание текста не поддерживается в вашем браузере', 'warning');
            return;
        }

        try {
            this.stopSpeech();

            this.currentUtterance = new SpeechSynthesisUtterance(text);
            this.currentUtterance.lang = 'ru-RU';
            this.currentUtterance.rate = 0.85;
            this.currentUtterance.pitch = 1.0;
            this.currentUtterance.volume = 1.0;

            const voices = speechSynthesis.getVoices();
            const russianVoice = voices.find(voice => 
                voice.lang.includes('ru') || voice.lang.includes('RU')
            );
            
            if (russianVoice) {
                this.currentUtterance.voice = russianVoice;
                this.currentUtterance.rate = 0.8;
            }

            button.classList.add('speaking');
            button.innerHTML = '<i class="ti ti-player-pause"></i> Остановить';
            this.isSpeaking = true;

            this.currentUtterance.onend = () => {
                this.isSpeaking = false;
                button.classList.remove('speaking');
                button.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить ответ';
            };

            this.currentUtterance.onerror = (error) => {
                console.error('Speech synthesis error:', error);
                this.isSpeaking = false;
                button.classList.remove('speaking');
                button.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить ответ';
                this.showNotification('Ошибка при озвучивании текста', 'error');
            };

            speechSynthesis.speak(this.currentUtterance);
            this.showNotification('Озвучивание текста...', 'info');

        } catch (error) {
            console.error('Error speaking text:', error);
            this.showNotification('Ошибка при озвучивании текста', 'error');
        }
    }

    stopSpeech() {
        if ('speechSynthesis' in window) {
            speechSynthesis.cancel();
        }
        this.isSpeaking = false;
        this.currentUtterance = null;
    }

    async generateVoice(text) {
        if (typeof puter?.ai?.txt2speech !== 'function') {
            throw new Error('Функция генерации голоса недоступна');
        }
        
        if (!text.trim()) {
            this.showNotification('Введите текст для генерации голоса', 'error');
            return;
        }

        try {
            this.addMessage('user', `🔊 **Генерация голоса:** "${text}"`);
            
            this.userInput.value = '';
            this.userInput.style.height = 'auto';
            
            this.showNotification('Генерация голоса...', 'info');
            
            const audio = await puter.ai.txt2speech(text);
            this.addVoiceMessage(text, audio);
            
            this.addToConversationHistory('user', `Сгенерирован голос для текста: ${text}`);
            this.saveCurrentSession();
            
        } catch (error) {
            this.handleError('Ошибка при генерации голоса', error);
        }
    }

    addVoiceMessage(text, audio) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-ai';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        messageContent.innerHTML = `
            🔊 **Сгенерированный голос для текста:** "${this.escapeHtml(text)}"
            <div class="audio-player" style="margin-top: 12px;">
                <audio controls style="width: 100%; max-width: 300px;">
                    <source src="${audio.src}" type="audio/mpeg">
                    Ваш браузер не поддерживает аудио элементы.
                </audio>
            </div>
        `;
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    addToConversationHistory(role, content, images = []) {
        let messageContent = content;
        
        if (images && images.length > 0) {
            const imageNames = images.map(img => img.name).join(', ');
            messageContent += ` [Прикреплено изображение: ${imageNames}]`;
        }
        
        this.conversationHistory.push({
            role: role,
            content: messageContent,
            timestamp: Date.now()
        });

        if (this.conversationHistory.length > 30) {
            this.conversationHistory = this.conversationHistory.slice(-25);
        }
    }

    async generateImage(prompt) {
        try {
            if (typeof puter?.ai?.imagine !== 'function') {
                throw new Error('Функция генерации изображений недоступна');
            }
            
            this.addMessage('ai', `🖼️ **Генерация изображения по запросу:** "${prompt}"\n\n*Идет процесс создания изображения...*`);
            
            const imageResult = await puter.ai.imagine(prompt, {
                model: "dall-e-3",
                size: "1024x1024"
            });
            
            const messages = this.messagesContainer.querySelectorAll('.message-ai');
            const lastMessage = messages[messages.length - 1];
            if (lastMessage) {
                lastMessage.querySelector('.message-content').innerHTML = 
                    `🖼️ **Сгенерированное изображение по запросу:** "${this.escapeHtml(prompt)}"\n\n` +
                    `<img src="${imageResult.url}" alt="Сгенерированное изображение" style="max-width: 100%; border-radius: 8px;">`;
            }
            
            this.addToConversationHistory('assistant', `Сгенерировано изображение по запросу: ${prompt}`);
            this.saveCurrentSession();
            
        } catch (error) {
            this.handleError('Ошибка при генерации изображения', error);
        }
    }

    toggleImageMode() {
        this.isImageMode = !this.isImageMode;
        const placeholder = this.isImageMode 
            ? "Опишите изображение для генерации..." 
            : "Задайте вопрос или опишите изображение...";
        
        this.userInput.placeholder = placeholder;
        this.generateImageBtn.classList.toggle('active', this.isImageMode);
        
        const icon = this.generateImageBtn.querySelector('i');
        icon.className = this.isImageMode ? 'ti ti-photo-off' : 'ti ti-photo';
        
        this.showNotification(
            this.isImageMode ? 'Режим генерации изображений включен' : 'Режим генерации изображений выключен',
            'info'
        );
    }

    addMessage(role, content, images = [], animate = true) {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${role}`;
        if (animate) {
            messageElement.style.animation = 'fadeIn 0.3s ease';
        }
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        try {
            const processedContent = this.processCodeBlocks(content);
            messageContent.innerHTML = processedContent;
        } catch {
            messageContent.textContent = content;
        }
        
        if (role === 'ai' && !content.includes('typing-indicator')) {
            const modelIndicator = document.createElement('div');
            modelIndicator.className = 'model-indicator';
            modelIndicator.textContent = `Модель: ${this.getModelDisplayName(this.currentModel)} • ${this.getModelDescription(this.currentModel)}`;
            messageContent.appendChild(modelIndicator);
        }
        
        if (images && images.length > 0) {
            images.forEach(image => {
                const imageContainer = document.createElement('div');
                imageContainer.className = 'message-image';
                
                const img = document.createElement('img');
                img.src = image.data;
                img.alt = image.name;
                img.style.maxWidth = '200px';
                img.style.borderRadius = '8px';
                img.style.marginTop = '8px';
                
                imageContainer.appendChild(img);
                messageContent.appendChild(imageContainer);
            });
        }
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        
        this.attachMessageHandlers(messageElement);
        this.scrollToBottom();
        
        return messageElement;
    }

    processCodeBlocks(content) {
        if (typeof marked === 'undefined') {
            return content.replace(/\n/g, '<br>');
        }
        
        let html = marked.parse(content);
        
        html = html.replace(/<pre><code class="([^"]*)">/g, (match, lang) => {
            const language = lang || 'text';
            return `
                <div class="code-header">
                    <span class="code-language">${language}</span>
                    <button class="copy-code-btn" data-language="${language}">
                        <i class="ti ti-copy"></i>
                        Копировать
                    </button>
                </div>
                <pre><code class="${lang}">`;
        });
        
        return html;
    }

    attachCopyButtons(container) {
        const copyButtons = container.querySelectorAll('.copy-code-btn');
        copyButtons.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const codeBlock = e.target.closest('.code-header')?.nextElementSibling;
                if (codeBlock) {
                    const code = codeBlock.textContent;
                    try {
                        await navigator.clipboard.writeText(code);
                        
                        const originalText = btn.innerHTML;
                        btn.innerHTML = '<i class="ti ti-check"></i> Скопировано!';
                        btn.classList.add('copied');
                        
                        setTimeout(() => {
                            btn.innerHTML = originalText;
                            btn.classList.remove('copied');
                        }, 2000);
                        
                        this.showNotification('Код скопирован в буфер обмена', 'success');
                    } catch (err) {
                        console.error('Failed to copy code:', err);
                        this.showNotification('Не удалось скопировать код', 'error');
                    }
                }
            });
        });
    }

    showTypingIndicator() {
        this.removeTypingIndicator();
        
        const typingElement = document.createElement('div');
        typingElement.className = 'message message-ai typing-indicator';
        
        typingElement.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <span>ИИ печатает...</span>
        `;
        
        this.messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
        
        return typingElement;
    }

    removeTypingIndicator() {
        const typingElements = this.messagesContainer.querySelectorAll('.typing-indicator');
        typingElements.forEach(el => el.remove());
    }

    clearInput() {
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        this.attachedImages = [];
        this.renderAttachedFiles();
        this.userInput.focus();
        this.showNotification('Ввод очищен', 'success');
    }

    clearChat() {
        if (this.messagesContainer.children.length === 0) {
            return;
        }

        if (confirm('Вы уверены, что хотите очистить всю историю чата?')) {
            this.messagesContainer.innerHTML = '';
            this.conversationHistory = [];
            this.showWelcomeMessage();
            this.saveCurrentSession();
            this.showNotification('Чат очищен', 'success');
        }
    }

    showWelcomeMessage() {
        const currentModelName = this.getModelDisplayName(this.currentModel);
        const currentModelDesc = this.getModelDescription(this.currentModel);
        
        const welcomeMessage = `# 👋 Добро пожаловать в KHAI!

Я ваш бесплатный ИИ-помощник с использованием передовых моделей AI. 

## 🎯 Основные возможности:
• **Умные ответы на вопросы** - используя различные модели ИИ
• **Анализ изображений** - извлечение текста и решение задач по фото
• **Голосовой ввод** - говорите вместо того, чтобы печатать
• **Генерация голоса** - преобразование текста в естественную речь
• **Озвучивание ответов** - слушайте ответы ИИ в аудиоформате

**Текущая модель: ${currentModelName}** - ${currentModelDesc}

**Начните общение, отправив сообщение или изображение!**`;

        this.addMessage('ai', welcomeMessage);
        this.addToConversationHistory('assistant', welcomeMessage);
    }

    showHelp() {
        const currentModelName = this.getModelDisplayName(this.currentModel);
        
        const helpMessage = `# 🆘 Помощь по KHAI

## 🤖 Текущая модель: ${currentModelName}
Вы можете переключать модели в верхнем правом углу.

## 💬 Система чатов:
• **Создание нового чата** - нажмите "Новый чат" в меню
• **Переключение между чатами** - выберите чат из списка в меню
• **Удаление чатов** - нажмите ❌ рядом с названием чата (кроме основного)

## 🔊 Аудио функции:
• **Генерация голоса** - создает аудио из текста с помощью ИИ
• **Озвучить ответ** - воспроизводит ответ ИИ
• **Остановить озвучку** - нажмите кнопку повторно для остановки

**Попробуйте отправить изображение с вопросом!**`;

        this.addMessage('ai', helpMessage);
        this.addToConversationHistory('assistant', helpMessage);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', this.currentTheme);
        
        try {
            localStorage.setItem('khai-theme', this.currentTheme);
        } catch (error) {
            console.error('Error saving theme preference:', error);
        }
        
        this.showNotification(
            this.currentTheme === 'dark' ? 'Темная тема включена' : 'Светлая тема включена',
            'info'
        );
    }

    loadThemePreference() {
        try {
            const savedTheme = localStorage.getItem('khai-theme');
            if (savedTheme === 'light' || savedTheme === 'dark') {
                this.currentTheme = savedTheme;
                document.body.setAttribute('data-theme', this.currentTheme);
            }
        } catch (error) {
            console.error('Error loading theme preference:', error);
        }
    }

    showNotification(message, type = 'info') {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }

    scrollToBottom() {
        setTimeout(() => {
            if (this.messagesContainer) {
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            }
        }, 50);
    }

    handleError(userMessage, error) {
        console.error(userMessage, error);
        this.addMessage('error', `${userMessage}: ${error.message}`);
        this.showNotification(userMessage, 'error');
    }

    getModelDescription(model) {
        return this.modelConfig[model]?.description || 'Модель ИИ';
    }

    setupChatSelector() {
        if (!this.chatSessions.has('default')) {
            this.createDefaultChat();
        }
        this.updateChatDropdown();
    }

    createDefaultChat() {
        const defaultSession = {
            id: 'default',
            name: 'Основной чат',
            messages: [],
            conversationHistory: [],
            createdAt: Date.now(),
            lastActivity: Date.now()
        };
        this.chatSessions.set('default', defaultSession);
        this.currentChatId = 'default';
        this.saveChatSessions();
    }

    saveModelPreference() {
        try {
            localStorage.setItem('khai-model', this.currentModel);
        } catch (error) {
            console.error('Error saving model preference:', error);
        }
    }

    loadModelPreference() {
        try {
            const savedModel = localStorage.getItem('khai-model');
            if (savedModel && this.modelConfig[savedModel]) {
                this.currentModel = savedModel;
                this.modelSelect.value = savedModel;
            }
        } catch (error) {
            console.error('Error loading model preference:', error);
        }
    }

    saveChatSessions() {
        try {
            const sessions = Array.from(this.chatSessions.entries());
            localStorage.setItem('khai-chat-sessions', JSON.stringify(sessions));
        } catch (error) {
            console.error('Error saving chat sessions:', error);
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
            console.error('Error loading chat sessions:', error);
        }
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.khaiApp = new KHAIApp();
    } catch (error) {
        console.error('Ошибка при инициализации приложения:', error);
        const errorNotification = document.createElement('div');
        errorNotification.className = 'notification error';
        errorNotification.textContent = 'Критическая ошибка при загрузке приложения';
        errorNotification.style.position = 'fixed';
        errorNotification.style.top = '50%';
        errorNotification.style.left = '50%';
        errorNotification.style.transform = 'translate(-50%, -50%)';
        errorNotification.style.zIndex = '10000';
        document.body.appendChild(errorNotification);
    }
});
