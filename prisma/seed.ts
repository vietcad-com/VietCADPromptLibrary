import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TAGS = [
  { id: "gemini",     label: "Gemini",     group: "model" as const },
  { id: "chatgpt",    label: "ChatGPT",    group: "model" as const },
  { id: "claude",     label: "Claude",     group: "model" as const },
  { id: "midjourney", label: "Midjourney", group: "model" as const },
  { id: "image",      label: "Hình ảnh",   group: "type" as const },
  { id: "video",      label: "Video",      group: "type" as const },
  { id: "ppt",        label: "PPT",        group: "type" as const },
  { id: "web",        label: "Web",        group: "type" as const },
  { id: "text",       label: "Văn bản",    group: "type" as const },
  { id: "marketing",  label: "Marketing",  group: "topic" as const },
  { id: "sale",       label: "Sale",       group: "topic" as const },
  { id: "accounting", label: "Kế toán",    group: "topic" as const },
  { id: "tech",       label: "Tech",       group: "topic" as const },
];

const PROMPTS = [
  {
    title: "Tạo banner sản phẩm CAD",
    content: `Tạo hình ảnh banner chuyên nghiệp cho phần mềm {{tên sản phẩm}}, yêu cầu:
- Background: tối, gradient xanh navy sang đen
- Ánh sáng kỹ thuật số, hiệu ứng glowing
- Typography: bold, hiện đại, màu trắng/xanh cyan
- Kích thước: {{kích thước banner}}
- Tone: premium, high-tech, B2B`,
    note: "Prompt này hoạt động tốt nhất với Gemini Image và ChatGPT DALL-E 3. Không dùng cho Claude vì Claude không hỗ trợ sinh ảnh. Kết quả tốt nhất khi chạy 3–5 lần và chọn ảnh ưng ý nhất.",
    author: "Dat",
    createdAt: new Date("2026-03-28"),
    tagIds: ["gemini", "chatgpt", "image", "marketing"],
  },
  {
    title: "Ảnh thumbnail YouTube",
    content: `Generate thumbnail YouTube style với các yêu cầu:
- Màu sắc bắt mắt, tương phản cao
- Text overlay rõ ràng, font bold không quá 6 từ
- Tỉ lệ 16:9 (1280x720px)
- Chủ đề: {{chủ đề video}}
- Phong cách: {{phong cách (ví dụ: minimalist, dramatic, playful)}}`,
    note: "Midjourney cho kết quả đẹp hơn về mặt thẩm mỹ. Gemini nhanh hơn và miễn phí.",
    author: "Linh",
    createdAt: new Date("2026-03-25"),
    tagIds: ["gemini", "midjourney", "image", "tech"],
  },
  {
    title: "Mockup UI màn hình app",
    content: `Tạo mockup giao diện ứng dụng mobile với yêu cầu:
- Platform: {{iOS / Android}}
- Style: minimalist, clean
- Màu chủ đạo: {{màu chủ đạo}}
- Màn hình cần mockup: {{tên màn hình, ví dụ: Login, Dashboard, Profile}}
- Bao gồm: status bar, bottom navigation, các UI element cơ bản`,
    author: "Dat",
    createdAt: new Date("2026-03-22"),
    tagIds: ["gemini", "image", "tech"],
  },
  {
    title: "Email chào hàng khách doanh nghiệp",
    content: `Viết email chào hàng B2B cho {{tên công ty khách}}, ngành {{ngành khách hàng}}.

Yêu cầu:
- Tone: chuyên nghiệp, trang trọng nhưng không cứng nhắc
- Độ dài: 150–200 từ
- Nhấn mạnh: ROI, tiết kiệm thời gian, hỗ trợ kỹ thuật 24/7
- CTA: đặt lịch demo 30 phút
- Ký tên: {{tên người gửi}}, {{chức vụ}}`,
    note: "Luôn thêm tên công ty khách vào dòng đầu để tạo cảm giác cá nhân hoá. Sau khi AI viết xong, đọc lại và điều chỉnh tone cho phù hợp với từng khách.",
    author: "Hương",
    createdAt: new Date("2026-03-15"),
    tagIds: ["claude", "chatgpt", "text", "marketing", "sale"],
  },
  {
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
    note: "Dùng output này làm outline, sau đó đưa vào Gamma.app hoặc Canva để tạo slide thực tế.",
    author: "Nam",
    createdAt: new Date("2026-03-08"),
    tagIds: ["chatgpt", "claude", "ppt", "marketing"],
  },
  {
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
    note: "Nhớ xoá thông tin nhạy cảm trước khi paste vào AI. Claude cho kết quả phân tích sâu hơn ChatGPT.",
    author: "Trang",
    createdAt: new Date("2026-03-01"),
    tagIds: ["claude", "chatgpt", "text", "accounting"],
  },
];

async function main() {
  const existingTags = await prisma.tag.count();
  if (existingTags > 0) {
    console.log("Database already seeded, skipping.");
    return;
  }

  console.log("Seeding database...");

  await prisma.tag.createMany({ data: TAGS });

  for (const { tagIds, ...promptData } of PROMPTS) {
    await prisma.prompt.create({
      data: {
        ...promptData,
        tags: {
          create: tagIds.map((tagId) => ({ tagId })),
        },
      },
    });
  }

  console.log(`Seeded ${TAGS.length} tags and ${PROMPTS.length} prompts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
