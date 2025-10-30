// KHAI Assistant - Production Ready JavaScript
class KHAIAssistant {
    constructor() {
        this.currentChat = 'default';
        this.chats = {};
        this.currentModel = 'gpt-4';
        this.isGenerating = false;
        this.isSidebarOpen = false;
        this.isModalOpen = false;
        this.currentModal = null;
        this.isSearchActive = false;
        this.searchResults = [];
        this.currentSearchIndex = -1;
        this.isCleanScreenMode = false;
        this.isFullWidthMode = false;
        this.isHeaderHidden = false;
        this.isFooterHidden = false;
        this.isInputHidden = false;
        this.isTyping = false;
        this.typingTimeout = null;
        this.currentTheme = 'dark';
        this.isGuideCompleted = localStorage.getItem('khai_guide_completed') === 'true';
        this.isWelcomeCompleted = localStorage.getItem('khai_welcome_completed') === 'true';
        this.voiceSynthesis = null;
        this.isSpeaking = false;
        this.currentUtterance = null;
        
        this.models = {
            'gpt-4': {
                name: 'GPT-4',
                description: 'Самый продвинутый модель с расширенными возможностями',
                maxTokens: 8192
            },
            'gpt-3.5-turbo': {
                name: 'GPT-3.5 Turbo',
                description: 'Быстрый и эффективный для большинства задач',
                maxTokens: 4096
            },
            'claude-3': {
                name: 'Claude 3',
                description: 'От Anthropic с улучшенным пониманием контекста',
                maxTokens: 8192
            }
        };

        this.settings = {
            autoScroll: true,
            showTimestamps: false,
            compactMode: false,
            developerMode: false
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadChats();
        this.applyTheme();
        this.showWelcomeIfNeeded();
        this.renderChatList();
        this.setupServiceWorker();
        this.setupIntersectionObserver();
        
        // Загрузка состояния интерфейса
        this.loadInterfaceState();
        
        // Инициализация голосового синтеза
        this.initVoiceSynthesis();
        
        console.log('KHAI Assistant initialized');
    }

    setupEventListeners() {
        // Основные элементы управления
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('userInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Навигация
        document.getElementById('menuToggle').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('closeSidebar').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('newChatBtn').addEventListener('click', () => this.createNewChat());
        document.getElementById('clearChatBtn').addEventListener('click', () => this.clearCurrentChat());
        document.getElementById('searchChatBtn').addEventListener('click', () => this.toggleSearch());
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('guideBtn').addEventListener('click', () => this.showGuide());

        // Модальные окна
        document.getElementById('overlay').addEventListener('click', () => this.closeAllModals());
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());

        // Поиск
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.getElementById('searchInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.navigateToNextSearchResult();
            if (e.key === 'Escape') this.clearSearch();
        });
        document.getElementById('searchClear').addEventListener('click', () => this.clearSearch());

        // Режимы отображения
        document.getElementById('cleanScreenBtn').addEventListener('click', () => this.toggleCleanScreenMode());
        document.getElementById('fullWidthBtn').addEventListener('click', () => this.toggleFullWidthMode());
        document.getElementById('hideInterfaceBtn').addEventListener('click', () => this.toggleInterfaceVisibility());

        // Навигация по мини-карте
        document.getElementById('scrollToTop').addEventListener('click', () => this.scrollToTop());
        document.getElementById('scrollToBottom').addEventListener('click', () => this.scrollToBottom());
        document.getElementById('prevMessage').addEventListener('click', () => this.navigateToPrevMessage());
        document.getElementById('nextMessage').addEventListener('click', () => this.navigateToNextMessage());

        // Прикрепление файлов
        document.getElementById('attachBtn').addEventListener('click', () => this.handleFileAttach());
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileSelect(e));

        // Режимы генерации
        document.getElementById('generateVoiceBtn').addEventListener('click', () => this.toggleVoiceGeneration());
        document.getElementById('generateImageBtn').addEventListener('click', () => this.toggleImageGeneration());

        // Обработка изменения размера окна
        window.addEventListener('resize', () => this.handleResize());
        
        // Обработка скролла
        document.getElementById('messagesContainer').addEventListener('scroll', () => this.handleScroll());

        // Предотвращение стандартного поведения для некоторых элементов
        document.addEventListener('touchmove', (e) => {
            if (e.target.tagName === 'TEXTAREA') return;
            e.preventDefault();
        }, { passive: false });

        // Обработка жестов
        this.setupTouchGestures();

        // Service Worker события
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'CACHE_UPDATED') {
                    this.showToast('Приложение обновлено', 'success');
                }
            });
        }
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered: ', registration);
                    
                    // Проверка обновлений
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                this.showToast('Доступно обновление', 'info');
                            }
                        });
                    });
                })
                .catch(error => {
                    console.log('SW registration failed: ', error);
                });
        }
    }

    setupIntersectionObserver() {
        // Для ленивой загрузки изображений и анимаций
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        // Наблюдаем за всеми сообщениями
        document.querySelectorAll('.message').forEach(message => {
            observer.observe(message);
        });
    }

    setupTouchGestures() {
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let currentY = 0;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchmove', (e) => {
            if (e.touches.length !== 1) return;
            
            currentX = e.touches[0].clientX;
            currentY = e.touches[0].clientY;
            
            const diffX = startX - currentX;
            const diffY = startY - currentY;
            
            // Горизонтальный свайп для открытия/закрытия сайдбара
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0 && !this.isSidebarOpen) {
                    this.toggleSidebar();
                } else if (diffX < 0 && this.isSidebarOpen) {
                    this.toggleSidebar();
                }
            }
            
            // Вертикальный свайп для скрытия/показа интерфейса
            if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 100) {
                if (diffY > 0 && !this.isHeaderHidden) {
                    this.hideInterface();
                } else if (diffY < 0 && this.isHeaderHidden) {
                    this.showInterface();
                }
            }
        });
    }

    loadInterfaceState() {
        const savedState = localStorage.getItem('khai_interface_state');
        if (savedState) {
            const state = JSON.parse(savedState);
            this.isCleanScreenMode = state.cleanScreen || false;
            this.isFullWidthMode = state.fullWidth || false;
            this.isHeaderHidden = state.headerHidden || false;
            this.isFooterHidden = state.footerHidden || false;
            this.isInputHidden = state.inputHidden || false;
            
            this.applyInterfaceState();
        }
    }

    saveInterfaceState() {
        const state = {
            cleanScreen: this.isCleanScreenMode,
            fullWidth: this.isFullWidthMode,
            headerHidden: this.isHeaderHidden,
            footerHidden: this.isFooterHidden,
            inputHidden: this.isInputHidden
        };
        localStorage.setItem('khai_interface_state', JSON.stringify(state));
    }

    applyInterfaceState() {
        const messagesContainer = document.getElementById('messagesContainer');
        const header = document.querySelector('.app-header');
        const footer = document.querySelector('.app-footer');
        const inputSection = document.querySelector('.input-section');
        
        if (this.isCleanScreenMode) {
            messagesContainer.classList.add('clean-screen');
            document.getElementById('cleanScreenBtn').classList.add('active');
        } else {
            messagesContainer.classList.remove('clean-screen');
            document.getElementById('cleanScreenBtn').classList.remove('active');
        }
        
        if (this.isFullWidthMode) {
            messagesContainer.classList.add('full-width');
            document.getElementById('fullWidthBtn').classList.add('active');
        } else {
            messagesContainer.classList.remove('full-width');
            document.getElementById('fullWidthBtn').classList.remove('active');
        }
        
        if (this.isHeaderHidden) {
            header.classList.add('hidden');
        } else {
            header.classList.remove('hidden');
        }
        
        if (this.isFooterHidden) {
            footer.classList.add('hidden');
        } else {
            footer.classList.remove('hidden');
        }
        
        if (this.isInputHidden) {
            inputSection.classList.add('hidden');
        } else {
            inputSection.classList.remove('hidden');
        }
    }

    toggleCleanScreenMode() {
        this.isCleanScreenMode = !this.isCleanScreenMode;
        this.applyInterfaceState();
        this.saveInterfaceState();
        this.updateMinimap();
    }

    toggleFullWidthMode() {
        this.isFullWidthMode = !this.isFullWidthMode;
        this.applyInterfaceState();
        this.saveInterfaceState();
        this.updateMinimap();
    }

    toggleInterfaceVisibility() {
        const isAnyHidden = this.isHeaderHidden || this.isFooterHidden || this.isInputHidden;
        
        if (isAnyHidden) {
            this.showInterface();
        } else {
            this.hideInterface();
        }
        
        this.saveInterfaceState();
    }

    hideInterface() {
        this.isHeaderHidden = true;
        this.isFooterHidden = true;
        this.isInputHidden = true;
        this.applyInterfaceState();
        document.getElementById('hideInterfaceBtn').classList.add('active');
    }

    showInterface() {
        this.isHeaderHidden = false;
        this.isFooterHidden = false;
        this.isInputHidden = false;
        this.applyInterfaceState();
        document.getElementById('hideInterfaceBtn').classList.remove('active');
    }

    handleResize() {
        this.updateMinimap();
        this.adjustTextareaHeight();
    }

    handleScroll() {
        this.updateMinimapViewport();
        this.handleScrollEffects();
    }

    handleScrollEffects() {
        const messagesContainer = document.getElementById('messagesContainer');
        const scrollTop = messagesContainer.scrollTop;
        const scrollHeight = messagesContainer.scrollHeight;
        const clientHeight = messagesContainer.clientHeight;
        
        // Эффект параллакса для фона
        if (scrollTop > 100) {
            document.body.style.setProperty('--bg-scroll-offset', `${scrollTop * 0.1}px`);
        }
        
        // Авто-скролл для новых сообщений
        if (this.settings.autoScroll && scrollHeight - scrollTop - clientHeight < 100) {
            this.scrollToBottom();
        }
    }

    adjustTextareaHeight() {
        const textarea = document.getElementById('userInput');
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    // Функции для работы с чатами
    createNewChat() {
        const chatId = 'chat_' + Date.now();
        this.currentChat = chatId;
        this.chats[chatId] = {
            id: chatId,
            name: 'Новый чат',
            messages: [],
            createdAt: new Date().toISOString(),
            model: this.currentModel
        };
        
        this.saveChats();
        this.renderChatList();
        this.renderMessages();
        this.toggleSidebar();
        
        this.showToast('Новый чат создан', 'success');
    }

    switchChat(chatId) {
        if (this.chats[chatId]) {
            this.currentChat = chatId;
            this.renderMessages();
            this.toggleSidebar();
            this.updateMinimap();
        }
    }

    deleteChat(chatId) {
        if (Object.keys(this.chats).length <= 1) {
            this.showToast('Нельзя удалить последний чат', 'error');
            return;
        }
        
        if (confirm('Вы уверены, что хотите удалить этот чат?')) {
            delete this.chats[chatId];
            
            if (this.currentChat === chatId) {
                const remainingChats = Object.keys(this.chats);
                this.currentChat = remainingChats[0];
            }
            
            this.saveChats();
            this.renderChatList();
            this.renderMessages();
            
            this.showToast('Чат удален', 'success');
        }
    }

    clearCurrentChat() {
        if (this.chats[this.currentChat] && this.chats[this.currentChat].messages.length > 0) {
            if (confirm('Вы уверены, что хотите очистить текущий чат?')) {
                this.chats[this.currentChat].messages = [];
                this.saveChats();
                this.renderMessages();
                this.updateMinimap();
                
                this.showToast('Чат очищен', 'success');
            }
        }
    }

    // Функции для работы с сообщениями
    async sendMessage() {
        const input = document.getElementById('userInput');
        const message = input.value.trim();
        
        if (!message || this.isGenerating) return;
        
        // Добавляем сообщение пользователя
        this.addMessage('user', message);
        input.value = '';
        this.adjustTextareaHeight();
        
        // Показываем индикатор набора
        this.showTypingIndicator();
        
        // Имитируем задержку ответа
        this.isGenerating = true;
        this.updateSendButton();
        
        try {
            // Имитация API вызова
            const response = await this.simulateAIResponse(message);
            
            // Убираем индикатор набора
            this.hideTypingIndicator();
            
            // Добавляем ответ AI
            this.addMessage('ai', response);
            
            this.isGenerating = false;
            this.updateSendButton();
            
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('error', 'Произошла ошибка при генерации ответа');
            this.isGenerating = false;
            this.updateSendButton();
        }
        
        this.saveChats();
        this.updateMinimap();
        this.scrollToBottom();
    }

    async simulateAIResponse(userMessage) {
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // Простые ответы на основе ключевых слов
        const responses = {
            'привет': 'Привет! Я KHAI Assistant. Чем могу помочь?',
            'как дела': 'У меня всё отлично! Готов помочь вам с любыми вопросами.',
            'помощь': 'Я могу ответить на ваши вопросы, помочь с генерацией текста и многое другое. Просто спросите!',
            'спасибо': 'Пожалуйста! Обращайтесь, если понадобится ещё помощь.',
            'пока': 'До свидания! Буду рад помочь снова.'
        };
        
        const lowerMessage = userMessage.toLowerCase();
        
        for (const [keyword, response] of Object.entries(responses)) {
            if (lowerMessage.includes(keyword)) {
                return response;
            }
        }
        
        // Стандартный ответ
        return `Я получил ваше сообщение: "${userMessage}". В реальном приложении здесь был бы ответ от AI модели.`;
    }

    addMessage(role, content, options = {}) {
        if (!this.chats[this.currentChat]) {
            this.createNewChat();
        }
        
        const message = {
            id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            role,
            content,
            timestamp: new Date().toISOString(),
            model: role === 'ai' ? this.currentModel : null,
            ...options
        };
        
        this.chats[this.currentChat].messages.push(message);
        this.renderMessage(message);
        
        return message;
    }

    renderMessage(message) {
        const messagesContainer = document.getElementById('messagesContainer');
        const messageElement = this.createMessageElement(message);
        
        // Добавляем с анимацией
        messageElement.style.opacity = '0';
        messagesContainer.appendChild(messageElement);
        
        requestAnimationFrame(() => {
            messageElement.style.transition = 'opacity 0.3s ease';
            messageElement.style.opacity = '1';
        });
        
        // Обновляем мини-карту
        this.updateMinimap();
    }

    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${message.role}`;
        messageDiv.dataset.messageId = message.id;
        
        let contentHTML = '';
        
        if (message.role === 'user') {
            contentHTML = this.formatUserMessage(message);
        } else if (message.role === 'ai') {
            contentHTML = this.formatAIMessage(message);
        } else if (message.role === 'error') {
            contentHTML = this.formatErrorMessage(message);
        }
        
        messageDiv.innerHTML = contentHTML;
        
        // Добавляем обработчики событий для кнопок действий
        this.attachMessageActionHandlers(messageDiv, message);
        
        return messageDiv;
    }

    formatUserMessage(message) {
        return `
            <div class="message-content">
                ${this.escapeHTML(message.content)}
            </div>
            <div class="message-actions">
                <button class="action-btn-small copy-btn" title="Копировать">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="action-btn-small edit-btn" title="Редактировать">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        `;
    }

    formatAIMessage(message) {
        const formattedContent = this.formatMarkdown(message.content);
        
        return `
            <div class="message-content">
                ${formattedContent}
            </div>
            ${message.model ? `<div class="model-indicator">Модель: ${this.models[message.model]?.name || message.model}</div>` : ''}
            <div class="message-actions">
                <button class="action-btn-small copy-btn" title="Копировать">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="action-btn-small speak-btn" title="Озвучить">
                    <i class="fas fa-volume-up"></i>
                </button>
                <button class="action-btn-small regenerate-btn" title="Перегенерировать">
                    <i class="fas fa-redo"></i>
                </button>
            </div>
        `;
    }

    formatErrorMessage(message) {
        return `
            <div class="message-content">
                <i class="fas fa-exclamation-triangle"></i>
                ${this.escapeHTML(message.content)}
            </div>
        `;
    }

    formatMarkdown(text) {
        // Простой парсер Markdown
        return text
            // Заголовки
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Жирный текст
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            // Курсив
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            // Код
            .replace(/`(.*?)`/gim, '<code>$1</code>')
            // Блоки кода
            .replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
                return `<pre><div class="code-header"><span class="code-language">${lang || 'text'}</span><button class="copy-code-btn"><i class="fas fa-copy"></i> Копировать</button></div><code class="hljs">${this.escapeHTML(code.trim())}</code></pre>`;
            })
            // Списки
            .replace(/^\s*[\-\*] (.*$)/gim, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            // Ссылки
            .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
            // Переносы строк
            .replace(/\n/g, '<br>');
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    attachMessageActionHandlers(messageElement, message) {
        // Копирование
        const copyBtn = messageElement.querySelector('.copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyMessage(message));
        }
        
        // Редактирование (только для пользовательских сообщений)
        const editBtn = messageElement.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.editMessage(message));
        }
        
        // Озвучка (только для AI сообщений)
        const speakBtn = messageElement.querySelector('.speak-btn');
        if (speakBtn) {
            speakBtn.addEventListener('click', () => this.toggleSpeech(message));
        }
        
        // Регенерация (только для AI сообщений)
        const regenerateBtn = messageElement.querySelector('.regenerate-btn');
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => this.regenerateMessage(message));
        }
        
        // Копирование кода
        const copyCodeBtns = messageElement.querySelectorAll('.copy-code-btn');
        copyCodeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const codeBlock = e.target.closest('pre').querySelector('code');
                this.copyToClipboard(codeBlock.textContent);
                btn.classList.add('copied');
                btn.innerHTML = '<i class="fas fa-check"></i> Скопировано';
                setTimeout(() => {
                    btn.classList.remove('copied');
                    btn.innerHTML = '<i class="fas fa-copy"></i> Копировать';
                }, 2000);
            });
        });
    }

    copyMessage(message) {
        this.copyToClipboard(message.content);
        this.showToast('Сообщение скопировано', 'success');
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (err) {
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    }

    editMessage(message) {
        const newContent = prompt('Редактировать сообщение:', message.content);
        if (newContent !== null && newContent.trim() !== '') {
            message.content = newContent.trim();
            this.saveChats();
            this.renderMessages();
            this.showToast('Сообщение обновлено', 'success');
        }
    }

    toggleSpeech(message) {
        if (this.isSpeaking) {
            this.stopSpeech();
        } else {
            this.speakMessage(message);
        }
    }

    initVoiceSynthesis() {
        if ('speechSynthesis' in window) {
            this.voiceSynthesis = window.speechSynthesis;
            
            // Обработка событий синтеза речи
            this.voiceSynthesis.onvoiceschanged = () => {
                console.log('Голоса загружены');
            };
        }
    }

    speakMessage(message) {
        if (!this.voiceSynthesis) {
            this.showToast('Озвучка не поддерживается', 'error');
            return;
        }
        
        if (this.isSpeaking) {
            this.stopSpeech();
            return;
        }
        
        const utterance = new SpeechSynthesisUtterance(message.content);
        
        // Настройки голоса
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        // Выбор русского голоса если доступен
        const voices = this.voiceSynthesis.getVoices();
        const russianVoice = voices.find(voice => 
            voice.lang.startsWith('ru') || voice.name.includes('Russian')
        );
        
        if (russianVoice) {
            utterance.voice = russianVoice;
        }
        
        utterance.onstart = () => {
            this.isSpeaking = true;
            const speakBtn = document.querySelector(`[data-message-id="${message.id}"] .speak-btn`);
            if (speakBtn) {
                speakBtn.classList.add('speaking');
                speakBtn.innerHTML = '<i class="fas fa-stop"></i>';
            }
        };
        
        utterance.onend = () => {
            this.isSpeaking = false;
            this.currentUtterance = null;
            const speakBtn = document.querySelector(`[data-message-id="${message.id}"] .speak-btn`);
            if (speakBtn) {
                speakBtn.classList.remove('speaking');
                speakBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
            }
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.isSpeaking = false;
            this.currentUtterance = null;
            this.showToast('Ошибка озвучки', 'error');
        };
        
        this.currentUtterance = utterance;
        this.voiceSynthesis.speak(utterance);
    }

    stopSpeech() {
        if (this.voiceSynthesis && this.isSpeaking) {
            this.voiceSynthesis.cancel();
            this.isSpeaking = false;
            this.currentUtterance = null;
            
            // Сбрасываем все кнопки озвучки
            document.querySelectorAll('.speak-btn').forEach(btn => {
                btn.classList.remove('speaking');
                btn.innerHTML = '<i class="fas fa-volume-up"></i>';
            });
        }
    }

    regenerateMessage(message) {
        // Находим индекс сообщения пользователя, на которое отвечает это AI сообщение
        const messages = this.chats[this.currentChat].messages;
        const messageIndex = messages.findIndex(m => m.id === message.id);
        
        if (messageIndex > 0) {
            const userMessage = messages[messageIndex - 1];
            if (userMessage.role === 'user') {
                // Удаляем текущий AI ответ
                messages.splice(messageIndex, 1);
                
                // Перегенерируем ответ
                this.addMessage('ai', `Перегенерированный ответ на: "${userMessage.content}"`);
                this.saveChats();
                this.renderMessages();
                this.updateMinimap();
                
                this.showToast('Ответ перегенерирован', 'success');
            }
        }
    }

    renderMessages() {
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.innerHTML = '';
        
        if (this.chats[this.currentChat]) {
            this.chats[this.currentChat].messages.forEach(message => {
                const messageElement = this.createMessageElement(message);
                messagesContainer.appendChild(messageElement);
            });
        }
        
        this.scrollToBottom();
    }

    showTypingIndicator() {
        this.isTyping = true;
        
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
            <span>KHAI печатает...</span>
        `;
        
        messagesContainer.appendChild(typingIndicator);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    updateSendButton() {
        const sendBtn = document.getElementById('sendBtn');
        if (this.isGenerating) {
            sendBtn.innerHTML = '<i class="fas fa-stop"></i>';
            sendBtn.classList.add('stop-generation');
        } else {
            sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
            sendBtn.classList.remove('stop-generation');
        }
    }

    // Функции для работы с сайдбаром
    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('overlay');
        
        if (this.isSidebarOpen) {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    renderChatList() {
        const chatList = document.getElementById('chatList');
        chatList.innerHTML = '';
        
        Object.values(this.chats).forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chat.id === this.currentChat ? 'active' : ''}`;
            chatItem.innerHTML = `
                <div class="chat-item-icon">
                    <i class="fas fa-comment"></i>
                </div>
                <div class="chat-item-name">${this.escapeHTML(chat.name)}</div>
                <div class="chat-item-actions">
                    <button class="chat-item-action delete-chat-btn" data-chat-id="${chat.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            chatItem.addEventListener('click', (e) => {
                if (!e.target.closest('.chat-item-action')) {
                    this.switchChat(chat.id);
                }
            });
            
            const deleteBtn = chatItem.querySelector('.delete-chat-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteChat(chat.id);
            });
            
            chatList.appendChild(chatItem);
        });
    }

    // Функции для работы с модальными окнами
    showModal(modalId) {
        this.closeAllModals();
        
        const modal = document.getElementById(modalId);
        const overlay = document.getElementById('overlay');
        
        if (modal) {
            modal.classList.add('active');
            overlay.classList.add('active');
            this.isModalOpen = true;
            this.currentModal = modalId;
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal() {
        if (this.currentModal) {
            const modal = document.getElementById(this.currentModal);
            const overlay = document.getElementById('overlay');
            
            modal.classList.remove('active');
            overlay.classList.remove('active');
            
            this.isModalOpen = false;
            this.currentModal = null;
            document.body.style.overflow = '';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        
        document.getElementById('overlay').classList.remove('active');
        this.isModalOpen = false;
        this.currentModal = null;
        document.body.style.overflow = '';
    }

    // Функции для работы с поиском
    toggleSearch() {
        this.isSearchActive = !this.isSearchActive;
        const searchContainer = document.querySelector('.header-search-container');
        
        if (this.isSearchActive) {
            searchContainer.style.display = 'block';
            document.getElementById('searchInput').focus();
        } else {
            searchContainer.style.display = 'none';
            this.clearSearch();
        }
    }

    handleSearch(query) {
        if (!query.trim()) {
            this.clearSearch();
            return;
        }
        
        this.searchResults = [];
        const messages = this.chats[this.currentChat]?.messages || [];
        
        messages.forEach((message, index) => {
            if (message.content.toLowerCase().includes(query.toLowerCase())) {
                this.searchResults.push({
                    message,
                    index,
                    element: document.querySelector(`[data-message-id="${message.id}"]`)
                });
            }
        });
        
        this.displaySearchResults();
        this.highlightSearchResults(query);
        
        if (this.searchResults.length > 0) {
            this.navigateToSearchResult(0);
        }
    }

    displaySearchResults() {
        const searchResults = document.getElementById('searchResults');
        searchResults.innerHTML = '';
        
        if (this.searchResults.length === 0) {
            searchResults.classList.remove('active');
            return;
        }
        
        this.searchResults.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = `search-result-item ${index === this.currentSearchIndex ? 'highlighted' : ''}`;
            resultItem.textContent = result.message.content.substring(0, 100) + '...';
            resultItem.addEventListener('click', () => this.navigateToSearchResult(index));
            searchResults.appendChild(resultItem);
        });
        
        searchResults.classList.add('active');
    }

    highlightSearchResults(query) {
        // Убираем предыдущие подсветки
        document.querySelectorAll('.search-highlight').forEach(el => {
            el.classList.remove('search-highlight');
        });
        
        // Подсвечиваем новые результаты
        this.searchResults.forEach(result => {
            if (result.element) {
                const content = result.element.querySelector('.message-content');
                if (content) {
                    const text = content.innerHTML;
                    const highlighted = text.replace(
                        new RegExp(this.escapeRegex(query), 'gi'),
                        match => `<mark class="search-highlight">${match}</mark>`
                    );
                    content.innerHTML = highlighted;
                }
            }
        });
        
        // Обновляем мини-карту
        this.updateMinimap();
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    navigateToSearchResult(index) {
        if (this.searchResults.length === 0) return;
        
        this.currentSearchIndex = index;
        const result = this.searchResults[index];
        
        if (result.element) {
            result.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            result.element.classList.add('search-highlight-animation');
            setTimeout(() => {
                result.element.classList.remove('search-highlight-animation');
            }, 2000);
        }
        
        this.displaySearchResults();
    }

    navigateToNextSearchResult() {
        if (this.searchResults.length === 0) return;
        
        this.currentSearchIndex = (this.currentSearchIndex + 1) % this.searchResults.length;
        this.navigateToSearchResult(this.currentSearchIndex);
    }

    navigateToPrevSearchResult() {
        if (this.searchResults.length === 0) return;
        
        this.currentSearchIndex = this.currentSearchIndex > 0 ? 
            this.currentSearchIndex - 1 : this.searchResults.length - 1;
        this.navigateToSearchResult(this.currentSearchIndex);
    }

    clearSearch() {
        this.isSearchActive = false;
        this.searchResults = [];
        this.currentSearchIndex = -1;
        
        document.querySelector('.header-search-container').style.display = 'none';
        document.getElementById('searchInput').value = '';
        document.getElementById('searchResults').classList.remove('active');
        
        // Убираем подсветку
        document.querySelectorAll('.search-highlight').forEach(el => {
            el.classList.remove('search-highlight');
        });
        
        this.updateMinimap();
    }

    // Функции для работы с мини-картой
    updateMinimap() {
        const minimap = document.querySelector('.minimap-content');
        const messages = this.chats[this.currentChat]?.messages || [];
        
        if (!minimap || messages.length === 0) {
            minimap.innerHTML = '';
            return;
        }
        
        let minimapHTML = '';
        messages.forEach(message => {
            const height = Math.max(2, Math.min(10, message.content.length / 50));
            minimapHTML += `<div class="minimap-message ${message.role} ${this.isSearchResult(message) ? 'search-highlighted' : ''}" style="height: ${height}px"></div>`;
        });
        
        minimap.innerHTML = minimapHTML;
        this.updateMinimapViewport();
    }

    isSearchResult(message) {
        return this.searchResults.some(result => result.message.id === message.id);
    }

    updateMinimapViewport() {
        const messagesContainer = document.getElementById('messagesContainer');
        const minimap = document.querySelector('.chat-minimap');
        const viewport = document.querySelector('.minimap-viewport');
        
        if (!messagesContainer || !minimap || !viewport) return;
        
        const containerHeight = messagesContainer.clientHeight;
        const scrollHeight = messagesContainer.scrollHeight;
        const scrollTop = messagesContainer.scrollTop;
        
        const viewportHeight = (containerHeight / scrollHeight) * minimap.clientHeight;
        const viewportTop = (scrollTop / scrollHeight) * minimap.clientHeight;
        
        viewport.style.height = viewportHeight + 'px';
        viewport.style.top = viewportTop + 'px';
    }

    scrollToTop() {
        document.getElementById('messagesContainer').scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    }

    navigateToPrevMessage() {
        const messages = document.querySelectorAll('.message');
        const currentScroll = document.getElementById('messagesContainer').scrollTop;
        
        for (let i = messages.length - 1; i >= 0; i--) {
            const messageTop = messages[i].offsetTop;
            if (messageTop < currentScroll - 50) {
                messages[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
                break;
            }
        }
    }

    navigateToNextMessage() {
        const messages = document.querySelectorAll('.message');
        const currentScroll = document.getElementById('messagesContainer').scrollTop;
        const containerHeight = document.getElementById('messagesContainer').clientHeight;
        
        for (let i = 0; i < messages.length; i++) {
            const messageTop = messages[i].offsetTop;
            if (messageTop > currentScroll + containerHeight - 100) {
                messages[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
                break;
            }
        }
    }

    // Функции для работы с файлами
    handleFileAttach() {
        document.getElementById('fileInput').click();
    }

    handleFileSelect(event) {
        const files = event.target.files;
        if (files.length === 0) return;
        
        Array.from(files).forEach(file => {
            this.addAttachedFile(file);
        });
        
        // Сбрасываем input
        event.target.value = '';
    }

    addAttachedFile(file) {
        const attachedFiles = document.getElementById('attachedFiles');
        const fileId = 'file_' + Date.now();
        
        const fileElement = document.createElement('div');
        fileElement.className = 'attached-file';
        fileElement.id = fileId;
        fileElement.innerHTML = `
            <i class="fas fa-file"></i>
            <span>${this.escapeHTML(file.name)}</span>
            <button class="remove-file-btn">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        const removeBtn = fileElement.querySelector('.remove-file-btn');
        removeBtn.addEventListener('click', () => {
            fileElement.remove();
        });
        
        attachedFiles.appendChild(fileElement);
    }

    // Функции для работы с режимами генерации
    toggleVoiceGeneration() {
        const btn = document.getElementById('generateVoiceBtn');
        const isActive = btn.classList.contains('active');
        
        if (isActive) {
            btn.classList.remove('active');
            this.showToast('Режим генерации голоса выключен', 'info');
        } else {
            btn.classList.add('active');
            this.showFeatureInDevelopment('Генерация голоса');
        }
    }

    toggleImageGeneration() {
        const btn = document.getElementById('generateImageBtn');
        const isActive = btn.classList.contains('active');
        
        if (isActive) {
            btn.classList.remove('active');
            this.showToast('Режим генерации изображений выключен', 'info');
        } else {
            btn.classList.add('active');
            this.showFeatureInDevelopment('Генерация изображений');
        }
    }

    showFeatureInDevelopment(featureName) {
        this.showToast(`${featureName} в разработке`, 'warning');
        
        // Автоматически выключаем кнопку через 3 секунды
        setTimeout(() => {
            const activeBtns = document.querySelectorAll('.mode-btn.active');
            activeBtns.forEach(btn => {
                if (btn.id.includes('generate')) {
                    btn.classList.remove('active');
                }
            });
        }, 3000);
    }

    // Функции для работы с темами
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
        this.saveSettings();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('khai_theme', this.currentTheme);
    }

    // Функции для работы с onboarding
    showWelcomeIfNeeded() {
        if (!this.isWelcomeCompleted) {
            this.showWelcomePage();
        } else if (!this.isGuideCompleted) {
            this.showGuidePage();
        }
    }

    showWelcomePage() {
        const welcomePage = document.getElementById('welcomePage');
        if (welcomePage) {
            welcomePage.style.display = 'flex';
            
            document.getElementById('startBtn').addEventListener('click', () => {
                this.completeWelcome();
            });
        }
    }

    completeWelcome() {
        this.isWelcomeCompleted = true;
        localStorage.setItem('khai_welcome_completed', 'true');
        document.getElementById('welcomePage').style.display = 'none';
        this.showGuidePage();
    }

    showGuidePage() {
        const guidePage = document.getElementById('guidePage');
        if (guidePage && !this.isGuideCompleted) {
            guidePage.style.display = 'flex';
            this.setupGuide();
        }
    }

    setupGuide() {
        let currentStep = 0;
        const steps = document.querySelectorAll('.guide-step');
        const totalSteps = steps.length;
        
        const updateGuide = () => {
            steps.forEach((step, index) => {
                step.style.display = index === currentStep ? 'flex' : 'none';
            });
            
            document.getElementById('guidePrev').style.display = currentStep > 0 ? 'flex' : 'none';
            document.getElementById('guideNext').style.display = currentStep < totalSteps - 1 ? 'flex' : 'none';
            document.getElementById('guideComplete').style.display = currentStep === totalSteps - 1 ? 'flex' : 'none';
            
            // Обновляем прогресс
            document.querySelectorAll('.progress-dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === currentStep);
            });
        };
        
        document.getElementById('guideNext').addEventListener('click', () => {
            if (currentStep < totalSteps - 1) {
                currentStep++;
                updateGuide();
            }
        });
        
        document.getElementById('guidePrev').addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                updateGuide();
            }
        });
        
        document.getElementById('guideComplete').addEventListener('click', () => {
            this.completeGuide();
        });
        
        document.getElementById('guideSkip').addEventListener('click', () => {
            this.completeGuide();
        });
        
        updateGuide();
    }

    completeGuide() {
        this.isGuideCompleted = true;
        localStorage.setItem('khai_guide_completed', 'true');
        document.getElementById('guidePage').style.display = 'none';
        this.showToast('Гайд завершен! Добро пожаловать в KHAI Assistant', 'success');
    }

    showGuide() {
        this.showGuidePage();
    }

    // Утилиты
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${this.getToastIcon(type)}"></i>
            </div>
            <div class="toast-message">${this.escapeHTML(message)}</div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.remove();
        });
        
        toastContainer.appendChild(toast);
        
        // Анимация появления
        setTimeout(() => toast.classList.add('active'), 10);
        
        // Автоматическое закрытие
        setTimeout(() => {
            toast.classList.remove('active');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Сохранение и загрузка данных
    saveChats() {
        localStorage.setItem('khai_chats', JSON.stringify(this.chats));
        localStorage.setItem('khai_current_chat', this.currentChat);
    }

    loadChats() {
        const savedChats = localStorage.getItem('khai_chats');
        const savedCurrentChat = localStorage.getItem('khai_current_chat');
        
        if (savedChats) {
            this.chats = JSON.parse(savedChats);
        } else {
            // Создаем начальный чат
            this.chats = {
                default: {
                    id: 'default',
                    name: 'Основной чат',
                    messages: [],
                    createdAt: new Date().toISOString(),
                    model: 'gpt-4'
                }
            };
        }
        
        if (savedCurrentChat && this.chats[savedCurrentChat]) {
            this.currentChat = savedCurrentChat;
        } else {
            this.currentChat = Object.keys(this.chats)[0];
        }
    }

    saveSettings() {
        const settings = {
            theme: this.currentTheme,
            model: this.currentModel,
            ...this.settings
        };
        localStorage.setItem('khai_settings', JSON.stringify(settings));
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('khai_settings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            this.currentTheme = settings.theme || 'dark';
            this.currentModel = settings.model || 'gpt-4';
            this.settings = { ...this.settings, ...settings };
        }
    }

    // Обработка ошибок
    handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        this.showToast(`Ошибка: ${error.message}`, 'error');
    }

    // Деструктор
    destroy() {
        this.stopSpeech();
        this.saveChats();
        this.saveSettings();
        
        // Очищаем все таймеры
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
    }
}

// Инициализация приложения когда DOM загружен
document.addEventListener('DOMContentLoaded', () => {
    // Показываем прелоадер
    const preloader = document.getElementById('preloader');
    
    // Имитируем загрузку ресурсов
    setTimeout(() => {
        window.khaiAssistant = new KHAIAssistant();
        
        // Скрываем прелоадер
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500);
    }, 1500);
});

// Обработка ошибок загрузки страницы
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Обработка обещаний без catch
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Service Worker для оффлайн работы
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
