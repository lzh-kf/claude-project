import { prisma } from '../src/utils/prisma'
import bcrypt from 'bcryptjs'

// ====== 随机工具函数 ======
function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randFloat(min: number, max: number, decimals = 2) {
  const v = Math.random() * (max - min) + min
  return Number(v.toFixed(decimals))
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// ====== 分类数据结构 ======
interface CategoryDef {
  name: string
  description: string
  subs: string[]
}

const CATEGORY_DEFS: CategoryDef[] = [
  { name: '手机通讯', description: '手机、手机配件、通话设备', subs: ['智能手机', '手机壳膜', '充电器数据线', '蓝牙耳机', '手机支架'] },
  { name: '电脑办公', description: '电脑整机、外设、办公用品', subs: ['笔记本电脑', '显示器', '键盘鼠标', '办公耗材'] },
  { name: '家用电器', description: '大家电、小家电、厨房电器', subs: ['空调洗衣机', '冰箱冷柜', '厨房电器', '生活电器'] },
  { name: '男装', description: '男士服饰、商务休闲', subs: ['T恤衬衫', '裤装', '夹克外套', '西装正装'] },
  { name: '女装', description: '女士服饰、时尚潮流', subs: ['连衣裙', '上衣针织', '裤装半身裙', '外套风衣'] },
  { name: '鞋靴箱包', description: '男女鞋靴、箱包皮具', subs: ['运动鞋', '休闲鞋皮鞋', '双肩包', '拉杆箱'] },
  { name: '美妆护肤', description: '化妆品、护肤品、个人护理', subs: ['面部护肤', '彩妆', '香水香氛', '身体护理'] },
  { name: '母婴用品', description: '奶粉辅食、纸尿裤、玩具', subs: ['奶粉辅食', '纸尿裤湿巾', '益智玩具', '婴童服饰'] },
  { name: '食品生鲜', description: '零食饮品、生鲜蔬果、粮油', subs: ['休闲零食', '坚果蜜饯', '饮料冲调', '生鲜水果', '粮油调味'] },
  { name: '家居家装', description: '家具、家纺、灯具、收纳', subs: ['客厅家具', '卧室家纺', '灯具照明', '收纳日用'] },
  { name: '运动户外', description: '健身器材、户外装备、骑行', subs: ['健身器材', '运动服饰', '户外露营', '骑行装备'] },
  { name: '图书文娱', description: '图书、教材、文具乐器', subs: ['小说文学', '教辅考试', '少儿图书', '文具用品'] },
  { name: '汽车用品', description: '车载电器、内外饰、保养', subs: ['车载电器', '内外装饰', '维修保养', '安全自驾'] },
  { name: '医药健康', description: '保健品、医疗器械、滋补', subs: ['营养保健', '医疗器械', '传统滋补', '成人计生'] },
  { name: '珠宝饰品', description: '金银首饰、时尚饰品、手表', subs: ['黄金铂金', '银饰水晶', '潮流饰品', '腕表'] },
  { name: '宠物生活', description: '主粮零食、窝笼玩具、洗护', subs: ['猫粮狗粮', '宠物零食', '玩具出行', '洗护日用'] },
]

// ====== 商品名称词组库 ======
const BRANDS = ['小米', '华为', '三星', '索尼', '联想', '戴尔', '惠普', '美的', '格力', '海尔', '飞利浦', '松下', '九阳', '苏泊尔', '科沃斯', '戴森', '苹果', 'OPPO', 'vivo', '荣耀', '华硕', '微星', '罗技', '雷蛇', '漫步者', '安踏', '李宁', '特步', '361°', '鸿星尔克', '优衣库', '海澜之家', '欧莱雅', '兰蔻', '雅诗兰黛', '资生堂', '花王', '帮宝适', '三只松鼠', '良品铺子', '百草味', '伊利', '蒙牛', '德芙', '费列罗', '康师傅', '统一', '立白', '蓝月亮', '威猛先生', '南极人', '恒源祥', '水星家纺', '罗莱', '欧普', '公牛', '三棵树', '多乐士', '探路者', '骆驼', '迪卡侬', '永久', '凤凰', '捷安特', '美利达', '得力', '晨光', '英雄', '施耐德', '正泰', '三一', '徐工', '周大福', '老凤祥', '施华洛世奇', '卡西欧', '斯沃琪']

const ADJECTIVES = ['升级款', '旗舰款', '经典款', '轻奢', '简约', '时尚', '复古', '创意', '便携', '多功能', '静音', '高效', '节能', '智能', '高清', '超清', '大容量', '迷你', '折叠', '防水', '防摔', '抗菌', '除螨', '速干', '保暖', '透气']

const UNITS = ['个', '件', '套', '台', '只', '条', '双', '瓶', '盒', '袋', '箱', '本', '支', '副', '张', '把']

// ====== 主函数 ======
async function main() {
  console.log('🌱 开始初始化种子数据...')
  console.time('⏱  总耗时')

  // =========== 1. 权限 ===========
  const permData = [
    { name: '用户管理', code: 'user:menu', type: 'menu', path: '/users', icon: 'UserOutlined', sort: 1 },
    { name: '查看用户', code: 'user:view', type: 'button', parentCode: 'user:menu', sort: 1 },
    { name: '创建用户', code: 'user:create', type: 'button', parentCode: 'user:menu', sort: 2 },
    { name: '编辑用户', code: 'user:update', type: 'button', parentCode: 'user:menu', sort: 3 },
    { name: '删除用户', code: 'user:delete', type: 'button', parentCode: 'user:menu', sort: 4 },
    { name: '分配角色', code: 'user:assign-role', type: 'button', parentCode: 'user:menu', sort: 5 },
    { name: '角色管理', code: 'role:menu', type: 'menu', path: '/roles', icon: 'TeamOutlined', sort: 2 },
    { name: '查看角色', code: 'role:view', type: 'button', parentCode: 'role:menu', sort: 1 },
    { name: '创建角色', code: 'role:create', type: 'button', parentCode: 'role:menu', sort: 2 },
    { name: '编辑角色', code: 'role:update', type: 'button', parentCode: 'role:menu', sort: 3 },
    { name: '删除角色', code: 'role:delete', type: 'button', parentCode: 'role:menu', sort: 4 },
    { name: '分配权限', code: 'role:assign-perm', type: 'button', parentCode: 'role:menu', sort: 5 },
    { name: '权限管理', code: 'perm:menu', type: 'menu', path: '/permissions', icon: 'SafetyOutlined', sort: 3 },
    { name: '查看权限', code: 'perm:view', type: 'button', parentCode: 'perm:menu', sort: 1 },
    { name: '创建权限', code: 'perm:create', type: 'button', parentCode: 'perm:menu', sort: 2 },
    { name: '编辑权限', code: 'perm:update', type: 'button', parentCode: 'perm:menu', sort: 3 },
    { name: '删除权限', code: 'perm:delete', type: 'button', parentCode: 'perm:menu', sort: 4 },
    { name: '商品管理', code: 'product:menu', type: 'menu', path: '/products', icon: 'ShoppingOutlined', sort: 4 },
    { name: '查看商品', code: 'product:view', type: 'button', parentCode: 'product:menu', sort: 1 },
    { name: '创建商品', code: 'product:create', type: 'button', parentCode: 'product:menu', sort: 2 },
    { name: '编辑商品', code: 'product:update', type: 'button', parentCode: 'product:menu', sort: 3 },
    { name: '删除商品', code: 'product:delete', type: 'button', parentCode: 'product:menu', sort: 4 },
    { name: '分类管理', code: 'category:menu', type: 'menu', path: '/categories', icon: 'AppstoreOutlined', sort: 5 },
    { name: '查看分类', code: 'category:view', type: 'button', parentCode: 'category:menu', sort: 1 },
    { name: '创建分类', code: 'category:create', type: 'button', parentCode: 'category:menu', sort: 2 },
    { name: '编辑分类', code: 'category:update', type: 'button', parentCode: 'category:menu', sort: 3 },
    { name: '删除分类', code: 'category:delete', type: 'button', parentCode: 'category:menu', sort: 4 },
    { name: '订单管理', code: 'order:menu', type: 'menu', path: '/orders', icon: 'ShoppingCartOutlined', sort: 6 },
    { name: '查看订单', code: 'order:view', type: 'button', parentCode: 'order:menu', sort: 1 },
    { name: '处理订单', code: 'order:update', type: 'button', parentCode: 'order:menu', sort: 2 },
  ]

  const permMap: Record<string, number> = {}
  const parentPerms = permData.filter(p => !p.parentCode)
  const childPerms = permData.filter(p => p.parentCode)

  for (const p of parentPerms) {
    const { parentCode, ...data } = p
    const created = await prisma.permission.upsert({
      where: { code: data.code },
      update: data,
      create: data,
    })
    permMap[data.code] = created.id
  }

  for (const p of childPerms) {
    const { parentCode, ...rest } = p
    const parentId = permMap[parentCode!]
    const data = { ...rest, parentId }
    const created = await prisma.permission.upsert({
      where: { code: data.code },
      update: data,
      create: data,
    })
    permMap[data.code] = created.id
  }
  console.log(`✅ 权限: ${Object.keys(permMap).length} 条`)

  // =========== 2. 角色 ===========
  const adminRole = await prisma.role.upsert({
    where: { code: 'admin' },
    update: { name: '超级管理员', description: '拥有所有权限' },
    create: { name: '超级管理员', code: 'admin', description: '拥有所有权限' },
  })
  const editorRole = await prisma.role.upsert({
    where: { code: 'editor' },
    update: { name: '编辑者', description: '可查看和编辑，不可删除' },
    create: { name: '编辑者', code: 'editor', description: '可查看和编辑，不可删除' },
  })
  const viewerRole = await prisma.role.upsert({
    where: { code: 'viewer' },
    update: { name: '只读用户', description: '仅可查看' },
    create: { name: '只读用户', code: 'viewer', description: '仅可查看' },
  })
  console.log('✅ 角色: 3 条')

  // =========== 3. 角色-权限关联 ===========
  const allPermIds = Object.values(permMap)
  await prisma.rolePermission.deleteMany({ where: { roleId: adminRole.id } })
  await prisma.rolePermission.createMany({
    data: allPermIds.map(permissionId => ({ roleId: adminRole.id, permissionId })),
  })

  const editorPermCodes = [
    'user:menu', 'user:view', 'user:create', 'user:update', 'user:assign-role',
    'role:menu', 'role:view', 'role:create', 'role:update', 'role:assign-perm',
    'perm:menu', 'perm:view',
    'product:menu', 'product:view', 'product:create', 'product:update',
    'category:menu', 'category:view', 'category:create', 'category:update',
    'order:menu', 'order:view', 'order:update',
  ]
  await prisma.rolePermission.deleteMany({ where: { roleId: editorRole.id } })
  await prisma.rolePermission.createMany({
    data: editorPermCodes.map(c => permMap[c]).filter(Boolean).map(permissionId => ({ roleId: editorRole.id, permissionId })),
  })

  const viewerPermCodes = [
    'user:menu', 'user:view', 'role:menu', 'role:view', 'perm:menu', 'perm:view',
    'product:menu', 'product:view', 'category:menu', 'category:view', 'order:menu', 'order:view',
  ]
  await prisma.rolePermission.deleteMany({ where: { roleId: viewerRole.id } })
  await prisma.rolePermission.createMany({
    data: viewerPermCodes.map(c => permMap[c]).filter(Boolean).map(permissionId => ({ roleId: viewerRole.id, permissionId })),
  })
  console.log('✅ 角色-权限关联')

  // =========== 4. 管理员用户 ===========
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: hashedPassword, email: 'admin@example.com' },
  })
  const existingUR = await prisma.userRole.findUnique({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
  })
  if (!existingUR) {
    await prisma.userRole.create({ data: { userId: adminUser.id, roleId: adminRole.id } })
  }
  console.log('✅ 管理员: admin / admin123')

  // =========== 5. 商品分类（仅首次创建，共享数据库不删除已有数据） ===========
  console.log('📂 正在创建商品分类...')

  const existingCats = await prisma.category.count()
  if (existingCats > 0) {
    console.log(`⏭️  分类已存在 (${existingCats} 条)，跳过`)
  } else {

  // 创建一级分类
  const mainCatData = CATEGORY_DEFS.map((c, i) => ({
    name: c.name,
    description: c.description,
    sort: i + 1,
  }))
  await prisma.category.createMany({ data: mainCatData })

  // 查出所有一级分类
  const mainCats = await prisma.category.findMany({ where: { parentId: null } })
  const catMap: Record<string, number> = {}
  for (const mc of mainCats) {
    catMap[mc.name] = mc.id
  }

  // 创建二级分类
  const subCatData: { name: string; description: string; parentId: number; sort: number }[] = []
  for (const def of CATEGORY_DEFS) {
    const parentId = catMap[def.name]
    def.subs.forEach((sub, si) => {
      subCatData.push({ name: sub, description: `${def.name}-${sub}`, parentId, sort: si + 1 })
    })
  }
  // 分批插入（MySQL 单条 INSERT 参数有限制）
  const BATCH = 500
  for (let i = 0; i < subCatData.length; i += BATCH) {
    await prisma.category.createMany({ data: subCatData.slice(i, i + BATCH) })
  }

  // 查出所有分类（含子分类）用于商品分配
  const allCats = await prisma.category.findMany()
  // 商品只挂到子分类（有 parentId 的）
  const leafCats = allCats.filter(c => c.parentId !== null)
  // 构建 id -> category 的 map
  const catById: Record<number, typeof leafCats[0]> = {}
  for (const c of allCats) catById[c.id] = c

  console.log(`✅ 分类: ${mainCats.length} 大类 + ${leafCats.length} 子类 = ${allCats.length} 条`)
  } // end if existingCats === 0

  // =========== 6. 商品（仅首次创建） ===========
  console.log('📦 正在生成商品...')

  const existingProducts = await prisma.product.count()
  if (existingProducts > 0) {
    console.log(`⏭️  商品已存在 (${existingProducts} 条)，跳过`)
  } else {

  const PRODUCT_COUNT = 1080
  const productData: {
    name: string
    description: string | null
    price: number
    originalPrice: number | null
    stock: number
    categoryId: number
    images: string
    status: number
    isFeatured: number
  }[] = []

  const usedNames = new Set<string>()

  for (let i = 0; i < PRODUCT_COUNT; i++) {
    const cat = leafCats[i % leafCats.length] // 轮询分配子分类
    const brand = BRANDS[i % BRANDS.length]
    const adj = pick(ADJECTIVES)
    const baseName = cat.name.replace(/[男女]/, '') // 去掉性别前缀避免重复
    const unit = pick(UNITS)

    // 生成唯一名称
    let name = ''
    let tries = 0
    do {
      const suffix = tries > 0 ? ` ${rand(1, 99)}` : ''
      const models = ['Pro', 'Max', 'Plus', 'Air', 'Mini', 'SE', 'Ultra', 'Lite', 'X', 'S']
      const model = pick(models)
      name = `${brand} ${adj} ${baseName} ${model}${suffix}`
      tries++
    } while (usedNames.has(name) && tries < 100)
    usedNames.add(name)

    const price = randFloat(9.9, 5999)
    const hasOrig = Math.random() > 0.3
    const originalPrice = hasOrig ? randFloat(price * 1.2, price * 2.5) : null
    const stock = rand(5, 5000)
    const seed = (i % 200) + 1 // picsum seed 1-200

    productData.push({
      name,
      description: `${brand}出品，${adj}设计，${baseName}${unit}，品质保证`,
      price,
      originalPrice,
      stock,
      categoryId: cat.id,
      images: JSON.stringify([
        `https://picsum.photos/seed/p${seed}a/400/400`,
        `https://picsum.photos/seed/p${seed}b/400/400`,
        `https://picsum.photos/seed/p${seed}c/400/400`,
      ]),
      status: Math.random() > 0.05 ? 1 : 0, // 95% 上架
      isFeatured: Math.random() > 0.85 ? 1 : 0, // 15% 精选
    })

    // 进度提示
    if ((i + 1) % 200 === 0) console.log(`  ... 已生成 ${i + 1} 个商品`)
  }

  // 分批插入
  console.log('  ... 正在写入数据库...')
  for (let i = 0; i < productData.length; i += BATCH) {
    await prisma.product.createMany({ data: productData.slice(i, i + BATCH) })
  }

  // 查询所有商品 ID
  const allProducts = await prisma.product.findMany({ select: { id: true, name: true, price: true } })
  console.log(`✅ 商品: ${allProducts.length} 条`)
  } // end if existingProducts === 0

  // =========== 7. 订单（持续追加） ===========
  console.log('📋 正在生成订单...')

  const existingOrders = await prisma.order.count()
  if (existingOrders > 0) {
    console.log(`⏭️  订单已存在 (${existingOrders} 条)，跳过`)
  } else {

  const statuses = ['delivered', 'delivered', 'delivered', 'shipped', 'shipped', 'confirmed', 'pending', 'cancelled']
  const consignees = ['张三', '李四', '王五', '赵六', '陈七', '周八', '吴九', '郑十']
  const phones = ['13800138000', '13900139000', '13600136000', '13500135000', '13700137000', '15800158000', '15900159000', '18600186000']
  const addresses = [
    '广东省广州市天河区某某路100号',
    '北京市朝阳区某某街道200号',
    '上海市浦东新区某某路300号',
    '浙江省杭州市西湖区某某路400号',
    '四川省成都市高新区某某路500号',
    '湖北省武汉市洪山区某某路600号',
    '江苏省南京市鼓楼区某某路700号',
    '重庆市渝北区某某路800号',
  ]

  const ORDER_COUNT = 200
  const orderData: {
    orderNo: string
    userId: number
    totalAmount: number
    status: string
    consignee: string
    phone: string
    address: string
    remark: string | null
    createdAt: Date
    updatedAt: Date
    items: { create: { productId: number; productName: string; productImage: string | null; price: number; quantity: number }[] }
  }[] = []

  for (let i = 0; i < ORDER_COUNT; i++) {
    const daysAgo = rand(0, 29) // 最近 30 天
    const date = new Date()
    date.setDate(date.getDate() - daysAgo)
    date.setHours(rand(7, 22), rand(0, 59), 0, 0)

    const itemCount = rand(1, 5)
    const picked = new Set<number>()
    let total = 0
    const items: { productId: number; productName: string; productImage: string | null; price: number; quantity: number }[] = []

    for (let j = 0; j < itemCount; j++) {
      let idx: number
      let tries = 0
      do {
        idx = rand(0, allProducts.length - 1)
        tries++
      } while (picked.has(idx) && tries < 50)
      picked.add(idx)

      const p = allProducts[idx]
      const qty = rand(1, 5)
      items.push({
        productId: p.id,
        productName: p.name,
        productImage: `https://picsum.photos/seed/o${i}${j}/100/100`,
        price: p.price,
        quantity: qty,
      })
      total += Number(p.price) * qty
    }

    const remarkOptions = [null, null, null, '请尽快发货', '发顺丰', '包装严实一点', '工作日配送', null, null]
    orderData.push({
      orderNo: `ORD${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}${String(i).padStart(4, '0')}`,
      userId: adminUser.id,
      totalAmount: Math.round(total * 100) / 100,
      status: statuses[rand(0, statuses.length - 1)],
      consignee: pick(consignees),
      phone: pick(phones),
      address: pick(addresses),
      remark: pick(remarkOptions),
      createdAt: date,
      updatedAt: date,
      items: { create: items },
    })

    if ((i + 1) % 50 === 0) console.log(`  ... 已生成 ${i + 1} 个订单`)
  }

  // 逐条创建订单（需要嵌套 items create，不能用 createMany）
  console.log('  ... 正在写入数据库...')
  for (let i = 0; i < orderData.length; i += 50) {
    const batch = orderData.slice(i, i + 50)
    await Promise.all(batch.map(o => prisma.order.create({ data: o })))
    console.log(`  ... 已写入 ${Math.min(i + 50, orderData.length)} 个订单`)
  }

  console.log(`✅ 订单: ${ORDER_COUNT} 条`)
  } // end if existingOrders === 0
  console.timeEnd('⏱  总耗时')
  console.log('🎉 种子数据初始化完成!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
