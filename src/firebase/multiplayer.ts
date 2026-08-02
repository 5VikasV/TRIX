import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
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

export async function createRoom() {
  await signInGuest();

  let roomId = nanoid();

  while ((await getDoc(doc(db, "rooms", roomId))).exists()) {
    roomId = nanoid();
  }

  await setDoc(doc(db, "rooms", roomId), {
    createdAt: serverTimestamp(),

    status: "waiting",

    players: {
      X: auth.currentUser?.uid,
      O: null,
    },

    game: {
      boards: Array.from({ length: 9 }, () => ({
        cells: Array(9).fill(null),
      })),

      boardWinners: Array(9).fill(null),

      activeBoard: null,

      currentPlayer: "X",

      winner: null,
    },
  });

  return roomId;
}

export async function joinRoom(roomId: string) {
  await signInGuest();

  const roomRef = doc(db, "rooms", roomId);

  const snapshot = await getDoc(roomRef);

  if (!snapshot.exists()) {
    throw new Error("Room not found");
  }

  const data = snapshot.data();

  if (data.players.O) {
    throw new Error("Room is already full");
  }

  await updateDoc(roomRef, {
    "players.O": auth.currentUser?.uid,
    status: "playing",
  });

  return true;
}

export function listenToRoom(
  roomId: string,
  callback: (room: any) => void
) {
  return onSnapshot(doc(db, "rooms", roomId), (snapshot) => {
    if (!snapshot.exists()) return;

    callback(snapshot.data());
  });
}