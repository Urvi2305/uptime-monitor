const pool = require('../db');
const { sendSuccess, sendError } = require('../utils/response');
const STATUS = require('../utils/statusCodes');

const UNIQUE_VIOLATION = '23505';
const MAX_URL_LENGTH = 2048;

function isPositiveInteger(value) {
  return /^\d+$/.test(value);
}

function isValidUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

async function createUrl(req, res) {
  const { url: rawUrl } = req.body;

  if (!rawUrl || typeof rawUrl !== 'string') {
    return sendError(res, { statusCode: STATUS.BAD_REQUEST, message: 'A valid http/https url is required' });
  }

  const url = rawUrl.trim();

  if (!url || !isValidUrl(url)) {
    return sendError(res, { statusCode: STATUS.BAD_REQUEST, message: 'A valid http/https url is required' });
  }

  if (url.length > MAX_URL_LENGTH) {
    return sendError(res, {
      statusCode: STATUS.BAD_REQUEST,
      message: `url must be ${MAX_URL_LENGTH} characters or fewer`,
    });
  }

  try {
    const { rows } = await pool.query(
      'INSERT INTO urls (url) VALUES ($1) RETURNING id, url, created_at',
      [url],
    );

    sendSuccess(res, {
      statusCode: STATUS.CREATED,
      message: 'URL registered successfully',
      data: rows[0],
    });
  } catch (err) {
    if (err.code === UNIQUE_VIOLATION) {
      return sendError(res, {
        statusCode: STATUS.CONFLICT,
        message: 'This URL is already being monitored',
      });
    }
    throw err;
  }
}

const DEFAULT_PAGE_LIMIT = 20;
const MAX_PAGE_LIMIT = 100;

function parsePagination(query) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || DEFAULT_PAGE_LIMIT, 1), MAX_PAGE_LIMIT);
  return { page, limit, offset: (page - 1) * limit };
}

async function listUrls(req, res) {
  const { page, limit, offset } = parsePagination(req.query);

  const [{ rows: countRows }, { rows }] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS total FROM urls'),
    pool.query(
      `SELECT
         u.id, u.url, u.created_at,
         c.status_code, c.response_time_ms, c.is_up, c.checked_at, c.error_message
       FROM urls u
       LEFT JOIN LATERAL (
         SELECT status_code, response_time_ms, is_up, checked_at, error_message
         FROM checks
         WHERE checks.url_id = u.id
         ORDER BY checked_at DESC
         LIMIT 1
       ) c ON true
       ORDER BY u.created_at ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    ),
  ]);

  const total = countRows[0].total;

  sendSuccess(res, {
    statusCode: STATUS.OK,
    message: 'URLs fetched successfully',
    data: {
      items: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    },
  });
}

async function getUrlChecks(req, res) {
  const { id } = req.params;

  if (!isPositiveInteger(id)) {
    return sendError(res, { statusCode: STATUS.BAD_REQUEST, message: 'id must be a positive integer' });
  }

  const { rows } = await pool.query(
    `SELECT id, status_code, response_time_ms, is_up, checked_at, error_message
     FROM checks
     WHERE url_id = $1
     ORDER BY checked_at DESC`,
    [id],
  );

  sendSuccess(res, { statusCode: STATUS.OK, message: 'Checks fetched successfully', data: rows });
}

async function deleteUrl(req, res) {
  const { id } = req.params;

  if (!isPositiveInteger(id)) {
    return sendError(res, { statusCode: STATUS.BAD_REQUEST, message: 'id must be a positive integer' });
  }

  const { rowCount } = await pool.query('DELETE FROM urls WHERE id = $1', [id]);

  if (rowCount === 0) {
    return sendError(res, { statusCode: STATUS.NOT_FOUND, message: 'URL not found' });
  }

  sendSuccess(res, { statusCode: STATUS.OK, message: 'URL deleted successfully', data: null });
}

module.exports = { createUrl, listUrls, getUrlChecks, deleteUrl };
