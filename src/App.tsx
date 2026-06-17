import React, { useState, useEffect, useMemo } from "react";
import {
  Baby,
  HeartPulse,
  Calendar,
  Sparkles,
  Plus,
  Search,
  Trash2,
  AlertTriangle,
  Heart,
  Clock,
  MapPin,
  Activity,
  Phone,
  User,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Filter,
  Shield,
  FileText
} from "lucide-react";
import { Child, GrowthRecord, PregnantMother, PosyanduEvent, EducationArticle } from "./types";
import { DataStore } from "./dataStore";
import KmsChart from "./components/KmsChart";
import AsistenAI from "./components/AsistenAI";

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<"dashboard" | "balita" | "ibu" | "konsultasi" | "edukasi">("dashboard");

  // Core App Data States loaded from DataStore
  const [children, setChildren] = useState<Child[]>([]);
  const [growthRecords, setGrowthRecords] = useState<GrowthRecord[]>([]);
  const [pregnantMothers, setPregnantMothers] = useState<PregnantMother[]>([]);
  const [events, setEvents] = useState<PosyanduEvent[]>([]);
  const [articles, setArticles] = useState<EducationArticle[]>([]);

  // Selected Child state for drilldowns in "balita" tab
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // Search & Filter state for "balita" tab
  const [childSearch, setChildSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState<"Semua" | "Laki-laki" | "Perempuan">("Semua");

  // Forms Modal state toggle
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [showAddMotherModal, setShowAddMotherModal] = useState(false);

  // Forms Input States
  // 1. Add Child Fields
  const [newChildName, setNewChildName] = useState("");
  const [newChildBirthDate, setNewChildBirthDate] = useState("");
  const [newChildGender, setNewChildGender] = useState<"Laki-laki" | "Perempuan">("Laki-laki");
  const [newChildParent, setNewChildParent] = useState("");
  const [newChildPhone, setNewChildPhone] = useState("");
  const [newChildWeight, setNewChildWeight] = useState("");
  const [newChildLength, setNewChildLength] = useState("");
  const [newChildNotes, setNewChildNotes] = useState("");

  // 2. Add Measurement Log Fields
  const [newAgeMonths, setNewAgeMonths] = useState("");
  const [newCheckupDate, setNewCheckupDate] = useState("");
  const [newWeightKg, setNewWeightKg] = useState("");
  const [newHeightCm, setNewHeightCm] = useState("");
  const [newHeadCircumference, setNewHeadCircumference] = useState("");
  const [newRecordNotes, setNewRecordNotes] = useState("");

  // 3. Add Pregnant Mother Fields
  const [motherName, setMotherName] = useState("");
  const [motherAge, setMotherAge] = useState("");
  const [motherPregnancyWeek, setMotherPregnancyWeek] = useState("");
  const [husbandName, setHusbandName] = useState("");
  const [motherPhone, setMotherPhone] = useState("");
  const [motherLila, setMotherLila] = useState("");
  const [motherHb, setMotherHb] = useState("");
  const [motherSystolic, setMotherSystolic] = useState("110");
  const [motherDiastolic, setMotherDiastolic] = useState("75");
  const [ironTablets, setIronTablets] = useState("");
  const [vaccineTd, setVaccineTd] = useState(false);
  const [motherNotes, setMotherNotes] = useState("");

  // Article reader detail view modal
  const [selectedArticle, setSelectedArticle] = useState<EducationArticle | null>(null);

  // Fetch initial datasets on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const listChildren = DataStore.getChildren();
    const listRecords = DataStore.getGrowthRecords();
    const listMothers = DataStore.getPregnantMothers();
    const listEvents = DataStore.getEvents();
    const listArticles = DataStore.getArticles();

    setChildren(listChildren);
    setGrowthRecords(listRecords);
    setPregnantMothers(listMothers);
    setEvents(listEvents);
    setArticles(listArticles);

    // Default select first child id for detail view on tab activation
    if (listChildren.length > 0 && !selectedChildId) {
      setSelectedChildId(listChildren[0].id);
    }
  };

  // ------------------------------------
  // ACTION HANDLERS
  // ------------------------------------

  // Register child
  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName || !newChildBirthDate || !newChildParent || !newChildWeight || !newChildLength) {
      alert("Mohon isi semua field wajib balita.");
      return;
    }

    const payload = {
      name: newChildName,
      birthDate: newChildBirthDate,
      gender: newChildGender,
      parentName: newChildParent,
      parentPhone: newChildPhone || "Tidak ada nomor",
      birthWeight: parseFloat(newChildWeight),
      birthLength: parseFloat(newChildLength),
      notes: newChildNotes || ""
    };

    const newChildCreated = DataStore.saveChild(payload);
    loadData();
    setSelectedChildId(newChildCreated.id);

    // Reset fields
    setNewChildName("");
    setNewChildBirthDate("");
    setNewChildGender("Laki-laki");
    setNewChildParent("");
    setNewChildPhone("");
    setNewChildWeight("");
    setNewChildLength("");
    setNewChildNotes("");
    setShowAddChildModal(false);
  };

  // Log growth measurement
  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChildId) return;
    if (!newAgeMonths || !newCheckupDate || !newWeightKg || !newHeightCm) {
      alert("Mohon isi semua field tumbuh kembang balita.");
      return;
    }

    const payload = {
      childId: selectedChildId,
      date: newCheckupDate,
      ageMonths: parseInt(newAgeMonths),
      weightKg: parseFloat(newWeightKg),
      heightCm: parseFloat(newHeightCm),
      headCircumferenceCm: newHeadCircumference ? parseFloat(newHeadCircumference) : undefined,
      notes: newRecordNotes || ""
    };

    DataStore.saveGrowthRecord(payload);
    loadData();

    // Reset fields
    setNewAgeMonths("");
    setNewCheckupDate("");
    setNewWeightKg("");
    setNewHeightCm("");
    setNewHeadCircumference("");
    setNewRecordNotes("");
    setShowAddRecordModal(false);
  };

  // Register pregnant mother
  const handleAddMother = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motherName || !motherAge || !motherPregnancyWeek || !husbandName || !motherLila || !motherHb) {
      alert("Mohon lengkapi semua field penting Ibu Hamil.");
      return;
    }

    const payload = {
      name: motherName,
      age: parseInt(motherAge),
      pregnancyWeeks: parseInt(motherPregnancyWeek),
      husbandName,
      phone: motherPhone || "Tidak ada nomor",
      lilaCm: parseFloat(motherLila),
      hbLevel: parseFloat(motherHb),
      systolic: parseInt(motherSystolic) || 120,
      diastolic: parseInt(motherDiastolic) || 80,
      ironTabletsTaken: ironTablets ? parseInt(ironTablets) : 0,
      immunizationTd: vaccineTd,
      notes: motherNotes || ""
    };

    DataStore.savePregnantMother(payload);
    loadData();

    // Reset fields
    setMotherName("");
    setMotherAge("");
    setMotherPregnancyWeek("");
    setHusbandName("");
    setMotherPhone("");
    setMotherLila("");
    setMotherHb("");
    setMotherSystolic("110");
    setMotherDiastolic("75");
    setIronTablets("");
    setVaccineTd(false);
    setMotherNotes("");
    setShowAddMotherModal(false);
  };

  // Delete child
  const handleDeleteChild = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data balita ini beserta seluruh rekam pertumbuhannya?")) {
      DataStore.deleteChild(id);
      setSelectedChildId(null);
      loadData();
    }
  };

  // Delete measurement record
  const handleDeleteRecord = (id: string) => {
    if (confirm("Hapus catatan penimbangan ini?")) {
      DataStore.deleteGrowthRecord(id);
      loadData();
    }
  };

  // Delete Pregnant Mother
  const handleDeleteMother = (id: string) => {
    if (confirm("Hapus data rekam kependudukan Ibu Hamil ini?")) {
      DataStore.deletePregnantMother(id);
      loadData();
    }
  };

  // ------------------------------------
  // STATISTICAL MEMO COMPUTATIONS
  // ------------------------------------

  const dashboardStats = useMemo(() => {
    const totalChildCount = children.length;
    const totalMotherCount = pregnantMothers.length;

    // Evaluate stunting stats from current records
    // Get latest checkup for each child
    let stuntedCount = 0;
    let underweightCount = 0;
    let normalCount = 0;

    children.forEach((c) => {
      const childRecs = growthRecords.filter((r) => r.childId === c.id);
      if (childRecs.length > 0) {
        const latest = childRecs[childRecs.length - 1];
        const hStatus = latest.nutritionalStatus.heightForAge;
        const wStatus = latest.nutritionalStatus.weightForAge;

        if (hStatus.includes("Stunted")) {
          stuntedCount++;
        }
        if (wStatus === "Kurang" || wStatus === "Sangat Kurang") {
          underweightCount++;
        }
        if (hStatus === "Normal" && wStatus === "Normal") {
          normalCount++;
        }
      }
    });

    // Ibu hamil KEK risk (LILA < 23.5) or Anemia (Hb < 11)
    let motherKekRisk = 0;
    let motherAnemiaRisk = 0;

    pregnantMothers.forEach((m) => {
      if (m.lilaCm < 23.5) motherKekRisk++;
      if (m.hbLevel < 11.0) motherAnemiaRisk++;
    });

    return {
      totalChildCount,
      totalMotherCount,
      stuntedCount,
      underweightCount,
      normalCount,
      motherKekRisk,
      motherAnemiaRisk
    };
  }, [children, growthRecords, pregnantMothers]);

  // Filters children list
  const filteredChildren = useMemo(() => {
    return children.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(childSearch.toLowerCase()) ||
        c.parentName.toLowerCase().includes(childSearch.toLowerCase());
      const matchesGender = genderFilter === "Semua" ? true : c.gender === genderFilter;
      return matchesSearch && matchesGender;
    });
  }, [children, childSearch, genderFilter]);

  const selectedChildObj = useMemo(() => {
    return children.find((c) => c.id === selectedChildId) || null;
  }, [children, selectedChildId]);

  const selectedChildRecords = useMemo(() => {
    if (!selectedChildId) return [];
    return growthRecords.filter((r) => r.childId === selectedChildId);
  }, [growthRecords, selectedChildId]);

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800 flex flex-col">
      {/* HEADER SECTION IN INDONESIAN MEDICAL COLORS */}
      <header className="bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2.5 rounded-2xl border border-white/20 shadow-inner">
              <HeartPulse className="w-8 h-8 text-emerald-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/30 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/20 tracking-wider">
                  SISTEM DIGITALISASI INTEGRAL
                </span>
              </div>
              <h1 className="font-bold text-2xl tracking-tight mt-0.5" id="brand-title">
                Sistem Informasi & KMS Digital Posyandu
              </h1>
              <p className="text-emerald-100 text-xs">
                RW 05 Melati Kelurahan Mekarsari • Pemantauan Tumbuh Kembang, Imunisasi, & Cegah Stunting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-black/15 px-3 py-2 rounded-xl backdrop-blur-xs font-mono select-none self-end md:self-center">
            <span className="text-emerald-300">●</span> Kader RW 05: Active Session
          </div>
        </div>

        {/* NAVIGATION TABS SECTION */}
        <div className="bg-teal-950/45 border-t border-emerald-500/10 px-4 md:px-6">
          <div className="max-w-7xl mx-auto flex overflow-x-auto gap-1 py-1 scrollbar-none">
            {[
              { id: "dashboard", label: "Dashboard Gizi", icon: Activity },
              { id: "balita", label: "Pencatatan Balita (KMS)", icon: Baby },
              { id: "ibu", label: "Ibu Hamil", icon: Heart },
              { id: "konsultasi", label: "Asisten Medis AI", icon: Sparkles },
              { id: "edukasi", label: "Edukasi & Tips", icon: BookOpen }
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setSelectedArticle(null);
                  }}
                  className={`flex items-center gap-2 px-4 py-3.5 text-xs font-bold rounded-lg transition-all shrink-0 uppercase tracking-wider relative ${
                    activeTab === tab.id
                      ? "text-emerald-300 pointer-events-none"
                      : "text-slate-300 hover:text-white"
                  }`}
                  id={`tab-nav-${tab.id}`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-400 rounded-t-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* CORE CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        {/* TAB 1: DASHBOARD GIZI */}
        {activeTab === "dashboard" && (
          <div className="flex flex-col gap-6 animate-fade-in" id="dashboard-tab-view">
            {/* Contextual Banner */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex gap-3 items-start">
                <Shield className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold text-emerald-900 text-sm">
                    Fokus Posyandu Bulan Ini: Sosialisasi Protein Hewani Menekan Angka Stunting
                  </h3>
                  <p className="text-xs text-emerald-700/80 mt-1 max-w-2xl leading-relaxed">
                    Kader Posyandu di RW 05 diimbau fokus pada penimbangan balita dan edukasi asupan pangan tinggi hewani seperti telur, hati ayam, dan ikan kembung lokal pada Ibu Hamil dan Balita.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("edukasi")}
                className="text-xs font-bold text-emerald-700 hover:text-white bg-slate-55/15 hover:bg-emerald-600 border border-emerald-250 hover:border-emerald-600 px-4 py-2 rounded-xl transition-all"
              >
                Baca Panduan MPASI
              </button>
            </div>

            {/* Micro Numbers Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col">
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400">TOTAL BALITA</span>
                <span className="text-3xl font-bold font-sans text-slate-800 mt-2 truncate">
                  {dashboardStats.totalChildCount} Anak
                </span>
                <span className="text-[10px] text-slate-500 mt-1">Gizi Baik: {dashboardStats.normalCount} balita</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col">
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400">IBU HAMIL</span>
                <span className="text-3xl font-bold font-sans text-slate-800 mt-2 truncate">
                  {dashboardStats.totalMotherCount} Jiwa
                </span>
                <span className="text-[10px] text-rose-500 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {dashboardStats.motherKekRisk} Risiko KEK (Lila Rendah)
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col">
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400">KASUS STUNTING</span>
                <span className={`text-3xl font-bold font-sans mt-2 truncate ${dashboardStats.stuntedCount > 0 ? "text-amber-600" : "text-slate-800"}`}>
                  {dashboardStats.stuntedCount} Balita
                </span>
                <span className="text-[10px] text-slate-500 mt-1">Indeks antropometri TB/U &lt; -2 SD WHO</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col">
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400">GIZI KURANG</span>
                <span className={`text-3xl font-bold font-sans mt-2 truncate ${dashboardStats.underweightCount > 0 ? "text-rose-600" : "text-slate-800"}`}>
                  {dashboardStats.underweightCount} Balita
                </span>
                <span className="text-[10px] text-slate-500 mt-1">Berat Badan (BB/U) di bawah standar deviasi -2</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Events Schedule */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Jadwal Layanan Posyandu
                  </h3>
                  <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-md font-semibold">Tahun 2026</span>
                </div>

                <div className="flex flex-col gap-3">
                  {events.map((e) => (
                    <div key={e.id} className="p-3 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl transition-all duration-200">
                      <div className="flex justify-between items-start">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm ${
                          e.category === "Imunisasi" ? "bg-rose-50 text-rose-700 border border-rose-100" :
                          e.category === "Penimbangan" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                          "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}>
                          {e.category}
                        </span>
                        <div className="text-[10px] font-mono font-medium text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {e.time}
                        </div>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm mt-1.5 leading-snug">{e.name}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-normal">{e.description}</p>
                      
                      <div className="text-[10px] text-slate-500 font-medium mt-2 flex items-center gap-1.5 border-t border-slate-200/50 pt-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {e.location}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Educational Quick Access & Stats Summary */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                {/* Visual Overview bars */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
                  <h3 className="font-semibold text-slate-800 text-sm border-b border-slate-100 pb-3">
                    Status Nutrisi RW 05 Melati (WHO Standard)
                  </h3>

                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                        <span>Gizi Sesuai Standar (Normal)</span>
                        <span>{children.length > 0 ? Math.round((dashboardStats.normalCount / children.length) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2.5 rounded-full transition-all"
                          style={{ width: `${children.length > 0 ? (dashboardStats.normalCount / children.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                        <span>Risiko Stunting (Panjang Badan Kurang)</span>
                        <span>{children.length > 0 ? Math.round((dashboardStats.stuntedCount / children.length) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-amber-500 h-2.5 rounded-full transition-all"
                          style={{ width: `${children.length > 0 ? (dashboardStats.stuntedCount / children.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                        <span>Underweight (Gizi Kurang)</span>
                        <span>{children.length > 0 ? Math.round((dashboardStats.underweightCount / children.length) * 100) : 0}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-rose-500 h-2.5 rounded-full transition-all"
                          style={{ width: `${children.length > 0 ? (dashboardStats.underweightCount / children.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mothers Anemia Section */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
                  <h3 className="font-semibold text-slate-800 text-sm border-b border-slate-100 pb-3 flex justify-between items-center">
                    <span>Pemantauan Deteksi Risiko Ibu Hamil</span>
                    <span className="bg-rose-50 text-rose-700 text-[10px] px-2 py-0.5 rounded-sm border border-rose-150">Gizi Ibu Hamil</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 flex items-start gap-3">
                      <div className="bg-rose-100 p-2 rounded-lg text-rose-600 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-700">Risiko Anemia Ringan/Berat</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Kadar Hemoglobin &lt; 11 g/dL</p>
                        <p className="text-xl font-bold font-sans text-rose-600 mt-1">{dashboardStats.motherAnemiaRisk} Ibu Hamil</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 flex items-start gap-3">
                      <div className="bg-amber-100 p-2 rounded-lg text-amber-600 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-700">Kekurangan Energi Kronis (KEK)</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Lingkar lengan atas &lt; 23.5 CM</p>
                        <p className="text-xl font-bold font-sans text-amber-600 mt-1">{dashboardStats.motherKekRisk} Ibu Hamil</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Consultation AI Card */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex gap-4">
                <div className="bg-white/10 p-3 rounded-2xl border border-white/20 shrink-0">
                  <Sparkles className="w-6 h-6 text-emerald-200" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Ada pertanyaan tentang pertumbuhan putra/putri Anda?</h3>
                  <p className="text-emerald-100 text-xs max-w-xl leading-relaxed">
                    Dapatkan evaluasi gizi pintar, status KMS, pedoman imunisasi IDAI, serta pendeteksi risiko stunting dari dokter pedriatri Asisten kecerdasan buatan Gemini.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("konsultasi")}
                className="bg-white hover:bg-emerald-50 text-emerald-800 hover:text-emerald-900 font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md self-end md:self-center uppercase tracking-wider"
              >
                Mulai Konsultasi AI
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PENCATATAN BALITA (KMS) */}
        {activeTab === "balita" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="balita-tab-view">
            {/* Left Column: Children list */}
            <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                  <Baby className="w-4 h-4 text-emerald-600" />
                  Daftar Balita RW 05
                </h3>
                <button
                  onClick={() => setShowAddChildModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
                  id="btn-add-child-modal"
                >
                  <Plus className="w-3.5 h-3.5" /> Daftar Baru
                </button>
              </div>

              {/* Search fields */}
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                  <input
                    value={childSearch}
                    onChange={(e) => setChildSearch(e.target.value)}
                    placeholder="Cari nama balita / orang tua..."
                    className="w-full text-xs p-2.5 pl-9 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl focus:outline-emerald-500 transition-all font-medium"
                  />
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
                  {(["Semua", "Laki-laki", "Perempuan"] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGenderFilter(g)}
                      className={`flex-1 text-[10px] font-bold py-1 rounded transition-all ${
                        genderFilter === g ? "bg-white text-emerald-700 shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actual list */}
              <div className="flex flex-col gap-2 overflow-y-auto max-h-[480px]">
                {filteredChildren.length === 0 ? (
                  <p className="text-center text-xs text-slate-400 py-10 font-medium">Balita tidak ditemukan.</p>
                ) : (
                  filteredChildren.map((c) => {
                    const isSelected = selectedChildId === c.id;
                    const cAgeMonths = Math.max(0, (new Date().getFullYear() - new Date(c.birthDate).getFullYear()) * 12 + new Date().getMonth() - new Date(c.birthDate).getMonth());
                    const recordsCount = growthRecords.filter((r) => r.childId === c.id).length;

                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedChildId(c.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                          isSelected
                            ? "bg-emerald-50 border-emerald-300 shadow-inner"
                            : "bg-slate-50/50 hover:bg-slate-50 border-slate-200"
                        }`}
                        id={`child-item-${c.id}`}
                      >
                        <div className="min-w-0 pr-2">
                          <h4 className="font-bold text-slate-800 text-sm truncate">{c.name}</h4>
                          <span className={`text-[10px] inline-block font-bold mt-1 ${c.gender === "Laki-laki" ? "text-blue-600" : "text-pink-600"}`}>
                            {c.gender} • {cAgeMonths} bulan
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate mt-0.5">Ibu: {c.parentName.split("&")[0]}</span>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm">
                            {recordsCount} rekam
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Detailed selected child stats, KMS graph, checkup timelines */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {selectedChildObj ? (
                <>
                  {/* Selected Child Header Grid */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-slate-900 text-xl tracking-tight">{selectedChildObj.name}</h2>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          selectedChildObj.gender === "Laki-laki" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
                        }`}>
                          {selectedChildObj.gender}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Tanggal Lahir: <span className="font-semibold font-mono text-slate-700">{selectedChildObj.birthDate}</span> • Orang Tua: <span className="font-semibold text-slate-700">{selectedChildObj.parentName}</span>
                      </p>
                      
                      {selectedChildObj.notes && (
                        <p className="text-xs text-amber-700 bg-amber-50 mt-2 px-2.5 py-1 rounded-lg inline-block border border-amber-100">
                          Catatan Bawaan Lahir: {selectedChildObj.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 self-end sm:self-center">
                      <button
                        onClick={() => setShowAddRecordModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1 shadow-xs"
                        id="btn-add-record-modal"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambah Rekam Bulan Baru
                      </button>
                      <button
                        onClick={() => handleDeleteChild(selectedChildObj.id)}
                        className="bg-red-50 hover:bg-red-150 text-red-600 p-2.5 rounded-xl border border-red-200 transition-all"
                        id="btn-delete-child"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* KMS DIGITAL PLOTTED GRAPH */}
                  <KmsChart child={selectedChildObj} records={selectedChildRecords} />

                  {/* VITAL BIODATA TABLE & IMMUNIZATION STATS */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
                    <h3 className="font-semibold text-slate-800 text-sm border-b border-slate-100 pb-3 flex justify-between items-center">
                      <span>Riwayat Pemantauan & Antropometri</span>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm">Lengkap</span>
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left" id="table-child-records">
                        <thead className="bg-slate-50 text-slate-500 uppercase font-mono text-[10px]">
                          <tr>
                            <th className="p-3">Usia (Bulan)</th>
                            <th className="p-3">Tanggal Penimbangan</th>
                            <th className="p-3">Berat Badan (BB)</th>
                            <th className="p-3">Panjang Badan (TB)</th>
                            <th className="p-3">Lingkar Kepala</th>
                            <th className="p-3">TB/U (Stunting Detector)</th>
                            <th className="p-3 text-right">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {selectedChildRecords.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="p-4 text-center text-slate-400">Belum ada data bulanan. Catat rekam pertama!</td>
                            </tr>
                          ) : (
                            selectedChildRecords.map((r) => (
                              <tr key={r.id} className="hover:bg-slate-50 transition-all">
                                <td className="p-3 font-semibold text-slate-800">{r.ageMonths} Bulan</td>
                                <td className="p-3 font-mono text-slate-500">{r.date}</td>
                                <td className="p-3 text-emerald-700 font-bold">{r.weightKg} kg</td>
                                <td className="p-3 text-sky-700 font-semibold">{r.heightCm} cm</td>
                                <td className="p-3 font-mono text-slate-500">{r.headCircumferenceCm ? `${r.headCircumferenceCm} cm` : "-"}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                    r.nutritionalStatus.heightForAge.includes("Severely Stunted") ? "bg-red-100 text-red-700 border border-red-200" :
                                    r.nutritionalStatus.heightForAge.includes("Stunted") ? "bg-amber-100 text-amber-700 border border-amber-200" :
                                    "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  }`}>
                                    {r.nutritionalStatus.heightForAge}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    onClick={() => handleDeleteRecord(r.id)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-all inline-block"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white p-20 rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center justify-center text-center text-slate-400">
                  <Baby className="w-16 h-16 text-slate-200 mb-4 animate-bounce" />
                  <h3 className="font-bold text-slate-700">Detail Balita Belum Terpilih</h3>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Silakan klik salah satu nama anak pada kolom sebelah kiri untuk memantau grafik KMS utama mereka.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: IBU HAMIL */}
        {activeTab === "ibu" && (
          <div className="flex flex-col gap-6 animate-fade-in" id="mother-tab-view">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-bold text-slate-900 text-xl tracking-tight">Pencatatan & Pemantauan Kehamilan Ibu</h2>
                <p className="text-xs text-slate-500">Kumpulan rekam medis deteksi dini resiko KEK (Kekurangan Energi Kronis) dan anemia gestasional.</p>
              </div>
              <button
                onClick={() => setShowAddMotherModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all shadow-sm"
                id="btn-add-mother-modal"
              >
                <Plus className="w-3.5 h-3.5" /> Daftarkan Ibu Hamil Baru
              </button>
            </div>

            {/* Mother's Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pregnantMothers.length === 0 ? (
                <div className="col-span-full bg-white p-20 rounded-2xl border border-slate-100 shadow-xs text-center text-slate-400">
                  <Heart className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-sm font-semibold text-slate-700">Belum Ada Ibu Hamil Terdaftar</p>
                  <p className="text-xs max-w-xs mx-auto mt-1">Daftarkan data awal Ibu Hamil untuk membantu pemantauan tablet tambah darah (Fe) dan kependudukan Posyandu.</p>
                </div>
              ) : (
                pregnantMothers.map((m) => {
                  const isKek = m.lilaCm < 23.5;
                  const isAnemic = m.hbLevel < 11.0;

                  return (
                    <div key={m.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between" id={`mother-card-${m.id}`}>
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-slate-800 text-base">Ibu {m.name}</h3>
                            <span className="text-[10px] text-slate-500">Usia {m.age} Tahun • Suami: {m.husbandName}</span>
                          </div>
                          <button
                            onClick={() => handleDeleteMother(m.id)}
                            className="text-slate-400 hover:text-red-600 p-2 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Critical parameters badges */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {isKek ? (
                            <span className="bg-rose-50 text-rose-700 border border-rose-100 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Resiko KEK
                            </span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] px-2 py-0.5 rounded-md">
                              Energi Lila Baik
                            </span>
                          )}

                          {isAnemic ? (
                            <span className="bg-red-50 text-red-700 border border-red-150 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3" /> Hb Rendah (Anemia)
                            </span>
                          ) : (
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] px-2 py-0.5 rounded-md">
                              Sirkulasi Sel Baik
                            </span>
                          )}
                        </div>

                        {/* Vital indices lists */}
                        <div className="grid grid-cols-2 gap-3 mt-4 bg-slate-50 p-3 rounded-xl border border-slate-150 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase font-mono font-bold">Usia Kandungan</span>
                            <span className="font-bold text-slate-700 mt-1 block">{m.pregnancyWeeks} Minggu/Weeks</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase font-mono font-bold">Tensi Darah</span>
                            <span className="font-bold text-slate-700 mt-1 block">{m.systolic}/{m.diastolic} mmHg</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase font-mono font-bold">Hemoglobin (Hb)</span>
                            <span className={`font-bold mt-1 block ${isAnemic ? "text-red-600" : "text-emerald-700"}`}>
                              {m.hbLevel} g/dL
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase font-mono font-bold">Lengan Atas (LILA)</span>
                            <span className={`font-bold mt-1 block ${isKek ? "text-rose-600" : "text-emerald-700"}`}>
                              {m.lilaCm} CM
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 text-xs flex flex-col gap-2">
                          <div className="flex justify-between items-center text-[11px] text-slate-600">
                            <span>Tablet Tambah Darah (Fe) diminum:</span>
                            <span className="font-bold text-slate-800">{m.ironTabletsTaken} dari 90</span>
                          </div>
                          {/* Fe progress bar */}
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(100, (m.ironTabletsTaken / 90) * 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="mt-3 text-xs flex justify-between py-2 border-t border-slate-100 text-slate-600">
                          <span>Vaksin Imunisasi Td (Tetanus):</span>
                          <span className={`font-bold ${m.immunizationTd ? "text-emerald-700" : "text-slate-400"}`}>
                            {m.immunizationTd ? "✓ Lengkap (Td)" : "✗ Belum Vaksin"}
                          </span>
                        </div>
                      </div>

                      {m.notes && (
                        <div className="mt-2 text-[11px] bg-amber-50 text-amber-700 p-2.5 rounded-xl border border-amber-100 flex gap-1.5 items-start">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{m.notes}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 4: KONSULTASI MEDIS AI */}
        {activeTab === "konsultasi" && (
          <div className="flex flex-col gap-4 animate-fade-in">
            <AsistenAI childrenList={children} growthRecords={growthRecords} mothersList={pregnantMothers} />
          </div>
        )}

        {/* TAB 5: EDUKASI & TIPS */}
        {activeTab === "edukasi" && (
          <div className="flex flex-col gap-6 animate-fade-in" id="education-tab-view">
            <div>
              <h2 className="font-bold text-slate-900 text-xl tracking-tight">Koleksi Edukasi Gizi & Kesehatan Posyandu</h2>
              <p className="text-xs text-slate-500">Materi pedoman resmi Pencegahan Stunting, MPASI Sehat, dan Imunisasi Dasar Lengkap.</p>
            </div>

            {selectedArticle ? (
              /* Reading Pane */
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm max-w-3xl mx-auto flex flex-col gap-5">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 self-start flex items-center gap-1 group"
                >
                  ← Kembali ke Indeks Artikel
                </button>

                <div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wider">
                    {selectedArticle.category}
                  </span>
                  <h1 className="font-bold text-slate-900 text-2xl md:text-3xl tracking-tight mt-3">{selectedArticle.title}</h1>
                  <p className="text-slate-400 text-xs mt-1.5 font-semibold flex items-center gap-1">
                    Waktu Baca: {selectedArticle.readTime}
                  </p>
                </div>

                <div className="prose prose-emerald max-w-none text-slate-700 leading-relaxed border-t border-slate-100 pt-5 text-sm">
                  {selectedArticle.content.split("\n").map((para, i) => {
                    if (para.startsWith("**")) {
                      return <strong key={i} className="block text-slate-900 mt-4 mb-2 font-bold text-base">{para.replace(/\*\*/g, "")}</strong>;
                    }
                    if (para.startsWith("1.") || para.startsWith("2.") || para.startsWith("3.") || para.startsWith("4.") || para.startsWith("5.")) {
                      return <p key={i} className="ml-4 pl-1 mb-2 text-slate-700 leading-relaxed font-medium">{para}</p>;
                    }
                    if (para.trim() === "") {
                      return <div key={i} className="h-3"></div>;
                    }
                    return <p key={i} className="mb-3 text-slate-700 text-justify">{para}</p>;
                  })}
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-500 mt-4 leading-normal flex gap-1.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Pedoman di atas disusun sesuai regulasi formal Buku KIA (Kesehatan Ibu Anak) dari Kementerian Kesehatan Republik Indonesia. Dukung si kecil dengan menyalurkan menu gizi seimbang harian terbaik!
                  </span>
                </div>
              </div>
            ) : (
              /* Index Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => setSelectedArticle(art)}
                    className="bg-white p-5 rounded-2xl border border-slate-150 hover:border-emerald-300 shadow-2xs hover:shadow-md cursor-pointer transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 tracking-wider bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                        {art.category}
                      </span>
                      <h3 className="font-bold text-slate-800 text-base mt-3.5 leading-snug">{art.title}</h3>
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{art.snippet}</p>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-5 text-[10px] font-semibold text-slate-400">
                      <span>{art.readTime} baca</span>
                      <span className="text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 font-bold">
                        Buka Lengkap <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 mt-auto border-t border-slate-800 text-center py-6 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 Sistem Manajemen Posyandu Digital. Aplikasi Penunjang Kader Kependudukan RI.</p>
          <div className="flex gap-4 font-bold text-[11px] text-slate-500">
            <span>KIA Kemenkes</span>
            <span>WHO Stunting Standard</span>
            <span>Aistudio Cloud</span>
          </div>
        </div>
      </footer>

      {/* ------------------------------------
          MODALS COMPONENT GRID
         ------------------------------------ */}

      {/* MODAL 1: ADD NEW CHILD */}
      {showAddChildModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in" id="modal-add-child">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-emerald-600 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Registrasi Pendaftaran Balita RW 05</h3>
                <p className="text-[10px] text-emerald-100 mt-0.5">Input biodata awal ibu dan lahir anak untuk mendaftar akun KMS.</p>
              </div>
              <button
                onClick={() => setShowAddChildModal(false)}
                className="text-white hover:text-slate-200 text-lg font-bold p-1 rounded"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddChild} className="p-5 flex-1 overflow-y-auto flex flex-col gap-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-slate-500 mb-1">Nama Lengkap Balita *</label>
                  <input
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    required
                    placeholder="Contoh: Muhammad Yusuf"
                    className="w-full font-medium p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Tanggal Kelahiran *</label>
                  <input
                    type="date"
                    value={newChildBirthDate}
                    onChange={(e) => setNewChildBirthDate(e.target.value)}
                    required
                    className="w-full font-mono p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Jenis Kelamin *</label>
                  <select
                    value={newChildGender}
                    onChange={(e) => setNewChildGender(e.target.value as any)}
                    className="w-full text-xs font-semibold p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white"
                  >
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-500 mb-1">Nama Orang Tua (Ibu & Ayah) *</label>
                  <input
                    value={newChildParent}
                    onChange={(e) => setNewChildParent(e.target.value)}
                    required
                    placeholder="Contoh: Ibu Rina & Bapak Yusuf"
                    className="w-full font-medium p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">HP Orang Tua (WA)</label>
                  <input
                    value={newChildPhone}
                    onChange={(e) => setNewChildPhone(e.target.value)}
                    placeholder="Contoh: 081288..."
                    className="w-full font-mono p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 mb-1">BB Lahir (kg) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newChildWeight}
                      onChange={(e) => setNewChildWeight(e.target.value)}
                      required
                      placeholder="3.2"
                      className="w-full font-mono p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">TB Lahir (cm) *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newChildLength}
                      onChange={(e) => setNewChildLength(e.target.value)}
                      required
                      placeholder="49"
                      className="w-full font-mono p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-500 mb-1">Catatan Lahir Ringkas (Opsional)</label>
                  <textarea
                    value={newChildNotes}
                    onChange={(e) => setNewChildNotes(e.target.value)}
                    placeholder="Ket: Kondisi saat melahirkan sehat, langsung tangis pertama."
                    rows={2}
                    className="w-full font-medium p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Modal Footer actions */}
              <div className="flex gap-2 border-t border-slate-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddChildModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-center shadow-xs"
                >
                  Daftarkan Balita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD NEW GROWTH RECORD MEASUREMENT */}
      {showAddRecordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fade-in" id="modal-add-record">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            <div className="bg-emerald-600 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Catat Rekam Imunisasi & Tumbuh Kembang</h3>
                <p className="text-[10px] text-emerald-100 mt-0.5">
                  Balita: <span className="underline font-bold">{selectedChildObj?.name}</span>
                </p>
              </div>
              <button
                onClick={() => setShowAddRecordModal(false)}
                className="text-white hover:text-slate-200 text-lg font-bold p-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="p-5 flex flex-col gap-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1">Usia Checkup (Bulan) *</label>
                  <input
                    type="number"
                    value={newAgeMonths}
                    onChange={(e) => setNewAgeMonths(e.target.value)}
                    required
                    placeholder="Usia dlm bulan (cth: 6)"
                    className="w-full font-mono p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Tanggal Checkup *</label>
                  <input
                    type="date"
                    value={newCheckupDate}
                    onChange={(e) => setNewCheckupDate(e.target.value)}
                    required
                    className="w-full font-mono p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Berat Badan * (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newWeightKg}
                    onChange={(e) => setNewWeightKg(e.target.value)}
                    required
                    placeholder="Cth: 7.2"
                    className="w-full font-mono p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Tinggi / Panjang * (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newHeightCm}
                    onChange={(e) => setNewHeightCm(e.target.value)}
                    required
                    placeholder="Cth: 65.5"
                    className="w-full font-mono p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-500 mb-1">Lingkar Kepala (cm - Opsional)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newHeadCircumference}
                    onChange={(e) => setNewHeadCircumference(e.target.value)}
                    placeholder="Cth: 41"
                    className="w-full font-mono p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-500 mb-1">Remas Catatan Imunisasi / Gizi (Opsional)</label>
                  <textarea
                    value={newRecordNotes}
                    onChange={(e) => setNewRecordNotes(e.target.value)}
                    placeholder="Imunisasi diberikan: DPT 1, polio 2, pemberian kapsul vitamin A merah."
                    rows={2}
                    className="w-full font-medium p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-2 border-t border-slate-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddRecordModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-center shadow-xs"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD NEW PREGNANT MOTHER */}
      {showAddMotherModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto z-40 animate-fade-in" id="modal-add-mother">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="bg-emerald-600 p-5 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Registrasi Ibu Hamil RW 05</h3>
                <p className="text-[10px] text-emerald-100 mt-0.5">Input riwayat awal kehamilan, lengan atas LILA, and HB hemoglobin.</p>
              </div>
              <button
                onClick={() => setShowAddMotherModal(false)}
                className="text-white hover:text-slate-200 text-lg font-bold p-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMother} className="p-5 flex-1 overflow-y-auto flex flex-col gap-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 hidden"></div>
                <div className="col-span-2">
                  <label className="block text-slate-500 mb-1">Nama Lengkap Ibu *</label>
                  <input
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    required
                    placeholder="Nama Ibu Hamil (Cth: Dian Lestari)"
                    className="w-full font-medium p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Usia Fisik Ibu (Tahun) *</label>
                  <input
                    type="number"
                    value={motherAge}
                    onChange={(e) => setMotherAge(e.target.value)}
                    required
                    placeholder="Contoh: 28"
                    className="w-full font-mono p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Usia Kehamilan (Minggu/Weeks) *</label>
                  <input
                    type="number"
                    value={motherPregnancyWeek}
                    onChange={(e) => setMotherPregnancyWeek(e.target.value)}
                    required
                    placeholder="Cth: 12"
                    className="w-full font-mono p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-500 mb-1">Nama Suami *</label>
                  <input
                    value={husbandName}
                    onChange={(e) => setHusbandName(e.target.value)}
                    required
                    placeholder="Cth: Bapak Surya Wijaya"
                    className="w-full font-medium p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Hp Suami / Ibu</label>
                  <input
                    value={motherPhone}
                    onChange={(e) => setMotherPhone(e.target.value)}
                    placeholder="Cth: 081223..."
                    className="w-full font-mono p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">LILA (Lingkar Lengan Atas - CM) *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={motherLila}
                    onChange={(e) => setMotherLila(e.target.value)}
                    required
                    placeholder="Kondisi KEK jika < 23.5 cm"
                    className="w-full font-mono p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Kadar Hemoglobin (Hb) * (g/dL)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={motherHb}
                    onChange={(e) => setMotherHb(e.target.value)}
                    required
                    placeholder="Kondisi anemia jika < 11 g/dL"
                    className="w-full font-mono p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 mb-1">BP Sistolik (mmHg)</label>
                    <input
                      type="number"
                      value={motherSystolic}
                      onChange={(e) => setMotherSystolic(e.target.value)}
                      placeholder="110"
                      className="w-full font-mono p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 mb-1">BP Diastolik (mmHg)</label>
                    <input
                      type="number"
                      value={motherDiastolic}
                      onChange={(e) => setMotherDiastolic(e.target.value)}
                      placeholder="75"
                      className="w-full font-mono p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Tablet Fe (Zat Besi) Diminum</label>
                  <input
                    type="number"
                    value={ironTablets}
                    onChange={(e) => setIronTablets(e.target.value)}
                    placeholder="Maksimal 90"
                    className="w-full font-mono p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-2 mt-4 select-none">
                  <input
                    type="checkbox"
                    id="vaccineTd"
                    checked={vaccineTd}
                    onChange={(e) => setVaccineTd(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="vaccineTd" className="text-[11px] font-bold text-slate-600 cursor-pointer">
                    Menerima Imunisasi Tetanus Diphteria (Td)
                  </label>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-500 mb-1">Catatan Tambahan Khusus Bumil</label>
                  <textarea
                    value={motherNotes}
                    onChange={(e) => setMotherNotes(e.target.value)}
                    placeholder="Cth: Mengalami keluhan pusing mual di pagi hari, nafsu makan agak menurun."
                    rows={2}
                    className="w-full font-medium p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-emerald-500 focus:bg-white resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-2 border-t border-slate-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMotherModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-center shadow-xs"
                >
                  Daftarkan Bumil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
