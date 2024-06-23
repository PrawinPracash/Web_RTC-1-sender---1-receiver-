import { useEffect, useRef, useState } from "react";
import { Video } from "reactjs-media";

function ReceiverPage() {
  const [pc, setPC] = useState<RTCPeerConnection | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (socketRef.current) return;
    socketRef.current = new WebSocket("ws://localhost:8000");
    socketRef.current.onopen = () => {
      socketRef.current?.send(JSON.stringify({ type: "receiver" }));
    };
    socketRef.current.onclose = (event) => {
      console.log("event close", event);
    };
    startReceivingVideo(socketRef.current);
    return () => {
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, []);

  async function startReceivingVideo(socket: WebSocket) {
    if (!socketRef.current) {
      alert("Socket not found");
      return;
    }
    const pc = new RTCPeerConnection();
    pc.ontrack = (event: any) => {
      if (videoRef.current) {
        videoRef.current.srcObject = new MediaStream([event.track]);
      }
    };
    pc.onicecandidate = (event) => {
      socketRef.current?.send(
        JSON.stringify({ type: "icecandidate", candidate: event.candidate })
      );
    };
    socketRef.current.onmessage = async (event) => {
      console.log("event ", event);
      const message = JSON.parse(event.data);
      if (message.type == "offerCreated") {
        pc.setRemoteDescription(message.sdp);
        const answer = await pc.createAnswer();
        pc.setLocalDescription(answer);
        socket?.send(JSON.stringify({ type: "createAnswer", sdp: answer }));
      }
      if (message.type == "iceCandidate") {
        pc.addIceCandidate(message.candidate);
      }
    };
  }

  function handleReceiveButton() {
    videoRef.current?.play();
  }

  return (
    <div>
      <h1> Receiver Page</h1>
      <video ref={videoRef}></video>
      <button onClick={handleReceiveButton}>Receive Video</button>
    </div>
  );
}

export default ReceiverPage;
