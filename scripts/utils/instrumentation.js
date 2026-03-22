/**
 * Moves Universal Editor instrumentation attributes from one element to another.
 * Used when block decoration restructures the DOM (e.g., replacing div rows with li elements).
 * @param {Element} from - Source element with data-aue-* attributes
 * @param {Element|null} to - Target element (or null to just remove attributes)
 */
export default function moveInstrumentation(from, to) {
  const attrs = [...from.attributes]
    .map(({ nodeName }) => nodeName)
    .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-'));
  attrs.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to?.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}
