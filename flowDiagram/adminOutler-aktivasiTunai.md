mermaid
sequenceDiagram
    actor C as Pelanggan (cash)
    actor Ad as Admin Outlet
    participant AUI as Admin UI
    participant API as Core API
    participant DB as PostgreSQL (+Outbox)
    participant WRK as Core Worker
    participant BRK as MQTT Broker
    participant MC as Device — Mesin
 
    C->>Ad: Bayar tunai di outlet
 
    alt Dari Dashboard
        Ad->>AUI: Klik quick-activate (widget dashboard)
    else Dari halaman Transaksi
        Ad->>AUI: Klik quick-activate (halaman transaksi)
    end
 
    AUI->>API: GET /outlets/{id}/machines?status=available
    Note over API: Human Middleware — verifikasi JWT Zitadel + RBAC scope=outlet
    API->>DB: query mesin tersedia
    DB-->>API: daftar mesin
    API-->>AUI: 200 OK
    Ad->>AUI: Pilih mesin, layanan, durasi
 
    AUI->>API: POST /orders/cash { machine_id, service_type, duration, admin_id }
    API->>DB: INSERT order (payment_method=cash), tulis outbox command
    API-->>AUI: 202 Accepted { order_id } — perintah diterima, bukan mesin sudah menyala
    AUI-->>Ad: Tampilkan "memproses..."
 
    WRK->>DB: poll outbox
    WRK->>BRK: publish menwash/{outlet}/{machine_id}/cmd { action: start, duration }
    BRK->>MC: deliver command (QoS 1)
    MC->>BRK: publish ack (topic terpisah)
    BRK->>WRK: deliver ACK (subscribe)
    WRK->>DB: command=ACKED, mesin=RUNNING
 
    AUI->>API: polling/SSE status order_id
    API-->>AUI: RUNNING
    AUI-->>Ad: Tampilkan status berhasil
 
    Note over MC: Siklus berjalan, sama seperti transaksi QRIS
