import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'porto',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

let isInitialized = false;

export async function initDb() {
  if (isInitialized) return;

  try {
    const connection = await pool.getConnection();

    try {
      // 1. Users table
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(100) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(150) DEFAULT 'Admin',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Seed default admin if empty
      const [existingUsers] = await connection.query(`SELECT id FROM users LIMIT 1`);
      if (existingUsers.length === 0) {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        await connection.query(
          `INSERT INTO users (username, password, name) VALUES (?, ?, ?)`,
          ['admin', hashedPassword, 'Dhiya Ulhaq']
        );
      }

      // 2. Hero settings
      await connection.query(`
        CREATE TABLE IF NOT EXISTS hero_settings (
          id INT PRIMARY KEY,
          available_text VARCHAR(255) DEFAULT 'Available for work',
          title_prefix VARCHAR(255) DEFAULT 'Hello, My Name',
          title_name VARCHAR(255) DEFAULT 'is Dhiya Ulhaq,',
          title_role VARCHAR(255) DEFAULT 'Software Developer',
          cv_label VARCHAR(100) DEFAULT 'Download CV',
          cv_url TEXT,
          connect_label VARCHAR(100) DEFAULT 'Connect to Me',
          connect_link TEXT,
          banner_img TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      const [existingHero] = await connection.query(`SELECT id FROM hero_settings WHERE id = 1`);
      if (existingHero.length === 0) {
        await connection.query(`
          INSERT INTO hero_settings 
          (id, available_text, title_prefix, title_name, title_role, cv_label, cv_url, connect_label, connect_link, banner_img)
          VALUES 
          (1, 'Available for work', 'Hello, My Name', 'is Dhiya Ulhaq,', 'Software Developer', 'Download CV', 'https://drive.google.com/file/d/1UScmjE3fVCfuYrAn2zqOCuxV65H-qsMx/view?usp=drive_link', 'Connect to Me', 'https://www.linkedin.com/in/dhiyaulhaq100', '')
        `);
      }

      // 3. Tech Stacks
      await connection.query(`
        CREATE TABLE IF NOT EXISTS tech_stacks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          category VARCHAR(100) NOT NULL,
          label VARCHAR(100) NOT NULL,
          desc_text VARCHAR(150) DEFAULT '',
          img_src TEXT NOT NULL,
          progress INT DEFAULT 50,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      const [existingTech] = await connection.query(`SELECT id FROM tech_stacks LIMIT 1`);
      if (existingTech.length === 0) {
        const defaultTechs = [
          // Programming Language
          ['Programming Language', 'JavaScript', 'Programming Language', '/images/javascript.svg', 52, 1],
          ['Programming Language', 'PHP', 'Programming Language', '/images/php.svg', 45, 2],
          ['Programming Language', 'C++', 'Programming Language', '/images/cpp.svg', 40, 3],
          ['Programming Language', 'C', 'Programming Language', '/images/c.png', 38, 4],
          ['Programming Language', 'Dart', 'Programming Language', '/images/dart.svg', 35, 5],
          ['Programming Language', 'Python', 'Programming Language', '/images/python.svg', 30, 6],

          // Framework & Library
          ['Framework & Library', 'Flutter', 'Framework', '/images/flutter.svg', 40, 7],
          ['Framework & Library', 'React Js', 'Library', '/images/react.svg', 40, 8],
          ['Framework & Library', 'Next Js', 'Library', '/images/nextjs.svg', 40, 9],
          ['Framework & Library', 'Laravel', 'Framework', '/images/laravel.png', 40, 10],
          ['Framework & Library', 'Bootstrap', 'Framework', '/images/bootstrap.png', 30, 11],
          ['Framework & Library', 'jQuery', 'Library', '/images/jquery.jpeg', 28, 12],
          ['Framework & Library', 'Flask', 'Framework', '/images/flask.png', 25, 13],

          // Markup & Styling
          ['Markup & Styling', 'HTML', 'Markup Language', '/images/html.png', 50, 14],
          ['Markup & Styling', 'CSS', 'Styling Language', '/images/css.png', 45, 15],
          ['Markup & Styling', 'TailwindCSS', 'CSS Framework', '/images/tailwindcss.svg', 27, 16],

          // Database
          ['Database', 'MySQL', 'Relational Database', '/images/mysql.png', 35, 17],
          ['Database', 'Firebase', 'BaaS / Realtime DB', '/images/firebase.png', 30, 18],
          ['Database', 'Supabase', 'BaaS / PostgreSQL', '/images/supabase.svg', 25, 19],
          ['Database', 'Prisma ORM', 'Database ORM', '/images/prisma.svg', 30, 20],

          // UI/UX & Multimedia
          ['UI/UX & Multimedia', 'Figma', 'UI/UX Design Tool', '/images/figma.jpg', 35, 21],
          ['UI/UX & Multimedia', 'Capcut', 'Video Editing', '/images/capcut.png', 30, 22],
          ['UI/UX & Multimedia', 'Canva', 'Graphic Design', '/images/canva.png', 30, 23],
          ['UI/UX & Multimedia', 'Adobe Premiere Pro', 'Video Editing', '/images/premiere.png', 25, 24],

          // Package Manager
          ['Package Manager', 'Node Package Manager (npm)', 'Package Manager', '/images/npm.svg', 28, 25],
          ['Package Manager', 'pip', 'Python Package Manager', '/images/python.svg', 30, 26],
          ['Package Manager', 'Pub', 'Dart/Flutter Package Manager', '/images/flutter.svg', 30, 27],
        ];

        for (const item of defaultTechs) {
          await connection.query(
            `INSERT INTO tech_stacks (category, label, desc_text, img_src, progress, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
            item
          );
        }
      }

      // 4. Projects (Portfolio highlight)
      await connection.query(`
        CREATE TABLE IF NOT EXISTS projects (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          category VARCHAR(100) DEFAULT 'Project',
          tags VARCHAR(255) DEFAULT '',
          img_src TEXT NOT NULL,
          project_link TEXT NOT NULL,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      const [existingProjects] = await connection.query(`SELECT id FROM projects LIMIT 1`);
      if (existingProjects.length === 0) {
        const defaultProjects = [
          ['My Hiking App', 'Mobile App', 'Flutter, API, Booking App', '/images/projects/project2.png', 'https://ulhaqjackyhaw.github.io/myhikinglanding/', 1],
          ['My Hiking Admin Web', 'Web Admin', 'Web Admin, API, Management', '/images/projects/project1.png', 'https://github.com/ulhaqjackyhaw/myhiking-backend-api', 2],
          ['Pill Inspector AI | General Detection', 'AI / ML', 'Flask, Machine Learning, API', '/images/projects/project3.png', 'https://github.com/ulhaqjackyhaw/Pill-InsectorAI', 3],
          ['Fire Detection Monitoring', 'IoT & Mobile', 'Mobile App, API, IOT', '/images/projects/cooming.png', 'https://github.com/ulhaqjackyhaw/FireDetectionMonitoring', 4],
          ['Sistem Presensi Siswa', 'Web Application', 'Laravel, Yolo', '/images/projects/project5.png', 'https://github.com/ulhaqjackyhaw/Sistem-Presensi-Siswa', 5],
        ];

        for (const p of defaultProjects) {
          await connection.query(
            `INSERT INTO projects (title, category, tags, img_src, project_link, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
            p
          );
        }
      }

      // 5. Certificates
      await connection.query(`
        CREATE TABLE IF NOT EXISTS certificates (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          img_src TEXT NOT NULL,
          link TEXT,
          sort_order INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      const [existingCerts] = await connection.query(`SELECT id FROM certificates LIMIT 1`);
      if (existingCerts.length === 0) {
        const defaultCerts = [
          ['Cloud & Gen AI di AWS', '/images/certificates/1.png', '#', 1],
          ['Pemrograman JavaScript', '/images/certificates/2.png', '#', 2],
          ['Database Design', '/images/certificates/4.png', '#', 3],
          ['Database Pemrograman with SQL', '/images/certificates/3.png', '#', 4],
        ];

        for (const c of defaultCerts) {
          await connection.query(
            `INSERT INTO certificates (title, img_src, link, sort_order) VALUES (?, ?, ?, ?)`,
            c
          );
        }
      }

      // 6. Contacts (GitHub, LinkedIn, Instagram, etc.)
      await connection.query(`
        CREATE TABLE IF NOT EXISTS contacts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          platform VARCHAR(50) NOT NULL,
          label VARCHAR(100) NOT NULL,
          href TEXT NOT NULL,
          sort_order INT DEFAULT 0,
          is_active TINYINT(1) DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      const [existingContacts] = await connection.query(`SELECT id FROM contacts LIMIT 1`);
      if (existingContacts.length === 0) {
        const defaultContacts = [
          ['github', 'GitHub', 'https://github.com/ulhaqjackyhaw', 1],
          ['linkedin', 'LinkedIn', 'https://www.linkedin.com/in/dhiyaulhaq100', 2],
          ['instagram', 'Instagram', 'https://www.instagram.com/dhy_lhq', 3],
        ];

        for (const c of defaultContacts) {
          await connection.query(
            `INSERT INTO contacts (platform, label, href, sort_order) VALUES (?, ?, ?, ?)`,
            c
          );
        }
      }

      // 7. Collaboration text setting
      await connection.query(`
        CREATE TABLE IF NOT EXISTS collaboration_settings (
          id INT PRIMARY KEY,
          title VARCHAR(255) DEFAULT 'Contact me for collaboration',
          description TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      const [existingCollab] = await connection.query(`SELECT id FROM collaboration_settings WHERE id = 1`);
      if (existingCollab.length === 0) {
        await connection.query(`
          INSERT INTO collaboration_settings (id, title, description)
          VALUES (1, 'Contact me for collaboration', 'I am always open to learning and collaborating on challenging projects!')
        `);
      }

      isInitialized = true;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error during initDb:', err);
    throw err;
  }
}

export default pool;
