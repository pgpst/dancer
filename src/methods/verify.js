import { ChaCha20, Poly1305 } from '../crypto';
import { Promise } from 'es6-promise';
import bufferEq from 'buffer-equal-constant-time';

export default function verify(key, nonce, tag, body) {
	return new Promise((resolve, reject) => {
		try {
			let keyBuf = key;
			let nonceBuf = nonce;
			let tagBuf = tag;
			let bodyBuf = body;

			if (!(key instanceof Buffer)) {
				keyBuf = new Buffer(key);
			}

			if (!(nonce instanceof Buffer)) {
				nonceBuf = new Buffer(nonce);
			}

			if (!(tag instanceof Buffer)) {
				tagBuf = new Buffer(tag);
			}

			if (!(body instanceof Buffer)) {
				bodyBuf = new Buffer(body);
			}

			// Load up the key into ChaCha20 stream
			const chacha = new ChaCha20(keyBuf, nonceBuf);
			const polyKey = chacha.getBytes(32);

			const poly = new Poly1305(polyKey);
			poly.update(bodyBuf);
			const tag2 = poly.finish();

			if (tag.length !== tag2.length) {
				return reject(new Error('Incorrect tag length'));
			}

			if (!bufferEq(tag, tag2)) {
				return reject(new Error('Incorrect tag'));
			}

			resolve();
		} catch (error) {
			reject(error);
		}
	});
}
