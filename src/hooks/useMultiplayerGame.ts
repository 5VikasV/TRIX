import { useEffect, useState } from "react";

import { auth } from "../firebase/config";
import { listenToRoom } from "../firebase/multiplayer";
import { updateRoomGame } from "../services/gameService";
import { fromFirestoreGame } from "../firebase/mappers";

import { makeMove } from "../engine/move";

import type { GameState } from "../types/game";

export default function useMultiplayerGame(
  roomId: string
) {
  const [game, setGame] = useState<GameState | null>(null);
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToRoom(roomId, (data) => {
      setRoom(data);
      setGame(fromFirestoreGame(data.game));
      setLoading(false);
    });

    return unsubscribe;
  }, [roomId]);

  const isPlayerX =
    room?.players?.X === auth.currentUser?.uid;

  const isPlayerO =
    room?.players?.O === auth.currentUser?.uid;

  const canPlay =
    (isPlayerX && game?.currentPlayer === "X") ||
    (isPlayerO && game?.currentPlayer === "O");

  async function saveGame(newGame: GameState) {
    await updateRoomGame(roomId, newGame);
  }

  async function play(
    boardIndex: number,
    cellIndex: number
  ) {
    if (!game) return;

    if (!canPlay) return;

    const newGame = makeMove(
      game,
      boardIndex,
      cellIndex
    );

    await saveGame(newGame);
  }

  return {
    room,
    game,
    loading,
    isPlayerX,
    isPlayerO,
    canPlay,
    play,
  };
}