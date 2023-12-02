import { readFile as fsReadFile } from 'fs/promises';
import { resolve } from 'path';

async function readFile(filePath: string): Promise<string> {
	try {
		return await fsReadFile(resolve(__dirname, filePath), 'utf8');
	} catch (error) {
		throw `Failed: ${error instanceof Error ? error.message : error}`;
	}
}

function calculateSum(data: string): { [key: string]: number } {
	return data.split('\n').reduce(
		(acc, str, index) => {
			const partOneDigits = str.match(/\d(?=\D*$)|\d/g) ?? [];
			const partOneDigitA = partOneDigits[0] ?? 0;
			const partOneDigitB = partOneDigits?.pop() ?? 0;
			acc['part1'] += partOneDigits.length > 0 ? parseInt(`${partOneDigitA}${partOneDigitB}`, 10) : 0;

			const digitMap: { [key: string]: string } = {
				zero: '0',
				one: '1',
				two: '2',
				three: '3',
				four: '4',
				five: '5',
				six: '6',
				seven: '7',
				eight: '8',
				nine: '9'
			};

			const partTwoDigitA = str
				.toLowerCase()
				.match(new RegExp(`\(?:${Object.keys(digitMap).join('|')}\|\\d)`))![0]
				.replace(new RegExp(`\(?:${Object.keys(digitMap).join('|')})`, 'i'), (match) => digitMap[match] ?? match);

			const partTwoDigitB = str
				.split('')
				.reverse()
				.join('')
				.toLowerCase()
				.match(
					new RegExp(
						`\(?:${Object.keys(digitMap)
							.map((str) => str.split('').reverse().join(''))
							.join('|')}\|\\d)`
					)
				)![0]
				.replace(
					new RegExp(
						`\(?:${Object.keys(digitMap)
							.map((str) => str.split('').reverse().join(''))
							.join('|')})`,
						'i'
					),
					(match) => digitMap[match.split('').reverse().join('')] ?? match.split('').reverse().join('')
				);

			acc['part2'] += parseInt(`${partTwoDigitA}${partTwoDigitB}`, 10) ?? 0;

			console.log(`${index + 1}.	[${str}]\n	part1: [${+partOneDigitA}${+partOneDigitB}]\n	part2: [${+partTwoDigitA}${+partTwoDigitB}]\n`);
			return acc;
		},
		{ part1: 0, part2: 0 }
	);
}

async function main() {
	try {
		const strings = await readFile('./input.txt');
		const result = calculateSum(strings);
		console.log(`\nTotal\npart1: ${result['part1']}\npart2: ${result['part2']}`);
	} catch (error) {
		console.error(error);
	}
}

main();
