// KHAI Pro Chat - Main Application Script
class KHAIChat {
    constructor() {
        this.currentModel = 'gpt-4';
        this.chatHistory = [];
        this.isGenerating = false;
        this.currentMode = 'chat';
        this.attachedFiles = [];
        this.isListening = false;
        this.recognition = null;
        this.synth = window.speechSynthesis;
        this.currentUtterance = null;
        this.isSpeaking = false;
        this.currentTheme = 'dark';
        this.isOnline = true;
        
        this.initializeApp();
        this.bindEvents();
        this.loadSettings();
        this.checkConnection();
    }

    initializeApp() {
        this.setupSpeechRecognition();
        this.renderModelSelector();
        this.updateUI();
        this.showNotification('KHAI — Чат с ИИ готов к работе!', 'success');
    }

    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'ru-RU';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateVoiceUI();
            };

            this.recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');
                this.updateInputText(transcript);
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
                this.updateVoiceUI();
                if (event.error !== 'no-speech') {
                    this.showNotification('Ошибка распознавания речи', 'error');
                }
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.updateVoiceUI();
            };
        }
    }

    bindEvents() {
        // Основные элементы управления
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.modelSelectBtn = document.getElementById('modelSelectBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.themeToggleBtn = document.getElementById('themeToggleBtn');
        this.sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        this.exportChatBtn = document.getElementById('exportChatBtn');
        this.newChatBtn = document.getElementById('newChatBtn');

        // Модальные окна
        this.modelModal = document.getElementById('modelModal');
        this.settingsModal = document.getElementById('settingsModal');
        this.aboutModal = document.getElementById('aboutModal');

        // Кнопки закрытия модальных окон
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal);
            });
        });

        // Клик вне модального окна
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal);
                }
            });
        });

        // Основные обработчики событий
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.messageInput.addEventListener('input', () => this.adjustTextareaHeight());

        // Обработчики кнопок управления
        this.modelSelectBtn.addEventListener('click', () => this.openModelModal());
        this.settingsBtn.addEventListener('click', () => this.openSettingsModal());
        this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        this.sidebarToggleBtn.addEventListener('click', () => this.toggleSidebar());
        this.clearChatBtn.addEventListener('click', () => this.clearChat());
        this.exportChatBtn.addEventListener('click', () => this.exportChat());
        this.newChatBtn.addEventListener('click', () => this.newChat());

        // Обработчики голосового ввода
        this.voiceInputBtn = document.getElementById('voiceInputBtn');
        this.voiceInputBtn.addEventListener('click', () => this.toggleVoiceInput());

        // Обработчики прикрепления файлов
        this.fileInputBtn = document.getElementById('fileInputBtn');
        this.fileInputBtn.addEventListener('click', () => this.triggerFileInput());
        
        this.imageInputBtn = document.getElementById('imageInputBtn');
        this.imageInputBtn.addEventListener('click', () => this.triggerImageInput());

        // Создаем скрытые input'ы для файлов
        this.createFileInputs();

        // Обработчики режимов
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setMode(e.target.dataset.mode));
        });

        // Обработчики быстрых действий
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickAction(e.target.dataset.action));
        });

        // Обработчики навигации мини-карты
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleNavigation(e.target.dataset.action));
        });

        // Обработчики выбора модели
        document.querySelectorAll('.model-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectModel(e.currentTarget.dataset.model);
            });
        });

        // Обработчики настроек
        document.getElementById('saveSettings').addEventListener('click', () => this.saveSettings());
        document.getElementById('aboutBtn').addEventListener('click', () => this.openAboutModal());

        // Обработчики поиска
        this.setupSearch();

        // Обработчики глобальных горячих клавиш
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Обработчики изменения размера окна
        window.addEventListener('resize', () => this.handleResize());

        // Проверка соединения
        setInterval(() => this.checkConnection(), 30000);
    }

    setupSearch() {
        const searchInput = document.getElementById('chatSearch');
        const searchClear = document.getElementById('searchClear');

        searchInput.addEventListener('input', (e) => {
            this.searchMessages(e.target.value);
            searchClear.style.display = e.target.value ? 'flex' : 'none';
        });

        searchClear.addEventListener('click', () => {
            searchInput.value = '';
            this.searchMessages('');
            searchClear.style.display = 'none';
        });
    }

    searchMessages(query) {
        const messages = this.messagesContainer.querySelectorAll('.message');
        const normalizedQuery = query.toLowerCase().trim();

        messages.forEach(message => {
            const content = message.querySelector('.message-content').textContent.toLowerCase();
            if (normalizedQuery && content.includes(normalizedQuery)) {
                message.style.backgroundColor = 'var(--accent-warning-alpha)';
                message.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                message.style.backgroundColor = '';
            }
        });
    }

    createFileInputs() {
        // Input для обычных файлов
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.multiple = true;
        this.fileInput.accept = '*/*';
        this.fileInput.style.display = 'none';
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        document.body.appendChild(this.fileInput);

        // Input для изображений
        this.imageInput = document.createElement('input');
        this.imageInput.type = 'file';
        this.imageInput.multiple = true;
        this.imageInput.accept = 'image/*';
        this.imageInput.style.display = 'none';
        this.imageInput.addEventListener('change', (e) => this.handleImageSelect(e));
        document.body.appendChild(this.imageInput);
    }

    triggerFileInput() {
        this.fileInput.click();
    }

    triggerImageInput() {
        this.imageInput.click();
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        files.forEach(file => this.attachFile(file));
        event.target.value = '';
    }

    handleImageSelect(event) {
        const files = Array.from(event.target.files);
        files.forEach(file => this.attachFile(file, true));
        event.target.value = '';
    }

    attachFile(file, isImage = false) {
        if (this.attachedFiles.length >= 5) {
            this.showNotification('Максимум 5 файлов', 'warning');
            return;
        }

        const fileId = Date.now().toString();
        this.attachedFiles.push({
            id: fileId,
            file: file,
            name: file.name,
            type: file.type,
            size: file.size,
            isImage: isImage
        });

        this.renderAttachedFiles();
        this.showNotification(`Файл "${file.name}" прикреплен`, 'success');
    }

    removeFile(fileId) {
        this.attachedFiles = this.attachedFiles.filter(f => f.id !== fileId);
        this.renderAttachedFiles();
    }

    renderAttachedFiles() {
        const container = document.getElementById('attachedFiles');
        container.innerHTML = '';

        this.attachedFiles.forEach(file => {
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            fileElement.innerHTML = `
                <i class="ti ti-file${file.isImage ? '-image' : ''}"></i>
                <span>${file.name}</span>
                <button class="remove-file" onclick="app.removeFile('${file.id}')">
                    <i class="ti ti-x"></i>
                </button>
            `;
            container.appendChild(fileElement);
        });
    }

    setMode(mode) {
        this.currentMode = mode;
        
        // Обновляем активную кнопку режима
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Обновляем индикатор режима
        const modeIndicator = document.getElementById('modeIndicator');
        const modeTexts = {
            'chat': 'Режим: Обычный чат',
            'creative': 'Режим: Креативный',
            'code': 'Режим: Программирование',
            'voice': 'Режим: Голосовой'
        };
        modeIndicator.textContent = modeTexts[mode] || modeTexts.chat;

        this.showNotification(`Режим изменен на: ${modeTexts[mode]}`, 'info');
    }

    handleQuickAction(action) {
        const actions = {
            'summarize': () => this.quickSummarize(),
            'translate': () => this.quickTranslate(),
            'explain': () => this.quickExplain(),
            'code': () => this.quickCode()
        };

        if (actions[action]) {
            actions[action]();
        }
    }

    quickSummarize() {
        if (this.chatHistory.length === 0) {
            this.showNotification('Нет сообщений для суммаризации', 'warning');
            return;
        }

        const lastMessages = this.chatHistory.slice(-4).map(msg => msg.content).join('\n');
        this.addMessage('user', `Пожалуйста, суммаризируй следующий разговор:\n\n${lastMessages}`);
        this.generateAIResponse();
    }

    quickTranslate() {
        this.addMessage('user', 'Пожалуйста, переведи мой предыдущий текст на английский язык');
        this.generateAIResponse();
    }

    quickExplain() {
        this.addMessage('user', 'Можешь подробнее объяснить эту тему?');
        this.generateAIResponse();
    }

    quickCode() {
        this.addMessage('user', 'Помоги написать код для этой задачи');
        this.generateAIResponse();
    }

    handleNavigation(action) {
        const messages = this.messagesContainer.querySelectorAll('.message');
        const currentActive = this.messagesContainer.querySelector('.message.active');
        let currentIndex = Array.from(messages).indexOf(currentActive);

        switch (action) {
            case 'prev':
                currentIndex = Math.max(0, currentIndex - 1);
                break;
            case 'next':
                currentIndex = Math.min(messages.length - 1, currentIndex + 1);
                break;
            case 'first':
                currentIndex = 0;
                break;
            case 'last':
                currentIndex = messages.length - 1;
                break;
        }

        if (messages[currentIndex]) {
            // Убираем активный класс у всех сообщений
            messages.forEach(msg => msg.classList.remove('active'));
            // Добавляем активный класс к текущему сообщению
            messages[currentIndex].classList.add('active');
            // Прокручиваем к сообщению
            messages[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    openModelModal() {
        this.openModal(this.modelModal);
    }

    openSettingsModal() {
        this.openModal(this.settingsModal);
    }

    openAboutModal() {
        this.openModal(this.aboutModal);
    }

    openModal(modal) {
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    selectModel(model) {
        this.currentModel = model;
        this.renderModelSelector();
        this.closeModal(this.modelModal);
        this.showNotification(`Модель изменена на: ${this.getModelName(model)}`, 'success');
    }

    getModelName(model) {
        const models = {
            'gpt-4': 'GPT-4',
            'gpt-3.5': 'GPT-3.5 Turbo',
            'claude-3': 'Claude 3',
            'gemini-pro': 'Gemini Pro',
            'llama-2': 'Llama 2',
            'mixtral': 'Mixtral 8x7B'
        };
        return models[model] || model;
    }

    getModelIcon(model) {
        const icons = {
            'gpt-4': 'ti-brain',
            'gpt-3.5': 'ti-flame',
            'claude-3': 'ti-cloud',
            'gemini-pro': 'ti-sparkles',
            'llama-2': 'ti-brand-google',
            'mixtral': 'ti-stars'
        };
        return icons[model] || 'ti-robot';
    }

    renderModelSelector() {
        const icon = this.modelSelectBtn.querySelector('.model-icon');
        icon.className = `model-icon ${this.getModelIcon(this.currentModel)}`;
        
        // Обновляем активные модели в модальном окне
        document.querySelectorAll('.model-option').forEach(option => {
            option.classList.toggle('active', option.dataset.model === this.currentModel);
        });
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

    updateVoiceUI() {
        const voiceBtn = document.getElementById('voiceInputBtn');
        if (this.isListening) {
            voiceBtn.classList.add('listening');
            voiceBtn.innerHTML = '<i class="ti ti-microphone-off"></i>';
        } else {
            voiceBtn.classList.remove('listening');
            voiceBtn.innerHTML = '<i class="ti ti-microphone"></i>';
        }
    }

    updateInputText(text) {
        this.messageInput.value = text;
        this.adjustTextareaHeight();
    }

    adjustTextareaHeight() {
        const textarea = this.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message && this.attachedFiles.length === 0) {
            this.showNotification('Введите сообщение или прикрепите файл', 'warning');
            return;
        }

        if (this.isGenerating) {
            this.stopGeneration();
            return;
        }

        // Добавляем сообщение пользователя
        this.addMessage('user', message);

        // Обрабатываем прикрепленные файлы
        if (this.attachedFiles.length > 0) {
            const fileInfo = this.attachedFiles.map(f => `[Файл: ${f.name}]`).join('\n');
            this.addMessage('user', fileInfo);
        }

        // Очищаем input и прикрепленные файлы
        this.messageInput.value = '';
        this.attachedFiles = [];
        this.renderAttachedFiles();
        this.adjustTextareaHeight();

        // Генерируем ответ ИИ
        await this.generateAIResponse();
    }

    addMessage(role, content, model = null) {
        const message = {
            id: Date.now().toString(),
            role,
            content,
            timestamp: new Date(),
            model: model || this.currentModel
        };

        this.chatHistory.push(message);
        this.renderMessage(message);
        this.updateChatStats();
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${message.role}`;
        messageElement.dataset.id = message.id;

        // Добавляем классы для разных режимов
        if (message.role === 'ai') {
            const modeClass = `message-${this.currentMode}`;
            messageElement.classList.add(modeClass);
        }

        const formattedTime = message.timestamp.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageElement.innerHTML = `
            <div class="message-content">${this.formatMessageContent(message.content)}</div>
            <div class="message-actions">
                <button class="action-btn" onclick="app.copyMessage('${message.id}')">
                    <i class="ti ti-copy"></i> Копировать
                </button>
                ${message.role === 'ai' ? `
                    <button class="action-btn speak-btn" onclick="app.speakMessage('${message.id}')">
                        <i class="ti ti-speakerphone"></i> Озвучить
                    </button>
                    <button class="action-btn" onclick="app.regenerateMessage('${message.id}')">
                        <i class="ti ti-refresh"></i> Перегенерировать
                    </button>
                ` : ''}
                <button class="action-btn-small" onclick="app.deleteMessage('${message.id}')">
                    <i class="ti ti-trash"></i>
                </button>
            </div>
            <div class="model-indicator">
                ${formattedTime} • ${message.role === 'ai' ? this.getModelName(message.model) : 'Вы'}
            </div>
        `;

        this.messagesContainer.appendChild(messageElement);
    }

    formatMessageContent(content) {
        // Простая обработка Markdown-like синтаксиса
        let formatted = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');

        // Обработка блоков кода
        formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, 
            '<div class="code-block"><div class="code-header"><span class="code-language">$1</span><button class="copy-code-btn" onclick="app.copyCode(this)"><i class="ti ti-copy"></i> Копировать</button></div><pre><code>$2</code></pre></div>');

        return formatted;
    }

    async generateAIResponse() {
        if (this.isGenerating) return;

        this.isGenerating = true;
        this.updateSendButton();

        // Показываем индикатор набора сообщения
        const typingIndicator = this.showTypingIndicator();

        try {
            // Имитация задержки сети
            await this.delay(1000 + Math.random() * 2000);

            // Генерируем ответ в зависимости от режима и модели
            const response = await this.generateMockResponse();
            
            // Убираем индикатор набора
            this.hideTypingIndicator(typingIndicator);

            // Добавляем сообщение ИИ
            this.addMessage('ai', response);

        } catch (error) {
            console.error('Error generating response:', error);
            this.hideTypingIndicator(typingIndicator);
            this.addMessage('ai', 'Извините, произошла ошибка при генерации ответа. Пожалуйста, попробуйте еще раз.', 'error');
        } finally {
            this.isGenerating = false;
            this.updateSendButton();
        }
    }

    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message message-ai streaming-message';
        indicator.innerHTML = `
            <div class="streaming-content">
                <div class="typing-indicator-inline">
                    <i class="ti ti-robot"></i>
                    <span>ИИ набирает сообщение...</span>
                </div>
            </div>
        `;
        this.messagesContainer.appendChild(indicator);
        this.scrollToBottom();
        return indicator;
    }

    hideTypingIndicator(indicator) {
        if (indicator && indicator.parentNode) {
            const typingElement = indicator.querySelector('.typing-indicator-inline');
            if (typingElement) {
                typingElement.classList.add('fade-out');
                setTimeout(() => {
                    indicator.remove();
                }, 300);
            }
        }
    }

    async generateMockResponse() {
        const lastUserMessage = this.chatHistory
            .filter(msg => msg.role === 'user')
            .pop()?.content || '';

        const responses = {
            'gpt-4': [
                "На основе вашего запроса, я могу предложить следующее: это инновационный подход, который сочетает в себе современные технологии и проверенные методики для достижения оптимального результата.",
                "Проанализировав предоставленную информацию, я пришел к выводу, что ключевым аспектом является системный подход к решению задачи с учетом всех возможных факторов влияния.",
                "Это интересный вопрос! Современные исследования показывают, что оптимальное решение требует комплексного анализа и учета множества переменных для достижения наилучшего результата."
            ],
            'gpt-3.5': [
                "Отличный вопрос! Я рекомендую рассмотреть несколько подходов к решению этой задачи, начиная с базовых принципов и постепенно переходя к более сложным аспектам.",
                "Исходя из моего опыта, наиболее эффективным решением будет комбинация проверенных методов и современных технологий для достижения поставленных целей.",
                "Спасибо за ваш запрос! Я подготовил подробный ответ, который охватывает все ключевые аспекты вашего вопроса и предлагает практические рекомендации."
            ],
            'claude-3': [
                "Анализируя ваш запрос, я выделил несколько ключевых моментов, которые требуют внимательного рассмотрения. Предлагаю начать с фундаментальных принципов.",
                "Это сложная задача, требующая многоуровневого подхода. Я разработал пошаговый план действий, который учитывает все нюансы вашего запроса.",
                "Основываясь на передовых исследованиях в этой области, я могу предложить решение, которое сочетает эффективность и практическую применимость."
            ],
            'gemini-pro': [
                "Интересная постановка задачи! Мой анализ показывает, что оптимальное решение требует интеграции нескольких дисциплин и применения междисциплинарного подхода.",
                "Рассматривая ваш вопрос с разных углов, я пришел к выводу, что наиболее перспективным является подход, основанный на данных и подтвержденный исследованиями.",
                "Благодарю за ваш запрос! Я подготовил комплексный ответ, который включает теоретическое обоснование и практические рекомендации для реализации."
            ],
            'llama-2': [
                "Основываясь на предоставленной информации, я предлагаю структурированный подход к решению вашей задачи с четким определением этапов и ожидаемых результатов.",
                "Это важный вопрос, который затрагивает несколько аспектов. Я разработал подробный план действий с учетом всех выявленных факторов влияния.",
                "Анализ вашего запроса показал, что наиболее эффективным будет решение, основанное на комбинации традиционных методов и инновационных подходов."
            ],
            'mixtral': [
                "Учитывая сложность задачи, я рекомендую поэтапный подход, который позволяет гибко адаптироваться к изменяющимся условиям и требованиям.",
                "Мой анализ выявил несколько потенциальных решений. Я подробно опишу каждое из них, включая преимущества и возможные ограничения.",
                "Это комплексный вопрос, требующий глубокого понимания предметной области. Я подготовил развернутый ответ с примерами и рекомендациями."
            ]
        };

        const modelResponses = responses[this.currentModel] || responses['gpt-4'];
        const randomResponse = modelResponses[Math.floor(Math.random() * modelResponses.length)];
        
        // Добавляем контекст в ответ
        if (lastUserMessage.toLowerCase().includes('суммар')) {
            return `Суммаризация предыдущего обсуждения:\n\n${randomResponse}\n\nКлючевые выводы:\n• Системный подход к решению\n• Учет всех факторов влияния\n• Практическая применимость`;
        }

        if (lastUserMessage.toLowerCase().includes('перевод')) {
            return `Перевод на английский:\n\n"${randomResponse}"\n\n->\n\n"Based on your request, I can suggest the following: this is an innovative approach that combines modern technologies and proven methodologies to achieve optimal results."`;
        }

        if (lastUserMessage.toLowerCase().includes('код')) {
            return `Вот пример кода для решения вашей задачи:\n\n\`\`\`javascript\nfunction solveProblem(data) {\n    // Анализ входных данных\n    const analysis = analyzeData(data);\n    \n    // Применение алгоритма\n    const result = applyAlgorithm(analysis);\n    \n    // Возврат результата\n    return optimizeResult(result);\n}\n\n// Вспомогательные функции\nfunction analyzeData(data) {\n    return data.filter(item => item.isRelevant)\n               .map(item => processItem(item));\n}\n\`\`\``;
        }

        return randomResponse;
    }

    stopGeneration() {
        this.isGenerating = false;
        this.updateSendButton();
        
        // Находим и удаляем индикатор набора
        const typingIndicator = this.messagesContainer.querySelector('.streaming-message');
        if (typingIndicator) {
            typingIndicator.remove();
        }

        this.showNotification('Генерация остановлена', 'warning');
    }

    updateSendButton() {
        if (this.isGenerating) {
            this.sendButton.innerHTML = '<i class="ti ti-square"></i>';
            this.sendButton.classList.add('stop-generation');
            this.sendButton.title = 'Остановить генерацию';
        } else {
            this.sendButton.innerHTML = '<i class="ti ti-send"></i>';
            this.sendButton.classList.remove('stop-generation');
            this.sendButton.title = 'Отправить сообщение';
        }
    }

    copyMessage(messageId) {
        const message = this.chatHistory.find(msg => msg.id === messageId);
        if (message) {
            navigator.clipboard.writeText(message.content)
                .then(() => this.showNotification('Сообщение скопировано', 'success'))
                .catch(() => this.showNotification('Ошибка копирования', 'error'));
        }
    }

    copyCode(button) {
        const codeBlock = button.closest('.code-block');
        const code = codeBlock.querySelector('code').textContent;
        
        navigator.clipboard.writeText(code)
            .then(() => {
                button.innerHTML = '<i class="ti ti-check"></i> Скопировано';
                button.classList.add('copied');
                setTimeout(() => {
                    button.innerHTML = '<i class="ti ti-copy"></i> Копировать';
                    button.classList.remove('copied');
                }, 2000);
            })
            .catch(() => this.showNotification('Ошибка копирования кода', 'error'));
    }

    async speakMessage(messageId) {
        const message = this.chatHistory.find(msg => msg.id === messageId);
        if (!message) return;

        if (this.isSpeaking) {
            this.synth.cancel();
            this.isSpeaking = false;
            this.updateSpeakButtons();
            return;
        }

        const utterance = new SpeechSynthesisUtterance(message.content);
        utterance.lang = 'ru-RU';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
            this.isSpeaking = true;
            this.currentUtterance = utterance;
            this.updateSpeakButtons();
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            this.currentUtterance = null;
            this.updateSpeakButtons();
        };

        utterance.onerror = () => {
            this.isSpeaking = false;
            this.currentUtterance = null;
            this.updateSpeakButtons();
            this.showNotification('Ошибка воспроизведения', 'error');
        };

        this.synth.speak(utterance);
    }

    updateSpeakButtons() {
        const speakButtons = document.querySelectorAll('.speak-btn');
        speakButtons.forEach(btn => {
            if (this.isSpeaking) {
                btn.innerHTML = '<i class="ti ti-player-pause"></i> Пауза';
                btn.classList.add('speaking');
            } else {
                btn.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить';
                btn.classList.remove('speaking');
            }
        });
    }

    regenerateMessage(messageId) {
        const messageIndex = this.chatHistory.findIndex(msg => msg.id === messageId);
        if (messageIndex === -1) return;

        // Удаляем сообщение ИИ и все последующие сообщения
        this.chatHistory = this.chatHistory.slice(0, messageIndex);
        
        // Перерисовываем сообщения
        this.messagesContainer.innerHTML = '';
        this.chatHistory.forEach(msg => this.renderMessage(msg));
        
        // Генерируем новый ответ
        this.generateAIResponse();
    }

    deleteMessage(messageId) {
        const messageIndex = this.chatHistory.findIndex(msg => msg.id === messageId);
        if (messageIndex === -1) return;

        this.chatHistory.splice(messageIndex, 1);
        
        // Перерисовываем сообщения
        this.messagesContainer.innerHTML = '';
        this.chatHistory.forEach(msg => this.renderMessage(msg));
        
        this.updateChatStats();
        this.showNotification('Сообщение удалено', 'success');
    }

    clearChat() {
        if (this.chatHistory.length === 0) {
            this.showNotification('Чат уже пуст', 'info');
            return;
        }

        if (confirm('Вы уверены, что хотите очистить всю историю чата?')) {
            this.chatHistory = [];
            this.messagesContainer.innerHTML = '';
            this.updateChatStats();
            this.showNotification('Чат очищен', 'success');
        }
    }

    newChat() {
        if (this.chatHistory.length > 0 && !confirm('Начать новый чат? Текущая история будет сохранена.')) {
            return;
        }

        // Сохраняем текущий чат (в реальном приложении здесь было бы сохранение в localStorage)
        const chatId = Date.now().toString();
        const chatData = {
            id: chatId,
            title: `Чат от ${new Date().toLocaleString('ru-RU')}`,
            messages: [...this.chatHistory],
            createdAt: new Date()
        };

        // Очищаем текущий чат
        this.chatHistory = [];
        this.messagesContainer.innerHTML = '';
        this.updateChatStats();
        
        this.showNotification('Новый чат создан', 'success');
    }

    exportChat() {
        if (this.chatHistory.length === 0) {
            this.showNotification('Нет сообщений для экспорта', 'warning');
            return;
        }

        const chatText = this.chatHistory.map(msg => {
            const role = msg.role === 'user' ? 'Вы' : 'ИИ';
            const time = msg.timestamp.toLocaleString('ru-RU');
            return `[${time}] ${role}: ${msg.content}`;
        }).join('\n\n');

        const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `KHAI-чат-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        this.showNotification('Чат экспортирован', 'success');
    }

    updateChatStats() {
        const userMessages = this.chatHistory.filter(msg => msg.role === 'user').length;
        const aiMessages = this.chatHistory.filter(msg => msg.role === 'ai').length;
        const totalChars = this.chatHistory.reduce((sum, msg) => sum + msg.content.length, 0);

        document.getElementById('userMessagesCount').textContent = userMessages;
        document.getElementById('aiMessagesCount').textContent = aiMessages;
        document.getElementById('totalCharsCount').textContent = totalChars.toLocaleString('ru-RU');
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.saveSettings();
        
        const themeIcon = this.themeToggleBtn.querySelector('i');
        themeIcon.className = this.currentTheme === 'dark' ? 'ti ti-moon' : 'ti ti-sun';
        
        this.showNotification(`Тема изменена на: ${this.currentTheme === 'dark' ? 'Тёмная' : 'Светлая'}`, 'info');
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.chat-sidebar');
        sidebar.classList.toggle('active');
        
        const sidebarIcon = this.sidebarToggleBtn.querySelector('i');
        if (sidebar.classList.contains('active')) {
            sidebarIcon.className = 'ti ti-layout-sidebar-right-collapse';
        } else {
            sidebarIcon.className = 'ti ti-layout-sidebar-right';
        }
    }

    checkConnection() {
        // Простая проверка соединения
        this.isOnline = navigator.onLine;
        
        const statusElement = document.querySelector('.connection-status');
        if (this.isOnline) {
            statusElement.textContent = 'Онлайн';
            statusElement.className = 'connection-status';
        } else {
            statusElement.textContent = 'Офлайн';
            statusElement.className = 'connection-status offline';
        }
    }

    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + K - фокус на поиск
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            document.getElementById('chatSearch').focus();
        }

        // Ctrl/Cmd + / - переключение темы
        if ((event.ctrlKey || event.metaKey) && event.key === '/') {
            event.preventDefault();
            this.toggleTheme();
        }

        // Escape - закрыть модальные окна
        if (event.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                this.closeModal(activeModal);
            }
        }
    }

    handleResize() {
        // Адаптация интерфейса при изменении размера окна
        this.adjustTextareaHeight();
    }

    showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="ti ti-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Показываем уведомление
        setTimeout(() => notification.classList.add('show'), 100);

        // Автоматическое скрытие
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'circle-check',
            'error': 'alert-circle',
            'warning': 'alert-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    loadSettings() {
        const savedTheme = localStorage.getItem('khai-theme');
        if (savedTheme) {
            this.currentTheme = savedTheme;
            document.documentElement.setAttribute('data-theme', this.currentTheme);
            
            const themeIcon = this.themeToggleBtn.querySelector('i');
            themeIcon.className = this.currentTheme === 'dark' ? 'ti ti-moon' : 'ti ti-sun';
        }

        const savedModel = localStorage.getItem('khai-model');
        if (savedModel) {
            this.currentModel = savedModel;
            this.renderModelSelector();
        }
    }

    saveSettings() {
        localStorage.setItem('khai-theme', this.currentTheme);
        localStorage.setItem('khai-model', this.currentModel);
        this.showNotification('Настройки сохранены', 'success');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Инициализация приложения когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    window.app = new KHAIChat();
});

// Регистрация Service Worker для PWA функциональности
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
