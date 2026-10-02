import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { deleteApp, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, signInAnonymously, type User } from "firebase/auth";
import { connectFirestoreEmulator, deleteDoc, doc, getDoc, getFirestore, runTransaction, setDoc, Timestamp, updateDoc, type Firestore } from "firebase/firestore";
import { createGame, makeMove } from "../src/engine/gameEngine";

type StoredGame = ReturnType<typeof createGame> extends infer T ? Omit<T & object, "boards"> & { boards: { cells: unknown[] }[] } : never;
type TestClient = { app: FirebaseApp; db: Firestore; user: User };
const clients: TestClient[] = [];

function storedGame(game: ReturnType<typeof createGame>): StoredGame {
  return { ...game, boards: game.boards.map((cells) => ({ cells })) } as StoredGame;
}

async function client(label: string): Promise<TestClient> {
  const app = initializeApp({ apiKey: "demo-key", authDomain: "demo-trix.firebaseapp.com", projectId: "demo-trix", appId: `test-${label}` }, label);
  const auth = getAuth(app);
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  const { user } = await signInAnonymously(auth);
  const db = getFirestore(app);
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  const result = { app, db, user };
  clients.push(result);
  return result;
}

function room(host: TestClient, code: string, now = Date.now()) {
  return {
    version: 1,
    code,
    hostUid: host.user.uid,
    status: "waiting",
    players: { X: { uid: host.user.uid, name: "Host", lastSeenAt: now }, O: null },
    game: storedGame(createGame("X")),
    round: 1,
    rematchVotes: { X: false, O: false },
    createdAt: now,
    updatedAt: now,
    expiresAt: Timestamp.fromMillis(now + 86_400_000),
  };
}

function joinedGame() { return storedGame(createGame("X")); }

afterAll(async () => { await Promise.all(clients.map(({ app }) => deleteApp(app))); });

describe("Firestore multiplayer rules", () => {
  let host: TestClient;
  let guest: TestClient;
  let outsider: TestClient;
  const code = "ROOM1";

  beforeAll(async () => {
    [host, guest, outsider] = await Promise.all([client("host"), client("guest"), client("outsider")]);
    await setDoc(doc(host.db, "rooms", code), room(host, code));
  }, 60_000);

  it("lets a guest read and join a waiting room, then limits reads to players", async () => {
    expect((await getDoc(doc(outsider.db, "rooms", code))).exists()).toBe(true);
    const now = Date.now();
    await updateDoc(doc(guest.db, "rooms", code), {
      "players.O": { uid: guest.user.uid, name: "Guest", lastSeenAt: now },
      status: "playing",
      game: joinedGame(),
      rematchVotes: { X: false, O: false },
      updatedAt: now,
      expiresAt: Timestamp.fromMillis(now + 86_400_000),
    });
    expect((await getDoc(doc(host.db, "rooms", code))).data()?.players.O.name).toBe("Guest");
    await expect(getDoc(doc(outsider.db, "rooms", code))).rejects.toThrow();
    await expect(updateDoc(doc(outsider.db, "rooms", code), { status: "finished" })).rejects.toThrow();
    await expect(updateDoc(doc(outsider.db, "rooms", code), { "players.O": { uid: outsider.user.uid, name: "Third", lastSeenAt: now } })).rejects.toThrow();
  }, 60_000);

  it("allows only the player whose turn it is to make the next move", async () => {
    const ref = doc(host.db, "rooms", code);
    await runTransaction(host.db, async (transaction) => {
      const snapshot = await transaction.get(ref);
      const data = snapshot.data()!;
      const game = { ...data.game, boards: data.game.boards.map((board: { cells: ("X" | "O" | null)[] }) => board.cells) };
      const next = makeMove(game, 0, 0);
      transaction.update(ref, { game: storedGame(next), status: "playing", updatedAt: Date.now(), expiresAt: Timestamp.fromMillis(Date.now() + 86_400_000) });
    });
    expect((await getDoc(ref)).data()?.game.moveCount).toBe(1);
    await expect(updateDoc(doc(host.db, "rooms", code), { game: storedGame(createGame("X")) })).rejects.toThrow();
    await expect(updateDoc(doc(outsider.db, "rooms", code), { game: storedGame(createGame("X")) })).rejects.toThrow();
  }, 60_000);

  it("permits the guest to take X while the host takes O", async () => {
    const swappedCode = "ROOM2";
    const now = Date.now();
    await setDoc(doc(host.db, "rooms", swappedCode), room(host, swappedCode, now));
    await updateDoc(doc(guest.db, "rooms", swappedCode), {
      players: {
        X: { uid: guest.user.uid, name: "Guest", lastSeenAt: now },
        O: { uid: host.user.uid, name: "Host", lastSeenAt: now },
      },
      status: "playing",
      game: joinedGame(),
      rematchVotes: { X: false, O: false },
      updatedAt: now,
      expiresAt: Timestamp.fromMillis(now + 86_400_000),
    });
    const swapped = await getDoc(doc(host.db, "rooms", swappedCode));
    expect(swapped.data()?.players.X.uid).toBe(guest.user.uid);
    expect(swapped.data()?.players.O.uid).toBe(host.user.uid);
    await expect(deleteDoc(doc(guest.db, "rooms", swappedCode))).rejects.toThrow();
    await deleteDoc(doc(host.db, "rooms", swappedCode));
  }, 60_000);

  it("allows a guest to leave and the host to close the room", async () => {
    const now = Date.now();
    await updateDoc(doc(guest.db, "rooms", code), {
      "players.O": null,
      status: "waiting",
      rematchVotes: { X: false, O: false },
      updatedAt: now,
      expiresAt: Timestamp.fromMillis(now + 86_400_000),
    });
    expect((await getDoc(doc(host.db, "rooms", code))).data()?.status).toBe("waiting");
    await deleteDoc(doc(host.db, "rooms", code));
    await expect(getDoc(doc(guest.db, "rooms", code))).rejects.toThrow();
  }, 60_000);
});
