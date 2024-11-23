# ベースイメージ
FROM node:lts-alpine

# 作業ディレクトリの設定
WORKDIR /app

# パッケージのインストール
COPY package*.json ./
RUN npm install

# アプリのビルド
COPY . .
RUN npm run build

# 実行
EXPOSE 3000
CMD ["npm", "start"]
