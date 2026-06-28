/**
 * 为所有商品批量生成 HTML 富文本描述
 * 用法: npx tsx prisma/generate-descriptions.ts
 */
import { prisma } from '../src/utils/prisma'

// ====== 生成随机色块 SVG 作为装饰图 ======
function placeholderImg(seed: number, w = 800, h = 400, text = '商品展示'): string {
  const colors = ['667eea', '764ba2', 'f093fb', '4facfe', '43e97b', 'fa709a', 'fee140', '30cfd0', 'a8edea', 'fccb90', 'd299c2', 'a1c4fd']
  const c1 = colors[seed % colors.length]
  const c2 = colors[(seed + 3) % colors.length]
  return `https://picsum.photos/seed/p${seed}/${w}/${h}`
}

function placeholderImgSmall(seed: number): string {
  return `https://picsum.photos/seed/p${seed}/400/300`
}

// ====== 生成 HTML 描述模板 ======
const templates = [
  // 模板1：标准产品详情
  (name: string, seed: number) => `
<h2 style="color:#1a1a2e;border-bottom:3px solid #667eea;padding-bottom:10px;">${name}</h2>
<p style="font-size:15px;line-height:1.8;color:#444;">本产品采用优质材料和精湛工艺打造，经过严格质量检测，确保每一位用户都能享受到卓越的品质体验。无论是日常使用还是专业场景，都能满足您的需求。</p>
<div style="text-align:center;margin:20px 0;">
  <img src="${placeholderImg(seed, 780, 360, name)}" alt="${name}" style="max-width:100%;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.1);" />
</div>
<h3 style="color:#302b63;">✨ 产品亮点</h3>
<ul style="line-height:2;">
  <li><strong>精选材质：</strong>采用行业领先的原材料，经久耐用，手感舒适。</li>
  <li><strong>精湛工艺：</strong>历经 12 道工序精细打磨，每一个细节都追求完美。</li>
  <li><strong>人性化设计：</strong>符合人体工学原理，使用体验更加舒适自然。</li>
  <li><strong>环保安全：</strong>通过国家质量检测认证，无毒无害，绿色环保。</li>
</ul>
<div style="display:flex;gap:16px;margin:20px 0;">
  <img src="${placeholderImgSmall(seed + 70)}" alt="细节展示" style="width:48%;border-radius:8px;" />
  <img src="${placeholderImgSmall(seed + 71)}" alt="实拍展示" style="width:48%;border-radius:8px;" />
</div>
<h3 style="color:#302b63;">📋 产品参数</h3>
<table style="width:100%;border-collapse:collapse;margin:16px 0;">
  <tr style="background:#f7f7f7;"><td style="padding:10px;border:1px solid #e8e8e8;font-weight:bold;">品牌</td><td style="padding:10px;border:1px solid #e8e8e8;">${name.split(' ')[0]}</td></tr>
  <tr><td style="padding:10px;border:1px solid #e8e8e8;font-weight:bold;">型号</td><td style="padding:10px;border:1px solid #e8e8e8;">${name.replace(/ /g, '-').slice(0, 30)}</td></tr>
  <tr style="background:#f7f7f7;"><td style="padding:10px;border:1px solid #e8e8e8;font-weight:bold;">材质</td><td style="padding:10px;border:1px solid #e8e8e8;">优质复合材料 / 不锈钢 / 环保塑料</td></tr>
  <tr><td style="padding:10px;border:1px solid #e8e8e8;font-weight:bold;">适用场景</td><td style="padding:10px;border:1px solid #e8e8e8;">家庭、办公室、户外、商业场所</td></tr>
  <tr style="background:#f7f7f7;"><td style="padding:10px;border:1px solid #e8e8e8;font-weight:bold;">包装清单</td><td style="padding:10px;border:1px solid #e8e8e8;">主商品 x1，说明书 x1，包装盒 x1</td></tr>
</table>
<p style="font-size:13px;color:#999;text-align:center;margin-top:24px;">* 因拍摄光线和显示器不同，图片可能存在轻微色差，请以实物为准。</p>
`,

  // 模板2：科技数码风格
  (name: string, seed: number) => `
<div style="background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);color:#fff;padding:24px;border-radius:12px;margin-bottom:20px;">
  <h2 style="color:#fff;margin:0;">🚀 ${name}</h2>
  <p style="opacity:0.9;margin-top:8px;">重新定义卓越 — 为极致体验而生</p>
</div>
<div style="text-align:center;margin:24px 0;">
  <img src="${placeholderImg(seed, 780, 380, name)}" alt="${name}" style="max-width:100%;border-radius:10px;" />
</div>
<h3 style="color:#24243e;">💡 核心优势</h3>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0;">
  <div style="background:#f0f4ff;padding:16px;border-radius:8px;"><strong>⚡ 快速响应</strong><br/><span style="color:#666;">毫秒级操作反馈，流畅不卡顿</span></div>
  <div style="background:#f0f4ff;padding:16px;border-radius:8px;"><strong>🔋 持久续航</strong><br/><span style="color:#666;">大容量电池，全天候无忧使用</span></div>
  <div style="background:#f0f4ff;padding:16px;border-radius:8px;"><strong>🛡️ 品质保障</strong><br/><span style="color:#666;">严格质检，质保期内免费维修</span></div>
  <div style="background:#f0f4ff;padding:16px;border-radius:8px;"><strong>📱 智能互联</strong><br/><span style="color:#666;">支持手机 APP 远程操控管理</span></div>
</div>
<div style="text-align:center;margin:20px 0;">
  <img src="${placeholderImgSmall(seed + 80)}" alt="场景展示" style="width:60%;border-radius:8px;" />
</div>
<p style="line-height:1.8;color:#555;margin-top:16px;">经过数百次反复测试与优化，${name} 在性能和可靠性方面均达到行业领先水平。无论是日常轻度使用，还是高强度专业场景，都能稳定发挥，为您提供始终如一的优质体验。</p>
`,

  // 模板3：生活家居风格
  (name: string, seed: number) => `
<div style="text-align:center;margin-bottom:24px;">
  <img src="${placeholderImg(seed, 750, 350, name)}" alt="${name}" style="max-width:100%;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,0.12);" />
</div>
<h2 style="color:#5c3d2e;text-align:center;">${name}</h2>
<p style="font-size:16px;line-height:2;color:#666;text-align:center;">—— 把生活过成诗，从每一个细节开始</p>
<h3 style="color:#5c3d2e;">🏠 品质生活之选</h3>
<p style="line-height:1.9;color:#444;">${name} 以简约而不简单的设计理念，将实用性与美观性完美融合。选用天然环保材质，触感温润细腻；简洁流畅的线条，轻松融入各种家居风格。每一个清晨与黄昏，它都是您生活中最温暖的陪伴。</p>
<div style="display:flex;gap:12px;margin:20px 0;">
  <img src="${placeholderImgSmall(seed + 90)}" alt="场景一" style="width:32%;border-radius:12px;" />
  <img src="${placeholderImgSmall(seed + 91)}" alt="场景二" style="width:32%;border-radius:12px;" />
  <img src="${placeholderImgSmall(seed + 92)}" alt="场景三" style="width:32%;border-radius:12px;" />
</div>
<h3 style="color:#5c3d2e;">🌟 为什么选择我们</h3>
<ol style="line-height:2.2;">
  <li>天然环保材质，呵护家人健康</li>
  <li>匠心手工制作，每一件都独一无二</li>
  <li>符合人体工学设计，舒适度满分</li>
  <li>易清洁打理，省时省力</li>
  <li>30 天无忧退换，售后有保障</li>
</ol>
`,

  // 模板4：户外运动风格
  (name: string, seed: number) => `
<div style="background:#1a3a1a;color:#fff;padding:20px 24px;border-radius:10px;margin-bottom:20px;">
  <h2 style="color:#fff;">🏔️ ${name}</h2>
  <p style="opacity:0.85;">征服极限，探索未知 — 专业级品质，为冒险而生</p>
</div>
<div style="text-align:center;margin:20px 0;">
  <img src="${placeholderImg(seed, 780, 400, name)}" alt="${name}" style="max-width:100%;border-radius:10px;" />
</div>
<h3>⚡ 硬核性能</h3>
<table style="width:100%;border-collapse:collapse;">
  <tr style="background:#f0f7f0;"><td style="padding:10px;"><strong>防水等级</strong></td><td style="padding:10px;">IPX7 级防水，暴雨无忧</td></tr>
  <tr><td style="padding:10px;"><strong>耐磨测试</strong></td><td style="padding:10px;">50000 次摩擦测试无损伤</td></tr>
  <tr style="background:#f0f7f0;"><td style="padding:10px;"><strong>承重能力</strong></td><td style="padding:10px;">最高可达 150kg</td></tr>
  <tr><td style="padding:10px;"><strong>适用温度</strong></td><td style="padding:10px;">-30°C ~ 60°C 极端环境</td></tr>
</table>
<p style="line-height:1.9;color:#444;margin-top:16px;">无论您是专业运动员还是户外爱好者，${name} 都将是您最可靠的伙伴。经过严苛的极端环境测试，在雪山、沙漠、雨林等各种复杂地形中均能保持优异表现。</p>
`,

  // 模板5：美食食品风格
  (name: string, seed: number) => `
<div style="text-align:center;background:#fff5f0;padding:24px;border-radius:12px;margin-bottom:20px;">
  <h2 style="color:#c0392b;">🍜 ${name}</h2>
  <p style="color:#e67e22;font-size:16px;">甄选优质食材，传递舌尖美味</p>
</div>
<div style="text-align:center;margin:20px 0;">
  <img src="${placeholderImg(seed, 760, 380, name)}" alt="${name}" style="max-width:100%;border-radius:12px;" />
</div>
<h3 style="color:#c0392b;">📦 产品信息</h3>
<ul style="line-height:2;">
  <li><strong>品牌：</strong>${name.split(' ')[0]} 食品</li>
  <li><strong>净含量：</strong>500g / 袋装</li>
  <li><strong>保质期：</strong>12 个月（常温保存）</li>
  <li><strong>产地：</strong>优质原产地直供</li>
  <li><strong>储存方式：</strong>置于阴凉干燥处，避免阳光直射</li>
</ul>
<p style="line-height:1.9;color:#555;">精选优质原材料，经过多道工序精心制作而成。严格把控每一个生产环节，从原料采购到成品出厂，全程可追溯。口感醇正，营养丰富，是居家旅行、办公休闲的必备良品。老人小孩皆可放心食用。</p>
`,
]

function generateDescription(name: string, seed: number): string {
  const tpl = templates[seed % templates.length]
  return tpl(name, seed)
}

async function main() {
  console.log('📦 正在获取所有商品...')
  const products = await prisma.product.findMany({
    select: { id: true, name: true },
  })
  console.log(`  共 ${products.length} 个商品`)

  console.log('✍️  正在生成 HTML 描述...')
  const BATCH = 50
  let updated = 0

  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH)
    await Promise.all(
      batch.map(p =>
        prisma.product.update({
          where: { id: p.id },
          data: { description: generateDescription(p.name, i + p.id) },
        })
      )
    )
    updated += batch.length
    console.log(`  ... 已更新 ${updated} / ${products.length}`)
  }

  console.log(`✅ 完成！已为 ${updated} 个商品生成 HTML 描述`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
