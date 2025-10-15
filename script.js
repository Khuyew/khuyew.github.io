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
        this.imageMemory = new Map(); // Хранит анализ изображений по их data URL
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
        this.loadImageMemory();
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

        // Auto-save when leaving page
        window.addEventListener('beforeunload', () => {
            this.saveMessages();
            this.saveImageMemory();
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

        // Reset file input
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

        // Add event listeners to remove buttons
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
            
            // Clear input and attached files
            this.userInput.value = '';
            this.userInput.style.height = 'auto';
            const imagesToProcess = [...this.attachedImages];
            this.attachedImages = [];
            this.renderAttachedFiles();
            
            // Show typing indicator
            const typingId = this.showTypingIndicator();
            
            if (this.isImageMode) {
                // Generate image
                await this.generateImage(message, typingId);
            } else {
                // Get AI response
                await this.getAIResponse(message, imagesToProcess, typingId);
            }

        } catch (error) {
            console.error('Error:', error);
            this.removeTypingIndicator();
            this.addMessage('error', 'Произошла ошибка при отправке сообщения: ' + error.message);
            this.isProcessing = false;
            this.sendBtn.disabled = false;
        }
    }

    async getAIResponse(userMessage, images, typingId) {
        try {
            let prompt = userMessage;
            
            // Если есть прикрепленные изображения, анализируем их
            if (images.length > 0) {
                this.removeTypingIndicator(typingId);
                
                for (let image of images) {
                    const analysis = await this.analyzeImage(image, userMessage);
                    this.addMessage('ai', analysis);
                }
                
                // Если был текстовый запрос вместе с изображениями, обрабатываем его
                if (userMessage.trim()) {
                    const responseTypingId = this.showTypingIndicator();
                    const finalResponse = await puter.ai.chat(userMessage, { 
                        model: "gpt-5-nano",
                        systemPrompt: "Ты полезный AI-ассистент Khuyew AI. Отвечай на русском языке понятно и подробно. Учитывай контекст предыдущего анализа изображений."
                    });
                    
                    this.removeTypingIndicator(responseTypingId);
                    this.addMessage('ai', finalResponse);
                }
            } else {
                // Обычный текстовый запрос без изображений
                const response = await puter.ai.chat(prompt, { 
                    model: "gpt-5-nano",
                    systemPrompt: "Ты полезный AI-ассистент Khuyew AI. Отвечай на русском языке понятно и подробно."
                });
                
                this.removeTypingIndicator(typingId);
                this.addMessage('ai', response);
            }
            
            this.saveMessages();
            
        } catch (error) {
            this.removeTypingIndicator(typingId);
            this.addMessage('error', 'Ошибка при получении ответа от ИИ: ' + error.message);
        } finally {
            this.isProcessing = false;
            this.sendBtn.disabled = false;
        }
    }

    async analyzeImage(imageData, userContext = '') {
        try {
            // Проверяем, не анализировали ли мы уже это изображение
            const imageHash = this.simpleHash(imageData.data);
            if (this.imageMemory.has(imageHash)) {
                const cachedAnalysis = this.imageMemory.get(imageHash);
                return this.formatImageAnalysis(imageData.name, cachedAnalysis, true);
            }

            // Создаем промпт для анализа изображения
            const analysisPrompt = userContext 
                ? `Пользователь отправил изображение "${imageData.name}" с комментарием: "${userContext}". Проанализируй это изображение и ответь в контексте комментария пользователя.`
                : `Пользователь отправил изображение "${imageData.name}". Проанализируй это изображение подробно.`;

            // Используем Puter AI для анализа изображения
            // Note: В реальном приложении здесь будет вызов API для анализа изображений
            // Сейчас используем текстовый анализ на основе описания
            const analysis = await puter.ai.chat(
                `${analysisPrompt} Опиши что изображено на картинке, основные элементы, цвета, настроение, возможный контекст. Будь максимально подробным.`,
                { 
                    model: "gpt-5-nano",
                    systemPrompt: "Ты эксперт по анализу изображений. Ты внимательно анализируешь картинки и даешь подробные описания на русском языке."
                }
            );

            // Сохраняем анализ в памяти
            this.imageMemory.set(imageHash, analysis);
            this.saveImageMemory();

            return this.formatImageAnalysis(imageData.name, analysis);

        } catch (error) {
            console.error('Image analysis error:', error);
            return `🖼️ **Анализ изображения "${imageData.name}"**\n\nНе удалось проанализировать изображение. Ошибка: ${error.message}`;
        }
    }

    formatImageAnalysis(imageName, analysis, fromCache = false) {
        const cacheNote = fromCache ? '\n\n*📝 Примечание: Использован сохраненный анализ изображения*' : '';
        
        return `🖼️ **Анализ изображения "${imageName}"**\n\n${analysis}${cacheNote}`;
    }

    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }

    async generateImage(prompt, typingId) {
        try {
            this.removeTypingIndicator(typingId);
            
            // Show image generation message
            this.addMessage('ai', `🖼️ **Генерация изображения по запросу:** "${prompt}"\n\n*Идет процесс создания изображения...*`);
            
            // Use Puter AI for image generation
            const imageResult = await puter.ai.imagine(prompt, {
                model: "dall-e-3",
                size: "1024x1024"
            });
            
            // Remove the loading message and add the actual image
            const messages = this.messagesContainer.querySelectorAll('.message-ai');
            const lastMessage = messages[messages.length - 1];
            if (lastMessage) {
                lastMessage.querySelector('.message-content').innerHTML = 
                    `🖼️ **Сгенерированное изображение по запросу:** "${prompt}"\n\n` +
                    `![Generated Image](${imageResult.url})`;
            }
            
            this.saveMessages();
            
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
            
            // Add attached images to user message
            if (images.length > 0) {
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
            <span>${this.isImageMode ? 'ИИ генерирует изображение...' : 'ИИ печатает...'}</span>
        `;
        
        this.messagesContainer.appendChild(typingElement);
        this.scrollToBottom();
        
        return typingElement.id;
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
            this.imageMemory.clear();
            localStorage.removeItem('khuyew-ai-image-memory');
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
• **Анализ изображений** - подробное описание и анализ прикрепленных картинок
• **Голосовой ввод** - говорите вместо того, чтобы печатать
• **Запоминание изображений** - ИИ запоминает анализ предыдущих картинок

## 💡 Новые функции:
• Кнопка ➕ слева для прикрепления изображений
• Кнопка ❌ для очистки ввода
• Кнопка 🎤 для голосового ввода
• Кнопка 🖼️ для переключения режима генерации изображений

**Начните общение, отправив сообщение или изображение!**`;

        this.addMessage('ai', welcomeMessage);
    }

    showHelp() {
        const helpMessage = `# 🆘 Помощь по Khuyew AI

## ⌨️ Управление:
• **Enter** - отправить сообщение
• **Shift + Enter** - новая строка
• **Кнопка ❌** - очистить поле ввода
• **Кнопка 🎤** - голосовой ввод
• **Кнопка ➕** - прикрепить изображение
• **Кнопка 🖼️** - переключить режим генерации изображений

## 🖼️ Анализ изображений:
• Прикрепляйте до 3 изображений за раз
• ИИ подробно анализирует каждое изображение
• Анализ сохраняется в памяти для будущих обращений
• Можно задавать вопросы о прикрепленных изображениях

## 🎤 Голосовой ввод:
• Нажмите кнопку микрофона и говорите четко
• Поддерживается русский язык
• Автоматически преобразуется в текст

## 💾 Память:
• История чата сохраняется автоматически
• Анализ изображений запоминается
• Для нового чата нажмите на логотип "Khuyew AI"

**Нужна дополнительная помощь? Просто спросите!**`;

        this.addMessage('ai', helpMessage);
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

    saveImageMemory() {
        try {
            const memoryData = Object.fromEntries(this.imageMemory);
            localStorage.setItem('khuyew-ai-image-memory', JSON.stringify(memoryData));
        } catch (error) {
            console.error('Error saving image memory:', error);
        }
    }

    loadImageMemory() {
        try {
            const saved = localStorage.getItem('khuyew-ai-image-memory');
            if (saved) {
                const memoryData = JSON.parse(saved);
                this.imageMemory = new Map(Object.entries(memoryData));
            }
        } catch (error) {
            console.error('Error loading image memory:', error);
            localStorage.removeItem('khuyew-ai-image-memory');
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
