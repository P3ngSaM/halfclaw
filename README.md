# halfclaw — 另一半

> 春节情绪陪伴 AI 宣传页 & 预约系统

## 功能

- 春节主题宣传落地页（独处模式 / 团聚模式）
- 5 种微信对话场景轮播展示（关心问候、一人公司、银发经济、童年陪伴、赛博妲己）
- 语音试听库（7 种人声风格，接入最先进的 TTS 模型）
- 声音克隆功能介绍
- 在线预约系统（排名、分享邀请、后端记录）
- 深色 / 浅色主题切换
- 响应式设计

## 启动

```bash
npm install
npm run dev
```

## 环境变量（`.env.local`）

```env
DASHSCOPE_API_KEY=你的Key
DASHSCOPE_TTS_MODEL=qwen3-tts-flash
DASHSCOPE_TTS_ENDPOINT=https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation
```

> 改完 `.env.local` 需要重启 `npm run dev`

## 构建

```bash
npm run build
npm run preview
```

## 技术栈

- React + Vite
- TTS 语音合成（DashScope API）
- 文件系统预约后端（Vite 中间件 + JSON 存储）
