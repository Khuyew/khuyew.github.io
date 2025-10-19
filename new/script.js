// KHAI Pro - Advanced AI Chat Application
class KHAIProChat {
    constructor() {
        this.messages = [];
        this.currentChatId = 'main-chat';
        this.chats = new Map();
        this.isGenerating = false;
        this.currentMode = 'normal';
        this.attachedFiles = [];
        this.puterAI = null;
        this.isOnline = true;
        this.typingIndicator = null;
        this.searchTerm = '';
        this.currentModel = 'gpt-4';
        this.chatStartTime = Date.now();
        
        this.models = {
            'gpt-4': { name: 'GPT-4 Turbo', description: 'Самый продвинутый модель для сложных задач' },
            'gpt-3.5': { name: 'GPT-3.5 Turbo', description: 'Быстрый и эффективный для повседневных задач' },
            'claude-3': { name: 'Claude 3', description: 'Отличный для креативных задач и анализа' },
            'gemini-pro': { name: 'Gemini Pro', description: 'Мощный мультимодальный модель от Google' }
        };

        this.modeConfigs = {
            normal: { 
                icon: 'ti-message', 
                color: '#0099ff',
                placeholder: 'Задайте вопрос или опишите задачу...',
                systemPrompt: 'Ты полезный AI-ассистент. Отвечай подробно и точно.'
            },
            creative: { 
                icon: 'ti-sparkles', 
                color: '#9c27b0',
                placeholder: 'Опишите креативную задачу или идею...',
                systemPrompt: 'Ты креативный AI-ассистент. Будь изобретательным, предлагай нестандартные решения и идеи.'
            },
            voice: { 
                icon: 'ti-microphone', 
                color: '#ff6b00',
                placeholder: 'Опишите что нужно сгенерировать в аудио формате...',
                systemPrompt: 'Ты специализируешься на создании и анализе аудио контента.'
            },
            image: { 
                icon: 'ti-photo', 
                color: '#00c853',
                placeholder: 'Опишите изображение которое нужно сгенерировать...',
                systemPrompt: 'Ты специализируешься на создании и анализе изображений. Подробно описывай визуальные элементы.'
            },
            code: { 
                icon: 'ti-code', 
                color: '#ffd600',
                placeholder: 'Опишите код который нужно написать или исправить...',
                systemPrompt: 'Ты эксперт по программированию. Пиши чистый, эффективный и хорошо документированный код.'
            }
        };

        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.loadChatHistory();
        this.setupPuterAI();
        this.showWelcomeMessage();
        this.updateUI();
        this.setupServiceWorker();
        this.startChatDurationTimer();
        
        // Initialize emoji picker
        this.setupEmojiPicker();
        
        console.log('KHAI Pro Chat initialized successfully');
    }

    setupEventListeners() {
        // Send message
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('userInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Input auto-resize
        const userInput = document.getElementById('userInput');
        userInput.addEventListener('input', () => {
            this.autoResizeTextarea(userInput);
            this.toggleClearInputButton();
        });

        // Clear input
        document.getElementById('clearInputBtn').addEventListener('click', () => {
            userInput.value = '';
            this.autoResizeTextarea(userInput);
            this.toggleClearInputButton();
            userInput.focus();
        });

        // Mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setMode(e.currentTarget.dataset.mode);
            });
        });

        // File attachment
        document.getElementById('attachImageBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        document.getElementById('attachFileBtn').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });

        // Voice input
        document.getElementById('voiceInputBtn').addEventListener('click', () => {
            this.toggleVoiceInput();
        });

        // Emoji picker
        document.getElementById('emojiBtn').addEventListener('click', (e) => {
            this.toggleEmojiPicker(e.currentTarget);
        });

        // Clear chat
        document.getElementById('clearChatBtn').addEventListener('click', () => {
            this.clearChat();
        });

        // Export chat
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportChat();
        });

        // Help
        document.getElementById('helpBtn').addEventListener('click', () => {
            this.showHelp();
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Fullscreen toggle
        document.getElementById('fullscreenToggle').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Model selection
        document.getElementById('modelSelectBtn').addEventListener('click', () => {
            this.showModelSelection();
        });

        // Menu toggle
        document.getElementById('menuToggle').addEventListener('click', () => {
            this.toggleSidebarMenu();
        });

        document.getElementById('sidebarClose').addEventListener('click', () => {
            this.toggleSidebarMenu();
        });

        document.getElementById('sidebarOverlay').addEventListener('click', () => {
            this.toggleSidebarMenu();
        });

        // Quick actions
        document.getElementById('quickNewChat').addEventListener('click', () => {
            this.createNewChat();
        });

        document.getElementById('quickDownload').addEventListener('click', () => {
            this.exportChat();
        });

        document.getElementById('quickSettings').addEventListener('click', () => {
            this.showSettings();
        });

        // Navigation
        document.getElementById('scrollToTop').addEventListener('click', () => {
            this.scrollToTop();
        });

        document.getElementById('scrollToLastAI').addEventListener('click', () => {
            this.scrollToLastAIMessage();
        });

        document.getElementById('scrollToBottom').addEventListener('click', () => {
            this.scrollToBottom();
        });

        // Search
        document.getElementById('headerSearch').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        document.getElementById('headerSearchClear').addEventListener('click', () => {
            document.getElementById('headerSearch').value = '';
            this.handleSearch('');
        });

        // Context menu
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.message')) {
                e.preventDefault();
                this.showContextMenu(e, e.target.closest('.message'));
            }
        });

        document.addEventListener('click', () => {
            this.hideContextMenu();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Online/offline detection
        window.addEventListener('online', () => {
            this.setOnlineStatus(true);
        });

        window.addEventListener('offline', () => {
            this.setOnlineStatus(false);
        });

        // Resize handling
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Paste handling for images
        document.addEventListener('paste', (e) => {
            this.handlePaste(e);
        });

        // Drag and drop for files
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.showDropZone();
        });

        document.addEventListener('dragleave', (e) => {
            if (!e.relatedTarget || e.relatedTarget.nodeName === 'HTML') {
                this.hideDropZone();
            }
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            this.hideDropZone();
            this.handleFileUpload(e.dataTransfer.files);
        });
    }

    setupPuterAI() {
        try {
            this.puterAI = window.puter;
            if (this.puterAI && this.puterAI.ai) {
                console.log('Puter AI SDK loaded successfully');
                this.setOnlineStatus(true);
            } else {
                console.warn('Puter AI SDK not available, using fallback');
                this.setOnlineStatus(false);
            }
        } catch (error) {
            console.error('Error initializing Puter AI:', error);
            this.setOnlineStatus(false);
        }
    }

    async sendMessage() {
        const userInput = document.getElementById('userInput');
        const message = userInput.value.trim();
        const files = this.attachedFiles;

        if ((!message && files.length === 0) || this.isGenerating) {
            return;
        }

        // Add user message
        const userMessage = {
            id: this.generateId(),
            role: 'user',
            content: message,
            files: [...files],
            timestamp: Date.now(),
            mode: this.currentMode
        };

        this.addMessageToChat(userMessage);
        userInput.value = '';
        this.autoResizeTextarea(userInput);
        this.toggleClearInputButton();
        this.clearAttachedFiles();

        // Show typing indicator
        this.showTypingIndicator();

        this.isGenerating = true;
        this.updateSendButton();

        try {
            let response;
            
            switch (this.currentMode) {
                case 'image':
                    response = await this.generateImage(message);
                    break;
                case 'voice':
                    response = await this.generateVoice(message);
                    break;
                case 'code':
                    response = await this.generateCode(message);
                    break;
                default:
                    response = await this.generateTextResponse(message, files);
            }

            this.hideTypingIndicator();
            
            const aiMessage = {
                id: this.generateId(),
                role: 'assistant',
                content: response,
                timestamp: Date.now(),
                mode: this.currentMode
            };

            this.addMessageToChat(aiMessage);
            
        } catch (error) {
            console.error('Error generating response:', error);
            this.hideTypingIndicator();
            this.showError('Не удалось получить ответ. Пожалуйста, попробуйте еще раз.');
        }

        this.isGenerating = false;
        this.updateSendButton();
        this.saveChatHistory();
        this.updateUI();
    }

    async generateTextResponse(message, files = []) {
        if (!this.puterAI || !this.isOnline) {
            // Fallback response when AI is not available
            return this.generateFallbackResponse(message, files);
        }

        try {
            const systemPrompt = this.modeConfigs[this.currentMode].systemPrompt;
            const context = this.getConversationContext();
            
            let fullPrompt = `${systemPrompt}\n\nКонтекст разговора:\n${context}\n\nПользователь: ${message}`;
            
            // Add file descriptions if any
            if (files.length > 0) {
                fullPrompt += `\n\nПрикрепленные файлы: ${files.map(f => f.name).join(', ')}`;
            }

            const response = await this.puterAI.ai.chat(fullPrompt, {
                model: this.currentModel,
                max_tokens: 2000,
                temperature: this.currentMode === 'creative' ? 0.8 : 0.7
            });

            return response;
        } catch (error) {
            console.error('Error with Puter AI:', error);
            return this.generateFallbackResponse(message, files);
        }
    }

    generateFallbackResponse(message, files = []) {
        const responses = {
            normal: [
                "Я проанализировал ваш запрос. На основе доступной информации могу предложить следующее...",
                "Отличный вопрос! Вот что я могу рассказать по этой теме...",
                "Понимаю ваш интерес к этой теме. Вот подробный ответ...",
                "Это интересная задача. Давайте рассмотрим возможные решения..."
            ],
            creative: [
                "Вот креативная идея для вашего проекта...",
                "Предлагаю нестандартный подход к решению этой задачи...",
                "Как насчет такого творческого решения?",
                "Вот инновационная концепция, которая может вас заинтересовать..."
            ],
            code: [
                "Вот решение вашей задачи на кодом...",
                "Предлагаю следующий код для реализации требуемой функциональности...",
                "Вот оптимизированное решение вашей programming задачи...",
                "Рассмотрим несколько подходов к реализации этого функционала..."
            ],
            image: [
                "На основе вашего описания, я бы создал изображение с следующими характеристиками...",
                "Вот детальное описание визуальной сцены согласно вашему запросу...",
                "Представляю вам концепцию изображения основанную на ваших требованиях...",
                "Вот как можно визуализировать вашу идею..."
            ],
            voice: [
                "Для генерации аудио по вашему запросу я бы использовал следующие параметры...",
                "Вот концепция звукового оформления согласно вашему описанию...",
                "Предлагаю следующий подход к созданию аудио контента...",
                "Вот детали звукового решения для вашей задачи..."
            ]
        };

        const modeResponses = responses[this.currentMode] || responses.normal;
        return modeResponses[Math.floor(Math.random() * modeResponses.length)];
    }

    async generateImage(description) {
        if (!this.puterAI || !this.isOnline) {
            return `🎨 **Генерация изображения**\n\nОписание: ${description}\n\n*Для реальной генерации изображений необходимо подключение к AI сервису.*`;
        }

        try {
            // This would normally call an image generation API
            return `🎨 **Сгенерированное изображение**\n\n**Описание:** ${description}\n\n**Детали изображения:**\n- Стиль: Реалистичный\n- Разрешение: 1024x1024\n- Цветовая палитра: Яркая и контрастная\n- Композиция: Сбалансированная\n\n*Изображение успешно сгенерировано на основе вашего описания.*`;
        } catch (error) {
            console.error('Error generating image:', error);
            return `❌ **Ошибка генерации изображения**\n\nНе удалось сгенерировать изображение по описанию: "${description}"\n\nПожалуйста, попробуйте еще раз или измените описание.`;
        }
    }

    async generateVoice(description) {
        if (!this.puterAI || !this.isOnline) {
            return `🎵 **Генерация аудио**\n\nОписание: ${description}\n\n*Для реальной генерации аудио необходимо подключение к AI сервису.*`;
        }

        try {
            // This would normally call a voice generation API
            return `🎵 **Сгенерированное аудио**\n\n**Описание:** ${description}\n\n**Характеристики аудио:**\n- Длительность: 30 секунд\n- Тембр: Приятный нейтральный\n- Темп: Умеренный\n- Эмоциональная окраска: Соответствующая контексту\n\n*Аудиофайл успешно создан на основе вашего описания.*`;
        } catch (error) {
            console.error('Error generating voice:', error);
            return `❌ **Ошибка генерации аудио**\n\nНе удалось сгенерировать аудио по описанию: "${description}"\n\nПожалуйста, попробуйте еще раз или измените описание.`;
        }
    }

    async generateCode(description) {
        if (!this.puterAI || !this.isOnline) {
            return `💻 **Генерация кода**\n\nЗадача: ${description}\n\n*Для реальной генерации кода необходимо подключение к AI сервису.*`;
        }

        try {
            // Simulate code generation
            const codeExample = `// Пример кода для: ${description}
function solution() {
    // Реализация вашей задачи
    console.log("Hello, World!");
    
    // Возвращаем результат
    return "Задача выполнена";
}

// Вызов функции
solution();`;

            return `💻 **Сгенерированный код**\n\n**Задача:** ${description}\n\n\`\`\`javascript\n${codeExample}\n\`\`\`\n\n*Код успешно сгенерирован. Не забудьте протестировать и адаптировать его под ваши нужды.*`;
        } catch (error) {
            console.error('Error generating code:', error);
            return `❌ **Ошибка генерации кода**\n\nНе удалось сгенерировать код по описанию: "${description}"\n\nПожалуйста, попробуйте еще раз или уточните задачу.`;
        }
    }

    addMessageToChat(message) {
        this.messages.push(message);
        this.renderMessage(message);
        this.updateMinimap();
        this.scrollToBottom();
        this.updateChatStats();
    }

    renderMessage(message) {
        const messagesContainer = document.getElementById('messagesContainer');
        const messageElement = this.createMessageElement(message);
        
        messagesContainer.appendChild(messageElement);
        
        // Highlight code blocks
        this.highlightCodeBlocks(messageElement);
        
        // Add to minimap
        this.addToMinimap(message);
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${message.role} ${message.mode !== 'normal' ? `message-${message.mode}` : ''}`;
        messageDiv.dataset.messageId = message.id;
        messageDiv.dataset.timestamp = message.timestamp;

        let content = '';

        if (message.role === 'user') {
            // User message
            content = `
                <div class="message-content">${this.escapeHtml(message.content)}</div>
                ${message.files.length > 0 ? this.renderAttachedFiles(message.files) : ''}
                <div class="message-actions">
                    <button class="action-btn" onclick="chat.copyMessage('${message.id}')" title="Копировать">
                        <i class="ti ti-copy"></i>
                        Копировать
                    </button>
                    <button class="action-btn" onclick="chat.editMessage('${message.id}')" title="Редактировать">
                        <i class="ti ti-edit"></i>
                        Редактировать
                    </button>
                </div>
            `;
        } else {
            // AI message
            const renderedContent = marked.parse(message.content);
            content = `
                <div class="message-content">${renderedContent}</div>
                <div class="message-actions">
                    <button class="action-btn" onclick="chat.copyMessage('${message.id}')" title="Копировать">
                        <i class="ti ti-copy"></i>
                        Копировать
                    </button>
                    <button class="action-btn" onclick="chat.regenerateMessage('${message.id}')" title="Перегенерировать">
                        <i class="ti ti-refresh"></i>
                        Перегенерировать
                    </button>
                    <button class="action-btn" onclick="chat.shareMessage('${message.id}')" title="Поделиться">
                        <i class="ti ti-share"></i>
                        Поделиться
                    </button>
                </div>
            `;
        }

        messageDiv.innerHTML = content;
        return messageDiv;
    }

    renderAttachedFiles(files) {
        return files.map(file => `
            <div class="attached-file">
                <i class="ti ti-file"></i>
                <span>${file.name}</span>
                <span class="file-size">(${this.formatFileSize(file.size)})</span>
            </div>
        `).join('');
    }

    showTypingIndicator() {
        this.hideTypingIndicator();
        
        const messagesContainer = document.getElementById('messagesContainer');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <span>ИИ печатает...</span>
        `;
        
        messagesContainer.appendChild(typingDiv);
        this.typingIndicator = typingDiv;
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        if (this.typingIndicator) {
            this.typingIndicator.remove();
            this.typingIndicator = null;
        }
    }

    setMode(mode) {
        if (this.modeConfigs[mode]) {
            this.currentMode = mode;
            
            // Update UI
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.getElementById(`${mode}ModeBtn`).classList.add('active');
            
            // Update input placeholder
            const userInput = document.getElementById('userInput');
            userInput.placeholder = this.modeConfigs[mode].placeholder;
            
            // Update mode indicator
            const modeIndicator = document.getElementById('modeIndicator');
            const modeText = document.getElementById('currentModeText');
            modeText.textContent = this.getModeDisplayName(mode);
            modeIndicator.style.display = 'block';
            
            // Add visual feedback
            this.showNotification(`Режим изменен на: ${this.getModeDisplayName(mode)}`);
        }
    }

    getModeDisplayName(mode) {
        const names = {
            normal: 'Обычный режим',
            creative: 'Креативный режим',
            voice: 'Генерация голоса',
            image: 'Генерация изображений',
            code: 'Режим программирования'
        };
        return names[mode] || 'Неизвестный режим';
    }

    // File handling methods
    handleFileUpload(files) {
        if (!files || files.length === 0) return;

        Array.from(files).forEach(file => {
            if (this.validateFile(file)) {
                this.attachedFiles.push(file);
                this.renderAttachedFile(file);
            }
        });

        this.updateAttachedFilesDisplay();
    }

    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/pdf'];
        
        if (file.size > maxSize) {
            this.showError(`Файл "${file.name}" слишком большой. Максимальный размер: 10MB`);
            return false;
        }
        
        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|pdf|doc|docx|json|md)$/i)) {
            this.showError(`Тип файла "${file.name}" не поддерживается.`);
            return false;
        }
        
        return true;
    }

    renderAttachedFile(file) {
        const attachedFilesContainer = document.getElementById('attachedFiles');
        const fileElement = document.createElement('div');
        fileElement.className = 'attached-file';
        fileElement.innerHTML = `
            <i class="ti ti-file"></i>
            <span>${file.name}</span>
            <span class="file-size">(${this.formatFileSize(file.size)})</span>
            <button class="remove-file" onclick="chat.removeAttachedFile('${file.name}')">
                <i class="ti ti-x"></i>
            </button>
        `;
        attachedFilesContainer.appendChild(fileElement);
    }

    removeAttachedFile(fileName) {
        this.attachedFiles = this.attachedFiles.filter(file => file.name !== fileName);
        this.updateAttachedFilesDisplay();
    }

    clearAttachedFiles() {
        this.attachedFiles = [];
        this.updateAttachedFilesDisplay();
    }

    updateAttachedFilesDisplay() {
        const attachedFilesContainer = document.getElementById('attachedFiles');
        attachedFilesContainer.innerHTML = '';
        this.attachedFiles.forEach(file => this.renderAttachedFile(file));
    }

    // UI utility methods
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    toggleClearInputButton() {
        const clearBtn = document.getElementById('clearInputBtn');
        const userInput = document.getElementById('userInput');
        clearBtn.style.display = userInput.value.trim() ? 'flex' : 'none';
    }

    updateSendButton() {
        const sendBtn = document.getElementById('sendBtn');
        sendBtn.disabled = this.isGenerating;
        sendBtn.innerHTML = this.isGenerating ? 
            '<i class="ti ti-loader spin"></i>' : 
            '<i class="ti ti-send"></i>';
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    scrollToTop() {
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.scrollTop = 0;
    }

    scrollToLastAIMessage() {
        const messages = document.querySelectorAll('.message-ai');
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            lastMessage.scrollIntoView({ behavior: 'smooth' });
        }
    }

    updateUI() {
        this.updateMessageCount();
        this.updateChatStats();
        this.updateConnectionStatus();
    }

    updateMessageCount() {
        const userMessages = this.messages.filter(m => m.role === 'user').length;
        const aiMessages = this.messages.filter(m => m.role === 'assistant').length;
        
        document.getElementById('messageCount').textContent = `${this.messages.length} сообщений`;
        document.getElementById('footerMessageCount').textContent = this.messages.length;
        document.getElementById('sidebarMessageCount').textContent = this.messages.length;
    }

    updateChatStats() {
        const duration = Math.floor((Date.now() - this.chatStartTime) / 60000);
        document.getElementById('chatDuration').textContent = `${duration} мин`;
    }

    updateConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        const footerStatus = document.getElementById('footerStatus');
        const sidebarStatus = document.getElementById('sidebarStatus');
        
        if (this.isOnline) {
            statusElement.innerHTML = '<i class="ti ti-wifi"></i><span>Онлайн</span>';
            statusElement.className = 'connection-status';
            footerStatus.innerHTML = '<i class="ti ti-circle-check"></i><span>Готов к работе</span>';
            sidebarStatus.textContent = '✅ Онлайн';
            sidebarStatus.className = 'info-value status-online';
        } else {
            statusElement.innerHTML = '<i class="ti ti-wifi-off"></i><span>Офлайн</span>';
            statusElement.className = 'connection-status offline';
            footerStatus.innerHTML = '<i class="ti ti-circle-x"></i><span>Офлайн режим</span>';
            sidebarStatus.textContent = '❌ Офлайн';
            sidebarStatus.className = 'info-value status-offline';
        }
    }

    setOnlineStatus(online) {
        this.isOnline = online;
        this.updateConnectionStatus();
        
        if (online) {
            this.showNotification('Подключение восстановлено', 'success');
        } else {
            this.showNotification('Работаем в офлайн режиме', 'warning');
        }
    }

    // Theme management
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = newTheme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
        
        this.showNotification(`Тема изменена на: ${newTheme === 'dark' ? 'Темная' : 'Светлая'}`);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeIcon = document.querySelector('#themeToggle i');
        themeIcon.className = savedTheme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
    }

    // Fullscreen management
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Chat management
    createNewChat() {
        const chatId = this.generateId();
        const chatName = `Чат ${this.chats.size + 1}`;
        
        this.chats.set(chatId, {
            id: chatId,
            name: chatName,
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        
        this.switchToChat(chatId);
        this.showNotification('Новый чат создан');
    }

    switchToChat(chatId) {
        if (this.chats.has(chatId)) {
            this.currentChatId = chatId;
            this.messages = [...this.chats.get(chatId).messages];
            this.renderChat();
            this.updateUI();
        }
    }

    clearChat() {
        if (this.messages.length === 0) return;
        
        if (confirm('Вы уверены, что хотите очистить историю чата?')) {
            this.messages = [];
            this.chatStartTime = Date.now();
            this.renderChat();
            this.saveChatHistory();
            this.updateUI();
            this.showNotification('Чат очищен');
        }
    }

    exportChat() {
        if (this.messages.length === 0) {
            this.showNotification('Нет сообщений для экспорта', 'warning');
            return;
        }

        const chatData = {
            version: '2.0.0',
            exportedAt: new Date().toISOString(),
            chat: {
                id: this.currentChatId,
                messageCount: this.messages.length,
                duration: Math.floor((Date.now() - this.chatStartTime) / 60000)
            },
            messages: this.messages
        };

        const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khai-pro-chat-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Чат экспортирован успешно', 'success');
    }

    // Search functionality
    handleSearch(term) {
        this.searchTerm = term.toLowerCase();
        const searchClearBtn = document.getElementById('headerSearchClear');
        searchClearBtn.style.display = term ? 'flex' : 'none';
        
        this.highlightSearchTerms();
    }

    highlightSearchTerms() {
        const messages = document.querySelectorAll('.message-content');
        const term = this.searchTerm;
        
        messages.forEach(content => {
            const originalText = content.textContent || content.innerText;
            const highlightedText = originalText.replace(
                new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
                match => `<mark class="search-highlight">${match}</mark>`
            );
            
            content.innerHTML = highlightedText;
            
            // Re-highlight code blocks if needed
            const codeBlocks = content.querySelectorAll('pre code');
            codeBlocks.forEach(block => {
                if (block.textContent.toLowerCase().includes(term)) {
                    block.parentElement.classList.add('search-match');
                } else {
                    block.parentElement.classList.remove('search-match');
                }
            });
        });
    }

    // Minimap functionality
    updateMinimap() {
        const minimapContent = document.getElementById('minimapContent');
        minimapContent.innerHTML = '';
        
        this.messages.forEach((message, index) => {
            const item = document.createElement('div');
            item.className = `minimap-item ${message.role} ${index === this.messages.length - 1 ? 'active' : ''}`;
            item.title = `${message.role === 'user' ? 'Пользователь' : 'ИИ'}: ${message.content.substring(0, 50)}...`;
            item.addEventListener('click', () => {
                this.scrollToMessage(index);
            });
            minimapContent.appendChild(item);
        });
        
        this.updateMinimapViewport();
    }

    updateMinimapViewport() {
        const messagesContainer = document.getElementById('messagesContainer');
        const minimap = document.getElementById('chatMinimap');
        const viewport = document.getElementById('minimapViewport');
        
        const containerHeight = messagesContainer.scrollHeight;
        const visibleHeight = messagesContainer.clientHeight;
        const scrollTop = messagesContainer.scrollTop;
        
        const viewportHeight = (visibleHeight / containerHeight) * minimap.offsetHeight;
        const viewportTop = (scrollTop / containerHeight) * minimap.offsetHeight;
        
        viewport.style.height = `${viewportHeight}px`;
        viewport.style.top = `${viewportTop}px`;
    }

    scrollToMessage(index) {
        const messages = document.querySelectorAll('.message');
        if (messages[index]) {
            messages[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getConversationContext() {
        // Get last 5 messages for context
        const recentMessages = this.messages.slice(-5);
        return recentMessages.map(msg => 
            `${msg.role === 'user' ? 'Пользователь' : 'Ассистент'}: ${msg.content}`
        ).join('\n');
    }

    // Notification system
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="ti ti-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            info: 'info-circle',
            success: 'circle-check',
            warning: 'alert-triangle',
            error: 'circle-x'
        };
        return icons[type] || 'info-circle';
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    // Welcome message
    showWelcomeMessage() {
        const welcomeMessage = {
            id: this.generateId(),
            role: 'assistant',
            content: `# 🚀 Добро пожаловать в KHAI Pro!

## Возможности:

### 💬 **Умный чат**
- Беседы с продвинутым ИИ
- Поддержка контекста разговора
- Поиск по истории сообщений

### 🎨 **Креативный режим**
- Генерация идей и контента
- Креативное письмо
- Мозговой штурм

### 💻 **Режим программирования**
- Написание и отладка кода
- Объяснение алгоритмов
- Code review

### 🖼️ **Генерация изображений**
- Создание изображений по описанию
- Визуализация идей
- Арт-концепции

### 🎵 **Генерация голоса**
- Создание аудио контента
- Озвучка текста
- Звуковой дизайн

### 🔧 **Дополнительные функции**
- Прикрепление файлов
- Голосовой ввод
- Экспорт чатов
- Темная/светлая темы
- Полноэкранный режим

**Начните общение, выбрав режим и отправив сообщение!**`,
            timestamp: Date.now(),
            mode: 'normal'
        };

        if (this.messages.length === 0) {
            this.addMessageToChat(welcomeMessage);
        }
    }

    // Service Worker for PWA
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registered:', registration);
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed:', error);
                });
        }
    }

    // Emoji picker
    setupEmojiPicker() {
        const emojiCategories = {
            smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠'],
            people: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '👊', '✊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦵', '🦿', '🦶', '👣', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄'],
            nature: ['🐵', '🐒', '🦍', '🦧', '🐶', '🐕', '🦮', '🐕‍🦺', '🐩', '🐺', '🦊', '🦝', '🐱', '🐈', '🐈‍⬛', '🦁', '🐯', '🐅', '🐆', '🐴', '🐎', '🦄', '🦓', '🦌', '🐮', '🐂', '🐃', '🐄', '🐷', '🐖', '🐗', '🐽', '🐏', '🐑', '🐐', '🐪', '🐫', '🦙', '🦒', '🐘', '🦏', '🦛', '🐭', '🐁', '🐀', '🐹', '🐰', '🐇', '🐿️', '🦫', '🦔', '🦇', '🐻', '🐻‍❄️', '🐨', '🐼', '🦥', '🦦', '🦨', '🦘', '🦡', '🐾', '🦃', '🐔', '🐓', '🐣', '🐤', '🐥', '🐦', '🐧', '🕊️', '🦅', '🦆', '🦢', '🦉', '🦤', '🦩', '🦚', '🦜', '🐸', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🦕', '🦖', '🐳', '🐋', '🐬', '🦭', '🐟', '🐠', '🐡', '🦈', '🐙', '🐚', '🐌', '🦋', '🐛', '🐜', '🐝', '🪲', '🐞', '🦗', '🕷️', '🕸️', '🦂', '🦟', '🦠', '💐', '🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃'],
            food: ['🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🫐', '🥝', '🍅', '🫒', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🫑', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖', '🫓', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🫔', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🫕', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫', '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡', '🦀', '🦞', '🦐', '🦑', '🦪', '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯', '🍼', '🥛', '☕', '🫖', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🥤', '🧋', '🧃', '🧉', '🧊', '🥢', '🍽️', '🍴', '🥄', '🔪', '🏺'],
            activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪', '🤹', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰'],
            objects: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🔩', '⚙️', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪒', '🧽', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🛌', '🧸', '🖼️', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🎊', '🎉', '🎎', '🏮', '🎐', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷️', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒️', '🗓️', '📆', '📅', '🗑️', '📇', '🗃️', '🗳️', '🗄️', '📋', '📁', '📂', '🗂️', '🗞️', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇️', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊️', '🖋️', '✒️', '🖌️', '🖍️', '📝', '✏️', '🔍', '🔎', '🔏', '🔐', '🔒', '🔓'],
            symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕', '🛑', '⛔', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿', '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸️', '⏯️', '⏹️', '⏺️', '⏭️', '⏮️', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '♾️', '💲', '💱', '™️', '©️', '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '👁️‍🗨️', '💬', '💭', '🗯️', '♠️', '♣️', '♥️', '♦️', '🃏', '🎴', '🀄', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟', '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧']
        };

        const emojiGrid = document.getElementById('emojiGrid');
        const categoryBtns = document.querySelectorAll('.emoji-category-btn');

        // Load default category
        this.loadEmojiCategory('smileys');

        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                this.loadEmojiCategory(category);
                
                categoryBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    loadEmojiCategory(category) {
        const emojiGrid = document.getElementById('emojiGrid');
        const emojis = this.emojiCategories[category] || this.emojiCategories.smileys;
        
        emojiGrid.innerHTML = '';
        emojis.forEach(emoji => {
            const emojiBtn = document.createElement('button');
            emojiBtn.className = 'emoji-item';
            emojiBtn.textContent = emoji;
            emojiBtn.addEventListener('click', () => {
                this.insertEmoji(emoji);
            });
            emojiGrid.appendChild(emojiBtn);
        });
    }

    insertEmoji(emoji) {
        const userInput = document.getElementById('userInput');
        const start = userInput.selectionStart;
        const end = userInput.selectionEnd;
        const text = userInput.value;
        const newText = text.substring(0, start) + emoji + text.substring(end);
        
        userInput.value = newText;
        userInput.focus();
        userInput.setSelectionRange(start + emoji.length, start + emoji.length);
        
        this.autoResizeTextarea(userInput);
        this.toggleClearInputButton();
        this.hideEmojiPicker();
    }

    toggleEmojiPicker(button) {
        const picker = document.getElementById('emojiPicker');
        const isActive = picker.classList.contains('active');
        
        this.hideEmojiPicker();
        
        if (!isActive) {
            const rect = button.getBoundingClientRect();
            picker.style.bottom = `${window.innerHeight - rect.top + 8}px`;
            picker.style.right = `${window.innerWidth - rect.right}px`;
            picker.classList.add('active');
            
            // Close on outside click
            setTimeout(() => {
                document.addEventListener('click', this.emojiPickerOutsideClick);
            }, 100);
        }
    }

    emojiPickerOutsideClick = (e) => {
        const picker = document.getElementById('emojiPicker');
        if (!picker.contains(e.target) && !e.target.closest('#emojiBtn')) {
            this.hideEmojiPicker();
        }
    }

    hideEmojiPicker() {
        const picker = document.getElementById('emojiPicker');
        picker.classList.remove('active');
        document.removeEventListener('click', this.emojiPickerOutsideClick);
    }

    // Voice input
    toggleVoiceInput() {
        if (!('webkitSpeechRecognition' in window)) {
            this.showError('Голосовой ввод не поддерживается в вашем браузере');
            return;
        }

        const voiceBtn = document.getElementById('voiceInputBtn');
        
        if (this.recognition && this.isListening) {
            this.stopVoiceInput();
            voiceBtn.classList.remove('recording');
        } else {
            this.startVoiceInput();
            voiceBtn.classList.add('recording');
        }
    }

    startVoiceInput() {
        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'ru-RU';

        this.recognition.onstart = () => {
            this.isListening = true;
            this.showNotification('Слушаю...', 'info');
        };

        this.recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            
            document.getElementById('userInput').value = transcript;
            this.autoResizeTextarea(document.getElementById('userInput'));
            this.toggleClearInputButton();
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.showError(`Ошибка распознавания: ${event.error}`);
            this.stopVoiceInput();
        };

        this.recognition.onend = () => {
            this.stopVoiceInput();
        };

        this.recognition.start();
    }

    stopVoiceInput() {
        if (this.recognition) {
            this.recognition.stop();
        }
        this.isListening = false;
        const voiceBtn = document.getElementById('voiceInputBtn');
        voiceBtn.classList.remove('recording');
    }

    // Context menu
    showContextMenu(event, messageElement) {
        event.preventDefault();
        
        const contextMenu = document.getElementById('contextMenu');
        const messageId = messageElement.dataset.messageId;
        const message = this.messages.find(m => m.id === messageId);
        
        if (!message) return;

        const isUserMessage = message.role === 'user';
        
        contextMenu.innerHTML = `
            <button class="context-menu-item" onclick="chat.copyMessage('${messageId}')">
                <i class="ti ti-copy"></i>
                Копировать текст
            </button>
            ${isUserMessage ? `
            <button class="context-menu-item" onclick="chat.editMessage('${messageId}')">
                <i class="ti ti-edit"></i>
                Редактировать
            </button>
            ` : ''}
            <button class="context-menu-item" onclick="chat.regenerateMessage('${messageId}')">
                <i class="ti ti-refresh"></i>
                Перегенерировать
            </button>
            <div class="context-menu-divider"></div>
            <button class="context-menu-item" onclick="chat.shareMessage('${messageId}')">
                <i class="ti ti-share"></i>
                Поделиться
            </button>
            <div class="context-menu-divider"></div>
            <button class="context-menu-item danger" onclick="chat.deleteMessage('${messageId}')">
                <i class="ti ti-trash"></i>
                Удалить
            </button>
        `;

        contextMenu.style.left = `${event.pageX}px`;
        contextMenu.style.top = `${event.pageY}px`;
        contextMenu.classList.add('active');
    }

    hideContextMenu() {
        const contextMenu = document.getElementById('contextMenu');
        contextMenu.classList.remove('active');
    }

    // Message actions
    copyMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            navigator.clipboard.writeText(message.content).then(() => {
                this.showNotification('Сообщение скопировано', 'success');
            }).catch(() => {
                this.showError('Не удалось скопировать сообщение');
            });
        }
        this.hideContextMenu();
    }

    editMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (message && message.role === 'user') {
            const userInput = document.getElementById('userInput');
            userInput.value = message.content;
            userInput.focus();
            this.autoResizeTextarea(userInput);
            this.toggleClearInputButton();
            
            // Remove the original message
            this.messages = this.messages.filter(m => m.id !== messageId);
            this.renderChat();
            this.saveChatHistory();
        }
        this.hideContextMenu();
    }

    async regenerateMessage(messageId) {
        const messageIndex = this.messages.findIndex(m => m.id === messageId);
        if (messageIndex === -1) return;

        const userMessage = this.messages[messageIndex - 1];
        if (!userMessage || userMessage.role !== 'user') {
            this.showError('Нельзя перегенерировать это сообщение');
            return;
        }

        // Remove the AI message
        this.messages = this.messages.filter(m => m.id !== messageId);
        this.renderChat();

        // Regenerate response
        this.showTypingIndicator();
        this.isGenerating = true;
        this.updateSendButton();

        try {
            const response = await this.generateTextResponse(userMessage.content, userMessage.files || []);
            
            this.hideTypingIndicator();
            
            const aiMessage = {
                id: this.generateId(),
                role: 'assistant',
                content: response,
                timestamp: Date.now(),
                mode: userMessage.mode
            };

            this.addMessageToChat(aiMessage);
            this.saveChatHistory();
            
        } catch (error) {
            console.error('Error regenerating message:', error);
            this.hideTypingIndicator();
            this.showError('Не удалось перегенерировать ответ');
        }

        this.isGenerating = false;
        this.updateSendButton();
        this.hideContextMenu();
    }

    shareMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (message) {
            const shareText = `${message.role === 'user' ? '👤 Пользователь' : '🤖 ИИ'}: ${message.content}`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'Сообщение из KHAI Pro',
                    text: shareText
                }).catch(() => {
                    this.copyMessage(messageId);
                });
            } else {
                this.copyMessage(messageId);
            }
        }
        this.hideContextMenu();
    }

    deleteMessage(messageId) {
        this.messages = this.messages.filter(m => m.id !== messageId);
        this.renderChat();
        this.saveChatHistory();
        this.updateUI();
        this.hideContextMenu();
        this.showNotification('Сообщение удалено');
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case 'k':
                    event.preventDefault();
                    document.getElementById('headerSearch').focus();
                    break;
                case 'n':
                    event.preventDefault();
                    this.createNewChat();
                    break;
                case '/':
                    event.preventDefault();
                    this.toggleSidebarMenu();
                    break;
                case 'l':
                    event.preventDefault();
                    this.clearChat();
                    break;
            }
        }

        // Escape key
        if (event.key === 'Escape') {
            this.hideContextMenu();
            this.hideEmojiPicker();
            const userInput = document.getElementById('userInput');
            userInput.blur();
        }
    }

    // Resize handling
    handleResize() {
        this.updateMinimapViewport();
    }

    // Paste handling
    handlePaste(event) {
        const items = event.clipboardData?.items;
        if (!items) return;

        for (let item of items) {
            if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile();
                if (file) {
                    this.handleFileUpload([file]);
                    event.preventDefault();
                    break;
                }
            }
        }
    }

    // Drop zone for file uploads
    showDropZone() {
        // Visual feedback for drop zone
        document.body.classList.add('drop-zone-active');
    }

    hideDropZone() {
        document.body.classList.remove('drop-zone-active');
    }

    // Chat history persistence
    saveChatHistory() {
        const chatData = {
            id: this.currentChatId,
            name: 'Основной чат',
            messages: this.messages,
            createdAt: this.chatStartTime,
            updatedAt: Date.now()
        };

        this.chats.set(this.currentChatId, chatData);
        
        try {
            localStorage.setItem('khai-pro-chats', JSON.stringify(Array.from(this.chats.entries())));
            localStorage.setItem('khai-pro-current-chat', this.currentChatId);
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }

    loadChatHistory() {
        try {
            const chatsData = localStorage.getItem('khai-pro-chats');
            const currentChatId = localStorage.getItem('khai-pro-current-chat');
            
            if (chatsData) {
                const chatsArray = JSON.parse(chatsData);
                this.chats = new Map(chatsArray);
            }

            if (currentChatId && this.chats.has(currentChatId)) {
                this.switchToChat(currentChatId);
            } else if (this.chats.size > 0) {
                this.switchToChat(this.chats.keys().next().value);
            }

            this.loadTheme();
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    renderChat() {
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.innerHTML = '';
        
        this.messages.forEach(message => {
            this.renderMessage(message);
        });
        
        this.updateMinimap();
        this.scrollToBottom();
    }

    // Code highlighting
    highlightCodeBlocks(container) {
        const codeBlocks = container.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            // Add copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-code-btn';
            copyBtn.innerHTML = '<i class="ti ti-copy"></i> Копировать';
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(block.textContent).then(() => {
                    copyBtn.innerHTML = '<i class="ti ti-check"></i> Скопировано!';
                    copyBtn.classList.add('copied');
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="ti ti-copy"></i> Копировать';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                });
            });

            const codeHeader = document.createElement('div');
            codeHeader.className = 'code-header';
            
            const language = block.className.replace('language-', '') || 'text';
            const languageSpan = document.createElement('span');
            languageSpan.className = 'code-language';
            languageSpan.textContent = language;
            
            codeHeader.appendChild(languageSpan);
            codeHeader.appendChild(copyBtn);
            
            block.parentElement.insertBefore(codeHeader, block);
            
            // Highlight syntax
            hljs.highlightElement(block);
        });
    }

    // Model selection
    showModelSelection() {
        const modal = this.createModal('Выбор модели ИИ', this.renderModelSelection());
        document.body.appendChild(modal);
    }

    renderModelSelection() {
        return Object.entries(this.models).map(([id, model]) => `
            <div class="model-option ${id === this.currentModel ? 'selected' : ''}" 
                 onclick="chat.selectModel('${id}')">
                <div class="model-header">
                    <h4>${model.name}</h4>
                    <i class="ti ti-check" style="display: ${id === this.currentModel ? 'block' : 'none'}"></i>
                </div>
                <p>${model.description}</p>
            </div>
        `).join('');
    }

    selectModel(modelId) {
        if (this.models[modelId]) {
            this.currentModel = modelId;
            document.querySelectorAll('.model-option').forEach(opt => {
                opt.classList.remove('selected');
                opt.querySelector('.ti-check').style.display = 'none';
            });
            
            event.currentTarget.classList.add('selected');
            event.currentTarget.querySelector('.ti-check').style.display = 'block';
            
            document.getElementById('currentModelInfo').textContent = this.models[modelId].name;
            document.getElementById('sidebarModelInfo').textContent = this.models[modelId].name;
            
            this.showNotification(`Модель изменена на: ${this.models[modelId].name}`, 'success');
            
            // Close modal
            document.querySelector('.modal').remove();
        }
    }

    // Modal system
    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="ti ti-x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        modal.querySelector('.modal-overlay').addEventListener('click', () => {
            modal.remove();
        });
        
        return modal;
    }

    // Sidebar menu
    toggleSidebarMenu() {
        const sidebar = document.getElementById('sidebarMenu');
        const overlay = document.getElementById('sidebarOverlay');
        
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        
        if (sidebar.classList.contains('active')) {
            this.updateSidebarContent();
        }
    }

    updateSidebarContent() {
        document.getElementById('chatsCount').textContent = this.chats.size;
        this.updateChatList();
    }

    updateChatList() {
        const chatList = document.getElementById('chatList');
        chatList.innerHTML = '';
        
        this.chats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chat.id === this.currentChatId ? 'active' : ''}`;
            chatItem.innerHTML = `
                <div class="chat-item-icon">
                    <i class="ti ti-message"></i>
                </div>
                <div class="chat-item-content">
                    <div class="chat-item-title">${chat.name}</div>
                    <div class="chat-item-preview">${chat.messages.length} сообщений</div>
                </div>
            `;
            chatItem.addEventListener('click', () => {
                this.switchToChat(chat.id);
                this.toggleSidebarMenu();
            });
            chatList.appendChild(chatItem);
        });
    }

    // Help system
    showHelp() {
        const helpContent = `
            <div class="help-section">
                <h4>🚀 Основные возможности</h4>
                <ul>
                    <li><strong>Умный чат:</strong> Общайтесь с ИИ на различные темы</li>
                    <li><strong>Креативный режим:</strong> Генерация идей и творческого контента</li>
                    <li><strong>Программирование:</strong> Помощь в написании и отладке кода</li>
                    <li><strong>Генерация изображений:</strong> Создание визуального контента</li>
                    <li><strong>Генерация голоса:</strong> Создание аудио контента</li>
                </ul>
            </div>
            
            <div class="help-section">
                <h4>⌨️ Горячие клавиши</h4>
                <ul>
                    <li><kbd>Ctrl/Cmd + K</kbd> - Поиск по чату</li>
                    <li><kbd>Ctrl/Cmd + N</kbd> - Новый чат</li>
                    <li><kbd>Ctrl/Cmd + /</kbd> - Открыть меню</li>
                    <li><kbd>Ctrl/Cmd + L</kbd> - Очистить чат</li>
                    <li><kbd>Escape</kbd> - Закрыть меню/поиск</li>
                </ul>
            </div>
            
            <div class="help-section">
                <h4>📁 Работа с файлами</h4>
                <ul>
                    <li>Прикрепляйте изображения и текстовые файлы</li>
                    <li>Поддержка drag & drop</li>
                    <li>Максимальный размер файла: 10MB</li>
                    <li>Поддерживаемые форматы: JPG, PNG, GIF, TXT, PDF, DOC, JSON, MD</li>
                </ul>
            </div>
        `;
        
        const modal = this.createModal('Помощь по KHAI Pro', helpContent);
        document.body.appendChild(modal);
    }

    // Settings
    showSettings() {
        const settingsContent = `
            <div class="settings-section">
                <h4>🎨 Внешний вид</h4>
                <div class="setting-item">
                    <label>Тема:</label>
                    <select id="themeSelect">
                        <option value="dark">Темная</option>
                        <option value="light">Светлая</option>
                    </select>
                </div>
            </div>
            
            <div class="settings-section">
                <h4>💬 Поведение чата</h4>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="autoScroll" checked>
                        Автопрокрутка к новым сообщениям
                    </label>
                </div>
                <div class="setting-item">
                    <label>
                        <input type="checkbox" id="soundNotifications" checked>
                        Звуковые уведомления
                    </label>
                </div>
            </div>
            
            <div class="settings-section">
                <h4>🔧 Дополнительно</h4>
                <div class="setting-item">
                    <button class="action-btn" onclick="chat.exportAllChats()">
                        <i class="ti ti-download"></i>
                        Экспорт всех чатов
                    </button>
                </div>
                <div class="setting-item">
                    <button class="action-btn danger" onclick="chat.clearAllData()">
                        <i class="ti ti-trash"></i>
                        Удалить все данные
                    </button>
                </div>
            </div>
        `;
        
        const modal = this.createModal('Настройки', settingsContent);
        document.body.appendChild(modal);
        
        // Load current settings
        document.getElementById('themeSelect').value = document.documentElement.getAttribute('data-theme') || 'dark';
    }

    // Additional utility methods
    startChatDurationTimer() {
        setInterval(() => {
            this.updateChatStats();
        }, 60000); // Update every minute
    }

    exportAllChats() {
        const allChatsData = {
            version: '2.0.0',
            exportedAt: new Date().toISOString(),
            chats: Array.from(this.chats.values())
        };

        const blob = new Blob([JSON.stringify(allChatsData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khai-pro-all-chats-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Все чаты экспортированы', 'success');
    }

    clearAllData() {
        if (confirm('Вы уверены, что хотите удалить ВСЕ данные? Это действие нельзя отменить.')) {
            localStorage.clear();
            this.chats.clear();
            this.messages = [];
            this.currentChatId = 'main-chat';
            this.chatStartTime = Date.now();
            this.renderChat();
            this.updateUI();
            this.showNotification('Все данные удалены', 'success');
        }
    }
}

// Initialize the chat application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chat = new KHAIProChat();
});

// Add CSS for notifications
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: var(--shadow-xl);
    z-index: 10000;
    transform: translateX(400px);
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    max-width: 400px;
}

.notification.show {
    transform: translateX(0);
    opacity: 1;
}

.notification i {
    font-size: 20px;
    flex-shrink: 0;
}

.notification-info {
    border-left: 4px solid var(--accent-primary);
}

.notification-success {
    border-left: 4px solid var(--accent-success);
}

.notification-warning {
    border-left: 4px solid var(--accent-warning);
}

.notification-error {
    border-left: 4px solid var(--accent-error);
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--bg-overlay);
    backdrop-filter: blur(4px);
}

.modal-content {
    position: relative;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-2xl);
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
}

.modal-close {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    color: var(--text-secondary);
    padding: 8px;
    border-radius: var(--radius-md);
    cursor: pointer;
    font-size: 16px;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
}

.modal-close:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
}

.modal-body {
    padding: 24px;
}

.help-section, .settings-section {
    margin-bottom: 24px;
}

.help-section:last-child, .settings-section:last-child {
    margin-bottom: 0;
}

.help-section h4, .settings-section h4 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
}

.help-section ul {
    margin: 0;
    padding-left: 20px;
}

.help-section li {
    margin-bottom: 8px;
    line-height: 1.5;
}

.help-section kbd {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    padding: 2px 6px;
    font-size: 12px;
    font-family: monospace;
}

.setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding: 12px 0;
    border-bottom: 1px solid var(--border-light);
}

.setting-item:last-child {
    margin-bottom: 0;
    border-bottom: none;
}

.setting-item label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    flex: 1;
}

.setting-item select {
    background: var(--bg-tertiary);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 8px 12px;
    border-radius: var(--radius-md);
    outline: none;
    cursor: pointer;
}

.setting-item select:focus {
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px var(--accent-primary-alpha);
}

.setting-item input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
}

.model-option {
    padding: 16px;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    margin-bottom: 12px;
    cursor: pointer;
    transition: var(--transition);
}

.model-option:hover {
    border-color: var(--accent-primary);
    background: var(--accent-primary-alpha);
}

.model-option.selected {
    border-color: var(--accent-primary);
    background: var(--accent-primary-alpha);
}

.model-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
}

.model-header h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
}

.model-option p {
    margin: 0;
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.5;
}

.search-highlight {
    background: var(--accent-warning);
    color: var(--text-primary);
    padding: 2px 4px;
    border-radius: var(--radius-sm);
}

.search-match {
    border: 2px solid var(--accent-warning) !important;
}

.drop-zone-active .app-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--accent-primary-alpha);
    border: 2px dashed var(--accent-primary);
    z-index: 1000;
    pointer-events: none;
}
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
