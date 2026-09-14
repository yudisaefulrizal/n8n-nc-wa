# Catatan Kegagalan

Isinya bukan daftar tugas, tapi hal yang **sudah terbukti tidak berhasil** —
supaya tidak diulang. Ditulis tiap kali satu percobaan perbaikan gagal.

Format per masalah:

```
## <gejalanya, bukan dugaan penyebabnya>
- Coba 1: <apa yang diubah> → <hasilnya>
- Coba 2: <apa yang diubah> → <hasilnya>
- Terbukti bukan penyebabnya: <yang sudah dicek dan bersih>
- Status: belum selesai / selesai — <sebabnya apa>
```

Baris "terbukti bukan penyebabnya" yang paling penting. Itu yang paling
sering hilang dari ingatan dan paling mahal diulang.

Masalah yang sudah selesai tetap disimpan, jangan dihapus — kalau gejala
yang sama muncul lagi, catatannya sudah ada.

---

## `Cannot find module 'n8n-workflow'` waktu memuat node dengan `node -e`

Ditemukan di prototipe sebelum roadmap ini disusun. Dicatat karena
gejalanya meyakinkan dan gampang disalahartikan sebagai paket rusak.

- Coba 1: muat berkas `.node.js` dari `/tmp` di dalam container →
  `MODULE_NOT_FOUND`.
- Coba 2: pindahkan ke `~/.n8n/nodes/node_modules/` (lokasi yang benar,
  sama seperti community node yang sudah jalan) → error yang sama persis.
- Terbukti bukan penyebabnya: hasil build dan `package.json` sehat —
  community node lain yang jelas-jelas berfungsi di instansi yang sama
  (`@devlikeapro/n8n-nodes-waha`) juga gagal dimuat dengan cara ini.
  Jadi gejalanya milik metode uji, bukan milik paket.
- Status: selesai — `node -e` biasa tidak punya resolusi modul n8n.
  n8n memuat node lewat loader internalnya yang menyediakan
  `n8n-workflow`. Untuk memeriksa cepat tanpa menjalankan n8n, jalankan
  dari direktori paket n8n dan tambahkan `node_modules`-nya ke
  `Module.globalPaths`.

  Tapi ini hanya membuktikan berkasnya bisa dimuat — **bukan** bahwa n8n
  mengenali dan menampilkan node-nya. Itu tetap tes `[manual]`.

## `npm publish` ditolak 403 walau sudah `npm login`

- Coba 1: `npm publish` setelah `npm whoami` mengembalikan nama akun →
  `403 Forbidden ... Two-factor authentication or granular access token
  with bypass 2fa enabled is required to publish packages`.
- Terbukti bukan penyebabnya: paketnya sendiri sehat — nama masih kosong
  di registry, `npm pack` bersih, dan isi tarball sudah terbukti bisa
  dimuat runtime n8n. Sesi login juga sah.
- Status: selesai — npm mewajibkan 2FA untuk menerbitkan, terpisah dari
  login biasa. Aktifkan 2FA mode "Authorization and writes" di
  Account → Two-Factor Authentication, lalu `npm publish` lagi; npm
  membuka halaman otentikasi di browser dan terbit setelah dikonfirmasi.

  Jangan menempuh jalan pintas granular token "bypass 2FA": npm sedang
  membatasi token semacam itu (perubahan akun Agustus 2026, publish
  langsung Januari 2027).

## Node melaporkan Session ID, To, dan Text kosong padahal ketiganya terisi

- Coba 1: memeriksa instansi n8n Docker di mesin pengembang
  (`n8n_nuscode-n8n_nuscode-1`) → paketnya tidak ada di sana sama sekali;
  `NcWa.node.js` tidak ditemukan di seluruh filesystem container.
  Pemilik memasangnya di instansi lain.
- Terbukti bukan penyebabnya: `required: true` bukan hal aneh — node
  bawaan n8n memakainya juga. Definisi properti juga terbaca wajar waktu
  kelasnya dimuat.
- Coba 2: reproduksi lokal dengan `NodeHelpers.getNodeParametersIssues`
  dari `n8n-workflow` → ketahuan `sessionId` satu-satunya field wajib
  tanpa `displayOptions`, sehingga tetap divalidasi walau
  `resource`/`operation` belum diset, sedangkan `to` dan `text` tidak.
  Validasi jadi tidak konsisten antar-field.
- Status: selesai sebagian — `sessionId` diberi
  `displayOptions: { show: { resource: ['message'] } }` supaya
  diperlakukan sama dengan field lain, dan tetap muncul untuk semua
  operasi Message yang akan datang.

  Yang belum terjawab: kenapa nilai yang sudah diketik terbaca kosong
  oleh n8n. Aturan validasinya (`node-helpers.js`, `addToIssuesIfMissing`)
  menganggap parameter `string` bermasalah kalau nilainya `''` **atau
  `undefined`** — jadi gejalanya muncul ketika parameter belum tersimpan
  ke workflow, bukan ketika benar-benar dikosongkan. Perlu dipastikan
  ulang di instansi tempat gejalanya muncul.

## `npm publish` ditolak 409 "Cannot publish over previously staged version"

- Sebabnya: percobaan `npm publish` dari sesi non-interaktif gagal di
  OTP (`EOTP`), tetapi versi itu terlanjur tersangkut sebagai *staged
  version* di npm. Percobaan berikutnya ditolak karena tidak boleh
  menimpa versi yang sudah di-stage.
- Terbukti bukan penyebabnya: paketnya sehat — `npm pack` benar, login
  sah, dan versi itu tidak ada di registry publik (`npm view versions`
  hanya menampilkan versi sebelumnya).
- Status: selesai — jangan menjalankan `npm publish` dari sesi yang tidak
  bisa menyelesaikan OTP. Publish dijalankan pemilik di terminalnya
  sendiri, atau dengan `--otp=<kode>`.

  Kalau sudah terlanjur: bereskan lewat **Staged Packages** di npmjs.com,
  atau naikkan nomor versi lalu terbitkan ulang.
