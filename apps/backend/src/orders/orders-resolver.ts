import { Resolver, Query, Args, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OrdersFilterInput } from './graphql/orders-filter.input';
import { OrdersPaginationInput } from './graphql/orders-pagination.input';
import { OrdersService } from './orders.service';
import { OrderEntity } from './entities/order.entity';
import { OrderType } from './graphql/order.type';
import { OrderItemType } from './graphql/order-item.type';
import { GqlJwtAuthGuard } from 'src/auth/guards/gql-jwt-auth.guard';
import { GqlCurrentUser } from 'src/auth/decorators/gql-current-user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';

@Resolver(() => OrderType)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Query(() => [OrderType], { name: 'orders' })
  @UseGuards(GqlJwtAuthGuard)
  async getOrders(
    @GqlCurrentUser() user: AuthUser,
    @Args('filter', { type: () => OrdersFilterInput, nullable: true })
    filter?: OrdersFilterInput,
    @Args('pagination', { type: () => OrdersPaginationInput, nullable: true })
    pagination?: OrdersPaginationInput,
  ): Promise<OrderEntity[]> {
    const scopedFilter: OrdersFilterInput = { ...filter, userId: user.id };
    return this.ordersService.findAll(scopedFilter, pagination);
  }

  @ResolveField(() => [OrderItemType])
  items(@Parent() order: OrderEntity): OrderItemType[] {
    return order.items || [];
  }
}
