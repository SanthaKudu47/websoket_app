import { z } from "zod";

const metaSchema = z.object({
  sport: z.string({
    error: (issue) =>
      issue.input === undefined
        ? "sport is required"
        : "sport must be a string",
  }),
  event: z.enum(["score", "action", "status"], {
    error: () => "Invalid event type",
  }),
  type: z.string({
    error: (issue) =>
      issue.input === undefined ? "type is required" : "type must be a string",
  }),
  team: z.string().nullable().optional(),
  primary: z.string().nullable().optional(),
  secondary: z.string().nullable().optional(),
  value: z.int().positive().nullable().optional(),
});

export const timelineEventSchema = z.object({
  time: z.coerce.date({
    error: (issue) =>
      issue.input === undefined
        ? "Event time is required"
        : "Invalid date format",
  }),

  description: z
    .string({
      error: (issue) =>
        issue.input === undefined
          ? "Description is required"
          : "Description must be a string",
    })
    .min(1, "Description cannot be empty"),

  event: z.enum(["score", "action", "status"], {
    error: () => "Invalid event type",
  }),

  meta: metaSchema,
});

export const timelineEventUpdateSchema = timelineEventSchema.partial();
