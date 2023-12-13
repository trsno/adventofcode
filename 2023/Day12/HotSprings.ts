import { performance } from 'perf_hooks';
import { resolve } from 'path';
import readFile from '../utils';

const countArrangements = (conditions: string, blocks: number[]) => {
	const memo = new Map();
	const getArrangements = (index: number, blockIndex: number, blockLength: number): number => {
		const key = `${index}-${blockIndex}-${blockLength}`;
		if (memo.has(key)) {
			return memo.get(key);
		}

		const desiredLength = blocks[blockIndex];

		if (index >= conditions.length) {
			if (blockIndex < blocks.length - 1) return 0;
			if (blockIndex === blocks.length - 1 && blockLength < desiredLength) return 0;
			return 1;
		}

		const current = conditions[index];

		if (current === '.') {
			if (blockLength > 0 && blockLength < desiredLength) return 0;
			if (blockLength > 0 && blockIndex < blocks.length) blockIndex++;
			return getArrangements(index + 1, blockIndex, 0);
		} else if (current === '#') {
			if (blockLength >= desiredLength || desiredLength === undefined) return 0;
			return getArrangements(index + 1, blockIndex, blockLength + 1);
		}

		let arrangements = 0;
		if (blockLength < desiredLength) arrangements += getArrangements(index + 1, blockIndex, blockLength + 1);
		if (blockLength > 0 && blockLength < desiredLength) return arrangements;
		if (blockLength === desiredLength && blockIndex < blocks.length) blockIndex++;

		const result = arrangements + getArrangements(index + 1, blockIndex, 0);
		memo.set(key, result);
		return result;
	};

	return getArrangements(0, 0, 0);
};

function unfoldRow(row: string): string {
	const parts = row.split(' ');
	return `${Array(5).fill(parts[0]).join('?')} ${Array(5).fill(parts[1]).join(',')}`;
}

const getResults = (input: string[]): { part1: number; part2: number } => {
	const records = (multiply = false) => input.map((v) => (multiply ? unfoldRow(v) : v).split(/\s/).map((v, i) => (i === 0 ? v : v.split(',').map((v) => +v))));
	const sum = (multiply = false) => records(multiply).reduce((acc: number, record, index) => acc + countArrangements(record[0] as string, record[1] as number[]), 0);
	return { part1: sum(), part2: sum(true) };
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
