import {
	encrypt,
} from '../src/dancer';
import testData from './single_data';

describe('encrypting abstracted single blocks', () => {
	testData.forEach((test, i) => {
		it('should work correctly for message #' + i, () => {
			encrypt(test.key, test.nonce, test.plain).then(([tag, cipher]) => {
				expect(tag.equals(test.tag));
				expect(cipher.equals(test.cipher));
			}).catch((error) => {
				expect(error).toBe(undefined);
			});
		});
	});
});
