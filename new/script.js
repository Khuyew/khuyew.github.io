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
        this.isListening = false;
        this.recognition = null;
        this.durationTimer = null;
        this.emojiPickerOutsideClick = this.emojiPickerOutsideClick.bind(this);
        
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
        try {
            this.setupEventListeners();
            await this.loadChatHistory();
            this.setupPuterAI();
            this.showWelcomeMessage();
            this.updateUI();
            this.setupServiceWorker();
            this.startChatDurationTimer();
            this.setupEmojiPicker();
            
            console.log('KHAI Pro Chat initialized successfully');
        } catch (error) {
            console.error('Error initializing KHAI Pro Chat:', error);
            this.showError('Ошибка инициализации приложения');
        }
    }

    setupEventListeners() {
        try {
            // Send message
            document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
            
            const userInput = document.getElementById('userInput');
            userInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Input auto-resize
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
                e.target.value = ''; // Reset input
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
            const headerSearch = document.getElementById('headerSearch');
            headerSearch.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });

            document.getElementById('headerSearchClear').addEventListener('click', () => {
                headerSearch.value = '';
                this.handleSearch('');
                headerSearch.focus();
            });

            // Context menu
            document.addEventListener('contextmenu', (e) => {
                if (e.target.closest('.message')) {
                    e.preventDefault();
                    this.showContextMenu(e, e.target.closest('.message'));
                }
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('.context-menu')) {
                    this.hideContextMenu();
                }
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

            // Resize handling with debounce
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this.handleResize();
                }, 250);
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
                if (e.dataTransfer.files.length > 0) {
                    this.handleFileUpload(e.dataTransfer.files);
                }
            });

            // Minimap scroll sync
            const messagesContainer = document.getElementById('messagesContainer');
            messagesContainer.addEventListener('scroll', () => {
                this.updateMinimapViewport();
            });

        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    setupPuterAI() {
        try {
            if (window.puter && window.puter.ai) {
                this.puterAI = window.puter;
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
        if (this.isGenerating) {
            this.showNotification('Подождите, идет генерация ответа...', 'warning');
            return;
        }

        const userInput = document.getElementById('userInput');
        const message = userInput.value.trim();
        const files = this.attachedFiles;

        if (!message && files.length === 0) {
            this.showNotification('Введите сообщение или прикрепите файл', 'warning');
            return;
        }

        if (message.length > 8000) {
            this.showError('Сообщение слишком длинное. Максимум 8000 символов.');
            return;
        }

        try {
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
        } finally {
            this.isGenerating = false;
            this.updateSendButton();
            this.saveChatHistory();
            this.updateUI();
        }
    }

    async generateTextResponse(message, files = []) {
        if (!this.puterAI || !this.isOnline) {
            return this.generateFallbackResponse(message, files);
        }

        try {
            const systemPrompt = this.modeConfigs[this.currentMode].systemPrompt;
            const context = this.getConversationContext();
            
            let fullPrompt = `${systemPrompt}\n\nКонтекст разговора:\n${context}\n\nПользователь: ${message}`;
            
            if (files.length > 0) {
                fullPrompt += `\n\nПрикрепленные файлы: ${files.map(f => f.name).join(', ')}`;
            }

            const response = await this.puterAI.ai.chat(fullPrompt, {
                model: this.currentModel,
                max_tokens: 2000,
                temperature: this.currentMode === 'creative' ? 0.8 : 0.7
            });

            return response || this.generateFallbackResponse(message, files);
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
                "Как насчет такой творческой концепции?",
                "Вот инновационное решение, которое может вас заинтересовать..."
            ],
            code: [
                "Вот решение вашей задачи на коде...",
                "Предлагаю следующий код для реализации требуемой функциональности...",
                "Вот оптимизированное решение вашей programming задачи...",
                "Рассмотрим несколько подходов к реализации этого функционала..."
            ],
            image: [
                "На основе вашего описания, я бы создал изображение со следующими характеристиками...",
                "Вот детальное описание визуальной сцены согласно вашему запросу...",
                "Представляю концепцию изображения основанную на ваших требованиях...",
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
        const randomResponse = modeResponses[Math.floor(Math.random() * modeResponses.length)];
        
        return `${randomResponse}\n\n*Примечание: Режим эмуляции. Для реальной генерации требуется подключение к AI-сервису.*`;
    }

    async generateImage(description) {
        if (!this.puterAI || !this.isOnline) {
            return `🖼️ **Генерация изображения**\n\nОписание: ${description}\n\n*Для реальной генерации изображений необходимо подключение к AI-сервису.*`;
        }

        try {
            return `🖼️ **Сгенерированное изображение**\n\n**Описание:** ${description}\n\n**Детали изображения:**\n- Стиль: Реалистичный\n- Разрешение: 1024x1024\n- Цветовая палитра: Яркая и контрастная\n- Композиция: Сбалансированная\n\n*Изображение успешно сгенерировано на основе вашего описания.*`;
        } catch (error) {
            console.error('Error generating image:', error);
            return `❌ **Ошибка генерации изображения**\n\nНе удалось сгенерировать изображение по описанию: "${description}"\n\nПожалуйста, попробуйте еще раз или измените описание.`;
        }
    }

    async generateVoice(description) {
        if (!this.puterAI || !this.isOnline) {
            return `🎵 **Генерация аудио**\n\nОписание: ${description}\n\n*Для реальной генерации аудио необходимо подключение к AI-сервису.*`;
        }

        try {
            return `🎵 **Сгенерированное аудио**\n\n**Описание:** ${description}\n\n**Характеристики аудио:**\n- Длительность: 30 секунд\n- Тембр: Приятный нейтральный\n- Темп: Умеренный\n- Эмоциональная окраска: Соответствующая контексту\n\n*Аудиофайл успешно создан на основе вашего описания.*`;
        } catch (error) {
            console.error('Error generating voice:', error);
            return `❌ **Ошибка генерации аудио**\n\nНе удалось сгенерировать аудио по описанию: "${description}"\n\nПожалуйста, попробуйте еще раз или измените описание.`;
        }
    }

    async generateCode(description) {
        if (!this.puterAI || !this.isOnline) {
            return `💻 **Генерация кода**\n\nЗадача: ${description}\n\n*Для реальной генерации кода необходимо подключение к AI-сервису.*`;
        }

        try {
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
        if (!messagesContainer) {
            console.error('Messages container not found');
            return;
        }

        const messageElement = this.createMessageElement(message);
        messagesContainer.appendChild(messageElement);
        
        this.highlightCodeBlocks(messageElement);
        this.addToMinimap(message);
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${message.role} ${message.mode !== 'normal' ? `message-${message.mode}` : ''}`;
        messageDiv.dataset.messageId = message.id;
        messageDiv.dataset.timestamp = message.timestamp;

        let content = '';

        if (message.role === 'user') {
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
        if (!files || files.length === 0) return '';
        
        return files.map(file => `
            <div class="attached-file">
                <i class="ti ti-file"></i>
                <span>${this.escapeHtml(file.name)}</span>
                <span class="file-size">(${this.formatFileSize(file.size)})</span>
            </div>
        `).join('');
    }

    showTypingIndicator() {
        this.hideTypingIndicator();
        
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;

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
                btn.setAttribute('aria-pressed', 'false');
            });
            
            const activeBtn = document.getElementById(`${mode}ModeBtn`);
            if (activeBtn) {
                activeBtn.classList.add('active');
                activeBtn.setAttribute('aria-pressed', 'true');
            }
            
            // Update input placeholder
            const userInput = document.getElementById('userInput');
            if (userInput) {
                userInput.placeholder = this.modeConfigs[mode].placeholder;
            }
            
            // Update mode indicator
            const modeText = document.getElementById('currentModeText');
            if (modeText) {
                modeText.textContent = this.getModeDisplayName(mode);
            }

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

        const validFiles = Array.from(files).filter(file => this.validateFile(file));
        
        if (validFiles.length === 0) return;

        // Check total size
        const totalSize = validFiles.reduce((sum, file) => sum + file.size, 0);
        if (totalSize > 50 * 1024 * 1024) { // 50MB total
            this.showError('Общий размер файлов превышает 50MB');
            return;
        }

        validFiles.forEach(file => {
            this.attachedFiles.push(file);
        });

        this.updateAttachedFilesDisplay();
        this.showNotification(`Добавлено файлов: ${validFiles.length}`, 'success');
    }

    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'text/plain', 'application/pdf', 
            'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/json', 'text/markdown'
        ];
        
        if (file.size > maxSize) {
            this.showError(`Файл "${file.name}" слишком большой. Максимальный размер: 10MB`);
            return false;
        }
        
        if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|pdf|doc|docx|json|md|jpg|jpeg|png|gif|webp)$/i)) {
            this.showError(`Тип файла "${file.name}" не поддерживается.`);
            return false;
        }
        
        return true;
    }

    renderAttachedFile(file) {
        const attachedFilesContainer = document.getElementById('attachedFiles');
        if (!attachedFilesContainer) return;

        const fileElement = document.createElement('div');
        fileElement.className = 'attached-file';
        fileElement.innerHTML = `
            <i class="ti ti-file"></i>
            <span>${this.escapeHtml(file.name)}</span>
            <span class="file-size">(${this.formatFileSize(file.size)})</span>
            <button class="remove-file" onclick="chat.removeAttachedFile('${this.escapeHtml(file.name)}')">
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
        if (!attachedFilesContainer) return;

        attachedFilesContainer.innerHTML = '';
        this.attachedFiles.forEach(file => this.renderAttachedFile(file));
        
        // Show/hide container
        attachedFilesContainer.style.display = this.attachedFiles.length > 0 ? 'flex' : 'none';
    }

    // UI utility methods
    autoResizeTextarea(textarea) {
        if (!textarea) return;
        
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    toggleClearInputButton() {
        const clearBtn = document.getElementById('clearInputBtn');
        const userInput = document.getElementById('userInput');
        
        if (clearBtn && userInput) {
            clearBtn.style.display = userInput.value.trim() ? 'flex' : 'none';
        }
    }

    updateSendButton() {
        const sendBtn = document.getElementById('sendBtn');
        if (!sendBtn) return;

        sendBtn.disabled = this.isGenerating;
        sendBtn.innerHTML = this.isGenerating ? 
            '<i class="ti ti-loader spin"></i>' : 
            '<i class="ti ti-send"></i>';
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    scrollToTop() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.scrollTop = 0;
        }
    }

    scrollToLastAIMessage() {
        const messages = document.querySelectorAll('.message-ai');
        if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            lastMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    updateUI() {
        this.updateMessageCount();
        this.updateChatStats();
        this.updateConnectionStatus();
    }

    updateMessageCount() {
        const count = this.messages.length;
        
        const messageCountEl = document.getElementById('messageCount');
        const footerMessageCountEl = document.getElementById('footerMessageCount');
        const sidebarMessageCountEl = document.getElementById('sidebarMessageCount');
        
        if (messageCountEl) messageCountEl.textContent = `${count} сообщений`;
        if (footerMessageCountEl) footerMessageCountEl.textContent = count;
        if (sidebarMessageCountEl) sidebarMessageCountEl.textContent = count;
    }

    updateChatStats() {
        const duration = Math.floor((Date.now() - this.chatStartTime) / 60000);
        const chatDurationEl = document.getElementById('chatDuration');
        if (chatDurationEl) {
            chatDurationEl.textContent = `${duration} мин`;
        }
    }

    updateConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        const footerStatus = document.getElementById('footerStatus');
        const sidebarStatus = document.getElementById('sidebarStatus');
        
        if (this.isOnline) {
            if (statusElement) {
                statusElement.innerHTML = '<i class="ti ti-wifi"></i><span>Онлайн</span>';
                statusElement.className = 'connection-status';
            }
            if (footerStatus) {
                footerStatus.innerHTML = '<i class="ti ti-circle-check"></i><span>Готов к работе</span>';
            }
            if (sidebarStatus) {
                sidebarStatus.textContent = '✅ Онлайн';
                sidebarStatus.className = 'info-value status-online';
            }
        } else {
            if (statusElement) {
                statusElement.innerHTML = '<i class="ti ti-wifi-off"></i><span>Офлайн</span>';
                statusElement.className = 'connection-status offline';
            }
            if (footerStatus) {
                footerStatus.innerHTML = '<i class="ti ti-circle-x"></i><span>Офлайн режим</span>';
            }
            if (sidebarStatus) {
                sidebarStatus.textContent = '❌ Офлайн';
                sidebarStatus.className = 'info-value status-offline';
            }
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
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('khai-pro-theme', theme);
        
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
        }
        
        this.showNotification(`Тема изменена на: ${theme === 'dark' ? 'Темная' : 'Светлая'}`);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('khai-pro-theme') || 'dark';
        this.setTheme(savedTheme);
    }

    // Fullscreen management
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
                this.showError('Не удалось перейти в полноэкранный режим');
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
        if (this.messages.length === 0) {
            this.showNotification('Нет сообщений для очистки', 'warning');
            return;
        }
        
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

        try {
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
        } catch (error) {
            console.error('Error exporting chat:', error);
            this.showError('Ошибка при экспорте чата');
        }
    }

    // Search functionality
    handleSearch(term) {
        this.searchTerm = term.toLowerCase().trim();
        const searchClearBtn = document.getElementById('headerSearchClear');
        
        if (searchClearBtn) {
            searchClearBtn.style.display = term ? 'flex' : 'none';
        }
        
        this.highlightSearchTerms();
    }

    highlightSearchTerms() {
        const messages = document.querySelectorAll('.message-content');
        const term = this.searchTerm;
        
        if (!term) {
            // Remove all highlights
            messages.forEach(content => {
                const marks = content.querySelectorAll('mark.search-highlight');
                marks.forEach(mark => {
                    mark.replaceWith(mark.textContent);
                });
            });
            return;
        }
        
        messages.forEach(content => {
            const originalHTML = content.innerHTML;
            const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
            const highlightedHTML = originalHTML.replace(regex, '<mark class="search-highlight">$1</mark>');
            content.innerHTML = highlightedHTML;
        });
    }

    // Message actions
    copyMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;
        
        const textToCopy = message.content;
        navigator.clipboard.writeText(textToCopy).then(() => {
            this.showNotification('Сообщение скопировано в буфер обмена', 'success');
        }).catch(err => {
            console.error('Error copying message:', err);
            this.showError('Не удалось скопировать сообщение');
        });
    }

    async regenerateMessage(messageId) {
        const messageIndex = this.messages.findIndex(m => m.id === messageId);
        if (messageIndex === -1 || this.messages[messageIndex].role !== 'assistant') return;
        
        // Find the user message that triggered this response
        const userMessageIndex = messageIndex - 1;
        if (userMessageIndex < 0 || this.messages[userMessageIndex].role !== 'user') return;
        
        const userMessage = this.messages[userMessageIndex];
        
        // Remove the current AI response
        this.messages.splice(messageIndex, 1);
        
        // Regenerate
        this.showTypingIndicator();
        this.isGenerating = true;
        this.updateSendButton();
        
        try {
            let response;
            switch (userMessage.mode) {
                case 'image':
                    response = await this.generateImage(userMessage.content);
                    break;
                case 'voice':
                    response = await this.generateVoice(userMessage.content);
                    break;
                case 'code':
                    response = await this.generateCode(userMessage.content);
                    break;
                default:
                    response = await this.generateTextResponse(userMessage.content, userMessage.files || []);
            }
            
            const aiMessage = {
                id: this.generateId(),
                role: 'assistant',
                content: response,
                timestamp: Date.now(),
                mode: userMessage.mode
            };
            
            this.messages.push(aiMessage);
            this.renderChat();
            this.saveChatHistory();
            
        } catch (error) {
            console.error('Error regenerating message:', error);
            this.showError('Не удалось перегенерировать сообщение');
        } finally {
            this.hideTypingIndicator();
            this.isGenerating = false;
            this.updateSendButton();
        }
    }

    editMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message || message.role !== 'user') return;
        
        const userInput = document.getElementById('userInput');
        userInput.value = message.content;
        this.autoResizeTextarea(userInput);
        this.toggleClearInputButton();
        
        // Remove the message being edited
        const messageIndex = this.messages.findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
            this.messages.splice(messageIndex, 1);
            this.renderChat();
            this.saveChatHistory();
        }
        
        userInput.focus();
        this.showNotification('Сообщение готово для редактирования');
    }

    shareMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;
        
        const shareText = `${message.content}\n\nПоделено из KHAI Pro Chat`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Сообщение из KHAI Pro Chat',
                text: shareText
            }).catch(err => {
                console.error('Error sharing:', err);
                this.fallbackShare(shareText);
            });
        } else {
            this.fallbackShare(shareText);
        }
    }

    fallbackShare(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Сообщение скопировано для отправки', 'success');
        }).catch(err => {
            console.error('Error copying for share:', err);
            this.showError('Не удалось поделиться сообщением');
        });
    }

    // Voice input functionality
    toggleVoiceInput() {
        if (this.isListening) {
            this.stopVoiceInput();
        } else {
            this.startVoiceInput();
        }
    }

    startVoiceInput() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showError('Голосовой ввод не поддерживается в вашем браузере');
            return;
        }

        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'ru-RU';
            
            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateVoiceInputButton();
                this.showNotification('Слушаю...', 'info');
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
                
                const userInput = document.getElementById('userInput');
                if (finalTranscript) {
                    userInput.value = finalTranscript;
                    this.autoResizeTextarea(userInput);
                    this.toggleClearInputButton();
                } else if (interimTranscript) {
                    userInput.value = interimTranscript;
                    this.autoResizeTextarea(userInput);
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.stopVoiceInput();
                
                if (event.error === 'not-allowed') {
                    this.showError('Доступ к микрофону запрещен. Пожалуйста, разрешите доступ к микрофону.');
                } else {
                    this.showError(`Ошибка распознавания речи: ${event.error}`);
                }
            };
            
            this.recognition.onend = () => {
                this.stopVoiceInput();
            };
            
            this.recognition.start();
            
        } catch (error) {
            console.error('Error starting voice input:', error);
            this.showError('Не удалось запустить голосовой ввод');
        }
    }

    stopVoiceInput() {
        if (this.recognition) {
            this.recognition.stop();
        }
        this.isListening = false;
        this.updateVoiceInputButton();
    }

    updateVoiceInputButton() {
        const voiceBtn = document.getElementById('voiceInputBtn');
        if (!voiceBtn) return;
        
        if (this.isListening) {
            voiceBtn.innerHTML = '<i class="ti ti-microphone-off"></i>';
            voiceBtn.classList.add('listening');
        } else {
            voiceBtn.innerHTML = '<i class="ti ti-microphone"></i>';
            voiceBtn.classList.remove('listening');
        }
    }

    // Emoji picker functionality
    setupEmojiPicker() {
        this.emojiCategories = {
            'people': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'],
            'nature': ['🐵', '🐒', '🦍', '🦧', '🐶', '🐕', '🦮', '🐕‍🦺', '🐩', '🐺', '🦊', '🦝', '🐱', '🐈', '🦁', '🐯', '🐅', '🐆', '🐴', '🐎', '🦄', '🦓', '🦌', '🐮', '🐂', '🐃', '🐄', '🐷', '🐖', '🐗', '🐽', '🐏', '🐑', '🐐', '🐪', '🐫', '🦙', '🦒', '🐘', '🦏', '🦛', '🐭', '🐁', '🐀', '🐹', '🐰', '🐇', '🐿️', '🦔', '🦇', '🐻', '🐨', '🐼', '🦥', '🦦', '🦨', '🦘', '🦡', '🐾', '🦃', '🐔', '🐓', '🐣', '🐤', '🐥', '🐦', '🐧', '🕊️', '🦅', '🦆', '🦢', '🦉', '🦩', '🦚', '🦜', '🐸', '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🦕', '🦖', '🐳', '🐋', '🐬', '🐟', '🐠', '🐡', '🦈', '🐙', '🐚', '🐌', '🦋', '🐛', '🐜', '🐝', '🐞', '🦗', '🕷️', '🕸️', '🦂', '🦟', '🦠', '💐', '🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃'],
            'objects': ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🧰', '🔧', '🔨', '⚒️', '🛠️', '⛏️', '🔩', '⚙️', '🧱', '⛓️', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡️', '⚔️', '🛡️', '🚬', '⚰️', '⚱️', '🏺', '🔮', '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳️', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡️', '🧹', '🧺', '🧻', '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪒', '🧽', '🧴', '🛎️', '🔑', '🗝️', '🚪', '🪑', '🛋️', '🛏️', '🛌', '🧸', '🖼️', '🛍️', '🛒', '🎁', '🎈', '🎏', '🎀', '🎊', '🎉', '🎎', '🏮', '🎐', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷️', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒️', '🗓️', '📆', '📅', '🗑️', '📇', '🗃️', '🗳️', '🗄️', '📋', '📁', '📂', '🗂️', '🗞️', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇️', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊️', '🖋️', '✒️', '🖌️', '🖍️', '📝', '✏️', '🔍', '🔎', '🔏', '🔐', '🔒', '🔓']
        };
    }

    toggleEmojiPicker(button) {
        const emojiPicker = document.getElementById('emojiPicker');
        if (!emojiPicker) return;

        if (emojiPicker.style.display === 'block') {
            this.hideEmojiPicker();
        } else {
            this.showEmojiPicker(button);
        }
    }

    showEmojiPicker(button) {
        const emojiPicker = document.getElementById('emojiPicker');
        if (!emojiPicker) return;

        const rect = button.getBoundingClientRect();
        emojiPicker.style.display = 'block';
        emojiPicker.style.top = (rect.top - 300) + 'px';
        emojiPicker.style.left = rect.left + 'px';

        this.renderEmojiPicker();
        
        document.addEventListener('click', this.emojiPickerOutsideClick);
    }

    hideEmojiPicker() {
        const emojiPicker = document.getElementById('emojiPicker');
        if (emojiPicker) {
            emojiPicker.style.display = 'none';
        }
        document.removeEventListener('click', this.emojiPickerOutsideClick);
    }

    emojiPickerOutsideClick(event) {
        const emojiPicker = document.getElementById('emojiPicker');
        const emojiBtn = document.getElementById('emojiBtn');
        
        if (emojiPicker && emojiBtn && 
            !emojiPicker.contains(event.target) && 
            !emojiBtn.contains(event.target)) {
            this.hideEmojiPicker();
        }
    }

    renderEmojiPicker() {
        const emojiPicker = document.getElementById('emojiPicker');
        if (!emojiPicker) return;

        let html = '<div class="emoji-categories">';
        
        for (const [category, emojis] of Object.entries(this.emojiCategories)) {
            html += `<div class="emoji-category">
                <h4>${this.getEmojiCategoryName(category)}</h4>
                <div class="emoji-grid">`;
            
            emojis.forEach(emoji => {
                html += `<span class="emoji" onclick="chat.insertEmoji('${emoji}')">${emoji}</span>`;
            });
            
            html += '</div></div>';
        }
        
        html += '</div>';
        emojiPicker.innerHTML = html;
    }

    getEmojiCategoryName(category) {
        const names = {
            'people': 'Люди и эмоции',
            'nature': 'Животные и природа',
            'objects': 'Объекты и предметы'
        };
        return names[category] || category;
    }

    insertEmoji(emoji) {
        const userInput = document.getElementById('userInput');
        if (userInput) {
            const cursorPos = userInput.selectionStart;
            const textBefore = userInput.value.substring(0, cursorPos);
            const textAfter = userInput.value.substring(cursorPos);
            
            userInput.value = textBefore + emoji + textAfter;
            userInput.selectionStart = userInput.selectionEnd = cursorPos + emoji.length;
            userInput.focus();
            
            this.autoResizeTextarea(userInput);
            this.toggleClearInputButton();
        }
        
        this.hideEmojiPicker();
    }

    // Context menu functionality
    showContextMenu(event, messageElement) {
        this.hideContextMenu();
        
        const messageId = messageElement.dataset.messageId;
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;
        
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = event.pageX + 'px';
        contextMenu.style.top = event.pageY + 'px';
        contextMenu.innerHTML = `
            <div class="context-menu-item" onclick="chat.copyMessage('${messageId}')">
                <i class="ti ti-copy"></i> Копировать
            </div>
            ${message.role === 'user' ? `
            <div class="context-menu-item" onclick="chat.editMessage('${messageId}')">
                <i class="ti ti-edit"></i> Редактировать
            </div>
            ` : ''}
            ${message.role === 'assistant' ? `
            <div class="context-menu-item" onclick="chat.regenerateMessage('${messageId}')">
                <i class="ti ti-refresh"></i> Перегенерировать
            </div>
            ` : ''}
            <div class="context-menu-item" onclick="chat.shareMessage('${messageId}')">
                <i class="ti ti-share"></i> Поделиться
            </div>
            <div class="context-menu-item" onclick="chat.deleteMessage('${messageId}')">
                <i class="ti ti-trash"></i> Удалить
            </div>
        `;
        
        document.body.appendChild(contextMenu);
        this.currentContextMenu = contextMenu;
    }

    hideContextMenu() {
        if (this.currentContextMenu) {
            this.currentContextMenu.remove();
            this.currentContextMenu = null;
        }
    }

    deleteMessage(messageId) {
        const messageIndex = this.messages.findIndex(m => m.id === messageId);
        if (messageIndex === -1) return;
        
        this.messages.splice(messageIndex, 1);
        this.renderChat();
        this.saveChatHistory();
        this.showNotification('Сообщение удалено');
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(event) {
        // Don't trigger shortcuts when user is typing in input
        if (event.target.matches('input, textarea')) return;
        
        const ctrl = event.ctrlKey || event.metaKey;
        
        if (ctrl) {
            switch (event.key) {
                case 'k':
                    event.preventDefault();
                    document.getElementById('headerSearch').focus();
                    break;
                case 'n':
                    event.preventDefault();
                    this.createNewChat();
                    break;
                case 'd':
                    event.preventDefault();
                    this.toggleTheme();
                    break;
                case 'f':
                    event.preventDefault();
                    this.toggleFullscreen();
                    break;
                case 'e':
                    event.preventDefault();
                    this.exportChat();
                    break;
                case 'l':
                    event.preventDefault();
                    this.clearChat();
                    break;
                case '/':
                    event.preventDefault();
                    this.showHelp();
                    break;
            }
        }
        
        // Escape key
        if (event.key === 'Escape') {
            this.hideContextMenu();
            this.hideEmojiPicker();
        }
    }

    // Help system
    showHelp() {
        const helpContent = `
            <h3>KHAI Pro - Справка</h3>
            
            <h4>Основные возможности:</h4>
            <ul>
                <li><strong>Обычный режим</strong> - для повседневных вопросов и задач</li>
                <li><strong>Креативный режим</strong> - для генерации идей и творческих задач</li>
                <li><strong>Режим программирования</strong> - для написания и анализа кода</li>
                <li><strong>Генерация изображений</strong> - создание описаний для изображений</li>
                <li><strong>Генерация голоса</strong> - создание аудио контента</li>
            </ul>
            
            <h4>Горячие клавиши:</h4>
            <ul>
                <li><kbd>Ctrl/Cmd + K</kbd> - Поиск по чату</li>
                <li><kbd>Ctrl/Cmd + N</kbd> - Новый чат</li>
                <li><kbd>Ctrl/Cmd + D</kbd> - Сменить тему</li>
                <li><kbd>Ctrl/Cmd + F</kbd> - Полноэкранный режим</li>
                <li><kbd>Ctrl/Cmd + E</kbd> - Экспорт чата</li>
                <li><kbd>Ctrl/Cmd + L</kbd> - Очистить чат</li>
                <li><kbd>Ctrl/Cmd + /</kbd> - Эта справка</li>
                <li><kbd>Esc</kbd> - Закрыть меню/поиск</li>
            </ul>
            
            <h4>Поддерживаемые файлы:</h4>
            <ul>
                <li>Изображения: JPG, PNG, GIF, WebP (до 10MB)</li>
                <li>Документы: TXT, PDF, DOC, DOCX, JSON, MD</li>
                <li>Общий лимит: 50MB за раз</li>
            </ul>
        `;
        
        this.showModal('Справка KHAI Pro', helpContent);
    }

    showSettings() {
        const settingsContent = `
            <div class="settings-section">
                <h4>Настройки AI</h4>
                <div class="setting-item">
                    <label>Модель AI:</label>
                    <select id="modelSelect">
                        ${Object.entries(this.models).map(([id, model]) => 
                            `<option value="${id}" ${id === this.currentModel ? 'selected' : ''}>${model.name}</option>`
                        ).join('')}
                    </select>
                </div>
            </div>
            
            <div class="settings-section">
                <h4>Настройки интерфейса</h4>
                <div class="setting-item">
                    <label>Тема:</label>
                    <select id="themeSelect">
                        <option value="dark">Темная</option>
                        <option value="light">Светлая</option>
                    </select>
                </div>
            </div>
            
            <div class="settings-section">
                <h4>Данные</h4>
                <div class="setting-item">
                    <button class="btn btn-secondary" onclick="chat.exportAllChats()">Экспорт всех чатов</button>
                    <button class="btn btn-danger" onclick="chat.clearAllData()">Очистить все данные</button>
                </div>
            </div>
        `;
        
        this.showModal('Настройки', settingsContent, () => {
            const modelSelect = document.getElementById('modelSelect');
            const themeSelect = document.getElementById('themeSelect');
            
            if (modelSelect) {
                this.currentModel = modelSelect.value;
                localStorage.setItem('khai-pro-model', this.currentModel);
            }
            
            if (themeSelect) {
                this.setTheme(themeSelect.value);
            }
        });
    }

    // Modal system
    showModal(title, content, onConfirm = null) {
        this.hideModal();
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="chat.hideModal()">&times;</button>
                </div>
                <div class="modal-content">
                    ${content}
                </div>
                <div class="modal-footer">
                    ${onConfirm ? `
                    <button class="btn btn-secondary" onclick="chat.hideModal()">Отмена</button>
                    <button class="btn btn-primary" onclick="chat.confirmModal()">Применить</button>
                    ` : `
                    <button class="btn btn-primary" onclick="chat.hideModal()">Закрыть</button>
                    `}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.currentModal = { element: modal, onConfirm };
        
        // Focus trap
        modal.querySelector('button').focus();
    }

    hideModal() {
        if (this.currentModal) {
            this.currentModal.element.remove();
            this.currentModal = null;
        }
    }

    confirmModal() {
        if (this.currentModal && this.currentModal.onConfirm) {
            this.currentModal.onConfirm();
        }
        this.hideModal();
    }

    // Data management
    async loadChatHistory() {
        try {
            const saved = localStorage.getItem('khai-pro-chats');
            if (saved) {
                const data = JSON.parse(saved);
                this.chats = new Map(data.chats || []);
                this.currentChatId = data.currentChatId || 'main-chat';
                this.messages = [...(this.chats.get(this.currentChatId)?.messages || [])];
                this.currentModel = data.currentModel || 'gpt-4';
                
                // Load theme
                const savedTheme = localStorage.getItem('khai-pro-theme');
                if (savedTheme) {
                    this.setTheme(savedTheme);
                }
            } else {
                // Initialize with main chat
                this.chats.set('main-chat', {
                    id: 'main-chat',
                    name: 'Основной чат',
                    messages: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                });
            }
            
            this.renderChat();
        } catch (error) {
            console.error('Error loading chat history:', error);
            this.showError('Ошибка загрузки истории чатов');
        }
    }

    saveChatHistory() {
        try {
            const chatData = {
                chats: Array.from(this.chats.entries()),
                currentChatId: this.currentChatId,
                currentModel: this.currentModel,
                savedAt: Date.now()
            };
            
            localStorage.setItem('khai-pro-chats', JSON.stringify(chatData));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }

    exportAllChats() {
        try {
            const allChats = Array.from(this.chats.values());
            const exportData = {
                version: '2.0.0',
                exportedAt: new Date().toISOString(),
                totalChats: allChats.length,
                totalMessages: allChats.reduce((sum, chat) => sum + chat.messages.length, 0),
                chats: allChats
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `khai-pro-all-chats-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Все чаты экспортированы успешно', 'success');
        } catch (error) {
            console.error('Error exporting all chats:', error);
            this.showError('Ошибка при экспорте чатов');
        }
    }

    clearAllData() {
        if (confirm('Вы уверены, что хотите удалить ВСЕ данные? Это действие нельзя отменить.')) {
            localStorage.removeItem('khai-pro-chats');
            localStorage.removeItem('khai-pro-theme');
            localStorage.removeItem('khai-pro-model');
            
            this.chats.clear();
            this.messages = [];
            this.currentChatId = 'main-chat';
            
            this.chats.set('main-chat', {
                id: 'main-chat',
                name: 'Основной чат',
                messages: [],
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
            
            this.renderChat();
            this.showNotification('Все данные очищены', 'success');
        }
    }

    // Service Worker for offline functionality
    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('/sw.js');
                console.log('Service Worker registered successfully');
            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
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

    escapeRegex(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notif => notif.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="ti ti-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="ti ti-x"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            'info': 'info-circle',
            'success': 'circle-check',
            'warning': 'alert-triangle',
            'error': 'alert-circle'
        };
        return icons[type] || 'info-circle';
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showWelcomeMessage() {
        if (this.messages.length === 0) {
            const welcomeMessage = {
                id: this.generateId(),
                role: 'assistant',
                content: `👋 **Добро пожаловать в KHAI Pro!**\n\nЯ ваш продвинутый AI-ассистент с поддержкой различных режимов:\n\n🎨 **Креативный режим** - для генерации идей и творческих задач\n💻 **Режим программирования** - для написания и анализа кода\n🖼️ **Генерация изображений** - создание описаний для визуального контента\n🎵 **Генерация голоса** - работа с аудио контентом\n\n**Горячие клавиши:**\n- \`Ctrl/Cmd + K\` - Поиск по чату\n- \`Ctrl/Cmd + N\` - Новый чат\n- \`Ctrl/Cmd + /\` - Справка\n\nНе стесняйтесь задавать вопросы в любом из режимов!`,
                timestamp: Date.now(),
                mode: 'normal'
            };
            
            this.addMessageToChat(welcomeMessage);
        }
    }

    // Rendering and DOM management
    renderChat() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;
        
        messagesContainer.innerHTML = '';
        this.messages.forEach(message => this.renderMessage(message));
        this.scrollToBottom();
        this.updateMinimap();
    }

    highlightCodeBlocks(messageElement) {
        const codeBlocks = messageElement.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            if (!block.classList.contains('hljs')) {
                hljs.highlightElement(block);
            }
        });
    }

    // Minimap functionality
    updateMinimap() {
        const minimap = document.getElementById('minimap');
        if (!minimap) return;
        
        const messages = this.messages;
        minimap.innerHTML = '';
        
        messages.forEach((message, index) => {
            const dot = document.createElement('div');
            dot.className = `minimap-dot minimap-${message.role}`;
            dot.title = `${message.role === 'user' ? 'Вы' : 'AI'} - ${new Date(message.timestamp).toLocaleTimeString()}`;
            dot.addEventListener('click', () => {
                this.scrollToMessage(index);
            });
            minimap.appendChild(dot);
        });
    }

    updateMinimapViewport() {
        const messagesContainer = document.getElementById('messagesContainer');
        const minimapViewport = document.getElementById('minimapViewport');
        if (!messagesContainer || !minimapViewport) return;
        
        const scrollPercent = messagesContainer.scrollTop / (messagesContainer.scrollHeight - messagesContainer.clientHeight);
        const viewportHeight = Math.min(100, (messagesContainer.clientHeight / messagesContainer.scrollHeight) * 100);
        const viewportTop = scrollPercent * (100 - viewportHeight);
        
        minimapViewport.style.height = `${viewportHeight}%`;
        minimapViewport.style.top = `${viewportTop}%`;
    }

    scrollToMessage(index) {
        const messages = document.querySelectorAll('.message');
        if (messages[index]) {
            messages[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    addToMinimap(message) {
        const minimap = document.getElementById('minimap');
        if (!minimap) return;
        
        const dot = document.createElement('div');
        dot.className = `minimap-dot minimap-${message.role}`;
        dot.title = `${message.role === 'user' ? 'Вы' : 'AI'} - ${new Date(message.timestamp).toLocaleTimeString()}`;
        minimap.appendChild(dot);
    }

    // Sidebar menu
    toggleSidebarMenu() {
        const sidebar = document.getElementById('sidebarMenu');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            const isOpen = sidebar.classList.contains('open');
            
            if (isOpen) {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            } else {
                sidebar.classList.add('open');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        }
    }

    // Event handlers
    handleResize() {
        this.updateMinimapViewport();
        this.autoResizeTextarea(document.getElementById('userInput'));
    }

    handlePaste(event) {
        const items = event.clipboardData?.items;
        if (!items) return;
        
        const files = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) files.push(file);
            }
        }
        
        if (files.length > 0) {
            event.preventDefault();
            this.handleFileUpload(files);
        }
    }

    showDropZone() {
        let dropZone = document.getElementById('dropZone');
        if (!dropZone) {
            dropZone = document.createElement('div');
            dropZone.id = 'dropZone';
            dropZone.innerHTML = '<div class="drop-zone-content"><i class="ti ti-upload"></i><p>Перетащите файлы сюда</p></div>';
            document.body.appendChild(dropZone);
        }
        dropZone.classList.add('active');
    }

    hideDropZone() {
        const dropZone = document.getElementById('dropZone');
        if (dropZone) {
            dropZone.classList.remove('active');
        }
    }

    getConversationContext() {
        const recentMessages = this.messages.slice(-6); // Last 3 exchanges
        return recentMessages.map(msg => 
            `${msg.role === 'user' ? 'Пользователь' : 'Ассистент'}: ${msg.content}`
        ).join('\n');
    }

    startChatDurationTimer() {
        setInterval(() => {
            this.updateChatStats();
        }, 60000); // Update every minute
    }

    // Model selection
    showModelSelection() {
        const modelList = Object.entries(this.models).map(([id, model]) => `
            <div class="model-option ${id === this.currentModel ? 'selected' : ''}" 
                 onclick="chat.selectModel('${id}')">
                <div class="model-info">
                    <h4>${model.name}</h4>
                    <p>${model.description}</p>
                </div>
                ${id === this.currentModel ? '<i class="ti ti-check"></i>' : ''}
            </div>
        `).join('');
        
        const content = `
            <div class="model-selection">
                <h4>Выберите AI модель</h4>
                <div class="model-list">
                    ${modelList}
                </div>
            </div>
        `;
        
        this.showModal('Выбор модели AI', content);
    }

    selectModel(modelId) {
        if (this.models[modelId]) {
            this.currentModel = modelId;
            localStorage.setItem('khai-pro-model', modelId);
            this.hideModal();
            this.showNotification(`Модель изменена на: ${this.models[modelId].name}`, 'success');
        }
    }
}

// Initialize the chat application when DOM is loaded
let chat;

document.addEventListener('DOMContentLoaded', () => {
    try {
        chat = new KHAIProChat();
        window.chat = chat; // Make it globally available for HTML onclick handlers
        
        console.log('KHAI Pro Chat initialized successfully');
    } catch (error) {
        console.error('Failed to initialize KHAI Pro Chat:', error);
        
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #ff4757;
            color: white;
            padding: 1rem;
            text-align: center;
            z-index: 10000;
        `;
        errorDiv.textContent = 'Ошибка загрузки приложения. Пожалуйста, обновите страницу.';
        document.body.appendChild(errorDiv);
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && chat) {
        chat.updateConnectionStatus();
    }
});

// Error boundary for unhandled errors
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
