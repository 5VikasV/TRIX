import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import { deleteDoc, doc, getDoc, onSnapshot, runTransaction, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { createGame, makeMove } from "../engine/gameEngine";
import type { GameState, Player, Room, RoomPlayer } from "../types/game";
import { auth, db } from "./config";

const ROOM_LIFETIME = 24 * 60 * 60 * 1000;
const ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const ROOM_CODE_LENGTH = 5;

type StoredGame = Omit<GameState, "boards"> & { boards: { cells: GameState["boards"][number] }[] };
type StoredRoom = Omit<Room, "game" | "expiresAt"> & { game: StoredGame; expiresAt: Timestamp };

let guestPromise: Promise<User> | null = null;

export function getGuest(): Promise<User> {
  if (auth.currentUser) return Promise.resolve(auth.currentUser);
  if (guestPromise) return guestPromise;
  guestPromise = new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) resolve(user);
      else signInAnonymously(auth).then(({ user: guest }) => resolve(guest), reject);
    }, reject);
  });
  guestPromise.catch(() => { guestPromise = null; });
  return guestPromise;
}

function roomCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(ROOM_CODE_LENGTH));
  return Array.from(bytes, (byte) => ROOM_ALPHABET[byte % ROOM_ALPHABET.length]).join("");
}

function randomPlayer(): Player {
  return crypto.getRandomValues(new Uint8Array(1))[0] % 2 === 0 ? "X" : "O";
}

function cleanName(name: string) {
  const result = name.trim().replace(/\s+/g, " ");
  if (result.length < 2 || result.length > 20) throw new Error("Use a name between 2 and 20 characters.");
  return result;
}

function player(user: User, name: string, lastSeenAt: number): RoomPlayer {
  return { uid: user.uid, name, lastSeenAt };
}

function expiry(now: number) {
  return Timestamp.fromMillis(now + ROOM_LIFETIME);
}

function toStoredGame(game: GameState): StoredGame {
  return { ...game, boards: game.boards.map((cells) => ({ cells })) };
}

function fromStoredRoom(data: StoredRoom): Room {
  return { ...data, expiresAt: data.expiresAt.toMillis(), game: { ...data.game, boards: data.game.boards.map((board) => board.cells) } };
}

function assertLive(room: Room) {
  if (room.expiresAt <= Date.now()) throw new Error("This room has expired. Create a new one to play again.");
}

function sideFor(room: Room, uid: string): Player {
  if (room.players.X.uid === uid) return "X";
  if (room.players.O?.uid === uid) return "O";
  throw new Error("You are not a player in this room.");
}

async function readRoom(code: string): Promise<{ room: Room; ref: ReturnType<typeof doc> }> {
  const ref = doc(db, "rooms", code.toUpperCase());
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) throw new Error("This room no longer exists.");
  const room = fromStoredRoom(snapshot.data() as StoredRoom);
  assertLive(room);
  return { room, ref };
}

export async function createRoom(name: string): Promise<{ code: string }> {
  const user = await getGuest();
  const hostName = cleanName(name);

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = roomCode();
    const now = Date.now();
    const room: StoredRoom = {
      version: 1,
      code,
      hostUid: user.uid,
      status: "waiting",
      players: { X: player(user, hostName, now), O: null },
      game: toStoredGame(createGame()),
      round: 1,
      rematchVotes: { X: false, O: false },
      createdAt: now,
      updatedAt: now,
      expiresAt: expiry(now),
    };
    try {
      await setDoc(doc(db, "rooms", code), room);
      return { code };
    } catch (error) {
      if (attempt === 7) throw error;
    }
  }
  throw new Error("Could not create a unique room. Please try again.");
}

export async function joinRoom(code: string, name: string): Promise<{ code: string }> {
  const user = await getGuest();
  const guestName = cleanName(name);
  const normalizedCode = code.trim().toUpperCase();
  const { room, ref } = await readRoom(normalizedCode);
  if (room.status !== "waiting" || room.players.O) throw new Error("This room is no longer available.");
  const now = Date.now();
  const guest = player(user, guestName, now);
  const hostMark = randomPlayer();
  const players = hostMark === "X"
    ? { X: room.players.X, O: guest }
    : { X: guest, O: room.players.X };
  await updateDoc(ref, {
    players,
    status: "playing",
    game: toStoredGame(createGame(randomPlayer())),
    rematchVotes: { X: false, O: false },
    updatedAt: now,
    expiresAt: expiry(now),
  });
  return { code: normalizedCode };
}

export async function playMove(code: string, board: number, cell: number): Promise<{ ok: true }> {
  const user = await getGuest();
  const ref = doc(db, "rooms", code.toUpperCase());
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw new Error("This room no longer exists.");
    const room = fromStoredRoom(snapshot.data() as StoredRoom);
    assertLive(room);
    const side = sideFor(room, user.uid);
    if (room.status !== "playing" || room.game.currentPlayer !== side) throw new Error("It is not your turn.");
    const game = makeMove(room.game, board, cell);
    const now = Date.now();
    transaction.update(ref, {
      game: toStoredGame(game),
      status: game.winner ? "finished" : "playing",
      "players.X.lastSeenAt": side === "X" ? now : room.players.X.lastSeenAt,
      "players.O.lastSeenAt": side === "O" ? now : room.players.O?.lastSeenAt,
      updatedAt: now,
      expiresAt: expiry(now),
    });
  });
  return { ok: true };
}

export async function voteRematch(code: string): Promise<{ ok: true }> {
  const user = await getGuest();
  const ref = doc(db, "rooms", code.toUpperCase());
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists()) throw new Error("This room no longer exists.");
    const room = fromStoredRoom(snapshot.data() as StoredRoom);
    assertLive(room);
    const side = sideFor(room, user.uid);
    if (room.status !== "finished") throw new Error("Finish this round before requesting a rematch.");
    if (room.rematchVotes[side]) return;
    const now = Date.now();
    const other: Player = side === "X" ? "O" : "X";
    if (room.rematchVotes[other]) {
      transaction.update(ref, {
        game: toStoredGame(createGame(randomPlayer())),
        status: "playing",
        round: room.round + 1,
        rematchVotes: { X: false, O: false },
        [`players.${side}.lastSeenAt`]: now,
        updatedAt: now,
        expiresAt: expiry(now),
      });
    } else {
      transaction.update(ref, {
        [`rematchVotes.${side}`]: true,
        [`players.${side}.lastSeenAt`]: now,
        updatedAt: now,
        expiresAt: expiry(now),
      });
    }
  });
  return { ok: true };
}

export async function leaveRoom(code: string): Promise<{ ok: true }> {
  const user = await getGuest();
  const { room, ref } = await readRoom(code);
  if (room.hostUid === user.uid) await deleteDoc(ref);
  else {
    const host = room.players.X.uid === room.hostUid ? room.players.X : room.players.O;
    if (!host) throw new Error("This room is no longer available.");
    const now = Date.now();
    await updateDoc(ref, {
      players: { X: host, O: null },
      status: "waiting",
      rematchVotes: { X: false, O: false },
      updatedAt: now,
      expiresAt: expiry(now),
    });
  }
  return { ok: true };
}

export async function reconnectToRoom(code: string): Promise<{ ok: true }> {
  const user = await getGuest();
  const { room, ref } = await readRoom(code);
  const side = sideFor(room, user.uid);
  const now = Date.now();
  await updateDoc(ref, {
    [`players.${side}.lastSeenAt`]: now,
    updatedAt: now,
    expiresAt: expiry(now),
  });
  return { ok: true };
}

export function subscribeRoom(code: string, callback: (room: Room | null) => void, onError: (error: Error) => void) {
  return onSnapshot(doc(db, "rooms", code.toUpperCase()), (snapshot) => {
    if (!snapshot.exists()) return callback(null);
    const room = fromStoredRoom(snapshot.data() as StoredRoom);
    callback(room.expiresAt <= Date.now() ? null : room);
  }, onError);
}
