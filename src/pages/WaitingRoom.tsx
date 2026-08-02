import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

import { db } from "../firebase/config";

type WaitingRoomProps = {
  roomId: string;
  onStart: () => void;
};

export default function WaitingRoom({
  roomId,
  onStart,
}: WaitingRoomProps) {
  const [players, setPlayers] = useState(1);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "rooms", roomId),
      (snapshot) => {
        if (!snapshot.exists()) return;

        const room = snapshot.data();

        const count =
          (room.players.X ? 1 : 0) +
          (room.players.O ? 1 : 0);

        setPlayers(count);

        if (count === 2 && countdown === null) {
          setCountdown(3);
        }
      }
    );

    return unsubscribe;
  }, [roomId, countdown]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      onStart();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((c) => (c ?? 1) - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onStart]);

  async function copyCode() {
    await navigator.clipboard.writeText(roomId);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8">

        <h1 className="text-center text-4xl font-black">
          Waiting Room
        </h1>

        <p className="mt-8 text-center text-zinc-400">
          Room Code
        </p>

        <div className="mt-4 rounded-xl border border-cyan-500 py-4 text-center text-4xl font-black tracking-[0.4em]">
          {roomId}
        </div>

        <button
          onClick={copyCode}
          className="mt-4 w-full rounded-xl bg-cyan-500 py-3 font-bold text-black hover:bg-cyan-400"
        >
          {copied ? "Copied ✓" : "Copy Room Code"}
        </button>

        <div className="mt-8 text-center">
          <p className="text-zinc-400">
            Players Connected
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {players} / 2
          </h2>
        </div>

        {players === 1 && (
          <p className="mt-8 text-center text-yellow-400">
            Waiting for opponent...
          </p>
        )}

        {players === 2 && countdown !== null && (
          <div className="mt-8 text-center">
            <p className="text-green-400 font-bold">
              Opponent Connected ✓
            </p>

            <p className="mt-4 text-6xl font-black text-cyan-400">
              {countdown}
            </p>

            <p className="mt-2 text-zinc-400">
              Starting Game...
            </p>
          </div>
        )}

      </div>
    </main>
  );
}