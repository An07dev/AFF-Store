import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

// Simple Base64 token helper for customer authentication
export function generateToken(payload: object): string {
  const data = JSON.stringify({
    ...payload,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
  });
  return Buffer.from(data).toString('base64');
}

export function verifyToken(token: string): any | null {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const data = JSON.parse(decoded);
    if (data.exp && Date.now() > data.exp) {
      return null;
    }
    return data;
  } catch (error) {
    return null;
  }
}

export function getUserFromRequest(request: Request): any | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  return verifyToken(token);
}