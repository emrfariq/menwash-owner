mermaid
sequenceDiagram
    actor Ad as Admin Outlet
    participant AUI as Admin UI
    participant API as Core API
    participant DB as PostgreSQL (+Outbox)
    participant WRK as Core Worker
    participant BRK as MQTT Broker
    participant MC as Device — Mesin
 
    alt Dari halaman Mesin
        Ad->>AUI: Buka /machines
        AUI->>API: GET /outlets/{id}/machines
        API-->>AUI: daftar mesin cuci & pengering (dua list terpisah)
        Ad->>AUI: Klik machine_id
    else Dari halaman Progress
        Ad->>AUI: Buka /progress
        AUI->>API: GET /outlets/{id}/orders?status=running
        API-->>AUI: daftar siklus berjalan
        Ad->>AUI: Klik order terkait mesin
    end
 
    AUI->>API: GET /machines/{id}/current-order
    Note over API: Domain Logic menentukan status bisnis dari PostgreSQL
    API-->>AUI: { order_id, is_paid_cycle }
 
    alt is_paid_cycle == true
        AUI-->>Ad: Minta alasan force-stop (wajib)
        Ad->>AUI: Isi alasan
        AUI->>API: POST /machines/{id}/commands { action: stop, reason, admin_id }
    else is_paid_cycle == false
        AUI->>API: POST /machines/{id}/commands { action: stop, admin_id }
    end
 
    Note over API: Human Middleware — verifikasi JWT + RBAC scope=outlet
    API->>DB: validasi + simpan command PENDING, tulis outbox
    API-->>AUI: 202 Accepted { command_id }
    AUI-->>Ad: Tampilkan "memproses..."
 
    WRK->>DB: poll outbox
    WRK->>BRK: publish menwash/{outlet}/{id}/cmd { action: stop }
    BRK->>MC: deliver command (QoS 1)
    MC->>BRK: publish ack (topic terpisah)
    BRK->>WRK: deliver ACK (subscribe)
    WRK->>DB: command=ACKED, mesin=STOPPED, catat machine_activity_log (reason)
 
    AUI->>API: polling/SSE status
    API-->>AUI: STOPPED
    AUI-->>Ad: Tampilkan status berhasil
