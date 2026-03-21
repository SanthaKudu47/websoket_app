import { z } from "zod";

const metaSchema = z.object({
  sport: z.string({
    error: (issue) =>
      issue.input === undefined
        ? "sport is required"
        : "sport must be a string",
  }),

  event: z.string({
    error: (issue) =>
      issue.input === undefined
        ? "event is required"
        : "event must be a string",
  }),

  primary: z.string({
    error: (issue) =>
      issue.input === undefined
        ? "primary is required"
        : "primary must be a string",
  }),

  secondary: z.string().nullable().optional(),
  team: z.string().nullable().optional(),
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

  type: z.enum(["player", "match", "system"], {
    error: () => "Invalid event type",
  }),

  meta: metaSchema,
});

export const timelineEventUpdateSchema = timelineEventSchema.partial();
