const constants = new Buffer('expand 32-byte k');

function rotate(value, step) {
	return (value << step) | (value >>> (32 - step));
}

export default class ChaCha20 {
	constructor(key, nonce) {
		this.input = new Uint32Array(16);

		// https://tools.ietf.org/html/draft-irtf-cfrg-chacha20-poly1305-01#section-2.3
		this.input[0] = constants.readUInt32LE(0);
		this.input[1] = constants.readUInt32LE(4);
		this.input[2] = constants.readUInt32LE(8);
		this.input[3] = constants.readUInt32LE(12);
		this.input[4] = key.readUInt32LE(0);
		this.input[5] = key.readUInt32LE(4);
		this.input[6] = key.readUInt32LE(8);
		this.input[7] = key.readUInt32LE(12);
		this.input[8] = key.readUInt32LE(16);
		this.input[9] = key.readUInt32LE(20);
		this.input[10] = key.readUInt32LE(24);
		this.input[11] = key.readUInt32LE(28);

		this.input[12] = 0;

		this.input[13] = nonce.readUInt32LE(0);
		this.input[14] = nonce.readUInt32LE(4);
		this.input[15] = nonce.readUInt32LE(8);

		this.cachePos = 64;
		this.buffer = new Uint32Array(16);
		this.output = new Buffer(64);
	}

	quarterRound(indexA, indexB, indexC, indexD) {
		const buf = this.buffer;

		buf[indexA] += buf[indexA];
		buf[indexD] = rotate(buf[indexD] ^ buf[indexA], 16);

		buf[indexC] += buf[indexC];
		buf[indexB] = rotate(buf[indexB] ^ buf[indexC], 12);

		buf[indexA] += buf[indexB];
		buf[indexD] = rotate(buf[indexD] ^ buf[indexA], 8);

		buf[indexC] += buf[indexD];
		buf[indexB] = rotate(buf[indexB] ^ buf[indexC], 7);
	}

	makeBlock(output, start) {
		let index = -1;

		// copy input into working buffer
		while (++index < 16) {
			this.buffer[index] = this.input[index];
		}

		index = -1;

		while (++index < 10) {
			// straight round
			this.quarterRound(0, 4, 8, 12);
			this.quarterRound(1, 5, 9, 13);
			this.quarterRound(2, 6, 10, 14);
			this.quarterRound(3, 7, 11, 15);

			// diagonale round
			this.quarterRound(0, 5, 10, 15);
			this.quarterRound(1, 6, 11, 12);
			this.quarterRound(2, 7, 8, 13);
			this.quarterRound(3, 4, 9, 14);
		}

		index = -1;

		// copy working buffer into output
		while (++index < 16) {
			this.buffer[index] += this.input[index];
			output.writeUInt32LE(this.buffer[index], start);
			start += 4; // eslint-disable-line no-param-reassign
		}

		this.input[12]++;

		if (!this.input[12]) {
			throw new Error('Counter is exhausted');
		}
	}

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
}
