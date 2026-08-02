import { useState } from "react";
import { createRoom, joinRoom } from "../firebase/multiplayer";

type HomeProps = {
  onRoomJoined: (roomId: string) => void;
};

export default function Home({
  onRoomJoined,
}: HomeProps) {
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    try {
      setLoading(true);

      const room = await createRoom();

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

      await joinRoom(roomCode.toUpperCase());

      onRoomJoined(roomCode.toUpperCase());
    } catch (err) {
      console.error(err);
      alert("Couldn't join room.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">

      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

        <h1 className="text-5xl font-black text-center tracking-widest">
          TRIX
        </h1>

        <p className="mt-2 text-center text-zinc-400">
          Ultimate Tic Tac Toe
        </p>

        <button
          onClick={handleCreate}
          disabled={loading}
          className="mt-10 w-full rounded-xl bg-cyan-500 py-3 font-bold text-black hover:bg-cyan-400"
        >
          Create Room
        </button>

        <div className="my-6 text-center text-zinc-500">
          OR
        </div>

        <input
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
          placeholder="Enter Room Code"
          className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 outline-none focus:border-cyan-400"
        />

        <button
          onClick={handleJoin}
          disabled={loading || roomCode.length !== 5}
          className="mt-4 w-full rounded-xl border border-cyan-500 py-3 font-bold hover:bg-cyan-500 hover:text-black"
        >
          Join Room
        </button>

      </div>

    </main>
  );
}