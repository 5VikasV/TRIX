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
import { createGame } from "../engine/gameEngine";
import { toFirestoreGame } from "./mappers";

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

    game: toFirestoreGame(createGame()),
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

  // 🎲 Fresh game every time someone joins
  const newGame = createGame();

  newGame.currentPlayer =
    Math.random() < 0.5 ? "X" : "O";

  console.log(
    "FIRST PLAYER:",
    newGame.currentPlayer
  );

  await updateDoc(roomRef, {
    "players.O": {
      uid: auth.currentUser?.uid,
      name: playerName,
    },

    status: "playing",

    game: toFirestoreGame(newGame),
  });

  return true;
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