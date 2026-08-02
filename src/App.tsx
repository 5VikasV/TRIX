import Header from "./components/Header";
import StatusBar from "./components/StatusBar";
import Board from "./components/Board";

import useGame from "./hooks/useGame";

export default function App() {
  const {
    board,
    play,
    currentPlayer,
  } = useGame();

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-10">
        <Header />

        <StatusBar
          currentPlayer={currentPlayer}
          activeBoard="Center"
        />

        <Board
          board={board}
          onPlay={play}
        />
      </div>
    </main>
  );
}