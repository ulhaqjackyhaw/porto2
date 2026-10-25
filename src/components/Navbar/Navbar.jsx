'use client';

import React from "react";
import { useLenis } from "lenis/react";

const Navbar = ({ navOpen }) => {
  const lenis = useLenis();
  const lastActiveLink = React.useRef();
  const activeBox = React.useRef();

  const initActiveBox = () => {
    if (!lastActiveLink.current || !activeBox.current) return;
    activeBox.current.style.top = lastActiveLink.current.offsetTop + 'px';
    activeBox.current.style.left = lastActiveLink.current.offsetLeft + 'px';
    activeBox.current.style.width = lastActiveLink.current.offsetWidth + 'px';
    activeBox.current.style.height = lastActiveLink.current.offsetHeight + 'px';
  };

  React.useEffect(() => {
    initActiveBox();
    window.addEventListener('resize', initActiveBox);
    return () => window.removeEventListener('resize', initActiveBox);
  }, []);

  const activeLink = (event, link) => {
    if (lastActiveLink.current) {
      lastActiveLink.current.classList.remove('active');
    }
    event.currentTarget.classList.add('active');
    lastActiveLink.current = event.currentTarget;

    if (activeBox.current) {
      activeBox.current.style.top = event.currentTarget.offsetTop + 'px';
      activeBox.current.style.left = event.currentTarget.offsetLeft + 'px';
      activeBox.current.style.width = event.currentTarget.offsetWidth + 'px';
      activeBox.current.style.height = event.currentTarget.offsetHeight + 'px';
    }

    if (link && link.startsWith('#')) {
      event.preventDefault();
      const target = document.querySelector(link);
      if (target) {
        if (lenis) {
          lenis.scrollTo(target, { offset: -80, duration: 1.2 });
        } else {
          const top = target.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      }
    }
  };

  const navItems = [
    {
      label: 'Home',
      link: '#home',
      className: 'nav-link active',
      ref: lastActiveLink
    },
    {
      label: 'About',
      link: '#about',
      className: 'nav-link'
    },
    {
      label: 'Tools',
      link: '#tools',
      className: 'nav-link'
    },
    {
      label: 'Project',
      link: '#project',
      className: 'nav-link'
    },
    {
      label: 'Certificate',
      link: '#certificate',
      className: 'nav-link'
    },
    {
      label: 'Contact',
      link: '#contact',
      className: 'nav-link md:hidden'
    },
    {
      label: 'STAR-X AI',
      link: '/starx-ai',
      className: 'nav-link'
    }
  ];

  return (
    <nav className={`navbar ${navOpen ? 'active' : ''}`}>
      {navItems.map(({
        label, link, className, ref
      }, key) => (
        <a
          href={link}
          key={key}
          ref={ref}
          className={className}
          onClick={(e) => activeLink(e, link)}
        >
          {label}
        </a>
      ))}
      <div className="active-box" ref={activeBox}>
      </div>
    </nav>
  );
};

export default Navbar;
