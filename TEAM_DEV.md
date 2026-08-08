# 🤖 Tmux Multi-Agent Communication Demo

PRESIDENT → boss1 → workers(git worktree) → boss1(マージ・レビュー) → PRESIDENT という自律開発フローを、tmux上の複数Claude Codeエージェントで実行する仕組み。

## 💬 このリポジトリの管理をClaude Codeに続きから頼むには

（PRESIDENT/boss1/workerではなく、このドキュメント自体の編集など`~/projects`横断のメンテナンスをClaude Codeに頼む場合の話）

- 通常は何も言わなくてよい。`~/`（このプロジェクト群のメンテナンスで使っているホームディレクトリ）で起動したセッションなら、過去のやり取りから得た記憶(`MEMORY.md`)が自動的に読み込まれる
- 特定の話題を確実に踏まえてほしい時は「〇〇の続きです、メモリを確認して」のように話題を添える
- ⚠️ 記憶はセッションを起動したディレクトリ単位。`~/projects/akasatanamidakuji`など特定プロジェクトの中で`claude`を起動すると別スコープ扱いになり、この記憶は自動では読み込まれない。プロジェクト横断の相談は`~`や`~/projects`から起動すること

## 🚀 使い方

### 1. セッション確認（cd不要・どこからでも実行可）

```bash
tmux list-sessions
```

- `multiagent-akasatanamidakuji` と `president-akasatanamidakuji` が**両方表示された** → そのまま「[セッションにアタッチ](#3-セッションにアタッチcd不要どこからでも実行可)」へ
- **表示されない/片方だけ** → 次の「2. 初回 or セッションが消えたとき」へ

### 2. 初回 or セッションが消えたとき（要cd）

```bash
cd ~/projects/akasatanamidakuji   # まだこのディレクトリにいなければ
./start.sh
```

これ一つで、セッション作成・4体のClaude Code起動まで自動で終わる(既にセッションが生きている場合は何もせずアタッチ方法を表示するだけ)。PRESIDENTは`--continue`で起動するため、前回の会話があればそのまま再開する(初回は自動的に新規会話になる)。

### 3. セッションにアタッチ（cd不要・どこからでも実行可）

VSCodeのターミナルパネルでタブ(または画面分割)をもう1つ開き、それぞれ別タブで実行する(両方同時に見るため):

```bash
tmux attach-session -t president-akasatanamidakuji
tmux attach-session -t multiagent-akasatanamidakuji
```

### 開発を依頼する

PRESIDENTのペインで、開発してほしい内容を直接伝える。または以下を入力すると指示書に沿って質問してくる:

```text
あなたはpresidentです。指示書に従って
```

あとは PRESIDENT → boss1 → worker1〜3 が自律的に動く。完了するとPRESIDENTから報告が来る。

### 作業を終えるとき

`Ctrl-b` → `d` でデタッチする(セッションは生きたまま)。`tmux kill-session`や`exit`連打は使わない。

> ⚠️ 次の場合はセッションが消えるので、上の「初回」からやり直しになる: PC本体のシャットダウン・再起動、`wsl --shutdown`の実行、WSLの長時間アイドル終了。**毎日PCをシャットダウンするなら毎回発生する** — 継続させたいならシャットダウンではなくスリープにする。
>
> 💬 セッションが消えても会話ログ自体は`~/.claude/projects/`に残るが、次に`claude`を新規起動すると空っぽの新規会話になる(PRESIDENTだけは`--continue`で自動復元)。boss1やworkerとのやり取りの「記憶」は会話継続ではなく`./tmp/TASKS.md`・`./tmp/tasks/spec.md`・gitのコミット履歴というファイルの形で引き継がれる設計になっている。

## 🧠 仕組み

```text
📊 president-akasatanamidakuji セッション (1ペイン)
└── PRESIDENT: 要件をヒアリングし、boss1に発注する統括責任者

📊 multiagent-akasatanamidakuji セッション (4ペイン)
├── boss1: 要件をタスク分割し、worker用にgit worktreeを用意して指示、完了後にマージ・レビュー
├── worker1〜3: 自分専用のworktreeで実装・テスト・コミットし、boss1へ個別に報告
```

動作フロー:

```text
1. ユーザー → PRESIDENT: 開発してほしい内容を伝える
2. PRESIDENT: 要件を ./tmp/tasks/spec.md に整理 → boss1へ開発指示
3. boss1: 要件を最大3タスクに分割し、workerごとにgit worktreeを作成
   (worker1: ../akasatanamidakuji-worker1 ブランチworker1-work、worker2/3も同様)
4. boss1 → worker1-3: 各worktreeに移動してタスクファイルを読み実装するよう指示
5. worker1-3: 実装 → テスト実行 → コミット → ./tmp/TASKS.md 更新 → boss1へ個別に完了報告
6. boss1: 全員の完了を ./tmp/TASKS.md で確認 → マージ前レビュー(個人情報・セキュリティ・法務・課金等)
   → 各branchをマージ → テスト実行 → worktree/branch後片付け
7. boss1 → PRESIDENT: 完了報告(変更概要・テスト結果・マージ済みコミット・残課題)
8. PRESIDENT → ユーザー: 結果を報告
```

worker1〜3は同じ作業ツリーを同時編集すると壊れるため、それぞれ専用のgit worktree(兄弟ディレクトリ)で作業する。boss1がタスク割当時にworktreeを作成し、全員完了後にメインツリーへマージして後片付けする。

⚠️ worktreeへの`cd`はラウンドごとに毎回発生する: boss1はマージ後に各workerのworktreeを削除し(後片付け)、次のタスクラウンドでは作り直す。そのためboss1→workerの指示メッセージには毎回`../akasatanamidakuji-workerN に移動し`が含まれ、workerは指示を受けるたびに`cd`から作業を始める(`instructions/worker.md`手順1)。

各エージェントの役割別指示書: `instructions/president.md` / `instructions/boss.md` / `instructions/worker.md`(`CLAUDE.md`も参照)。

### 権限設定について

実開発(ファイル編集・git操作・npm/テスト実行など)を行わせるには、Claude Codeの許可リストを広げる必要がある。workerごとに作業ディレクトリ(worktree)が異なるため、プロジェクト単位ではなく**ユーザーレベルの設定**(`~/.claude/settings.json`、WSLの場合はWSL側のホームディレクトリ)に許可を追加すること。危険な操作(`rm -rf`、force push等)は許可リストに含めない。

## 🔧 手動操作・デバッグ

`./`で始まるコマンドと`cat ./tmp/...`は要cd(`cd ~/projects/akasatanamidakuji`)。`tmux`コマンドはcd不要。

```bash
# メッセージを直接送る
./agent-send.sh [エージェント名] [メッセージ]
./agent-send.sh boss1 "緊急タスクです"
./agent-send.sh --list          # エージェント一覧

# 状況確認
cat ./tmp/TASKS.md              # タスク進捗
cat logs/send_log.txt           # 送受信ログ
tmux list-panes -t multiagent-akasatanamidakuji

# 環境リセット(タスク管理ファイル・worker用worktree/branchも自動でクリアされる)
tmux kill-session -t multiagent-akasatanamidakuji
tmux kill-session -t president-akasatanamidakuji
./setup.sh
```

## 📄 ライセンス

このプロジェクトは[MIT License](LICENSE)の下で公開されています。

## 🤝 コントリビューション

プルリクエストやIssueでのコントリビューションを歓迎いたします！

---

🚀 **Agent Communication を体感してください！** 🤖✨
