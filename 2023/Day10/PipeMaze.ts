import { performance } from 'perf_hooks';
import { resolve } from 'path';
import readFile from '../utils';

const getStart = (input: string[][]): number[] => {
	let xPos, yPos;
	for (const [y, lines] of input.entries()) {
		for (const [x, char] of lines.entries()) {
			if (char === 'S') {
				xPos = x;
				break;
			}
		}
		if (xPos) {
			yPos = y;
			break;
		}
	}
	return [xPos!, yPos!];
};

type PipeWalk = [number, number, string, number, number];

const trackPipe = (input: string[][], pipes: PipeWalk): { input: string[][]; steps: number; routes: string[] } => {
	let [prevX, prevY, char, x, y] = pipes;
	let nextX,
		nextY,
		steps = 1;

	const routes = [] as string[];
	do {
		nextX = x;
		nextY = y;

		const direction = x === prevX ? (y > prevY ? 'down' : 'up') : x > prevX ? 'right' : 'left';

		if (char === '-') {
			nextX += direction === 'right' ? 1 : -1;
		} else if (char === '7') {
			direction === 'right' ? nextY++ : nextX--;
		} else if (char === '|') {
			nextY += direction === 'down' ? 1 : -1;
		} else if (char === 'J') {
			direction === 'right' ? nextY-- : nextX--;
		} else if (char === 'L') {
			direction === 'left' ? nextY-- : nextX++;
		} else if (char === 'F') {
			direction === 'left' ? nextY++ : nextX++;
		}

		if (nextX < 0 || nextX >= input[0].length || nextY < 0 || nextY >= input.length || input[nextY][nextX] === '.') {
			steps = 0;
		}

		routes.push(`${x},${y}`);
		char = input[nextY][nextX];
		steps++;
		prevX = x;
		prevY = y;
		x = nextX;
		y = nextY;
	} while (char !== 'S');

	input[y][x] = '|'; // haven't implemented the function yet; need to manually edit this

	return { input, steps, routes };
};

const rayCasting = (point: number[], input: string[][]) => {
	const intersect = input[point[1]]
		.slice(point[0] + 1)
		.join('')
		.match(/(F-+J)|(L-+7)|(FJ)|(L7)|\|/g);
	return (intersect?.length ?? 0) % 2 !== 0;
};

const getResults = (input: string[][]): { part1: number; part2: number } => {
	const [x, y] = getStart(input);

	const up = y === 0 || !/[F7\|]/.test(input[y - 1][x]) ? null : [x, y, input[y - 1][x], x, y - 1];
	const left = x === 0 || !/[FL\-]/.test(input[y][x - 1]) ? null : [x, y, input[y][x - 1], x - 1, y];
	const down = y === input.length - 1 || !/[JL\|]/.test(input[y + 1][x]) ? null : [x, y, input[y + 1][x], x, y + 1];
	const right = x === input[0].length - 1 || !/[7J\-]/.test(input[y][x + 1]) ? null : [x, y, input[y][x + 1], x + 1, y];
	let part1 = 0,
		part2 = 0,
		routes: string[] = [];

	for (const direction of [up, left, down, right]) {
		if (direction === null || direction[2] === '.') continue;
		const connected = trackPipe(input, direction as PipeWalk);
		if (connected.steps !== 0) {
			part1 = connected.steps / 2;
			routes = [`${x},${y}`, ...connected.routes];
			break;
		}
	}

	input.forEach((line, y) => {
		line.forEach((char, x) => {
			if (char !== '.') {
				if (!routes.includes(`${x},${y}`)) {
					input[y][x] = '.';
				}
			}
		});
	});

	input.forEach((line, y) => {
		line.forEach((char, x) => {
			if (char === '.') {
				if (rayCasting([x, y], input)) {
					input[y][x] = '#';
					part2++;
				}
			}
		});
	});

	return { part1, part2 };
};

async function main() {
	try {
		const startTime = performance.now();
		const input = (await readFile(resolve(__dirname, './input.txt'))).split('\n').map((n) => n.split(''));
		const results = getResults(input);
		const time = performance.now() - startTime;
		console.log(`Part 1: ${results.part1}\nPart 2: ${results.part2}\nTimer: ${time.toFixed(1)} ms`);
	} catch (error) {
		console.error(error);
	}
}

main().catch((error) => console.error(error));
