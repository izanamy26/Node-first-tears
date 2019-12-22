module.exports = {
    getGuid:  () => {
        return [
            (Math.random().toString(16).substr(2) + '0'.repeat(12)).substr(0, 12),
            (Math.random().toString(16).substr(2) + '0'.repeat(12)).substr(0, 12),
            (Math.random().toString(16).substr(2, 8) + '0'.repeat(8)).substr(0, 8)
        ].join('-').toUpperCase();
    }
};

