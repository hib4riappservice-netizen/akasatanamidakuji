#!/bin/bash
set -e

# 既存セッションがあればアタッチ方法だけ案内して終了
if tmux has-session -t "president-akasatanamidakuji" 2>/dev/null && tmux has-session -t "multiagent-akasatanamidakuji" 2>/dev/null; then
    echo "✅ 既存のセッションが動いています。以下でアタッチしてください:"
    echo "   tmux attach -t president-akasatanamidakuji"
    echo "   tmux attach -t multiagent-akasatanamidakuji"
    exit 0
fi

# なければ新規セットアップ
echo "既存セッションが見つからないため、新規にセットアップします..."
./setup.sh

echo ""
echo "🤖 各ペインでClaude Codeを起動しています..."
tmux send-keys -t "president-akasatanamidakuji" 'claude' C-m
tmux list-panes -t "multiagent-akasatanamidakuji:agents" -F '#{pane_id}' | while read pane; do
    tmux send-keys -t "$pane" 'claude' C-m
done

echo ""
echo "✅ 起動しました。以下でアタッチしてください:"
echo "   tmux attach -t president-akasatanamidakuji"
echo "   tmux attach -t multiagent-akasatanamidakuji"
