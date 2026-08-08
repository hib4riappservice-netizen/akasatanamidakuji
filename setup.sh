#!/bin/bash

# 🚀 Multi-Agent Communication Demo 環境構築
# 参考: setup_full_environment.sh

set -e  # エラー時に停止

# 色付きログ関数
log_info() {
    echo -e "\033[1;32m[INFO]\033[0m $1"
}

log_success() {
    echo -e "\033[1;34m[SUCCESS]\033[0m $1"
}

echo "🤖 Multi-Agent Communication Demo 環境構築"
echo "==========================================="
echo ""

# STEP 1: 既存セッションクリーンアップ
log_info "🧹 既存セッションクリーンアップ開始..."

tmux kill-session -t "multiagent-akasatanamidakuji" 2>/dev/null && log_info "multiagentセッション削除完了" || log_info "multiagentセッションは存在しませんでした"
tmux kill-session -t "president-akasatanamidakuji" 2>/dev/null && log_info "presidentセッション削除完了" || log_info "presidentセッションは存在しませんでした"

# タスク管理ファイルクリア
mkdir -p ./tmp/tasks
rm -f ./tmp/TASKS.md 2>/dev/null
rm -f ./tmp/tasks/*.md 2>/dev/null
log_info "既存のタスク管理ファイルをクリア"

# 既存workerのworktree/ブランチをクリーンアップ
log_info "🧹 既存workerのworktree/ブランチをクリーンアップ..."
for i in 1 2 3; do
    if git worktree list 2>/dev/null | grep -q "akasatanamidakuji-worker${i}"; then
        git worktree remove "../akasatanamidakuji-worker${i}" --force 2>/dev/null || true
    fi
    git branch -D "worker${i}-work" 2>/dev/null || true
done
git worktree prune 2>/dev/null || true

log_success "✅ クリーンアップ完了"
echo ""

# STEP 2: multiagentセッション作成（4ペイン：boss1 + worker1,2,3）
log_info "📺 multiagentセッション作成開始 (4ペイン)..."

# セッション作成
log_info "セッション作成中..."
tmux new-session -d -s "multiagent-akasatanamidakuji" -n "agents"

# セッション作成の確認
if ! tmux has-session -t "multiagent-akasatanamidakuji" 2>/dev/null; then
    echo "❌ エラー: multiagentセッションの作成に失敗しました"
    exit 1
fi

log_info "セッション作成成功"

# 2x2グリッド作成（ウィンドウ名使用でbase-index非依存）
log_info "グリッド作成中..."

# 水平分割（ウィンドウ名で指定）
log_info "水平分割実行中..."
tmux split-window -h -t "multiagent-akasatanamidakuji:agents"

# 左上ペインを選択して垂直分割
log_info "左側垂直分割実行中..."
tmux select-pane -t "multiagent-akasatanamidakuji:agents" -L  # 左のペインを選択
tmux split-window -v

# 右上ペインを選択して垂直分割
log_info "右側垂直分割実行中..."
tmux select-pane -t "multiagent-akasatanamidakuji:agents" -R  # 右のペインを選択
tmux split-window -v

# ペインの配置確認
log_info "ペイン配置確認中..."
PANE_COUNT=$(tmux list-panes -t "multiagent-akasatanamidakuji:agents" | wc -l)
log_info "作成されたペイン数: $PANE_COUNT"

if [ "$PANE_COUNT" -ne 4 ]; then
    echo "❌ エラー: 期待されるペイン数(4)と異なります: $PANE_COUNT"
    exit 1
fi

# ペインの物理的な配置を取得（top-leftから順番に）
log_info "ペイン番号取得中..."
# tmuxのペイン番号を位置に基づいて取得
PANE_IDS=($(tmux list-panes -t "multiagent-akasatanamidakuji:agents" -F "#{pane_id}" | sort))

log_info "検出されたペイン: ${PANE_IDS[*]}"

# ペインタイトル設定とセットアップ
log_info "ペインタイトル設定中..."
PANE_TITLES=("boss1" "worker1" "worker2" "worker3")

for i in {0..3}; do
    PANE_ID="${PANE_IDS[$i]}"
    TITLE="${PANE_TITLES[$i]}"
    
    log_info "設定中: ${TITLE} (${PANE_ID})"
    
    # ペインタイトル設定
    tmux select-pane -t "$PANE_ID" -T "$TITLE"
    
    # 作業ディレクトリ設定
    tmux send-keys -t "$PANE_ID" "cd $(pwd)" C-m
    
    # カラープロンプト設定
    if [ $i -eq 0 ]; then
        # boss1: 赤色
        tmux send-keys -t "$PANE_ID" "export PS1='(\[\033[1;31m\]${TITLE}\[\033[0m\]) \[\033[1;32m\]\w\[\033[0m\]\$ '" C-m
    else
        # workers: 青色
        tmux send-keys -t "$PANE_ID" "export PS1='(\[\033[1;34m\]${TITLE}\[\033[0m\]) \[\033[1;32m\]\w\[\033[0m\]\$ '" C-m
    fi
    
    # ウェルカムメッセージ
    tmux send-keys -t "$PANE_ID" "echo '=== ${TITLE} エージェント ==='" C-m
done

log_success "✅ multiagentセッション作成完了"
echo ""

# STEP 3: presidentセッション作成（1ペイン）
log_info "👑 presidentセッション作成開始..."

tmux new-session -d -s "president-akasatanamidakuji"
tmux send-keys -t "president-akasatanamidakuji" "cd $(pwd)" C-m
tmux send-keys -t "president-akasatanamidakuji" "export PS1='(\[\033[1;35m\]PRESIDENT\[\033[0m\]) \[\033[1;32m\]\w\[\033[0m\]\$ '" C-m
tmux send-keys -t "president-akasatanamidakuji" "echo '=== PRESIDENT セッション ==='" C-m
tmux send-keys -t "president-akasatanamidakuji" "echo 'プロジェクト統括責任者'" C-m
tmux send-keys -t "president-akasatanamidakuji" "echo '========================'" C-m

log_success "✅ presidentセッション作成完了"
echo ""

# STEP 4: 環境確認・表示
log_info "🔍 環境確認中..."

echo ""
echo "📊 セットアップ結果:"
echo "==================="

# tmuxセッション確認
echo "📺 Tmux Sessions:"
tmux list-sessions
echo ""

# ペイン構成表示
echo "📋 ペイン構成:"
echo "  multiagentセッション（4ペイン）:"
tmux list-panes -t "multiagent-akasatanamidakuji:agents" -F "    Pane #{pane_id}: #{pane_title}"
echo ""
echo "  presidentセッション（1ペイン）:"
echo "    Pane: PRESIDENT (プロジェクト統括)"

echo ""
log_success "🎉 Demo環境セットアップ完了！"
echo ""
echo "📋 次のステップ:"
echo "  1. 🔗 セッションアタッチ:"
echo "     tmux attach-session -t multiagent-akasatanamidakuji   # マルチエージェント確認"
echo "     tmux attach-session -t president-akasatanamidakuji    # プレジデント確認"
echo ""
echo "  2. 🤖 Claude Code起動:"
echo "     # 手順1: President認証"
echo "     tmux send-keys -t president-akasatanamidakuji 'claude' C-m"
echo "     # 手順2: 認証後、multiagent一括起動"
echo "     # 各ペインのIDを使用してclaudeを起動"
echo "     tmux list-panes -t "multiagent-akasatanamidakuji:agents" -F '#{pane_id}' | while read pane; do"
echo "         tmux send-keys -t \"\$pane\" 'claude' C-m"
echo "     done"
echo ""
echo "  3. 📜 指示書確認:"
echo "     PRESIDENT: instructions/president.md"
echo "     boss1: instructions/boss.md"
echo "     worker1,2,3: instructions/worker.md"
echo "     システム構造: CLAUDE.md"
echo ""
echo "  4. 🎯 開発実行: PRESIDENTに開発してほしい内容を伝えたあと「あなたはpresidentです。指示書に従って」と入力"

