import React from 'react';
import Image from 'next/image';

const CertificateCard = ({ name, imgSrc, link }) => {
  const targetHref = link && link !== '#' ? link : (typeof imgSrc === 'string' ? imgSrc : '#');
  const isClickable = Boolean(targetHref && targetHref !== '#');

  const CardInner = (
    <div className="bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/50 hover:border-sky-500/50 p-4 rounded-2xl w-full transition-all duration-300 group hover:shadow-xl hover:shadow-sky-500/10 flex flex-col justify-between cursor-pointer">
      <figure className="img-box relative w-full aspect-[16/10] bg-zinc-900 rounded-xl overflow-hidden mb-3">
        {typeof imgSrc === 'string' ? (
          <img
            src={imgSrc}
            loading="lazy"
            alt={name || "Certificate"}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/certificates/1.png';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Image
            src={imgSrc}
            loading="lazy"
            alt={name || "Certificate"}
            quality={75}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}

        {isClickable && (
          <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-lg bg-zinc-950/80 backdrop-blur-md flex items-center justify-center text-sky-400 border border-zinc-700 group-hover:bg-sky-500 group-hover:text-zinc-950 transition-all shadow-md">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        )}
      </figure>

      <div className="flex items-center justify-between gap-2 pt-1">
        <figcaption className="font-semibold text-sm text-zinc-100 group-hover:text-sky-300 transition-colors line-clamp-2">
          {name}
        </figcaption>
        {isClickable && (
          <span className="text-[11px] text-sky-400 font-medium whitespace-nowrap hidden sm:inline-flex items-center gap-1 group-hover:underline">
            Lihat ↗
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="reveal-up w-full">
      {isClickable ? (
        <a
          href={targetHref}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full cursor-pointer focus:outline-none"
          title={`Buka Sertifikat: ${name}`}
        >
          {CardInner}
        </a>
      ) : (
        CardInner
      )}
    </div>
  );
};

export default CertificateCard;
