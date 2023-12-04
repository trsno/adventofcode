import { readFile as fsReadFile } from 'fs/promises';
import { resolve } from 'path';
import { performance } from 'perf_hooks';

const readFile = async (filePath: string): Promise<string> => {
	try {
		return await fsReadFile(resolve(__dirname, filePath), 'utf8');
	} catch (error) {
		throw `Failed: ${error instanceof Error ? error.message : error}`;
	}
};

const isNumberInRange = (number: number, min: number, max: number) => number >= min && number <= max;
const getResults = (input: string[]): { part1: number; part2: number } => {
	const results = { part1: 0, part2: 0 };
	const numbers: { x: number; y: number; num: number; used: boolean }[] = [];
	for (let y = 0; y < input.length; y++) {
		let indexOffset = 0;
		const match = input[y].match(/\d+/g);
		if (match) {
			match.forEach((num) => {
				const index = input[y].indexOf(num, indexOffset);
				indexOffset = index + num.length;
				numbers.push({ x: index, y, num: +num, used: false });
			});
		}
	}
	for (let y = 0; y < input.length; y++) {
		for (let x = 0; x < input[y].length; x++) {
			const char = input[y][x];
			const charList: number[] = [];
			if (/[^\d.]/.test(char)) {
				numbers.forEach((v) => {
					const numLength = String(v.num).length;
					const valid = isNumberInRange(x, v.x - 1, v.x + numLength) && isNumberInRange(v.y, y - 1, y + 1) && !v.used;
					if (valid) {
						v.used = true;
						char === '*' && charList.push(v.num);
					}
				});
			}
			if (charList.length === 2) {
				results.part2 += charList[0] * charList[1];
			}
		}
	}
	results.part1 = numbers.reduce((sum, obj) => (obj.used ? sum + obj.num : sum), 0);
	return results;
};

async function main() {
	try {
		const startTime = performance.now();
		const input = (await readFile('./input.txt')).split('\n');
		const results = getResults(input);
		const time = performance.now() - startTime;
		console.log(`Part 1: ${results.part1}\nPart 2: ${results.part2}\nTimer: ${time} ms`);
	} catch (error) {
		console.error(error);
	}
}

main().catch((error) => console.error(error));
