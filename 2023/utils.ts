import { readFile as fsReadFile } from 'fs/promises';
const readFile = async (filePath: string): Promise<string> => {
	try {
		return await fsReadFile(filePath, 'utf8');
	} catch (error) {
		throw `Failed: ${error instanceof Error ? error.message : error}`;
	}
};

export default readFile;
