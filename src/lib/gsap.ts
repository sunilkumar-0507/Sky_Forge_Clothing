import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Every scroll animation in the app is wrapped in this media query so reduced-motion
// users get static layouts (ScrollTrigger pins are skipped entirely).
export const MOTION_OK = '(prefers-reduced-motion: no-preference)';

export { gsap, ScrollTrigger, useGSAP };
