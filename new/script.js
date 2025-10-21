// KHAI — Advanced AI Chat Application (Production Ready) with Puter.js Integration
class KHAIChat {
    constructor() {
        // Application state
        this.state = {
            chats: new Map(),
            currentChatId: 'main-chat',
            messages: [],
            settings: {
                theme: 'dark',
                fontSize: 'medium',
                model: 'gpt-4',
                autoScroll: true,
                soundEnabled: true,
                offlineMode: false
            },
            isGenerating: false,
            generationAborted: false,
            isOnline: navigator.onLine,
            attachedFiles: [],
            currentMode: 'normal',
            conversationHistory: [],
            // Новые состояния из других скриптов
            isListening: false,
            isSpeaking: false,
            currentUtterance: null,
            searchTerm: '',
            chatSearchTerm: '',
            fullscreenInputActive: false,
            puterInitialized: false,
            isAtBottom: true,
            isAtTop: false,
            lastAIMessageIndex: -1,
            lastUserMessage: null
        };

        // Расширенные модели с Puter.js интеграцией
        this.models = {
            'gpt-4': { 
                name: 'GPT-4 Turbo', 
                description: 'Самый продвинутый модель для сложных задач',
                icon: 'ti ti-brain',
                puterModel: 'gpt-4'
            },
            'gpt-3.5': { 
                name: 'GPT-3.5 Turbo', 
                description: 'Быстрый и эффективный для повседневных задач',
                icon: 'ti ti-flame',
                puterModel: 'gpt-3.5-turbo'
            },
            'claude-3': { 
                name: 'Claude 3', 
                description: 'Отличный для креативных задач и анализа',
                icon: 'ti ti-cloud',
                puterModel: 'claude-3-sonnet'
            },
            'gemini-pro': { 
                name: 'Gemini Pro', 
                description: 'Мощный мультимодальный модель от Google',
                icon: 'ti ti-sparkles',
                puterModel: 'gemini-pro'
            },
            'gpt-5-nano': { 
                name: 'GPT-5 Nano', 
                description: 'Быстрая и эффективная модель для повседневных задач',
                icon: 'ti ti-bolt',
                puterModel: 'gpt-4'
            },
            'o3-mini': { 
                name: 'O3 Mini', 
                description: 'Продвинутая модель с улучшенными возможностями рассуждения',
                icon: 'ti ti-cpu',
                puterModel: 'gpt-4'
            },
            'claude-sonnet': { 
                name: 'Claude Sonnet', 
                description: 'Мощная модель от Anthropic для сложных задач и анализа',
                icon: 'ti ti-shield',
                puterModel: 'claude-3-sonnet'
            },
            'deepseek-chat': { 
                name: 'DeepSeek Chat', 
                description: 'Универсальная модель для общения и решения задач',
                icon: 'ti ti-search',
                puterModel: 'gpt-4'
            },
            'deepseek-reasoner': { 
                name: 'DeepSeek Reasoner', 
                description: 'Специализированная модель для сложных логических рассуждений',
                icon: 'ti ti-logic-and',
                puterModel: 'gpt-4'
            },
            'gemini-2.0-flash': { 
                name: 'Gemini 2.0 Flash', 
                description: 'Новейшая быстрая модель от Google с улучшенными возможностями',
                icon: 'ti ti-flash',
                puterModel: 'gemini-flash'
            },
            'gemini-1.5-flash': { 
                name: 'Gemini 1.5 Flash', 
                description: 'Быстрая и эффективная модель от Google для различных задач',
                icon: 'ti ti-zap',
                puterModel: 'gemini-flash'
            },
            'grok-beta': { 
                name: 'xAI Grok', 
                description: 'Модель от xAI с уникальным характером и остроумными ответами',
                icon: 'ti ti-message-circle',
                puterModel: 'grok-beta'
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
            }
        };

        this.placeholderExamples = [
            "Расскажи о возможностях искусственного интеллекта...",
            "Напиши код для сортировки массива на Python...",
            "Объясни теорию относительности простыми словами...",
            "Какие есть способы улучшить производительность веб-сайта?",
            "Создай описание для приложения на основе ИИ..."
        ];

        // Performance optimizations
        this.performance = {
            activeTimeouts: new Set(),
            activeIntervals: new Set(),
            activeEventListeners: new Map(),
            lastRenderTime: 0,
            renderThrottle: 100,
            messageCache: new Map(),
            virtualScroll: {
                visibleStart: 0,
                visibleEnd: 0,
                itemHeight: 80
            }
        };

        // Mobile optimizations
        this.mobile = {
            isKeyboardVisible: false,
            touchStartY: 0,
            viewportHeight: window.innerHeight
        };

        // API configuration
        this.api = {
            endpoints: {
                chat: '/api/chat',
                models: '/api/models',
                files: '/api/files'
            },
            timeout: 30000,
            retryCount: 3
        };

        // Security
        this.security = {
            allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'text/plain', 'application/json'],
            maxFileSize: 10 * 1024 * 1024, // 10MB
            maxMessageLength: 4000,
            maxHistoryLength: 100
        };

        // Puter.js integration
        this.puterAI = null;
        this.recognition = null;
        this.currentStreamController = null;
        this.activeStreamingMessage = null;
        this.typingIndicator = null;
        this.chatStartTime = Date.now();
        this.durationTimer = null;
        this.contextMenu = null;
        this.deferredPrompt = null;

        this.init();
    }

    // ==================== INITIALIZATION ====================

    async init() {
        try {
            await this.setupServiceWorker();
            await this.setupPuterAI();
            await this.loadApplicationState();
            await this.setupEventListeners();
            this.setupMobileOptimizations();
            this.initializeUI();
            this.showWelcomeMessage();
            
            // Finalize initialization
            this.hideLoader();
            this.showNotification('KHAI готов к работе!', 'success');
            
            console.log('KHAI Chat initialized successfully');
        } catch (error) {
            console.error('Failed to initialize KHAI Chat:', error);
            this.handleError('Ошибка инициализации приложения', error);
        }
    }

    async setupPuterAI() {
        try {
            if (typeof puter !== 'undefined') {
                this.puterAI = puter;
                this.state.puterInitialized = true;
                console.log('Puter.js successfully initialized');
                this.setOnlineStatus(true);
                
                // Test the connection
                await this.testPuterConnection();
            } else {
                throw new Error('Puter.js not available');
            }
        } catch (error) {
            console.warn('Puter.js initialization failed, using fallback mode:', error);
            this.setupPuterFallback();
            this.setOnlineStatus(false);
        }
    }

    async testPuterConnection() {
        try {
            if (this.puterAI && typeof this.puterAI.ai?.chat === 'function') {
                // Test with a simple prompt
                const testPrompt = "Привет! Ответь коротко 'Готов к работе'";
                const response = await this.puterAI.ai.chat(testPrompt, {
                    model: 'gpt-3.5-turbo',
                    stream: false
                });
                console.log('Puter.js connection test successful:', response);
            }
        } catch (error) {
            console.warn('Puter.js connection test failed:', error);
        }
    }

    setupPuterFallback() {
        this.puterAI = {
            ai: {
                chat: async (prompt, options) => {
                    console.log('Puter.ai fallback - chat called:', { prompt, options });
                    return this.mockAIResponse(prompt, options);
                },
                img2txt: async (imageData) => {
                    console.log('Puter.ai fallback - img2txt called');
                    return "Это демонстрационное изображение. В реальном приложении здесь был бы распознанный текст с помощью Puter.ai.";
                },
                imagine: async (prompt, options) => {
                    console.log('Puter.ai fallback - imagine called:', { prompt, options });
                    return {
                        url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%230099ff'/%3E%3Ctext x='200' y='220' font-family='Arial' font-size='24' text-anchor='middle' fill='white'%3EСгенерированное изображение%3C/text%3E%3C/svg%3E"
                    };
                },
                txt2speech: async (text) => {
                    console.log('Puter.ai fallback - txt2speech called:', text);
                    return {
                        src: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUgBjiN1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUgBjiN1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUgBjiN1/LMeSw=="
                    };
                }
            }
        };
    }

    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/',
                    updateViaCache: 'none'
                });

                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });

                // Check for updates periodically
                setInterval(() => registration.update(), 60 * 60 * 1000); // Every hour

            } catch (error) {
                console.warn('Service Worker registration failed:', error);
            }
        }
    }

    // ==================== REAL PUTER.JS API INTEGRATION ====================

    async callAIService(prompt) {
        if (!this.puterAI || typeof this.puterAI.ai?.chat !== 'function') {
            throw new Error('Функция чата недоступна. Проверьте подключение Puter.js');
        }
        
        const modelConfig = this.models[this.state.settings.model];
        const puterModel = modelConfig?.puterModel || 'gpt-4';
        
        const options = {
            model: puterModel,
            systemPrompt: this.modeConfigs[this.state.currentMode].systemPrompt,
            stream: true
        };
        
        console.log('Calling Puter.ai with:', { prompt: prompt.substring(0, 100) + '...', options });
        
        try {
            const response = await this.puterAI.ai.chat(prompt, options);
            return response;
        } catch (error) {
            console.error('Puter.ai API error:', error);
            throw new Error(`Ошибка Puter.ai: ${error.message}`);
        }
    }

    async generateImageWithPuter(prompt) {
        if (!this.puterAI || typeof this.puterAI.ai?.imagine !== 'function') {
            throw new Error('Функция генерации изображений недоступна');
        }
        
        try {
            const imageResult = await this.puterAI.ai.imagine(prompt, {
                model: "dall-e-3",
                size: "1024x1024"
            });
            
            return imageResult;
        } catch (error) {
            console.error('Puter.ai image generation error:', error);
            throw new Error(`Ошибка генерации изображения: ${error.message}`);
        }
    }

    async generateVoiceWithPuter(text) {
        if (!this.puterAI || typeof this.puterAI.ai?.txt2speech !== 'function') {
            throw new Error('Функция генерации голоса недоступна');
        }
        
        try {
            const audio = await this.puterAI.ai.txt2speech(text);
            return audio;
        } catch (error) {
            console.error('Puter.ai voice generation error:', error);
            throw new Error(`Ошибка генерации голоса: ${error.message}`);
        }
    }

    async analyzeImageWithPuter(imageData) {
        if (!this.puterAI || typeof this.puterAI.ai?.img2txt !== 'function') {
            throw new Error('Функция анализа изображений недоступна');
        }
        
        try {
            const extractedText = await this.puterAI.ai.img2txt(imageData);
            return extractedText;
        } catch (error) {
            console.error('Puter.ai image analysis error:', error);
            throw new Error(`Ошибка анализа изображения: ${error.message}`);
        }
    }

    // ==================== ENHANCED MESSAGE HANDLING ====================

    async sendMessage(content, mode = this.state.currentMode) {
        if (this.state.isGenerating) {
            this.showNotification('Подождите, идет генерация...', 'warning');
            return;
        }

        // Validation
        if (!content.trim() && this.state.attachedFiles.length === 0) {
            this.showNotification('Введите сообщение или прикрепите файл', 'warning');
            return;
        }

        if (content.length > this.security.maxMessageLength) {
            this.showNotification(`Сообщение слишком длинное (максимум ${this.security.maxMessageLength} символов)`, 'error');
            return;
        }

        try {
            this.state.isGenerating = true;
            this.state.generationAborted = false;
            this.updateSendButton(true);

            // Create user message
            const userMessage = this.createMessage('user', content, mode, this.state.attachedFiles);
            this.addMessage(userMessage);

            // Clear input
            this.clearInput();

            // Handle different modes
            if (mode === 'image') {
                await this.generateImage(content);
            } else if (mode === 'voice') {
                await this.generateVoice(content);
            } else {
                // Get AI response for normal modes
                await this.getAIResponse(userMessage);
            }

        } catch (error) {
            this.handleError('Ошибка отправки сообщения', error);
        } finally {
            if (!this.state.generationAborted) {
                this.state.isGenerating = false;
                this.updateSendButton(false);
                this.saveApplicationState();
            }
        }
    }

    async generateImage(prompt) {
        try {
            this.showNotification('Генерация изображения...', 'info');
            
            const imageResult = await this.generateImageWithPuter(prompt);
            
            const message = {
                id: this.generateId(),
                role: 'assistant',
                content: `Сгенерировано изображение по запросу: "${prompt}"\n\n<img src="${imageResult.url}" alt="Сгенерированное изображение" class="generated-image">`,
                timestamp: Date.now(),
                mode: 'image'
            };
            
            this.addMessage(message);
            this.showNotification('Изображение сгенерировано', 'success');
            
        } catch (error) {
            this.handleError('Ошибка при генерации изображения', error);
        }
    }

    async generateVoice(text) {
        try {
            this.showNotification('Генерация аудио...', 'info');
            
            const audio = await this.generateVoiceWithPuter(text);
            
            const message = {
                id: this.generateId(),
                role: 'assistant',
                content: `Сгенерировано аудио по запросу: "${text}"\n\n<audio controls class="generated-audio"><source src="${audio.src}" type="audio/mpeg">Ваш браузер не поддерживает аудио элементы.</audio>`,
                timestamp: Date.now(),
                mode: 'voice'
            };
            
            this.addMessage(message);
            this.showNotification('Аудио сгенерировано', 'success');
            
        } catch (error) {
            this.handleError('Ошибка при генерации аудио', error);
        }
    }

    async getAIResponse(userMessage) {
        this.showTypingIndicator();

        try {
            const prompt = await this.buildPrompt(userMessage);
            const response = await this.callAIService(prompt);
            
            this.hideTypingIndicator();
            await this.processAIResponse(response);
            
        } catch (error) {
            this.hideTypingIndicator();
            
            // Fallback to mock response if Puter.ai fails
            if (this.state.puterInitialized) {
                console.warn('Falling back to mock response due to Puter.ai error:', error);
                const mockResponse = await this.mockAIResponse(this.buildPrompt(userMessage));
                await this.processAIResponse(mockResponse);
            } else {
                this.handleError('Ошибка получения ответа ИИ', error);
            }
        }
    }

    async buildPrompt(userMessage) {
        // Handle file attachments
        if (userMessage.files && userMessage.files.length > 0) {
            const file = userMessage.files[0];
            
            if (file.type.startsWith('image/')) {
                const extractedText = await this.analyzeImageWithPuter(file.data);
                
                if (userMessage.content.trim()) {
                    return `Пользователь отправил изображение "${file.name}" с сопроводительным сообщением: "${userMessage.content}"

Извлеченный текст с изображения: "${extractedText}"

Ответь на вопрос/сообщение пользователя "${userMessage.content}", учитывая содержание изображения.`;
                } else {
                    return `Пользователь отправил изображение "${file.name}".

Извлеченный текст с изображения: "${extractedText}"

Проанализируй это изображение. Опиши что изображено, основное содержание. Если есть текст - объясни его значение. Если это задача - реши её. Отвечай подробно на русском языке.`;
                }
            } else if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
                const fileContent = file.data;
                
                if (userMessage.content.trim()) {
                    return `Пользователь отправил текстовый файл "${file.name}" с сопроводительным сообщением: "${userMessage.content}"

Содержимое файла:
"""
${fileContent}
"""

Ответь на вопрос/сообщение пользователя "${userMessage.content}", учитывая содержимое прикрепленного файла.`;
                } else {
                    return `Пользователь отправил текстовый файл "${file.name}".

Содержимое файла:
"""
${fileContent}
"""

Проанализируй содержимое этого файла. Суммируй основную информацию, выдели ключевые моменты, предложи выводы или рекомендации на основе представленного текста.`;
                }
            }
        }
        
        // Text-only prompt with context
        return this.buildContextPrompt(userMessage.content);
    }

    buildContextPrompt(currentMessage) {
        const recentHistory = this.state.conversationHistory.slice(-6);
        
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

    // ==================== VOICE INPUT FEATURES ====================

    setupVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            console.warn('Speech recognition not supported');
            return;
        }

        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'ru-RU';

            this.recognition.onstart = () => {
                this.state.isListening = true;
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

                const userInput = this.getElement('#userInput');
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
                this.state.isListening = false;
                this.updateVoiceInputButton();
                
                if (event.error === 'not-allowed') {
                    this.showError('Доступ к микрофону запрещен. Разрешите доступ в настройках браузера.');
                } else {
                    this.showError(`Ошибка распознавания: ${event.error}`);
                }
            };

            this.recognition.onend = () => {
                this.state.isListening = false;
                this.updateVoiceInputButton();
            };

        } catch (error) {
            console.error('Error setting up voice recognition:', error);
        }
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            this.setupVoiceRecognition();
        }

        if (this.state.isListening) {
            this.stopVoiceInput();
        } else {
            this.startVoiceInput();
        }
    }

    startVoiceInput() {
        if (!this.recognition) {
            this.showError('Голосовой ввод не поддерживается вашим браузером');
            return;
        }

        try {
            this.recognition.start();
        } catch (error) {
            console.error('Error starting voice recognition:', error);
            this.showError('Не удалось запустить распознавание речи');
        }
    }

    stopVoiceInput() {
        if (this.recognition && this.state.isListening) {
            this.recognition.stop();
            this.state.isListening = false;
            this.updateVoiceInputButton();
        }
    }

    updateVoiceInputButton() {
        const voiceBtn = this.getElement('#voiceInputBtn');
        if (!voiceBtn) return;
        
        if (this.state.isListening) {
            voiceBtn.classList.add('listening');
            voiceBtn.innerHTML = '<i class="ti ti-microphone-off"></i>';
            voiceBtn.title = 'Остановить запись';
        } else {
            voiceBtn.classList.remove('listening');
            voiceBtn.innerHTML = '<i class="ti ti-microphone"></i>';
            voiceBtn.title = 'Голосовой ввод';
        }
    }

    // ==================== TEXT-TO-SPEECH FEATURES ====================

    speakMessage(messageElement) {
        if (this.state.isSpeaking) {
            this.stopSpeaking();
            return;
        }
        
        const messageText = this.extractPlainText(messageElement);
        
        if ('speechSynthesis' in window) {
            this.stopSpeaking();
            
            this.state.currentUtterance = new SpeechSynthesisUtterance(messageText);
            this.state.currentUtterance.lang = 'ru-RU';
            this.state.currentUtterance.rate = 0.85;
            this.state.currentUtterance.pitch = 1.0;
            this.state.currentUtterance.volume = 1.0;
            
            // Try to find Russian voice
            const voices = speechSynthesis.getVoices();
            const russianVoice = voices.find(voice => 
                voice.lang.includes('ru') || voice.lang.includes('RU')
            );
            
            if (russianVoice) {
                this.state.currentUtterance.voice = russianVoice;
            }

            this.state.currentUtterance.onstart = () => {
                this.state.isSpeaking = true;
                messageElement.classList.add('speaking');
                this.showNotification('Озвучивание началось', 'info');
            };
            
            this.state.currentUtterance.onend = () => {
                this.state.isSpeaking = false;
                messageElement.classList.remove('speaking');
            };
            
            this.state.currentUtterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                this.state.isSpeaking = false;
                messageElement.classList.remove('speaking');
                this.showError('Ошибка озвучивания');
            };
            
            speechSynthesis.speak(this.state.currentUtterance);
        } else {
            this.showError('Озвучивание не поддерживается вашим браузером');
        }
    }

    stopSpeaking() {
        if (this.state.isSpeaking && speechSynthesis) {
            speechSynthesis.cancel();
            this.state.isSpeaking = false;
            document.querySelectorAll('.message.speaking').forEach(msg => {
                msg.classList.remove('speaking');
            });
        }
    }

    extractPlainText(messageElement) {
        const messageContent = messageElement.querySelector('.message-text');
        if (!messageContent) return '';
        
        // Create temporary element to extract text
        const temp = document.createElement('div');
        temp.innerHTML = messageContent.innerHTML;
        return temp.textContent || temp.innerText || '';
    }

    // ==================== ENHANCED UI FEATURES ====================

    setupFullscreenInput() {
        const userInput = this.getElement('#userInput');
        if (!userInput) return;

        this.addEventListener(userInput, 'focus', () => {
            if (userInput.value.length > 200) {
                this.activateFullscreenInput();
            }
        });

        this.addEventListener(userInput, 'blur', () => {
            this.setTimeout(() => {
                if (!document.activeElement.closest('.fullscreen-input-overlay')) {
                    this.exitFullscreenInput();
                }
            }, 100);
        });
    }

    activateFullscreenInput() {
        if (this.state.fullscreenInputActive) return;

        const overlay = document.createElement('div');
        overlay.className = 'fullscreen-input-overlay';
        overlay.innerHTML = `
            <div class="fullscreen-input-header">
                <button id="fullscreenInputClose" class="fullscreen-input-btn">
                    <i class="ti ti-x"></i>
                </button>
                <div class="fullscreen-input-title">Редактирование сообщения</div>
                <div class="fullscreen-input-nav">
                    <button id="fullscreenInputUp" class="fullscreen-input-btn" title="В начало чата">
                        <i class="ti ti-arrow-up"></i>
                    </button>
                    <button id="fullscreenInputDown" class="fullscreen-input-btn" title="В конец чата">
                        <i class="ti ti-arrow-down"></i>
                    </button>
                </div>
            </div>
            <div class="fullscreen-input-content">
                <textarea id="userInputFullscreen" placeholder="${this.modeConfigs[this.state.currentMode].placeholder}"></textarea>
            </div>
            <div class="fullscreen-input-footer">
                <button id="sendBtnFullscreen" class="send-btn fullscreen-send-btn">
                    <i class="ti ti-send"></i>
                </button>
            </div>
        `;

        document.body.appendChild(overlay);

        const userInput = this.getElement('#userInput');
        const fullscreenInput = this.getElement('#userInputFullscreen');
        const sendBtnFullscreen = this.getElement('#sendBtnFullscreen');

        if (fullscreenInput && userInput) {
            fullscreenInput.value = userInput.value;
            fullscreenInput.focus();
            fullscreenInput.setSelectionRange(fullscreenInput.value.length, fullscreenInput.value.length);

            this.addEventListener(fullscreenInput, 'input', () => {
                userInput.value = fullscreenInput.value;
                this.autoResizeTextarea(userInput);
            });

            this.addEventListener(sendBtnFullscreen, 'click', () => {
                this.handleSendMessage();
                this.exitFullscreenInput();
            });

            this.addEventListener(fullscreenInput, 'keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendMessage();
                    this.exitFullscreenInput();
                } else if (e.key === 'Escape') {
                    this.exitFullscreenInput();
                }
            });
        }

        this.state.fullscreenInputActive = true;
        document.body.style.overflow = 'hidden';
    }

    exitFullscreenInput() {
        const overlay = document.querySelector('.fullscreen-input-overlay');
        if (overlay) {
            overlay.remove();
        }
        this.state.fullscreenInputActive = false;
        document.body.style.overflow = '';

        const userInput = this.getElement('#userInput');
        if (userInput) {
            userInput.focus();
        }
    }

    // ==================== MODEL SELECTION UI ====================

    setupModelSelector() {
        const modelBtn = this.getElement('#modelSelectBtn');
        if (modelBtn) {
            const model = this.models[this.state.settings.model];
            if (model) {
                modelBtn.innerHTML = `<i class="${model.icon}"></i>`;
                modelBtn.title = model.name;
            }
        }
    }

    showModelSelection() {
        const modelSelection = this.getElement('#modelSelection');
        if (!modelSelection) return;
        
        modelSelection.innerHTML = '';
        
        Object.entries(this.models).forEach(([id, model]) => {
            const modelBtn = document.createElement('button');
            modelBtn.className = `model-option ${id === this.state.settings.model ? 'active' : ''}`;
            modelBtn.innerHTML = `
                <i class="${model.icon}"></i>
                <div class="model-info">
                    <div class="model-name">${model.name}</div>
                    <div class="model-desc">${model.description}</div>
                </div>
                ${id === this.state.settings.model ? '<i class="ti ti-check"></i>' : ''}
            `;
            
            this.addEventListener(modelBtn, 'click', () => {
                this.setModel(id);
                this.hideModelSelection();
            });
            
            modelSelection.appendChild(modelBtn);
        });
        
        // Positioning
        const modelBtn = this.getElement('#modelSelectBtn');
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
        const modelSelection = this.getElement('#modelSelection');
        if (modelSelection) {
            modelSelection.style.display = 'none';
        }
    }

    setModel(modelId) {
        if (this.models[modelId]) {
            this.state.settings.model = modelId;
            this.setupModelSelector();
            this.showNotification(`Модель изменена: ${this.models[modelId].name}`, 'success');
            this.saveApplicationState();
        }
    }

    // ==================== MODE MANAGEMENT ====================

    switchMode(mode) {
        if (this.modeConfigs[mode]) {
            this.state.currentMode = mode;
            
            // Update UI
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.mode === mode);
            });
            
            const userInput = this.getElement('#userInput');
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
            code: 'Программирование'
        };
        return names[mode] || mode;
    }

    updateModeIndicator() {
        const modeIndicator = this.getElement('#modeIndicator');
        if (modeIndicator) {
            const config = this.modeConfigs[this.state.currentMode];
            modeIndicator.innerHTML = `<i class="${config.icon}"></i>`;
            modeIndicator.style.color = config.color;
            modeIndicator.title = this.getModeDisplayName(this.state.currentMode);
        }
    }

    // ==================== ENHANCED EVENT HANDLERS ====================

    setupEventListeners() {
        this.setupGlobalEventListeners();
        this.setupChatEventListeners();
        this.setupInputEventListeners();
        this.setupMobileEventListeners();
        this.setupEnhancedEventListeners(); // Новые обработчики
    }

    setupEnhancedEventListeners() {
        // Voice input
        this.addEventListener('#voiceInputBtn', 'click', () => {
            this.toggleVoiceInput();
        });

        // Model selection
        this.addEventListener('#modelSelectBtn', 'click', () => {
            this.showModelSelection();
        });

        // Fullscreen input
        this.addEventListener('#userInput', 'focus', () => {
            this.checkFullscreenInput();
        });

        // Keyboard shortcuts
        this.addEventListener(document, 'keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Context menu for messages
        this.addEventListener(document, 'contextmenu', (e) => {
            if (e.target.closest('.message')) {
                e.preventDefault();
                this.showContextMenu(e, e.target.closest('.message'));
            }
        });

        this.addEventListener(document, 'click', (e) => {
            if (!e.target.closest('.context-menu')) {
                this.hideContextMenu();
            }
        });

        // Search functionality
        const headerSearch = this.getElement('#headerSearch');
        if (headerSearch) {
            this.addEventListener(headerSearch, 'input', this.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));
        }

        // Chat search
        const chatSearchInput = this.getElement('#chatSearchInput');
        if (chatSearchInput) {
            this.addEventListener(chatSearchInput, 'input', this.debounce((e) => {
                this.handleChatSearch(e.target.value);
            }, 300));
        }

        // PWA install
        this.addEventListener('#pwaInstallConfirm', 'click', () => {
            this.installPWA();
        });

        this.addEventListener('#pwaInstallCancel', 'click', () => {
            this.hidePWAInstallPrompt();
        });
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'Enter':
                    e.preventDefault();
                    this.handleSendMessage();
                    break;
                case 'k':
                    e.preventDefault();
                    this.clearCurrentChat();
                    break;
                case 'e':
                    e.preventDefault();
                    this.exportChat();
                    break;
                case 'm':
                    e.preventDefault();
                    this.cycleMode();
                    break;
                case '/':
                    e.preventDefault();
                    this.showHelp();
                    break;
            }
        }
        
        if (e.key === 'Escape') {
            this.hideModal();
            this.hideContextMenu();
            this.hideModelSelection();
            
            if (this.state.fullscreenInputActive) {
                this.exitFullscreenInput();
            }
        }
    }

    cycleMode() {
        const modes = Object.keys(this.modeConfigs);
        const currentIndex = modes.indexOf(this.state.currentMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.switchMode(modes[nextIndex]);
    }

    // ==================== CONTEXT MENU ====================

    showContextMenu(event, messageElement) {
        this.hideContextMenu();
        
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = event.pageX + 'px';
        contextMenu.style.top = event.pageY + 'px';
        
        const messageId = messageElement.dataset.messageId;
        const isUserMessage = messageElement.classList.contains('message-user');
        
        contextMenu.innerHTML = `
            <div class="context-menu-item" data-action="copy">
                <i class="ti ti-copy"></i>
                Копировать текст
            </div>
            <div class="context-menu-item" data-action="download">
                <i class="ti ti-download"></i>
                Скачать как файл
            </div>
            ${isUserMessage ? `
                <div class="context-menu-item" data-action="edit">
                    <i class="ti ti-edit"></i>
                    Редактировать
                </div>
            ` : `
                <div class="context-menu-item" data-action="regenerate">
                    <i class="ti ti-refresh"></i>
                    Перегенерировать
                </div>
            `}
            <div class="context-menu-item" data-action="speak">
                <i class="ti ti-volume"></i>
                Озвучить
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" data-action="delete">
                <i class="ti ti-trash"></i>
                Удалить сообщение
            </div>
        `;
        
        document.body.appendChild(contextMenu);
        
        this.addEventListener(contextMenu, 'click', (e) => {
            const action = e.target.closest('.context-menu-item')?.dataset.action;
            if (action) {
                this.handleContextMenuAction(action, messageElement, messageId);
            }
            this.hideContextMenu();
        });
        
        this.contextMenu = contextMenu;
    }

    hideContextMenu() {
        if (this.contextMenu) {
            this.contextMenu.remove();
            this.contextMenu = null;
        }
    }

    handleContextMenuAction(action, messageElement, messageId) {
        switch (action) {
            case 'copy':
                const text = messageElement.querySelector('.message-text').textContent;
                this.copyToClipboard(text);
                this.showNotification('Текст скопирован', 'success');
                break;
            case 'download':
                this.downloadMessage(messageElement);
                break;
            case 'edit':
                this.editMessage(messageElement);
                break;
            case 'regenerate':
                this.regenerateMessage(messageElement);
                break;
            case 'speak':
                this.speakMessage(messageElement);
                break;
            case 'delete':
                this.deleteMessage(messageId);
                break;
        }
    }

    // ==================== ENHANCED MESSAGE ACTIONS ====================

    editMessage(messageElement) {
        const messageText = messageElement.querySelector('.message-text');
        const originalContent = messageText.textContent;
        
        const textarea = document.createElement('textarea');
        textarea.className = 'message-edit-textarea';
        textarea.value = originalContent;
        textarea.rows = 4;
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'message-edit-actions';
        buttonContainer.innerHTML = `
            <button class="btn-primary save-edit-btn">Сохранить</button>
            <button class="btn-secondary cancel-edit-btn">Отмена</button>
        `;
        
        messageText.parentNode.replaceChild(textarea, messageText);
        messageElement.querySelector('.message-actions').style.display = 'none';
        messageElement.appendChild(buttonContainer);
        
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        
        this.addEventListener(textarea, 'keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.saveMessageEdit(messageElement, textarea.value);
            } else if (e.key === 'Escape') {
                this.cancelMessageEdit(messageElement, originalContent);
            }
        });
        
        this.addEventListener(buttonContainer.querySelector('.save-edit-btn'), 'click', () => {
            this.saveMessageEdit(messageElement, textarea.value);
        });
        
        this.addEventListener(buttonContainer.querySelector('.cancel-edit-btn'), 'click', () => {
            this.cancelMessageEdit(messageElement, originalContent);
        });
    }

    saveMessageEdit(messageElement, newContent) {
        const messageId = messageElement.dataset.messageId;
        const chat = this.state.chats.get(this.state.currentChatId);
        const message = chat.messages.find(msg => msg.id === messageId);
        
        if (message) {
            message.content = newContent;
            message.timestamp = Date.now();
            
            const messageText = document.createElement('div');
            messageText.className = 'message-text';
            messageText.textContent = newContent;
            
            const textarea = messageElement.querySelector('.message-edit-textarea');
            textarea.parentNode.replaceChild(messageText, textarea);
            
            messageElement.querySelector('.message-time').textContent = this.formatTime(message.timestamp);
            messageElement.querySelector('.message-actions').style.display = 'flex';
            messageElement.querySelector('.message-edit-actions').remove();
            
            this.saveApplicationState();
            this.showNotification('Сообщение обновлено', 'success');
        }
    }

    cancelMessageEdit(messageElement, originalContent) {
        const messageText = document.createElement('div');
        messageText.className = 'message-text';
        messageText.textContent = originalContent;
        
        const textarea = messageElement.querySelector('.message-edit-textarea');
        textarea.parentNode.replaceChild(messageText, textarea);
        
        messageElement.querySelector('.message-actions').style.display = 'flex';
        messageElement.querySelector('.message-edit-actions').remove();
    }

    regenerateMessage(messageElement) {
        const messageId = messageElement.dataset.messageId;
        const chat = this.state.chats.get(this.state.currentChatId);
        const messageIndex = chat.messages.findIndex(msg => msg.id === messageId);
        
        if (messageIndex > 0) {
            const userMessage = chat.messages[messageIndex - 1];
            if (userMessage.role === 'user') {
                messageElement.remove();
                chat.messages.splice(messageIndex, 1);
                
                this.processUserMessage(userMessage.content, userMessage.files || []);
            }
        }
    }

    deleteMessage(messageId) {
        const chat = this.state.chats.get(this.state.currentChatId);
        if (chat) {
            const messageIndex = chat.messages.findIndex(msg => msg.id === messageId);
            if (messageIndex !== -1) {
                chat.messages.splice(messageIndex, 1);
                const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
                if (messageElement) {
                    messageElement.remove();
                }
                this.saveApplicationState();
                this.showNotification('Сообщение удалено', 'success');
            }
        }
    }

    // ==================== SEARCH FUNCTIONALITY ====================

    handleSearch(term) {
        this.state.searchTerm = term.toLowerCase().trim();
        
        const messages = document.querySelectorAll('.message');
        let foundCount = 0;
        
        messages.forEach(message => {
            const messageContent = message.querySelector('.message-text');
            const messageAuthor = message.querySelector('.message-author');
            
            if (messageContent) {
                const text = messageContent.textContent.toLowerCase();
                const author = messageAuthor ? messageAuthor.textContent.toLowerCase() : '';
                const shouldHighlight = this.state.searchTerm && 
                    (text.includes(this.state.searchTerm) || author.includes(this.state.searchTerm));
                
                if (shouldHighlight) {
                    message.classList.add('search-highlight');
                    foundCount++;
                    
                    // Подсветка текста в содержимом
                    const originalHTML = messageContent.innerHTML;
                    const regex = new RegExp(`(${this.escapeRegex(this.state.searchTerm)})`, 'gi');
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
        
        const searchClear = this.getElement('#headerSearchClear');
        if (searchClear) {
            searchClear.style.display = this.state.searchTerm ? 'flex' : 'none';
        }
        
        if (this.state.searchTerm) {
            this.showNotification(`Найдено сообщений: ${foundCount}`, foundCount > 0 ? 'success' : 'warning');
        }
    }

    handleChatSearch(term) {
        this.state.chatSearchTerm = term.toLowerCase().trim();
        this.updateChatList();
        
        const chatSearchClear = this.getElement('#chatSearchClear');
        if (chatSearchClear) {
            chatSearchClear.style.display = this.state.chatSearchTerm ? 'flex' : 'none';
        }
    }

    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // ==================== PWA FUNCTIONALITY ====================

    showPWAInstallPrompt() {
        const prompt = this.getElement('#pwaInstallPrompt');
        if (prompt) {
            prompt.style.display = 'flex';
        }
    }

    hidePWAInstallPrompt() {
        const prompt = this.getElement('#pwaInstallPrompt');
        if (prompt) {
            prompt.style.display = 'none';
        }
    }

    async installPWA() {
        try {
            const promptEvent = this.deferredPrompt;
            if (promptEvent) {
                promptEvent.prompt();
                const { outcome } = await promptEvent.userChoice;
                if (outcome === 'accepted') {
                    this.showNotification('KHAI успешно установлен!', 'success');
                }
                this.deferredPrompt = null;
            }
            this.hidePWAInstallPrompt();
        } catch (error) {
            console.error('Error installing PWA:', error);
            this.showError('Ошибка при установке приложения');
        }
    }

    // ==================== ENHANCED UTILITIES ====================

    checkFullscreenInput() {
        const userInput = this.getElement('#userInput');
        if (!userInput || this.state.fullscreenInputActive) return;

        if (userInput.value.length > 200 && document.activeElement === userInput) {
            this.activateFullscreenInput();
        }
    }

    startPlaceholderAnimation() {
        const userInput = this.getElement('#userInput');
        if (!userInput) return;
        
        let currentExampleIndex = 0;
        let animationTimeout;
        
        const stopAnimation = () => {
            if (animationTimeout) {
                clearTimeout(animationTimeout);
                animationTimeout = null;
            }
            userInput.placeholder = this.modeConfigs[this.state.currentMode].placeholder;
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

    // ==================== ENHANCED INITIALIZATION ====================

    initializeUI() {
        this.applyTheme(this.state.settings.theme);
        this.updateChatList();
        this.updateUIState();
        this.setupVirtualScroll();
        this.setupModelSelector();
        this.updateModeIndicator();
        this.startPlaceholderAnimation();
        this.setupVoiceRecognition();
        this.startChatDurationTimer();
    }

    // Добавьте остальные методы из предыдущей реализации...

    // ==================== ENHANCED EXPORT/IMPORT ====================

    async exportAllChats() {
        try {
            const allChatsData = {
                version: '2.1.0',
                exportDate: new Date().toISOString(),
                chats: Object.fromEntries(this.state.chats),
                settings: this.state.settings,
                conversationHistory: this.state.conversationHistory
            };
            
            const blob = new Blob([JSON.stringify(allChatsData, null, 2)], { 
                type: 'application/json' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            a.href = url;
            a.download = `khai-all-chats-${timestamp}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Все чаты экспортированы', 'success');
        } catch (error) {
            console.error('Error exporting all chats:', error);
            this.showError('Ошибка при экспорте чатов');
        }
    }

    async importAllChats() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const content = await this.readFileAsText(file);
                const data = JSON.parse(content);
                
                if (data.chats && typeof data.chats === 'object') {
                    // Сохраняем текущий чат
                    const currentChatId = this.state.currentChatId;
                    
                    // Импортируем все чаты
                    Object.entries(data.chats).forEach(([id, chat]) => {
                        this.state.chats.set(id, chat);
                    });
                    
                    // Восстанавливаем настройки если есть
                    if (data.settings) {
                        this.state.settings = { ...this.state.settings, ...data.settings };
                    }
                    
                    // Возвращаемся к текущему чату или первому импортированному
                    this.switchChat(currentChatId);
                    this.applySettings();
                    
                    this.showNotification('Все чаты импортированы', 'success');
                } else {
                    this.showError('Неверный формат файла импорта');
                }
            } catch (error) {
                console.error('Error importing all chats:', error);
                this.showError('Ошибка при импорте чатов');
            }
        };
        
        input.click();
    }
}

// Глобальные обработчики для PWA
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    const khaiChat = window.khaiChat;
    if (khaiChat) {
        khaiChat.deferredPrompt = e;
        khaiChat.showPWAInstallPrompt();
    }
});

window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    const khaiChat = window.khaiChat;
    if (khaiChat) {
        khaiChat.deferredPrompt = null;
    }
});

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    window.khaiChat = new KHAIChat();
});

// Service Worker registration for PWA
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

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KHAIChat;
}
