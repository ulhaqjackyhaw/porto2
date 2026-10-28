'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageCropModal from '@/components/ImageCropModal';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Image Cropper Modal State
  const [cropModal, setCropModal] = useState({
    open: false,
    imageSrc: '',
    fileName: '',
    defaultAspect: 16 / 9,
    title: 'Potong & Sesuaikan Gambar',
    onCropAndUpload: null,
  });

  // Data states
  const [hero, setHero] = useState({
    available_text: '',
    title_prefix: '',
    title_name: '',
    title_role: '',
    cv_label: '',
    cv_url: '',
    connect_label: '',
    connect_link: '',
    banner_img: '',
    about_text: '',
  });

  const [techStacks, setTechStacks] = useState([]);
  const [techCategoryFilter, setTechCategoryFilter] = useState('All');
  const [techModal, setTechModal] = useState({ open: false, isEdit: false, item: null });
  const [techForm, setTechForm] = useState({
    id: null,
    category: 'Programming Language',
    label: '',
    desc_text: '',
    img_src: '',
    progress: 50,
  });

  const [projects, setProjects] = useState([]);
  const [projectModal, setProjectModal] = useState({ open: false, isEdit: false, item: null });
  const [projectForm, setProjectForm] = useState({
    id: null,
    title: '',
    category: 'Mobile App',
    tags: '',
    img_src: '',
    project_link: '',
  });

  const [certificates, setCertificates] = useState([]);
  const [certModal, setCertModal] = useState({ open: false, isEdit: false, item: null });
  const [certForm, setCertForm] = useState({
    id: null,
    title: '',
    img_src: '',
    link: '#',
  });

  const [contacts, setContacts] = useState([]);
  const [collab, setCollab] = useState({
    title: 'Contact me for collaboration',
    description: '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // Check auth and fetch data
  const loadAllData = async () => {
    try {
      setLoading(true);
      // 1. Auth check
      const authRes = await fetch('/api/auth/me');
      if (!authRes.ok) {
        router.push('/login');
        return;
      }

      // 2. Load hero
      const heroRes = await fetch('/api/hero');
      if (heroRes.ok) setHero(await heroRes.json());

      // 3. Load tech stack
      const techRes = await fetch('/api/tech-stack');
      if (techRes.ok) setTechStacks(await techRes.json());

      // 4. Load projects
      const projRes = await fetch('/api/projects');
      if (projRes.ok) setProjects(await projRes.json());

      // 5. Load certificates
      const certRes = await fetch('/api/certificates');
      if (certRes.ok) setCertificates(await certRes.json());

      // 6. Load contacts
      const contactRes = await fetch('/api/contacts');
      if (contactRes.ok) setContacts(await contactRes.json());

      // 7. Load collaboration
      const collabRes = await fetch('/api/collaboration');
      if (collabRes.ok) setCollab(await collabRes.json());
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      showToast('Gagal memuat data dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // Upload helper for generic files (like PDF / CV)
  const uploadDirectFile = async (file, onUploaded) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingImage(true);
      showToast('Mengunggah file...', 'info');
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload gagal');

      onUploaded(data.url);
      showToast(`Berhasil upload: ${file.name}`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileUpload = async (e, onUploaded) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadDirectFile(file, onUploaded);
  };

  // Helper when selecting image to open the crop modal
  const handleSelectImageForCrop = (e, { defaultAspect = 16 / 9, title = 'Potong Gambar', onUploaded }) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Mohon pilih file gambar yang valid (JPG, PNG, WEBP)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setCropModal({
        open: true,
        imageSrc: reader.result,
        fileName: file.name,
        defaultAspect,
        title,
        onCropAndUpload: async (croppedBlob, croppedFile) => {
          await uploadDirectFile(croppedFile, onUploaded);
        },
      });
    };
    reader.readAsDataURL(file);

    // Reset input value to allow selecting same file again
    e.target.value = '';
  };

  // 1. Hero save
  const handleSaveHero = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hero),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');
      setHero(data.data);
      showToast('Pengaturan Hero & CV berhasil disimpan!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // 2. Tech stack CRUD
  const defaultCategories = [
    'Programming Language',
    'Framework & Library',
    'Markup & Styling',
    'Database',
    'UI/UX & Multimedia',
    'Package Manager',
  ];

  const handleSaveTech = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isEdit = techModal.isEdit;
      const url = isEdit ? `/api/tech-stack/${techForm.id}` : '/api/tech-stack';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(techForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');

      showToast(isEdit ? 'Tech stack berhasil diperbarui!' : 'Tech stack baru berhasil ditambahkan!');
      setTechModal({ open: false, isEdit: false, item: null });
      const refRes = await fetch('/api/tech-stack');
      if (refRes.ok) setTechStacks(await refRes.json());
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTech = async (id, name) => {
    if (!confirm(`Hapus tech stack "${name}"?`)) return;
    try {
      const res = await fetch(`/api/tech-stack/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus');
      setTechStacks(techStacks.filter((t) => t.id !== id));
      showToast(`"${name}" berhasil dihapus`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // 3. Projects CRUD
  const handleSaveProject = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isEdit = projectModal.isEdit;
      const url = isEdit ? `/api/projects/${projectForm.id}` : '/api/projects';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');

      showToast(isEdit ? 'Project berhasil diperbarui!' : 'Project baru berhasil ditambahkan!');
      setProjectModal({ open: false, isEdit: false, item: null });
      const refRes = await fetch('/api/projects');
      if (refRes.ok) setProjects(await refRes.json());
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (id, title) => {
    if (!confirm(`Hapus project "${title}"?`)) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus');
      setProjects(projects.filter((p) => p.id !== id));
      showToast(`Project "${title}" berhasil dihapus`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // 4. Certificate CRUD
  const handleSaveCertificate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isEdit = certModal.isEdit;
      const url = isEdit ? `/api/certificates/${certForm.id}` : '/api/certificates';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(certForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');

      showToast(isEdit ? 'Sertifikat berhasil diperbarui!' : 'Sertifikat baru berhasil ditambahkan!');
      setCertModal({ open: false, isEdit: false, item: null });
      const refRes = await fetch('/api/certificates');
      if (refRes.ok) setCertificates(await refRes.json());
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCert = async (id, title) => {
    if (!confirm(`Hapus sertifikat "${title}"?`)) return;
    try {
      const res = await fetch(`/api/certificates/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus');
      setCertificates(certificates.filter((c) => c.id !== id));
      showToast(`Sertifikat "${title}" berhasil dihapus`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // 5. Contacts & Collaboration
  const handleUpdateContact = async (id, updatedFields) => {
    try {
      const res = await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal update contact');

      setContacts(contacts.map((c) => (c.id === id ? data.data : c)));
      showToast('Link kontak diperbarui!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveCollab = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/collaboration', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(collab),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal update');
      showToast('Teks kolaborasi berhasil disimpan!');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400 gap-3">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Memuat Dashboard Portfolio...</p>
      </div>
    );
  }

  const filteredTech = techCategoryFilter === 'All'
    ? techStacks
    : techStacks.filter((t) => t.category === techCategoryFilter);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Toast notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-medium border ${
            toast.type === 'error'
              ? 'bg-red-950/90 border-red-500/50 text-red-200'
              : toast.type === 'info'
              ? 'bg-sky-950/90 border-sky-500/50 text-sky-200'
              : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
          }`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-sky-500/30">
              DU
            </div>
            <div>
              <h1 className="font-bold text-base text-zinc-100 leading-tight">Admin Dashboard</h1>
              <p className="text-xs text-zinc-400">Portfolio Content Management System</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors"
            >
              <span>Lihat Web Portofolio</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-xs font-medium text-red-400 border border-red-500/20 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-zinc-800 scrollbar-none">
          {[
            { id: 'hero', label: '📄 Hero, Foto & About', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { id: 'tech', label: '⚡ Tech Stack', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { id: 'projects', label: '🚀 My Portfolio Highlights', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
            { id: 'certs', label: '🎓 Certificate', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
            { id: 'collab', label: '💬 Contact & Collaboration', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={tab.icon} />
              </svg>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: HERO & CV / CONNECT */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-2">Pengaturan Hero, Foto Profil & About Me</h2>
              <p className="text-sm text-zinc-400 mb-6">
                Ubah foto profil utama, teks biodata About Me, menu Download CV, dan link tombol Connect to Me.
              </p>

              <form onSubmit={handleSaveHero} className="space-y-6">
                {/* CV Section */}
                <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sky-400 text-base flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Pengaturan Download CV
                    </h3>
                    {hero.cv_url && (
                      <a
                        href={hero.cv_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-sky-400 hover:underline flex items-center gap-1"
                      >
                        <span>Cek / Unduh CV saat ini</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Label Tombol CV
                      </label>
                      <input
                        type="text"
                        value={hero.cv_label || 'Download CV'}
                        onChange={(e) => setHero({ ...hero, cv_label: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                        placeholder="Download CV"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Ganti File CV (Upload File PDF / DOCX)
                      </label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => uploadDirectFile(e.target.files?.[0], (url) => setHero((prev) => ({ ...prev, cv_url: url })))}
                        className="w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-sky-500/20 file:text-sky-300 hover:file:bg-sky-500/30 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      URL Link File CV (Bisa link upload lokal atau Google Drive)
                    </label>
                    <input
                      type="text"
                      value={hero.cv_url || ''}
                      onChange={(e) => setHero({ ...hero, cv_url: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm font-mono"
                      placeholder="https://drive.google.com/... atau /uploads/cv.pdf"
                    />
                  </div>
                </div>

                {/* Connect Me Section */}
                <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
                  <h3 className="font-semibold text-sky-400 text-base flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Pengaturan Menu Connect to Me
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Label Tombol Connect
                      </label>
                      <input
                        type="text"
                        value={hero.connect_label || 'Connect to Me'}
                        onChange={(e) => setHero({ ...hero, connect_label: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                        placeholder="Connect to Me"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        URL Link Connect (LinkedIn / WhatsApp / etc.)
                      </label>
                      <input
                        type="text"
                        value={hero.connect_link || ''}
                        onChange={(e) => setHero({ ...hero, connect_link: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm font-mono"
                        placeholder="https://www.linkedin.com/in/dhiyaulhaq100"
                      />
                    </div>
                  </div>
                </div>

                {/* Hero Headlines */}
                <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
                  <h3 className="font-semibold text-zinc-200 text-base">Teks Utama Hero</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">Badge Status</label>
                      <input
                        type="text"
                        value={hero.available_text || ''}
                        onChange={(e) => setHero({ ...hero, available_text: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                        placeholder="Available for work"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">Nama</label>
                      <input
                        type="text"
                        value={hero.title_name || ''}
                        onChange={(e) => setHero({ ...hero, title_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                        placeholder="is Dhiya Ulhaq,"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">Role / Profesi</label>
                      <input
                        type="text"
                        value={hero.title_role || ''}
                        onChange={(e) => setHero({ ...hero, title_role: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                        placeholder="Software Developer"
                      />
                    </div>
                  </div>
                </div>

                {/* Foto Profil / Banner Section */}
                <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
                  <h3 className="font-semibold text-sky-400 text-base flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Ganti Foto Profil / Banner Utama
                  </h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-24 h-28 rounded-2xl bg-zinc-800 border border-zinc-700 overflow-hidden shrink-0 flex items-center justify-center bg-gradient-to-t from-sky-400/30 to-zinc-800">
                      <img
                        src={hero.banner_img || '/images/Ulhaq.png'}
                        alt="Preview Foto"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/Ulhaq.png';
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      <label className="block text-xs font-medium text-zinc-300">
                        Upload & Potong Foto Baru (Disarankan Rasio 1:1 atau Bebas)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleSelectImageForCrop(e, {
                            defaultAspect: 1,
                            title: 'Potong & Sesuaikan Foto Profil / Banner (1:1 / Bebas)',
                            onUploaded: (url) => setHero((prev) => ({ ...prev, banner_img: url })),
                          })
                        }
                        className="w-full text-xs text-zinc-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-sky-500/20 file:text-sky-300 hover:file:bg-sky-500/30 cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={hero.banner_img || ''}
                          onChange={(e) => setHero((prev) => ({ ...prev, banner_img: e.target.value }))}
                          placeholder="/images/Ulhaq.png atau /uploads/..."
                          className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-xs font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setHero((prev) => ({ ...prev, banner_img: '/images/Ulhaq.png' }))}
                          className="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-800 border border-zinc-700 rounded-lg whitespace-nowrap"
                        >
                          Reset Default
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* About Me Bio Text Section */}
                <div className="p-5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-4">
                  <h3 className="font-semibold text-sky-400 text-base flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Teks Deskripsi / Biodata About Me
                  </h3>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">
                      Paragraf Biodata & Pengenalan Diri
                    </label>
                    <textarea
                      rows="5"
                      value={hero.about_text || ''}
                      onChange={(e) => setHero({ ...hero, about_text: e.target.value })}
                      placeholder="👋 Hello!, I am Dhiya Ulhaq, Third-year Informatics Engineering student..."
                      className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm resize-y leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-medium rounded-xl shadow-lg shadow-sky-500/20 transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: TECH STACK */}
        {activeTab === 'tech' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">CRUD Tech Stack</h2>
                <p className="text-sm text-zinc-400">
                  Kelola nama, logo icon, kategori, dan pengaturan persentase keahlian.
                </p>
              </div>
              <button
                onClick={() => {
                  setTechForm({
                    id: null,
                    category: techCategoryFilter !== 'All' ? techCategoryFilter : 'Programming Language',
                    label: '',
                    desc_text: 'Programming Language',
                    img_src: '',
                    progress: 50,
                  });
                  setTechModal({ open: true, isEdit: false, item: null });
                }}
                className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-medium rounded-xl shadow-lg shadow-sky-500/20 text-sm flex items-center gap-2 self-start"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Tambah Tech Stack Baru</span>
              </button>
            </div>

            {/* Category Filter Badges */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {['All', ...defaultCategories].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTechCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    techCategoryFilter === cat
                      ? 'bg-zinc-200 text-zinc-950 font-semibold'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {cat} {cat === 'All' ? `(${techStacks.length})` : `(${techStacks.filter((t) => t.category === cat).length})`}
                </button>
              ))}
            </div>

            {/* Tech Stack Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTech.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-lg bg-zinc-800/80 p-2 flex items-center justify-center shrink-0 border border-zinc-700/50">
                        {item.img_src ? (
                          <img
                            src={item.img_src}
                            alt={item.label}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/images/logo.svg';
                            }}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <span className="text-xs text-zinc-500">Logo</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm">{item.label}</h3>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setTechForm({
                            id: item.id,
                            category: item.category,
                            label: item.label,
                            desc_text: item.desc_text,
                            img_src: item.img_src,
                            progress: item.progress,
                          });
                          setTechModal({ open: true, isEdit: true, item });
                        }}
                        className="p-1.5 text-zinc-400 hover:text-sky-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTech(item.id, item.label)}
                        className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Progress bar visual */}
                  <div className="space-y-1.5 pt-2 border-t border-zinc-800/60">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-400">{item.desc_text || 'Skill'}</span>
                      <span className="font-semibold text-sky-400">{item.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Add/Edit Tech Stack */}
            {techModal.open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-5">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">
                      {techModal.isEdit ? 'Edit Tech Stack' : 'Tambah Tech Stack Baru'}
                    </h3>
                    <button
                      onClick={() => setTechModal({ open: false, isEdit: false, item: null })}
                      className="text-zinc-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveTech} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Kategori Tech Stack
                      </label>
                      <select
                        value={techForm.category}
                        onChange={(e) => setTechForm({ ...techForm, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                      >
                        {defaultCategories.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Nama / Label Teknologi
                      </label>
                      <input
                        type="text"
                        required
                        value={techForm.label}
                        onChange={(e) => setTechForm({ ...techForm, label: e.target.value })}
                        placeholder="Contoh: Flutter, React Js, Go, Docker"
                        className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Deskripsi Singkat
                      </label>
                      <input
                        type="text"
                        value={techForm.desc_text}
                        onChange={(e) => setTechForm({ ...techForm, desc_text: e.target.value })}
                        placeholder="Contoh: Framework, Programming Language, Library"
                        className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                      />
                    </div>

                    {/* Logo upload & preview */}
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Logo Icon (Upload & Potong Gambar atau Masukkan URL/Path)
                      </label>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-lg bg-zinc-800 border border-zinc-700 p-2 flex items-center justify-center shrink-0">
                          {techForm.img_src ? (
                            <img
                              src={techForm.img_src}
                              alt="Preview"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/images/logo.svg';
                              }}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <span className="text-[10px] text-zinc-500">Preview</span>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*,.svg"
                          onChange={(e) =>
                            handleSelectImageForCrop(e, {
                              defaultAspect: 1,
                              title: 'Potong & Sesuaikan Logo Tech Stack (1:1 / Persegi)',
                              onUploaded: (url) => setTechForm((prev) => ({ ...prev, img_src: url })),
                            })
                          }
                          className="w-full text-xs text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-sky-500/20 file:text-sky-300 hover:file:bg-sky-500/30 cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        required
                        value={techForm.img_src}
                        onChange={(e) => setTechForm((prev) => ({ ...prev, img_src: e.target.value }))}
                        placeholder="/images/flutter.svg atau /uploads/... atau https://..."
                        className="w-full px-3.5 py-2 bg-zinc-800/80 border border-zinc-700 rounded-lg text-white text-xs font-mono"
                      />
                    </div>

                    {/* Percentage slider */}
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-medium text-zinc-300">
                          Pengaturan Persentase Keahlian
                        </label>
                        <span className="font-bold text-sm text-sky-400 font-mono">
                          {techForm.progress}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={techForm.progress}
                        onChange={(e) => setTechForm({ ...techForm, progress: Number(e.target.value) })}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setTechModal({ open: false, isEdit: false, item: null })}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-white font-medium text-sm rounded-lg shadow-md shadow-sky-500/20 disabled:opacity-50"
                      >
                        {saving ? 'Menyimpan...' : 'Simpan Tech Stack'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PORTFOLIO HIGHLIGHTS */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">CRUD My Portfolio Highlights</h2>
                <p className="text-sm text-zinc-400">
                  Kelola judul porto, category (misal Flutter, API, mobile), tags, gambar cover, dan link tujuan.
                </p>
              </div>
              <button
                onClick={() => {
                  setProjectForm({
                    id: null,
                    title: '',
                    category: 'Mobile App',
                    tags: 'Flutter, API',
                    img_src: '',
                    project_link: '',
                  });
                  setProjectModal({ open: true, isEdit: false, item: null });
                }}
                className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-medium rounded-xl shadow-lg shadow-sky-500/20 text-sm flex items-center gap-2 self-start"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Tambah Highlight Project</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col group hover:border-zinc-700 transition-all"
                >
                  <div className="aspect-video w-full bg-zinc-800 relative overflow-hidden">
                    {proj.img_src ? (
                      <img
                        src={proj.img_src}
                        alt={proj.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/projects/project1.png';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                        Tidak ada gambar
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-950/80 backdrop-blur-md text-sky-400 border border-zinc-800">
                      {proj.category || 'Project'}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-white text-base mb-2">{proj.title}</h3>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {proj.tags?.split(',').map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700/50"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                      <a
                        href={proj.project_link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-mono truncate max-w-[180px]"
                      >
                        <span>Link Project</span>
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setProjectForm({
                              id: proj.id,
                              title: proj.title,
                              category: proj.category,
                              tags: proj.tags,
                              img_src: proj.img_src,
                              project_link: proj.project_link,
                            });
                            setProjectModal({ open: true, isEdit: true, item: proj });
                          }}
                          className="p-1.5 text-zinc-400 hover:text-sky-400 hover:bg-zinc-800 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteProject(proj.id, proj.title)}
                          className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Add/Edit Project */}
            {projectModal.open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">
                      {projectModal.isEdit ? 'Edit Portfolio Project' : 'Tambah Highlight Project Baru'}
                    </h3>
                    <button
                      onClick={() => setProjectModal({ open: false, isEdit: false, item: null })}
                      className="text-zinc-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveProject} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Judul Project
                      </label>
                      <input
                        type="text"
                        required
                        value={projectForm.title}
                        onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                        placeholder="Contoh: My Hiking App"
                        className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1">
                          Category
                        </label>
                        <input
                          type="text"
                          value={projectForm.category}
                          onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                          placeholder="Flutter / Mobile / Web Admin / AI"
                          className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-zinc-300 mb-1">
                          Tags (Pisahkan dengan koma)
                        </label>
                        <input
                          type="text"
                          value={projectForm.tags}
                          onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                          placeholder="Flutter, API, Booking App"
                          className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                        />
                      </div>
                    </div>

                    {/* Image upload with crop */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-medium text-zinc-300">
                          Gambar Cover Project (Upload & Crop Otomatis)
                        </label>
                        <span className="text-[11px] text-sky-400 font-medium">Rasio 16:9</span>
                      </div>

                      <div className="p-3 bg-zinc-800/60 rounded-xl border border-zinc-700/70 space-y-3 mb-2">
                        {projectForm.img_src ? (
                          <div className="relative aspect-video w-full rounded-lg bg-zinc-900 border border-zinc-700 overflow-hidden group">
                            <img
                              src={projectForm.img_src}
                              alt="Preview"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/images/projects/project1.png';
                              }}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <span className="text-xs text-white bg-zinc-900/80 px-2.5 py-1 rounded-md">
                                Tampilan Cover 16:9
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-video w-full rounded-lg bg-zinc-900/80 border border-dashed border-zinc-700 flex flex-col items-center justify-center text-zinc-500 gap-1.5 p-4">
                            <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs">Belum ada gambar cover yang dipilih</span>
                          </div>
                        )}

                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">
                            Pilih file gambar dari komputer (JPG, PNG, WEBP) untuk dipotong & di-crop:
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleSelectImageForCrop(e, {
                                defaultAspect: 16 / 9,
                                title: 'Potong & Sesuaikan Cover Highlight Project (16:9)',
                                onUploaded: (url) => setProjectForm((prev) => ({ ...prev, img_src: url })),
                              })
                            }
                            className="w-full text-xs text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-sky-500/20 file:text-sky-300 hover:file:bg-sky-500/30 cursor-pointer"
                          />
                        </div>
                      </div>

                      <input
                        type="text"
                        required
                        value={projectForm.img_src}
                        onChange={(e) => setProjectForm((prev) => ({ ...prev, img_src: e.target.value }))}
                        placeholder="/images/projects/project1.png atau /uploads/..."
                        className="w-full px-3.5 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Link Menuju Project (GitHub / Live Demo)
                      </label>
                      <input
                        type="text"
                        required
                        value={projectForm.project_link}
                        onChange={(e) => setProjectForm({ ...projectForm, project_link: e.target.value })}
                        placeholder="https://github.com/..."
                        className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm font-mono"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setProjectModal({ open: false, isEdit: false, item: null })}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={saving || uploadingImage}
                        className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-white font-medium text-sm rounded-lg shadow-md shadow-sky-500/20 disabled:opacity-50"
                      >
                        {saving ? 'Menyimpan...' : uploadingImage ? 'Mengunggah...' : 'Simpan Project'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CERTIFICATES */}
        {activeTab === 'certs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">CRUD Certificate</h2>
                <p className="text-sm text-zinc-400">
                  Kelola judul sertifikat, gambar sertifikat, dan link tujuan verifikasi.
                </p>
              </div>
              <button
                onClick={() => {
                  setCertForm({
                    id: null,
                    title: '',
                    img_src: '',
                    link: '#',
                  });
                  setCertModal({ open: true, isEdit: false, item: null });
                }}
                className="px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-medium rounded-xl shadow-lg shadow-sky-500/20 text-sm flex items-center gap-2 self-start"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Tambah Certificate Baru</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col hover:border-zinc-700 transition-all"
                >
                  <div className="aspect-[16/10] w-full bg-zinc-800 relative overflow-hidden">
                    {cert.img_src ? (
                      <img
                        src={cert.img_src}
                        alt={cert.title}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/certificates/1.png';
                        }}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                        Tidak ada gambar
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm">{cert.title}</h3>
                      {cert.link && cert.link !== '#' && (
                        <a
                          href={cert.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-sky-400 hover:underline"
                        >
                          Verifikasi Sertifikat ↗
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setCertForm({
                            id: cert.id,
                            title: cert.title,
                            img_src: cert.img_src,
                            link: cert.link || '#',
                          });
                          setCertModal({ open: true, isEdit: true, item: cert });
                        }}
                        className="p-1.5 text-zinc-400 hover:text-sky-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteCert(cert.id, cert.title)}
                        className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Add/Edit Certificate */}
            {certModal.open && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white">
                      {certModal.isEdit ? 'Edit Certificate' : 'Tambah Certificate Baru'}
                    </h3>
                    <button
                      onClick={() => setCertModal({ open: false, isEdit: false, item: null })}
                      className="text-zinc-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleSaveCertificate} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Judul Sertifikat
                      </label>
                      <input
                        type="text"
                        required
                        value={certForm.title}
                        onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                        placeholder="Contoh: Cloud & Gen AI di AWS"
                        className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                      />
                    </div>

                    {/* Image upload with crop */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-xs font-medium text-zinc-300">
                          Gambar Sertifikat (Upload & Crop Otomatis)
                        </label>
                        <span className="text-[11px] text-sky-400 font-medium">Rasio 16:10 / 4:3</span>
                      </div>

                      <div className="p-3 bg-zinc-800/60 rounded-xl border border-zinc-700/70 space-y-3 mb-2">
                        {certForm.img_src ? (
                          <div className="relative aspect-[16/10] w-full rounded-lg bg-zinc-900 border border-zinc-700 overflow-hidden group">
                            <img
                              src={certForm.img_src}
                              alt="Preview Sertifikat"
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/images/certificates/1.png';
                              }}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <span className="text-xs text-white bg-zinc-900/80 px-2.5 py-1 rounded-md">
                                Tampilan Sertifikat 16:10
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-[16/10] w-full rounded-lg bg-zinc-900/80 border border-dashed border-zinc-700 flex flex-col items-center justify-center text-zinc-500 gap-1.5 p-4">
                            <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                            <span className="text-xs">Belum ada gambar sertifikat yang dipilih</span>
                          </div>
                        )}

                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">
                            Pilih file sertifikat (JPG, PNG, WEBP) untuk dipotong & di-crop:
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleSelectImageForCrop(e, {
                                defaultAspect: 16 / 10,
                                title: 'Potong & Sesuaikan Gambar Sertifikat (16:10 / 4:3)',
                                onUploaded: (url) => setCertForm((prev) => ({ ...prev, img_src: url })),
                              })
                            }
                            className="w-full text-xs text-zinc-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-sky-500/20 file:text-sky-300 hover:file:bg-sky-500/30 cursor-pointer"
                          />
                        </div>
                      </div>

                      <input
                        type="text"
                        required
                        value={certForm.img_src}
                        onChange={(e) => setCertForm((prev) => ({ ...prev, img_src: e.target.value }))}
                        placeholder="/images/certificates/1.png atau /uploads/..."
                        className="w-full px-3.5 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-300 mb-1">
                        Link Sertifikat (Opsional)
                      </label>
                      <input
                        type="text"
                        value={certForm.link}
                        onChange={(e) => setCertForm((prev) => ({ ...prev, link: e.target.value }))}
                        placeholder="https://... atau #"
                        className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm font-mono"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-zinc-800">
                      <button
                        type="button"
                        onClick={() => setCertModal({ open: false, isEdit: false, item: null })}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={saving || uploadingImage}
                        className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-white font-medium text-sm rounded-lg shadow-md shadow-sky-500/20 disabled:opacity-50"
                      >
                        {saving ? 'Menyimpan...' : uploadingImage ? 'Mengunggah...' : 'Simpan Certificate'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: COLLABORATION & CONTACTS */}
        {activeTab === 'collab' && (
          <div className="space-y-8">
            {/* Collaboration Text Settings */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-2">Teks Ajakan Kolaborasi</h2>
              <p className="text-sm text-zinc-400 mb-6">
                Ubah judul dan kalimat ajakan pada section &quot;Contact me for collaboration&quot;.
              </p>

              <form onSubmit={handleSaveCollab} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Judul Section
                  </label>
                  <input
                    type="text"
                    value={collab.title || ''}
                    onChange={(e) => setCollab({ ...collab, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                    placeholder="Contact me for collaboration"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Deskripsi Ajakan Kolaborasi
                  </label>
                  <textarea
                    rows="3"
                    value={collab.description || ''}
                    onChange={(e) => setCollab({ ...collab, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm resize-y"
                    placeholder="I am always open to learning and collaborating on challenging projects!"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-white font-medium text-sm rounded-xl shadow-md shadow-sky-500/20 transition-all disabled:opacity-50"
                  >
                    Simpan Teks Kolaborasi
                  </button>
                </div>
              </form>
            </div>

            {/* Social Links CRUD */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-2">CRUD Link Sosial (GitHub, LinkedIn, Instagram)</h2>
              <p className="text-sm text-zinc-400 mb-6">
                Atur URL link sosial media yang ditampilkan di bagian bawah teks kolaborasi.
              </p>

              <div className="space-y-4">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-sky-400 shrink-0">
                        {contact.platform === 'github' ? 'GH' : contact.platform === 'linkedin' ? 'IN' : 'IG'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm">{contact.label}</h4>
                        <span className="text-xs text-zinc-500 capitalize">{contact.platform}</span>
                      </div>
                    </div>

                    <div className="flex-1 max-w-lg">
                      <input
                        type="text"
                        defaultValue={contact.href}
                        onBlur={(e) => {
                          if (e.target.value !== contact.href) {
                            handleUpdateContact(contact.id, { href: e.target.value });
                          }
                        }}
                        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-xs font-mono"
                        placeholder="https://..."
                      />
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400">
                        <input
                          type="checkbox"
                          checked={Boolean(contact.is_active)}
                          onChange={(e) => handleUpdateContact(contact.id, { is_active: e.target.checked ? 1 : 0 })}
                          className="rounded accent-sky-500"
                        />
                        <span>Aktif</span>
                      </label>

                      <a
                        href={contact.href}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 text-zinc-400 hover:text-sky-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        title="Buka Link"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reusable Image Crop Modal */}
      <ImageCropModal
        isOpen={cropModal.open}
        onClose={() => setCropModal((prev) => ({ ...prev, open: false }))}
        imageSrc={cropModal.imageSrc}
        fileName={cropModal.fileName}
        defaultAspect={cropModal.defaultAspect}
        title={cropModal.title}
        onCropAndUpload={cropModal.onCropAndUpload}
      />
    </div>
  );
}
