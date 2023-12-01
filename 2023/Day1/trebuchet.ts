import { readFile as fsReadFile } from 'fs/promises';
import { resolve } from 'path';

async function readFile(filePath: string): Promise<string> {
	try {
		return await fsReadFile(resolve(__dirname, filePath), 'utf8');
	} catch (error) {
		throw `Failed: ${error instanceof Error ? error.message : error}`;
	}
}

function calculateSum(data: string): number {
	return data.split('\n').reduce((acc, str) => {
		const digits = str.match(/\d(?=\D*$)|\d/g) ?? [];
		return acc + (digits.length > 0 ? parseInt(`${digits[0]}${digits?.pop()}`, 10) : 0);
	}, 0);
}

async function main() {
	try {
		const strings = await readFile('./input.txt');
		const result = calculateSum(strings);
		console.log(result);
	} catch (error) {
		console.error(error);
	}
}

main();
