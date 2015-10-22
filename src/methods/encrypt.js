import { ChaCha20, XOR, RandomArray } from '../crypto';

export default encrypt(key, body) {
	return new Promise((resolve, reject) => {
		try {
			if (!(key instanceof Uint8Array)) {
				key = new Uint8Array(key);
			}

			if (!(body instanceof Uint8Array)) {
				body = new Uint8Array(body);
			}

			const nonce = RandomArray(8);

			const chacha = new ChaCha20(key, nonce);
			const stream = chacha.getBytes(body.length);

			resolve(nonce, XOR(body, stream));
		} catch(e) {
			reject(e);
		}
	});
}