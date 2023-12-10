import { performance } from 'perf_hooks';
import { resolve } from 'path';
import readFile from '../utils';

const extrapolate = (history: number[]): number => {
	const nextSequence = [] as number[];
	for (const [index, number] of history.entries()) {
		if (index === 0) continue;
		nextSequence.push(number - history[index - 1]);
	}

	return nextSequence.every((n) => n === 0) ? history[history.length - 1] : history[history.length - 1] + extrapolate(nextSequence);
};

const getResults = (input: number[][]): { part1: number; part2: number } => {
	const part1 = input.reduce((acc: number, history: number[]) => acc + extrapolate(history), 0);
	const part2 = input.reduce((acc: number, history: number[]) => acc + extrapolate(history.reverse()), 0);
	return { part1, part2 };
};

async function main() {
	try {
		const startTime = performance.now();
		const input = (await readFile(resolve(__dirname, './input.txt'))).split('\n').map((n) => n.split(/\s/).map((n) => +n));
		const results = getResults(input);
		const time = performance.now() - startTime;
		console.log(`Part 1: ${results.part1}\nPart 2: ${results.part2}\nTimer: ${time.toFixed(1)} ms`);
	} catch (error) {
		console.error(error);
	}
}

main().catch((error) => console.error(error));
