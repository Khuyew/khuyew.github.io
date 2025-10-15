import ChatManager from './modules/chat.js';
import VoiceManager from './modules/voice.js';
import ImageManager from './modules/images.js';
import Utils from './modules/utils.js';

class KhuyewAI {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.clearInputBtn = document.getElementById('clearInputBtn');
        this.userInput = document.getElementById('userInput');
        this.helpBtn = document.getElementById('helpBtn');
        this.privacyLink = document.getElementById('privacyLink');
        
        this.isDarkTheme = true;
        this.modules = {};
        
        this.init();
    }

    init() {
        this.loadTheme();
        this.bindEvents();
        this.initModules();
        this.registerServiceWorker();
        
        console.log('Khuyew AI initialized successfully');
    }

    initModules() {
        // Initialize all modules
        this.modules.imageManager = new ImageManager();
        this.modules.voiceManager = new VoiceManager();
        this.modules.chatManager = new ChatManager();
        
        // Make modules globally available for event handlers
        window.imageManager = this.modules.imageManager;
        window.chatManager = this.modules.chatManager;
        window.voiceManager = this.modules.voiceManager;
    }

    bindEvents() {
        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Clear input
        this.clearInputBtn.addEventListener('click', () => this.clearInput());
        
        // Help button
        this.helpBtn.addEventListener('click', () => this.showHelp());
        
        // Privacy link
        this.privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPrivacyInfo();
        });
        
        // Auto-resize textarea
        this.userInput.addEventListener('input', Utils.debounce(() => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = Math.min(this.userInput.scrollHeight, 120) + 'px';
        }, 100));
        
        // Keyboard shortcuts
        document
