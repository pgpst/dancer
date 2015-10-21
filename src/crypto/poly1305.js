const Poly1305KeySize = 32;
const Poly1305TagSize = 16;

export default class Poly1305 {
	constructor(key) {
		this.buffer = new Buffer(16);
		this.leftover = 0;
		this.r = new Uint16Array(10);
		this.h = new Uint16Array(10);
		this.pad = new Uint16Array(8);
		this.finished = 0;

		var t = new Uint16Array(8), i;

		for (i = 8; i--;) t[i] = key.readUInt16LE(i*2);

		this.r[0] =   t[0]                         & 0x1fff;
		this.r[1] = ((t[0] >>> 13) | (t[1] <<  3)) & 0x1fff;
		this.r[2] = ((t[1] >>> 10) | (t[2] <<  6)) & 0x1f03;
		this.r[3] = ((t[2] >>>  7) | (t[3] <<  9)) & 0x1fff;
		this.r[4] = ((t[3] >>>  4) | (t[4] << 12)) & 0x00ff;
		this.r[5] =  (t[4] >>>  1)                 & 0x1ffe;
		this.r[6] = ((t[4] >>> 14) | (t[5] <<  2)) & 0x1fff;
		this.r[7] = ((t[5] >>> 11) | (t[6] <<  5)) & 0x1f81;
		this.r[8] = ((t[6] >>>  8) | (t[7] <<  8)) & 0x1fff;
		this.r[9] =  (t[7] >>>  5)                 & 0x007f;

		for (i = 8; i--;) {
			this.h[i]   = 0;
			this.pad[i] = key.readUInt16LE( 16+(2*i));
		}

		this.h[8] = 0;
		this.h[9] = 0;
		this.leftover = 0;
		this.finished = 0;
	} 

	update(m) {
		var bytes = m.length;
		var want = 0, i = 0, mpos = 0;

		if (this.leftover) {
			want = 16 - this.leftover;

			if (want > bytes)
				want = bytes;

			for (i = want; i--;) {
				this.buffer[this.leftover+i] = m[i+mpos];
			}

			bytes -= want;
			mpos += want;
			this.leftover += want;

			if (this.leftover < 16)
				return this;

			this.blocks(this.buffer, 0, 16);
			this.leftover = 0;
		}

		if (bytes >= 16) {
			want = (bytes & ~(16 - 1));
			this.blocks(m, mpos, want);
			mpos += want;
			bytes -= want;
		}

		if (bytes) {
			for (i = bytes; i--;) {
				this.buffer[this.leftover+i] = m[i+mpos];
			}
			this.leftover += bytes;
		}

		return this;
	}

	finish() {
		var mac = new Buffer(16),
			g = new Uint16Array(10),
			c = 0, mask = 0, f = 0, i = 0;

		if (this.leftover) {
			i = this.leftover;
			this.buffer[i++] = 1;

			for (; i < 16; i++) {
				this.buffer[i] = 0;
			}

			this.finished = 1;
			this.blocks(this.buffer, 0, 16);
		}

		c = this.h[1] >>> 13;
		this.h[1] &= 0x1fff;
		for (i = 2; i < 10; i++) {
			this.h[i] += c;
			c = this.h[i] >>> 13;
			this.h[i] &= 0x1fff;
		}
		this.h[0] += (c * 5);
		c = this.h[0] >>> 13;
		this.h[0] &= 0x1fff;
		this.h[1] += c;
		c = this.h[1] >>> 13;
		this.h[1] &= 0x1fff;
		this.h[2] += c;
		g[0] = this.h[0] + 5;
		c = g[0] >>> 13;
		g[0] &= 0x1fff;
		for (i = 1; i < 10; i++) {
			g[i] = this.h[i] + c;
			c = g[i] >>> 13;
			g[i] &= 0x1fff;
		}
		g[9] -= (1 << 13);

		mask = (g[9] >>> 15) - 1;
		for (i = 10; i--;) g[i] &= mask;
		mask = ~mask;
		for (i = 10; i--;) {
			this.h[i] = (this.h[i] & mask) | g[i];
		}

		this.h[0] = (this.h[0]      ) | (this.h[1] << 13);
		this.h[1] = (this.h[1] >>  3) | (this.h[2] << 10);
		this.h[2] = (this.h[2] >>  6) | (this.h[3] <<  7);
		this.h[3] = (this.h[3] >>  9) | (this.h[4] <<  4);
		this.h[4] = (this.h[4] >> 12) | (this.h[5] <<  1) | (this.h[6] << 14);
		this.h[5] = (this.h[6] >>  2) | (this.h[7] << 11);
		this.h[6] = (this.h[7] >>  5) | (this.h[8] <<  8);
		this.h[7] = (this.h[8] >>  8) | (this.h[9] <<  5);

		f = (this.h[0] & 0xffffffff) + this.pad[0];
		this.h[0] = f;
		for (i = 1; i < 8; i++) {
			f = (this.h[i] & 0xffffffff) + this.pad[i] + (f >>> 16);
			this.h[i] = f;
		}

		for (i = 8; i--;) {
			mac.writeUInt16LE(this.h[i], i*2);
			this.pad[i] = 0;
		}

		for (i = 10; i--;) {
			this.h[i] = 0;
			this.r[i] = 0;
		}

		return mac;
	}
}

function U16TO8_LE(p, pos, v) {
	p[pos]   = v;
	p[pos+1] = v >>> 8;
}

