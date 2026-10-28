# ERD TaskFlow

```mermaid
erDiagram
  USERS ||--o{ PUSH_TOKENS : registers
  USERS ||--o{ TASKS : owns
  USERS {
    int id PK
    varchar nama
    varchar email UK
    varchar password_hash
    datetime dibuat_pada
  }
  PUSH_TOKENS {
    int id PK
    int user_id FK
    varchar expo_push_token UK
    datetime dibuat_pada
    datetime diperbarui_pada
  }
  TASKS {
    int id PK
    int user_id FK
    varchar judul
    text deskripsi
    enum status
    datetime dibuat_pada
    datetime diperbarui_pada
  }
```

Setiap query tugas difilter menggunakan `user_id` dari claim `sub` pada JWT yang telah diverifikasi. ID tugas tidak dianggap cukup sebagai otorisasi. Foreign key `ON DELETE CASCADE` menghapus token dan tugas milik akun yang dihapus.
