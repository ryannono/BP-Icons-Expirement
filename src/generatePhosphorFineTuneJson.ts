// Script to generate fine-tuning JSON for Phosphor icons in TypeScript
// Usage: ts-node generatePhosphorFineTuneJson.ts

import fs from "fs";
import path from "path";
import axios from "axios";
import { icons } from "./iconMetadata";
import { IconEntry } from "./types";
import { JSDOM } from "jsdom";

const PHOSPHOR_BASE_URL =
  "https://raw.githubusercontent.com/phosphor-icons/core/33fb01d1d33cd0156633ea4d33f4011fabe4d2da/assets/regular";

function buildPrompt(icon: IconEntry): string {
  const tags = icon.tags.join(", ");
  const categories = icon.categories.join(", ");
  return `Create an icon representing ${tags} that fits in the category/categories: ${categories} and could be named and represent "${icon.name}".`;
}

// Fetch the entire <svg> element as the completion, ensuring inner contents are included
async function fetchSvg(iconName: string): Promise<string | null> {
  const url = `${PHOSPHOR_BASE_URL}/${iconName}.svg`;
  try {
    const res = await axios.get(url, { responseType: "text" });
    const svg: string = res.data;

    // Parse the SVG using JSDOM
    const dom = new JSDOM(svg, { contentType: "image/svg+xml" });
    const svgElement = dom.window.document.querySelector("svg");

    if (svgElement) {
      // Get the outer HTML which includes all inner content
      return svgElement.outerHTML;
    }

    return svg;
  } catch (e: any) {
    console.error(`Failed to fetch SVG for ${iconName}:`, e.message);
    return null;
  }
}

async function processIcon(icon: IconEntry) {
  const prompt = buildPrompt(icon);
  const svgContent = await fetchSvg(icon.name);
  if (!svgContent) return null;
  console.log(`Processed: ${icon.name}`);
  // Output in chat fine-tuning format
  return {
    messages: [
      { role: "user", content: prompt },
      { role: "assistant", content: svgContent },
    ],
  };
}

async function main(iconName?: IconEntry["name"]) {
  const output: { messages: { role: string; content: string }[] }[] = [];

  if (iconName) {
    const icon = icons.find((icon) => icon.name === iconName);

    if (!icon) {
      console.error(`Icon '${iconName}' not found in metadata.`);
      return;
    }

    const result = await processIcon(icon);
    if (result) output.push(result);
  } else {
    for (const icon of icons) {
      const result = await processIcon(icon);
      if (result) output.push(result);
    }
  }

  // Write as JSONL (JSON Lines) format for chat fine-tuning
  const jsonlContent = output.map((item) => JSON.stringify(item)).join("\n");

  fs.writeFileSync(
    path.join(__dirname, "phosphor-fine-tune.jsonl"),
    jsonlContent,
    "utf8"
  );

  console.log("Done! Output written to phosphor-fine-tune.jsonl and .json");
}

main();
