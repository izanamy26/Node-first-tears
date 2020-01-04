const params = require('../config/cache');

class Cache {
    constructor() {
        this.cache = new Map(); //data, expiredIn
        this.maxCountKey = params.maxCount;
        this.defaultExpiredPeriod = params.defaultExpiredPeriod;
        this.periodCheckingKeys = params.periodCheckingKeys;

        const timer = setInterval(this.clear.bind(this), this.periodCheckingKeys);
        timer.unref();
    }

    set(key, data, params = {}) {
        let storageTime = params.expiresIn && params.expiresIn > 0 
                            ? Number(params.expiresIn) 
                            : this.defaultExpiredPeriod;

        if (key && data) {
            if (this.cache.size >= this.maxCountKey) { 
                this.pop();
            }

            this.cache.set(key, {data: data, expiredIn: Number(new Date()) + storageTime});

            return true;
        } 

        return new Error('Error of writing cache');
    }


    get(key) {
        if (!key || !this.cache.has(key)) {
            return Promise.resolve(undefined);
        }

        return Promise.resolve(this.cache.get(key).data); 
    }


    delete(key) {
        if (!key || !this.cache.has(key)) {
            return new Error(`Unknown ${key}`);
        }
       
        this.cache.delete(key);
        return true;
    }

    pop() {
        const first = Array.from(this.cache.keys())[0];
        this.delete(first);
    }

    clear() {
        const currentTime = Number(new Date());
        for (let item of this.cache) {
            const expiredIn = item[1].expiredIn;
            
            if (currentTime >= expiredIn) {
                this.cache.delete(item[0]);
            } 
        }

    }
}

module.exports = new Cache();