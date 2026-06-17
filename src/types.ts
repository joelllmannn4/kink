export interface Child {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: "Laki-laki" | "Perempuan";
  parentName: string;
  parentPhone: string;
  birthWeight: number; // kg
  birthLength: number; // cm
  notes?: string;
  createdAt: string;
}

export interface GrowthRecord {
  id: string;
  childId: string;
  date: string; // YYYY-MM-DD
  ageMonths: number;
  weightKg: number;
  heightCm: number;
  headCircumferenceCm?: number;
  notes?: string;
  nutritionalStatus: {
    weightForAge: "Sangat Kurang" | "Kurang" | "Normal" | "Risiko Gizi Lebih";
    heightForAge: "Sangat Pendek (Severely Stunted)" | "Pendek (Stunted)" | "Normal" | "Tinggi";
    weightForHeight: "Gizi Buruk" | "Gizi Kurang" | "Gizi Baik" | "Risk Gizi Lebih" | "Obesitas";
  };
}

export interface PregnantMother {
  id: string;
  name: string;
  age: number;
  pregnancyWeeks: number;
  husbandName: string;
  phone: string;
  lilaCm: number; // lingkar lengan atas
  hbLevel: number; // hemoglobin level
  systolic: number; // tensi sistolik
  diastolic: number; // tensi diastolik
  ironTabletsTaken: number;
  immunizationTd: boolean; // Tetanus diphteria
  notes?: string;
  createdAt: string;
}

export interface PosyanduEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  category: "Penimbangan" | "Imunisasi" | "Penyuluhan" | "Pemberian Vitamin & PMS";
  description: string;
}

export interface EducationArticle {
  id: string;
  title: string;
  category: "Nutrisi & Gizi" | "Imunisasi" | "Kesehatan Ibu" | "Stunting";
  snippet: string;
  content: string;
  readTime: string;
}
