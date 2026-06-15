import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initFooter() {
  const footer = document.querySelector<HTMLElement>('#footer');
  if (!footer) return;

  initReveal(footer);
  initMarquee(footer);
  initMagnetic(footer);
  initScrollTop(footer);
}

// Entrada escalonada del bloque de contacto al llegar al footer
function initReveal(footer: HTMLElement) {
  const items = footer.querySelectorAll<HTMLElement>('[data-reveal]');
  if (!items.length) return;

  gsap.from(items, {
    opacity: 0,
    y: 40,
    duration: 0.9,
    ease: 'power3.out',
    stagger: 0.08,
    scrollTrigger: {
      trigger: footer,
      start: 'top 85%',
      toggleActions: 'play none none reverse',
    },
  });
}

// Cinta de marca: bucle horizontal infinito a velocidad constante
function initMarquee(footer: HTMLElement) {
  const track = footer.querySelector<HTMLElement>('[data-marquee]');
  if (!track) return;

  let tween: gsap.core.Tween | null = null;

  const setup = () => {
    tween?.kill();
    gsap.set(track, { xPercent: 0 });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // El track contiene dos copias idénticas del contenido: -50% = un bucle exacto
    const loopWidth = track.scrollWidth / 2;
    const pxPerSecond = 60;

    tween = gsap.to(track, {
      xPercent: -50,
      duration: loopWidth / pxPerSecond,
      ease: 'none',
      repeat: -1,
    });
  };

  setup();
  window.addEventListener('resize', setup);
}

// Pequeño "tirón" magnético hacia el cursor en los textos grandes y el botón
function initMagnetic(footer: HTMLElement) {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const items = footer.querySelectorAll<HTMLElement>('[data-magnetic]');

  items.forEach((item) => {
    const strength = item.classList.contains('footer-top') ? 0.35 : 0.15;

    const onMove = (e: MouseEvent) => {
      const rect = item.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * strength;
      const y = (e.clientY - rect.top - rect.height / 2) * strength;
      gsap.to(item, { x, y, duration: 0.4, ease: 'power3.out' });
    };

    const onLeave = () => {
      gsap.to(item, { x: 0, y: 0, duration: 0.5, ease: 'power3.out' });
    };

    item.addEventListener('mousemove', onMove);
    item.addEventListener('mouseleave', onLeave);
  });
}

// Botón "nach oben" -> usa el scroll suave de Lenis si está disponible
function initScrollTop(footer: HTMLElement) {
  const btn = footer.querySelector<HTMLButtonElement>('[data-scroll-top]');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const instance = (window as any).__lenis;

    if (instance?.scrollTo) {
      instance.scrollTo(0, { duration: 1.6 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}