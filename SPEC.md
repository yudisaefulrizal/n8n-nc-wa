# n8n-nodes-nc-wa — Spesifikasi

Community node n8n untuk [NC-WA](../nc-wa). Membungkus REST API
engine jadi node yang bisa dipakai di workflow.

Node ini tidak punya logika sendiri: tiap operasi = satu panggilan HTTP ke
engine. Yang pintar tetap engine dan workflow, bukan node ini.

## Kenapa dibuat

Engine NC-WA menyediakan REST API, tapi tanpa node, workflow harus
memanggilnya lewat HTTP Request node — URL, header, dan bentuk body
ditulis ulang tiap kali.

Sasaran langsung: menggantikan 60 node WAHA di workflow `ai agent v2`
tanpa menulis HTTP Request manual.

## Untuk siapa

**Paket publik.** Siapa pun boleh memasangnya di instansi n8n masing-masing.

Memasang node tidak mensyaratkan apa pun. Orang yang belum punya engine
NC-WA tetap bisa memasang paketnya, membuka node-nya, dan membaca
pilihannya. Kegagalan koneksi baru muncul saat workflow dijalankan —
bukan saat dipasang.

Akibatnya bagi rancangan:

- **Tanpa nilai default yang mengarah ke instalasi mana pun.** Base URL
  kosong, diisi sendiri oleh pemakai. Tidak ada `127.0.0.1:3000` atau
  alamat lain yang ditanam di kode.
- **Tidak ada asumsi soal nama session.** Tidak ada "toko-a" sebagai
  default; itu nama session di instalasi pembuatnya, bukan milik pemakai.
- **Dokumentasi berdiri sendiri.** README tidak menganggap pembaca sudah
  punya engine atau tahu apa itu NC-WA.

## Lingkup

Seluruh endpoint engine yang masuk akal dipanggil dari workflow.

Lingkup tidak dipersempit mengikuti kebutuhan pembuatnya. Pemakai lain
punya alur berbeda — yang tidak terpakai cukup diabaikan, sedangkan yang
tidak ada memaksa mereka kembali memakai HTTP Request node.

### Node aksi — NC-WA

Message:
- [ ] Kirim teks
- [ ] Kirim media + caption
- [ ] Mengetik (composing / recording / paused)
- [ ] Tandai dibaca

Session:
- [ ] Buat session
- [ ] Ambil detail session
- [ ] Ambil daftar session
- [ ] Ambil QR
- [ ] Sambung ulang
- [ ] Logout
- [ ] Hapus session

### Node trigger — NC-WA Trigger
- [ ] Terima webhook pesan masuk dari engine
- [ ] Saring berdasarkan session
- [ ] Saring pesan grup
- [ ] Mendaftarkan URL-nya sendiri ke engine waktu workflow diaktifkan

### Credential — NC-WA Gateway API
- [ ] Base URL + API key
- [ ] Dikirim sebagai header `X-API-Key`
- [ ] Tombol test kredensial

## Di luar lingkup

**Unduh media masuk** — `GET /media/:id` mengembalikan berkas biner, bukan
JSON. Penanganannya berbeda dari operasi lain dan lebih cocok lewat HTTP
Request node yang sudah pandai mengurus berkas.

**Broadcast, kontak, jadwal** — sama seperti di engine: urusan aplikasi
pemakai, bukan urusan node.

**Memasang atau mengatur engine** — node hanya memanggil API. Cara
memasang engine ada di dokumentasi engine.

## Bentuk data

### Tujuan

Node meneruskan apa adanya ke engine. Nomor polos `628123456789`,
grup `1234567890-1234567@g.us`. Engine yang membentuk JID.

Tidak meniru `chatId` bergaya WAHA (`628123@c.us`). Node ini pembungkus
NC-WA, jadi bentuknya ikut NC-WA.

### Keluaran trigger

Payload engine diteruskan apa adanya, datar:

```json
{
  "event": "message",
  "sessionId": "nama-session",
  "messageId": "3EB0...",
  "from": "628123456789",
  "isGroup": false,
  "groupId": null,
  "sender": "628123456789",
  "type": "text",
  "text": "halo",
  "timestamp": 1757900000,
  "media": null
}
```

Tidak dibungkus ulang jadi `payload.*` seperti WAHA. Konsekuensinya sudah
diterima: waktu migrasi, ekspresi di workflow lama harus diubah dari
`$('WAHA Trigger').item.json.payload.from` menjadi `.item.json.from`.

Membungkus supaya ekspresi lama tetap jalan berarti node ini berpura-pura
jadi produk lain selamanya, demi satu kali penyuntingan. Tidak sepadan.

### Mengetik

WAHA memisahkan Start Typing dan Stop Typing. Engine memakai satu endpoint
dengan `state`. Node mengikuti engine: satu operasi "Mengetik" dengan
pilihan state `composing` / `recording` / `paused`.

## Pemetaan ke API engine

| Operasi node | Endpoint |
|---|---|
| Kirim teks | `POST /sessions/:id/messages/text` |
| Kirim media | `POST /sessions/:id/messages/media` |
| Mengetik | `POST /sessions/:id/typing` |
| Tandai dibaca | `POST /sessions/:id/read` |
| Buat session | `POST /sessions` |
| Ambil detail session | `GET /sessions/:id` |
| Ambil daftar session | `GET /sessions` |
| Ambil QR | `GET /sessions/:id/qr` |
| Sambung ulang | `POST /sessions/:id/reconnect` |
| Logout | `POST /sessions/:id/logout` |
| Hapus session | `DELETE /sessions/:id` |
| Test kredensial | `GET /stats` |

Operasi yang mengembalikan array (daftar session) dipecah jadi beberapa
item n8n, bukan satu item berisi array — supaya bisa langsung dilewatkan
ke node berikutnya.

Trigger tidak memanggil engine. Engine yang mengirim ke URL webhook n8n
lewat `WEBHOOK_URL`.

## Penanganan error

Engine mengembalikan `{ "error": "...", "message": "..." }`. Node
meneruskan pesan error apa adanya supaya terbaca di n8n.

Node tidak mencoba ulang sendiri. Engine sudah punya queue dan retry
webhook; menambah retry di sini membuat pesan terkirim dobel.

`Continue On Fail` didukung: kalau dinyalakan, error jadi item keluaran
`{ error: "..." }`, bukan menghentikan workflow.

## Batasan

**Pendaftaran otomatis butuh engine yang mendukung `/webhooks`.** Trigger
mendaftarkan URL-nya sendiri waktu workflow diaktifkan dan mencabutnya waktu
dinonaktifkan. Engine lama yang hanya punya `WEBHOOK_URL` di `.env` tetap
bisa dipakai — aktivasi tidak digagalkan — tapi URL-nya harus disalin
manual, dan satu engine hanya bisa mengirim ke satu tujuan.

**Trigger perlu workflow aktif.** URL produksi hanya hidup saat workflow
aktif. Waktu menguji di editor, pakai Test URL dan tekan "Listen for test
event" dulu.

## Glosarium

**Engine** — NC-WA, aplikasi gateway di `../nc-wa`.

**Node aksi** — node yang dipanggil di tengah workflow untuk melakukan
sesuatu (kirim teks, typing). Butuh input, menghasilkan output.

**Trigger node** — node yang memulai workflow. Tidak punya input. Di sini
bentuknya webhook: n8n menyediakan URL, engine yang memanggilnya.

**Credential** — penyimpanan Base URL + API key di n8n, dipakai ulang oleh
semua node NC-WA. Bukan ditulis ulang tiap node.

**Community node** — paket npm yang dipasang pemilik instansi n8n sendiri
lewat Settings → Community nodes. Bukan bawaan n8n.

## Teknologi

- TypeScript, dikompilasi ke CommonJS
- `n8n-workflow` sebagai peer dependency
- Tanpa dependency runtime — node hanya memakai helper HTTP bawaan n8n

Sasaran: n8n 2.x (produksi sekarang 2.30.8, `n8n-workflow` 2.30.2).

## Distribusi

Paket npm publik bernama `n8n-nodes-nc-wa`, dipasang lewat
Settings → Community nodes. Nama sudah dicek belum dipakai di npm.

Wajib: nama berawalan `n8n-nodes-`, ada keyword `n8n-community-node-package`,
dan blok `n8n` di `package.json` yang menunjuk berkas hasil build.

**Nama paket berbeda dari nama folder dan repo.** Folder dan repo bernama
`n8n-nc-wa` (lebih pendek, enak dibaca), sedangkan paket npm harus
`n8n-nodes-nc-wa` karena n8n menolak community node yang namanya tidak
berawalan `n8n-nodes-`. Ini bukan kelalaian — memang tidak harus sama.

Repo: `https://github.com/yudisaefulrizal/n8n-nc-wa.git`

Karena dipakai orang lain:

- **Lisensi MIT**, berkas `LICENSE` ada di repo.
- **README berbahasa Inggris.** Pemakainya tidak hanya penutur Indonesia,
  dan npm dibaca lintas negara. Dokumen perencanaan (SPEC, ROADMAP, AGENT,
  DEBUG) tetap bahasa Indonesia — itu untuk yang mengerjakan.
- **Versi mengikuti semver.** Perubahan yang merusak workflow orang
  (nama field keluaran, nama operasi) hanya boleh di versi mayor.
