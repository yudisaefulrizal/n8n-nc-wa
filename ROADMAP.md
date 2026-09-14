# n8n-nodes-nc-wa — Urutan Pengerjaan

Acuan: [SPEC.md](SPEC.md) — aturan kerja: [AGENT.md](AGENT.md)

Tes `[agent]` tidak butuh n8n atau WhatsApp nyata: paket dibangun dan
fungsinya dipanggil langsung dengan konteks tiruan, engine uji dijalankan
di port terpisah. Tes `[manual]` butuh instansi n8n dan HP asli.

## 1. Fondasi paket

- [x] Setup proyek (TypeScript, `.gitignore`, `tsconfig`)
- [x] `package.json` dengan blok `n8n` dan keyword community node
- [x] Credential NC-WA Gateway API (Base URL + API key → `X-API-Key`)
- [x] Node aksi NC-WA dengan satu operasi (Kirim Teks) + ikon
- [x] Script build: kompilasi + salin ikon ke `dist`
- [x] LICENSE dan README secukupnya untuk terbit

Satu operasi ikut di tahap ini karena panel node n8n tidak menampilkan
credential — tanpa node, gerbang di bawah tidak bisa diuji sama sekali.
Operasi selebihnya menyusul di tahap 2–4.

**Uji**
- [x] [agent] `npm run build` menghasilkan `dist` berisi berkas yang
      ditunjuk blok `n8n` di `package.json`
- [x] [agent] Ikon ikut tersalin ke `dist`, bukan hanya `.js`
- [x] [agent] Kelas credential bisa dimuat, header yang dihasilkan
      `X-API-Key`
- [x] [agent] `npm pack` — isi tarball hanya `dist` + berkas wajib

Gerbang: paket harus benar-benar terpasang lewat
**Settings → Community nodes**, bukan disalin manual ke folder data.
Cara pasang lain tidak membuktikan paketnya layak terbit.

Karena UI n8n memasang dari npm, paket harus diterbitkan lebih dulu —
versi awal `0.1.0`, ditandai jelas belum lengkap.

- [x] [manual] Terbitkan `0.1.0` ke npm
- [ ] [manual] Pasang lewat Settings → Community nodes, tanpa menyalin
      berkas apa pun ke folder data
- [ ] [manual] Node "NC-WA" muncul di panel node
- [ ] [manual] Isi credential, tombol test kredensial hijau

## 2. Kirim pesan

- [ ] Node aksi NC-WA, resource Message
- [ ] Operasi Kirim Teks (session, to, text)
- [ ] Operasi Kirim Media (type, url, caption, filename)
- [ ] Teruskan error engine apa adanya
- [ ] Dukung Continue On Fail

**Uji**
- [ ] [agent] Nomor tak valid → engine menolak `invalid_request`,
      bukan gagal di sisi node
- [ ] [agent] Session belum tersambung → `session_not_connected`
      (membuktikan URL, body, dan header sampai benar)
- [ ] [agent] Session id berisi karakter aneh tidak merusak URL
- [ ] [agent] Media tanpa caption tidak mengirim field kosong
- [ ] [agent] Continue On Fail menyala → error jadi item, workflow lanjut
- [ ] [manual] Kirim teks dari workflow, pesan sampai di HP tujuan
- [ ] [manual] Kirim gambar + caption, sampai dan caption terbaca

## 3. Presence

- [ ] Operasi Mengetik (state composing / recording / paused)
- [ ] Operasi Tandai Dibaca (from, messageId, sender opsional)

**Uji**
- [ ] [agent] Mengetik mengirim `state` sesuai pilihan
- [ ] [agent] Tandai dibaca tanpa `sender` tidak mengirim field kosong
- [ ] [manual] Indikator "sedang mengetik" terlihat di HP tujuan
- [ ] [manual] Tandai dibaca → centang biru muncul di HP pengirim

## 4. Kelola session

- [ ] Resource Session: buat, detail, daftar, QR
- [ ] Sambung ulang, logout, hapus
- [ ] Daftar session dipecah jadi beberapa item

**Uji**
- [ ] [agent] Ambil daftar → tiap session jadi satu item terpisah
- [ ] [agent] Buat session lalu hapus, keduanya mengembalikan bentuk benar
- [ ] [agent] Ambil detail session tak dikenal → error diteruskan apa adanya
- [ ] [manual] Buat session dari workflow, ambil QR, pindai sampai
      `connected`

## 5. Trigger

- [ ] Trigger node dengan webhook POST
- [ ] Pilihan event: pesan masuk, status session, QR
- [ ] Saring berdasarkan session
- [ ] Opsi abaikan pesan grup
- [ ] Catatan di node: cara mengisi `WEBHOOK_URL` di engine

**Uji**
- [ ] [agent] Event tidak dipilih → workflow tidak jalan
- [ ] [agent] Session lain → disaring
- [ ] [agent] Abaikan grup menyala → pesan grup tidak lolos
- [ ] [agent] Abaikan grup mati → pesan grup lolos
- [ ] [manual] Isi `WEBHOOK_URL` engine dengan URL produksi trigger,
      kirim pesan dari HP → workflow berjalan
- [ ] [manual] Field `from`, `sender`, `isGroup` terisi benar di output

## 6. Siap dipakai orang lain

Tahap yang membedakan paket pribadi dari paket publik.

- [ ] README bahasa Inggris: apa ini, butuh apa, cara pasang, cara pakai
- [ ] Tautan ke engine NC-WA untuk yang belum punya
- [ ] LICENSE (MIT)
- [ ] Catatan migrasi dari WAHA (perubahan ekspresi `payload.*`)
- [ ] Ikon node
- [ ] Pastikan tidak ada nilai default yang menunjuk instalasi pembuat

**Uji**
- [ ] [agent] Cari di seluruh kode: tidak ada alamat IP, port, nama
      session, atau API key yang tertanam
- [ ] [agent] `npm pack` — isi tarball hanya `dist` dan berkas wajib,
      tidak ada `.env`, sumber, atau berkas pribadi
- [ ] [manual] Pasang di n8n **tanpa** engine berjalan → node tetap muncul
      dan bisa dibuka, gagal hanya saat dijalankan
- [ ] [manual] Orang lain bisa memasang hanya dengan membaca README
- [ ] [manual] Satu cabang workflow `ai agent v2` dipindah dari WAHA
      ke NC-WA dan tetap berjalan

## 7. Terbitkan

Dikerjakan hanya kalau pemilik menyuruh. Sekali terbit di npm, versi itu
tidak bisa ditarik diam-diam.

- [ ] Repo GitHub
- [ ] Terbitkan ke npm
- [ ] Pasang lewat Settings → Community nodes di instansi produksi

**Uji**
- [ ] [manual] Pasang dari npm di instansi produksi, node muncul
- [ ] [manual] Workflow yang sudah dipindah tetap jalan setelah
      dipasang dari npm (bukan dari salinan lokal)
