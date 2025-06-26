import { ErrorTuple } from "../types.js";
import { fetchSvg } from "./fetchSvg.js";
import { generateBPIconURL } from "./generateBPIconURL.js";

/**
 * Retrieves SVG content for a BP6 icon by name.
 * 
 * @param iconName - The name of the icon to retrieve
 * @returns A Promise that resolves to an ErrorTuple containing either the SVG content as a string or an error
 * @async
 */
export async function getBP6IconSVG(
  iconName: string
): Promise<ErrorTuple<string>> {
  const bp6IconSvgUrl = generateBPIconURL(iconName);
  return await fetchSvg(bp6IconSvgUrl);
}
