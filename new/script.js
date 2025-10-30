// Main application script
class ChatApplication {
    constructor() {
        this.messages = [];
        this.currentModel = 'gpt-4o-mini';
        this.currentMode = 'text';
        this.isGenerating = false;
        this.attachedFiles = [];
        this.conversationHistory = [];
        this.currentConversationId = this.generateId();
        this.isSpeaking = false;
        this.currentAudio = null;
        this.searchTerm = '';
        this.searchResults = [];
        this.currentSearchIndex = -1;
        this.isSidebarOpen = false;
        this.isFullWidth = false;
        this.currentTheme = 'dark';
        
        this.modelConfigs = {
            'gpt-4o-mini': {
                name: 'GPT-4o Mini',
                description: 'Быстрая и эффективная модель для текста',
                provider: 'openai',
                type: 'text',
                icon: '🤖'
            },
            'gpt-4o-mini-tts': {
                name: 'GPT-4o Mini TTS',
                description: 'Модель для генерации речи',
                provider: 'openai',
                type: 'voice',
                icon: '🎤'
            },
            'gpt-image-1': {
                name: 'GPT Image',
                description: 'Модель для генерации изображений',
                provider: 'openai',
                type: 'image',
                icon: '🖼️'
            }
        };

        this.voiceConfigs = {
            'alloy': 'Alloy',
            'echo': 'Echo',
            'fable': 'Fable',
            'onyx': 'Onyx',
            'nova': 'Nova',
            'shimmer': 'Shimmer'
        };

        this.initializeApp();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    initializeApp() {
        this.initializePuter();
        this.loadSettings();
        this.bindEvents();
        this.renderModelOptions();
        this.renderThemeOptions();
        this.updateUI();
        this.hidePreloader();
    }

    initializePuter() {
        // Puter.js уже загружен через script tag в HTML
        console.log('Puter.js initialized');
    }

    loadSettings() {
        const savedModel = localStorage.getItem('currentModel');
        const savedTheme = localStorage.getItem('currentTheme');
        const savedHistory = localStorage.getItem('conversationHistory');
        const savedConversation = localStorage.getItem('currentConversation');

        if (savedModel && this.modelConfigs[savedModel]) {
            this.currentModel = savedModel;
        }

        if (savedTheme) {
            this.currentTheme = savedTheme;
            document.documentElement.setAttribute('data-theme', savedTheme);
        }

        if (savedHistory) {
            this.conversationHistory = JSON.parse(savedHistory);
            this.renderChatHistory();
        }

        if (savedConversation) {
            const conversation = JSON.parse(savedConversation);
            this.messages = conversation.messages || [];
            this.currentConversationId = conversation.id || this.generateId();
            this.renderMessages();
        }
    }

    saveSettings() {
        localStorage.setItem('currentModel', this.currentModel);
        localStorage.setItem('currentTheme', this.currentTheme);
        localStorage.setItem('conversationHistory', JSON.stringify(this.conversationHistory));
        
        const currentConversation = {
            id: this.currentConversationId,
            messages: this.messages,
            timestamp: Date.now()
        };
        localStorage.setItem('currentConversation', JSON.stringify(currentConversation));
    }

    bindEvents() {
        // Input events
        document.getElementById('userInput').addEventListener('input', (e) => {
            this.handleInput(e);
            this.adjustTextareaHeight(e.target);
        });

        document.getElementById('userInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        document.getElementById('sendButton').addEventListener('click', () => {
            this.sendMessage();
        });

        // File attachment
        document.getElementById('attachButton').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });

        // Mode buttons
        document.getElementById('voiceModeBtn').addEventListener('click', () => {
            this.toggleMode('voice');
        });

        document.getElementById('imageModeBtn').addEventListener('click', () => {
            this.toggleMode('image');
        });

        document.getElementById('textModeBtn').addEventListener('click', () => {
            this.toggleMode('text');
        });

        // Action buttons
        document.getElementById('clearChatBtn').addEventListener('click', () => {
            this.clearChat();
        });

        document.getElementById('exportChatBtn').addEventListener('click', () => {
            this.exportChat();
        });

        document.getElementById('searchToggleBtn').addEventListener('click', () => {
            this.toggleSearch();
        });

        // Header controls
        document.getElementById('menuToggle').addEventListener('click', () => {
            this.toggleSidebar();
        });

        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        document.getElementById('fullWidthToggle').addEventListener('click', () => {
            this.toggleFullWidth();
        });

        document.getElementById('modelSelectBtn').addEventListener('click', () => {
            this.toggleSidebar();
        });

        // Sidebar events
        document.getElementById('closeSidebar').addEventListener('click', () => {
            this.closeSidebar();
        });

        document.getElementById('newChatBtn').addEventListener('click', () => {
            this.startNewChat();
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettings();
        });

        // Search events
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        document.getElementById('searchClear').addEventListener('click', () => {
            this.clearSearch();
        });

        document.getElementById('sidebarSearchInput').addEventListener('input', (e) => {
            this.handleSidebarSearch(e.target.value);
        });

        document.getElementById('sidebarSearchClear').addEventListener('click', () => {
            this.clearSidebarSearch();
        });

        // Modal events
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('confirmClear').addEventListener('click', () => {
            this.confirmClear();
        });

        document.getElementById('cancelClear').addEventListener('click', () => {
            this.closeModal();
        });

        // Minimap navigation
        document.getElementById('scrollToTop').addEventListener('click', () => {
            this.scrollToTop();
        });

        document.getElementById('scrollToBottom').addEventListener('click', () => {
            this.scrollToBottom();
        });

        document.getElementById('toggleHeader').addEventListener('click', () => {
            this.toggleHeader();
        });

        document.getElementById('toggleInput').addEventListener('click', () => {
            this.toggleInput();
        });

        // Click outside sidebar to close
        document.addEventListener('click', (e) => {
            if (this.isSidebarOpen && !e.target.closest('.sidebar') && !e.target.closest('.menu-toggle')) {
                this.closeSidebar();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'k':
                        e.preventDefault();
                        this.toggleSearch();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.startNewChat();
                        break;
                    case 'm':
                        e.preventDefault();
                        this.toggleTheme();
                        break;
                    case 'f':
                        e.preventDefault();
                        this.toggleFullWidth();
                        break;
                }
            }

            if (e.key === 'Escape') {
                if (this.isSidebarOpen) {
                    this.closeSidebar();
                }
                if (this.isSpeaking) {
                    this.stopSpeaking();
                }
                if (this.isGenerating) {
                    this.stopGeneration();
                }
            }
        });

        // Handle visibility change for audio
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isSpeaking) {
                this.pauseSpeaking();
            }
        });

        // Handle beforeunload for cleanup
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        // Initialize minimap
        this.initializeMinimap();
    }

    handleInput(e) {
        const sendButton = document.getElementById('sendButton');
        const text = e.target.value.trim();
        
        if (text.length > 0 && !this.isGenerating) {
            sendButton.disabled = false;
            sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
            sendButton.classList.remove('stop-generation');
        } else if (this.isGenerating) {
            sendButton.disabled = false;
            sendButton.innerHTML = '<i class="fas fa-stop"></i>';
            sendButton.classList.add('stop-generation');
        } else {
            sendButton.disabled = true;
            sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
            sendButton.classList.remove('stop-generation');
        }
    }

    adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    async sendMessage() {
        const input = document.getElementById('userInput');
        const text = input.value.trim();

        if (!text && this.attachedFiles.length === 0) return;

        if (this.isGenerating) {
            this.stopGeneration();
            return;
        }

        // Add user message
        this.addMessage('user', text, this.attachedFiles);

        // Clear input and files
        input.value = '';
        input.style.height = 'auto';
        this.attachedFiles = [];
        this.renderAttachedFiles();
        this.updateSendButton();

        // Show typing indicator
        this.showTypingIndicator();

        try {
            this.isGenerating = true;
            this.updateSendButton();

            let response;
            
            // Автоматический выбор модели в зависимости от режима
            let modelToUse = this.currentModel;
            
            if (this.currentMode === 'voice') {
                modelToUse = 'gpt-4o-mini-tts';
            } else if (this.currentMode === 'image') {
                modelToUse = 'gpt-image-1';
            } else {
                modelToUse = 'gpt-4o-mini';
            }

            console.log(`Using model: ${modelToUse} for mode: ${this.currentMode}`);

            if (this.currentMode === 'image') {
                // Генерация изображения
                response = await this.generateImage(text);
            } else if (this.currentMode === 'voice') {
                // Генерация речи
                response = await this.generateSpeech(text);
            } else {
                // Текстовый ответ
                response = await this.generateText(text);
            }

            this.hideTypingIndicator();
            this.addMessage('ai', response, [], modelToUse);
            
        } catch (error) {
            console.error('Error generating response:', error);
            this.hideTypingIndicator();
            this.addMessage('error', `Ошибка: ${error.message}`);
        } finally {
            this.isGenerating = false;
            this.updateSendButton();
            this.saveSettings();
        }
    }

    async generateText(prompt) {
        try {
            // Используем Puter AI для текстовой генерации
            const response = await puter.ai.chat(
                prompt,
                {
                    model: this.currentModel,
                    provider: "openai"
                }
            );
            return response;
        } catch (error) {
            console.error('Text generation error:', error);
            throw new Error('Не удалось сгенерировать ответ. Пожалуйста, попробуйте еще раз.');
        }
    }

    async generateImage(prompt) {
        try {
            // Генерация изображения с помощью Puter AI
            const image = await puter.ai.txt2img(prompt, { 
                model: "gpt-image-1", 
                quality: "standard" 
            });
            
            // Создаем HTML для отображения изображения
            const imageHtml = `<div class="message-image">
                <img src="${image.src}" alt="${prompt}" />
                <div class="message-actions">
                    <button class="action-btn-small download-file-btn" onclick="app.downloadImage('${image.src}', '${prompt.replace(/[^a-zA-Z0-9]/g, '_')}')">
                        <i class="fas fa-download"></i> Скачать
                    </button>
                </div>
            </div>`;
            
            return `Вот сгенерированное изображение: "${prompt}"${imageHtml}`;
        } catch (error) {
            console.error('Image generation error:', error);
            throw new Error('Не удалось сгенерировать изображение. Пожалуйста, попробуйте другой запрос.');
        }
    }

    async generateSpeech(text) {
        try {
            // Генерация речи с помощью Puter AI
            const audio = await puter.ai.txt2speech(
                text,
                {
                    provider: "openai",
                    model: "gpt-4o-mini-tts",
                    voice: "alloy",
                    response_format: "mp3",
                    instructions: "Sound natural and clear."
                }
            );
            
            // Воспроизводим аудио
            await audio.play();
            
            return `Озвученный текст: "${text}"\n\nАудио воспроизводится автоматически.`;
            
        } catch (error) {
            console.error('Speech generation error:', error);
            throw new Error('Не удалось сгенерировать речь. Пожалуйста, проверьте настройки аудио.');
        }
    }

    addMessage(role, content, files = [], model = null) {
        const message = {
            id: this.generateId(),
            role,
            content,
            files: [...files],
            timestamp: Date.now(),
            model: model || this.currentModel
        };

        this.messages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
        this.updateMinimap();

        // Сохраняем в историю, если это сообщение AI или пользователя
        if (role === 'ai' || role === 'user') {
            this.saveToHistory();
        }
    }

    renderMessage(message) {
        const messagesContainer = document.getElementById('messagesContainer');
        
        // Удаляем индикатор набора, если он есть
        const typingIndicator = messagesContainer.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }

        const messageElement = this.createMessageElement(message);
        messagesContainer.appendChild(messageElement);
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${message.role}`;
        messageDiv.id = `message-${message.id}`;
        messageDiv.dataset.messageId = message.id;

        let content = message.content;

        // Обработка файлов
        if (message.files && message.files.length > 0) {
            const filesHtml = message.files.map(file => 
                `<div class="attached-file">
                    <img src="${file.preview}" alt="${file.name}">
                    <span>${file.name}</span>
                </div>`
            ).join('');
            content += filesHtml;
        }

        // Добавляем индикатор модели для AI сообщений
        if (message.role === 'ai' && message.model) {
            const modelConfig = this.modelConfigs[message.model];
            if (modelConfig) {
                content += `<div class="model-indicator">Сгенерировано с помощью: ${modelConfig.name}</div>`;
            }
        }

        // Обработка Markdown и кода
        content = this.formatMessageContent(content);

        messageDiv.innerHTML = content;

        // Добавляем действия для сообщений
        if (message.role === 'ai' && message.content) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            
            // Кнопка копирования
            const copyBtn = document.createElement('button');
            copyBtn.className = 'action-btn-small';
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Копировать';
            copyBtn.onclick = () => this.copyToClipboard(message.content);
            actionsDiv.appendChild(copyBtn);

            // Кнопка озвучки для текстовых сообщений
            if (this.currentMode !== 'voice') {
                const speakBtn = document.createElement('button');
                speakBtn.className = 'action-btn-small speak-btn';
                speakBtn.innerHTML = '<i class="fas fa-volume-up"></i> Озвучить';
                speakBtn.onclick = () => this.speakText(message.content);
                actionsDiv.appendChild(speakBtn);
            }

            messageDiv.appendChild(actionsDiv);
        }

        return messageDiv;
    }

    formatMessageContent(content) {
        // Простая обработка Markdown
        let formatted = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
                const language = lang || 'text';
                return `<pre><code class="language-${language}">${this.escapeHtml(code.trim())}</code></pre>`;
            })
            .replace(/\n/g, '<br>');

        // Обработка изображений в сообщении
        formatted = formatted.replace(/<div class="message-image">([\s\S]*?)<\/div>/g, '$1');

        return formatted;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('messagesContainer');
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.id = 'typingIndicator';
        typingIndicator.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <span>AI набирает ответ...</span>
        `;
        messagesContainer.appendChild(typingIndicator);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    updateSendButton() {
        const sendButton = document.getElementById('sendButton');
        const input = document.getElementById('userInput');
        const text = input.value.trim();

        if (this.isGenerating) {
            sendButton.disabled = false;
            sendButton.innerHTML = '<i class="fas fa-stop"></i>';
            sendButton.classList.add('stop-generation');
        } else if (text.length > 0 || this.attachedFiles.length > 0) {
            sendButton.disabled = false;
            sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
            sendButton.classList.remove('stop-generation');
        } else {
            sendButton.disabled = true;
            sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
            sendButton.classList.remove('stop-generation');
        }
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        
        files.forEach(file => {
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                this.showError('Файл слишком большой. Максимальный размер: 10MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                this.attachedFiles.push({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    preview: e.target.result,
                    file: file
                });
                this.renderAttachedFiles();
                this.updateSendButton();
            };
            reader.readAsDataURL(file);
        });

        event.target.value = '';
    }

    renderAttachedFiles() {
        const container = document.getElementById('attachedFiles');
        container.innerHTML = '';

        this.attachedFiles.forEach((file, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            fileElement.innerHTML = `
                <img src="${file.preview}" alt="${file.name}">
                <span>${file.name}</span>
                <button class="remove-file-btn" onclick="app.removeAttachedFile(${index})">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(fileElement);
        });
    }

    removeAttachedFile(index) {
        this.attachedFiles.splice(index, 1);
        this.renderAttachedFiles();
        this.updateSendButton();
    }

    toggleMode(mode) {
        this.currentMode = mode;
        
        // Обновляем активные кнопки
        document.getElementById('textModeBtn').classList.toggle('active', mode === 'text');
        document.getElementById('voiceModeBtn').classList.toggle('active', mode === 'voice');
        document.getElementById('imageModeBtn').classList.toggle('active', mode === 'image');
        
        // Обновляем индикатор режима
        const modeIndicator = document.getElementById('modeIndicator');
        const inputSection = document.getElementById('inputSection');
        
        // Удаляем предыдущие классы
        inputSection.classList.remove('voice-mode-active', 'image-mode-active');
        
        switch(mode) {
            case 'voice':
                modeIndicator.innerHTML = '<i class="fas fa-microphone"></i> Режим голоса';
                inputSection.classList.add('voice-mode-active');
                break;
            case 'image':
                modeIndicator.innerHTML = '<i class="fas fa-image"></i> Режим изображений';
                inputSection.classList.add('image-mode-active');
                break;
            default:
                modeIndicator.innerHTML = '<i class="fas fa-keyboard"></i> Текстовый режим';
        }
        
        // Автоматически выбираем соответствующую модель
        this.autoSelectModelForMode(mode);
        
        this.updateUI();
    }

    autoSelectModelForMode(mode) {
        let modelToSelect;
        
        switch(mode) {
            case 'voice':
                modelToSelect = 'gpt-4o-mini-tts';
                break;
            case 'image':
                modelToSelect = 'gpt-image-1';
                break;
            default:
                modelToSelect = 'gpt-4o-mini';
        }
        
        if (this.modelConfigs[modelToSelect]) {
            this.currentModel = modelToSelect;
            this.updateModelSelection();
            this.saveSettings();
        }
    }

    updateModelSelection() {
        // Обновляем кнопку выбора модели в хедере
        const modelSelectBtn = document.getElementById('modelSelectBtn');
        const modelConfig = this.modelConfigs[this.currentModel];
        
        if (modelConfig) {
            modelSelectBtn.innerHTML = `<i class="fas ${this.getModelIcon(this.currentModel)}"></i><span>${modelConfig.name}</span>`;
        }
        
        // Обновляем выбор в сайдбаре
        document.querySelectorAll('.model-option').forEach(option => {
            option.classList.toggle('selected', option.dataset.model === this.currentModel);
        });
    }

    getModelIcon(model) {
        const icons = {
            'gpt-4o-mini': 'fa-robot',
            'gpt-4o-mini-tts': 'fa-microphone',
            'gpt-image-1': 'fa-image'
        };
        return icons[model] || 'fa-robot';
    }

    renderModelOptions() {
        const container = document.getElementById('modelOptions');
        container.innerHTML = '';

        Object.entries(this.modelConfigs).forEach(([modelId, config]) => {
            const option = document.createElement('div');
            option.className = `model-option ${modelId === this.currentModel ? 'selected' : ''}`;
            option.dataset.model = modelId;
            option.innerHTML = `
                <div class="model-icon">${config.icon}</div>
                <div class="model-info">
                    <div class="model-name">${config.name}</div>
                    <div class="model-desc">${config.description}</div>
                </div>
            `;
            option.addEventListener('click', () => {
                this.selectModel(modelId);
            });
            container.appendChild(option);
        });
    }

    selectModel(modelId) {
        if (this.modelConfigs[modelId]) {
            this.currentModel = modelId;
            this.updateModelSelection();
            this.saveSettings();
            this.closeSidebar();
        }
    }

    renderThemeOptions() {
        const container = document.getElementById('themeOptions');
        container.innerHTML = '';

        const themes = [
            { id: 'dark', name: 'Темная' },
            { id: 'light', name: 'Светлая' }
        ];

        themes.forEach(theme => {
            const option = document.createElement('div');
            option.className = `theme-option ${theme.id === this.currentTheme ? 'selected' : ''}`;
            option.dataset.theme = theme.id;
            option.textContent = theme.name;
            option.addEventListener('click', () => {
                this.selectTheme(theme.id);
            });
            container.appendChild(option);
        });
    }

    selectTheme(themeId) {
        this.currentTheme = themeId;
        document.documentElement.setAttribute('data-theme', themeId);
        this.renderThemeOptions();
        this.saveSettings();
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.selectTheme(newTheme);
    }

    toggleFullWidth() {
        this.isFullWidth = !this.isFullWidth;
        document.getElementById('messagesContainer').classList.toggle('full-width', this.isFullWidth);
        document.getElementById('fullWidthToggle').classList.toggle('active', this.isFullWidth);
        this.updateMinimap();
    }

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
        document.getElementById('sidebar').classList.toggle('active', this.isSidebarOpen);
        
        if (this.isSidebarOpen) {
            this.renderChatHistory();
        }
    }

    closeSidebar() {
        this.isSidebarOpen = false;
        document.getElementById('sidebar').classList.remove('active');
    }

    startNewChat() {
        if (this.messages.length > 0) {
            this.saveToHistory();
        }
        
        this.messages = [];
        this.currentConversationId = this.generateId();
        this.renderMessages();
        this.closeSidebar();
        this.saveSettings();
    }

    clearChat() {
        this.showModal(
            'Очистить чат',
            'Вы уверены, что хотите очистить текущий чат? Это действие нельзя отменить.',
            'clear'
        );
    }

    confirmClear() {
        this.messages = [];
        this.renderMessages();
        this.closeModal();
        this.saveSettings();
    }

    exportChat() {
        const chatData = {
            id: this.currentConversationId,
            messages: this.messages,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chat-export-${this.currentConversationId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    showModal(title, message, type = 'info') {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalMessage').textContent = message;
        document.getElementById('modal').classList.add('active');
    }

    closeModal() {
        document.getElementById('modal').classList.remove('active');
    }

    renderMessages() {
        const container = document.getElementById('messagesContainer');
        container.innerHTML = '';
        
        this.messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            container.appendChild(messageElement);
        });
        
        this.scrollToBottom();
        this.updateMinimap();
    }

    scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        container.scrollTop = container.scrollHeight;
    }

    scrollToTop() {
        const container = document.getElementById('messagesContainer');
        container.scrollTop = 0;
    }

    toggleHeader() {
        document.getElementById('appHeader').classList.toggle('hidden');
        document.getElementById('toggleHeader').classList.toggle('active', 
            document.getElementById('appHeader').classList.contains('hidden'));
    }

    toggleInput() {
        document.getElementById('inputSection').classList.toggle('hidden');
        document.getElementById('toggleInput').classList.toggle('active', 
            document.getElementById('inputSection').classList.contains('hidden'));
    }

    initializeMinimap() {
        this.updateMinimap();
        
        // Обновляем мини-карту при изменении размера окна
        window.addEventListener('resize', () => {
            this.updateMinimap();
        });
    }

    updateMinimap() {
        const minimap = document.getElementById('chatMinimap');
        const minimapContent = document.getElementById('minimapContent');
        const messagesContainer = document.getElementById('messagesContainer');
        
        if (!minimap || !minimapContent) return;

        const messages = Array.from(messagesContainer.children);
        const totalHeight = messagesContainer.scrollHeight;
        const viewportHeight = messagesContainer.clientHeight;
        
        // Очищаем мини-карту
        minimapContent.innerHTML = '';
        
        // Создаем элементы мини-карты
        messages.forEach(message => {
            const messageHeight = message.offsetHeight;
            const heightPercent = (messageHeight / totalHeight) * 100;
            
            const minimapMessage = document.createElement('div');
            minimapMessage.className = `minimap-message ${message.classList.contains('message-user') ? 'user' : 
                                      message.classList.contains('message-ai') ? 'ai' : ''}`;
            minimapMessage.style.height = Math.max(heightPercent, 1) + '%';
            
            // Добавляем обработчик клика для навигации
            minimapMessage.addEventListener('click', () => {
                message.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
            
            minimapContent.appendChild(minimapMessage);
        });
        
        // Обновляем viewport indicator
        this.updateMinimapViewport();
        
        // Добавляем обработчик скролла
        messagesContainer.addEventListener('scroll', () => {
            this.updateMinimapViewport();
        });
    }

    updateMinimapViewport() {
        const minimapViewport = document.getElementById('minimapViewport');
        const messagesContainer = document.getElementById('messagesContainer');
        
        if (!minimapViewport) return;
        
        const scrollPercent = messagesContainer.scrollTop / messagesContainer.scrollHeight;
        const viewportPercent = messagesContainer.clientHeight / messagesContainer.scrollHeight;
        
        minimapViewport.style.top = (scrollPercent * 100) + '%';
        minimapViewport.style.height = (viewportPercent * 100) + '%';
    }

    handleSearch(term) {
        this.searchTerm = term.toLowerCase().trim();
        
        if (this.searchTerm === '') {
            this.clearSearch();
            return;
        }
        
        this.searchResults = [];
        const messages = document.querySelectorAll('.message');
        
        messages.forEach((message, index) => {
            const content = message.textContent.toLowerCase();
            if (content.includes(this.searchTerm)) {
                this.searchResults.push(index);
                message.classList.add('search-highlighted');
            } else {
                message.classList.remove('search-highlighted');
            }
        });
        
        this.currentSearchIndex = this.searchResults.length > 0 ? 0 : -1;
        this.highlightCurrentSearchResult();
    }

    highlightCurrentSearchResult() {
        // Убираем предыдущее выделение
        document.querySelectorAll('.search-highlighted').forEach(msg => {
            msg.classList.remove('search-current');
        });
        
        if (this.currentSearchIndex >= 0 && this.currentSearchIndex < this.searchResults.length) {
            const messages = document.querySelectorAll('.message');
            const currentIndex = this.searchResults[this.currentSearchIndex];
            const currentMessage = messages[currentIndex];
            
            currentMessage.classList.add('search-current');
            currentMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    clearSearch() {
        this.searchTerm = '';
        this.searchResults = [];
        this.currentSearchIndex = -1;
        
        document.querySelectorAll('.search-highlighted, .search-current').forEach(msg => {
            msg.classList.remove('search-highlighted', 'search-current');
        });
        
        document.getElementById('searchInput').value = '';
    }

    toggleSearch() {
        const searchContainer = document.getElementById('headerSearchContainer');
        const isVisible = searchContainer.style.display !== 'none';
        
        searchContainer.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            document.getElementById('searchInput').focus();
        }
    }

    handleSidebarSearch(term) {
        const historyItems = document.querySelectorAll('.history-item');
        const searchTerm = term.toLowerCase().trim();
        
        historyItems.forEach(item => {
            const text = item.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    clearSidebarSearch() {
        document.getElementById('sidebarSearchInput').value = '';
        const historyItems = document.querySelectorAll('.history-item');
        historyItems.forEach(item => {
            item.style.display = 'flex';
        });
    }

    renderChatHistory() {
        const container = document.getElementById('chatHistory');
        container.innerHTML = '';
        
        this.conversationHistory.forEach(conversation => {
            const firstMessage = conversation.messages[0];
            const preview = firstMessage ? firstMessage.content.substring(0, 50) + '...' : 'Пустой чат';
            
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div>${preview}</div>
                <small>${new Date(conversation.timestamp).toLocaleDateString()}</small>
            `;
            
            item.addEventListener('click', () => {
                this.loadConversation(conversation.id);
            });
            
            container.appendChild(item);
        });
    }

    saveToHistory() {
        const existingIndex = this.conversationHistory.findIndex(
            conv => conv.id === this.currentConversationId
        );
        
        const conversationData = {
            id: this.currentConversationId,
            messages: this.messages,
            timestamp: Date.now()
        };
        
        if (existingIndex >= 0) {
            this.conversationHistory[existingIndex] = conversationData;
        } else {
            this.conversationHistory.unshift(conversationData);
        }
        
        // Ограничиваем историю 50 последними чатами
        this.conversationHistory = this.conversationHistory.slice(0, 50);
        
        this.saveSettings();
    }

    loadConversation(conversationId) {
        const conversation = this.conversationHistory.find(conv => conv.id === conversationId);
        if (conversation) {
            this.messages = conversation.messages;
            this.currentConversationId = conversation.id;
            this.renderMessages();
            this.closeSidebar();
        }
    }

    async speakText(text) {
        if (this.isSpeaking) {
            this.stopSpeaking();
            return;
        }

        try {
            this.isSpeaking = true;
            
            // Обновляем кнопки озвучки
            document.querySelectorAll('.speak-btn').forEach(btn => {
                btn.classList.add('speaking');
                btn.innerHTML = '<i class="fas fa-stop"></i> Остановить';
            });

            // Генерация речи с помощью Puter AI
            this.currentAudio = await puter.ai.txt2speech(
                text,
                {
                    provider: "openai",
                    model: "gpt-4o-mini-tts",
                    voice: "alloy",
                    response_format: "mp3",
                    instructions: "Sound natural and clear."
                }
            );

            // Воспроизводим аудио
            await this.currentAudio.play();
            
            // Сбрасываем состояние после завершения воспроизведения
            this.currentAudio.onended = () => {
                this.stopSpeaking();
            };

        } catch (error) {
            console.error('Speech synthesis error:', error);
            this.showError('Ошибка воспроизведения аудио');
            this.stopSpeaking();
        }
    }

    stopSpeaking() {
        this.isSpeaking = false;
        
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
        
        // Обновляем кнопки озвучки
        document.querySelectorAll('.speak-btn').forEach(btn => {
            btn.classList.remove('speaking');
            btn.innerHTML = '<i class="fas fa-volume-up"></i> Озвучить';
        });
    }

    pauseSpeaking() {
        if (this.isSpeaking && this.currentAudio) {
            this.currentAudio.pause();
        }
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showSuccess('Текст скопирован в буфер обмена');
        } catch (err) {
            console.error('Failed to copy text: ', err);
            this.showError('Не удалось скопировать текст');
        }
    }

    async downloadImage(imageUrl, filename) {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename || 'image'}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            this.showError('Не удалось скачать изображение');
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Простая реализация уведомлений
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            z-index: 10000;
            max-width: 300px;
            word-wrap: break-word;
            background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4CAF50' : '#2196F3'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showSettings() {
        // Здесь можно добавить настройки приложения
        this.showModal('Настройки', 'Раздел настроек находится в разработке.');
    }

    hidePreloader() {
        setTimeout(() => {
            const preloader = document.getElementById('preloader');
            preloader.classList.add('fade-out');
            setTimeout(() => {
                preloader.remove();
            }, 500);
        }, 1000);
    }

    stopGeneration() {
        this.isGenerating = false;
        this.hideTypingIndicator();
        this.updateSendButton();
        this.addMessage('error', 'Генерация остановлена пользователем.');
    }

    updateUI() {
        this.updateModelSelection();
        this.updateSendButton();
    }

    cleanup() {
        this.stopSpeaking();
        this.saveSettings();
    }
}

// Инициализация приложения
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new ChatApplication();
});

// Глобальные функции для обработчиков событий в HTML
function handleImageDownload(imageUrl, filename) {
    if (app) {
        app.downloadImage(imageUrl, filename);
    }
}
