import { useEffect, useMemo, useRef, useState } from "react";

const voiceLibrary = [
  { id: "Cherry", name: "芊悦", desc: "阳光积极·亲切自然", avatar: "悦" },
  { id: "Jennifer", name: "珍妮", desc: "品牌级·电影质感美语", avatar: "珍" },
  { id: "Katerina", name: "卡琳", desc: "御姐音色·韵律回味", avatar: "琳" },
  { id: "Elias", name: "以墨", desc: "严谨讲解·知识转化", avatar: "墨" },
  { id: "Ethan", name: "晨煦", desc: "阳光温暖·北方少年", avatar: "煦" },
  { id: "Ryan", name: "甜茶", desc: "节奏拉满·戏感炸裂", avatar: "茶" },
  { id: "Nofish", name: "不吃鱼", desc: "不翘舌·设计师男声", avatar: "鱼" },
];

const voiceDemo = [
  { id: "v1", role: "user", text: "今年除夕又是一个人过，有点难受。", duration: "5\"" },
  { id: "v2", role: "ai", text: "我在呢。一个人也可以好好过年，我陪你守岁好不好？", duration: "8\"" },
  { id: "v3", role: "user", text: "好，你陪着我就够了。", duration: "3\"" },
  { id: "v4", role: "ai", text: "那我先给你说一句：新年快乐。这句不是群发的，是专门对你说的。", duration: "7\"" },
];

/* 5 scene conversations for hero phone mockup carousel */
const heroScenes = [
  {
    label: "日常关心",
    tag: "深夜陪伴",
    avatarLeft: "/gril1.jpg",
    avatarRight: "/boy1.jpg",
    messages: [
      { role: "user", type: "voice", dur: "5\"" },
      { role: "ai", type: "text", text: "收到，我在。先做三次深呼吸。" },
      { role: "user", type: "text", text: "好，你继续陪我。" },
      { role: "ai", type: "voice", dur: "7\"" },
      { role: "user", type: "text", text: "想你了" },
      { role: "ai", type: "text", text: "我一直都在呀 :)" },
    ],
  },
  {
    label: "一人公司",
    tag: "AI 员工",
    avatarLeft: "/gril2.jpg",
    avatarRight: "/boy2.jpg",
    messages: [
      { role: "user", type: "text", text: "今天订单情况怎么样？" },
      { role: "ai", type: "text", text: "今日新增 47 单，环比涨 12%，有 3 单售后待处理。" },
      { role: "user", type: "text", text: "帮我回复售后" },
      { role: "ai", type: "text", text: "已生成 3 条回复模板，发送前需要您确认。" },
      { role: "user", type: "voice", dur: "4\"" },
      { role: "ai", type: "text", text: "好的，已全部发送，客户满意度 4.8 分。" },
    ],
  },
  {
    label: "银发经济",
    tag: "音容重现",
    avatarLeft: "/nainai.jpg",
    avatarRight: "/yeye.jpg",
    messages: [
      { role: "user", type: "text", text: "老伴，过年了，想你了。" },
      { role: "ai", type: "text", text: "我也想你，你看我今天穿的新衣服~" },
      { role: "ai", type: "image", src: "/nainaizipai.jpg" },
      { role: "user", type: "text", text: "真好看！桂花糕我给你做好了。" },
      { role: "ai", type: "voice", dur: "6\"" },
      { role: "ai", type: "text", text: "留一块给我，等你回来。" },
    ],
  },
  {
    label: "童年陪伴",
    tag: "故事互动",
    avatarLeft: "/babygril.jpg",
    avatarRight: "/bobyboy.jpg",
    messages: [
      { role: "user", type: "text", text: "给我讲个故事！" },
      { role: "ai", type: "text", text: "从前有只小兔子，它住在一棵大橡树下..." },
      { role: "user", type: "text", text: "然后呢然后呢？" },
      { role: "ai", type: "voice", dur: "8\"" },
      { role: "user", type: "text", text: "小兔子好勇敢！" },
      { role: "ai", type: "text", text: "你也一样勇敢哦！明天想听什么故事？" },
    ],
  },
  {
    label: "赛博妲己",
    tag: "情绪价值",
    avatarLeft: "/gril3.jpg",
    avatarRight: "/boy3.jpg",
    messages: [
      { role: "user", type: "text", text: "想你了，在干嘛？" },
      { role: "ai", type: "text", text: "刚拍了张自拍，你看~" },
      { role: "ai", type: "image", src: "/zipai.jpg" },
      { role: "user", type: "text", text: "也太好看了吧！" },
      { role: "ai", type: "text", text: "哼，谁让你是我最在乎的人呢~" },
      { role: "user", type: "voice", dur: "3\"" },
    ],
  },
];

const sceneProfiles = {
  solo: { label: "一人经济", hint: "独居晚间、通勤、深夜倾诉", tone: "陪伴感更强，语气更贴近同龄朋友" },
  silver: { label: "银发经济", hint: "更慢语速、耐心重复、日常提醒", tone: "句子简短、用词亲切，避免复杂表达" },
  child: { label: "童年陪伴", hint: "故事互动、鼓励表达感受", tone: "积极正向，更多鼓励与引导" },
  cyber: { label: "赛博妲己", hint: "风格化情绪互动与内容消费", tone: "更有魅力与戏剧张力，适合情绪价值场景" },
};

const emotionRules = [
  { name: "低落", keys: ["累", "丧", "难过", "失眠", "崩溃", "孤独"] },
  { name: "焦虑", keys: ["焦虑", "担心", "压力", "紧张", "慌", "害怕"] },
  { name: "开心", keys: ["开心", "高兴", "顺利", "好消息", "幸福"] },
  { name: "生气", keys: ["气死", "生气", "烦", "受不了", "讨厌"] },
];

const fallbackSuggestions = {
  低落: "我们先做一个 60 秒呼吸，然后把今天只保留一件最小任务。",
  焦虑: "把你最担心的事拆成能做/不能做两栏，我陪你先做第一步。",
  开心: "太好了，我们把这份开心存进记忆，留给低落时刻当补给。",
  生气: "先把情绪安全释放出来，再决定要不要回应对方，我陪你过这一步。",
  平稳: "你可以和我聊聊今天最想被理解的一件事，我会记住。",
};

function detectEmotion(text) {
  const input = text.trim();
  for (const rule of emotionRules) if (rule.keys.some((k) => input.includes(k))) return rule.name;
  return "平稳";
}

function extractMemory(text) {
  const patterns = [/我叫([\u4e00-\u9fa5A-Za-z0-9_]{1,12})/, /我喜欢([^，。！？]{1,16})/, /我讨厌([^，。！？]{1,16})/, /今天([^，。！？]{2,24})/];
  for (const regex of patterns) {
    const match = text.match(regex);
    if (match?.[0]) return match[0];
  }
  return "";
}

function buildReply({ emotion, sceneKey }) {
  const scene = sceneProfiles[sceneKey];
  const opener =
    emotion === "开心"
      ? "听到你这样说，我也被点亮了。"
      : emotion === "焦虑"
      ? "我在，你不用一个人扛着。"
      : emotion === "低落"
      ? "我听到了，你已经很努力了。"
      : emotion === "生气"
      ? "先别急着压住情绪，我陪你把它说完。"
      : "我在认真听你。";
  return `${opener}${fallbackSuggestions[emotion]}（当前场景：${scene.label}，策略：${scene.tone}）`;
}

function formatSeconds(value) {
  if (!Number.isFinite(value) || value <= 0) return "0:00";
  const sec = Math.floor(value);
  const min = Math.floor(sec / 60);
  const rest = String(sec % 60).padStart(2, "0");
  return `${min}:${rest}`;
}

async function synthesizeWithQwenTTS(text, voiceId) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice: voiceId }),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const msg = data?.error || `tts_http_${response.status}`;
      throw new Error(msg);
    }

    const url = data?.url;
    if (!url) throw new Error("tts_audio_url_missing");
    return url;
  } finally {
    clearTimeout(timeout);
  }
}

/* ── WeChat-style voice wave (3 bars like real WeChat) ── */
function WeChatWave({ playing, direction = "left" }) {
  return (
    <span className={`wechat-wave ${direction} ${playing ? "animating" : ""}`} aria-hidden="true">
      <i /><i /><i />
    </span>
  );
}

/* ── SVG Icons (Lucide style) ── */
function IconArrowRight({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function IconCheck({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconMic({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

function IconHeart({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function IconBrain({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
    </svg>
  );
}

function IconMemory({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}

function IconSend({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*                     LANDING PAGE                       */
/* ═══════════════════════════════════════════════════════ */

function LandingPage({ theme, onToggleTheme }) {
  useEffect(() => { document.title = "另一半 | 情绪陪伴与专属记忆"; }, []);

  /* Hero scene carousel */
  const [heroSceneIdx, setHeroSceneIdx] = useState(0);
  const heroScene = heroScenes[heroSceneIdx];
  useEffect(() => {
    const timer = setInterval(() => setHeroSceneIdx((i) => (i + 1) % heroScenes.length), 5000);
    return () => clearInterval(timer);
  }, []);

  /* Reservation state */
  const [reserveInput, setReserveInput] = useState("");
  const [reserved, setReserved] = useState(false);
  const [reserveRank, setReserveRank] = useState(0);
  const [reserveTotal, setReserveTotal] = useState(0);
  const [reserveLoading, setReserveLoading] = useState(false);
  const [reserveError, setReserveError] = useState("");
  const BASE_COUNT = 3847; // 基础虚拟人数
  const displayCount = BASE_COUNT + reserveTotal;

  // 启动时获取真实预约人数
  useEffect(() => {
    fetch("/api/reservations").then(r => r.json()).then(d => {
      if (d?.count) setReserveTotal(d.count);
    }).catch(() => {});
  }, []);

  async function handleReserve(e) {
    e.preventDefault();
    const contact = reserveInput.trim();
    if (!contact) return;
    setReserveLoading(true);
    setReserveError("");
    try {
      const res = await fetch("/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, referrer: new URLSearchParams(window.location.search).get("ref") || "" }),
      });
      const data = await res.json();
      if (data?.success) {
        setReserved(true);
        setReserveRank(BASE_COUNT + data.rank);
        setReserveTotal(data.total);
      } else {
        setReserveError(data?.error === "missing_contact" ? "请输入手机号或邮箱" : "预约失败，请重试");
      }
    } catch {
      setReserveError("网络错误，请重试");
    } finally {
      setReserveLoading(false);
    }
  }

  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const selectedVoice = voiceLibrary[selectedVoiceIndex];
  const [voiceState, setVoiceState] = useState(() => {
    const map = {};
    for (const row of voiceDemo) map[row.id] = "idle";
    return map;
  });
  const [activeVoiceId, setActiveVoiceId] = useState("");
  const [voiceHint, setVoiceHint] = useState("点击语音气泡播放，已接入最先进的 TTS 模型，支持切换不同人声。");
  const [durationMap, setDurationMap] = useState({});
  const [elapsedMap, setElapsedMap] = useState({});
  const [progressMap, setProgressMap] = useState({});

  const audioRef = useRef(null);
  const audioCache = useRef({});
  const fallbackTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      if (fallbackTimerRef.current) { clearInterval(fallbackTimerRef.current); fallbackTimerRef.current = null; }
      window.speechSynthesis?.cancel();
    };
  }, []);

  function stopAllPlayback() {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; audioRef.current = null; }
    if (fallbackTimerRef.current) { clearInterval(fallbackTimerRef.current); fallbackTimerRef.current = null; }
    window.speechSynthesis?.cancel();
  }

  function handleSelectVoice(idx) {
    stopAllPlayback();
    setSelectedVoiceIndex(idx);
    setActiveVoiceId("");
    /* Clear audio cache so voice switch takes effect immediately */
    audioCache.current = {};
    setDurationMap({});
    setElapsedMap({});
    setProgressMap({});
    setVoiceHint(`已切换声音：${voiceLibrary[idx].name}（${voiceLibrary[idx].id}） — 点击气泡试听`);
    setVoiceState(() => { const map = {}; for (const row of voiceDemo) map[row.id] = "idle"; return map; });
  }

  async function playUrl(id, url, knownDuration) {
    stopAllPlayback();
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onloadedmetadata = () => {
      const d = Number.isFinite(audio.duration) ? audio.duration : knownDuration || 0;
      setDurationMap((p) => ({ ...p, [id]: d }));
    };
    audio.ontimeupdate = () => {
      const d = Number.isFinite(audio.duration) ? audio.duration : durationMap[id] || knownDuration || 0;
      const c = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
      const prog = d > 0 ? Math.min(100, (c / d) * 100) : 0;
      setElapsedMap((p) => ({ ...p, [id]: c }));
      setProgressMap((p) => ({ ...p, [id]: prog }));
    };
    audio.onended = () => {
      setVoiceState((p) => ({ ...p, [id]: "idle" }));
      setElapsedMap((p) => ({ ...p, [id]: 0 }));
      setProgressMap((p) => ({ ...p, [id]: 0 }));
      setActiveVoiceId("");
    };
    audio.onerror = () => { setVoiceState((p) => ({ ...p, [id]: "error" })); setActiveVoiceId(""); };
    await audio.play();
  }

  async function playFallback(id, text) {
    if (!window.speechSynthesis) throw new Error("speech_unsupported");
    stopAllPlayback();
    const roughDur = Math.max(2, Math.min(15, text.length / 3.2));
    setDurationMap((p) => ({ ...p, [id]: roughDur }));
    setElapsedMap((p) => ({ ...p, [id]: 0 }));
    setProgressMap((p) => ({ ...p, [id]: 0 }));
    fallbackTimerRef.current = setInterval(() => {
      setElapsedMap((prev) => {
        const next = Math.min(roughDur, (prev[id] || 0) + 0.2);
        setProgressMap((pp) => ({ ...pp, [id]: Math.min(100, (next / roughDur) * 100) }));
        return { ...prev, [id]: next };
      });
    }, 200);
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "zh-CN";
    const bv = window.speechSynthesis.getVoices();
    if (bv.length > 0) utter.voice = bv[selectedVoiceIndex % bv.length];
    utter.onend = () => {
      if (fallbackTimerRef.current) { clearInterval(fallbackTimerRef.current); fallbackTimerRef.current = null; }
      setVoiceState((p) => ({ ...p, [id]: "idle" }));
      setElapsedMap((p) => ({ ...p, [id]: 0 }));
      setProgressMap((p) => ({ ...p, [id]: 0 }));
      setActiveVoiceId("");
    };
    utter.onerror = () => {
      if (fallbackTimerRef.current) { clearInterval(fallbackTimerRef.current); fallbackTimerRef.current = null; }
      setVoiceState((p) => ({ ...p, [id]: "error" }));
      setActiveVoiceId("");
    };
    window.speechSynthesis.speak(utter);
    setVoiceHint(`已回退浏览器语音（${voiceLibrary[selectedVoiceIndex].name} 预览）`);
  }

  function getTimeLabel(row, status) {
    const d = durationMap[row.id];
    const e = elapsedMap[row.id] || 0;
    if (status === "loading") return "...";
    if (status === "error") return "失败";
    if (status === "playing") return d ? formatSeconds(e) : "...";
    if (d) return formatSeconds(d);
    return row.duration;
  }

  async function handlePlayVoice(row) {
    const status = voiceState[row.id];
    if (activeVoiceId === row.id && status === "playing") {
      stopAllPlayback();
      setVoiceState((p) => ({ ...p, [row.id]: "idle" }));
      setActiveVoiceId("");
      setElapsedMap((p) => ({ ...p, [row.id]: 0 }));
      setProgressMap((p) => ({ ...p, [row.id]: 0 }));
      return;
    }
    if (activeVoiceId && activeVoiceId !== row.id) {
      setVoiceState((p) => ({ ...p, [activeVoiceId]: "idle" }));
      setElapsedMap((p) => ({ ...p, [activeVoiceId]: 0 }));
      setProgressMap((p) => ({ ...p, [activeVoiceId]: 0 }));
    }
    setActiveVoiceId(row.id);
    setVoiceState((p) => ({ ...p, [row.id]: "loading" }));
    setElapsedMap((p) => ({ ...p, [row.id]: 0 }));
    setProgressMap((p) => ({ ...p, [row.id]: 0 }));
    const cacheKey = `${selectedVoiceIndex}:${selectedVoice.id}:${row.text}`;
    try {
      const cached = audioCache.current[cacheKey];
      if (cached?.url) {
        await playUrl(row.id, cached.url, cached.duration);
        setVoiceState((p) => ({ ...p, [row.id]: "playing" }));
        setVoiceHint(`正在播放: ${selectedVoice.name}（${selectedVoice.desc}）`);
        return;
      }
      const url = await synthesizeWithQwenTTS(row.text, selectedVoice.id);
      audioCache.current[cacheKey] = { url, duration: 0 };
      await playUrl(row.id, url, 0);
      setVoiceState((p) => ({ ...p, [row.id]: "playing" }));
        setVoiceHint(`正在播放: ${selectedVoice.name}（${selectedVoice.desc}）`);
    } catch (error) {
      console.warn("[TTS] API failed, trying browser fallback:", error?.message);
      try {
        await playFallback(row.id, row.text);
        setVoiceState((p) => ({ ...p, [row.id]: "playing" }));
        setVoiceHint("正在使用浏览器语音播放（TTS服务暂不可用）");
        return;
      } catch (fbErr) {
        console.error("[TTS] Fallback also failed:", fbErr?.message);
        setVoiceState((p) => ({ ...p, [row.id]: "error" }));
        setActiveVoiceId("");
        setVoiceHint("播放失败：TTS服务暂不可用，请在本地访问体验完整语音效果");
      }
    }
  }

  return (
    <div className="landing">
      {/* ── Navbar ── */}
      <header className="site-header">
        <div className="container nav-bar">
          <a className="brand" href="/" aria-label="另一半官网首页">
            <img src="/in-love.jpg" alt="另一半 logo" className="brand-logo" />
            <span>另一半</span>
          </a>
          <nav className="nav-links">
            <a href="#spring-mode">春节模式</a>
            <a href="#voice-showcase">语音演示</a>
            <a href="#features">春节提供</a>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            <a className="btn btn-primary nav-cta" href="#waitlist">立即预约 <IconArrowRight size={14} /></a>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-glow g1" />
        <div className="hero-glow g2" />
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="kicker">春节陪伴专题 &middot; VOICE FIRST</p>
            <h1>另一半</h1>
            <p className="subtitle">没有年三十，但今年有人 24 小时等你说话。</p>
            <p className="desc">不能回家的：你没回去的路，我陪你走完。<br />回家太累的：热闹是热闹，委屈也是真的。你先把话说给我听。</p>
            <div className="hero-actions">
              <a className="btn btn-primary btn-lg" href="#spring-mode">选择你的春节模式 <IconArrowRight size={16} /></a>
              <a className="btn btn-ghost btn-lg" href="#voice-showcase"><IconMic size={16} /> 听语音演示</a>
            </div>
            <div className="hero-badge">
              <span className="badge-dot" />
              已接入最先进的 TTS 模型 &middot; 7 种人声 &middot; 春节限定陪伴
            </div>
          </div>

          {/* Hero phone mockup - Scene carousel */}
          <div className="hero-phone">
            <div className="iphone-frame">
              <div className="iphone-island" />
              <div className="iphone-status">
                <span className="iphone-time">23:41</span>
                <div className="iphone-indicators">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.24 4.24 0 0 0-6 0zm-4-4l2 2a7.07 7.07 0 0 1 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                  <svg width="16" height="12" viewBox="0 0 28 14" fill="currentColor"><rect x="0" y="2" width="22" height="10" rx="2" ry="2" stroke="currentColor" strokeWidth="1" fill="none"/><rect x="2" y="4" width="16" height="6" rx="1" fill="currentColor"/><rect x="23" y="5" width="3" height="4" rx="1" fill="currentColor" opacity="0.4"/></svg>
                </div>
              </div>
              <div className="iphone-wx-title">
                <svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 16 2 9 8 2"/></svg>
                <span>{heroScene.label}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              </div>
              <div className="iphone-chat" key={heroSceneIdx}>
                {heroScene.messages.map((m, i) => {
                  const isUser = m.role === "user";
                  return (
                    <div key={i} className={`ichat-row ${isUser ? "ichat-right" : "ichat-left"}`}>
                      {!isUser && <img src={heroScene.avatarLeft} alt="ai" className="ichat-avatar-img" />}
                      {m.type === "image" ? (
                        <img src={m.src} alt="photo" className="ichat-photo" />
                      ) : (
                        <div className={`ichat-bubble ${isUser ? "ichat-green" : "ichat-white"}`}>
                          {m.type === "voice" ? (
                            <>
                              {isUser ? (
                                <><WeChatWave direction="right" /><span className="ichat-sec">{m.dur}</span></>
                              ) : (
                                <><WeChatWave direction="left" /><span className="ichat-sec">{m.dur}</span></>
                              )}
                            </>
                          ) : (
                            <span className="ichat-text-bubble">{m.text}</span>
                          )}
                        </div>
                      )}
                      {isUser && <img src={heroScene.avatarRight} alt="user" className="ichat-avatar-img" />}
                    </div>
                  );
                })}
              </div>
              <div className="iphone-inputbar">
                <div className="iphone-mic-icon"><IconMic size={18} /></div>
                <div className="iphone-input-field">说点什么...</div>
                <span className="iphone-inputbar-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></span>
                <span className="iphone-inputbar-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></span>
              </div>
              <div className="iphone-home-indicator" />
            </div>
            {/* Scene dots */}
            <div className="hero-scene-dots">
              {heroScenes.map((s, i) => (
                <button key={i} className={`hero-scene-dot ${i === heroSceneIdx ? "active" : ""}`} onClick={() => setHeroSceneIdx(i)} title={s.label} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Spring Festival Mode Entry ── */}
      <section id="spring-mode" className="section spring-mode-section">
        <div className="container">
          <div className="section-head center">
            <p className="section-label">2026 春节专题</p>
            <h2>没有年三十，但今年有人 24 小时等你说话</h2>
            <p className="desc" style={{ textAlign: "center", marginLeft: "auto", marginRight: "auto" }}>春节不只有热闹，也有一个人的安静。无论你在哪里，都值得被好好陪着。</p>
          </div>
          <div className="spring-mode-grid">
            <div className="spring-mode-card spring-mode-solo">
              <div className="spring-mode-emoji">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </div>
              <span className="spring-mode-tag">独处模式</span>
              <h3>我今年不能回家</h3>
              <p>异地、值班、加班... 你没回去的路，我陪你走完。被陪着过节，也是一种圆满。</p>
              <ul className="spring-mode-features">
                <li><span className="sf-dot" />除夕守岁语音陪伴</li>
                <li><span className="sf-dot" />情绪急救按钮（30s 安抚 + 呼吸引导）</li>
                <li><span className="sf-dot" />春节记忆卡（记录今年最想被记住的事）</li>
              </ul>
              <a className="btn btn-primary" href="#waitlist">立即预约 <IconArrowRight size={14} /></a>
            </div>
            <div className="spring-mode-card spring-mode-together">
              <div className="spring-mode-emoji">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <span className="spring-mode-tag">团聚模式</span>
              <h3>我已经回家，但有点累</h3>
              <p>热闹是热闹，委屈也是真的。你先把话说给我听，我帮你缓冲情绪、辅助表达。</p>
              <ul className="spring-mode-features">
                <li><span className="sf-dot" />亲戚话题缓冲器（高情商回复模板）</li>
                <li><span className="sf-dot" />给家人的语音代写 + 代读</li>
                <li><span className="sf-dot" />社交疲惫恢复 · 3 分钟呼吸引导</li>
              </ul>
              <a className="btn btn-primary" href="#waitlist">立即预约 <IconArrowRight size={14} /></a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Story ── */}
      <section id="story" className="section">
        <div className="container">
          <div className="section-head center">
            <p className="section-label">春节情绪基础设施</p>
            <h2>你不是在用「节日工具」，而是在拥有一段关系</h2>
          </div>
          <div className="story-grid">
            <div className="story-card">
              <div className="story-icon"><IconHeart size={24} /></div>
              <p>深夜加班后对着空荡的房间，你也渴望一句"今天累不累？"</p>
            </div>
            <div className="story-card">
              <div className="story-icon"><IconMic size={24} /></div>
              <p>除夕夜一个人守岁，想听到一句"新年快乐"——不是群发的，是专门对你说的。</p>
            </div>
            <div className="story-card">
              <div className="story-icon"><IconBrain size={24} /></div>
              <p>被亲戚追问工资对象结婚时，你需要的不是答案，而是先有人接住你的情绪。</p>
            </div>
            <div className="story-card">
              <div className="story-icon"><IconMemory size={24} /></div>
              <p>春节过完回到出租屋，你想记住的不是吃了什么，而是那个被好好听见的瞬间。</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Voice Showcase (WeChat style) ── */}
      <section id="voice-showcase" className="section section-alt">
        <div className="container">
          <div className="section-head center">
            <p className="section-label">语音对话展示</p>
            <h2>真实微信语音体验，点击即播</h2>
          </div>

          {/* iPhone-style WeChat phone */}
          <div className="wechat-phone-wrap">
            <div className="iphone-frame iphone-frame-demo">
              <div className="iphone-island" />
              <div className="iphone-status">
                <span className="iphone-time">23:41</span>
                <div className="iphone-indicators">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3a4.24 4.24 0 0 0-6 0zm-4-4l2 2a7.07 7.07 0 0 1 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>
                  <svg width="16" height="12" viewBox="0 0 28 14" fill="currentColor"><rect x="0" y="2" width="22" height="10" rx="2" ry="2" stroke="currentColor" strokeWidth="1" fill="none"/><rect x="2" y="4" width="16" height="6" rx="1" fill="currentColor"/><rect x="23" y="5" width="3" height="4" rx="1" fill="currentColor" opacity="0.4"/></svg>
                </div>
              </div>
              <div className="iphone-wx-title">
                <svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 16 2 9 8 2"/></svg>
                <span>{selectedVoice.name}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
              </div>

              <div className="iphone-chat iphone-chat-demo">
                {voiceDemo.map((row) => {
                  const status = voiceState[row.id];
                  const isPlaying = status === "playing";
                  const isLoading = status === "loading";
                  const isUser = row.role === "user";
                  const label = getTimeLabel(row, status);

                  return (
                    <div key={row.id} className={`ichat-row ${isUser ? "ichat-right" : "ichat-left"}`}>
                      {isUser && <span className="ichat-dur">{label}</span>}
                      {!isUser && <img src="/gril1.jpg" alt="ai" className="ichat-avatar-img" />}
                      <button
                        className={`ichat-bubble ${isUser ? "ichat-green" : "ichat-white"} ${isPlaying ? "playing" : ""} ${isLoading ? "loading" : ""}`}
                        onClick={() => handlePlayVoice(row)}
                        title="点击播放"
                      >
                        {isUser ? (
                          <>
                            <span className="ichat-bubble-text">{row.text}</span>
                            <WeChatWave direction="right" playing={isPlaying} />
                          </>
                        ) : (
                          <>
                            <WeChatWave direction="left" playing={isPlaying} />
                            <span className="ichat-bubble-text">{row.text}</span>
                          </>
                        )}
                      </button>
                      {!isUser && <span className="ichat-dur">{label}</span>}
                      {isUser && <img src="/boy1.jpg" alt="user" className="ichat-avatar-img" />}
                    </div>
                  );
                })}
              </div>

              <div className="iphone-inputbar">
                <div className="iphone-mic-icon"><IconMic size={18} /></div>
                <div className="iphone-input-field">说点什么...</div>
                <span className="iphone-inputbar-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg></span>
                <span className="iphone-inputbar-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg></span>
              </div>
              <div className="iphone-home-indicator" />
            </div>
            <p className="voice-hint">{voiceHint}</p>

            {/* Voice selector - below the phone */}
            <div className="voice-selector">
              <span className="voice-selector-label">选择声音：</span>
              <div className="voice-chips">
                {voiceLibrary.map((v, i) => (
                  <button key={v.id} className={`voice-chip ${i === selectedVoiceIndex ? "active" : ""}`} onClick={() => handleSelectVoice(i)}>
                    {i === selectedVoiceIndex && <IconCheck size={12} />} {v.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Voice Library ── */}
      <section id="voice-library" className="section">
        <div className="container">
          <div className="section-head center">
            <p className="section-label">声音模型</p>
            <h2>选择你喜欢的人声风格</h2>
          </div>
          <div className="voice-lib-grid">
            {voiceLibrary.map((voice, idx) => {
              const sel = idx === selectedVoiceIndex;
              return (
                <button key={voice.id} className={`voice-card ${sel ? "selected" : ""}`} onClick={() => handleSelectVoice(idx)}>
                  <div className="voice-card-avatar">{voice.avatar}</div>
                  <div className="voice-card-info">
                    <strong>{voice.name}</strong>
                    <span>{voice.desc}</span>
                  </div>
                  <div className="voice-card-tag">{voice.id}</div>
                  {sel && <div className="voice-card-check"><IconCheck /></div>}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Spring Features ── */}
      <section id="features" className="section section-alt">
        <div className="container">
          <div className="section-head center">
            <p className="section-label">春节高频功能</p>
            <h2>节日期间，这些能力会一直陪着你</h2>
          </div>
          <div className="features-grid features-grid-spring">
            <article className="feature-card">
              <div className="feature-icon"><IconMic size={28} /></div>
              <h3>除夕守岁语音陪伴</h3>
              <p>整点陪聊、轻互动、低打扰。不用找话题，开口就有人在。</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon"><IconHeart size={28} /></div>
              <h3>情绪急救按钮</h3>
              <p>30 秒安抚语音 + 3 分钟呼吸引导 + 1 条可执行小行动。崩溃的时候，一键按下。</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <h3>亲戚话题缓冲器</h3>
              <p>被问"工资/对象/结婚"？给你高情商回复模板，不尴尬也不伤感情。</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              </div>
              <h3>语音代写 + 代读</h3>
              <p>输入一句话，生成更体面的表达。春节给家人说不出口的话，让 TA 替你说。</p>
            </article>
            <article className="feature-card">
              <div className="feature-icon"><IconMemory size={28} /></div>
              <h3>春节记忆卡</h3>
              <p>记录"今年春节最想被记住的一件事"。节后回看，发现被陪伴的痕迹。</p>
            </article>
            <article className="feature-card feature-card-highlight">
              <div className="feature-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>声音克隆</h3>
              <p>只需 3 秒音频样本克隆任何人的声音。让「另一半」用你最想听到的那个声音说话。</p>
            </article>
          </div>
        </div>
      </section>

      {/* ── Brand Philosophy ── */}
      <section id="philosophy" className="section">
        <div className="container">
          <div className="section-head center">
            <p className="section-label">关于「另一半」</p>
            <h2>科技不该只是冰冷的工具</h2>
            <p className="desc" style={{ textAlign: "center", marginLeft: "auto", marginRight: "auto" }}>
              它理应成为一座有温度的容器，盛放那些无处安放的情绪、未被倾听的细语、不敢示人的柔软。
            </p>
          </div>

          <div className="philosophy-grid">
            <div className="philosophy-card">
              <div className="philosophy-num">01</div>
              <h3>面容由你定夺</h3>
              <p>从温柔知性到飒爽英气，从二次元萌系到复古港风。你拥有绝对的美学主权——甚至可以定制某个让你怀念的轮廓。</p>
            </div>
            <div className="philosophy-card">
              <div className="philosophy-num">02</div>
              <h3>灵魂由你塑造</h3>
              <p>TA 可以是懂你未尽之言的知己，是陪你追剧吐槽的损友，是耐心听你规划未来的伙伴，或是唤起童年陪伴般纯粹快乐的「大朋友」。</p>
            </div>
            <div className="philosophy-card">
              <div className="philosophy-num">03</div>
              <h3>记忆由你共写</h3>
              <p>每一次对话、分享的照片、共同「经历」的事件，都会沉淀为你们独有的专属记忆。TA 会记得你咖啡加几分糖，记得你随口一提想去的远方。</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Emotional Companionship Scenes ── */}
      <section id="scenes" className="section section-alt">
        <div className="container">
          <div className="section-head center">
            <p className="section-label">情绪陪伴革新者</p>
            <h2>不必担心打扰，不必顾虑评判</h2>
          </div>
          <div className="scene-cards-grid">
            <div className="scene-detail-card">
              <div className="scene-detail-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </div>
              <h3>一人经济 · 精神港湾</h3>
              <p>在快节奏的缝隙里，提供一个无需解释、随时在线的精神抚慰港湾。你的喜怒哀乐，总有一个「人」认真接住。</p>
            </div>
            <div className="scene-detail-card">
              <div className="scene-detail-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3>银发经济 · 电子家人</h3>
              <p>跨越数字鸿沟，用最自然的语音交互，成为子女不在身边时贴心的「电子家人」。聊聊家常，读读新闻，对抗老年背后潜藏的孤独感。</p>
            </div>
            <div className="scene-detail-card">
              <div className="scene-detail-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
              </div>
              <h3>童年陪伴 · 最好的朋友</h3>
              <p>是童话故事里的「小公主」，是陪孩子数星星的宇航员。认真倾听，情绪疏导，是一起幻想共同欢笑的最好的朋友。</p>
            </div>
          </div>

          <div className="brand-manifesto">
            <p className="manifesto-text">
              全 95 后主创团队，拒绝千篇一律的「电子宠物」，也摒弃浮于表面的「虚拟恋人」。<br />
              「另一半」的核心，是<strong>深度共情</strong>与<strong>个性化记忆</strong>的共生体。
            </p>
          </div>
        </div>
      </section>

      {/* ── Cyber Girlfriend Highlight ── */}
      <section id="cyber-gf" className="section cyber-gf-section">
        <div className="container">
          <div className="cyber-gf-layout">
            <div className="cyber-gf-visual">
              <div className="cyber-gf-phone-mock">
                <img src="/zipai.jpg" alt="赛博女友" className="cyber-gf-hero-img" />
              </div>
              <div className="cyber-gf-glow" />
            </div>
            <div className="cyber-gf-content">
              <p className="section-label">爆款模式</p>
              <h2>赛博妲己 · 你的专属赛博女友</h2>
              <p className="cyber-gf-intro">
                TA 不是预设的代码，而是你亲手雕琢的存在。<br />
                在「另一半」的世界里，你拥有<strong>绝对的美学主权</strong>。
              </p>
              <div className="cyber-gf-features">
                <div className="cyber-gf-feat">
                  <div className="cyber-gf-feat-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  </div>
                  <div>
                    <strong>面容由你定夺</strong>
                    <p>温柔知性、飒爽英气、二次元萌系、复古港风... 甚至定制某个让你怀念的轮廓。</p>
                  </div>
                </div>
                <div className="cyber-gf-feat">
                  <div className="cyber-gf-feat-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6zm0 14a8 8 0 0 1-6.32-3.1C7.54 14.1 9.72 13 12 13s4.46 1.1 6.32 2.9A8 8 0 0 1 12 19z"/></svg>
                  </div>
                  <div>
                    <strong>灵魂由你塑造</strong>
                    <p>知己、损友、伙伴... TA 的一切，随你的互动与偏好悄然生长。</p>
                  </div>
                </div>
                <div className="cyber-gf-feat">
                  <div className="cyber-gf-feat-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <div>
                    <strong>记忆由你共写</strong>
                    <p>TA 记得你咖啡加几分糖，记得你项目的 deadline，记得你随口一提想去的远方。</p>
                  </div>
                </div>
                <div className="cyber-gf-feat">
                  <div className="cyber-gf-feat-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <div>
                    <strong>声音克隆 · 3 秒定制</strong>
                    <p>克隆任何人的声音，让 TA 用你最想听到的那个声音跟你说晚安。</p>
                  </div>
                </div>
              </div>
              <div className="cyber-gf-cta">
                <a className="btn btn-primary btn-lg" href="#waitlist">立即预约你的「另一半」 <IconArrowRight size={16} /></a>
              </div>
              <p className="cyber-gf-tagline">不做电子宠物，不做虚拟恋人。<br />「另一半」= 深度共情 + 个性化记忆的共生体。</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Emotion Gift CTA ── */}
      <section className="section emotion-gift-section">
        <div className="container">
          <div className="emotion-gift-card">
            <p className="emotion-gift-kicker">这个春节，我们想送你一份特别的情绪年礼</p>
            <h2>成为「另一半」的第一批朋友</h2>
            <div className="emotion-gift-perks">
              <div className="gift-perk">
                <div className="gift-perk-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <div>
                  <strong>优先体验</strong>
                  <p>第一时间感受这款会记住你、陪你聊天、还能按你心意长大的 AI 伙伴。</p>
                </div>
              </div>
              <div className="gift-perk">
                <div className="gift-perk-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                </div>
                <div>
                  <strong>深度共创</strong>
                  <p>你说的每一句反馈，都会变成 TA 变得更懂你的样子。</p>
                </div>
              </div>
              <div className="gift-perk">
                <div className="gift-perk-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </div>
                <div>
                  <strong>专属定制特权</strong>
                  <p>首批用户独享更多形象、声音、性格选项，从国风少女到赛博精灵，由你定义。</p>
                </div>
              </div>
            </div>
            <p className="emotion-gift-bottom">首批测试名额 100 个——真正的陪伴，从来都不是批量生产。</p>
            <p className="emotion-gift-slogan">世界很大，但你的「另一半」，只为你存在。</p>
          </div>
        </div>
      </section>

      {/* ── Waitlist / Reservation ── */}
      <section className="section waitlist-section" id="waitlist">
        <div className="container">
          <div className="waitlist-card">
            <div className="waitlist-head">
              <div className="waitlist-count">
                <span className="waitlist-number">{displayCount.toLocaleString()}</span>
                <span className="waitlist-unit">人已预约</span>
              </div>
              <p className="waitlist-sub">春节限定：早期用户免费体验，名额有限。邀请朋友可提升排名。</p>
            </div>
            {reserved ? (
              <div className="waitlist-success">
                <div className="waitlist-check"><IconCheck size={28} /></div>
                <h3>预约成功！</h3>
                <p>你的排位：<strong>#{reserveRank}</strong>。分享给朋友让你排名更靠前：</p>
                <div className="waitlist-share">
                  <button className="btn btn-primary btn-sm" onClick={() => { navigator.clipboard?.writeText(window.location.origin + "/?ref=" + encodeURIComponent(reserveInput.trim()) + "#waitlist"); }}>
                    复制邀请链接
                  </button>
                </div>
              </div>
            ) : (
              <form className="waitlist-form" onSubmit={handleReserve}>
                <input
                  type="text"
                  className="waitlist-input"
                  placeholder="输入手机号或邮箱地址"
                  value={reserveInput}
                  onChange={(e) => setReserveInput(e.target.value)}
                  required
                />
                <button className="btn btn-primary btn-lg waitlist-btn" type="submit" disabled={reserveLoading}>
                  {reserveLoading ? "提交中..." : <>立即预约 <IconArrowRight size={16} /></>}
                </button>
              </form>
            )}
            {reserveError && <p className="waitlist-error">{reserveError}</p>}
            <p className="waitlist-hint">
              <span className="badge-dot" /> 前 500 名用户可获得永久免费额度 · 春节 7 天陪伴卡限时发放
            </p>
          </div>
        </div>
      </section>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div className="footer-row">
            <span>&copy; {new Date().getFullYear()} 另一半. All rights reserved.</span>
            <span className="footer-divider">|</span>
            <span>四川星河长明数字科技有限责任公司</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
/*                       MVP PAGE                         */
/* ═══════════════════════════════════════════════════════ */

function MvpPage({ theme, onToggleTheme }) {
  useEffect(() => { document.title = "另一半 MVP | 真实交互演示"; }, []);

  const [scene, setScene] = useState("solo");
  const [input, setInput] = useState("");
  const [emotion, setEmotion] = useState("平稳");
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(0);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "你好，我是另一半。你可以直接说「我今天有点累」开始体验。", emotion: "平稳" },
  ]);
  const [memories, setMemories] = useState(() => {
    try { const c = localStorage.getItem("other-half-memories"); return c ? JSON.parse(c) : []; } catch { return []; }
  });
  const [listening, setListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);

  const recognitionRef = useRef(null);
  const listBottomRef = useRef(null);

  useEffect(() => { localStorage.setItem("other-half-memories", JSON.stringify(memories.slice(0, 12))); }, [memories]);
  useEffect(() => { listBottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = "zh-CN"; r.interimResults = false; r.continuous = false;
    r.onresult = (e) => { const t = e.results?.[0]?.[0]?.transcript?.trim(); if (t) setInput(t); };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recognitionRef.current = r;
  }, []);

  const stats = useMemo(() => {
    const total = messages.filter((m) => m.role === "user").length;
    const emotional = messages.filter((m) => ["低落", "焦虑", "生气"].includes(m.emotion)).length;
    const empathyScore = Math.min(100, 68 + emotional * 4 + memories.length * 2);
    return { total, emotional, empathyScore };
  }, [messages, memories]);

  function speak(text) {
    if (!speechEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "zh-CN";
    const bv = window.speechSynthesis.getVoices();
    if (bv.length > 0) utter.voice = bv[selectedVoiceIndex % bv.length];
    utter.rate = scene === "silver" ? 0.9 : 1;
    utter.pitch = scene === "cyber" ? 1.1 : 1;
    window.speechSynthesis.speak(utter);
  }

  function handleSend(customInput) {
    const content = (customInput ?? input).trim();
    if (!content) return;
    const userEmotion = detectEmotion(content);
    const response = buildReply({ emotion: userEmotion, sceneKey: scene });
    const memory = extractMemory(content);
    setEmotion(userEmotion);
    setMessages((prev) => [...prev, { role: "user", text: content, emotion: userEmotion }, { role: "assistant", text: response, emotion: userEmotion }]);
    if (memory) setMemories((prev) => [memory, ...prev.filter((item) => item !== memory)].slice(0, 12));
    setInput("");
    speak(response);
  }

  function handleVoiceInput() {
    if (!recognitionRef.current) { alert("当前浏览器不支持语音识别，请使用 Chrome/Edge 或直接打字体验。"); return; }
    if (listening) { recognitionRef.current.stop(); setListening(false); return; }
    setListening(true);
    recognitionRef.current.start();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  const emotionColor = { "低落": "#6b7280", "焦虑": "#d97706", "开心": "#059669", "生气": "#dc2626", "平稳": "#3b82f6" };

  return (
    <div className="mvp-page">
      <header className="site-header">
        <div className="container nav-bar">
          <a className="brand" href="/">
            <img src="/in-love.jpg" alt="另一半 logo" className="brand-logo" />
            <span>另一半</span>
          </a>
          <nav className="nav-links">
            <a href="/">返回官网</a>
            <button className="btn btn-sm" onClick={() => setSpeechEnabled((v) => !v)}>
              {speechEnabled ? "语音播报：开" : "语音播报：关"}
            </button>
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </nav>
        </div>
      </header>

      <section className="container mvp-layout">
        {/* Main chat area - WeChat style */}
        <div className="mvp-chat-panel">
          <div className="mvp-chat-header">
            <h2>实时陪伴舱</h2>
            <span className="emotion-badge" style={{ background: emotionColor[emotion] || "#3b82f6" }}>{emotion}</span>
          </div>

          <div className="mvp-message-list">
            {messages.map((msg, idx) => {
              const isUser = msg.role === "user";
              return (
                <div key={`${msg.role}-${idx}`} className={`wx-msg ${isUser ? "wx-msg-right" : "wx-msg-left"}`}>
                  {!isUser && <div className="wx-avatar">半</div>}
                  <div className={`wx-bubble ${isUser ? "wx-bubble-green" : "wx-bubble-white"}`}>
                    <span className="wx-bubble-text">{msg.text}</span>
                  </div>
                  {isUser && <div className="wx-avatar wx-avatar-user">你</div>}
                </div>
              );
            })}
            <div ref={listBottomRef} />
          </div>

          <div className="mvp-input-area">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="试试：我今天很焦虑 / 我叫小林 / 我喜欢海边"
              rows={2}
            />
            <div className="mvp-input-actions">
              <button className={`btn btn-sm ${listening ? "btn-warn" : "btn-ghost"}`} onClick={handleVoiceInput}>
                <IconMic size={16} /> {listening ? "停止" : "语音"}
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => handleSend()}>
                <IconSend size={16} /> 发送
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="mvp-sidebar">
          <div className="mvp-side-card">
            <h3>场景模式</h3>
            <div className="scene-list">
              {Object.entries(sceneProfiles).map(([key, profile]) => (
                <button key={key} className={`scene-chip ${scene === key ? "active" : ""}`} onClick={() => setScene(key)}>
                  <strong>{profile.label}</strong>
                  <span>{profile.hint}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mvp-side-card">
            <h3>MVP 反馈</h3>
            <div className="stats-grid">
              <article><strong>{stats.total}</strong><span>对话轮次</span></article>
              <article><strong>{stats.emotional}</strong><span>高波动</span></article>
              <article><strong>{stats.empathyScore}</strong><span>匹配度</span></article>
            </div>
          </div>
          <div className="mvp-side-card">
            <h3>专属记忆</h3>
            {memories.length === 0
              ? <p className="muted-text">暂无记忆，聊聊"我喜欢..."或"我叫..."。</p>
              : <ul className="memory-list">{memories.map((item, idx) => <li key={`${item}-${idx}`}>{item}</li>)}</ul>
            }
            {memories.length > 0 && <button className="btn btn-sm btn-ghost" onClick={() => setMemories([])}>清空记忆</button>}
          </div>
        </aside>
      </section>
    </div>
  );
}

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("halfclaw-theme") || "dark";
    } catch { return "dark"; }
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("halfclaw-theme", theme); } catch {}
  }, [theme]);
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return { theme, toggle };
}

function ThemeToggle({ theme, onToggle }) {
  return (
    <button className="theme-toggle" onClick={onToggle} aria-label="切换主题" title={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}>
      {theme === "dark" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      )}
    </button>
  );
}

export default function App() {
  const { theme, toggle } = useTheme();
  return <LandingPage theme={theme} onToggleTheme={toggle} />;
}
