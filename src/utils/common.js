import { ZodError } from "zod";

export function formatZodError(error) {
  if (!(error instanceof ZodError)) {
    return "Unknown validation error";
  }

  return error.issues
    .map((issue) => {
      const path = issue.path.length ? issue.path.join(".") : "root";
      return `${path}: ${issue.message}`;
    })
    .join(" | ");
}

export function getStartTime(isoString) {
  if (!isoString || typeof isoString !== "string") {
    return null;
  }

  // Must contain "T" to have both date + time
  if (!isoString.includes("T")) {
    return null;
  }

  // Must have time part after "T"
  const [, timePart] = isoString.split("T");
  if (!timePart) {
    return null;
  }

  return isoString; // valid date+time → return as-is
}
