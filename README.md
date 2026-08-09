# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## 自律型チーム開発

このリポジトリには、複数のClaude Codeエージェント(PRESIDENT/boss1/worker1〜3)が要件整理からタスク分割・実装・レビュー・マージまでを自律的に進める仕組みが導入されています。使い方は [TEAM_DEV.md](TEAM_DEV.md) を参照してください。

⚠️ 使う前に: これは「もう作るものが決まっていて、実際に作る」ときの仕組み。何を作るか・どのくらいの規模かの判断基準は`~/projects`配下の全プロジェクト共通なので、`~/projects/README.md`（このマシンのローカル専用メモ）にまとめてあります。
