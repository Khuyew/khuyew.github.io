// KHAI - Первый белорусский ИИ чат
// Версия 2.5 - Полностью переработанный и оптимизированный

class KHAIChat {
    constructor() {
        this.currentChatId = 'default';
        this.chats = this.loadChats();
        this.isGenerating = false;
        this.isVoiceMode = false;
        this.currentSpeech = null;
        this.puterAI = null;
        this.deferredPrompt = null;
        
        this.initializeApp();
        this.bindEvents();
        this.initializePuterAI();
        this.checkPWAInstallable();
    }

    initializeApp() {
        this.loadTheme();
        this.loadCurrentChat();
        this.updateChatList();
        this.initializeTextarea();
        this.setupIntersectionObserver();
    }

    bindEvents() {
        // Основные элементы
        this.elements = {
            userInput: document.getElementById('userInput'),
            sendBtn: document.getElementById('sendBtn'),
            messagesContainer: document.getElementById('messagesContainer'),
            clearChatBtn: document.getElementById('clearChatBtn'),
            themeToggle: document.getElementById('themeToggle'),
            attachFileBtn: document.getElementById('attachFileBtn'),
            fileInput: document.getElementById('fileInput'),
            attachedFiles: document.getElementById('attachedFiles'),
            voiceInputBtn: document.getElementById('voiceInputBtn'),
            generateImageBtn: document.getElementById('generateImageBtn'),
            generateVoiceBtn: document.getElementById('generateVoiceBtn'),
            helpBtn: document.getElementById('helpBtn'),
            clearInputBtn: document.getElementById('clearInputBtn'),
            modelSelect: document.getElementById('modelSelect'),
            menuToggle: document.getElementById('menuToggle'),
            sidebarMenu: document.getElementById('sidebarMenu'),
            sidebarOverlay: document.getElementById('sidebarOverlay'),
            sidebarClose: document.getElementById('sidebarClose'),
            newChatBtn: document.getElementById('newChatBtn'),
            chatList: document.getElementById('chatList'),
            searchMessagesBtn: document.getElementById('searchMessagesBtn'),
            searchMessagesModal: document.getElementById('searchMessagesModal'),
            searchMessagesClose: document.getElementById('searchMessagesClose'),
            searchMessagesInput: document.getElementById('searchMessagesInput'),
            searchResults: document.getElementById('searchResults'),
            scrollToTopBtn: document.getElementById('scrollToTopBtn'),
            scrollToBottomBtn: document.getElementById('scrollToBottomBtn'),
            nextMessageBtn: document.getElementById('nextMessageBtn'),
            navigationControls: document.getElementById('navigationControls'),
            pwaPrompt: document.getElementById('pwaPrompt'),
            pwaInstall: document.getElementById('pwaInstall'),
            pwaDismiss: document.getElementById('pwaDismiss')
        };

        // Основные события
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.elements.userInput.addEventListener('keydown', (e) => this.handleInputKeydown(e));
        this.elements.clearChatBtn.addEventListener('click', () => this.clearChat());
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.elements.attachFileBtn.addEventListener('click', () => this.elements.fileInput.click());
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.elements.voiceInputBtn.addEventListener('click', () => this.toggleVoiceInput());
        this.elements.generateImageBtn.addEventListener('click', () => this.generateImage());
        this.elements.generateVoiceBtn.addEventListener('click', () => this.generateVoice());
        this.elements.helpBtn.addEventListener('click', () => this.showHelp());
        this.elements.clearInputBtn.addEventListener('click', () => this.clearInput());
        this.elements.modelSelect.addEventListener('change', () => this.saveSettings());
        this.elements.userInput.addEventListener('input', () => this.handleTextareaInput());

        // Навигация и меню
        this.elements.menuToggle.addEventListener('click', () => this.toggleSidebar());
        this.elements.sidebarOverlay.addEventListener('click', () => this.closeSidebar());
        this.elements.sidebarClose.addEventListener('click', () => this.closeSidebar());
        this.elements.newChatBtn.addEventListener('click', () => this.createNewChat());
        this.elements.searchMessagesBtn.addEventListener('click', () => this.openSearchModal());
        this.elements.searchMessagesClose.addEventListener('click', () => this.closeSearchModal());
        this.elements.searchMessagesInput.addEventListener('input', () => this.searchMessages());

        // Навигационные кнопки
        this.elements.scrollToTopBtn.addEventListener('click', () => this.scrollToTop());
        this.elements.scrollToBottomBtn.addEventListener('click', () => this.scrollToBottom());
        this.elements.nextMessageBtn.addEventListener('click', () => this.scrollToNextMessage());

        // PWA события
        this.elements.pwaInstall.addEventListener('click', () => this.installPWA());
        this.elements.pwaDismiss.addEventListener('click', () => this.dismissPWA());

        // Глобальные события
        window.addEventListener('beforeinstallprompt', (e) => this.handleInstallPrompt(e));
        window.addEventListener('scroll', () => this.handleScroll());
        document.addEventListener('click', (e) => this.handleGlobalClick(e));

        // Обработчики для копирования кода
        this.elements.messagesContainer.addEventListener('click', (e) => this.handleMessageClick(e));
    }

    initializePuterAI() {
        try {
            this.puterAI = window.puter;
            if (this.puterAI) {
                console.log('Puter AI SDK загружен успешно');
            }
        } catch (error) {
            console.error('Ошибка инициализации Puter AI:', error);
        }
    }

    // ===== УПРАВЛЕНИЕ ЧАТАМИ =====

    loadChats() {
        try {
            const saved = localStorage.getItem('khai-chats');
            if (saved) {
                const chats = JSON.parse(saved);
                // Убедимся, что есть хотя бы один чат
                if (!chats.default) {
                    chats.default = {
                        id: 'default',
                        name: 'Основной чат',
                        messages: [],
                        createdAt: new Date().toISOString()
                    };
                }
                return chats;
            }
        } catch (error) {
            console.error('Ошибка загрузки чатов:', error);
        }

        // Возвращаем чат по умолчанию
        return {
            default: {
                id: 'default',
                name: 'Основной чат',
                messages: [],
                createdAt: new Date().toISOString()
            }
        };
    }

    saveChats() {
        try {
            localStorage.setItem('khai-chats', JSON.stringify(this.chats));
        } catch (error) {
            console.error('Ошибка сохранения чатов:', error);
        }
    }

    loadCurrentChat() {
        const chat = this.chats[this.currentChatId];
        if (chat) {
            this.renderMessages(chat.messages);
            this.updateChatName(chat.name);
        }
    }

    createNewChat() {
        const chatId = 'chat_' + Date.now();
        const chatName = `Чат ${Object.keys(this.chats).length}`;
        
        this.chats[chatId] = {
            id: chatId,
            name: chatName,
            messages: [],
            createdAt: new Date().toISOString()
        };
        
        this.saveChats();
        this.switchToChat(chatId);
        this.closeSidebar();
    }

    switchToChat(chatId) {
        if (this.chats[chatId]) {
            this.currentChatId = chatId;
            this.loadCurrentChat();
            this.updateChatList();
            this.closeSidebar();
        }
    }

    updateChatList() {
        const chatList = this.elements.chatList;
        chatList.innerHTML = '';

        Object.values(this.chats)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .forEach(chat => {
                const chatItem = document.createElement('div');
                chatItem.className = `chat-item ${chat.id === this.currentChatId ? 'active' : ''}`;
                chatItem.innerHTML = `
                    <div class="chat-item-content">
                        <div class="chat-item-name">${this.escapeHtml(chat.name)}</div>
                        <div class="chat-item-preview">${this.getChatPreview(chat)}</div>
                    </div>
                    <div class="chat-item-actions">
                        <button class="chat-action-btn delete-chat" title="Удалить чат">
                            <i class="ti ti-trash"></i>
                        </button>
                    </div>
                `;

                chatItem.addEventListener('click', (e) => {
                    if (!e.target.closest('.chat-action-btn')) {
                        this.switchToChat(chat.id);
                    }
                });

                const deleteBtn = chatItem.querySelector('.delete-chat');
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteChat(chat.id);
                });

                chatList.appendChild(chatItem);
            });
    }

    getChatPreview(chat) {
        const lastMessage = chat.messages[chat.messages.length - 1];
        if (lastMessage) {
            const content = lastMessage.content.substring(0, 30);
            return this.escapeHtml(content) + (lastMessage.content.length > 30 ? '...' : '');
        }
        return 'Нет сообщений';
    }

    deleteChat(chatId) {
        if (Object.keys(this.chats).length <= 1) {
            this.showNotification('Нельзя удалить последний чат', 'error');
            return;
        }

        if (confirm('Вы уверены, что хотите удалить этот чат?')) {
            delete this.chats[chatId];
            this.saveChats();
            
            // Переключаемся на другой чат
            const remainingChats = Object.keys(this.chats);
            if (remainingChats.length > 0) {
                this.switchToChat(remainingChats[0]);
            }
            
            this.updateChatList();
            this.showNotification('Чат удален', 'success');
        }
    }

    // ===== ОБРАБОТКА СООБЩЕНИЙ =====

    async sendMessage() {
        const message = this.elements.userInput.value.trim();
        const files = Array.from(this.elements.fileInput.files);

        if (!message && files.length === 0) {
            this.showNotification('Введите сообщение или прикрепите файл', 'warning');
            return;
        }

        if (this.isGenerating) {
            this.showNotification('Подождите завершения предыдущего запроса', 'warning');
            return;
        }

        this.isGenerating = true;
        this.updateUIState();

        try {
            // Добавляем сообщение пользователя
            const userMessage = {
                id: 'msg_' + Date.now(),
                role: 'user',
                content: message,
                timestamp: new Date().toISOString(),
                files: files.length > 0 ? files.map(file => ({
                    name: file.name,
                    type: file.type,
                    size: file.size
                })) : []
            };

            this.addMessageToChat(userMessage);
            this.renderMessage(userMessage);
            this.clearInput();

            // Показываем индикатор набора текста
            this.showTypingIndicator();

            // Получаем ответ от ИИ
            const aiResponse = await this.getAIResponse(message, files);
            
            // Убираем индикатор набора текста
            this.hideTypingIndicator();

            // Добавляем ответ ИИ
            const aiMessage = {
                id: 'msg_' + Date.now(),
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date().toISOString(),
                model: this.elements.modelSelect.value
            };

            this.addMessageToChat(aiMessage);
            this.renderMessage(aiMessage);

        } catch (error) {
            console.error('Ошибка отправки сообщения:', error);
            this.hideTypingIndicator();
            this.showError('Ошибка отправки сообщения: ' + error.message);
        } finally {
            this.isGenerating = false;
            this.updateUIState();
            this.scrollToBottom();
        }
    }

    async getAIResponse(message, files) {
        // В реальном приложении здесь будет интеграция с AI API
        // Сейчас используем заглушку с разными ответами в зависимости от модели
        
        const model = this.elements.modelSelect.value;
        const responses = {
            'gpt-5-nano': `🤖 **GPT-5 Nano**: Я обработал ваш запрос "${message}" с помощью самой современной компактной модели. Результат оптимизирован для скорости и эффективности.`,
            'o3-mini': `🧠 **O3 Mini**: Проанализировав ваш запрос "${message}", я пришел к выводу, что требуется многоуровневое мышление. Вот комплексный ответ...`,
            'deepseek-chat': `🎯 **DeepSeek Chat**: На основе вашего вопроса "${message}" я подготовил детализированный ответ с акцентом на практическое применение.`,
            'deepseek-reasoner': `🔍 **DeepSeek Reasoner**: Путем логического анализа запроса "${message}" я выстроил цепочку рассуждений, ведущую к оптимальному решению.`,
            'gemini-2.0-flash': `⚡ **Gemini 2.0 Flash**: Молниеносная обработка запроса "${message}"! Вот самые релевантные и точные данные по вашему вопросу.`,
            'gemini-1.5-flash': `💎 **Gemini 1.5 Flash**: Используя расширенный контекст вашего запроса "${message}", я нашел наиболее подходящий ответ с учетом всех нюансов.`,
            'grok-beta': `😎 **Grok Beta**: Ох, интересный запрос "${message}"! Позвольте мне ответить с моим фирменным чувством юмора и глубоким пониманием темы.`
        };

        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        return responses[model] || `🤖 **AI**: Я получил ваше сообщение "${message}". В реальном приложении здесь будет ответ от выбранной AI модели.`;
    }

    addMessageToChat(message) {
        if (!this.chats[this.currentChatId]) {
            this.chats[this.currentChatId] = {
                id: this.currentChatId,
                name: 'Новый чат',
                messages: [],
                createdAt: new Date().toISOString()
            };
        }
        
        this.chats[this.currentChatId].messages.push(message);
        this.saveChats();
    }

    renderMessages(messages) {
        this.elements.messagesContainer.innerHTML = '';
        messages.forEach(message => this.renderMessage(message));
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${message.role}`;
        messageElement.id = message.id;

        let content = this.escapeHtml(message.content);
        
        // Обработка markdown
        if (message.role === 'assistant') {
            content = marked.parse(content);
        }

        messageElement.innerHTML = `
            <div class="message-content">
                ${content}
                ${message.files && message.files.length > 0 ? 
                    `<div class="message-files">
                        ${message.files.map(file => 
                            `<div class="file-attachment">📎 ${this.escapeHtml(file.name)}</div>`
                        ).join('')}
                    </div>` : ''}
                ${message.model ? `<div class="model-indicator">Модель: ${this.escapeHtml(message.model)}</div>` : ''}
            </div>
            <div class="message-actions">
                <button class="action-btn-small copy-btn" title="Копировать">
                    <i class="ti ti-copy"></i> Копировать
                </button>
                ${message.role === 'assistant' ? `
                    <button class="action-btn-small speak-btn" title="Озвучить">
                        <i class="ti ti-volume"></i> Озвучить
                    </button>
                ` : ''}
            </div>
        `;

        // Обработка синтаксиса кода
        messageElement.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
            
            // Добавляем заголовок с кнопкой копирования
            const pre = block.closest('pre');
            const language = block.className.match(/language-(\w+)/)?.[1] || 'text';
            
            const header = document.createElement('div');
            header.className = 'code-header';
            header.innerHTML = `
                <span class="code-language">${language}</span>
                <button class="copy-code-btn" title="Копировать код">
                    <i class="ti ti-copy"></i> Копировать
                </button>
            `;
            pre.insertBefore(header, pre.firstChild);
        });

        this.elements.messagesContainer.appendChild(messageElement);
        this.setupMessageActions(messageElement, message);
    }

    setupMessageActions(messageElement, message) {
        const copyBtn = messageElement.querySelector('.copy-btn');
        const speakBtn = messageElement.querySelector('.speak-btn');
        const copyCodeBtns = messageElement.querySelectorAll('.copy-code-btn');

        copyBtn?.addEventListener('click', () => {
            this.copyToClipboard(message.content);
            this.showNotification('Сообщение скопировано', 'success');
        });

        speakBtn?.addEventListener('click', () => {
            this.toggleSpeech(message);
        });

        copyCodeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const code = btn.closest('pre').querySelector('code').textContent;
                this.copyToClipboard(code);
                btn.innerHTML = '<i class="ti ti-check"></i> Скопировано';
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.innerHTML = '<i class="ti ti-copy"></i> Копировать';
                    btn.classList.remove('copied');
                }, 2000);
            });
        });
    }

    showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.className = 'typing-indicator';
        typingElement.id = 'typing-indicator';
        typingElement.innerHTML = `
            <div>ИИ печатает</div>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        this.elements.messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingElement = document.getElementById('typing-indicator');
        if (typingElement) {
            typingElement.remove();
        }
    }

    // ===== ОБРАБОТКА ВВОДА =====

    handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    handleTextareaInput() {
        const textarea = this.elements.userInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        
        // Показываем/скрываем кнопку очистки
        this.elements.clearInputBtn.style.display = textarea.value.trim() ? 'flex' : 'none';
    }

    clearInput() {
        this.elements.userInput.value = '';
        this.elements.fileInput.value = '';
        this.elements.attachedFiles.innerHTML = '';
        this.handleTextareaInput();
    }

    // ===== РАБОТА С ФАЙЛАМИ =====

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.displayAttachedFiles(files);
    }

    displayAttachedFiles(files) {
        this.elements.attachedFiles.innerHTML = '';
        
        files.forEach((file, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            fileElement.innerHTML = `
                <span>📎 ${this.escapeHtml(file.name)}</span>
                <button class="remove-file" data-index="${index}">
                    <i class="ti ti-x"></i>
                </button>
            `;
            
            this.elements.attachedFiles.appendChild(fileElement);
        });

        // Обработчики для кнопок удаления
        this.elements.attachedFiles.querySelectorAll('.remove-file').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.remove-file').dataset.index);
                this.removeFile(index);
            });
        });
    }

    removeFile(index) {
        const dt = new DataTransfer();
        const files = Array.from(this.elements.fileInput.files);
        
        files.splice(index, 1);
        files.forEach(file => dt.items.add(file));
        
        this.elements.fileInput.files = dt.files;
        this.displayAttachedFiles(Array.from(dt.files));
    }

    // ===== ГОЛОСОВОЙ ВВОД =====

    toggleVoiceInput() {
        if (this.isVoiceMode) {
            this.stopVoiceInput();
        } else {
            this.startVoiceInput();
        }
    }

    startVoiceInput() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showNotification('Голосовой ввод не поддерживается в вашем браузере', 'error');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'ru-RU';

        this.recognition.onstart = () => {
            this.isVoiceMode = true;
            this.elements.voiceInputBtn.classList.add('active');
            this.showNotification('Голосовой ввод активирован...', 'success');
        };

        this.recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    transcript += event.results[i][0].transcript;
                }
            }
            
            if (transcript) {
                this.elements.userInput.value += transcript + ' ';
                this.handleTextareaInput();
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Ошибка распознавания речи:', event.error);
            this.showNotification('Ошибка распознавания речи: ' + event.error, 'error');
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
        this.isVoiceMode = false;
        this.elements.voiceInputBtn.classList.remove('active');
    }

    // ===== ОЗВУЧКА ТЕКСТА =====

    async toggleSpeech(message) {
        const speakBtn = document.querySelector(`#${message.id} .speak-btn`);
        
        if (this.currentSpeech && !speakBtn.classList.contains('speaking')) {
            this.currentSpeech = null;
        }

        if (this.currentSpeech) {
            // Останавливаем текущую озвучку
            window.speechSynthesis.cancel();
            speakBtn.classList.remove('speaking');
            speakBtn.innerHTML = '<i class="ti ti-volume"></i> Озвучить';
            this.currentSpeech = null;
        } else {
            // Начинаем новую озвучку
            speakBtn.classList.add('speaking');
            speakBtn.innerHTML = '<i class="ti ti-square"></i> Остановить';
            
            await this.speakText(message.content);
        }
    }

    async speakText(text) {
        return new Promise((resolve) => {
            if (!('speechSynthesis' in window)) {
                this.showNotification('Озвучка текста не поддерживается', 'error');
                resolve();
                return;
            }

            // Останавливаем предыдущую речь
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ru-RU';
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 1;

            utterance.onend = () => {
                const speakBtn = document.querySelector('.speak-btn.speaking');
                if (speakBtn) {
                    speakBtn.classList.remove('speaking');
                    speakBtn.innerHTML = '<i class="ti ti-volume"></i> Озвучить';
                }
                this.currentSpeech = null;
                resolve();
            };

            utterance.onerror = (event) => {
                console.error('Ошибка озвучки:', event);
                this.showNotification('Ошибка озвучки текста', 'error');
                const speakBtn = document.querySelector('.speak-btn.speaking');
                if (speakBtn) {
                    speakBtn.classList.remove('speaking');
                    speakBtn.innerHTML = '<i class="ti ti-volume"></i> Озвучить';
                }
                this.currentSpeech = null;
                resolve();
            };

            this.currentSpeech = utterance;
            window.speechSynthesis.speak(utterance);
        });
    }

    // ===== ГЕНЕРАЦИЯ ИЗОБРАЖЕНИЙ И ГОЛОСА =====

    async generateImage() {
        const prompt = this.elements.userInput.value.trim();
        if (!prompt) {
            this.showNotification('Введите описание для генерации изображения', 'warning');
            return;
        }

        this.showNotification('Генерация изображения...', 'info');
        
        // Здесь будет интеграция с API генерации изображений
        // Временно используем заглушку
        setTimeout(() => {
            this.showNotification('Функция генерации изображений в разработке', 'info');
        }, 2000);
    }

    async generateVoice() {
        const text = this.elements.userInput.value.trim();
        if (!text) {
            this.showNotification('Введите текст для генерации голоса', 'warning');
            return;
        }

        this.showNotification('Генерация голоса...', 'info');
        
        // Здесь будет интеграция с API генерации голоса
        // Временно используем заглушку
        setTimeout(() => {
            this.showNotification('Функция генерации голоса в разработке', 'info');
        }, 2000);
    }

    // ===== ПОИСК ПО СООБЩЕНИЯМ =====

    openSearchModal() {
        this.elements.searchMessagesModal.classList.add('active');
        this.elements.searchMessagesInput.focus();
    }

    closeSearchModal() {
        this.elements.searchMessagesModal.classList.remove('active');
        this.elements.searchMessagesInput.value = '';
        this.elements.searchResults.innerHTML = '';
    }

    searchMessages() {
        const query = this.elements.searchMessagesInput.value.trim().toLowerCase();
        const resultsContainer = this.elements.searchResults;
        resultsContainer.innerHTML = '';

        if (!query) {
            return;
        }

        const currentChat = this.chats[this.currentChatId];
        if (!currentChat) return;

        const results = currentChat.messages.filter(message => 
            message.content.toLowerCase().includes(query)
        );

        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="search-result-item">Сообщения не найдены</div>';
            return;
        }

        results.forEach(message => {
            const resultElement = document.createElement('div');
            resultElement.className = 'search-result-item';
            resultElement.innerHTML = `
                <div class="search-result-content">
                    ${this.highlightText(this.escapeHtml(message.content), query)}
                </div>
                <div class="search-result-meta">
                    <span>${message.role === 'user' ? '👤 Вы' : '🤖 ИИ'}</span>
                    <span>${new Date(message.timestamp).toLocaleString()}</span>
                </div>
            `;

            resultElement.addEventListener('click', () => {
                this.scrollToMessage(message.id);
                this.closeSearchModal();
            });

            resultsContainer.appendChild(resultElement);
        });
    }

    highlightText(text, query) {
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    // ===== НАВИГАЦИЯ =====

    scrollToTop() {
        this.elements.messagesContainer.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    scrollToBottom() {
        this.elements.messagesContainer.scrollTo({
            top: this.elements.messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    }

    scrollToNextMessage() {
        const messages = this.elements.messagesContainer.querySelectorAll('.message');
        const container = this.elements.messagesContainer;
        const containerRect = container.getBoundingClientRect();
        
        for (let message of messages) {
            const messageRect = message.getBoundingClientRect();
            if (messageRect.bottom > containerRect.bottom) {
                message.scrollIntoView({ behavior: 'smooth', block: 'start' });
                break;
            }
        }
    }

    scrollToMessage(messageId) {
        const messageElement = document.getElementById(messageId);
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Подсвечиваем сообщение
            messageElement.style.animation = 'none';
            setTimeout(() => {
                messageElement.style.animation = 'gentlePulse 2s ease-in-out';
            }, 10);
            
            setTimeout(() => {
                messageElement.style.animation = '';
            }, 2000);
        }
    }

    handleScroll() {
        const container = this.elements.messagesContainer;
        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        
        // Показываем/скрываем кнопки навигации
        if (scrollHeight > clientHeight * 2) {
            this.elements.navigationControls.classList.remove('hidden');
        } else {
            this.elements.navigationControls.classList.add('hidden');
        }
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1
        });

        // Наблюдаем за сообщениями для ленивой загрузки
        setTimeout(() => {
            this.elements.messagesContainer.querySelectorAll('.message').forEach(message => {
                observer.observe(message);
            });
        }, 100);
    }

    // ===== САЙДБАР И НАСТРОЙКИ =====

    toggleSidebar() {
        this.elements.sidebarMenu.classList.toggle('active');
        this.elements.sidebarOverlay.classList.toggle('active');
        document.body.style.overflow = this.elements.sidebarMenu.classList.contains('active') ? 'hidden' : '';
    }

    closeSidebar() {
        this.elements.sidebarMenu.classList.remove('active');
        this.elements.sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ===== ТЕМА И НАСТРОЙКИ =====

    loadTheme() {
        const savedTheme = localStorage.getItem('khai-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('khai-theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = theme === 'light' ? 'ti ti-sun' : 'ti ti-moon';
    }

    saveSettings() {
        const settings = {
            model: this.elements.modelSelect.value,
            theme: document.documentElement.getAttribute('data-theme')
        };
        localStorage.setItem('khai-settings', JSON.stringify(settings));
    }

    // ===== PWA ФУНКЦИОНАЛЬНОСТЬ =====

    checkPWAInstallable() {
        // Проверяем, можно ли установить PWA
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('Приложение запущено в standalone режиме');
            return;
        }
    }

    handleInstallPrompt(e) {
        e.preventDefault();
        this.deferredPrompt = e;
        
        // Показываем prompt через 5 секунд после загрузки
        setTimeout(() => {
            if (this.deferredPrompt) {
                this.elements.pwaPrompt.style.display = 'block';
            }
        }, 5000);
    }

    async installPWA() {
        if (!this.deferredPrompt) {
            return;
        }

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            this.showNotification('Приложение успешно установлено!', 'success');
            this.elements.pwaPrompt.style.display = 'none';
        }
        
        this.deferredPrompt = null;
    }

    dismissPWA() {
        this.elements.pwaPrompt.style.display = 'none';
        // Не показываем снова в этой сессии
        this.deferredPrompt = null;
    }

    // ===== УТИЛИТЫ =====

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    copyToClipboard(text) {
        navigator.clipboard.writeText(text).catch(() => {
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        });
    }

    updateUIState() {
        const hasText = this.elements.userInput.value.trim().length > 0;
        const hasFiles = this.elements.fileInput.files.length > 0;
        
        this.elements.sendBtn.disabled = this.isGenerating || (!hasText && !hasFiles);
        
        if (this.isGenerating) {
            this.elements.sendBtn.innerHTML = '<i class="ti ti-loader"></i>';
            this.elements.sendBtn.classList.add('loading');
        } else {
            this.elements.sendBtn.innerHTML = '<i class="ti ti-send"></i>';
            this.elements.sendBtn.classList.remove('loading');
        }
    }

    updateChatName(name) {
        document.getElementById('currentChatName').textContent = name;
    }

    showNotification(message, type = 'info') {
        // Создаем уведомление
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="ti ti-${this.getNotificationIcon(type)}"></i>
                <span>${this.escapeHtml(message)}</span>
            </div>
        `;

        // Стили для уведомления
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-color);
            border-left: 4px solid var(--${type}-text);
            color: var(--text-primary);
            padding: 12px 16px;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Автоматическое скрытие
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
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

    showError(message) {
        const errorMessage = {
            id: 'msg_' + Date.now(),
            role: 'error',
            content: message,
            timestamp: new Date().toISOString()
        };
        
        this.renderMessage(errorMessage);
        this.scrollToBottom();
    }

    showHelp() {
        const helpMessage = `
## 🆘 Помощь по KHAI

### Основные функции:
- **💬 Чат с ИИ**: Общайтесь с различными AI-моделями
- **🖼️ Генерация изображений**: Создавайте изображения по описанию
- **🎤 Голосовой ввод**: Диктуйте сообщения голосом
- **🔊 Озвучка ответов**: Прослушивайте ответы ИИ
- **📎 Прикрепление файлов**: Отправляйте файлы в чат

### Горячие клавиши:
- **Enter**: Отправить сообщение
- **Shift + Enter**: Новая строка
- **Ctrl + /**: Поиск по сообщениям

### Поддерживаемые модели:
- GPT-5 Nano, O3 Mini, DeepSeek, Gemini, Grok и другие

Для получения дополнительной помощи обратитесь в документацию.
        `.trim();

        this.showNotification('Открыта справка по использованию', 'info');
        
        // Можно также показать справку в чате
        const helpMessageObj = {
            id: 'help_' + Date.now(),
            role: 'assistant',
            content: helpMessage,
            timestamp: new Date().toISOString(),
            model: 'help'
        };
        
        this.renderMessage(helpMessageObj);
        this.scrollToBottom();
    }

    clearChat() {
        if (confirm('Вы уверены, что хотите очистить историю чата?')) {
            if (this.chats[this.currentChatId]) {
                this.chats[this.currentChatId].messages = [];
                this.saveChats();
                this.renderMessages([]);
                this.showNotification('Чат очищен', 'success');
            }
        }
    }

    handleGlobalClick(e) {
        // Закрываем меню при клике вне его
        if (!e.target.closest('.sidebar-menu') && !e.target.closest('.menu-toggle')) {
            this.closeSidebar();
        }

        // Закрываем модальные окна при клике вне их
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    }

    handleMessageClick(e) {
        // Обработка кликов по сообщениям
        const target = e.target;
        
        // Обработка ссылок в сообщениях
        if (target.tagName === 'A' && target.href) {
            e.preventDefault();
            window.open(target.href, '_blank', 'noopener,noreferrer');
        }
    }
}

// Инициализация приложения когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    window.khaiApp = new KHAIChat();
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

// Обработка ошибок
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    e.preventDefault();
});
