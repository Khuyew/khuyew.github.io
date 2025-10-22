// KHAI — Первый белорусский чат с ИИ
class KHAIChat {
    constructor() {
        this.messages = [];
        this.currentChatId = 'main-chat';
        this.chats = new Map();
        this.isGenerating = false;
        this.generationAborted = false;
        this.currentStreamController = null;
        this.activeStreamingMessage = null;
        this.currentMode = 'normal';
        this.attachedFiles = [];
        this.puterAI = null;
        this.isOnline = true;
        this.typingIndicator = null;
        this.searchTerm = '';
        this.currentModel = 'gpt-5-nano';
        this.chatStartTime = Date.now();
        this.isListening = false;
        this.recognition = null;
        this.durationTimer = null;
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.activeTimeouts = new Set();
        this.activeEventListeners = new Map();
        this.conversationHistory = [];
        this.autoScrollEnabled = true;
        this.isAtBottom = true;
        this.isAtTop = false;
        this.lastAIMessageIndex = -1;
        this.lastUserMessage = null;
        this.isInitialized = false;
        this.chatSearchTerm = '';
        this.fullscreenInputActive = false;
        this.puterInitialized = false;

        // Реальные модели из вашего рабочего файла
        this.models = {
            'gpt-5-nano': { 
                name: 'GPT-5 Nano', 
                description: 'Быстрая и эффективная модель для повседневных задач',
                icon: 'ti ti-bolt'
            },
            'o3-mini': { 
                name: 'O3 Mini', 
                description: 'Продвинутая модель с улучшенными возможностями рассуждения',
                icon: 'ti ti-cpu'
            },
            'claude-sonnet': { 
                name: 'Claude Sonnet', 
                description: 'Мощная модель от Anthropic для сложных задач и анализа',
                icon: 'ti ti-shield'
            },
            'deepseek-chat': { 
                name: 'DeepSeek Chat', 
                description: 'Универсальная модель для общения и решения задач',
                icon: 'ti ti-search'
            },
            'deepseek-reasoner': { 
                name: 'DeepSeek Reasoner', 
                description: 'Специализированная модель для сложных логических рассуждений',
                icon: 'ti ti-logic-and'
            },
            'gemini-2.0-flash': { 
                name: 'Gemini 2.0 Flash', 
                description: 'Новейшая быстрая модель от Google с улучшенными возможностями',
                icon: 'ti ti-flash'
            },
            'gemini-1.5-flash': { 
                name: 'Gemini 1.5 Flash', 
                description: 'Быстрая и эффективная модель от Google для различных задач',
                icon: 'ti ti-zap'
            },
            'grok-beta': { 
                name: 'xAI Grok', 
                description: 'Модель от xAI с уникальным характером и остроумными ответами',
                icon: 'ti ti-message-circle'
            }
        };

        this.modeConfigs = {
            normal: { 
                icon: 'ti ti-message', 
                color: '#0099ff',
                placeholder: 'Задайте вопрос или опишите задачу...',
                systemPrompt: 'Ты полезный AI-ассистент. Отвечай подробно и точно на русском языке.'
            },
            creative: { 
                icon: 'ti ti-sparkles', 
                color: '#9c27b0',
                placeholder: 'Опишите креативную задачу или идею...',
                systemPrompt: 'Ты креативный AI-ассистент. Будь изобретательным, предлагай нестандартные решения и идеи. Отвечай на русском языке.'
            },
            voice: { 
                icon: 'ti ti-microphone', 
                color: '#ff6b00',
                placeholder: 'Опишите что нужно сгенерировать в аудио формате...',
                systemPrompt: 'Ты специализируешься на создании и анализе аудио контента. Отвечай на русском языке.'
            },
            image: { 
                icon: 'ti ti-photo', 
                color: '#00c853',
                placeholder: 'Опишите изображение которое нужно сгенерировать...',
                systemPrompt: 'Ты специализируешься на создании и анализе изображений. Подробно описывай визуальные элементы. Отвечай на русском языке.'
            },
            code: { 
                icon: 'ti ti-code', 
                color: '#4caf50',
                placeholder: 'Опишите код который нужно написать или исправить...',
                systemPrompt: 'Ты эксперт по программированию. Пиши чистый, эффективный и хорошо документированный код. Отвечай на русском языке.'
            },
            files: { 
                icon: 'ti ti-file-analytics', 
                color: '#ff4081',
                placeholder: 'Прикрепите файлы для анализа или опишите задачу...',
                systemPrompt: 'Ты специалист по анализу файлов и данных. Тщательно анализируй содержимое файлов и предоставляй детальные выводы. Отвечай на русском языке.'
            }
        };

        this.placeholderExamples = [
            "Расскажи о возможностях искусственного интеллекта...",
            "Напиши код для сортировки массива на Python...",
            "Объясни теорию относительности простыми словами...",
            "Какие есть способы улучшить производительность веб-сайта?",
            "Создай описание для приложения на основе ИИ..."
        ];

        this.init();
    }

    async init() {
        try {
            this.setupMarked();
            await this.setupPuterAI();
            await this.setupEventListeners();
            await this.loadChatHistory();
            this.updateUI();
            this.showWelcomeMessage();
            this.startChatDurationTimer();
            this.setupModelSelector();
            this.setupScrollTracking();
            this.startPlaceholderAnimation();
            this.loadThemePreference();
            
            // Показываем основное приложение
            this.setTimeout(() => {
                const appLoader = document.getElementById('appLoader');
                const appContainer = document.querySelector('.app-container');
                
                if (appLoader) appLoader.style.display = 'none';
                if (appContainer) {
                    appContainer.style.opacity = '1';
                    appContainer.style.transition = 'opacity 0.3s ease';
                }
                
                this.isInitialized = true;
                this.showNotification('KHAI готов к работе!', 'success');
            }, 500);
            
        } catch (error) {
            console.error('Error initializing KHAI Chat:', error);
            this.showError('Ошибка инициализации приложения');
        }
    }

    setupMarked() {
        if (typeof marked !== 'undefined') {
            marked.setOptions({
                highlight: (code, lang) => {
                    if (lang && typeof hljs !== 'undefined' && hljs.getLanguage(lang)) {
                        try {
                            return hljs.highlight(code, { language: lang }).value;
                        } catch (err) {
                            console.warn(`Error highlighting ${lang}:`, err);
                        }
                    }
                    return code;
                },
                langPrefix: 'hljs language-',
                breaks: true,
                gfm: true
            });
        }
    }

    async setupPuterAI() {
        try {
            if (typeof puter !== 'undefined') {
                this.puterAI = puter;
                this.puterInitialized = true;
                console.log('Puter.js successfully initialized');
                this.setOnlineStatus(true);
                
                // Тестируем подключение к Puter.ai
                try {
                    // Простой тест для проверки работы Puter.ai
                    const testResponse = await this.puterAI.ai.chat('test', { 
                        model: 'gpt-5-nano', 
                        stream: false 
                    });
                    console.log('Puter.ai test successful');
                    this.showNotification('Puter.ai подключен успешно', 'success');
                } catch (error) {
                    console.warn('Puter.ai test failed:', error);
                    this.showNotification('Puter.ai в режиме ограниченной функциональности', 'warning');
                }
            } else {
                throw new Error('Puter.js not available');
            }
        } catch (error) {
            console.error('Puter.js initialization failed:', error);
            this.setOnlineStatus(false);
            this.showNotification('Puter.js не загружен, некоторые функции будут недоступны', 'error');
        }
    }

    // РЕАЛЬНАЯ ИНТЕГРАЦИЯ PUTER.AI - БЕЗ ЗАГЛУШЕК
    async callAIService(prompt) {
        if (!this.puterAI || typeof this.puterAI.ai?.chat !== 'function') {
            throw new Error('Функция чата Puter.ai недоступна');
        }
        
        const modelOptions = {
            'gpt-5-nano': { model: 'gpt-5-nano' },
            'o3-mini': { model: 'o3-mini' },
            'claude-sonnet': { model: 'claude-sonnet' },
            'deepseek-chat': { model: 'deepseek-chat' },
            'deepseek-reasoner': { model: 'deepseek-reasoner' },
            'gemini-2.0-flash': { model: 'gemini-2.0-flash' },
            'gemini-1.5-flash': { model: 'gemini-1.5-flash' },
            'grok-beta': { model: 'grok-beta' }
        };
        
        const options = {
            ...modelOptions[this.currentModel],
            systemPrompt: this.modeConfigs[this.currentMode].systemPrompt,
            stream: true
        };
        
        console.log('Calling Puter.ai with options:', options);
        return await this.puterAI.ai.chat(prompt, options);
    }

    async processImageFile(file) {
        if (!this.puterAI || typeof this.puterAI.ai?.img2txt !== 'function') {
            throw new Error('Функция анализа изображений Puter.ai недоступна');
        }
        
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const extractedText = await this.puterAI.ai.img2txt(e.target.result);
                    resolve({
                        name: file.name,
                        data: e.target.result,
                        type: file.type,
                        size: file.size,
                        fileType: 'image',
                        extractedText: extractedText
                    });
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error(`Ошибка загрузки изображения: ${file.name}`));
            reader.readAsDataURL(file);
        });
    }

    async generateImage(prompt) {
        if (!this.puterAI || typeof this.puterAI.ai?.imagine !== 'function') {
            throw new Error('Функция генерации изображений Puter.ai недоступна');
        }
        
        try {
            this.showNotification('Генерация изображения...', 'info');
            
            const imageResult = await this.puterAI.ai.imagine(prompt, {
                model: "dall-e-3",
                size: "1024x1024"
            });
            
            const message = {
                id: this.generateId(),
                role: 'assistant',
                content: `🖼️ **Сгенерированное изображение по запросу:** "${prompt}"\n\n<img src="${imageResult.url}" alt="Сгенерированное изображение" style="max-width: 100%; border-radius: 8px;">`,
                timestamp: Date.now(),
                mode: 'image'
            };
            
            this.addMessageToChat(message);
            this.addToConversationHistory('assistant', message.content);
            this.showNotification('Изображение сгенерировано', 'success');
            
        } catch (error) {
            console.error('Error generating image:', error);
            this.handleError('Ошибка при генерации изображения Puter.ai', error);
        }
    }

    async generateVoice(prompt) {
        if (!this.puterAI || typeof this.puterAI.ai?.txt2speech !== 'function') {
            throw new Error('Функция генерации голоса Puter.ai недоступна');
        }
        
        try {
            this.showNotification('Генерация голоса...', 'info');
            
            const audio = await this.puterAI.ai.txt2speech(prompt);
            
            const message = {
                id: this.generateId(),
                role: 'assistant',
                content: `🔊 **Сгенерированный голос для текста:** "${prompt}"\n\n<audio controls style="width: 100%; max-width: 300px;"><source src="${audio.src}" type="audio/mpeg">Ваш браузер не поддерживает аудио элементы.</audio>`,
                timestamp: Date.now(),
                mode: 'voice'
            };
            
            this.addMessageToChat(message);
            this.addToConversationHistory('assistant', message.content);
            this.showNotification('Аудио сгенерировано', 'success');
            
        } catch (error) {
            console.error('Error generating voice:', error);
            this.handleError('Ошибка при генерации аудио Puter.ai', error);
        }
    }

    async processTextFile(file) {
        try {
            // Используем Puter.ai для чтения файла если доступно
            if (this.puterAI && typeof this.puterAI.fs?.read === 'function') {
                const blob = await this.puterAI.fs.read(file.name);
                const content = await blob.text();
                
                return {
                    name: file.name,
                    data: content,
                    type: file.type,
                    size: file.size,
                    fileType: 'text'
                };
            } else {
                // Fallback: читаем файл стандартным способом
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        resolve({
                            name: file.name,
                            data: e.target.result,
                            type: file.type,
                            size: file.size,
                            fileType: 'text'
                        });
                    };
                    reader.onerror = () => reject(new Error(`Ошибка чтения текстового файла: ${file.name}`));
                    reader.readAsText(file);
                });
            }
        } catch (error) {
            console.error('Error processing text file:', error);
            throw error;
        }
    }

    // ОСНОВНЫЕ МЕТОДЫ ИЗ ВАШЕГО РАБОЧЕГО ФАЙЛА
    async sendMessage() {
        if (this.isGenerating) {
            this.stopGeneration();
            return;
        }

        const userInput = document.getElementById('userInput');
        const message = userInput.value.trim();
        const files = this.attachedFiles;

        if (!message && files.length === 0) {
            this.showNotification('Введите сообщение или прикрепите файл', 'warning');
            return;
        }

        try {
            this.isGenerating = true;
            this.generationAborted = false;
            this.updateSendButton(true);

            if (this.currentMode === 'voice') {
                await this.generateVoice(message);
            } else {
                await this.processUserMessage(message, files);
            }
        } catch (error) {
            console.error('Error generating response:', error);
            this.handleError('Не удалось получить ответ от Puter.ai', error);
        } finally {
            if (!this.generationAborted) {
                this.isGenerating = false;
                this.updateSendButton(false);
                this.saveChatHistory();
                this.updateUI();
            }
        }
    }

    async processUserMessage(message, files = []) {
        this.lastUserMessage = {
            text: message,
            files: [...files]
        };
        
        const userMessage = {
            id: this.generateId(),
            role: 'user',
            content: message,
            files: [...files],
            timestamp: Date.now(),
            mode: this.currentMode
        };

        this.addMessageToChat(userMessage);
        this.addToConversationHistory('user', message, files);
        
        document.getElementById('userInput').value = '';
        this.autoResizeTextarea(document.getElementById('userInput'));
        this.toggleClearInputButton();
        const filesToProcess = [...files];
        this.clearAttachedFiles();

        if (this.currentMode === 'image') {
            await this.generateImage(message);
        } else {
            await this.getAIResponse(message, filesToProcess);
        }
    }

    async getAIResponse(userMessage, files) {
        this.showTypingIndicator();
        
        try {
            const prompt = await this.buildPrompt(userMessage, files);
            const response = await this.callAIService(prompt);
            
            this.hideTypingIndicator();
            await this.processAIResponse(response);
            
        } catch (error) {
            this.hideTypingIndicator();
            this.handleError('Ошибка при получении ответа от Puter.ai', error);
        }
    }

    async buildPrompt(userMessage, files) {
        if (files.length > 0) {
            const file = files[0];
            
            if (file.fileType === 'image') {
                const extractedText = file.extractedText || "Не удалось извлечь текст из изображения";
                
                if (userMessage.trim()) {
                    return `Пользователь отправил изображение "${file.name}" с сопроводительным сообщением: "${userMessage}"

Извлеченный текст с изображения: "${extractedText}"

Ответь на вопрос/сообщение пользователя "${userMessage}", учитывая содержание изображения.`;
                } else {
                    return `Пользователь отправил изображение "${file.name}".

Извлеченный текст с изображения: "${extractedText}"

Проанализируй это изображение. Опиши что изображено, основное содержание.`;
                }
            } else if (file.fileType === 'text') {
                const fileContent = file.data;
                
                if (userMessage.trim()) {
                    return `Пользователь отправил текстовый файл "${file.name}" с сопроводительным сообщением: "${userMessage}"

Содержимое файла:
"""
${fileContent}
"""

Ответь на вопрос/сообщение пользователя "${userMessage}", учитывая содержимое прикрепленного файла.`;
                } else {
                    return `Пользователь отправил текстовый файл "${file.name}".

Содержимое файла:
"""
${fileContent}
"""

Проанализируй содержимое этого файла. Суммируй основную информацию, выдели ключевые моменты.`;
                }
            }
        } else {
            return this.buildContextPrompt(userMessage);
        }
    }

    async processAIResponse(response) {
        this.activeStreamingMessage = this.createStreamingMessage();
        this.currentStreamController = response;
        
        let fullResponse = '';
        try {
            for await (const part of response) {
                if (this.generationAborted) break;
                
                if (part?.text) {
                    fullResponse += part.text;
                    this.updateStreamingMessage(this.activeStreamingMessage, fullResponse);
                    await this.delay(10);
                }
            }
            
            if (!this.generationAborted) {
                this.finalizeStreamingMessage(this.activeStreamingMessage, fullResponse);
                this.addToConversationHistory('assistant', fullResponse);
            }
        } catch (error) {
            if (!this.generationAborted) {
                console.error('Error processing AI response:', error);
                this.handleError('Ошибка при обработке ответа Puter.ai', error);
            }
        } finally {
            this.activeStreamingMessage = null;
            this.currentStreamController = null;
        }
    }

    createStreamingMessage() {
        const messageElement = document.createElement('div');
        messageElement.className = 'message message-assistant streaming-message';
        messageElement.id = 'streaming-' + Date.now();
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content streaming-content';
        
        messageContent.innerHTML = `
            <div class="typing-indicator-inline">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                <span>ИИ печатает...</span>
            </div>
            <div class="streaming-text"></div>
        `;
        
        messageElement.appendChild(messageContent);
        document.getElementById('messagesContainer').appendChild(messageElement);
        this.scrollToBottom();
        
        return messageElement.id;
    }

    updateStreamingMessage(messageId, content) {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) return;
        
        const streamingText = messageElement.querySelector('.streaming-text');
        const typingIndicator = messageElement.querySelector('.typing-indicator-inline');
        
        if (content.length > 100 && typingIndicator && !typingIndicator.classList.contains('fade-out')) {
            typingIndicator.classList.add('fade-out');
            this.setTimeout(() => {
                if (typingIndicator.parentNode) {
                    typingIndicator.style.display = 'none';
                }
            }, 300);
        }
        
        const processedContent = this.processCodeBlocks(content);
        streamingText.innerHTML = processedContent;
        
        this.attachCopyButtons(streamingText);
        
        if (this.autoScrollEnabled) {
            this.scrollToBottom();
        }
    }

    finalizeStreamingMessage(messageId, fullContent) {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) return;
        
        messageElement.classList.remove('streaming-message');
        const messageContent = messageElement.querySelector('.message-content');
        messageContent.classList.remove('streaming-content');
        
        const typingIndicator = messageContent.querySelector('.typing-indicator-inline');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        const processedContent = this.processCodeBlocks(fullContent);
        messageContent.innerHTML = processedContent;
        
        const modelIndicator = document.createElement('div');
        modelIndicator.className = 'model-indicator';
        modelIndicator.textContent = `Модель: ${this.models[this.currentModel]?.name || this.currentModel} • ${new Date().toLocaleTimeString('ru-RU')}`;
        messageContent.appendChild(modelIndicator);
        
        this.attachMessageHandlers(messageElement);
        
        this.scrollToBottom();
    }

    processCodeBlocks(content) {
        if (typeof marked !== 'undefined') {
            let html = marked.parse(content);
            
            html = html.replace(/<pre><code class="([^"]*)">/g, (match, lang) => {
                const language = lang || 'text';
                return `
                    <div class="code-header">
                        <span class="code-language">${language}</span>
                        <button class="copy-code-btn" data-language="${language}">
                            <i class="ti ti-copy"></i>
                            Копировать
                        </button>
                    </div>
                    <pre><code class="${lang}">`;
            });
            
            return html;
        } else {
            return content.replace(/\n/g, '<br>');
        }
    }

    attachMessageHandlers(messageElement) {
        // Copy button
        const copyBtn = messageElement.querySelector('.copy-message-btn');
        if (copyBtn) {
            this.addEventListener(copyBtn, 'click', () => {
                const messageText = messageElement.querySelector('.message-text').textContent;
                this.copyToClipboard(messageText);
                this.showNotification('Сообщение скопировано', 'success');
            });
        }
        
        // Code copy buttons
        this.attachCopyButtons(messageElement);
        
        // Speak button
        const speakBtn = messageElement.querySelector('.speak-message-btn');
        if (speakBtn) {
            this.addEventListener(speakBtn, 'click', () => {
                this.speakMessage(messageElement);
            });
        }
    }

    attachCopyButtons(container) {
        const copyButtons = container.querySelectorAll('.copy-code-btn');
        copyButtons.forEach(btn => {
            this.addEventListener(btn, 'click', async () => {
                const codeBlock = btn.closest('.code-header')?.nextElementSibling;
                if (codeBlock) {
                    const code = codeBlock.textContent;
                    await this.copyToClipboard(code);
                    
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = '<i class="ti ti-check"></i> Скопировано!';
                    btn.classList.add('copied');
                    
                    this.setTimeout(() => {
                        btn.innerHTML = originalHTML;
                        btn.classList.remove('copied');
                    }, 2000);
                }
            });
        });
    }

    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            return true;
        } catch (error) {
            console.error('Failed to copy text:', error);
            return false;
        }
    }

    speakMessage(messageElement) {
        if (this.isSpeaking) {
            this.stopSpeaking();
            return;
        }
        
        const messageText = messageElement.querySelector('.message-text').textContent;
        
        if ('speechSynthesis' in window) {
            this.stopSpeaking();
            
            this.currentUtterance = new SpeechSynthesisUtterance(messageText);
            this.currentUtterance.lang = 'ru-RU';
            this.currentUtterance.rate = 1.0;
            this.currentUtterance.pitch = 1.0;
            this.currentUtterance.volume = 1.0;
            
            this.currentUtterance.onstart = () => {
                this.isSpeaking = true;
                messageElement.classList.add('speaking');
                this.showNotification('Озвучивание началось', 'info');
            };
            
            this.currentUtterance.onend = () => {
                this.isSpeaking = false;
                messageElement.classList.remove('speaking');
            };
            
            this.currentUtterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                this.isSpeaking = false;
                messageElement.classList.remove('speaking');
                this.showError('Ошибка озвучивания');
            };
            
            speechSynthesis.speak(this.currentUtterance);
        } else {
            this.showError('Озвучивание не поддерживается вашим браузером');
        }
    }

    stopSpeaking() {
        if (this.isSpeaking && speechSynthesis) {
            speechSynthesis.cancel();
            this.isSpeaking = false;
            document.querySelectorAll('.message.speaking').forEach(msg => {
                msg.classList.remove('speaking');
            });
        }
    }

    stopGeneration() {
        if (this.isGenerating && this.currentStreamController) {
            this.generationAborted = true;
            this.isGenerating = false;
            
            if (this.currentStreamController.abort) {
                this.currentStreamController.abort();
            }
            
            this.hideTypingIndicator();
            this.updateSendButton(false);
            if (this.activeStreamingMessage) {
                const streamingElement = document.getElementById(this.activeStreamingMessage);
                if (streamingElement) {
                    const currentContent = streamingElement.querySelector('.streaming-text')?.innerHTML || '';
                    this.finalizeStreamingMessage(this.activeStreamingMessage, currentContent);
                }
            }
            
            this.showNotification('Генерация остановлена', 'info');
            this.currentStreamController = null;
        }
    }

    updateSendButton(isGenerating) {
        const sendBtn = document.getElementById('sendBtn');
        const userInput = document.getElementById('userInput');
        const inputSection = document.getElementById('inputSection');
        
        if (!sendBtn) return;

        if (isGenerating) {
            sendBtn.classList.add('stop-generation');
            sendBtn.innerHTML = '<i class="ti ti-player-stop"></i>';
            sendBtn.title = 'Остановить генерацию';
            
            if (inputSection) inputSection.classList.add('input-disabled');
            if (userInput) {
                userInput.disabled = true;
                userInput.placeholder = 'ИИ генерирует ответ... Нажмите остановить для прерывания';
            }
        } else {
            sendBtn.classList.remove('stop-generation');
            sendBtn.innerHTML = '<i class="ti ti-send"></i>';
            sendBtn.title = 'Отправить сообщение';
            
            if (inputSection) inputSection.classList.remove('input-disabled');
            if (userInput) {
                userInput.disabled = false;
                userInput.placeholder = this.modeConfigs[this.currentMode].placeholder;
            }
        }
    }

    showTypingIndicator() {
        this.hideTypingIndicator();
        
        const typingElement = document.createElement('div');
        typingElement.className = 'message message-assistant typing-indicator';
        typingElement.id = 'typing-indicator';
        
        typingElement.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                <span>ИИ печатает...</span>
            </div>
        `;
        
        document.getElementById('messagesContainer').appendChild(typingElement);
        this.typingIndicator = typingElement.id;
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        if (this.typingIndicator) {
            const element = document.getElementById(this.typingIndicator);
            if (element) {
                element.remove();
            }
            this.typingIndicator = null;
        }
    }

    addMessageToChat(message) {
        if (!this.chats.has(this.currentChatId)) {
            this.chats.set(this.currentChatId, []);
        }
        
        this.chats.get(this.currentChatId).push(message);
        this.renderMessage(message);
        this.updateLastAIMessageIndex();
    }

    renderMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message message-${message.role}`;
        messageElement.dataset.messageId = message.id;
        
        let content = '';
        
        if (message.role === 'user') {
            content = this.renderUserMessage(message);
        } else {
            content = this.renderAssistantMessage(message);
        }
        
        messageElement.innerHTML = content;
        document.getElementById('messagesContainer').appendChild(messageElement);
        this.attachMessageHandlers(messageElement);
        
        if (this.autoScrollEnabled) {
            this.scrollToBottom();
        }
        
        return messageElement;
    }

    renderUserMessage(message) {
        let filesHtml = '';
        if (message.files && message.files.length > 0) {
            filesHtml = message.files.map(file => `
                <div class="attached-file">
                    <i class="ti ${this.getFileIcon(file.fileType)}"></i>
                    <span>${this.escapeHtml(file.name)}</span>
                    ${file.fileType === 'image' ? `<img src="${file.data}" alt="${this.escapeHtml(file.name)}" class="file-preview">` : ''}
                </div>
            `).join('');
        }
        
        return `
            <div class="message-content">
                <div class="message-header">
                    <div class="message-avatar">
                        <i class="ti ti-user"></i>
                    </div>
                    <div class="message-info">
                        <span class="message-author">Вы</span>
                        <span class="message-time">${this.formatTime(message.timestamp)}</span>
                    </div>
                </div>
                <div class="message-text">${this.escapeHtml(message.content)}</div>
                ${filesHtml ? `<div class="message-files">${filesHtml}</div>` : ''}
            </div>
        `;
    }

    renderAssistantMessage(message) {
        const processedContent = this.processCodeBlocks(message.content);
        
        return `
            <div class="message-content">
                <div class="message-header">
                    <div class="message-avatar">
                        <i class="ti ${this.models[this.currentModel]?.icon || 'ti ti-brain'}"></i>
                    </div>
                    <div class="message-info">
                        <span class="message-author">${this.models[this.currentModel]?.name || 'AI'}</span>
                        <span class="message-time">${this.formatTime(message.timestamp)}</span>
                    </div>
                </div>
                <div class="message-text">${processedContent}</div>
                <div class="model-indicator">
                    Модель: ${this.models[this.currentModel]?.name || this.currentModel} • ${new Date(message.timestamp).toLocaleTimeString('ru-RU')}
                </div>
            </div>
        `;
    }

    getFileIcon(fileType) {
        if (fileType === 'image') return 'ti-photo';
        if (fileType === 'text') return 'ti-file-text';
        return 'ti-file';
    }

    buildContextPrompt(currentMessage) {
        const recentHistory = this.conversationHistory.slice(-6);
        
        if (recentHistory.length === 0) {
            return currentMessage;
        }

        let context = "Контекст предыдущего разговора:\n";
        
        recentHistory.forEach(msg => {
            const role = msg.role === 'user' ? 'Пользователь' : 'Ассистент';
            const content = msg.content.length > 500 ? msg.content.substring(0, 500) + '...' : msg.content;
            context += `${role}: ${content}\n`;
        });

        context += `\nТекущий вопрос пользователя: ${currentMessage}\n\nОтветь, учитывая контекст выше:`;

        return context;
    }

    addToConversationHistory(role, content, files = []) {
        this.conversationHistory.push({
            role,
            content,
            files: files.map(f => ({ name: f.name, type: f.fileType })),
            timestamp: Date.now()
        });
        
        if (this.conversationHistory.length > 50) {
            this.conversationHistory = this.conversationHistory.slice(-50);
        }
    }

    delay(ms) {
        return new Promise(resolve => this.setTimeout(resolve, ms));
    }

    // UI Management
    setMode(mode) {
        if (this.modeConfigs[mode]) {
            // Выключаем все режимы
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Включаем выбранный режим
            this.currentMode = mode;
            document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
            
            const userInput = document.getElementById('userInput');
            if (userInput) {
                userInput.placeholder = this.modeConfigs[mode].placeholder;
            }
            
            this.updateModeIndicator();
            this.showNotification(`Режим изменен: ${this.getModeDisplayName(mode)}`, 'info');
        }
    }

    getModeDisplayName(mode) {
        const names = {
            normal: 'Обычный',
            creative: 'Креативный',
            voice: 'Аудио',
            image: 'Изображения',
            code: 'Программирование',
            files: 'Анализ файлов'
        };
        return names[mode] || mode;
    }

    updateModeIndicator() {
        const modeIndicator = document.getElementById('modeIndicator');
        if (modeIndicator) {
            const config = this.modeConfigs[this.currentMode];
            modeIndicator.innerHTML = `<i class="${config.icon}"></i><span>${this.getModeDisplayName(this.currentMode)} режим</span>`;
            modeIndicator.style.color = config.color;
        }
    }

    setupModelSelector() {
        const modelBtn = document.getElementById('modelSelectBtn');
        if (modelBtn) {
            const model = this.models[this.currentModel];
            if (model) {
                modelBtn.innerHTML = `<i class="${model.icon}"></i>`;
                modelBtn.title = model.name;
            }
        }
    }

    showModelSelection() {
        const modelSelection = document.getElementById('modelSelection');
        if (!modelSelection) return;
        
        modelSelection.innerHTML = '';
        
        Object.entries(this.models).forEach(([id, model]) => {
            const modelBtn = document.createElement('button');
            modelBtn.className = `model-option ${id === this.currentModel ? 'active' : ''}`;
            modelBtn.innerHTML = `
                <i class="${model.icon}"></i>
                <div class="model-info">
                    <div class="model-name">${model.name}</div>
                    <div class="model-desc">${model.description}</div>
                </div>
                ${id === this.currentModel ? '<i class="ti ti-check"></i>' : ''}
            `;
            
            this.addEventListener(modelBtn, 'click', () => {
                this.setModel(id);
                this.hideModelSelection();
            });
            
            modelSelection.appendChild(modelBtn);
        });
        
        // Позиционирование
        const modelBtn = document.getElementById('modelSelectBtn');
        if (modelBtn) {
            const rect = modelBtn.getBoundingClientRect();
            modelSelection.style.top = (rect.bottom + window.scrollY + 5) + 'px';
            modelSelection.style.right = (window.innerWidth - rect.right) + 'px';
        }
        
        modelSelection.style.display = 'block';
        
        this.addEventListener(document, 'click', (e) => {
            if (!e.target.closest('#modelSelectBtn') && !e.target.closest('#modelSelection')) {
                this.hideModelSelection();
            }
        });
    }

    hideModelSelection() {
        const modelSelection = document.getElementById('modelSelection');
        if (modelSelection) {
            modelSelection.style.display = 'none';
        }
    }

    setModel(modelId) {
        if (this.models[modelId]) {
            this.currentModel = modelId;
            this.setupModelSelector();
            this.showNotification(`Модель изменена: ${this.models[modelId].name}`, 'success');
            this.saveChatHistory();
        }
    }

    // File handling
    handleFileUpload(files) {
        if (!files || files.length === 0) return;
        
        Array.from(files).forEach(file => {
            if (this.attachedFiles.length >= 5) {
                this.showError('Можно прикрепить не более 5 файлов');
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                try {
                    let fileData;
                    
                    if (file.type.startsWith('image/')) {
                        fileData = await this.processImageFile(file);
                    } else if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
                        fileData = await this.processTextFile(file);
                    } else {
                        this.showError(`Формат файла "${file.name}" не поддерживается`);
                        return;
                    }
                    
                    this.attachedFiles.push(fileData);
                    this.updateAttachedFilesDisplay();
                    this.showNotification(`Файл "${file.name}" прикреплен`, 'success');
                } catch (error) {
                    console.error('Error processing file:', error);
                    this.showError(`Ошибка обработки файла: ${file.name}`);
                }
            };
            
            reader.onerror = () => {
                this.showError(`Ошибка чтения файла: ${file.name}`);
            };
            
            if (file.type.startsWith('image/')) {
                reader.readAsDataURL(file);
            } else if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
                reader.readAsText(file);
            }
        });
    }

    updateAttachedFilesDisplay() {
        const filesContainer = document.getElementById('attachedFiles');
        if (!filesContainer) return;
        
        filesContainer.innerHTML = '';
        
        this.attachedFiles.forEach((file, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            fileElement.innerHTML = `
                <i class="ti ${this.getFileIcon(file.fileType)}"></i>
                <span class="file-name">${this.escapeHtml(file.name)}</span>
                <button class="remove-file-btn" data-index="${index}">
                    <i class="ti ti-x"></i>
                </button>
                ${file.fileType === 'image' ? `<img src="${file.data}" alt="${this.escapeHtml(file.name)}" class="file-preview">` : ''}
            `;
            
            this.addEventListener(fileElement.querySelector('.remove-file-btn'), 'click', (e) => {
                e.stopPropagation();
                this.removeAttachedFile(index);
            });
            
            filesContainer.appendChild(fileElement);
        });
        
        filesContainer.style.display = this.attachedFiles.length > 0 ? 'flex' : 'none';
    }

    removeAttachedFile(index) {
        if (index >= 0 && index < this.attachedFiles.length) {
            const removedFile = this.attachedFiles[index];
            this.attachedFiles.splice(index, 1);
            this.updateAttachedFilesDisplay();
            this.showNotification(`Файл "${removedFile.name}" удален`, 'info');
        }
    }

    clearAttachedFiles() {
        this.attachedFiles = [];
        this.updateAttachedFilesDisplay();
    }

    // Navigation and scrolling
    setupScrollTracking() {
        this.updateNavigationButtons();
    }

    handleScroll() {
        const container = document.getElementById('messagesContainer');
        if (!container) return;

        const scrollTop = container.scrollTop;
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        
        this.isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
        this.isAtTop = scrollTop < 50;
        
        this.updateNavigationButtons();
        this.autoScrollEnabled = this.isAtBottom;
    }

    updateNavigationButtons() {
        const scrollToLastAI = document.getElementById('scrollToLastAI');
        const scrollToBottomBtn = document.getElementById('scrollToBottom');
        const scrollToLastAINav = document.getElementById('scrollToLastAINav');
        const scrollToBottomNav = document.getElementById('scrollToBottomNav');
        const chatNavigation = document.getElementById('chatNavigation');

        if (!scrollToLastAI || !scrollToBottomBtn || !chatNavigation) return;

        const aiMessages = document.querySelectorAll('.message-assistant:not(.typing-indicator)');
        const hasAIMessages = aiMessages.length > 0;
        
        scrollToLastAI.classList.toggle('active', !this.isAtBottom && hasAIMessages);
        scrollToLastAI.disabled = !hasAIMessages;
        if (scrollToLastAINav) {
            scrollToLastAINav.classList.toggle('active', !this.isAtBottom && hasAIMessages);
            scrollToLastAINav.disabled = !hasAIMessages;
        }
        
        scrollToBottomBtn.classList.toggle('active', !this.isAtBottom);
        scrollToBottomBtn.disabled = this.isAtBottom;
        if (scrollToBottomNav) {
            scrollToBottomNav.classList.toggle('active', !this.isAtBottom);
            scrollToBottomNav.disabled = this.isAtBottom;
        }
        
        if (this.isAtBottom) {
            chatNavigation.classList.remove('visible');
        } else {
            chatNavigation.classList.add('visible');
        }
    }

    scrollToTop() {
        const container = document.getElementById('messagesContainer');
        if (container) {
            container.scrollTop = 0;
        }
    }

    scrollToLastAIMessage() {
        const aiMessages = document.querySelectorAll('.message-assistant:not(.typing-indicator)');
        if (aiMessages.length > 0) {
            const lastAIMessage = aiMessages[aiMessages.length - 1];
            lastAIMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    scrollToBottom(force = false) {
        if (force || this.autoScrollEnabled) {
            const container = document.getElementById('messagesContainer');
            if (container) {
                container.scrollTop = container.scrollHeight;
                this.autoScrollEnabled = true;
            }
        }
    }

    updateLastAIMessageIndex() {
        const aiMessages = document.querySelectorAll('.message-assistant:not(.typing-indicator)');
        if (aiMessages.length > 0) {
            this.lastAIMessageIndex = Array.from(aiMessages).length - 1;
        } else {
            this.lastAIMessageIndex = -1;
        }
    }

    // Event handling
    async setupEventListeners() {
        try {
            // Основные элементы
            const userInput = document.getElementById('userInput');
            
            // Send message
            this.addEventListener(document.getElementById('sendBtn'), 'click', () => this.handleSendButtonClick());
            
            this.addEventListener(userInput, 'keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendButtonClick();
                }
            });

            // Input auto-resize
            this.addEventListener(userInput, 'input', () => {
                this.autoResizeTextarea(userInput);
                this.toggleClearInputButton();
                this.handleInputChange();
            });

            // Clear input
            this.addEventListener(document.getElementById('clearInputBtn'), 'click', () => {
                userInput.value = '';
                this.autoResizeTextarea(userInput);
                this.toggleClearInputButton();
                userInput.focus();
            });

            // Mode buttons
            document.querySelectorAll('.mode-btn').forEach(btn => {
                this.addEventListener(btn, 'click', (e) => {
                    this.setMode(e.currentTarget.dataset.mode);
                });
            });

            // File attachment
            this.addEventListener(document.getElementById('attachImageBtn'), 'click', () => {
                document.getElementById('fileInput').click();
            });

            this.addEventListener(document.getElementById('attachFileBtn'), 'click', () => {
                document.getElementById('fileInput').click();
            });

            this.addEventListener(document.getElementById('fileInput'), 'change', (e) => {
                this.handleFileUpload(e.target.files);
                e.target.value = '';
            });

            // Voice input
            this.addEventListener(document.getElementById('voiceInputBtn'), 'click', () => {
                this.toggleVoiceInput();
            });

            // Clear chat
            this.addEventListener(document.getElementById('footerClearBtn'), 'click', () => {
                this.clearChat();
            });

            // Export chat
            this.addEventListener(document.getElementById('footerDownloadBtn'), 'click', () => {
                this.exportChat();
            });

            // Help
            this.addEventListener(document.getElementById('footerHelpBtn'), 'click', () => {
                this.showHelp();
            });

            // Theme toggle
            this.addEventListener(document.getElementById('themeToggle'), 'click', () => {
                this.toggleTheme();
            });

            // Model selection
            this.addEventListener(document.getElementById('modelSelectBtn'), 'click', () => {
                this.showModelSelection();
            });

            // Menu toggle
            this.addEventListener(document.getElementById('menuToggle'), 'click', () => {
                this.toggleSidebarMenu();
            });

            this.addEventListener(document.getElementById('sidebarClose'), 'click', () => {
                this.toggleSidebarMenu();
            });

            this.addEventListener(document.getElementById('sidebarOverlay'), 'click', () => {
                this.toggleSidebarMenu();
            });

            // Quick actions
            this.addEventListener(document.getElementById('quickNewChat'), 'click', () => {
                this.createNewChat();
            });

            this.addEventListener(document.getElementById('quickDownload'), 'click', () => {
                this.exportChat();
            });

            // Navigation
            this.addEventListener(document.getElementById('scrollToTop'), 'click', () => {
                this.scrollToTop();
            });

            this.addEventListener(document.getElementById('scrollToLastAI'), 'click', () => {
                this.scrollToLastAIMessage();
            });

            this.addEventListener(document.getElementById('scrollToBottom'), 'click', () => {
                this.scrollToBottom(true);
            });

            // Mobile navigation
            this.addEventListener(document.getElementById('scrollToTopNav'), 'click', () => {
                this.scrollToTop();
            });

            this.addEventListener(document.getElementById('scrollToLastAINav'), 'click', () => {
                this.scrollToLastAIMessage();
            });

            this.addEventListener(document.getElementById('scrollToBottomNav'), 'click', () => {
                this.scrollToBottom(true);
            });

            // Search in header
            const headerSearch = document.getElementById('headerSearch');
            this.addEventListener(headerSearch, 'input', this.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));

            this.addEventListener(document.getElementById('headerSearchClear'), 'click', () => {
                headerSearch.value = '';
                this.handleSearch('');
                headerSearch.focus();
            });

            // Chat search in sidebar
            const chatSearchInput = document.getElementById('chatSearchInput');
            if (chatSearchInput) {
                this.addEventListener(chatSearchInput, 'input', this.debounce((e) => {
                    this.handleChatSearch(e.target.value);
                }, 300));
            }

            // Mobile sidebar toggle
            this.addEventListener(document.getElementById('mobileSidebarToggle'), 'click', () => {
                this.toggleSidebarMenu();
            });

            // Before unload
            this.addEventListener(window, 'beforeunload', () => {
                this.handleBeforeUnload();
            });

            // Preset buttons
            document.querySelectorAll('.preset-btn').forEach(btn => {
                this.addEventListener(btn, 'click', (e) => {
                    this.handlePreset(e.currentTarget.dataset.preset);
                });
            });

            document.querySelectorAll('.preset-sidebar').forEach(btn => {
                this.addEventListener(btn, 'click', (e) => {
                    this.handlePreset(e.currentTarget.dataset.preset);
                    this.toggleSidebarMenu();
                });
            });

            // Resize handling
            this.addEventListener(window, 'resize', this.debounce(() => {
                this.handleResize();
            }, 250));

            // Drag and drop for files
            this.addEventListener(document, 'dragover', (e) => {
                e.preventDefault();
                this.showDropZone();
            });

            this.addEventListener(document, 'dragleave', (e) => {
                if (!e.relatedTarget || e.relatedTarget.nodeName === 'HTML') {
                    this.hideDropZone();
                }
            });

            this.addEventListener(document, 'drop', (e) => {
                e.preventDefault();
                this.hideDropZone();
                if (e.dataTransfer.files.length > 0) {
                    this.handleFileUpload(e.dataTransfer.files);
                }
            });

        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    addEventListener(element, event, handler) {
        if (!element) return;
        
        const wrappedHandler = (...args) => {
            try {
                handler(...args);
            } catch (error) {
                console.error(`Error in ${event} handler:`, error);
                this.showNotification('Произошла ошибка при обработке действия', 'error');
            }
        };

        element.addEventListener(event, wrappedHandler);
        
        if (!this.activeEventListeners.has(element)) {
            this.activeEventListeners.set(element, []);
        }
        this.activeEventListeners.get(element).push({ event, handler: wrappedHandler });
    }

    setTimeout(callback, delay) {
        const timeoutId = setTimeout(() => {
            this.activeTimeouts.delete(timeoutId);
            callback();
        }, delay);
        this.activeTimeouts.add(timeoutId);
        return timeoutId;
    }

    // UI helpers
    autoResizeTextarea(textarea) {
        if (!textarea) return;
        
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 150);
        textarea.style.height = newHeight + 'px';
    }

    toggleClearInputButton() {
        const clearBtn = document.getElementById('clearInputBtn');
        const userInput = document.getElementById('userInput');
        
        if (clearBtn && userInput) {
            if (userInput.value.trim().length > 0 || this.attachedFiles.length > 0) {
                clearBtn.style.display = 'flex';
            } else {
                clearBtn.style.display = 'none';
            }
        }
    }

    handleInputChange() {
        const hasInput = document.getElementById('userInput')?.value.trim().length > 0 || this.attachedFiles.length > 0;
        
        if (this.isGenerating && hasInput) {
            this.updateSendButton(false);
        }
    }

    // Voice input
    toggleVoiceInput() {
        if (!this.isListening) {
            this.startVoiceInput();
        } else {
            this.stopVoiceInput();
        }
    }

    startVoiceInput() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            this.showError('Голосовой ввод не поддерживается вашим браузером');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'ru-RU';
        
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateVoiceInputButton();
            this.showNotification('Слушаю... Говорите', 'info');
        };
        
        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            const userInput = document.getElementById('userInput');
            if (finalTranscript) {
                userInput.value = finalTranscript;
                this.autoResizeTextarea(userInput);
                this.toggleClearInputButton();
            } else if (interimTranscript) {
                userInput.value = interimTranscript;
                this.autoResizeTextarea(userInput);
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            this.updateVoiceInputButton();
            
            if (event.error === 'not-allowed') {
                this.showError('Доступ к микрофону запрещен. Разрешите доступ в настройках браузера.');
            } else {
                this.showError(`Ошибка распознавания: ${event.error}`);
            }
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.updateVoiceInputButton();
        };
        
        try {
            this.recognition.start();
        } catch (error) {
            console.error('Error starting speech recognition:', error);
            this.showError('Не удалось запустить распознавание речи');
        }
    }

    stopVoiceInput() {
        if (this.recognition) {
            this.recognition.stop();
            this.isListening = false;
            this.updateVoiceInputButton();
        }
    }

    updateVoiceInputButton() {
        const voiceBtn = document.getElementById('voiceInputBtn');
        if (!voiceBtn) return;
        
        if (this.isListening) {
            voiceBtn.classList.add('listening');
            voiceBtn.innerHTML = '<i class="ti ti-microphone-off"></i>';
            voiceBtn.title = 'Остановить запись';
        } else {
            voiceBtn.classList.remove('listening');
            voiceBtn.innerHTML = '<i class="ti ti-microphone"></i>';
            voiceBtn.title = 'Голосовой ввод';
        }
    }

    // Theme management
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'auto';
        let newTheme;
        
        if (currentTheme === 'auto') {
            newTheme = 'dark';
        } else if (currentTheme === 'dark') {
            newTheme = 'light';
        } else {
            newTheme = 'auto';
        }
        
        this.setTheme(newTheme);
        this.showNotification(`Тема изменена: ${this.getThemeDisplayName(newTheme)}`, 'info');
    }

    getThemeDisplayName(theme) {
        const names = {
            auto: 'Авто',
            light: 'Светлая',
            dark: 'Темная'
        };
        return names[theme] || theme;
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('khai-theme', theme);
    }

    loadThemePreference() {
        const savedTheme = localStorage.getItem('khai-theme') || 'auto';
        this.setTheme(savedTheme);
    }

    // Sidebar management
    toggleSidebarMenu() {
        const sidebar = document.getElementById('mobileSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            const isOpen = sidebar.classList.contains('active');
            
            if (isOpen) {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            } else {
                sidebar.classList.add('active');
                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                this.updateChatList();
            }
        }
    }

    updateChatList() {
        const chatsContainer = document.getElementById('chatsContainer');
        const mobileChatsContainer = document.getElementById('mobileChatsContainer');
        
        [chatsContainer, mobileChatsContainer].forEach(container => {
            if (!container) return;
            
            container.innerHTML = '';
            
            const chatsArray = Array.from(this.chats.entries())
                .filter(([id, chat]) => {
                    if (this.chatSearchTerm) {
                        const chatName = chat.name || 'Безымянный чат';
                        return chatName.toLowerCase().includes(this.chatSearchTerm);
                    }
                    return true;
                })
                .sort(([,a], [,b]) => (b.lastActivity || 0) - (a.lastActivity || 0));
            
            if (chatsArray.length === 0) {
                const emptyState = document.createElement('div');
                emptyState.className = 'empty-chats';
                emptyState.innerHTML = `
                    <i class="ti ti-message-off"></i>
                    <p>${this.chatSearchTerm ? 'Чаты не найдены' : 'Нет созданных чатов'}</p>
                `;
                container.appendChild(emptyState);
                return;
            }
            
            chatsArray.forEach(([id, chat]) => {
                const chatItem = this.createChatListItem(id, chat);
                container.appendChild(chatItem);
            });
        });
    }

    handleChatSearch(term) {
        this.chatSearchTerm = term.toLowerCase().trim();
        this.updateChatList();
        
        const chatSearchClear = document.getElementById('chatSearchClear');
        const mobileChatSearchClear = document.getElementById('mobileChatSearchClear');
        
        [chatSearchClear, mobileChatSearchClear].forEach(clearBtn => {
            if (clearBtn) {
                clearBtn.style.display = this.chatSearchTerm ? 'flex' : 'none';
            }
        });
    }

    createChatListItem(id, chat) {
        const chatItem = document.createElement('div');
        chatItem.className = `chat-list-item ${id === this.currentChatId ? 'active' : ''}`;
        chatItem.setAttribute('data-chat-id', id);
        
        const messageCount = chat.messages ? chat.messages.length : 0;
        const lastActivity = chat.lastActivity ? this.formatTime(chat.lastActivity) : 'Нет активности';
        const chatName = chat.name || 'Безымянный чат';
        
        chatItem.innerHTML = `
            <div class="chat-list-info">
                <div class="chat-list-name">${this.escapeHtml(chatName)}</div>
                <div class="chat-list-meta">
                    <span class="chat-list-count">${messageCount} сообщений</span>
                    <span class="chat-list-time">${lastActivity}</span>
                </div>
            </div>
            <div class="chat-list-actions">
                <button class="chat-list-edit" title="Редактировать название">
                    <i class="ti ti-edit"></i>
                </button>
                <button class="chat-list-download" title="Скачать чат">
                    <i class="ti ti-download"></i>
                </button>
                ${id !== 'main-chat' ? `
                    <button class="chat-list-delete" title="Удалить чат">
                        <i class="ti ti-trash"></i>
                    </button>
                ` : ''}
            </div>
        `;
        
        this.addEventListener(chatItem, 'click', (e) => {
            if (!e.target.closest('.chat-list-actions')) {
                this.switchToChat(id);
                this.toggleSidebarMenu();
            }
        });
        
        const editBtn = chatItem.querySelector('.chat-list-edit');
        if (editBtn) {
            this.addEventListener(editBtn, 'click', (e) => {
                e.stopPropagation();
                this.editChatName(id, chatName);
            });
        }
        
        const downloadBtn = chatItem.querySelector('.chat-list-download');
        if (downloadBtn) {
            this.addEventListener(downloadBtn, 'click', (e) => {
                e.stopPropagation();
                this.exportChat(id);
            });
        }
        
        const deleteBtn = chatItem.querySelector('.chat-list-delete');
        if (deleteBtn) {
            this.addEventListener(deleteBtn, 'click', (e) => {
                e.stopPropagation();
                this.deleteChat(id, chatName);
            });
        }
        
        return chatItem;
    }

    switchToChat(chatId) {
        if (chatId === this.currentChatId) return;
        
        this.saveChatHistory();
        this.currentChatId = chatId;
        this.renderChat();
        this.updateUI();
        this.showNotification(`Переключен на чат: ${this.chats.get(chatId)?.name || 'Безымянный чат'}`, 'info');
    }

    editChatName(chatId, currentName) {
        const newName = prompt('Введите новое название чата:', currentName);
        if (newName && newName.trim() && newName !== currentName) {
            const chat = this.chats.get(chatId);
            if (chat) {
                chat.name = newName.trim();
                chat.lastActivity = Date.now();
                this.chats.set(chatId, chat);
                this.saveChatHistory();
                this.updateUI();
                this.showNotification('Название чата изменено', 'success');
            }
        }
    }

    deleteChat(chatId, chatName) {
        if (chatId === 'main-chat') {
            this.showNotification('Основной чат нельзя удалить', 'warning');
            return;
        }
        
        if (confirm(`Вы уверены, что хотите удалить чат "${chatName}"?`)) {
            this.chats.delete(chatId);
            
            if (this.currentChatId === chatId) {
                this.currentChatId = 'main-chat';
                this.renderChat();
            }
            
            this.saveChatHistory();
            this.updateUI();
            this.showNotification('Чат удален', 'success');
        }
    }

    createNewChat() {
        const newChatId = 'chat-' + Date.now();
        const newChat = {
            id: newChatId,
            name: `Чат ${this.chats.size}`,
            messages: [],
            lastActivity: Date.now(),
            createdAt: Date.now()
        };
        
        this.chats.set(newChatId, newChat);
        this.switchToChat(newChatId);
        this.saveChatHistory();
        
        this.showNotification('Новый чат создан', 'success');
    }

    // Search functionality
    handleSearch(term) {
        this.searchTerm = term.toLowerCase().trim();
        
        const messages = document.querySelectorAll('.message');
        let foundCount = 0;
        
        messages.forEach(message => {
            const messageContent = message.querySelector('.message-text');
            const messageAuthor = message.querySelector('.message-author');
            
            if (messageContent) {
                const text = messageContent.textContent.toLowerCase();
                const author = messageAuthor ? messageAuthor.textContent.toLowerCase() : '';
                const shouldHighlight = this.searchTerm && 
                    (text.includes(this.searchTerm) || author.includes(this.searchTerm));
                
                if (shouldHighlight) {
                    message.classList.add('search-highlight');
                    foundCount++;
                    
                    // Подсветка текста в содержимом
                    const originalHTML = messageContent.innerHTML;
                    const regex = new RegExp(`(${this.escapeRegex(this.searchTerm)})`, 'gi');
                    messageContent.innerHTML = originalHTML.replace(regex, '<mark class="search-match">$1</mark>');
                    
                    // Восстановление подсветки кода
                    this.attachCopyButtons(messageContent);
                } else {
                    message.classList.remove('search-highlight');
                    
                    // Убираем подсветку
                    const markedHTML = messageContent.innerHTML;
                    messageContent.innerHTML = markedHTML.replace(/<mark class="search-match">(.+?)<\/mark>/gi, '$1');
                }
            }
        });
        
        const searchClear = document.getElementById('headerSearchClear');
        if (searchClear) {
            searchClear.style.display = this.searchTerm ? 'flex' : 'none';
        }
        
        if (this.searchTerm) {
            this.showNotification(`Найдено сообщений: ${foundCount}`, foundCount > 0 ? 'success' : 'warning');
        }
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Presets
    handlePreset(preset) {
        const presets = {
            'explain': {
                message: 'Объясни концепцию искусственного интеллекта простыми словами',
                mode: 'normal'
            },
            'summarize': {
                message: 'Суммаризируй основные преимущества использования AI в повседневной жизни',
                mode: 'normal'
            },
            'translate': {
                message: 'Переведи следующий текст на английский: "Привет, как дела?"',
                mode: 'normal'
            },
            'code': {
                message: 'Напиши функцию на Python для вычисления факториала числа',
                mode: 'code'
            }
        };
        
        const presetData = presets[preset];
        if (presetData) {
            this.setMode(presetData.mode);
            
            const userInput = document.getElementById('userInput');
            if (userInput) {
                userInput.value = presetData.message;
                this.autoResizeTextarea(userInput);
                this.toggleClearInputButton();
                userInput.focus();
            }
            
            this.showNotification(`Загружен пресет: ${preset}`, 'info');
        }
    }

    // Chat management
    clearChat() {
        if (this.messages.length === 0 && this.chats.get(this.currentChatId)?.length === 0) {
            this.showNotification('Чат уже пуст', 'info');
            return;
        }
        
        if (confirm('Вы уверены, что хотите очистить чат? Это действие нельзя отменить.')) {
            this.messages = [];
            this.chats.set(this.currentChatId, []);
            this.conversationHistory = [];
            
            const messagesContainer = document.getElementById('messagesContainer');
            if (messagesContainer) {
                messagesContainer.innerHTML = '';
            }
            
            this.hideTypingIndicator();
            this.stopGeneration();
            this.clearAttachedFiles();
            
            this.saveChatHistory();
            this.showNotification('Чат очищен', 'success');
            this.showWelcomeMessage();
        }
    }

    async exportChat(chatId = this.currentChatId) {
        try {
            const chatData = this.chats.get(chatId) || [];
            if (chatData.length === 0) {
                this.showNotification('Нет сообщений для экспорта', 'warning');
                return;
            }
            
            let exportContent = `KHAI - Экспорт чата\n`;
            exportContent += `Дата: ${new Date().toLocaleString('ru-RU')}\n`;
            exportContent += `Модель: ${this.models[this.currentModel]?.name || this.currentModel}\n`;
            exportContent += `Режим: ${this.getModeDisplayName(this.currentMode)}\n`;
            exportContent += `\n${'='.repeat(50)}\n\n`;
            
            chatData.forEach(message => {
                const role = message.role === 'user' ? 'Вы' : 'AI';
                const time = this.formatTime(message.timestamp, true);
                exportContent += `${role} (${time}):\n`;
                exportContent += `${message.content}\n\n`;
                
                if (message.files && message.files.length > 0) {
                    exportContent += `Прикрепленные файлы: ${message.files.map(f => f.name).join(', ')}\n\n`;
                }
                
                exportContent += `${'-'.repeat(30)}\n\n`;
            });
            
            const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            a.href = url;
            a.download = `khai-chat-${timestamp}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Чат экспортирован', 'success');
        } catch (error) {
            console.error('Error exporting chat:', error);
            this.showError('Ошибка при экспорте чата');
        }
    }

    showHelp() {
        const helpContent = `
            <div class="help-content">
                <h2>📚 Помощь по KHAI</h2>
                
                <div class="help-section">
                    <h3>🔧 Основные возможности</h3>
                    <ul>
                        <li><strong>Мультимодальный AI:</strong> Работа с текстом, кодом, изображениями и аудио</li>
                        <li><strong>Разные модели:</strong> GPT-5 Nano, O3 Mini, Claude Sonnet и другие через Puter.ai</li>
                        <li><strong>Режимы работы:</strong> Обычный, Креативный, Программирование, Изображения, Аудио, Анализ файлов</li>
                        <li><strong>Голосовой ввод:</strong> Нажмите микрофон для голосового ввода</li>
                        <li><strong>Прикрепление файлов:</strong> Перетащите файлы или используйте кнопку прикрепления</li>
                    </ul>
                </div>
                
                <div class="help-section">
                    <h3>⌨️ Горячие клавиши</h3>
                    <ul>
                        <li><kbd>Enter</kbd> - Отправить сообщение</li>
                        <li><kbd>Shift + Enter</kbd> - Новая строка</li>
                        <li><kbd>Ctrl + /</kbd> - Показать справку</li>
                        <li><kbd>Ctrl + K</kbd> - Очистить чат</li>
                        <li><kbd>Ctrl + E</kbd> - Экспорт чата</li>
                        <li><kbd>Ctrl + M</kbd> - Сменить режим</li>
                    </ul>
                </div>
            </div>
        `;
        
        this.showModal('Помощь по KHAI', helpContent);
    }

    showWelcomeMessage() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer || messagesContainer.children.length > 0) return;
        
        const welcomeMessage = document.createElement('div');
        welcomeMessage.className = 'welcome-message';
        welcomeMessage.innerHTML = `
            <div class="welcome-content">
                <div class="welcome-icon">
                    <i class="ti ti-sparkles"></i>
                </div>
                <h2>Добро пожаловать в KHAI!</h2>
                <p>Первый белорусский AI-чат с интеграцией Puter.js. Готов помочь с:</p>
                <ul>
                    <li><i class="ti ti-message"></i> Ответами на вопросы и обсуждениями</li>
                    <li><i class="ti ti-code"></i> Написанием и анализом кода</li>
                    <li><i class="ti ti-photo"></i> Работой с изображениями</li>
                    <li><i class="ti ti-microphone"></i> Аудио задачами</li>
                    <li><i class="ti ti-file-analytics"></i> Анализом файлов</li>
                    <li><i class="ti ti-sparkles"></i> Креативными проектами</li>
                </ul>
                <div class="welcome-tips">
                    <strong>Советы:</strong>
                    <div class="tip">• Используйте разные режимы для разных типов задач</div>
                    <div class="tip">• Прикрепляйте файлы для анализа</div>
                    <div class="tip">• Используйте голосовой ввод для удобства</div>
                    <div class="tip">• Переключайте модели AI для лучших результатов</div>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(welcomeMessage);
    }

    // Utility methods
    showNotification(message, type = 'info') {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="ti ti-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="ti ti-x"></i>
            </button>
        `;
        
        const container = document.getElementById('notificationContainer');
        if (container) {
            container.appendChild(notification);
        } else {
            document.body.appendChild(notification);
        }
        
        const header = document.querySelector('.app-header');
        if (header) {
            notification.style.top = (header.offsetHeight + 20) + 'px';
        }
        
        this.addEventListener(notification.querySelector('.notification-close'), 'click', () => {
            notification.remove();
        });
        
        this.setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('fade-out');
                this.setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check',
            error: 'x',
            warning: 'alert-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    showError(message, error = null) {
        console.error(message, error);
        this.showNotification(message, 'error');
    }

    handleError(message, error = null) {
        console.error(message, error);
        this.showNotification(message, 'error');
        
        if (this.isGenerating) {
            this.isGenerating = false;
            this.updateSendButton(false);
            this.hideTypingIndicator();
        }
    }

    setOnlineStatus(online) {
        this.isOnline = online;
    }

    showDropZone() {
        let dropZone = document.getElementById('dropZone');
        if (!dropZone) {
            dropZone = document.createElement('div');
            dropZone.id = 'dropZone';
            dropZone.innerHTML = `
                <div class="drop-zone-content">
                    <i class="ti ti-upload"></i>
                    <h3>Перетащите файлы сюда</h3>
                    <p>Поддерживаются изображения, текстовые файлы и другие документы</p>
                </div>
            `;
            document.body.appendChild(dropZone);
        }
        
        dropZone.style.display = 'flex';
    }

    hideDropZone() {
        const dropZone = document.getElementById('dropZone');
        if (dropZone) {
            dropZone.style.display = 'none';
        }
    }

    handleResize() {
        this.autoResizeTextarea(document.getElementById('userInput'));
        this.updateNavigationButtons();
    }

    handleBeforeUnload() {
        this.saveChatHistory();
        
        if (this.isGenerating) {
            return 'Идет генерация ответа. Вы уверены, что хотите покинуть страницу?';
        }
    }

    startChatDurationTimer() {
        this.chatStartTime = Date.now();
        this.updateChatDuration();
        
        this.durationTimer = setInterval(() => {
            this.updateChatDuration();
        }, 60000);
    }

    updateChatDuration() {
        const durationElement = document.getElementById('chatDuration');
        if (!durationElement) return;
        
        const duration = Date.now() - this.chatStartTime;
        const minutes = Math.floor(duration / 60000);
        const hours = Math.floor(minutes / 60);
        
        let durationText = '';
        if (hours > 0) {
            durationText = `${hours}ч ${minutes % 60}м`;
        } else {
            durationText = `${minutes}м`;
        }
        
        durationElement.textContent = `Время: ${durationText}`;
    }

    startPlaceholderAnimation() {
        const userInput = document.getElementById('userInput');
        if (!userInput) return;
        
        let currentExampleIndex = 0;
        let animationTimeout;
        
        const stopAnimation = () => {
            if (animationTimeout) {
                clearTimeout(animationTimeout);
                animationTimeout = null;
            }
            userInput.placeholder = this.modeConfigs[this.currentMode].placeholder;
        };
        
        const startAnimation = () => {
            if (document.activeElement === userInput || userInput.value) {
                stopAnimation();
                return;
            }
            
            const animatePlaceholder = () => {
                if (document.activeElement === userInput || userInput.value) {
                    stopAnimation();
                    return;
                }
                
                const example = this.placeholderExamples[currentExampleIndex];
                let displayedText = '';
                let charIndex = 0;
                
                const typeNextChar = () => {
                    if (document.activeElement === userInput || userInput.value) {
                        stopAnimation();
                        return;
                    }
                    
                    if (charIndex < example.length) {
                        displayedText += example.charAt(charIndex);
                        userInput.placeholder = displayedText;
                        charIndex++;
                        animationTimeout = setTimeout(typeNextChar, 50);
                    } else {
                        animationTimeout = setTimeout(() => {
                            deleteText();
                        }, 2000);
                    }
                };
                
                const deleteText = () => {
                    if (document.activeElement === userInput || userInput.value) {
                        stopAnimation();
                        return;
                    }
                    
                    if (displayedText.length > 0) {
                        displayedText = displayedText.slice(0, -1);
                        userInput.placeholder = displayedText;
                        animationTimeout = setTimeout(deleteText, 30);
                    } else {
                        currentExampleIndex = (currentExampleIndex + 1) % this.placeholderExamples.length;
                        animationTimeout = setTimeout(animatePlaceholder, 500);
                    }
                };
                
                typeNextChar();
            };
            
            animatePlaceholder();
        };
        
        this.addEventListener(userInput, 'focus', stopAnimation);
        this.addEventListener(userInput, 'blur', () => {
            this.setTimeout(() => {
                if (document.activeElement !== userInput && !userInput.value) {
                    startAnimation();
                }
            }, 1000);
        });
        
        if (!userInput.value) {
            startAnimation();
        }
    }

    // Data persistence
    async loadChatHistory() {
        try {
            const saved = localStorage.getItem('khai-chats');
            if (saved) {
                const data = JSON.parse(saved);
                this.chats = new Map(Object.entries(data.chats || {}));
                this.currentChatId = data.currentChatId || 'main-chat';
                this.conversationHistory = data.conversationHistory || [];
                this.currentModel = data.currentModel || 'gpt-5-nano';
                this.currentMode = data.currentMode || 'normal';
                
                this.renderChat();
                this.setupModelSelector();
                this.setMode(this.currentMode);
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
            this.chats.set('main-chat', []);
        }
    }

    saveChatHistory() {
        try {
            const data = {
                chats: Object.fromEntries(this.chats),
                currentChatId: this.currentChatId,
                conversationHistory: this.conversationHistory,
                currentModel: this.currentModel,
                currentMode: this.currentMode,
                timestamp: Date.now()
            };
            
            localStorage.setItem('khai-chats', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }

    renderChat() {
        const messagesContainer = document.getElementById('messagesContainer');
        if (!messagesContainer) return;
        
        messagesContainer.innerHTML = '';
        
        const chat = this.chats.get(this.currentChatId) || [];
        chat.forEach(message => {
            this.renderMessage(message);
        });
        
        this.updateLastAIMessageIndex();
        this.scrollToBottom();
    }

    // Utility functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    formatTime(timestamp, full = false) {
        const date = new Date(timestamp);
        
        if (full) {
            return date.toLocaleString('ru-RU');
        }
        
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) {
            return 'только что';
        } else if (diff < 3600000) {
            const minutes = Math.floor(diff / 60000);
            return `${minutes} мин назад`;
        } else if (diff < 86400000) {
            return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        } else {
            return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateUI() {
        this.updateModeIndicator();
        this.updateNavigationButtons();
        this.updateAttachedFilesDisplay();
        this.toggleClearInputButton();
        
        const messageCount = document.getElementById('messageCount');
        if (messageCount) {
            const count = this.chats.get(this.currentChatId)?.length || 0;
            messageCount.textContent = `Сообщений: ${count}`;
        }
        
        const modelDisplay = document.getElementById('currentModelDisplay');
        if (modelDisplay) {
            modelDisplay.textContent = `Модель: ${this.models[this.currentModel]?.name || this.currentModel}`;
        }
        
        const footerMessageCount = document.getElementById('footerMessageCount');
        if (footerMessageCount) {
            const count = this.chats.get(this.currentChatId)?.length || 0;
            footerMessageCount.textContent = `${count} сообщений`;
        }
        
        const footerModelDisplay = document.getElementById('footerModelDisplay');
        if (footerModelDisplay) {
            footerModelDisplay.textContent = this.models[this.currentModel]?.name || this.currentModel;
        }
    }

    showModal(title, content, size = 'medium') {
        // Простая реализация модального окна
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">
                        <i class="ti ti-x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        this.addEventListener(modal, 'click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        this.addEventListener(modal.querySelector('.modal-close'), 'click', () => {
            modal.remove();
        });
    }

    destroy() {
        this.activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.activeTimeouts.clear();
        
        if (this.durationTimer) {
            clearInterval(this.durationTimer);
        }
        
        this.activeEventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        this.activeEventListeners.clear();
        
        this.stopSpeaking();
        this.stopVoiceInput();
        this.stopGeneration();
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.khaiChat = new KHAIChat();
    } catch (error) {
        console.error('Error initializing KHAI:', error);
    }
});

window.addEventListener('beforeunload', () => {
    if (window.khaiChat) {
        window.khaiChat.destroy();
    }
});
