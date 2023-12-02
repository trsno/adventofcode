import { readFile as fsReadFile } from 'fs/promises';
import { resolve } from 'path';

async function readFile(filePath: string): Promise<string> {
	try {
		return await fsReadFile(resolve(__dirname, filePath), 'utf8');
	} catch (error) {
		throw `Failed: ${error instanceof Error ? error.message : error}`;
	}
}

type ColorCounts = { blue: number; red: number; green: number };
function calculateGames(input: string): Record<string, ColorCounts[]> {
	const data: Record<string, ColorCounts[]> = {};
	input.split('\n').forEach((str) => {
		const [game, reveals] = str.split(':');
		const revealArray = reveals.split(';').map((reveal) => reveal.replace(/\s/g, '').split(','));
		data[game] = revealArray.map((reveal) =>
			reveal.reduce(
				(acc, value) => {
					const color = value.replace(/[0-9]/g, '') as keyof ColorCounts;
					const count = +value.replace(color, '');
					acc[color] += count;
					return acc;
				},
				{ blue: 0, red: 0, green: 0 } as ColorCounts
			)
		);
	});
	return data;
}

async function main() {
	try {
		const cubeAvailable = { red: 12, green: 13, blue: 14 };
		const input = await readFile('./input.txt');
		const games = calculateGames(input);
		const result = Object.entries(games).reduce(
			(acc, [id, game]) => {
				console.log(id);
				// Part 1
				const possible = game.every((reveal, index) => {
					console.log(`reveal #${index + 1} [R:${reveal.red}] [G:${reveal.green}] [B:${reveal.blue}]`);
					return reveal.blue <= cubeAvailable.blue && reveal.red <= cubeAvailable.red && reveal.green <= cubeAvailable.green;
				});
				if (possible) {
					acc.part1 += +id.replace(/game\s/i, '');
					console.log(`=> Possible\n`);
				} else {
					console.log(`=> NOT Possible\n`);
				}

				// Part 2
				const cubesNeeded = game.reduce(
					(acc, reveal) => {
						if (reveal.red > acc.red) acc.red = reveal.red;
						if (reveal.green > acc.green) acc.green = reveal.green;
						if (reveal.blue > acc.blue) acc.blue = reveal.blue;
						return acc;
					},
					{ blue: 0, red: 0, green: 0 }
				);
				acc.part2 += cubesNeeded.red * cubesNeeded.green * cubesNeeded.blue;

				return acc;
			},
			{ part1: 0, part2: 0 }
		);
		console.log(`\nTotal\npart1: ${result['part1']}\npart2: ${result['part2']}`);
	} catch (error) {
		console.error(error);
	}
}

main().catch((error) => console.error(error));
