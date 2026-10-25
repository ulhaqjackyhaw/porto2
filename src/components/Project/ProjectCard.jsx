'use client';

import React, { useEffect, useState } from 'react';
import Project from './Project';
import project1 from "@/assets/images/project1.png";
import project2 from "@/assets/images/project2.png";
import project3 from "@/assets/images/project3.png";
import project4 from "@/assets/images/cooming.png";
import project5 from "@/assets/images/project5.png";

const defaultProjects = [
  {
    type: "image",
    imgSrc: project2,
    title: 'My Hiking App',
    tags: ['Flutter', 'API', 'Booking App'],
    projectLink: 'https://ulhaqjackyhaw.github.io/myhikinglanding/'
  },
  {
    type: "image",
    imgSrc: project1,
    title: 'My Hiking Admin Web',
    tags: ['Web Admin', 'API', 'Management'],
    projectLink: 'https://github.com/ulhaqjackyhaw/myhiking-backend-api'
  },
  {
    type: "image",
    imgSrc: project3,
    title: 'Pill Inspector AI | General Detection',
    tags: ['Flask','Machine Learnig', 'API'],
    projectLink: 'https://github.com/ulhaqjackyhaw/Pill-InsectorAI'
  },
  {
    type: "image",
    imgSrc: project4,
    title: 'Fire Detection Monitoring',
    tags: ['Mobile App', 'API', 'IOT'],
    projectLink: 'https://github.com/ulhaqjackyhaw/FireDetectionMonitoring'
  },
  {
    type: "image",
    imgSrc: project5,
    title: 'Sistem Presensi Siswa',
    tags: ['Laravel', 'Yolo'],
    projectLink: 'https://github.com/ulhaqjackyhaw/Sistem-Presensi-Siswa'
  },
];

const ProjectCard = () => {
  const [projectList, setProjectList] = useState(defaultProjects);

  useEffect(() => {
    fetch('/api/public/data')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.projects && data.projects.length > 0) {
          setProjectList(data.projects);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="project" className="section">
      <div className="container">
        <h2 className="headline-2 mb-8 reveal-up">
          My <span className="headline-5">portfolio</span> highlights
        </h2>
        <div className="grid gap-x-4 gap-y-5 grid-cols-[repeat(auto-fill,_minmax(280px,_1fr))]">
          {projectList.map(({
            type = 'image', jsonResponse, imgSrc, title, tags, projectLink
          }, key) => (
            <Project key={key} type={type} jsonResponse={jsonResponse} imgSrc={imgSrc} title={title} tags={tags} projectLink={projectLink} classes="reveal-up" />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProjectCard;
