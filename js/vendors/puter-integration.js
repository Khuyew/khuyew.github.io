class PuterIntegration {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // Wait for puter.js to load
            if (typeof puter === 'undefined') {
                console.warn('Puter.js not loaded');
                return;
            }

            // Check if we're running in Puter environment
            if (await this.isInPuter()) {
                this.isInitialized = true;
                this.setupPuterIntegration();
            }
        } catch (error) {
            console.warn('Puter integration failed:', error);
        }
    }

    async isInPuter() {
        try {
            await puter.ping();
            return true;
        } catch {
            return false;
        }
    }

    setupPuterIntegration() {
        // Set app title
        puter.title = 'Khuyew AI';
        
        // Handle app focus
        puter.on('focus', () => {
            document.getElementById('userInput')?.focus();
        });

        // Add Puter-specific features
        this.addPuterFeatures();
    }

    addPuterFeatures() {
        // Add save chat functionality
        this.addSaveChatFeature();
        
        // Add export functionality
        this.addExportFeature();
    }

    addSaveChatFeature() {
        // This would integrate with Puter's file system
        // to save chat conversations
    }

    addExportFeature() {
        // This would allow exporting chats to different formats
        // using Puter's APIs
    }

    async saveFile(content, filename) {
        if (!this.isInitialized) return false;
        
        try {
            await puter.fs.write(filename, content);
            return true;
        } catch (error) {
            console.error('Error saving file via Puter:', error);
            return false;
        }
    }
}

// Initialize Puter integration
window.puterIntegration = new PuterIntegration();
