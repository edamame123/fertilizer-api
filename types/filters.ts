// types/filters.ts
import type {
  ApiResponse,
  PaginatedApiResponse,
  ApiError,
  ApiErrorDetail,
} from "~~/types/api";

export type ComponentKey = "nitrogen" | "phos" | "k";

// Base interface with common properties (without showFormName)
// Base interface with common properties (without showFormName)
export interface BaseFilterParams {
  name?: string;
  company?: string;
  reg_no?: string;
  reg_date_from?: string;
  reg_date_to?: string;
  level?: string;
  shape?: string;
  effect?: string;
  selectedTypeId?: string | null;
  typeFilters?: Array<FilterTag>;
  components?: ComponentFilters;
  page?: number;
  perPage?: number;
}

// For component internal use (boolean)
export interface FilterParams extends BaseFilterParams {
  // showFormName?: boolean;
  showFormName?: string | boolean;
}

// For API/URL use (string)
export interface QueryParams extends BaseFilterParams {
  showFormName: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface ComponentFilters {
  nitrogen?: ComponentFilter;
  phos?: ComponentFilter;
  k?: ComponentFilter;
  [key: string]: ComponentFilter | undefined;
}

export interface ComponentFilter {
  min: number;
  max: number;
  includeEmpty: boolean;
}

// ComponentQuery は ComponentFilter と同じですが、名前の互換性のために残します
export interface ComponentQuery {
  min: number;
  max: number;
  includeEmpty: boolean;
}

// フィルタータグの型定義
export interface FilterTag {
  id: string;
  type: string;
  category: string;
}

// 旧APIレスポンス形式（後方互換性のために残す）
export interface FertilizerResponse {
  fertilizers?: any[];
  pagination?: {
    total: number;
    page: number;
    perPage: number;
    pageCount: number;
  };
}

// APIエラーレスポンス型定義

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
    requestId?: string;
    timestamp: string;
  };
}

// API応答のデータ部分の構造 - これを追加してください
export interface ApiResponseData<T> {
  meta?: {
    served_by?: string;
    served_by_region?: string;
    served_by_primary?: boolean;
    timings?: any;
    duration?: number;
    [key: string]: any;
  };
  results: T; // 実際のデータ（肥料の配列など）
  success?: boolean;
  [key: string]: any;
}
