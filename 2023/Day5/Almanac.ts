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

interface Maps {
	src: number;
	dest: number;
	range: number;
}

interface AlmanacData {
	seeds: number[];
	seedToSoil: Maps[];
	soilToFertilizer: Maps[];
	fertilizerToWater: Maps[];
	waterToLight: Maps[];
	lightToTemperature: Maps[];
	temperatureToHumidity: Maps[];
	humidityToLocation: Maps[];
}

const getAlmanacData = (input: string) => {
	return input.split('\n\n').reduce((acc, str) => {
		const [key, values] = str.split(/:\n|:/);
		const mapKey = key.replace(/\smap/g, '').replace(/-([a-z])/g, (match, group) => group.toUpperCase());

		const mapValues = values.split(/\n/).reduce((acc, str) => {
			const numbers = str.match(/\d+/g)!.map(Number);
			const [dest, src, range] = numbers;
			return key === 'seeds' ? numbers : [...acc, { src, dest, range }];
		}, new Array());

		return { ...acc, [mapKey]: mapValues };
	}, {} as AlmanacData);
};

function numberMapper(input: number, map: Maps[]) {
	for (const { dest, src, range } of map) {
		if (input >= src && input < src + range) {
			return dest + (input - src);
		}
	}
	return input;
}

const getLocation = (seed: number, input: AlmanacData) => {
	const soil = numberMapper(seed, input.seedToSoil);
	const fertilizer = numberMapper(soil, input.soilToFertilizer);
	const water = numberMapper(fertilizer, input.fertilizerToWater);
	const light = numberMapper(water, input.waterToLight);
	const temperature = numberMapper(light, input.lightToTemperature);
	const humidity = numberMapper(temperature, input.temperatureToHumidity);
	return numberMapper(humidity, input.humidityToLocation);
};

const getResults = (input: AlmanacData): { part1: number; part2: number } => {
	const results = { part1: 0, part2: 0 };
	const seeds = input.seeds;
	results.part1 = Math.min(...seeds.map((seed) => getLocation(seed, input)));

	// generate seed ranges
	let seedRanges: number[][] = [];
	for (let i = 0; i < seeds.length; i += 2) {
		const [start, end] = seeds.slice(i, i + 2);
		seedRanges.push([start, start + end - 1]);
	}
	seedRanges.sort((a, b) => a[0] - b[0]);
	let slicedRanges = [seedRanges[0]];
	for (let i = 1; i < seedRanges.length; i++) {
		let current = seedRanges[i];
		let last = slicedRanges[slicedRanges.length - 1];

		if (last[1] + 1 === current[0] || (current[0] <= last[1] && last[1] <= current[1])) {
			last[1] = current[1];
		} else {
			slicedRanges.push(current);
		}
	}
	// end of seed ranges

	console.log(seedRanges);

	let lowestLocation = Infinity;
	for (const [index, range] of seedRanges.entries()) {
		const [start, end] = range;

		// for logging
		const tenPercent = Math.floor((end - start) / 10);
		let step = 0;
		// logging

		for (let i = start; i <= end; i++) {
			const value = getLocation(i, input);
			if (value < lowestLocation) lowestLocation = value;

			// logging
			if (i % tenPercent === 0) {
				console.clear();
				console.log('[ ', index + 1, '/', seedRanges.length, ' ] processing range of:', start, 'to', end, `(~${Math.floor((end - start) / 1e6)}M)`);
				let bar = '=';
				let whitespace = '         ';
				for (let i = 0; i < step; i++) {
					bar += '=';
					whitespace = whitespace.slice(0, -1);
				}
				console.log(`[${bar}${whitespace}] ${++step * 10}% done`);
			}
		}
	}
	results.part2 = lowestLocation;

	return results;
};

async function main() {
	try {
		const startTime = performance.now();
		const input = await readFile('./input.txt');
		const almanacData = getAlmanacData(input);
		const results = getResults(almanacData);
		const time = performance.now() - startTime;
		console.log(`Part 1: ${results.part1}\nPart 2: ${results.part2}\nTimer: ${time} ms`);
	} catch (error) {
		console.error(error);
	}
}

main().catch((error) => console.error(error));
