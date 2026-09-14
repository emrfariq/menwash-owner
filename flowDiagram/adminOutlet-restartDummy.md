mermaid
sequenceDiagram
    actor P as Pelanggan
    actor Ad as Admin Outlet
    participant AUI as Admin UI
    participant API as Core API
    participant DB as PostgreSQL (+Outbox)
    participant WRK as Core Worker
    participant BRK as MQTT Broker
    participant MC as Device — Mesin
 
    P->>Ad: Datangi Admin Outlet (order gagal)
 
    Ad->>AUI: Buka /progress?filter=failed
    AUI->>API: GET /outlets/{id}/orders?status=failed
    API-->>AUI: daftar order gagal/gangguan
    Ad->>AUI: Pilih order milik pelanggan
    Ad->>AUI: Pilih target mesin (sama/lain yang tersedia)
    Ad->>AUI: Sesuaikan sisa durasi/layanan
    Ad->>AUI: Isi notes (wajib)
 
    AUI->>API: POST /orders/{id}/dummy-restart<br/>{ target_machine_id, remaining_duration, notes, admin_id }
    Note over API: Human Middleware — verifikasi JWT + RBAC scope=outlet
 
    API->>DB: UPDATE orders SET status=REFUNDED WHERE id=order_id
    API->>DB: INSERT orders (linked_order_id, payment_method=dummy, duration=remaining_duration)
    API->>DB: tulis outbox command start
    API-->>AUI: 202 Accepted { new_order_id, linked_order_id }
    AUI-->>Ad: Tampilkan "memproses..."
 
    WRK->>DB: poll outbox
    WRK->>BRK: publish menwash/{outlet}/{target_machine_id}/cmd { action: start, duration: remaining_duration }
    BRK->>MC: deliver command
    MC->>BRK: publish ack (topic terpisah)
    BRK->>WRK: deliver ACK (subscribe)
    WRK->>DB: command=ACKED, mesin=RUNNING, order status=RUNNING
 
    AUI->>API: polling/SSE status
    API-->>AUI: RUNNING
    AUI-->>Ad: Tampilkan konfirmasi mesin dinyalakan ulang
 
    Note over MC: Siklus dilanjutkan hingga selesai
