import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initServices() {
  const services = document.querySelector<HTMLElement>('#services');
  const pin = document.querySelector<HTMLElement>('[data-services-pin]');
  const wrapper = document.querySelector<HTMLElement>('[data-track-wrapper]');
  const track = document.querySelector<HTMLElement>('[data-track]');
  const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-service]'));
  const progressBar = document.querySelector<HTMLElement>('[data-progress-bar]');
  const progressCurrent = document.querySelector<HTMLElement>('[data-progress-current]');
  const titles = document.querySelectorAll<HTMLElement>('[data-parallax]');

  if (!services || !pin || !wrapper || !track || !cards.length) return;

  const mm = gsap.matchMedia();

  // Escritorio: el carril se desplaza en horizontal mientras la sección queda fijada ("scroll-jacking")
  mm.add(
    {
      isDesktop: '(min-width: 820px) and (prefers-reduced-motion: no-preference)',
      isCompact: '(max-width: 819px), (prefers-reduced-motion: reduce)',
    },
    (context) => {
      const conditions = context.conditions as { isDesktop: boolean; isCompact: boolean };

      if (conditions.isDesktop) {
        const getScrollDistance = () => Math.max(track.scrollWidth - wrapper.clientWidth, 0);

        // Tween "maestro": mueve el carril de 0 al final del recorrido horizontal
        const scrollTween = gsap.to(track, {
          x: () => -getScrollDistance(),
          ease: 'none',
        });

        const mainTrigger = ScrollTrigger.create({
          trigger: pin,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          animation: scrollTween,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressBar) gsap.set(progressBar, { scaleX: self.progress });
            if (progressCurrent) {
              const active = Math.min(cards.length - 1, Math.floor(self.progress * cards.length));
              progressCurrent.textContent = String(active + 1).padStart(2, '0');
            }
          },
        });

        // Revelado de cada tarjeta a medida que entra en el viewport horizontal
        const cardTriggers = cards.flatMap((card) => {
          const marker = card.querySelector<HTMLElement>('.service-marker');
          const content = card.querySelectorAll(
            '.service-num, .service-title, .service-sub, .service-desc'
          );

          const contentTween = gsap.from(content, {
            opacity: 0,
            y: 28,
            duration: 0.7,
            ease: 'power2.out',
            stagger: 0.07,
            scrollTrigger: {
              trigger: card,
              containerAnimation: scrollTween,
              start: 'left 85%',
              end: 'left 15%',
              toggleActions: 'play none none reverse',
            },
          });

          const triggers = [contentTween.scrollTrigger];

          if (marker) {
            const markerTween = gsap.from(marker, {
              opacity: 0,
              scale: 0.4,
              duration: 0.5,
              ease: 'back.out(2.4)',
              scrollTrigger: {
                trigger: card,
                containerAnimation: scrollTween,
                start: 'left 85%',
                end: 'left 15%',
                toggleActions: 'play none none reverse',
              },
            });
            triggers.push(markerTween.scrollTrigger);
          }

          return triggers;
        });

        // Parallax sutil de los títulos según el cursor
        let onMove: ((e: MouseEvent) => void) | null = null;
        if (window.matchMedia('(pointer: fine)').matches) {
          onMove = (e: MouseEvent) => {
            const rect = services.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            titles.forEach((title, i) => {
              const intensity = ((i % 4) + 1) * 4;
              gsap.to(title, {
                x: x * intensity,
                y: y * intensity,
                duration: 1.2,
                ease: 'power2.out',
              });
            });
          };
          services.addEventListener('mousemove', onMove);
        }

        // Limpieza al salir de este breakpoint (resize, reduced-motion, etc.)
        return () => {
          if (onMove) services.removeEventListener('mousemove', onMove);
          cardTriggers.forEach((t) => t?.kill());
          mainTrigger.kill();
          scrollTween.kill();
          gsap.set(track, { clearProps: 'transform' });
          gsap.set(cards, { clearProps: 'all' });
          if (progressBar) gsap.set(progressBar, { clearProps: 'transform' });
        };
      }

      // Móvil / reduced-motion: el carril es un scroller horizontal nativo con snap.
      // Solo animamos una pequeña entrada al aparecer cada tarjeta.
      const fadeTriggers = cards.map((card) => {
        gsap.from(card, {
          opacity: 0,
          y: 32,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        });
        return ScrollTrigger.getAll().slice(-1)[0];
      });

      return () => {
        fadeTriggers.forEach((t) => t?.kill());
        gsap.set(cards, { clearProps: 'all' });
      };
    }
  );
}