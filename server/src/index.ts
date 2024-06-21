import WebSocket from "ws";

const wss = new WebSocket.Server({ port: 8000 });

let senderWebSocketClient: any = null;
let receiverWebSocketClient: any = null;

wss.on("connection", (ws) => {
  ws.on("error", console.error);
  ws.on("message", (data: any) => {
    console.log("received message from client");
    const eventType = data.type;
    if (eventType == "sender") {
      console.log("sender connected");
      senderWebSocketClient = ws;
    } else if (eventType == "receiver") {
      console.log("receiver connected");
      receiverWebSocketClient = ws;
    } else if (eventType == "createOffer") {
      if (ws == receiverWebSocketClient) {
        return;
      }
      console.log("Create offer event from sender");
      if (receiverWebSocketClient) {
        receiverWebSocketClient.send({ type: "offerCreated", sdp: data.sdp });
      }
    } else if (eventType == "createAnswer") {
      if (ws == senderWebSocketClient) {
        return;
      }
      console.log("Create answer event from sender");
      if (senderWebSocketClient) {
        senderWebSocketClient.send({ type: "answerCreated", sdp: data.sdp });
      }
    } else if (eventType == "iceCandidate") {
      if (ws == senderWebSocketClient) {
        receiverWebSocketClient.send({
          type: "iceCandidate",
          candidate: data.candidate,
        });
      } else {
        senderWebSocketClient.send({
          type: "iceCandidate",
          candidate: data.candidate,
        });
      }
    }
  });
  ws.send("Connection successful");
});
