class KhuyewAI {
    constructor() {
        this.messagesContainer = document.getElementById('messagesContainer');
        this.userInput = document.getElementById('userInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.clearInputBtn = document.getElementById('clearInputBtn');
        this.clearChatBtn = document.getElementById('clearChatBtn');
        this.helpBtn = document.getElementById('helpBtn');
        this.generateImageBtn = document.getElementById('generateImageBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.logo = document.querySelector('.logo');
        this.attachFileBtn = document.getElementById('attachFileBtn');
        this.voiceInputBtn = document.getElementById('voiceInputBtn');
        this.fileInput = document.getElementById('fileInput');
        this.attachedFiles = document.getElementById('attachedFiles');

        this.isProcessing = false;
        this.currentTheme = 'dark';
        this.isImageMode = false;
        this.attachedImages = [];
        this.isListening = false;
        this.recognition = null;
        this.conversationHistory = [];
        this.placeholderExamples = [
            "Расскажи о возможностях искусственного интеллекта...",
            "Напиши код для сортировки массива на Python...",
            "Объясни теорию относительности простыми словами...",
            "Какие есть способы улучшить производительность веб-сайта?",
            "Создай описание для приложения на основе ИИ..."
        ];

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadMessages();
        this.setupAutoResize();
        this.setupVoiceRecognition();
        this.startPlaceholderAnimation();
        this.showWelcomeMessage();
        this.loadConversationHistory();
    }

    bindEvents() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        this.clearInputBtn.addEventListener('click', () => this.clearInput());
        this.clearChatBtn.addEventListener('click', () => this.clearChat());
        this.helpBtn.addEventListener('click', () => this.showHelp());
        this.generateImageBtn.addEventListener('click', () => this.toggleImageMode());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.logo.addEventListener('click', () => this.clearChat());
        this.attachFileBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.voiceInputBtn.addEventListener('click', () => this.toggleVoiceInput());

        window.addEventListener('beforeunload', () => {
            this.saveMessages();
            this.saveConversationHistory();
        });
    }

    setupAutoResize() {
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
        });
    }

    setupVoiceRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'ru-RU';

            this.recognition.onstart = () => {
                this.isListening = true;
                this.voiceInputBtn.classList.add('active');
                this.showNotification('Слушаю...', 'info');
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.userInput.value = transcript;
                this.userInput.focus();
                this.showNotification('Текст распознан', 'success');
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showNotification('Ошибка распознавания речи', 'error');
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.voiceInputBtn.classList.remove('active');
            };
        } else {
            this.voiceInputBtn.style.display = 'none';
            this.showNotification('Голосовой ввод не поддерживается в вашем браузере', 'warning');
        }
    }

    startPlaceholderAnimation() {
        let index = 0;
        let charIndex = 0;
        let isDeleting = false;
        let currentText = '';

        const type = () => {
            const currentExample = this.placeholderExamples[index];
            
            if (isDeleting) {
                currentText = currentExample.substring(0, charIndex - 1);
                charIndex--;
            } else {
                currentText = currentExample.substring(0, charIndex + 1);
                charIndex++;
            }

            this.userInput.placeholder = currentText + '▌';

            if (!isDeleting && charIndex === currentExample.length) {
                setTimeout(() => isDeleting = true, 2000);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                index = (index + 1) % this.placeholderExamples.length;
            }

            const typeSpeed = isDeleting ? 50 : 100;
            setTimeout(type, typeSpeed);
        };

        type();
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            this.showNotification('Голосовой ввод не поддерживается', 'error');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    handleFileSelect(event) {
        const files = event.target.files;
        if (files.length === 0) return;

        for (let file of files) {
            if (!file.type.startsWith('image/')) {
                this.showNotification('Пожалуйста, выберите только изображения', 'error');
                continue;
            }

            if (this.attachedImages.length >= 3) {
                this.showNotification('Можно прикрепить не более 3 изображений', 'warning');
                break;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = {
                    name: file.name,
                    data: e.target.result,
                    type: file.type,
                    size: file.size
                };
                
                this.attachedImages.push(imageData);
                this.renderAttachedFiles();
                this.showNotification(`Изображение "${file.name}" прикреплено`, 'success');
            };
            reader.readAsDataURL(file);
        }

        event.target.value = '';
    }

    renderAttachedFiles() {
        this.attachedFiles.innerHTML = '';
        
        this.attachedImages.forEach((image, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            fileElement.innerHTML = `
                <i class="ti ti-photo"></i>
                <span>${image.name} (${this.formatFileSize(image.size)})</span>
                <button class="remove-file" data-index="${index}">
                    <i class="ti ti-x"></i>
                </button>
            `;
            this.attachedFiles.appendChild(fileElement);
        });

        this.attachedFiles.querySelectorAll('.remove-file').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.getAttribute('data-index'));
                this.removeAttachedFile(index);
            });
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    removeAttachedFile(index) {
        const removedFile = this.attachedImages.splice(index, 1)[0];
        this.renderAttachedFiles();
        this.showNotification(`Изображение "${removedFile.name}" удалено`, 'info');
    }

    async sendMessage() {
        const message = this.userInput.value.trim();
        
        if (!message && this.attachedImages.length === 0) {
            this.showNotification('Введите сообщение или прикрепите изображение', 'error');
            return;
        }

        if (this.isProcessing) {
            this.showNotification('Подождите завершения предыдущего запроса', 'warning');
            return;
        }

        try {
            this.isProcessing = true;
            this.sendBtn.disabled = true;

            // Add user message
            this.addMessage('user', message, this.attachedImages);
            
            // Add to conversation history
            this.addToConversationHistory('user', message, this.attachedImages);
            
            // Clear input and attached files
            this.userInput.value = '';
            this.userInput.style.height = 'auto';
            const imagesToProcess = [...this.attachedImages];
            this.attachedImages = [];
            this.renderAttachedFiles();
            
            if (this.isImageMode) {
                const typingId = this.showTypingIndicator();
                await this.generateImage(message, typingId);
            } else {
                await this.getAIResponse(message, imagesToProcess);
            }

        } catch (error) {
            console.error('Error:', error);
            this.removeTypingIndicator();
            this.addMessage('error', 'Произошла ошибка при отправке сообщения: ' + error.message);
            this.isProcessing = false;
            this.sendBtn.disabled = false;
        }
    }

    async getAIResponse(userMessage, images) {
        try {
            // Если есть прикрепленные изображения
            if (images.length > 0) {
                const analysisTypingId = this.showAnalysisIndicator(images[0].name);
                
                // Анализируем изображение
                const analysis = await this.analyzeImage(images[0], userMessage);
                this.removeTypingIndicator(analysisTypingId);
                
                // Добавляем анализ в историю и показываем пользователю
                this.addToConversationHistory('assistant', analysis);
                this.addMessage('ai', analysis);

            } 
            // Если только текстовый запрос
            else {
                const typingId = this.showTypingIndicator();
                
                // Создаем промпт с историей контекста
                const contextPrompt = this.buildContextPrompt(userMessage);
                
                const response = await puter.ai.chat(contextPrompt, { 
                    model: "gpt-5-nano",
                    systemPrompt: "Ты полезный AI-ассистент Khuyew AI. Отвечай на русском языке понятно и подробно. Поддерживай естественный диалог и учитывай контекст предыдущих сообщений."
                });
                
                this.removeTypingIndicator(typingId);
                
                this.addToConversationHistory('assistant', response);
                this.addMessage('ai', response);
            }
            
            this.saveMessages();
            this.saveConversationHistory();
            
        } catch (error) {
            this.removeTypingIndicator();
            this.addMessage('error', 'Ошибка при получении ответа от ИИ: ' + error.message);
        } finally {
            this.isProcessing = false;
            this.sendBtn.disabled = false;
        }
    }

    async analyzeImage(imageData, userContext = '') {
        try {
            // Сначала извлекаем текст с изображения
            const extractedText = await puter.ai.img2txt(imageData.data);
            
            // Затем создаем промпт для анализа
            let analysisPrompt;
            
            if (userContext.trim()) {
                // Если есть контекст от пользователя
                analysisPrompt = `Пользователь отправил изображение "${imageData.name}" с вопросом: "${userContext}"

Извлеченный текст с изображения: "${extractedText}"

Ответь на вопрос пользователя, используя информацию с изображения. Если на изображении есть текст, задачи или другая информация - используй её для ответа. Отвечай подробно на русском языке.`;
            } else {
                // Если нет контекста - просто анализируем изображение
                analysisPrompt = `Пользователь отправил изображение "${imageData.name}".

Извлеченный текст с изображения: "${extractedText}"

Проанализируй это изображение. Опиши что изображено, основное содержание. Если есть текст - объясни его значение. Если это задача - реши её. Отвечай подробно на русском языке.`;
            }

            // Получаем анализ от ИИ
            const analysis = await puter.ai.chat(analysisPrompt, { 
                model: "gpt-5-nano"
            });

            return `🖼️ **Анализ изображения "${imageData.name}"**\n\n${analysis}`;

        } catch (error) {
            console.error('Image analysis error:', error);
            
            // Fallback: пытаемся использовать обычный чат
            try {
                const fallbackPrompt = userContext.trim() 
                    ? `Пользователь отправил изображение "${imageData.name}" с вопросом: "${userContext}". Поскольку не удалось проанализировать изображение, дай общий ответ на вопрос пользователя.`
                    : `Пользователь отправил изображение "${imageData.name}". Дай общее описание того, что может быть изображено и как можно анализировать такие изображения.`;
                
                const fallbackAnalysis = await puter.ai.chat(fallbackPrompt, { 
                    model: "gpt-5-nano"
                });
                
                return `🖼️ **Анализ изображения "${imageData.name}"**\n\n${fallbackAnalysis}\n\n*Примечание: Использован общий анализ из-за ошибки обработки изображения*`;
            } catch (fallbackError) {
                return `🖼️ **Анализ изображения "${imageData.name}"**\n\nНе удалось проанализировать изображение. Ошибка: ${error.message}`;
            }
        }
    }

    buildContextPrompt(currentMessage) {
        // Берем последние 6 сообщений для контекста
        const recentHistory = this.conversationHistory.slice(-6);
        
        if (recentHistory.length === 0) {
            return currentMessage;
        }

        let context = "Контекст предыдущего разговора:\n";
        
        recentHistory.forEach(msg => {
            const role = msg.role === 'user' ? 'Пользователь' : 'Ассистент';
            // Ограничиваем длину каждого сообщения чтобы не превысить лимиты
            const content = msg.content.length > 500 ? msg.content.substring(0, 500) + '...' : msg.content;
            context += `${role}: ${content}\n`;
        });

        context += `\nТекущий вопрос пользователя: ${currentMessage}\n\nОтветь, учитывая контекст выше:`;

        return context;
    }

    addToConversationHistory(role, content, images = []) {
        let messageContent = content;
        
        // Если есть изображения, добавляем информацию о них
        if (images && images.length > 0) {
            const imageNames = images.map(img => img.name).join(', ');
            messageContent += ` [Прикреплено изображение: ${imageNames}]`;
        }
        
        this.conversationHistory.push({
            role: role,
            content: messageContent,
            timestamp: Date.now()
        });

        // Ограничиваем историю 30 сообщениями
        if (this.conversationHistory.length > 30) {
            this.conversationHistory = this.conversationHistory.slice(-25);
        }
    }

    async generateImage(prompt, typingId) {
        try {
            this.removeTypingIndicator(typingId);
            
            this.addMessage('ai', `🖼️ **Генерация изображения по запросу:** "${prompt}"\n\n*Идет процесс создания изображения...*`);
            
            const imageResult = await puter.ai.imagine(prompt, {
                model: "dall-e-3",
                size: "1024x1024"
            });
            
            const messages = this.messagesContainer.querySelectorAll('.message-ai');
            const lastMessage = messages[messages.length - 1];
            if (lastMessage) {
                lastMessage.querySelector('.message-content').innerHTML = 
                    `🖼️ **Сгенерированное изображение по запросу:** "${prompt}"\n\n` +
                    `![Generated Image](${imageResult.url})`;
            }
            
            this.addToConversationHistory('assistant', `Сгенерировано изображение по запросу: ${prompt}`);
            this.saveMessages();
            this.saveConversationHistory();
            
        } catch (error) {
            this.removeTypingIndicator(typingId);
            this.addMessage('error', 'Ошибка при генерации изображения: ' + error.message);
        } finally {
            this.isProcessing = false;
            this.sendBtn.disabled = false;
        }
    }

    toggleImageMode() {
        this.isImageMode = !this.isImageMode;
        const placeholder = this.isImageMode 
            ? "Опишите изображение для генерации..." 
            : "Задайте вопрос или опишите изображение...";
        
        this.userInput.placeholder = placeholder;
        this.generateImageBtn.classList.toggle('active', this.isImageMode);
        
        const icon = this.generateImageBtn.querySelector('i');
        icon.className = this.isImageMode ? 'ti ti-photo-off' : 'ti ti-photo';
        
        this.showNotification(
            this.isImageMode ? 'Режим генерации изображений включен' : 'Режим генерации изображений выключен',
            'success'
        );
    }

    addMessage(role, content, images = []) {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${role}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (role === 'ai' || role === 'error') {
            try {
                messageContent.innerHTML = marked.parse(content);
            } catch {
                messageContent.textContent = content;
            }
        } else {
            messageContent.textContent = content;
            
            if (images && images.length > 0) {
                images.forEach(image => {
                    const imageContainer = document.createElement('div');
                    imageContainer.className = 'message-image';
                    
                    const img = document.createElement('img');
                    img.src = image.data;
                    img.alt = image.name;
                    
                    imageContainer.appendChild(img);
                    messageContent.appendChild(imageContainer);
                });
            }
        }
        
        messageElement.appendChild(messageContent);
        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();
        
        return messageElement.id;
    }

    showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.className = 'message message-ai typing-indicator';
        typingElement.id = 'typing-' + Date.now();
        
        typingElement.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <span>ИИ печатает...</span>
        `;
        
        this.messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
        
        return typingElement.id;
    }

    showAnalysisIndicator(imageName) {
        const analysisElement = document.createElement('div');
        analysisElement.className = 'message message-ai typing-indicator';
        analysisElement.id = 'analysis-' + Date.now();
        
        analysisElement.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <span>ИИ анализирует изображение "${imageName}"...</span>
        `;
        
        this.messagesContainer.appendChild(analysisElement);
        this.scrollToBottom();
        
        return analysisElement.id;
    }

    removeTypingIndicator(typingId = null) {
        if (typingId) {
            const element = document.getElementById(typingId);
            if (element) element.remove();
        } else {
            const typingElements = this.messagesContainer.querySelectorAll('.typing-indicator');
            typingElements.forEach(el => el.remove());
        }
    }

    clearInput() {
        this.userInput.value = '';
        this.userInput.style.height = 'auto';
        this.attachedImages = [];
        this.renderAttachedFiles();
        this.userInput.focus();
        this.showNotification('Ввод очищен', 'success');
    }

    clearChat() {
        if (this.messagesContainer.children.length > 0 && 
            confirm('Вы уверены, что хотите очистить всю историю чата?')) {
            
            this.messagesContainer.innerHTML = '';
            localStorage.removeItem('khuyew-ai-messages');
            this.conversationHistory = [];
            localStorage.removeItem('khuyew-ai-conversation-history');
            this.showWelcomeMessage();
            this.showNotification('Чат очищен', 'success');
        }
    }

    showWelcomeMessage() {
        const welcomeMessage = `# 👋 Добро пожаловать в Khuyew AI!

Я ваш бесплатный ИИ-помощник с использованием передовых моделей AI. Вот что я умею:

## 🎯 Основные возможности:
• **Умные ответы на вопросы** - используя GPT-5 nano для точных ответов
• **Генерация изображений** - создание уникальных изображений по описанию
• **Анализ изображений** - извлечение текста и решение задач по фото
• **Голосовой ввод** - говорите вместо того, чтобы печатать
• **Контекстный диалог** - помню историю нашего разговора

## 💡 Примеры использования:
• Отправьте фото с текстом "Что здесь написано?"
• Отправьте фото задачи "Реши эту математическую задачу"
• Отправьте фото документа "Переведи этот текст"
• Напишите вопрос и прикрепите изображение для контекстного анализа

**Начните общение, отправив сообщение или изображение!**`;

        this.addMessage('ai', welcomeMessage);
        this.addToConversationHistory('assistant', welcomeMessage);
    }

    showHelp() {
        const helpMessage = `# 🆘 Помощь по Khuyew AI

## 🖼️ Работа с изображениями:
1. **Нажмите кнопку ➕** чтобы прикрепить изображение
2. **Напишите вопрос** (опционально) - что вы хотите узнать о изображении
3. **Нажмите Отправить** - ИИ проанализирует изображение и ответит на ваш вопрос

## 💬 Контекстный диалог:
• Я помню предыдущие сообщения в нашей беседе
• Можете задавать уточняющие вопросы
• Поддерживаю естественный диалог

## 📝 Примеры:
• "Реши эту задачу" + фото математической задачи
• "Что написано на этом знаке?" + фото дорожного знака
• "Опиши это изображение" + фото пейзажа
• Просто отправьте фото без текста для общего анализа

**Попробуйте отправить изображение с вопросом!**`;

        this.addMessage('ai', helpMessage);
        this.addToConversationHistory('assistant', helpMessage);
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', this.currentTheme);
        
        const icon = this.themeToggle.querySelector('i');
        icon.className = this.currentTheme === 'dark' ? 'ti ti-moon' : 'ti ti-sun';
        
        this.showNotification(
            this.currentTheme === 'dark' ? 'Темная тема включена' : 'Светлая тема включена',
            'success'
        );
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    saveMessages() {
        try {
            const messages = [];
            this.messagesContainer.querySelectorAll('.message').forEach(message => {
                if (message.classList.contains('typing-indicator')) return;
                
                const role = message.classList.contains('message-user') ? 'user' : 
                           message.classList.contains('message-error') ? 'error' : 'ai';
                
                const content = message.querySelector('.message-content').innerHTML;
                messages.push({ role, content });
            });
            
            localStorage.setItem('khuyew-ai-messages', JSON.stringify(messages));
        } catch (error) {
            console.error('Error saving messages:', error);
        }
    }

    loadMessages() {
        try {
            const saved = localStorage.getItem('khuyew-ai-messages');
            if (saved) {
                const messages = JSON.parse(saved);
                messages.forEach(msg => {
                    const messageElement = document.createElement('div');
                    messageElement.className = `message message-${msg.role}`;
                    
                    const messageContent = document.createElement('div');
                    messageContent.className = 'message-content';
                    messageContent.innerHTML = msg.content;
                    
                    messageElement.appendChild(messageContent);
                    this.messagesContainer.appendChild(messageElement);
                });
                
                this.scrollToBottom();
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            localStorage.removeItem('khuyew-ai-messages');
        }
    }

    saveConversationHistory() {
        try {
            localStorage.setItem('khuyew-ai-conversation-history', JSON.stringify(this.conversationHistory));
        } catch (error) {
            console.error('Error saving conversation history:', error);
        }
    }

    loadConversationHistory() {
        try {
            const saved = localStorage.getItem('khuyew-ai-conversation-history');
            if (saved) {
                this.conversationHistory = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading conversation history:', error);
            localStorage.removeItem('khuyew-ai-conversation-history');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new KhuyewAI();
});

// Add light theme variables
document.head.insertAdjacentHTML('beforeend', `
<style>
    [data-theme="light"] {
        --bg-primary: #ffffff;
        --bg-secondary: rgba(0, 0, 0, 0.03);
        --bg-tertiary: rgba(0, 0, 0, 0.08);
        --bg-hover: rgba(0, 0, 0, 0.12);
        
        --text-primary: #1a1a1a;
        --text-secondary: #666666;
        --text-tertiary: #888888;
        
        --border-color: rgba(0, 0, 0, 0.15);
        
        --ai-message-bg: rgba(0, 0, 0, 0.05);
        --ai-message-text: #333333;
        --ai-message-border: rgba(0, 0, 0, 0.1);
        
        --error-bg: rgba(255, 107, 107, 0.15);
        --error-text: #d32f2f;
        --error-border: #f44336;
        
        --success-bg: rgba(76, 175, 80, 0.15);
        --success-text: #2e7d32;
        
        --warning-bg: rgba(255, 193, 7, 0.15);
        --warning-text: #f57f17;
    }
</style>
`);
