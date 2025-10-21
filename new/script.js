// KHAI Chat Application
// Main application script with all features

class KHAIChat {
    constructor() {
        this.currentChat = null;
        this.chats = this.loadChats();
        this.currentModel = 'gpt-4';
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.speechSynthesis = window.speechSynthesis;
        this.currentUtterance = null;
        this.isSpeaking = false;
        this.attachedFiles = [];
        this.currentMode = 'normal'; // 'normal', 'image', 'voice'
        this.currentLanguage = 'ru';
        this.soundsEnabled = true;
        this.isCompactMode = false;
        
        this.initializeApp();
        this.setupEventListeners();
        this.loadCurrentChat();
        this.setupServiceWorker();
    }

    // Инициализация приложения
    initializeApp() {
        console.log('🚀 KHAI Chat Application Initializing...');
        this.applyTheme(this.getStoredTheme());
        this.updateUI();
        this.setupSoundEffects();
        this.showNotification('KHAI готов к работе!', 'success');
    }

    // Настройка Service Worker для PWA
    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('/sw.js');
                console.log('✅ Service Worker registered');
            } catch (error) {
                console.log('❌ Service Worker registration failed:', error);
            }
        }
    }

    // Настройка звуковых эффектов
    setupSoundEffects() {
        this.sounds = {
            message: this.createSound(800, 0.1, 0.1),
            send: this.createSound(1200, 0.1, 0.05),
            error: this.createSound(400, 0.2, 0.3),
            click: this.createSound(600, 0.05, 0.02),
            notification: this.createSound(1000, 0.1, 0.1)
        };
    }

    // Создание звукового эффекта
    createSound(frequency, duration, volume) {
        return () => {
            if (!this.soundsEnabled) return;
            
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + duration);
            } catch (error) {
                console.log('Audio error:', error);
            }
        };
    }

    // Воспроизведение звука
    playSound(soundType) {
        if (this.sounds[soundType]) {
            this.sounds[soundType]();
        }
    }

    // Переключение звуков
    toggleSounds() {
        this.soundsEnabled = !this.soundsEnabled;
        this.saveToStorage('soundsEnabled', this.soundsEnabled);
        this.updateSoundToggle();
        this.playSound('click');
        
        const message = this.soundsEnabled ? '🔊 Звуки включены' : '🔇 Звуки выключены';
        this.showNotification(message, 'info');
    }

    // Обновление переключателя звука
    updateSoundToggle() {
        const soundToggle = document.getElementById('soundToggle');
        if (soundToggle) {
            soundToggle.innerHTML = this.soundsEnabled ? 
                '<i class="fas fa-volume-up"></i>' : 
                '<i class="fas fa-volume-mute"></i>';
            soundToggle.classList.toggle('active', this.soundsEnabled);
        }
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Основные элементы интерфейса
        this.userInput = document.getElementById('userInput');
        this.sendButton = document.getElementById('sendButton');
        this.messagesContainer = document.getElementById('messagesContainer');
        this.attachButton = document.getElementById('attachButton');
        this.fileInput = document.getElementById('fileInput');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.menuToggle = document.getElementById('menuToggle');
        this.sidebarClose = document.getElementById('sidebarClose');
        this.modelSelectBtn = document.getElementById('modelSelectBtn');
        this.modelModal = document.getElementById('modelModal');
        this.modelModalClose = document.getElementById('modelModalClose');
        this.voiceInputBtn = document.getElementById('voiceInputBtn');
        this.clearInputBtn = document.getElementById('clearInputBtn');
        this.searchInput = document.getElementById('searchInput');
        this.chatSearchInput = document.getElementById('chatSearchInput');

        // Кнопки режимов
        this.imageModeBtn = document.getElementById('imageModeBtn');
        this.voiceModeBtn = document.getElementById('voiceModeBtn');
        this.normalModeBtn = document.getElementById('normalModeBtn');

        // Кнопки навигации
        this.scrollToBottomBtn = document.getElementById('scrollToBottomBtn');
        this.scrollToTopBtn = document.getElementById('scrollToTopBtn');

        // Элементы сайдбара
        this.newChatBtn = document.getElementById('newChatBtn');
        this.exportChatBtn = document.getElementById('exportChatBtn');
        this.soundToggle = document.getElementById('soundToggle');

        // Обработчики ввода
        this.userInput.addEventListener('input', this.handleInput.bind(this));
        this.userInput.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.sendButton.addEventListener('click', this.sendMessage.bind(this));

        // Обработчики файлов
        this.attachButton.addEventListener('click', () => {
            this.playSound('click');
            this.fileInput.click();
        });
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Обработчики интерфейса
        this.themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        this.menuToggle.addEventListener('click', this.toggleSidebar.bind(this));
        this.sidebarClose.addEventListener('click', this.toggleSidebar.bind(this));
        this.clearChatBtn.addEventListener('click', this.clearCurrentChat.bind(this));
        this.modelSelectBtn.addEventListener('click', this.showModelModal.bind(this));
        this.modelModalClose.addEventListener('click', this.hideModelModal.bind(this));
        this.modelModal.addEventListener('click', (e) => {
            if (e.target === this.modelModal) this.hideModelModal();
        });

        // Обработчики режимов
        this.imageModeBtn.addEventListener('click', () => this.setMode('image'));
        this.voiceModeBtn.addEventListener('click', () => this.setMode('voice'));
        this.normalModeBtn.addEventListener('click', () => this.setMode('normal'));

        // Обработчики голосового ввода
        this.voiceInputBtn.addEventListener('click', this.toggleVoiceInput.bind(this));
        this.clearInputBtn.addEventListener('click', this.clearUserInput.bind(this));

        // Обработчики навигации
        this.scrollToBottomBtn.addEventListener('click', this.scrollToBottom.bind(this));
        this.scrollToTopBtn.addEventListener('click', this.scrollToTop.bind(this));

        // Обработчики поиска
        this.searchInput.addEventListener('input', this.handleSearch.bind(this));
        this.chatSearchInput.addEventListener('input', this.handleChatSearch.bind(this));

        // Обработчики сайдбара
        this.newChatBtn.addEventListener('click', this.createNewChat.bind(this));
        this.exportChatBtn.addEventListener('click', this.exportCurrentChat.bind(this));
        this.soundToggle.addEventListener('click', this.toggleSounds.bind(this));

        // Глобальные обработчики
        document.addEventListener('click', this.handleDocumentClick.bind(this));
        window.addEventListener('scroll', this.handleScroll.bind(this));
        window.addEventListener('resize', this.handleResize.bind(this));

        // Обработчики для модального окна моделей
        this.setupModelSelection();

        // Обработчики для выбора языка
        this.setupLanguageSelection();

        console.log('✅ Event listeners setup complete');
    }

    // Обработка ввода пользователя
    handleInput() {
        this.updateInputControls();
        this.updateInputProgress();
        this.playSound('click');
    }

    // Обновление элементов управления вводом
    updateInputControls() {
        const hasText = this.userInput.value.trim().length > 0;
        this.clearInputBtn.classList.toggle('visible', hasText);
        
        // Обновление прогресса ввода
        this.updateInputProgress();
    }

    // Обновление прогресс-бара ввода
    updateInputProgress() {
        const text = this.userInput.value;
        const maxChars = 4000;
        const progress = (text.length / maxChars) * 100;
        const progressBar = document.querySelector('.input-progress-bar');
        
        if (progressBar) {
            progressBar.style.width = `${Math.min(progress, 100)}%`;
            progressBar.style.background = progress >= 90 ? 
                'linear-gradient(135deg, #ff6b6b, #ee5a52)' : 
                'var(--accent-gradient)';
        }

        // Обновление статистики
        this.updateInputStats();
    }

    // Обновление статистики ввода
    updateInputStats() {
        const text = this.userInput.value;
        const statsContainer = document.querySelector('.input-stats');
        
        if (statsContainer) {
            const charCount = text.length;
            const fileCount = this.attachedFiles.length;
            const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
            
            statsContainer.innerHTML = `
                <div class="input-stat">
                    <i class="fas fa-font"></i>
                    <span>${charCount}/4000</span>
                </div>
                <div class="input-stat">
                    <i class="fas fa-file"></i>
                    <span>${fileCount}</span>
                </div>
                <div class="input-stat">
                    <i class="fas fa-keyboard"></i>
                    <span>${wordCount}</span>
                </div>
            `;
        }
    }

    // Обработка нажатия клавиш
    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
        
        if (e.key === 'Escape') {
            this.clearUserInput();
        }
    }

    // Отправка сообщения
    async sendMessage() {
        const message = this.userInput.value.trim();
        
        if (!message && this.attachedFiles.length === 0) {
            this.showNotification('Введите сообщение или прикрепите файл', 'warning');
            this.playSound('error');
            return;
        }

        this.playSound('send');

        // Создаем сообщение пользователя
        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: message,
            files: [...this.attachedFiles],
            timestamp: new Date().toISOString(),
            model: this.currentModel
        };

        this.addMessageToChat(userMessage);
        this.renderMessage(userMessage);
        this.clearUserInput();

        // Показываем индикатор набора
        this.showTypingIndicator();

        try {
            let response;
            
            // Обработка в зависимости от режима
            switch (this.currentMode) {
                case 'image':
                    response = await this.generateImageResponse(message);
                    break;
                case 'voice':
                    response = await this.generateVoiceResponse(message);
                    break;
                default:
                    response = await this.generateTextResponse(message);
            }

            this.hideTypingIndicator();
            
            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: response,
                timestamp: new Date().toISOString(),
                model: this.currentModel
            };

            this.addMessageToChat(aiMessage);
            this.renderMessage(aiMessage);
            this.playSound('message');

            // Авто-озвучка для голосового режима
            if (this.currentMode === 'voice') {
                this.speakText(response);
            }

        } catch (error) {
            this.hideTypingIndicator();
            console.error('Error:', error);
            
            const errorMessage = {
                id: Date.now() + 1,
                type: 'error',
                content: 'Произошла ошибка. Пожалуйста, попробуйте еще раз.',
                timestamp: new Date().toISOString()
            };

            this.addMessageToChat(errorMessage);
            this.renderMessage(errorMessage);
            this.playSound('error');
        }
    }

    // Генерация текстового ответа
    async generateTextResponse(message) {
        // Эмуляция API вызова - в реальном приложении здесь будет fetch к API
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        const responses = {
            ru: [
                "Привет! Я KHAI - первый белорусский ИИ. Чем могу помочь?",
                "Интересный вопрос! Давайте разберем его подробнее...",
                "На основе моего анализа, я могу предложить следующее...",
                "Отличный вопрос! Вот что я могу сказать по этой теме...",
                "Я понимаю ваш запрос. Вот мой ответ..."
            ],
            en: [
                "Hello! I'm KHAI - the first Belarusian AI. How can I help you?",
                "Interesting question! Let's break it down...",
                "Based on my analysis, I can suggest the following...",
                "Great question! Here's what I can say about this topic...",
                "I understand your request. Here's my response..."
            ]
        };

        const langResponses = responses[this.currentLanguage] || responses.ru;
        return langResponses[Math.floor(Math.random() * langResponses.length)];
    }

    // Генерация ответа с изображением
    async generateImageResponse(message) {
        await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
        return `🎨 На основе вашего запроса "${message}" я сгенерировал изображение. В реальном приложении здесь будет сгенерированное изображение.`;
    }

    // Генерация голосового ответа
    async generateVoiceResponse(message) {
        await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));
        return `🎤 Голосовой ответ на ваш запрос "${message}". В реальном приложении здесь будет голосовое сообщение.`;
    }

    // Озвучка текста
    speakText(text) {
        if (!this.speechSynthesis || this.isSpeaking) return;

        this.isSpeaking = true;
        this.currentUtterance = new SpeechSynthesisUtterance(text);
        this.currentUtterance.lang = this.currentLanguage === 'ru' ? 'ru-RU' : 'en-US';
        this.currentUtterance.rate = 0.9;
        this.currentUtterance.pitch = 1;

        this.currentUtterance.onend = () => {
            this.isSpeaking = false;
            this.updateSpeakButtons();
        };

        this.currentUtterance.onerror = () => {
            this.isSpeaking = false;
            this.updateSpeakButtons();
        };

        this.speechSynthesis.speak(this.currentUtterance);
        this.updateSpeakButtons();
    }

    // Остановка озвучки
    stopSpeaking() {
        if (this.speechSynthesis && this.isSpeaking) {
            this.speechSynthesis.cancel();
            this.isSpeaking = false;
            this.updateSpeakButtons();
        }
    }

    // Обновление кнопок озвучки
    updateSpeakButtons() {
        document.querySelectorAll('.speak-btn').forEach(btn => {
            btn.classList.toggle('speaking', this.isSpeaking);
            btn.innerHTML = this.isSpeaking ? 
                '<i class="fas fa-stop"></i>' : 
                '<i class="fas fa-volume-up"></i>';
        });
    }

    // Голосовой ввод
    toggleVoiceInput() {
        this.playSound('click');
        
        if (!this.isRecording) {
            this.startVoiceInput();
        } else {
            this.stopVoiceInput();
        }
    }

    // Начало голосового ввода
    async startVoiceInput() {
        if (!navigator.mediaDevices || !window.MediaRecorder) {
            this.showNotification('Голосовой ввод не поддерживается в вашем браузере', 'error');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = () => {
                this.processAudio();
            };

            this.mediaRecorder.start();
            this.isRecording = true;
            this.voiceInputBtn.classList.add('recording');
            this.showNotification('Голосовой ввод активен...', 'info');

        } catch (error) {
            console.error('Error accessing microphone:', error);
            this.showNotification('Не удалось получить доступ к микрофону', 'error');
            this.playSound('error');
        }
    }

    // Остановка голосового ввода
    stopVoiceInput() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            this.isRecording = false;
            this.voiceInputBtn.classList.remove('recording');
        }
    }

    // Обработка аудио
    processAudio() {
        // Эмуляция обработки аудио - в реальном приложении здесь будет отправка на сервер
        const mockText = "Это пример текста, распознанного из голосового ввода";
        this.userInput.value = mockText;
        this.updateInputControls();
        this.showNotification('Голосовое сообщение распознано', 'success');
        this.playSound('notification');
    }

    // Очистка ввода пользователя
    clearUserInput() {
        this.userInput.value = '';
        this.attachedFiles = [];
        this.updateInputControls();
        this.renderAttachedFiles();
        this.playSound('click');
    }

    // Обработка выбора файлов
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        
        files.forEach(file => {
            if (this.attachedFiles.length >= 5) {
                this.showNotification('Можно прикрепить не более 5 файлов', 'warning');
                return;
            }

            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                this.showNotification(`Файл ${file.name} слишком большой`, 'error');
                return;
            }

            this.attachedFiles.push({
                name: file.name,
                type: file.type,
                size: file.size,
                url: URL.createObjectURL(file)
            });
        });

        this.renderAttachedFiles();
        this.updateInputStats();
        this.playSound('click');
        event.target.value = '';
    }

    // Отображение прикрепленных файлов
    renderAttachedFiles() {
        const container = document.querySelector('.attached-files');
        if (!container) return;

        container.innerHTML = this.attachedFiles.map(file => `
            <div class="attached-file">
                <i class="fas ${this.getFileIcon(file.type)}"></i>
                <span>${file.name}</span>
                <button class="remove-file" onclick="app.removeAttachedFile('${file.name}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }

    // Получение иконки для типа файла
    getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return 'fa-image';
        if (fileType.startsWith('video/')) return 'fa-video';
        if (fileType.startsWith('audio/')) return 'fa-music';
        if (fileType.includes('pdf')) return 'fa-file-pdf';
        if (fileType.includes('word') || fileType.includes('document')) return 'fa-file-word';
        return 'fa-file';
    }

    // Удаление прикрепленного файла
    removeAttachedFile(fileName) {
        this.attachedFiles = this.attachedFiles.filter(file => file.name !== fileName);
        this.renderAttachedFiles();
        this.updateInputStats();
        this.playSound('click');
    }

    // Установка режима работы
    setMode(mode) {
        this.currentMode = mode;
        this.updateModeUI();
        this.playSound('click');
        
        const modeNames = {
            normal: 'Обычный режим',
            image: 'Режим изображений',
            voice: 'Голосовой режим'
        };
        
        this.showNotification(`${modeNames[mode]} активирован`, 'info');
    }

    // Обновление интерфейса режима
    updateModeUI() {
        // Обновление кнопок режимов
        [this.imageModeBtn, this.voiceModeBtn, this.normalModeBtn].forEach(btn => {
            btn.classList.remove('active', 'image-mode', 'voice-mode', 'normal-mode');
        });

        const activeBtn = {
            image: this.imageModeBtn,
            voice: this.voiceModeBtn,
            normal: this.normalModeBtn
        }[this.currentMode];

        if (activeBtn) {
            activeBtn.classList.add('active', `${this.currentMode}-mode`);
        }

        // Обновление индикатора режима
        this.updateModeIndicator();
    }

    // Обновление индикатора режима
    updateModeIndicator() {
        const indicator = document.querySelector('.mode-indicator');
        if (!indicator) return;

        const modeConfig = {
            normal: { text: '📝 Обычный режим', class: 'normal-mode' },
            image: { text: '🎨 Режим генерации изображений', class: 'image-mode' },
            voice: { text: '🎤 Голосовой режим', class: 'voice-mode' }
        };

        const config = modeConfig[this.currentMode];
        indicator.className = `mode-indicator ${config.class}`;
        indicator.innerHTML = `
            <i class="fas ${this.getModeIcon()}"></i>
            <span>${config.text}</span>
        `;
    }

    // Получение иконки для режима
    getModeIcon() {
        return {
            normal: 'fa-keyboard',
            image: 'fa-image',
            voice: 'fa-microphone'
        }[this.currentMode];
    }

    // Настройка выбора модели
    setupModelSelection() {
        const modelItems = document.querySelectorAll('.model-item');
        modelItems.forEach(item => {
            item.addEventListener('click', () => {
                const model = item.dataset.model;
                this.selectModel(model);
                this.hideModelModal();
            });
        });
    }

    // Выбор модели
    selectModel(model) {
        this.currentModel = model;
        this.updateModelButton();
        this.saveToStorage('currentModel', model);
        this.playSound('click');
        
        this.showNotification(`Модель изменена на: ${model}`, 'success');
    }

    // Обновление кнопки выбора модели
    updateModelButton() {
        const modelNames = {
            'gpt-4': 'GPT-4',
            'gpt-3.5': 'GPT-3.5 Turbo',
            'claude-2': 'Claude 2',
            'bard': 'Google Bard'
        };

        this.modelSelectBtn.innerHTML = `
            <i class="fas fa-robot"></i>
            <span>${modelNames[this.currentModel] || this.currentModel}</span>
            <i class="fas fa-chevron-down"></i>
        `;
    }

    // Показать модальное окно выбора модели
    showModelModal() {
        this.modelModal.classList.add('active');
        this.playSound('click');
    }

    // Скрыть модальное окно выбора модели
    hideModelModal() {
        this.modelModal.classList.remove('active');
        this.playSound('click');
    }

    // Настройка выбора языка
    setupLanguageSelection() {
        const langButtons = document.querySelectorAll('.lang-btn');
        langButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.dataset.lang;
                this.setLanguage(lang);
            });
        });
    }

    // Установка языка
    setLanguage(lang) {
        this.currentLanguage = lang;
        this.updateLanguageUI();
        this.saveToStorage('currentLanguage', lang);
        this.playSound('click');
        
        const langNames = { ru: 'Русский', en: 'English' };
        this.showNotification(`Язык изменен на: ${langNames[lang]}`, 'success');
    }

    // Обновление интерфейса языка
    updateLanguageUI() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === this.currentLanguage);
        });
    }

    // Работа с чатами
    loadChats() {
        try {
            const chats = localStorage.getItem('khai_chats');
            return chats ? JSON.parse(chats) : [this.createNewChatData()];
        } catch (error) {
            console.error('Error loading chats:', error);
            return [this.createNewChatData()];
        }
    }

    // Создание данных нового чата
    createNewChatData() {
        return {
            id: Date.now(),
            title: 'Новый чат',
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    // Загрузка текущего чата
    loadCurrentChat() {
        const savedChatId = localStorage.getItem('currentChatId');
        this.currentChat = this.chats.find(chat => chat.id == savedChatId) || this.chats[0];
        this.renderChat();
    }

    // Создание нового чата
    createNewChat() {
        const newChat = this.createNewChatData();
        this.chats.unshift(newChat);
        this.currentChat = newChat;
        this.saveChats();
        this.renderChat();
        this.renderChatList();
        this.playSound('click');
        this.showNotification('Новый чат создан', 'success');
    }

    // Очистка текущего чата
    clearCurrentChat() {
        if (this.currentChat.messages.length === 0) {
            this.showNotification('Чат уже пуст', 'info');
            return;
        }

        if (confirm('Вы уверены, что хотите очистить чат?')) {
            this.currentChat.messages = [];
            this.saveChats();
            this.renderChat();
            this.playSound('click');
            this.showNotification('Чат очищен', 'success');
        }
    }

    // Экспорт текущего чата
    exportCurrentChat() {
        const chatData = {
            ...this.currentChat,
            exportedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khai-chat-${this.currentChat.id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.playSound('click');
        this.showNotification('Чат экспортирован', 'success');
    }

    // Добавление сообщения в чат
    addMessageToChat(message) {
        this.currentChat.messages.push(message);
        this.currentChat.updatedAt = new Date().toISOString();
        
        // Обновление заголовка чата на основе первого сообщения
        if (this.currentChat.messages.length === 1 && message.type === 'user') {
            this.currentChat.title = message.content.substring(0, 50) + (message.content.length > 50 ? '...' : '');
        }
        
        this.saveChats();
        this.renderChatList();
    }

    // Отображение чата
    renderChat() {
        this.messagesContainer.innerHTML = '';
        this.currentChat.messages.forEach(message => this.renderMessage(message));
        this.scrollToBottom();
        this.updateChatInfo();
    }

    // Отображение сообщения
    renderMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${message.type}`;
        messageElement.dataset.messageId = message.id;

        let content = this.formatMessageContent(message.content);
        
        if (message.files && message.files.length > 0) {
            content += this.renderMessageFiles(message.files);
        }

        messageElement.innerHTML = `
            <div class="message-content">${content}</div>
            ${this.renderMessageActions(message)}
            ${message.model ? `<div class="model-indicator">Модель: ${message.model}</div>` : ''}
        `;

        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();

        // Добавляем обработчики для кнопок действий
        this.setupMessageActionHandlers(messageElement, message);
    }

    // Форматирование содержимого сообщения
    formatMessageContent(content) {
        // Простое форматирование Markdown
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    // Отображение файлов сообщения
    renderMessageFiles(files) {
        return files.map(file => `
            <div class="message-image">
                <img src="${file.url}" alt="${file.name}" loading="lazy">
            </div>
        `).join('');
    }

    // Отображение действий с сообщением
    renderMessageActions(message) {
        if (message.type === 'error') return '';

        return `
            <div class="message-actions">
                <button class="action-btn-small copy-btn" onclick="app.copyMessage(${message.id})">
                    <i class="fas fa-copy"></i> Копировать
                </button>
                ${message.type === 'ai' ? `
                    <button class="action-btn-small speak-btn" onclick="app.toggleMessageSpeech(${message.id})">
                        <i class="fas fa-volume-up"></i> Озвучить
                    </button>
                ` : ''}
                <button class="action-btn-small" onclick="app.regenerateMessage(${message.id})">
                    <i class="fas fa-redo"></i> Перегенерировать
                </button>
            </div>
        `;
    }

    // Настройка обработчиков действий сообщения
    setupMessageActionHandlers(messageElement, message) {
        // Обработчики уже добавлены через onclick для простоты
    }

    // Копирование сообщения
    copyMessage(messageId) {
        const message = this.currentChat.messages.find(m => m.id === messageId);
        if (message) {
            navigator.clipboard.writeText(message.content).then(() => {
                this.showNotification('Сообщение скопировано', 'success');
                this.playSound('click');
            });
        }
    }

    // Переключение озвучки сообщения
    toggleMessageSpeech(messageId) {
        const message = this.currentChat.messages.find(m => m.id === messageId);
        if (message) {
            if (this.isSpeaking) {
                this.stopSpeaking();
            } else {
                this.speakText(message.content);
            }
        }
    }

    // Регенерация сообщения
    regenerateMessage(messageId) {
        const messageIndex = this.currentChat.messages.findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
            const userMessage = this.currentChat.messages[messageIndex - 1];
            if (userMessage && userMessage.type === 'user') {
                this.currentChat.messages.splice(messageIndex, 1);
                this.renderChat();
                this.sendMessageFromHistory(userMessage.content);
            }
        }
    }

    // Отправка сообщения из истории
    sendMessageFromHistory(content) {
        this.userInput.value = content;
        this.sendMessage();
    }

    // Отображение индикатора набора
    showTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message message-ai typing-indicator';
        indicator.id = 'typingIndicator';
        indicator.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <span>KHAI печатает...</span>
        `;
        this.messagesContainer.appendChild(indicator);
        this.scrollToBottom();
    }

    // Скрытие индикатора набора
    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // Прокрутка вниз
    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    // Прокрутка вверх
    scrollToTop() {
        this.messagesContainer.scrollTop = 0;
    }

    // Обработка прокрутки
    handleScroll() {
        this.updateScrollProgress();
        this.updateNavigationControls();
    }

    // Обновление прогресса прокрутки
    updateScrollProgress() {
        const scrollProgress = document.querySelector('.scroll-progress-bar');
        if (scrollProgress) {
            const scrollTop = this.messagesContainer.scrollTop;
            const scrollHeight = this.messagesContainer.scrollHeight - this.messagesContainer.clientHeight;
            const progress = (scrollTop / scrollHeight) * 100;
            scrollProgress.style.width = `${progress}%`;
        }
    }

    // Обновление элементов управления навигацией
    updateNavigationControls() {
        const scrollTop = this.messagesContainer.scrollTop;
        const scrollHeight = this.messagesContainer.scrollHeight - this.messagesContainer.clientHeight;
        const navigationControls = document.querySelector('.navigation-controls');

        if (navigationControls) {
            const isAtBottom = scrollTop >= scrollHeight - 100;
            const isAtTop = scrollTop <= 100;

            navigationControls.classList.toggle('hidden', isAtBottom && isAtTop);
            
            this.scrollToBottomBtn.style.display = isAtBottom ? 'none' : 'flex';
            this.scrollToTopBtn.style.display = isAtTop ? 'none' : 'flex';
        }
    }

    // Обработка поиска
    handleSearch() {
        const query = this.searchInput.value.toLowerCase();
        // Реализация поиска по сообщениям
        console.log('Searching for:', query);
    }

    // Обработка поиска по чатам
    handleChatSearch() {
        const query = this.chatSearchInput.value.toLowerCase();
        this.renderChatList(query);
    }

    // Отображение списка чатов
    renderChatList(searchQuery = '') {
        const chatList = document.querySelector('.chat-list');
        if (!chatList) return;

        const filteredChats = searchQuery ? 
            this.chats.filter(chat => chat.title.toLowerCase().includes(searchQuery)) :
            this.chats;

        chatList.innerHTML = filteredChats.map(chat => `
            <div class="chat-item ${chat.id === this.currentChat.id ? 'active' : ''}" 
                 onclick="app.selectChat(${chat.id})">
                <div class="chat-title">${chat.title}</div>
                <div class="chat-actions">
                    <button class="chat-action-btn" onclick="app.renameChat(${chat.id}, event)">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="chat-action-btn delete" onclick="app.deleteChat(${chat.id}, event)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Выбор чата
    selectChat(chatId) {
        this.currentChat = this.chats.find(chat => chat.id === chatId);
        this.saveToStorage('currentChatId', chatId);
        this.renderChat();
        this.renderChatList();
        this.toggleSidebar();
        this.playSound('click');
    }

    // Переименование чата
    renameChat(chatId, event) {
        event.stopPropagation();
        const chat = this.chats.find(c => c.id === chatId);
        const newTitle = prompt('Введите новое название чата:', chat.title);
        
        if (newTitle && newTitle.trim()) {
            chat.title = newTitle.trim();
            chat.updatedAt = new Date().toISOString();
            this.saveChats();
            this.renderChatList();
            this.playSound('click');
            this.showNotification('Чат переименован', 'success');
        }
    }

    // Удаление чата
    deleteChat(chatId, event) {
        event.stopPropagation();
        
        if (this.chats.length <= 1) {
            this.showNotification('Нельзя удалить последний чат', 'warning');
            return;
        }

        if (confirm('Вы уверены, что хотите удалить этот чат?')) {
            this.chats = this.chats.filter(chat => chat.id !== chatId);
            
            if (this.currentChat.id === chatId) {
                this.currentChat = this.chats[0];
                this.saveToStorage('currentChatId', this.currentChat.id);
            }
            
            this.saveChats();
            this.renderChat();
            this.renderChatList();
            this.playSound('click');
            this.showNotification('Чат удален', 'success');
        }
    }

    // Обновление информации о чате
    updateChatInfo() {
        const chatInfo = document.querySelector('.current-chat-info');
        if (chatInfo) {
            chatInfo.innerHTML = `
                <i class="fas fa-comment"></i>
                <span>${this.currentChat.title}</span>
            `;
        }
    }

    // Сохранение чатов
    saveChats() {
        try {
            localStorage.setItem('khai_chats', JSON.stringify(this.chats));
        } catch (error) {
            console.error('Error saving chats:', error);
        }
    }

    // Сохранение в хранилище
    saveToStorage(key, value) {
        try {
            localStorage.setItem(`khai_${key}`, JSON.stringify(value));
        } catch (error) {
            console.error('Error saving to storage:', error);
        }
    }

    // Загрузка из хранилища
    loadFromStorage(key, defaultValue) {
        try {
            const item = localStorage.getItem(`khai_${key}`);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error loading from storage:', error);
            return defaultValue;
        }
    }

    // Переключение темы
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        this.saveToStorage('theme', newTheme);
        this.playSound('click');
        
        this.showNotification(`Тема изменена на ${newTheme === 'light' ? 'светлую' : 'темную'}`, 'info');
    }

    // Применение темы
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.themeToggle.innerHTML = theme === 'light' ? 
            '<i class="fas fa-moon"></i>' : 
            '<i class="fas fa-sun"></i>';
    }

    // Получение сохраненной темы
    getStoredTheme() {
        return this.loadFromStorage('theme', 'dark');
    }

    // Переключение сайдбара
    toggleSidebar() {
        document.querySelector('.sidebar-menu').classList.toggle('active');
        this.playSound('click');
    }

    // Обработка клика по документу
    handleDocumentClick(event) {
        // Закрытие сайдбара при клике вне его
        const sidebar = document.querySelector('.sidebar-menu');
        const menuToggle = document.getElementById('menuToggle');
        
        if (sidebar && menuToggle && 
            !sidebar.contains(event.target) && 
            !menuToggle.contains(event.target) &&
            sidebar.classList.contains('active')) {
            this.toggleSidebar();
        }
    }

    // Обработка изменения размера
    handleResize() {
        this.updateCompactMode();
    }

    // Обновление компактного режима
    updateCompactMode() {
        const width = window.innerWidth;
        const isCompact = width < 768;
        
        if (isCompact !== this.isCompactMode) {
            this.isCompactMode = isCompact;
            document.body.classList.toggle('compact-mode', isCompact);
            
            // Обновление классов компактности
            document.querySelectorAll('.app-header, .input-section, .app-footer').forEach(el => {
                el.classList.toggle('compact', isCompact);
            });
            
            document.querySelector('.messages-container').classList.toggle('expanded', isCompact);
            document.querySelector('.chat-main').classList.toggle('expanded', isCompact);
        }
    }

    // Показать уведомление
    showNotification(message, type = 'info') {
        const container = document.querySelector('.notifications-container');
        if (!container) return;

        // Удаляем предыдущее уведомление
        const existingNotification = container.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">${message}</div>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(notification);
        this.playSound('notification');

        // Автоматическое удаление через 5 секунд
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Обновление интерфейса
    updateUI() {
        this.updateModelButton();
        this.updateModeUI();
        this.updateLanguageUI();
        this.updateSoundToggle();
        this.updateCompactMode();
        this.updateNavigationControls();
        this.updateInputControls();
        this.renderChatList();
    }
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.app = new KHAIChat();
});

// Обработка ошибок
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Обработка отклоненных промисов
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
