import express from "express";
import "dotenv/config";
import dbConnect from "./db/mongodb.js";
import matchesRouter from "./routes/matches.router.js";
import http from "http";
import { attachWebSocketServer } from "./ws/server.js";
import { registerBroadCastFunc } from "./utils/matchEvents.js";
import { securityMiddleware } from "./arcjet.js";

const PORT = Number(process.env.HTTP_PORT) || 8000;
const HOST = process.env.HOST || "0.0.0.0";

const app = express();
const server = http.createServer(app);

//enable query parser
app.set("query parser", "simple");

//middleware on app level for all paths
app.use(express.json());
app.use(securityMiddleware());

//root
app.get("/", function (req, res) {
  res.send("Hello from server");
});

app.use("/matches", matchesRouter);

const { broadcastMatchCreated } = attachWebSocketServer(server);
registerBroadCastFunc(broadcastMatchCreated);

await dbConnect();

server.listen(PORT, HOST, function () {
  const baseUrl =
    HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;

  console.log(`Service is Running on ${baseUrl}`);
  console.log(`WebSocket is running on ${baseUrl.replace("http", "ws")}/ws`);
});
