// KHAI Pro - Advanced AI Chat Application
class KHAIProChat {
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
                color: '#ffd600',
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
            
            console.log('KHAI Pro Chat initialized successfully');
        } catch (error) {
            console.error('Error initializing KHAI Pro Chat:', error);
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
                "Привет! Я KHAI Pro - ваш AI-ассистент. Готов помочь с любыми вопросами!",
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
                "Отличная визуальная идея! Вот детальное описание для генерации...",
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

    // File handling methods
    async handleFileUpload(files) {
        if (!files || files.length === 0) return;

        const validFiles = [];
        const maxFiles = 3;

        for (const file of files) {
            if (validFiles.length >= maxFiles) {
                this.showNotification('Можно прикрепить не более 3 файлов', 'warning');
                break;
            }

            if (this.validateFile(file)) {
                try {
                    if (file.type.startsWith('image/')) {
                        const processedFile = await this.processImageFile(file);
                        validFiles.push(processedFile);
                    } else if (file.type.startsWith('text/') || file.name.endsWith('.txt')) {
                        const processedFile = await this.processTextFile(file);
                        validFiles.push(processedFile);
                    } else {
                        this.showNotification(`Формат файла "${file.name}" не поддерживается`, 'error');
                    }
                } catch (error) {
                    console.error('Error processing file:', error);
                    this.showNotification(`Ошибка обработки файла: ${file.name}`, 'error');
                }
            }
        }

        if (validFiles.length > 0) {
            validFiles.forEach(file => {
                this.attachedFiles.push(file);
            });
            this.updateAttachedFilesDisplay();
            this.showNotification(`Добавлено файлов: ${validFiles.length}`, 'success');
        }
    }

    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'text/plain'];

        if (file.size > maxSize) {
            this.showNotification(`Файл "${file.name}" слишком большой. Максимум 10MB.`, 'error');
            return false;
        }

        if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt')) {
            this.showNotification(`Тип файла "${file.name}" не поддерживается.`, 'error');
            return false;
        }

        return true;
    }

    async processImageFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    name: file.name,
                    data: e.target.result,
                    type: file.type,
                    size: file.size,
                    fileType: 'image'
                });
            };
            reader.onerror = () => reject(new Error(`Ошибка загрузки изображения: ${file.name}`));
            reader.readAsDataURL(file);
        });
    }

    async processTextFile(file) {
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

    updateAttachedFilesDisplay() {
        const container = document.getElementById('attachedFiles');
        if (!container) return;

        container.innerHTML = '';
        
        this.attachedFiles.forEach((file, index) => {
            const fileElement = document.createElement('div');
            fileElement.className = 'attached-file';
            fileElement.innerHTML = `
                <i class="ti ${file.fileType === 'image' ? 'ti-photo' : 'ti-file-text'}"></i>
                <span>${file.name}</span>
                <button class="remove-file" data-index="${index}" title="Удалить файл">
                    <i class="ti ti-x"></i>
                </button>
            `;
            container.appendChild(fileElement);
        });

        // Add event listeners for remove buttons
        container.querySelectorAll('.remove-file').forEach(btn => {
            this.addEventListener(btn, 'click', (e) => {
                const index = parseInt(e.target.closest('.remove-file').dataset.index);
                this.removeAttachedFile(index);
            });
        });
    }

    removeAttachedFile(index) {
        if (index >= 0 && index < this.attachedFiles.length) {
            this.attachedFiles.splice(index, 1);
            this.updateAttachedFilesDisplay();
        }
    }

    clearAttachedFiles() {
        this.attachedFiles = [];
        this.updateAttachedFilesDisplay();
    }

    // Message management
    addMessageToChat(message) {
        this.messages.push(message);
        this.renderMessage(message);
        this.updateMinimap();
        this.updateStats();
    }

    renderMessage(message) {
        const container = document.getElementById('messagesContainer');
        if (!container) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message message-${message.role} ${message.mode ? 'message-' + message.mode : ''}`;
        messageElement.setAttribute('data-message-id', message.id);

        let content = message.content;
        
        if (message.role === 'assistant' && typeof marked !== 'undefined') {
            content = marked.parse(content);
        }

        messageElement.innerHTML = `
            <div class="message-content">
                ${content}
                ${message.role === 'assistant' ? '<div class="model-indicator"></div>' : ''}
            </div>
            <div class="message-actions">
                ${this.getMessageActions(message)}
            </div>
        `;

        if (message.role === 'assistant') {
            const modelIndicator = messageElement.querySelector('.model-indicator');
            if (modelIndicator) {
                modelIndicator.textContent = `Модель: ${this.models[this.currentModel]?.name || this.currentModel} • ${new Date(message.timestamp).toLocaleTimeString('ru-RU')}`;
            }
            this.lastAIMessageIndex = this.messages.length - 1;
        }

        container.appendChild(messageElement);
        this.attachMessageHandlers(messageElement);
        this.scrollToBottom();
    }

    getMessageActions(message) {
        const actions = [];
        
        if (message.role === 'assistant') {
            actions.push(`
                <button class="action-btn speak-btn" onclick="chat.speakMessage('${message.id}')">
                    <i class="ti ti-speakerphone"></i>
                    Озвучить
                </button>
            `);
            
            actions.push(`
                <button class="action-btn" onclick="chat.copyMessage('${message.id}')">
                    <i class="ti ti-copy"></i>
                    Копировать
                </button>
            `);
        }
        
        actions.push(`
            <button class="action-btn" onclick="chat.regenerateMessage('${message.id}')">
                <i class="ti ti-refresh"></i>
                Перегенерировать
            </button>
        `);

        return actions.join('');
    }

    attachMessageHandlers(messageElement) {
        this.attachCopyButtons(messageElement);
        
        // Add click handler for code blocks
        messageElement.querySelectorAll('pre code').forEach(codeBlock => {
            this.addEventListener(codeBlock, 'click', () => {
                this.copyCodeBlock(codeBlock);
            });
        });
    }

    attachCopyButtons(container) {
        container.querySelectorAll('.copy-code-btn').forEach(btn => {
            this.addEventListener(btn, 'click', (e) => {
                e.stopPropagation();
                const codeBlock = btn.closest('.code-header').nextElementSibling;
                this.copyCodeBlock(codeBlock, btn);
            });
        });
    }

    copyCodeBlock(codeBlock, button = null) {
        const text = codeBlock.textContent;
        navigator.clipboard.writeText(text).then(() => {
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="ti ti-check"></i> Скопировано!';
                button.classList.add('copied');
                
                this.setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('copied');
                }, 2000);
            }
            this.showNotification('Код скопирован в буфер обмена', 'success');
        }).catch(err => {
            console.error('Failed to copy code:', err);
            this.showNotification('Ошибка копирования кода', 'error');
        });
    }

    copyMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;

        navigator.clipboard.writeText(message.content).then(() => {
            this.showNotification('Сообщение скопировано в буфер обмена', 'success');
        }).catch(err => {
            console.error('Failed to copy message:', err);
            this.showNotification('Ошибка копирования сообщения', 'error');
        });
    }

    regenerateMessage(messageId) {
        const messageIndex = this.messages.findIndex(m => m.id === messageId);
        if (messageIndex === -1) return;

        const message = this.messages[messageIndex];
        if (message.role === 'user') {
            // Find the corresponding AI response and regenerate it
            const aiMessageIndex = messageIndex + 1;
            if (aiMessageIndex < this.messages.length && this.messages[aiMessageIndex].role === 'assistant') {
                this.messages.splice(aiMessageIndex, 1);
                this.rerenderMessages();
                this.getAIResponse(message.content, message.files || []);
            }
        }
    }

    rerenderMessages() {
        const container = document.getElementById('messagesContainer');
        if (!container) return;

        container.innerHTML = '';
        this.messages.forEach(message => this.renderMessage(message));
    }

    // UI Management
    setMode(mode) {
        if (!this.modeConfigs[mode]) return;

        this.currentMode = mode;
        
        // Update mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.mode-btn[data-mode="${mode}"]`).classList.add('active');
        
        // Update input placeholder
        const userInput = document.getElementById('userInput');
        if (userInput) {
            userInput.placeholder = this.modeConfigs[mode].placeholder;
        }
        
        // Update mode indicator
        const modeIndicator = document.getElementById('modeIndicator');
        if (modeIndicator) {
            const modeNames = {
                normal: 'Обычный',
                creative: 'Креативный',
                voice: 'Аудио',
                image: 'Изображения',
                code: 'Код'
            };
            modeIndicator.textContent = `Режим: ${modeNames[mode]}`;
        }

        this.showNotification(`Режим изменен на: ${modeNames[mode]}`, 'info');
    }

    updateUI() {
        this.updateStats();
        this.updateMinimap();
    }

    updateStats() {
        const messageCount = document.getElementById('messageCount');
        const currentModelDisplay = document.getElementById('currentModelDisplay');
        
        if (messageCount) {
            messageCount.textContent = `Сообщений: ${this.messages.length}`;
        }
        
        if (currentModelDisplay) {
            currentModelDisplay.textContent = `Модель: ${this.models[this.currentModel]?.name || this.currentModel}`;
        }
    }

    updateMinimap() {
        const minimapContent = document.getElementById('minimapContent');
        if (!minimapContent) return;

        minimapContent.innerHTML = '';
        
        this.messages.forEach((message, index) => {
            const dot = document.createElement('div');
            dot.className = `minimap-dot ${message.role} ${index === this.messages.length - 1 ? 'active' : ''}`;
            minimapContent.appendChild(dot);
        });
    }

    updateMinimapViewport() {
        const container = document.getElementById('messagesContainer');
        const minimap = document.getElementById('chatMinimap');
        const viewport = document.getElementById('minimapViewport');
        
        if (!container || !minimap || !viewport) return;

        const containerHeight = container.scrollHeight;
        const visibleHeight = container.clientHeight;
        const scrollTop = container.scrollTop;
        
        const viewportHeight = (visibleHeight / containerHeight) * minimap.offsetHeight;
        const viewportTop = (scrollTop / containerHeight) * minimap.offsetHeight;
        
        viewport.style.height = `${viewportHeight}px`;
        viewport.style.top = `${viewportTop}px`;
    }

    // Navigation
    scrollToBottom(force = false) {
        if (this.autoScrollEnabled || force) {
            const container = document.getElementById('messagesContainer');
            if (container) {
                container.scrollTop = container.scrollHeight;
            }
        }
    }

    scrollToTop() {
        const container = document.getElementById('messagesContainer');
        if (container) {
            container.scrollTop = 0;
        }
    }

    scrollToLastAIMessage() {
        if (this.lastAIMessageIndex >= 0) {
            const aiMessages = document.querySelectorAll('.message-assistant');
            if (aiMessages.length > 0) {
                const lastAIMessage = aiMessages[aiMessages.length - 1];
                lastAIMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    // Typing indicator
    showTypingIndicator() {
        this.hideTypingIndicator();
        
        const container = document.getElementById('messagesContainer');
        if (!container) return;

        const indicator = document.createElement('div');
        indicator.className = 'message message-assistant typing-indicator';
        indicator.id = 'typing-indicator';
        
        indicator.innerHTML = `
            <div class="typing-content">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
                <div class="typing-text">KHAI Pro печатает...</div>
            </div>
        `;
        
        container.appendChild(indicator);
        this.typingIndicator = indicator;
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        if (this.typingIndicator) {
            this.typingIndicator.remove();
            this.typingIndicator = null;
        }
    }

    // Voice input
    toggleVoiceInput() {
        if (this.isListening) {
            this.stopVoiceInput();
        } else {
            this.startVoiceInput();
        }
    }

    startVoiceInput() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            this.showNotification('Голосовой ввод не поддерживается в вашем браузере', 'warning');
            return;
        }

        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'ru-RU';

            const voiceBtn = document.getElementById('voiceInputBtn');
            voiceBtn.classList.add('listening');

            this.recognition.onstart = () => {
                this.isListening = true;
                this.showNotification('Слушаю... Говорите сейчас', 'info');
            };

            this.recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');

                document.getElementById('userInput').value = transcript;
                this.autoResizeTextarea(document.getElementById('userInput'));
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showNotification(`Ошибка распознавания: ${event.error}`, 'error');
                this.stopVoiceInput();
            };

            this.recognition.onend = () => {
                this.stopVoiceInput();
            };

            this.recognition.start();
        } catch (error) {
            console.error('Error starting voice input:', error);
            this.showNotification('Ошибка инициализации голосового ввода', 'error');
        }
    }

    stopVoiceInput() {
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {
                // Ignore errors when stopping
            }
            this.recognition = null;
        }
        
        this.isListening = false;
        const voiceBtn = document.getElementById('voiceInputBtn');
        voiceBtn.classList.remove('listening');
    }

    // Textarea auto-resize
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    toggleClearInputButton() {
        const clearBtn = document.getElementById('clearInputBtn');
        const userInput = document.getElementById('userInput');
        
        if (clearBtn && userInput) {
            clearBtn.style.display = userInput.value.trim() ? 'flex' : 'none';
        }
    }

    // Notifications
    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="ti ${this.getNotificationIcon(type)}"></i>
            </div>
            <div class="notification-content">${message}</div>
            <button class="notification-close">
                <i class="ti ti-x"></i>
            </button>
        `;

        container.appendChild(notification);

        // Add close event
        const closeBtn = notification.querySelector('.notification-close');
        this.addEventListener(closeBtn, 'click', () => {
            notification.remove();
        });

        // Auto remove after 5 seconds
        this.setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'ti-circle-check',
            error: 'ti-alert-circle',
            warning: 'ti-alert-triangle',
            info: 'ti-info-circle'
        };
        return icons[type] || 'ti-info-circle';
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    // Theme management
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('khai-pro-theme', newTheme);
        
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = newTheme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
        }
        
        this.showNotification(`Тема изменена на: ${newTheme === 'dark' ? 'Тёмная' : 'Светлая'}`, 'info');
    }

    loadThemePreference() {
        const savedTheme = localStorage.getItem('khai-pro-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = savedTheme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
        }
    }

    // Fullscreen
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('Error attempting to enable fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Sidebar menu
    toggleSidebarMenu() {
        const sidebar = document.getElementById('mobileSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }
    }

    // Model selection
    showModelSelection() {
        const container = document.getElementById('modelSelection');
        if (!container) return;

        container.innerHTML = '';
        
        Object.entries(this.models).forEach(([key, model]) => {
            const option = document.createElement('div');
            option.className = `model-option ${key === this.currentModel ? 'active' : ''}`;
            option.innerHTML = `
                <div class="model-icon">
                    <i class="${model.icon}"></i>
                </div>
                <div class="model-info">
                    <div class="model-name">${model.name}</div>
                    <div class="model-description">${model.description}</div>
                </div>
            `;
            
            this.addEventListener(option, 'click', () => {
                this.selectModel(key);
                this.hideModelSelection();
            });
            
            container.appendChild(option);
        });

        container.style.display = 'block';
        
        // Add outside click listener
        this.setTimeout(() => {
            this.addEventListener(document, 'click', this.modelSelectionOutsideClick.bind(this));
        }, 0);
    }

    modelSelectionOutsideClick(e) {
        const container = document.getElementById('modelSelection');
        const button = document.getElementById('modelSelectBtn');
        
        if (container && !container.contains(e.target) && !button.contains(e.target)) {
            this.hideModelSelection();
        }
    }

    hideModelSelection() {
        const container = document.getElementById('modelSelection');
        if (container) {
            container.style.display = 'none';
        }
    }

    selectModel(modelKey) {
        if (this.models[modelKey]) {
            this.currentModel = modelKey;
            this.setupModelSelector();
            this.updateUI();
            this.showNotification(`Модель изменена на: ${this.models[modelKey].name}`, 'success');
        }
    }

    // Emoji picker
    setupEmojiPicker() {
        const emojis = {
            'Часто используемые': ['😀', '😂', '🥰', '😎', '🤔', '👏', '🙏', '🔥', '⭐', '💯'],
            'Смайлики и эмоции': ['😊', '😍', '🤩', '😜', '😢', '😡', '🤯', '🥳', '😴', '🤢'],
            'Жесты': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '👊', '🤝', '🙌', '💪'],
            'Предметы': ['💻', '📱', '🎮', '📚', '✏️', '🎨', '🎵', '⚽', '🎁', '💡']
        };

        const picker = document.getElementById('emojiPicker');
        if (!picker) return;

        Object.entries(emojis).forEach(([category, emojiList]) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'emoji-category';
            
            const title = document.createElement('div');
            title.className = 'emoji-category-title';
            title.textContent = category;
            categoryDiv.appendChild(title);
            
            const grid = document.createElement('div');
            grid.className = 'emoji-grid';
            
            emojiList.forEach(emoji => {
                const btn = document.createElement('button');
                btn.className = 'emoji-btn';
                btn.textContent = emoji;
                btn.title = emoji;
                
                this.addEventListener(btn, 'click', () => {
                    this.insertEmoji(emoji);
                    this.hideEmojiPicker();
                });
                
                grid.appendChild(btn);
            });
            
            categoryDiv.appendChild(grid);
            picker.appendChild(categoryDiv);
        });
    }

    toggleEmojiPicker(button) {
        const picker = document.getElementById('emojiPicker');
        if (!picker) return;

        if (picker.style.display === 'block') {
            this.hideEmojiPicker();
        } else {
            this.showEmojiPicker(button);
        }
    }

    showEmojiPicker(button) {
        const picker = document.getElementById('emojiPicker');
        if (!picker) return;

        const rect = button.getBoundingClientRect();
        picker.style.bottom = `${window.innerHeight - rect.top + 10}px`;
        picker.style.left = `${rect.left}px`;
        picker.style.display = 'block';
        
        // Add outside click listener
        this.setTimeout(() => {
            this.addEventListener(document, 'click', this.emojiPickerOutsideClick);
        }, 0);
    }

    emojiPickerOutsideClick(e) {
        const picker = document.getElementById('emojiPicker');
        const button = document.getElementById('emojiBtn');
        
        if (picker && !picker.contains(e.target) && !button.contains(e.target)) {
            this.hideEmojiPicker();
        }
    }

    hideEmojiPicker() {
        const picker = document.getElementById('emojiPicker');
        if (picker) {
            picker.style.display = 'none';
        }
    }

    insertEmoji(emoji) {
        const userInput = document.getElementById('userInput');
        if (userInput) {
            const start = userInput.selectionStart;
            const end = userInput.selectionEnd;
            const text = userInput.value;
            userInput.value = text.substring(0, start) + emoji + text.substring(end);
            userInput.focus();
            userInput.selectionStart = userInput.selectionEnd = start + emoji.length;
            this.autoResizeTextarea(userInput);
        }
    }

    // File drop zone
    showDropZone() {
        const dropZone = document.getElementById('dropZone');
        if (dropZone) {
            dropZone.style.display = 'flex';
        }
    }

    hideDropZone() {
        const dropZone = document.getElementById('dropZone');
        if (dropZone) {
            dropZone.style.display = 'none';
        }
    }

    // Context menu
    showContextMenu(e, messageElement) {
        this.hideContextMenu();

        const menu = document.getElementById('contextMenu');
        if (!menu) return;

        const messageId = messageElement.getAttribute('data-message-id');
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;

        menu.innerHTML = '';
        
        if (message.role === 'assistant') {
            menu.innerHTML += `
                <button class="context-menu-item" onclick="chat.speakMessage('${messageId}')">
                    <i class="ti ti-speakerphone"></i>
                    Озвучить
                </button>
                <button class="context-menu-item" onclick="chat.copyMessage('${messageId}')">
                    <i class="ti ti-copy"></i>
                    Копировать текст
                </button>
            `;
        }
        
        menu.innerHTML += `
            <button class="context-menu-item" onclick="chat.regenerateMessage('${messageId}')">
                <i class="ti ti-refresh"></i>
                Перегенерировать
            </button>
            <div class="context-menu-divider"></div>
            <button class="context-menu-item danger" onclick="chat.deleteMessage('${messageId}')">
                <i class="ti ti-trash"></i>
                Удалить
            </button>
        `;

        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';
        menu.style.display = 'block';
    }

    hideContextMenu() {
        const menu = document.getElementById('contextMenu');
        if (menu) {
            menu.style.display = 'none';
        }
    }

    deleteMessage(messageId) {
        const index = this.messages.findIndex(m => m.id === messageId);
        if (index !== -1) {
            this.messages.splice(index, 1);
            this.rerenderMessages();
            this.saveChatHistory();
            this.updateUI();
        }
        this.hideContextMenu();
    }

    // Keyboard shortcuts
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'k':
                    e.preventDefault();
                    document.getElementById('headerSearch')?.focus();
                    break;
                case 'n':
                    e.preventDefault();
                    this.createNewChat();
                    break;
                case 'd':
                    e.preventDefault();
                    this.toggleTheme();
                    break;
                case '/':
                    e.preventDefault();
                    document.getElementById('userInput')?.focus();
                    break;
            }
        }
        
        if (e.key === 'Escape') {
            if (this.isGenerating) {
                this.stopGeneration();
            }
            this.hideContextMenu();
            this.hideEmojiPicker();
            this.hideModelSelection();
        }
    }

    // Online/offline status
    setOnlineStatus(online) {
        this.isOnline = online;
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            if (online) {
                statusElement.innerHTML = '<i class="ti ti-wifi"></i><span>Онлайн</span>';
                statusElement.className = 'connection-status';
            } else {
                statusElement.innerHTML = '<i class="ti ti-wifi-off"></i><span>Офлайн</span>';
                statusElement.className = 'connection-status offline';
            }
        }
    }

    // Chat management
    clearChat() {
        if (this.messages.length === 0) return;

        if (confirm('Вы уверены, что хотите очистить всю историю чата?')) {
            this.messages = [];
            const container = document.getElementById('messagesContainer');
            if (container) {
                container.innerHTML = '';
            }
            this.conversationHistory = [];
            this.saveChatHistory();
            this.updateUI();
            this.showNotification('Чат очищен', 'info');
        }
    }

    createNewChat() {
        if (this.messages.length > 0) {
            if (!confirm('Создать новый чат? Текущая история будет сохранена.')) {
                return;
            }
        }
        
        this.currentChatId = 'chat-' + Date.now();
        this.messages = [];
        this.conversationHistory = [];
        
        const container = document.getElementById('messagesContainer');
        if (container) {
            container.innerHTML = '';
        }
        
        this.showWelcomeMessage();
        this.updateUI();
        this.showNotification('Новый чат создан', 'success');
    }

    showWelcomeMessage() {
        const welcomeMessage = {
            id: this.generateId(),
            role: 'assistant',
            content: `# Добро пожаловать в KHAI Pro! 🤖

Я ваш продвинутый AI-ассистент, готовый помочь с самыми разными задачами:

## 🎯 Возможности:
- **Обычный режим** - ответы на вопросы и помощь с задачами
- **Креативный режим** - генерация идей и нестандартных решений
- **Аудио режим** - работа с аудио контентом
- **Режим изображений** - анализ и создание визуального контента
- **Режим программирования** - написание и отладка кода

## 🚀 Особенности:
- Поддержка множества AI-моделей
- Прикрепление файлов (изображения, текстовые файлы)
- Голосовой ввод и озвучивание ответов
- Экспорт чатов и кода
- Темная и светлая темы

**Начните общение, отправив сообщение или выбрав нужный режим!**`,
            timestamp: Date.now()
        };

        this.addMessageToChat(welcomeMessage);
    }

    // Export functionality
    exportChat() {
        if (this.messages.length === 0) {
            this.showNotification('Нет сообщений для экспорта', 'warning');
            return;
        }

        const chatData = {
            title: `KHAI Pro Chat - ${new Date().toLocaleString('ru-RU')}`,
            messages: this.messages,
            model: this.currentModel,
            mode: this.currentMode,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `khai-pro-chat-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Чат экспортирован', 'success');
    }

    importChat() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const chatData = JSON.parse(event.target.result);
                    if (chatData.messages && Array.isArray(chatData.messages)) {
                        this.messages = chatData.messages;
                        this.rerenderMessages();
                        this.updateUI();
                        this.showNotification('Чат импортирован', 'success');
                    } else {
                        throw new Error('Неверный формат файла');
                    }
                } catch (error) {
                    console.error('Error importing chat:', error);
                    this.showNotification('Ошибка импорта чата', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    // Voice generation (placeholder)
    async generateVoice(message) {
        this.showNotification('Генерация аудио...', 'info');
        // В реальном приложении здесь был бы код для генерации аудио
        await this.delay(2000);
        this.showNotification('Аудио сгенерировано (демо-режим)', 'success');
    }

    // Image generation (placeholder)
    async generateImage(message) {
        this.showNotification('Генерация изображения...', 'info');
        // В реальном приложении здесь был бы код для генерации изображений
        await this.delay(2000);
        
        const imageMessage = {
            id: this.generateId(),
            role: 'assistant',
            content: `## Сгенерированное изображение 🎨

**Описание:** ${message}

**Промпт для генерации:** "${message}"

*В демо-режиме изображение не генерируется. В реальном приложении здесь было бы сгенерированное изображение.*`,
            timestamp: Date.now()
        };

        this.addMessageToChat(imageMessage);
        this.addToConversationHistory('assistant', imageMessage.content);
    }

    // Speech synthesis
    speakMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message || message.role !== 'assistant') return;

        if (this.isSpeaking) {
            this.stopSpeech();
            return;
        }

        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        const speakBtn = messageElement?.querySelector('.speak-btn');
        
        if (speakBtn) {
            this.speakText(message.content, speakBtn);
        }
    }

    speakText(text, button) {
        if (!('speechSynthesis' in window)) {
            this.showNotification('Озвучивание текста не поддерживается в вашем браузере', 'warning');
            return;
        }

        try {
            this.stopSpeech();

            const plainText = this.extractPlainText(text);

            if (!plainText.trim()) {
                this.showError('Нет текста для озвучивания');
                return;
            }

            this.currentUtterance = new SpeechSynthesisUtterance(plainText);
            this.currentUtterance.lang = 'ru-RU';
            this.currentUtterance.rate = 0.85;
            this.currentUtterance.pitch = 1.0;
            this.currentUtterance.volume = 1.0;

            const voices = speechSynthesis.getVoices();
            const russianVoice = voices.find(voice => 
                voice.lang.includes('ru') || voice.lang.includes('RU')
            );
            
            if (russianVoice) {
                this.currentUtterance.voice = russianVoice;
                this.currentUtterance.rate = 0.8;
            }

            if (button) {
                button.classList.add('speaking');
                button.innerHTML = '<i class="ti ti-player-pause"></i> Остановить';
            }

            this.isSpeaking = true;

            this.currentUtterance.onend = () => {
                this.isSpeaking = false;
                if (button) {
                    button.classList.remove('speaking');
                    button.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить';
                }
            };

            this.currentUtterance.onerror = (error) => {
                console.error('Speech synthesis error:', error);
                this.isSpeaking = false;
                if (button) {
                    button.classList.remove('speaking');
                    button.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить';
                }
                this.showError('Ошибка при озвучивании текста');
            };

            speechSynthesis.speak(this.currentUtterance);
            this.showNotification('Озвучивание текста...', 'info');

        } catch (error) {
            console.error('Error speaking text:', error);
            this.showError('Ошибка при озвучивании текста');
        }
    }

    stopSpeech() {
        if (this.isSpeaking) {
            speechSynthesis.cancel();
            this.isSpeaking = false;
            this.currentUtterance = null;
            
            // Reset all speak buttons
            document.querySelectorAll('.speak-btn.speaking').forEach(btn => {
                btn.classList.remove('speaking');
                btn.innerHTML = '<i class="ti ti-speakerphone"></i> Озвучить';
            });
        }
    }

    extractPlainText(htmlText) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlText;
        let text = tempDiv.textContent || tempDiv.innerText || '';
        
        // Убираем код и форматирование
        text = text
            .replace(/```[\s\S]*?```/g, '')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/#{1,6}\s?/g, '')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/!\[.*?\]\(.*?\)/g, '')
            .replace(/\[(.*?)\]\(.*?\)/g, '$1')
            .replace(/&[#\w]+;/g, '')
            .replace(/\n+/g, '. ')
            .trim();

        return text;
    }

    // File download
    addDownloadButtons(messageElement, content) {
        const messageActions = messageElement.querySelector('.message-actions');
        if (!messageActions) return;

        const hasCode = content.includes('```') || 
                       /(файл|код|скачать|сохранить|download|file)/i.test(content);
        
        if (hasCode) {
            const fileTypes = [
                { name: 'Текст', ext: 'txt', icon: 'ti-file-text' },
                { name: 'Python', ext: 'py', icon: 'ti-brand-python' },
                { name: 'JavaScript', ext: 'js', icon: 'ti-brand-javascript' },
                { name: 'HTML', ext: 'html', icon: 'ti-brand-html5' },
                { name: 'CSS', ext: 'css', icon: 'ti-brand-css3' }
            ];

            fileTypes.forEach(fileType => {
                const downloadBtn = document.createElement('button');
                downloadBtn.className = 'action-btn-small download-file-btn';
                downloadBtn.innerHTML = `<i class="ti ${fileType.icon}"></i> ${fileType.name}`;
                downloadBtn.onclick = () => this.downloadFile(content, fileType.ext);
                messageActions.appendChild(downloadBtn);
            });
        }
    }

    downloadFile(content, fileExtension) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const plainText = tempDiv.textContent || tempDiv.innerText || '';

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `khai_pro_chat_${timestamp}.${fileExtension}`;

        if (this.puterAI && typeof this.puterAI.fs?.write === 'function') {
            this.puterAI.fs.write(fileName, plainText)
                .then(() => {
                    this.showNotification(`Файл "${fileName}" успешно сохранен!`, 'success');
                })
                .catch(error => {
                    console.error('Error saving file with puter:', error);
                    this.downloadViaBrowser(plainText, fileName);
                });
        } else {
            this.downloadViaBrowser(plainText, fileName);
        }
    }

    downloadViaBrowser(content, fileName) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        this.showNotification(`Файл "${fileName}" скачан`, 'success');
    }

    // Utility methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    handleResize() {
        this.updateMinimapViewport();
        this.handleScroll();
    }

    handleSearch(term) {
        this.searchTerm = term.toLowerCase();
        
        const messages = document.querySelectorAll('.message');
        messages.forEach(message => {
            const content = message.textContent.toLowerCase();
            if (this.searchTerm && content.includes(this.searchTerm)) {
                message.style.backgroundColor = 'var(--accent-primary-alpha)';
                message.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                message.style.backgroundColor = '';
            }
        });
    }

    handlePaste(e) {
        const items = e.clipboardData?.items;
        if (!items) return;

        const files = [];
        for (const item of items) {
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                files.push(item.getAsFile());
            }
        }

        if (files.length > 0) {
            e.preventDefault();
            this.handleFileUpload(files);
        }
    }

    // History management
    addToConversationHistory(role, content, images = []) {
        let messageContent = content;
        
        if (images && images.length > 0) {
            const imageNames = images.map(img => img.name).join(', ');
            messageContent += ` [Прикреплено файлов: ${imageNames}]`;
        }
        
        this.conversationHistory.push({
            role: role,
            content: messageContent,
            timestamp: Date.now()
        });

        if (this.conversationHistory.length > 30) {
            this.conversationHistory = this.conversationHistory.slice(-25);
        }
    }

    // Storage
    async saveChatHistory() {
        try {
            const chatData = {
                messages: this.messages,
                conversationHistory: this.conversationHistory,
                currentModel: this.currentModel,
                currentMode: this.currentMode,
                lastUpdated: Date.now()
            };
            
            localStorage.setItem('khai-pro-chat-data', JSON.stringify(chatData));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }

    async loadChatHistory() {
        try {
            const saved = localStorage.getItem('khai-pro-chat-data');
            if (saved) {
                const chatData = JSON.parse(saved);
                this.messages = chatData.messages || [];
                this.conversationHistory = chatData.conversationHistory || [];
                this.currentModel = chatData.currentModel || 'gpt-4';
                this.currentMode = chatData.currentMode || 'normal';
                
                this.rerenderMessages();
                this.setupModelSelector();
                this.setMode(this.currentMode);
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    }

    // Service Worker
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker registered:', registration);
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        }
    }

    // Timer
    startChatDurationTimer() {
        this.chatStartTime = Date.now();
        this.durationTimer = setInterval(() => {
            this.updateChatDuration();
        }, 1000);
    }

    updateChatDuration() {
        const durationElement = document.getElementById('chatDuration');
        if (!durationElement) return;

        const duration = Math.floor((Date.now() - this.chatStartTime) / 1000);
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        
        durationElement.textContent = `Время: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Placeholder animation
    startPlaceholderAnimation() {
        let index = 0;
        let charIndex = 0;
        let isDeleting = false;

        const type = () => {
            const currentExample = this.placeholderExamples[index];
            const userInput = document.getElementById('userInput');
            if (!userInput) return;

            if (isDeleting) {
                charIndex--;
            } else {
                charIndex++;
            }

            const currentText = currentExample.substring(0, charIndex);
            userInput.placeholder = currentText + '▌';

            if (!isDeleting && charIndex === currentExample.length) {
                isDeleting = true;
                this.setTimeout(() => {}, 2000);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                index = (index + 1) % this.placeholderExamples.length;
            }

            const typeSpeed = isDeleting ? 50 : 100;
            this.setTimeout(type, typeSpeed);
        };

        type();
    }

    // Error handling
    handleError(userMessage, error) {
        console.error(userMessage, error);
        
        const errorMessage = {
            id: this.generateId(),
            role: 'error',
            content: `**Ошибка:** ${userMessage}\n\n${error.message || 'Неизвестная ошибка'}`,
            timestamp: Date.now()
        };

        this.addMessageToChat(errorMessage);
        this.showNotification(userMessage, 'error');
    }

    // Help and about
    showHelp() {
        const helpMessage = {
            id: this.generateId(),
            role: 'assistant',
            content: `## 📖 Помощь по KHAI Pro

### Основные функции:
- **Режимы работы**: Обычный, Креативный, Аудио, Изображения, Код
- **Модели ИИ**: GPT-4, GPT-3.5, Claude, Gemini и другие
- **Прикрепление файлов**: Изображения и текстовые файлы
- **Голосовой ввод**: Нажмите микрофон для голосового ввода
- **Озвучивание**: Нажмите кнопку "Озвучить" в сообщениях ИИ

### Горячие клавиши:
- \`Ctrl+K\` - Поиск по чату
- \`Ctrl+N\` - Новый чат
- \`Ctrl+D\` - Переключение темы
- \`Ctrl+/\` - Фокус на поле ввода
- \`Escape\` - Отмена/остановка

### Советы:
1. Используйте разные режимы для разных типов задач
2. Прикрепляйте изображения для их анализа
3. Экспортируйте важные беседы
4. Используйте голосовой ввод для быстрого ввода

Нужна дополнительная помощь? Просто спросите!`,
            timestamp: Date.now()
        };

        this.addMessageToChat(helpMessage);
    }

    showAbout() {
        const aboutMessage = {
            id: this.generateId(),
            role: 'assistant',
            content: `## 🚀 KHAI Pro - Advanced AI Chat

**Версия:** 2.0.0
**Разработчик:** KHAI Pro Team

### Технологии:
- Modern JavaScript (ES6+)
- HTML5 & CSS3 с Grid/Flexbox
- Service Worker для офлайн-работы
- Web Speech API для голосового ввода
- File API для работы с файлами

### Особенности:
- 🔄 Поддержка множества AI-моделей
- 🎨 Адаптивный дизайн для всех устройств
- 🌙 Темная и светлая темы
- 📱 PWA (Progressive Web App)
- 💾 Локальное сохранение истории
- 🔊 Голосовой ввод и вывод
- 📎 Прикрепление файлов
- 🔍 Поиск по истории
- 📤 Экспорт/импорт чатов

*KHAI Pro - ваш надежный AI-ассистент для решения любых задач!*`,
            timestamp: Date.now()
        };

        this.addMessageToChat(aboutMessage);
    }

    showSettings() {
        const settingsMessage = {
            id: this.generateId(),
            role: 'assistant',
            content: `## ⚙️ Настройки KHAI Pro

### Текущие настройки:
- **Модель ИИ:** ${this.models[this.currentModel]?.name || this.currentModel}
- **Режим работы:** ${this.currentMode}
- **Тема:** ${document.documentElement.getAttribute('data-theme') === 'dark' ? 'Тёмная' : 'Светлая'}
- **Онлайн статус:** ${this.isOnline ? '✅ Онлайн' : '❌ Офлайн'}

### Доступные действия:
1. **Сменить модель** - Нажмите кнопку выбора модели в заголовке
2. **Изменить тему** - Нажмите кнопку переключения темы
3. **Очистить историю** - Используйте кнопку "Очистить"
4. **Экспорт данных** - Сохраните историю чатов

### Информация о системе:
- **Сообщений в чате:** ${this.messages.length}
- **Время сессии:** ${Math.floor((Date.now() - this.chatStartTime) / 60000)} мин.
- **Поддержка голосового ввода:** ${('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) ? '✅ Да' : '❌ Нет'}
- **Поддержка озвучивания:** ${'speechSynthesis' in window ? '✅ Да' : '❌ Нет'}

Для изменения настроек используйте соответствующие кнопки в интерфейсе.`,
            timestamp: Date.now()
        };

        this.addMessageToChat(settingsMessage);
    }

    showTemplates() {
        const templatesMessage = {
            id: this.generateId(),
            role: 'assistant',
            content: `## 📋 Шаблоны запросов

### 💼 Бизнес и маркетинг:
- "Напиши бизнес-план для стартапа в сфере..."
- "Создай маркетинговую стратегию для продукта..."
- "Проанализируй конкурентов в нише..."

### 💻 Программирование:
- "Напиши функцию для сортировки массива на Python"
- "Объясни принципы ООП простыми словами"
- "Помоги найти ошибку в коде..."

### 🎨 Креативные задачи:
- "Придумай название для приложения..."
- "Напиши сценарий для видео..."
- "Создай описание продукта..."

### 📚 Обучение и объяснения:
- "Объясни квантовую физику для начинающих"
- "Расскажи о преимуществах искусственного интеллекта"
- "Сравни разные подходы к..."

### 🔍 Анализ и исследования:
- "Проанализируй этот текст и выдели ключевые идеи"
- "Сравни две технологии..."
- "Предложи решение для проблемы..."

**Совет:** Используйте эти шаблоны как отправную точку для ваших запросов!`,
            timestamp: Date.now()
        };

        this.addMessageToChat(templatesMessage);
    }

    // Cleanup
    handleBeforeUnload() {
        if (this.isGenerating) {
            this.stopGeneration();
        }
        
        this.saveChatHistory();
        this.cleanup();
    }

    cleanup() {
        this.activeTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.activeTimeouts.clear();

        this.stopSpeech();

        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
            } catch (e) {
                // Игнорируем ошибки при остановке
            }
        }

        this.hideTypingIndicator();

        if (this.durationTimer) {
            clearInterval(this.durationTimer);
        }

        this.activeEventListeners.forEach((listeners, element) => {
            if (element && element.removeEventListener) {
                listeners.forEach(({ event, handler }) => {
                    element.removeEventListener(event, handler);
                });
            }
        });
        this.activeEventListeners.clear();
    }

    destroy() {
        this.cleanup();
    }
}

// Initialize the chat when DOM is loaded
let chat;

document.addEventListener('DOMContentLoaded', () => {
    try {
        chat = new KHAIProChat();
        
        // Load saved theme
        const savedTheme = localStorage.getItem('khai-pro-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Update theme icon
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = savedTheme === 'dark' ? 'ti ti-sun' : 'ti ti-moon';
        }
        
        // Initialize speech synthesis voices
        if ('speechSynthesis' in window) {
            speechSynthesis.getVoices();
        }
        
        console.log('KHAI Pro Chat initialized successfully');
    } catch (error) {
        console.error('Failed to initialize KHAI Pro Chat:', error);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class="ti ti-alert-triangle"></i>
                <h3>Ошибка загрузки приложения</h3>
                <p>Не удалось инициализировать KHAI Pro Chat. Пожалуйста, обновите страницу.</p>
                <button onclick="location.reload()">Обновить страницу</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }
});

// Make chat globally available for HTML onclick handlers
window.chat = chat;

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (chat) {
        chat.destroy();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KHAIProChat;
}
