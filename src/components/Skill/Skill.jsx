'use client';

import React, { useEffect, useState } from 'react';
import SkillCard from './SkillCard';

const defaultSkillItems = [
  {
    title: "Programming Language",
    items: [
      { imgSrc: '/images/javascript.svg', label: 'JavaScript', desc: 'Programming Language', progress: '52' },
      { imgSrc: '/images/php.svg', label: 'PHP', desc: 'Programming Language', progress: '45' },
      { imgSrc: '/images/cpp.svg', label: 'C++', desc: 'Programming Language', progress: '40' },
      { imgSrc: '/images/c.png', label: 'C', desc: 'Programming Language', progress: '38' },
      { imgSrc: '/images/dart.svg', label: 'Dart', desc: 'Programming Language', progress: '35' },
      { imgSrc: '/images/python.svg', label: 'Python', desc: 'Programming Language', progress: '30' },
    ]
  },
  {
    title: "Framework & Library",
    items: [
      { imgSrc: '/images/flutter.svg', label: 'Flutter', desc: 'Framework', progress: '40' },
      { imgSrc: '/images/react.svg', label: 'React Js', desc: 'Library', progress: '40' },
      { imgSrc: '/images/nextjs.svg', label: 'Next Js', desc: 'Library', progress: '40' },
      { imgSrc: '/images/laravel.png', label: 'Laravel', desc: 'Framework', progress: '40' },
      { imgSrc: '/images/bootstrap.png', label: 'Bootstrap', desc: 'Framework', progress: '30' },
      { imgSrc: '/images/jquery.jpeg', label: 'jQuery', desc: 'Library', progress: '28' },
      { imgSrc: '/images/flask.png', label: 'Flask', desc: 'Framework', progress: '25' },
    ]
  },
  {
    title: "Markup & Styling",
    items: [
      { imgSrc: '/images/html.png', label: 'HTML', desc: 'Markup Language', progress: '50' },
      { imgSrc: '/images/css.png', label: 'CSS', desc: 'Styling Language', progress: '45' },
      { imgSrc: '/images/tailwindcss.svg', label: 'TailwindCSS', desc: 'CSS Framework', progress: '27' },
    ]
  },
  {
    title: "Database",
    items: [
      { imgSrc: '/images/mysql.png', label: 'MySQL', desc: 'Relational Database', progress: '35' },
      { imgSrc: '/images/prisma.svg', label: 'Prisma ORM', desc: 'ORM', progress: '30' },
      { imgSrc: '/images/firebase.png', label: 'Firebase', desc: 'BaaS (Backend-as-a-Service)', progress: '30' },
      { imgSrc: '/images/supabase.svg', label: 'Supabase', desc: 'BaaS (Backend-as-a-Service)', progress: '25' },
      { imgSrc: '/images/vercel.svg', label: 'Vercel', desc: 'Hosting Platform', progress: '25' },
    ]
  },
  {
    title: "UI/UX & Multimedia",
    items: [
      { imgSrc: '/images/figma.jpg', label: 'Figma', desc: 'UI/UX Design Tool', progress: '35' },
      { imgSrc: '/images/capcut.png', label: 'Capcut', desc: 'Video Editing', progress: '30' },
      { imgSrc: '/images/canva.png', label: 'Canva', desc: 'Graphic Design', progress: '30' },
      { imgSrc: '/images/premiere.png', label: 'Adobe Premiere Pro', desc: 'Video Editing', progress: '25' },
    ]
  },
  {
    title: "Package Manager",
    items: [
      { imgSrc: '/images/npm.svg', label: 'Node Package Manager', desc: 'Package Manager', progress: '28' },
      { imgSrc: '/images/python.svg', label: 'pip', desc: 'Python Package Manager', progress: '30' },
      { imgSrc: '/images/flutter.svg', label: 'Pub', desc: 'Dart/Flutter Package Manager', progress: '30' },
    ]
  },
];

const Skill = () => {
  const [skillItem, setSkillItem] = useState(defaultSkillItems);

  useEffect(() => {
    fetch('/api/public/data')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.techStacks && data.techStacks.length > 0) {
          setSkillItem(data.techStacks);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="tools" className="section">
      <div className="container">
        <h2 className="headline-2 reveal-up">
          Tech <span className="headline-5">Stack</span>
        </h2>
        <p className="text-zinc-400 mt-3 mb-8 max-w-[50ch]">
          Advanced technology I use to create projects.
        </p>

        {/* Setiap kategori menjadi satu segmen ke bawah (tidak berjejer menyamping) */}
        <div className="space-y-10">
          {skillItem.map((data, key) => (
            <div key={key} className="space-y-3">
              <h5 className="text-lg font-semibold text-zinc-100 flex items-center gap-2 reveal-up">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                {data.title}
              </h5>
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {data.items.map(({ imgSrc, label, desc, progress }, idx) => (
                  <SkillCard key={idx} imgSrc={imgSrc} label={label} desc={desc} progress={progress} classes="reveal-up" />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skill;
