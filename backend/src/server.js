require('dotenv').config();

const express = require('express');
const cors = require('cors');
const pool = require('./db');
const { startScheduler } = require('./services/scheduler');
const { sendSuccess, sendError } = require('./services/response');
const STATUS = require('./services/statusCodes');

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';

pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err);
});

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    sendSuccess(res, { statusCode: STATUS.OK, message: 'Database reachable', data: null });
  } catch (err) {
    sendError(res, { statusCode: STATUS.SERVICE_UNAVAILABLE, message: 'Database unavailable' });
  }
});

app.use('/api/urls', require('./routes/urls'));

app.use((err, req, res, next) => {
  console.error(err);
  sendError(res, {
    statusCode: STATUS.INTERNAL_SERVER_ERROR,
    message: 'Internal server error',
    error: { detail: err.message },
  });
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
  startScheduler();
});
