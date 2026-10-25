'use client';

import React, { useEffect, useState } from 'react';

const defaultAboutText = `👋 Hello!, I am Dhiya Ulhaq, an Informatics Engineering graduate from Semarang State Polytechnic with a strong focus on software development, mobile development, IoT, and web-based information systems. Experienced in developing web applications, dashboards, and mobile applications using Excel for data analysis, Laravel, Flutter, MySQL, and related technologies. Has internship experience in airport electronic systems maintenance, Human Capital information system development, and employee recruitment support at InJourney Airports Regional 1. Passionate about building practical digital solutions, with strong problem solving skills, teamwork, adaptability, and a continuous learning mindset.`;

const About = () => {
    const [aboutText, setAboutText] = useState(defaultAboutText);

    useEffect(() => {
        fetch('/api/hero')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.about_text && data.about_text.trim() !== '') {
                    setAboutText(data.about_text);
                }
            })
            .catch(() => {});
    }, []);

    return (
        <section id="about" className="section">
            <div className="container">
                <div className="bg-zinc-800/60 border border-zinc-700/40 p-6 sm:p-8 md:p-12 rounded-3xl reveal-up shadow-2xl backdrop-blur-sm">
                    <p className="text-zinc-200 text-base sm:text-lg md:text-xl leading-relaxed md:leading-loose text-left md:text-justify whitespace-pre-line font-normal tracking-normal">
                        {aboutText}
                    </p>
                </div>
            </div>
        </section>
    );
}

export default About;
