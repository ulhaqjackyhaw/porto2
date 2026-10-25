'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import bannerImg from "@/assets/images/Ulhaq.png";
import DownloadSharpIcon from '@mui/icons-material/DownloadSharp';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import { Buttons, ButtonExtend } from '../Button';

const Hero = () => {
    const [heroData, setHeroData] = useState({
        available_text: "Available for work",
        title_prefix: "Hello, My Name",
        title_name: "is Dhiya Ulhaq,",
        title_role: "Software Developer",
        cv_label: "Download CV",
        cv_url: "https://drive.google.com/file/d/1UScmjE3fVCfuYrAn2zqOCuxV65H-qsMx/view?usp=drive_link",
        connect_label: "Connect to Me",
        connect_link: "https://www.linkedin.com/in/dhiyaulhaq100",
        banner_img: "",
    });

    useEffect(() => {
        fetch('/api/hero')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data && data.id) {
                    setHeroData(data);
                }
            })
            .catch(() => {});
    }, []);

    const imageSource = heroData.banner_img && heroData.banner_img.trim() !== '' ? heroData.banner_img : bannerImg;

    return (
        <section id="home" className="pt-28 lg:pt-36">
            <div className="container lg:grid lg:grid-cols-2 items-center lg:gap-10">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-zinc-400 text-sm tracking-wide ">
                            <span className="relative w-2 h-2 rounded-full bg-emerald-400">
                                <span className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                            </span>
                            {heroData.available_text || "Available for work"}
                        </div>
                    </div>
                    <h2 className="font-sans headline-1">
                        {heroData.title_prefix || "Hello, My Name"} <span className="headline-3 font-sans">{heroData.title_name || "is Dhiya Ulhaq,"}</span> I&apos;am a <span className="headline-4 font-sans">{heroData.title_role || "Software Developer"}</span>
                    </h2>
                    <div className="flex items-center gap-3 ">
                        <Buttons 
                            href={heroData.cv_url} 
                            target="_blank"
                            label={heroData.cv_label || "Download CV"} 
                            icon={<DownloadSharpIcon />} 
                        />

                        <ButtonExtend 
                            href={heroData.connect_link} 
                            target="_blank"
                            label={heroData.connect_label || "Connect to Me"} 
                            icon={<ArrowOutwardIcon />} 
                        />
                    </div>
                </div>
                <div className="mt-10 lg:mt-0">
                    <figure className="w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[480px] mx-auto lg:ml-auto bg-gradient-to-t from-sky-400 via-25% via-sky-400/40 to-65% rounded-[40px] sm:rounded-[60px] overflow-hidden">
                        {typeof imageSource === 'string' ? (
                            <img src={imageSource} alt="banner" className="w-full h-auto object-cover" />
                        ) : (
                            <Image src={imageSource} priority fetchPriority="high" quality={75} alt="banner" />
                        )}
                    </figure>
                </div>
            </div>
        </section>
    );
}

export default Hero;
