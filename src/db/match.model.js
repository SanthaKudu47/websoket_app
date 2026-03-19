import mongoose, { Schema } from "mongoose";

const matchSchema = new Schema(
  {
    sport: {
      type: String,
      required: [true, "Sport type is required"],
    },
    homeTeam: {
      type: String,
      required: [true, "Home team name is required"],
      min: [2, "Home team name must be at least 2 characters"],
    },
    awayTeam: {
      type: String,
      required: [true, "Away team name is required"],
      min: [2, "Away team name must be at least 2 characters"],
    },

    date: {
      type: Date,
      default: null,
    },
    startTime: {
      type: Date,
      default: null,
    },

    endTime: {
      type: Date,
      default: null, //required will not called since default is here
    },

    status: {
      type: String,
      required: [true, "Match status is required"],
      enum: [
        "scheduled",
        "live",
        "paused",
        "delayed",
        "postponed",
        "cancelled",
        "finished",
      ],
    },

    subStatus: {
      type: String,
      default: null,
    },

    score_home: {
      type: Number,
      default: null,
      validate: {
        validator: (v) => v === null || v >= 0,
        message: "Home score cannot be negative",
      },
    },
    score_away: {
      type: Number,
      default: null,
      validate: {
        validator: (v) => v === null || v >= 0,
        message: "Away score cannot be negative",
      },
    },

    tournament: {
      type: String,
    },

    meta: {
      type: String,
    },
  },
  { timestamps: true },
);

//create a model

const Match = mongoose.models.Match || mongoose.model("match", matchSchema);
export default Match;
