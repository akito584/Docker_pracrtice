# Docker構築 & Prisma連携 学習レポート

本プロジェクトを通じて、Dockerを用いたNext.js + PostgreSQL環境の構築、およびPrisma ORMを用いたデータ操作基盤の実装を行いました。
以下に、習得した技術スキルと、開発過程で遭遇した重要なエラー事例とその対応策をまとめます。

## 1. 習得した技術スキル (Infrastructure & Backend)

### 🐋 Docker & Docker Compose
**関連ファイル:** `Dockerfile`, `docker-compose.yml`, `.dockerignore`

*   **コンテナ化の基礎**: Node.js環境 (`node:22-alpine`) をベースにした軽量なアプリケーションコンテナの構築。
*   **OS依存性の排除**: `.dockerignore` を使用して、ホストOS (Windows) の `node_modules` をコンテナに持ち込ませないことで、バイナリ互換性の問題を回避する設計能力。
*   **マルチコンテナオーケストレーション**: `docker-compose.yml` を用いて Webサーバーと DBサーバー (PostgreSQL) を定義し、相互通信させるネットワーク構築能力。
*   **環境変数の管理**: ホスト名 `db` によるサービス間通信や、`DATABASE_URL` の管理。
*   **ボリュームマウント**: ホスト側のソースコード変更をコンテナに即座に反映させる開発環境の構築。

### 💎 Prisma ORM & Database
**関連ファイル:** `prisma/schema.prisma`, `prisma/seed.ts`, `lib/prisma.ts`

*   **スキーマ定義**: `schema.prisma` を用いた宣言的なデータモデル定義 (`model User` など)。
*   **クロスプラットフォーム対応**: Docker (Linux/Musl) 環境で動作させるための `binaryTargets = ["native", "linux-musl"]` の設定。
*   **シードデータの投入**: `ts-node` を用いた初期データの自動投入スクリプトの実装。
*   **Singletonパターン**: Next.jsのHot Reload環境下でデータベース接続数が枯渇しないよう、グローバルインスタンスを管理する設計パターン (`lib/prisma.ts`)。

### ⚡ Next.js (Server Architecture)
**関連ファイル:** `app/page.tsx`, `next.config.ts`, `package.json`

*   **Server Components**: クライアントサイドJavaScriptを減らし、サーバー側で直接DBアクセス (`prisma.user.findMany`) を行う効率的なデータフェッチ戦略。
*   **ネットワークバインディング**: コンテナ外部からのアクセスを受け付けるためのホスト設定 (`-H 0.0.0.0`)。
*   **ファイル監視の調整**: Docker for Windows環境特有のファイル変更検知問題に対する、Webpackのポーリング設定 (`config.watchOptions`)。

---

## 2. 遭遇したエラーと解決策 (Troubleshooting Log)

開発中に発生したエラーは、環境構築において非常に一般的な「落とし穴」であり、これらを解決した経験は貴重な資産となります。

### 🛑 Case 1: データベース接続エラー (Unknown Host / Connection Refused)
*   **現象**: コンテナからDBに繋がらない、またはブラウザからアプリが見えない。
*   **原因**:
    1.  Next.jsがデフォルトで `localhost` にしかバインドしていないため、コンテナ外からアクセス不可。
    2.  Prismaから `localhost` でDBを探していた（コンテナ間通信ではサービス名 `db` を使う必要がある）。
*   **解決策**:
    *   `package.json`: `next dev -H 0.0.0.0` を指定し、全インターフェースで待機させた。
    *   `schema.prisma/env`: Docker内部では `DATABASE_URL=postgresql://...@db:5432/...` を使用。

### 🛑 Case 2: バイナリ互換性エラー (Exec Format Error / Segfault)
*   **現象**: コンテナ起動時にアプリがクラッシュする。
*   **原因**: Windows側でインストールされた `node_modules` (Windows用バイナリ) が、`COPY .` によって Linuxコンテナ内にコピーされ、実行が失敗していた。
*   **解決策**: `.dockerignore` ファイルを作成し、`node_modules` をコピー対象外に設定。コンテナ内で `npm install` を走らせることで、正しいLinux用バイナリを取得させた。

### 🛑 Case 3: Hot Reloadが効かない
*   **現象**: コードを編集してもブラウザに反映されない。
*   **原因**: WindowsのファイルシステムイベントがDockerコンテナ内のNext.jsに正しく伝播していなかった。
*   **解決策**: `next.config.ts` に Webpack のポーリング設定 (`poll: 1000`) を追加し、1秒ごとの監視を強制した。

### 🛑 Case 4: Turbopack と Webpack の競合
*   **現象**: `ERROR: This build is using Turbopack...` で起動しない。
*   **原因**: Next.js 16のデフォルトであるTurbopackと、既存のWebpack設定やDocker環境の相性が悪いため。
*   **解決策**: `package.json` の起動コマンドに `--webpack` フラグを追加し、安定したWebpackモードを強制した。

### 🛑 Case 5: TypeScript/Prisma Seed 実行エラー
*   **現象**: `ts-node` の引数パースエラーや、型定義不一致エラー。
*   **原因**: CLI引数でのJSON渡しがOSシェルに依存して壊れていた。また、シードのコードが `schema.prisma` と不一致だった。
*   **解決策**:
    *   `tsconfig.json` に `ts-node` 用の設定を記述し、CLI引数を排除。
    *   `seed.ts` の内容をスキーマ定義に合わせて修正。

---

## 3. 総括
本プロジェクトを通じて、単にコードを書くだけでなく、**アプリケーションが動作するための基盤（インフラ）をコードで管理することの重要性**を学びました。特に「OS間の差異」や「ネットワークの境界」に関するトラブルシューティングの経験は、今後の開発において強い武器となります。
