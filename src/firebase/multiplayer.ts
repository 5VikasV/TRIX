import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

import {
  signInAnonymously,
} from "firebase/auth";

import { customAlphabet } from "nanoid";

import { auth, db } from "./config";

const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const nanoid = customAlphabet(alphabet, 5);

export async function signInGuest() {
  if (auth.currentUser) return auth.currentUser;

  const credential = await signInAnonymously(auth);
  return credential.user;
}

export async function createRoom(playerName: string) {
  await signInGuest();

  let roomId = nanoid();

  while ((await getDoc(doc(db, "rooms", roomId))).exists()) {
    roomId = nanoid();
  }

  await setDoc(doc(db, "rooms", roomId), {
    createdAt: serverTimestamp(),

    status: "waiting",

    players: {
      X: {
        uid: auth.currentUser?.uid,
        name: playerName,
      },
      O: null,
    },

    // NEW
    startingPlayer: null,

    game: {
      boards: Array.from({ length: 9 }, () => ({
        cells: Array(9).fill(null),
      })),
      boardWinners: Array(9).fill(null),
      activeBoard: null,

      // Default value. We'll overwrite this after
      // the host chooses who starts.
      currentPlayer: "X",

      winner: null,
    },
  });

  return roomId;
}

export async function joinRoom(
  roomId: string,
  playerName: string
) {
  await signInGuest();

  const roomRef = doc(db, "rooms", roomId);

  const snapshot = await getDoc(roomRef);

  if (!snapshot.exists()) {
    throw new Error("Room not found");
  }

  const data = snapshot.data();

  if (data.players.O) {
    throw new Error("Room already full");
  }

  await updateDoc(roomRef, {
    "players.O": {
      uid: auth.currentUser?.uid,
      name: playerName,
    },
    status: "playing",
  });

  return true;
}

// NEW
export async function chooseStartingPlayer(
  roomId: string,
  player: "X" | "O"
) {
  const roomRef = doc(db, "rooms", roomId);

  await updateDoc(roomRef, {
    startingPlayer: player,
    "game.currentPlayer": player,
  });
}

export async function leaveRoom(roomId: string) {
  const roomRef = doc(db, "rooms", roomId);

  const snapshot = await getDoc(roomRef);

  if (!snapshot.exists()) return;

  const room = snapshot.data();

  const uid = auth.currentUser?.uid;

  if (room.players.X?.uid === uid) {
    await deleteDoc(roomRef);
    return;
  }

  if (room.players.O?.uid === uid) {
    await updateDoc(roomRef, {
      "players.O": null,
      status: "waiting",
      startingPlayer: null,
    });
  }
}

export function listenToRoom(
  roomId: string,
  callback: (room: any | null) => void
) {
  return onSnapshot(doc(db, "rooms", roomId), (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    callback(snapshot.data());
  });
}