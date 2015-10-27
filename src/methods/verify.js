import { Poly1305 } from '../crypto';
import { Promise } from 'es6-promise';

export default function verify(key, tag, body) {
	return new Promise((resolve, reject) => {
		try {
			let keyBuf = key;
			let tagBuf = tag;
			let bodyBuf = body;

			if (!(key instanceof Buffer)) {
				keyBuf = new Buffer(key);
			}

			if (!(tag instanceof Buffer)) {
				tagBuf = new Buffer(tag);
			}

			if (!(body instanceof Buffer)) {
				bodyBuf = new Buffer(body);
			}

			const poly = new Poly1305(keyBuf);
			poly.update(bodyBuf);

			const tag2 = poly.final();

			if (tag.length !== tag2.length) {
				return reject(new Error('Incorrect tag length'));
			}

			for (let index = 0; index < tag.length; index++) {
				if (tagBuf[index] !== tag2[index]) {
					return reject(new Error('Incorrect tag'));
				}
			}

			resolve();
		} catch (error) {
			reject(error);
		}
	});
}
