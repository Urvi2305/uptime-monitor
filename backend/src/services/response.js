function sendSuccess(res, { statusCode = 200, message = 'Success', data = null } = {}) {
  res.status(statusCode).json({ success: true, message, statusCode, data });
}

function sendError(res, { statusCode = 500, message = 'Something went wrong', error = null } = {}) {
  res.status(statusCode).json({ success: false, message, statusCode, error });
}

module.exports = { sendSuccess, sendError };
