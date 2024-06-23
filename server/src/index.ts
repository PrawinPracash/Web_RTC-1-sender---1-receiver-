import WebSocket from "ws";

const wss = new WebSocket.Server({ port: 8000 });

let senderWebSocketClient: any = null;
let receiverWebSocketClient: any = null;

wss.on("connection", (ws) => {
  ws.on("error", console.error);
  ws.on("message", (data: any) => {
    data = JSON.parse(data);
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
        receiverWebSocketClient.send(
          JSON.stringify({ type: "offerCreated", sdp: data.sdp })
        );
      }
    } else if (eventType == "createAnswer") {
      if (ws == senderWebSocketClient) {
        return;
      }
      console.log("Create answer event from sender");
      if (senderWebSocketClient) {
        senderWebSocketClient.send(
          JSON.stringify({ type: "answerCreated", sdp: data.sdp })
        );
      }
    } else if (eventType == "iceCandidate") {
      if (ws == senderWebSocketClient) {
        console.log("Ice candidate from sender client");
        receiverWebSocketClient.send(
          JSON.stringify({
            type: "iceCandidate",
            candidate: data.candidate,
          })
        );
      } else {
        console.log("Ice candidate from reciever client");
        senderWebSocketClient.send(
          JSON.stringify({
            type: "iceCandidate",
            candidate: data.candidate,
          })
        );
      }
    }
  });
  ws.send(JSON.stringify("Connection successful"));
});
