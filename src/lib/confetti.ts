import confetti from "canvas-confetti";

export function triggerConfetti() {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#10b981", "#6366f1", "#06b6d4", "#f59e0b", "#ec4899"],
    });
  } catch (_) {}
}

export function triggerGoalCelebration() {
  try {
    const end = Date.now() + 1000;
    const colors = ["#10b981", "#6366f1", "#f59e0b"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch (_) {}
}
