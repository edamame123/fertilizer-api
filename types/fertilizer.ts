// app/types/fertilizer.ts
export interface Fertilizer {
  id: number;
  level: number;
  reg_no: string; // 登録番号
  reg_date: string; // 登録年月日
  company: string; // 肥料業者
  prod_name: string; // 商品名など
  form_name: string; // 正式名
  url: string;
  region: string;
  shape: string;
  fertilization: string;
  organic: string;
  effect: string;
  crop: string;

  // 基本成分
  nitrogen: number; // 窒素
  phos: number; // リン酸
  k: number; // カリウム
  ca: number; // カルシウム
  mg: number; // マグネシウム
  alk: number; // アルカリ分
  si: number; // ケイ素
  mn: number; // マンガン
  b: number; // ホウ素
  fe: number; // 鉄
  cu: number; // 銅
  zn: number; // 亜鉛
  mo: number; // モリブデン

  // 詳細成分
  // 窒素関連
  n_total: number; // 窒素全量
  n_nh4: number; // アンモニア性窒素
  n_nh4_in: number; // 内アンモニア性窒素
  n_no3: number; // 硝酸性窒素
  n_no3_in: number; // 内硝酸性窒素
  n_no3_in1: number; // 内硝酸性窒素_1

  // りん酸関連
  p_total: number; // りん酸全量
  p_cit: number; // く溶性りん酸
  p_cit_in: number; // 内く溶性りん酸
  p_sol: number; // 可溶性りん酸
  p_sol_in: number; // 内可溶性りん酸
  p_wat: number; // 水溶性りん酸
  p_wat_in: number; // 内水溶性りん酸

  // 加里関連
  k_total: number; // 加里全量
  k_cit: number; // く溶性加里
  k_cit_in: number; // 内く溶性加里
  k_wat: number; // 水溶性加里
  k_wat_in: number; // 内水溶性加里

  // けい酸関連
  si_sol: number; // 可溶性けい酸
  si_wat: number; // 水溶性けい酸

  // 苦土（マグネシウム）関連
  mg_sol: number; // 可溶性苦土
  mg_cit: number; // く溶性苦土
  mg_cit_in: number; // 内く溶性苦土
  mg_wat: number; // 水溶性苦土
  mg_wat_in: number; // 内水溶性苦土

  // マンガン関連
  mn_sol: number; // 可溶性マンガン
  mn_cit: number; // く溶性マンガン
  mn_cit_in: number; // 内く溶性マンガン
  mn_wat: number; // 水溶性マンガン
  mn_wat_in: number; // 内水溶性マンガン

  // ほう素関連
  b_cit: number; // く溶性ほう素
  b_wat: number; // 水溶性ほう素
  b_wat_in: number; // 内水溶性ほう素

  // 石灰関連
  lime_total: number; // 石灰全量
  lime_sol: number; // 可溶性石灰
  lime_cit: number; // く溶性石灰
  lime_wat: number; // 水溶性石灰

  // 硫黄関連
  s_total: number; // 硫黄全量
  s_sol: number; // 可溶性硫黄

  address: string; // 住所
  category_id: number; // 肥料種類名称のID
  category_name?: string; // 肥料種類名称（表示用）
  exp_type: string; // 失効区分
  [key: string]: any; // その他の追加フィールド
}

// 基本のフィルタコンポーネント用の型定義
export interface ComponentFilter {
  min: number | null;
  max: number | null;
  includeEmpty: boolean;
}

// 登録情報用の型定義
export interface RegistrationInfo {
  registrationNumber: string;
  registrationDate: Date | null;
}

// APIエラーレスポンス型定義（既存のerrorHandler.tsに合わせる）
export interface ErrorDetail {
  field?: string;
  issue: string;
  suggestedValue?: any;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
    requestId?: string;
    timestamp: string;
  };
}
