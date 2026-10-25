import React from "react";
import Image from "next/image";
import { Progress } from "@heroui/progress";

const SkillCard = ({ imgSrc, label, desc, progress, classes }) => {
  return (
    <li className={`flex items-center gap-3 ring-1 ring-inset ring-sky-500/80 rounded-2xl p-3 hover:bg-zinc-800 transition-colors group ${classes}`}>
      <figure className="bg-zinc-700/50 flex items-center justify-center rounded-lg overflow-hidden w-12 h-12 p-2 group-hover:bg-zinc-900 transition-colors shrink-0">
        {imgSrc ? (
          typeof imgSrc === 'string' ? (
            <img src={imgSrc} loading="lazy" className="w-8 h-8 object-contain" alt={label || "Skill Image"} />
          ) : (
            <Image src={imgSrc} loading="lazy" width={32} height={32} alt={label || "Skill Image"} />
          )
        ) : null}
      </figure>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-zinc-100 text-sm truncate">{label}</h3>
        <div className="flex items-center justify-between gap-2 text-xs mb-1 mt-0.5">
          <p className="text-zinc-400 text-xs truncate">{desc}</p>
          <span className="text-xs font-semibold text-sky-400 shrink-0">
            {progress}%
          </span>
        </div>
        <Progress
          color="primary"
          size="sm"
          classNames={{ track: "bg-zinc-700 rounded-full" }}
          value={Number(progress)}
          aria-label="progress"
          showValueLabel={false}
        />
      </div>
    </li>
  );
};

export default SkillCard;
