import { WebSocket, WebSocketServer } from "ws";
import { wsArcjet } from "../arcjet.js";


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
    });

    //apply arcjet
    if (wsArcjet) {
      try {
        const decision = await wsArcjet.protect(req);
        if (decision.isDenied()) {
          const code = decision.reason.isRateLimit() ? 1013 : 1008;
          const reason = decision.reason.isRateLimit()
            ? "Rate limit Exceeded"
            : "Access Denied";
          ws.close(code, reason);
          return;
        }
      } catch (error) {
        console.log("WS connection error");
        ws.close(1011, "Server security error");
        return;
      }
    }

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

  wss.on("close", () => {
    console.log("WSS is closing..");
    clearInterval(interval);
  });

  return { broadcastMatchCreated };
}
