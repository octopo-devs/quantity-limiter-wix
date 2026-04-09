# Project Plan: Wix Quantity Limiter App

## 1. Mục tiêu (Objective)

Xây dựng hệ thống giới hạn số lượng mua (Quantity Limiter) cho sản phẩm trên nền tảng Wix, áp dụng cho Product Page, Collection Page, Side Cart và Main Cart.

## 2. Kiến trúc hệ thống (System Architecture)

- **Tech Stack:** Our backend, Wix Analytics Events.
- **Tư tưởng thiết kế hệ thống:** 
    - có 2 logic xử lý riêng biệt
        - Product page (single product): sử dụng wix-analytics để lấy dữ liệu của current product và lắng nghe thay đổi (như `productPageLoaded`, `CustomizeProduct`, )
        - Các collection page/cart page (multiple product): sử dụng hàm setInterval để quét, mỗi product sẽ có Context (data, condition result, QuantityLimitMessage riêng), lắng nghe thay đổi bằng logic riêng

## 3. Lộ trình thực thi (Execution Roadmap)

### Phase 1: Product Page (Single Product) - [ĐANG THỰC HIỆN]

- **Mục tiêu:** Kiểm soát số lượng ngay tại trang chi tiết sản phẩm.
- **Logic:**
  1. Khi trang tải, lấy dữ liệu Product hiện tại (ID, Variants, Stock).
  2. Lưu trữ thông tin cần thiết vào Map `window.qlProducts`.
  3. Lắng nghe sự kiện `wix-analytics` (như `productPageLoaded`, `CustomizeProduct`, ) hoặc thay đổi Variant.
  4. So sánh số lượng người dùng chọn với `Limit Value` được cấu hình.
  5. Vô hiệu hóa (Disable) nút "Add to Cart" hoặc hiển thị cảnh báo nếu vượt quá giới hạn.

### Phase 2: Multi-Product Pages (Collection / Side Cart / Cart) - [KẾ HOẠCH]

- **Mục tiêu:** Kiểm soát số lượng khi sản phẩm nằm trong danh sách hoặc giỏ hàng.
- **Logic:**
  1. Sử dụng `setInterval` để quét (poll) các element có attribute `data-wix-line-item-id`.
  2. Lấy danh sách Product IDs từ các attribute này.
  3. Đối chiếu với DB giới hạn số lượng.
  4. Tự động điều chỉnh hoặc cảnh báo nếu tổng số lượng trong giỏ hàng (Cart) vượt mức cho phép.
