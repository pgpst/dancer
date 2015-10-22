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
				- key  (Uint8Array) - Key used for verification
				- tag  (Uint8Array) - Poly1305 tag of the message
				- body (Uint8Array) - Ciphertext of the message
			response:
				- success (bool) - Has the verification succeeded?
		*/
		window.dancer.verify(msg.key, msg.tag, msg.body).then(function(success) {
			response({event: 'method-return', id: msg.id, success: success});
		}).catch(function(err) {
			response({event: 'method-return', id: msg.id, error: err});
		});
		break;
	case 'decrypt':
		/*
			request:
				- key        (Uint8Array) - Key used to decrypt the message
				- nonce      (Uint8Array) - Nonce used for ChaCha20 initialization
				- ciphertext (Uint8Array) - Encrypted message
			response:
				- body (Uint8Array) - Decrypted message
		*/
		window.dancer.decrypt(msg.key, msg.nonce, msg.body).then(function(body) {
			response({event: 'method-return', id: msg.id, body: body});
		}).catch(function(err) {
			response({event: 'method-return', id: msg.id, error: err});
		})
	case 'encrypt':
		/*
			request:
				- key  (Uint8Array) - Key used to encrypt the message
				- body (Uint8Array) - Plaintext of the message
			response:
				- nonce      (Uint8Array) - Nonce of the message
				- ciphertext (Uint8Array) - Ciphertext of the message
		*/
		window.dancer.encrypt(msg.key, msg.body).then(function(nonce, ciphertext) {
			response({event: 'method-return', id: msg.id, nonce: nonce, ciphertext: ciphertext});
		}).catch(function(err) {
			response({event: 'method-return', id: msg.id, error: err});
		});
		break;
	case 'chunked-verify':
		/*
			request:
				- key (Uint8Array) - Key used for verification
				- blocks (Array<Object>)
					- tag  (Uint8Array) - Poly1305 tag of the block
					- body (Uint8Array) - Ciphertext of the block
			response:
				- results (Array<bool>) - has the verification succeeded?
		*/
		/*
		const promises = [];
		msg.blocks.forEach(function(block) {
			promises.push(window.dancer.verify(msg.tag, msg.body));
		});
		Promise.all(promises).then(function(results) {
			response({event: 'method-return', id: msg.id, results: results});
		}).catch(function(err) {
			response({event: 'method-return', id: msg.id, error: err});
		})*/
		window.dancer.verifyChunked(msg.key, msg.blocks).then(function(results) {
			response({event: 'method-return', id: msg.id, results: results});
		}).catch(function(err) {
			response({event: 'method-return', id: msg.id, error: err});
		});
		break;
	case 'chunked-decrypt':
		/*
			request:
				- key   (Uint8Array) - Key used to decrypt the message
				- nonce (Uint8Array) - Nonce of the ciphertext
				- data_start   (int) - Start of the chunk
				- data_length  (int) - Length of the chunk
				- block_start  (int) - Index of the first block
				- blocks (Array<Uint8Array>) - Ciphertexts of blocks
			response:
				- body (Uint8Array) - Decrypted chunk of the message
		*/
		/*const promises = [];
		msg.blocks.forEach(function(block) {
			promises.push(window.dancer.decrypt(msg.key, msg.nonce, block, ))
		});*/
		window.dancer.decryptChunked(msg.key, msg.nonce, msg.blocks, msg.block_start, msg.data_start, msg.data_length).then(function(body) {
			response({event: 'method-return', id: msg.id, body: body});
		}).catch(function(err) {
			response({event: 'method-return', id: msg.id, error: err});
		});
		break;
	case 'chunked-encrypt':
		/*
			request:
				- key  (Uint8Array) - Key used to encrypt the message
				- body (Uint8Array) - Plaintext of the message
			response:
				- nonce  (Uint8Array) - Nonce of the message
				- blocks (Array<Object>)
					- tag  (Uint8Array) - Poly1305 tag of the block
					- body (Uint8Array) - Ciphertext of the block
		*/
		window.dancer.encryptChunked(msg.key, msg.body).then(function(nonce, blocks) {
			response({event: 'method-return', id: msg.id, nonce: nonce, blocks: blocks});
		}).catch(function(err) {
			response({event: 'method-return', id: msg.id, error: err});
		});
		break;
	default:
		throw new Error('Unknown worker event.');
	}
};