export interface UserResponse {
  readonly id: string;
  readonly tenantId: string;
  readonly email: string;
  readonly role: string;
  readonly createdAtUtc: string;
}

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface LoginResponse {
  readonly token: string;
  readonly user: UserResponse;
}

export interface RegisterRequest {
  readonly tenantId: string;
  readonly email: string;
  readonly password: string;
  readonly role: string;
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
