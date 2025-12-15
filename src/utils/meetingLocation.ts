const DELIMITER = ";";

interface OfficeLocationObject {
  displayName?: string;
  value?: string;
}

export const buildMeetingLink = (baseUrl: string, roomId: string): string => {
  return new URL(`/room/${roomId}`, baseUrl).toString();
};

const splitLocationSegments = (location: string): string[] =>
  location
    .split(DELIMITER)
    .map((segment) => segment.trim())
    .filter(Boolean);

export const normalizeLocationString = (location: unknown): string => {
  if (typeof location === "string") {
    return location;
  }

  if (Array.isArray(location) && location.length > 0) {
    const candidate =
      (location[0] as OfficeLocationObject)?.displayName ??
      (location[0] as OfficeLocationObject)?.value;
    if (typeof candidate === "string") {
      return candidate;
    }
  }

  if (location && typeof location === "object") {
    const candidate =
      (location as OfficeLocationObject).displayName ?? (location as OfficeLocationObject).value;
    if (typeof candidate === "string") {
      return candidate;
    }
  }

  return "";
};

export const appendMeetingLinkToLocation = (location: string, meetingLink: string): string => {
  const trimmedLocation = (location ?? "").trim();

  if (!trimmedLocation) {
    return meetingLink;
  }

  // Avoid duplicating the link if it is already present anywhere in the string
  if (splitLocationSegments(trimmedLocation).includes(meetingLink)) {
    return trimmedLocation;
  }

  return `${trimmedLocation}${DELIMITER} ${meetingLink}`;
};

export const removeMeetingLinkFromLocation = (location: string, meetingLink: string): string => {
  const segments = splitLocationSegments(location ?? "");
  const filtered = segments.filter(
    (segment) => segment !== meetingLink && !segment.startsWith(meetingLink)
  );

  return filtered.join(`${DELIMITER} `);
};

export const removeMeetingLinkByBase = (location: string, baseUrl: string): string => {
  const roomBase = new URL("/room/", baseUrl).toString();
  const segments = splitLocationSegments(location ?? "");
  const filtered = segments.filter((segment) => !segment.startsWith(roomBase));

  return filtered.join(`${DELIMITER} `);
};
