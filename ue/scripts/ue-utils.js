/**
 * Move instrumentation attributes from one element to another.
 * @param {Element} from - Element to copy attributes from
 * @param {Element} to - Element to copy attributes to
 */
export function moveInstrumentation(from, to) {
  if (!from || !to) return;
  const attrs = [...from.attributes]
    .map(({ nodeName }) => nodeName)
    .filter((attr) => attr.startsWith('data-aue-') || attr.startsWith('data-richtext-'));
  attrs.forEach((attr) => {
    const value = from.getAttribute(attr);
    if (value) {
      to.setAttribute(attr, value);
      from.removeAttribute(attr);
    }
  });
}
