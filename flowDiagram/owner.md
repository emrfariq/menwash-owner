flowchart TB
    A(["Owner login"]) --> B["Halaman Dashboard"]
    B --> N1["Buka halaman Keuangan"] & N2["Buka halaman Mesin"] & N3["Buka halaman Pengaturan"] & N4["Buka halaman Progress"]
 
    N1 --> E["Lihat detail tiap transaksi"] & F["Lihat tren customer"] & G["Lihat jumlah customer"]
 
    N2 --> M1["Tampil list mesin cuci & pengering<br>seluruh outlet, sebagai dua daftar terpisah"]
    M1 --> M2["Owner klik salah satu mesin"]
    M2 --> M3["Tampil opsi Kontrol Darurat<br>khusus untuk mesin tersebut"]
 
    N4 --> PR1["Tampil siklus sedang berjalan<br>seluruh outlet: QRIS mandiri &<br>transaksi tunai, mesin berputar real-time"]
    PR1 --> PR2["Tampil riwayat: selesai & gagal"]
    PR1 --> PR3["Owner klik siklus yang sedang berjalan"]
    PR3 --> M3
 
    M3 --> M4{"Tindakan?"}
    M4 -- Matikan mesin --> M6{"Mesin sedang<br>menjalankan siklus berbayar?"}
    M6 -- Ya --> M6a["Wajib isi alasan force stop<br>sebelum tindakan diproses"]
    M6a --> M6b["Matikan mesin sedang berjalan"]
    M6 -- Tidak --> M6c["Matikan mesin idle/bermasalah"]
    M6b --> M7["Aktivitas tercatat dengan alasan tindakan"]
    M6c --> M7
    M7 --> M1
 
    N3 --> P2["Atur harga perlayanan dan promo"] & P3["Kelola akun Admin per outlet"]
    P3 --> P3a["Buat akun Admin baru untuk outlet"] & P3c["Nonaktifkan / hapus akun Admin"]
    P3a --> P3b["Sistem mencatat aktivitas pembuatan akun<br>sebagai audit log"]
    P3b --> N3
    P3c --> P3b
 
    style A fill:#f3e8fd,stroke:#6b46c1
    style M6a fill:#fff7e6,stroke:#b7791f
    style M6b fill:#fde8e8,stroke:#c53030
    style P3a fill:#e6f9ed,stroke:#2f855a
    style P3c fill:#fde8e8,stroke:#c53030
