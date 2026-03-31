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
    {title:'Tạo banner sản phẩm CAD',author:'Dat',tagIds:['gemini','chatgpt','image','marketing'],
      items:[{header:'Banner chính cho website',content:'Tạo hình ảnh banner chuyên nghiệp cho phần mềm {{tên sản phẩm}}'},{header:'Banner cho social media',content:'Tạo hình ảnh banner cho social media quảng cáo phần mềm {{tên sản phẩm}}'}]},
    {title:'Email chào hàng khách doanh nghiệp',author:'Hương',tagIds:['claude','chatgpt','text','marketing','sale'],
      items:[{header:'Email giới thiệu lần đầu',content:'Viết email chào hàng B2B cho {{tên công ty khách}}'},{header:'Email follow-up sau demo',content:'Viết email follow-up sau buổi demo cho {{tên khách hàng}}'}]},
  ];
  for (const {tagIds,items,...d} of prompts) {
    await prisma.prompt.create({data:{...d,items:{create:items.map((it,i)=>({header:it.header,content:it.content,position:i}))},tags:{create:tagIds.map(t=>({tagId:t}))}}});
  }
  console.log('Seeded ' + tags.length + ' tags and ' + prompts.length + ' prompts');
}
seed().catch(e=>console.error(e)).finally(()=>prisma.\$disconnect());
" 2>&1 || echo "Seed warning"

echo "Starting application..."
exec node server.js
