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
