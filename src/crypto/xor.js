export default function XOR(a, b) {
	const r = new Uint8Array();
	
	for (let i = 0; i < a.length; i++) {
		r.push(a[i] ^ b[i]);
	}

	return r;
}