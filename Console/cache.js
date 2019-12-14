'use strict';

const DEFAULT_EXPIRED_PERIOD = 60 * 1000; // (ms)

class Cache {
    constructor() {
        this.cache = new Map(); //data, expiredIn
        this.maxKey = 50;
    }

    set(key, data, params = {}) {
        let storageTime = params.expiresIn && params.expiresIn > 0 
                            ? Number(params.expiresIn) 
                            : DEFAULT_EXPIRED_PERIOD;

        if (key && data) {
            if (this.cache.size >= this.maxKey) { 
                this.pop();
            }
 
            this.cache.set(key, data);

            setTimeout(() => {
                this.delete(key)
            }, storageTime);

            console.log('Cache set: ', this.cache);    

            return 'Ok';
        } 

        return new Error('Error of writing cache');
    }


    get(key) {
        if (!key || !this.cache.has(key)) {
            /* return new Error(`Unknown ${key}`); */
            return Promise.reject(`Unknown ${key}`);
        }

        return Promise.resolve(this.cache.get(key)); 
    }


    delete(key) {
        if (!key || !this.cache.has(key)) {
            return new Error(`Unknown ${key}`);
        }
       
        this.cache.delete(key);
        return 'Ok';
    }

    pop() {
        const first = Array.from(this.cache.keys())[0];
        this.delete(first);
    }
}

module.exports = new Cache();