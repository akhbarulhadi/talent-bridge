const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'app');

const replacements = [
  { from: /SkillDock/g, to: 'Talent Bridge' },
  { from: /skilldock/gi, to: 'talent-bridge' },
  { from: />Masuk</g, to: '>Sign In<' },
  { from: />Daftar Sekarang</g, to: '>Register Now<' },
  { from: /Kembali ke Beranda/g, to: 'Back to Home' },
  { from: />Belum punya akun\?</g, to: '>Don\'t have an account?<' },
  { from: />Sudah punya akun\?</g, to: '>Already have an account?<' },
  { from: /Kembali ke Daftar Judul Simulasi/g, to: 'Back to Simulation Title List' },
  { from: /Daftar kandidat pengguna dengan role talent beserta skor dan target job./g, to: 'List of talent candidates along with scores and target jobs.' },
  { from: /Kelola daftar lowongan pekerjaan, lokasi, minimum skor, jumlah pelamar, dan status visibilitas./g, to: 'Manage job vacancies, locations, minimum score, number of applicants, and visibility status.' },
  { from: /Filter daftar talent berdasarkan pencarian HR/g, to: 'Filter talent list based on HR search' },
  { from: /Pilih Talent/g, to: 'Select Talent' },
  { from: /Silakan pilih salah satu talent yang valid dari daftar pencarian./g, to: 'Please select a valid talent from the search list.' },
  { from: /Kirim pesan atau undangan wawancara langsung ke email talent terdaftar./g, to: 'Send messages or interview invitations directly to registered talent emails.' },
  { from: /Mengambil semua daftar jobs/g, to: 'Fetching all job listings' },
  { from: />Simulasi</g, to: '>Simulation<' },
  { from: />Pengaturan</g, to: '>Settings<' },
  { from: />Keluar</g, to: '>Logout<' },
  { from: /Pesan dari Tim HR/g, to: 'Message from HR Team' },
  { from: /Contoh: Undangan Interview/g, to: 'Example: Interview Invitation' },
  { from: /Talent Pool/g, to: 'Talent Pool' }, // Already english but just in case
  { from: /Dashboard/g, to: 'Dashboard' }
];

function translateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  
  for (const { from, to } of replacements) {
    newContent = newContent.replace(from, to);
  }
  
  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Translated:', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      translateFile(fullPath);
    }
  }
}

walkDir(directoryPath);
console.log('Done translating strings.');
