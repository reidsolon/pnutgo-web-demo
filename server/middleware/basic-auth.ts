export default defineEventHandler((event) => {
  // Skip auth in development mode (optional - remove if you want auth in dev too)
  // if (process.dev) return;

  const config = useRuntimeConfig();
  const basicAuthUser = config.basicAuthUser;
  const basicAuthPass = config.basicAuthPass;

  // Skip if basic auth is not configured
  if (!basicAuthUser || !basicAuthPass) {
    return;
  }

  const authHeader = getHeader(event, 'authorization');

  if (!authHeader) {
    setResponseStatus(event, 401);
    setResponseHeader(event, 'WWW-Authenticate', 'Basic realm="Restricted Area"');
    return 'Authentication required';
  }

  const [scheme, encoded] = authHeader.split(' ');

  if (scheme !== 'Basic' || !encoded) {
    setResponseStatus(event, 401);
    setResponseHeader(event, 'WWW-Authenticate', 'Basic realm="Restricted Area"');
    return 'Authentication required';
  }

  const decoded = Buffer.from(encoded, 'base64').toString();
  const [username, password] = decoded.split(':');

  if (username !== basicAuthUser || password !== basicAuthPass) {
    setResponseStatus(event, 401);
    setResponseHeader(event, 'WWW-Authenticate', 'Basic realm="Restricted Area"');
    return 'Unauthorized';
  }

  // Authentication successful, continue to the next handler
});
