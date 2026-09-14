# n8n-nodes-nc-wa — Urutan Pengerjaan

Acuan: [SPEC.md](SPEC.md) — aturan kerja: [AGENT.md](AGENT.md)

Tes `[agent]` tidak butuh n8n atau WhatsApp nyata: paket dibangun dan
fungsinya dipanggil langsung dengan konteks tiruan, engine uji dijalankan
di port terpisah. Tes `[manual]` butuh instansi n8n dan HP asli.

## 1. Fondasi paket

- [ ] Setup proyek (TypeScript, `.gitignore`, `tsconfig`)
- [ ] `package.json` dengan blok `n8n` dan keyword community node
- [ ] Credential NC-WA Gateway API (Base URL + API key → `X-API-Key`)
- [ ] Script build: kompilasi + salin ikon ke `dist`

**Uji**
- [ ] [agent] `npm run build` menghasilkan `dist` berisi berkas yang
      ditunjuk blok `n8n` di `package.json`
- [ ] [agent] Ikon ikut tersalin ke `dist`, bukan hanya `.js`
- [ ] [agent] Kelas credential bisa dimuat, header yang dihasilkan
      `X-API-Key`

Gerbang: paket harus terpasang dan terbaca n8n sebelum tahap 2.
Node yang tidak muncul di daftar tidak bisa diuji apa pun.

- [ ] [manual] Pasang paket di n8n, node "NC-WA" muncul di panel node
- [ ] [manual] Isi credential, tombol test kredensial hijau

## 2. Kirim teks

- [ ] Node aksi NC-WA, resource Message
- [ ] Operasi Kirim Teks (session, to, text)
- [ ] Teruskan error engine apa adanya
- [ ] Dukung Continue On Fail

**Uji**
- [ ] [agent] Nomor tak valid → engine menolak `invalid_request`,
      bukan gagal di sisi node
- [ ] [agent] Session belum tersambung → `session_not_connected`
      (membuktikan URL, body, dan header sampai benar)
- [ ] [agent] Session id berisi karakter aneh tidak merusak URL
- [ ] [agent] Continue On Fail menyala → error jadi item, workflow lanjut
- [ ] [manual] Kirim teks dari workflow, pesan sampai di HP tujuan

## 3. Presence

- [ ] Operasi Mengetik (state composing / recording / paused)
- [ ] Operasi Tandai Dibaca (from, messageId, sender opsional)

**Uji**
- [ ] [agent] Mengetik mengirim `state` sesuai pilihan
- [ ] [agent] Tandai dibaca tanpa `sender` tidak mengirim field kosong
- [ ] [manual] Indikator "sedang mengetik" terlihat di HP tujuan
- [ ] [manual] Tandai dibaca → centang biru muncul di HP pengirim

## 4. Trigger

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

## 5. Rapikan untuk dipakai

- [ ] README: pasang, atur credential, siapkan trigger
- [ ] Catatan migrasi dari WAHA (perubahan ekspresi `payload.*`)
- [ ] Ikon node

**Uji**
- [ ] [manual] Orang lain bisa memasang hanya dengan membaca README
- [ ] [manual] Satu cabang workflow `ai agent v2` dipindah dari WAHA
      ke NC-WA dan tetap berjalan

## 6. Terbitkan

Dikerjakan hanya kalau pemilik menyuruh. Sekali terbit di npm, versi itu
tidak bisa ditarik diam-diam.

- [ ] Repo GitHub
- [ ] Terbitkan ke npm
- [ ] Pasang lewat Settings → Community nodes di instansi produksi

**Uji**
- [ ] [manual] Pasang dari npm di instansi produksi, node muncul
- [ ] [manual] Workflow yang sudah dipindah tetap jalan setelah
      dipasang dari npm (bukan dari salinan lokal)
