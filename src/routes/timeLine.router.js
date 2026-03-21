import { Router } from "express";
import { sendResponse } from "../utils/response.js";
import Match from "../db/match.model.js";
import { timelineEventSchema } from "../validation/timeline.js";
import TimelineEvent from "../db/timeline.model.js";
import mongoose, { MongooseError } from "mongoose";
import { PaginationQuerySchema } from "../validation/queryParams.js";

const timeLineRouter = Router({ mergeParams: true });

timeLineRouter.get("/", async function (req, res) {
  const { id } = req.params;
  const { rawPage, rawLimit } = req.query;

  if (!id) {
    return sendResponse(res, 400, "Match ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendResponse(res, 400, "Invalid Match ID format");
  }

  const validated = PaginationQuerySchema.safeParse({
    page: rawPage,
    limit: rawLimit,
  });

  if (!validated.success) {
    const errorMsg = formatZodError(validated.error);
    console.log(errorMsg);
    sendResponse(res, 400, errorMsg);
    return;
  }
  const { page, limit } = validated.data;
  const skip = (page - 1) * limit;

  try {
    const query = TimelineEvent.find({ matchId: id })
      .sort({ time: 1 })
      .skip(skip)
      .limit(limit)
      .select("-__v")
      .lean();
    const events = await query.exec();
    sendResponse(res, 200, null, events);
  } catch (error) {
    console.log("Failed to fetch TimeLine events");
    if (error instanceof MongooseError) {
      sendResponse(res, 500, error.message);
    } else {
      console.log(error);
      sendResponse(res, 500, "Failed to fetch TimeLine events");
    }
  }
});

timeLineRouter.post("/", async function (req, res) {
  const { id } = req.params;
  if (!id) {
    return sendResponse(res, 400, "Match ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendResponse(res, 400, "Invalid Match ID format");
  }

  //validate request body
  const validated = timelineEventSchema.safeParse(req.body);

  if (!validated.success) {
    console.log("Failed to validate timeline data");
    console.log(formatZodError(validated.error));
    return sendResponse(res, 400, formatZodError(validated.error));
  }

  let match = null;
  try {
    match = await Match.findById(id).lean().exec();
    if (!match) {
      sendResponse(res, 400, "Match not found");
      return;
    }
  } catch (error) {
    console.log("Failed to fetch Match");
    console.log(error);
    return sendResponse(
      res,
      500,
      error instanceof MongooseError ? error.message : "Failed to fetch Match",
    );
  }
  //id is valid and have Match and validated data
  try {
    const created = await TimelineEvent.create({
      matchId: match._id,
      ...validated.data,
      meta: validated.data.meta ? JSON.stringify(validated.data.meta) : null,
    });
    const timeLineEvent = created.toObject();
    delete timeLineEvent["__v"];
    sendResponse(res, 201, null, timeLineEvent);
  } catch (error) {
    console.log("Failed to create Timeline");
    return sendResponse(
      res,
      500,
      error instanceof MongooseError
        ? error.message
        : "Failed to create Timeline",
    );
  }
});

export default timeLineRouter;
