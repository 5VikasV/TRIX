const click = new Audio("/sounds/click.mp3");
const join = new Audio("/sounds/join.mp3");
const win = new Audio("/sounds/win.mp3");
const countdown = new Audio("/sounds/countdown.mp3");

function play(audio: HTMLAudioElement) {
  audio.pause();
  audio.currentTime = 0;

  audio.play().catch(() => {});
}

export function playClick() {
  play(click);
}

export function playJoin() {
  play(join);
}

export function playWin() {
  play(win);
}

export function playCountdown() {
  countdown.pause();
  countdown.currentTime = 0;

  countdown.play().catch(() => {});
}

export function stopCountdown() {
  countdown.pause();
  countdown.currentTime = 0;
}