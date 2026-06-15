import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initContact() {
  const contact = document.querySelector<HTMLElement>('#contact');
  const reveal = document.querySelector<HTMLElement>('.contact-reveal');
  const revealItems = document.querySelectorAll<HTMLElement>('[data-reveal-item]');

  if (!contact || !reveal) return;

  // Expansión del clip-path: de círculo pequeño abajo → cubrir toda la pantalla.
  // Anclado a cuando la sección YA es visible (si empezara antes, el centro del
  // círculo -el 50%/50% de #contact- estaría fuera de pantalla y gran parte del
  // crecimiento ocurriría sin verse, comprimiendo la parte visible y haciendo
  // que se sienta más rápido). El rango es ~el doble que antes => más lento.
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: contact,
      start: 'top 50%',
      end: 'top 0%',
      scrub: 4.8,
    },
  });

  tl.to(
    reveal,
    {
      clipPath: 'circle(150% at 50% 50%)',
      ease: 'power2.inOut',
      duration: 1.8,
    },
    0
  );

  // El contenido entra justo después de que el círculo empiece a expandirse
  if (revealItems.length) {
    tl.from(
      revealItems,
      {
        opacity: 0,
        y: 36,
        ease: 'power2.out',
        stagger: 0.08,
        duration: 2.8,
      },
      0.6
    );
  }

  initBubblePicker();
  initSubmitGuard();
}

/**
 * Selector flotante de "burbujas": al pulsar la píldora se abre un overlay a
 * pantalla completa donde las opciones aparecen con un rebote escalonado y
 * luego flotan suavemente en bucle hasta que se elige una o se cierra.
 */
function initBubblePicker() {
  const pill = document.querySelector<HTMLButtonElement>('[data-pill]');
  const pillText = document.querySelector<HTMLElement>('[data-pill-text]');
  const hiddenValue = document.querySelector<HTMLInputElement>('[data-pill-value]');
  const overlay = document.querySelector<HTMLElement>('[data-pill-options]');
  const bubbles = Array.from(document.querySelectorAll<HTMLButtonElement>('.contact-bubble'));

  if (!pill || !pillText || !overlay || !bubbles.length) return;

  let isOpen = false;
  let floatTweens: gsap.core.Tween[] = [];

  const stopFloating = () => {
    floatTweens.forEach((t) => t.kill());
    floatTweens = [];
  };

  const startFloating = () => {
    floatTweens = bubbles.map((bubble) =>
      gsap.to(bubble, {
        x: `+=${gsap.utils.random(-10, 10)}`,
        y: `+=${gsap.utils.random(-12, 12)}`,
        rotate: gsap.utils.random(-4, 4),
        duration: gsap.utils.random(2.6, 4.2),
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
    );
  };

  const open = () => {
    if (isOpen) return;
    isOpen = true;
    pill.setAttribute('aria-expanded', 'true');
    overlay.setAttribute('aria-hidden', 'false');

    gsap.set(overlay, { visibility: 'visible', pointerEvents: 'auto' });
    gsap.set(bubbles, { opacity: 0, scale: 0.4, x: 0, y: 24, rotate: 0 });

    gsap.to(overlay, { opacity: 1, duration: 0.35, ease: 'power2.out' });
    gsap.to(bubbles, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.6,
      ease: 'back.out(1.7)',
      stagger: { each: 0.07, from: 'random' },
      onComplete: startFloating,
    });
  };

  const close = () => {
    if (!isOpen) return;
    isOpen = false;
    pill.setAttribute('aria-expanded', 'false');
    overlay.setAttribute('aria-hidden', 'true');
    stopFloating();

    gsap.to(bubbles, {
      opacity: 0,
      scale: 0.4,
      duration: 0.25,
      ease: 'power2.in',
      stagger: 0.03,
    });
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.3,
      delay: 0.1,
      ease: 'power2.in',
      onComplete: () => {
        gsap.set(overlay, { visibility: 'hidden', pointerEvents: 'none' });
      },
    });
  };

  pill.addEventListener('click', () => (isOpen ? close() : open()));

  bubbles.forEach((bubble) => {
    bubble.addEventListener('click', () => {
      const label = bubble.textContent?.trim() ?? '';
      pillText.textContent = label;
      if (hiddenValue) hiddenValue.value = label;
      close();
    });
  });

  // Cerrar al hacer clic en el fondo (no en una burbuja) o con Escape
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) close();
  });
}

/**
 * Antes de enviar, exige al menos un dato de contacto (email o teléfono).
 * Si faltan ambos, evita el envío, sacude el campo y enfoca el email.
 */
function initSubmitGuard() {
  const form = document.querySelector<HTMLFormElement>('[data-contact-form]');
  const fields = document.querySelector<HTMLElement>('[data-contact-fields]');
  const email = form?.querySelector<HTMLInputElement>('input[name="email"]');
  const phone = form?.querySelector<HTMLInputElement>('input[name="phone"]');

  if (!form || !fields || !email || !phone) return;

  form.addEventListener('submit', (e) => {
    if (email.value.trim() || phone.value.trim()) return;

    e.preventDefault();
    gsap.fromTo(
      fields,
      { x: 0 },
      {
        x: 10,
        duration: 0.07,
        repeat: 7,
        yoyo: true,
        ease: 'power1.inOut',
        onComplete: () => gsap.set(fields, { x: 0 }),
      }
    );
    email.focus();
  });
}