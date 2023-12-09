export function convertToBinary(decimalValue, valueSize = 32) {
	// Convert to 2's complement
	let sign = decimalValue >> (valueSize - 1);
	if (sign == 1) {
		let temp = 1;
		for (let i = 0; i < 32 - valueSize - 1; i++) {
			temp = temp << 1;
			temp = temp | 1;
		}
		temp = temp << valueSize;
		decimalValue = decimalValue | temp;
	}
	const binaryValue = (decimalValue >>> 0).toString(2).padStart(valueSize, "0");
	return binaryValue;
}
