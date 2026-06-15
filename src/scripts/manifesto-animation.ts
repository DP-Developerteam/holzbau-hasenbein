import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export function initManifesto() {
  const manifestoText = document.querySelector<HTMLElement>('.manifesto-text');
  if (!manifestoText) return;

  // `autoSplit` re-splits automatically on resize / font-load, and because we
  // return the tween from onSplit, SplitText reverts + recreates it for us
  // (keeping the scroll-scrubbed progress in sync).
  SplitText.create(manifestoText, {
    type: 'words, chars',
    autoSplit: true,
    onSplit(self) {
      // Estado inicial: letras invisibles, encogidas, ligeramente caídas y rotadas
      gsap.set(self.chars, {
        opacity: 0,
        scale: 0.4,
        y: () => gsap.utils.random(24, 56),
        rotate: () => gsap.utils.random(-14, 14),
        transformOrigin: '50% 100%',
      });

      // Cada letra "aparece" (sin fade gradual) con un pequeño rebote elástico,
      // una a una, sincronizado con el scroll.
      return gsap.to(self.chars, {
        opacity: 1,
        scale: 1,
        y: 0,
        rotate: 0,
        duration: 0.8,
        ease: 'back.out(1.8)',
        stagger: {
          each: 0.025,
          from: 'start',
        },
        scrollTrigger: {
          trigger: manifestoText,
          start: 'top 80%',
          end: 'bottom 40%',
          scrub: 1,
        },
      });
    },
  });
}