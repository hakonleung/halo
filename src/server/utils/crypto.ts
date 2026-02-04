import forge from 'node-forge';

/**
 * Server-side decryption function (server-side only)
 */
export function decryptPassword(encryptedPassword64: string): string {
  const privateKeyPem = process.env.RSA_PRIVATE_KEY;
  if (!privateKeyPem) {
    throw new Error('RSA_PRIVATE_KEY is not defined in environment variables');
  }

  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const encryptedBytes = forge.util.decode64(encryptedPassword64);
  const decrypted = privateKey.decrypt(encryptedBytes, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
    mgf1: {
      md: forge.md.sha256.create(),
    },
  });
  return decrypted;
}
