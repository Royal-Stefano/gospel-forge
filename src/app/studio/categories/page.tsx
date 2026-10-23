"use client";

import React from "react";
import { Tag, BookOpen, Plus } from "lucide-react";

export default function StudioCategoriesTopicsPage() {
  const topics = [
    { name: "Faith & Spiritual Resilience", type: "topic", episodesCount: 18 },
    { name: "Kingdom Discipleship", type: "topic", episodesCount: 14 },
    { name: "Christian Worldview", type: "topic", episodesCount: 10 },
    { name: "Romans 8:28", type: "scripture", episodesCount: 5 },
    { name: "James 1:2-4", type: "scripture", episodesCount: 4 },
    { name: "Isaiah 48:10", type: "scripture", episodesCount: 3 },
    { name: "Youth & Boldness", type: "topic", episodesCount: 9 },
    { name: "Prayer & Intercession", type: "topic", episodesCount: 11 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-extrabold text-white tracking-wide">
            Topics & Scripture Anchors
          </h1>
          <p className="text-sm text-[#a5a6af] mt-1 font-body">
            Taxonomy and biblical indexes used across the public discovery engine.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ff4500] text-black font-heading font-bold text-xs uppercase tracking-wider">
          <Plus className="w-4 h-4" />
          <span>Add Tag</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topics.map((t) => (
          <div
            key={t.name}
            className="p-5 rounded-2xl bg-[#111113] border border-[#222123] flex items-center justify-between"
          >
            <div>
              <span className="text-[10px] font-mono uppercase text-[#ffb13b]">
                {t.type}
              </span>
              <h3 className="text-sm font-bold text-white mt-0.5">{t.name}</h3>
              <p className="text-[11px] text-[#6e6f77] font-mono mt-1">
                {t.episodesCount} episodes
              </p>
            </div>
            {t.type === "scripture" ? (
              <BookOpen className="w-5 h-5 text-[#ff4500]" />
            ) : (
              <Tag className="w-5 h-5 text-[#a5a6af]" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
