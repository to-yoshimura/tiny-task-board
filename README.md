# Tiny Task Board

Fastify、TypeScript、Vitestで構成した最小のWalking Skeletonです。

## 必要な環境

- Node.js 26
- npm

`nvm`を使用する場合は、次のコマンドでプロジェクトのNode.jsバージョンに切り替えられます。

```sh
nvm use
```

## セットアップ

```sh
npm install
```

## 起動方法

開発サーバーを起動します。

```sh
npm run dev
```

ブラウザで <http://localhost:3000> を開くと、「Tiny Task Board」という見出しが表示されます。

本番用ビルドを起動する場合は、次のコマンドを実行します。

```sh
npm run build
npm start
```

環境変数`PORT`を指定しない場合、ポート3000で起動します。

## テスト方法

```sh
npm test
```

テストはFastifyの`inject()`を使用するため、ネットワークポートを開きません。

## 受け入れテスト

`features/task-list.feature`は、利用者視点でタスク一覧の振る舞いを記述したGherkin形式の受け入れ仕様です。次のコマンドでCucumberを実行できます。

```sh
npm run test:bdd
```

Vitestは個々のHTTPの振る舞いを直接検証し、Cucumberは利用者視点のシナリオを検証します。Cucumberの受け入れテストは`npm run verify`にも含まれます。

## E2Eテスト

初回にChromiumをインストールし、PlaywrightのE2Eテストを実行します。

```sh
npx playwright install chromium
npm run test:e2e
```

`npm run verify`には、型チェック、Vitest、Cucumber、ビルド、Playwrightがこの順序で含まれます。

## 検証方法

型チェック、テスト、ビルドを順番に実行します。

```sh
npm run verify
```

GitHub Actionsでも、`main`へのpushと`main`を対象とするpull requestのたびに同じ検証を自動実行します。
