import { Prompt, TagPool } from "@/types";

export const DEFAULT_TAGS: TagPool = {
  model: [
    { id: "gemini",     label: "Gemini",     group: "model" },
    { id: "chatgpt",    label: "ChatGPT",    group: "model" },
    { id: "claude",     label: "Claude",     group: "model" },
    { id: "midjourney", label: "Midjourney", group: "model" },
  ],
  type: [
    { id: "image", label: "Hình ảnh", group: "type" },
    { id: "video", label: "Video",    group: "type" },
    { id: "ppt",   label: "PPT",      group: "type" },
    { id: "web",   label: "Web",      group: "type" },
    { id: "text",  label: "Văn bản",  group: "type" },
  ],
  topic: [
    { id: "marketing",  label: "Marketing", group: "topic" },
    { id: "sale",       label: "Sale",      group: "topic" },
    { id: "accounting", label: "Kế toán",   group: "topic" },
    { id: "tech",       label: "Tech",      group: "topic" },
  ],
};

export const MOCK_PROMPTS: Prompt[] = [
  {
    id: "1",
    title: "Tạo banner sản phẩm CAD",
    content: `Tạo hình ảnh banner chuyên nghiệp cho phần mềm {{tên sản phẩm}}, yêu cầu:
- Background: tối, gradient xanh navy sang đen
- Ánh sáng kỹ thuật số, hiệu ứng glowing
- Typography: bold, hiện đại, màu trắng/xanh cyan
- Kích thước: {{kích thước banner}}
- Tone: premium, high-tech, B2B`,
    note: "Prompt này hoạt động tốt nhất với Gemini Image và ChatGPT DALL-E 3. Không dùng cho Claude vì Claude không hỗ trợ sinh ảnh. Kết quả tốt nhất khi chạy 3–5 lần và chọn ảnh ưng ý nhất.",
    tags: [
      { id: "gemini",    label: "Gemini",    group: "model" },
      { id: "chatgpt",   label: "ChatGPT",   group: "model" },
      { id: "image",     label: "Hình ảnh",  group: "type"  },
      { id: "marketing", label: "Marketing", group: "topic" },
    ],
    author: "Dat",
    createdAt: "2026-03-28",
  },
  {
    id: "2",
    title: "Ảnh thumbnail YouTube",
    content: `Generate thumbnail YouTube style với các yêu cầu:
- Màu sắc bắt mắt, tương phản cao
- Text overlay rõ ràng, font bold không quá 6 từ
- Tỉ lệ 16:9 (1280x720px)
- Chủ đề: {{chủ đề video}}
- Phong cách: {{phong cách (ví dụ: minimalist, dramatic, playful)}}`,
    note: "Midjourney cho kết quả đẹp hơn về mặt thẩm mỹ. Gemini nhanh hơn và miễn phí.",
    tags: [
      { id: "gemini",    label: "Gemini",    group: "model" },
      { id: "midjourney",label: "Midjourney",group: "model" },
      { id: "image",     label: "Hình ảnh",  group: "type"  },
      { id: "tech",      label: "Tech",      group: "topic" },
    ],
    author: "Linh",
    createdAt: "2026-03-25",
  },
  {
    id: "3",
    title: "Mockup UI màn hình app",
    content: `Tạo mockup giao diện ứng dụng mobile với yêu cầu:
- Platform: {{iOS / Android}}
- Style: minimalist, clean
- Màu chủ đạo: {{màu chủ đạo}}
- Màn hình cần mockup: {{tên màn hình, ví dụ: Login, Dashboard, Profile}}
- Bao gồm: status bar, bottom navigation, các UI element cơ bản`,
    tags: [
      { id: "gemini", label: "Gemini",   group: "model" },
      { id: "image",  label: "Hình ảnh", group: "type"  },
      { id: "tech",   label: "Tech",     group: "topic" },
    ],
    author: "Dat",
    createdAt: "2026-03-22",
  },
  {
    id: "4",
    title: "Email chào hàng khách doanh nghiệp",
    content: `Viết email chào hàng B2B cho {{tên công ty khách}}, ngành {{ngành khách hàng}}.

Yêu cầu:
- Tone: chuyên nghiệp, trang trọng nhưng không cứng nhắc
- Độ dài: 150–200 từ
- Nhấn mạnh: ROI, tiết kiệm thời gian, hỗ trợ kỹ thuật 24/7
- CTA: đặt lịch demo 30 phút
- Ký tên: {{tên người gửi}}, {{chức vụ}}`,
    note: "Luôn thêm tên công ty khách vào dòng đầu để tạo cảm giác cá nhân hoá. Sau khi AI viết xong, đọc lại và điều chỉnh tone cho phù hợp với từng khách.",
    tags: [
      { id: "claude",    label: "Claude",    group: "model" },
      { id: "chatgpt",   label: "ChatGPT",   group: "model" },
      { id: "text",      label: "Văn bản",   group: "type"  },
      { id: "marketing", label: "Marketing", group: "topic" },
      { id: "sale",      label: "Sale",      group: "topic" },
    ],
    author: "Hương",
    createdAt: "2026-03-15",
  },
  {
    id: "5",
    title: "Slide pitch deck sản phẩm",
    content: `Tạo outline cho slide pitch deck {{tên sản phẩm/dịch vụ}}, gồm 10 slide:

1. Cover — tên, tagline
2. Problem — vấn đề thị trường
3. Solution — giải pháp của chúng ta
4. How it works — cơ chế hoạt động (3 bước)
5. Market size — TAM/SAM/SOM
6. Traction — số liệu hiện tại
7. Business model — cách kiếm tiền
8. Competitive advantage — lợi thế cạnh tranh
9. Team — thành viên chủ chốt
10. Ask — cần gì từ investor/đối tác

Mỗi slide: 1 tiêu đề + 3–4 bullet points ngắn gọn.`,
    note: "Dùng output này làm outline, sau đó đưa vào Gamma.app hoặc Canva để tạo slide thực tế. Prompt này cho tiếng Anh, nếu cần tiếng Việt thêm 'Viết bằng tiếng Việt' vào cuối.",
    tags: [
      { id: "chatgpt",   label: "ChatGPT",   group: "model" },
      { id: "claude",    label: "Claude",    group: "model" },
      { id: "ppt",       label: "PPT",       group: "type"  },
      { id: "marketing", label: "Marketing", group: "topic" },
    ],
    author: "Nam",
    createdAt: "2026-03-08",
  },
  {
    id: "6",
    title: "Tóm tắt báo cáo tài chính tháng",
    content: `Phân tích và tóm tắt báo cáo tài chính tháng {{tháng/năm}} dưới đây:

[Paste nội dung báo cáo vào đây]

Yêu cầu output:
1. Tổng quan 3 dòng
2. Các chỉ số chính: doanh thu, chi phí, lợi nhuận gộp, lợi nhuận ròng
3. So sánh với tháng trước (tăng/giảm %)
4. Top 3 điểm đáng chú ý
5. Đề xuất 2–3 action items cho tháng tới
Định dạng: bullet points, ngắn gọn, dễ đọc.`,
    note: "Nhớ xoá thông tin nhạy cảm (số tài khoản, tên khách hàng cụ thể) trước khi paste vào AI. Claude cho kết quả phân tích sâu hơn ChatGPT với dữ liệu tài chính.",
    tags: [
      { id: "claude",     label: "Claude",   group: "model" },
      { id: "chatgpt",    label: "ChatGPT",  group: "model" },
      { id: "text",       label: "Văn bản",  group: "type"  },
      { id: "accounting", label: "Kế toán",  group: "topic" },
    ],
    author: "Trang",
    createdAt: "2026-03-01",
  },
];
