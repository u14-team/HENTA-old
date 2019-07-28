/** Класс предоставляет систему событий */
class HookManager {
    /**
    * Создает экземпляр HookManager.
    *
    * @constructor
    * @param {Henta} henta Экземпляр движка.
    */
    constructor(henta) {
        this.actions = {};
    }

    /**
     * Подписаться на событие
     *
     * @param {String} tag Тег события.
     * @param {Function} func Функция события.
     * @param {integer} [priority=500] Приоритет.
     */
    add(tag, func, priority = 500) {
        this.actions[tag] = this.actions[tag] || [];
        this.actions[tag].push({ func, priority });
        this.actions[tag].sort((a, b) => b.priority - a.priority);
    }

    /**
     * Вызвать событие без очереди и ожидания ответа
     *
     * @param {String} tag Тег события.
     * @param {Object[]} [args] Прочие аргументы.
     */
    async runOut(tag, ...args) {
        if (!this.actions[tag]) return;
        await Promise.all(this.actions[tag].map( a => a.func(...args) ));
    }

    /**
     * Вызвать событие
     *
     * @param {String} tag Тег события.
     * @param {Object[]} [args] Прочие аргументы.
     * @return {Promise<Boolean>} false, если кто-то отменил событие
     */
    async run(tag, ...args) {
        if (!this.actions[tag]) return true;

        for (const value of this.actions[tag]) {
            if (await value.func(...args) == false) return false;
        }

        return true;
    }
}

module.exports = { HookManager };
