import { performance } from 'perf_hooks';
import { resolve } from 'path';
import readFile from '../utils';

const getHash = (str: string): number => str.split('').reduce((acc, char) => ((acc + char.charCodeAt(0)) * 17) % 256, 0);
const getResults = (input: string[]): { part1: number; part2: number } => {
	const part1 = input.reduce((acc, str) => acc + getHash(str), 0);

	const boxes = {} as { [key: number]: Map<string, number> };
	input.forEach((str) => {
		const [label, focalLength] = str.split(/[=-]/);
		const boxNumber = getHash(label);
		const isRemove = /-/.test(str);
		if (isRemove && boxNumber in boxes && boxes[boxNumber].has(label)) boxes[boxNumber].size === 1 ? delete boxes[boxNumber] : boxes[boxNumber].delete(label);
		if (!isRemove) {
			if (!(boxNumber in boxes)) boxes[boxNumber] = new Map();
			boxes[boxNumber].set(label, +focalLength);
		}
	});

	const part2 = Object.keys(boxes).reduce((acc: number, boxNumber: string) => {
		let focusPower = 0,
			slot = 0;
		boxes[+boxNumber].forEach((focalLength) => (focusPower += (+boxNumber + 1) * ++slot * focalLength));
		return acc + focusPower;
	}, 0);

	return { part1, part2 };
};

async function main() {
	try {
		const startTime = performance.now();
		const input = (await readFile(resolve(__dirname, './input.txt'))).split(',');
		const results = getResults(input);
		const time = performance.now() - startTime;
		console.log(`Part 1: ${results.part1}\nPart 2: ${results.part2}\nTimer: ${time.toFixed(1)} ms`);
	} catch (error) {
		console.error(error);
	}
}

main().catch((error) => console.error(error));
