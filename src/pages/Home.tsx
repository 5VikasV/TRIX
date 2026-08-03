import { useEffect, useState } from "react";
import { createRoom, joinRoom } from "../firebase/multiplayer";

type HomeProps = {
  onRoomJoined: (roomId: string) => void;
};

export default function Home({
  onRoomJoined,
}: HomeProps) {
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);

  const inviteMode = window.location.search.includes("room=");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const room = params.get("room");

    if (room) {
      setRoomCode(room.toUpperCase());
    }
  }, []);

  async function handleCreate() {
    try {
      setLoading(true);

      const room = await createRoom(playerName.trim());

      onRoomJoined(room);
    } catch (err) {
      console.error(err);
      alert("Couldn't create room.");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    try {
      setLoading(true);

      await joinRoom(
        roomCode.toUpperCase(),
        playerName.trim()
      );

      onRoomJoined(roomCode.toUpperCase());
    } catch (err) {
      console.error(err);
      alert("Couldn't join room.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 text-white">

      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">

        <h1 className="text-center text-5xl font-black tracking-widest text-cyan-400">
          TRIX
        </h1>

        <p className="mt-2 text-center text-zinc-400">
          Ultimate Tic Tac Toe
        </p>

        <div className="my-8 border-t border-zinc-800"></div>

        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Your Name
          </p>

          <input
            value={playerName}
            onChange={(e) =>
              setPlayerName(e.target.value.toUpperCase())
            }
            placeholder="Enter Your Name"
            maxLength={20}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 uppercase outline-none transition focus:border-cyan-400"
          />
        </div>

        {!inviteMode && (
          <>
            <button
              onClick={handleCreate}
              disabled={
                loading ||
                playerName.trim().length < 2
              }
              className="mt-5 w-full rounded-xl bg-cyan-500 py-3 font-bold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Create Room
            </button>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-zinc-800"></div>

              <span className="text-sm font-semibold tracking-[0.3em] text-zinc-500">
                OR
              </span>

              <div className="h-px flex-1 bg-zinc-800"></div>
            </div>
          </>
        )}

        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Room Code
          </p>

          <input
            value={roomCode}
            onChange={(e) =>
              setRoomCode(e.target.value.toUpperCase())
            }
            placeholder="Enter Room Code"
            maxLength={5}
            disabled={inviteMode}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 uppercase outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <button
          onClick={handleJoin}
          disabled={
            loading ||
            roomCode.length !== 5 ||
            playerName.trim().length < 2
          }
          className="mt-5 w-full rounded-xl border border-cyan-500 py-3 font-bold transition hover:bg-cyan-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {inviteMode ? "Join Game" : "Join Room"}
        </button>

      </div>

    </main>
  );
}