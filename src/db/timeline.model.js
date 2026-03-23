import mongoose, { Schema } from "mongoose";

const timelineEventSchema = new Schema({
  matchId: { type: Schema.Types.ObjectId, ref: "Match" },
  time: {
    type: Date,
    required: [true, "place_holder"],
  },
  description: {
    type: String,
    required: [true, "place_holder"],
  },
  type: {
    type: String,
    enum: ["score", "action", "status"],
  },
  meta: { type: String, default: null },
});

timelineEventSchema.index({ matchId: 1, time: 1 }); // ascending

//create a model
const TimelineEvent =
  mongoose.models.Match || mongoose.model("timelineevent", timelineEventSchema);
export default TimelineEvent;
