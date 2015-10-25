import { Poly1305 } from '../crypto';

export default function verify(key, tag, body) {
	return new Promise((resolve, reject) => {
		try {
			let keyArray = key;
			let tagArray = tag;
			let bodyArray = body;

			if (!(key instanceof Uint8Array)) {
				keyArray = new Uint8Array(key);
			}

			if (!(tag instanceof Uint8Array)) {
				tagArray = new Uint8Array(tag);
			}

			if (!(body instanceof Uint8Array)) {
				bodyArray = new Uint8Array(body);
			}

			const poly = new Poly1305(keyArray);
			poly.update(bodyArray);

			const tag2 = poly.final();

			if (tag.length !== tag2.length) {
				return reject(new Error('Invariable tag lengths'));
			}

			for (let index = 0; index < tag.length; index++) {
				if (tagArray[index] !== tag2[index]) {
					return reject(new Error('Incorrect tag'));
				}
			}

			resolve();
		} catch (error) {
			reject(error);
		}
	});
}
