// script.js
/**
 * KHAI - Первый белорусский ИИ чат
 * Основной класс приложения
 */
class KHAIChat {
    constructor() {
        // Основные свойства приложения
        this.currentChatId = 'default';
        this.chats = new Map();
        this.currentModel = 'gpt-5-nano';
        this.currentMode = 'text'; // 'text', 'image', 'voice'
        this.isGenerating = false;
        this.isVoiceMode = false;
        this.isScrolling = false;
        this.scrollTimer = null;
        this.currentTypingMessage = null;
        
        // Настройки звука
        this.soundEnabled = true;
        this.autoSpeak = false;
        
        // Язык интерфейса
        this.currentLanguage = 'ru';
        
        // Инициализация приложения
        this.initializeApp();
        this.setupEventListeners();
        this.loadChats();
        this.loadSettings();
        this.showPWAInstallPrompt();
    }
    
    /**
     * Инициализация приложения
     */
    initializeApp() {
        // Создаем чат по умолчанию если нет существующих
        if (!this.chats.has(this.currentChatId)) {
            this.chats.set(this.currentChatId, {
                id: this.currentChatId,
                name: this.translate('Основной чат'),
                messages: [],
                createdAt: new Date()
            });
        }
        
        // Рендерим интерфейс
        this.renderChatList();
        this.renderMessages();
        this.updateCurrentChatInfo();
        
        // Инициализация темы
        const savedTheme = localStorage.getItem('khai-theme') || 'dark';
        this.setTheme(savedTheme);
        
        // Настройка Markdown рендеринга
        marked.setOptions({
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(code, { language: lang }).value;
                }
                return hljs.highlightAuto(code).value;
            },
            breaks: true,
            gfm: true
        });
        
        // Устанавливаем текущую модель в интерфейсе
        this.updateModelDisplay();
    }
    
    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Обработка ввода
        const userInput = document.getElementById('userInput');
        const sendBtn = document.getElementById('sendBtn');
        
        userInput.addEventListener('input', this.handleInputChange.bind(this));
        userInput.addEventListener('keydown', this.handleKeyDown.bind(this));
        sendBtn.addEventListener('click', this.sendMessage.bind(this));
        
        // Голосовой ввод
        const voiceInputBtn = document.getElementById('voiceInputBtn');
        voiceInputBtn.addEventListener('click', this.toggleVoiceInput.bind(this));
        
        // Прикрепление файлов
        const attachFileBtn = document.getElementById('attachFileBtn');
        const fileInput = document.getElementById('fileInput');
        
        attachFileBtn.addEventListener('click', () => {
            this.playSound('click');
            fileInput.click();
        });
        fileInput.addEventListener('change', this.handleFileUpload.bind(this));
        
        // Очистка ввода
        const clearInputBtn = document.getElementById('clearInputBtn');
        clearInputBtn.addEventListener('click', () => {
            this.playSound('click');
            this.clearInput();
        });
        
        // Боковое меню
        const menuToggle = document.getElementById('menuToggle');
        const sidebarClose = document.getElementById('sidebarClose');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        
        menuToggle.addEventListener('click', this.toggleSidebar.bind(this));
        sidebarClose.addEventListener('click', this.toggleSidebar.bind(this));
        sidebarOverlay.addEventListener('click', this.toggleSidebar.bind(this));
        
        // Действия с чатами
        const newChatBtn = document.getElementById('newChatBtn');
        const deleteAllChatsBtn = document.getElementById('deleteAllChatsBtn');
        const importChatBtn = document.getElementById('importChatBtn');
        const downloadAllChatsBtn = document.getElementById('downloadAllChatsBtn');
        
        newChatBtn.addEventListener('click', this.createNewChat.bind(this));
        deleteAllChatsBtn.addEventListener('click', this.deleteAllChats.bind(this));
        importChatBtn.addEventListener('click', this.importChat.bind(this));
        downloadAllChatsBtn.addEventListener('click', this.downloadAllChats.bind(this));
        
        // Поиск
        const chatSearchInput = document.getElementById('chatSearchInput');
        const clearChatSearch = document.getElementById('clearChatSearch');
        const searchMessagesInputHeader = document.getElementById('searchMessagesInputHeader');
        const clearSearchHeader = document.getElementById('clearSearchHeader');
        
        chatSearchInput.addEventListener('input', this.handleSearchInput.bind(this));
        clearChatSearch.addEventListener('click', () => {
            chatSearchInput.value = '';
            this.filterChats();
            clearChatSearch.classList.remove('visible');
        });
        
        searchMessagesInputHeader.addEventListener('input', this.handleHeaderSearch.bind(this));
        clearSearchHeader.addEventListener('click', () => {
            searchMessagesInputHeader.value = '';
            this.clearHeaderSearch();
            clearSearchHeader.classList.remove('visible');
        });
        
        // Навигация
        const scrollToTopBtn = document.getElementById('scrollToTopBtn');
        const scrollToBottomBtn = document.getElementById('scrollToBottomBtn');
        const nextMessageBtn = document.getElementById('nextMessageBtn');
        
        scrollToTopBtn.addEventListener('click', () => this.scrollTo('top'));
        scrollToBottomBtn.addEventListener('click', () => this.scrollTo('bottom'));
        nextMessageBtn.addEventListener('click', () => this.scrollTo('next'));
        
        // Смена темы
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        
        // Выбор модели
        const modelSelectBtn = document.getElementById('modelSelectBtn');
        const modelSelectClose = document.getElementById('modelSelectClose');
        const modelItems = document.querySelectorAll('.model-item');
        
        modelSelectBtn.addEventListener('click', this.openModelSelectModal.bind(this));
        modelSelectClose.addEventListener('click', this.closeModelSelectModal.bind(this));
        modelItems.forEach(item => {
            item.addEventListener('click', () => this.selectModel(item.dataset.model));
        });
        
        // Кнопки действий
        const helpBtn = document.getElementById('helpBtn');
        const clearChatBtn = document.getElementById('clearChatBtn');
        const imageModeBtn = document.getElementById('imageModeBtn');
        const voiceModeBtn = document.getElementById('voiceModeBtn');
        const textModeBtn = document.getElementById('textModeBtn');
        
        helpBtn.addEventListener('click', this.showHelp.bind(this));
        clearChatBtn.addEventListener('click', this.clearCurrentChat.bind(this));
        imageModeBtn.addEventListener('click', () => this.setMode('image'));
        voiceModeBtn.addEventListener('click', () => this.setMode('voice'));
        textModeBtn.addEventListener('click', () => this.setMode('text'));
        
        // Настройки звука
        const soundEnabled = document.getElementById('soundEnabled');
        const autoSpeak = document.getElementById('autoSpeak');
        const soundToggle = document.getElementById('soundToggle');
        
        soundEnabled.addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
            this.saveSettings();
            soundToggle.title = this.soundEnabled ? 'Звук включен' : 'Звук выключен';
            soundToggle.querySelector('i').className = this.soundEnabled ? 'ti ti-volume' : 'ti ti-volume-off';
        });
        
        autoSpeak.addEventListener('change', (e) => {
            this.autoSpeak = e.target.checked;
            this.saveSettings();
        });
        
        soundToggle.addEventListener('click', () => {
            this.soundEnabled = !this.soundEnabled;
            soundEnabled.checked = this.soundEnabled;
            this.saveSettings();
            soundToggle.title = this.soundEnabled ? 'Звук включен' : 'Звук выключен';
            soundToggle.querySelector('i').className = this.soundEnabled ? 'ti ti-volume' : 'ti ti-volume-off';
            this.playSound('click');
        });
        
        // Смена языка
        const languageToggle = document.getElementById('languageToggle');
        languageToggle.addEventListener('click', this.toggleLanguage.bind(this));
        
        // Обработка скролла для компактного режима
        const messagesContainer = document.getElementById('messagesContainer');
        messagesContainer.addEventListener('scroll', this.handleScroll.bind(this));
        
        // PWA установка
        const pwaInstall = document.getElementById('pwaInstall');
        const pwaDismiss = document.getElementById('pwaDismiss');
        
        pwaInstall.addEventListener('click', this.installPWA.bind(this));
        pwaDismiss.addEventListener('click', this.dismissPWA.bind(this));
        
        // Обработчики системных событий
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
        });
        
        window.addEventListener('online', this.updateStatusIndicator.bind(this));
        window.addEventListener('offline', this.updateStatusIndicator.bind(this));
        this.updateStatusIndicator();
    }
    
    /**
     * Обработка изменения ввода
     */
    handleInputChange(e) {
        const textarea = e.target;
        const clearInputBtn = document.getElementById('clearInputBtn');
        
        // Автоматическое изменение высоты
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        
        // Показ/скрытие кнопки очистки
        if (textarea.value.trim()) {
            clearInputBtn.classList.add('visible');
        } else {
            clearInputBtn.classList.remove('visible');
        }
    }
    
    /**
     * Обработка нажатия клавиш
     */
    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }
    
    /**
     * Отправка сообщения
     */
    async sendMessage() {
        const userInput = document.getElementById('userInput');
        const message = userInput.value.trim();
        const attachedFiles = document.getElementById('attachedFiles');
        const files = Array.from(attachedFiles.querySelectorAll('.attached-file')).map(file => {
            return {
                name: file.dataset.name,
                type: file.dataset.type,
                content: file.dataset.content
            };
        });
        
        if (!message && files.length === 0) return;
        
        // Воспроизводим звук отправки
        this.playSound('send');
        
        // Очищаем ввод и файлы
        userInput.value = '';
        userInput.style.height = 'auto';
        attachedFiles.innerHTML = '';
        document.getElementById('clearInputBtn').classList.remove('visible');
        
        // Добавляем сообщение пользователя
        const userMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: message,
            files: files,
            timestamp: new Date(),
            mode: this.currentMode
        };
        
        this.addMessageToCurrentChat(userMessage);
        this.renderMessages();
        this.scrollToBottom();
        
        // Показываем индикатор набора
        this.showTypingIndicator();
        
        // Генерируем ответ ИИ (заглушка - заменить на реальный API)
        setTimeout(async () => {
            this.hideTypingIndicator();
            
            const aiResponse = await this.generateAIResponse(message, files, this.currentMode);
            const aiMessage = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: aiResponse,
                model: this.currentModel,
                timestamp: new Date(),
                mode: this.currentMode
            };
            
            this.addMessageToCurrentChat(aiMessage);
            this.renderMessages();
            this.scrollToBottom();
            
            // Воспроизводим звук нового сообщения
            this.playSound('message');
            
            // Push уведомление если вкладка не активна
            if (document.hidden) {
                this.showPushNotification('KHAI ответил', aiResponse.substring(0, 100) + '...');
            }
            
            // Авто-озвучка если включена
            if (this.autoSpeak && this.currentMode === 'voice') {
                this.speakMessage(aiResponse);
            }
        }, 1000 + Math.random() * 2000);
    }
    
    /**
     * Генерация ответа ИИ (заглушка)
     */
    async generateAIResponse(message, files, mode) {
        let response = '';
        
        // Обработка разных режимов
        switch (mode) {
            case 'image':
                response = `🎨 Режим генерации изображений\n\n`;
                if (message) {
                    response += `Описание для генерации: "${message}"\n\n`;
                }
                response += `Изображение будет создано на основе вашего описания. В реальном приложении здесь был бы сгенерирован изображение.`;
                break;
                
            case 'voice':
                response = `🎤 Голосовой режим\n\n`;
                if (message) {
                    response += `Текст для озвучки: "${message}"\n\n`;
                }
                response += `Голосовое сообщение будет сгенерировано. В реальном приложении здесь было бы аудио сообщение.`;
                break;
                
            default:
                if (files.length > 0) {
                    response = `📎 Я проанализировал прикреплённые файлы (${files.map(f => f.name).join(', ')}). `;
                    
                    if (message) {
                        response += `На основе вашего вопроса "${message}", я могу сказать следующее: `;
                    } else {
                        response += 'Вот что я могу сказать о содержимом файлов: ';
                    }
                    
                    response += 'Это интересный материал, который требует более глубокого анализа. ';
                    
                    if (files.some(f => f.type.startsWith('image/'))) {
                        response += 'Изображения содержат визуальную информацию, которую я обработал. ';
                    }
                    
                    response += 'Если у вас есть конкретные вопросы по содержанию, задавайте их!';
                } else if (message.toLowerCase().includes('привет') || message.toLowerCase().includes('hello')) {
                    response = 'Привет! Я KHAI — первый белорусский ИИ-ассистент. Чем могу помочь?';
                } else if (message.toLowerCase().includes('погода') || message.toLowerCase().includes('weather')) {
                    response = 'К сожалению, у меня нет доступа к актуальным данным о погоде. Рекомендую проверить специализированные сервисы.';
                } else if (message.toLowerCase().includes('помощь') || message.toLowerCase().includes('help')) {
                    response = 'Я могу помочь с различными задачами: ответить на вопросы, сгенерировать текст, проанализировать изображения, создать голосовые сообщения. Просто опишите, что вам нужно!';
                } else {
                    const responses = [
                        'Интересный вопрос! На основе моих знаний могу сказать, что это перспективное направление для изучения.',
                        'Спасибо за вопрос! Это действительно важная тема, которая требует внимательного рассмотрения.',
                        'Отличный вопрос! Я проанализировал информацию и могу предложить следующий ответ...',
                        'На основе предоставленных данных, я пришёл к следующим выводам...',
                        'Это сложный вопрос, требующий многостороннего подхода. Вот что я могу сказать по этому поводу...'
                    ];
                    
                    response = responses[Math.floor(Math.random() * responses.length)];
                    
                    if (message.length > 100) {
                        response += ' Вы предоставили подробное описание, что помогает мне лучше понять суть вопроса.';
                    }
                    
                    if (message.includes('?')) {
                        response += ' Если у вас есть дополнительные вопросы, не стесняйтесь задавать их!';
                    }
                }
                break;
        }
        
        return response;
    }
    
    /**
     * Установка режима работы
     */
    setMode(mode) {
        this.currentMode = mode;
        
        // Обновляем кнопки режимов
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${mode}ModeBtn`).classList.add('active');
        
        // Обновляем placeholder в зависимости от режима
        const userInput = document.getElementById('userInput');
        switch (mode) {
            case 'image':
                userInput.placeholder = this.translate('Опишите изображение для генерации...');
                break;
            case 'voice':
                userInput.placeholder = this.translate('Введите текст для голосового сообщения...');
                break;
            default:
                userInput.placeholder = this.translate('Задайте вопрос или опишите изображение...');
        }
        
        this.playSound('click');
        this.showNotification(this.translate(`Режим изменен на: ${mode}`), 'info');
    }
    
    /**
     * Воспроизведение звуков
     */
    playSound(type) {
        if (!this.soundEnabled) return;
        
        const audio = document.getElementById(`${type}Sound`);
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.log('Audio play failed:', e));
        }
    }
    
    /**
     * Открытие модального окна выбора модели
     */
    openModelSelectModal() {
        this.playSound('click');
        document.getElementById('modelSelectModal').classList.add('active');
        
        // Отмечаем текущую модель
        document.querySelectorAll('.model-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.model === this.currentModel) {
                item.classList.add('active');
            }
        });
    }
    
    /**
     * Закрытие модального окна выбора модели
     */
    closeModelSelectModal() {
        this.playSound('click');
        document.getElementById('modelSelectModal').classList.remove('active');
    }
    
    /**
     * Выбор модели ИИ
     */
    selectModel(model) {
        this.currentModel = model;
        this.updateModelDisplay();
        this.closeModelSelectModal();
        this.playSound('click');
        this.showNotification(this.translate(`Модель изменена на: ${model}`), 'info');
    }
    
    /**
     * Обновление отображения текущей модели
     */
    updateModelDisplay() {
        const modelDisplay = document.getElementById('currentModel');
        const modelNames = {
            'gpt-5-nano': 'GPT-5 Nano',
            'o3-mini': 'O3 Mini',
            'deepseek-chat': 'DeepSeek Chat',
            'deepseek-reasoner': 'DeepSeek Reasoner',
            'gemini-2.0-flash': 'Gemini 2.0 Flash',
            'gemini-1.5-flash': 'Gemini 1.5 Flash',
            'grok-beta': 'xAI Grok'
        };
        modelDisplay.textContent = modelNames[this.currentModel] || this.currentModel;
    }
    
    // ... (остальные методы остаются аналогичными предыдущей версии, 
    // но с добавлением вызовов this.playSound('click') для кнопок
    // и this.translate() для текстов)
    
    /**
     * Показать уведомление
     */
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationsContainer');
        
        // Удаляем предыдущее уведомление
        container.innerHTML = '';
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">
                <i class="ti ti-x"></i>
            </button>
        `;
        
        container.appendChild(notification);
        
        // Авто-удаление через 5 секунд
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
        
        // Закрытие по клику
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
    
    /**
     * Переключение языка
     */
    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'ru' ? 'en' : 'ru';
        this.saveSettings();
        
        const languageToggle = document.getElementById('languageToggle');
        languageToggle.title = this.currentLanguage === 'ru' ? 'Русский' : 'English';
        
        this.showNotification(
            this.currentLanguage === 'ru' ? 'Язык изменен на русский' : 'Language changed to English', 
            'info'
        );
        
        // Здесь можно добавить полную перезагрузку интерфейса
        // this.updateInterfaceLanguage();
    }
    
    /**
     * Перевод текста (заглушка)
     */
    translate(text) {
        // В реальном приложении здесь была бы система перевода
        return text;
    }
    
    /**
     * Загрузка настроек
     */
    loadSettings() {
        const settings = JSON.parse(localStorage.getItem('khai-settings')) || {};
        this.soundEnabled = settings.soundEnabled !== undefined ? settings.soundEnabled : true;
        this.autoSpeak = settings.autoSpeak || false;
        this.currentLanguage = settings.language || 'ru';
        
        // Применяем настройки к интерфейсу
        document.getElementById('soundEnabled').checked = this.soundEnabled;
        document.getElementById('autoSpeak').checked = this.autoSpeak;
        
        const soundToggle = document.getElementById('soundToggle');
        soundToggle.title = this.soundEnabled ? 'Звук включен' : 'Звук выключен';
        soundToggle.querySelector('i').className = this.soundEnabled ? 'ti ti-volume' : 'ti ti-volume-off';
    }
    
    /**
     * Сохранение настроек
     */
    saveSettings() {
        const settings = {
            soundEnabled: this.soundEnabled,
            autoSpeak: this.autoSpeak,
            language: this.currentLanguage
        };
        localStorage.setItem('khai-settings', JSON.stringify(settings));
    }
}

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    window.khaiChat = new KHAIChat();
});

// Регистрация Service Worker для PWA
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
