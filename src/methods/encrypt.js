import { ChaCha20, Poly1305, xor } from '../crypto';
import { Promise } from 'es6-promise';

export default function encrypt(key, nonce, body) {
	return new Promise((resolve, reject) => {
		try {
			let keyBuf = key;
			let nonceBuf = nonce;
			let bodyBuf = body;

			if (!(key instanceof Buffer)) {
				keyBuf = new Buffer(key);
			}

			if (!(nonce instanceof Buffer)) {
				nonceBuf = new Buffer(nonce);
			}

			if (!(body instanceof Buffer)) {
				bodyBuf = new Buffer(body);
			}

			// Set up a new stream
			const chacha = new ChaCha20(keyBuf, nonceBuf);

			// Get the key for Poly1305 encryption
			const polyKey = chacha.getBytes(32);

			// Get the bytes for rest of the encryption
			const stream = chacha.getBytes(bodyBuf.length);

			// Do the xorring
			const cipher = xor(body, stream);

			// Calculate the checksum
			const poly = new Poly1305(polyKey);
			poly.update(cipher);
			const tag = poly.finish();

			// Resolve the promise
			resolve([tag, cipher]);
		} catch (error) {
			reject(error);
		}
	});
}
