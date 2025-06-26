import { promises as fs } from "node:fs";
import { ErrorTuple } from "../types.js";

/**
 * Saves content to a file at the specified location, creating directories if they don't exist.
 *
 * @param dir - The directory path where the file should be saved
 * @param name - The name of the file without extension
 * @param extension - The file extension (without dot)
 * @param content - The content to save to the file (string, Buffer, or Uint8Array)
 * @returns A tuple where the first element is true on success (null on failure) and the second
 *          element is an Error object on failure (null on success)
 */
export async function saveFile(
  dir: string,
  name: string,
  extension: string,
  content: string | Buffer | Uint8Array
): Promise<ErrorTuple<Boolean>> {
  try {
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(`${dir}/${name}.${extension}`, content);
    return [true, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}
