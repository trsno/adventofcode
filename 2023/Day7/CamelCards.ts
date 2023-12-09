import { performance } from 'perf_hooks';
import { resolve } from 'path';
import readFile from '../utils';

interface Hands {
	hand: string;
	bid: number;
	type: number;
}

function categorizePokerHand(hand: string) {
	const typesRegex = [
		{ regex: /^(.)\1{4}$/, name: 'Five of a kind' }, // 6
		{ regex: /^(.)(?!\1)(.)\2{3}$|^(.)\3{3}(?!\3)(.)$/, name: 'Four of a kind' }, // 5
		{ regex: /^(.)\1{2}(?!\1)(.)\2{1}$|^(.)\3{1}(?!\3)(.)\4{2}$/, name: 'Full house' }, // 4
		{ regex: /^(.)(?!\1)(.)(?!\1|\2)(.)\3{2}$|^(.)\4{2}(?!\4)(.)(?!\4|\5)(.)$|^(.)(?!\7)(.)\8{2}(?!\7|\8)(.)$/, name: 'Three of a kind' }, // 3
		{ regex: /^(.)\1{1}(?!\1)(.)\2{1}(?!\1|\2)(.)$|^(.)\4{1}(?!\4)(.)(?!\4|\5)(.)\6{1}$|^(.)(?!\7)(.)\8{1}(?!\7|\8)(.)\9{1}$/, name: 'Two pair' }, //2
		{
			regex: /^(.)\1{1}(?!\1)(.)(?!\1|\2)(.)(?!\1|\2|\3)(.)$|^(.)(?!\5)(.)\6{1}(?!\5|\6)(.)(?!\5|\6|\7)(.)$|^(.)(?!\9)(.)(?!\9|\10)(.)\11{1}(?!\9|\10|\11)(.)$|^(.)(?!\13)(.)(?!\13|\14)(.)(?!\13|\14|\15)(.)\16{1}$/,
			name: 'One pair'
		}, // 1
		{ regex: /^(?!.*(.).*\1)(.){5}$/, name: 'High card' } // 0
	];
	let handType = typesRegex.length - 1;
	const sortedHand = hand.split('').sort().join('');
	for (const [index, type] of typesRegex.entries()) {
		if (type.regex.test(sortedHand)) {
			handType = handType - index;
			break;
		}
	}
	return handType;
}

const getNewCard = (card: { hand: string; type: number }) => {
	const j = card.hand.match(/J/g);
	let newCard = card.type;
	if (j !== null) {
		if (j.length === 2) {
			newCard += card.type === 4 ? 2 : card.type === 2 ? 3 : 1;
			if (card.type === 1) newCard += 1;
		} else if (j.length === 1) {
			if (card.type === 2 || card.type === 3 || card.type === 1) {
				newCard += 2;
			} else {
				newCard += 1;
			}
		} else {
			newCard += j.length;
		}
	}
	return newCard > 6 ? 6 : newCard;
};

const sortHands = (hands: Hands[], jokerCheck: boolean) => {
	const cardMap: { [key: string]: number } = { A: 14, K: 13, Q: 12, J: jokerCheck ? 1 : 11, T: 10 };

	return hands.sort((a, b) => {
		if (jokerCheck) {
			const aCard = getNewCard(a);
			const bCard = getNewCard(b);
			if (aCard !== bCard) return aCard - bCard;
		} else if (a.type !== b.type) {
			return a.type - b.type;
		}

		for (const [index, card] of a.hand.split('').entries()) {
			const nextCard = b.hand[index];
			const aCard = /\d/.test(card) ? +card : cardMap[card];
			const bCard = /\d/.test(nextCard) ? +nextCard : cardMap[nextCard];

			if (aCard !== bCard) {
				return aCard - bCard;
			}
		}

		return 0;
	});
};

const getResults = (input: string[]): { part1: number; part2: number } => {
	const hands = input.reduce((acc, handAndBid) => {
		const [hand, bid] = handAndBid.split(/\s/).map((v, i) => (i === 0 ? v : +v)) as [string, number];
		const type = categorizePokerHand(hand);
		return [...acc, { hand, bid, type }];
	}, [] as Hands[]);

	const part1 = sortHands(hands, false).reduce((acc, hand, i) => acc + hand.bid * (i + 1), 0);
	const part2 = sortHands(hands, true).reduce((acc, hand, i) => acc + hand.bid * (i + 1), 0);
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
