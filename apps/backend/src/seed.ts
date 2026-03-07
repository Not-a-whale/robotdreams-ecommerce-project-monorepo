import { DataSource } from 'typeorm';
import { dataSourceOptions } from './data-source';
import { UserEntity } from './user/entities/user.entity';
import { ProductEntity } from './products/product.entity';
import { hash } from 'argon2';

async function seed() {
  console.log('🌱 Starting database seed...');

  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  console.log('✅ Database connected');

  const userRepository = dataSource.getRepository(UserEntity);
  const productRepository = dataSource.getRepository(ProductEntity);

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

  const existingProducts = await productRepository.count();
  if (existingProducts === 0) {
    const products = [
      {
        externalId: 1,
        name: 'Nike Dri-FIT ADV TechKnit Ultra',
        shortDescription: 'Premium running shirt with advanced moisture-wicking',
        description: 'Lorem ipsum dolor sit amet consect adipisicing elit.',
        price: 11000,
        stock: 50,
        sizes: ['xs', 's', 'm', 'l', 'xl'],
        colors: ['black', 'blue', 'white'],
        images: {
          black: '/products/1bl.png',
          blue: '/products/1b.png',
          white: '/products/1w.png',
        },
        categorySlug: 'mens-running',
      },
      {
        externalId: 2,
        name: 'Nike Air Max 90',
        shortDescription: 'Iconic sneakers with visible Air cushioning',
        description: 'The Nike Air Max 90 stays true to its OG running roots.',
        price: 13000,
        stock: 35,
        sizes: ['7', '8', '9', '10', '11', '12'],
        colors: ['white', 'black', 'red'],
        images: {
          white: '/products/2w.png',
          black: '/products/2bl.png',
          red: '/products/2r.png',
        },
        categorySlug: 'mens-shoes',
      },
      {
        externalId: 3,
        name: 'Nike Air Essentials Pullover',
        shortDescription: 'Comfortable everyday hoodie',
        description: 'Made from soft fleece fabric.',
        price: 6990,
        stock: 60,
        sizes: ['s', 'm', 'l', 'xl'],
        colors: ['green', 'blue', 'black'],
        images: {
          green: '/products/3gr.png',
          blue: '/products/3b.png',
          black: '/products/3bl.png',
        },
        categorySlug: 'mens-clothing',
      },
    ];

    await productRepository.save(products);
    console.log(`✅ Created ${products.length} products`);
  } else {
    console.log('⚠️  Products already exist, skipping');
  }

  console.log('✅ Seed completed successfully');

  await dataSource.destroy();
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
