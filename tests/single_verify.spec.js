import {
	verify,
} from '../src/dancer';
import testData from './single_data';

describe('verifying abstracted single blocks', () => {
	testData.forEach((test, i) => {
		it('should work correctly for message #' + i, () => {
			verify(test.key, test.nonce, test.tag, test.cipher).then(() => {}).catch((error) => {
				expect(error).toBe(undefined);
			});
		});
	});
});
