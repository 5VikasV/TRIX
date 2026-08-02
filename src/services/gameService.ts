import { doc, updateDoc } from "firebase/firestore";

import { db } from "../firebase/config";
import { toFirestoreGame } from "../firebase/mappers";

import type { GameState } from "../types/game";

export async function updateRoomGame(
  roomId: string,
  game: GameState
) {
  await updateDoc(doc(db, "rooms", roomId), {
    game: toFirestoreGame(game),
  });
}

export async function updateRoomStatus(
  roomId: string,
  status: "waiting" | "playing" | "finished"
) {
  await updateDoc(doc(db, "rooms", roomId), {
    status,
  });
}