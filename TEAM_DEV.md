# 🤖 Tmux Multi-Agent Communication Demo

Agent同士がやり取りするtmux環境のデモシステム

**📖 Read this in other languages:** [English](README-en.md)

## 🎯 デモ概要

PRESIDENT → BOSS → Workers の階層型指示システムを体感できます

### 👥 エージェント構成

```
📊 PRESIDENT セッション (1ペイン)
└── PRESIDENT: プロジェクト統括責任者

📊 multiagent セッション (4ペイン)  
├── boss1: チームリーダー
├── worker1: 実行担当者A
├── worker2: 実行担当者B
└── worker3: 実行担当者C
```

## 🚀 クイックスタート

### 0. リポジトリのクローン

> ✅ このリポジトリ（`/home/hib4ri/projects/akasatanamidakuji`）には、team-hib4riから仕組み一式（instructions/・agent-send.sh・setup.sh・CLAUDE.md等）をコピー済み。git cloneは不要。

```bash
git clone https://github.com/nishimoto265/Claude-Code-Communication.git
cd Claude-Code-Communication
```

### 1. tmux環境構築

⚠️ **注意**: 既存の `multiagent-akasatanamidakuji` と `president-akasatanamidakuji` セッションがある場合は自動的に削除されます。

```bash
./setup.sh
```

### 2. セッションアタッチ

```bash
# マルチエージェント確認
tmux attach-session -t multiagent-akasatanamidakuji

# プレジデント確認（別ターミナルで）
tmux attach-session -t president-akasatanamidakuji
```

### 3. Claude Code起動

**手順1: President認証**
```bash
# まずPRESIDENTで認証を実施
tmux send-keys -t president-akasatanamidakuji 'claude' C-m
```
認証プロンプトに従って許可を与えてください。

**手順2: Multiagent一括起動**
```bash
# 認証完了後、multiagentセッションを一括起動
for i in {0..3}; do tmux send-keys -t multiagent-akasatanamidakuji:0.$i 'claude' C-m; done
```

### 4. デモ実行

PRESIDENTセッションで直接入力：
```
あなたはpresidentです。指示書に従って
```

## 🔁 2回目以降の起動（VSCodeを開くたび）

初回の`./setup.sh`〜Claude Code起動が済んでいれば、以降は毎回やり直す必要はない。tmuxセッションはWSL側でバックグラウンド動作し続けるため、VSCodeを閉じても生きたままである。

### 1. セッションが生きているか確認

```bash
tmux list-sessions
```

`multiagent-akasatanamidakuji`と`president-akasatanamidakuji`が表示されれば手順2へ。何も表示されなければセッションが失われているので、上の「🚀 クイックスタート」を最初からやり直す。

### 2. セッションにアタッチ

VSCodeのターミナルパネルでタブ（または画面分割）をもう1つ開き、それぞれ別タブで実行する（両方の状況を同時に見るため）。

```bash
tmux attach-session -t president-akasatanamidakuji
tmux attach-session -t multiagent-akasatanamidakuji
```

前回の続き（会話・作業状態）がそのまま残っている。

### 3. 終了するとき

`Ctrl-b` → `d` でデタッチする（セッションを生かしたまま抜ける）。`tmux kill-session`や単純な`exit`連打でペインを閉じるとセッションが消えるので使わない。

⚠️ 次の場合はセッションが失われるため、再度「🚀 クイックスタート」から実行し直す：

- **Windows/PCのシャットダウン・再起動**（毎日シャットダウンする場合は、毎回この手順が必要になる。継続させたいならシャットダウンではなく「スリープ」にする）
- PowerShell等での`wsl --shutdown`の実行
- WSLが長時間完全アイドルになり自動終了した場合

## 📜 指示書について

各エージェントの役割別指示書：
- **PRESIDENT**: `instructions/president.md`
- **boss1**: `instructions/boss.md` 
- **worker1,2,3**: `instructions/worker.md`

**Claude Code参照**: `CLAUDE.md` でシステム構造を確認

**要点:**
- **PRESIDENT**: 要件を整理して`./tmp/tasks/spec.md`に書き出し → boss1に指示送信
- **boss1**: 要件をタスク分割 → workerごとにworktreeを用意して指示 → 全員の完了確認 → マージ・検証 → PRESIDENTへ報告
- **workers**: 自分のworktreeで実装・テスト・コミット → `./tmp/TASKS.md`更新 → boss1へ個別に完了報告

## 🎬 期待される動作フロー（自律開発）

```
1. ユーザー → PRESIDENT: 開発してほしい内容を伝える
2. PRESIDENT: 要件を ./tmp/tasks/spec.md に整理 → boss1へ開発指示
3. boss1: 要件を最大3タスクに分割し、workerごとにgit worktreeを作成
   （worker1: ../akasatanamidakuji-worker1 ブランチworker1-work、worker2/3も同様）
4. boss1 → worker1-3: 各worktreeに移動してタスクファイルを読み実装するよう指示
5. worker1-3: 実装 → テスト実行 → コミット → ./tmp/TASKS.md 更新 → boss1へ個別に完了報告
   （「最後の人が報告する」方式ではなく、各workerが終わり次第すぐ報告する）
6. boss1: 全員の完了を ./tmp/TASKS.md で確認 → 各branchをマージ → テスト実行 → worktree/branch後片付け
7. boss1 → PRESIDENT: 完了報告（変更概要・テスト結果）
8. PRESIDENT → ユーザー: 結果を報告
```

### worker間の作業分離（git worktree）

worker1〜3は同じ作業ツリーを同時編集すると壊れるため、それぞれ専用のgit worktree（兄弟ディレクトリ）で作業する。boss1がタスク割当時にworktreeを作成し、全員完了後にメインツリーへマージして後片付けする。

### 権限設定について

実開発（ファイル編集・git操作・npm/テスト実行など）を行わせるには、Claude Codeの許可リストを広げる必要がある。workerごとに作業ディレクトリ（worktree）が異なるため、プロジェクト単位の設定ではなく **ユーザーレベルの設定**（`~/.claude/settings.json`、WSLで実行する場合はWSL側のホームディレクトリ）に許可を追加すること。危険な操作（`rm -rf`、force push等）は許可リストに含めない。

## 🔧 手動操作

### agent-send.shを使った送信

```bash
# 基本送信
./agent-send.sh [エージェント名] [メッセージ]

# 例
./agent-send.sh boss1 "緊急タスクです"
./agent-send.sh worker1 "作業完了しました"
./agent-send.sh president "最終報告です"

# エージェント一覧確認
./agent-send.sh --list
```

## 🧪 確認・デバッグ

### ログ確認

```bash
# 送信ログ確認
cat logs/send_log.txt

# 特定エージェントのログ
grep "boss1" logs/send_log.txt

# 完了ファイル確認
ls -la ./tmp/worker*_done.txt
```

### セッション状態確認

```bash
# セッション一覧
tmux list-sessions

# ペイン一覧
tmux list-panes -t multiagent-akasatanamidakuji
tmux list-panes -t president-akasatanamidakuji
```

## 🔄 環境リセット

```bash
# セッション削除
tmux kill-session -t multiagent-akasatanamidakuji
tmux kill-session -t president-akasatanamidakuji

# 完了ファイル削除
rm -f ./tmp/worker*_done.txt

# 再構築（自動クリア付き）
./setup.sh
```

---

## 📄 ライセンス

このプロジェクトは[MIT License](LICENSE)の下で公開されています。

## 🤝 コントリビューション

プルリクエストやIssueでのコントリビューションを歓迎いたします！

---

🚀 **Agent Communication を体感してください！** 🤖✨ 