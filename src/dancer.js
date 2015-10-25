import { chacha20, poly1305, random } from './crypto';
import { verify, decrypt, encrypt } from './methods';
/* import {
	verify as verifyChunked,
	decrypt as decryptChunked,
	encrypt as encryptChunked
} from './chunked'; */

// Prepare the dancer object
const dancer = {
	chacha20,
	poly1305,
	random,
	verify,
	decrypt,
	encrypt,
/*	verifyChunked,
	decryptChunked,
	encryptChunked*/
};

// Export it into the window scope
if (window && !window.dancer) {
	window.dancer = dancer;
}

export default dancer;
