import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';

const readDirectory = async (dirPath: string): Promise<string[]> => {
  let filesList: string[] = [];
  const dirents = await fs.readdir(dirPath, { withFileTypes: true });
  for (const dirent of dirents) {
    const fullPath = path.join(dirPath, dirent.name);
    if (dirent.isDirectory()) {
      filesList = filesList.concat(await readDirectory(fullPath));
    } else {
      filesList.push(fullPath);
    }
  }
  return filesList;
};

const deleteDirectory = async (dirPath: string): Promise<void> => {
  try {
    await fs.access(dirPath);
    await fs.rm(dirPath, { recursive: true });
  } catch (error) {
    // Re-throw the error if it's not related to the existence of the directory
    if ((error as any).code !== 'ENOENT') throw error;
  }
};

const main = async () => {
  console.log('Starting...');
  const assetsDir = path.join(__dirname, '..', 'assets', 'original');
  const resultsDir = path.join(__dirname, '..', 'assets', 'copy');

  // Ensure the empty directory exists
  await deleteDirectory(resultsDir);
  await fs.mkdir(resultsDir, { recursive: true });

  const filePaths = await readDirectory(assetsDir);

  const badPaths: string[] = [];

  for (const p of filePaths) {
    const relativePath = path.relative(assetsDir, p);
    const destination = path.join(resultsDir, relativePath);

    try {
      if (path.extname(p) === '.svg') {
        const dest = destination.replace('.svg', '.png');
        await fs.mkdir(path.dirname(dest), { recursive: true });
        await sharp(p).png().toFile(destination.replace('.svg', '.png'));
      } else {
        await fs.mkdir(path.dirname(destination), { recursive: true });
        await fs.copyFile(p, destination);
      }
    } catch (error) {
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.copyFile(p, destination);
      console.log(`Error: ${(error as any).message}`);
      badPaths.push(p);
    }
  }

  console.log(badPaths);
  console.log('Done.');
};

main()
  .then(() => process.exit(0))
  .catch((e) => {
    throw e;
  });
