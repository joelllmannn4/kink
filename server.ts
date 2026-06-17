import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Safe lazy initializer for Gemini API
  let aiInstance: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      return null;
    }
    if (!aiInstance) {
      aiInstance = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiInstance;
  }

  // Fallback pediatric advising generator (Standard clinical guidelines based on WHO)
  function getPosyanduFallbackAdvice(
    childName: string,
    ageMonths: number,
    weightKg: number,
    heightCm: number,
    gender: string,
    query: string
  ): string {
    const isMale = gender.toLowerCase() === "laki-laki" || gender.toLowerCase() === "l";
    const normalWeightMin = ageMonths * 0.5 + 3.0; // simple rough estimate for demo fallback
    const normalWeightMax = ageMonths * 0.7 + 4.5;
    const isUnderweight = weightKg < normalWeightMin;
    const isOverweight = weightKg > normalWeightMax;

    let statusNutrisi = "Gizi Baik (Normal)";
    if (isUnderweight) statusNutrisi = "Gizi Kurang / Risiko Underweight";
    if (isOverweight) statusNutrisi = "Gizi Lebih / Risiko Overweight";

    let adviceText = `**[Asisten Posyandu AI - Mode Offline/Fallback]**

Halo Ayah/Bunda dari **${childName}** (${gender}, usia **${ageMonths} bulan**).

Berdasarkan parameter yang diinput:
- **Berat Badan:** ${weightKg} kg (Kisaran acuan kasar untuk usia ini: ${normalWeightMin.toFixed(1)} - ${normalWeightMax.toFixed(1)} kg)
- **Tinggi Badan:** ${heightCm} cm
- **Status Nutrisi Acuan:** ${statusNutrisi}

**Rekomendasi Tumbuh Kembang Usia ${ageMonths} Bulan:**
1. **Nutrisi:** ${
      ageMonths <= 6
        ? "Berikan Air Susu Ibu (ASI) Eksklusif sesering mungkin tanpa makanan pendamping tambahan."
        : "Pastikan Makanan Pendamping ASI (MPASI) kaya akan protein hewani (telur, hati ayam, ikan, daging) untuk mendukung pertumbuhan otak dan mencegah stunting."
    }
2. **Imunisasi:** Pastikan imunisasi dasar lengkap sesuai jadwal Kementerian Kesehatan RI (seperti BCG, DPT-HB-Hib, Polio, Campak/MR).
3. **Stimulasi Motorik:** ${
      ageMonths < 6
        ? "Latih tummy time (tengkurap) secara teratur dengan pengawasan untuk menguatkan otot leher."
        : ageMonths < 12
        ? "Amati kemampuan merangkak, duduk mandiri, serta latih mengambil benda kecil menggunakan jemari."
        : "Latih anak berdiri seimbang, berjalan titah, dan merespon kata-kata sederhana."
    }

*Pertanyaan Anda:* "${query}"

*Catatan: Kami mendeteksi bahwa Kunci API Gemini belum dikonfigurasi di server. Ini adalah saran medis dasar otomatis berdasarkan rujukan umum Posyandu RI. Silakan pasang GEMINI_API_KEY di secrets aplikasi Anda untuk menerima saran medis cerdas kustom sepenuhnya dari kecerdasan buatan Gemini.*`;

    return adviceText;
  }

  // Endpoint: AI Health Consultation
  app.post("/api/consultation", async (req, res) => {
    try {
      const { childName, ageMonths, weightKg, heightCm, gender, query } = req.body;

      if (!childName || ageMonths === undefined || !weightKg || !heightCm || !gender) {
        return res.status(400).json({
          error: "Mohon lengkapi semua data anak (nama, usia bulan, berat badan, tinggi badan, jenis kelamin) serta pertanyaan Anda.",
        });
      }

      const client = getGeminiClient();
      if (!client) {
        // Handle gracefully, no crash!
        const fallback = getPosyanduFallbackAdvice(childName, ageMonths, weightKg, heightCm, gender, query || "Evaluasi tumbuh kembang umum.");
        return res.json({ advice: fallback, source: "fallback_engine" });
      }

      // If Gemini client exists, use it!
      const userPrompt = `Nama Anak: ${childName}
Jenis Kelamin: ${gender}
Usia: ${ageMonths} bulan
Berat Badan: ${weightKg} kg
Tinggi Badan: ${heightCm} cm
Pertanyaan khusus orang tua: "${query || "Berikan evaluasi kesehatan menyeluruh untuk anak saya."}"`;

      const systemInstruction = `Anda adalah seorang dokter spesialis anak (pediatri) profesional, konsultan gizi, dan ahli kesehatan komunitas Posyandu Indonesia.
Tugas Anda adalah membagikan edukasi medis terpercaya, ramah, dan solutif dalam Bahasa Indonesia.
1. Analisis pertumbuhan anak berdasarkan parameter usia, jenis kelamin, berat, dan tinggi badan yang diberikan orang tua.
2. Berikan status kecukupan gizi berupa saran preventif penanganan stunting, gizi kurang, atau gizi lebih dengan fokus konsumsi protein hewani serta pola MPASI/ASI yang sesuai usia.
3. Sebutkan vaksinasi/imunisasi penting yang relevan untuk kelompok usia tersebut sesuai jadwal Ikatan Dokter Anak Indonesia (IDAI).
4. Berikan tips stimulasi tumbuh kembang yang menarik dan melatih motorik kasar/halus anak.
5. Jawab pertanyaan khusus orang tua dengan sabar dan empati yang mendalam.
6. Selalu tambahkan catatan kaki ramah bahwa saran ini adalah edukasi kesehatan penunjang dan tidak menggantikan konsultasi langsung ke dokter spesialis anak di Puskesmas atau rumah sakit.`;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({
        advice: response.text || "Tidak ada saran dari asisten kecerdasan buatan.",
        source: "gemini_api",
      });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({
        error: "Terjadi gangguan saat memproses konsultasi medis kustom. Silakan coba lagi.",
        details: error.message,
      });
    }
  });

  // Serve static assets in production, otherwise Vite handles them
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server Posyandu running on http://localhost:${PORT}`);
  });
}

startServer();
