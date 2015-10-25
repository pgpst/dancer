import { ChaCha20, xor, randomArray } from '../crypto';

export default function encrypt(key, body) {
	return new Promise((resolve, reject) => {
		try {
			let keyArray = key;
			let bodyArray = body;

			if (!(key instanceof Uint8Array)) {
				keyArray = new Uint8Array(key);
			}

			if (!(body instanceof Uint8Array)) {
				bodyArray = new Uint8Array(body);
			}

			const nonce = randomArray(8);

			const chacha = new ChaCha20(keyArray, nonce);
			const stream = chacha.getBytes(bodyArray.length);

			resolve(nonce, xor(body, stream));
		} catch (error) {
			reject(error);
		}
	});
}
