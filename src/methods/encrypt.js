import { ChaCha20, xor, randomBuffer } from '../crypto';
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

			const chacha = new ChaCha20(keyBuf, nonce);
			const stream = chacha.getBytes(bodyBuf.length);

			resolve(nonce, xor(body, stream));
		} catch (error) {
			reject(error);
		}
	});
}
