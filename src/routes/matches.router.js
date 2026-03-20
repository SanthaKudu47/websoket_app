import { Router } from "express";
import { MatchValidationSchema } from "../validation/match.js";
import Match from "../db/match.model.js";
import { sendResponse } from "../utils/response.js";
import { formatZodError } from "../utils/common.js";
import mongoose, { MongooseError } from "mongoose";
import { PaginationQuerySchema } from "../validation/queryParams.js";

const matchesRouter = Router();

//matches?page=

matchesRouter.get("/:id", async function (req, res) {
  const { id } = req.params;

  if (!id) {
    return sendResponse(res, 400, "Match ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    sendResponse(res, 400, "Invalid Match ID format");
    return;
  }

  try {
    const match = await Match.findById(id).select("-__v").lean().exec();
    if (!match) {
      sendResponse(res, 404, "Match not found", null);
      return;
    }
    sendResponse(res, 200, null, match);
  } catch (error) {
    console.log("Failed to fetch Match");

    if (error instanceof MongooseError) {
      sendResponse(res, 500, error.message);
    } else {
      console.log(error);
      sendResponse(res, 500, "Failed to fetch Match");
    }
  }
});

matchesRouter.get("/", async function (req, res) {
  const { rawPage, rawLimit } = req.query;
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
    const query = Match.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v")
      .lean();
    const matches = await query.exec();
    sendResponse(res, 200, null, matches);
  } catch (error) {
    console.log("Failed to fetch Matches");
    //need to handle moongoose server erro type also
    if (error instanceof MongooseError) {
      sendResponse(res, 500, error.message);
    } else {
      console.log(error);
      sendResponse(res, 500, "Failed to fetch Matches");
    }
  }
});

matchesRouter.post("/", async function (req, res) {
  const validated = MatchValidationSchema.safeParse(req.body);
  if (!validated.success) {
    console.log("Failed to validate match data");
    console.log(formatZodError(validated.error));
    sendResponse(res, 400, "Invalid payload");
    return;
  }
  try {
    const created = await Match.create(validated.data);
    const newMatchDoc = created.toObject();
    delete newMatchDoc["__v"];
    if (res.app.locals.broadcastMatchCreated) {
      res.app.locals.broadcastMatchCreated(newMatchDoc);
    }
    sendResponse(res, 201, "Match created", newMatchDoc);
  } catch (error) {
    console.log("Failed to create Match");
    if (error instanceof MongooseError) {
      sendResponse(res, 500, error.message);
    } else {
      console.log(error);
      sendResponse(res, 500, "Failed to create Match.Server Error");
    }
  }
});

export default matchesRouter;
