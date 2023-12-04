import { readFile as fsReadFile } from 'fs/promises';
import { resolve } from 'path';
import { performance } from 'perf_hooks';

const readFile = async (filePath: string): Promise<string> => {
	try {
		return await fsReadFile(resolve(__dirname, filePath), 'utf8');
	} catch (error) {
		throw `Failed: ${error instanceof Error ? error.message : error}`;
	}
};

const getResults = (input: string[]): { part1: number; part2: number } => {
	const results = { part1: 0, part2: 0 };
	const cards: { cardNumber: number; wins: number[]; nums: number[]; copy: number[] }[] = [];

	input.forEach((str, index) => {
		const match = str.match(/Card\s+(\d+):\s*([\d\s]+)\s+\|\s+([\d\s]+)/);
		if (!match) return;
		const [, cardNumber, winsStr, numsStr] = match;
		const wins = winsStr.trim().split(/\s+/).map(Number);
		const nums = numsStr.trim().split(/\s+/).map(Number);
		cards.push({ cardNumber: Number(cardNumber), wins, nums, copy: [] });
	});

	results.part1 = cards.reduce((acc, card) => acc + card.nums.reduce((points, number) => (card.wins.includes(number) ? (points === 0 ? 1 : points * 2) : points), 0), 0);

	for (let i = 0; i < cards.length; i++) {
		let card = cards[i];
		let matchCount = 0;

		for (let j = 0; j < card.nums.length; j++) {
			if (card.wins.includes(card.nums[j])) {
				const targetIndex = i + ++matchCount;
				if (targetIndex < cards.length) cards[targetIndex].copy = cards[targetIndex].copy.concat([i, ...card.copy]);
			}
		}
	}

	results.part2 = cards.length + cards.reduce((acc, card) => acc + card.copy.length, 0);

	return results;
};

async function main() {
	try {
		const startTime = performance.now();
		const input = (await readFile('./input.txt')).split('\n');
		const results = getResults(input);
		const time = performance.now() - startTime;
		console.log(`Part 1: ${results.part1}\nPart 2: ${results.part2}\nTimer: ${time} ms`);
	} catch (error) {
		console.error(error);
	}
}

main().catch((error) => console.error(error));
