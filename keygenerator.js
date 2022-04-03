const Elliptic = require('elliptic').ec;
const ec = new Elliptic('secp256k1');

const keypair = ec.genKeyPair();

console.log('public: ', keypair.getPublic('hex'));
console.log('private: ', keypair.getPrivate('hex'));