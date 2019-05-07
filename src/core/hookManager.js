class HookManager {
    constructor() {
        this.actions = {};
    }

    addAction(tag, func, priority = 500) {
        this.actions[tag] = this.actions[tag] || [];
        this.actions[tag].push({ func, priority });
        this.actions[tag].sort((a, b) => b.priority - a.priority);
    }

    doActionSync(tag, ...args) {
        if (!this.actions[tag]) return true;
        for (let value of this.actions[tag]) {
            if (value.func(...args) == false) return false;
        }

        return true;
    }

    async doAction(tag, ...args) {
        return this.doActionSync(tag, ...args);
    }
}

module.exports = { HookManager };
