import { ChaCha20, Poly1305, xor, randomBuffer } from '../crypto';
import { Promise } from 'es6-promise';

export default function encrypt(key, body) {
	return new Promise((resolve, reject) => {
		try {
			let keyBuf = key;
			let bodyBuf = body;

			if (!(key instanceof Buffer)) {
				keyBuf = new Buffer(key);
			}

			if (!(body instanceof Buffer)) {
				bodyBuf = new Buffer(body);
			}

			const nonce = randomBuffer(8);

			// Set up a new stream
			const chacha = new ChaCha20(keyBuf, nonce);

			// Get the key for Poly1305 encryption
			const polyKey = chacha20.getBytes(32);

			// Get the bytes for rest of the encryption
			const stream = chacha.getBytes(bodyBuf.length);

			// Do the xorring
			const cipher = xor(body, stream);

			// Calculate the checksum
			const poly = new Poly1305(polyKey);
			poly.update(cipher);
			const tag = poly.finish();

			// Resolve the promise
			resolve(nonce, tag, cipher);
		} catch (error) {
			reject(error);
		}
	});
}
