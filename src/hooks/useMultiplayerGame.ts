import { useEffect, useState } from "react";

import { auth } from "../firebase/config";
import { listenToRoom } from "../firebase/multiplayer";
import { updateRoomGame } from "../services/gameService";
import { fromFirestoreGame } from "../firebase/mappers";

import { createGame } from "../engine/gameEngine";
import { makeMove } from "../engine/move";

import type { GameState } from "../types/game";

export default function useMultiplayerGame(
  roomId: string
) {
  const [game, setGame] = useState<GameState | null>(null);
  const [room, setRoom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [roomClosed, setRoomClosed] = useState(false);
  const [opponentLeft, setOpponentLeft] = useState(false);

  useEffect(() => {
    const unsubscribe = listenToRoom(roomId, (data) => {
      if (!data) {
        setRoomClosed(true);
        return;
      }

      setRoom(data);
      setGame(fromFirestoreGame(data.game));
      setLoading(false);

      const uid = auth.currentUser?.uid;

      const isHost = data.players.X === uid;
      const isGuest = data.players.O === uid;

      // Host is still here but guest left
      if (isHost && data.players.O === null) {
        setOpponentLeft(true);
      } else {
        setOpponentLeft(false);
      }

      // Guest got kicked because room vanished
      if (!isHost && !isGuest) {
        setRoomClosed(true);
      }
    });

    return unsubscribe;
  }, [roomId]);

  useEffect(() => {
    if (!roomClosed) return;

    alert("The room has been closed.");

    window.location.reload();
  }, [roomClosed]);

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

  async function restart() {
    const newGame = createGame();
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
    restart,
    opponentLeft,
  };
}