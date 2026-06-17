import { Child, GrowthRecord, PregnantMother, PosyanduEvent, EducationArticle } from "./types";

// WHO Child Growth Standards approximate midpoints & standard deviations (SD) to calculate index
// For ease, we map weight-for-age (BB/U) and height-for-age (TB/U) from 0 to 24 months
export function calculateNutritionalStatus(
  gender: "Laki-laki" | "Perempuan",
  ageMonths: number,
  weightKg: number,
  heightCm: number
) {
  // Rough approximation of WHO Weight-for-Age (BB/U) Median & Standard Deviations
  // median_weight ≈ birth_weight (e.g. 3.2kg) + 0.75kg/mo (first 3mo), 0.6kg/mo (4-6mo), 0.5kg/mo (7-12mo), 0.25kg/mo (13-24mo)
  let wMedian = 3.2;
  let wSD = 0.4;
  
  if (gender === "Laki-laki") {
    wMedian = 3.3 + (ageMonths <= 3 ? ageMonths * 0.8 : ageMonths <= 6 ? 2.4 + (ageMonths - 3) * 0.6 : ageMonths <= 12 ? 4.2 + (ageMonths - 6) * 0.4 : 6.6 + (ageMonths - 12) * 0.25);
    wSD = 0.5 + ageMonths * 0.05;
  } else {
    wMedian = 3.2 + (ageMonths <= 3 ? ageMonths * 0.75 : ageMonths <= 6 ? 2.25 + (ageMonths - 3) * 0.55 : ageMonths <= 12 ? 3.9 + (ageMonths - 6) * 0.35 : 6.0 + (ageMonths - 12) * 0.22);
    wSD = 0.45 + ageMonths * 0.045;
  }

  // WHO Height-for-Age (TB/U) Median & SD approximations
  let hMedian = 50;
  let hSD = 2.0;

  if (gender === "Laki-laki") {
    hMedian = 50 + (ageMonths <= 3 ? ageMonths * 3.5 : ageMonths <= 6 ? 10.5 + (ageMonths - 3) * 2.2 : ageMonths <= 12 ? 17.1 + (ageMonths - 6) * 1.5 : 26.1 + (ageMonths - 12) * 0.85);
    hSD = 2.0 + ageMonths * 0.08;
  } else {
    hMedian = 49 + (ageMonths <= 3 ? ageMonths * 3.3 : ageMonths <= 6 ? 9.9 + (ageMonths - 3) * 2.1 : ageMonths <= 12 ? 16.2 + (ageMonths - 6) * 1.4 : 24.6 + (ageMonths - 12) * 0.8);
    hSD = 1.9 + ageMonths * 0.08;
  }

  // BB/U Status
  const weightZ = (weightKg - wMedian) / wSD;
  let weightForAge: GrowthRecord["nutritionalStatus"]["weightForAge"] = "Normal";
  if (weightZ < -3) weightForAge = "Sangat Kurang";
  else if (weightZ < -2) weightForAge = "Kurang";
  else if (weightZ > 2) weightForAge = "Risiko Gizi Lebih";

  // TB/U Status (Stunting Detector)
  const heightZ = (heightCm - hMedian) / hSD;
  let heightForAge: GrowthRecord["nutritionalStatus"]["heightForAge"] = "Normal";
  if (heightZ < -3) heightForAge = "Sangat Pendek (Severely Stunted)";
  else if (heightZ < -2) heightForAge = "Pendek (Stunted)";
  else if (heightZ > 2) heightForAge = "Tinggi";

  // BB/TB Status (Gizi Buruk / Baik / Obesitas approximation)
  // ideal weight for height ≈ BMI-based or direct reference ratio
  const idealWeightForHeight = (heightCm / 100) * (heightCm / 100) * 16.5; // ref BMI ~16.5
  const wRefRatio = weightKg / idealWeightForHeight;
  let weightForHeight: GrowthRecord["nutritionalStatus"]["weightForHeight"] = "Gizi Baik";
  if (wRefRatio < 0.7) weightForHeight = "Gizi Buruk";
  else if (wRefRatio < 0.85) weightForHeight = "Gizi Kurang";
  else if (wRefRatio > 1.30) weightForHeight = "Obesitas";
  else if (wRefRatio > 1.15) weightForHeight = "Risk Gizi Lebih";

  return { weightForAge, heightForAge, weightForHeight };
}

// -----------------------------------------
// INITIAL SAMPLE DATA IN INDONESIAN
// -----------------------------------------

const initialChildren: Child[] = [
  {
    id: "anak-1",
    name: "Arka Gibran Pratama",
    birthDate: "2025-10-14",
    gender: "Laki-laki",
    parentName: "Siti Rahma & Budi Pratama",
    parentPhone: "081234567890",
    birthWeight: 3.2,
    birthLength: 49,
    notes: "Partus normal, sehat, mendapat ASI Eksklusif.",
    createdAt: "2026-06-16T23:00:00Z"
  },
  {
    id: "anak-2",
    name: "Naila Safitri",
    birthDate: "2025-05-20",
    gender: "Perempuan",
    parentName: "Dewi Safitri & Ahmad Safitri",
    parentPhone: "085698765432",
    birthWeight: 2.9,
    birthLength: 48,
    notes: "Lahir cukup bulan, riwayat kuning ringan di hari ke-3.",
    createdAt: "2026-06-16T23:00:00Z"
  },
  {
    id: "anak-3",
    name: "Muhammad Rizky",
    birthDate: "2026-01-05",
    gender: "Laki-laki",
    parentName: "Rina Astuti & Heri Kurniawan",
    parentPhone: "089912345678",
    birthWeight: 3.5,
    birthLength: 50,
    notes: "Lahir Sectio Caesarea, imunisasi Hepatitis B0 lengkap.",
    createdAt: "2026-06-16T23:00:00Z"
  }
];

const initialGrowthRecords: GrowthRecord[] = [
  // Arka - Born Oct 2025. Now June 2026 (~8 months old)
  {
    id: "rec-arka-0",
    childId: "anak-1",
    date: "2025-10-14",
    ageMonths: 0,
    weightKg: 3.2,
    heightCm: 49,
    headCircumferenceCm: 34,
    notes: "Lahir baru",
    nutritionalStatus: calculateNutritionalStatus("Laki-laki", 0, 3.2, 49)
  },
  {
    id: "rec-arka-2",
    childId: "anak-1",
    date: "2025-12-14",
    ageMonths: 2,
    weightKg: 5.1,
    heightCm: 57,
    headCircumferenceCm: 38,
    notes: "Imunisasi DPT-HB-Hib 1 & Polio 2.",
    nutritionalStatus: calculateNutritionalStatus("Laki-laki", 2, 5.1, 57)
  },
  {
    id: "rec-arka-4",
    childId: "anak-1",
    date: "2026-02-14",
    ageMonths: 4,
    weightKg: 6.4,
    heightCm: 63,
    headCircumferenceCm: 41,
    notes: "Mendapat ASI eksklusif dengan lancar.",
    nutritionalStatus: calculateNutritionalStatus("Laki-laki", 4, 6.4, 63)
  },
  {
    id: "rec-arka-6",
    childId: "anak-1",
    date: "2026-04-14",
    ageMonths: 6,
    weightKg: 7.7,
    heightCm: 67,
    headCircumferenceCm: 43,
    notes: "Mulai MPASI buah lumat, imunisasi PCV 2.",
    nutritionalStatus: calculateNutritionalStatus("Laki-laki", 6, 7.7, 67)
  },
  {
    id: "rec-arka-8",
    childId: "anak-1",
    date: "2026-06-14",
    ageMonths: 8,
    weightKg: 8.5,
    heightCm: 70,
    headCircumferenceCm: 45,
    notes: "Masuk MPASI bubur tim saring, tumbuh aktif.",
    nutritionalStatus: calculateNutritionalStatus("Laki-laki", 8, 8.5, 70)
  },

  // Naila - Born May 2025. Now June 2026 (~13 months old)
  {
    id: "rec-naila-0",
    childId: "anak-2",
    date: "2025-05-20",
    ageMonths: 0,
    weightKg: 2.9,
    heightCm: 48,
    headCircumferenceCm: 33,
    notes: "Lahir normal sehat.",
    nutritionalStatus: calculateNutritionalStatus("Perempuan", 0, 2.9, 48)
  },
  {
    id: "rec-naila-3",
    childId: "anak-2",
    date: "2025-08-20",
    ageMonths: 3,
    weightKg: 5.3,
    heightCm: 59,
    headCircumferenceCm: 39,
    notes: "Tumbuh kembang normal.",
    nutritionalStatus: calculateNutritionalStatus("Perempuan", 3, 5.3, 59)
  },
  {
    id: "rec-naila-6",
    childId: "anak-2",
    date: "2025-11-20",
    ageMonths: 6,
    weightKg: 6.9,
    heightCm: 65,
    headCircumferenceCm: 42,
    notes: "Berat badan di garis tengah KMS.",
    nutritionalStatus: calculateNutritionalStatus("Perempuan", 6, 6.9, 65)
  },
  {
    id: "rec-naila-9",
    childId: "anak-2",
    date: "2026-02-20",
    ageMonths: 9,
    weightKg: 7.6,
    heightCm: 69,
    headCircumferenceCm: 43.5,
    notes: "Riwayat pilek ringan minggu lalu.",
    nutritionalStatus: calculateNutritionalStatus("Perempuan", 9, 7.6, 69)
  },
  {
    id: "rec-naila-12",
    childId: "anak-2",
    date: "2026-05-20",
    ageMonths: 12,
    weightKg: 8.7,
    heightCm: 74,
    headCircumferenceCm: 45,
    notes: "Lancar merangkak dan mulai berdiri berpegangan.",
    nutritionalStatus: calculateNutritionalStatus("Perempuan", 12, 8.7, 74)
  },

  // Rizky - Born Jan 2026. Now June 2026 (~5 months old)
  {
    id: "rec-rizky-0",
    childId: "anak-3",
    date: "2026-01-05",
    ageMonths: 0,
    weightKg: 3.5,
    heightCm: 50,
    headCircumferenceCm: 35,
    notes: "Kondisi sehat bugar.",
    nutritionalStatus: calculateNutritionalStatus("Laki-laki", 0, 3.5, 50)
  },
  {
    id: "rec-rizky-2",
    childId: "anak-3",
    date: "2026-03-05",
    ageMonths: 2,
    weightKg: 5.4,
    heightCm: 57,
    headCircumferenceCm: 38.5,
    notes: "ASI lancar, aktif berguling miring.",
    nutritionalStatus: calculateNutritionalStatus("Laki-laki", 2, 5.4, 57)
  },
  {
    id: "rec-rizky-4",
    childId: "anak-3",
    date: "2026-05-05",
    ageMonths: 4,
    weightKg: 6.8,
    heightCm: 62,
    headCircumferenceCm: 41.5,
    notes: "Imunisasi DPT 2, Polio 3.",
    nutritionalStatus: calculateNutritionalStatus("Laki-laki", 4, 6.8, 62)
  }
];

const initialPregnantMothers: PregnantMother[] = [
  {
    id: "ibu-1",
    name: "Kania Wardhani",
    age: 28,
    pregnancyWeeks: 24,
    husbandName: "Surya Wijaya",
    phone: "081223344558",
    lilaCm: 25.5,
    hbLevel: 11.8,
    systolic: 110,
    diastolic: 75,
    ironTabletsTaken: 60,
    immunizationTd: true,
    notes: "Nyeri punggung bawah ringan, disarankan senam hamil mandiri.",
    createdAt: "2026-06-16T23:10:00Z"
  },
  {
    id: "ibu-2",
    name: "Diana Lestari",
    age: 32,
    pregnancyWeeks: 34,
    husbandName: "Tommy Aditya",
    phone: "087788991122",
    lilaCm: 22.8,
    hbLevel: 10.5,
    systolic: 125,
    diastolic: 80,
    ironTabletsTaken: 85,
    immunizationTd: true,
    notes: "Kadar Hb cenderung rendah, cadre menyarankan asupan hati sapi dan sayuran hijau.",
    createdAt: "2026-06-16T23:10:00Z"
  }
];

const initialEvents: PosyanduEvent[] = [
  {
    id: "ev-1",
    name: "Layanan Rutin Penimbangan & Konsultasi KB Gizi",
    date: "2026-06-20",
    time: "08:00 - 11:30 WIB",
    location: "Balai Warga RW 05 Melati",
    category: "Penimbangan",
    description: "Kegiatan rutin bulanan meliputi pengukuran BB, TB, LK, imunisasi dasar, serta penyuluhan pencegahan stunting balita."
  },
  {
    id: "ev-2",
    name: "Kampanye Imunisasi Campak & PCV Tambahan",
    date: "2026-06-25",
    time: "08:30 - 12:00 WIB",
    location: "Puskesmas Pembantu RW 05",
    category: "Imunisasi",
    description: "Pemberian vaksin PCV dosis 3 dan campak tambahan bagi semua batita usia 9-24 bulan gratis."
  },
  {
    id: "ev-3",
    name: "Sosialisasi MPASI Bergizi Kaya Protein Hewani",
    date: "2026-07-02",
    time: "09:00 - 11:00 WIB",
    location: "Aula Kantor Kelurahan",
    category: "Penyuluhan",
    description: "Demontrasi memasak MPASI praktis dan hemat berbasis bahan pangan lokal kaya telur dan ikan oleh Ahli Gizi Puskesmas."
  }
];

const initialArticles: EducationArticle[] = [
  {
    id: "art-1",
    title: "Mengenal Stunting & Langkah Utama Pencegahannya",
    category: "Stunting",
    readTime: "5 menit",
    snippet: "Stunting adalah gangguan pertumbuhan anak yang disebabkan oleh kekurangan gizi kronis di 1000 Hari Pertama Kehidupan (HPK).",
    content: `Stunting adalah kondisi kegagalan tumbuh pada anak di bawah usia lima tahun akibat kekurangan gizi kronis dan paparan infeksi berulang. Anak stunting umumnya memiliki panjang atau tinggi badan yang tidak sesuai jika dibandingkan dengan usia sekelasnya.

**Pentingnya 1000 Hari Pertama Kehidupan (HPK):**
1000 HPK terhitung sejak hari pertama kehamilan (konsepsi) hingga anak berusia 2 tahun. Ini adalah masa emas pembentukan otak dan organ vital anak. Kekurangan gizi pada masa ini berisiko permanen terhadap produktivitas dan IQ anak nantinya.

**Aksi Nyata Cegah Stunting:**
1. **Selama Kehamilan:** Ibu hamil wajib mengonsumsi minimal 90 tablet tambah darah (TTD), makan makanan proporsional seimbang (kaya protein dan zat besi), serta memeriksakan kehamilan minimal 6 kali ke tenaga medis.
2. **Saat Kelahiran:** Lakukan Inisiasi Menyusu Dini (IMD) agar bayi mendapat kolostrum (asi pertama yang kaya zat kekebalan).
3. **Balita Usia 0-6 bulan:** Berikan Air Susu Ibu (ASI) eksklusif secara penuh tanpa tambahan air putih atau susu formula komersial.
4. **Balita Usia 6-24 bulan:** Berikan MPASI berkualitas tinggi yang berfokus pada **protein hewani** (seperti kuning telur, ayam blender, ikan kembung, daging sapi halus) karena mengandung rantai asam amino kompleks terbaik yang menstimulasi hormon pertumbuhan sel tulang anak.
5. **Kebersihan Lingkungan:** Pastikan akses jamban sehat, pola cuci tangan pakai sabun, serta sirkulasi air bersih yang higienis untuk menjauhi penyakit diare yang menguras energi nutrisi bayi.`
  },
  {
    id: "art-2",
    title: "Panduan MPASI Sehat Berbasis Protein Hewani",
    category: "Nutrisi & Gizi",
    readTime: "4 menit",
    snippet: "Protein hewani berperan penting dalam mencegah stunting. Temukan menu ideal untuk gizi anak optimal.",
    content: `Memasuki usia 6 bulan, kebutuhan energi bayi tidak lagi cukup dipenuhi hanya dari ASI saja. Oleh karena itu, bayi memerlukan Makanan Pendamping ASI (MPASI) yang diberikan bertahap tingkat kekentalannya.

**Mengapa Protein Hewani Sangat Vital?**
Penelitian global membuktikan ketersediaan zat gizi mikro dan kadar asam amino esensial lengkap pada sumber hewani jauh melampaui protein nabati (seperti tahu/tempe saja). Protein hewani (asam amino esensial) bekerja langsung mengaktifkan jaras hormonal IGF-1 (Insulin-like Growth Factor) untuk mendukung kelancaran pemanjangan lempeng tulang anak.

**Contoh Sumber Protein Hewani Murah Gampang Didapat:**
1. **Telur Ayam/Bebek:** Mudah dicerna, terjangkau, dan mengandung lemak tinggi berfaedah untuk jaringan otak anak.
2. **Ikan Kembung:** Kandungan Omega 3-nya setara bahkan beberapa riset menyebut melampaui ikan salmon impor! Sangat mendongkrak kecerdasan bayi.
3. **Hati Ayam:** Sumber Zat Besi (Fe) paling ampuh dan mudah diserap tubuh bayi demi mencegah anemia gizi besi yang membuat nafsu makan anak lesu.

**Jadwal Tekstur MPASI:**
- **6-8 Bulan:** Bubur lumat halus (puree) konsistensi kental (tidak gampang tumpah saat sendok dimiringkan).
- **9-11 Bulan:** Bubur tim dicincang halus kasar atau nasi lembek dengan saringan longgar.
- **12 Bulan Ke Atas:** Makanan keluarga dengan porsi yang disesuaikan ukuran lambung si kecil.`
  },
  {
    id: "art-3",
    title: "Daftar Lengkap Imunisasi Dasar Wajib Balita",
    category: "Imunisasi",
    readTime: "6 menit",
    snippet: "Imunisasi lengkap menjaga si kecil dari serangan virus polio, difteri, pertusis, campak, hingga radang paru PCV.",
    content: `Imunisasi adalah modal utama pertahanan imun si kecil dari bahaya penyakit menular mematikan (PD3I) yang bisa memicu malnutrisi atau memperberat stunting. Jadwal imunisasi nasional secara gratis diselenggarakan rutin setiap bulan di Posyandu setempat.

**Jadwal Rekomendasi Kementerian Kesehatan RI:**
1. **Bayi Usia < 24 Jam:** Vaksin Hepatitis B-0 (mencegah kanker hati kronis).
2. **Bayi Usia 1 Bulan:** Vaksin BCG (mencegah TBC paru berat) & Polio Tetes 1.
3. **Bayi Usia 2 Bulan:** Vaksin DPT-HB-Hib 1, Polio Tetes 2, serta Vaksin PCV 1 (mencegah pneumonia/radang paru).
4. **Bayi Usia 3 Bulan:** Vaksin DPT-HB-Hib 2 & Polio Tetes 3.
5. **Bayi Usia 4 Bulan:** Vaksin DPT-HB-Hib 3, Polio Tetes 4, & Polio Suntik (IPV) 1.
6. **Bayi Usia 9 Bulan:** Vaksin Campak-Rubela (MR) 1.
7. **Bayi Usia 10 Bulan:** Vaksin PCV 2.
8. **Bayi Usia 12 Bulan:** Vaksin PCV 3.
9. **Anak Usia 18 Bulan:** Imunisasi lanjutan DPT-HB-Hib booster & Campak-Rubela (MR) booster.

**Mengapa Anak Demam Pasca-Imunisasi?**
Demam ringan adalah reaksi tubuh yang normal (Kajian KIPI ringan) pertanda sistem antibodi anak sedang merespons agen antigen dalam vaksin untuk membentuk kekebalan alami. Ayah/Bunda cukup memakaikan pakaian tipis, memberi kompres air hangat di lipat ketiak, menyusui sesering mungkin, serta memberi obat parasetamol cair sesuai dosis tenaga kesehatan.`
  }
];

// -----------------------------------------
// DATASTORE MANAGER WITH LOCALSTORAGE
// -----------------------------------------

export class DataStore {
  // Children
  static getChildren(): Child[] {
    const data = localStorage.getItem("posyandu_children");
    if (!data) {
      localStorage.setItem("posyandu_children", JSON.stringify(initialChildren));
      return initialChildren;
    }
    return JSON.parse(data);
  }

  static saveChild(child: Omit<Child, "id" | "createdAt">): Child {
    const children = this.getChildren();
    const newChild: Child = {
      ...child,
      id: "child-" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    children.push(newChild);
    localStorage.setItem("posyandu_children", JSON.stringify(children));
    
    // Save birth weight & height as age 0 growth record
    this.saveGrowthRecord({
      childId: newChild.id,
      date: newChild.birthDate,
      ageMonths: 0,
      weightKg: newChild.birthWeight,
      heightCm: newChild.birthLength,
      headCircumferenceCm: 33,
      notes: "Berat & Tinggi Lahir Utama"
    });

    return newChild;
  }

  static updateChild(child: Child): Child {
    const children = this.getChildren();
    const idx = children.findIndex((c) => c.id === child.id);
    if (idx !== -1) {
      children[idx] = child;
      localStorage.setItem("posyandu_children", JSON.stringify(children));
    }
    return child;
  }

  static deleteChild(id: string): void {
    const children = this.getChildren();
    const updated = children.filter((c) => c.id !== id);
    localStorage.setItem("posyandu_children", JSON.stringify(updated));

    // Also delete child's growth records
    const records = this.getGrowthRecords();
    const recordsUpdated = records.filter((r) => r.childId !== id);
    localStorage.setItem("posyandu_growth_records", JSON.stringify(recordsUpdated));
  }

  // Growth Records
  static getGrowthRecords(): GrowthRecord[] {
    const data = localStorage.getItem("posyandu_growth_records");
    if (!data) {
      localStorage.setItem("posyandu_growth_records", JSON.stringify(initialGrowthRecords));
      return initialGrowthRecords;
    }
    return JSON.parse(data);
  }

  static saveGrowthRecord(record: Omit<GrowthRecord, "id" | "nutritionalStatus">): GrowthRecord {
    const records = this.getGrowthRecords();
    const child = this.getChildren().find((c) => c.id === record.childId);
    const gender = child ? child.gender : "Laki-laki";

    const nutritionalStatus = calculateNutritionalStatus(
      gender,
      record.ageMonths,
      record.weightKg,
      record.heightCm
    );

    const newRecord: GrowthRecord = {
      ...record,
      id: "rec-" + Math.random().toString(36).substr(2, 9),
      nutritionalStatus
    };

    records.push(newRecord);
    // Sort records by age so charts draw sequentially
    records.sort((a, b) => a.ageMonths - b.ageMonths);
    localStorage.setItem("posyandu_growth_records", JSON.stringify(records));
    return newRecord;
  }

  static deleteGrowthRecord(id: string): void {
    const records = this.getGrowthRecords();
    const updated = records.filter((r) => r.id !== id);
    localStorage.setItem("posyandu_growth_records", JSON.stringify(updated));
  }

  // Pregnant Mothers
  static getPregnantMothers(): PregnantMother[] {
    const data = localStorage.getItem("posyandu_pregnant_mothers");
    if (!data) {
      localStorage.setItem("posyandu_pregnant_mothers", JSON.stringify(initialPregnantMothers));
      return initialPregnantMothers;
    }
    return JSON.parse(data);
  }

  static savePregnantMother(mother: Omit<PregnantMother, "id" | "createdAt">): PregnantMother {
    const mothers = this.getPregnantMothers();
    const newMother: PregnantMother = {
      ...mother,
      id: "ibu-" + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    mothers.push(newMother);
    localStorage.setItem("posyandu_pregnant_mothers", JSON.stringify(mothers));
    return newMother;
  }

  static updatePregnantMother(mother: PregnantMother): PregnantMother {
    const mothers = this.getPregnantMothers();
    const idx = mothers.findIndex((m) => m.id === mother.id);
    if (idx !== -1) {
      mothers[idx] = mother;
      localStorage.setItem("posyandu_pregnant_mothers", JSON.stringify(mothers));
    }
    return mother;
  }

  static deletePregnantMother(id: string): void {
    const mothers = this.getPregnantMothers();
    const updated = mothers.filter((m) => m.id !== id);
    localStorage.setItem("posyandu_pregnant_mothers", JSON.stringify(updated));
  }

  // Events
  static getEvents(): PosyanduEvent[] {
    const data = localStorage.getItem("posyandu_events");
    if (!data) {
      localStorage.setItem("posyandu_events", JSON.stringify(initialEvents));
      return initialEvents;
    }
    return JSON.parse(data);
  }

  static saveEvent(event: Omit<PosyanduEvent, "id">): PosyanduEvent {
    const events = this.getEvents();
    const newEvent: PosyanduEvent = {
      ...event,
      id: "ev-" + Math.random().toString(36).substr(2, 9)
    };
    events.push(newEvent);
    localStorage.setItem("posyandu_events", JSON.stringify(events));
    return newEvent;
  }

  // Articles
  static getArticles(): EducationArticle[] {
    const data = localStorage.getItem("posyandu_articles");
    if (!data) {
      localStorage.setItem("posyandu_articles", JSON.stringify(initialArticles));
      return initialArticles;
    }
    return JSON.parse(data);
  }
}
