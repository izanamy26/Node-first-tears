const files = require('../helpers/files');
const params = require('../config/config');

module.exports = {
    getUserStat: () => {
        return files.getContentAllFiles(process.cwd() + params.storageFolder)
            .then(files => {
               return files.reduce((stat, file) => {
                    stat[file.user] = !stat[file.user] ? 1 : stat[file.user] + 1;
                    return stat;
                }, {});
            })
    }
};