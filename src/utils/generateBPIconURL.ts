export function generateBPIconURL(iconName: string) {
  const BLUEPRINT_BASE_URL =
    "https://raw.githubusercontent.com/palantir/blueprint/761e6d31622a193a7c93850a7a2633eda3b1c9b2/resources/icons/16px/";
  return `${BLUEPRINT_BASE_URL}${iconName}.svg`;
}
