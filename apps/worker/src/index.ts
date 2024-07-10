import { promises as fs } from 'fs';
import path from 'path';

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
    await fs.rmdir(dirPath, { recursive: true });
  } catch (error) {
    // Re-throw the error if it's not related to the existence of the directory
    if ((error as any).code !== 'ENOENT') throw error;
  }
};

const main = async () => {
  const assetsDir = path.join(__dirname, '..', 'assets', 'element_classes');
  const resultsDir = path.join(__dirname, '..', 'assets', 'element_classes_copy');

  // Ensure the empty directory exists
  await deleteDirectory(resultsDir);
  await fs.mkdir(resultsDir, { recursive: true });

  const filePaths = await readDirectory(assetsDir);

  for (const p of filePaths) {
    const relativePath = path.relative(assetsDir, p);
    const destination = path.join(resultsDir, relativePath);

    if (path.extname(p) === '.svg') {
      // TODO - convert svg to png using sharp
    } else {
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.copyFile(p, destination);
    }
  }
};

main()
  .then(() => process.exit(0))
  .catch((e) => {
    throw e;
  });
