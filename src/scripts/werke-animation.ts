import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initWerke() {
  const items = Array.from(document.querySelectorAll<HTMLElement>('[data-werke-item]'));
  if (!items.length) return;

  const mm = gsap.matchMedia();

  mm.add(
    {
      reduceMotion: '(prefers-reduced-motion: reduce)',
      fullMotion: '(prefers-reduced-motion: no-preference)',
    },
    (context) => {
      const conditions = context.conditions as { reduceMotion: boolean; fullMotion: boolean };

      const triggers: ScrollTrigger[] = [];

      items.forEach((item) => {
        const wrap = item.querySelector<HTMLElement>('[data-werke-wrap]');
        const inner = item.querySelector<HTMLElement>('[data-werke-parallax]');
        const img = item.querySelector<HTMLElement>('[data-werke-image]');
        const num = item.querySelector<HTMLElement>('.werke-num');

        if (!wrap || !inner || !img) return;

        if (conditions.reduceMotion) {
          // Sin animación: todo visible desde el inicio, sin parallax ni clip-path.
          gsap.set([wrap, img], { clearProps: 'all' });
          if (num) gsap.set(num, { clearProps: 'all' });
          return;
        }

        // Estado inicial: imagen tapada (cortina) y ligeramente ampliada
        gsap.set(wrap, { clipPath: 'inset(100% 0 0 0)' });
        gsap.set(img, { scale: 1.15 });
        if (num) gsap.set(num, { opacity: 0, y: 12 });

        // Revelado tipo "cortina" + desescalado de la imagen al entrar en viewport
        const revealTween = gsap.to(wrap, {
          clipPath: 'inset(0% 0 0 0)',
          duration: 1.3,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        });
        if (revealTween.scrollTrigger) triggers.push(revealTween.scrollTrigger);

        const scaleTween = gsap.to(img, {
          scale: 1,
          duration: 1.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: item,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        });
        if (scaleTween.scrollTrigger) triggers.push(scaleTween.scrollTrigger);

        if (num) {
          const numTween = gsap.to(num, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            delay: 0.3,
            scrollTrigger: {
              trigger: item,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          });
          if (numTween.scrollTrigger) triggers.push(numTween.scrollTrigger);
        }

        // Parallax continuo: la imagen se desplaza dentro de su marco mientras se hace scroll
        const parallaxTween = gsap.fromTo(
          inner,
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
        if (parallaxTween.scrollTrigger) triggers.push(parallaxTween.scrollTrigger);
      });

      // Limpieza al cambiar de breakpoint / preferencia de movimiento
      return () => {
        triggers.forEach((t) => t.kill());
        gsap.set(items.map((i) => i.querySelector('[data-werke-wrap]')), { clearProps: 'all' });
        gsap.set(items.map((i) => i.querySelector('[data-werke-image]')), { clearProps: 'all' });
        gsap.set(items.map((i) => i.querySelector('.werke-num')), { clearProps: 'all' });
        gsap.set(items.map((i) => i.querySelector('[data-werke-parallax]')), { clearProps: 'all' });
      };
    }
  );
}