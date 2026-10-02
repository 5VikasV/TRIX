export function readableError(error: unknown): string {
  if (typeof error === "object" && error && "code" in error &&
    (error.code === "permission-denied" || error.code === "not-found" || error.code === "already-exists")) {
    return "That room is unavailable, full, or has expired.";
  }
  if (typeof error === "object" && error && "message" in error && typeof error.message === "string") {
    return error.message.replace(/^(functions|firestore)\/[\w-]+:\s*/, "");
  }
  return "Something went wrong. Please try again.";
}
