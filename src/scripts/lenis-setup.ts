import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initLenis() {
    const lenis = new Lenis({
        // Cuanto más alta la duración, más tiempo sigue "deslizando" la página
        // tras soltar el gesto: sensación de inercia/masa, como empujar algo
        // pesado que tarda en frenar.
        duration: 2.2,

        // easeOutQuint: arranque algo más lento y una frenada larga y suave.
        // Si quieres aún más "peso", prueba easeInOutQuint (comentada abajo):
        // arranca despacio, como si tuviera que vencer inercia antes de moverse.
        easing: (t: number) => 1 - Math.pow(1 - t, 5),
        // easing: (t: number) =>
        //   t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2,

        smoothWheel: true,

        // <1 = cada "tick" de rueda mueve menos distancia, como si hubiera que
        // empujar con más esfuerzo para avanzar lo mismo.
        wheelMultiplier: 0.25,

        // Igual de criterio para gestos táctiles; un poco más alto porque el
        // touch ya es menos sensible que la rueda.
        touchMultiplier: 0.6,
    });

    // Sincroniza Lenis con ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // Expuesto para que otros scripts (p.ej. el botón "nach oben" del footer)
    // puedan usar lenis.scrollTo() sin recrear la instancia.
    (window as unknown as { __lenis: Lenis }).__lenis = lenis;

    return lenis;
}