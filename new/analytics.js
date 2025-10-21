/**
 * Модуль аналитики KHAI
 * Сбор метрик и аналитика использования
 */

class AnalyticsModule {
    constructor() {
        this.endpoint = 'https://analytics.khai-chat.by/api/events';
        this.queue = [];
        this.isSending = false;
        this.sessionId = this.generateSessionId();
        this.userId = this.getUserId();
        this.config = {
            sampleRate: 1.0,
            maxQueueSize: 100,
            flushInterval: 30000,
            trackErrors: true,
            trackPerformance: true
        };
    }

    async init() {
        this.loadUserPreferences();
        this.setupPerformanceTracking();
        this.setupErrorTracking();
        this.startQueueProcessor();
        
        this.track('session_start', {
            user_agent: navigator.userAgent,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
    }

    // Трекинг событий
    track(eventName, properties = {}) {
        if (Math.random() > this.config.sampleRate) {
            return;
        }

        const event = {
            event: eventName,
            properties: {
                ...properties,
                session_id: this.sessionId,
                user_id: this.userId,
                timestamp: new Date().toISOString(),
                url: window.location.href,
                platform: 'web'
            }
        };

        this.addToQueue(event);
    }

    // Трекинг ошибок
    trackError(error, context = {}) {
        if (!this.config.trackErrors) return;

        this.track('error_occurred', {
            error_message: error.message,
            error_stack: error.stack,
            error_name: error.name,
            context: context,
            severity: 'error'
        });
    }

    // Трекинг производительности
    setupPerformanceTracking() {
        if (!this.config.trackPerformance) return;

        // Core Web Vitals
        this.trackCLS();
        this.trackFID();
        this.trackLCP();

        // Дополнительные метрики
        this.trackNavigationTiming();
        this.trackResourceTiming();
    }

    trackCLS() {
        let clsValue = 0;
        let sessionValue = 0;
        let sessionEntries = [];

        const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    sessionValue += entry.value;
                    sessionEntries.push(entry);
                }
            }

            if (sessionValue > clsValue) {
                clsValue = sessionValue;
                this.track('core_web_vital', {
                    metric: 'CLS',
                    value: clsValue,
                    rating: this.getRating('CLS', clsValue),
                    entries: sessionEntries
                });
            }
        });

        observer.observe({ type: 'layout-shift', buffered: true });
    }

    trackFID() {
        const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                const fid = entry.processingStart - entry.startTime;
                
                this.track('core_web_vital', {
                    metric: 'FID',
                    value: fid,
                    rating: this.getRating('FID', fid)
                });
            }
        });

        observer.observe({ type: 'first-input', buffered: true });
    }

    trackLCP() {
        const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                this.track('core_web_vital', {
                    metric: 'LCP',
                    value: entry.startTime,
                    rating: this.getRating('LCP', entry.startTime),
                    element: entry.element?.tagName
                });
            }
        });

        observer.observe({ type: 'largest-contentful-paint', buffered: true });
    }

    trackNavigationTiming() {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
            this.track('navigation_timing', {
                dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
                tcp_handshake: navigation.connectEnd - navigation.connectStart,
                ttfb: navigation.responseStart - navigation.requestStart,
                content_load: navigation.domContentLoadedEventEnd - navigation.navigationStart,
                full_load: navigation.loadEventEnd - navigation.navigationStart
            });
        }
    }

    trackResourceTiming() {
        const resources = performance.getEntriesByType('resource');
        resources.forEach(resource => {
            this.track('resource_timing', {
                name: resource.name,
                duration: resource.duration,
                size: resource.transferSize,
                type: resource.initiatorType
            });
        });
    }

    setupErrorTracking() {
        // Глобальные ошибки JavaScript
        window.addEventListener('error', (event) => {
            this.trackError(event.error, {
                type: 'global_error',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        // Необработанные промисы
        window.addEventListener('unhandledrejection', (event) => {
            this.trackError(event.reason, {
                type: 'unhandled_rejection'
            });
        });

        // Ошибки загрузки ресурсов
        window.addEventListener('error', (event) => {
            const target = event.target;
            if (target && (target.src || target.href)) {
                this.track('resource_error', {
                    resource: target.src || target.href,
                    tag: target.tagName
                });
            }
        }, true);
    }

    // Очередь событий
    addToQueue(event) {
        this.queue.push(event);
        
        if (this.queue.length >= this.config.maxQueueSize) {
            this.flush();
        }
    }

    async flush() {
        if (this.isSending || this.queue.length === 0) {
            return;
        }

        this.isSending = true;
        const events = [...this.queue];
        this.queue = [];

        try {
            await this.sendEvents(events);
        } catch (error) {
            console.error('Analytics flush failed:', error);
            // Возвращаем события в очередь при ошибке
            this.queue.unshift(...events);
        } finally {
            this.isSending = false;
        }
    }

    async sendEvents(events) {
        const response = await fetch(this.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': window.app?.security?.csrfToken || ''
            },
            body: JSON.stringify({
                events: events,
                sent_at: new Date().toISOString()
            })
        });

        if (!response.ok) {
            throw new Error(`Analytics API error: ${response.status}`);
        }

        return response.json();
    }

    startQueueProcessor() {
        // Периодическая отправка событий
        setInterval(() => this.flush(), this.config.flushInterval);
        
        // Отправка при видимости страницы
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.flush();
            }
        });
    }

    // Вспомогательные методы
    generateSessionId() {
        let sessionId = sessionStorage.getItem('khai_session_id');
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            sessionStorage.setItem('khai_session_id', sessionId);
        }
        return sessionId;
    }

    getUserId() {
        let userId = localStorage.getItem('khai_user_id');
        if (!userId) {
            userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('khai_user_id', userId);
        }
        return userId;
    }

    getRating(metric, value) {
        const thresholds = {
            'CLS': { good: 0.1, needs_improvement: 0.25 },
            'FID': { good: 100, needs_improvement: 300 },
            'LCP': { good: 2500, needs_improvement: 4000 }
        };
        
        const threshold = thresholds[metric];
        if (!threshold) return 'unknown';
        
        if (value <= threshold.good) return 'good';
        if (value <= threshold.needs_improvement) return 'needs_improvement';
        return 'poor';
    }

    loadUserPreferences() {
        try {
            const preferences = JSON.parse(localStorage.getItem('khai_analytics_preferences'));
            if (preferences) {
                this.config = { ...this.config, ...preferences };
            }
        } catch (error) {
            console.warn('Failed to load analytics preferences');
        }
    }

    updatePreferences(newPreferences) {
        this.config = { ...this.config, ...newPreferences };
        localStorage.setItem('khai_analytics_preferences', JSON.stringify(this.config));
    }

    // Метрики использования приложения
    trackMessageMetrics(message) {
        this.track('message_metrics', {
            length: message.length,
            has_attachments: message.files && message.files.length > 0,
            contains_code: message.content.includes('```'),
            contains_links: /https?:\/\/[^\s]+/.test(message.content)
        });
    }

    trackModelUsage(model, responseTime, tokensUsed) {
        this.track('model_usage', {
            model: model,
            response_time: responseTime,
            tokens_used: tokensUsed,
            tokens_per_second: tokensUsed / (responseTime / 1000)
        });
    }

    trackFeatureUsage(feature, context = {}) {
        this.track('feature_used', {
            feature: feature,
            ...context
        });
    }

    // Аналитика пользовательского поведения
    trackUserBehavior(action, data = {}) {
        this.track('user_behavior', {
            action: action,
            ...data,
            scroll_depth: this.getScrollDepth(),
            time_on_page: this.getTimeOnPage()
        });
    }

    getScrollDepth() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        
        return Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
    }

    getTimeOnPage() {
        return performance.now();
    }

    // Оптимизация производительности
    enablePerformanceOptimization() {
        // Отложенная загрузка аналитики для критического рендеринга
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    // Очистка данных
    clearUserData() {
        localStorage.removeItem('khai_user_id');
        sessionStorage.removeItem('khai_session_id');
        localStorage.removeItem('khai_analytics_preferences');
        this.queue = [];
    }
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsModule;
}
