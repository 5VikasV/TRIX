import Header from "../components/Header";
import StatusBar from "../components/StatusBar";
import Board from "../components/Board";
import GameOverModal from "../components/GameOverModal";

import useMultiplayerGame from "../hooks/useMultiplayerGame";

type GameProps = {
  roomId: string;
};

export default function Game({
  roomId,
}: GameProps) {
  const {
    game,
    play,
    loading,
  } = useMultiplayerGame(roomId);

  if (loading || !game) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        Loading...
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-zinc-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-10">

          <Header />

          <div className="mb-6 rounded-xl border border-cyan-500 px-6 py-3">
            Room: <span className="font-bold">{roomId}</span>
          </div>

          <StatusBar
            currentPlayer={game.currentPlayer}
            activeBoard={game.activeBoard}
          />

          <Board
            game={game}
            onPlay={play}
          />

        </div>
      </main>

      <GameOverModal
        winner={game.winner}
        onRestart={() => {}}
      />
    </>
  );
}