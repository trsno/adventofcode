import { performance } from 'perf_hooks';
import { resolve } from 'path';
import readFile from '../utils';

const calculatePossibleWays = (time: number, distance: number) => {
	let winnableRace = 0;
	for (let i = 1; i < time; i++) if (i * (time - i) > distance) winnableRace++;
	return winnableRace;
};

const getResults = (input: string[]): { part1: number; part2: number } => {
	const [times, distances] = input.map((str) => str.match(/\d+/g)!.map((str) => +str));
	const part1 = times.reduce((acc, time, index) => acc * calculatePossibleWays(time, distances[index]), 1);
	const [time, distance] = input.map((v) => +v.replace(/\D/g, ''));
	const part2 = calculatePossibleWays(time, distance);
	return { part1, part2 };
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
