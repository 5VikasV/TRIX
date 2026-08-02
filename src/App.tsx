import { useState } from "react";

import Home from "./pages/Home";
import Game from "./pages/Game";

export default function App() {
  const [roomId, setRoomId] = useState<string | null>(null);

  if (!roomId) {
    return <Home onRoomJoined={setRoomId} />;
  }

  return <Game roomId={roomId} />;
}