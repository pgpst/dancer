import { ChaCha20, XOR } from '../crypto';

export default decrypt(key, nonce, body) {
	return new Promise((resolve, reject) => {
		try {
			if (!(key instanceof Uint8Array)) {
				key = new Uint8Array(key);
			}

			if (!(nonce instanceof Uint8Array)) {
				nonce = new Uint8Array(nonce);
			}

			if (!(body instanceof Uint8Array)) {
				body = new Uint8Array(body);
			}

			const chacha = new ChaCha20(key, nonce);
			const stream = chacha.getBytes(body.length);

			resolve(XOR(body, stream));
		} catch(e) {
			reject(e);
		}
	});
}