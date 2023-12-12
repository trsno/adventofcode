import { performance } from 'perf_hooks';
import { resolve } from 'path';
import readFile from '../utils';

type Point = [number, number];

const getDistance = (from: Point, to: Point, empties: { [key: string]: number[] }, multiplier = 1): number => {
	const [fromX, fromY, toX, toY] = [...from, ...to];
	const emptySpacesSet = new Set();
	const emptySpace = Object.keys(empties).reduce((acc, key) => {
		return (
			acc +
			empties[key].reduce((acc, number) => {
				const min = key === 'x' ? Math.min(fromX, toX) : Math.min(fromY, toY);
				const max = key === 'x' ? Math.max(fromX, toX) : Math.max(fromY, toY);
				const inRange = number >= min && number <= max;
				if (inRange && !emptySpacesSet.has(number)) {
					emptySpacesSet.add(number);
					return acc + 1;
				}
				return acc;
			}, 0)
		);
	}, 0);
	return Math.abs(fromX - toX) + Math.abs(fromY - toY) + emptySpace * multiplier - emptySpacesSet.size;
};

const noGalaxy = (str: string): boolean => str.split('').every((char) => char === '.');

const calculateUniverse = (input: string[], multiplier = 1) => {
	const empties = { x: [], y: [] } as { [key: string]: number[] };
	const galaxies: number[][] = [];
	const pairs: number[] = [];

	// Check rows
	for (let y = 0; y < input.length; y++) if (noGalaxy(input[y])) empties.y.push(y);
	// Check columns
	for (let x = 0; x < input[0].length; x++) if (noGalaxy(input.map((row) => row[x]).join(''))) empties.x.push(x);
	// calculate galaxy, pairs, and distance
	input
		.map((v) => v.split(''))
		.forEach((lines, y) => {
			lines.forEach((char, x) => {
				if (char !== '#') return;
				galaxies.push([x, y]);
				if (galaxies.length) for (const galaxy of galaxies) if (x !== galaxy[0] || y !== galaxy[1]) pairs.push(getDistance([galaxy[0], galaxy[1]], [x, y], empties, multiplier));
			});
		});
	return pairs.reduce((acc, v) => acc + v, 0);
};

const getResults = (input: string[]): { part1: number; part2: number } => {
	let part1 = calculateUniverse(input),
		part2 = calculateUniverse(input, 1e6);
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
