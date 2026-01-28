
        const socket = io("https://nytools.nasirlin.net/piano");
        const toastEl = document.getElementById('liveToast');
        const toast = new bootstrap.Toast(toastEl);
        const overlay = document.getElementById('offline-overlay');
        const songInput = document.getElementById('songInput');
        const submitBtn = document.getElementById('submitBtn');
        socket.on('system_status', (data) => {
            if (data.online) {
    
                overlay.style.opacity = '0';
                setTimeout(() => { overlay.style.display = 'none'; }, 500);
                songInput.disabled = false;
                submitBtn.disabled = false;
            } else {
                overlay.style.display = 'flex';
                setTimeout(() => { overlay.style.opacity = '1'; }, 10);
                songInput.disabled = true;
                submitBtn.disabled = true;
            }
        });

        socket.on('update_playlist', (list) => { renderList(list); });

        function requestSong() {
            const songName = songInput.value.trim();
            if (songName) {
                socket.emit('request_song', songName);
                songInput.value = ''; 
                toast.show();
            } else {
                alert("請輸入歌名喔！輸入完後等待 納西爾爲您彈奏");
            }
        }

        function renderList(list) {
            const container = document.getElementById('playlist');
            container.innerHTML = ''; 
            if (list.length === 0) {
                container.innerHTML = `<div class="text-center py-5 text-secondary border rounded border-secondary border-opacity-25"><i class="bi bi-music-player display-4 d-block mb-3"></i><p class="mb-0">目前清單空空如也，快來點第一首歌！</p></div>`;
                return;
            }
            list.forEach((song, index) => {
                const item = document.createElement('div');
                item.className = "list-group-item";
                item.innerHTML = `<div class="rank-badge">${index + 1}</div><div class="flex-grow-1"><div class="fw-bold text-light" style="font-size: 1.1rem;">${song}</div><small class="text-secondary">Pending Request</small></div><i class="bi bi-hourglass-split text-secondary"></i>`;
                container.appendChild(item);
            });
        }
