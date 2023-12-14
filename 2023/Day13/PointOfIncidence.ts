import { performance } from 'perf_hooks';
import { resolve } from 'path';
import readFile from '../utils';

type MirrorResult = [number, boolean];

const checkForMirror = (input: string[], verticalMirror = false, defaultMirror: MirrorResult | null): MirrorResult => {
	for (let n = 0; n < input.length; n++) {
		let isMirror = false;
		const maxLoop = Math.min(n, input.length - n - 1);

		for (let i = 0; i <= maxLoop; i++) {
			const currLine = input[n - i];
			let nextLine = input[n + i + 1];
			let fixed = false;

			if ([currLine, nextLine].some((v) => !v)) break;

			if (defaultMirror && !fixed) {
				if (1 === currLine.split('').reduce((acc, char, i) => acc + (char !== nextLine[i] ? 1 : 0), 0)) {
					fixed = true;
					nextLine = currLine;
				}
			}

			if (currLine !== nextLine) {
				isMirror = false;
				break;
			} else {
				isMirror = true;
			}
		}

		const isDefaultMirror = defaultMirror && defaultMirror[1] === verticalMirror && defaultMirror[0] === n + 1;

		if (isMirror && !isDefaultMirror) {
			return [n + 1, verticalMirror];
		}
	}

	return checkForMirror(
		input[0].split('').map((v, i) => input.map((rows) => rows[i]).join('')),
		true,
		defaultMirror ?? null
	);
};

const getResults = (input: string[]): { part1: number; part2: number } => {
	const defaultMirror: MirrorResult[] = [];
	const check = (isPart2 = false) => {
		return input.reduce((acc: number, pattern: string, i) => {
			const [line, isVertical] = checkForMirror(pattern.split('\n'), false, isPart2 ? defaultMirror[i] : null);
			if (!isPart2) defaultMirror.push([line, isVertical]);
			return acc + (isVertical ? line : line * 100);
		}, 0);
	};
	return { part1: check(), part2: check(true) };
};

async function main() {
	try {
		const startTime = performance.now();
		const input = (await readFile(resolve(__dirname, './input.txt'))).split('\n\n');
		const results = getResults(input);
		const time = performance.now() - startTime;
		console.log(`Part 1: ${results.part1}\nPart 2: ${results.part2}\nTimer: ${time.toFixed(1)} ms`);
	} catch (error) {
		console.error(error);
	}
}

main().catch((error) => console.error(error));
