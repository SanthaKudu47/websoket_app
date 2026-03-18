import express from "express";
import "dotenv/config";
import dbConnect from "./db/mongodb.js";
import Match from "./db/match.model.js";
import mongoose from "mongoose";
import TimelineEvent from "./db/timeline.model.js";

const app = express();

//middleware on app level for all paths
app.use(express.json());

//root
app.get("/", function (req, res) {
  res.send("Hello from server");
});

// await dbConnect();
// async function createMatch() {
//   try {
//     const match = {
//       sport: "football",
//       homeTeam: "Arsenal",
//       awayTeam: "Chelsea",
//       date: new Date("2025-03-19T18:30:00Z"),
//       status: "live",
//       subStatus: "first_half",
//       score_home: 1,
//       score_away: 0,
//       tournament: "Premier League",
//       meta: JSON.stringify({ info: "Round 28 - Emirates Stadium" }),
//     };
//     const matchDoc = new Match(match);
//     const saved = await matchDoc.save();
//     const event = {
//       matchId: saved._id,
//       time: new Date("2025-03-19T18:30:00Z"),
//       description: "Match kicked off",
//       type: "match",
//       meta: JSON.stringify({
//         period: "first_half",
//       }),
//     };
//     const ev = new TimelineEvent(event);
//     await ev.save();
//   } catch (error) {
//     console.log("Failed to create");
//     console.log(error);
//   }
// }

// await createMatch();

app.listen(process.env.HTTP_PORT || 8000, function () {
  const port = process.env.HTTP_PORT || 8000;
  console.log("Listening on port", port);
});
