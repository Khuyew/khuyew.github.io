/**
 * Модуль безопасности KHAI
 * Обеспечивает защиту от XSS, CSRF и других угроз
 */

class SecurityModule {
    constructor() {
        this.csrfToken = null;
        this.allowedOrigins = [
            'https://khai-chat.by',
            'https://www.khai-chat.by',
            'http://localhost:3000',
            'http://127.0.0.1:3000'
        ];
    }

    async init() {
        await this.generateCSRFToken();
        this.setupSecurityHeaders();
        this.initCSP();
    }

    // Генерация CSRF токена
    async generateCSRFToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        this.csrfToken = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        
        // Сохранение в безопасное хранилище
        await this.setSecureStorage('csrf_token', this.csrfToken);
        
        return this.csrfToken;
    }

    // Проверка CSRF токена
    validateCSRFToken(token) {
        return token === this.csrfToken;
    }

    // Санитизация HTML для предотвращения XSS
    sanitizeHTML(html) {
        const temp = document.createElement('div');
        temp.textContent = html;
        return temp.innerHTML;
    }

    // Санитизация URL
    sanitizeURL(url) {
        try {
            const parsed = new URL(url);
            
            // Разрешаем только HTTP/HTTPS
            if (!['http:', 'https:'].includes(parsed.protocol)) {
                return 'about:blank';
            }
            
            // Проверка домена
            if (!this.isAllowedOrigin(parsed.origin)) {
                return 'about:blank';
            }
            
            return parsed.toString();
        } catch {
            return 'about:blank';
        }
    }

    // Проверка разрешенного origin
    isAllowedOrigin(origin) {
        return this.allowedOrigins.includes(origin);
    }

    // Настройка заголовков безопасности
    setupSecurityHeaders() {
        // Для Service Worker и других контекстов
        if (typeof Headers !== 'undefined') {
            const headers = new Headers();
            headers.set('X-Content-Type-Options', 'nosniff');
            headers.set('X-Frame-Options', 'DENY');
            headers.set('X-XSS-Protection', '1; mode=block');
            headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        }
    }

    // Политика безопасности контента
    initCSP() {
        const csp = `
            default-src 'self';
            script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net;
            style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://fonts.googleapis.com;
            font-src 'self' https://cdn.jsdelivr.net https://fonts.gstatic.com;
            img-src 'self' data: blob: https:;
            connect-src 'self' https://api.khai-chat.by https://cdn.puter.com wss:;
            media-src 'self' blob:;
            worker-src 'self' blob:;
            frame-ancestors 'none';
            base-uri 'self';
            form-action 'self';
        `.replace(/\s+/g, ' ').trim();

        // Установка CSP meta tag
        const meta = document.createElement('meta');
        meta.httpEquiv = 'Content-Security-Policy';
        meta.content = csp;
        document.head.appendChild(meta);
    }

    // Безопасное хранение данных
    async setSecureStorage(key, value) {
        try {
            const encrypted = await this.encryptData(JSON.stringify(value));
            localStorage.setItem(`khai_${key}`, encrypted);
        } catch (error) {
            console.error('Secure storage set error:', error);
            throw new Error('Failed to store data securely');
        }
    }

    async getSecureStorage(key) {
        try {
            const encrypted = localStorage.getItem(`khai_${key}`);
            if (!encrypted) return null;
            
            const decrypted = await this.decryptData(encrypted);
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('Secure storage get error:', error);
            return null;
        }
    }

    // Шифрование данных
    async encryptData(data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        
        const key = await this.getEncryptionKey();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            dataBuffer
        );
        
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);
        
        return btoa(String.fromCharCode(...combined));
    }

    async decryptData(encrypted) {
        try {
            const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0));
            const iv = combined.slice(0, 12);
            const data = combined.slice(12);
            
            const key = await this.getEncryptionKey();
            
            const decrypted = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv },
                key,
                data
            );
            
            return new TextDecoder().decode(decrypted);
        } catch (error) {
            throw new Error('Decryption failed');
        }
    }

    async getEncryptionKey() {
        const keyName = 'khai_encryption_key';
        
        // Пробуем получить существующий ключ
        let key = await crypto.subtle.importKey(
            'jwk',
            JSON.parse(localStorage.getItem(keyName)),
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        ).catch(() => null);
        
        // Создаем новый ключ если не существует
        if (!key) {
            key = await crypto.subtle.generateKey(
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            );
            
            const jwk = await crypto.subtle.exportKey('jwk', key);
            localStorage.setItem(keyName, JSON.stringify(jwk));
        }
        
        return key;
    }

    // Валидация пользовательского ввода
    validateInput(input, type = 'text') {
        const rules = {
            text: {
                maxLength: 10000,
                pattern: /^[\s\S]*$/,
                sanitize: (text) => text.trim().slice(0, 10000)
            },
            email: {
                maxLength: 254,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                sanitize: (email) => email.trim().toLowerCase().slice(0, 254)
            },
            filename: {
                maxLength: 255,
                pattern: /^[^\\/:\*\?"<>\|\.\s][^\\/:\*\?"<>\|]*$/,
                sanitize: (name) => name.trim().replace(/[\\/:\*\?"<>\|]/g, '_').slice(0, 255)
            }
        };
        
        const rule = rules[type] || rules.text;
        
        if (input.length > rule.maxLength) {
            throw new Error(`Input too long. Maximum ${rule.maxLength} characters allowed.`);
        }
        
        if (!rule.pattern.test(input)) {
            throw new Error(`Invalid ${type} format.`);
        }
        
        return rule.sanitize(input);
    }

    // Генерация безопасного ID
    generateId() {
        return crypto.randomUUID();
    }

    // Проверка MIME типа файла
    isAllowedFileType(file) {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'text/plain',
            'application/json',
            'text/markdown',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        return allowedTypes.includes(file.type);
    }

    // Проверка размера файла
    isAllowedFileSize(file, maxSize = 50 * 1024 * 1024) {
        return file.size <= maxSize;
    }

    // Очистка данных перед отправкой
    sanitizeForAPI(data) {
        if (typeof data === 'string') {
            return this.sanitizeHTML(data);
        }
        
        if (Array.isArray(data)) {
            return data.map(item => this.sanitizeForAPI(item));
        }
        
        if (typeof data === 'object' && data !== null) {
            const sanitized = {};
            for (const [key, value] of Object.entries(data)) {
                sanitized[key] = this.sanitizeForAPI(value);
            }
            return sanitized;
        }
        
        return data;
    }

    // Защита от кликджекинга
    preventClickjacking() {
        if (self === top) {
            return;
        }
        
        // Если встроены во фрейм, перенаправляем на главную страницу
        top.location = self.location;
    }

    // Защита от переполнения памяти
    checkMemoryUsage() {
        if (performance.memory) {
            const used = performance.memory.usedJSHeapSize;
            const limit = performance.memory.jsHeapSizeLimit;
            
            if (used / limit > 0.8) {
                console.warn('High memory usage detected');
                this.triggerCleanup();
            }
        }
    }

    triggerCleanup() {
        // Очистка кэшей и временных данных
        if (window.caches) {
            caches.keys().then(names => {
                names.forEach(name => {
                    if (name.startsWith('khai-temp-')) {
                        caches.delete(name);
                    }
                });
            });
        }
        
        // Принудительный сбор мусора
        if (global.gc) {
            global.gc();
        }
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityModule;
}
