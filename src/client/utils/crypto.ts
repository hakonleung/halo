import forge from 'node-forge';

/**
 * Client-side encryption function
 * Encrypts password using public key from NEXT_PUBLIC_RSA_PUBLIC_KEY environment variable
 */
export function encryptPassword(password: string): string {
  const publicKeyPem = process.env.NEXT_PUBLIC_RSA_PUBLIC_KEY;
  if (!publicKeyPem) {
    throw new Error('NEXT_PUBLIC_RSA_PUBLIC_KEY is not defined in environment variables');
  }

  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encrypted = publicKey.encrypt(password, 'RSA-OAEP', {
    md: forge.md.sha256.create(),
    mgf1: {
      md: forge.md.sha256.create(),
    },
  });
  return forge.util.encode64(encrypted);
}
