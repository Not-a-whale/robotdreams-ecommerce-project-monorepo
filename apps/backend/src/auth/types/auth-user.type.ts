import { UserEntity } from 'src/user/entities/user.entity';

export type AuthUser = Pick<UserEntity, 'id' | 'name' | 'email'> & {
  avatarUrl?: string | null;
};
