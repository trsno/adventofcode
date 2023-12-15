import { performance } from 'perf_hooks';
import { resolve } from 'path';
import readFile from '../utils';

const totalLoad = (input: string[]) => input.reduce((acc, str, i): number => acc + str.split('').reduce((acc, char) => acc + (char === 'O' ? str.length - i : 0), 0), 0);

const tilt = (direction: string, input: string[]): string[] => {
	const reverse = direction === 'n' || direction === 'w' ? (a: string, b: string) => b.localeCompare(a) : undefined;
	const sortChars = (str: string): string =>
		str
			.split(/(#)/)
			.map((chars) => chars.split('').sort(reverse).join(''))
			.join('');

	if (direction === 'n' || direction === 's') {
		const inputSorted = input[0]
			.split('')
			.map((_, i) => input.map((rows) => rows[i]).join(''))
			.map(sortChars);
		return inputSorted[0].split('').map((_, i) => inputSorted.map((rows) => rows[i]).join(''));
	} else {
		return input.map(sortChars);
	}
};

const spinCycle = (iterations: number, initialState: string[]): string[] => {
	const findRepeatingPattern = (arr: number[], length: number): number => {
		for (let interval = 1; interval <= Math.floor(length / 2); interval++) {
			if (JSON.stringify(Array.from({ length: Math.floor(length / interval) }, () => arr.slice(0, interval)).flat()) === JSON.stringify(arr)) {
				return interval;
			}
		}
		return -1;
	};

	const loadPatterns: number[] = [];
	for (let iteration = 0; iteration < iterations; iteration++) {
		initialState = tilt('e', tilt('s', tilt('w', tilt('n', initialState))));
		const currentLoad = totalLoad(initialState);
		if (loadPatterns.includes(currentLoad) && iteration % 30 === 0) {
			const repeatingPatternIndex = findRepeatingPattern(loadPatterns, loadPatterns.length);
			if (repeatingPatternIndex !== -1) break;
		}
		loadPatterns.push(currentLoad);
	}
	return initialState;
};

const getResults = (input: string[]): { part1: number; part2: number } => {
	return { part1: totalLoad(tilt('n', input)), part2: totalLoad(spinCycle(1e3, input)) };
};

async function main() {
	try {
		const startTime = performance.now();
		const input = (await readFile(resolve(__dirname, './input.txt'))).split('\n');
		const results = getResults(input);
		const time = performance.now() - startTime;
		console.log(`Part 1: ${results.part1}\nPart 2: ${results.part2}\nTimer: ${time.toFixed(1)} ms`);
	} catch (error) {
		console.error(error);
	}
}

main().catch((error) => console.error(error));
