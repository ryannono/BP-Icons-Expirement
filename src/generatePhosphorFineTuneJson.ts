// Script to generate fine-tuning JSON for Phosphor icons in TypeScript
// Usage: ts-node generatePhosphorFineTuneJson.ts

import fs from "fs";
import path from "path";
import { phosphorIcons } from "./icon-metadata/phosphorIconMetadata.js";
import { IconEntry } from "./types.js";
import { fetchSvg } from "./utils/fetchSvg.js";

const PHOSPHOR_BASE_URL =
  "https://raw.githubusercontent.com/phosphor-icons/core/33fb01d1d33cd0156633ea4d33f4011fabe4d2da/assets/regular";

function buildPrompt(icon: IconEntry) {
  const tags = icon.tags.join(", ");
  const categories = icon.categories.join(", ");
  return `Create an icon representing ${tags} that fits in the category/categories: ${categories} and could be named and represent "${icon.name}".`;
}

export function generatePhosphorIconURL(iconName: string) {
  return `${PHOSPHOR_BASE_URL}${iconName}.svg`;
}

async function processIcon(icon: IconEntry) {
  const prompt = buildPrompt(icon);
  const [svgContent, svgFetchError] = await fetchSvg(
    generatePhosphorIconURL(icon.name)
  );

  if (svgFetchError) {
    throw new Error(
      `Failed to fetch SVG for icon '${icon.name}': ${svgFetchError.message}`
    );
  }

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
    const icon = phosphorIcons.find((icon) => icon.name === iconName);

    if (!icon) {
      console.error(`Icon '${iconName}' not found in metadata.`);
      return;
    }

    const result = await processIcon(icon);
    if (result) output.push(result);
  } else {
    for (const icon of phosphorIcons) {
      const result = await processIcon(icon);
      if (result) output.push(result);
    }
  }

  // Write as JSONL (JSON Lines) format for chat fine-tuning
  const jsonlContent = output.map((item) => JSON.stringify(item)).join("\n");

  fs.writeFileSync(
    path.join(__dirname, "../outputs/phosphor-fine-tune.jsonl"),
    jsonlContent,
    "utf8"
  );

  console.log("Done! Output written to phosphor-fine-tune.jsonl and .json");
}

main();
