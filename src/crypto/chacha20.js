const constants = new Buffer('expand 32-byte k');
/*
function rotate(value, step) {
	return (value << step) | (value >>> (32 - step));
}
*/

export default class ChaCha20 {
	constructor(key, nonce) {
		this.state = new Uint32Array(16);

		this.state[0] = constants.readUInt32LE(0);
		this.state[1] = constants.readUInt32LE(4);
		this.state[2] = constants.readUInt32LE(8);
		this.state[3] = constants.readUInt32LE(12);

		this.state[4] = key.readUInt32LE(0);
		this.state[5] = key.readUInt32LE(4);
		this.state[6] = key.readUInt32LE(8);
		this.state[7] = key.readUInt32LE(12);
		this.state[8] = key.readUInt32LE(16);
		this.state[9] = key.readUInt32LE(20);
		this.state[10] = key.readUInt32LE(24);
		this.state[11] = key.readUInt32LE(28);

		this.state[12] = 0;
		this.state[13] = 0;

		this.state[14] = nonce.readUInt32LE(0);
		this.state[15] = nonce.readUInt32LE(4);

		this.block = new Buffer(64);
		this.offset = 0;

		this.advance();
	}

	advance() {
		core(this.state, this.block);

		this.offset = 0;
		let i = this.state[12] + 1;
		if (i > 4294967295) {
			i = 0;
			this.state[13] += 1;
		}

		this.state[12] = i;
	}

	getBytes(len) {
		let i = 0;
		let result = new Buffer(len);

		while(i < len) {
			const gap = 64 - this.offset;

			let limit = i + gap;
			if (limit > len) {
				limit = len;
			}

			let o = this.offset;
			for (let j = i; j < limit; j++) {
				result[j] = s.block[o];
				o++;
			}

			i += gap;
			this.offset = o;

			if (o == 64) {
				s.advance();
			}
		}

		return result;
	}
/*
	getBytes(len) {
		let left = len;
		let dpos = 0;
		const dst = new Buffer(len);
		const cacheLen = 64 - this.cachePos;

		if (cacheLen) {
			if (cacheLen >= left) {
				this.output.copy(dst, 0, this.cachePos, 64);
				this.cachePos += left;
				return dst;
			}

			this.output.copy(dst, 0, this.cachePos, 64);
			left -= cacheLen;
			dpos += cacheLen;
			this.cachePos = 64;
		}

		while (left > 0 ) {
			if (left <= 64) {
				this.makeBlock(this.output, 0);
				this.output.copy(dst, dpos, 0, left);
				if (left < 64) {
					this.cachePos = left;
				}
				return dst;
			}

			this.makeBlock(dst, dpos);
			left -= 64;
			dpos += 64;
		}

		throw new Error('Stream generation failure');
	}
*/
}

function core(input, output) {
	let x00 = input[0];
	let x01 = input[1];
	let x02 = input[2];
	let x03 = input[3];
	let x04 = input[4];
	let x05 = input[5];
	let x06 = input[6];
	let x07 = input[7];
	let x08 = input[8];
	let x09 = input[9];
	let x10 = input[10];
	let x11 = input[11];
	let x12 = input[12];
	let x13 = input[13];
	let x14 = input[14];
	let x15 = input[15];

	let x;

	// Apparently unrolled 20 rounds are not optimized well.
	// Will have to check it in V8.
	for(let i = 0; i < 10; i++) {
		x00 += x04;
		x = x12 ^ x00;
		x12 = (x << 16) | (x >>> 16);
		x08 += x12;
		x = x04 ^ x08;
		x04 = (x << 12) | (x >>> 20);
		x00 += x04;
		x = x12 ^ x00;
		x12 = (x << 8) | (x >>> 24);
		x08 += x12;
		x = x04 ^ x08;
		x04 = (x << 7) | (x >>> 25);
		x01 += x05;
		x = x13 ^ x01;
		x13 = (x << 16) | (x >>> 16);
		x09 += x13;
		x = x05 ^ x09;
		x05 = (x << 12) | (x >>> 20);
		x01 += x05;
		x = x13 ^ x01;
		x13 = (x << 8) | (x >>> 24);
		x09 += x13;
		x = x05 ^ x09;
		x05 = (x << 7) | (x >>> 25);
		x02 += x06;
		x = x14 ^ x02;
		x14 = (x << 16) | (x >>> 16);
		x10 += x14;
		x = x06 ^ x10;
		x06 = (x << 12) | (x >>> 20);
		x02 += x06;
		x = x14 ^ x02;
		x14 = (x << 8) | (x >>> 24);
		x10 += x14;
		x = x06 ^ x10;
		x06 = (x << 7) | (x >>> 25);
		x03 += x07;
		x = x15 ^ x03;
		x15 = (x << 16) | (x >>> 16);
		x11 += x15;
		x = x07 ^ x11;
		x07 = (x << 12) | (x >>> 20);
		x03 += x07;
		x = x15 ^ x03;
		x15 = (x << 8) | (x >>> 24);
		x11 += x15;
		x = x07 ^ x11;
		x07 = (x << 7) | (x >>> 25);
		x00 += x05;
		x = x15 ^ x00;
		x15 = (x << 16) | (x >>> 16);
		x10 += x15;
		x = x05 ^ x10;
		x05 = (x << 12) | (x >>> 20);
		x00 += x05;
		x = x15 ^ x00;
		x15 = (x << 8) | (x >>> 24);
		x10 += x15;
		x = x05 ^ x10;
		x05 = (x << 7) | (x >>> 25);
		x01 += x06;
		x = x12 ^ x01;
		x12 = (x << 16) | (x >>> 16);
		x11 += x12;
		x = x06 ^ x11;
		x06 = (x << 12) | (x >>> 20);
		x01 += x06;
		x = x12 ^ x01;
		x12 = (x << 8) | (x >>> 24);
		x11 += x12;
		x = x06 ^ x11;
		x06 = (x << 7) | (x >>> 25);
		x02 += x07;
		x = x13 ^ x02;
		x13 = (x << 16) | (x >>> 16);
		x08 += x13;
		x = x07 ^ x08;
		x07 = (x << 12) | (x >>> 20);
		x02 += x07;
		x = x13 ^ x02;
		x13 = (x << 8) | (x >>> 24);
		x08 += x13;
		x = x07 ^ x08;
		x07 = (x << 7) | (x >>> 25);
		x03 += x04;
		x = x14 ^ x03;
		x14 = (x << 16) | (x >>> 16);
		x09 += x14;
		x = x04 ^ x09;
		x04 = (x << 12) | (x >>> 20);
		x03 += x04;
		x = x14 ^ x03;
		x14 = (x << 8) | (x >>> 24);
		x09 += x14;
		x = x04 ^ x09;
		x04 = (x << 7) | (x >>> 25);
	}

	output.fill(0);

	output.writeUInt32LE(x00, 0);
	output.writeUInt32LE(x01, 4);
	output.writeUInt32LE(x02, 8);
	output.writeUInt32LE(x03, 12);
	output.writeUInt32LE(x04, 16);
	output.writeUInt32LE(x05, 20);
	output.writeUInt32LE(x06, 24);
	output.writeUInt32LE(x07, 28);
	output.writeUInt32LE(x08, 32);
	output.writeUInt32LE(x09, 36);
	output.writeUInt32LE(x10, 40);
	output.writeUInt32LE(x11, 44);
	output.writeUInt32LE(x12, 48);
	output.writeUInt32LE(x13, 52);
	output.writeUInt32LE(x14, 56);
	output.writeUInt32LE(x15, 60);

	/* output[0] = x00;
	output[1] = x01;
	output[2] = x02;
	output[3] = x03;
	output[4] = x04;
	output[5] = x05;
	output[6] = x06;
	output[7] = x07;
	output[8] = x08;
	output[9] = x09;
	output[10] = x10;
	output[11] = x11;
	output[12] = x12;
	output[13] = x13;
	output[14] = x14;
	output[15] = x15; */
}