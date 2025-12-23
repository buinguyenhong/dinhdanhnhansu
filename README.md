
# Identity Hub - Cập nhật thông tin nhân viên

Ứng dụng web nhanh gọn giúp nhân viên cập nhật thông tin định danh và tải lên ảnh CCCD.

## Công nghệ sử dụng
- **Frontend:** React, Tailwind CSS, Lucide Icons.
- **Backend:** Supabase (Lưu trữ thông tin nhân viên, tỉnh thành).
- **Storage:** Cloudinary (Lưu trữ ảnh CCCD).

## Cấu hình
Dữ liệu đã được cấu hình sẵn trong:
- `supabaseClient.ts`: Kết nối Database.
- `storageService.ts`: Cấu hình Cloudinary.

## Cách chạy dự án
1. Cài đặt thư viện: `npm install`
2. Chạy môi trường dev: `npm run dev`
3. Build dự án: `npm run build`
