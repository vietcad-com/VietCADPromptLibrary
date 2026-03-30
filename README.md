# Prompt Library — Mockup

Web app lưu trữ và tìm kiếm prompt AI cho team nội bộ.

## Cấu trúc file

```
src/
├── app/
│   ├── layout.tsx          # Root layout + nav
│   ├── page.tsx            # Trang chính: danh sách + filter
│   └── create/
│       └── page.tsx        # Trang tạo prompt mới
├── components/
│   ├── TagBadge.tsx        # Component tag có thể click/remove
│   ├── PromptModal.tsx     # Popup xem chi tiết prompt
│   └── AddTagModal.tsx     # Modal tạo tag mới
├── lib/
│   └── data.ts             # Mock data (prompts + tags mặc định)
└── types/
    └── index.ts            # TypeScript types
```

## Chạy local

```bash
npm install
npm run dev
# Mở http://localhost:3000
```

## Tính năng

- **Trang chủ**: Filter theo tag (OR trong nhóm, AND giữa nhóm), search full-text, active filter bar
- **Click prompt**: Popup xem full nội dung + chú thích + nút copy
- **Tạo prompt**: Form với title, content (hỗ trợ {{biến}}), chú thích, tag picker, tab preview
- **Tạo tag mới**: Bắt buộc chọn 1 trong 3 danh mục, tag sync cho cả sidebar và form

## Bước tiếp theo (để production)

1. Thêm API routes (`/api/prompts`, `/api/tags`) kết nối PostgreSQL
2. Thay `MOCK_PROMPTS` và `DEFAULT_TAGS` bằng `fetch` từ API
3. Thêm auth đơn giản (NextAuth hoặc cookie session)
4. Trang edit prompt (`/prompts/[id]/edit`)
```
