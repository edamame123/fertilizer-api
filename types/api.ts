// types/api.ts
export interface ApiMeta {
  status: "success" | "error";
  version: string;
  requestId: string;
  timestamp: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
}

export interface ApiResponse<T> {
  meta: ApiMeta;
  data: T;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T> {
  pagination: PaginationInfo;
}

export interface ExternalPaginatedApiResponse<T>
  extends PaginatedApiResponse<T> {
  apiInfo?: {
    type: string;
    [key: string]: any;
  };
}

export interface ApiErrorDetail {
  field?: string;
  issue: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

// types/api.ts に追加

// Cloudflare D1の応答メタデータ
export interface CloudflareD1Meta {
  served_by: string;
  served_by_region: string;
  served_by_primary: boolean;
  timings: {
    sql_duration_ms: number;
    [key: string]: any;
  };
  duration: number;
  changes?: number;
  last_row_id?: number;
  changed_db?: boolean;
  size_after?: number;
  rows_read?: number;
  rows_written?: number;
  [key: string]: any;
}

// Cloudflare D1のレスポンス構造
export interface CloudflareD1Response<T> {
  success: boolean;
  meta: CloudflareD1Meta;
  results: T;
  [key: string]: any;
}

// API応答の実際の構造
export interface CloudflarePaginatedApiResponse<T>
  extends ApiResponse<CloudflareD1Response<T>> {
  pagination: PaginationInfo;
}
