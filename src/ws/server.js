import { WebSocket, WebSocketServer } from "ws";
import {
  clearAllSubscribers,
  clearWhenClose,
  getAllSubscribersOfMatch,
  subscribeToMatch,
} from "../utils/subscribers.js";
import mongoose from "mongoose";

function sendJson(socket, payload) {
  if (socket.readyState != WebSocket.OPEN) return;
  socket.send(JSON.stringify(payload));
}

function broadcast(wss, payload) {
  for (const client of wss.clients) {
    if (client.readyState !== WebSocket.OPEN) continue;
    client.send(JSON.stringify(payload));
  }
}

function multicast(subs, payload) {
  const data = JSON.stringify(payload);
  for (const socket of subs) {
    if (socket.isAlive && socket.readyState === WebSocket.OPEN) {
      socket.send(data);
    }
  }
}

function checkIsAlive(wss) {
  wss.clients.forEach((socket) => {
    if (socket.isAlive === false) {
      socket.terminate();
      return;
    }
    socket.isAlive = false;
    socket.ping();
  });
}

export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    server: server,
    path: "/ws",
    maxPayload: 1024 * 1024, //1mb
  });

  wss.on("connection", async function (ws, req) {
    //handlers
    ws.on("error", function (err) {
      console.log("Error WS", err);
    });

    ws.on("pong", function () {
      ws.isAlive = true;
    });

    ws.on("close", () => {
      ws.isAlive = false;
      clearWhenClose(ws);
    });

    ws.on("message", function (data) {
      //we are only looking for subscribe messages.
      //try to parse
      let message;
      try {
        message = JSON.parse(data);

        if (
          typeof message !== "object" ||
          message === null ||
          typeof message.type !== "string" ||
          typeof message.matchId !== "string"
        ) {
          return sendJson(ws, {
            type: "error",
            message: "Invalid message format",
          });
        }

        const type = message.type;
        const matchId = message.matchId;

        if (!mongoose.Types.ObjectId.isValid(matchId)) {
          return sendJson(ws, { type: "error", message: "Invalid matchId" });
        }

        if (type === "subscribe") {
          subscribeToMatch(matchId, ws);
          return sendJson(ws, { type: "subscribed", matchId: matchId });
        }

        if (type === "unsubscribe") {
          unsubscribe(matchId, ws);
          return sendJson(ws, { type: "unsubscribed", matchId });
        }

        //unknown types
        return sendJson(ws, { type: "error", message: "Unknown message type" });
      } catch (error) {
        console.log("Failed to Parsed the message");
        console.log(error);
        sendJson(ws, { type: "error", message: "Invalid JSON" });
      }
    });

    ws.isAlive = true;
    sendJson(ws, { type: "welcome" });
  });

  const interval = setInterval(checkIsAlive, 30000, wss);

  function broadcastMatchCreated(match) {
    try {
      broadcast(wss, { type: "match_created", data: match });
    } catch (error) {
      console.log("Broadcast error:", error);
    }
  }

  function multicastMatchUpdated(matchId, timeLineEvent) {
    const subs = getAllSubscribersOfMatch(matchId);
    try {
      multicast(subs, { type: "match_updated", data: timeLineEvent });
    } catch (error) {
      console.log("Multicast error:", error);
    }
  }

  wss.on("close", () => {
    console.log("WSS is closing..");
    clearInterval(interval);
    clearAllSubscribers();
  });

  return { broadcastMatchCreated, multicastMatchUpdated };
}
