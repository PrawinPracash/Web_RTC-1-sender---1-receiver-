import { useEffect, useRef, useState } from "react"

function SenderPage(){
  // const [socket, setSocket] = useState<WebSocket | null>(null);
  const [pc, setPC] = useState<RTCPeerConnection | null>(null);

  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if(socketRef.current){
      return
    }
    socketRef.current = new WebSocket('ws://localhost:8000');
    // setSocket(socket);
    console.log(socketRef.current)
    socketRef.current.onopen = (event) => {
      console.log("event", event)
      socketRef.current?.send(JSON.stringify({
            type: 'sender'
        }));
    }

    socketRef.current.onclose = (event) => {
      console.log("event close",event)
    }

    return () => {
        socketRef.current?.close()
        socketRef.current = null
    }
}, []);
  async function handleStartVideo(){
    if (!socketRef.current) {
      console.log("Socket not found")
      alert("Socket not found");
      return;
    }else{
      console.log(socketRef.current)
    }

    const pc = new RTCPeerConnection();
    setPC(pc);
    console.log("PC", pc)
    pc.onnegotiationneeded = async () => {
      console.log("here");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.send(JSON.stringify({ type: "createOffer", sdp: offer }));
    }

    pc.onicecandidate = (event) => {
      socketRef.current?.send (JSON.stringify({type: "icecandidate", candidate: event.candidate}))
    }
    getCamAccess(pc)


  }

  async function getCamAccess(pc: RTCPeerConnection){

    const stream = await navigator.mediaDevices.getUserMedia({video: true});
    console.log("stream ", stream);

    stream.getTracks().forEach( (track)=> {
      pc.addTrack(track);
    })

  }
  return (
    <>
      <h1> Sender Page</h1>
      <button onClick={handleStartVideo}>Start Video</button>
    </>

  )


}

export default SenderPage

