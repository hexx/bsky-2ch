FROM mcr.microsoft.com/devcontainers/typescript-node

# AWS CLIのインストール（ARM用）
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && sudo ./aws/install \
    && rm -rf aws awscliv2.zip

# AWS CDKのインストール
RUN npm install -g aws-cdk

# ecspressoのインストール
RUN curl -LO "https://github.com/kayac/ecspresso/releases/download/v2.4.4/ecspresso_2.4.4_linux_arm64.tar.gz" \
    && tar xvf ecspresso_2.4.4_linux_arm64.tar.gz \
    && sudo install ecspresso /usr/local/bin/ecspresso \
    && rm -rf LICENSE README.md ecspresso_2.4.4_linux_arm64.tar.gz

# Install dependencies
RUN apt-get update && apt-get install -y \
    git \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*
