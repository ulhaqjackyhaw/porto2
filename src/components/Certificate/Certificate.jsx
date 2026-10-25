'use client';

import React, { useEffect, useState } from 'react';
import CertificateCard from './CertificateCard';
import jaringanImg from '@/assets/images/1.png';
import devopsImg from '@/assets/images/2.png';
import jsImg from '@/assets/images/4.png';
import beImg from '@/assets/images/3.png';

const defaultCertificates = [
  {
    id: 1,
    name: 'Cloud & Gen AI di AWS',
    imgSrc: jaringanImg,
    link: '#',
  },
  {
    id: 2,
    name: 'Pemrograman JavaScript',
    imgSrc: devopsImg,
    link: '#',
  },
  {
    id: 3,
    name: 'Database Design',
    imgSrc: jsImg,
    link: '#',
  },
  {
    id: 4,
    name: 'Database Pemrograman with SQL',
    imgSrc: beImg,
    link: '#',
  },
];

const Certificate = () => {
  const [certList, setCertList] = useState(defaultCertificates);

  useEffect(() => {
    fetch('/api/public/data')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.certificates && data.certificates.length > 0) {
          setCertList(data.certificates);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="certificate" className="section">
      <div className="container">
        <h2 className="headline-2 mb-8 reveal-up">
          Certif<span className="headline-5">icate</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {certList.map((item, key) => (
            <CertificateCard
              key={item.id || key}
              name={item.name || item.title}
              imgSrc={item.imgSrc}
              link={item.link}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certificate;
