import Header from "./components/Header";
import StatusBar from "./components/StatusBar";
import Board from "./components/Board";
import GameOverModal from "./components/GameOverModal";

import useUltimateGame from "./hooks/useUltimateGame";

export default function App() {
  const {
    game,
    play,
    reset,
  } = useUltimateGame();

  return (
    <>
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-10">

          <Header />

          <StatusBar
            currentPlayer={game.currentPlayer}
            activeBoard={game.activeBoard}
          />

          <Board
            game={game}
            play={play}
          />

          <button
            onClick={reset}
            className="
              mt-10
              rounded-xl
              border
              border-zinc-700
              px-8
              py-3
              transition
              hover:border-cyan-400
            "
          >
            Reset Game
          </button>

        </div>
      </main>

      <GameOverModal
        winner={game.winner}
        onRestart={reset}
      />
    </>
  );
}