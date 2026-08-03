import { useState } from "react";

import Home from "./pages/Home";
import WaitingRoom from "./pages/WaitingRoom";
import Game from "./pages/Game";

type Screen = "home" | "waiting" | "game";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [roomId, setRoomId] = useState("");

  function handleRoomJoined(room: string) {
    setRoomId(room);
    setScreen("waiting");
  }

  function startGame() {
    setScreen("game");
  }

  function goHome() {
    setRoomId("");
    setScreen("home");

    // Remove ?room= from the URL after leaving
    window.history.replaceState({}, "", window.location.pathname);
  }

  if (screen === "home") {
    return (
      <Home
        onRoomJoined={handleRoomJoined}
      />
    );
  }

  if (screen === "waiting") {
    return (
      <WaitingRoom
        roomId={roomId}
        onStart={startGame}
      />
    );
  }

  return (
    <Game
      roomId={roomId}
      onLeave={goHome}
    />
  );
}