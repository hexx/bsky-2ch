# ベースイメージ
FROM node:lts-slim

# pnpmのインストール
RUN npm install -g pnpm

# 作業ディレクトリの設定
WORKDIR /app

# パッケージのインストール
COPY package.json pnpm-lock.yaml ./

# キャッシュを利用して依存関係をインストール
RUN pnpm install --frozen-lockfile

# アプリのビルド
COPY . .
RUN pnpm run build

# 実行
EXPOSE 3000
CMD ["pnpm", "start"]
