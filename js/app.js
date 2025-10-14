// Основное приложение
class KhuyewAI {
    constructor() {
        this.messagesContainer = document.getElementById('messagesContainer');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        this.introCompleted = false;
        this.lastUserMessage = null;
        this.voiceRecognition = null;
        this.aiStreaming = null;
        
        this.init();
    }

    init() {
        this.aiStreaming = new AIStreaming(this.messagesContainer);
        this.voiceRecognition = new VoiceRecognition();
        
        this.loadChatHistory();
        initTheme();
        this.setupEventListeners();
        
        // Фокус на поле ввода
        this.userInput.focus();

        // Запуск введения если нет истории
        if (!this.messagesContainer.querySelector('.message')) {
            setTimeout(() => this.showIntro(), 500);
        }
    }

    setupEventListeners() {
        // Обработчики событий
        document.querySelector('.logo').addEventListener('click', () => this.clearChat());
        document.getElementById('themeToggle').addEventListener('click', toggleTheme);
        document.getElementById('generateImageBtn').addEventListener('click', () => this.handleGenerateImage());
        document.getElementById('helpButton').addEventListener('click', () => this.showHelp());
        document.getElementById('exportButton').addEventListener('click', () => this.exportChat());
        document.getElementById('clearButton').addEventListener('click', () => this.clearChat());
        document.getElementById('privacyLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPrivacyInfo();
        });

        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        if (message === '') return;
        
        if (!this.introCompleted) {
            this.introCompleted = true;
            document.querySelector('.skip-intro')?.remove();
        }
        
        this.addUserMessage(message);
        this.userInput.value = '';
        
        const requestType = analyzeRequest(message);
        
        if (requestType === 'generate') {
            await this.aiStreaming.generateImage(message);
            this.removePendingAnimation();
            return;
        }
        
        // Текстовый запрос
        try {
            await this.aiStreaming.streamTextResponse(message);
            this.removePendingAnimation();
        } catch (error) {
            console.error('Ошибка получения ответа:', error);
            this.removePendingAnimation();
            
            const errorElement = document.createElement('div');
            errorElement.classList.add('message', 'ai-message');
            this.messagesContainer.appendChild(errorElement);
            
            // Используем старый метод печати при ошибке стриминга
            await this.typeText(errorElement, 
                "Извините, произошла ошибка соединения. Пожалуйста, проверьте интернет и попробуйте еще раз.");
        }
    }

    addUserMessage(text) {
        const messageElement = addMessage(this.messagesContainer, text, true);
        messageElement.classList.add('pending');
        this.lastUserMessage = messageElement;
        return messageElement;
    }

    removePendingAnimation() {
        if (this.lastUserMessage) {
            this.lastUserMessage.classList.remove('pending');
            this.lastUserMessage = null;
        }
    }

    handleGenerateImage() {
        const prompt = this.userInput.value.trim();
        if (prompt) {
            this.sendMessage();
        } else {
            this.userInput.placeholder = "Опишите что нарисовать...";
            this.userInput.focus();
        }
    }

    // Резервный метод печати текста (используется при ошибках)
    async typeText(element, text, speed = 20) {
        return new Promise(resolve => {
            let i = 0;
            element.innerHTML = '';
            element.classList.add('ai-streaming');
            
            function type() {
                if (i < text.length) {
                    const char = text.charAt(i);
                    element.innerHTML = sanitizeHTML(text.substring(0, i + 1)) + '<span class="typing-cursor"></span>';
                    i++;
                    scrollToBottom(this.messagesContainer);
                    
                    const delay = char === '.' || char === '!' || char === '?' ? speed * 3 : speed;
                    setTimeout(type, delay);
                } else {
                    element.innerHTML = sanitizeHTML(text);
                    element.classList.remove('ai-streaming');
                    saveChatHistory(this.messagesContainer);
                    resolve();
                }
            }
            type.call(this);
        });
    }

    // Введение бота
    async showIntro() {
        const introMessages = [
            "Привет! Я Khuyew AI - полностью бесплатный ИИ-помощник.",
            "Я умею общаться и генерировать изображения по вашему описанию!",
            "Просто напишите что нарисовать или задайте любой вопрос.",
            "Используйте кнопку '🎨 Сгенерировать' для быстрого создания изображений.",
            "Я полностью бесплатный - используйте меня сколько угодно!"
        ];
        
        for (const message of introMessages) {
            if (this.introCompleted) break;
            
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', 'ai-message');
            this.messagesContainer.appendChild(messageElement);
            
            await this.typeText(messageElement, message);
            await new Promise(resolve => setTimeout(resolve, 800));
        }
        
        if (!this.introCompleted) {
            this.createSkipButton();
        }
    }

    createSkipButton() {
        const skipButton = document.createElement('div');
        skipButton.classList.add('skip-intro');
        skipButton.textContent = 'Пропустить введение';
        skipButton.addEventListener('click', () => this.skipIntro());
        this.messagesContainer.appendChild(skipButton);
        scrollToBottom(this.messagesContainer);
    }

    skipIntro() {
        this.introCompleted = true;
        document.querySelector('.skip-intro')?.remove();
        addMessage(this.messagesContainer, 
            'Отлично! Теперь вы можете задавать вопросы или генерировать изображения. Я готов помочь!', false);
    }

    loadChatHistory() {
        const hasHistory = loadChatHistory(this.messagesContainer);
        if (hasHistory) {
            this.introCompleted = true;
        }
    }

    showHelp() {
        const helpMessage = "🎯 **Как использовать:**\n\n• **Общение**: просто напишите вопрос\n• **Генерация изображений**: 'нарисуй кота', 'сгенерируй пейзаж'\n• **Голосовой ввод**: нажмите '🎤 Голос' и говорите\n• **Быстрая генерация**: используйте кнопку '🎨 Сгенерировать'";
        addMessage(this.messagesContainer, helpMessage, false);
    }

    exportChat() {
        exportChat(this.messagesContainer);
        addMessage(this.messagesContainer, 'Чат экспортирован в файл!', false);
    }

    clearChat() {
        if (confirm('Очистить всю историю чата?')) {
            this.messagesContainer.innerHTML = '';
            this.lastUserMessage = null;
            this.introCompleted = false;
            localStorage.removeItem('khuyew-chat-history');
            setTimeout(() => this.showIntro(), 500);
        }
    }

    showPrivacyInfo() {
        const privacyMessage = "🔒 **Конфиденциальность:**\n\n• Все данные хранятся локально в вашем браузере\n• История чата не передается третьим лицам\n• Для полной очистки используйте кнопку '🗑️ Очистить'";
        addMessage(this.messagesContainer, privacyMessage, false);
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    window.khuyewAI = new KhuyewAI();
});
