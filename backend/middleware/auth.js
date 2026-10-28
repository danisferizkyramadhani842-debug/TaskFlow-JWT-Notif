import jwt from 'jsonwebtoken';
import 'dotenv/config';

const JWT_ISSUER = 'taskflow-api';
const JWT_AUDIENCE = 'taskflow-mobile';

export function wajibLogin(req, res, next) {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.trim().split(/\s+/);

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ pesan: 'token diperlukan' });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ['HS256'],
    });
    return next();
  } catch (error) {
    return res.status(401).json({
      pesan: error.name === 'TokenExpiredError' ? 'token kedaluwarsa' : 'token tidak valid',
    });
  }
}

export { JWT_ISSUER, JWT_AUDIENCE };
