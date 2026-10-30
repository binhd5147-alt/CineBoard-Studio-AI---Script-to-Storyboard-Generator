# 🎬 CineBoard Studio AI - Script to Storyboard Generator

> **Biến kịch bản phim thành chuỗi Storyboard điện ảnh hoàn chỉnh với Gemini AI, Three.js 3D Pre-Visualization và AI Director Copilot.**

[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-r182-black?logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Google GenAI SDK](https://img.shields.io/badge/@google/genai-v2.x-4285F4?logo=google&logoColor=white)](https://www.npmjs.com/package/@google/genai)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey?logo=express&logoColor=black)](https://expressjs.com/)

---

## 📖 Mục lục / Table of Contents

1. [Tổng quan dự án (Project Overview)](#-tổng-quan-dự-án-project-overview)
2. [Các tính năng chính (Core Features)](#-các-tính-năng-chính-core-features)
3. [Kiến trúc kỹ thuật (Technical Architecture)](#-kiến-trúc-kỹ-thuật-technical-architecture)
4. [Cấu trúc thư mục (Directory Structure)](#-cấu-trúc-thư-mục-directory-structure)
5. [Mô hình AI & Cơ chế hoạt động (AI Models & Fallbacks)](#-mô-hình-ai--cơ-chế-hoạt-động-ai-models--fallbacks)
6. [Hướng dẫn cài đặt & Chạy dự án (Installation & Setup)](#-hướng-dẫn-cài-đặt--chạy-dự-án-installation--setup)
7. [Tài liệu API Backend (API Endpoints)](#-tài-liệu-api-backend-api-endpoints)
8. [Hướng dẫn đẩy lên GitHub (Push to GitHub)](#-hướng-dẫn-đẩy-lên-github-push-to-github)
9. [Bản quyền & Giấy phép (License)](#-bản-quyền--giấy-phép-license)

---

## 🌟 Tổng quan dự án (Project Overview)

**CineBoard Studio AI** là một ứng dụng web toàn diện (Full-Stack) dành cho các nhà làm phim, đạo diễn, biên kịch và họa sĩ storyboard. Ứng dụng giải quyết bài toán biến kịch bản dạng chữ thô (Screenplay) thành một chuỗi khung hình trực quan (Storyboard Keyframes) đồng nhất về mặt nhân vật, ánh sáng, góc máy và phong cách nghệ thuật.

Hệ thống tích hợp:
- **Google GenAI SDK (`@google/genai`)**: Tự động phân tích kịch bản thành các cảnh và cú máy (Shot Breakdown), tạo hình ảnh storyboard độ phân giải cao (1K, 2K, 4K) bằng `gemini-3-pro-image-preview`.
- **Three.js 3D Virtual Studio**: Sân khấu 3D giả lập góc máy (Director's Viewfinder) với người mẫu nhân vật đa chi tiết, giàn máy quay Panavision trên đường ray dolly và hệ thống đèn studio PBR.
- **AI Director Copilot**: Trợ lý trò chuyện hội thoại đa lượt (Multi-turn Chat) với 3 vai trò chuyên môn (*Đạo diễn*, *Quay phim / D.O.P*, *Biên tập kịch bản*).
- **Animatic Playback**: Trình chiếu chuỗi storyboard toàn màn hình có căn thời gian (duration), phụ đề thoại và hiệu ứng âm thanh.

---

## 🚀 Các tính năng chính (Core Features)

### 1. Phân tích kịch bản thông minh (Script Breakdown Engine)
- **Hỗ trợ tải tệp đa định dạng**: Kéo thả hoặc upload tệp `.txt`, `.fountain`, `.fdx`, `.md`, `.pdf`.
- **Dán trực tiếp văn bản kịch bản**: Nhập đoạn phân cảnh bất kỳ kèm bộ đếm ký tự thời gian thực.
- **Kịch bản mẫu phong phú**: Tích hợp sẵn 4 kịch bản mẫu thuộc nhiều thể loại (*Cyberpunk*, *Film Noir*, *Khoa học viễn tưởng*, *Viễn Tây*).
- **Phân tách cú máy chi tiết**:
  - Loại cú máy: *Extreme Wide, Wide Shot, Medium Shot, Close-Up, Extreme Close-Up, Dutch Angle, Over the Shoulder, Low Angle Hero, Bird's Eye View, POV*.
  - Tiêu cự ống kính (Focal Length): *18mm, 24mm, 35mm, 50mm, 85mm, 135mm*.
  - Chuyển động máy (Camera Movement): *Static, Dolly In, Tracking, Crane Down, Handheld Jitter*.
  - Hành động & Thoại nhân vật.
  - Cường độ và màu sắc ánh sáng (*Lighting Mood*).
  - Gợi ý câu prompt chuyên sâu tối ưu cho việc tạo ảnh.

### 2. Tạo ảnh phân cảnh chất lượng cao (Gemini 3 Pro Image Generation)
- **Tùy chọn kích thước ảnh (Image Size)**: Hỗ trợ lựa chọn giữa **1K**, **2K**, và **4K** trực tiếp trên thanh công cụ.
- **Tỉ lệ khung hình điện ảnh (Aspect Ratios)**:
  - `16:9` (Cinematic Widescreen)
  - `2.39:1` (Anamorphic Scope)
  - `4:3` (Classic Academy)
  - `1:1` (Square Keyframe)
  - `9:16` (Vertical Mobile / Reels)
- **Phong cách nghệ thuật (Visual Styles)**:
  - *Cinematic Film Still (35mm Anamorphic)*
  - *Graphic Novel Noir (High-Contrast Ink)*
  - *Hollywood Production Pencil Sketch*
  - *Anime & Animation Keyframe*
  - *Hyper-Realistic Concept Matte*
- **Tạo ảnh hàng loạt (Batch Generation)**: Tạo từng ảnh đơn lẻ hoặc tự động tạo toàn bộ chuỗi shot đang chờ (Pending).
- **Xem phóng to (Lightbox 4K)**: Xem chi tiết khung hình chất lượng cao và tải ảnh PNG về máy.

### 3. Sân khấu tiền kỳ 3D (Three.js 3D Director's Viewfinder)
- **Mô hình thủ tục phức hợp (3–12 Part Procedural Models)**:
  - Nhân vật actor mannequin gồm 11 bộ phận (thân, khớp hông, đùi, ủng da, cánh tay, đầu, kính ngắm visor phát sáng, giáp ngực).
  - Giàn máy quay điện ảnh gồm 10 chi tiết (đường ray dolly, bệ xe kéo bánh xe, trụ thủy lực, đầu dầu fluid head, thân máy Arri/Panavision, matte box che nắng, vòng lấy nét vàng, màn hình viewfinder, đèn đỏ tally light, tay cầm).
- **Ánh sáng chuẩn Studio PBR**:
  - Đèn Key ấm tạo bóng mềm PCF.
  - Đèn Hemisphere xanh lạnh bù sáng.
  - Đèn Rim spotlight tạo viền khối.
  - Bản đồ môi trường phòng studio không cần tải file ngoài (`RoomEnvironment` + `PMREMGenerator`).
- **Thanh điều khiển thu gọn thông minh (Collapsible Bottom Dock)**:
  - Đổi góc máy nhanh: *Over-The-Shoulder, Hero Low-Angle, Close-Up Portrait, Dutch Angle, Extreme Wide, Bird's Eye View*.
  - Thanh trượt tiêu cự ống kính từ `18mm` đến `135mm` (tự động tính toán FOV góc nhìn theo chuẩn cảm biến 35mm).
  - Chuyển đổi bầu không khí ánh sáng: *Dramatic, Noir, Sci-Fi, Daylight*.
  - **Nút "Apply Framing to Shot"**: Chụp lại tham số góc máy và tiêu cự 3D để gắn trực tiếp vào câu lệnh tạo ảnh của phân cảnh storyboard.

### 4. Trợ lý đạo diễn AI (Multi-Turn Gemini Chatbot Copilot)
- **Giao diện hội thoại đa lượt**: Lưu giữ lịch sử trò chuyện trong phiên làm việc.
- **3 vai trò chuyên biệt (Role-based System Instructions)**:
  - **Director**: Tư vấn nhịp điệu phân cảnh, tính liên tục, gợi ý các góc máy còn thiếu.
  - **Cinematographer**: Tư vấn tiêu cự lens, tỉ lệ sáng tối (Key-Fill ratio), nhiệt độ màu.
  - **Script Doctor**: Biên tập câu thoại, gọt giũa kịch tính và chiều sâu tâm lý nhân vật.
- **Lựa chọn mô hình linh hoạt**:
  - `gemini-4-argon`: Dành cho các phân tích kịch bản sâu, suy luận logic phức tạp.
  - `gemini-3.8-flash`: Cân bằng hoàn hảo giữa tốc độ và chất lượng cho các tác vụ tổng quát.
  - `gemini-3.1-flash-lite`: Phản hồi tức thì cho các gợi ý thoại hoặc chỉnh sửa nhanh câu lệnh.
- **Nhận biết ngữ cảnh thời gian thực**: Tự động đính kèm thông tin kịch bản hiện tại, nhân vật và shot đang được chọn vào yêu cầu gửi tới AI.

### 5. Trình chiếu Animatic & Xuất bản (Animatic & Export Suite)
- **Animatic Player**:
  - Chạy chuỗi phân cảnh theo thời lượng từng shot.
  - Hiển thị phụ đề thoại định dạng điện ảnh và nhãn hiệu ứng âm thanh.
  - Tùy chỉnh tốc độ playback: `0.75x`, `1.0x`, `1.25x`, `1.5x`.
- **Bộ công cụ xuất bản**:
  - In ấn & Xuất file PDF (Printable Call Sheet & Storyboard grid).
  - Sao chép toàn bộ danh sách shotlist dưới dạng văn bản Markdown.
  - Xuất tệp sao lưu JSON chứa toàn bộ dữ liệu dự án và hình ảnh.

---

## 🛠 Kiến trúc kỹ thuật (Technical Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                       CLIENT (React 19 SPA)                     │
│  - StoryboardGrid / ShotCard (Hiển thị & quản lý chuỗi shot)    │
│  - GenerationSettingsBar (Chọn kích thước 1K/2K/4K, Tỉ lệ, ...)  │
│  - ThreeStagePreViz (Three.js 3D Viewfinder & Camera Blocking)  │
│  - DirectorChatbot (Hội thoại đa lượt với Gemini)              │
│  - AnimaticPlayer (Trình chiếu slideshow có âm thanh/phụ đề)    │
└────────────────┬────────────────────────────────────────────────┘
                 │ Fetch HTTP POST (/api/*)
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SERVER (Node.js + Express)                    │
│  - server.ts: Khởi tạo Express & gắn Vite Dev Middleware        │
│  - Shared @google/genai Client (chạy an toàn ở server-side)     │
│  - Xử lý Waterfall Fallback cho các dòng mô hình Gemini        │
└────────────────┬────────────────────────────────────────────────┘
                 │ @google/genai SDK
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       GOOGLE GEMINI API                         │
│  - gemini-3-pro-image-preview / gemini-nano-banana-2.1 (Tạo ảnh) │
│  - gemini-4-argon / gemini-3.8-flash (Phân tích kịch bản & Chat)│
│  - gemini-3.1-flash-lite (Hội thoại siêu tốc)                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 Cấu trúc thư mục (Directory Structure)

```text
├── .env.example              # Mẫu biến môi trường (GEMINI_API_KEY, APP_URL, ...)
├── .gitignore                # Danh sách tệp bỏ qua khi đẩy lên git (node_modules, dist, .env)
├── index.html                # Điểm vào HTML chính, chứa font Google & thẻ meta SEO
├── metadata.json             # Cấu hình applet và cấp quyền môi trường AI Studio
├── package.json              # Khai báo dependencies và scripts thực thi
├── server.ts                 # Full-stack Express server + proxy API Gemini + Vite middleware
├── tsconfig.json             # Cấu hình TypeScript
├── vite.config.ts            # Cấu hình Vite & Tailwind CSS plugin
├── src/
│   ├── App.tsx               # Component gốc quản lý toàn bộ state dự án và các view
│   ├── main.tsx              # React DOM mounting entry point
│   ├── index.css             # Tailwind v4 import, custom scrollbar & media print stylesheet
│   ├── types/
│   │   └── storyboard.ts     # Kiểu dữ liệu TypeScript (Shot, Scene, Project, Chat, ...)
│   ├── data/
│   │   └── sampleScripts.ts  # 4 bộ kịch bản mẫu chất lượng cao thuộc nhiều thể loại
│   └── components/
│       ├── Navbar.tsx                # Thanh điều hướng trên cùng, chuyển tab & mở modal
│       ├── GenerationSettingsBar.tsx # Thanh cấu hình Image Size (1K/2K/4K), Ratio & Style
│       ├── StoryboardGrid.tsx        # Lưới thẻ storyboard, thao tác shot, Lightbox 4K
│       ├── ThreeStagePreViz.tsx      # Sân khấu tiền kỳ 3D Viewfinder viết bằng Three.js
│       ├── DirectorChatbot.tsx       # Khung chat AI Director Copilot đa lượt
│       ├── ScriptUploadModal.tsx     # Modal tải file / dán kịch bản / chọn kịch bản mẫu
│       ├── ScriptEditorView.tsx      # Giao diện xem kịch bản gốc song song với shot list
│       ├── AnimaticPlayer.tsx        # Trình chiếu phim ngắn storyboard có căn thời gian
│       └── ExportModal.tsx           # Modal xuất PDF, Markdown và tải JSON dự án
└── README.md                 # Tài liệu hướng dẫn toàn diện này
```

---

## 🧠 Mô hình AI & Cơ chế hoạt động (AI Models & Fallbacks)

### 1. Tạo ảnh Storyboard (`/api/generate-shot-image`)
- **Mô hình ưu tiên**: `gemini-3-pro-image-preview`
- **Cơ chế Waterfall Fallback**: Nếu mô hình ưu tiên gặp sự cố hạn mức hoặc đang cập nhật, máy chủ sẽ tuần tự thử các mô hình tương đương:
  1. `gemini-3-pro-image-preview`
  2. `gemini-3-pro-image`
  3. `gemini-nano-banana-2.1`
  4. `gemini-3.1-flash-lite-image`
- **Tham số cấu hình**:
  - `imageSize`: Lựa chọn giữa `"1K"`, `"2K"`, `"4K"` (hỗ trợ trên dòng Gemini 3 Pro và Nano Banana).
  - `aspectRatio`: Hỗ trợ `"16:9"`, `"2.39:1"` (ánh xạ sang `"16:9"` kèm prompt mở rộng), `"4:3"`, `"1:1"`, `"9:16"`.

### 2. Phân tích kịch bản (`/api/breakdown-script`)
- Tùy chọn giữa `gemini-3.8-flash` (nhanh, súc tích) hoặc `gemini-4-argon` (phân tích sâu sắc cấu trúc kịch bản).
- Định dạng dữ liệu trả về theo chuẩn `Type.OBJECT` JSON Schema nghiêm ngặt, đảm bảo tính chuẩn xác và không sinh lỗi cú pháp khi hiển thị lên giao diện.

### 3. Hội thoại trợ lý (`/api/chat`)
- Lưu trữ toàn bộ mảng `messages` giữa người dùng và AI.
- Tùy biến `systemInstruction` theo từng vai trò chuyên môn (*Director, Cinematographer, Script Doctor*).

---

## 💻 Hướng dẫn cài đặt & Chạy dự án (Installation & Setup)

### Yêu cầu tiên quyết (Prerequisites)
- **Node.js**: Phiên bản `18.x` hoặc `20.x` trở lên.
- **npm** (hoặc `yarn` / `pnpm` / `bun`).
- **Google Gemini API Key**: Lấy khóa miễn phí hoặc trả phí tại [Google AI Studio](https://aistudio.google.com/).

### Các bước cài đặt chi tiết:

1. **Clone repository về máy tính:**
   ```bash
   git clone https://github.com/<your-username>/cineboard-studio-ai.git
   cd cineboard-studio-ai
   ```

2. **Cài đặt các gói phụ thuộc (Dependencies):**
   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường (`.env`):**
   Tạo tệp `.env` ở thư mục gốc (hoặc sao chép từ `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Mở tệp `.env` và điền khóa API của bạn:
   ```env
   # Khóa API Gemini từ Google AI Studio
   GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere..."

   # Cổng máy chủ (mặc định 3000)
   PORT=3000
   ```

4. **Khởi chạy máy chủ phát triển (Development Mode):**
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:3000`

5. **Build cho môi trường Production:**
   ```bash
   npm run build
   npm start
   ```

---

## 📡 Tài liệu API Backend (API Endpoints)

Máy chủ Express (`server.ts`) cung cấp 3 endpoint cốt lõi:

### 1. `POST /api/breakdown-script`
Phân tích đoạn kịch bản thành danh sách shot phân cảnh.
- **Request Body:**
  ```json
  {
    "scriptText": "EXT. NEO-KOWLOON MEGATOWER - NIGHT\nRain lashes...",
    "targetShotCount": 6,
    "modelPreference": "gemini-3.8-flash",
    "visualStyle": "Cinematic Film Still (35mm Anamorphic)"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "title": "THE CHROMIUM VAULT",
      "logline": "...",
      "genre": "Cyberpunk Sci-Fi",
      "recommendedAspectRatio": "16:9",
      "characters": [{ "name": "KIRA", "visualDescription": "..." }],
      "shots": [{ "shotNumber": 1, "shotType": "WIDE SHOT", "action": "...", "visualPrompt": "..." }]
    }
  }
  ```

### 2. `POST /api/generate-shot-image`
Tạo ảnh chất lượng cao cho một khung hình.
- **Request Body:**
  ```json
  {
    "prompt": "Cinematic close-up of Kira in rain...",
    "stylePreset": "Cinematic Film Still (35mm Anamorphic)",
    "aspectRatio": "16:9",
    "imageSize": "4K",
    "modelPreference": "gemini-3-pro-image-preview",
    "characterConsistencyNotes": "KIRA: matte-black cloak..."
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "imageUrl": "data:image/png;base64,...",
    "modelUsed": "gemini-3-pro-image-preview",
    "aspectRatio": "16:9",
    "imageSize": "4K"
  }
  ```

### 3. `POST /api/chat`
Hội thoại đa lượt với trợ lý đạo diễn.
- **Request Body:**
  ```json
  {
    "messages": [{ "role": "user", "text": "Gợi ý cho tôi góc máy bổ sung cho cảnh này" }],
    "modelPreference": "gemini-3.8-flash",
    "role": "director",
    "currentSceneContext": { "projectTitle": "...", "activeShotNumber": 2 }
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "reply": "Đối với cảnh cao trào này, bạn nên bổ sung một cú Extreme Close-Up vào đôi mắt của Kira...",
    "modelUsed": "gemini-3.8-flash"
  }
  ```

---

## 📤 Hướng dẫn đẩy lên GitHub (Push to GitHub)

Để đẩy toàn bộ mã nguồn lên GitHub của bạn, hãy mở terminal tại thư mục dự án và thực hiện tuần tự các lệnh sau:

```bash
# 1. Khởi tạo kho chứa Git (nếu chưa có)
git init

# 2. Đổi nhánh chính thành main
git branch -M main

# 3. Thêm toàn bộ tệp vào danh sách chuẩn bị commit
git add .

# 4. Tạo commit đầu tiên
git commit -m "feat: initial commit of CineBoard Studio AI platform"

# 5. Liên kết với kho chứa trên GitHub của bạn
# (Thay đường dẫn bằng link repository bạn tạo trên GitHub)
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 6. Đẩy mã nguồn lên GitHub
git push -u origin main
```

> ⚠️ **Lưu ý quan trọng**: Tệp `.env` chứa `GEMINI_API_KEY` đã được khai báo trong `.gitignore` để tránh rò rỉ khóa bí mật lên GitHub. Luôn giữ bí mật khóa API của bạn!

---

## 📜 Bản quyền & Giấy phép (License)

Dự án này được phát hành dưới giấy phép [Apache-2.0 License](https://opensource.org/licenses/Apache-2.0).
Bạn có thể tự do sao chép, chỉnh sửa, tích hợp vào các dự án thương mại hoặc cá nhân.

---

*Được phát triển với tinh thần sáng tạo điện ảnh kết hợp cùng công nghệ trí tuệ nhân tạo Gemini thế hệ mới.*
