'use strict';

const DEFAULT_EXPIRED_PERIOD = 60 * 1000; // (ms)

class Cache {
    constructor() {
        this.cache = {}; //data, expiredIn
        this.maxKey = 50;
    }

    set(key, data, params = {}) {
        let expiredTime = Number(new Date()) + (params.expiresIn && params.expiresIn > 0 
                                                ? Number(params.expiresIn) 
                                                : DEFAULT_EXPIRED_PERIOD);

        if (key && data && Object.keys(this.cache).length < this.maxKey) {
            this.cache[key] = {
                data: JSON.stringify(data),
                expiredIn: expiredTime
            };
           
            return Promise.resolve(true);
        }
        
        return Promise.reject(false);
    }

    get(key) {
        let response = {
            error: 0
        };

        if (key && this.cache[key]) {
             let currentTime = Number(new Date());
             
             if (currentTime < this.cache[key].expiredIn) {
                 response.data = JSON.parse(this.cache[key].data);
             } else {
                 this.delete(key);
                 response.error = 1;
                 response.message = 'Time is expired, data is removed';
             }  
        } else {
            response.error = 1;
            response.message = `Unknown key ${key}`;
        }

        return Promise.resolve(response);
    }

    delete(key) {
        if (key && this.cache[key]) {
            delete this.cache[key];
            return Promise.resolve(true);
        }
    }
}

module.exports = new Cache();