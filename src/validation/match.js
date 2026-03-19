import * as z from "zod";

export const MatchValidationSchema = z
  .object({
    sport: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "Sport type is required"
            : "Sport must be a string",
      })
      .min(2, "Sport type must be at least 2 characters"),

    homeTeam: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "Home team name is required"
            : "Home team must be a string",
      })
      .min(2, "Home team name must be at least 2 characters"),

    awayTeam: z
      .string({
        error: (issue) =>
          issue.input === undefined
            ? "Away team name is required"
            : "Away team must be a string",
      })
      .min(2, "Away team name must be at least 2 characters"),

    date: z.coerce.date().nullable().optional(),
    startTime: z.coerce.date().nullable().optional(),
    endTime: z.coerce.date().nullable().optional(),

    status: z.enum([
      "scheduled",
      "live",
      "paused",
      "delayed",
      "postponed",
      "cancelled",
      "finished",
    ]),

    subStatus: z.string().nullable().optional(),

    score_home: z
      .number({
        error: (issue) =>
          issue.input === undefined
            ? "Home score is required"
            : "Home score must be a number",
      })
      .min(0, "Home score cannot be negative")
      .nullable()
      .optional(),

    score_away: z
      .number({
        error: (issue) =>
          issue.input === undefined
            ? "Away score is required"
            : "Away score must be a number",
      })
      .min(0, "Away score cannot be negative")
      .nullable()
      .optional(),

    tournament: z.string().optional(),

    meta: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const { date, startTime, endTime } = data;

    // Case 1: All missing → OK
    if (!date && !startTime && !endTime) {
      return;
    }

    // Case 2: endTime exists but startTime missing → ERROR
    if (endTime && !startTime) {
      ctx.addIssue({
        code: "custom",
        message: "End time cannot exist without a start time",
        path: ["endTime"],
      });
      return;
    }

    // Case 3: both exist but end < start → ERROR
    if (startTime && endTime && endTime < startTime) {
      ctx.addIssue({
        code: "custom",
        message: "End time cannot be before start time",
        path: ["endTime"],
      });
      return;
    }

    // Case 4: startTime exists, endTime missing → OK (TBD scenario)
    return;
  });
