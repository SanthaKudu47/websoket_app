import { Router } from "express";
import { sendResponse } from "../utils/response.js";
import Match from "../db/match.model.js";
import { timelineEventSchema } from "../validation/timeline.js";
import TimelineEvent from "../db/timeline.model.js";
import mongoose, { MongooseError } from "mongoose";
import { PaginationQuerySchema } from "../validation/queryParams.js";
import { raiseMatchUpdateEvent } from "../utils/matchEvents.js";
import {
  getMainStatus,
  getSubStatus,
  updatedWickets,
  updateMatchScore,
  updateOvers,
} from "../utils/meta_parser_utils.js";
import { formatZodError } from "../utils/common.js";

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

  const meta = validated.data.meta;
  const status = getMainStatus(meta.event, meta.type);
  const subStatus = getSubStatus(meta.event, meta.type);

  const updatedStatus = status ?? match.status;
  const updatedSubStatus = subStatus ?? match.subStatus;

  let updatedHomeScore = match.score_home;
  let updatedAwayScore = match.score_away;

  let updatedHomeWickets = match.wickets_home;
  let updatedAwayWickets = match.wickets_away;

  let updatedHomeOvers = match.overs_home;
  let updatedAwayOvers = match.overs_away;

  if (meta.event === "score") {
    const scores = updateMatchScore(
      match.homeTeam,
      match.awayTeam,
      match.score_home,
      match.score_away,
      meta.team,
      meta.value,
    );

    updatedHomeScore = scores.updatedHomeScore;
    updatedAwayScore = scores.updatedAwayScore;
  }

  if (meta.event === "action" && meta.type === "wicket") {
    const wickets = updatedWickets(
      match.homeTeam,
      match.awayTeam,
      match.wickets_home,
      match.wickets_away,
      meta.team,
    );

    updatedHomeWickets = wickets.updatedHomeWickets;
    updatedAwayWickets = wickets.updatedAwayWickets;
  }

  if (meta.event === "action" && meta.type === "over_complete") {
    const overs = updateOvers(
      match.homeTeam,
      match.awayTeam,
      match.overs_home,
      match.overs_away,
      meta.team,
    );

    updatedHomeOvers = overs.updatedHomeOvers;
    updatedAwayOvers = overs.updatedAwayOvers;
  }

  try {
    await Match.findByIdAndUpdate(
      id,
      {
        status: updatedStatus,
        subStatus: updatedSubStatus,
        score_home: updatedHomeScore,
        score_away: updatedAwayScore,
        wickets_home: updatedHomeWickets,
        wickets_away: updatedAwayWickets,
        overs_home: updatedHomeOvers,
        overs_away: updatedAwayOvers,
      },
      {
        returnDocument: "after",
      },
    ).lean();
  } catch (error) {
    console.log("Failed to Update Match status");
    console.log(error);
    return sendResponse(
      res,
      500,
      "Failed to update match while creating timeline event",
    );
  }

  try {
    const created = await TimelineEvent.create({
      matchId: match._id,
      ...validated.data,
      meta: validated.data.meta ? JSON.stringify(validated.data.meta) : null,
    });
    const timeLineEvent = created.toObject();
    delete timeLineEvent["__v"];
    sendResponse(res, 201, null, timeLineEvent);
    raiseMatchUpdateEvent(match._id.toString(), timeLineEvent);
  } catch (error) {
    console.log(error);
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
