-- ============================================================================
-- SEED DATA — "Data Center Technician" / "Rack Overheating Crisis"
-- ============================================================================
-- This script only INSERTS master/config data into the existing schema
-- (mst_title, mst_skenario, mst_problem_statement, mst_decision). It does
-- NOT alter table structure, and it is safe to re-run: problem statements
-- and the scenario are upserted by fixed id, and each node's decisions are
-- deleted + re-inserted so re-running never creates duplicates.
--
-- Node codes like "TK1", "TK1A", "TK2X" are NOT stored in the database —
-- they only exist as comments here to help you read the tree. The real
-- identity of every node is its UUID.
--
-- Run this in the Supabase SQL editor.
-- ============================================================================

begin;

-- ----------------------------------------------------------------------------
-- 0. Title + Scenario
-- ----------------------------------------------------------------------------

-- Ensure the "Data Center Technician" title exists (no unique constraint on
-- name, so we guard manually to avoid duplicates on re-run).
insert into public.mst_title (id, name)
select '99999999-0000-0000-0000-000000000001', 'Data Center Technician'
where not exists (
  select 1 from public.mst_title where name = 'Data Center Technician'
);

-- ----------------------------------------------------------------------------
-- 1. Problem statement nodes (fixed ids so decisions below can reference
--    them directly). "briefing_awal" holds the narrative shown to the
--    player for that node.
-- ----------------------------------------------------------------------------

insert into public.mst_problem_statement (id, briefing_awal) values
-- TK1 (root)
('11111111-1111-1111-1111-111111111101',
 'Situasi awal terjadi di ruang data center ketika monitoring menunjukkan kenaikan temperatur Rack B-14 dari 24°C menjadi 32°C. Pada saat yang sama CRAC #3 mengeluarkan alarm. Kenaikan temperatur bukan sekadar angka monitoring: jika pendinginan tidak kembali normal, server dapat mengalami throttling, thermal shutdown, gangguan layanan, dan potensi pelanggaran SLA. Karena operator bekerja sendirian pada shift malam, keputusan harus dilakukan secara terukur: verifikasi data dan kondisi perangkat terlebih dahulu, menjaga layanan tetap tersedia, menggunakan jalur eskalasi yang benar, dan menghindari tindakan fisik yang dapat menimbulkan gangguan baru.'),

-- TK1A
('11111111-1111-1111-1111-111111111102',
 'Keputusan mematikan sebagian server tanpa melalui proses komunikasi menyebabkan dampak layanan dirasakan klien. Masalah teknis awal sekarang berubah menjadi masalah operasional dan komunikasi. Klien dapat mempertanyakan mengapa layanan dihentikan, sementara tim internal membutuhkan timeline yang jelas untuk mengetahui siapa yang mengambil tindakan, kapan tindakan dilakukan, dan alasan teknisnya. Jika informasi diberikan langsung kepada klien tanpa koordinasi, pesan yang diterima dapat berbeda dengan kondisi aktual. Jika operator menunggu sampai supervisor bertanya, waktu respons dan eskalasi menjadi terlambat. Tujuan node ini adalah memulihkan disiplin incident communication tanpa mengabaikan insiden teknis yang masih berjalan.'),

-- TK1A-1
('11111111-1111-1111-1111-111111111103',
 'Kontak langsung dengan klien tanpa koordinasi membuat informasi yang beredar berpotensi tidak sama dengan kondisi teknis sebenarnya. Komunikasi insiden bukan hanya soal memberi tahu bahwa terjadi gangguan, tetapi juga memastikan pesan, status layanan, estimasi dampak, dan tindakan mitigasi berasal dari jalur yang bertanggung jawab. Informasi yang tidak sinkron dapat memperbesar kepanikan, menghasilkan ekspektasi yang salah, dan menyulitkan penyusunan timeline insiden.'),

-- TK1A-1X
('11111111-1111-1111-1111-111111111104',
 'Terjadi conflicting status update karena informasi dikirim tanpa verifikasi.'),

-- TK1A-2
('11111111-1111-1111-1111-111111111105',
 'Operator memilih diam sampai supervisor bertanya. Akibatnya, informasi penting mengenai tindakan yang sudah dilakukan dan kondisi server tidak segera sampai kepada pihak yang bertanggung jawab. Keterlambatan eskalasi membuat tim kehilangan waktu untuk menyiapkan mitigasi, sementara temperatur dan dampak layanan dapat terus berubah.'),

-- TK1A-2X
('11111111-1111-1111-1111-111111111106',
 'Response delay terjadi karena operator menunggu instruksi tanpa memberikan kondisi aktual.'),

-- TK1A-2Y
('11111111-1111-1111-1111-111111111107',
 'Coordination gap terjadi karena operator fokus pada server tetapi tidak melakukan komunikasi insiden.'),

-- TK1B
('11111111-1111-1111-1111-111111111108',
 'Operator langsung menghubungi vendor eksternal sementara suhu terus meningkat dan server mulai throttling. Masalahnya bukan bahwa vendor tidak boleh dilibatkan, tetapi tindakan tersebut tidak boleh menggantikan mitigasi internal yang dapat dilakukan segera sesuai kewenangan. Setiap menit tambahan pada kondisi overheating meningkatkan risiko terhadap availability dan hardware.'),

-- TK1B-1
('11111111-1111-1111-1111-111111111109',
 'Vendor belum datang sementara temperatur masih meningkat. Risiko sekarang telah berkembang dari gangguan cooling menjadi ancaman langsung terhadap kestabilan server.'),

-- TK1B-1X
('11111111-1111-1111-1111-111111111110',
 'Thermal shutdown risk semakin tinggi karena mitigasi tidak segera dilakukan.'),

-- TK1B-1Y
('11111111-1111-1111-1111-111111111111',
 'Physical handling risk terjadi karena perangkat dipindahkan tanpa runbook.'),

-- TK1B-2
('11111111-1111-1111-1111-111111111112',
 'Relokasi server dilakukan terburu-buru dan kabel power tercabut. Gangguan pendinginan kini menghasilkan insiden kedua: server restart mendadak. Dampaknya dapat berupa service interruption, proses yang belum tersimpan, atau kebutuhan melakukan verifikasi setelah server kembali hidup. Restart tidak boleh diperlakukan sebagai tanda bahwa masalah selesai.'),

-- TK1B-2X
('11111111-1111-1111-1111-111111111113',
 'Restart perangkat lain secara sembarangan menyebabkan risiko cascading service interruption.'),

-- TK1B-2Y
('11111111-1111-1111-1111-111111111114',
 'Dampak layanan menjadi semakin panjang karena operator hanya menunggu server pulih sendiri.'),

-- TK2
('11111111-1111-1111-1111-111111111115',
 'Setelah penyebab cooling ditemukan dan temperatur mulai dikendalikan, masalah utama belum otomatis selesai. Operator perlu memastikan pendinginan benar-benar stabil, bukan hanya melihat satu pembacaan temperatur. Filter tersumbat harus ditangani sesuai prosedur, CRAC cadangan dapat digunakan bila diperlukan, dan kondisi server harus diverifikasi. Kesalahan pada tahap ini dapat membuat suhu turun sementara lalu kembali naik.'),

-- TK2A
('11111111-1111-1111-1111-111111111116',
 'Keputusan membiarkan kondisi tanpa tindakan korektif membuat server mengalami thermal shutdown.'),

-- TK2B
('11111111-1111-1111-1111-111111111117',
 'Relokasi manual menimbulkan near-miss pada kabel. Walaupun server belum mati, kondisi ini menunjukkan bahwa tindakan fisik menciptakan risiko baru terhadap power dan konektivitas.'),

-- TK2X
('11111111-1111-1111-1111-111111111118',
 'Pemulihan tidak terkontrol akibat tindakan tambahan tanpa verifikasi.'),

-- TK2Y
('11111111-1111-1111-1111-111111111119',
 'Dampak layanan/downtime terus bertambah karena mitigasi tidak dilakukan.'),

-- TK3
('11111111-1111-1111-1111-111111111120',
 'Temperatur dan layanan telah stabil. Namun simulasi belum selesai sebelum penutupan dilakukan. Insiden harus memiliki timeline, akar masalah atau temuan utama, tindakan korektif, dan rencana pencegahan. Jika insiden ditutup tanpa dokumentasi, organisasi kehilangan histori yang dapat digunakan untuk mencegah kejadian serupa.'),

-- TK3A
('11111111-1111-1111-1111-111111111121',
 'Histori insiden hilang karena insiden ditutup tanpa dokumentasi formal.'),

-- TK3B
('11111111-1111-1111-1111-111111111122',
 'Dokumentasi tidak formal karena hanya menggunakan pesan singkat melalui chat.')

on conflict (id) do update set briefing_awal = excluded.briefing_awal;

-- ----------------------------------------------------------------------------
-- 2. Scenario (mst_skenario) — points to TK1 as the entry node.
-- ----------------------------------------------------------------------------

insert into public.mst_skenario (
  id, id_title, skenario, tingkat_kesulitan, estimasi_durasi, start_problem_statement_id
) values (
  '22222222-2222-2222-2222-222222222201',
  (select id from public.mst_title where name = 'Data Center Technician' limit 1),
  'Rack Overheating Crisis',
  'Menengah',
  20,
  '11111111-1111-1111-1111-111111111101'
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
  '11111111-1111-1111-1111-111111111101', -- TK1
  '11111111-1111-1111-1111-111111111102', -- TK1A
  '11111111-1111-1111-1111-111111111103', -- TK1A-1
  '11111111-1111-1111-1111-111111111104', -- TK1A-1X
  '11111111-1111-1111-1111-111111111105', -- TK1A-2
  '11111111-1111-1111-1111-111111111106', -- TK1A-2X
  '11111111-1111-1111-1111-111111111107', -- TK1A-2Y
  '11111111-1111-1111-1111-111111111108', -- TK1B
  '11111111-1111-1111-1111-111111111109', -- TK1B-1
  '11111111-1111-1111-1111-111111111110', -- TK1B-1X
  '11111111-1111-1111-1111-111111111111', -- TK1B-1Y
  '11111111-1111-1111-1111-111111111112', -- TK1B-2
  '11111111-1111-1111-1111-111111111113', -- TK1B-2X
  '11111111-1111-1111-1111-111111111114', -- TK1B-2Y
  '11111111-1111-1111-1111-111111111115', -- TK2
  '11111111-1111-1111-1111-111111111116', -- TK2A
  '11111111-1111-1111-1111-111111111117', -- TK2B
  '11111111-1111-1111-1111-111111111118', -- TK2X
  '11111111-1111-1111-1111-111111111119', -- TK2Y
  '11111111-1111-1111-1111-111111111120', -- TK3
  '11111111-1111-1111-1111-111111111121', -- TK3A
  '11111111-1111-1111-1111-111111111122'  -- TK3B
);

insert into public.mst_decision
  (problem_statement_id, title, text, konsekuensi, status, skor, next_problem_statement_id)
values

-- ============ TK1 (root) ============
('11111111-1111-1111-1111-111111111101',
 'Cek log sensor & histori suhu',
 'Memeriksa histori sensor dan tren temperatur Rack B-14 untuk memastikan kenaikan suhu benar-benar terjadi dan bukan anomali pembacaan.',
 'Data akurat dan kondisi dapat diverifikasi.',
 'success', 15, '11111111-1111-1111-1111-111111111115'),

('11111111-1111-1111-1111-111111111101',
 'Langsung matikan sebagian server',
 'Mematikan sebagian server sebelum memastikan sumber masalah dan tanpa koordinasi insiden.',
 'Klien mengalami gangguan layanan dan berpotensi terjadi SLA breach.',
 'critical', -10, '11111111-1111-1111-1111-111111111102'),

('11111111-1111-1111-1111-111111111101',
 'Telepon vendor eksternal',
 'Menghubungi vendor eksternal sebelum melakukan mitigasi internal yang masih dapat dilakukan sesuai kewenangan operator.',
 'Suhu terus meningkat dan server mulai mengalami throttling.',
 'warning', -5, '11111111-1111-1111-1111-111111111108'),

('11111111-1111-1111-1111-111111111101',
 'Periksa fisik CRAC #3',
 'Melakukan pemeriksaan fisik CRAC #3 sesuai prosedur keselamatan untuk mencari indikasi masalah pendinginan.',
 'Filter ditemukan tersumbat dan kondisi cooling dapat ditindaklanjuti.',
 'success', 5, '11111111-1111-1111-1111-111111111115'),

-- ============ TK1A ============
('11111111-1111-1111-1111-111111111102',
 'Gunakan jalur eskalasi resmi + catat timeline',
 'Menginformasikan incident owner melalui jalur eskalasi resmi dan mencatat timeline tindakan yang sudah dilakukan.',
 'Incident owner mendapatkan informasi yang jelas dan timeline dapat digunakan untuk pemulihan.',
 'success', 10, '11111111-1111-1111-1111-111111111115'),

('11111111-1111-1111-1111-111111111102',
 'Hubungi klien langsung tanpa koordinasi',
 'Memberikan update kepada klien secara langsung tanpa berkoordinasi dengan supervisor/incident owner.',
 'Informasi tidak sinkron.',
 'warning', -8, '11111111-1111-1111-1111-111111111103'),

('11111111-1111-1111-1111-111111111102',
 'Diamkan sampai supervisor bertanya',
 'Tidak melakukan eskalasi dan menunggu sampai supervisor menanyakan kondisi terkini.',
 'Eskalasi terlambat.',
 'critical', -12, '11111111-1111-1111-1111-111111111105'),

-- ============ TK1A-1 ============
('11111111-1111-1111-1111-111111111103',
 'Sinkronkan status dengan supervisor/incident owner dan catat timeline',
 'Meluruskan kembali informasi yang sudah beredar dengan supervisor/incident owner dan mencatat timeline insiden.',
 'Status insiden menjadi konsisten dan dapat dijadikan acuan pemulihan.',
 'success', 10, '11111111-1111-1111-1111-111111111115'),

('11111111-1111-1111-1111-111111111103',
 'Kirim pembaruan tambahan tanpa verifikasi',
 'Mengirim pembaruan tambahan kepada klien tanpa memverifikasi kondisi terkini dengan tim internal.',
 'Conflicting status update',
 'warning', -8, '11111111-1111-1111-1111-111111111104'),

-- ============ TK1A-1X ============
('11111111-1111-1111-1111-111111111104',
 'Sinkronkan informasi dengan incident owner',
 'Menghubungi incident owner untuk menyamakan kembali informasi status insiden sebelum dikomunikasikan lebih lanjut.',
 'Informasi kembali konsisten dan insiden dapat dilanjutkan ke tahap pemulihan.',
 'success', 10, '11111111-1111-1111-1111-111111111115'),

-- ============ TK1A-2 ============
('11111111-1111-1111-1111-111111111105',
 'Eskalasi segera melalui jalur resmi, berikan kondisi aktual dan timeline',
 'Melakukan eskalasi resmi dengan menyampaikan kondisi aktual dan timeline tindakan kepada pihak yang berwenang.',
 'Tim mendapatkan informasi tepat waktu untuk menyiapkan mitigasi.',
 'success', 10, '11111111-1111-1111-1111-111111111115'),

('11111111-1111-1111-1111-111111111105',
 'Menunggu instruksi tanpa mengirim data kondisi',
 'Menunggu instruksi dari supervisor tanpa proaktif mengirimkan data kondisi terkini.',
 'Response delay bertambah karena tim tidak memiliki data kondisi terkini.',
 'warning', -8, '11111111-1111-1111-1111-111111111106'),

('11111111-1111-1111-1111-111111111105',
 'Fokus hanya pada server tanpa komunikasi',
 'Berfokus menangani server secara teknis tanpa melakukan komunikasi insiden ke pihak terkait.',
 'Coordination gap terjadi antara tim teknis dan incident owner.',
 'warning', -5, '11111111-1111-1111-1111-111111111107'),

-- ============ TK1A-2X ============
('11111111-1111-1111-1111-111111111106',
 'Kirim kondisi aktual + eskalasi resmi',
 'Mengirimkan kondisi aktual server dan melakukan eskalasi resmi tanpa menunggu instruksi lebih lanjut.',
 'Tim menerima informasi terkini dan dapat melanjutkan mitigasi tanpa keterlambatan lebih jauh.',
 'success', 10, '11111111-1111-1111-1111-111111111115'),

-- ============ TK1A-2Y ============
('11111111-1111-1111-1111-111111111107',
 'Sinkronkan kondisi dengan incident owner',
 'Menghubungi incident owner untuk menyampaikan kondisi teknis terkini dan menutup coordination gap.',
 'Koordinasi antara tim teknis dan incident owner kembali selaras.',
 'success', 10, '11111111-1111-1111-1111-111111111115'),

-- ============ TK1B ============
('11111111-1111-1111-1111-111111111108',
 'Aktifkan CRAC cadangan + bersihkan filter',
 'Mengaktifkan CRAC cadangan dan membersihkan filter yang tersumbat sesuai prosedur sambil menunggu tindak lanjut vendor.',
 'Mitigasi internal segera dilakukan sambil menunggu tindak lanjut vendor.',
 'success', 10, '11111111-1111-1111-1111-111111111115'),

('11111111-1111-1111-1111-111111111108',
 'Tunggu vendor',
 'Menunggu kedatangan vendor tanpa melakukan mitigasi internal yang sebenarnya dapat dilakukan.',
 'Suhu tetap meningkat karena mitigasi internal belum dilakukan.',
 'warning', -8, '11111111-1111-1111-1111-111111111109'),

('11111111-1111-1111-1111-111111111108',
 'Relokasi server terburu-buru',
 'Memindahkan server secara manual dan terburu-buru tanpa mengikuti runbook relokasi.',
 'Kabel power tercabut.',
 'critical', -10, '11111111-1111-1111-1111-111111111112'),

-- ============ TK1B-1 ============
('11111111-1111-1111-1111-111111111109',
 'Aktifkan cooling cadangan sesuai prosedur dan verifikasi temperatur',
 'Mengaktifkan cooling cadangan sesuai prosedur dan memverifikasi bahwa temperatur mulai turun.',
 'Temperatur mulai terkendali dan risiko thermal shutdown menurun.',
 'success', 10, '11111111-1111-1111-1111-111111111115'),

('11111111-1111-1111-1111-111111111109',
 'Tetap menunggu vendor',
 'Terus menunggu vendor tanpa mengaktifkan mitigasi cooling cadangan yang tersedia.',
 'Thermal shutdown risk semakin tinggi karena mitigasi tidak segera dilakukan.',
 'warning', -8, '11111111-1111-1111-1111-111111111110'),

('11111111-1111-1111-1111-111111111109',
 'Memindahkan perangkat tanpa runbook',
 'Memindahkan perangkat secara manual tanpa mengikuti runbook penanganan fisik.',
 'Physical handling risk terjadi karena perangkat dipindahkan tanpa prosedur.',
 'critical', -5, '11111111-1111-1111-1111-111111111111'),

-- ============ TK1B-1X ============
('11111111-1111-1111-1111-111111111110',
 'Aktifkan cooling cadangan',
 'Segera mengaktifkan cooling cadangan untuk menahan kenaikan temperatur sebelum mencapai thermal shutdown.',
 'Temperatur mulai terkendali sebelum mencapai thermal shutdown.',
 'success', 10, '11111111-1111-1111-1111-111111111115'),

('11111111-1111-1111-1111-111111111110',
 'Tetap menunggu vendor tanpa tindakan',
 'Kembali menunda tindakan mitigasi dan menunggu vendor meskipun risiko thermal shutdown sudah tinggi.',
 'Penundaan berulang menyebabkan kondisi memburuk hingga menimbulkan gangguan tambahan pada server.',
 'critical', -10, '11111111-1111-1111-1111-111111111112'),

-- ============ TK1B-1Y ============
('11111111-1111-1111-1111-111111111111',
 'Hentikan relokasi dan amankan perangkat',
 'Menghentikan proses relokasi yang tidak sesuai runbook dan mengamankan posisi perangkat saat ini.',
 'Perangkat kembali aman dan risiko fisik dapat dihindari.',
 'success', 10, '11111111-1111-1111-1111-111111111115'),

-- ============ TK1B-2 ============
('11111111-1111-1111-1111-111111111112',
 'Amankan power, cek status service, dan lakukan recovery terkontrol',
 'Mengamankan sambungan power, memeriksa status seluruh service yang terdampak, lalu melakukan recovery sesuai runbook.',
 'Layanan dapat dipulihkan secara terkontrol tanpa insiden tambahan.',
 'success', 15, '11111111-1111-1111-1111-111111111115'),

('11111111-1111-1111-1111-111111111112',
 'Restart perangkat lain untuk mengejar kondisi',
 'Melakukan restart pada perangkat lain secara terburu-buru untuk mempercepat pemulihan.',
 'Risiko cascading service interruption meningkat.',
 'warning', -8, '11111111-1111-1111-1111-111111111113'),

('11111111-1111-1111-1111-111111111112',
 'Menunggu server pulih sendiri',
 'Tidak melakukan tindakan apa pun dan menunggu server pulih dengan sendirinya.',
 'Dampak layanan menjadi semakin panjang.',
 'warning', -5, '11111111-1111-1111-1111-111111111114'),

-- ============ TK1B-2X ============
('11111111-1111-1111-1111-111111111113',
 'Hentikan restart tambahan dan lakukan recovery sesuai runbook',
 'Menghentikan restart perangkat lain yang tidak terkontrol dan melanjutkan recovery sesuai runbook resmi.',
 'Recovery berjalan terkendali dan risiko cascading dapat dihentikan.',
 'success', 10, '11111111-1111-1111-1111-111111111115'),

-- ============ TK1B-2Y ============
('11111111-1111-1111-1111-111111111114',
 'Lakukan recovery terkontrol sesuai runbook',
 'Mulai melakukan recovery secara aktif dan terkontrol sesuai runbook, tanpa hanya menunggu.',
 'Layanan mulai pulih dengan proses yang terkontrol dan terverifikasi.',
 'success', 10, '11111111-1111-1111-1111-111111111115'),

-- ============ TK2 ============
('11111111-1111-1111-1111-111111111115',
 'Aktifkan CRAC cadangan & bersihkan filter',
 'Mengaktifkan CRAC cadangan dan membersihkan filter yang tersumbat sesuai prosedur pemeliharaan.',
 'Pendinginan stabil dan filter kembali berfungsi normal.',
 'success', 20, '11111111-1111-1111-1111-111111111120'),

('11111111-1111-1111-1111-111111111115',
 'Biarkan CRAC berjalan menunggu suhu turun',
 'Membiarkan CRAC berjalan seperti biasa tanpa tindakan korektif tambahan, menunggu suhu turun sendiri.',
 'Server mengalami thermal shutdown karena tidak ada tindakan korektif.',
 'critical', -15, '11111111-1111-1111-1111-111111111116'),

('11111111-1111-1111-1111-111111111115',
 'Relokasi manual',
 'Melakukan relokasi manual pada perangkat untuk menjauhkannya dari sumber panas.',
 'Terjadi near-miss pada kabel selama proses relokasi.',
 'warning', -5, '11111111-1111-1111-1111-111111111117'),

-- ============ TK2A ============
('11111111-1111-1111-1111-111111111116',
 'Failover/pemulihan sesuai runbook + verifikasi',
 'Melakukan failover ke jalur cadangan sesuai runbook dan memverifikasi seluruh layanan kembali normal.',
 'Layanan berhasil dipulihkan melalui failover terkontrol.',
 'success', 15, '11111111-1111-1111-1111-111111111120'),

('11111111-1111-1111-1111-111111111116',
 'Restart massal tanpa verifikasi',
 'Melakukan restart massal pada banyak perangkat tanpa memverifikasi dampaknya terlebih dahulu.',
 'Pemulihan menjadi tidak terkontrol akibat tindakan tanpa verifikasi.',
 'warning', -8, '11111111-1111-1111-1111-111111111118'),

('11111111-1111-1111-1111-111111111116',
 'Menunggu tanpa mitigasi',
 'Tidak melakukan mitigasi apa pun dan hanya menunggu kondisi kembali normal.',
 'Downtime bertambah karena tidak ada mitigasi aktif.',
 'warning', -5, '11111111-1111-1111-1111-111111111119'),

-- ============ TK2B ============
('11111111-1111-1111-1111-111111111117',
 'Amankan jalur kabel dan lakukan pemulihan sesuai runbook',
 'Mengamankan jalur kabel yang berisiko dan melanjutkan pemulihan sesuai runbook resmi.',
 'Jalur kabel aman dan pemulihan berjalan sesuai prosedur.',
 'success', 15, '11111111-1111-1111-1111-111111111120'),

('11111111-1111-1111-1111-111111111117',
 'Lanjutkan relokasi tanpa pengamanan',
 'Melanjutkan proses relokasi tanpa mengamankan jalur kabel yang sudah menunjukkan risiko.',
 'Risiko gangguan power/konektivitas meningkat.',
 'warning', -8, '11111111-1111-1111-1111-111111111118'),

('11111111-1111-1111-1111-111111111117',
 'Biarkan kabel dalam kondisi sementara',
 'Membiarkan kabel dalam kondisi sementara tanpa pengamanan lebih lanjut.',
 'Kondisi kabel yang tidak diamankan menjadi risiko laten.',
 'warning', -5, '11111111-1111-1111-1111-111111111119'),

-- ============ TK2X ============
('11111111-1111-1111-1111-111111111118',
 'Pemulihan terkontrol + verifikasi',
 'Menghentikan tindakan tanpa verifikasi sebelumnya dan melanjutkan pemulihan secara terkontrol dengan verifikasi penuh.',
 'Layanan pulih dan seluruh perangkat terverifikasi berfungsi normal.',
 'success', 10, '11111111-1111-1111-1111-111111111120'),

-- ============ TK2Y ============
('11111111-1111-1111-1111-111111111119',
 'Lakukan mitigasi dan recovery sesuai runbook',
 'Mulai melakukan mitigasi aktif dan proses recovery sesuai runbook resmi.',
 'Downtime dapat dihentikan dan layanan kembali stabil.',
 'success', 10, '11111111-1111-1111-1111-111111111120'),

-- ============ TK3 (terminal branch A) ============
('11111111-1111-1111-1111-111111111120',
 'Laporan & jadwal preventif',
 'Menyusun laporan insiden lengkap dengan timeline, akar masalah, tindakan korektif, dan menjadwalkan pemeliharaan preventif.',
 'Insiden terdokumentasi lengkap dengan rencana pencegahan.',
 'success', 15, null),

('11111111-1111-1111-1111-111111111120',
 'Anggap selesai tanpa lapor',
 'Menutup insiden tanpa menyusun dokumentasi atau laporan formal.',
 'Histori insiden hilang karena tidak ada dokumentasi formal.',
 'critical', -10, '11111111-1111-1111-1111-111111111121'),

('11111111-1111-1111-1111-111111111120',
 'Pesan singkat via chat',
 'Menutup insiden hanya dengan mengirim pesan singkat melalui chat kepada tim.',
 'Dokumentasi menjadi tidak formal dan sulit ditelusuri kembali.',
 'warning', 0, '11111111-1111-1111-1111-111111111122'),

-- ============ TK3A (terminal) ============
('11111111-1111-1111-1111-111111111121',
 'Buat laporan insiden dan lengkapi histori',
 'Menyusun laporan insiden secara formal untuk melengkapi histori yang sempat hilang.',
 'Histori insiden berhasil didokumentasikan.',
 'success', 10, null),

('11111111-1111-1111-1111-111111111121',
 'Tetap tidak membuat dokumentasi',
 'Tidak membuat dokumentasi formal apa pun meskipun sudah diketahui histori insiden hilang.',
 'Insiden ditutup tanpa histori sama sekali, menyulitkan audit di masa depan.',
 'critical', -10, null),

-- ============ TK3B (terminal) ============
('11111111-1111-1111-1111-111111111122',
 'Pindahkan informasi chat ke incident record resmi',
 'Memindahkan seluruh informasi yang sebelumnya hanya ada di chat ke incident record resmi.',
 'Dokumentasi resmi berhasil dilengkapi.',
 'success', 10, null),

('11111111-1111-1111-1111-111111111122',
 'Tetap mengandalkan chat sebagai dokumentasi',
 'Tidak memindahkan informasi ke incident record resmi dan tetap mengandalkan riwayat chat.',
 'Dokumentasi tetap tidak formal dan berisiko hilang di kemudian hari.',
 'warning', -5, null);

commit;

-- ============================================================================
-- OPTIONAL — Row Level Security
-- ============================================================================
-- If your anon/browser client gets a "permission denied" error reading
-- these master tables, RLS is enabled without a read policy. These master
-- tables are reference/config data (not user data), so a public read
-- policy is normally safe. Uncomment and run if needed:
--
-- alter table public.mst_title enable row level security;
-- alter table public.mst_skenario enable row level security;
-- alter table public.mst_problem_statement enable row level security;
-- alter table public.mst_decision enable row level security;
--
-- drop policy if exists "Public read mst_title" on public.mst_title;
-- create policy "Public read mst_title" on public.mst_title
--   for select using (true);
--
-- drop policy if exists "Public read mst_skenario" on public.mst_skenario;
-- create policy "Public read mst_skenario" on public.mst_skenario
--   for select using (true);
--
-- drop policy if exists "Public read mst_problem_statement" on public.mst_problem_statement;
-- create policy "Public read mst_problem_statement" on public.mst_problem_statement
--   for select using (true);
--
-- drop policy if exists "Public read mst_decision" on public.mst_decision;
-- create policy "Public read mst_decision" on public.mst_decision
--   for select using (true);
-- ============================================================================
