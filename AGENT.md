# Panduan Agent

Dibaca tiap mulai sesi. Perintah "lanjutkan" sudah cukup.

- Apa yang dibangun → [SPEC.md](SPEC.md)
- Urutan pengerjaan → [ROADMAP.md](ROADMAP.md)
- Yang sudah terbukti gagal → [DEBUG.md](DEBUG.md)

Engine yang dibungkus ada di `../nc-wa`. Kalau ragu soal bentuk
API-nya, baca `src/app.ts` di sana — bukan menebak dari dokumentasi.

---

## Aturan kerja

Tes dibagi dua:
- **[agent]** — tidak butuh n8n atau WhatsApp nyata. Dikerjakan langsung.
- **[manual]** — butuh instansi n8n dan HP asli. Dikerjakan pemilik.

Tes `[manual]` boleh ditunda, lanjut ke tahap berikutnya.

**Kecuali satu gerbang:** tahap 1 harus lewat tes manualnya dulu — paket
benar-benar terpasang dan node muncul di panel n8n — sebelum tahap 2.
Semua tahap berikutnya menumpuk di atas paket yang terbaca n8n; kalau
node tidak muncul, tidak ada yang bisa diuji.

Setelah gerbang itu lewat, jalan terus tanpa berhenti.

Tiap percobaan perbaikan yang gagal dicatat di [DEBUG.md](DEBUG.md)
sebelum mencoba pendekatan lain.

Bagian Status di bawah diperbarui tiap selesai satu item.
Harus tetap pendek — rencana ada di roadmap, ini cuma posisi.

---

## Batas kerja

**Jangan menulis apa pun ke instalasi n8n pemilik** — folder data,
`nodes/node_modules`, atau container. Itu instansi produksi yang sedang
dipakai. Pemasangan dilakukan pemilik lewat UI.

**Jangan menjalankan engine produksi.** Kalau butuh engine hidup untuk
tes `[agent]`, jalankan salinan sendiri di port lain dengan API key uji
dan folder data sementara, lalu matikan dan bersihkan setelah selesai.

**Jangan membuat repo, push, atau menerbitkan ke npm** tanpa disuruh.

---

## Git

Satu item roadmap = satu commit. Riwayat git jadi sejajar dengan
checklist, gampang ditelusuri kalau ada yang rusak.

Pesan commit: judul kalimat perintah bahasa Indonesia ("Tambah...",
"Perbaiki..."), badan menjelaskan **kenapa** — bukan mengulang apa
yang berubah, itu sudah terlihat di diff.

**Push hanya kalau pemilik menyuruh.** Sekali terkirim sulit ditarik.

**Jangan pernah commit** `node_modules/`, `dist/`, dan berkas berisi
API key. Pastikan `.gitignore` terpasang sebelum `git add` pertama.

---

## Status

**Tahap:** 2–5 selesai. Seluruh uji `[agent]` lulus; menunggu uji manual.

**Sudah selesai:**
- SPEC dan ROADMAP disusun; lingkup mencakup seluruh endpoint engine
  (Message + Session + trigger), bukan hanya yang dipakai workflow
  pembuatnya — paket ini untuk umum
- Nama paket `n8n-nodes-nc-wa` dicek belum dipakai di npm
- Sasaran runtime dipastikan: n8n 2.30.8, `n8n-workflow` 2.30.2
- Repo: `github.com/yudisaefulrizal/n8n-nc-wa`, cabang `main`

- `0.1.0` terbit di npm dan terpasang lewat Settings → Community nodes
- Tahap 2–5: Message (teks, media, typing, read), Session (7 operasi),
  dan trigger webhook dengan penyaring event/session/grup
- 33 uji `[agent]` lulus terhadap salinan engine di port 3999; validasi
  parameter diperiksa untuk tiap operasi; tarball terbukti dimuat
  runtime n8n 2.30.8
- `sessionId` diberi `displayOptions` agar divalidasi sama seperti field
  lain — lihat [DEBUG.md](DEBUG.md)

**Berikutnya:** `0.2.0` siap terbit. Sesudah terpasang, kerjakan uji
`[manual]` tahap 2–5 dengan WhatsApp nyata.

---

## Ingat: paket ini publik

Dipasang orang lain di instansi n8n mereka. Yang gampang terlupa:

- Jangan menanam alamat, port, nama session, atau API key sebagai
  default. Punya pembuatnya bukan punya pemakainya.
- Node harus tetap muncul dan bisa dibuka walau engine tidak ada.
- Nama operasi dan field keluaran adalah janji ke pemakai. Mengubahnya
  merusak workflow orang — hanya boleh di versi mayor.
