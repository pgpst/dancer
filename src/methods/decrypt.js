import { ChaCha20, xor } from '../crypto';

export default function decrypt(key, nonce, body) {
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

			const chacha = new ChaCha20(keyBuf, nonceBuf);
			const stream = chacha.getBytes(bodyBuf.length);

			resolve(xor(body, stream));
		} catch (error) {
			reject(error);
		}
	});
}
