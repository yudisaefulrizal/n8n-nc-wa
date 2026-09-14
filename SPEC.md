# n8n-nodes-nc-wa — Spesifikasi

Community node n8n untuk [NC-WA](../nc-wa). Membungkus REST API
engine jadi node yang bisa dipakai di workflow.

Node ini tidak punya logika sendiri: tiap operasi = satu panggilan HTTP ke
engine. Yang pintar tetap engine dan workflow, bukan node ini.

## Kenapa dibuat

Workflow `ai agent v2` sekarang memakai 60 node WAHA. Engine NC-WA sudah
jalan di produksi dan menyediakan kemampuan yang sama, tapi belum ada
node-nya — jadi hanya bisa dipanggil lewat HTTP Request node, satu per satu,
dengan URL dan header yang ditulis ulang tiap kali.

Sasaran: bisa mengganti WAHA di workflow tanpa menulis HTTP Request manual.

## Lingkup

Hanya operasi yang benar-benar dipakai workflow hari ini.

Diambil dari `ai agent v2`: Send Text (16), Start Typing (16),
Stop Typing (16), Send Seen (12). Tidak ada satu pun node WAHA di workflow
itu yang mengelola session atau mengirim media.

### Node aksi — NC-WA
- [ ] Kirim teks
- [ ] Mengetik (mulai / berhenti)
- [ ] Tandai dibaca

### Node trigger — NC-WA Trigger
- [ ] Terima webhook pesan masuk dari engine
- [ ] Saring berdasarkan session
- [ ] Saring pesan grup

### Credential — NC-WA Gateway API
- [ ] Base URL + API key
- [ ] Dikirim sebagai header `X-API-Key`
- [ ] Tombol test kredensial

## Di luar lingkup

**Kelola session** (buat, QR, logout, hapus) — dikerjakan lewat dashboard
engine, bukan dari workflow. Session dibuat sekali lalu dipakai terus;
tidak ada alasan sebuah workflow membuat session sendiri.

**Kirim media** — belum dipakai workflow mana pun. Ditambahkan kalau sudah
ada kebutuhan nyata, bukan karena endpoint-nya kebetulan ada.

**Unduh media masuk** — `GET /media/:id` butuh API key dan mengembalikan
berkas biner. Pakai HTTP Request node kalau perlu.

**Broadcast, kontak, jadwal** — sama seperti di engine: urusan aplikasi
pemakai.

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
  "sessionId": "toko-a",
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
| Mengetik | `POST /sessions/:id/typing` |
| Tandai dibaca | `POST /sessions/:id/read` |
| Test kredensial | `GET /stats` |

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

**Satu webhook URL di engine.** `WEBHOOK_URL` cuma satu nilai. Artinya
satu instalasi engine mengirim ke satu trigger node. Kalau perlu bercabang,
pakai Switch node di dalam workflow, bukan dua trigger.

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
