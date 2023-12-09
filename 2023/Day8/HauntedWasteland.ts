import { performance } from 'perf_hooks';
import { resolve } from 'path';
import readFile from '../utils';

interface Maps {
	direction: number[];
	nodes: { [key: string]: string[] };
}

const getMaps = (input: string[]): Maps => {
	return input.reduce((maps, str, index) => {
		if (index === 0) {
			return { ...maps, direction: str.split('').map((v) => (v === 'L' ? 0 : 1)) };
		} else {
			const nodesStr = str.split('\n');
			return {
				...maps,
				nodes: nodesStr.reduce((elementAcc, element, elementIndex) => {
					const [key, l, r] = element.match(/(\w){3}/g)!;
					return { ...elementAcc, [key]: [l, r] };
				}, {} as { [key: string]: string[] })
			};
		}
	}, {} as Maps);
};

const loopwalk = ({ direction, nodes }: Maps, start: string, directionIndex: number, terminationCondition: (start: string) => boolean): number => {
	let steps = 0;

	do {
		steps++;
		start = nodes[start][direction[directionIndex]];
		directionIndex = (directionIndex + 1) % direction.length;
	} while (!terminationCondition(start));

	return steps;
};

const walk = ({ direction, nodes }: Maps, start: string, directionIndex: number, ghostWalk?: boolean): number => {
	const terminationCondition = (start: string) => (ghostWalk ? start.charAt(start.length - 1) === 'Z' : start === 'ZZZ');
	return loopwalk({ direction, nodes }, start, directionIndex, terminationCondition);
};

const findLCM = (...numbers: number[]): number => {
	const lcm = (a: number, b: number): number => (a * b) / gcd(a, b);
	const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

	return numbers.reduce((acc, num) => lcm(acc, num), 1);
};

const getResults = (input: string[]): { part1: number; part2: number } => {
	const maps = getMaps(input);
	const part2 = findLCM(
		...Object.keys(maps.nodes)
			.filter((el) => /A$/.test(el))
			.map((el) => walk(maps, el, 0, true))
	);

	return { part1: walk(maps, 'AAA', 0), part2 };
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
