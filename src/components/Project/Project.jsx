import React from 'react';
import Image from 'next/image';
import LaunchSharpIcon from '@mui/icons-material/LaunchSharp';
import JsonViewer from '../json/JsonViewer';

const Project = ({ type, jsonResponse, imgSrc, title, tags, projectLink, classes }) => {
    return (
        <div className={`relative p-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700/50 ring-1 ring-inset ring-zinc-50/5 transition-colors flex flex-col justify-between ${classes}`}>
            <div>
                {/* Clickable Image */}
                <a
                    href={projectLink || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full cursor-pointer group/img"
                    title={`Buka project: ${title}`}
                >
                    <figure className="img-box w-full max-w-lg mx-auto rounded-lg mb-4 overflow-hidden bg-zinc-900">
                        {type === 'image' && imgSrc && (
                            typeof imgSrc === 'string' ? (
                                <img
                                    src={imgSrc}
                                    loading="lazy"
                                    className="img-cover w-full h-auto object-contain rounded-lg group-hover/img:scale-105 transition-transform duration-300"
                                    alt={title || "Project"}
                                />
                            ) : (
                                <Image
                                    src={imgSrc}
                                    loading="lazy"
                                    quality={75}
                                    className="img-cover w-full h-auto object-contain group-hover/img:scale-105 transition-transform duration-300"
                                    alt={title || "Project"}
                                />
                            )
                        )}
                    </figure>
                </a>

                {type === 'json' && jsonResponse && (
                    <div className="max-h-[330px] overflow-auto bg-zinc-900 text-sm rounded-md p-4 mb-4">
                        <JsonViewer json={jsonResponse} />
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between gap-4 mt-2">
                <div className="flex-1 min-w-0">
                    <a
                        href={projectLink || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-sky-400 transition-colors"
                    >
                        <h3 className="title-1 mb-2.5 truncate font-medium">
                            {title}
                        </h3>
                    </a>
                    <div className="flex flex-wrap items-center gap-1.5">
                        {tags && tags.map((label, key) => (
                            <span key={key} className="h-7 text-xs text-zinc-400 bg-zinc-50/5 flex items-center px-2.5 rounded-lg border border-zinc-700/40">
                                {label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Direct Clickable Button Link */}
                <a
                    href={projectLink || '#'}
                    rel="noopener noreferrer"
                    target="_blank"
                    aria-label={`Buka project ${title}`}
                    className="w-11 h-11 rounded-xl flex items-center justify-center bg-sky-500 hover:bg-sky-400 text-zinc-950 shrink-0 cursor-pointer active:scale-90 transition-transform shadow-lg shadow-sky-500/20"
                >
                    <LaunchSharpIcon fontSize="small" />
                </a>
            </div>
        </div>
    );
}

export default Project;
