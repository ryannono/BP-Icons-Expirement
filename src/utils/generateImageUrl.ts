/**
 * Converts a buffer to a data URL string with base64 encoding.
 * 
 * @param buffer - Buffer containing the image data to be converted
 * @param imageType - The MIME subtype of the image (default: "png")
 * @returns A data URL string in the format "data:image/[imageType];base64,[base64EncodedData]"
 * 
 */
export function generateImageUrl(
  buffer: Buffer<ArrayBufferLike>,
  imageType = "png"
) {
  return `data:image/${imageType};base64,${buffer.toString("base64")}`;
}
