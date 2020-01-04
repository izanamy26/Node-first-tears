const express = require('express');
const statRoutes = require('./stat.js');
const cimagesRoutes = require('./cimages.js');

const router = express.Router();

router.use('/cimages', cimagesRoutes);
router.use('/stat/cimages', statRoutes);

module.exports = router;