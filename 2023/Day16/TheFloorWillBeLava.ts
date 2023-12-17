import { performance } from 'perf_hooks';
import { resolve } from 'path';
import readFile from '../utils';

type Point = [number, number];
type Direction = 'u' | 'd' | 'l' | 'r';

const EMPTY_CELL = '.';
const VERTICAL_PIPE = '|';
const HORIZONTAL_PIPE = '-';
const BACKSLASH = '\\';
const SLASH = '/';

const countEnergized = (input: string[][], point: Point = [0, 0], direction: Direction = 'r') => {
	const energized = new Set<string>();
	const memo: Set<string> = new Set();
	const directionChanges: Record<Direction, [number, number]> = {
		u: [0, -1],
		d: [0, 1],
		l: [-1, 0],
		r: [1, 0]
	};

	const rows = input.length;
	const cols = input[0].length;

	const stack: { point: Point; direction: Direction }[] = [{ point, direction }];

	while (stack.length > 0) {
		const { point, direction } = stack.pop()!;
		const [x, y] = point;
		const key = `${x},${y},${direction}`;

		if (memo.has(key) || x < 0 || y < 0 || x >= cols || y >= rows) {
			continue;
		}

		memo.add(key);
		energized.add(`${x},${y}`);

		if (input[y][x] === EMPTY_CELL) {
			const [dx, dy] = directionChanges[direction];
			stack.push({ point: [x + dx, y + dy], direction });
			continue;
		}

		if (direction === 'r' || direction === 'l') {
			if (input[y][x] === VERTICAL_PIPE) {
				stack.push({ point: [x, y - 1], direction: 'u' });
				stack.push({ point: [x, y + 1], direction: 'd' });
			} else if (input[y][x] === BACKSLASH) {
				const dy = direction === 'r' ? 1 : -1;
				stack.push({ point: [x, y + dy], direction: direction === 'r' ? 'd' : 'u' });
			} else if (input[y][x] === SLASH) {
				const dy = direction === 'r' ? -1 : 1;
				stack.push({ point: [x, y + dy], direction: direction === 'r' ? 'u' : 'd' });
			} else if (input[y][x] === HORIZONTAL_PIPE) {
				const [dx, dy] = directionChanges[direction];
				stack.push({ point: [x + dx, y + dy], direction });
			}
		} else {
			if (input[y][x] === HORIZONTAL_PIPE) {
				stack.push({ point: [x - 1, y], direction: 'l' });
				stack.push({ point: [x + 1, y], direction: 'r' });
			} else if (input[y][x] === BACKSLASH) {
				const dx = direction === 'u' ? -1 : 1;
				stack.push({ point: [x + dx, y], direction: direction === 'u' ? 'l' : 'r' });
			} else if (input[y][x] === SLASH) {
				const dx = direction === 'u' ? 1 : -1;
				stack.push({ point: [x + dx, y], direction: direction === 'u' ? 'r' : 'l' });
			} else if (input[y][x] === VERTICAL_PIPE) {
				const [dx, dy] = directionChanges[direction];
				stack.push({ point: [x + dx, y + dy], direction });
			}
		}
	}

	return energized.size;
};

const getResults = (input: string[][]): { part1: number; part2: number } => {
	const rows = input.length;
	const cols = input[0].length;
	const down = new Array(cols).fill(0).reduce((acc, _, i) => Math.max(acc, countEnergized(input, [i, 0], 'd')), 0);
	const up = new Array(cols).fill(0).reduce((acc, _, i) => Math.max(acc, countEnergized(input, [i, input[0].length - 1], 'u')), 0);
	const right = new Array(rows).fill(0).reduce((acc, _, i) => Math.max(acc, countEnergized(input, [0, i], 'r')), 0);
	const left = new Array(rows).fill(0).reduce((acc, _, i) => Math.max(acc, countEnergized(input, [input.length - 1, i], 'l')), 0);
	return { part1: countEnergized(input), part2: Math.max(down, up, right, left) };
};

async function main() {
	try {
		const startTime = performance.now();
		const input = (await readFile(resolve(__dirname, './input.txt'))).split('\n').map((str) => str.split(''));
		const results = getResults(input);
		const time = performance.now() - startTime;
		console.log(`Part 1: ${results.part1}\nPart 2: ${results.part2}\nTimer: ${time.toFixed(1)} ms`);
	} catch (error) {
		console.error(error);
	}
}

main().catch((error) => console.error(error));
