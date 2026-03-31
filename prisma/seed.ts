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
    items: [
      {
        header: "Banner chính cho website",
        content: `Tạo hình ảnh banner chuyên nghiệp cho phần mềm {{tên sản phẩm}}, yêu cầu:
- Background: tối, gradient xanh navy sang đen
- Ánh sáng kỹ thuật số, hiệu ứng glowing
- Typography: bold, hiện đại, màu trắng/xanh cyan
- Kích thước: {{kích thước banner}}
- Tone: premium, high-tech, B2B`,
      },
      {
        header: "Banner cho social media",
        content: `Tạo hình ảnh banner cho social media quảng cáo phần mềm {{tên sản phẩm}}:
- Kích thước: 1200x628px (Facebook) hoặc 1080x1080px (Instagram)
- Nổi bật tính năng: {{tính năng chính}}
- Có CTA button "Dùng thử miễn phí"
- Tone: năng động, chuyên nghiệp`,
      },
    ],
    note: "Prompt này hoạt động tốt nhất với Gemini Image và ChatGPT DALL-E 3. Kết quả tốt nhất khi chạy 3–5 lần và chọn ảnh ưng ý nhất.",
    author: "Dat",
    createdAt: new Date("2026-03-28"),
    tagIds: ["gemini", "chatgpt", "image", "marketing"],
  },
  {
    title: "Tổng hợp Chấm công Đi muộn Về sớm",
    items: [
      {
        header: "Từ file chi tiết chấm công",
        content: `Phân tích file chấm công đính kèm và tổng hợp:
1. Danh sách nhân viên đi muộn (sau {{giờ bắt đầu}})
2. Danh sách nhân viên về sớm (trước {{giờ kết thúc}})
3. Số lần vi phạm của từng người trong tháng
4. Tổng số giờ đi muộn/về sớm

Output dạng bảng, sắp xếp theo số lần vi phạm giảm dần.`,
      },
      {
        header: "Từ 2 file: chấm công + danh sách nhân viên",
        content: `So sánh 2 file:
- File 1: Bảng chấm công tháng {{tháng}}
- File 2: Danh sách nhân viên với phòng ban

Yêu cầu:
1. Mapping tên nhân viên với phòng ban
2. Thống kê đi muộn/về sớm theo phòng ban
3. Top 5 phòng ban có tỷ lệ vi phạm cao nhất
4. Đề xuất cải thiện cho từng phòng ban`,
      },
      {
        header: "Tạo báo cáo tổng hợp tháng",
        content: `Từ dữ liệu chấm công đã phân tích, tạo báo cáo tổng hợp tháng {{tháng/năm}}:

1. Executive summary (3 dòng)
2. Biểu đồ xu hướng đi muộn theo tuần
3. So sánh với tháng trước
4. Danh sách nhân viên cần nhắc nhở (>3 lần/tháng)
5. Đề xuất chính sách cải thiện

Format: Word/PDF, có header công ty {{tên công ty}}`,
      },
    ],
    note: "Cần upload file Excel/CSV chấm công. Claude xử lý file tốt hơn ChatGPT. Nhớ kiểm tra lại số liệu vì AI có thể nhầm khi file quá dài.",
    author: "Trang",
    createdAt: new Date("2026-03-25"),
    tagIds: ["claude", "chatgpt", "text", "accounting"],
  },
  {
    title: "Email chào hàng khách doanh nghiệp",
    items: [
      {
        header: "Email giới thiệu lần đầu",
        content: `Viết email chào hàng B2B cho {{tên công ty khách}}, ngành {{ngành khách hàng}}.

Yêu cầu:
- Tone: chuyên nghiệp, trang trọng nhưng không cứng nhắc
- Độ dài: 150–200 từ
- Nhấn mạnh: ROI, tiết kiệm thời gian, hỗ trợ kỹ thuật 24/7
- CTA: đặt lịch demo 30 phút
- Ký tên: {{tên người gửi}}, {{chức vụ}}`,
      },
      {
        header: "Email follow-up sau demo",
        content: `Viết email follow-up sau buổi demo cho {{tên khách hàng}}:
- Cảm ơn đã tham gia demo
- Tóm tắt 3 điểm chính đã trình bày
- Giải đáp câu hỏi khách hàng nêu ra: {{câu hỏi}}
- Đề xuất gói phù hợp: {{tên gói}}
- CTA: ký hợp đồng trial 14 ngày
- Deadline ưu đãi: {{ngày hết hạn}}`,
      },
    ],
    note: "Luôn thêm tên công ty khách vào dòng đầu để tạo cảm giác cá nhân hoá.",
    author: "Hương",
    createdAt: new Date("2026-03-15"),
    tagIds: ["claude", "chatgpt", "text", "marketing", "sale"],
  },
  {
    title: "Slide pitch deck sản phẩm",
    items: [
      {
        header: "Outline 10 slide chính",
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
      },
    ],
    note: "Dùng output này làm outline, sau đó đưa vào Gamma.app hoặc Canva để tạo slide thực tế.",
    author: "Nam",
    createdAt: new Date("2026-03-08"),
    tagIds: ["chatgpt", "claude", "ppt", "marketing"],
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

  for (const { tagIds, items, ...promptData } of PROMPTS) {
    await prisma.prompt.create({
      data: {
        ...promptData,
        items: {
          create: items.map((item, idx) => ({
            header: item.header,
            content: item.content,
            position: idx,
          })),
        },
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
