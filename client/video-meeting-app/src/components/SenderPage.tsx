import { useEffect, useRef, useState } from "react";

function SenderPage() {
  // const [socket, setSocket] = useState<WebSocket | null>(null);
  const [pc, setPC] = useState<RTCPeerConnection | null>(null);

  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (socketRef.current) {
      return;
    }
    socketRef.current = new WebSocket("ws://localhost:8000");

    socketRef.current.onopen = (event) => {
      console.log("event", event);
      socketRef.current?.send(
        JSON.stringify({
          type: "sender",
        })
      );
    };

    socketRef.current.onclose = (event) => {
      console.log("event close", event);
    };

    return () => {
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, []);
  async function handleStartVideo() {
    if (!socketRef.current) {
      alert("Socket not found");
      return;
    }

    const pc = new RTCPeerConnection();
    setPC(pc);
    console.log("PC", pc);
    pc.onnegotiationneeded = async () => {
      console.log("here");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.send(
        JSON.stringify({ type: "createOffer", sdp: offer })
      );
    };
    pc.onicecandidate = (event) => {
      socketRef.current?.send(
        JSON.stringify({ type: "iceCandidate", candidate: event.candidate })
      );
    };
    socketRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type == "answerCreated") {
        pc.setRemoteDescription(message.sdp);
      } else if (message.type == "iceCandidate") {
        pc.addIceCandidate(message.candidate);
      }
    };

    getCamAccess(pc);
  }

  function getCamAccess(pc: RTCPeerConnection) {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();
      // this is wrong, should propogate via a component
      document.body.appendChild(video);
      stream.getTracks().forEach((track) => {
        pc?.addTrack(track);
      });
    });
  }
  return (
    <>
      <h1> Sender Page</h1>
      <button onClick={handleStartVideo}>Start Video</button>
    </>
  );
}

export default SenderPage;
