
        const socket = io("https://nytools.nasirlin.net/piano");
        socket.on('connect', () => {
            console.log("Admin Connected!");
            socket.emit('admin_join'); 
        });

        socket.on('update_playlist', (list) => {
            renderList(list);
            document.getElementById('queue-count').innerText = list.length;
        });

        socket.on('now_playing', (song) => {
            document.getElementById('now-playing').innerText = song;
            showToast(`🎵 現在播放：${song}`, 'alert-info');
        });

        socket.on('admin_notification', (msg) => {
            showToast(msg, 'alert-success');
        });

        function requestPlaylistUpdate() {} // 備用
        function playNext() { if(confirm("確定要切換到下一首嗎？")) socket.emit('play_next'); }
        function deleteSong(songName) { if(confirm(`確定要從清單中刪除「${songName}」嗎？`)) socket.emit('delete_song', songName); }

        function renderList(list) {
            const tbody = document.getElementById('playlist');
            tbody.innerHTML = '';
            if (list.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3" class="text-center p-8 opacity-50">目前沒有待播歌曲</td></tr>`;
                return;
            }
            list.forEach((song, index) => {
                const tr = document.createElement('tr');
                tr.className = "hover";
                tr.innerHTML = `<th class="font-mono text-warning">${index + 1}</th><td class="font-medium text-lg">${song}</td><td class="text-right"><div class="tooltip" data-tip="刪除歌曲"><button class="btn btn-square btn-sm btn-outline btn-error" onclick="deleteSong('${song}')"><svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button></div></td>`;
                tbody.appendChild(tr);
            });
        }

        function showToast(msg, type) {
            const container = document.getElementById('toast-container');
            const div = document.createElement('div');
            div.className = `alert ${type} shadow-lg mb-2`;
            div.innerHTML = `<span>${msg}</span>`;
            container.appendChild(div);
            setTimeout(() => div.remove(), 3000);
        }
