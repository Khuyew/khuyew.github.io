// Основное приложение
class KhuyewAI {
    constructor() {
        this.messagesContainer = document.getElementById('messagesContainer');
        this.userInput = document.getElementById('user-input');
        this.sendButton = document.getElementById('send-button');
        this.voiceButton = document.getElementById('voiceButton');
        this.imageUploadButton = document.getElementById('imageUploadButton');
        this.fileInput = document.getElementById('fileInput');
        this.imagePreviewContainer = document.getElementById('imagePreviewContainer');
        this.imagePreview = document.getElementById('imagePreview');
        this.removeImageBtn = document.getElementById('removeImageBtn');
        
        this.introCompleted = false;
        this.lastUserMessage = null;
        this.voiceRecognition = null;
        this.aiStreaming = null;
        this.isProcessing = false;
        this.currentImage = null;
        
        this.init();
    }

    init() {
        if (!this.messagesContainer || !this.userInput || !this.sendButton) {
            console.error('Не удалось найти необходимые DOM элементы');
            return;
        }

        // Настройка Markdown
        marked.setOptions({
            breaks: true,
            gfm: true,
            langPrefix: 'language-'
        });

        this.aiStreaming = new AIStreaming(this.messagesContainer);
        this.voiceRecognition = new VoiceRecognition();
        
        this.loadChatHistory();
        initTheme();
        initImageModal();
        this.setupEventListeners();
        this.setupTextareaAutoResize();
        
        // Фокус на поле ввода
        this.userInput.focus();

        // Запуск введения если нет истории
        if (!this.messagesContainer.querySelector('.message')) {
            setTimeout(() => this.showIntro(), 500);
        }
    }

    setupEventListeners() {
        // Обработчики событий для логотипа
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearChat();
            });
        }

        // Обработчики для кнопок управления
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleTheme();
            });
        }

        const generateImageBtn = document.getElementById('generateImageBtn');
        if (generateImageBtn) {
            generateImageBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleGenerateImage();
            });
        }

        const helpButton = document.getElementById('helpButton');
        if (helpButton) {
            helpButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showHelp();
            });
        }

        const exportButton = document.getElementById('exportButton');
        if (exportButton) {
            exportButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.exportChat();
            });
        }

        const clearButton = document.getElementById('clearButton');
        if (clearButton) {
            clearButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.clearChat();
            });
        }

        const privacyLink = document.getElementById('privacyLink');
        if (privacyLink) {
            privacyLink.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showPrivacyInfo();
            });
        }

        // Основные обработчики
        this.sendButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.sendMessage();
        });
        
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Обработчики загрузки изображений
        if (this.imageUploadButton && this.fileInput) {
            this.imageUploadButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.fileInput.click();
            });

            this.fileInput.addEventListener('change', (e) => {
                this.handleImageUpload(e);
            });
        }

        if (this.removeImageBtn) {
            this.removeImageBtn.addEventListener('click', () => {
                this.removeCurrentImage();
            });
        }

        // Автофокус при клике в любое место чата
        this.messagesContainer.addEventListener('click', () => {
            this.userInput.focus();
        });

        // Предотвращение всплытия для всех action buttons
        document.querySelectorAll('.action-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    }

    async sendMessage() {
        if (this.isProcessing) {
            return;
        }

        const message = this.userInput.value.trim();
        const hasImage = this.currentImage !== null;
        
        if (message === '' && !hasImage) return;
        
        this.isProcessing = true;
        this.sendButton.disabled = true;
        
        try {
            if (!this.introCompleted) {
                this.introCompleted = true;
                document.querySelector('.skip-intro')?.remove();
            }
            
            // Добавляем сообщение пользователя
            if (hasImage) {
                this.addUserMessageWithImage(message, this.currentImage);
            } else {
                this.addUserMessage(message);
            }
            
            this.userInput.value = '';
            this.userInput.style.height = 'auto';
            this.removeCurrentImage();
            
            const requestType = analyzeRequest(message);
            
            if (requestType === 'generate' && !hasImage) {
                await this.aiStreaming.generateImage(message);
                this.removePendingAnimation();
            } else {
                try {
                    if (hasImage) {
                        await this.aiStreaming.analyzeImageWithText(message, this.currentImage);
                    } else {
                        await this.aiStreaming.streamTextResponse(message);
                    }
                    this.removePendingAnimation();
                } catch (error) {
                    console.error('Ошибка получения ответа:', error);
                    this.removePendingAnimation();
                    
                    addMessage(this.messagesContainer, 
                        "❌ Извините, произошла ошибка соединения. Пожалуйста, проверьте интернет и попробуйте еще раз.", 
                        false, true);
                }
            }
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            addMessage(this.messagesContainer, 
                "❌ Произошла непредвиденная ошибка. Пожалуйста, попробуйте еще раз.", 
                false, true);
        } finally {
            this.isProcessing = false;
            this.sendButton.disabled = false;
            setTimeout(() => this.userInput.focus(), 100);
        }
    }

    addUserMessage(text) {
        const messageElement = addMessage(this.messagesContainer, text, true);
        messageElement.classList.add('pending');
        this.lastUserMessage = messageElement;
        return messageElement;
    }

    addUserMessageWithImage(text, imageData) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'user-message', 'pending');
        
        const contentElement = document.createElement('div');
        contentElement.classList.add('message-content');
        
        if (text) {
            const textElement = document.createElement('div');
            textElement.textContent = text;
            contentElement.appendChild(textElement);
        }
        
        // Добавляем изображение
        const imgElement = document.createElement('img');
        imgElement.src = imageData;
        imgElement.classList.add('generated-image');
        imgElement.style.maxWidth = '200px';
        imgElement.style.maxHeight = '150px';
        imgElement.style.marginTop = text ? '10px' : '0';
        imgElement.alt = 'Загруженное изображение';
        imgElement.onerror = () => {
            imgElement.style.display = 'none';
            const errorMsg = document.createElement('div');
            errorMsg.textContent = '❌ Не удалось загрузить изображение';
            errorMsg.style.color = '#ff6b6b';
            errorMsg.style.marginTop = '10px';
            contentElement.appendChild(errorMsg);
        };
        
        contentElement.appendChild(imgElement);
        messageElement.appendChild(contentElement);
        
        this.messagesContainer.appendChild(messageElement);
        scrollToBottom(this.messagesContainer);
        this.lastUserMessage = messageElement;
        
        return messageElement;
    }

    removePendingAnimation() {
        if (this.lastUserMessage) {
            this.lastUserMessage.classList.remove('pending');
            this.lastUserMessage = null;
        }
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            addMessage(this.messagesContainer, 
                '⚠️ Пожалуйста, выберите файл изображения', false, true);
            return;
        }

        // Проверка размера файла (максимум 5MB)
        if (file.size > 5 * 1024 * 1024) {
            addMessage(this.messagesContainer, 
                '⚠️ Размер изображения не должен превышать 5MB', false, true);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentImage = e.target.result;
            if (this.imagePreview && this.imagePreviewContainer) {
                this.imagePreview.src = this.currentImage;
                this.imagePreviewContainer.style.display = 'block';
            }
            this.userInput.placeholder = "Опишите изображение или задайте вопрос...";
            this.userInput.focus();
        };
        
        reader.onerror = () => {
            addMessage(this.messagesContainer, 
                '❌ Ошибка при загрузке изображения', false, true);
        };
        
        reader.readAsDataURL(file);
        
        // Сбрасываем input для возможности загрузки того же файла снова
        event.target.value = '';
    }

    removeCurrentImage() {
        this.currentImage = null;
        if (this.imagePreviewContainer) {
            this.imagePreviewContainer.style.display = 'none';
        }
        this.userInput.placeholder = "Задайте вопрос или опишите изображение...";
        if (this.fileInput) {
            this.fileInput.value = '';
        }
    }

    setupTextareaAutoResize() {
        // Дебаунсим изменение размера для лучшей производительности
        const debouncedResize = debounce(() => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
        }, 10);
        
        this.userInput.addEventListener('input', debouncedResize);
        
        // Также обрабатываем paste события
        this.userInput.addEventListener('paste', () => {
            setTimeout(debouncedResize, 0);
        });
    }

    handleGenerateImage() {
        const prompt = this.userInput.value.trim();
        if (prompt) {
            this.sendMessage();
        } else {
            this.userInput.placeholder = "🎨 Опишите что нарисовать...";
            this.userInput.focus();
        }
    }

    // Введение бота
    async showIntro() {
        const introMessages = [
            "👋 Привет! Я **Khuyew AI** - полностью бесплатный ИИ-помощник.",
            "✨ Я умею:\n• Отвечать на вопросы\n• Генерировать изображения\n• Поддерживать Markdown\n• Распознавать голос",
            "💡 **Быстрый старт:**\n• Напишите вопрос\n• Или скажите `нарисуй кота`\n• Используйте кнопки для быстрых действий",
            "🎯 **Особенности:**\n• 🤖 Умный AI\n• 🎨 Генерация картинок\n• 🎤 Голосовой ввод\n• 📝 Markdown поддержка\n• 💾 Экспорт чатов",
            "🚀 **Начните общение прямо сейчас!**\nЯ полностью бесплатен и готов помочь!"
        ];
        
        for (const message of introMessages) {
            if (this.introCompleted) break;
            
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', 'ai-message');
            this.messagesContainer.appendChild(messageElement);
            
            await this.typeText(messageElement, message);
            await new Promise(resolve => setTimeout(resolve, 1200));
        }
        
        if (!this.introCompleted) {
            this.createSkipButton();
        }
    }

    // Резервный метод печати текста
    async typeText(element, text, speed = 40) {
        return new Promise(resolve => {
            let i = 0;
            element.innerHTML = '';
            element.classList.add('ai-streaming');
            
            const type = () => {
                if (i < text.length) {
                    const char = text.charAt(i);
                    element.innerHTML = marked.parse(text.substring(0, i + 1)) + '<span class="typing-cursor"></span>';
                    i++;
                    scrollToBottom(this.messagesContainer);
                    
                    const delay = char === '.' || char === '!' || char === '?' ? speed * 3 : speed;
                    setTimeout(type, delay);
                } else {
                    element.innerHTML = marked.parse(text);
                    element.classList.remove('ai-streaming');
                    saveChatHistory(this.messagesContainer);
                    resolve();
                }
            };
            
            type();
        });
    }

    createSkipButton() {
        const skipButton = document.createElement('div');
        skipButton.classList.add('skip-intro');
        skipButton.textContent = '⏩ Пропустить введение';
        skipButton.addEventListener('click', () => this.skipIntro());
        this.messagesContainer.appendChild(skipButton);
        scrollToBottom(this.messagesContainer);
    }

    skipIntro() {
        this.introCompleted = true;
        document.querySelector('.skip-intro')?.remove();
        addMessage(this.messagesContainer, 
            '🎉 Отлично! Теперь вы можете задавать вопросы или генерировать изображения. Я готов помочь!', false);
    }

    loadChatHistory() {
        const hasHistory = loadChatHistory(this.messagesContainer);
        if (hasHistory) {
            this.introCompleted = true;
        }
    }

    showHelp() {
        const helpMessage = `## 🎯 **Как использовать Khuyew AI**

### 💬 **Основные функции:**
• **Общение** - просто напишите вопрос
• **Изображения** - "нарисуй кота", "сгенерируй пейзаж"
• **Голосовой ввод** - нажмите 🎤 и говорите
• **Markdown** - поддерживается форматирование

### 🎨 **Генерация изображений:**
\`\`\`
нарисуй космонавта в стиле пиксель-арт
сгенерируй фэнтезийный замок
создай абстрактное искусство
\`\`\`

### ⌨️ **Горячие клавиши:**
• **Enter** - отправить сообщение
• **Shift + Enter** - новая строка
• **ESC** - закрыть модальное окно

### 💾 **Управление чатом:**
• **Экспорт** - сохранить историю в файл
• **Очистка** - начать новый чат
• **Тема** - переключить светлую/тёмную`;

        addMessage(this.messagesContainer, helpMessage, false);
    }

    exportChat() {
        exportChat(this.messagesContainer);
        addMessage(this.messagesContainer, '💾 Чат успешно экспортирован в файл!', false);
    }

    clearChat() {
        if (confirm('🧹 Очистить всю историю чата?')) {
            try {
                // Останавливаем все активные процессы
                this.isProcessing = false;
                this.sendButton.disabled = false;
                
                if (this.aiStreaming) {
                    this.aiStreaming.cancelStream();
                }
                
                if (this.voiceRecognition && this.voiceRecognition.isRecording) {
                    this.voiceRecognition.stop();
                }
                
                // Очищаем UI
                this.messagesContainer.innerHTML = '';
                this.lastUserMessage = null;
                this.introCompleted = false;
                this.removeCurrentImage();
                
                // Очищаем хранилище
                localStorage.removeItem('khuyew-chat-history');
                
                // Сбрасываем поле ввода
                this.userInput.value = '';
                this.userInput.style.height = 'auto';
                
                // Запускаем введение
                setTimeout(() => this.showIntro(), 500);
                
            } catch (error) {
                console.error('Ошибка при очистке чата:', error);
                // Принудительная перезагрузка в случае критической ошибки
                location.reload();
            }
        }
    }

    showPrivacyInfo() {
        const privacyMessage = `## 🔒 **Конфиденциальность и безопасность**

### 📍 **Локальное хранение:**
• Все данные хранятся **только в вашем браузере**
• История чата **не передаётся** на сервер
• Изображения генерируются через безопасное API

### 🗑️ **Управление данными:**
• Для полной очистки используйте кнопку **"🗑️ Очистить"**
• История автоматически сохраняется локально
• Максимум **100 сообщений** в истории

### 🌐 **Доступ в интернет:**
• Требуется только для работы AI и генерации изображений
• Все запросы защищены HTTPS
• Никакие личные данные не собираются

### ✅ **Безопасность гарантирована!**`;

        addMessage(this.messagesContainer, privacyMessage, false);
    }
}

// Инициализация приложения с обработкой ошибок
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Проверяем поддержку необходимых API
        if (!window.localStorage) {
            throw new Error('LocalStorage не поддерживается');
        }
        
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = window.setTimeout;
        }
        
        // Инициализируем приложение
        window.khuyewAI = new KhuyewAI();
        
        // Глобальный обработчик ошибок
        window.addEventListener('error', (event) => {
            console.error('Глобальная ошибка:', event.error);
            
            // Показываем пользователю сообщение об ошибке
            const messagesContainer = document.getElementById('messagesContainer');
            if (messagesContainer && window.addMessage) {
                addMessage(messagesContainer, 
                    '⚠️ Произошла непредвиденная ошибка. Попробуйте обновить страницу.', 
                    false, true);
            }
        });
        
        // Обработчик необработанных промисов
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Необработанное отклонение промиса:', event.reason);
            event.preventDefault();
        });
        
    } catch (error) {
        console.error('Критическая ошибка инициализации:', error);
        
        // Показываем базовое сообщение об ошибке
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                font-family: system-ui, sans-serif;
                background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
                color: white;
                text-align: center;
                padding: 20px;
            ">
                <div>
                    <h1 style="margin-bottom: 20px;">⚠️ Ошибка загрузки</h1>
                    <p style="margin-bottom: 20px;">Не удалось загрузить приложение. Пожалуйста, обновите страницу.</p>
                    <button onclick="location.reload()" style="
                        background: #0099ff;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                    ">Обновить страницу</button>
                </div>
            </div>
        `;
    }
});
