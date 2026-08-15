export interface ProblemStatement {
  id: string;
  roleTitle: string;
  incidentTitle: string;
  narrative: string;
  objectives: string[];
  alerts: {
    label: string;
    value: string;
    tone: "warning" | "danger";
  }[];
}

export const DEFAULT_PROBLEM_STATEMENT: ProblemStatement = {
  id: "default",
  roleTitle: "Data Center Technician",
  incidentTitle: "Kenaikan Suhu Rack B-14 & Alarm CRAC #3",
  narrative:
    "Situasi awal terjadi di ruang data center ketika monitoring menunjukkan kenaikan temperatur Rack B-14 dari 24°C menjadi 32°C. Pada saat yang sama CRAC #3 mengeluarkan alarm. Kenaikan temperatur bukan sekadar angka monitoring: jika pendinginan tidak kembali normal, server dapat mengalami throttling, thermal shutdown, gangguan layanan, dan potensi pelanggaran SLA. Karena operator bekerja sendirian pada shift malam, keputusan harus dilakukan secara terukur: verifikasi data dan kondisi perangkat terlebih dahulu, menjaga layanan tetap tersedia, menggunakan jalur eskalasi yang benar, dan menghindari tindakan fisik yang dapat menimbulkan gangguan baru.",
  objectives: [
    "Verifikasi data dan kondisi perangkat terlebih dahulu",
    "Menjaga layanan tetap tersedia",
    "Menggunakan jalur eskalasi yang benar",
    "Menghindari tindakan fisik yang dapat menimbulkan gangguan baru",
  ],
  alerts: [
    { label: "Rack B-14", value: "24°C → 32°C", tone: "warning" },
    { label: "CRAC #3", value: "ALARM AKTIF", tone: "danger" },
  ],
};
