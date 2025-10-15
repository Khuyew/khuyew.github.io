class KhuyewAI {
    constructor() {
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
        this.logo = document.querySelector('.logo');
        this.attachFileBtn = document.getElementById('attachFileBtn');
        this.voiceInputBtn = document.getElementById('voiceInputBtn');
        this.fileInput = document.getElementById('fileInput');
        this.attachedFiles = document.getElementById('attachedFiles');
        this.chatSelectButton = document.getElementById('chatSelectButton');
        this.chatDropdown = document.getElementById('chatDropdown');
        this.currentChatName = document.getElementById('currentChatName');
        this.newChatBtn = document.getElementById('newChatBtn');

        this.isProcessing = false;
        this.currentTheme = 'dark';
        this.isImageMode = false;
        this.isVoiceMode = false;
        this.attachedImages = [];
        this.isListening = false;
        this.recognition = null;
        this.conversationHistory = [];
        this.currentModel = 'gpt-5-nano';
        this.placeholderExamples = [
            "Расскажи о возможностях искусственного интеллекта...",
            "Напиши код для сортировки массива на Python...",
            "Объясни теорию относительности простыми словами...",
            "Какие есть способы улучшить производительность веб-сайта?",
            "Создай описание для приложения на основе ИИ..."
        ];
        this.currentAudio = null;
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.chatSessions = new Map();
        this.currentChatId = 'default';
        this.chatHistory = [];

        // Настройка marked для markdown
        this.setupMarked();
        
        this.init();
    }

    setupMarked() {
        marked.setOptions({
            highlight: function(code, lang) {
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
        this.bindEvents();
        this.loadMessages();
        this.setupAutoResize();
        this.setupVoiceRecognition();
        this.startPlaceholderAnimation();
        this.showWelcomeMessage();
        this.loadConversationHistory();
        this.loadModelPreference();
        this.loadChatSessions();
        this.setupChatSelector();
    }

    bindEvents() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.clearInputBtn.addEventListener('click', () => this.clearInput());
        this.clearChatBtn.addEventListener('click', () => this.clearChat());
        this.helpBtn.addEventListener('click', () => this.showHelp());
        this.generateImageBtn.addEventListener('click', (e) => {
            if (this.generateImageBtn.disabled) {
                e.preventDefault();
                this.showNotification('Генерация изображений временно недоступна', 'warning');
            } else {
                this.toggleImageMode();
            }
        });
        this.generateVoiceBtn.addEventListener('click', () => this.toggleVoiceMode());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.modelSelect.addEventListener('change', (e) => {
            if (e.target.value === 'claude-sonnet') {
                this.showNotification('Claude Sonnet временно недоступен', 'warning');
                this.modelSelect.value = this.currentModel;
                return;
            }
            this.changeModel(e.target.value);
        });
        this.logo.addEventListener('click', () => this.clearChat());
        this.attachFileBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.voiceInputBtn.addEventListener('click', () => this.toggleVoiceInput());

        // Новые обработчики для системы чатов
        this.chatSelectButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleChatDropdown();
        });

        this.newChatBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.createNewChat();
        });

        // Закрытие dropdown при клике вне его
        document.addEventListener('click', () => {
            this.chatDropdown.classList.remove('show');
        });

        window.addEventListener('beforeunload', () => {
            this.saveMessages();
            this.saveConversationHistory();
            this.saveModelPreference();
            this.saveChatSessions();
        });
    }

    setupChatSelector() {
        // Создаем основной чат по умолчанию если его нет
        if (!this.chatSessions.has('default')) {
            this.createDefaultChat();
        }
    }

    createDefaultChat() {
        const defaultSession = {
            id: 'default',
            name: 'Основной чат',
            messages: [],
            conversationHistory: [],
            createdAt: Date.now()
        };
        this.chatSessions.set('default', defaultSession);
        this.currentChatId = 'default';
        this.saveChatSessions();
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
                this.userInput.focus();
                this.showNotification('Текст распознан', 'success');
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showNotification('Ошибка распознавания речи', 'error');
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.voiceInputBtn.classList.remove('active');
            };
        } else {
            this.voiceInputBtn.style.display = 'none';
        }
    }

    startPlaceholderAnimation() {
        let index = 0;
        let charIndex = 0;
        let isDeleting = false;
        let currentText = '';

        const type = () => {
            const currentExample = this.placeholderExamples[index];
            
            if (isDeleting) {
                currentText = currentExample.substring(0, charIndex - 1);
                charIndex--;
            } else {
                currentText = currentExample.substring(0, charIndex + 1);
                charIndex++;
            }

            this.userInput.placeholder = currentText + '▌';

            if (!isDeleting && charIndex === currentExample.length) {
                setTimeout(() => isDeleting = true, 2000);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                index = (index + 1) % this.placeholderExamples.length;
            }

            const typeSpeed = isDeleting ? 50 : 100;
            setTimeout(type, typeSpeed);
        };

        type();
    }

    toggleChatDropdown() {
        this.chatDropdown.classList.toggle('show');
        this.updateChatDropdown();
    }

    updateChatDropdown() {
        const chatList = this.chatDropdown.querySelector('.chat-list') || document.createElement('div');
        chatList.className = 'chat-list';
        chatList.innerHTML = '';

        this.chatSessions.forEach((session, id) => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${id === this.currentChatId ? 'active' : ''}`;
            chatItem.setAttribute('data-chat-id', id);
            chatItem.innerHTML = `
                <i class="ti ti-message"></i>
                ${session.name}
                ${id !== 'default' ? '<button class="delete-chat-btn"><i class="ti ti-x"></i></button>' : ''}
            `;

            chatItem.addEventListener('click', (e) => {
                if (!e.target.closest('.delete-chat-btn')) {
                    this.switchChat(id);
                    this.chatDropdown.classList.remove('show');
                }
            });

            // Обработчик удаления чата
            const deleteBtn = chatItem.querySelector('.delete-chat-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteChat(id);
                });
            }

            chatList.appendChild(chatItem);
        });

        // Если нет элемента chat-list, добавляем его
        if (!this.chatDropdown.querySelector('.chat-list')) {
            this.chatDropdown.insertBefore(chatList, this.newChatBtn);
        }
    }

    createNewChat() {
        const chatName = `Чат ${this.chatSessions.size}`;
        const chatId = this.createChatSession(chatName);
        this.switchChat(chatId);
        this.chatDropdown.classList.remove('show');
        this.showNotification(`Создан новый чат: ${chatName}`, 'success');
    }

    createChatSession(name = 'Новый чат') {
        const chatId = 'chat-' + Date.now();
        const session = {
            id: chatId,
            name: name,
            messages: [],
            conversationHistory: [],
            createdAt: Date.now()
        };
        
        this.chatSessions.set(chatId, session);
        this.saveChatSessions();
        this.updateChatDropdown();
        
        return chatId;
    }

    switchChat(chatId) {
        if (this.chatSessions.has(chatId)) {
            // Сохраняем текущую сессию перед переключением
            this.saveCurrentSession();
            
            this.currentChatId = chatId;
            const session = this.chatSessions.get(chatId);
            
            // Обновляем имя текущего чата
            this.currentChatName.textContent = session.name;
            
            // Загружаем новую сессию
            this.loadSession(session);
            this.showNotification(`Переключен на чат: ${session.name}`, 'success');
        }
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

        if (confirm(`Удалить чат "${this.chatSessions.get(chatId).name}"?`)) {
            this.chatSessions.delete(chatId);
            
            // Если удаляем текущий чат, переключаемся на default
            if (this.currentChatId === chatId) {
                this.switchChat('default');
            }
            
            this.saveChatSessions();
            this.updateChatDropdown();
            this.showNotification('Чат удален', 'success');
        }
    }

    saveCurrentSession() {
        const messages = [];
        this.messagesContainer.querySelectorAll('.message').forEach(message => {
            if (message.classList.contains('typing-indicator') || message.classList.contains('streaming-message')) return;
            
            const role = message.classList.contains('message-user') ? 'user' : 
                       message.classList.contains('message-error') ? 'error' : 'ai';
            
            const content = message.querySelector('.message-content').innerHTML;
            messages.push({ role, content });
        });
        
        const session = this.chatSessions.get(this.currentChatId);
        if (session) {
            session.messages = messages;
            session.conversationHistory = [...this.conversationHistory];
            this.chatSessions.set(this.currentChatId, session);
        }
        
        this.saveChatSessions();
    }

    loadSession(session) {
        this.messagesContainer.innerHTML = '';
        this.conversationHistory = session.conversationHistory || [];
        
        session.messages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.className = `message message-${msg.role}`;
            
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            messageContent.innerHTML = msg.content;
            
            messageElement.appendChild(messageContent);
            this.messagesContainer.appendChild(messageElement);
        });
        
        // Прикрепляем обработчики для кнопок копирования
        this.messagesContainer.querySelectorAll('.message-content').forEach(content => {
            this.attachCopyButtons(content);
        });
        
        this.scrollToBottom();
    }

    changeModel(model) {
        this.currentModel = model;
        const modelName = this.getModelDisplayName(model);
        this.showNotification(`Модель изменена на: ${modelName}`, 'success');
        this.saveModelPreference();
    }

    getModelDisplayName(model) {
        const modelNames = {
            'gpt-5-nano': 'GPT-5 Nano',
            'o3-mini': 'O3 Mini',
            'claude-sonnet': 'Claude Sonnet',
            'deepseek-chat': 'DeepSeek Chat',
            'deepseek-reasoner': 'DeepSeek Reasoner',
            'gemini-2.0-flash': 'Gemini 2.0 Flash',
            'gemini-1.5-flash': 'Gemini 1.5 Flash',
            'grok-beta': 'xAI Grok'
        };
        return modelNames[model] || model;
    }

    getModelDescription(model) {
        const descriptions = {
            'gpt-5-nano': 'Быстрая и эффективная модель для повседневных задач',
            'o3-mini': 'Продвинутая модель с улучшенными возможностями рассуждения',
            'claude-sonnet': 'Мощная модель от Anthropic для сложных задач и анализа',
            'deepseek-chat': 'Универсальная модель для общения и решения задач',
            'deepseek-reasoner': 'Специализированная модель для сложных логических рассуждений',
            'gemini-2.0-flash': 'Новейшая быстрая модель от Google с улучшенными возможностями',
            'gemini-1.5-flash': 'Быстрая и эффективная модель от Google для различных задач',
            'grok-beta': 'Модель от xAI с уникальным характером и остроумными ответами'
        };
        return descriptions[model] || 'Модель ИИ';
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            this.showNotification('Голосовой ввод не поддерживается', 'error');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
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
            'success'
        );
    }

    handleFileSelect(event) {
        const files = event.target.files;
        if (files.length === 0) return;

        for (let file of files) {
            if (!file.type.startsWith('image/')) {
                this.showNotification('Пожалуйста, выберите только изображения', 'error');
                continue;
            }

            if (this.attachedImages.length >= 3) {
                this.showNotification('Можно прикрепить не более 3 изображений', 'warning');
                break;
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
            };
            reader.readAsDataURL(file);
        }

        event.target.value = '';
    }

    renderAttachedFiles() {
        this.attachedFiles.innerHTML = '';
        
        this.attachedImages.forEach((image, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            fileElement.innerHTML = `
                <i class="ti ti-photo"></i>
                <span>${image.name} (${this.formatFileSize(image.size)})</span>
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
        const removedFile = this.attachedImages.splice(index, 1)[0];
        this.renderAttachedFiles();
        this.showNotification(`Изображение "${removedFile.name}" удалено`, 'info');
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        
        if (!message && this.attachedImages.length === 0) {
            this.showNotification('Введите сообщение или прикрепите изображение', 'error');
            return;
        }

        if (this.isProcessing) {
            this.showNotification('Подождите завершения предыдущего запроса', 'warning');
            return;
        }

        try {
            this.isProcessing = true;
            this.sendBtn.disabled = true;

            if (this.isVoiceMode) {
                await this.generateVoice(message);
            } else {
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

        } catch (error) {
            console.error('Error:', error);
            this.removeTypingIndicator();
            this.addMessage('error', 'Произошла ошибка при отправке сообщения: ' + error.message);
            this.isProcessing = false;
            this.sendBtn.disabled = false;
        }
    }

    async getAIResponse(userMessage, images) {
        try {
            const typingId = this.showTypingIndicator();
            
            let prompt;
            
            if (images.length > 0 && userMessage.trim()) {
                if (typeof puter?.ai?.img2txt !== 'function') {
                    throw new Error('Функция анализа изображений недоступна');
                }
                
                const extractedText = await puter.ai.img2txt(images[0].data);
                
                prompt = `Пользователь отправил изображение "${images[0].name}" с сопроводительным сообщением: "${userMessage}"

Извлеченный текст с изображения: "${extractedText}"

Ответь на вопрос/сообщение пользователя "${userMessage}", учитывая содержание изображения. Если на изображении есть дополнительная информация (текст, задачи, диаграммы и т.д.) - используй её для полного ответа. Отвечай одним целостным сообщением на русском языке.`;
            } 
            else if (images.length > 0) {
                if (typeof puter?.ai?.img2txt !== 'function') {
                    throw new Error('Функция анализа изображений недоступна');
                }
                
                const extractedText = await puter.ai.img2txt(images[0].data);
                
                prompt = `Пользователь отправил изображение "${images[0].name}".

Извлеченный текст с изображения: "${extractedText}"

Проанализируй это изображение. Опиши что изображено, основное содержание. Если есть текст - объясни его значение. Если это задача - реши её. Отвечай подробно на русском языке.`;
            }
            else {
                const contextPrompt = this.buildContextPrompt(userMessage);
                prompt = contextPrompt;
            }
            
            if (typeof puter?.ai?.chat !== 'function') {
                throw new Error('Функция чата недоступна');
            }
            
            const modelOptions = {
                'gpt-5-nano': { model: 'gpt-5-nano' },
                'o3-mini': { model: 'o3-mini' },
                'claude-sonnet': { model: 'claude-sonnet' },
                'deepseek-chat': { model: 'deepseek-chat' },
                'deepseek-reasoner': { model: 'deepseek-reasoner' },
                'gemini-2.0-flash': { model: 'gemini-2.0-flash' },
                'gemini-1.5-flash': { model: 'gemini-1.5-flash' },
                'grok-beta': { model: 'grok-beta' }
            };
            
            const options = {
                ...modelOptions[this.currentModel],
                systemPrompt: "Ты полезный AI-ассистент Khuyew AI. Отвечай на русском языке понятно и подробно. Поддерживай естественный диалог и учитывай контекст предыдущих сообщений.",
                stream: true
            };
            
            const messageId = this.createStreamingMessage();
            
            const response = await puter.ai.chat(prompt, options);
            
            this.removeTypingIndicator(typingId);
            
            let fullResponse = '';
            for await (const part of response) {
                if (part?.text) {
                    fullResponse += part.text;
                    this.updateStreamingMessage(messageId, fullResponse);
                    
                    // Замедляем стриминг для лучшего восприятия
                    await new Promise(resolve => setTimeout(resolve, 20));
                }
            }
            
            this.finalizeStreamingMessage(messageId, fullResponse);
            
            this.addToConversationHistory('assistant', fullResponse);
            this.saveMessages();
            this.saveConversationHistory();
            
        } catch (error) {
            this.removeTypingIndicator();
            this.addMessage('error', 'Ошибка при получении ответа от ИИ: ' + error.message);
        } finally {
            this.isProcessing = false;
            this.sendBtn.disabled = false;
        }
    }

    createStreamingMessage() {
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-ai streaming-message';
        messageElement.id = 'streaming-' + Date.now();
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content streaming-content';
        
        messageContent.innerHTML = `
            <div class="typing-indicator-inline">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                <span>ИИ печатает...</span>
            </div>
            <div class="streaming-text"></div>
        `;
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        return messageElement.id;
    }

    updateStreamingMessage(messageId, content) {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) return;
        
        const streamingText = messageElement.querySelector('.streaming-text');
        const typingIndicator = messageElement.querySelector('.typing-indicator-inline');
        
        if (content.length > 50 && typingIndicator) {
            typingIndicator.style.opacity = '0.7';
        }
        if (content.length > 100 && typingIndicator) {
            typingIndicator.style.opacity = '0.3';
        }
        if (content.length > 150 && typingIndicator) {
            typingIndicator.style.display = 'none';
        }
        
        const processedContent = this.processCodeBlocks(content);
        streamingText.innerHTML = processedContent;
        
        this.attachCopyButtons(streamingText);
        this.scrollToBottom();
    }

    finalizeStreamingMessage(messageId, fullContent) {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) return;
        
        messageElement.classList.remove('streaming-message');
        const messageContent = messageElement.querySelector('.message-content');
        messageContent.classList.remove('streaming-content');
        
        const processedContent = this.processCodeBlocks(fullContent);
        messageContent.innerHTML = processedContent;
        
        const modelIndicator = document.createElement('div');
        modelIndicator.className = 'model-indicator';
        modelIndicator.textContent = `Модель: ${this.getModelDisplayName(this.currentModel)} • ${this.getModelDescription(this.currentModel)}`;
        messageContent.appendChild(modelIndicator);
        
        this.addSpeakButton(messageElement, this.extractPlainText(fullContent));
        this.attachCopyButtons(messageContent);
        this.scrollToBottom();
    }

    extractPlainText(markdownText) {
        return markdownText
            .replace(/#{1,6}\s?/g, '')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
            .replace(/!\[.*?\]\(.*?\)/g, '')
            .replace(/\[(.*?)\]\(.*?\)/g, '$1')
            .replace(/>\s?/g, '')
            .replace(/\n{3,}/g, '\n\n')
            .replace(/^\s+|\s+$/g, '')
            .replace(/\s+/g, ' ');
    }

    addSpeakButton(messageElement, plainText) {
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'message-actions';
        
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
        messageElement.appendChild(actionsContainer);
    }

    toggleTextToSpeech(text, button) {
        if (this.isSpeaking && this.currentUtterance) {
            window.speechSynthesis.cancel();
            this.isSpeaking = false;
            button.classList.remove('speaking');
            button.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить ответ';
            this.showNotification('Озвучивание остановлено', 'info');
        } else {
            this.speakText(text, button);
        }
    }

    async speakText(text, button) {
        try {
            if (this.isSpeaking) {
                window.speechSynthesis.cancel();
            }
            
            if ('speechSynthesis' in window) {
                this.currentUtterance = new SpeechSynthesisUtterance(text);
                this.currentUtterance.lang = 'ru-RU';
                this.currentUtterance.rate = 0.85;
                this.currentUtterance.pitch = 1.0;
                this.currentUtterance.volume = 1.0;
                
                const voices = window.speechSynthesis.getVoices();
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
                    this.showNotification('Озвучивание завершено', 'success');
                };
                
                this.currentUtterance.onerror = (error) => {
                    console.error('Speech synthesis error:', error);
                    this.isSpeaking = false;
                    button.classList.remove('speaking');
                    button.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить ответ';
                    this.showNotification('Ошибка при озвучивании текста', 'error');
                };
                
                window.speechSynthesis.speak(this.currentUtterance);
                this.showNotification('Озвучивание текста...', 'info');
                
            } else {
                this.showNotification('Озвучивание текста не поддерживается в вашем браузере', 'warning');
            }
        } catch (error) {
            console.error('Error speaking text:', error);
            this.showNotification('Ошибка при озвучивании текста', 'error');
        }
    }

    async generateVoice(text) {
        try {
            if (typeof puter?.ai?.txt2speech !== 'function') {
                throw new Error('Функция генерации голоса недоступна');
            }
            
            if (!text.trim()) {
                this.showNotification('Введите текст для генерации голоса', 'error');
                return;
            }

            this.isProcessing = true;
            this.sendBtn.disabled = true;

            this.addMessage('user', `🔊 **Генерация голоса:** "${text}"`);
            
            this.userInput.value = '';
            this.userInput.style.height = 'auto';
            
            this.showNotification('Генерация голоса...', 'info');
            
            const audio = await puter.ai.txt2speech(text);
            
            this.addVoiceMessage(text, audio);
            
            this.addToConversationHistory('user', `Сгенерирован голос для текста: ${text}`);
            this.saveMessages();
            this.saveConversationHistory();
            
        } catch (error) {
            console.error('Error generating voice:', error);
            this.addMessage('error', 'Ошибка при генерации голоса: ' + error.message);
        } finally {
            this.isProcessing = false;
            this.sendBtn.disabled = false;
        }
    }

    addVoiceMessage(text, audio) {
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-ai';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        messageContent.innerHTML = `
            🔊 **Сгенерированный голос для текста:** "${text}"
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
        
        const audioElement = messageContent.querySelector('audio');
        audioElement.play().catch(e => {
            console.log('Autoplay prevented:', e);
        });
    }

    buildContextPrompt(currentMessage) {
        const recentHistory = this.conversationHistory.slice(-6);
        
        if (recentHistory.length === 0) {
            return currentMessage;
        }

        let context = "Контекст предыдущего разговора:\n";
        
        recentHistory.forEach(msg => {
            const role = msg.role === 'user' ? 'Пользователь' : 'Ассистент';
            const content = msg.content.length > 500 ? msg.content.substring(0, 500) + '...' : msg.content;
            context += `${role}: ${content}\n`;
        });

        context += `\nТекущий вопрос пользователя: ${currentMessage}\n\nОтветь, учитывая контекст выше:`;

        return context;
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
                throw new Error('puter.ai.imagine is not a function - функция генерации изображений недоступна');
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
                    `🖼️ **Сгенерированное изображение по запросу:** "${prompt}"\n\n` +
                    `<img src="${imageResult.url}" alt="Сгенерированное изображение" style="max-width: 100%; border-radius: 8px;">`;
            }
            
            this.addToConversationHistory('assistant', `Сгенерировано изображение по запросу: ${prompt}`);
            this.saveMessages();
            this.saveConversationHistory();
            
        } catch (error) {
            console.error('Image generation error:', error);
            
            const messages = this.messagesContainer.querySelectorAll('.message-ai');
            const lastMessage = messages[messages.length - 1];
            if (lastMessage) {
                lastMessage.querySelector('.message-content').innerHTML = 
                    `🖼️ **Генерация изображения по запросу:** "${prompt}"\n\n` +
                    `❌ **Ошибка при генерации изображения:** ${error.message}`;
            }
        } finally {
            this.isProcessing = false;
            this.sendBtn.disabled = false;
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
            'success'
        );
    }

    addMessage(role, content, images = [], model = null) {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${role}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (role === 'ai' || role === 'error') {
            try {
                const processedContent = this.processCodeBlocks(content);
                messageContent.innerHTML = processedContent;
                this.attachCopyButtons(messageContent);
            } catch {
                messageContent.textContent = content;
            }
            
            if (role === 'ai' && model) {
                const modelIndicator = document.createElement('div');
                modelIndicator.className = 'model-indicator';
                modelIndicator.textContent = `Модель: ${this.getModelDisplayName(model)} • ${this.getModelDescription(model)}`;
                messageContent.appendChild(modelIndicator);
            }
        } else {
            try {
                const processedContent = this.processCodeBlocks(content);
                messageContent.innerHTML = processedContent;
                this.attachCopyButtons(messageContent);
            } catch {
                messageContent.textContent = content;
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
        }
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        return messageElement.id;
    }

    processCodeBlocks(content) {
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
        const typingElement = document.createElement('div');
        typingElement.className = 'message message-ai typing-indicator';
        typingElement.id = 'typing-' + Date.now();
        
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
        
        return typingElement.id;
    }

    removeTypingIndicator(typingId = null) {
        if (typingId) {
            const element = document.getElementById(typingId);
            if (element) element.remove();
        } else {
            const typingElements = this.messagesContainer.querySelectorAll('.typing-indicator');
            typingElements.forEach(el => el.remove());
        }
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
        if (this.messagesContainer.children.length > 0 && 
            confirm('Вы уверены, что хотите очистить всю историю чата?')) {
            
            this.messagesContainer.innerHTML = '';
            this.conversationHistory = [];
            this.showWelcomeMessage();
            this.showNotification('Чат очищен', 'success');
        }
    }

    showWelcomeMessage() {
        const currentModelName = this.getModelDisplayName(this.currentModel);
        const currentModelDesc = this.getModelDescription(this.currentModel);
        
        const welcomeMessage = `# 👋 Добро пожаловать в Khuyew AI!

Я ваш бесплатный ИИ-помощник с использованием передовых моделей AI. 

## 🎯 Основные возможности:
• **Умные ответы на вопросы** - используя различные модели ИИ
• **Анализ изображений** - извлечение текста и решение задач по фото
• **Голосовой ввод** - говорите вместо того, чтобы печатать
• **Генерация голоса** - преобразование текста в естественную речь
• **Озвучивание ответов** - слушайте ответы ИИ в аудиоформате
• **Контекстный диалог** - помню историю нашего разговора
• **Подсветка синтаксиса** - красивое отображение кода
• **Копирование кода** - удобное копирование фрагментов кода
• **Стриминг ответов** - ответы появляются постепенно с плавной анимацией
• **Мульти-чаты** - создавайте отдельные чаты для разных тем

## 🤖 Доступные модели:
• **GPT-5 Nano** - быстрая и эффективная для повседневных задач
• **O3 Mini** - продвинутая модель с улучшенными возможностями рассуждения
• **DeepSeek Chat** - универсальная модель для общения и решения задач
• **DeepSeek Reasoner** - специализированная модель для логических рассуждений
• **Gemini 2.0 Flash** - новейшая быстрая модель от Google
• **Gemini 1.5 Flash** - быстрая и эффективная модель от Google
• **xAI Grok** - модель от Илона Маска с уникальным характером

**Текущая модель: ${currentModelName}** - ${currentModelDesc}

## 🔊 Аудио возможности:
• **Генерация голоса** - использует ИИ для создания естественной речи из текста
• **Озвучить ответ** - слушайте ответы ИИ без markdown разметки
• **Управление воспроизведением** - нажмите кнопку повторно для остановки

## 💬 Система чатов:
• Создавайте отдельные чаты для разных тем
• Переключайтесь между чатами в верхнем меню
• Каждый чат сохраняет свою историю и контекст

## 💡 Примеры использования:
• Отправьте фото с текстом "Что здесь написано?"
• Отправьте фото задачи "Реши эту математическую задачу"
• Нажмите "Озвучить ответ" чтобы услышать ответ ИИ
• Включите "Генерация голоса" для создания речи из текста
• Создайте отдельный чат для работы и отдельный для развлечений

\`\`\`python
# Пример кода с подсветкой синтаксиса
def hello_world():
    print("Привет, мир!")
    return "Готов к работе!"
\`\`\`

**Начните общение, отправив сообщение или изображение!**`;

        this.addMessage('ai', welcomeMessage, [], this.currentModel);
        this.addToConversationHistory('assistant', welcomeMessage);
    }

    showHelp() {
        const currentModelName = this.getModelDisplayName(this.currentModel);
        
        const helpMessage = `# 🆘 Помощь по Khuyew AI

## 🤖 Текущая модель: ${currentModelName}
Вы можете переключать модели в верхнем правом углу. Каждая модель имеет свои особенности:
• **GPT-5 Nano** - лучше для быстрых ответов и простых задач
• **O3 Mini** - лучше для сложных рассуждений и анализа
• **DeepSeek Chat** - универсальная модель для повседневного общения
• **DeepSeek Reasoner** - лучше для сложных логических и математических задач
• **Gemini 2.0 Flash** - лучше для быстрых ответов и работы с мультимодальными данными
• **Gemini 1.5 Flash** - лучше для эффективного решения различных задач
• **xAI Grok** - лучше для неформального общения и остроумных ответов

## 💬 Система чатов:
• **Создание нового чата** - нажмите "Новый чат" в выпадающем меню
• **Переключение между чатами** - выберите чат из списка
• **Удаление чатов** - нажмите ❌ рядом с названием чата (кроме основного)
• Каждый чат сохраняет свою историю и контекст

## 🔊 Аудио функции:
• **Генерация голоса** - создает аудио из текста с помощью ИИ
• **Озвучить ответ** - воспроизводит ответ ИИ без markdown разметки
• **Остановить озвучку** - нажмите кнопку повторно для остановки

## 🖼️ Работа с изображениями:
1. **Нажмите кнопку ➕** чтобы прикрепить изображение
2. **Напишите вопрос** (опционально) - что вы хотите узнать о изображении
3. **Нажмите Отправить** - ИИ проанализирует изображение и ответит на ваш вопрос

## 💬 Контекстный диалог:
• Я помню предыдущие сообщения в нашей беседе
• Можете задавать уточняющие вопросы
• Поддерживаю естественный диалог

## ⚡ Стриминг ответов:
• Ответы появляются постепенно с плавной анимацией
• Вы видите ответ по мере его генерации
• Поддерживается markdown форматирование в реальном времени

## 📝 Работа с кодом:
• Используйте markdown для форматирования
• Код автоматически подсвечивается
• Нажмите "Копировать" чтобы скопировать код

\`\`\`javascript
// Пример JavaScript кода
function calculateSum(a, b) {
    return a + b;
}
console.log(calculateSum(5, 3));
\`\`\`

## 📝 Примеры:
• "Реши эту задачу" + фото математической задачи
• "Что написано на этом знаке?" + фото дорожного знака
• "Опиши это изображение" + фото пейзажа
• Просто отправьте фото без текста для общего анализа

**Попробуйте отправить изображение с вопросом!**`;

        this.addMessage('ai', helpMessage, [], this.currentModel);
        this.addToConversationHistory('assistant', helpMessage);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', this.currentTheme);
        
        const icon = this.themeToggle.querySelector('i');
        icon.className = this.currentTheme === 'dark' ? 'ti ti-moon' : 'ti ti-sun';
        
        this.showNotification(
            this.currentTheme === 'dark' ? 'Темная тема включена' : 'Светлая тема включена',
            'success'
        );
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    saveMessages() {
        try {
            const messages = [];
            this.messagesContainer.querySelectorAll('.message').forEach(message => {
                if (message.classList.contains('typing-indicator') || message.classList.contains('streaming-message')) return;
                
                const role = message.classList.contains('message-user') ? 'user' : 
                           message.classList.contains('message-error') ? 'error' : 'ai';
                
                const content = message.querySelector('.message-content').innerHTML;
                messages.push({ role, content });
            });
            
            const session = this.chatSessions.get(this.currentChatId);
            if (session) {
                session.messages = messages;
                this.chatSessions.set(this.currentChatId, session);
            }
        } catch (error) {
            console.error('Error saving messages:', error);
        }
    }

    loadMessages() {
        try {
            const session = this.chatSessions.get(this.currentChatId);
            if (session && session.messages) {
                session.messages.forEach(msg => {
                    const messageElement = document.createElement('div');
                    messageElement.className = `message message-${msg.role}`;
                    
                    const messageContent = document.createElement('div');
                    messageContent.className = 'message-content';
                    messageContent.innerHTML = msg.content;
                    
                    messageElement.appendChild(messageContent);
                    this.messagesContainer.appendChild(messageElement);
                });
                
                this.messagesContainer.querySelectorAll('.message-content').forEach(content => {
                    this.attachCopyButtons(content);
                });
                
                this.scrollToBottom();
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    saveConversationHistory() {
        try {
            const session = this.chatSessions.get(this.currentChatId);
            if (session) {
                session.conversationHistory = this.conversationHistory;
                this.chatSessions.set(this.currentChatId, session);
            }
        } catch (error) {
            console.error('Error saving conversation history:', error);
        }
    }

    loadConversationHistory() {
        try {
            const session = this.chatSessions.get(this.currentChatId);
            if (session && session.conversationHistory) {
                this.conversationHistory = session.conversationHistory;
            }
        } catch (error) {
            console.error('Error loading conversation history:', error);
        }
    }

    saveModelPreference() {
        try {
            localStorage.setItem('khuyew-ai-model', this.currentModel);
        } catch (error) {
            console.error('Error saving model preference:', error);
        }
    }

    loadModelPreference() {
        try {
            const savedModel = localStorage.getItem('khuyew-ai-model');
            const validModels = ['gpt-5-nano', 'o3-mini', 'deepseek-chat', 'deepseek-reasoner', 'gemini-2.0-flash', 'gemini-1.5-flash', 'grok-beta'];
            
            if (savedModel && validModels.includes(savedModel)) {
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
            localStorage.setItem('khuyew-ai-chat-sessions', JSON.stringify(sessions));
        } catch (error) {
            console.error('Error saving chat sessions:', error);
        }
    }

    loadChatSessions() {
        try {
            const saved = localStorage.getItem('khuyew-ai-chat-sessions');
            if (saved) {
                const sessions = JSON.parse(saved);
                this.chatSessions = new Map(sessions);
                this.updateChatDropdown();
            }
        } catch (error) {
            console.error('Error loading chat sessions:', error);
        }
    }
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    if (typeof puter === 'undefined') {
        console.error('Puter.ai не загружен');
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.textContent = 'Puter.ai не загружен. Некоторые функции могут быть недоступны.';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 5000);
    }
    
    // Загружаем голоса при инициализации
    if ('speechSynthesis' in window) {
        speechSynthesis.getVoices();
    }
    
    new KhuyewAI();
});
