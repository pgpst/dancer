import crypto from './crypto';
import { verify, decrypt, encrypt } from './methods';

// Prepare the dancer object
const dancer = {
	crypto,
	verify,
	decrypt,
	encrypt,
};

// Export it into the window scope
if (window && !window.dancer) {
	window.dancer = dancer;
}

export default dancer;
