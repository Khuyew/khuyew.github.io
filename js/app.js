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
        this.isProcessing = false;
        this.currentStream = null;
        this.currentTypingIndicator = null;
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

        this.initVoiceRecognition();
        this.initTheme();
        this.initImageModal();
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
                this.toggleTheme();
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

        // Загрузка изображений
        if (this.imageUploadButton) {
            this.imageUploadButton.addEventListener('click', () => {
                this.fileInput.click();
            });
        }

        if (this.fileInput) {
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

        // Обработка ошибок изображений
        document.addEventListener('error', (e) => {
            if (e.target.classList && (e.target.classList.contains('generated-image') || e.target.classList.contains('image-preview'))) {
                console.error('Ошибка загрузки изображения:', e.target.src);
                e.target.style.display = 'none';
                const parent = e.target.closest('.ai-image-message') || e.target.closest('.image-preview-container');
                if (parent) {
                    const errorMsg = document.createElement('div');
                    errorMsg.textContent = '❌ Не удалось загрузить изображение';
                    errorMsg.style.color = '#ff6b6b';
                    errorMsg.style.marginTop = '10px';
                    parent.appendChild(errorMsg);
                }
            }
        }, true);
    }

    setupTextareaAutoResize() {
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
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
            
            // Сохраняем изображение перед очисткой
            const imageToAnalyze = this.currentImage;
            
            // Добавляем сообщение пользователя
            if (hasImage) {
                this.addUserMessageWithImage(message, imageToAnalyze);
            } else {
                this.addUserMessage(message);
            }
            
            this.userInput.value = '';
            this.userInput.style.height = 'auto';
            this.removeCurrentImage();
            
            const requestType = this.analyzeRequest(message);
            
            if (requestType === 'generate' && !hasImage) {
                await this.generateImage(message);
                this.removePendingAnimation();
            } else {
                try {
                    if (hasImage) {
                        await this.analyzeImageWithText(message, imageToAnalyze);
                    } else {
                        await this.streamTextResponse(message);
                    }
                    this.removePendingAnimation();
                } catch (error) {
                    console.error('Ошибка получения ответа:', error);
                    this.removePendingAnimation();
                    
                    this.addMessage(
                        "❌ Извините, произошла ошибка соединения. Пожалуйста, проверьте интернет и попробуйте еще раз.", 
                        false, true
                    );
                }
            }
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            this.addMessage(
                "❌ Произошла непредвиденная ошибка. Пожалуйста, попробуйте еще раз.", 
                false, true
            );
        } finally {
            this.isProcessing = false;
            this.sendButton.disabled = false;
            setTimeout(() => this.userInput.focus(), 100);
        }
    }

    addUserMessage(text) {
        const messageElement = this.addMessage(text, true);
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
        this.scrollToBottom();
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
            alert('Пожалуйста, выберите файл изображения');
            return;
        }

        // Проверка размера файла (максимум 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('Размер изображения не должен превышать 10MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentImage = e.target.result;
            this.imagePreview.src = this.currentImage;
            this.imagePreviewContainer.style.display = 'block';
            this.userInput.placeholder = "Опишите изображение или задайте вопрос...";
            this.userInput.focus();
        };
        
        reader.onerror = () => {
            alert('Ошибка при загрузке изображения');
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

    // Введение бота
    async showIntro() {
        const introMessages = [
            "👋 Привет! Я **Khuyew AI** - полностью бесплатный ИИ-помощник.",
            "✨ Я умею отвечать на вопросы, анализировать изображения и генерировать картинки!",
            "💡 **Быстрый старт:** Напишите вопрос, загрузите изображение или скажите 'нарисуй кота'",
            "🎯 Используйте кнопки справа для голосового ввода и загрузки изображений",
            "🚀 **Начните общение прямо сейчас!** Я полностью бесплатен и готов помочь!"
        ];
        
        // Сразу показываем кнопку пропуска
        this.createSkipButton();
        
        for (const message of introMessages) {
            if (this.introCompleted) break;
            
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', 'ai-message');
            this.messagesContainer.appendChild(messageElement);
            
            await this.typeText(messageElement, message);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // Печать текста
    async typeText(element, text, speed = 30) {
        return new Promise(resolve => {
            let i = 0;
            element.innerHTML = '<span class="typing-cursor">▊</span>';
            element.classList.add('ai-streaming');
            
            const type = () => {
                if (i < text.length) {
                    const char = text.charAt(i);
                    element.innerHTML = '<span class="typing-cursor">▊</span>' + this.sanitizeHTML(text.substring(0, i + 1));
                    i++;
                    this.scrollToBottom();
                    
                    const delay = char === '.' || char === '!' || char === '?' ? speed * 3 : speed;
                    setTimeout(type, delay);
                } else {
                    element.innerHTML = marked.parse(text);
                    element.classList.remove('ai-streaming');
                    this.applyCodeHighlighting(element);
                    resolve();
                }
            };
            
            type();
        });
    }

    createSkipButton() {
        const skipButton = document.createElement('div');
        skipButton.classList.add('skip-intro');
        skipButton.innerHTML = '<i class="ti ti-player-skip-forward"></i>Пропустить введение';
        skipButton.addEventListener('click', () => this.skipIntro());
        this.messagesContainer.appendChild(skipButton);
        this.scrollToBottom();
    }

    skipIntro() {
        this.introCompleted = true;
        document.querySelector('.skip-intro')?.remove();
        this.addMessage(
            '🎉 Отлично! Теперь вы можете задавать вопросы, загружать изображения или генерировать картинки.', 
            false
        );
    }

    showHelp() {
        const helpMessage = `## 🎯 **Как использовать**

• **Общение** - напишите вопрос и нажмите Enter
• **Анализ изображений** - загрузите картинку и опишите что нужно сделать
• **Генерация изображений** - "нарисуй кота", "сгенерируй пейзаж"
• **Голосовой ввод** - нажмите 🎤 и говорите
• **Загрузка файлов** - нажмите 📷 для выбора изображения

### ⌨️ **Горячие клавиши:**
• **Enter** - отправить сообщение
• **Shift + Enter** - новая строка
• **ESC** - закрыть модальное окно`;

        this.addMessage(helpMessage, false);
    }

    exportChat() {
        try {
            const messages = Array.from(this.messagesContainer.querySelectorAll('.message'));
            const chatText = messages.map(msg => {
                const sender = msg.classList.contains('user-message') ? 'Вы' : 'ИИ';
                const content = msg.querySelector('.message-content') ? 
                    msg.querySelector('.message-content').textContent : msg.textContent;
                return `${sender}: ${content}`;
            }).join('\n\n');
            
            const blob = new Blob([chatText], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `khuyew-chat-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.addMessage('💾 Чат экспортирован в файл!', false);
        } catch (error) {
            console.error('Ошибка экспорта:', error);
            this.addMessage('❌ Ошибка при экспорте чата', false, true);
        }
    }

    clearChat() {
        if (confirm('Очистить всю историю чата?')) {
            this.messagesContainer.innerHTML = '';
            this.lastUserMessage = null;
            this.introCompleted = false;
            this.isProcessing = false;
            this.sendButton.disabled = false;
            this.removeCurrentImage();
            
            // Отмена текущего стрима
            if (this.currentStream) {
                this.currentStream.cancel?.();
                this.currentStream = null;
            }
            
            // Удаление индикатора печати
            if (this.currentTypingIndicator) {
                this.currentTypingIndicator.remove();
                this.currentTypingIndicator = null;
            }
            
            localStorage.removeItem('khuyew-chat-history');
            setTimeout(() => this.showIntro(), 500);
        }
    }

    showPrivacyInfo() {
        const privacyMessage = `## 🔒 **Конфиденциальность**

• Все данные хранятся **только в вашем браузере**
• История чата **не передаётся** на сервер
• Изображения обрабатываются через защищенное API
• Для полной очистки используйте кнопку **"🗑️ Очистить"**`;

        this.addMessage(privacyMessage, false);
    }

    // Утилиты
    sanitizeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToBottom() {
        if (this.messagesContainer) {
            setTimeout(() => {
                this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
            }, 50);
        }
    }

    addMessage(text, isUser = false, isError = false) {
        const messageElement = document.createElement('div');
        const className = isError ? 'error-message' : (isUser ? 'user-message' : 'ai-message');
        messageElement.classList.add('message', className);
        
        const contentElement = document.createElement('div');
        contentElement.classList.add('message-content');
        
        if (isUser || isError) {
            contentElement.textContent = text;
        } else {
            try {
                contentElement.innerHTML = marked.parse(text);
                this.applyCodeHighlighting(contentElement);
            } catch (error) {
                console.error('Ошибка парсинга Markdown:', error);
                contentElement.textContent = text;
            }
        }
        
        messageElement.appendChild(contentElement);
        
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        return messageElement;
    }

    applyCodeHighlighting(element) {
        try {
            element.querySelectorAll('pre code').forEach((block) => {
                const pre = block.closest('pre');
                const language = block.className.replace('language-', '') || 'text';
                
                const codeHeader = document.createElement('div');
                codeHeader.className = 'code-header';
                
                const languageSpan = document.createElement('span');
                languageSpan.className = 'code-language';
                languageSpan.textContent = language;
                
                const copyButton = document.createElement('button');
                copyButton.className = 'copy-button';
                copyButton.innerHTML = '<i class="ti ti-copy"></i>Копировать';
                
                copyButton.addEventListener('click', () => {
                    const codeText = block.textContent;
                    navigator.clipboard.writeText(codeText).then(() => {
                        copyButton.innerHTML = '<i class="ti ti-check"></i>Скопировано!';
                        copyButton.classList.add('copied');
                        setTimeout(() => {
                            copyButton.innerHTML = '<i class="ti ti-copy"></i>Копировать';
                            copyButton.classList.remove('copied');
                        }, 2000);
                    }).catch(err => {
                        console.error('Ошибка копирования:', err);
                        copyButton.innerHTML = '<i class="ti ti-x"></i>Ошибка';
                    });
                });
                
                codeHeader.appendChild(languageSpan);
                codeHeader.appendChild(copyButton);
                
                pre.insertBefore(codeHeader, block);
                hljs.highlightElement(block);
            });
        } catch (error) {
            console.error('Ошибка подсветки синтаксиса:', error);
        }
    }

    analyzeRequest(message) {
        const imageKeywords = [
            'нарисуй', 'сгенерируй', 'изображение', 'картинку', 'фото', 'иллюстрацию',
            'draw', 'generate', 'image', 'picture', 'photo', 'illustration'
        ];
        
        const lowerMessage = message.toLowerCase();
        return imageKeywords.some(keyword => lowerMessage.includes(keyword)) ? 'generate' : 'text';
    }

    // Голосовой ввод
    initVoiceRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition || !this.voiceButton) {
            if (this.voiceButton) this.voiceButton.style.display = 'none';
            return;
        }

        try {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.lang = 'ru-RU';
            this.recognition.interimResults = true;

            const voiceLevel = document.getElementById('voiceLevel');

            this.recognition.onstart = () => {
                this.voiceButton.classList.add('voice-recording');
                this.voiceButton.innerHTML = '<i class="ti ti-square"></i>';
                if (voiceLevel) voiceLevel.style.display = 'block';
            };

            this.recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        transcript += event.results[i][0].transcript;
                    }
                }
                if (transcript) {
                    this.userInput.value = transcript;
                    this.userInput.dispatchEvent(new Event('input'));
                }
            };

            this.recognition.onend = () => {
                this.voiceButton.classList.remove('voice-recording');
                this.voiceButton.innerHTML = '<i class="ti ti-microphone"></i>';
                if (voiceLevel) voiceLevel.style.display = 'none';
            };

            this.recognition.onerror = (event) => {
                console.error('Ошибка распознавания:', event.error);
                this.voiceButton.classList.remove('voice-recording');
                this.voiceButton.innerHTML = '<i class="ti ti-microphone"></i>';
                if (voiceLevel) voiceLevel.style.display = 'none';
            };

            this.voiceButton.addEventListener('click', () => {
                if (this.voiceButton.classList.contains('voice-recording')) {
                    this.recognition.stop();
                } else {
                    try {
                        this.recognition.start();
                    } catch (error) {
                        console.error('Ошибка запуска распознавания:', error);
                    }
                }
            });
        } catch (error) {
            console.error('Ошибка инициализации голосового ввода:', error);
            if (this.voiceButton) this.voiceButton.style.display = 'none';
        }
    }

    // Тема
    initTheme() {
        const savedTheme = localStorage.getItem('khuyew-theme');
        const themeToggle = document.getElementById('themeToggle');
        // По умолчанию темная тема
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            if (themeToggle) themeToggle.innerHTML = '<i class="ti ti-sun"></i>';
        } else {
            if (themeToggle) themeToggle.innerHTML = '<i class="ti ti-moon"></i>';
        }
    }

    toggleTheme() {
        const themeToggle = document.getElementById('themeToggle');
        document.body.classList.toggle('light-theme');
        if (document.body.classList.contains('light-theme')) {
            localStorage.setItem('khuyew-theme', 'light');
            if (themeToggle) themeToggle.innerHTML = '<i class="ti ti-sun"></i>';
        } else {
            localStorage.setItem('khuyew-theme', 'dark');
            if (themeToggle) themeToggle.innerHTML = '<i class="ti ti-moon"></i>';
        }
    }

    // Модальное окно
    initImageModal() {
        const modal = document.getElementById('imageModal');
        const modalImg = document.getElementById('modalImage');
        const close = document.querySelector('.close');
        
        if (!modal || !close) return;
        
        close.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // ESC для закрытия
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });

        // Обработчики для изображений
        document.addEventListener('click', (e) => {
            if (e.target.classList && e.target.classList.contains('generated-image')) {
                modal.style.display = 'block';
                modalImg.src = e.target.src;
                const caption = document.getElementById('modalCaption');
                if (caption) {
                    caption.textContent = e.target.alt || 'Изображение';
                }
            }
        });
    }

    // AI функции
    async streamTextResponse(prompt) {
        if (this.currentStream) {
            this.currentStream.cancel?.();
        }

        // Создаем индикатор печати
        const typingIndicator = document.createElement('div');
        typingIndicator.classList.add('message', 'ai-message');
        typingIndicator.innerHTML = `
            <div class="ai-status">
                <i class="ti ti-pencil"></i>
                ИИ печатает
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        this.messagesContainer.appendChild(typingIndicator);
        this.currentTypingIndicator = typingIndicator;
        this.scrollToBottom();

        const aiMessageElement = document.createElement('div');
        aiMessageElement.classList.add('message', 'ai-message', 'ai-streaming');
        
        const contentElement = document.createElement('div');
        contentElement.classList.add('message-content');
        contentElement.innerHTML = '<span class="typing-cursor">▊</span>';
        aiMessageElement.appendChild(contentElement);

        try {
            const response = await puter.ai.chat(prompt, { 
                model: "gpt-5-nano", 
                stream: true 
            });
            
            this.currentStream = response;
            let fullText = '';
            
            // Удаляем индикатор печати когда начинается реальный ответ
            if (this.currentTypingIndicator) {
                this.currentTypingIndicator.remove();
                this.currentTypingIndicator = null;
                this.messagesContainer.appendChild(aiMessageElement);
            }
            
            for await (const part of response) {
                if (part?.text) {
                    fullText += part.text;
                    contentElement.innerHTML = '<span class="typing-cursor">▊</span>' + this.sanitizeHTML(fullText);
                    this.scrollToBottom();
                }
            }
            
            contentElement.innerHTML = marked.parse(fullText);
            this.applyCodeHighlighting(contentElement);
            aiMessageElement.classList.remove('ai-streaming');
            this.currentStream = null;
            
        } catch (error) {
            console.error('Ошибка стриминга:', error);
            // Удаляем индикатор печати при ошибке
            if (this.currentTypingIndicator) {
                this.currentTypingIndicator.remove();
                this.currentTypingIndicator = null;
            }
            aiMessageElement.remove();
            this.currentStream = null;
            throw error;
        }
        
        return aiMessageElement;
    }

    async analyzeImageWithText(text, imageData) {
        // Создаем индикатор анализа
        const analyzingIndicator = document.createElement('div');
        analyzingIndicator.classList.add('message', 'ai-message');
        analyzingIndicator.innerHTML = `
            <div class="ai-status">
                <i class="ti ti-eye"></i>
                ИИ анализирует изображение
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        this.messagesContainer.appendChild(analyzingIndicator);
        this.currentTypingIndicator = analyzingIndicator;
        this.scrollToBottom();

        const aiMessageElement = document.createElement('div');
        aiMessageElement.classList.add('message', 'ai-message', 'ai-streaming');
        
        const contentElement = document.createElement('div');
        contentElement.classList.add('message-content');
        contentElement.innerHTML = '<span class="typing-cursor">▊</span>';
        aiMessageElement.appendChild(contentElement);

        try {
            // Используем Vision API Puter для анализа изображения
            const prompt = text || "Пожалуйста, опиши это изображение подробно.";
            
            // Удаляем индикатор анализа
            if (this.currentTypingIndicator) {
                this.currentTypingIndicator.remove();
                this.currentTypingIndicator = null;
                this.messagesContainer.appendChild(aiMessageElement);
            }
            
            // Используем Vision API для анализа изображения
            const response = await puter.ai.chat(prompt, { 
                model: "claude-3-5-sonnet-20241022",
                vision: true,
                image: imageData,
                stream: true 
            });
            
            let fullText = '';
            
            for await (const part of response) {
                if (part?.text) {
                    fullText += part.text;
                    contentElement.innerHTML = '<span class="typing-cursor">▊</span>' + this.sanitizeHTML(fullText);
                    this.scrollToBottom();
                }
            }
            
            contentElement.innerHTML = marked.parse(fullText);
            this.applyCodeHighlighting(contentElement);
            aiMessageElement.classList.remove('ai-streaming');
            
        } catch (error) {
            console.error('Ошибка анализа изображения:', error);
            if (this.currentTypingIndicator) {
                this.currentTypingIndicator.remove();
                this.currentTypingIndicator = null;
            }
            aiMessageElement.remove();
            this.addMessage(
                '❌ Ошибка анализа изображения. Убедитесь, что загружено корректное изображение и попробуйте еще раз.', 
                false, true
            );
        }
    }

    async generateImage(prompt) {
        try {
            // Показываем индикатор генерации
            const loadingElement = document.createElement('div');
            loadingElement.classList.add('message', 'ai-message');
            loadingElement.innerHTML = `
                <div class="ai-status">
                    <i class="ti ti-photo"></i>
                    ИИ генерирует изображение
                    <div class="typing-indicator">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                </div>
            `;
            this.messagesContainer.appendChild(loadingElement);
            this.currentTypingIndicator = loadingElement;
            this.scrollToBottom();
            
            const image = await puter.ai.txt2img(prompt, { testMode: true });
            
            // Удаляем индикатор загрузки
            if (this.currentTypingIndicator) {
                this.currentTypingIndicator.remove();
                this.currentTypingIndicator = null;
            }
            
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', 'ai-image-message');
            
            const textElement = document.createElement('div');
            textElement.textContent = '🎨 Сгенерировано изображение:';
            messageElement.appendChild(textElement);
            
            const img = document.createElement('img');
            if (image instanceof HTMLElement) {
                img.src = image.src;
            } else {
                img.src = image;
            }
            img.classList.add('generated-image');
            img.alt = `Изображение по запросу: ${prompt}`;
            img.onerror = () => {
                img.style.display = 'none';
                const errorMsg = document.createElement('div');
                errorMsg.textContent = '❌ Не удалось загрузить изображение';
                errorMsg.style.color = '#ff6b6b';
                errorMsg.style.marginTop = '10px';
                messageElement.appendChild(errorMsg);
            };
            messageElement.appendChild(img);
            
            const promptElement = document.createElement('div');
            promptElement.classList.add('image-prompt');
            promptElement.textContent = `Запрос: "${prompt}"`;
            messageElement.appendChild(promptElement);
            
            this.messagesContainer.appendChild(messageElement);
            this.scrollToBottom();
            
        } catch (error) {
            console.error('Ошибка генерации изображения:', error);
            // Удаляем индикатор загрузки при ошибке
            if (this.currentTypingIndicator) {
                this.currentTypingIndicator.remove();
                this.currentTypingIndicator = null;
            }
            this.addMessage(
                '❌ Ошибка генерации изображения. Попробуйте другой запрос.', 
                false, true
            );
        }
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    try {
        window.khuyewAI = new KhuyewAI();
    } catch (error) {
        console.error('Ошибка инициализации приложения:', error);
        alert('Произошла ошибка при загрузке приложения. Пожалуйста, обновите страницу.');
    }
});
