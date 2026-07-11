const axios = require('axios');
const pool = require('./db');

const CHECK_INTERVAL_MS = 60_000;
const REQUEST_TIMEOUT_MS = 5000;

let isRunning = false;

async function recordCheck(urlId, statusCode, responseTimeMs, isUp, errorMessage) {
  await pool.query(
    `INSERT INTO checks (url_id, status_code, response_time_ms, is_up, error_message)
     VALUES ($1, $2, $3, $4, $5)`,
    [urlId, statusCode, responseTimeMs, isUp, errorMessage],
  );
}

async function checkUrl(row) {
  const start = Date.now();

  try {
    const response = await axios.get(row.url, {
      timeout: REQUEST_TIMEOUT_MS,
      validateStatus: () => true,
    });
    const responseTimeMs = Date.now() - start;
    const isUp = response.status >= 200 && response.status < 400;

    await recordCheck(
      row.id,
      response.status,
      responseTimeMs,
      isUp,
      isUp ? null : `HTTP ${response.status}`,
    );
  } catch (err) {
    const responseTimeMs = Date.now() - start;
    await recordCheck(row.id, null, responseTimeMs, false, err.message);
  }
}

async function runCycle() {
  if (isRunning) {
    console.log('Skipping check cycle: previous cycle still in progress');
    return;
  }

  isRunning = true;
  try {
    const { rows } = await pool.query('SELECT id, url FROM urls');
    await Promise.all(rows.map(checkUrl));
  } catch (err) {
    console.error('Check cycle failed:', err);
  } finally {
    isRunning = false;
  }
}

function startScheduler() {
  runCycle();
  setInterval(runCycle, CHECK_INTERVAL_MS);
}

module.exports = { startScheduler, runCycle };
