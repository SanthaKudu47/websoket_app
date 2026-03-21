import { Router } from "express";
import TimelineEvent from "../db/timeline.model.js";
import { sendResponse } from "../utils/response.js";
import { timelineEventUpdateSchema } from "../validation/timeline.js";
import mongoose, { MongooseError } from "mongoose";

const timeLineBaseRouter = Router();

timeLineBaseRouter.get("/:id", async function (req, res) {
  const { id } = req.params;
  if (!id) {
    return sendResponse(res, 400, "TimeLine Event ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendResponse(res, 400, "Invalid TimeLine Event  ID format");
  }

  try {
    const result = await TimelineEvent.findById(id)
      .select("-__v")
      .lean()
      .exec();

    if (!result) {
      return sendResponse(res, 404, "Timeline event not found");
    }
    if (result.meta) {
      result.meta = JSON.parse(result.meta);
    }
    sendResponse(res, 200, null, result);
  } catch (error) {
    console.log("Failed to fetch TimeLine event");
    console.log(error);
    sendResponse(
      res,
      500,
      error instanceof MongooseError
        ? error.message
        : "Failed to fetch TimeLine event",
    );
  }
});

timeLineBaseRouter.patch("/:id", async function (req, res) {
  const { id } = req.params;

  if (!id) {
    return sendResponse(res, 400, "TimeLine Event ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendResponse(res, 400, "Invalid TimeLine Event  ID format");
  }

  const validated = timelineEventUpdateSchema.safeParse(req.body);
  if (!validated.success) {
    const errorMsg = formatZodError(validated.error);
    console.log(errorMsg);
    return sendResponse(res, 400, errorMsg);
  }
  if (validated.data.meta) {
    validated.data.meta = JSON.stringify(validated.data.meta);
  }
  //valid data
  try {
    const updated = await TimelineEvent.findByIdAndUpdate(
      { _id: id },
      validated.data,
      {
        returnDocument: "after",
      },
    )
      .select("-__v")
      .lean()
      .exec();

    if (!updated) {
      return sendResponse(res, 404, "Timeline event not found");
    }

    if (updated.meta) {
      updated.meta = JSON.parse(updated.meta);
    }

    sendResponse(res, 200, null, updated);
  } catch (error) {
    console.log("Failed to update TimeLine events");
    console.log(error);
    sendResponse(
      res,
      500,
      error instanceof MongooseError
        ? error.message
        : "Failed to update TimeLine event",
    );
  }
});

timeLineBaseRouter.delete("/:id", async function (req, res) {
  const { id } = req.params;

  // Validate ID
  if (!id) {
    return sendResponse(res, 400, "TimeLine Event ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return sendResponse(res, 400, "Invalid TimeLine Event ID format");
  }

  try {
    const deleted = await TimelineEvent.findByIdAndDelete(id)
      .select("-__v")
      .lean()
      .exec();

    if (!deleted) {
      return sendResponse(res, 404, "Timeline event not found");
    }

    // Parse meta before returning deleted object
    if (deleted.meta) {
      deleted.meta = JSON.parse(deleted.meta);
    }

    return sendResponse(res, 200, null, deleted);
  } catch (error) {
    console.log("Failed to delete TimeLine event");

    return sendResponse(
      res,
      500,
      error instanceof MongooseError
        ? error.message
        : "Failed to delete TimeLine event",
    );
  }
});

export default timeLineBaseRouter;
