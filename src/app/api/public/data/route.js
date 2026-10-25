import { NextResponse } from 'next/server';
import pool, { initDb } from '@/libs/db';

export const revalidate = 0; // Dynamic, always fresh

export async function GET() {
  try {
    await initDb();

    const [heroRows] = await pool.query(`SELECT * FROM hero_settings WHERE id = 1 LIMIT 1`);
    const [techRows] = await pool.query(`SELECT * FROM tech_stacks ORDER BY sort_order ASC, id ASC`);
    const [projectRows] = await pool.query(`SELECT * FROM projects ORDER BY sort_order ASC, id ASC`);
    const [certRows] = await pool.query(`SELECT * FROM certificates ORDER BY sort_order ASC, id ASC`);
    const [contactRows] = await pool.query(`SELECT * FROM contacts WHERE is_active = 1 ORDER BY sort_order ASC, id ASC`);
    const [collabRows] = await pool.query(`SELECT * FROM collaboration_settings WHERE id = 1 LIMIT 1`);

    // Group tech stacks by category
    const groupedTech = {};
    for (const item of techRows) {
      if (!groupedTech[item.category]) {
        groupedTech[item.category] = [];
      }
      groupedTech[item.category].push({
        id: item.id,
        imgSrc: item.img_src,
        label: item.label,
        desc: item.desc_text,
        progress: String(item.progress),
      });
    }

    const techStackList = Object.keys(groupedTech).map((category) => ({
      title: category,
      items: groupedTech[category],
    }));

    return NextResponse.json({
      hero: heroRows[0] || null,
      techStacks: techStackList,
      rawTechStacks: techRows,
      projects: projectRows.map((p) => ({
        id: p.id,
        type: 'image',
        imgSrc: p.img_src,
        title: p.title,
        tags: p.tags ? p.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        projectLink: p.project_link,
      })),
      certificates: certRows.map((c) => ({
        id: c.id,
        name: c.title,
        imgSrc: c.img_src,
        link: c.link || '#',
      })),
      contacts: contactRows,
      collaboration: collabRows[0] || null,
    });
  } catch (err) {
    console.error('Error fetching public portfolio data:', err);
    return NextResponse.json({ error: 'Failed to fetch portfolio data' }, { status: 500 });
  }
}
