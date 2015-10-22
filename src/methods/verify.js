import { Poly1305 } from '../crypto';

export default function verify(key, tag, body) {
	return new Promise((resolve, reject) => {
		try {
			if (!(tag instanceof Uint8Array)) {
				tag = new Uint8Array(tag);
			}

			if (!(body instanceof Uint8Array)) {
				body = new Uint8Array(body);
			}

			const poly = new Poly1305(key);
			poly.update(body);

			const tag2 = poly.final();

			if (tag.length !== tag2.length) {
				return reject(new Error("Invariable tag lengths"));
			}

			for (let i = 0; i < tag.length; i++) {
				if (tag[i] != tag2[i]) {
					return reject(new Error("Incorrect tag"));
				}
			}

			resolve();
		} catch(e) {
			reject(e);
		}
	});
}
