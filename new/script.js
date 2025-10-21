// KHAI - AI Chat Application
// Основной файл JavaScript с полной функциональностью

class KHAIChat {
    constructor() {
        this.currentChat = null;
        this.chats = this.loadChats();
        this.currentModel = this.loadModel();
        this.settings = this.loadSettings();
        this.sounds = this.initializeSounds();
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.attachedFiles = [];
        this.currentMode = 'text';
        this.isSpeaking = false;
        this.speechSynthesis = window.speechSynthesis;
        this.currentUtterance = null;
        
        this.initializeApp();
        this.bindEvents();
        this.showNotification('Добро пожаловать в KHAI!', 'info');
    }

    // Инициализация приложения
    initializeApp() {
        this.initializeTheme();
        this.initializeChat();
        this.initializeInput();
        this.initializeSidebar();
        this.initializeModals();
        this.initializeSounds();
        this.updateUI();
    }

    // Загрузка чатов из localStorage
    loadChats() {
        try {
            const saved = localStorage.getItem('khai_chats');
            return saved ? JSON.parse(saved) : [this.createNewChat()];
        } catch (error) {
            console.error('Ошибка загрузки чатов:', error);
            return [this.createNewChat()];
        }
    }

    // Сохранение чатов в localStorage
    saveChats() {
        try {
            localStorage.setItem('khai_chats', JSON.stringify(this.chats));
        } catch (error) {
            console.error('Ошибка сохранения чатов:', error);
        }
    }

    // Загрузка модели из localStorage
    loadModel() {
        try {
            return localStorage.getItem('khai_model') || 'gpt-4';
        } catch (error) {
            console.error('Ошибка загрузки модели:', error);
            return 'gpt-4';
        }
    }

    // Сохранение модели в localStorage
    saveModel() {
        try {
            localStorage.setItem('khai_model', this.currentModel);
        } catch (error) {
            console.error('Ошибка сохранения модели:', error);
        }
    }

    // Загрузка настроек из localStorage
    loadSettings() {
        try {
            const saved = localStorage.getItem('khai_settings');
            const defaultSettings = {
                soundsEnabled: true,
                language: 'ru',
                theme: 'dark'
            };
            return saved ? {...defaultSettings, ...JSON.parse(saved)} : defaultSettings;
        } catch (error) {
            console.error('Ошибка загрузки настроек:', error);
            return {
                soundsEnabled: true,
                language: 'ru',
                theme: 'dark'
            };
        }
    }

    // Сохранение настроек в localStorage
    saveSettings() {
        try {
            localStorage.setItem('khai_settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Ошибка сохранения настроек:', error);
        }
    }

    // Инициализация звуков
    initializeSounds() {
        // Создаем звуковые элементы
        const sounds = {
            message: this.createSound('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=='),
            error: this.createSound('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=='),
            send: this.createSound('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=='),
            click: this.createSound('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==')
        };
        
        // В реальном приложении здесь будут реальные звуковые файлы
        return sounds;
    }

    // Создание звукового элемента
    createSound(src) {
        const audio = new Audio();
        audio.src = src;
        audio.preload = 'auto';
        return audio;
    }

    // Воспроизведение звука
    playSound(type) {
        if (!this.settings.soundsEnabled || !this.sounds[type]) return;
        
        try {
            const sound = this.sounds[type].cloneNode();
            sound.volume = 0.3;
            sound.play().catch(e => console.log('Ошибка воспроизведения звука:', e));
        } catch (error) {
            console.log('Ошибка воспроизведения звука:', error);
        }
    }

    // Создание нового чата
    createNewChat() {
        const newChat = {
            id: Date.now().toString(),
            title: 'Новый чат',
            messages: [],
            createdAt: new Date().toISOString(),
            model: this.currentModel
        };
        return newChat;
    }

    // Инициализация темы
    initializeTheme() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        this.updateThemeButton();
    }

    // Переключение темы
    toggleTheme() {
        this.settings.theme = this.settings.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        this.updateThemeButton();
        this.saveSettings();
        this.playSound('click');
    }

    // Обновление кнопки темы
    updateThemeButton() {
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            const icon = themeBtn.querySelector('i');
            if (icon) {
                icon.className = this.settings.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    // Инициализация чата
    initializeChat() {
        if (this.chats.length === 0) {
            this.chats.push(this.createNewChat());
        }
        this.currentChat = this.chats[this.chats.length - 1];
        this.renderChat();
        this.renderChatList();
    }

    // Инициализация поля ввода
    initializeInput() {
        const userInput = document.getElementById('userInput');
        const clearBtn = document.querySelector('.clear-input-btn');
        
        if (userInput) {
            // Автоматическое изменение высоты
            userInput.addEventListener('input', () => {
                this.adjustTextareaHeight(userInput);
                this.toggleClearButton();
                this.updateInputStats();
            });
            
            // Отправка по Enter (Ctrl+Enter для новой строки)
            userInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }
        
        // Обработчик для кнопки очистки
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearInput();
                this.playSound('click');
            });
        }
        
        this.updateInputStats();
    }

    // Настройка высоты textarea
    adjustTextareaHeight(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    // Показать/скрыть кнопку очистки
    toggleClearButton() {
        const userInput = document.getElementById('userInput');
        const clearBtn = document.querySelector('.clear-input-btn');
        
        if (userInput && clearBtn) {
            if (userInput.value.trim()) {
                clearBtn.style.display = 'flex';
            } else {
                clearBtn.style.display = 'none';
            }
        }
    }

    // Обновление статистики ввода
    updateInputStats() {
        const userInput = document.getElementById('userInput');
        const charCount = document.querySelector('.char-count');
        const fileCount = document.querySelector('.file-count');
        const progressBar = document.querySelector('.stat-progress-bar');
        
        if (userInput && charCount) {
            const length = userInput.value.length;
            charCount.textContent = `${length}/4000`;
            
            // Обновление прогресс-бара
            if (progressBar) {
                const progress = Math.min((length / 4000) * 100, 100);
                progressBar.style.width = `${progress}%`;
                
                // Изменение цвета при приближении к лимиту
                if (length > 3500) {
                    progressBar.style.background = 'var(--error-text)';
                } else if (length > 2000) {
                    progressBar.style.background = 'var(--warning-text)';
                } else {
                    progressBar.style.background = 'var(--accent-gradient)';
                }
            }
        }
        
        if (fileCount) {
            fileCount.textContent = `${this.attachedFiles.length}/5`;
        }
    }

    // Очистка поля ввода
    clearInput() {
        const userInput = document.getElementById('userInput');
        if (userInput) {
            userInput.value = '';
            userInput.style.height = 'auto';
            this.toggleClearButton();
            this.updateInputStats();
        }
        this.clearAttachedFiles();
    }

    // Очистка прикрепленных файлов
    clearAttachedFiles() {
        this.attachedFiles = [];
        this.renderAttachedFiles();
        this.updateInputStats();
    }

    // Инициализация сайдбара
    initializeSidebar() {
        this.renderChatList();
        this.initializeLanguageSelector();
        this.initializeSoundToggle();
    }

    // Инициализация выбора языка
    initializeLanguageSelector() {
        const langSelect = document.getElementById('languageSelect');
        if (langSelect) {
            langSelect.value = this.settings.language;
            langSelect.addEventListener('change', (e) => {
                this.settings.language = e.target.value;
                this.saveSettings();
                this.playSound('click');
                this.showNotification(`Язык изменен на: ${e.target.selectedOptions[0].text}`, 'info');
            });
        }
    }

    // Инициализация переключателя звука
    initializeSoundToggle() {
        const soundToggle = document.querySelector('.sound-toggle');
        if (soundToggle) {
            soundToggle.classList.toggle('active', this.settings.soundsEnabled);
            soundToggle.addEventListener('click', () => {
                this.settings.soundsEnabled = !this.settings.soundsEnabled;
                soundToggle.classList.toggle('active', this.settings.soundsEnabled);
                this.saveSettings();
                this.playSound('click');
                
                const status = this.settings.soundsEnabled ? 'включены' : 'выключены';
                this.showNotification(`Звуки ${status}`, 'info');
            });
        }
    }

    // Инициализация модальных окон
    initializeModals() {
        this.initializeModelModal();
    }

    // Инициализация модального окна выбора модели
    initializeModelModal() {
        const modelBtn = document.querySelector('.model-select-btn');
        const modelModal = document.querySelector('.model-modal');
        const modalOverlay = document.querySelector('.modal-overlay');
        
        if (modelBtn && modalOverlay) {
            modelBtn.addEventListener('click', () => {
                this.openModelModal();
                this.playSound('click');
            });
        }
        
        // Закрытие модального окна
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.closeModelModal();
                }
            });
            
            const closeBtn = modalOverlay.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.closeModelModal();
                    this.playSound('click');
                });
            }
        }
        
        // Выбор модели
        const modelItems = document.querySelectorAll('.model-item');
        modelItems.forEach(item => {
            item.addEventListener('click', () => {
                const model = item.dataset.model;
                this.selectModel(model);
                this.playSound('click');
            });
        });
    }

    // Открытие модального окна выбора модели
    openModelModal() {
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
            modalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Показать текущую выбранную модель
            const modelItems = document.querySelectorAll('.model-item');
            modelItems.forEach(item => {
                item.classList.toggle('active', item.dataset.model === this.currentModel);
            });
        }
    }

    // Закрытие модального окна выбора модели
    closeModelModal() {
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) {
            modalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Выбор модели
    selectModel(model) {
        this.currentModel = model;
        if (this.currentChat) {
            this.currentChat.model = model;
        }
        this.saveModel();
        this.saveChats();
        this.updateModelButton();
        this.closeModelModal();
        this.showNotification(`Модель изменена на: ${this.getModelName(model)}`, 'success');
    }

    // Получение имени модели для отображения
    getModelName(modelKey) {
        const models = {
            'gpt-4': 'GPT-4 Turbo',
            'gpt-3.5': 'GPT-3.5 Turbo',
            'claude-3': 'Claude 3 Opus',
            'gemini-pro': 'Gemini Pro'
        };
        return models[modelKey] || modelKey;
    }

    // Обновление кнопки выбора модели
    updateModelButton() {
        const modelBtn = document.querySelector('.model-select-btn');
        if (modelBtn) {
            const icon = modelBtn.querySelector('i');
            const span = modelBtn.querySelector('span');
            
            if (icon) {
                // Разные иконки для разных моделей
                const icons = {
                    'gpt-4': 'fas fa-brain',
                    'gpt-3.5': 'fas fa-bolt',
                    'claude-3': 'fas fa-cloud',
                    'gemini-pro': 'fas fa-gem'
                };
                icon.className = icons[this.currentModel] || 'fas fa-robot';
            }
            
            if (span) {
                span.textContent = this.getModelName(this.currentModel);
            }
        }
    }

    // Привязка событий
    bindEvents() {
        // Отправка сообщения
        const sendBtn = document.getElementById('sendButton');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                this.sendMessage();
                this.playSound('send');
            });
        }
        
        // Очистка чата
        const clearBtn = document.getElementById('clearChat');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearCurrentChat();
                this.playSound('click');
            });
        }
        
        // Скачивание чата
        const downloadBtn = document.getElementById('downloadChat');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadChat();
                this.playSound('click');
            });
        }
        
        // Переключение темы
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
        
        // Открытие/закрытие сайдбара
        const menuBtn = document.getElementById('menuToggle');
        const sidebar = document.querySelector('.sidebar-menu');
        const sidebarClose = document.querySelector('.sidebar-close');
        
        if (menuBtn && sidebar) {
            menuBtn.addEventListener('click', () => {
                sidebar.classList.add('active');
                document.body.style.overflow = 'hidden';
                this.playSound('click');
            });
        }
        
        if (sidebarClose) {
            sidebarClose.addEventListener('click', () => {
                sidebar.classList.remove('active');
                document.body.style.overflow = '';
                this.playSound('click');
            });
        }
        
        // Создание нового чата
        const newChatBtn = document.getElementById('newChat');
        if (newChatBtn) {
            newChatBtn.addEventListener('click', () => {
                this.createChat();
                this.playSound('click');
            });
        }
        
        // Прикрепление файлов
        const attachBtn = document.querySelector('.attach-btn');
        const fileInput = document.getElementById('fileInput');
        
        if (attachBtn && fileInput) {
            attachBtn.addEventListener('click', () => {
                fileInput.click();
                this.playSound('click');
            });
            
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelect(e);
            });
        }
        
        // Переключение режимов
        const modeButtons = document.querySelectorAll('.action-btn[data-mode]');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                this.setMode(mode);
                this.playSound('click');
            });
        });
        
        // Голосовой ввод
        const voiceBtn = document.querySelector('.input-btn.voice');
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => {
                this.toggleVoiceRecording();
                this.playSound('click');
            });
        }
        
        // Навигация по чату
        this.initializeChatNavigation();
        
        // Поиск по сообщениям
        const searchInput = document.getElementById('headerSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchMessages(e.target.value);
            });
        }
        
        // Поиск по чатам
        const chatSearch = document.getElementById('chatSearchInput');
        if (chatSearch) {
            chatSearch.addEventListener('input', (e) => {
                this.searchChats(e.target.value);
            });
        }
        
        // Обработка глобальных событий
        document.addEventListener('click', (e) => {
            // Закрытие сайдбара при клике вне его
            if (sidebar && sidebar.classList.contains('active') && 
                !sidebar.contains(e.target) && 
                e.target !== menuBtn) {
                sidebar.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Обработка клавиш
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModelModal();
                sidebar.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        // Обработка скролла
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer) {
            messagesContainer.addEventListener('scroll', () => {
                this.handleScroll();
            });
        }
    }

    // Инициализация навигации по чату
    initializeChatNavigation() {
        const upBtn = document.querySelector('.nav-btn.up');
        const downBtn = document.querySelector('.nav-btn.down');
        
        if (upBtn) {
            upBtn.addEventListener('click', () => {
                this.scrollToMessage('up');
                this.playSound('click');
            });
        }
        
        if (downBtn) {
            downBtn.addEventListener('click', () => {
                this.scrollToMessage('down');
                this.playSound('click');
            });
        }
    }

    // Обработка скролла
    handleScroll() {
        this.updateScrollProgress();
        this.toggleNavigationButtons();
    }

    // Обновление прогресс-бара скролла
    updateScrollProgress() {
        const container = document.querySelector('.messages-container');
        const progressBar = document.querySelector('.scroll-progress-bar');
        
        if (container && progressBar) {
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight - container.clientHeight;
            const progress = (scrollTop / scrollHeight) * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    // Показать/скрыть кнопки навигации
    toggleNavigationButtons() {
        const container = document.querySelector('.messages-container');
        const navContainer = document.querySelector('.chat-navigation');
        
        if (container && navContainer) {
            const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 10;
            const isAtTop = container.scrollTop < 10;
            
            // Показываем/скрываем в зависимости от положения скролла
            if (isAtBottom && isAtTop) {
                // Контейнер пустой или слишком маленький
                navContainer.classList.add('hidden');
            } else {
                navContainer.classList.remove('hidden');
            }
        }
    }

    // Прокрутка к сообщению
    scrollToMessage(direction) {
        const container = document.querySelector('.messages-container');
        if (!container) return;
        
        const messages = container.querySelectorAll('.message');
        if (messages.length === 0) return;
        
        let targetMessage;
        
        if (direction === 'up') {
            // Прокрутка к предыдущему сообщению
            const viewportTop = container.scrollTop;
            for (let i = messages.length - 1; i >= 0; i--) {
                const messageTop = messages[i].offsetTop;
                if (messageTop < viewportTop - 50) {
                    targetMessage = messages[i];
                    break;
                }
            }
            if (!targetMessage) targetMessage = messages[0];
        } else {
            // Прокрутка к следующему сообщению
            const viewportBottom = container.scrollTop + container.clientHeight;
            for (let i = 0; i < messages.length; i++) {
                const messageBottom = messages[i].offsetTop + messages[i].offsetHeight;
                if (messageBottom > viewportBottom + 50) {
                    targetMessage = messages[i];
                    break;
                }
            }
            if (!targetMessage) targetMessage = messages[messages.length - 1];
        }
        
        if (targetMessage) {
            targetMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Установка режима работы
    setMode(mode) {
        this.currentMode = mode;
        this.updateModeIndicator();
        this.updateModeButtons();
        
        // Специфичные действия для каждого режима
        switch (mode) {
            case 'image':
                this.showNotification('Режим генерации изображений активирован', 'info');
                break;
            case 'voice':
                this.showNotification('Голосовой режим активирован', 'info');
                break;
            case 'text':
                this.showNotification('Текстовый режим активирован', 'info');
                break;
        }
    }

    // Обновление индикатора режима
    updateModeIndicator() {
        const indicator = document.querySelector('.mode-indicator');
        if (!indicator) return;
        
        indicator.className = `mode-indicator ${this.currentMode}-mode`;
        
        const modes = {
            'image': { icon: 'fas fa-image', text: 'Режим генерации изображений' },
            'voice': { icon: 'fas fa-microphone', text: 'Голосовой режим' },
            'text': { icon: 'fas fa-keyboard', text: 'Текстовый режим' }
        };
        
        const modeInfo = modes[this.currentMode];
        if (modeInfo) {
            indicator.innerHTML = `
                <i class="${modeInfo.icon}"></i>
                <span>${modeInfo.text}</span>
            `;
        }
    }

    // Обновление кнопок режимов
    updateModeButtons() {
        const modeButtons = document.querySelectorAll('.action-btn[data-mode]');
        modeButtons.forEach(btn => {
            if (btn.dataset.mode === this.currentMode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Обработка выбора файлов
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        const maxFiles = 5 - this.attachedFiles.length;
        
        if (files.length > maxFiles) {
            this.showNotification(`Можно прикрепить не более 5 файлов. Доступно мест: ${maxFiles}`, 'warning');
            files.splice(maxFiles);
        }
        
        files.forEach(file => {
            if (this.isFileTypeSupported(file)) {
                this.attachedFiles.push({
                    file: file,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    url: URL.createObjectURL(file)
                });
            } else {
                this.showNotification(`Файл "${file.name}" не поддерживается`, 'error');
            }
        });
        
        this.renderAttachedFiles();
        this.updateInputStats();
        event.target.value = '';
        
        if (files.length > 0) {
            this.playSound('message');
        }
    }

    // Проверка поддержки типа файла
    isFileTypeSupported(file) {
        const supportedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
            'text/plain', 'application/pdf',
            'audio/mpeg', 'audio/wav', 'audio/ogg'
        ];
        return supportedTypes.includes(file.type);
    }

    // Отрисовка прикрепленных файлов
    renderAttachedFiles() {
        const container = document.querySelector('.attached-files');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.attachedFiles.forEach((file, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            fileElement.innerHTML = `
                <i class="fas fa-file"></i>
                <span>${file.name}</span>
                <button class="remove-file" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            container.appendChild(fileElement);
        });
        
        // Обработчики для кнопок удаления
        const removeButtons = container.querySelectorAll('.remove-file');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.removeAttachedFile(index);
                this.playSound('click');
            });
        });
    }

    // Удаление прикрепленного файла
    removeAttachedFile(index) {
        if (this.attachedFiles[index]) {
            URL.revokeObjectURL(this.attachedFiles[index].url);
            this.attachedFiles.splice(index, 1);
            this.renderAttachedFiles();
            this.updateInputStats();
        }
    }

    // Переключение голосового ввода
    toggleVoiceRecording() {
        if (!this.isRecording) {
            this.startVoiceRecording();
        } else {
            this.stopVoiceRecording();
        }
    }

    // Начало голосовой записи
    async startVoiceRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };
            
            this.mediaRecorder.onstop = () => {
                this.processAudioRecording();
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            this.updateVoiceButton();
            this.showNotification('Запись начата...', 'info');
            
        } catch (error) {
            console.error('Ошибка доступа к микрофону:', error);
            this.showNotification('Не удалось получить доступ к микрофону', 'error');
        }
    }

    // Остановка голосовой записи
    stopVoiceRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            this.isRecording = false;
            this.updateVoiceButton();
            this.showNotification('Запись остановлена', 'info');
        }
    }

    // Обработка аудиозаписи
    processAudioRecording() {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        
        // В реальном приложении здесь будет отправка на сервер для распознавания
        // Для демонстрации просто покажем уведомление
        this.showNotification('Аудио записано (в реальном приложении будет отправлено на сервер)', 'success');
        
        // Очистка
        this.audioChunks = [];
    }

    // Обновление кнопки голосового ввода
    updateVoiceButton() {
        const voiceBtn = document.querySelector('.input-btn.voice');
        if (voiceBtn) {
            if (this.isRecording) {
                voiceBtn.classList.add('active');
                voiceBtn.innerHTML = '<i class="fas fa-square"></i>';
            } else {
                voiceBtn.classList.remove('active');
                voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            }
        }
    }

    // Отправка сообщения
    async sendMessage() {
        const userInput = document.getElementById('userInput');
        const messageText = userInput ? userInput.value.trim() : '';
        
        if (!messageText && this.attachedFiles.length === 0) {
            this.showNotification('Введите сообщение или прикрепите файл', 'warning');
            return;
        }
        
        // Создание сообщения пользователя
        const userMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: messageText,
            timestamp: new Date().toISOString(),
            files: [...this.attachedFiles],
            model: this.currentModel
        };
        
        // Добавление сообщения в чат
        this.addMessageToChat(userMessage);
        
        // Очистка ввода
        this.clearInput();
        
        // Показать индикатор набора
        this.showTypingIndicator();
        
        try {
            // Имитация ответа AI (в реальном приложении здесь будет API вызов)
            await this.simulateAIResponse(userMessage);
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            this.showNotification('Ошибка при отправке сообщения', 'error');
            this.playSound('error');
        } finally {
            this.hideTypingIndicator();
        }
    }

    // Добавление сообщения в чат
    addMessageToChat(message) {
        if (!this.currentChat) return;
        
        this.currentChat.messages.push(message);
        this.saveChats();
        this.renderMessage(message);
        this.updateChatList();
        this.scrollToBottom();
        
        if (message.role === 'user') {
            this.playSound('send');
        } else {
            this.playSound('message');
        }
    }

    // Показать индикатор набора
    showTypingIndicator() {
        const container = document.querySelector('.messages-container');
        if (!container) return;
        
        const typingElement = document.createElement('div');
        typingElement.className = 'typing-indicator';
        typingElement.id = 'typingIndicator';
        typingElement.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <span>KHAI печатает...</span>
        `;
        
        container.appendChild(typingElement);
        this.scrollToBottom();
    }

    // Скрыть индикатор набора
    hideTypingIndicator() {
        const typingElement = document.getElementById('typingIndicator');
        if (typingElement) {
            typingElement.remove();
        }
    }

    // Имитация ответа AI
    async simulateAIResponse(userMessage) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const aiResponse = this.generateAIResponse(userMessage);
                this.addMessageToChat(aiResponse);
                resolve();
            }, 1000 + Math.random() * 2000); // Случайная задержка для реалистичности
        });
    }

    // Генерация ответа AI
    generateAIResponse(userMessage) {
        const responses = {
            'gpt-4': [
                "Я проанализировал ваш запрос и могу предложить следующее решение...",
                "Интересный вопрос! Вот что я могу сказать по этой теме...",
                "На основе предоставленной информации, вот мои рекомендации...",
                "Я понимаю вашу задачу. Вот как можно подойти к ее решению..."
            ],
            'gpt-3.5': [
                "Привет! Я могу помочь вам с этим вопросом. Вот что я думаю...",
                "Отличный вопрос! Давайте разберем его вместе...",
                "Я изучил ваш запрос и готов поделиться информацией...",
                "Вот что я нашел по вашему вопросу..."
            ],
            'claude-3': [
                "Рассмотрев ваш запрос, я пришел к следующим выводам...",
                "Это сложная тема, но я постараюсь дать максимально полный ответ...",
                "Исходя из предоставленных данных, вот мой анализ ситуации...",
                "Я тщательно изучил вопрос и готов представить свои соображения..."
            ],
            'gemini-pro': [
                "Привет! Я Gemini Pro, и я готов помочь. Вот мой ответ...",
                "Отличный запрос! Я проанализировал его и могу предложить...",
                "На основе современных данных и исследований, вот что я могу сказать...",
                "Я рассмотрел ваш вопрос с разных сторон. Вот результаты..."
            ]
        };
        
        const modelResponses = responses[this.currentModel] || responses['gpt-4'];
        const randomResponse = modelResponses[Math.floor(Math.random() * modelResponses.length)];
        
        return {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: randomResponse,
            timestamp: new Date().toISOString(),
            model: this.currentModel
        };
    }

    // Отрисовка сообщения
    renderMessage(message) {
        const container = document.querySelector('.messages-container');
        if (!container) return;
        
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${message.role}`;
        messageElement.dataset.messageId = message.id;
        
        let contentHTML = '';
        
        if (message.role === 'user') {
            contentHTML = this.renderUserMessage(message);
        } else {
            contentHTML = this.renderAIMessage(message);
        }
        
        messageElement.innerHTML = contentHTML;
        container.appendChild(messageElement);
        
        // Добавление обработчиков для кнопок действий
        this.bindMessageActions(messageElement, message);
    }

    // Отрисовка сообщения пользователя
    renderUserMessage(message) {
        let filesHTML = '';
        
        if (message.files && message.files.length > 0) {
            filesHTML = message.files.map(file => {
                if (file.type.startsWith('image/')) {
                    return `
                        <div class="message-image">
                            <img src="${file.url}" alt="${file.name}" loading="lazy">
                        </div>
                    `;
                } else {
                    return `
                        <div class="attached-file">
                            <i class="fas fa-file"></i>
                            <span>${file.name}</span>
                        </div>
                    `;
                }
            }).join('');
        }
        
        return `
            <div class="message-content">
                ${this.formatMessageContent(message.content)}
                ${filesHTML}
            </div>
            <div class="model-indicator">
                ${this.getModelName(message.model)} • ${this.formatTimestamp(message.timestamp)}
            </div>
        `;
    }

    // Отрисовка сообщения AI
    renderAIMessage(message) {
        return `
            <div class="message-content">
                ${this.formatMessageContent(message.content)}
            </div>
            <div class="message-actions">
                <button class="action-btn-small copy-btn" title="Копировать">
                    <i class="fas fa-copy"></i> Копировать
                </button>
                <button class="action-btn-small speak-btn" title="Озвучить">
                    <i class="fas fa-volume-up"></i> Озвучить
                </button>
                <button class="action-btn-small regenerate-btn" title="Перегенерировать">
                    <i class="fas fa-redo"></i> Перегенерировать
                </button>
            </div>
            <div class="model-indicator">
                ${this.getModelName(message.model)} • ${this.formatTimestamp(message.timestamp)}
            </div>
        `;
    }

    // Форматирование содержимого сообщения (упрощенный Markdown)
    formatMessageContent(content) {
        if (!content) return '';
        
        // Обработка заголовков
        content = content.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        content = content.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        content = content.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Обработка жирного текста
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Обработка курсива
        content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Обработка кода
        content = content.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // Обработка блоков кода
        content = content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            const language = lang || 'text';
            return `
                <div class="code-block">
                    <div class="code-header">
                        <span class="code-language">${language}</span>
                        <button class="copy-code-btn">
                            <i class="fas fa-copy"></i> Копировать
                        </button>
                    </div>
                    <pre><code>${this.escapeHtml(code.trim())}</code></pre>
                </div>
            `;
        });
        
        // Обработка цитат
        content = content.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
        
        // Обработка списков
        content = content.replace(/^\s*[\-\*] (.*$)/gim, '<li>$1</li>');
        content = content.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // Обработка ссылок
        content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // Обработка переносов строк
        content = content.replace(/\n/g, '<br>');
        
        return content;
    }

    // Экранирование HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Форматирование временной метки
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    // Привязка действий к сообщению
    bindMessageActions(messageElement, message) {
        // Копирование текста
        const copyBtn = messageElement.querySelector('.copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyToClipboard(message.content);
                this.playSound('click');
            });
        }
        
        // Копирование кода
        const copyCodeBtns = messageElement.querySelectorAll('.copy-code-btn');
        copyCodeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const codeBlock = btn.closest('.code-block');
                const code = codeBlock.querySelector('code').textContent;
                this.copyToClipboard(code);
                this.playSound('click');
            });
        });
        
        // Озвучка
        const speakBtn = messageElement.querySelector('.speak-btn');
        if (speakBtn) {
            speakBtn.addEventListener('click', () => {
                this.toggleSpeech(message.content, speakBtn);
                this.playSound('click');
            });
        }
        
        // Регенерация
        const regenerateBtn = messageElement.querySelector('.regenerate-btn');
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => {
                this.regenerateResponse(message);
                this.playSound('click');
            });
        }
    }

    // Копирование в буфер обмена
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('Скопировано в буфер обмена', 'success');
        } catch (error) {
            console.error('Ошибка копирования:', error);
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('Скопировано в буфер обмена', 'success');
        }
    }

    // Переключение озвучки
    toggleSpeech(text, button) {
        if (this.isSpeaking) {
            this.stopSpeech();
            button.classList.remove('speaking');
        } else {
            this.startSpeech(text, button);
            button.classList.add('speaking');
        }
    }

    // Начало озвучки
    startSpeech(text, button) {
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
        }
        
        this.currentUtterance = new SpeechSynthesisUtterance(text);
        this.currentUtterance.lang = 'ru-RU';
        this.currentUtterance.rate = 1.0;
        this.currentUtterance.pitch = 1.0;
        this.currentUtterance.volume = 0.8;
        
        this.currentUtterance.onend = () => {
            this.isSpeaking = false;
            if (button) button.classList.remove('speaking');
        };
        
        this.currentUtterance.onerror = () => {
            this.isSpeaking = false;
            if (button) button.classList.remove('speaking');
            this.showNotification('Ошибка при озвучке', 'error');
        };
        
        this.speechSynthesis.speak(this.currentUtterance);
        this.isSpeaking = true;
    }

    // Остановка озвучки
    stopSpeech() {
        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
        }
        this.isSpeaking = false;
    }

    // Регенерация ответа
    regenerateResponse(message) {
        // Находим индекс сообщения пользователя
        const userMessageIndex = this.currentChat.messages.findIndex(m => m.id === message.id) - 1;
        if (userMessageIndex >= 0) {
            const userMessage = this.currentChat.messages[userMessageIndex];
            
            // Удаляем старый ответ AI
            this.currentChat.messages = this.currentChat.messages.filter(m => m.id !== message.id);
            this.saveChats();
            this.renderChat();
            
            // Генерируем новый ответ
            this.showTypingIndicator();
            setTimeout(() => {
                const newResponse = this.generateAIResponse(userMessage);
                this.addMessageToChat(newResponse);
                this.hideTypingIndicator();
            }, 1000);
        }
    }

    // Отрисовка всего чата
    renderChat() {
        const container = document.querySelector('.messages-container');
        if (!container || !this.currentChat) return;
        
        container.innerHTML = '';
        
        this.currentChat.messages.forEach(message => {
            this.renderMessage(message);
        });
        
        this.scrollToBottom();
        this.updateScrollProgress();
        this.toggleNavigationButtons();
    }

    // Прокрутка вниз
    scrollToBottom() {
        const container = document.querySelector('.messages-container');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }

    // Создание нового чата
    createChat() {
        const newChat = this.createNewChat();
        this.chats.push(newChat);
        this.currentChat = newChat;
        this.saveChats();
        this.renderChat();
        this.renderChatList();
        this.showNotification('Новый чат создан', 'success');
        
        // Закрываем сайдбар на мобильных устройствах
        if (window.innerWidth < 768) {
            const sidebar = document.querySelector('.sidebar-menu');
            if (sidebar) {
                sidebar.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    }

    // Переключение на чат
    switchChat(chatId) {
        const chat = this.chats.find(c => c.id === chatId);
        if (chat) {
            this.currentChat = chat;
            this.renderChat();
            this.renderChatList();
            this.updateUI();
            
            // Закрываем сайдбар на мобильных устройствах
            if (window.innerWidth < 768) {
                const sidebar = document.querySelector('.sidebar-menu');
                if (sidebar) {
                    sidebar.classList.remove('active');
                    document.body.style.overflow = '';
                }
            }
        }
    }

    // Очистка текущего чата
    clearCurrentChat() {
        if (this.currentChat && confirm('Вы уверены, что хотите очистить этот чат?')) {
            this.currentChat.messages = [];
            this.saveChats();
            this.renderChat();
            this.showNotification('Чат очищен', 'success');
        }
    }

    // Скачивание чата
    downloadChat() {
        if (!this.currentChat || this.currentChat.messages.length === 0) {
            this.showNotification('Нет сообщений для скачивания', 'warning');
            return;
        }
        
        const chatContent = this.formatChatForDownload();
        const blob = new Blob([chatContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `khai-chat-${this.currentChat.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Чат скачан', 'success');
    }

    // Форматирование чата для скачивания
    formatChatForDownload() {
        let content = `KHAI Chat - ${this.currentChat.title}\n`;
        content += `Дата экспорта: ${new Date().toLocaleString('ru-RU')}\n`;
        content += `Модель: ${this.getModelName(this.currentChat.model)}\n`;
        content += '='.repeat(50) + '\n\n';
        
        this.currentChat.messages.forEach(message => {
            const role = message.role === 'user' ? 'Вы' : 'KHAI';
            const timestamp = new Date(message.timestamp).toLocaleString('ru-RU');
            
            content += `${role} [${timestamp}]:\n`;
            content += message.content + '\n';
            
            if (message.files && message.files.length > 0) {
                content += `Прикрепленные файлы: ${message.files.map(f => f.name).join(', ')}\n`;
            }
            
            content += '\n' + '-'.repeat(30) + '\n\n';
        });
        
        return content;
    }

    // Отрисовка списка чатов
    renderChatList() {
        const container = document.querySelector('.chat-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.chats.forEach(chat => {
            const chatElement = document.createElement('div');
            chatElement.className = `chat-item ${chat.id === this.currentChat.id ? 'active' : ''}`;
            chatElement.dataset.chatId = chat.id;
            
            const lastMessage = chat.messages[chat.messages.length - 1];
            const preview = lastMessage ? 
                (lastMessage.content.substring(0, 50) + (lastMessage.content.length > 50 ? '...' : '')) : 
                'Нет сообщений';
            
            chatElement.innerHTML = `
                <div class="chat-item-content">
                    <div class="chat-item-title">${chat.title}</div>
                    <div class="chat-item-preview">${preview}</div>
                </div>
                <div class="chat-item-actions">
                    <button class="chat-action-btn edit" title="Редактировать">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="chat-action-btn delete" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(chatElement);
            
            // Обработчики событий
            chatElement.addEventListener('click', (e) => {
                if (!e.target.closest('.chat-item-actions')) {
                    this.switchChat(chat.id);
                    this.playSound('click');
                }
            });
            
            // Редактирование названия чата
            const editBtn = chatElement.querySelector('.edit');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.editChatTitle(chat);
                    this.playSound('click');
                });
            }
            
            // Удаление чата
            const deleteBtn = chatElement.querySelector('.delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteChat(chat.id);
                    this.playSound('click');
                });
            }
        });
    }

    // Редактирование названия чата
    editChatTitle(chat) {
        const newTitle = prompt('Введите новое название чата:', chat.title);
        if (newTitle && newTitle.trim() !== '') {
            chat.title = newTitle.trim();
            this.saveChats();
            this.renderChatList();
            this.updateUI();
            this.showNotification('Название чата изменено', 'success');
        }
    }

    // Удаление чата
    deleteChat(chatId) {
        if (this.chats.length <= 1) {
            this.showNotification('Нельзя удалить последний чат', 'warning');
            return;
        }
        
        if (confirm('Вы уверены, что хотите удалить этот чат?')) {
            this.chats = this.chats.filter(chat => chat.id !== chatId);
            
            if (this.currentChat.id === chatId) {
                this.currentChat = this.chats[this.chats.length - 1];
                this.renderChat();
            }
            
            this.saveChats();
            this.renderChatList();
            this.showNotification('Чат удален', 'success');
        }
    }

    // Обновление UI
    updateUI() {
        this.updateModelButton();
        this.updateThemeButton();
        this.updateModeIndicator();
        this.updateModeButtons();
        this.updateCurrentChatInfo();
    }

    // Обновление информации о текущем чате
    updateCurrentChatInfo() {
        const chatTitle = document.querySelector('.current-chat-info span');
        if (chatTitle && this.currentChat) {
            chatTitle.textContent = this.currentChat.title;
        }
    }

    // Поиск по сообщениям
    searchMessages(query) {
        if (!query.trim()) {
            // Сброс поиска - показать все сообщения
            this.renderChat();
            return;
        }
        
        const messages = document.querySelectorAll('.message');
        const lowerQuery = query.toLowerCase();
        
        messages.forEach(message => {
            const content = message.textContent.toLowerCase();
            if (content.includes(lowerQuery)) {
                message.style.display = 'block';
                // Подсветка совпадений может быть добавлена здесь
            } else {
                message.style.display = 'none';
            }
        });
    }

    // Поиск по чатам
    searchChats(query) {
        const chatItems = document.querySelectorAll('.chat-item');
        const lowerQuery = query.toLowerCase();
        
        chatItems.forEach(item => {
            const title = item.querySelector('.chat-item-title').textContent.toLowerCase();
            const preview = item.querySelector('.chat-item-preview').textContent.toLowerCase();
            
            if (title.includes(lowerQuery) || preview.includes(lowerQuery)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // Показать уведомление
    showNotification(message, type = 'info') {
        // Удаляем существующие уведомления
        this.clearNotifications();
        
        const container = document.querySelector('.notifications-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(notification);
        
        // Обработчик закрытия
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.remove();
            });
        }
        
        // Автоматическое закрытие
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Очистка уведомлений
    clearNotifications() {
        const container = document.querySelector('.notifications-container');
        if (container) {
            container.innerHTML = '';
        }
    }

    // Service Worker регистрация для PWA
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker зарегистрирован:', registration);
                })
                .catch(error => {
                    console.log('Ошибка регистрации Service Worker:', error);
                });
        }
    }
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.khaiChat = new KHAIChat();
    
    // Регистрация Service Worker для PWA
    if ('serviceWorker' in navigator) {
        window.khaiChat.registerServiceWorker();
    }
});

// Обработка ошибок
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

// Обработка обещаний без обработчиков
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
