-- ============================================================================
-- SEED DATA — "Cybersecurity Analyst" / "Suspicious Login & Potential Breach"
-- ============================================================================
-- Inserts master/config data only (mst_title, mst_skenario,
-- mst_problem_statement, mst_decision). No schema changes. Safe to re-run:
-- problem statements + scenario are upserted by fixed id, and each node's
-- decisions are deleted + re-inserted so re-running never duplicates rows.
--
-- Node codes like "TK1", "TK1A", "TK2X" only exist as comments here to help
-- you read the tree — they are never stored in the database. The real
-- identity of every node is its UUID, and `mst_decision.next_problem_statement_id`
-- is the only thing that determines branching.
--
-- Run this in the Supabase SQL editor.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 0. Title + Scenario
-- ----------------------------------------------------------------------------

insert into public.mst_title (id, name)
select '99999999-0000-0000-0000-000000000002', 'Cybersecurity Analyst'
where not exists (
  select 1 from public.mst_title where name = 'Cybersecurity Analyst'
);

-- ----------------------------------------------------------------------------
-- 1. Problem statement nodes (fixed ids so decisions below can reference
--    them directly).
-- ----------------------------------------------------------------------------

insert into public.mst_problem_statement (id, briefing_awal) values
-- TK1 (root)
('22222222-1111-1111-1111-111111111101',
 'Akun admin login dari IP asing pukul 03.20 dan terdapat percobaan akses file konfigurasi klien. Pengguna harus mengurangi access window secepat mungkin. Mengamati terlalu lama dapat memberi kesempatan kepada pihak tidak sah untuk membaca atau mengambil data. Namun containment juga harus dilakukan secara terukur agar bukti investigasi tetap dapat dianalisis.'),

-- TK1A — Data breach
('22222222-1111-1111-1111-111111111102',
 'File konfigurasi terunduh karena aktivitas mencurigakan tidak segera dihentikan. Insiden kini meningkat dari suspicious login menjadi dugaan kebocoran data. Analyst harus melakukan containment dan breach response, sambil mempertahankan informasi yang diperlukan untuk menentukan apa yang diakses, kapan, dari mana, dan apakah ada aktivitas lanjutan. Hanya mengganti password satu akun belum tentu cukup karena jejak kompromi dapat melibatkan akun lain.'),

-- TK1B — Extended access window
('22222222-1111-1111-1111-111111111103',
 'Operator memilih menghubungi pemilik akun sementara sesi penyerang masih aktif. Waktu akses menjadi lebih panjang dan attacker berpotensi melakukan aktivitas tambahan. Masalah utama sekarang adalah containment yang terlambat. Pengguna harus menghentikan akses terlebih dahulu, lalu melakukan komunikasi dan investigasi secara terstruktur.'),

-- TK1X
('22222222-1111-1111-1111-111111111104',
 'Akun utama telah ditangani, tetapi indikator menunjukkan kemungkinan adanya sesi aktif atau akun lain yang berhubungan dengan aktivitas mencurigakan. Menghentikan satu kredensial tanpa memeriksa hubungan aktivitas dapat membuat akses tidak sah tetap berlangsung.'),

-- TK1X-2 (negative branch recovery target from TK1X)
('22222222-1111-1111-1111-111111111105',
 'Kredensial lain yang berhubungan belum diperiksa sehingga indikator kompromi tambahan berisiko luput dari investigasi.'),

-- TK1Y
('22222222-1111-1111-1111-111111111106',
 'Aktivitas akses tambahan terdeteksi setelah containment terlambat. Analyst harus menentukan apakah aktivitas tersebut berasal dari sesi yang sama, akun lain, atau indikator kompromi yang berbeda.'),

-- TK1Y-2 (negative branch recovery target from TK1Y)
('22222222-1111-1111-1111-111111111107',
 'Aktivitas tambahan dibiarkan tanpa korelasi sehingga sumber akses tidak sah tetap tidak teridentifikasi.'),

-- TK2 — Account contained
('22222222-1111-1111-1111-111111111108',
 'Containment terhadap akun berhasil, tetapi containment bukan bukti bahwa insiden telah selesai. Analyst harus mencari indikator kompromi lain melalui log, authentication events, file access, dan IoC yang relevan. Menganggap akun terkunci sebagai akhir dapat membuat attacker yang telah memiliki akses lain tetap tidak terdeteksi.'),

-- TK2A — Repeat compromise
('22222222-1111-1111-1111-111111111109',
 'Akun lain kembali menunjukkan tanda kompromi karena investigasi sebelumnya dihentikan terlalu cepat. Ini menunjukkan bahwa sumber serangan atau persistence belum teridentifikasi. Pengguna perlu memperluas korelasi log dan IoC untuk menemukan pola yang menghubungkan aktivitas antar-akun atau endpoint.'),

-- TK2B — Operational access disruption
('22222222-1111-1111-1111-111111111110',
 'Reset password seluruh admin secara massal dilakukan tanpa menilai kebutuhan dan dampaknya. Akibatnya akses operasional yang sah dapat terganggu. Analyst harus menyeimbangkan containment dengan availability. Pemulihan harus berbasis evidence dan segmentasi risiko, bukan tindakan massal yang tidak terkontrol.'),

-- TK2X
('22222222-1111-1111-1111-111111111111',
 'Tindakan blocking dilakukan secara massal tanpa evidence yang cukup sehingga akses yang sah berpotensi ikut terganggu. Analyst harus mengembalikan proses containment menjadi evidence-based.'),

-- TK2X-2 (negative branch recovery target from TK2X)
('22222222-1111-1111-1111-111111111112',
 'Containment yang dilakukan tanpa evidence menyebabkan sebagian akses sah masih belum dipulihkan.'),

-- TK2Y
('22222222-1111-1111-1111-111111111113',
 'Investigasi dihentikan sementara indikator persistence belum teridentifikasi. Kondisi ini menciptakan unknown persistence risk karena attacker mungkin masih memiliki jalur akses lain.'),

-- TK2Y-2 (negative branch recovery target from TK2Y)
('22222222-1111-1111-1111-111111111114',
 'Indikator persistence dibiarkan tanpa validasi lebih lanjut sehingga risiko akses tidak sah yang tersisa masih belum diketahui.'),

-- TK3 — Incident identified / closure
('22222222-1111-1111-1111-111111111115',
 'Serangan telah teridentifikasi dan langkah containment tersedia. Penutupan harus menghasilkan tindakan pencegahan yang dapat diterapkan, seperti pemblokiran IoC, penguatan autentikasi, dan pelaporan formal. Tanpa rekomendasi dan audit trail, organisasi berisiko mengalami repeat incident tanpa pembelajaran yang jelas.'),

-- TK3A — Repeat risk
('22222222-1111-1111-1111-111111111116',
 'Insiden ditutup tanpa rekomendasi pencegahan. Walaupun ancaman saat ini telah ditangani, organisasi tidak memiliki tindakan preventif yang jelas sehingga pola serangan serupa dapat terulang.'),

-- TK3B — Incomplete audit trail
('22222222-1111-1111-1111-111111111117',
 'Incident hanya dilaporkan secara verbal sehingga audit trail tidak lengkap. Informasi teknis, timeline, indikator kompromi, dan tindakan containment berisiko tidak terdokumentasi secara konsisten.')

on conflict (id) do update set briefing_awal = excluded.briefing_awal;

-- ----------------------------------------------------------------------------
-- 2. Scenario (mst_skenario) — points to TK1 as the entry node.
-- ----------------------------------------------------------------------------

insert into public.mst_skenario (
  id, id_title, skenario, tingkat_kesulitan, estimasi_durasi, start_problem_statement_id
) values (
  '22222222-2222-2222-2222-222222222202',
  (select id from public.mst_title where name = 'Cybersecurity Analyst' limit 1),
  'Suspicious Login & Potential Breach',
  'Hard',
  20,
  '22222222-1111-1111-1111-111111111101'
)
on conflict (id) do update set
  id_title = excluded.id_title,
  skenario = excluded.skenario,
  tingkat_kesulitan = excluded.tingkat_kesulitan,
  estimasi_durasi = excluded.estimasi_durasi,
  start_problem_statement_id = excluded.start_problem_statement_id;

-- ----------------------------------------------------------------------------
-- 3. Decisions (mst_decision) — deleted + re-inserted per node so this
--    script can be safely re-run without creating duplicates.
-- ----------------------------------------------------------------------------

delete from public.mst_decision where problem_statement_id in (
  '22222222-1111-1111-1111-111111111101', -- TK1
  '22222222-1111-1111-1111-111111111102', -- TK1A
  '22222222-1111-1111-1111-111111111103', -- TK1B
  '22222222-1111-1111-1111-111111111104', -- TK1X
  '22222222-1111-1111-1111-111111111105', -- TK1X-2
  '22222222-1111-1111-1111-111111111106', -- TK1Y
  '22222222-1111-1111-1111-111111111107', -- TK1Y-2
  '22222222-1111-1111-1111-111111111108', -- TK2
  '22222222-1111-1111-1111-111111111109', -- TK2A
  '22222222-1111-1111-1111-111111111110', -- TK2B
  '22222222-1111-1111-1111-111111111111', -- TK2X
  '22222222-1111-1111-1111-111111111112', -- TK2X-2
  '22222222-1111-1111-1111-111111111113', -- TK2Y
  '22222222-1111-1111-1111-111111111114', -- TK2Y-2
  '22222222-1111-1111-1111-111111111115', -- TK3
  '22222222-1111-1111-1111-111111111116', -- TK3A
  '22222222-1111-1111-1111-111111111117'  -- TK3B
);

insert into public.mst_decision
  (problem_statement_id, title, text, konsekuensi, status, skor, next_problem_statement_id)
values

-- ============ TK1 (root) ============
('22222222-1111-1111-1111-111111111101',
 'Isolasi / kunci sementara akun',
 'Segera melakukan containment terhadap akun admin yang terindikasi disalahgunakan dengan tetap mempertahankan informasi yang dibutuhkan untuk investigasi.',
 'Akses akun berhasil dihentikan sementara dan access window berkurang.',
 'success', 20, '22222222-1111-1111-1111-111111111108'),

('22222222-1111-1111-1111-111111111101',
 'Amati dulu',
 'Menunggu dan mengamati aktivitas akun lebih lanjut sebelum melakukan containment.',
 'File konfigurasi berhasil diunduh dan insiden berkembang menjadi dugaan data breach.',
 'critical', -20, '22222222-1111-1111-1111-111111111102'),

('22222222-1111-1111-1111-111111111101',
 'Hubungi staf pemilik akun',
 'Menghubungi pemilik akun terlebih dahulu untuk memastikan apakah aktivitas login tersebut memang dilakukan olehnya.',
 'Sesi mencurigakan tetap aktif sehingga access window semakin panjang.',
 'warning', -8, '22222222-1111-1111-1111-111111111103'),

-- ============ TK1A — Data breach ============
('22222222-1111-1111-1111-111111111102',
 'Kunci akun + aktifkan breach response',
 'Melakukan containment penuh pada akun yang terdampak sekaligus mengaktifkan prosedur breach response formal.',
 'Akun tercontain dan incident response dapat dimulai.',
 'success', 15, '22222222-1111-1111-1111-111111111108'),

('22222222-1111-1111-1111-111111111102',
 'Hanya ganti password akun tersebut',
 'Mengganti password akun yang terdampak tanpa memeriksa kemungkinan akun lain yang ikut terpapar.',
 'Akun lain berpotensi terdampak.',
 'warning', -8, '22222222-1111-1111-1111-111111111104'),

('22222222-1111-1111-1111-111111111102',
 'Menunggu staf',
 'Menunggu konfirmasi staf sebelum melakukan containment lebih lanjut terhadap insiden yang sudah menjadi dugaan breach.',
 'Additional access attempts',
 'critical', -5, '22222222-1111-1111-1111-111111111106'),

-- ============ TK1B — Extended access window ============
('22222222-1111-1111-1111-111111111103',
 'Kunci akun + aktifkan breach response',
 'Menghentikan akses akun terlebih dahulu sebelum melanjutkan komunikasi dan investigasi secara terstruktur.',
 'Akses akun berhasil dihentikan dan proses breach response dapat dimulai.',
 'success', 15, '22222222-1111-1111-1111-111111111108'),

('22222222-1111-1111-1111-111111111103',
 'Hanya meminta user mengganti password',
 'Meminta pemilik akun mengganti password tanpa menghentikan sesi yang masih berjalan.',
 'Sesi mencurigakan masih berpotensi aktif meski password telah diganti.',
 'warning', -8, '22222222-1111-1111-1111-111111111104'),

('22222222-1111-1111-1111-111111111103',
 'Menunggu jawaban pemilik akun',
 'Menunggu konfirmasi dari pemilik akun sebelum melakukan containment lebih lanjut.',
 'Access window semakin panjang dan aktivitas tambahan berisiko terjadi.',
 'critical', -5, '22222222-1111-1111-1111-111111111106'),

-- ============ TK1X ============
('22222222-1111-1111-1111-111111111104',
 'Korelasikan authentication events dan sesi aktif',
 'Memeriksa seluruh authentication event dan sesi aktif yang berhubungan untuk memastikan tidak ada akses tidak sah yang masih berjalan.',
 'Sesi dan kredensial terkait berhasil diverifikasi dan dikendalikan.',
 'success', 10, '22222222-1111-1111-1111-111111111108'),

('22222222-1111-1111-1111-111111111104',
 'Anggap kredensial lain aman tanpa verifikasi',
 'Mengasumsikan akun/kredensial lain tidak terdampak tanpa melakukan korelasi log lebih lanjut.',
 'Kredensial lain yang berhubungan belum diperiksa.',
 'warning', -6, '22222222-1111-1111-1111-111111111105'),

-- ============ TK1X-2 (recovery) ============
('22222222-1111-1111-1111-111111111105',
 'Periksa kredensial terkait dan validasi log autentikasi',
 'Memeriksa seluruh kredensial yang berhubungan dan memvalidasi log autentikasi untuk menutup celah yang tersisa.',
 'Indikator kompromi tambahan berhasil diidentifikasi dan ditangani.',
 'success', 10, '22222222-1111-1111-1111-111111111108'),

-- ============ TK1Y ============
('22222222-1111-1111-1111-111111111106',
 'Contain sesi mencurigakan dan korelasikan authentication log',
 'Menghentikan sesi mencurigakan yang masih aktif dan mengorelasikan authentication log untuk menentukan sumber aktivitas.',
 'Sesi mencurigakan berhasil dihentikan dan sumber aktivitas dapat diidentifikasi.',
 'success', 10, '22222222-1111-1111-1111-111111111108'),

('22222222-1111-1111-1111-111111111106',
 'Abaikan aktivitas tambahan',
 'Menganggap aktivitas akses tambahan tidak signifikan tanpa melakukan korelasi log.',
 'Sumber akses tidak sah tetap tidak teridentifikasi.',
 'critical', -6, '22222222-1111-1111-1111-111111111107'),

-- ============ TK1Y-2 (recovery) ============
('22222222-1111-1111-1111-111111111107',
 'Lakukan korelasi log secara menyeluruh',
 'Melakukan korelasi log secara menyeluruh terhadap seluruh akun dan endpoint yang berpotensi terhubung dengan aktivitas mencurigakan.',
 'Sumber aktivitas mencurigakan berhasil diidentifikasi dan dikendalikan.',
 'success', 10, '22222222-1111-1111-1111-111111111108'),

-- ============ TK2 — Account contained ============
('22222222-1111-1111-1111-111111111108',
 'Analisis log forensik & cari IoC',
 'Melakukan analisis forensik terhadap log yang relevan untuk mengidentifikasi indicator of compromise (IoC) lain yang mungkin masih aktif.',
 'Aktivitas terkait berhasil dikorelasikan dan indikator kompromi dapat diidentifikasi.',
 'success', 20, '22222222-1111-1111-1111-111111111115'),

('22222222-1111-1111-1111-111111111108',
 'Anggap selesai',
 'Menganggap insiden selesai setelah akun utama berhasil dikunci tanpa investigasi lebih lanjut.',
 'Akun lain dibobol dan terjadi repeat compromise.',
 'critical', -15, '22222222-1111-1111-1111-111111111109'),

('22222222-1111-1111-1111-111111111108',
 'Reset password seluruh admin massal',
 'Mereset password seluruh akun admin secara massal tanpa menilai kebutuhan atau dampak operasional.',
 'Operational access disruption',
 'warning', -5, '22222222-1111-1111-1111-111111111110'),

-- ============ TK2A — Repeat compromise ============
('22222222-1111-1111-1111-111111111109',
 'Korelasikan log, IoC, dan dampak',
 'Memperluas korelasi log dan IoC untuk menemukan pola yang menghubungkan aktivitas antar-akun atau endpoint.',
 'Sumber persistence berhasil diidentifikasi dan dampaknya dapat dikendalikan.',
 'success', 15, '22222222-1111-1111-1111-111111111115'),

('22222222-1111-1111-1111-111111111109',
 'Blokir massal tanpa evidence',
 'Memblokir sejumlah besar akun/IP secara massal tanpa didasari evidence yang memadai.',
 'Akses yang sah berpotensi ikut terganggu akibat blocking tanpa evidence.',
 'warning', -8, '22222222-1111-1111-1111-111111111111'),

('22222222-1111-1111-1111-111111111109',
 'Hentikan investigasi',
 'Menghentikan investigasi lebih lanjut meskipun indikator persistence belum teridentifikasi.',
 'Unknown persistence risk karena attacker mungkin masih memiliki jalur akses lain.',
 'critical', -5, '22222222-1111-1111-1111-111111111113'),

-- ============ TK2B — Operational access disruption ============
('22222222-1111-1111-1111-111111111110',
 'Korelasikan log, IoC, dan dampak',
 'Mengevaluasi dampak reset massal sekaligus melakukan korelasi log dan IoC secara terukur berbasis evidence.',
 'Containment dilanjutkan secara tersegmentasi tanpa mengorbankan availability.',
 'success', 15, '22222222-1111-1111-1111-111111111115'),

('22222222-1111-1111-1111-111111111110',
 'Blokir massal tanpa evidence',
 'Melanjutkan tindakan blocking massal tambahan tanpa evidence yang memadai.',
 'Akses operasional yang sah semakin terganggu.',
 'warning', -8, '22222222-1111-1111-1111-111111111111'),

('22222222-1111-1111-1111-111111111110',
 'Hentikan investigasi',
 'Menghentikan investigasi karena dampak operasional dianggap sudah cukup besar.',
 'Unknown persistence risk karena indikator kompromi belum divalidasi.',
 'critical', -5, '22222222-1111-1111-1111-111111111113'),

-- ============ TK2X ============
('22222222-1111-1111-1111-111111111111',
 'Review evidence dan lakukan containment secara tersegmentasi',
 'Meninjau kembali evidence yang tersedia dan melakukan containment secara tersegmentasi agar akses sah tidak ikut terdampak.',
 'Containment kembali berbasis evidence dan akses sah dapat dipulihkan.',
 'success', 10, '22222222-1111-1111-1111-111111111115'),

('22222222-1111-1111-1111-111111111111',
 'Biarkan blocking massal berjalan',
 'Membiarkan blocking massal yang sudah dilakukan tanpa meninjau kembali evidence yang ada.',
 'Sebagian akses sah masih belum dipulihkan.',
 'warning', -5, '22222222-1111-1111-1111-111111111112'),

-- ============ TK2X-2 (recovery) ============
('22222222-1111-1111-1111-111111111112',
 'Pulihkan akses sah berdasarkan evidence',
 'Meninjau evidence yang tersedia untuk memulihkan akses sah yang sempat terdampak oleh blocking massal.',
 'Akses sah berhasil dipulihkan tanpa mengorbankan containment yang sudah berjalan.',
 'success', 10, '22222222-1111-1111-1111-111111111115'),

-- ============ TK2Y ============
('22222222-1111-1111-1111-111111111113',
 'Lanjutkan korelasi log dan validasi IoC',
 'Melanjutkan kembali korelasi log dan memvalidasi IoC yang tersisa untuk memastikan tidak ada persistence yang terlewat.',
 'Indikator persistence berhasil divalidasi dan risiko dapat dikendalikan.',
 'success', 10, '22222222-1111-1111-1111-111111111115'),

('22222222-1111-1111-1111-111111111113',
 'Biarkan investigasi tetap dihentikan',
 'Tetap tidak melanjutkan investigasi meskipun risiko persistence belum diketahui.',
 'Indikator persistence dibiarkan tanpa validasi lebih lanjut.',
 'critical', -6, '22222222-1111-1111-1111-111111111114'),

-- ============ TK2Y-2 (recovery) ============
('22222222-1111-1111-1111-111111111114',
 'Validasi ulang indikator persistence',
 'Melakukan validasi ulang terhadap indikator persistence yang sempat diabaikan untuk memastikan tidak ada jalur akses tersisa.',
 'Risiko akses tidak sah yang tersisa berhasil diidentifikasi dan ditutup.',
 'success', 10, '22222222-1111-1111-1111-111111111115'),

-- ============ TK3 — Incident identified / closure ============
('22222222-1111-1111-1111-111111111115',
 'Report, blokir IoC, wajib MFA',
 'Menyusun laporan insiden formal, memblokir seluruh IoC yang teridentifikasi, dan mewajibkan penerapan MFA sebagai tindakan pencegahan.',
 'Insiden tertutup dengan tindakan pencegahan yang jelas dan terdokumentasi.',
 'success', 15, null),

('22222222-1111-1111-1111-111111111115',
 'Tutup tanpa rekomendasi',
 'Menutup insiden tanpa menyertakan rekomendasi pencegahan apa pun.',
 'Organisasi tidak memiliki tindakan preventif yang jelas sehingga pola serangan serupa dapat terulang.',
 'critical', -10, '22222222-1111-1111-1111-111111111116'),

('22222222-1111-1111-1111-111111111115',
 'Lapor verbal saja',
 'Melaporkan insiden secara verbal kepada tim tanpa dokumentasi formal.',
 'Audit trail tidak lengkap sehingga sulit ditelusuri di kemudian hari.',
 'warning', 0, '22222222-1111-1111-1111-111111111117'),

-- ============ TK3A — Repeat risk (terminal) ============
('22222222-1111-1111-1111-111111111116',
 'Buat rekomendasi pencegahan dan update incident record',
 'Menyusun rekomendasi pencegahan yang konkret dan memperbarui incident record secara resmi.',
 'Tindakan preventif berhasil didefinisikan dan didokumentasikan.',
 'success', 10, null),

('22222222-1111-1111-1111-111111111116',
 'Tetap tidak membuat rekomendasi',
 'Tidak menyusun rekomendasi pencegahan apa pun meskipun risiko repeat incident sudah diketahui.',
 'Organisasi tetap berisiko mengalami insiden serupa tanpa pembelajaran yang jelas.',
 'critical', -10, null),

-- ============ TK3B — Incomplete audit trail (terminal) ============
('22222222-1111-1111-1111-111111111117',
 'Lengkapi incident report dan audit trail',
 'Melengkapi laporan insiden dengan timeline, indikator kompromi, dan tindakan containment secara formal.',
 'Audit trail lengkap dan dapat digunakan untuk pembelajaran ke depan.',
 'success', 10, null),

('22222222-1111-1111-1111-111111111117',
 'Tetap hanya mengandalkan laporan verbal',
 'Tidak melengkapi dokumentasi formal dan tetap mengandalkan laporan verbal yang sudah disampaikan.',
 'Audit trail tetap tidak lengkap dan berisiko hilang di kemudian hari.',
 'warning', -5, null);

commit;
