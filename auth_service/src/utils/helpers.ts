import crypto from 'crypto';

export const random = () => crypto.randomBytes(128).toString('base64url');
export const authentication = (password: string, salt: string) => {
    return crypto.createHmac('sha256', [salt, password].join('/')).update('').digest('hex');
}

export const verifyPassword = (password: string, salt: string, storedHash: string): boolean => {
    const hash = authentication(password, salt);
    return storedHash == hash;
}