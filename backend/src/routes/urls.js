const express = require('express');
const asyncHandler = require('../services/asyncHandler');
const urlsHandlers = require('../handlers/urlsHandlers');

const router = express.Router();

router.post('/', asyncHandler(urlsHandlers.createUrl));
router.get('/', asyncHandler(urlsHandlers.listUrls));
router.get('/:id/checks', asyncHandler(urlsHandlers.getUrlChecks));
router.delete('/:id', asyncHandler(urlsHandlers.deleteUrl));

module.exports = router;
