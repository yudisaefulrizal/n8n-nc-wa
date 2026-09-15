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
- [x] [manual] Pasang lewat Settings → Community nodes, tanpa menyalin
      berkas apa pun ke folder data
- [x] [manual] Node "NC-WA" muncul di panel node
- [x] [manual] Isi credential, tombol test kredensial hijau

## 2. Kirim pesan

- [x] Node aksi NC-WA, resource Message
- [x] Operasi Kirim Teks (session, to, text)
- [x] Operasi Kirim Media (type, url, caption, filename)
- [x] Teruskan error engine apa adanya
- [x] Dukung Continue On Fail

**Uji**
- [x] [agent] Nomor tak valid → engine menolak `invalid_request`,
      bukan gagal di sisi node
- [x] [agent] Session belum tersambung → `session_not_connected`
      (membuktikan URL, body, dan header sampai benar)
- [x] [agent] Session id berisi karakter aneh tidak merusak URL
- [x] [agent] Media tanpa caption tidak mengirim field kosong
- [x] [agent] Continue On Fail menyala → error jadi item, workflow lanjut
- [ ] [manual] Kirim teks dari workflow, pesan sampai di HP tujuan
- [ ] [manual] Kirim gambar + caption, sampai dan caption terbaca

## 3. Presence

- [x] Operasi Mengetik (state composing / recording / paused)
- [x] Operasi Tandai Dibaca (from, messageId, sender opsional)

**Uji**
- [x] [agent] Mengetik mengirim `state` sesuai pilihan
- [x] [agent] Tandai dibaca tanpa `sender` tidak mengirim field kosong
- [ ] [manual] Indikator "sedang mengetik" terlihat di HP tujuan
- [x] [manual] Tandai dibaca → centang biru muncul di HP pengirim

## 4. Kelola session

- [x] Resource Session: buat, detail, daftar, QR
- [x] Sambung ulang, logout, hapus
- [x] Daftar session dipecah jadi beberapa item

**Uji**
- [x] [agent] Ambil daftar → tiap session jadi satu item terpisah
- [x] [agent] Buat session lalu hapus, keduanya mengembalikan bentuk benar
- [x] [agent] Ambil detail session tak dikenal → error diteruskan apa adanya
- [ ] [manual] Buat session dari workflow, ambil QR, pindai sampai
      `connected`

## 5. Trigger

- [x] Trigger node dengan webhook POST
- [x] Pilihan event: pesan masuk, status session, QR
- [x] Saring berdasarkan session
- [x] Opsi abaikan pesan grup
- [x] Catatan di node: cara mengisi `WEBHOOK_URL` di engine

**Uji**
- [x] [agent] Event tidak dipilih → workflow tidak jalan
- [x] [agent] Session lain → disaring
- [x] [agent] Abaikan grup menyala → pesan grup tidak lolos
- [x] [agent] Abaikan grup mati → pesan grup lolos
- [x] [manual] Isi `WEBHOOK_URL` engine dengan URL produksi trigger,
      kirim pesan dari HP → workflow berjalan
- [x] [manual] Field `from`, `sender`, `isGroup` terisi benar di output

## 6. Siap dipakai orang lain

Tahap yang membedakan paket pribadi dari paket publik.

- [x] README bahasa Inggris: apa ini, butuh apa, cara pasang, cara pakai
- [x] Tautan ke engine NC-WA untuk yang belum punya
- [x] LICENSE (MIT)
- [x] Catatan migrasi dari WAHA (perubahan ekspresi `payload.*`)
- [x] Ikon node
- [x] Pastikan tidak ada nilai default yang menunjuk instalasi pembuat

**Uji**
- [x] [agent] Cari di seluruh kode: tidak ada alamat IP, port, nama
      session, atau API key yang tertanam
- [x] [agent] `npm pack` — isi tarball hanya `dist` dan berkas wajib,
      tidak ada `.env`, sumber, atau berkas pribadi
- [ ] [manual] Pasang di n8n **tanpa** engine berjalan → node tetap muncul
      dan bisa dibuka, gagal hanya saat dijalankan
- [ ] [manual] Orang lain bisa memasang hanya dengan membaca README
- [ ] [manual] Satu cabang workflow `ai agent v2` dipindah dari WAHA
      ke NC-WA dan tetap berjalan

## 7. Terbitkan

Dikerjakan hanya kalau pemilik menyuruh. Sekali terbit di npm, versi itu
tidak bisa ditarik diam-diam.

- [x] Repo GitHub
- [x] Terbitkan ke npm
- [ ] Pasang lewat Settings → Community nodes di instansi produksi

**Uji**
- [x] [manual] Pasang dari npm di instansi produksi, node muncul
- [ ] [manual] Workflow yang sudah dipindah tetap jalan setelah
      dipasang dari npm (bukan dari salinan lokal)

## 8. Trigger mendaftar sendiri

Menuntut engine punya API `/webhooks` (tahap 7 di engine).

- [x] `webhookMethods.create` mendaftarkan URL waktu workflow diaktifkan
- [x] `webhookMethods.delete` mencabutnya waktu dinonaktifkan
- [x] Simpan id langganan di static data node
- [x] Teruskan penyaring session ke gateway
- [x] Gateway lama tanpa `/webhooks` tidak menggagalkan aktivasi

**Uji**
- [x] [agent] Aktivasi mendaftarkan URL ke gateway
- [x] [agent] Aktivasi ulang tidak menumpuk duplikat
- [x] [agent] URL uji dan URL produksi jadi langganan terpisah
- [x] [agent] Penonaktifan mencabut langganan dan membersihkan static data
- [x] [agent] `delete` tanpa id tersimpan tidak menggagalkan
- [x] [agent] `delete` pada id yang sudah hilang tidak menahan penonaktifan
- [x] [agent] Gateway tanpa `/webhooks` tetap boleh diaktifkan
- [x] [manual] Aktifkan workflow → langganan muncul di `GET /webhooks`
      gateway tanpa menyentuh `.env`
- [x] [manual] Kirim pesan dari HP → workflow berjalan
- [ ] [manual] Nonaktifkan workflow → langganan hilang dari gateway
