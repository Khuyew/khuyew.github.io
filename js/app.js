import ChatManager from './modules/chat.js';
import VoiceManager from './modules/voice.js';
import ImageManager from './modules/images.js';
import Utils from './modules/utils.js';

class KhuyewAI {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.clearInputBtn = document.getElementById('clearInputBtn');
        this.userInput = document.getElementById('userInput');
        this.helpBtn = document.getElementById('helpBtn');
        this.privacyLink = document.getElementById('privacyLink');
        
        this.isDarkTheme = true;
        this.modules = {};
        
        this.init();
    }

    init() {
        this.loadTheme();
        this.bindEvents();
        this.initModules();
        this.registerServiceWorker();
        
        console.log('Khuyew AI initialized successfully');
    }

    initModules() {
        // Initialize all modules
        this.modules.imageManager = new ImageManager();
        this.modules.voiceManager = new VoiceManager();
        this.modules.chatManager = new ChatManager();
        
        // Make modules globally available for event handlers
        window.imageManager = this.modules.imageManager;
        window.chatManager = this.modules.chatManager;
        window.voiceManager = this.modules.voiceManager;
    }

    bindEvents() {
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Clear input
        this.clearInputBtn.addEventListener('click', () => this.clearInput());
        
        // Help button
        this.helpBtn.addEventListener('click', () => this.showHelp());
        
        // Privacy link
        this.privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPrivacyInfo();
        });
        
        // Auto-resize textarea
        this.userInput.addEventListener('input', Utils.debounce(() => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
        }, 100));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('khuyew-ai-theme');
        this.isDarkTheme = savedTheme ? savedTheme === 'dark' : true;
        this.applyTheme();
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        this.applyTheme();
        localStorage.setItem('khuyew-ai-theme', this.isDarkTheme ? 'dark' : 'light');
        
        const icon = this.themeToggle.querySelector('i');
        icon.className = this.isDarkTheme ? 'ti ti-sun' : 'ti ti-moon';
        
        Utils.showNotification(`Тема изменена на ${this.isDarkTheme ? 'тёмную' : 'светлую'}`, 'success');
    }

    applyTheme() {
        const themeCSS = document.getElementById('theme-css');
        const body = document.body;
        
        if (this.isDarkTheme) {
            themeCSS.href = 'css/themes/dark.css';
            body.classList.add('dark-theme');
            body.classList.remove('light-theme');
        } else {
            themeCSS.href = 'css/themes/light.css';
            body.classList.add('light-theme');
            body.classList.remove('dark-theme');
        }
    }

    clearInput() {
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        this.userInput.focus();
        Utils.showNotification('Ввод очищен', 'success');
    }

    showHelp() {
        const helpMessage = `## Khuyew AI - Справка

### Основные возможности:
• **Текстовый чат** - задавайте любые вопросы
• **Генерация изображений** - используйте слова "нарисуй", "сгенерируй изображение"
• **Анализ изображений** - загружайте изображения для анализа
• **Голосовой ввод** - нажмите кнопку микрофона

### Горячие клавиши:
• **Enter** - отправить сообщение
• **Shift + Enter** - новая строка
• **Ctrl + /** - открыть справку
• **Ctrl + K** - очистить чат
• **Esc** - закрыть модальные окна

### Поддерживаемые форматы изображений:
JPEG, PNG, GIF, WebP (до 10MB)

### Особенности:
• Полностью бесплатно
• Работает в браузере
• Поддержка мобильных устройств
• Темная/светлая темы
• История сообщений сохраняется локально`;

        if (this.modules.chatManager) {
            this.modules.chatManager.addMessage('ai', helpMessage);
        }
    }

    showPrivacyInfo() {
        const privacyMessage = `## Конфиденциальность

### Обработка данных:
• Все сообщения обрабатываются на наших серверах
• Изображения анализируются только для ответа на ваш запрос
• Мы не сохраняем ваши данные после обработки
• История чата хранится только в вашем браузере

### Безопасность:
• Соединение защищено HTTPS
• Данные передаются в зашифрованном виде
• Отсутствует отслеживание и сбор аналитики

### Локальное хранение:
• История чата сохраняется в localStorage
• Настройки темы сохраняются локально
• Вы можете очистить данные в любой время через "Очистить чат"

Khuyew AI уважает вашу приватность и работает полностью анонимно.`;

        if (this.modules.chatManager) {
            this.modules.chatManager.addMessage('ai', privacyMessage);
        }
    }

    handleKeyboardShortcuts(e) {
        // Ctrl + / for help
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            this.showHelp();
        }
        
        // Ctrl + K to clear chat
        if (e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            this.modules.chatManager?.clearChat();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            const modal = document.getElementById('imageModal');
            if (!modal.hidden) {
                window.imageManager?.closeModal();
            }
        }
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service Worker registered');
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }

    // Public methods for global access
    clearChat() {
        this.modules.chatManager?.clearChat();
    }

    sendMessage() {
        this.modules.chatManager?.sendMessage();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.khuyewAI = new KhuyewAI();
});

// Handle errors
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    Utils.showNotification('Произошла непредвиденная ошибка', 'error');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    Utils.showNotification('Ошибка при выполнении операции', 'error');
});
