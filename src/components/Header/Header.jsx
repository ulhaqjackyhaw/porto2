"use client"

import React from "react";
import { Divide as Hamburger } from 'hamburger-react';
import Navbar from "@/components/Navbar/Navbar";
import { useLenis } from "lenis/react";

const Header = () => {
    const [navOpen, setNavOpen] = React.useState(false);
    const lenis = useLenis();

    const handleContactClick = (e) => {
        e.preventDefault();
        const target = document.querySelector('#contact');
        if (target) {
            if (lenis) {
                lenis.scrollTo(target, { offset: -80, duration: 1.2 });
            } else {
                const top = target.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        }
    };

    return (
        <header className="fixed top-0 left-0 w-full h-20 flex items-center z-40 bg-gradient-to-b from-zinc-900 to-zinc-900/0">
            <div className="max-w-screen-2xl w-full mx-auto px-4 flex justify-between items-center md:px-6 md:grid md:grid-cols-[1fr,3fr,1fr]">
                <div></div>
                <div className="relative md:justify-self-center">
                    <button className="menu-btn material-symbols md:hidden" aria-label="Open nav" onClick={() => setNavOpen((prev) => !prev)}>
                        <Hamburger
                            toggled={navOpen}
                            size={25}
                            strokeWidth={2}
                            rotate={0}
                            color="#fff"
                            borderRadius={0}
                            animationDuration={0.3}
                            aria-label="Toggle navigation menu"
                        />
                    </button>
                    <Navbar navOpen={navOpen} />
                </div>
                <a
                    href="#contact"
                    onClick={handleContactClick}
                    className="btn btn-secondary hover:bg-slate-400 max-md:hidden md:justify-self-end cursor-pointer"
                >
                    Contact Me
                </a>
            </div>
        </header>
    );
}

export default Header;
