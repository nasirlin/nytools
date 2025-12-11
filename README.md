# NY Tools (NTUB Redis小專題專案！)

## NY CHAT

![Render](https://img.shields.io/badge/Render-Hosted-46E3B7?style=flat-square&logo=render&logoColor=white)
![Redis](https://img.shields.io/badge/Database-Redis-DC382D?style=flat-square&logo=redis&logoColor=white)
![Status](https://img.shields.io/badge/Project-DBMS_Course-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-grey?style=flat-square)

> **專案背景**
>
> 本專案為 **國立臺北商業大學 (NTUB) 資料庫管理系統 (DBMS)** 課程小專題。
> 目的是在利用 NoSQL 資料庫特性，同時運用到 Redis ，來實作一個輕量級、高效率的 **線上排隊客服系統**。

### 專案簡介

**Ny Chat** 是一個專注在「即時性」與「排隊機制」的線上客服對話系統。
傳統關聯式資料庫在處理高併發的即時訊息時較為吃力，於是運用 **Redis** 的 **List (佇列)** 與 **Pub/Sub (發布/訂閱)** 機制，實現了低延遲的訊息傳遞與先進先出 (FIFO) 的客服排隊邏輯。

#### 核心技術

| Layer | Technology | Role & Usage |
| :--- | :--- | :--- |
| **Frontend** | **HTML5 / JavaScript** | 客戶端與客服端的對話視窗介面 |
| **Backend** | **Node.js / Python** | 處理 WebSocket 連線與 API 請求 |
| **Database** | **Redis** | 訊息暫存、排隊佇列 (Queuing)、即時推播 |
| **Cloud** | **Render** | 應用程式託管與部署 |

---

### 功能特色

* **即時排隊機制**
  當多位使用者同時請求客服時，系統利用 Redis List 確保使用者依照順序進入服務隊列。
* **即時訊息**
  利用 Redis 高速讀寫特性，訊息傳送幾乎不會延遲。
* **輕量化設計**
  無需繁重的資料庫架構，專注於解決「當下」的溝通需求。

---

### HOW TO USE

#### 對於使用者 (User)
1. 點 [Ny Chat 連結](https://nasirlin.github.io/nychat) 即可開始使用！
2. 若客服忙線中，系統會幫你進行排隊駐列。

#### 對於管理員 (Admin)
1. 點 [Ny Chat 客服頁面連結](https://nasirlin.github.io/nychat/server.html) 即可開始使用！
2. 系統會自動從 Redis 佇列中取出最優先的等待者。
3. 開始進行一對一對話。

---

## NY DROP - P2P File Transfer

**NY DROP** 是一個基於 WebRTC 技術的點對點（P2P）檔案傳輸工具。它允許使用者在不同裝置之間用「6位數代碼」快速配對，並直接在瀏覽器端進行檔案傳輸，檔案**不經過伺服器儲存**，確保了傳輸的速度與隱私安全性。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-v18-green)
![Socket.io](https://img.shields.io/badge/Socket.io-v4-black)
![WebRTC](https://img.shields.io/badge/WebRTC-Native-orange)

### 特色

* **無伺服器儲存**：檔案透過 P2P 隧道直接傳輸，保障隱私，無檔案大小限制
* **簡單配對**：捨棄複雜的 URL 分享，採用直覺的「6位數房間代碼」。
* **跨平台**：基於 Web 技術，支援電腦、手機、平板等任何現代瀏覽器。

### 核心技術

| Component | Technology | Role & Usage |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, Bootstrap 5, JavaScript | 使用者介面與互動邏輯 |
| **Backend** | Node.js, Express | 伺服器端運行環境 |
| **Real-time Comms** | Socket.io | 用於信令交換 (Signaling) |
| **P2P Protocol** | WebRTC (RTCPeerConnection, DataChannel) | 建立點對點連接與數據傳輸 |
| **Database** | Redis | 暫存房間代碼與 Socket ID 的對應關係 |
| **Infrastructure** | Render, GitHub Pages | 後端與前端託管 |

### 系統架構

1.  **Signaling (信令)**: 使用 Socket.io 交換雙方的 SDP (Session Description Protocol) 和 ICE Candidates。
2.  **Room Management**: 使用 Redis 設定 TTL (Time-To-Live)，讓配對代碼在 5 分鐘後自動過期。
3.  **Data Transfer**: 建立 WebRTC `DataChannel`，繞過伺服器直接傳輸二進位檔案資料 (ArrayBuffer)。 

### ⚠️開發挑戰與解決方案

| 挑戰 (問題) | 狀況描述 | 解決方案 |
| :--- | :--- | :--- |
| **跨域資源共享限制 (CORS）** | 前端部署於 GitHub Pages，後端位於 Render，瀏覽器阻擋了跨域的 Socket 連線請求。 | 在 Express 與 Socket.io 伺服器端同步設定 CORS Header，並允許 `origin: "*"` 以及 `methods: ["GET", "POST"]`，徹底解決握手失敗問題。 |
| **WebRTC 競態條件** | 網路環境較快時，ICE Candidates (網路路徑資訊) 往往比 SDP Offer/Answer 先抵達。導致瀏覽器拋出 `Remote description was null` 錯誤，無法建立連線。 | 實作 **Candidate Queue (候選列隊)** 機制。當 `remoteDescription` 尚未設定時，將收到的 ICE Candidate 暫存入陣列；待 SDP 設定完成後，再透過 `processQueue()` 一次性處理。 |
| **信號反射與無限迴圈** | 使用 `io.to(room).emit` 廣播時，發送者 (Sender) 收到了自己發出的 Offer，導致瀏覽器混淆角色，拋出 `Failed to set SSL role` 錯誤，甚至造成無限重連。 | 1. 嚴格區分 **Sender (Host)** 與 **Receiver (Guest)** 角色。 2. 後端改用 `socket.to(room).emit`，確保訊息只傳給「房間內的其他人」，而不傳回給自己。 3. 前端加入 `if (isInitiator)` 判斷，發送者只處理 Answer，接收者只處理 Offer。 |
| **UI 狀態同步** | 雖然 Console 顯示連線成功，但 UI 仍卡在「等待中」。 | 監聽 WebRTC 的 `dataChannel.onopen` 事件，將其作為「絕對成功」的指標，強制觸發 UI 頁面切換 (`showStep`)，確保使用者體驗與底層狀態一致。 |

---

## NYPIANO 點播工具

![Render](https://img.shields.io/badge/Render-Hosted-46E3B7?style=flat-square&logo=render&logoColor=white)
![Redis](https://img.shields.io/badge/Database-Redis-DC382D?style=flat-square&logo=redis&logoColor=white)
![HTML5](https://img.shields.io/badge/Frontend-HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)

> **關於這個專案**
>
> 由於時常在 **北商大體育館2樓** 進行練琴，希望能透過大家的點歌來增進我的彈奏歌單。這是一個輕量級的即時點播小工具，讓經過的同學或是聽眾能方便地進行點歌。

### 🎹 專案簡介

**NYPIANO** 是一個基於 Web 的互動式點歌系統。透過簡單的網頁介面，使用者可以輸入想聽的曲目，系統會利用 Redis，讓使用者能夠進行點歌！

### 核心技術

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **HTML5 / CSS3** | 簡潔直觀的用戶點歌介面 |
| **Database** | **Redis** | 利用其高速讀寫與 List/Queue 特性處理即時點歌隊列 |
| **Deployment** | **Render** | 雲端託管服務，確保服務隨時在線 |

---

### HOW TO USE 

1. **開始點歌**
 點擊 [NYPIANO](https://nasirlin.github.io/nypiano)

2. **輸入歌曲**
   在輸入框中填入你想聽的歌曲名稱。

3. **送出點播**
   按下送出後，歌曲將會進入我的後台中，我將會依照順序進行彈奏～～～

---

Created by Nasir Lin @