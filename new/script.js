// Основной файл JavaScript для KHAI интерфейса
class KHAIInterface {
    constructor() {
        this.currentTheme = localStorage.getItem('khai-theme') || 'dark';
        this.currentModel = 'khai-pro';
        this.currentMode = 'text';
        this.attachedFiles = [];
        this.isRecording = false;
        this.isSidebarOpen = false;
        this.messages = [];
        
        this.init();
    }

    init() {
        this.applyTheme();
        this.bindEvents();
        this.setupInputHandlers();
        this.showWelcomeMessage();
        console.log('KHAI Interface initialized');
    }

    // Применение темы
    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = this.currentTheme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
        }
    }

    // Привязка основных событий
    bindEvents() {
        // Переключение темы
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Меню
        document.getElementById('menuToggle').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('sidebarClose').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('sidebarOverlay').addEventListener('click', () => this.toggleSidebar());
        
        // Навигация
        document.getElementById('scrollToTopBtn').addEventListener('click', () => this.scrollToTop());
        document.getElementById('scrollToBottomBtn').addEventListener('click', () => this.scrollToBottom());
        
        // Выбор режима ввода
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setInputMode(e.currentTarget.dataset.mode);
            });
        });
        
        // Управление чатом
        document.getElementById('clearChatBtn').addEventListener('click', () => this.clearChat());
        document.getElementById('helpBtn').addEventListener('click', () => this.showHelp());
        
        // Боковое меню
        this.bindSidebarEvents();
        
        // PWA
        this.setupPWA();
    }

    // Настройка обработчиков ввода
    setupInputHandlers() {
        const userInput = document.getElementById('userInput');
        const sendBtn = document.getElementById('sendBtn');
        const clearBtn = document.getElementById('clearInputBtn');
        const attachBtn = document.getElementById('attachFileBtn');
        const fileInput = document.getElementById('fileInput');

        // Отправка сообщения
        sendBtn.addEventListener('click', () => this.sendMessage());
        
        userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Очистка ввода
        clearBtn.addEventListener('click', () => this.clearInput());
        
        userInput.addEventListener('input', () => {
            this.updateClearButton();
            this.updateRequestInfo();
            this.autoResizeTextarea();
        });

        // Прикрепление файлов
        attachBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    }

    // Привязка событий бокового меню
    bindSidebarEvents() {
        const actions = {
            'newChatBtn': () => this.createNewChat(),
            'activeFunctionsBtn': () => this.showNotification('Функции', 'Раздел активных функций в разработке'),
            'toolsBtn': () => this.showNotification('Инструменты', 'Раздел инструментов в разработке'),
            'profileBtn': () => this.showNotification('Профиль', 'Раздел профиля в разработке'),
            'interfaceSettingsBtn': () => this.showNotification('Настройки', 'Раздел настроек интерфейса в разработке'),
            'aboutBtn': () => this.showAbout()
        };

        Object.entries(actions).forEach(([id, action]) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', () => {
                    action();
                    this.toggleSidebar();
                });
            }
        });
    }

    // Переключение темы
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('khai-theme', this.currentTheme);
        this.applyTheme();
        this.showNotification('Тема', `Переключена на ${this.currentTheme === 'dark' ? 'тёмную' : 'светлую'} тему`);
    }

    // Открытие/закрытие бокового меню
    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
        const sidebar = document.getElementById('sidebarMenu');
        const overlay = document.getElementById('sidebarOverlay');
        
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = this.isSidebarOpen ? 'hidden' : '';
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
        
        // Показываем/скрываем настройки формата
        const formatSettings = document.getElementById('formatSettings');
        if (formatSettings) {
            formatSettings.classList.toggle('visible', mode === 'text');
        }
        
        this.showNotification('Режим', `Установлен ${mode} режим`);
    }

    // Автоматическое изменение размера текстового поля
    autoResizeTextarea() {
        const textarea = document.getElementById('userInput');
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    // Отправка сообщения
    async sendMessage() {
        const input = document.getElementById('userInput');
        const message = input.value.trim();
        
        if (!message && this.attachedFiles.length === 0) {
            this.showNotification('Ошибка', 'Введите сообщение или прикрепите файл');
            return;
        }

        // Добавляем сообщение пользователя
        this.addMessage('user', message);
        
        // Очищаем ввод
        input.value = '';
        this.clearInput();
        
        // Показываем индикатор загрузки
        this.showLoadingIndicator();
        
        // Имитация ответа ИИ
        setTimeout(() => {
            this.hideLoadingIndicator();
            const response = this.generateAIResponse(message);
            this.addMessage('ai', response);
        }, 1000 + Math.random() * 1000);
    }

    // Добавление сообщения в чат
    addMessage(type, content) {
        const message = {
            id: Date.now(),
            type,
            content,
            timestamp: new Date()
        };
        
        this.messages.push(message);
        
        const messagesContainer = document.getElementById('messagesContainer');
        const messageElement = this.createMessageElement(message);
        messagesContainer.appendChild(messageElement);
        
        // Прокручиваем к новому сообщению
        this.scrollToBottom();
        
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
            try {
                content = marked.parse(content);
            } catch (e) {
                console.error('Marked parsing error:', e);
            }
        } else {
            // Экранирование HTML для пользовательских сообщений
            content = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }
        
        messageDiv.innerHTML = `
            <div class="message-content">${content}</div>
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

    // Генерация ответа ИИ
    generateAIResponse(userMessage) {
        const responses = {
            greeting: `Привет! Я KHAI - первый белорусский ИИ-ассистент. Рад вас видеть! Чем могу помочь?`,
            help: `Я могу помочь вам с различными задачами: ответить на вопросы, сгенерировать текст, помочь с программированием или просто пообщаться. Что вас интересует?`,
            weather: `К сожалению, у меня нет доступа к актуальным данным о погоде. Рекомендую проверить специализированные сервисы погоды.`,
            time: `Сейчас ${new Date().toLocaleTimeString('ru-RU')}. Чем еще могу помочь?`,
            default: `Спасибо за ваш вопрос! Это интересная тема. На основе моих знаний я могу сказать, что это требует внимательного изучения. Если у вас есть конкретные вопросы - задавайте!`
        };

        const lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.includes('привет') || lowerMessage.includes('здравствуй')) {
            return responses.greeting;
        }
        
        if (lowerMessage.includes('погода')) {
            return responses.weather;
        }
        
        if (lowerMessage.includes('время')) {
            return responses.time;
        }
        
        if (lowerMessage.includes('помощь') || lowerMessage.includes('help')) {
            return responses.help;
        }
        
        return responses.default;
    }

    // Показать индикатор загрузки
    showLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'message message-ai loading';
        loadingDiv.id = 'loadingMessage';
        loadingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <div>KHAI печатает</div>
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('messagesContainer').appendChild(loadingDiv);
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
        this.attachedFiles = [];
        this.updateAttachedFiles();
        this.updateClearButton();
        this.updateRequestInfo();
        this.autoResizeTextarea();
    }

    // Обновление видимости кнопки очистки
    updateClearButton() {
        const input = document.getElementById('userInput');
        const clearBtn = document.getElementById('clearInputBtn');
        if (clearBtn) {
            clearBtn.style.display = input.value.trim() ? 'flex' : 'none';
        }
    }

    // Обработка выбора файла
    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        
        files.forEach(file => {
            if (this.attachedFiles.length >= 5) {
                this.showNotification('Ошибка', 'Можно прикрепить не более 5 файлов');
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
        event.target.value = '';
    }

    // Обновление списка прикрепленных файлов
    updateAttachedFiles() {
        const container = document.getElementById('attachedFiles');
        if (!container) return;
        
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
                const index = parseInt(e.currentTarget.dataset.index);
                this.attachedFiles.splice(index, 1);
                this.updateAttachedFiles();
                this.updateRequestInfo();
            });
        });
    }

    // Обновление информации о запросе
    updateRequestInfo() {
        const input = document.getElementById('userInput');
        const charCount = input.value.length;
        const fileCount = this.attachedFiles.length;
        const totalSize = this.attachedFiles.reduce((sum, file) => sum + file.size, 0);
        
        const charCountEl = document.getElementById('charCount');
        const fileCountEl = document.getElementById('fileCount');
        const totalSizeEl = document.getElementById('totalSize');
        const requestInfo = document.getElementById('requestInfo');
        
        if (charCountEl) charCountEl.textContent = `${charCount} символов`;
        if (fileCountEl) fileCountEl.textContent = `${fileCount} файлов`;
        if (totalSizeEl) totalSizeEl.textContent = `${Math.round(totalSize / 1024)} КБ`;
        if (requestInfo) {
            requestInfo.classList.toggle('visible', charCount > 0 || fileCount > 0);
        }
    }

    // Прокрутка к верху
    scrollToTop() {
        document.getElementById('messagesContainer').scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Прокрутка к низу
    scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
        });
    }

    // Очистка чата
    clearChat() {
        if (this.messages.length === 0) return;
        
        if (confirm('Вы уверены, что хотите очистить историю чата?')) {
            this.messages = [];
            document.getElementById('messagesContainer').innerHTML = '';
            this.showNotification('Чат очищен', 'История сообщений удалена');
            this.showWelcomeMessage();
        }
    }

    // Показать справку
    showHelp() {
        const helpMessage = `
## Справка по KHAI

### Основные возможности:
- **Текстовый чат** - общайтесь с ИИ на естественном языке
- **Прикрепление файлов** - загружайте документы для анализа
- **Разные режимы** - текст, изображения, голос

### Как использовать:
1. Введите ваш вопрос в поле ввода
2. Нажмите Enter или кнопку отправки
3. Получите ответ от ИИ

### Примеры запросов:
- "Объясни квантовую физику"
- "Напиши код для сайта"
- "Помоги составить план"
        `.trim();
        
        this.addMessage('ai', helpMessage);
    }

    // Показать о программе
    showAbout() {
        const aboutMessage = `
## О KHAI

**KHAI** - первый белорусский ИИ-ассистент.

Версия: 2.1.0
Разработчик: KHAI Team

© 2024 KHAI. Все права защищены.
        `.trim();
        
        this.addMessage('ai', aboutMessage);
    }

    // Создание нового чата
    createNewChat() {
        this.currentChatId = `chat_${Date.now()}`;
        this.messages = [];
        document.getElementById('messagesContainer').innerHTML = '';
        const chatNameEl = document.getElementById('currentChatName');
        if (chatNameEl) {
            chatNameEl.textContent = 'Новый чат';
        }
        this.showWelcomeMessage();
        this.showNotification('Новый чат', 'Создан новый чат');
    }

    // Показать приветственное сообщение
    showWelcomeMessage() {
        if (this.messages.length === 0) {
            const welcomeMessage = `
## Добро пожаловать в KHAI! 🚀

Я - первый белорусский ИИ-ассистент. Готов помочь вам с:

- Ответами на вопросы
- Генерацией текстов
- Анализом документов
- Программированием

**Просто введите ваш вопрос ниже и нажмите Enter!**

Например:
- "Объясни квантовую физику простыми словами"
- "Напиши код для сортировки массива"
- "Помоги составить бизнес-план"
            `.trim();
            
            this.addMessage('ai', welcomeMessage);
        }
    }

    // Показать уведомление
    showNotification(title, message, duration = 3000) {
        // Создаем простое уведомление в консоли для демонстрации
        console.log(`[${title}] ${message}`);
        
        // В реальном приложении здесь будет красивый toast
        alert(`${title}: ${message}`);
    }

    // Настройка PWA
    setupPWA() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showPWAInstallPrompt();
        });
        
        const installBtn = document.getElementById('pwaInstall');
        const dismissBtn = document.getElementById('pwaDismiss');
        
        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    if (outcome === 'accepted') {
                        this.hidePWAInstallPrompt();
                    }
                    deferredPrompt = null;
                }
            });
        }
        
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                this.hidePWAInstallPrompt();
            });
        }
    }

    // Показать промпт установки PWA
    showPWAInstallPrompt() {
        const prompt = document.getElementById('pwaPrompt');
        if (prompt) {
            prompt.classList.add('active');
        }
    }

    // Скрыть промпт установки PWA
    hidePWAInstallPrompt() {
        const prompt = document.getElementById('pwaPrompt');
        if (prompt) {
            prompt.classList.remove('active');
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.khai = new KHAIInterface();
    console.log('KHAI успешно загружен!');
});

// Простой Service Worker для PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Базовый Service Worker
        const swContent = `
            self.addEventListener('install', (event) => {
                console.log('Service Worker installed');
            });
            
            self.addEventListener('fetch', (event) => {
                event.respondWith(fetch(event.request));
            });
        `;
        
        const blob = new Blob([swContent], { type: 'application/javascript' });
        const swURL = URL.createObjectURL(blob);
        
        navigator.serviceWorker.register(swURL)
            .then((registration) => {
                console.log('SW registered');
            })
            .catch((error) => {
                console.log('SW registration failed:', error);
            });
    });
}
