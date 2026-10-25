"use client";

import React from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register plugin GSAP
gsap.registerPlugin(ScrollTrigger);

export default function GSAPAnimation() {
  useGSAP(() => {
    let triggers = [];

    const setupAnimations = () => {
      // Clear old triggers created by this helper
      triggers.forEach((t) => t.kill());
      triggers = [];

      const elements = gsap.utils.toArray('.reveal-up');
      elements.forEach((element) => {
        // If element already animated or visible, skip or re-bind
        const st = ScrollTrigger.create({
          trigger: element,
          start: "-200 bottom",
          end: "bottom 80%",
          scrub: 0.5,
          invalidateOnRefresh: true,
          onEnter: () => {
            gsap.to(element, { y: 0, opacity: 1, duration: 0.8, ease: "sine.inOut" });
          },
          onEnterBack: () => {
            gsap.to(element, { y: 0, opacity: 1, duration: 0.8, ease: "sine.inOut" });
          },
        });
        triggers.push(st);

        // Immediate check: if already in or near viewport, show immediately
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight + 100) {
          gsap.to(element, { y: 0, opacity: 1, duration: 0.5, overwrite: "auto" });
        }
      });
    };

    setupAnimations();

    // Observe DOM changes (e.g. when API fetches and injects dynamic items)
    let timeoutId = null;
    const observer = new MutationObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setupAnimations();
        ScrollTrigger.refresh();
      }, 150);
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
      triggers.forEach((t) => t.kill());
    };
  }, []);

  React.useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("resize", refresh);
    const timer = setTimeout(refresh, 500);

    return () => {
      window.removeEventListener("resize", refresh);
      clearTimeout(timer);
    };
  }, []);

  return null;
}