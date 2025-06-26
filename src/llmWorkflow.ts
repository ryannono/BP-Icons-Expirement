import { OpenAI } from "openai";
import { readFileSync } from "node:fs";
import dotenv from "dotenv";
import { saveFile } from "./utils/saveFile.js";
import { generateImageUrl } from "./utils/generateImageUrl.js";
import { getBP6IconSVG } from "./utils/getBP6IconSVG.js";
import { convertSvgToPng } from "./utils/convertSvgToPng.js";

dotenv.config();

export const OUTPUT_DIR = "./llmWorkflowOutputs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function generateImageGenPrompt(iconName: string) {
  return `Generate a ${iconName} icon as pictured in the attached png, but rework it into a clean, minimalist, thin-lined icon style instead of the thick 2px filled one it is currently. It should be rendered in black on a fully transparent background. The icon should be centered within a square 16px canvas and drawn with a uniform, fine 1px width stroke width. The lines are precise and evenly spaced, without any gradients, or drop shadows. Each symbol should be clearly identifiable — relying on negative space, symmetry, and simple geometric forms. Use smooth curves, rounded line caps, and right angles where appropriate. The overall aesthetic is elegant, moder, professional, and functional, designed for UI use in modern apps. Output as crisp, high-resolution PNG files with no blurring artifacts. The icon should retain the essence and semantic meaning of the original while adhering to these new style guidelines.`;
}

function generateSvgGenPrompt(iconName: string) {
  const styleJson = readFileSync(
    "./src/style-references/bp7-icon-style.json",
    "utf8"
  );
  return `Give me the svg code of a ${iconName} icon pictured in the attached png, within a 16x16px canvas and viewbox. Your response should strictly contain only the SVG code, without any additional text or explanations.`;
}

/**
 * Generates a new BP7 icon based on an existing BP6 icon.
 *
 * This asynchronous function performs the following operations:
 * 1. Retrieves the SVG for an existing BP6 icon
 * 2. Converts the SVG to PNG format
 * 3. Saves the BP6 icon PNG to the output directory
 * 4. Generates a new BP7 version of the icon using OpenAI's image generation
 * 5. Saves the BP7 icon as PNG
 * 6. Generates an SVG version of the BP7 icon
 * 7. Saves the full SVG generation response as JSON for debugging
 *
 * @param iconName - The name of the icon to generate
 * @throws {Error} If any step in the process fails, including:
 *   - Failure to fetch the BP6 icon
 *   - Failure to convert SVG to PNG
 *   - Failure to save files
 *   - Failure to generate new icon images
 *   - No image data returned from OpenAI
 * @returns {Promise<void>} A promise that resolves when the icon generation is complete
 */
async function generateNewIcon(iconName: string) {
  const [bp6IconSvg, iconFetchError] = await getBP6IconSVG(iconName);

  if (iconFetchError) {
    throw new Error(
      `Failed to get BP6 icon PNG for "${iconName}": ${iconFetchError.message}`
    );
  } else {
    console.log(`Retrieved BP6 icon SVG for "${iconName}" successfully.`);
  }

  const [bp6IconPng, svgConversionError] = await convertSvgToPng(bp6IconSvg);

  if (svgConversionError) {
    throw new Error(
      `Failed to convert BP6 icon SVG to PNG for "${iconName}": ${svgConversionError.message}`
    );
  } else {
    console.log(
      `Converted BP6 icon SVG to PNG for "${iconName}" successfully.`
    );
  }

  const [savedBP6IconPng, BP6IconPngSaveError] = await saveFile(
    OUTPUT_DIR,
    `${iconName}-bp6-reference`,
    "png",
    bp6IconPng
  );

  if (!savedBP6IconPng) {
    throw new Error(
      `Failed to save BP6 icon PNG for "${iconName}": ${BP6IconPngSaveError.message}`
    );
  } else {
    console.log(`Saved BP6 icon PNG for "${iconName}" successfully.`);
  }

  const referenceImageGenResponse = await openai.responses.create({
    model: "o3", // best reasoning model available
    reasoning: { effort: "high" },
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: generateImageGenPrompt(iconName) },
          {
            type: "input_image",
            image_url: generateImageUrl(bp6IconPng),
            detail: "high",
          },
        ],
      },
    ],
    tools: [{ type: "image_generation" }],
  });

  const bp7IconImageData = referenceImageGenResponse.output
    .filter((output) => output.type === "image_generation_call")
    .map((output) => output.result);

  if (!bp7IconImageData[0]) {
    throw new Error(
      `No image data returned for icon: ${iconName}. Response: ${JSON.stringify(
        referenceImageGenResponse.output
      )}`
    );
  } else {
    console.log(`Generated new icon image for "${iconName}" successfully.`);
  }

  const bp7IconImage = Buffer.from(bp7IconImageData[0], "base64");

  const [_pngWasSaved, pngSaveError] = await saveFile(
    OUTPUT_DIR,
    `${iconName}-bp7-reference`,
    "png",
    bp7IconImage
  );

  if (pngSaveError) {
    throw new Error(
      `Failed to save PNG for icon: ${iconName}, Error: ${pngSaveError.message}`
    );
  } else {
    console.log(`Saved PNG for icon "${iconName}" successfully.`);
  }

  const svgGenResponse = await openai.responses.create({
    model: "o3", // best reasoning model available
    reasoning: { effort: "high" },
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: generateSvgGenPrompt(iconName) },
          {
            type: "input_image",
            image_url: generateImageUrl(bp7IconImage),
            detail: "high",
          },
        ],
      },
    ],
  });

  // Save the full response as JSON for debugging
  await saveFile(
    OUTPUT_DIR,
    `${iconName}-bp7-response`,
    "json",
    JSON.stringify(svgGenResponse, null, 2)
  );
}

generateNewIcon("add");
