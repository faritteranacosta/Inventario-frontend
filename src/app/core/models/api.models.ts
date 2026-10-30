export interface UserResponse {
  readonly id: string;
  readonly tenantId?: string | null;
  readonly email: string;
  readonly role: string;
  readonly createdAtUtc: string;
  readonly platformRole?: string | null;
}

export type MembershipRole = 'Admin' | 'User';
export type MembershipStatus = 'Active' | 'Suspended' | 'Revoked';

export interface MembershipResponse {
  readonly id: string;
  readonly userId: string;
  readonly tenantId: string;
  readonly tenantName: string;
  readonly email: string;
  readonly role: MembershipRole;
  readonly status: MembershipStatus;
  readonly createdAtUtc: string;
}

export interface SessionResponse {
  readonly id: string;
  readonly email: string;
  readonly platformRole: string | null;
  readonly activeTenantId: string | null;
  readonly memberships: readonly MembershipResponse[];
}

export interface ContextResponse {
  readonly token: string;
  readonly activeTenantId: string;
}

export interface SelectContextRequest {
  readonly tenantId: string;
}

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface LoginResponse {
  readonly token: string;
  readonly user: UserResponse;
  readonly activeTenantId?: string | null;
  readonly memberships?: readonly MembershipResponse[];
}

export interface RegisterRequest {
  readonly tenantId: string;
  readonly email: string;
  readonly password: string;
  readonly role: string;
}

export interface BootstrapPlatformRequest {
  readonly email: string;
  readonly password: string;
}

export interface PlatformTenantResponse {
  readonly id: string;
  readonly name: string;
  readonly status: 'Active' | 'Suspended';
  readonly createdAtUtc: string;
  readonly userCount: number;
  readonly adminCount: number;
}

export interface CreatePlatformTenantRequest {
  readonly name: string;
  readonly adminEmail?: string;
  readonly adminPassword?: string;
}

export interface UpdatePlatformTenantRequest {
  readonly name: string;
}

export interface UpdateTenantStatusRequest {
  readonly status: 'Active' | 'Suspended';
}

export interface CreateMembershipRequest {
  readonly email: string;
  readonly password: string;
  readonly role: MembershipRole;
}

export interface UpdateMembershipRequest {
  readonly role?: MembershipRole;
  readonly status?: MembershipStatus;
}

export interface AuditEventResponse {
  readonly id: string;
  readonly actorUserId: string;
  readonly action: string;
  readonly resourceType: string;
  readonly resourceId: string;
  readonly createdAtUtc: string;
}

export interface TenantResponse {
  readonly id: string;
  readonly name: string;
  readonly createdAtUtc: string;
}

export interface CreateTenantRequest {
  readonly name: string;
}

export interface CategoryResponse {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly createdAtUtc: string;
}

export interface CategoryRequest {
  readonly name: string;
  readonly description: string | null;
}

export interface ProductResponse {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly price: number;
  readonly stock: number;
  readonly categoryId: string;
  readonly imageUrl: string | null;
  readonly createdAtUtc: string;
}

export interface CreateProductRequest {
  readonly name: string;
  readonly description: string | null;
  readonly price: number;
  readonly stock: number;
  readonly categoryId: string;
  readonly imageUrl: string | null;
}

export interface UpdateProductRequest {
  readonly name: string;
  readonly description: string | null;
  readonly price: number;
  readonly stock: number;
  readonly categoryId: string;
}

export interface CreateSaleItemRequest {
  readonly productId: string;
  readonly quantity: number;
}

export interface CreateSaleRequest {
  readonly items: readonly CreateSaleItemRequest[];
}

export interface SaleItemResponse {
  readonly productId: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly total: number;
}

export interface SaleResponse {
  readonly id: string;
  readonly saleDateUtc: string;
  readonly items: readonly SaleItemResponse[];
  readonly total: number;
}

export interface SalesSummaryItem {
  readonly period: string;
  readonly total: number;
  readonly count: number;
}

export interface SalesSummaryResponse {
  readonly items: readonly SalesSummaryItem[];
  readonly grandTotal: number;
  readonly totalCount: number;
}
