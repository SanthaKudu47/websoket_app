import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";
import { sendResponse } from "./utils/response.js";

const arcjetKey = process.env.ARCJET_KEY;
const arcjetMode =
  process.env.ARCJET_MODE === "development" ? "DRY_RUN" : "LIVE";

if (!arcjetKey) throw new Error("ARCJET_KEY environment variable is missing");

export const httpArcjet = arcjetKey
  ? arcjet({
      key: arcjetKey,
      rules: [
        shield({ mode: arcjetMode }),
        detectBot({
          mode: arcjetMode,
          allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
        }),
        slidingWindow({ mode: arcjetMode, interval: "10s", max: 50 }),
      ],
    })
  : null;

export const wsArcjet = arcjetKey
  ? arcjet({
      key: arcjetKey,
      rules: [
        shield({ mode: arcjetMode }),
        detectBot({
          mode: arcjetMode,
          allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
        }),
        slidingWindow({ mode: arcjetMode, interval: "2s", max: 5 }),
      ],
    })
  : null;

export function securityMiddleware() {
  return async function (req, res, next) {
    if (!httpArcjet) {
      //process without arcjet
      next();
      return;
    }

    try {
      const decision = await httpArcjet.protect(req);
      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return sendResponse(res, 423, "Too many requests");
        } else if (decision.reason.isBot()) {
          return sendResponse(res, 403, "No bots allowed");
        } else {
          return sendResponse(res, 403, "Forbidden");
        }
      }
      //if safe
      next();
    } catch (error) {
      console.log("Arcjet middleware error", error);
      sendResponse(res, 503, "Service Unavailable");
    }
  };
}
