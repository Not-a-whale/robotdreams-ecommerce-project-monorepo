import { DataSource } from 'typeorm';
import { dataSourceOptions } from './data-source';
import { UserEntity } from './user/entities/user.entity';
import { ProductEntity } from './products/product.entity';
import { CategoryEntity } from './products/category.entity';
import { OrderItemEntity } from './orders/order-item-entity';
import { OrderEntity } from './orders/entities/order.entity';
import { hash } from 'argon2';
import {
  CATALOG_IMAGE_URL_COUNT,
  PRODUCT_CATALOG,
} from './seed/product-catalog';

const PRODUCT_COUNT = Math.min(
  50_000,
  Math.max(1, Number(process.env.SEED_PRODUCT_COUNT ?? '2000')),
);

const CATEGORY_DEFINITIONS = [
  { slug: 't-shirts', name: 'T-shirts', sortOrder: 1 },
  { slug: 'shoes', name: 'Shoes', sortOrder: 2 },
  { slug: 'accessories', name: 'Accessories', sortOrder: 3 },
  { slug: 'bags', name: 'Bags', sortOrder: 4 },
  { slug: 'dresses', name: 'Dresses', sortOrder: 5 },
  { slug: 'jackets', name: 'Jackets', sortOrder: 6 },
  { slug: 'gloves', name: 'Gloves', sortOrder: 7 },
] as const;

/** Optional prefixes so repeated catalog rows get distinct listing titles; images stay the same SKU. */
const NAME_PREFIXES = [
  'Core',
  'Studio',
  'Vintage',
  'Urban',
  'Trail',
  'Heritage',
  'Salad-green',
  'Essential',
  'Limited',
  'Signature',
  'Travel',
  'Daily',
  'Sport',
  'Refined',
  'Compact',
];

function sizesForCategory(slug: string): string[] {
  switch (slug) {
    case 'shoes':
      return ['6', '7', '8', '9', '10', '11', '12'];
    case 'bags':
    case 'accessories':
      return ['one size'];
    default:
      return ['xs', 's', 'm', 'l', 'xl'];
  }
}

async function seed() {
  console.log('🌱 Starting database seed...');
  console.log(
    `📷 Catalog: ${PRODUCT_CATALOG.length} SKUs, ${CATALOG_IMAGE_URL_COUNT} distinct image URLs`,
  );

  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  console.log('✅ Database connected');

  const userRepository = dataSource.getRepository(UserEntity);
  const productRepository = dataSource.getRepository(ProductEntity);
  const categoryRepository = dataSource.getRepository(CategoryEntity);
  const orderItemRepository = dataSource.getRepository(OrderItemEntity);
  const orderRepository = dataSource.getRepository(OrderEntity);

  const existingUsers = await userRepository.count();
  if (existingUsers === 0) {
    const users = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: await hash('admin1234'),
      },
      {
        name: 'Test User',
        email: 'test@example.com',
        password: await hash('test1234'),
      },
    ];

    await userRepository.save(users);
    console.log(`✅ Created ${users.length} users`);
  } else {
    console.log('⚠️  Users already exist, skipping');
  }

  await categoryRepository.upsert(
    CATEGORY_DEFINITIONS.map((c) => ({
      slug: c.slug,
      name: c.name,
      sortOrder: c.sortOrder,
    })),
    ['slug'],
  );
  console.log(`✅ Ensured ${CATEGORY_DEFINITIONS.length} categories`);

  const catalogLen = PRODUCT_CATALOG.length;
  const products: Partial<ProductEntity>[] = [];

  for (let i = 1; i <= PRODUCT_COUNT; i++) {
    const template = PRODUCT_CATALOG[(i - 1) % catalogLen];
    const prefix = NAME_PREFIXES[i % NAME_PREFIXES.length];
    const name = `${prefix} ${template.name}`;
    const priceCents = Math.round(template.priceUsd * 100);
    const stock = (i * 97 + template.name.length) % 251;

    products.push({
      externalId: i,
      name,
      shortDescription: template.shortDescription,
      description: template.description,
      price: priceCents,
      stock,
      sizes: sizesForCategory(template.categorySlug),
      colors: [...template.colors],
      images: { ...template.images },
      categorySlug: template.categorySlug,
    });
  }

  await orderItemRepository.createQueryBuilder().delete().from(OrderItemEntity).execute();
  await orderRepository.createQueryBuilder().delete().from(OrderEntity).execute();
  await productRepository.createQueryBuilder().delete().from(ProductEntity).execute();
  console.log('🗑️  Cleared orders and products for re-seed');

  const chunkSize = 250;
  for (let j = 0; j < products.length; j += chunkSize) {
    const chunk = products.slice(j, j + chunkSize);
    await productRepository.save(chunk);
    console.log(
      `📦 Inserted products ${j + 1}–${Math.min(j + chunkSize, products.length)} / ${products.length}`,
    );
  }

  console.log('✅ Seed completed successfully');

  await dataSource.destroy();
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
