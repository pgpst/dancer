import { ChaCha20, xor } from '../crypto';

export default function decrypt(key, nonce, body) {
	return new Promise((resolve, reject) => {
		try {
			let keyArray = key;
			let nonceArray = nonce;
			let bodyArray = body;

			if (!(key instanceof Uint8Array)) {
				keyArray = new Uint8Array(key);
			}

			if (!(nonce instanceof Uint8Array)) {
				nonceArray = new Uint8Array(nonce);
			}

			if (!(body instanceof Uint8Array)) {
				bodyArray = new Uint8Array(body);
			}

			const chacha = new ChaCha20(keyArray, nonceArray);
			const stream = chacha.getBytes(bodyArray.length);

			resolve(xor(body, stream));
		} catch (error) {
			reject(error);
		}
	});
}
