// Основной файл JavaScript для KHAI интерфейса
class KHAIInterface {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.currentModel = localStorage.getItem('currentModel') || 'khai-pro';
        this.currentMode = 'text';
        this.attachedFiles = [];
        this.isRecording = false;
        this.isSidebarOpen = false;
        this.isModalOpen = false;
        this.currentChatId = 'default';
        this.messages = [];
        this.notifications = [];
        
        this.init();
    }

    init() {
        this.applyTheme();
        this.bindEvents();
        this.loadModels();
        this.loadNotifications();
        this.setupPWA();
        this.setupScrollProgress();
        this.setupMessageAnimations();
        this.setupAutoResize();
        
        // Загрузка истории чата
        this.loadChatHistory();
        
        // Показать приветственное сообщение
        this.showWelcomeMessage();
    }

    // Применение темы
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeIcon = document.getElementById('themeToggle').querySelector('i');
        themeIcon.className = this.currentTheme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
    }

    // Привязка событий
    bindEvents() {
        // Переключение темы
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Открытие/закрытие меню
        document.getElementById('menuToggle').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('sidebarClose').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('sidebarOverlay').addEventListener('click', () => this.toggleSidebar());
        
        // Выбор модели
        document.getElementById('modelSelectBtn').addEventListener('click', () => this.openModelSelect());
        document.getElementById('modelSelectClose').addEventListener('click', () => this.closeModal('modelSelectModal'));
        
        // Навигация
        document.getElementById('scrollToTopBtn').addEventListener('click', () => this.scrollToTop());
        document.getElementById('scrollToBottomBtn').addEventListener('click', () => this.scrollToBottom());
        
        // Ввод сообщений
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('userInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Очистка ввода
        document.getElementById('clearInputBtn').addEventListener('click', () => this.clearInput());
        
        // Прикрепление файлов
        document.getElementById('attachFileBtn').addEventListener('click', () => this.attachFile());
        document.getElementById('fileInput').addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Выбор режима ввода
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setInputMode(e.target.closest('.mode-btn').dataset.mode));
        });
        
        // Управление чатом
        document.getElementById('clearChatBtn').addEventListener('click', () => this.clearChat());
        document.getElementById('downloadHistoryBtn').addEventListener('click', () => this.downloadHistory());
        document.getElementById('helpBtn').addEventListener('click', () => this.showHelp());
        
        // Голосовой ввод
        document.getElementById('voiceInputBtn').addEventListener('click', () => this.toggleVoiceInput());
        
        // Поиск
        document.getElementById('globalSearch').addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // Настройки формата
        document.getElementById('fontSize').addEventListener('change', (e) => this.setFontSize(e.target.value));
        
        // Боковое меню
        this.bindSidebarEvents();
        
        // Закрытие модальных окон по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
                if (this.isSidebarOpen) this.toggleSidebar();
            }
        });
        
        // Обработка изменения размера окна
        window.addEventListener('resize', () => this.handleResize());
    }

    // Привязка событий бокового меню
    bindSidebarEvents() {
        document.getElementById('newChatBtn').addEventListener('click', () => this.createNewChat());
        document.getElementById('activeFunctionsBtn').addEventListener('click', () => this.showActiveFunctions());
        document.getElementById('toolsBtn').addEventListener('click', () => this.showTools());
        document.getElementById('profileBtn').addEventListener('click', () => this.showProfile());
        document.getElementById('personalDataBtn').addEventListener('click', () => this.showPersonalData());
        document.getElementById('interfaceSettingsBtn').addEventListener('click', () => this.showInterfaceSettings());
        document.getElementById('behaviorSettingsBtn').addEventListener('click', () => this.showBehaviorSettings());
        document.getElementById('soundSettingsBtn').addEventListener('click', () => this.showSoundSettings());
        document.getElementById('clearNotificationsBtn').addEventListener('click', () => this.clearNotifications());
        document.getElementById('supportBtn').addEventListener('click', () => this.contactSupport());
        document.getElementById('aboutBtn').addEventListener('click', () => this.showAbout());
    }

    // Переключение темы
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', this.currentTheme);
        this.applyTheme();
        this.playSound('switch');
    }

    // Открытие/закрытие бокового меню
    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
        document.getElementById('sidebarMenu').classList.toggle('active');
        document.getElementById('sidebarOverlay').classList.toggle('active');
        document.body.style.overflow = this.isSidebarOpen ? 'hidden' : '';
        
        if (this.isSidebarOpen) {
            this.playSound('menu-open');
        }
    }

    // Открытие модального окна
    openModal(modalId) {
        this.isModalOpen = true;
        document.getElementById(modalId).classList.add('active');
        document.body.style.overflow = 'hidden';
        this.playSound('modal-open');
    }

    // Закрытие модального окна
    closeModal(modalId) {
        this.isModalOpen = false;
        document.getElementById(modalId).classList.remove('active');
        document.body.style.overflow = '';
        this.playSound('modal-close');
    }

    // Закрытие всех модальных окон
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        this.isModalOpen = false;
        document.body.style.overflow = '';
    }

    // Выбор модели ИИ
    openModelSelect() {
        this.openModal('modelSelectModal');
    }

    // Загрузка доступных моделей
    loadModels() {
        const models = [
            {
                id: 'khai-pro',
                name: 'KHAI Pro',
                version: 'v2.1',
                description: 'Продвинутая модель для сложных задач и творческих решений',
                icon: 'ti ti-brain',
                stats: {
                    context: '128K',
                    knowledge: '2024-07',
                    languages: 'Мультиязычная'
                }
            },
            {
                id: 'khai-fast',
                name: 'KHAI Fast',
                version: 'v1.5',
                description: 'Быстрая модель для повседневных задач и быстрых ответов',
                icon: 'ti ti-bolt',
                stats: {
                    context: '32K',
                    knowledge: '2024-01',
                    languages: 'Русский/Английский'
                }
            },
            {
                id: 'khai-vision',
                name: 'KHAI Vision',
                version: 'v1.2',
                description: 'Специализированная модель для работы с изображениями и визуальным контентом',
                icon: 'ti ti-eye',
                stats: {
                    context: '16K',
                    knowledge: '2024-03',
                    languages: 'Мультиязычная'
                }
            },
            {
                id: 'khai-code',
                name: 'KHAI Code',
                version: 'v2.0',
                description: 'Экспертная модель для программирования и технических задач',
                icon: 'ti ti-code',
                stats: {
                    context: '64K',
                    knowledge: '2024-06',
                    languages: 'Все языки программирования'
                }
            }
        ];

        const modelGrid = document.getElementById('modelGrid');
        modelGrid.innerHTML = models.map(model => `
            <div class="model-card ${model.id === this.currentModel ? 'active' : ''}" 
                 data-model="${model.id}">
                <div class="model-header">
                    <div class="model-icon">
                        <i class="${model.icon}"></i>
                    </div>
                    <div class="model-info">
                        <h4>${model.name}</h4>
                        <div class="model-version">${model.version}</div>
                    </div>
                </div>
                <div class="model-description">${model.description}</div>
                <div class="model-stats">
                    <div class="model-stat">
                        <i class="ti ti-database"></i>
                        <span>${model.stats.context}</span>
                    </div>
                    <div class="model-stat">
                        <i class="ti ti-calendar"></i>
                        <span>${model.stats.knowledge}</span>
                    </div>
                    <div class="model-stat">
                        <i class="ti ti-language"></i>
                        <span>${model.stats.languages}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Добавляем обработчики выбора модели
        document.querySelectorAll('.model-card').forEach(card => {
            card.addEventListener('click', () => {
                const modelId = card.dataset.model;
                this.selectModel(modelId);
                this.closeModal('modelSelectModal');
            });
        });
    }

    // Выбор модели
    selectModel(modelId) {
        this.currentModel = modelId;
        localStorage.setItem('currentModel', modelId);
        
        // Обновляем активную модель в интерфейсе
        document.querySelectorAll('.model-card').forEach(card => {
            card.classList.toggle('active', card.dataset.model === modelId);
        });
        
        this.showNotification('Модель изменена', `Активная модель: ${this.getModelName(modelId)}`);
        this.playSound('model-select');
    }

    // Получение имени модели по ID
    getModelName(modelId) {
        const models = {
            'khai-pro': 'KHAI Pro',
            'khai-fast': 'KHAI Fast',
            'khai-vision': 'KHAI Vision',
            'khai-code': 'KHAI Code'
        };
        return models[modelId] || 'Неизвестная модель';
    }

    // Установка режима ввода
    setInputMode(mode) {
        this.currentMode = mode;
        
        // Обновляем активную кнопку режима
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        // Обновляем placeholder
        const input = document.getElementById('userInput');
        const placeholders = {
            text: 'Задайте вопрос или опишите изображение...',
            image: 'Опишите изображение, которое хотите создать...',
            voice: 'Нажмите на микрофон для голосового ввода...'
        };
        input.placeholder = placeholders[mode] || placeholders.text;
        
        // Показываем/скрываем настройки формата для текстового режима
        const formatSettings = document.getElementById('formatSettings');
        formatSettings.classList.toggle('visible', mode === 'text');
        
        this.playSound('mode-switch');
    }

    // Отправка сообщения
    async sendMessage() {
        const input = document.getElementById('userInput');
        const message = input.value.trim();
        
        if (!message && this.attachedFiles.length === 0) {
            this.showNotification('Ошибка', 'Введите сообщение или прикрепите файл');
            this.playSound('error');
            return;
        }

        // Добавляем сообщение пользователя
        this.addMessage('user', message);
        input.value = '';
        this.clearInput();
        this.updateRequestInfo();
        
        // Показываем индикатор загрузки
        this.showLoadingIndicator();
        
        try {
            // Имитация ответа ИИ (в реальном приложении здесь будет API вызов)
            setTimeout(() => {
                this.hideLoadingIndicator();
                this.addMessage('ai', this.generateAIResponse(message));
                this.playSound('message-received');
            }, 1500);
            
        } catch (error) {
            this.hideLoadingIndicator();
            this.addMessage('error', 'Произошла ошибка при обработке запроса. Пожалуйста, попробуйте еще раз.');
            this.playSound('error');
            console.error('Error sending message:', error);
        }
    }

    // Добавление сообщения в чат
    addMessage(type, content, files = []) {
        const message = {
            id: Date.now(),
            type,
            content,
            timestamp: new Date(),
            files: files.length ? files : this.attachedFiles
        };
        
        this.messages.push(message);
        
        const messagesContainer = document.getElementById('messagesContainer');
        const messageElement = this.createMessageElement(message);
        messagesContainer.appendChild(messageElement);
        
        // Прокручиваем к новому сообщению
        this.scrollToBottom();
        
        // Сохраняем историю
        this.saveChatHistory();
        
        // Очищаем прикрепленные файлы после отправки
        if (type === 'user') {
            this.attachedFiles = [];
            this.updateAttachedFiles();
        }
        
        return messageElement;
    }

    // Создание элемента сообщения
    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${message.type}`;
        messageDiv.dataset.messageId = message.id;
        
        let content = message.content;
        
        // Обработка markdown для сообщений ИИ
        if (message.type === 'ai') {
            content = marked.parse(content);
        }
        
        // Добавляем файлы, если есть
        let filesHtml = '';
        if (message.files && message.files.length > 0) {
            filesHtml = `
                <div class="message-files">
                    ${message.files.map(file => `
                        <div class="message-file">
                            <i class="ti ti-file-text"></i>
                            <span>${file.name}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
            ${filesHtml}
            <div class="message-time">
                ${message.timestamp.toLocaleTimeString('ru-RU', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                })}
            </div>
        `;
        
        // Подсветка кода для сообщений ИИ
        if (message.type === 'ai') {
            setTimeout(() => {
                messageDiv.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }, 0);
        }
        
        return messageDiv;
    }

    // Генерация ответа ИИ (заглушка)
    generateAIResponse(userMessage) {
        const responses = [
            `Я проанализировал ваш запрос и могу предложить следующее решение...`,
            `На основе вашего вопроса, вот что я могу рассказать...`,
            `Это интересный вопрос! Давайте разберем его подробнее...`,
            `Отличный вопрос! Вот что я нашел по этой теме...`,
            `Спасибо за ваш запрос. Вот информация, которая может быть полезной...`
        ];
        
        // Простая логика ответа на основе ключевых слов
        if (userMessage.toLowerCase().includes('привет') || userMessage.toLowerCase().includes('здравствуй')) {
            return `Здравствуйте! Я KHAI, первый белорусский ИИ-ассистент. Чем могу вам помочь?`;
        }
        
        if (userMessage.toLowerCase().includes('погода')) {
            return `К сожалению, у меня нет доступа к актуальным данным о погоде. Рекомендую проверить специализированные сервисы погоды.`;
        }
        
        if (userMessage.toLowerCase().includes('время')) {
            return `Сейчас ${new Date().toLocaleTimeString('ru-RU')}. Чем еще могу помочь?`;
        }
        
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Показать индикатор загрузки
    showLoadingIndicator() {
        const loadingMessage = {
            id: 'loading',
            type: 'ai',
            content: 'Думаю...',
            timestamp: new Date()
        };
        
        const messagesContainer = document.getElementById('messagesContainer');
        const messageElement = this.createMessageElement(loadingMessage);
        messageElement.id = 'loadingMessage';
        messageElement.classList.add('loading');
        messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
    }

    // Скрыть индикатор загрузки
    hideLoadingIndicator() {
        const loadingMessage = document.getElementById('loadingMessage');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }

    // Очистка поля ввода
    clearInput() {
        document.getElementById('userInput').value = '';
        this.updateClearButton();
        this.updateRequestInfo();
    }

    // Обновление видимости кнопки очистки
    updateClearButton() {
        const input = document.getElementById('userInput');
        const clearBtn = document.getElementById('clearInputBtn');
        clearBtn.style.display = input.value.trim() ? 'flex' : 'none';
    }

    // Прикрепление файла
    attachFile() {
        document.getElementById('fileInput').click();
    }

    // Обработка выбора файла
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        
        files.forEach(file => {
            if (this.attachedFiles.length >= 5) {
                this.showNotification('Ошибка', 'Можно прикрепить не более 5 файлов');
                this.playSound('error');
                return;
            }
            
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                this.showNotification('Ошибка', `Файл ${file.name} слишком большой (макс. 10MB)`);
                this.playSound('error');
                return;
            }
            
            this.attachedFiles.push({
                name: file.name,
                size: file.size,
                type: file.type
            });
        });
        
        this.updateAttachedFiles();
        this.updateRequestInfo();
        event.target.value = ''; // Сбрасываем input
        this.playSound('file-attach');
    }

    // Обновление списка прикрепленных файлов
    updateAttachedFiles() {
        const container = document.getElementById('attachedFiles');
        container.innerHTML = '';
        
        this.attachedFiles.forEach((file, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            fileElement.innerHTML = `
                <i class="ti ti-file-text"></i>
                <span>${file.name}</span>
                <button class="remove-file" data-index="${index}">
                    <i class="ti ti-x"></i>
                </button>
            `;
            container.appendChild(fileElement);
        });
        
        // Добавляем обработчики удаления файлов
        container.querySelectorAll('.remove-file').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.remove-file').dataset.index);
                this.removeFile(index);
            });
        });
    }

    // Удаление файла
    removeFile(index) {
        this.attachedFiles.splice(index, 1);
        this.updateAttachedFiles();
        this.updateRequestInfo();
        this.playSound('file-remove');
    }

    // Обновление информации о запросе
    updateRequestInfo() {
        const input = document.getElementById('userInput');
        const charCount = input.value.length;
        const fileCount = this.attachedFiles.length;
        const totalSize = this.attachedFiles.reduce((sum, file) => sum + file.size, 0);
        
        document.getElementById('charCount').textContent = `${charCount} символов`;
        document.getElementById('fileCount').textContent = `${fileCount} файлов`;
        document.getElementById('totalSize').textContent = `${Math.round(totalSize / 1024)} КБ`;
        
        // Показываем/скрываем блок информации
        const requestInfo = document.getElementById('requestInfo');
        requestInfo.classList.toggle('visible', charCount > 0 || fileCount > 0);
    }

    // Голосовой ввод
    toggleVoiceInput() {
        if (!this.isRecording) {
            this.startVoiceInput();
        } else {
            this.stopVoiceInput();
        }
    }

    // Начало голосового ввода
    startVoiceInput() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showNotification('Ошибка', 'Голосовой ввод не поддерживается вашим браузером');
            this.playSound('error');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'ru-RU';
        
        this.recognition.onstart = () => {
            this.isRecording = true;
            document.getElementById('voiceInputBtn').classList.add('active');
            this.showNotification('Голосовой ввод', 'Слушаю...');
            this.playSound('voice-start');
        };
        
        this.recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            
            document.getElementById('userInput').value = transcript;
            this.updateClearButton();
            this.updateRequestInfo();
        };
        
        this.recognition.onend = () => {
            this.isRecording = false;
            document.getElementById('voiceInputBtn').classList.remove('active');
            this.playSound('voice-stop');
        };
        
        this.recognition.onerror = (event) => {
            this.isRecording = false;
            document.getElementById('voiceInputBtn').classList.remove('active');
            this.showNotification('Ошибка', 'Не удалось распознать речь');
            this.playSound('error');
        };
        
        this.recognition.start();
    }

    // Остановка голосового ввода
    stopVoiceInput() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    // Прокрутка к верху
    scrollToTop() {
        document.getElementById('messagesContainer').scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        this.playSound('scroll');
    }

    // Прокрутка к низу
    scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
        });
        this.playSound('scroll');
    }

    // Настройка прогресс-бара скролла
    setupScrollProgress() {
        const messagesContainer = document.getElementById('messagesContainer');
        const progressBar = document.getElementById('scrollProgress');
        
        messagesContainer.addEventListener('scroll', () => {
            const scrollTop = messagesContainer.scrollTop;
            const scrollHeight = messagesContainer.scrollHeight - messagesContainer.clientHeight;
            const progress = (scrollTop / scrollHeight) * 100;
            progressBar.style.width = `${progress}%`;
            
            // Показываем/скрываем кнопки навигации
            const navControls = document.getElementById('navigationControls');
            if (scrollHeight > 500) {
                navControls.classList.remove('hidden');
            } else {
                navControls.classList.add('hidden');
            }
        });
    }

    // Настройка анимаций сообщений
    setupMessageAnimations() {
        // Используем Intersection Observer для анимации сообщений при прокрутке
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        }, { threshold: 0.1 });
        
        // Наблюдаем за всеми сообщениями
        document.querySelectorAll('.message').forEach(message => {
            observer.observe(message);
        });
    }

    // Настройка авто-изменения размера текстового поля
    setupAutoResize() {
        const textarea = document.getElementById('userInput');
        
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
            window.khaiInterface.updateClearButton();
            window.khaiInterface.updateRequestInfo();
        });
        
        // Обновляем при загрузке
        textarea.addEventListener('focus', function() {
            window.khaiInterface.updateClearButton();
        });
    }

    // Обработка изменения размера окна
    handleResize() {
        // Обновляем высоту текстового поля
        const textarea = document.getElementById('userInput');
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    // Поиск по сообщениям
    handleSearch(query) {
        if (query.length < 2) {
            // Сбрасываем выделение, если запрос слишком короткий
            document.querySelectorAll('.message').forEach(msg => {
                msg.classList.remove('search-highlight');
            });
            return;
        }
        
        const messages = document.querySelectorAll('.message-content');
        messages.forEach(content => {
            const text = content.textContent || content.innerText;
            const message = content.closest('.message');
            
            if (text.toLowerCase().includes(query.toLowerCase())) {
                message.classList.add('search-highlight');
                
                // Подсвечиваем найденный текст
                const regex = new RegExp(`(${query})`, 'gi');
                const html = text.replace(regex, '<mark class="search-match">$1</mark>');
                content.innerHTML = html;
            } else {
                message.classList.remove('search-highlight');
            }
        });
    }

    // Очистка чата
    clearChat() {
        if (this.messages.length === 0) return;
        
        if (confirm('Вы уверены, что хотите очистить историю чата?')) {
            this.messages = [];
            document.getElementById('messagesContainer').innerHTML = '';
            localStorage.removeItem(`chat_${this.currentChatId}`);
            this.showNotification('Чат очищен', 'История сообщений удалена');
            this.playSound('chat-clear');
            this.showWelcomeMessage();
        }
    }

    // Скачивание истории
    downloadHistory() {
        if (this.messages.length === 0) {
            this.showNotification('Информация', 'Нет сообщений для скачивания');
            return;
        }
        
        const history = this.messages.map(msg => {
            const time = msg.timestamp.toLocaleString('ru-RU');
            const type = msg.type === 'user' ? 'Вы' : 'KHAI';
            return `[${time}] ${type}: ${msg.content}`;
        }).join('\n\n');
        
        const blob = new Blob([history], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khai-chat-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('История скачана', 'Файл сохранен на ваше устройство');
        this.playSound('download');
    }

    // Показать справку
    showHelp() {
        const helpMessage = `
## Справка по KHAI

### Основные возможности:
- **Текстовый чат** - общайтесь с ИИ на естественном языке
- **Генерация изображений** - создавайте изображения по описанию
- **Голосовой ввод** - говорите вместо набора текста
- **Прикрепление файлов** - загружайте документы для анализа

### Горячие клавиши:
- **Enter** - отправить сообщение
- **Shift + Enter** - новая строка
- **ESC** - закрыть меню/модальные окна

### Поддерживаемые форматы файлов:
- Изображения (JPG, PNG, GIF)
- Текстовые файлы (TXT)
- Документы (PDF, DOC, DOCX)
        `.trim();
        
        this.addMessage('ai', helpMessage);
        this.playSound('help');
    }

    // Установка размера шрифта
    setFontSize(size) {
        document.documentElement.style.setProperty('--base-font-size', `${size}px`);
        localStorage.setItem('fontSize', size);
        this.playSound('setting-change');
    }

    // Создание нового чата
    createNewChat() {
        this.currentChatId = `chat_${Date.now()}`;
        this.messages = [];
        document.getElementById('messagesContainer').innerHTML = '';
        document.getElementById('currentChatName').textContent = 'Новый чат';
        this.toggleSidebar();
        this.showWelcomeMessage();
        this.playSound('new-chat');
    }

    // Показать активные функции
    showActiveFunctions() {
        this.openModal('activeFunctionsModal');
        this.toggleSidebar();
    }

    // Показать профиль
    showProfile() {
        this.showNotification('Профиль', 'Раздел профиля в разработке');
        this.toggleSidebar();
    }

    // Показать настройки интерфейса
    showInterfaceSettings() {
        this.showNotification('Настройки', 'Раздел настроек интерфейса в разработке');
        this.toggleSidebar();
    }

    // Показать справку о программе
    showAbout() {
        const aboutMessage = `
## О KHAI

**KHAI** - первый белорусский ИИ-ассистент с поддержкой многомодального взаимодействия.

### Версия: 2.1.0
### Разработчик: KHAI Team
### Лицензия: Проприетарная

© 2024 KHAI. Все права защищены.
        `.trim();
        
        this.addMessage('ai', aboutMessage);
        this.toggleSidebar();
    }

    // Загрузка уведомлений
    loadNotifications() {
        this.notifications = JSON.parse(localStorage.getItem('khai_notifications')) || [
            {
                id: 1,
                title: 'Добро пожаловать в KHAI!',
                message: 'Начните общение с ИИ-ассистентом прямо сейчас.',
                time: new Date(),
                read: false
            }
        ];
        this.renderNotifications();
    }

    // Отображение уведомлений
    renderNotifications() {
        const container = document.getElementById('notificationsList');
        container.innerHTML = this.notifications
            .filter(notif => !notif.read)
            .map(notif => `
                <div class="notification-item">
                    <div class="notification-header">
                        <div class="notification-title">${notif.title}</div>
                        <div class="notification-time">
                            ${notif.time.toLocaleTimeString('ru-RU', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}
                        </div>
                    </div>
                    <div class="notification-message">${notif.message}</div>
                </div>
            `).join('');
    }

    // Показать уведомление
    showNotification(title, message, duration = 3000) {
        const notification = {
            id: Date.now(),
            title,
            message,
            time: new Date(),
            read: false
        };
        
        this.notifications.unshift(notification);
        this.renderNotifications();
        this.saveNotifications();
        
        // Временное уведомление (тост)
        this.showToast(title, message, duration);
    }

    // Показать тост-уведомление
    showToast(title, message, duration) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <div class="toast-header">
                <strong>${title}</strong>
                <button class="toast-close">&times;</button>
            </div>
            <div class="toast-message">${message}</div>
        `;
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-secondary);
            border: 1px solid var(--border-light);
            border-radius: var(--radius-md);
            padding: 16px;
            box-shadow: var(--shadow-lg);
            z-index: 10000;
            max-width: 320px;
            animation: toastSlideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Закрытие по кнопке
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });
        
        // Автоматическое закрытие
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'toastSlideOut 0.3s ease';
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
        
        // Стили анимации
        if (!document.querySelector('#toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                @keyframes toastSlideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes toastSlideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Очистка уведомлений
    clearNotifications() {
        this.notifications.forEach(notif => notif.read = true);
        this.renderNotifications();
        this.saveNotifications();
        this.playSound('notifications-clear');
    }

    // Сохранение уведомлений
    saveNotifications() {
        localStorage.setItem('khai_notifications', JSON.stringify(this.notifications));
    }

    // Воспроизведение звуков
    playSound(type) {
        if (localStorage.getItem('soundEnabled') === 'false') return;
        
        const sounds = {
            'message-sent': new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=='),
            'message-received': new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=='),
            'error': new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=='),
            'success': new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==')
        };
        
        if (sounds[type]) {
            sounds[type].volume = 0.3;
            sounds[type].play().catch(() => {
                // Игнорируем ошибки воспроизведения
            });
        }
    }

    // Загрузка истории чата
    loadChatHistory() {
        const saved = localStorage.getItem(`chat_${this.currentChatId}`);
        if (saved) {
            try {
                this.messages = JSON.parse(saved);
                this.messages.forEach(msg => {
                    msg.timestamp = new Date(msg.timestamp);
                    this.createMessageElement(msg);
                });
            } catch (e) {
                console.error('Error loading chat history:', e);
                this.messages = [];
            }
        }
    }

    // Сохранение истории чата
    saveChatHistory() {
        localStorage.setItem(`chat_${this.currentChatId}`, JSON.stringify(this.messages));
    }

    // Показать приветственное сообщение
    showWelcomeMessage() {
        if (this.messages.length === 0) {
            const welcomeMessage = `
## Добро пожаловать в KHAI! 🚀

Я - первый белорусский ИИ-ассистент, готовый помочь вам с:

- **Ответами на вопросы** любой сложности
- **Генерацией текстов** и творческих материалов
- **Анализом документов** и файлов
- **Созданием изображений** по описанию
- **Программированием** и техническими задачами

### Как начать:
1. Выберите подходящую модель ИИ в левом верхнем углу
2. Введите ваш запрос в поле ниже
3. Используйте разные режимы ввода (текст, изображение, голос)
4. Прикрепляйте файлы для анализа

**Примеры запросов:**
- "Объясни квантовую физику простыми словами"
- "Напиши код для сортировки массива на Python"
- "Создай изображение заката над морем"
- "Помоги составить бизнес-план"

Не стесняйтесь задавать любые вопросы! Я здесь, чтобы помочь. 😊
            `.trim();
            
            this.addMessage('ai', welcomeMessage);
        }
    }

    // Настройка PWA
    setupPWA() {
        // Обработка установки PWA
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showPWAInstallPrompt();
        });
        
        document.getElementById('pwaInstall').addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    this.hidePWAInstallPrompt();
                }
                deferredPrompt = null;
            }
        });
        
        document.getElementById('pwaDismiss').addEventListener('click', () => {
            this.hidePWAInstallPrompt();
        });
    }

    // Показать промпт установки PWA
    showPWAInstallPrompt() {
        document.getElementById('pwaPrompt').classList.add('active');
    }

    // Скрыть промпт установки PWA
    hidePWAInstallPrompt() {
        document.getElementById('pwaPrompt').classList.remove('active');
    }

    // Обработка изменения размера шрифта
    setFontSize(size) {
        document.documentElement.style.fontSize = `${size}px`;
        localStorage.setItem('khai_fontSize', size);
    }

    // Загрузка настроек
    loadSettings() {
        const fontSize = localStorage.getItem('khai_fontSize');
        if (fontSize) {
            this.setFontSize(fontSize);
            document.getElementById('fontSize').value = fontSize;
        }
        
        const soundEnabled = localStorage.getItem('soundEnabled');
        if (soundEnabled !== null) {
            // Применяем настройки звука
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.khaiInterface = new KHAIInterface();
});

// Service Worker для PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
