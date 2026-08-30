import confetti from "canvas-confetti";

export const triggerConfetti = () => {
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ["#00D084", "#00C2FF", "#FFB320", "#B692FF", "#FF6B6B"],
      disableForReducedMotion: true,
    });
  } catch (e) {
    // Ignore if canvas confetti fails in restricted env
  }
};
