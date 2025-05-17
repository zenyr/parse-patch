export const HEADERS = {
  FROM: "From: ",
  DATE: "Date: ",
  SUBJECT: "Subject: ",
};

export const REGEX = {
  FROM: /^From\s+([0-9a-f]{40})\s/,
  AUTHOR_EMAIL: /<(.*)>/,
  PATCH_HEADER: /^\[PATCH[^\]]*\]\s*/,
};