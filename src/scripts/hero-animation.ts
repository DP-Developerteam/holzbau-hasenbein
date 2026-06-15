import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initHero() {
  const hero = document.querySelector<HTMLElement>('#hero');
  const cutoutText = document.querySelector<SVGTextElement>('.cutout-text');
  const cutout = document.querySelector<SVGElement>('.hero-cutout');
  const finalText = document.querySelector<HTMLElement>('.hero-final-text');
  const scrollHint = document.querySelector<HTMLElement>('.scroll-hint');

  if (!hero || !cutoutText || !cutout || !finalText) return;

  // Tamaño base actual (lo fija Hero.astro de forma responsive).
  const baseFont = () => parseFloat(cutoutText.getAttribute('font-size') || '120') || 120;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: '+=200%',
      pin: true,
      scrub: 1.2,
      anticipatePin: 1,
      // Recalcula los valores (funciones) en cada refresh => responsive al
      // redimensionar la ventana.
      invalidateOnRefresh: true,
    },
  });

  // Fase 1: Las letras se expanden. Los objetivos son proporcionales al tamaño
  // base responsive y al ancho del hero, por lo que el "zoom" se ve igual de
  // intenso en móvil, tablet y escritorio.
  tl.to(
    cutoutText,
    {
      attr: { 'font-size': () => baseFont() * 7 },
      letterSpacing: () => `${hero.clientWidth * 0.35}px`,
      ease: 'power2.in',
      duration: 1,
    },
    0
  );

  // Fase 2: La capa negra con cutout se desvanece, dejando ver el video pleno
  tl.to(
    cutout,
    {
      opacity: 0,
      ease: 'power2.inOut',
      duration: 0.4,
    },
    0.6
  );

  // Fase 3: Texto final emerge
  tl.to(
    finalText,
    {
      opacity: 1,
      y: 0,
      ease: 'power2.out',
      duration: 0.5,
    },
    0.75
  );

  // El scroll hint se oculta al empezar el scroll
  if (scrollHint) {
    gsap.to(scrollHint, {
      opacity: 0,
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'top -10%',
        scrub: true,
      },
    });
  }
}