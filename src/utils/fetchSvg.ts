import axios from "axios";
import { JSDOM } from "jsdom";
import { ErrorTuple } from "../types.js";

/**
 * Fetches an SVG from a specified URL and returns it as a parsed HTML string.
 *
 * @param url - The URL of the SVG file to fetch
 * @returns A Promise that resolves to a tuple where:
 *   - First element is the SVG HTML string if successful, or null if failed
 *   - Second element is an Error object if failed, or null if successful
 *
 * @throws Returns an Error in the second element of the tuple if:
 *   - The network request fails
 *   - The response doesn't contain a valid SVG element
 *   - Any other exception occurs during the fetch or parsing process
 */
export async function fetchSvg(url: string): Promise<ErrorTuple<string>> {
  try {
    const res = await axios.get(url, { responseType: "text" });
    const svg: string = res.data;

    // Parse the SVG using JSDOM
    const dom = new JSDOM(svg, { contentType: "image/svg+xml" });
    const svgElement = dom.window.document.querySelector("svg");

    if (svgElement) {
      // Get the outer HTML which includes all inner content
      return [svgElement.outerHTML, null];
    }

    // If SVG element is not found, treat as error
    return [null, new Error("No <svg> element found in the response")];
  } catch (e: any) {
    return [null, e instanceof Error ? e : new Error(String(e))];
  }
}
