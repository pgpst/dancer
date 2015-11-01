import {
	decrypt,
} from '../src/dancer';
import testData from './single_data';

describe('decrypting abstracted single blocks', () => {
	testData.forEach((test, i) => {
		it('should work correctly for message #' + i, () => {
			decrypt(test.key, test.nonce, test.cipher).then((body) => {
				expect(body.equals(test.plain));
			}).catch((error) => {
				expect(error).toBe(undefined);
			});
		});
	});
});
