// KHAI — Advanced AI Chat Application with Puter.js Integration
// Production-ready version with enhanced AI capabilities from KHuyew
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
        this.currentModel = 'gpt-4';
        this.chatStartTime = Date.now();
        this.isListening = false;
        this.recognition = null;
        this.durationTimer = null;
        this.emojiPickerOutsideClick = this.emojiPickerOutsideClick.bind(this);
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
        this.messageQueue = [];
        this.isProcessingQueue = false;
        this.retryCount = 0;
        this.maxRetries = 3;

        // Enhanced AI models from KHuyew
        this.models = {
            'gpt-4': { 
                name: 'GPT-4 Turbo', 
                description: 'Самый продвинутый модель для сложных задач',
                icon: 'ti ti-brain',
                provider: 'openai',
                context: 128000,
                supportsImages: true,
                supportsFiles: true
            },
            'gpt-3.5-turbo': { 
                name: 'GPT-3.5 Turbo', 
                description: 'Быстрый и эффективный для повседневных задач',
                icon: 'ti ti-flame',
                provider: 'openai',
                context: 16385,
                supportsImages: false,
                supportsFiles: true
            },
            'claude-3-sonnet': { 
                name: 'Claude 3 Sonnet', 
                description: 'Отличный для креативных задач и анализа',
                icon: 'ti ti-cloud',
                provider: 'anthropic',
                context: 200000,
                supportsImages: true,
                supportsFiles: true
            },
            'claude-3-haiku': { 
                name: 'Claude 3 Haiku', 
                description: 'Быстрая и эффективная модель от Anthropic',
                icon: 'ti ti-bolt',
                provider: 'anthropic',
                context: 200000,
                supportsImages: true,
                supportsFiles: true
            },
            'gemini-pro': { 
                name: 'Gemini Pro', 
                description: 'Мощный мультимодальный модель от Google',
                icon: 'ti ti-sparkles',
                provider: 'google',
                context: 32768,
                supportsImages: true,
                supportsFiles: true
            }
        };

        this.modeConfigs = {
            normal: { 
                icon: 'ti ti-message', 
                color: '#0099ff',
                placeholder: 'Задайте вопрос или опришите задачу...',
                systemPrompt: `Ты полезный AI-ассистент KHAI. Отвечай подробно и точно на русском языке.
Основные правила:
1. Будь полезным, точным и безопасным
2. Форматируй ответы для лучшей читаемости
3. Используй markdown для структурирования
4. Предлагай дополнительные вопросы и темы
5. Будь дружелюбным и профессиональным`
            },
            creative: { 
                icon: 'ti ti-sparkles', 
                color: '#9c27b0',
                placeholder: 'Опишите креативную задачу или идею...',
                systemPrompt: `Ты креативный AI-ассистент. Будь изобретательным, предлагай нестандартные решения и идеи.
Особенности:
- Генерируй оригинальные идеи и концепции
- Предлагай несколько вариантов решений
- Используй богатый язык и метафоры
- Вдохновляй на творчество
- Будь экспрессивным но профессиональным`
            },
            code: { 
                icon: 'ti ti-code', 
                color: '#4caf50',
                placeholder: 'Опишите код который нужно написать или исправить...',
                systemPrompt: `Ты эксперт по программированию. Пиши чистый, эффективный и хорошо документированный код.
Правила:
1. Всегда предоставляй полный рабочий код
2. Добавляй комментарии и документацию
3. Объясняй логику и принятые решения
4. Предлагай альтернативные решения
5. Учитывай лучшие практики и безопасность`
            },
            analyze: { 
                icon: 'ti ti-chart-bar', 
                color: '#ff9800',
                placeholder: 'Опишите данные или ситуацию для анализа...',
                systemPrompt: `Ты аналитический AI-ассистент. Анализируй информацию системно и структурированно.
Методология:
- Разбивай сложные проблемы на части
- Используй логические цепочки
- Предоставляй выводы и рекомендации
- Учитывай разные перспективы
- Подкрепляй анализ фактами`
            }
        };

        this.placeholderExamples = [
            "Объясни квантовые вычисления простыми словами...",
            "Напиши React компонент для формы входа...",
            "Проанализируй преимущества и риски AI...",
            "Предложи идеи для мобильного приложения...",
            "Как оптимизировать производительность веб-сайта?"
        ];

        // AI configuration
        this.aiConfig = {
            maxTokens: 4000,
            temperature: 0.7,
            topP: 0.9,
            presencePenalty: 0.1,
            frequencyPenalty: 0.1
        };

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
            this.setupServiceWorker();
            this.startChatDurationTimer();
            this.setupEmojiPicker();
            this.setupModelSelector();
            this.setupScrollTracking();
            this.startPlaceholderAnimation();
            this.loadThemePreference();
            this.setupPerformanceMonitoring();
            this.setupFullscreenInput();
            this.setupMessageQueue();
            
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
            
            console.log('KHAI Chat initialized successfully');
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
                gfm: true,
                tables: true,
                sanitize: false,
                smartLists: true,
                smartypants: true
            });
        }
    }

    async setupPuterAI() {
        try {
            if (typeof puter !== 'undefined') {
                this.puterAI = puter;
                this.puterInitialized = true;
                
                // Test AI availability
                await this.testAIConnection();
                console.log('Puter.js successfully initialized');
                this.setOnlineStatus(true);
            } else {
                throw new Error('Puter.js not available');
            }
        } catch (error) {
            console.warn('Puter.js initialization failed, using fallback mode:', error);
            this.setupPuterFallback();
            this.setOnlineStatus(false);
        }
    }

    async testAIConnection() {
        try {
            // Simple test to verify AI services are available
            const testPrompt = "Привет! Ответь одним словом: 'работает'";
            const response = await this.puterAI.ai.chat(testPrompt, {
                model: 'gpt-3.5-turbo',
                maxTokens: 10
            });
            
            let result = '';
            for await (const chunk of response) {
                result += chunk.text || '';
            }
            
            if (!result.includes('работает')) {
                throw new Error('AI service test failed');
            }
            
        } catch (error) {
            console.error('AI connection test failed:', error);
            throw new Error('AI services unavailable');
        }
    }

    setupPuterFallback() {
        console.warn('Setting up Puter.js fallback mode');
        this.puterAI = {
            ai: {
                chat: async (prompt, options) => {
                    return this.mockAIResponse(prompt, options);
                }
            }
        };
    }

    async mockAIResponse(prompt, options) {
        // Enhanced mock responses based on prompt content
        const responses = {
            programming: [
                "Вот решение вашей задачи на программировании:\n\n```python\ndef main():\n    print(\"Hello, World!\")\n\nif __name__ == \"__main__\":\n    main()\n```\n\nЭто базовая структура программы на Python.",
                "Для вашего вопроса о коде:\n\n```javascript\nfunction calculateSum(a, b) {\n    return a + b;\n}\n\n// Пример использования\nconsole.log(calculateSum(5, 3)); // 8\n```\n\nФункция принимает два параметра и возвращает их сумму."
            ],
            analysis: [
                "Проанализировав вашу ситуацию, я выделяю следующие ключевые моменты:\n\n**Преимущества:**\n- Высокая эффективность\n- Удобство использования\n- Масштабируемость\n\n**Риски:**\n- Зависимость от технологии\n- Необходимость обучения\n\n**Рекомендации:**\nНачните с пилотного проекта для тестирования.",
                "На основе предоставленной информации:\n\n1. **Текущее состояние:** Стабильное\n2. **Потенциал роста:** Высокий\n3. **Ключевые факторы:** Технология, команда, рынок\n\n**Вывод:** Проект имеет хорошие перспективы при правильной реализации."
            ],
            creative: [
                "Отличная креативная задача! Вот несколько идей:\n\n🎯 **Основная концепция:** Инновационная платформа\n💡 **Ключевые особенности:**\n- Персонализированный опыт\n- Социальная интеграция\n- Gamification элементы\n\n🚀 **Уникальное предложение:** Комбинация AI и человеческого творчества",
                "Для вашего творческого проекта:\n\n**Название:** NovaSphere\n**Концепция:** Платформа для совместного творчества\n**Целевая аудитория:** Креативные профессионалы\n\n**Особенности:**\n- AI-ассистент для генерации идей\n- Коллаборативное рабочее пространство\n- Библиотека шаблонов и ресурсов"
            ],
            default: [
                "Привет! Я KHAI - ваш AI-ассистент. Рад помочь вам с любыми вопросами и задачами.\n\nМои возможности включают:\n- Ответы на вопросы и объяснения\n- Помощь с программированием\n- Креативные идеи и решения\n- Анализ информации\n\nЧем могу помочь?",
                "Спасибо за ваш вопрос! Я проанализировал вашу задачу и готов предложить решение.\n\nОсновные моменты:\n- Задача требует комплексного подхода\n- Есть несколько возможных решений\n- Рекомендую начать с базовой реализации\n\nНужны ли дополнительные детали?",
                "Понимаю вашу задачу. Вот развернутый ответ:\n\n1. **Понимание проблемы:** [суть проблемы]\n2. **Возможные решения:** [варианты]\n3. **Рекомендации:** [лучший подход]\n4. **Дальнейшие шаги:** [план действий]\n\nГотов обсудить детали!",
                "Отличный вопрос! Давайте разберем его по пунктам:\n\n📚 **Теоретическая основа:** [объяснение]\n🔧 **Практическое применение:** [примеры]\n🚀 **Продвинутые техники:** [дополнительно]\n\nНадеюсь, это поможет в вашем проекте!"
            ]
        };

        // Determine response type based on prompt content
        let responseType = 'default';
        const lowerPrompt = prompt.toLowerCase();
        
        if (lowerPrompt.includes('код') || lowerPrompt.includes('программир') || lowerPrompt.includes('функци') || lowerPrompt.includes('алгоритм')) {
            responseType = 'programming';
        } else if (lowerPrompt.includes('анализ') || lowerPrompt.includes('проанализир') || lowerPrompt.includes('оцен') || lowerPrompt.includes('сравн')) {
            responseType = 'analysis';
        } else if (lowerPrompt.includes('иде') || lowerPrompt.includes('креатив') || lowerPrompt.includes('созда') || lowerPrompt.includes('придума')) {
            responseType = 'creative';
        }

        const selectedResponses = responses[responseType] || responses.default;
        const response = selectedResponses[Math.floor(Math.random() * selectedResponses.length)];

        // Simulate streaming response
        const mockStream = {
            [Symbol.asyncIterator]: async function* () {
                const sentences = response.split(/(?<=[.!?])\s+/);
                for (const sentence of sentences) {
                    if (this.generationAborted) break;
                    
                    const words = sentence.split(' ');
                    for (const word of words) {
                        if (this.generationAborted) break;
                        await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50));
                        yield { text: word + ' ' };
                    }
                    
                    // Longer pause between sentences
                    if (!this.generationAborted) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                }
            }.bind(this)
        };

        return mockStream;
    }

    setupMessageQueue() {
        this.messageQueue = [];
        this.isProcessingQueue = false;
    }

    async addToMessageQueue(messageData) {
        this.messageQueue.push(messageData);
        if (!this.isProcessingQueue) {
            await this.processMessageQueue();
        }
    }

    async processMessageQueue() {
        if (this.isProcessingQueue || this.messageQueue.length === 0) return;
        
        this.isProcessingQueue = true;
        
        while (this.messageQueue.length > 0) {
            const messageData = this.messageQueue[0];
            try {
                await this.processSingleMessage(messageData);
                this.messageQueue.shift(); // Remove processed message
            } catch (error) {
                console.error('Error processing message from queue:', error);
                this.retryCount++;
                
                if (this.retryCount <= this.maxRetries) {
                    console.log(`Retrying message... (${this.retryCount}/${this.maxRetries})`);
                    await this.delay(1000 * this.retryCount);
                } else {
                    this.messageQueue.shift(); // Remove failed message
                    this.retryCount = 0;
                    this.handleError('Не удалось обработать сообщение после нескольких попыток', error);
                }
            }
        }
        
        this.isProcessingQueue = false;
        this.retryCount = 0;
    }

    async processSingleMessage(messageData) {
        const { message, files } = messageData;
        
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

        await this.getAIResponse(message, filesToProcess);
    }

    async setupEventListeners() {
        try {
            // Core interaction listeners
            this.addEventListener(document.getElementById('sendBtn'), 'click', () => this.handleSendButtonClick());
            
            const userInput = document.getElementById('userInput');
            this.addEventListener(userInput, 'keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendButtonClick();
                }
            });

            this.addEventListener(userInput, 'input', () => {
                this.autoResizeTextarea(userInput);
                this.toggleClearInputButton();
                this.handleInputChange();
                this.checkFullscreenInput();
            });

            this.addEventListener(document.getElementById('clearInputBtn'), 'click', () => {
                userInput.value = '';
                this.autoResizeTextarea(userInput);
                this.toggleClearInputButton();
                userInput.focus();
            });

            // Mode selection
            document.querySelectorAll('.mode-btn').forEach(btn => {
                this.addEventListener(btn, 'click', (e) => {
                    this.setMode(e.currentTarget.dataset.mode);
                });
            });

            // File handling
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

            // UI controls
            this.addEventListener(document.getElementById('emojiBtn'), 'click', (e) => {
                this.toggleEmojiPicker(e.currentTarget);
            });

            this.addEventListener(document.getElementById('clearChatBtn'), 'click', () => {
                this.clearChat();
            });

            this.addEventListener(document.getElementById('exportBtn'), 'click', () => {
                this.exportChat();
            });

            this.addEventListener(document.getElementById('helpBtn'), 'click', () => {
                this.showHelp();
            });

            this.addEventListener(document.getElementById('themeToggle'), 'click', () => {
                this.toggleTheme();
            });

            this.addEventListener(document.getElementById('fullscreenToggle'), 'click', () => {
                this.toggleFullscreen();
            });

            this.addEventListener(document.getElementById('modelSelectBtn'), 'click', () => {
                this.showModelSelection();
            });

            // Navigation
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

            this.addEventListener(document.getElementById('quickSettings'), 'click', () => {
                this.showSettings();
            });

            // Scroll navigation
            this.addEventListener(document.getElementById('scrollToTop'), 'click', () => {
                this.scrollToTop();
            });

            this.addEventListener(document.getElementById('scrollToLastAI'), 'click', () => {
                this.scrollToLastAIMessage();
            });

            this.addEventListener(document.getElementById('scrollToBottom'), 'click', () => {
                this.scrollToBottom(true);
            });

            // Search functionality
            const headerSearch = document.getElementById('headerSearch');
            this.addEventListener(headerSearch, 'input', this.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));

            this.addEventListener(document.getElementById('headerSearchClear'), 'click', () => {
                headerSearch.value = '';
                this.handleSearch('');
                headerSearch.focus();
            });

            // Global event listeners
            this.addEventListener(document, 'keydown', (e) => {
                this.handleKeyboardShortcuts(e);
            });

            this.addEventListener(window, 'online', () => {
                this.setOnlineStatus(true);
            });

            this.addEventListener(window, 'offline', () => {
                this.setOnlineStatus(false);
            });

            this.addEventListener(window, 'resize', this.debounce(() => {
                this.handleResize();
            }, 250));

            // Drag and drop
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

            // Scroll tracking
            const messagesContainer = document.getElementById('messagesContainer');
            this.addEventListener(messagesContainer, 'scroll', this.debounce(() => {
                this.handleScroll();
            }, 100));

            // PWA installation
            this.addEventListener(document.getElementById('pwaInstallConfirm'), 'click', () => {
                this.installPWA();
            });

            this.addEventListener(document.getElementById('pwaInstallCancel'), 'click', () => {
                this.hidePWAInstallPrompt();
            });

            // Chat management
            this.addEventListener(document.getElementById('deleteAllChatsBtn'), 'click', () => {
                this.deleteAllChats();
            });

            this.setupTouchEvents();

        } catch (error) {
            console.error('Error setting up event listeners:', error);
            this.showError('Ошибка настройки приложения');
        }
    }

    setupFullscreenInput() {
        const userInput = document.getElementById('userInput');
        if (!userInput) return;

        this.addEventListener(userInput, 'focus', () => {
            if (userInput.value.length > 200) {
                this.activateFullscreenInput();
            }
        });
    }

    checkFullscreenInput() {
        const userInput = document.getElementById('userInput');
        if (!userInput || this.fullscreenInputActive) return;

        if (userInput.value.length > 200 && document.activeElement === userInput) {
            this.activateFullscreenInput();
        }
    }

    activateFullscreenInput() {
        if (this.fullscreenInputActive) return;

        const overlay = document.createElement('div');
        overlay.className = 'fullscreen-input-overlay';
        overlay.innerHTML = `
            <div class="fullscreen-input-header">
                <button id="fullscreenInputClose" class="fullscreen-input-btn">
                    <i class="ti ti-x"></i>
                </button>
                <div class="fullscreen-input-title">Редактирование сообщения</div>
            </div>
            <div class="fullscreen-input-content">
                <textarea id="userInputFullscreen" placeholder="${this.modeConfigs[this.currentMode].placeholder}"></textarea>
            </div>
            <div class="fullscreen-input-footer">
                <button id="sendBtnFullscreen" class="send-btn fullscreen-send-btn">
                    <i class="ti ti-send"></i>
                </button>
            </div>
        `;

        document.body.appendChild(overlay);

        const userInput = document.getElementById('userInput');
        const fullscreenInput = document.getElementById('userInputFullscreen');
        const sendBtnFullscreen = document.getElementById('sendBtnFullscreen');

        if (fullscreenInput && userInput) {
            fullscreenInput.value = userInput.value;
            fullscreenInput.focus();
            fullscreenInput.setSelectionRange(fullscreenInput.value.length, fullscreenInput.value.length);

            this.addEventListener(fullscreenInput, 'input', () => {
                userInput.value = fullscreenInput.value;
                this.autoResizeTextarea(userInput);
            });

            this.addEventListener(sendBtnFullscreen, 'click', () => {
                this.handleSendButtonClick();
                this.exitFullscreenInput();
            });

            this.addEventListener(fullscreenInput, 'keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendButtonClick();
                    this.exitFullscreenInput();
                } else if (e.key === 'Escape') {
                    this.exitFullscreenInput();
                }
            });

            this.addEventListener(document.getElementById('fullscreenInputClose'), 'click', () => {
                this.exitFullscreenInput();
            });
        }

        this.fullscreenInputActive = true;
        document.body.style.overflow = 'hidden';
    }

    exitFullscreenInput() {
        const overlay = document.querySelector('.fullscreen-input-overlay');
        if (overlay) {
            overlay.remove();
        }
        this.fullscreenInputActive = false;
        document.body.style.overflow = '';

        const userInput = document.getElementById('userInput');
        if (userInput) {
            userInput.focus();
        }
    }

    setupTouchEvents() {
        let startX = 0;
        this.addEventListener(document, 'touchstart', (e) => {
            startX = e.touches[0].clientX;
        });

        this.addEventListener(document, 'touchmove', (e) => {
            if (!startX) return;
            
            const currentX = e.touches[0].clientX;
            const diffX = startX - currentX;
            
            if (diffX < -50 && startX < 50) {
                this.toggleSidebarMenu();
                startX = 0;
            }
        });
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
        const chatNavigation = document.getElementById('chatNavigation');

        if (!scrollToLastAI || !scrollToBottomBtn || !chatNavigation) return;

        const aiMessages = document.querySelectorAll('.message-assistant:not(.typing-indicator)');
        const hasAIMessages = aiMessages.length > 0;
        
        scrollToLastAI.classList.toggle('active', !this.isAtBottom && hasAIMessages);
        scrollToLastAI.disabled = !hasAIMessages;
        
        scrollToBottomBtn.classList.toggle('active', !this.isAtBottom);
        scrollToBottomBtn.disabled = this.isAtBottom;
        
        if (this.isAtBottom) {
            chatNavigation.classList.remove('visible');
        } else {
            chatNavigation.classList.add('visible');
        }
    }

    handleSendButtonClick() {
        if (this.isGenerating) {
            this.stopGeneration();
        } else {
            this.sendMessage();
        }
    }

    handleInputChange() {
        const hasInput = document.getElementById('userInput')?.value.trim().length > 0 || this.attachedFiles.length > 0;
        
        if (this.isGenerating && hasInput) {
            this.updateSendButton(false);
        }
    }

    async sendMessage() {
        if (this.isGenerating) {
            this.showNotification('Подождите, идет генерация ответа...', 'warning');
            return;
        }

        const userInput = document.getElementById('userInput');
        const message = userInput.value.trim();
        const files = this.attachedFiles;

        if (!message && files.length === 0) {
            this.showNotification('Введите сообщение или прикрепите файл', 'warning');
            return;
        }

        if (message.length > 8000) {
            this.showError('Сообщение слишком длинное. Максимум 8000 символов.');
            return;
        }

        try {
            this.isGenerating = true;
            this.generationAborted = false;
            this.updateSendButton(true);

            // Add to message queue for processing
            await this.addToMessageQueue({ message, files });

        } catch (error) {
            console.error('Error sending message:', error);
            this.handleError('Не удалось отправить сообщение', error);
        } finally {
            if (!this.generationAborted) {
                this.isGenerating = false;
                this.updateSendButton(false);
                this.saveChatHistory();
                this.updateUI();
            }
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
            this.handleError('Ошибка при получении ответа от ИИ', error);
        }
    }

    async buildPrompt(userMessage, files) {
        if (files.length > 0) {
            const file = files[0];
            
            if (file.type.startsWith('image/')) {
                if (!this.puterAI || typeof this.puterAI.ai?.img2txt !== 'function') {
                    throw new Error('Функция анализа изображений недоступна');
                }
                
                const extractedText = await this.puterAI.ai.img2txt(file.data);
                
                if (userMessage.trim()) {
                    return `Пользователь отправил изображение "${file.name}" с сопроводительным сообщением: "${userMessage}"

Извлеченный текст с изображения: "${extractedText}"

Ответь на вопрос/сообщение пользователя "${userMessage}", учитывая содержание изображения. Если на изображении есть дополнительная информация (текст, задачи, диаграммы и т.д.) - используй её для полного ответа. Отвечай одним целостным сообщением на русском языке.`;
                } else {
                    return `Пользователь отправил изображение "${file.name}".

Извлеченный текст с изображения: "${extractedText}"

Проанализируй это изображение. Опиши что изображено, основное содержание. Если есть текст - объясни его значение. Если это задача - реши её. Отвечай подробно на русском языке.`;
                }
            } else if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
                const fileContent = file.data;
                
                if (userMessage.trim()) {
                    return `Пользователь отправил текстовый файл "${file.name}" с сопроводительным сообщением: "${userMessage}"

Содержимое файла:
"""
${fileContent}
"""

Ответь на вопрос/сообщение пользователя "${userMessage}", учитывая содержимое прикрепленного файла. Проанализируй текст и дай развернутый ответ на основе предоставленной информации. Отвечай на русском языке.`;
                } else {
                    return `Пользователь отправил текстовый файл "${file.name}".

Содержимое файла:
"""
${fileContent}
"""

Проанализируй содержимое этого файла. Суммируй основную информацию, выдели ключевые моменты, предложи выводы или рекомендации на основе представленного текста. Отвечай подробно на русском языке.`;
                }
            }
        } else {
            return this.buildContextPrompt(userMessage);
        }
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

    async callAIService(prompt) {
        if (!this.puterAI || typeof this.puterAI.ai?.chat !== 'function') {
            throw new Error('Функция чата недоступна');
        }
        
        const modelConfig = this.models[this.currentModel];
        
        const options = {
            model: this.currentModel,
            systemPrompt: this.modeConfigs[this.currentMode].systemPrompt,
            stream: true,
            maxTokens: this.aiConfig.maxTokens,
            temperature: this.aiConfig.temperature,
            topP: this.aiConfig.topP
        };
        
        return await this.puterAI.ai.chat(prompt, options);
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
                this.handleError('Ошибка при обработке ответа ИИ', error);
            }
        } finally {
            this.activeStreamingMessage = null;
            this.currentStreamController = null;
        }
    }

    delay(ms) {
        return new Promise(resolve => this.setTimeout(resolve, ms));
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
        this.addDownloadButtons(messageElement, fullContent);
        
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
                    <i class="ti ${this.getFileIcon(file.type)}"></i>
                    <span>${this.escapeHtml(file.name)}</span>
                    ${file.type.startsWith('image/') ? `<img src="${file.data}" alt="${this.escapeHtml(file.name)}" class="file-preview">` : ''}
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

    attachMessageHandlers(messageElement) {
        this.attachCopyButtons(messageElement);
        
        const copyBtn = messageElement.querySelector('.copy-message-btn');
        if (copyBtn) {
            this.addEventListener(copyBtn, 'click', () => {
                const messageText = messageElement.querySelector('.message-text').textContent;
                this.copyToClipboard(messageText);
                this.showNotification('Сообщение скопировано', 'success');
            });
        }
        
        const editBtn = messageElement.querySelector('.edit-message-btn');
        if (editBtn) {
            this.addEventListener(editBtn, 'click', () => {
                this.editMessage(messageElement);
            });
        }
        
        const regenerateBtn = messageElement.querySelector('.regenerate-btn');
        if (regenerateBtn) {
            this.addEventListener(regenerateBtn, 'click', () => {
                this.regenerateMessage(messageElement);
            });
        }
        
        const downloadBtn = messageElement.querySelector('.download-message-btn');
        if (downloadBtn) {
            this.addEventListener(downloadBtn, 'click', () => {
                this.downloadMessage(messageElement);
            });
        }
        
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

    addDownloadButtons(messageElement, content) {
        const messageContent = messageElement.querySelector('.message-content');
        if (!messageContent) return;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';
        
        actionsDiv.innerHTML = `
            <button class="message-action-btn copy-message-btn" title="Копировать сообщение">
                <i class="ti ti-copy"></i>
            </button>
            <button class="message-action-btn download-message-btn" title="Скачать как файл">
                <i class="ti ti-download"></i>
            </button>
            <button class="message-action-btn speak-message-btn" title="Озвучить сообщение">
                <i class="ti ti-volume"></i>
            </button>
            ${messageElement.classList.contains('message-assistant') ? `
                <button class="message-action-btn regenerate-btn" title="Перегенерировать ответ">
                    <i class="ti ti-refresh"></i>
                </button>
            ` : `
                <button class="message-action-btn edit-message-btn" title="Редактировать сообщение">
                    <i class="ti ti-edit"></i>
                </button>
            `}
        `;
        
        messageContent.appendChild(actionsDiv);
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
        const chat = this.chats.get(this.currentChatId);
        const message = chat.find(msg => msg.id === messageId);
        
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
            
            this.saveChatHistory();
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
        const chat = this.chats.get(this.currentChatId);
        const messageIndex = chat.findIndex(msg => msg.id === messageId);
        
        if (messageIndex > 0) {
            const userMessage = chat[messageIndex - 1];
            if (userMessage.role === 'user') {
                messageElement.remove();
                chat.splice(messageIndex, 1);
                
                this.processUserMessage(userMessage.content, userMessage.files || []);
            }
        }
    }

    downloadMessage(messageElement) {
        const messageText = messageElement.querySelector('.message-text').textContent;
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const blob = new Blob([messageText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `message-${timestamp}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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

    setMode(mode) {
        if (this.modeConfigs[mode]) {
            this.currentMode = mode;
            
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
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
            code: 'Программирование',
            analyze: 'Анализ'
        };
        return names[mode] || mode;
    }

    updateModeIndicator() {
        const modeIndicator = document.getElementById('modeIndicator');
        if (modeIndicator) {
            const config = this.modeConfigs[this.currentMode];
            modeIndicator.innerHTML = `<i class="${config.icon}"></i>`;
            modeIndicator.style.color = config.color;
            modeIndicator.title = this.getModeDisplayName(this.currentMode);
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

    handleFileUpload(files) {
        if (!files || files.length === 0) return;
        
        Array.from(files).forEach(file => {
            if (this.attachedFiles.length >= 5) {
                this.showError('Можно прикрепить не более 5 файлов');
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const fileData = {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: e.target.result,
                    lastModified: file.lastModified
                };
                
                this.attachedFiles.push(fileData);
                this.updateAttachedFilesDisplay();
                this.showNotification(`Файл "${file.name}" прикреплен`, 'success');
            };
            
            reader.onerror = () => {
                this.showError(`Ошибка чтения файла: ${file.name}`);
            };
            
            if (file.type.startsWith('image/')) {
                reader.readAsDataURL(file);
            } else if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
                reader.readAsText(file);
            } else {
                reader.readAsDataURL(file);
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
                <i class="ti ${this.getFileIcon(file.type)}"></i>
                <span class="file-name">${this.escapeHtml(file.name)}</span>
                <button class="remove-file-btn" data-index="${index}">
                    <i class="ti ti-x"></i>
                </button>
                ${file.type.startsWith('image/') ? `<img src="${file.data}" alt="${this.escapeHtml(file.name)}" class="file-preview">` : ''}
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

    getFileIcon(fileType) {
        if (fileType.startsWith('image/')) return 'ti-photo';
        if (fileType.startsWith('audio/')) return 'ti-music';
        if (fileType.startsWith('video/')) return 'ti-video';
        if (fileType.includes('pdf')) return 'ti-file-text';
        if (fileType.includes('word') || fileType.includes('document')) return 'ti-file-text';
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'ti-file-spreadsheet';
        if (fileType.includes('zip') || fileType.includes('archive')) return 'ti-file-zip';
        return 'ti-file';
    }

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

    setupEmojiPicker() {
        this.addEventListener(document, 'click', this.emojiPickerOutsideClick);
    }

    toggleEmojiPicker(button) {
        const picker = document.getElementById('emojiPicker');
        if (!picker) return;
        
        if (picker.style.display === 'block') {
            picker.style.display = 'none';
        } else {
            picker.style.display = 'block';
            
            const rect = button.getBoundingClientRect();
            picker.style.top = (rect.bottom + window.scrollY + 5) + 'px';
            picker.style.left = (rect.left + window.scrollX) + 'px';
            
            this.populateEmojiPicker();
        }
    }

    emojiPickerOutsideClick(event) {
        const picker = document.getElementById('emojiPicker');
        const button = document.getElementById('emojiBtn');
        
        if (picker && picker.style.display === 'block' && 
            !picker.contains(event.target) && 
            !button.contains(event.target)) {
            picker.style.display = 'none';
        }
    }

    populateEmojiPicker() {
        const picker = document.getElementById('emojiPicker');
        if (!picker) return;
        
        const emojiCategories = {
            'Часто используемые': ['😀', '😂', '🤔', '👍', '❤️', '🔥', '🎉', '🙏'],
            'Эмоции': ['😊', '😍', '🤩', '😎', '🥳', '😢', '😡', '🤯'],
            'Жесты': ['👋', '🤝', '✌️', '🤟', '👌', '🤙', '👏', '🙌'],
            'Предметы': ['💻', '📱', '🎧', '📚', '✏️', '🎨', '⚡', '🔑'],
            'Символы': ['⭐', '🌈', '🎯', '💡', '🔔', '🎵', '📌', '📍']
        };
        
        picker.innerHTML = '';
        
        Object.entries(emojiCategories).forEach(([category, emojis]) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'emoji-category';
            
            const categoryTitle = document.createElement('div');
            categoryTitle.className = 'emoji-category-title';
            categoryTitle.textContent = category;
            categoryDiv.appendChild(categoryTitle);
            
            const emojisDiv = document.createElement('div');
            emojisDiv.className = 'emoji-grid';
            
            emojis.forEach(emoji => {
                const emojiSpan = document.createElement('span');
                emojiSpan.className = 'emoji';
                emojiSpan.textContent = emoji;
                emojiSpan.title = emoji;
                
                this.addEventListener(emojiSpan, 'click', () => {
                    this.insertEmoji(emoji);
                    picker.style.display = 'none';
                });
                
                emojisDiv.appendChild(emojiSpan);
            });
            
            categoryDiv.appendChild(emojisDiv);
            picker.appendChild(categoryDiv);
        });
    }

    insertEmoji(emoji) {
        const userInput = document.getElementById('userInput');
        if (!userInput) return;
        
        const start = userInput.selectionStart;
        const end = userInput.selectionEnd;
        const text = userInput.value;
        
        userInput.value = text.substring(0, start) + emoji + text.substring(end);
        userInput.selectionStart = userInput.selectionEnd = start + emoji.length;
        userInput.focus();
        
        this.autoResizeTextarea(userInput);
        this.toggleClearInputButton();
    }

    autoResizeTextarea(textarea) {
        if (!textarea) return;
        
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 150);
        textarea.style.height = newHeight + 'px';
        
        const inputSection = document.getElementById('inputSection');
        if (inputSection) {
            inputSection.style.height = 'auto';
            inputSection.style.minHeight = Math.max(newHeight + 40, 80) + 'px';
        }
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
                <p>Продвинутый AI-ассистент с интеграцией Puter.js. Готов помочь с:</p>
                <ul>
                    <li><i class="ti ti-message"></i> Ответами на вопросы и обсуждениями</li>
                    <li><i class="ti ti-code"></i> Написанием и анализом кода</li>
                    <li><i class="ti ti-sparkles"></i> Креативными задачами и идеями</li>
                    <li><i class="ti ti-chart-bar"></i> Анализом информации и данных</li>
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

    async exportChat() {
        try {
            const chatData = this.chats.get(this.currentChatId) || [];
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

    updateLastAIMessageIndex() {
        const aiMessages = document.querySelectorAll('.message-assistant:not(.typing-indicator)');
        if (aiMessages.length > 0) {
            this.lastAIMessageIndex = Array.from(aiMessages).length - 1;
        } else {
            this.lastAIMessageIndex = -1;
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

    showHelp() {
        const helpContent = `
            <div class="help-content">
                <h2>📚 Помощь по KHAI</h2>
                
                <div class="help-section">
                    <h3>🔧 Основные возможности</h3>
                    <ul>
                        <li><strong>Мультимодальный AI:</strong> Работа с текстом, кодом и файлами через Puter.js</li>
                        <li><strong>Разные модели:</strong> GPT-4, Claude, Gemini и другие</li>
                        <li><strong>Режимы работы:</strong> Обычный, Креативный, Программирование, Анализ</li>
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
                
                <div class="help-section">
                    <h3>🎯 Советы по использованию</h3>
                    <ul>
                        <li>Будьте конкретны в запросах для лучших результатов</li>
                        <li>Используйте соответствующий режим для разных типов задач</li>
                        <li>Прикрепляйте файлы для анализа изображений и текста</li>
                        <li>Используйте кнопку "Перегенерировать" для получения альтернативных ответов</li>
                        <li>Экспортируйте важные беседы для сохранения истории</li>
                    </ul>
                </div>
            </div>
        `;
        
        this.showModal('Помощь по KHAI', helpContent);
    }

    showSettings() {
        const settingsContent = `
            <div class="settings-content">
                <div class="setting-group">
                    <h3>Настройки интерфейса</h3>
                    
                    <div class="setting-item">
                        <label for="autoScroll">Автопрокрутка к новым сообщениям</label>
                        <div class="checkbox-wrapper">
                            <input type="checkbox" id="autoScroll" ${this.autoScrollEnabled ? 'checked' : ''}>
                            <span class="checkmark"></span>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <label for="themeSelect">Тема оформления</label>
                        <select id="themeSelect" class="styled-select">
                            <option value="auto">Автоматически</option>
                            <option value="light">Светлая</option>
                            <option value="dark">Темная</option>
                        </select>
                    </div>
                </div>
                
                <div class="setting-group">
                    <h3>Настройки AI</h3>
                    
                    <div class="setting-item">
                        <label for="defaultModel">Модель по умолчанию</label>
                        <select id="defaultModel" class="styled-select">
                            ${Object.entries(this.models).map(([id, model]) => 
                                `<option value="${id}" ${id === this.currentModel ? 'selected' : ''}>${model.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="setting-item">
                        <label for="defaultMode">Режим по умолчанию</label>
                        <select id="defaultMode" class="styled-select">
                            ${Object.entries(this.modeConfigs).map(([id, config]) => 
                                `<option value="${id}" ${id === this.currentMode ? 'selected' : ''}>${this.getModeDisplayName(id)}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="setting-group">
                    <h3>Управление данными</h3>
                    
                    <div class="setting-item">
                        <label>Экспорт всех данных</label>
                        <button class="btn-secondary" id="exportAllData">Экспортировать</button>
                    </div>
                    
                    <div class="setting-item">
                        <label>Очистить все данные</label>
                        <button class="btn-danger" id="clearAllData">Очистить</button>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal('Настройки', settingsContent, 'large');
        
        this.attachSettingsHandlers();
    }

    attachSettingsHandlers() {
        const autoScroll = document.getElementById('autoScroll');
        if (autoScroll) {
            this.addEventListener(autoScroll, 'change', (e) => {
                this.autoScrollEnabled = e.target.checked;
                this.saveSettings();
            });
        }
        
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'auto';
            themeSelect.value = currentTheme;
            
            this.addEventListener(themeSelect, 'change', (e) => {
                this.setTheme(e.target.value);
                this.saveSettings();
            });
        }
        
        const defaultModel = document.getElementById('defaultModel');
        if (defaultModel) {
            this.addEventListener(defaultModel, 'change', (e) => {
                this.currentModel = e.target.value;
                this.setupModelSelector();
                this.saveSettings();
            });
        }
        
        const defaultMode = document.getElementById('defaultMode');
        if (defaultMode) {
            this.addEventListener(defaultMode, 'change', (e) => {
                this.setMode(e.target.value);
                this.saveSettings();
            });
        }
        
        const exportAllData = document.getElementById('exportAllData');
        if (exportAllData) {
            this.addEventListener(exportAllData, 'click', () => {
                this.exportAllData();
            });
        }
        
        const clearAllData = document.getElementById('clearAllData');
        if (clearAllData) {
            this.addEventListener(clearAllData, 'click', () => {
                if (confirm('Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.')) {
                    this.clearAllData();
                }
            });
        }
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('khai-theme', theme);
    }

    loadThemePreference() {
        const savedTheme = localStorage.getItem('khai-theme') || 'auto';
        this.setTheme(savedTheme);
    }

    saveSettings() {
        const settings = {
            autoScroll: this.autoScrollEnabled,
            theme: document.documentElement.getAttribute('data-theme'),
            defaultModel: this.currentModel,
            defaultMode: this.currentMode
        };
        
        localStorage.setItem('khai-settings', JSON.stringify(settings));
        this.showNotification('Настройки сохранены', 'success');
    }

    exportAllData() {
        try {
            const allData = {
                version: '2.1.0',
                exportDate: new Date().toISOString(),
                settings: {
                    autoScroll: this.autoScrollEnabled,
                    theme: document.documentElement.getAttribute('data-theme'),
                    defaultModel: this.currentModel,
                    defaultMode: this.currentMode
                },
                chats: Object.fromEntries(this.chats),
                conversationHistory: this.conversationHistory
            };
            
            const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            a.href = url;
            a.download = `khai-backup-${timestamp}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Все данные экспортированы', 'success');
        } catch (error) {
            console.error('Error exporting all data:', error);
            this.showError('Ошибка при экспорте данных');
        }
    }

    clearAllData() {
        localStorage.clear();
        this.chats.clear();
        this.conversationHistory = [];
        this.currentChatId = 'main-chat';
        this.chats.set(this.currentChatId, []);
        
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
        
        this.showWelcomeMessage();
        this.showNotification('Все данные очищены', 'success');
    }

    showModal(title, content, size = 'medium') {
        this.hideModal();
        
        const modal = document.createElement('div');
        modal.className = `modal-overlay ${size}`;
        modal.id = 'modalOverlay';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" id="modalClose">
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
                this.hideModal();
            }
        });
        
        this.addEventListener(document.getElementById('modalClose'), 'click', () => {
            this.hideModal();
        });
        
        this.addEventListener(document, 'keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideModal();
            }
        });
    }

    hideModal() {
        const existingModal = document.getElementById('modalOverlay');
        if (existingModal) {
            existingModal.remove();
        }
    }

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
        const statusIndicator = document.getElementById('connectionStatus');
        
        if (statusIndicator) {
            if (online) {
                statusIndicator.className = 'connection-status';
                statusIndicator.innerHTML = '<i class="ti ti-wifi"></i><span>Онлайн</span>';
                statusIndicator.title = 'Подключено к AI сервисам';
            } else {
                statusIndicator.className = 'connection-status offline';
                statusIndicator.innerHTML = '<i class="ti ti-wifi-off"></i><span>Офлайн</span>';
                statusIndicator.title = 'Нет подключения к AI сервисам';
            }
        }
    }

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

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    }

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
            }
        }
    }

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
                    
                    const originalHTML = messageContent.innerHTML;
                    const regex = new RegExp(`(${this.escapeRegex(this.searchTerm)})`, 'gi');
                    messageContent.innerHTML = originalHTML.replace(regex, '<mark class="search-match">$1</mark>');
                    
                    this.attachCopyButtons(messageContent);
                } else {
                    message.classList.remove('search-highlight');
                    
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

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'Enter':
                    e.preventDefault();
                    this.handleSendButtonClick();
                    break;
                case 'k':
                    e.preventDefault();
                    this.clearChat();
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
            this.hideModelSelection();
            
            const emojiPicker = document.getElementById('emojiPicker');
            if (emojiPicker) {
                emojiPicker.style.display = 'none';
            }
            
            if (this.fullscreenInputActive) {
                this.exitFullscreenInput();
            }
        }
    }

    cycleMode() {
        const modes = Object.keys(this.modeConfigs);
        const currentIndex = modes.indexOf(this.currentMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.setMode(modes[nextIndex]);
    }

    handlePaste(event) {
        const items = event.clipboardData?.items;
        if (!items) return;
        
        for (let item of items) {
            if (item.type.indexOf('image') !== -1) {
                event.preventDefault();
                const file = item.getAsFile();
                if (file) {
                    this.handleFileUpload([file]);
                }
                break;
            }
        }
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

    setupServiceWorker() {
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
    }

    setupPerformanceMonitoring() {
        if ('performance' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'longtask') {
                        console.warn('Long task detected:', entry);
                    }
                }
            });
            
            observer.observe({ entryTypes: ['longtask'] });
        }
        
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
                    console.warn('High memory usage detected');
                    this.cleanupOldMessages();
                }
            }, 30000);
        }
    }

    cleanupOldMessages() {
        const messages = document.querySelectorAll('.message');
        if (messages.length > 100) {
            const messagesToRemove = Array.from(messages).slice(0, messages.length - 100);
            messagesToRemove.forEach(msg => msg.remove());
        }
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
    }

    addToConversationHistory(role, content, files = []) {
        this.conversationHistory.push({
            role,
            content,
            files: files.map(f => ({ name: f.name, type: f.type })),
            timestamp: Date.now()
        });
        
        if (this.conversationHistory.length > 50) {
            this.conversationHistory = this.conversationHistory.slice(-50);
        }
    }

    async loadChatHistory() {
        try {
            const saved = localStorage.getItem('khai-chats');
            if (saved) {
                const data = JSON.parse(saved);
                this.chats = new Map(Object.entries(data.chats || {}));
                this.currentChatId = data.currentChatId || 'main-chat';
                this.conversationHistory = data.conversationHistory || [];
                this.currentModel = data.currentModel || 'gpt-4';
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

    showPWAInstallPrompt() {
        const prompt = document.getElementById('pwaInstallPrompt');
        if (prompt) {
            prompt.style.display = 'flex';
        }
    }

    hidePWAInstallPrompt() {
        const prompt = document.getElementById('pwaInstallPrompt');
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
        
        this.hideModal();
        
        console.log('KHAI Chat destroyed');
    }
}

// Global PWA installation handling
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    const khaiChat = window.khaiChat;
    if (khaiChat && khaiChat.isInitialized) {
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

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    window.khaiChat = new KHAIChat();
});

window.addEventListener('beforeunload', () => {
    if (window.khaiChat) {
        window.khaiChat.destroy();
    }
});

// Global error handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
