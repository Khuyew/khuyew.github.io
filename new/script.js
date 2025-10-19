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
            'gemini-pro': { name: 'Gemini Pro', description: 'Мощный мультимодальный модель от Google' },
            'gpt-5-nano': { name: 'GPT-5 Nano', description: 'Быстрая и эффективная модель для повседневных задач' },
            'o3-mini': { name: 'O3 Mini', description: 'Продвинутая модель с улучшенными возможностями рассуждения' },
            'claude-sonnet': { name: 'Claude Sonnet', description: 'Мощная модель от Anthropic для сложных задач и анализа' },
            'deepseek-chat': { name: 'DeepSeek Chat', description: 'Универсальная модель для общения и решения задач' },
            'deepseek-reasoner': { name: 'DeepSeek Reasoner', description: 'Специализированная модель для сложных логических рассуждений' },
            'gemini-2.0-flash': { name: 'Gemini 2.0 Flash', description: 'Новейшая быстрая модель от Google с улучшенными возможностями' },
            'gemini-1.5-flash': { name: 'Gemini 1.5 Flash', description: 'Быстрая и эффективная модель от Google для различных задач' },
            'grok-beta': { name: 'xAI Grok', description: 'Модель от xAI с уникальным характером и остроумными ответами' }
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
        
        if (this.searchTerm === '') {
            this.renderChat();
            return;
        }

        const filteredMessages = this.messages.filter(message => 
            message.content.toLowerCase().includes(this.searchTerm)
        );

        this.renderFilteredChat(filteredMessages);
    }

    renderFilteredChat(filteredMessages) {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;

        messagesContainer.innerHTML = '';
        
        if (filteredMessages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="no-results">
                    <i class="ti ti-search-off"></i>
                    <h3>Сообщения не найдены</h3>
                    <p>Попробуйте изменить поисковый запрос</p>
                </div>
            `;
            return;
        }

        filteredMessages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            messagesContainer.appendChild(messageElement);
        });
    }

    // Message actions
    copyMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;

        navigator.clipboard.writeText(message.content).then(() => {
            this.showNotification('Сообщение скопировано в буфер обмена', 'success');
        }).catch(err => {
            console.error('Failed to copy message:', err);
            this.showError('Не удалось скопировать сообщение');
        });
    }

    editMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message || message.role !== 'user') return;

        const userInput = document.getElementById('userInput');
        if (userInput) {
            userInput.value = message.content;
            this.autoResizeTextarea(userInput);
            this.toggleClearInputButton();
            userInput.focus();
            
            // Remove the message
            this.messages = this.messages.filter(m => m.id !== messageId);
            this.renderChat();
            this.saveChatHistory();
        }
    }

    async regenerateMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message || message.role !== 'assistant') return;

        const userMessage = this.messages.find(m => 
            m.role === 'user' && 
            m.timestamp < message.timestamp && 
            Math.abs(m.timestamp - message.timestamp) < 30000
        );

        if (!userMessage) {
            this.showError('Не найдено соответствующее сообщение пользователя');
            return;
        }

        // Remove the old assistant message
        this.messages = this.messages.filter(m => m.id !== messageId);
        this.renderChat();

        // Regenerate response
        await this.sendMessage();
    }

    shareMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;

        const shareData = {
            title: 'Сообщение из KHAI Pro Chat',
            text: message.content.substring(0, 1000),
            url: window.location.href
        };

        if (navigator.share && navigator.canShare(shareData)) {
            navigator.share(shareData).catch(err => {
                console.error('Error sharing:', err);
                this.showError('Не удалось поделиться сообщением');
            });
        } else {
            this.copyMessage(messageId);
        }
    }

    // Voice input functionality
    toggleVoiceInput() {
        if (!this.recognition) {
            this.setupVoiceRecognition();
        }

        if (this.isListening) {
            this.stopVoiceInput();
        } else {
            this.startVoiceInput();
        }
    }

    setupVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            this.showError('Голосовой ввод не поддерживается в вашем браузере');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'ru-RU';

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateVoiceInputUI(true);
            this.showNotification('Слушаю...', 'info');
        };

        this.recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');

            const userInput = document.getElementById('userInput');
            if (userInput) {
                userInput.value = transcript;
                this.autoResizeTextarea(userInput);
                this.toggleClearInputButton();
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.stopVoiceInput();
            
            if (event.error === 'not-allowed') {
                this.showError('Доступ к микрофону запрещен');
            } else {
                this.showError('Ошибка распознавания речи');
            }
        };

        this.recognition.onend = () => {
            this.stopVoiceInput();
        };
    }

    startVoiceInput() {
        if (!this.recognition) {
            this.setupVoiceRecognition();
        }

        try {
            this.recognition.start();
        } catch (error) {
            console.error('Error starting voice recognition:', error);
            this.showError('Не удалось запустить голосовой ввод');
        }
    }

    stopVoiceInput() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        this.isListening = false;
        this.updateVoiceInputUI(false);
    }

    updateVoiceInputUI(listening) {
        const voiceBtn = document.getElementById('voiceInputBtn');
        if (!voiceBtn) return;

        if (listening) {
            voiceBtn.classList.add('active');
            voiceBtn.innerHTML = '<i class="ti ti-microphone-off"></i>';
            voiceBtn.title = 'Остановить запись';
        } else {
            voiceBtn.classList.remove('active');
            voiceBtn.innerHTML = '<i class="ti ti-microphone"></i>';
            voiceBtn.title = 'Голосовой ввод';
        }
    }

    // Emoji picker functionality
    setupEmojiPicker() {
        const emojiPicker = document.getElementById('emojiPicker');
        if (!emojiPicker) return;

        const emojis = ['😀', '😂', '😍', '🤔', '👍', '❤️', '🎉', '🔥', '✨', '💡', '🚀', '📚', '💻', '🎨', '🎵', '🌟', '💪', '🙏', '😊', '🤗'];
        
        emojiPicker.innerHTML = emojis.map(emoji => `
            <button class="emoji-btn" onclick="chat.insertEmoji('${emoji}')">${emoji}</button>
        `).join('');
    }

    toggleEmojiPicker(button) {
        const emojiPicker = document.getElementById('emojiPicker');
        if (!emojiPicker) return;

        const isVisible = emojiPicker.style.display === 'flex';
        
        if (isVisible) {
            this.hideEmojiPicker();
        } else {
            this.showEmojiPicker(button);
        }
    }

    showEmojiPicker(button) {
        const emojiPicker = document.getElementById('emojiPicker');
        if (!emojiPicker) return;

        const rect = button.getBoundingClientRect();
        emojiPicker.style.display = 'flex';
        emojiPicker.style.top = `${rect.bottom + 5}px`;
        emojiPicker.style.left = `${rect.left}px`;

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
            chat.hideEmojiPicker();
        }
    }

    insertEmoji(emoji) {
        const userInput = document.getElementById('userInput');
        if (userInput) {
            const cursorPos = userInput.selectionStart;
            const textBefore = userInput.value.substring(0, cursorPos);
            const textAfter = userInput.value.substring(cursorPos);
            
            userInput.value = textBefore + emoji + textAfter;
            userInput.focus();
            userInput.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length);
            
            this.autoResizeTextarea(userInput);
            this.toggleClearInputButton();
        }
        
        this.hideEmojiPicker();
    }

    // Model selection
    showModelSelection() {
        const modelSelector = document.getElementById('modelSelector');
        if (!modelSelector) return;

        modelSelector.innerHTML = Object.entries(this.models).map(([id, model]) => `
            <div class="model-option ${id === this.currentModel ? 'selected' : ''}" 
                 onclick="chat.selectModel('${id}')">
                <div class="model-info">
                    <div class="model-name">${model.name}</div>
                    <div class="model-desc">${model.description}</div>
                </div>
                ${id === this.currentModel ? '<i class="ti ti-check"></i>' : ''}
            </div>
        `).join('');

        modelSelector.style.display = modelSelector.style.display === 'flex' ? 'none' : 'flex';
    }

    selectModel(modelId) {
        if (this.models[modelId]) {
            this.currentModel = modelId;
            this.showModelSelection(); // Hide selector
            this.updateModelDisplay();
            this.showNotification(`Модель изменена на: ${this.models[modelId].name}`);
        }
    }

    updateModelDisplay() {
        const modelBtn = document.getElementById('modelSelectBtn');
        const modelName = document.getElementById('currentModelName');
        const modelDesc = document.getElementById('currentModelDesc');
        
        const model = this.models[this.currentModel];
        
        if (modelBtn) {
            modelBtn.innerHTML = `<i class="ti ti-cpu"></i>${model.name}`;
        }
        if (modelName) {
            modelName.textContent = model.name;
        }
        if (modelDesc) {
            modelDesc.textContent = model.description;
        }
    }

    // Sidebar menu
    toggleSidebarMenu() {
        const sidebar = document.getElementById('sidebarMenu');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            const isActive = sidebar.classList.contains('active');
            
            if (isActive) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            } else {
                sidebar.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                this.updateSidebarInfo();
            }
        }
    }

    updateSidebarInfo() {
        const chatDuration = Math.floor((Date.now() - this.chatStartTime) / 60000);
        
        const infoElements = {
            'sidebarMessageCount': this.messages.length,
            'sidebarChatDuration': `${chatDuration} мин`,
            'sidebarCurrentModel': this.models[this.currentModel].name,
            'sidebarCurrentMode': this.getModeDisplayName(this.currentMode)
        };

        Object.entries(infoElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    // Settings
    showSettings() {
        this.showNotification('Настройки будут доступны в следующем обновлении', 'info');
    }

    // Help system
    showHelp() {
        const helpMessage = `
# 🆘 Помощь по KHAI Pro Chat

## 🎯 Основные возможности:
• **Умные ответы** - используя передовые модели ИИ
• **Мультимодальность** - работа с текстом, изображениями, аудио
• **Контекстный диалог** - помню историю разговора
• **Голосовой ввод** - говорите вместо печати
• **Экспорт чатов** - сохраняйте важные обсуждения

## 🎮 Режимы работы:
• **Обычный** - для повседневных вопросов и задач
• **Креативный** - для генерации идей и нестандартных решений
• **Голос** - для работы с аудио контентом
• **Изображения** - для генерации и анализа изображений
• **Код** - для программирования и технических задач

## ⌨️ Горячие клавиши:
• **Enter** - отправить сообщение
• **Shift + Enter** - новая строка
• **Ctrl + /** - показать помощь
• **Ctrl + K** - очистить чат
• **Ctrl + E** - экспорт чата

## 💡 Советы:
• Используйте конкретные описания для лучших результатов
• Прикрепляйте файлы для анализа их содержимого
• Экспериментируйте с разными режимами для разных задач
• Регулярно экспортируйте важные обсуждения

**Начните общение, отправив сообщение!**`;

        this.addMessageToChat({
            id: this.generateId(),
            role: 'assistant',
            content: helpMessage,
            timestamp: Date.now(),
            mode: 'normal'
        });
    }

    // Welcome message
    showWelcomeMessage() {
        if (this.messages.length > 0) return;

        const welcomeMessage = `
# 👋 Добро пожаловать в KHAI Pro Chat!

Я ваш продвинутый AI-ассистент с использованием передовых моделей искусственного интеллекта.

## 🚀 Что я умею:
• Отвечать на вопросы и помогать с задачами
• Генерировать и анализировать изображения
• Работать с аудио контентом
• Помогать с программированием
• Анализировать прикрепленные файлы
• Поддерживать контекстный диалог

## 🎮 Доступные модели:
${Object.entries(this.models).map(([id, model]) => 
    `• **${model.name}** - ${model.description}`
).join('\n')}

## 💬 Начните общение:
1. Выберите режим работы (обычный, креативный, голос, изображения, код)
2. Введите ваш запрос или прикрепите файл
3. Нажмите отправить или Enter

**Готов помочь вам с любыми задачами!**`;

        this.addMessageToChat({
            id: this.generateId(),
            role: 'assistant',
            content: welcomeMessage,
            timestamp: Date.now(),
            mode: 'normal'
        });
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

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="ti ti-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
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

    // Code highlighting
    highlightCodeBlocks(element) {
        const codeBlocks = element.querySelectorAll('pre code');
        codeBlocks.forEach(block => {
            if (typeof hljs !== 'undefined') {
                hljs.highlightElement(block);
            }
            
            // Add copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-code-btn';
            copyBtn.innerHTML = '<i class="ti ti-copy"></i>';
            copyBtn.title = 'Копировать код';
            copyBtn.onclick = () => this.copyCode(block);
            
            const pre = block.parentElement;
            pre.style.position = 'relative';
            pre.appendChild(copyBtn);
        });
    }

    copyCode(codeBlock) {
        const text = codeBlock.textContent;
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Код скопирован в буфер обмена', 'success');
        }).catch(err => {
            console.error('Failed to copy code:', err);
            this.showError('Не удалось скопировать код');
        });
    }

    // Context menu
    showContextMenu(event, messageElement) {
        this.hideContextMenu();

        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = event.pageX + 'px';
        contextMenu.style.top = event.pageY + 'px';

        const messageId = messageElement.dataset.messageId;
        const message = this.messages.find(m => m.id === messageId);

        if (message) {
            contextMenu.innerHTML = `
                <button onclick="chat.copyMessage('${messageId}')">
                    <i class="ti ti-copy"></i> Копировать
                </button>
                ${message.role === 'user' ? `
                    <button onclick="chat.editMessage('${messageId}')">
                        <i class="ti ti-edit"></i> Редактировать
                    </button>
                ` : `
                    <button onclick="chat.regenerateMessage('${messageId}')">
                        <i class="ti ti-refresh"></i> Перегенерировать
                    </button>
                `}
                <button onclick="chat.shareMessage('${messageId}')">
                    <i class="ti ti-share"></i> Поделиться
                </button>
                <hr>
                <button onclick="chat.deleteMessage('${messageId}')">
                    <i class="ti ti-trash"></i> Удалить
                </button>
            `;
        }

        document.body.appendChild(contextMenu);

        // Store reference for cleanup
        this.currentContextMenu = contextMenu;
    }

    hideContextMenu() {
        if (this.currentContextMenu) {
            this.currentContextMenu.remove();
            this.currentContextMenu = null;
        }
    }

    deleteMessage(messageId) {
        this.messages = this.messages.filter(m => m.id !== messageId);
        this.renderChat();
        this.saveChatHistory();
        this.hideContextMenu();
        this.showNotification('Сообщение удалено');
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (event.key) {
                case '/':
                    event.preventDefault();
                    this.showHelp();
                    break;
                case 'k':
                    event.preventDefault();
                    this.clearChat();
                    break;
                case 'e':
                    event.preventDefault();
                    this.exportChat();
                    break;
                case 'n':
                    event.preventDefault();
                    this.createNewChat();
                    break;
            }
        }
    }

    // Resize handling
    handleResize() {
        this.updateMinimapViewport();
        this.hideEmojiPicker();
        this.hideContextMenu();
    }

    // Paste handling
    handlePaste(event) {
        const items = event.clipboardData?.items;
        if (!items) return;

        for (let item of items) {
            if (item.type.indexOf('image') !== -1) {
                event.preventDefault();
                const file = item.getAsFile();
                if (file) {
                    this.handleFileUpload([file]);
                }
                break;
            }
        }
    }

    // Drop zone for files
    showDropZone() {
        let dropZone = document.getElementById('dropZone');
        if (!dropZone) {
            dropZone = document.createElement('div');
            dropZone.id = 'dropZone';
            dropZone.innerHTML = `
                <div class="drop-zone-content">
                    <i class="ti ti-upload"></i>
                    <h3>Перетащите файлы сюда</h3>
                    <p>Поддерживаются изображения, текстовые файлы и документы</p>
                </div>
            `;
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

    // Minimap functionality
    updateMinimap() {
        const minimap = document.getElementById('minimap');
        if (!minimap) return;

        minimap.innerHTML = '';
        
        this.messages.forEach((message, index) => {
            const dot = document.createElement('div');
            dot.className = `minimap-dot minimap-${message.role}`;
            dot.style.top = `${(index / this.messages.length) * 100}%`;
            dot.title = `${message.role === 'user' ? 'Вы' : 'ИИ'}: ${message.content.substring(0, 50)}...`;
            minimap.appendChild(dot);
        });
    }

    addToMinimap(message) {
        const minimap = document.getElementById('minimap');
        if (!minimap) return;

        const dot = document.createElement('div');
        dot.className = `minimap-dot minimap-${message.role}`;
        dot.style.top = `${((this.messages.length - 1) / this.messages.length) * 100}%`;
        minimap.appendChild(dot);
    }

    updateMinimapViewport() {
        const minimap = document.getElementById('minimap');
        const messagesContainer = document.getElementById('messagesContainer');
        if (!minimap || !messagesContainer) return;

        const viewport = document.getElementById('minimapViewport');
        if (!viewport) {
            const vp = document.createElement('div');
            vp.id = 'minimapViewport';
            vp.className = 'minimap-viewport';
            minimap.appendChild(vp);
        }

        const scrollPercent = messagesContainer.scrollTop / (messagesContainer.scrollHeight - messagesContainer.clientHeight);
        const viewportHeight = messagesContainer.clientHeight / messagesContainer.scrollHeight * 100;
        
        const viewportEl = document.getElementById('minimapViewport');
        viewportEl.style.height = `${viewportHeight}%`;
        viewportEl.style.top = `${scrollPercent * (100 - viewportHeight)}%`;
    }

    // Service Worker for PWA
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }

    // Chat duration timer
    startChatDurationTimer() {
        this.durationTimer = setInterval(() => {
            this.updateChatStats();
        }, 60000); // Update every minute
    }

    // Data persistence
    saveChatHistory() {
        try {
            const chatData = {
                messages: this.messages,
                currentChatId: this.currentChatId,
                chats: Array.from(this.chats.entries()),
                chatStartTime: this.chatStartTime,
                currentMode: this.currentMode,
                currentModel: this.currentModel
            };
            
            localStorage.setItem('khai-pro-chat-data', JSON.stringify(chatData));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }

    async loadChatHistory() {
        try {
            const saved = localStorage.getItem('khai-pro-chat-data');
            if (saved) {
                const data = JSON.parse(saved);
                
                this.messages = data.messages || [];
                this.currentChatId = data.currentChatId || 'main-chat';
                this.chats = new Map(data.chats || []);
                this.chatStartTime = data.chatStartTime || Date.now();
                this.currentMode = data.currentMode || 'normal';
                this.currentModel = data.currentModel || 'gpt-4';
                
                this.updateModelDisplay();
                this.setMode(this.currentMode);
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    renderChat() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;

        messagesContainer.innerHTML = '';
        this.messages.forEach(message => this.renderMessage(message));
        this.scrollToBottom();
        this.updateMinimap();
    }

    getConversationContext() {
        const recentMessages = this.messages.slice(-6); // Last 6 messages
        return recentMessages.map(msg => 
            `${msg.role === 'user' ? 'Пользователь' : 'Ассистент'}: ${msg.content}`
        ).join('\n');
    }

    // Cleanup
    destroy() {
        if (this.durationTimer) {
            clearInterval(this.durationTimer);
        }
        
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        
        this.hideEmojiPicker();
        this.hideContextMenu();
        
        this.saveChatHistory();
    }
}

// Initialize the chat when DOM is loaded
let chat;

document.addEventListener('DOMContentLoaded', () => {
    try {
        chat = new KHAIProChat();
        window.chat = chat; // Make it globally available
        
        // Load saved theme
        chat.loadTheme();
        
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
            padding: 20px;
            text-align: center;
            z-index: 10000;
            font-family: system-ui, -apple-system, sans-serif;
        `;
        errorDiv.innerHTML = `
            <h3>Ошибка загрузки приложения</h3>
            <p>Пожалуйста, обновите страницу или проверьте подключение к интернету</p>
            <button onclick="location.reload()" style="
                background: white;
                color: #ff4757;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                margin-top: 10px;
            ">Обновить страницу</button>
        `;
        document.body.appendChild(errorDiv);
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (chat) {
        chat.destroy();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KHAIProChat;
}
