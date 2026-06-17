import React, { useState, useEffect } from "react";
import { MessageSquare, Sparkles, AlertCircle, RefreshCw, HelpCircle, CheckCircle } from "lucide-react";
import { Child, GrowthRecord, PregnantMother } from "../types";

interface AsistenAIProps {
  childrenList: Child[];
  growthRecords: GrowthRecord[];
  mothersList: PregnantMother[];
}

export default function AsistenAI({ childrenList, growthRecords, mothersList }: AsistenAIProps) {
  const [targetType, setTargetType] = useState<"balita" | "ibu">("balita");
  const [selectedBalitaId, setSelectedBalitaId] = useState("");
  const [selectedIbuId, setSelectedIbuId] = useState("");
  
  const [customQuery, setCustomQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [apiSource, setApiSource] = useState<"gemini_api" | "fallback_engine" | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Auto-select first elements of list on load
  useEffect(() => {
    if (childrenList.length > 0 && !selectedBalitaId) {
      setSelectedBalitaId(childrenList[0].id);
    }
    if (mothersList.length > 0 && !selectedIbuId) {
      setSelectedIbuId(mothersList[0].id);
    }
  }, [childrenList, mothersList]);

  const selectedChild = childrenList.find((c) => c.id === selectedBalitaId);
  const selectedMother = mothersList.find((m) => m.id === selectedIbuId);

  // Get most recent growth record for selected child
  const latestRecord = useMemo(() => {
    if (!selectedBalitaId) return null;
    const recs = growthRecords.filter((r) => r.childId === selectedBalitaId);
    if (recs.length === 0) return null;
    return recs[recs.length - 1]; // sorted or last added
  }, [selectedBalitaId, growthRecords]);

  // Quick prompt presets
  const presetsBalita = [
    { label: "🥦 Panduan Menu MPASI Gizi Seimbang", text: "Tolong berikan rekomendasi kombinasi sayur, lauk pauk gizi seimbang serta cara memasak MPASI yang tepat dan higienis untuk menyerap zat besi." },
    { label: "💉 Jadwal Imunisasi Selanjutnya & KIPI", text: "Imunisasi apa saja yang wajib dilakukan di rentang usia anak saya sekarang? Bagaimana cara merawat anak jika timbul efek panas demam (KIPI)?" },
    { label: "💡 Pencegahan Masalah Stunting & Gizi", text: "Apakah pertumbuhan anak saya sudah normal sesuai tinggi badannya? Tolong cek risiko stunting dan berikan tips pemantauan tinggi rutin di rumah." }
  ];

  const presetsIbu = [
    { label: "🥛 Cegah Anemia & Nilai Hb Ideal", text: "Kadar Hb saya sekarang tercatat di aplikasi. Bagaimana menjaga stabilitas zat besi, asupan apa saja agar terhindar dari anemia gestasional?" },
    { label: "🤰 Tips Persiapan Persalinan Sehat", text: "Apa saja asupan nutrisi penambah tenaga dan senam kehamilan ringan untuk mempersiapkan kelancaran proses melahirkan?" },
    { label: "📅 Tanda Bahaya Kehamilan & Konsultasi", text: "Tolong rinci tanda-tanda bahaya kehamilan trimester 2-3 yang mengharuskan saya segera pergi ke IGD/Fasilitas medis terdekat." }
  ];

  function useMemo<T>(fn: () => T, deps: any[]): T {
    return React.useMemo(fn, deps);
  }

  const handlePresetClick = (presetText: string) => {
    setCustomQuery(presetText);
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText(null);
    setAiResponse(null);
    setIsLoading(true);

    try {
      let payload = {};

      if (targetType === "balita") {
        if (!selectedChild) {
          throw new Error("Silakan pilih profil balita terlebih dahulu.");
        }
        
        let ageMonths = 0;
        const birthDate = new Date(selectedChild.birthDate);
        const now = new Date();
        ageMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + now.getMonth() - birthDate.getMonth();
        if (ageMonths < 0) ageMonths = 0;

        payload = {
          childName: selectedChild.name,
          gender: selectedChild.gender,
          ageMonths,
          weightKg: latestRecord ? latestRecord.weightKg : selectedChild.birthWeight,
          heightCm: latestRecord ? latestRecord.heightCm : selectedChild.birthLength,
          query: customQuery || "Berikan evaluasi kesehatan secara umum.",
        };
      } else {
        if (!selectedMother) {
          throw new Error("Silakan pilih profil ibu hamil terlebih dahulu.");
        }
        payload = {
          childName: `Ibu ${selectedMother.name}`,
          gender: "Perempuan (Ibu Hamil)",
          ageMonths: selectedMother.age * 12, // representation
          weightKg: selectedMother.lilaCm, // approximate proxy
          heightCm: selectedMother.hbLevel, // proxy for payload
          query: `Kondisi kehamilan: ${selectedMother.pregnancyWeeks} minggu. LILA: ${selectedMother.lilaCm} cm. Hb: ${selectedMother.hbLevel} g/dL. Tensi: ${selectedMother.systolic}/${selectedMother.diastolic} mmHg. Pertanyaan: ${customQuery}`
        };
      }

      const res = await fetch("/api/consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menghubungi server asisten kesehatan.");
      }

      const data = await res.json();
      setAiResponse(data.advice);
      setApiSource(data.source);
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Gagal memproses sesi konsultasi AI. Silakan coba kembali.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to render text beautifully with HTML breaks and structured bullets
  const renderFormattedResponse = (text: string) => {
    return text.split("\n").map((line, idx) => {
      // Bold mapping (**bold**)
      let formattedLine = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      
      let match;
      const parts = [];
      let lastIndex = 0;
      
      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="text-slate-900 font-semibold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      const lineContent = parts.length > 0 ? parts : formattedLine;

      // Unordered lists
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return (
          <li key={idx} className="ml-5 list-disc text-sm text-slate-700 leading-relaxed mb-1.5">
            {line.trim().substring(2)}
          </li>
        );
      }
      
      // Ordered list numbered
      const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex gap-2 items-start text-sm text-slate-700 leading-relaxed mb-2 ml-2">
            <span className="font-semibold text-emerald-600 font-mono">{numMatch[1]}.</span>
            <span>{numMatch[2]}</span>
          </div>
        );
      }

      // Headings (match ### or ## or #)
      if (line.startsWith("### ")) {
        return <h5 key={idx} className="text-sm font-semibold text-slate-800 mt-4 mb-2">{line.substring(4)}</h5>;
      }
      if (line.startsWith("## ") || line.startsWith("# ")) {
        const headingText = line.startsWith("## ") ? line.substring(3) : line.substring(2);
        return <h4 key={idx} className="text-base font-bold text-slate-900 mt-5 border-l-3 border-emerald-500 pl-2 mb-2.5">{headingText}</h4>;
      }

      // Empty line
      if (line.trim() === "") {
        return <div key={idx} className="h-2.5"></div>;
      }

      // Paragraph
      return (
        <p key={idx} className="text-sm text-slate-700 leading-relaxed mb-2">
          {lineContent}
        </p>
      );
    });
  };

  return (
    <div className="bg-slate-55/40 rounded-3xl border border-slate-100 p-6 flex flex-col gap-6" id="asisten-ai-section">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-xl tracking-tight">
                Asisten Kesehatan Posyandu AI
              </h2>
              <p className="text-xs text-slate-500">
                Konsultasi medis cerdas penanganan stunting, evaluasi gizi, & perkembangan anak secara ilmiah.
              </p>
            </div>
          </div>
        </div>

        {/* Target selection toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => {
              setTargetType("balita");
              setAiResponse(null);
              setErrorText(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              targetType === "balita" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Konsultasi Balita
          </button>
          <button
            onClick={() => {
              setTargetType("ibu");
              setAiResponse(null);
              setErrorText(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              targetType === "ibu" ? "bg-white text-emerald-700 shadow-xs" : "text-slate-600 hover:text-slate-800"
            }`}
          >
            Konsultasi Ibu Hamil
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Input & Form Area */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
          <h3 className="font-medium text-slate-800 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Langkah 1: Hubungkan Profil Kesehatan
          </h3>

          {targetType === "balita" ? (
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Pilih Anak</label>
                {childrenList.length === 0 ? (
                  <p className="text-xs text-amber-600">Belum ada anak terdaftar. Daftarkan anak di tab Anak.</p>
                ) : (
                  <select
                    value={selectedBalitaId}
                    onChange={(e) => {
                      setSelectedBalitaId(e.target.value);
                      setAiResponse(null);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-semibold text-slate-700 focus:outline-emerald-500"
                    id="select-child-consult"
                  >
                    {childrenList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.gender})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedChild && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Berat Badan Terbaru:</span>
                    <span className="font-bold text-slate-800">
                      {latestRecord ? `${latestRecord.weightKg} kg` : `${selectedChild.birthWeight} kg (Kelahiran)`}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Tinggi Badan Terbaru:</span>
                    <span className="font-bold text-slate-800">
                      {latestRecord ? `${latestRecord.heightCm} cm` : `${selectedChild.birthLength} cm (Kelahiran)`}
                    </span>
                  </div>
                  {latestRecord && (
                    <div className="text-[11px] text-emerald-700 mt-1 flex flex-wrap gap-1">
                      <span className="bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
                        Nutrisi BB: {latestRecord.nutritionalStatus.weightForAge}
                      </span>
                      <span className="bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100">
                        TB/U: {latestRecord.nutritionalStatus.heightForAge}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Pilih Ibu Hamil</label>
                {mothersList.length === 0 ? (
                  <p className="text-xs text-amber-600">Belum ada Ibu Hamil terdaftar.</p>
                ) : (
                  <select
                    value={selectedIbuId}
                    onChange={(e) => {
                      setSelectedIbuId(e.target.value);
                      setAiResponse(null);
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-semibold text-slate-700 focus:outline-emerald-500"
                    id="select-mother-consult"
                  >
                    {mothersList.map((m) => (
                      <option key={m.id} value={m.id}>
                        Ibu {m.name} (Usia {m.age} thn)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedMother && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Usia Kehamilan:</span>
                    <span className="font-bold text-slate-800">{selectedMother.pregnancyWeeks} Minggu</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kadar Hemoglobin (Hb):</span>
                    <span className="font-bold text-slate-800">{selectedMother.hbLevel} g/dL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tensi Darah:</span>
                    <span className="font-bold text-slate-800">{selectedMother.systolic}/{selectedMother.diastolic} mmHg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kekurangan Energi Kronis (LILA):</span>
                    <span className={`font-bold ${selectedMother.lilaCm < 23.5 ? "text-rose-600 animate-pulse" : "text-slate-800"}`}>
                      {selectedMother.lilaCm} cm {selectedMother.lilaCm < 23.5 ? "(Kondisi KEK)" : "(Normal)"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-slate-100 pt-3">
            <h4 className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              Pertanyaan yang Sering Ditanyakan (Rekomendasi Cepat)
            </h4>
            <div className="flex flex-col gap-2">
              {(targetType === "balita" ? presetsBalita : presetsIbu).map((p, index) => (
                <button
                  key={index}
                  onClick={() => handlePresetClick(p.text)}
                  className="text-left text-xs bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 p-2.5 rounded-lg transition-all leading-snug"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAskAI} className="border-t border-slate-100 pt-3 flex flex-col gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Langkah 2: Ajukan Pertanyaan Anda
              </label>
              <textarea
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder={
                  targetType === "balita"
                    ? "Tulis pertanyaan tentang pemberian MPASI, perkembangan fisik, atau imunisasi di sini..."
                    : "Tanyakan keluhan hamil, suplemen zat besi, atau program persiapan ASI eksklusif pasca melahirkan..."
                }
                rows={3}
                className="w-full text-xs font-medium p-3 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl focus:outline-emerald-500 transition-all resize-none"
                id="ai-consult-query"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isLoading || (targetType === "balita" ? childrenList.length === 0 : mothersList.length === 0)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
              id="btn-ask-ai"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Menganalisis Klinis...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  Hubungi Dokter Asisten AI
                </>
              )}
            </button>
          </form>
        </div>

        {/* AI Answer Display Area */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs min-h-[420px] flex flex-col justify-between">
          <div className="flex-1">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <span className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Jawaban & Masukan Medis AI
              </span>
              {apiSource && (
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                    apiSource === "gemini_api"
                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                      : "bg-amber-100 text-amber-700 border border-amber-200"
                  }`}
                >
                  {apiSource === "gemini_api" ? "Server: Gemini Pro" : "Offline: Clinical Logic"}
                </span>
              )}
            </div>

            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20 gap-4" id="ai-loading-stage">
                <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin" />
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700">Asisten Cedas AI Sedang Berpikir...</p>
                  <p className="text-xs text-slate-400 mt-1">Mengalkulasi status antropometri WHO dan menyusun panduan medis kustom.</p>
                </div>
              </div>
            )}

            {!isLoading && !aiResponse && !errorText && (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4 text-slate-400">
                <MessageSquare className="w-12 h-12 text-slate-200" />
                <div>
                  <p className="text-sm font-semibold">Tunggu Masukan Medis</p>
                  <p className="text-xs max-w-xs mt-1">
                    Silakan pilih profil di sebelah kiri, pilih topik atau ketik pertanyaan, lalu klik tombol konsultasi.
                  </p>
                </div>
              </div>
            )}

            {errorText && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-xs flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Terjadi Gangguan</p>
                  <p className="mt-1">{errorText}</p>
                </div>
              </div>
            )}

            {aiResponse && !isLoading && (
              <div className="prose max-w-none text-slate-700 animate-fade-in" id="ai-response-doc">
                {renderFormattedResponse(aiResponse)}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 pt-4 mt-6 text-[10px] text-slate-400 leading-normal flex gap-1.5 items-start">
            <AlertCircle className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-0.5" />
            <span>
              Disclaimer: Seluruh saran medis kustom yang dihasilkan bersumber dari rujukan sistem cerdas AI serta referensi WHO. Rekomendasi ini bersifat edukatif penunjang dan tidak ditujukan sebagai pengganti mutlak diagnosis klinis resmi dari dokter spesialis anak atau bidan di Pustu/Puskesmas setempat.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
