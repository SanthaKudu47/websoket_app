export function sendResponse(
  expressRes,
  status = 200,
  error = null,
  data = null,
) {
  expressRes.status(status).json({ status, data, error });
}
