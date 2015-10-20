// To make dancer.js import work
window = {};

// Import the crypto library
importScripts('dancer.js');

// Helper function for responded
function response(event) {
	postMessage(event);
}

self.onmessage = function(event) {
	var msg = event.data;	

	switch (msg.event) {
		case 'seed-random':
			/*
				request:
					- buffer (Uint8Array|Any) - A buffer with random data
			*/
			if (!(msg.buffer instanceof Uint8Array)) {
				msg.buffer = new Uint8Array(msg.buffer);
			}
			window.dancer.crypto.random.set(msg.buffer);
			break;
		case 'verify':
			/*
				request:
					- tag  (Uint8Array) - Poly1305 tag of the message
					- body (Uint8Array) - Ciphertext of the message
				response:
					- success (bool)   - Has the verification succeeded?
				error:
					- error (string) - Whatever the library returns
			*/
			window.dancer.verify(msg.tag, msg.body).then(function(success) {
				response({event: 'method-return', id: msg.id, success: success});
			}).catch(function(err) {
				response({event: 'method-return', id: msg.id, error: err});
			});
			break;
		case 'encrypt':
			/*
				request:
					- key  (Uint8Array) - Key used to encrypt the message
					- body (Uint8Array) - Plaintext of the message
				response:
					- nonce      (Uint8Array) - Nonce of the message
					- ciphertext (Uint8Array) - Ciphertext of the message
				error:
					- error (string) - Whatever the library returns
			*/
			window.dancer.encrypt(msg.key, msg.body).then(function(nonce, ciphertext) {
				response({event: 'method-return', id: msg.id, nonce: nonce, ciphertext: ciphertext});
			}).catch(function(err) {
				response({event: 'method-return', id: msg.id, error: err});
			});
			break;
		case 'chunked-decrypt-and-verify':
			break;
		case 'chunked-verify':
			break;
		case 'chunked-encrypt':
			break;
		default:
			throw new Error('Unknown worker event.');
	}
};