# CLAUDE.md

このファイルは、Claude Code (claude.ai/code) がこのリポジトリで作業する際のガイダンスを提供します。

## プロジェクト概要

Nuxt 3で構築された肥料APIサーバーです。REST API経由で肥料データを提供することを目的としています。アプリケーションはCloudflare PagesとD1データベースで動作し、NuxtHubを使用してデプロイされます。

## 技術スタック

- **フレームワーク**: Nuxt 3.16.2 + TypeScript
- **ランタイム**: Cloudflare Workers/Pages
- **データベース**: Cloudflare D1 (SQLiteベース)
- **デプロイ**: NuxtHub
- **パッケージマネージャー**: pnpm 10.9.0
- **リンター**: ESLint + Nuxt設定
- **メール**: Resend API統合

## よく使用する開発コマンド

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動 (localhost:3000)
pnpm dev

# 本番用ビルド
pnpm build

# リントなしの本番用ビルド
pnpm run build:production

# コードのリント
pnpm lint

# ビルド済みアプリケーションのプレビュー
pnpm preview

# NuxtHubへのデプロイ
pnpm deploy
```

## アーキテクチャ

### API構造
- **パブリックAPI**: `/api/public/*` - 認証不要
- **バージョン管理API**: `/api/v1/*` - バージョン1のエンドポイント
- **ユーティリティ**: `/api/ping` - ヘルスチェック、`/api/debug` - デバッグ情報

### 主要なAPIエンドポイント
- `GET /api/public/fertilizers` - フィルタリング機能付きメイン肥料検索
- `GET /api/public/categories` - 肥料カテゴリ
- `GET /api/public/companies` - 企業データ
- `GET /api/public/components` - 成分情報
- `GET /api/public/types` - 肥料タイプ

### サーバーアーキテクチャ
- **ミドルウェアチェーン**: リクエストID → エラーハンドラー → D1 DB → キャッシュ初期化 → レスポンスヘッダー
- **サービス層**: 各データタイプ（肥料、カテゴリ、企業等）のビジネスロジック
- **ユーティリティ**: キャッシュ、ログ、バリデーション、エラーハンドリングの共通処理

### データベース統合
- D1アクセスにはNuxtHubの`hubDatabase()`を使用
- Cloudflare D1バインディングは"DB"として設定
- タイプ-カテゴリマッピング用のキャッシュ層（1時間TTL）

### 主要機能
- **高度なフィルタリング**: 成分範囲、タイプ、カテゴリによる複雑な肥料検索
- **ページネーション**: 設定可能なページサイズによる標準的なページング
- **エラーハンドリング**: リクエスト追跡付きの構造化エラーレスポンス
- **ログ機能**: 包括的なリクエスト/レスポンスログ
- **型安全性**: 詳細な肥料データ型による完全なTypeScriptカバレッジ

## 設定ファイル

- `nuxt.config.ts` - Cloudflareプリセット付きメインNuxt設定
- `wrangler.toml` - Cloudflare Workers設定
- `wrangler_local.toml` - ローカル開発用Cloudflare設定

## 環境変数

- `RESEND_API_KEY` - メール機能に必要
- `NODE_ENV` - 本番/開発環境の動作制御

## データ型

メインの`Fertilizer`インターフェース（types/fertilizer.ts）は60以上のフィールドを含み、以下をカバーします：
- 基本情報（登録、企業、商品名）
- 化学成分（N、P、K、Ca、Mg等）
- 詳細成分内訳（水溶性、クエン酸溶性形態）
- 分類とメタデータ

## 開発時の注意点

- SPAデプロイのためSSRは無効化（`ssr: false`）
- 外部SQLite処理付きのCloudflare Pagesプリセット
- 全APIルートでCORSが有効
- TypeScript厳密モードが有効
- ESLintはシングルクォートと末尾カンマなしで設定