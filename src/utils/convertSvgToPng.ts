import { convert } from "convert-svg-to-png";
import { executablePath } from "puppeteer";
import { ErrorTuple } from "../types.js";

/**
 * Converts SVG content to a PNG buffer.
 *
 * This function takes SVG markup as a string and transforms it into a PNG image
 * represented as a buffer. It uses a headless browser instance for the conversion.
 *
 * @param svgContent - The SVG content as a string to convert to PNG
 * @returns A promise that resolves to an error tuple containing either:
 *          - On success: [Buffer, null] where Buffer contains the PNG data
 *          - On failure: [null, Error] with the error that occurred
 */
export async function convertSvgToPng(
  svgContent: string
): Promise<ErrorTuple<Buffer<ArrayBufferLike>>> {
  try {
    // Convert SVG to PNG using convert-svg-to-png
    const pngBuffer = await convert(svgContent, {
      launch: { executablePath },
      height: 100,
      width: 100,
    });
    return [pngBuffer, null];
  } catch (e) {
    return [null, e instanceof Error ? e : new Error(String(e))];
  }
}
