#!/bin/sh
set -e

echo "Running database migrations..."
./node_modules/.bin/prisma migrate deploy 2>&1 || echo "Migration warning (may already be applied)"

echo "Seeding database..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function seed() {
  const count = await prisma.tag.count();
  if (count > 0) { console.log('Already seeded'); return; }
  const tags = [
    {id:'gemini',label:'Gemini',group:'model'},{id:'chatgpt',label:'ChatGPT',group:'model'},
    {id:'claude',label:'Claude',group:'model'},{id:'midjourney',label:'Midjourney',group:'model'},
    {id:'image',label:'Hình ảnh',group:'type'},{id:'video',label:'Video',group:'type'},
    {id:'ppt',label:'PPT',group:'type'},{id:'web',label:'Web',group:'type'},
    {id:'text',label:'Văn bản',group:'type'},{id:'marketing',label:'Marketing',group:'topic'},
    {id:'sale',label:'Sale',group:'topic'},{id:'accounting',label:'Kế toán',group:'topic'},
    {id:'tech',label:'Tech',group:'topic'}
  ];
  await prisma.tag.createMany({data:tags});
  const prompts = [
    {title:'Tạo banner sản phẩm CAD',content:'Tạo hình ảnh banner chuyên nghiệp cho phần mềm {{tên sản phẩm}}, yêu cầu:\n- Background: tối, gradient xanh navy sang đen\n- Ánh sáng kỹ thuật số, hiệu ứng glowing\n- Typography: bold, hiện đại, màu trắng/xanh cyan\n- Kích thước: {{kích thước banner}}\n- Tone: premium, high-tech, B2B',note:'Prompt này hoạt động tốt nhất với Gemini Image và ChatGPT DALL-E 3.',author:'Dat',tagIds:['gemini','chatgpt','image','marketing']},
    {title:'Ảnh thumbnail YouTube',content:'Generate thumbnail YouTube style với các yêu cầu:\n- Màu sắc bắt mắt, tương phản cao\n- Text overlay rõ ràng, font bold không quá 6 từ\n- Tỉ lệ 16:9 (1280x720px)',note:'Midjourney cho kết quả đẹp hơn về mặt thẩm mỹ.',author:'Linh',tagIds:['gemini','midjourney','image','tech']},
    {title:'Email chào hàng khách doanh nghiệp',content:'Viết email chào hàng B2B cho {{tên công ty khách}}, ngành {{ngành khách hàng}}.\n\nYêu cầu:\n- Tone: chuyên nghiệp\n- Độ dài: 150–200 từ\n- CTA: đặt lịch demo 30 phút',note:'Luôn thêm tên công ty khách vào dòng đầu.',author:'Hương',tagIds:['claude','chatgpt','text','marketing','sale']},
    {title:'Slide pitch deck sản phẩm',content:'Tạo outline cho slide pitch deck {{tên sản phẩm/dịch vụ}}, gồm 10 slide.',note:'Dùng output này làm outline, sau đó đưa vào Gamma.app hoặc Canva.',author:'Nam',tagIds:['chatgpt','claude','ppt','marketing']},
    {title:'Tóm tắt báo cáo tài chính tháng',content:'Phân tích và tóm tắt báo cáo tài chính tháng {{tháng/năm}}.',note:'Nhớ xoá thông tin nhạy cảm trước khi paste vào AI.',author:'Trang',tagIds:['claude','chatgpt','text','accounting']}
  ];
  for (const {tagIds,...d} of prompts) {
    await prisma.prompt.create({data:{...d,tags:{create:tagIds.map(t=>({tagId:t}))}}});
  }
  console.log('Seeded ' + tags.length + ' tags and ' + prompts.length + ' prompts');
}
seed().catch(e=>console.error(e)).finally(()=>prisma.\$disconnect());
" 2>&1 || echo "Seed warning"

echo "Starting application..."
exec node server.js
