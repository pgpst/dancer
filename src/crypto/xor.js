import uint32 from 'uint32';

export default function xor(arr1, arr2) {
	const result = new Buffer(arr1.length);

	for (let index = 0; index < arr1.length; index++) {
		result[index] = uint32.xor(arr1[index], arr2[index]);
	}

	return result;
}
