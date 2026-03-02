import { DataSource } from 'typeorm';
import { dataSourceOptions } from './data-source';
import { UserEntity } from './user/entities/user.entity';
import { hash } from 'argon2';

async function seed() {
  console.log('🌱 Starting database seed...');

  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  console.log('✅ Database connected');

  const userRepository = dataSource.getRepository(UserEntity);

  // Check if users already exist
  const existingUsers = await userRepository.count();
  if (existingUsers > 0) {
    console.log('⚠️  Users already exist, skipping seed');
    await dataSource.destroy();
    return;
  }

  // Create seed users
  const users = [
    {
      name: 'Admin User',
      email: 'admin@example.com',
      password: await hash('admin123'),
    },
    {
      name: 'Test User',
      email: 'test@example.com',
      password: await hash('test123'),
    },
    {
      name: 'Demo User',
      email: 'demo@example.com',
      password: await hash('demo123'),
    },
  ];

  await userRepository.save(users);

  console.log('✅ Seed completed successfully');
  console.log(`📊 Created ${users.length} users`);

  await dataSource.destroy();
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
