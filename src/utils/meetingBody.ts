export const MEETING_BODY_ID = "opentalk-meeting-info";
const MAX_DEPTH = 50;

/**
 * Main Orchestrator:
 * 1. Parses HTML.
 * 2. Removes old meeting artifacts.
 * 3. Unwraps user content (flattening Outlook's nesting).
 * 4. Reconstructs the body with the clean content + new meeting info.
 */
export const getUpdatedMeetingBody = (
  htmlContent: string,
  newMeetingMarkup: string,
  roomId?: string
): string => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    // 1. Clean legacy/existing meeting blocks
    removeOldMeetingInfo(doc, roomId);

    // 2. Extract the actual user content (flattening wrappers)
    const userContentFragment = extractUserContent(doc.body);
    trimTrailingEmptyNodes(userContentFragment);

    // 3. Rebuild body
    return rebuildBody(doc, userContentFragment, newMeetingMarkup);
  } catch (error) {
    console.warn("Body cleanup failed, falling back to append.", error);
    return htmlContent + newMeetingMarkup;
  }
};

/**
 * Removes the meeting block.
 * Strategies:
 * A. Look for specific Element IDs (current and Outlook-prefixed).
 * B. Look for legacy blocks via Room ID (if provided).
 */
const removeOldMeetingInfo = (doc: Document, roomId?: string): void => {
  const existing =
    doc.getElementById(MEETING_BODY_ID) || doc.getElementById(`x_${MEETING_BODY_ID}`);

  if (existing) {
    existing.remove();
    return;
  }

  if (roomId) {
    doc.querySelectorAll(`a[href*="/room/${roomId}"]`).forEach((a) => {
      findLegacyContainer(a as HTMLElement)?.remove();
    });
  }
};

/**
 * Finds the container for legacy meeting blocks (margin: 0 auto).
 */
const findLegacyContainer = (element: HTMLElement): HTMLElement | null => {
  let parent = element.parentElement;
  while (parent && parent.tagName !== "BODY") {
    const style = parent.getAttribute("style");
    if (style && /margin:\s*0(?:px)?\s*auto/i.test(style)) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
};

/**
 * Flattens the Outlook wrappers to get the raw list of sibling nodes.
 */
const extractUserContent = (root: HTMLElement): DocumentFragment => {
  let current = root;
  let depth = 0;

  // Drill down through single-child wrappers
  while (current && depth < MAX_DEPTH) {
    if (hasVisibleText(current)) break;

    const wrapper = getNextWrapperChild(current);
    if (wrapper) {
      current = wrapper;
      depth++;
    } else {
      break;
    }
  }

  // Clone all children into a fragment
  const fragment = document.createDocumentFragment();
  // If current is the body or a container with multiple children, take the children
  if (current.children.length > 0 || current.childNodes.length > 0) {
    Array.from(current.childNodes).forEach((node) => fragment.appendChild(node.cloneNode(true)));
  } else {
    fragment.appendChild(current.cloneNode(true));
  }

  return fragment;
};

/**
 * Checks if a node has visible text.
 */
const hasVisibleText = (node: Node): boolean => {
  return Array.from(node.childNodes).some(
    (n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim()
  );
};

/**
 * Identifies if we should drill deeper (single DIV/SPAN wrapper).
 */
const getNextWrapperChild = (parent: HTMLElement): HTMLElement | null => {
  const children = Array.from(parent.children) as HTMLElement[];
  if (!children.length) return null;

  const [first, second] = children;
  const isWrapper = (el: HTMLElement) => ["DIV", "SPAN"].includes(el.tagName);

  if (children.length === 1 && isWrapper(first)) return first;

  // Outlook often adds a trailing BR: <div>Content</div><br>
  if (children.length === 2 && isWrapper(first) && second.tagName === "BR") return first;

  return null;
};

/**
 * Iterates backwards from the end of the content and removes empty nodes.
 * Removes: <br>, empty text nodes, and <div><br></div>.
 */
const trimTrailingEmptyNodes = (fragment: DocumentFragment): void => {
  while (fragment.lastChild) {
    const node = fragment.lastChild;

    if (isEmptyNode(node)) {
      fragment.removeChild(node);
    } else {
      // We hit real content, stop trimming.
      break;
    }
  }
};

/**
 * Determines if a node is visually empty.
 */
const isEmptyNode = (node: Node): boolean => {
  // 1. Empty Text Node
  if (node.nodeType === Node.TEXT_NODE) {
    return !node.textContent?.trim();
  }

  // 2. <br> tag
  if (node.nodeName === "BR") {
    return true;
  }

  // 3. Element (div/p/span) that contains only whitespace or <br>
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as HTMLElement;
    // Don't remove if it has an image
    if (el.querySelector("img")) return false;

    // Check if text content is empty
    const text = el.innerText || el.textContent || "";
    return !text.trim();
  }

  return false;
};

/**
 * Assembles the final HTML.
 */
const rebuildBody = (doc: Document, content: DocumentFragment, newMarkup: string): string => {
  doc.body.innerHTML = "";

  // If the user deleted everything, give them one clean line to type on
  if (!content.hasChildNodes()) {
    doc.body.innerHTML = "<div><br></div>";
  } else {
    doc.body.appendChild(content);
  }

  doc.body.insertAdjacentHTML("beforeend", newMarkup);
  return doc.body.innerHTML;
};

/**
 * Removes previously inserted meeting blocks from an HTML string.
 * Handles both the current marker-based block (by ID) and a legacy layout
 * where the meeting section container used `margin: 0 auto`.
 */
export const removeOldMeetingBody = (htmlContent: string, roomId?: string): string => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");
    let contentModified = false;

    // Remove new style block by ID (Outlook prefix ids with x_)
    const oldElement =
      doc.getElementById(MEETING_BODY_ID) || doc.getElementById(`x_${MEETING_BODY_ID}`);
    if (oldElement) {
      oldElement.remove();
      contentModified = true;
    }

    // Remove legacy block by traversing up from the room link
    if (roomId) {
      const anchors = doc.querySelectorAll("a");
      anchors.forEach((anchor) => {
        if (
          anchor instanceof HTMLAnchorElement &&
          anchor.href &&
          anchor.href.includes(`/room/${roomId}`)
        ) {
          let container = anchor.parentElement;

          // Walk up the tree until we hit <body>, looking for a margin: 0 auto style
          while (container && container.tagName !== "BODY") {
            const style = container.getAttribute("style");
            // Regex matches "margin: 0 auto" with optional px and whitespace, case insensitive
            if (style && /margin:\s*0(?:px)?\s*auto/i.test(style)) {
              container.remove();
              contentModified = true;
              break; // stop once removed
            }
            container = container.parentElement;
          }
        }
      });
    }

    if (contentModified) {
      return doc.documentElement.outerHTML;
    }

    return htmlContent;
  } catch (e) {
    console.warn("Failed to parse DOM for cleanup", e);
    return htmlContent;
  }
};

/**
 * Converts an HTML string to plain text while preserving basic formatting like line breaks
 */
const isEffectivelyEmptyHtml = (html: string): boolean =>
  /^\s*(<(div|p)[^>]*>\s*<br\s*\/?>\s*<\/\2>)\s*$/i.test(html);

/**
 * Converts an HTML string to a clean, single-line plain text description.
 * Ensures proper spacing between block elements and breaks.
 */
export const htmlToText = (html: string): string => {
  if (!html) return "";

  try {
    const parser = new DOMParser();

    // 1. Pre-process HTML strings to ensure separation between blocks
    // Replace <br> tags with a distinct space
    let processedHtml = html.replace(/<br\s*\/?>/gi, " ");

    // Add a safety space before closing block tags.
    // This turns "<div>Text</div><div>More</div>" into "Text More"
    // instead of "TextMore" when retrieving textContent.
    processedHtml = processedHtml.replace(/<\/(div|p|li|tr|h[1-6])>/gi, " </$1>");

    // 2. Parse into a document
    const doc = parser.parseFromString(processedHtml, "text/html");

    // 3. REMOVE all style and script tags from the entire document
    // This handles styles in both <head> and <body>
    const junkTags = doc.querySelectorAll("style, script");
    junkTags.forEach((tag) => tag.remove());

    // 4. Extract text from body
    const rawText = doc.body.textContent || "";

    // 5. Clean up whitespace
    // Replace non-breaking spaces (\u00a0) with normal spaces
    // Collapse multiple spaces into one (\s+)
    return rawText
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  } catch (e) {
    console.warn("Failed to convert HTML to text", e);
    // Fallback: Strip all tags via regex if DOM parsing fails but doesn't handle the internal text of style tags well
    return html.replace(/<[^>]+>/g, " ").trim();
  }
};

export const isEmptyHtmlContent = (html: string): boolean => isEffectivelyEmptyHtml(html);
