import forge from 'node-forge';

/**
 * 生成 RSA 密钥对
 * 运行: node -e "require('./scripts/generate-keys.js')"
 */
function generateKeyPair() {
  const keypair = forge.pki.rsa.generateKeyPair(2048);
  const publicKey = forge.pki.publicKeyToPem(keypair.publicKey);
  const privateKey = forge.pki.privateKeyToPem(keypair.privateKey);

  console.log('=== RSA Public Key (for NEXT_PUBLIC_RSA_PUBLIC_KEY) ===');
  console.log(publicKey);
  console.log('\n=== RSA Private Key (for RSA_PRIVATE_KEY) ===');
  console.log(privateKey);
  console.log('\n=== Add these to .env.local ===');
  console.log('NEXT_PUBLIC_RSA_PUBLIC_KEY="' + publicKey.replace(/\n/g, '\\n') + '"');
  console.log('RSA_PRIVATE_KEY="' + privateKey.replace(/\n/g, '\\n') + '"');
}

generateKeyPair();
