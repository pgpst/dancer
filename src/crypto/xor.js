export default function xor(arr1, arr2) {
	const result = new Uint8Array();

	for (let index = 0; index < arr1.length; index++) {
		result.push(arr1[index] ^ arr2[index]);
	}

	return result;
}
