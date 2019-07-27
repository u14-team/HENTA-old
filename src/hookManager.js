class HookManager {
    constructor() {
        this.actions = {};
    }

    add(tag, func, priority = 500) {
        this.actions[tag] = this.actions[tag] || [];
        this.actions[tag].push({ func, priority });
        this.actions[tag].sort((a, b) => b.priority - a.priority);
    }

    async runOut(tag, ...args) {
        if (!this.actions[tag]) return;
        await Promise.all(this.actions[tag].map( a => a.func(...args) ));
    }

    async run(tag, ...args) {
        if (!this.actions[tag]) return true;

        for (const value of this.actions[tag]) {
            if (await value.func(...args) == false) return false;
        }

        return true;
    }

    addAction(tag, func, priority = 500) { this.add(tag, func, priority) }
    doAction(tag, ...args) { this.run(tag, ...args) }
    doActionSync(tag, ...args) { this.run(tag, ...args) }
}

module.exports = { HookManager };
