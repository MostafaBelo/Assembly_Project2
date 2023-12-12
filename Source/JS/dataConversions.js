export function convertToBinary(decimalValue, valueSize = 32) {
	const binaryValue = decimalValue.toString(2).padStart(valueSize, "0");
	return binaryValue;
}
