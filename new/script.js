// KHAI - Advanced AI Chat Application
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

        // Расширенные модели
        this.models = {
            'gpt-4': { 
                name: 'GPT-4 Turbo', 
                description: 'Самый продвинутый модель для сложных задач',
                icon: 'ti-brain'
            },
            'gpt-3.5': { 
                name: 'GPT-3.5 Turbo', 
                description: 'Быстрый и эффективный для повседневных задач',
                icon: 'ti-flame'
            },
            'claude-3': { 
                name: 'Claude 3', 
                description: 'Отличный для креативных задач и анализа',
                icon: 'ti-cloud'
            },
            'gemini-pro': { 
                name: 'Gemini Pro', 
                description: 'Мощный мультимодальный модель от Google',
                icon: 'ti-sparkles'
            },
            'gpt-5-nano': { 
                name: 'GPT-5 Nano', 
                description: 'Быстрая и эффективная модель для повседневных задач',
                icon: 'ti-bolt'
            },
            'o3-mini': { 
                name: 'O3 Mini', 
                description: 'Продвинутая модель с улучшенными возможностями рассуждения',
                icon: 'ti-cpu'
            },
            'claude-sonnet': { 
                name: 'Claude Sonnet', 
                description: 'Мощная модель от Anthropic для сложных задач и анализа',
                icon: 'ti-shield'
            },
            'deepseek-chat': { 
                name: 'DeepSeek Chat', 
                description: 'Универсальная модель для общения и решения задач',
                icon: 'ti-search'
            },
            'deepseek-reasoner': { 
                name: 'DeepSeek Reasoner', 
                description: 'Специализированная модель для сложных логических рассуждений',
                icon: 'ti-logic-and'
            },
            'gemini-2.0-flash': { 
                name: 'Gemini 2.0 Flash', 
                description: 'Новейшая быстрая модель от Google с улучшенными возможностями',
                icon: 'ti-flash'
            },
            'gemini-1.5-flash': { 
                name: 'Gemini 1.5 Flash', 
                description: 'Быстрая и эффективная модель от Google для различных задач',
                icon: 'ti-zap'
            },
            'grok-beta': { 
                name: 'xAI Grok', 
                description: 'Модель от xAI с уникальным характером и остроумными ответами',
                icon: 'ti-message-circle'
            }
        };

        this.modeConfigs = {
            normal: { 
                icon: 'ti-message', 
                color: '#0099ff',
                placeholder: 'Задайте вопрос или опишите задачу...',
                systemPrompt: 'Ты полезный AI-ассистент. Отвечай подробно и точно на русском языке.'
            },
            creative: { 
                icon: 'ti-sparkles', 
                color: '#9c27b0',
                placeholder: 'Опишите креативную задачу или идею...',
                systemPrompt: 'Ты креативный AI-ассистент. Будь изобретательным, предлагай нестандартные решения и идеи. Отвечай на русском языке.'
            },
            voice: { 
                icon: 'ti-microphone', 
                color: '#ff6b00',
                placeholder: 'Опишите что нужно сгенерировать в аудио формате...',
                systemPrompt: 'Ты специализируешься на создании и анализе аудио контента. Отвечай на русском языке.'
            },
            image: { 
                icon: 'ti-photo', 
                color: '#00c853',
                placeholder: 'Опишите изображение которое нужно сгенерировать...',
                systemPrompt: 'Ты специализируешься на создании и анализе изображений. Подробно описывай визуальные элементы. Отвечай на русском языке.'
            },
            code: { 
                icon: 'ti-code', 
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

        this.init();
    }

    async init() {
        try {
            this.setupMarked();
            this.setupEventListeners();
            await this.loadChatHistory();
            this.setupPuterAI();
            this.showWelcomeMessage();
            this.updateUI();
            this.setupServiceWorker();
            this.startChatDurationTimer();
            this.setupEmojiPicker();
            this.setupModelSelector();
            this.setupScrollTracking();
            this.startPlaceholderAnimation();
            this.loadThemePreference();
            
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
                gfm: true
            });
        }
    }

    setupEventListeners() {
        try {
            // Send message
            this.addEventListener(document.getElementById('sendBtn'), 'click', () => this.handleSendButtonClick());
            
            const userInput = document.getElementById('userInput');
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

            // Emoji picker
            this.addEventListener(document.getElementById('emojiBtn'), 'click', (e) => {
                this.toggleEmojiPicker(e.currentTarget);
            });

            // Clear chat
            this.addEventListener(document.getElementById('clearChatBtn'), 'click', () => {
                this.clearChat();
            });

            // Export chat
            this.addEventListener(document.getElementById('exportBtn'), 'click', () => {
                this.exportChat();
            });

            // Help
            this.addEventListener(document.getElementById('helpBtn'), 'click', () => {
                this.showHelp();
            });

            // Theme toggle
            this.addEventListener(document.getElementById('themeToggle'), 'click', () => {
                this.toggleTheme();
            });

            // Fullscreen toggle
            this.addEventListener(document.getElementById('fullscreenToggle'), 'click', () => {
                this.toggleFullscreen();
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

            this.addEventListener(document.getElementById('quickSettings'), 'click', () => {
                this.showSettings();
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

            // Search
            const headerSearch = document.getElementById('headerSearch');
            this.addEventListener(headerSearch, 'input', (e) => {
                this.handleSearch(e.target.value);
            });

            this.addEventListener(document.getElementById('headerSearchClear'), 'click', () => {
                headerSearch.value = '';
                this.handleSearch('');
                headerSearch.focus();
            });

            // Context menu
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

            // Keyboard shortcuts
            this.addEventListener(document, 'keydown', (e) => {
                this.handleKeyboardShortcuts(e);
            });

            // Online/offline detection
            this.addEventListener(window, 'online', () => {
                this.setOnlineStatus(true);
            });

            this.addEventListener(window, 'offline', () => {
                this.setOnlineStatus(false);
            });

            // Resize handling with debounce
            let resizeTimeout;
            this.addEventListener(window, 'resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = this.setTimeout(() => {
                    this.handleResize();
                }, 250);
            });

            // Paste handling for images
            this.addEventListener(document, 'paste', (e) => {
                this.handlePaste(e);
            });

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

            // Minimap scroll sync
            const messagesContainer = document.getElementById('messagesContainer');
            this.addEventListener(messagesContainer, 'scroll', () => {
                this.updateMinimapViewport();
                this.handleScroll();
            });

            // Sidebar quick access buttons
            this.addEventListener(document.getElementById('qaNewChat'), 'click', () => {
                this.createNewChat();
                this.toggleSidebarMenu();
            });

            this.addEventListener(document.getElementById('qaTemplates'), 'click', () => {
                this.showTemplates();
                this.toggleSidebarMenu();
            });

            this.addEventListener(document.getElementById('qaSettings'), 'click', () => {
                this.showSettings();
                this.toggleSidebarMenu();
            });

            this.addEventListener(document.getElementById('qaHelp'), 'click', () => {
                this.showHelp();
                this.toggleSidebarMenu();
            });

            // Chat management
            this.addEventListener(document.getElementById('newChatBtn'), 'click', () => {
                this.createNewChat();
                this.toggleSidebarMenu();
            });

            this.addEventListener(document.getElementById('importChatBtn'), 'click', () => {
                this.importChat();
                this.toggleSidebarMenu();
            });

            // Logo click
            this.addEventListener(document.getElementById('logoBtn'), 'click', () => {
                this.showAbout();
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

        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
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
        
        // Сохраняем для возможности очистки
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

    setupPuterAI() {
        try {
            // Имитация Puter AI для демонстрации
            this.puterAI = {
                ai: {
                    chat: async (prompt, options) => {
                        return this.mockAIResponse(prompt, options);
                    },
                    img2txt: async (imageData) => {
                        return "Это демонстрационное изображение. В реальном приложении здесь был бы распознанный текст.";
                    }
                },
                fs: {
                    write: async (filename, content) => {
                        console.log(`File saved: ${filename}`);
                        return Promise.resolve();
                    },
                    read: async (filename) => {
                        return new Blob(['Demo file content'], { type: 'text/plain' });
                    }
                }
            };
            
            console.log('Puter AI SDK initialized (demo mode)');
            this.setOnlineStatus(true);
        } catch (error) {
            console.error('Error initializing Puter AI:', error);
            this.setOnlineStatus(false);
        }
    }

    // Mock AI response for demonstration
    async mockAIResponse(prompt, options) {
        const responses = {
            normal: [
                "Привет! Я KHAI - ваш AI-ассистент. Готов помочь с любыми вопросами!",
                "Отличный вопрос! Давайте разберем его подробнее...",
                "На основе вашего запроса, я могу предложить несколько решений...",
                "Это интересная тема! Вот что я могу рассказать...",
                "Спасибо за ваш вопрос! Вот развернутый ответ..."
            ],
            creative: [
                "О, креативная задача! Давайте придумаем что-то необычное...",
                "Вот несколько инновационных идей для вашего проекта...",
                "Позвольте предложить творческий подход к решению...",
                "Это вдохновляет! Вот что мы можем создать...",
                "Для креативной задачи нужен нестандартный подход. Предлагаю..."
            ],
            code: [
                "Отличная задача по программированию! Вот решение на Python:\n\n```python\n# Ваш код здесь\nprint('Hello, World!')\n```",
                "Вот эффективное решение вашей задачи:\n\n```javascript\nfunction solveProblem() {\n    // Реализация\n    return result;\n}\n```",
                "Для этой задачи рекомендую следующий подход:\n\n```java\npublic class Solution {\n    public static void main(String[] args) {\n        // Код решения\n    }\n}\n```",
                "Вот оптимизированное решение:\n\n```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Реализация\n    return 0;\n}\n```"
            ],
            image: [
                "Для генерации изображения по вашему описанию, я бы рекомендовал следующие параметры...",
                "Отличная визуальная идее! Вот детальное описание для генерации...",
                "На основе вашего запроса, изображение должно содержать...",
                "Вот промпт для генерации вашего изображения: 'красивое изображение с...'"
            ],
            voice: [
                "Для аудио контента по вашей теме рекомендую следующий сценарий...",
                "Вот текст для озвучивания: 'Добро пожаловать в мир AI технологий...'",
                "Отличная идея для аудио! Вот структура подкаста/озвучки..."
            ]
        };

        const modeResponses = responses[this.currentMode] || responses.normal;
        const response = modeResponses[Math.floor(Math.random() * modeResponses.length)];
        
        // Имитация потоковой передачи
        const mockStream = {
            [Symbol.asyncIterator]: async function* () {
                const words = response.split(' ');
                for (const word of words) {
                    if (this.generationAborted) break;
                    await new Promise(resolve => setTimeout(resolve, 100));
                    yield { text: word + ' ' };
                }
            }.bind(this)
        };

        return mockStream;
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

            if (this.currentMode === 'voice') {
                await this.generateVoice(message);
            } else {
                await this.processUserMessage(message, files);
            }
        } catch (error) {
            console.error('Error generating response:', error);
            this.handleError('Не удалось получить ответ. Пожалуйста, попробуйте еще раз.', error);
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
        
        const modelOptions = {
            'gpt-4': { model: 'gpt-4' },
            'gpt-3.5': { model: 'gpt-3.5' },
            'claude-3': { model: 'claude-3' },
            'gemini-pro': { model: 'gemini-pro' },
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
            // Fallback if marked is not available
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
                    <span>${file.name}</span>
                    ${file.type.startsWith('image/') ? `<img src="${file.data}" alt="${file.name}" class="file-preview">` : ''}
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
                        <i class="ti ${this.models[this.currentModel]?.icon || 'ti-brain'}"></i>
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
        
        // Edit button
        const editBtn = messageElement.querySelector('.edit-message-btn');
        if (editBtn) {
            this.addEventListener(editBtn, 'click', () => {
                this.editMessage(messageElement);
            });
        }
        
        // Regenerate button
        const regenerateBtn = messageElement.querySelector('.regenerate-btn');
        if (regenerateBtn) {
            this.addEventListener(regenerateBtn, 'click', () => {
                this.regenerateMessage(messageElement);
            });
        }
        
        // Download button
        const downloadBtn = messageElement.querySelector('.download-message-btn');
        if (downloadBtn) {
            this.addEventListener(downloadBtn, 'click', () => {
                this.downloadMessage(messageElement);
            });
        }
        
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
            voice: 'Аудио',
            image: 'Изображения',
            code: 'Программирование'
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
                <span class="file-name">${file.name}</span>
                <button class="remove-file-btn" data-index="${index}">
                    <i class="ti ti-x"></i>
                </button>
                ${file.type.startsWith('image/') ? `<img src="${file.data}" alt="${file.name}" class="file-preview">` : ''}
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
                <p>Я ваш AI-ассистент. Готов помочь с:</p>
                <ul>
                    <li><i class="ti ti-message"></i> Ответами на вопросы и обсуждениями</li>
                    <li><i class="ti ti-code"></i> Написанием и анализом кода</li>
                    <li><i class="ti ti-photo"></i> Работой с изображениями</li>
                    <li><i class="ti ti-microphone"></i> Аудио задачами</li>
                    <li><i class="ti ti-sparkles"></i> Креативными проектами</li>
                </ul>
                <div class="welcome-tips">
                    <strong>Советы:</strong>
                    <div class="tip">• Используйте разные режимы для разных типов задач</div>
                    <div class="tip">• Прикрепляйте файлы для анализа</div>
                    <div class="tip">• Используйте голосовой ввод для удобства</div>
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

    async importChat() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,.json';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const content = await this.readFileAsText(file);
                this.processImportedChat(content, file.name);
            } catch (error) {
                console.error('Error importing chat:', error);
                this.showError('Ошибка при импорте чата');
            }
        };
        
        input.click();
    }

    processImportedChat(content, filename) {
        try {
            if (filename.endsWith('.json')) {
                const data = JSON.parse(content);
                if (Array.isArray(data.messages)) {
                    this.chats.set(this.currentChatId, data.messages);
                    this.renderChat();
                    this.showNotification('Чат импортирован из JSON', 'success');
                    return;
                }
            }
            
            const lines = content.split('\n');
            const messages = [];
            let currentMessage = null;
            
            lines.forEach(line => {
                if (line.match(/^(Вы|AI)\s*\(.*\):/)) {
                    if (currentMessage) {
                        messages.push(currentMessage);
                    }
                    
                    const role = line.startsWith('Вы') ? 'user' : 'assistant';
                    const timeMatch = line.match(/\((.+)\):/);
                    const timestamp = timeMatch ? new Date(timeMatch[1]).getTime() : Date.now();
                    
                    currentMessage = {
                        id: this.generateId(),
                        role: role,
                        content: '',
                        timestamp: timestamp
                    };
                } else if (currentMessage && line.trim() && !line.startsWith('---') && !line.startsWith('===')) {
                    if (currentMessage.content) {
                        currentMessage.content += '\n';
                    }
                    currentMessage.content += line.trim();
                }
            });
            
            if (currentMessage) {
                messages.push(currentMessage);
            }
            
            if (messages.length > 0) {
                this.chats.set(this.currentChatId, messages);
                this.renderChat();
                this.showNotification(`Импортировано ${messages.length} сообщений`, 'success');
            } else {
                this.showError('Не удалось найти сообщения в файле');
            }
        } catch (error) {
            console.error('Error processing imported chat:', error);
            this.showError('Ошибка при обработке импортированного чата');
        }
    }

    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
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
                        <li><strong>Мультимодальный AI:</strong> Работа с текстом, кодом, изображениями и аудио</li>
                        <li><strong>Разные модели:</strong> GPT-4, Claude, Gemini и другие</li>
                        <li><strong>Режимы работы:</strong> Обычный, Креативный, Программирование, Изображения, Аудио</li>
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
                        <input type="checkbox" id="autoScroll" ${this.autoScrollEnabled ? 'checked' : ''}>
                    </div>
                    
                    <div class="setting-item">
                        <label for="themeSelect">Тема оформления</label>
                        <select id="themeSelect">
                            <option value="auto">Автоматически</option>
                            <option value="light">Светлая</option>
                            <option value="dark">Темная</option>
                        </select>
                    </div>
                    
                    <div class="setting-item">
                        <label for="fontSize">Размер шрифта</label>
                        <select id="fontSize">
                            <option value="small">Маленький</option>
                            <option value="medium" selected>Средний</option>
                            <option value="large">Большой</option>
                        </select>
                    </div>
                </div>
                
                <div class="setting-group">
                    <h3>Настройки AI</h3>
                    
                    <div class="setting-item">
                        <label for="defaultModel">Модель по умолчанию</label>
                        <select id="defaultModel">
                            ${Object.entries(this.models).map(([id, model]) => 
                                `<option value="${id}" ${id === this.currentModel ? 'selected' : ''}>${model.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div class="setting-item">
                        <label for="defaultMode">Режим по умолчанию</label>
                        <select id="defaultMode">
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
        // Auto scroll
        const autoScroll = document.getElementById('autoScroll');
        if (autoScroll) {
            this.addEventListener(autoScroll, 'change', (e) => {
                this.autoScrollEnabled = e.target.checked;
                this.saveSettings();
            });
        }
        
        // Theme
        const themeSelect = document.getElementById('themeSelect');
        if (themeSelect) {
            this.addEventListener(themeSelect, 'change', (e) => {
                this.setTheme(e.target.value);
                this.saveSettings();
            });
        }
        
        // Font size
        const fontSize = document.getElementById('fontSize');
        if (fontSize) {
            this.addEventListener(fontSize, 'change', (e) => {
                this.setFontSize(e.target.value);
                this.saveSettings();
            });
        }
        
        // Default model
        const defaultModel = document.getElementById('defaultModel');
        if (defaultModel) {
            this.addEventListener(defaultModel, 'change', (e) => {
                this.currentModel = e.target.value;
                this.setupModelSelector();
                this.saveSettings();
            });
        }
        
        // Default mode
        const defaultMode = document.getElementById('defaultMode');
        if (defaultMode) {
            this.addEventListener(defaultMode, 'change', (e) => {
                this.setMode(e.target.value);
                this.saveSettings();
            });
        }
        
        // Export all data
        const exportAllData = document.getElementById('exportAllData');
        if (exportAllData) {
            this.addEventListener(exportAllData, 'click', () => {
                this.exportAllData();
            });
        }
        
        // Clear all data
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

    setFontSize(size) {
        document.documentElement.setAttribute('data-font-size', size);
        localStorage.setItem('khai-font-size', size);
    }

    loadThemePreference() {
        const savedTheme = localStorage.getItem('khai-theme') || 'auto';
        const savedFontSize = localStorage.getItem('khai-font-size') || 'medium';
        
        this.setTheme(savedTheme);
        this.setFontSize(savedFontSize);
    }

    saveSettings() {
        const settings = {
            autoScroll: this.autoScrollEnabled,
            theme: document.documentElement.getAttribute('data-theme'),
            fontSize: document.documentElement.getAttribute('data-font-size'),
            defaultModel: this.currentModel,
            defaultMode: this.currentMode
        };
        
        localStorage.setItem('khai-settings', JSON.stringify(settings));
        this.showNotification('Настройки сохранены', 'success');
    }

    exportAllData() {
        try {
            const allData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                settings: {
                    autoScroll: this.autoScrollEnabled,
                    theme: document.documentElement.getAttribute('data-theme'),
                    fontSize: document.documentElement.getAttribute('data-font-size'),
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
        // Закрыть существующий модал
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
        
        // Закрытие по ESC
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

    createNewChat() {
        const newChatId = 'chat-' + Date.now();
        this.currentChatId = newChatId;
        this.chats.set(newChatId, []);
        
        const messagesContainer = document.getElementById('messagesContainer');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
        
        this.showWelcomeMessage();
        this.updateUI();
        this.saveChatHistory();
        
        this.showNotification('Новый чат создан', 'success');
    }

    handleSearch(term) {
        this.searchTerm = term.toLowerCase().trim();
        
        const messages = document.querySelectorAll('.message');
        let foundCount = 0;
        
        messages.forEach(message => {
            const text = message.textContent.toLowerCase();
            const messageContent = message.querySelector('.message-text');
            
            if (messageContent) {
                if (this.searchTerm && text.includes(this.searchTerm)) {
                    message.classList.add('search-highlight');
                    foundCount++;
                    
                    // Подсветка текста внутри сообщения
                    const originalHTML = messageContent.innerHTML;
                    const regex = new RegExp(`(${this.escapeRegex(this.searchTerm)})`, 'gi');
                    messageContent.innerHTML = originalHTML.replace(regex, '<mark class="search-match">$1</mark>');
                } else {
                    message.classList.remove('search-highlight');
                    
                    // Убрать подсветку
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
            this.hideContextMenu();
            this.hideModelSelection();
            
            const emojiPicker = document.getElementById('emojiPicker');
            if (emojiPicker) {
                emojiPicker.style.display = 'none';
            }
        }
    }

    cycleMode() {
        const modes = Object.keys(this.modeConfigs);
        const currentIndex = modes.indexOf(this.currentMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.setMode(modes[nextIndex]);
    }

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

    deleteMessage(messageId) {
        const chat = this.chats.get(this.currentChatId);
        if (chat) {
            const messageIndex = chat.findIndex(msg => msg.id === messageId);
            if (messageIndex !== -1) {
                chat.splice(messageIndex, 1);
                const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
                if (messageElement) {
                    messageElement.remove();
                }
                this.saveChatHistory();
                this.showNotification('Сообщение удалено', 'success');
            }
        }
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

    updateMinimapViewport() {
        const minimapViewport = document.getElementById('minimapViewport');
        const messagesContainer = document.getElementById('messagesContainer');
        
        if (!minimapViewport || !messagesContainer) return;
        
        const scrollTop = messagesContainer.scrollTop;
        const scrollHeight = messagesContainer.scrollHeight;
        const clientHeight = messagesContainer.clientHeight;
        
        const viewportHeight = (clientHeight / scrollHeight) * 100;
        const viewportTop = (scrollTop / scrollHeight) * 100;
        
        minimapViewport.style.height = viewportHeight + '%';
        minimapViewport.style.top = viewportTop + '%';
    }

    handleResize() {
        this.autoResizeTextarea(document.getElementById('userInput'));
        this.updateMinimapViewport();
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
        }, 60000); // Обновлять каждую минуту
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
        
        const animatePlaceholder = () => {
            if (document.activeElement === userInput) return;
            
            const example = this.placeholderExamples[currentExampleIndex];
            let displayedText = '';
            let charIndex = 0;
            
            const typeNextChar = () => {
                if (charIndex < example.length) {
                    displayedText += example.charAt(charIndex);
                    userInput.placeholder = displayedText + '█';
                    charIndex++;
                    this.setTimeout(typeNextChar, 50);
                } else {
                    this.setTimeout(() => {
                        deleteText();
                    }, 2000);
                }
            };
            
            const deleteText = () => {
                if (displayedText.length > 0) {
                    displayedText = displayedText.slice(0, -1);
                    userInput.placeholder = displayedText + '█';
                    this.setTimeout(deleteText, 30);
                } else {
                    currentExampleIndex = (currentExampleIndex + 1) % this.placeholderExamples.length;
                    this.setTimeout(animatePlaceholder, 500);
                }
            };
            
            typeNextChar();
        };
        
        // Запустить анимацию только если поле не в фокусе
        this.addEventListener(userInput, 'focus', () => {
            userInput.placeholder = this.modeConfigs[this.currentMode].placeholder;
        });
        
        this.addEventListener(userInput, 'blur', () => {
            this.setTimeout(() => {
                if (document.activeElement !== userInput && !userInput.value) {
                    animatePlaceholder();
                }
            }, 1000);
        });
        
        // Начать анимацию при загрузке
        if (!userInput.value) {
            animatePlaceholder();
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

    async generateImage(prompt) {
        if (!prompt.trim()) {
            this.showError('Введите описание для генерации изображения');
            return;
        }
        
        try {
            this.isGenerating = true;
            this.updateSendButton(true);
            
            // Имитация генерации изображения
            this.showNotification('Генерация изображения...', 'info');
            
            await this.delay(2000);
            
            const message = {
                id: this.generateId(),
                role: 'assistant',
                content: `Сгенерировано изображение по запросу: "${prompt}"\n\nВ демо-режиме отображается заглушка. В реальном приложении здесь было бы сгенерированное изображение.`,
                timestamp: Date.now(),
                mode: 'image'
            };
            
            this.addMessageToChat(message);
            this.addToConversationHistory('assistant', message.content);
            
            this.showNotification('Изображение сгенерировано', 'success');
            
        } catch (error) {
            console.error('Error generating image:', error);
            this.handleError('Ошибка при генерации изображения', error);
        } finally {
            this.isGenerating = false;
            this.updateSendButton(false);
            this.saveChatHistory();
        }
    }

    async generateVoice(prompt) {
        if (!prompt.trim()) {
            this.showError('Введите текст для генерации аудио');
            return;
        }
        
        try {
            this.isGenerating = true;
            this.updateSendButton(true);
            
            // Имитация генерации аудио
            this.showNotification('Генерация аудио...', 'info');
            
            await this.delay(1500);
            
            const message = {
                id: this.generateId(),
                role: 'assistant',
                content: `Сгенерировано аудио по запросу: "${prompt}"\n\nВ демо-режиме отображается заглушка. В реальном приложении здесь был бы сгенерированный аудиофайл.`,
                timestamp: Date.now(),
                mode: 'voice'
            };
            
            this.addMessageToChat(message);
            this.addToConversationHistory('assistant', message.content);
            
            this.showNotification('Аудио сгенерировано', 'success');
            
        } catch (error) {
            console.error('Error generating voice:', error);
            this.handleError('Ошибка при генерации аудио', error);
        } finally {
            this.isGenerating = false;
            this.updateSendButton(false);
            this.saveChatHistory();
        }
    }

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

    showAbout() {
        const aboutContent = `
            <div class="about-content">
                <div class="about-header">
                    <div class="about-logo">
                        <i class="ti ti-sparkles"></i>
                    </div>
                    <h2>KHAI</h2>
                    <p class="about-version">Версия 2.1.0</p>
                </div>
                
                <div class="about-description">
                    <p>Продвинутый AI-ассистент с поддержкой мультимодальных возможностей, разработанный для эффективного решения разнообразных задач.</p>
                </div>
                
                <div class="about-features">
                    <h3>🚀 Основные возможности</h3>
                    <div class="features-grid">
                        <div class="feature-item">
                            <i class="ti ti-brain"></i>
                            <span>Множество AI моделей</span>
                        </div>
                        <div class="feature-item">
                            <i class="ti ti-code"></i>
                            <span>Поддержка программирования</span>
                        </div>
                        <div class="feature-item">
                            <i class="ti ti-photo"></i>
                            <span>Работа с изображениями</span>
                        </div>
                        <div class="feature-item">
                            <i class="ti ti-microphone"></i>
                            <span>Аудио возможности</span>
                        </div>
                        <div class="feature-item">
                            <i class="ti ti-sparkles"></i>
                            <span>Креативные режимы</span>
                        </div>
                        <div class="feature-item">
                            <i class="ti ti-file-export"></i>
                            <span>Экспорт и импорт</span>
                        </div>
                    </div>
                </div>
                
                <div class="about-technical">
                    <h3>🔧 Техническая информация</h3>
                    <div class="tech-info">
                        <div class="tech-item">
                            <strong>Текущая модель:</strong>
                            <span>${this.models[this.currentModel]?.name || this.currentModel}</span>
                        </div>
                        <div class="tech-item">
                            <strong>Режим работы:</strong>
                            <span>${this.getModeDisplayName(this.currentMode)}</span>
                        </div>
                        <div class="tech-item">
                            <strong>Сообщений в чате:</strong>
                            <span>${this.chats.get(this.currentChatId)?.length || 0}</span>
                        </div>
                        <div class="tech-item">
                            <strong>Статус:</strong>
                            <span class="${this.isOnline ? 'status-online' : 'status-offline'}">
                                ${this.isOnline ? 'Онлайн' : 'Офлайн'}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="about-footer">
                    <p>© 2024 KHAI. Все права защищены.</p>
                </div>
            </div>
        `;
        
        this.showModal('О KHAI', aboutContent, 'large');
    }

    showTemplates() {
        const templatesContent = `
            <div class="templates-content">
                <h3>🚀 Быстрые шаблоны</h3>
                <p>Выберите шаблон для быстрого старта:</p>
                
                <div class="templates-grid">
                    <div class="template-card" data-template="code-help">
                        <div class="template-icon">
                            <i class="ti ti-code"></i>
                        </div>
                        <h4>Помощь с кодом</h4>
                        <p>Помощь в написании и отладке кода на различных языках программирования</p>
                    </div>
                    
                    <div class="template-card" data-template="creative-writing">
                        <div class="template-icon">
                            <i class="ti ti-pencil"></i>
                        </div>
                        <h4>Креативное письмо</h4>
                        <p>Создание рассказов, статей, сценариев и другого креативного контента</p>
                    </div>
                    
                    <div class="template-card" data-template="image-description">
                        <div class="template-icon">
                            <i class="ti ti-photo"></i>
                        </div>
                        <h4>Описание изображений</h4>
                        <p>Детальное описание визуальных сцен для генерации или анализа изображений</p>
                    </div>
                    
                    <div class="template-card" data-template="voice-script">
                        <div class="template-icon">
                            <i class="ti ti-microphone"></i>
                        </div>
                        <h4>Аудио скрипты</h4>
                        <p>Создание скриптов для озвучивания, подкастов и аудио контента</p>
                    </div>
                    
                    <div class="template-card" data-template="analysis">
                        <div class="template-icon">
                            <i class="ti ti-chart-bar"></i>
                        </div>
                        <h4>Анализ данных</h4>
                        <p>Анализ информации, трендов и данных с структурированными выводами</p>
                    </div>
                    
                    <div class="template-card" data-template="learning">
                        <div class="template-icon">
                            <i class="ti ti-school"></i>
                        </div>
                        <h4>Обучение</h4>
                        <p>Объяснение сложных концепций простым языком с примерами</p>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal('Шаблоны запросов', templatesContent, 'large');
        
        // Добавляем обработчики для шаблонов
        this.setTimeout(() => {
            document.querySelectorAll('.template-card').forEach(card => {
                this.addEventListener(card, 'click', () => {
                    const template = card.dataset.template;
                    this.handlePreset(template);
                    this.hideModal();
                });
            });
        }, 100);
    }

    updateUI() {
        this.updateModeIndicator();
        this.updateNavigationButtons();
        this.updateAttachedFilesDisplay();
        this.toggleClearInputButton();
        
        // Update message count
        const messageCount = document.getElementById('messageCount');
        if (messageCount) {
            const count = this.chats.get(this.currentChatId)?.length || 0;
            messageCount.textContent = `Сообщений: ${count}`;
        }
        
        // Update current model display
        const modelDisplay = document.getElementById('currentModelDisplay');
        if (modelDisplay) {
            modelDisplay.textContent = `Модель: ${this.models[this.currentModel]?.name || this.currentModel}`;
        }
    }

    addToConversationHistory(role, content, files = []) {
        this.conversationHistory.push({
            role,
            content,
            files: files.map(f => ({ name: f.name, type: f.type })),
            timestamp: Date.now()
        });
        
        // Ограничиваем историю последними 50 сообщениями
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
        
        if (diff < 60000) { // Меньше минуты
            return 'только что';
        } else if (diff < 3600000) { // Меньше часа
            const minutes = Math.floor(diff / 60000);
            return `${minutes} мин назад`;
        } else if (diff < 86400000) { // Меньше суток
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

    // Очистка ресурсов при уничтожении
    destroy() {
        // Очистка таймеров
        this.activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.activeTimeouts.clear();
        
        if (this.durationTimer) {
            clearInterval(this.durationTimer);
        }
        
        // Очистка обработчиков событий
        this.activeEventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        this.activeEventListeners.clear();
        
        // Очистка речевых функций
        this.stopSpeaking();
        this.stopVoiceInput();
        
        // Очистка генерации
        this.stopGeneration();
        
        // Удаление модальных окон
        this.hideModal();
        this.hideContextMenu();
        
        console.log('KHAI Chat destroyed');
    }
}

// Инициализация приложения когда DOM готов
document.addEventListener('DOMContentLoaded', () => {
    window.khaiChat = new KHAIChat();
});

// Очистка при выгрузке страницы
window.addEventListener('beforeunload', () => {
    if (window.khaiChat) {
        window.khaiChat.destroy();
    }
});
