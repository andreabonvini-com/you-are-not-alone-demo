import { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────
const C = {
  deep:"#0D0A14", deepMid:"#15101F", deepLight:"#1E1630",
  violet:"#6B46C1", violetLight:"#8B5CF6",
  rose:"#F43F5E", roseLight:"#FB7185",
  amber:"#F59E0B", sage:"#10B981",
  cream:"#FDF6EC", muted:"#9CA3AF", mutedLight:"#D1D5DB",
  card:"rgba(255,255,255,0.04)", cardBorder:"rgba(255,255,255,0.08)",
  cardWarm:"rgba(251,113,133,0.08)", cardViolet:"rgba(139,92,246,0.10)",
};

const fonts = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Mulish:wght@300;400;500;600&display=swap');`;

const GlobalStyle = () => (
  <style>{`
    ${fonts}
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { height: 100%; width: 100%; }
    body { font-family: 'Mulish', sans-serif; background: ${C.deep}; color: ${C.cream}; -webkit-font-smoothing: antialiased; overflow: hidden; }
    ::-webkit-scrollbar { width: 3px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${C.violet}44; border-radius: 2px; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes breathe { 0%,100% { transform: scale(1); opacity: .6; } 50% { transform: scale(1.08); opacity: 1; } }
    @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 ${C.rose}55; } 50% { box-shadow: 0 0 0 12px ${C.rose}00; } }
    @keyframes typing { 0%,60%,100% { opacity: 1; } 30% { opacity: 0; } }
    @keyframes starFloat { 0%,100% { transform: translateY(0); opacity: .4; } 50% { transform: translateY(-8px); opacity: .8; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
    .fadeUp { animation: fadeUp .5s ease forwards; }
    .fadeIn { animation: fadeIn .4s ease forwards; }
    .slideUp { animation: slideUp .4s ease forwards; }
    button { cursor: pointer; border: none; outline: none; font-family: inherit; }
    input, textarea { font-family: inherit; outline: none; border: none; }
    textarea { resize: none; }
  `}</style>
);

// ─────────────────────────────────────────────────────────────
// SHARED UI
// ─────────────────────────────────────────────────────────────
const Stars = () => (
  <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
    {[...Array(18)].map((_, i) => (
      <div key={i} style={{
        position: "absolute", width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2,
        borderRadius: "50%", background: i % 4 === 0 ? C.violetLight : C.cream,
        left: `${(i * 47 + 13) % 100}%`, top: `${(i * 31 + 7) % 60}%`,
        opacity: .3 + (i % 5) * .1,
        animation: `starFloat ${3 + (i % 4)}s ease-in-out infinite`,
        animationDelay: `${(i * .4) % 3}s`,
      }} />
    ))}
  </div>
);

const Btn = ({ children, onClick, variant = "primary", style = {}, disabled, fullWidth }) => {
  const base = {
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    padding: "14px 24px", borderRadius: 16, fontSize: 14, fontWeight: 600,
    fontFamily: "'Mulish', sans-serif", letterSpacing: .3, transition: "all .2s",
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .5 : 1,
    width: fullWidth ? "100%" : "auto",
  };
  const v = {
    primary: { background: `linear-gradient(135deg,${C.violet},${C.violetLight})`, color: C.cream, boxShadow: `0 4px 20px ${C.violet}50` },
    rose: { background: `linear-gradient(135deg,${C.rose},${C.roseLight})`, color: C.cream, boxShadow: `0 4px 20px ${C.rose}40` },
    ghost: { background: C.card, color: C.cream, border: `1px solid ${C.cardBorder}` },
    outline: { background: "transparent", color: C.violetLight, border: `1.5px solid ${C.violetLight}` },
    sage: { background: `linear-gradient(135deg,${C.sage},#059669)`, color: C.deep, boxShadow: `0 4px 20px ${C.sage}40` },
    emergency: { background: "linear-gradient(135deg,#DC2626,#EF4444)", color: C.cream, boxShadow: "0 4px 20px rgba(220,38,38,.5)", animation: "pulse 2s infinite" },
  };
  return <button onClick={disabled ? undefined : onClick} style={{ ...base, ...v[variant], ...style }}>{children}</button>;
};

const Card = ({ children, style = {}, onClick, warm, violet }) => (
  <div onClick={onClick} style={{
    background: warm ? C.cardWarm : violet ? C.cardViolet : C.card,
    border: `1px solid ${warm ? C.rose + "33" : violet ? C.violet + "44" : C.cardBorder}`,
    borderRadius: 20, padding: 20, backdropFilter: "blur(12px)",
    cursor: onClick ? "pointer" : "default", transition: "all .2s", ...style,
  }}>{children}</div>
);

const Screen = ({ children, style = {} }) => (
  <div style={{ height: "100%", overflowY: "auto", overflowX: "hidden", paddingBottom: 100, position: "relative", zIndex: 1, ...style }}>
    {children}
  </div>
);

const IS = {
  width: "100%", background: C.card, border: `1px solid ${C.cardBorder}`,
  borderRadius: 14, padding: "13px 16px", color: C.cream, fontSize: 14,
  fontFamily: "'Mulish', sans-serif", fontWeight: 300,
};

const SL = ({ children, style = {} }) => (
  <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8, ...style }}>
    {children}
  </div>
);

// ─────────────────────────────────────────────────────────────
// FIX #1 — useVoice with stable callback via ref
// The original used onResult directly in useEffect deps=[], causing stale closure.
// Fix: store onResult in a ref so the recognition handler always calls the latest setter.
// ─────────────────────────────────────────────────────────────
const useVoice = (onResult) => {
  const [isRec, setIsRec] = useState(false);
  const [ok, setOk] = useState(false);
  const recRef = useRef(null);
  const cbRef = useRef(onResult);
  // Always keep cbRef current — no stale closure
  useEffect(() => { cbRef.current = onResult; }, [onResult]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    setOk(true);
    const r = new SR();
    r.lang = "pt-BR"; r.continuous = false; r.interimResults = true;
    r.onresult = (e) => {
      let t = "";
      for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      cbRef.current(t); // always calls the latest setter
    };
    r.onend = () => setIsRec(false);
    r.onerror = () => setIsRec(false);
    recRef.current = r;
    return () => recRef.current?.abort();
  }, []); // safe now because cbRef handles the callback

  const toggle = useCallback((clearFn) => {
    if (!recRef.current) return;
    if (isRec) { recRef.current.stop(); setIsRec(false); }
    else { if (clearFn) clearFn(); recRef.current.start(); setIsRec(true); }
  }, [isRec]);

  return { isRec, ok, toggle };
};

// ─────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────
const CRISIS_KW = ["suicídio", "me matar", "acabar com tudo", "não quero mais viver",
  "me machucar", "não aguentar", "morrer", "suicidar", "quero morrer", "me mato"];

const PROTOCOLS = {
  panic: {
    label: "Crise de pânico", icon: "💨", color: C.amber, steps: [
      { title: "Respire comigo", content: "Coloque uma mão no peito. Inspire pelo nariz contando 4. Segure 4. Expire pela boca contando 6. O pânico vai passar — você está segura.", timer: 60, action: "Respiração 4-4-6" },
      { title: "Ancoragem 5-4-3-2-1", content: "5 coisas que você vê. 4 que pode tocar. 3 sons. 2 cheiros. 1 sabor. Isso traz você de volta ao presente, onde você está segura.", timer: 90, action: "Ancoragem sensorial" },
      { title: "Você está passando por isso", content: "O pânico parece perigoso mas não é. Seu corpo reage como se houvesse perigo — mas não há. Em alguns minutos isso vai diminuir.", timer: 120, action: "Aguardar a onda" },
    ]
  },
  anxiety: {
    label: "Ansiedade intensa", icon: "🌊", color: C.violetLight, steps: [
      { title: "Vamos desacelerar", content: "Pés firmes no chão. Sinta o peso do seu corpo. Você está aqui. Você está presente. Inspira fundo.", timer: 45, action: "Enraizamento" },
      { title: "Nomear o pensamento", content: "Qual pensamento está acelerando tudo? Diga em voz alta. Colocar para fora tira o poder que ele tem sobre você.", timer: 60, action: "Externalizar" },
      { title: "Respiração em caixa", content: "Inspire 4s → segure 4 → expire 4 → segure 4. Repita 4 vezes. Técnica usada por militares em combate. Funciona.", timer: 80, action: "Respiração caixa" },
    ]
  },
  craving: {
    label: "Fissura", icon: "🔥", color: C.rose, steps: [
      { title: "Eu sei o quanto isso é difícil", content: "A fissura dura em média 3 a 5 minutos. Estou pedindo para você ficar aqui comigo por 5 minutos. Só isso.", timer: 60, action: "Surfar a onda" },
      { title: "Mude o ambiente", content: "Levanta. Vai em outro cômodo. Beba água gelada. Mudar o ambiente quebra o ciclo do gatilho.", timer: 45, action: "Mudar ambiente" },
      { title: "Você já ficou mais tempo", content: "Cada minuto sem ceder é uma vitória real. A fissura já passou do pico. Você está descendo a onda.", timer: 90, action: "Reforço positivo" },
    ]
  },
  sadness: {
    label: "Tristeza profunda", icon: "🌧", color: C.sage, steps: [
      { title: "Você não precisa estar bem agora", content: "Não precisa sorrir. Você está triste e isso é real. Ficar triste não é fraqueza — é ser humana. Estou aqui com você.", timer: 0, action: "Acolhimento" },
      { title: "Uma coisa de cada vez", content: "Só uma: você consegue dar uma volta curta? Tomar um banho? Ligar para alguém que gosta de você?", timer: 0, action: "Ação mínima" },
      { title: "Isso vai mudar", content: "Tristeza não é permanente. Você já sentiu outras coisas ruins e passou. Vai passar de novo. E você não está sozinha.", timer: 0, action: "Perspectiva" },
    ]
  },
};

const CHAT_N = [
  "Estou aqui. O que está acontecendo com você agora?",
  "Obrigada por me contar. Como você está se sentindo — em uma palavra?",
  "Faz sentido sentir isso. O que você acha que está por trás disso?",
  "Você já passou por algo parecido antes? Como foi?",
  "Tem alguém na sua vida com quem você consegue conversar sobre isso?",
];
const CHAT_C = [
  "Estou aqui. Você me disse algo muito importante.",
  "Você está tendo pensamentos de se machucar agora?",
  "Obrigada por me contar. Isso é muito corajoso. Você não precisa passar por isso sozinha.",
  "Vou acionar o protocolo de segurança. CVV: 188 (24h, gratuito).",
];

const PROFESSIONALS = [
  { name: "Dra. Camila Rocha", spec: "Psicóloga Clínica · TCC", price: "R$ 150/sessão", rating: "4.9", online: true },
  { name: "Dr. Felipe Andrade", spec: "Psicólogo · Ansiedade e depressão", price: "R$ 120/sessão", rating: "4.8", online: false },
  { name: "Dra. Ana Beatriz", spec: "Psicóloga · Dependência química", price: "R$ 180/sessão", rating: "5.0", online: true },
  { name: "Dr. Marcos Lima", spec: "Psiquiatra · Avaliação e tratamento", price: "R$ 300/consulta", rating: "4.7", online: false },
];

const CONTACTS_INIT = [
  { id: "carol", name: "Carol", code: "x7k2m9", emoji: "💜", color: "#8B5CF6", since: "há 2 anos", status: "online" },
  { id: "julia", name: "Julia", code: "p4n8q1", emoji: "🌸", color: "#F43F5E", since: "há 8 meses", status: "offline" },
];

const INBOX_INIT = [
  { id: 1, from: "Carol", fromId: "carol", fromEmoji: "💜", content: "Pensei em você hoje e quis mandar um abraço. 🤍", ts: "há 2h", liked: false, saved: false },
  { id: 2, from: "Julia", fromId: "julia", fromEmoji: "🌸", content: "Você é mais forte do que imagina. Sempre.", ts: "ontem", liked: true, saved: false },
];

// FIX #2 — was referenced as MOCK_MEMORIES (undefined). Renamed to MEMORIES_INIT consistently.
const MEMORIES_INIT = [
  { id: 1, person: "Minha mãe", emoji: "💛", relation: "mãe", color: "#F59E0B", message: "Você é a razão do meu sorriso todos os dias. Te amo infinitamente.", love: "Sua força, sua inteligência e como você cuida das pessoas.", userNote: "Ela sempre acreditou em mim mesmo quando eu duvidei.", contactId: null },
  { id: 2, person: "Carol", emoji: "💜", relation: "melhor amiga", color: "#8B5CF6", message: "Amizade como a nossa não se encontra em todo lugar. Você me completa.", love: "Sua risada, sua coragem e como você nunca desiste.", userNote: "20 anos de amizade. Ela sabe de tudo.", contactId: "carol" },
  { id: 3, person: "Eu aos 10 anos", emoji: "⭐", relation: "eu mesma", color: "#10B981", message: null, love: null, userNote: "Aquela menina que sonhava alto e não tinha medo de nada.", contactId: null },
];

const CRISIS_MODES = [
  { id: "loneliness", label: "Me sinto sozinha", icon: "🌙", filter: ["mãe", "melhor amiga", "amiga"] },
  { id: "lowself", label: "Autoestima baixa", icon: "⭐", filter: ["eu mesma"] },
  { id: "overwhelmed", label: "Me sinto perdida", icon: "🌊", filter: ["mãe", "melhor amiga"] },
  { id: "general", label: "Só quero me lembrar", icon: "🤍", filter: null },
];

const PLAYLISTS = [
  { emoji: "🌊", name: "Calmaria", desc: "Para desacelerar", color: "#3B82F6", q: "lo-fi chill beats" },
  { emoji: "☀️", name: "Levanta", desc: "Para quando precisa de energia", color: C.amber, q: "feel good uplifting songs" },
  { emoji: "🌙", name: "Dormir", desc: "Para encerrar o dia", color: C.violet, q: "sleep relaxing music" },
  { emoji: "💪", name: "Força", desc: "Você é capaz", color: C.rose, q: "motivational empowering songs" },
];

// ─────────────────────────────────────────────────────────────
// BOTTOM NAV
// ─────────────────────────────────────────────────────────────
const BottomNav = ({ active, onNav, inboxCount = 0 }) => {
  const items = [
    { id: "home", icon: "🏠", label: "Início" },
    { id: "chat", icon: "💬", label: "Conversar" },
    { id: "chest", icon: "🫙", label: "Memórias" },
    { id: "tools", icon: "🧘", label: "Ferramentas" },
    { id: "network", icon: "🤝", label: "Apoio" },
    { id: "profile", icon: "👤", label: "Perfil" },
  ];
  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: `${C.deepMid}f0`, backdropFilter: "blur(20px)", borderTop: `1px solid ${C.cardBorder}`, display: "flex", justifyContent: "space-around", alignItems: "center", padding: "10px 0 20px", zIndex: 100 }}>
      {items.map(it => (
        <button key={it.id} onClick={() => onNav(it.id)} style={{ background: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "4px 6px", color: active === it.id ? C.violetLight : C.muted, transition: "color .2s", position: "relative" }}>
          <span style={{ fontSize: 18 }}>{it.icon}</span>
          {it.id === "chest" && inboxCount > 0 && (
            <div style={{ position: "absolute", top: -2, right: 2, width: 15, height: 15, borderRadius: "50%", background: C.rose, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: C.cream }}>{inboxCount}</div>
          )}
          <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: .5 }}>{it.label}</span>
        </button>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// SPLASH
// ─────────────────────────────────────────────────────────────
const SplashScreen = ({ onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 2400); return () => clearTimeout(t); }, []);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: `radial-gradient(ellipse at 50% 40%,${C.violet}25 0%,${C.deep} 70%)` }}>
      <Stars />
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 24, animation: "breathe 3s ease infinite" }}>🤍</div>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 300, letterSpacing: 1, marginBottom: 8 }}>You're Not Alone</div>
        <div style={{ color: C.muted, fontSize: 13, fontWeight: 300, fontStyle: "italic" }}>Você não está sozinha</div>
        <div style={{ marginTop: 40, display: "flex", gap: 6, justifyContent: "center" }}>
          {[0, 1, 2].map(i => <div key={i} style={{ width: i === 1 ? 24 : 8, height: 8, borderRadius: 4, background: i === 1 ? C.violetLight : `${C.violet}44` }} />)}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// ONBOARDING
// FIX #3 — added paddingBottom to container so step 8 is reachable on small screens
// ─────────────────────────────────────────────────────────────
const OnboardingScreen = ({ onDone }) => {
  const [step, setStep] = useState(0);
  const [d, setD] = useState({ name: "", emergencyName: "", emergencyPhone: "", emergencyType: "familiar", psychName: "", psychPhone: "", meds: "", triggers: "", accepted: false });
  const up = (k, v) => setD(x => ({ ...x, [k]: v }));

  const info = [
    { icon: "🤍", title: "Você não está sozinha", body: "Este espaço existe para os momentos em que a vida fica pesada demais. Não sou terapeuta. Sou um companheiro disponível 24 horas, sem julgamentos." },
    { icon: "🧭", title: "Como funciona", body: "Converse sobre o que sente, use ferramentas para crises, acesse seu Baú de Memórias, conecte-se a amigos de confiança e encontre profissionais credenciados." },
    { icon: "⚠️", title: "Importante saber", body: "Este app é apoio emocional — não substitui atendimento profissional. Em emergências: CVV 188 (24h, gratuito) ou SAMU 192." },
  ];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: `radial-gradient(ellipse at 50% 0%,${C.violet}20 0%,${C.deep} 60%)`, padding: "0 24px", overflowY: "auto", paddingBottom: 40 }}>
      <Stars />
      <div style={{ position: "relative", zIndex: 1 }}>
        {step < 3 && (
          <div style={{ paddingTop: 80, textAlign: "center" }} className="fadeUp">
            <div style={{ fontSize: 56, marginBottom: 24 }}>{info[step].icon}</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 400, marginBottom: 16, lineHeight: 1.3 }}>{info[step].title}</div>
            <div style={{ color: C.mutedLight, fontSize: 14, lineHeight: 1.8, marginBottom: 48, fontWeight: 300 }}>{info[step].body}</div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 32 }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: i === step ? 20 : 8, height: 8, borderRadius: 4, background: i === step ? C.violetLight : `${C.violet}44`, transition: "all .3s" }} />)}
            </div>
            <Btn onClick={() => setStep(s => s + 1)} fullWidth>{step < 2 ? "Continuar →" : "Entendi"}</Btn>
          </div>
        )}
        {step === 3 && (
          <div style={{ paddingTop: 60 }} className="fadeUp">
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, marginBottom: 6 }}>Como posso te chamar?</div>
            <div style={{ color: C.muted, fontSize: 13, marginBottom: 20, fontWeight: 300 }}>Só seu nome ou apelido.</div>
            <input style={IS} placeholder="Seu nome..." value={d.name} onChange={e => up("name", e.target.value)} />
            <Btn onClick={() => d.name.trim() && setStep(4)} fullWidth disabled={!d.name.trim()} style={{ marginTop: 20 }}>Continuar</Btn>
          </div>
        )}
        {step === 4 && (
          <div style={{ paddingTop: 60 }} className="fadeUp">
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, marginBottom: 6 }}>Contato de emergência</div>
            <div style={{ color: C.muted, fontSize: 13, marginBottom: 16, fontWeight: 300, lineHeight: 1.6 }}>Em crise grave sem resposta por 5 minutos, posso acionar essa pessoa.</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {[["familiar", "👨‍👩‍👧 Familiar"], ["psicologo", "🧠 Psicólogo"], ["amigo", "🤝 Amigo"]].map(([v, l]) => (
                <button key={v} onClick={() => up("emergencyType", v)} style={{ flex: 1, padding: "10px 4px", borderRadius: 12, fontSize: 11, fontWeight: 600, fontFamily: "'Mulish', sans-serif", background: d.emergencyType === v ? `${C.violet}44` : C.card, border: `1px solid ${d.emergencyType === v ? C.violetLight : C.cardBorder}`, color: d.emergencyType === v ? C.violetLight : C.muted }}>{l}</button>
              ))}
            </div>
            <input style={{ ...IS, marginBottom: 10 }} placeholder="Nome do contato" value={d.emergencyName} onChange={e => up("emergencyName", e.target.value)} />
            <input style={IS} placeholder="Telefone" value={d.emergencyPhone} onChange={e => up("emergencyPhone", e.target.value)} />
            <Btn onClick={() => setStep(5)} fullWidth style={{ marginTop: 20 }}>Continuar</Btn>
            <button onClick={() => setStep(5)} style={{ background: "none", color: C.muted, fontSize: 12, marginTop: 12, textAlign: "center", width: "100%" }}>Pular por agora</button>
          </div>
        )}
        {step === 5 && (
          <div style={{ paddingTop: 60 }} className="fadeUp">
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, marginBottom: 6 }}>Psicólogo de referência</div>
            <div style={{ color: C.muted, fontSize: 13, marginBottom: 16, fontWeight: 300, lineHeight: 1.6 }}>Se você tem acompanhamento, posso facilitar o contato nos momentos difíceis.</div>
            <input style={{ ...IS, marginBottom: 10 }} placeholder="Nome do psicólogo(a)" value={d.psychName} onChange={e => up("psychName", e.target.value)} />
            <input style={IS} placeholder="Telefone ou e-mail" value={d.psychPhone} onChange={e => up("psychPhone", e.target.value)} />
            <Btn onClick={() => setStep(6)} fullWidth style={{ marginTop: 20 }}>Continuar</Btn>
            <button onClick={() => setStep(6)} style={{ background: "none", color: C.muted, fontSize: 12, marginTop: 12, textAlign: "center", width: "100%" }}>Não tenho acompanhamento</button>
          </div>
        )}
        {step === 6 && (
          <div style={{ paddingTop: 60 }} className="fadeUp">
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, marginBottom: 6 }}>Uso de medicação</div>
            <div style={{ color: C.muted, fontSize: 13, marginBottom: 16, fontWeight: 300, lineHeight: 1.6 }}>Opcional. Se usar medicação psiquiátrica, posso perguntar sobre ela nos momentos de crise — para cuidar, não para controlar.</div>
            <textarea style={{ ...IS, minHeight: 80, lineHeight: 1.6 }} placeholder="Ex: Sertralina, Rivotril... (só o nome)" value={d.meds} onChange={e => up("meds", e.target.value)} rows={3} />
            <Btn onClick={() => setStep(7)} fullWidth style={{ marginTop: 20 }}>Continuar</Btn>
            <button onClick={() => setStep(7)} style={{ background: "none", color: C.muted, fontSize: 12, marginTop: 12, textAlign: "center", width: "100%" }}>Não uso medicação</button>
          </div>
        )}
        {step === 7 && (
          <div style={{ paddingTop: 60 }} className="fadeUp">
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, marginBottom: 6 }}>Seus gatilhos</div>
            <div style={{ color: C.muted, fontSize: 13, marginBottom: 16, fontWeight: 300, lineHeight: 1.6 }}>O que costuma desencadear suas crises? Só você vê isso.</div>
            <textarea style={{ ...IS, minHeight: 100, lineHeight: 1.6 }} placeholder="Ex: brigas em casa, segunda-feira, falta de sono..." value={d.triggers} onChange={e => up("triggers", e.target.value)} rows={4} />
            <Btn onClick={() => setStep(8)} fullWidth style={{ marginTop: 20 }}>Continuar</Btn>
            <button onClick={() => setStep(8)} style={{ background: "none", color: C.muted, fontSize: 12, marginTop: 12, textAlign: "center", width: "100%" }}>Pular por agora</button>
          </div>
        )}
        {step === 8 && (
          <div style={{ paddingTop: 60 }} className="fadeUp">
            <div style={{ display: "flex", gap: 12, marginBottom: 24, padding: 16, background: C.card, borderRadius: 14, border: `1px solid ${C.cardBorder}`, alignItems: "flex-start" }}>
              <button onClick={() => up("accepted", !d.accepted)} style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${d.accepted ? C.violetLight : C.muted}`, background: d.accepted ? C.violetLight : "transparent", flexShrink: 0, marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {d.accepted && <span style={{ color: C.cream, fontSize: 12 }}>✓</span>}
              </button>
              <div style={{ color: C.muted, fontSize: 12, lineHeight: 1.6 }}>Entendo que este app é apoio emocional e não substitui atendimento psicológico. Em emergências: CVV 188 ou SAMU 192.</div>
            </div>
            <Btn onClick={() => d.accepted && onDone(d)} fullWidth disabled={!d.accepted}>Começar minha jornada 🤍</Btn>
          </div>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────────
const HomeScreen = ({ userData, onNav, onCrisis }) => {
  const [mood, setMood] = useState(null);
  const hr = new Date().getHours();
  const gr = hr < 12 ? "Bom dia" : hr < 18 ? "Boa tarde" : "Boa noite";
  const moods = [{ icon: "😔", label: "Mal", v: 1 }, { icon: "😕", label: "Difícil", v: 2 }, { icon: "😐", label: "Ok", v: 3 }, { icon: "🙂", label: "Bem", v: 4 }, { icon: "😊", label: "Ótimo", v: 5 }];
  return (
    <Screen>
      <Stars />
      <div style={{ position: "relative", zIndex: 1, padding: "56px 24px 0" }}>
        <div style={{ color: C.muted, fontSize: 13, fontWeight: 300 }}>{gr},</div>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 400, marginBottom: 4 }}>{userData?.name || "Você"}</div>
        <div style={{ color: C.muted, fontSize: 13, fontWeight: 300, marginBottom: 24 }}>Como você está agora?</div>
        <Card style={{ marginBottom: 20 }}>
          <SL>Seu estado agora</SL>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {moods.map(m => (
              <button key={m.v} onClick={() => setMood(m.v)} style={{ background: mood === m.v ? `${C.violet}44` : "transparent", border: `1px solid ${mood === m.v ? C.violetLight : "transparent"}`, borderRadius: 12, padding: "10px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1, transition: "all .2s" }}>
                <span style={{ fontSize: 24 }}>{m.icon}</span>
                <span style={{ fontSize: 9, color: mood === m.v ? C.violetLight : C.muted, fontWeight: 600 }}>{m.label}</span>
              </button>
            ))}
          </div>
          {mood && <div className="fadeIn" style={{ marginTop: 16 }}><Btn onClick={() => onNav("chat")} style={{ width: "100%" }}>Conversar sobre isso →</Btn></div>}
        </Card>
        <Card style={{ marginBottom: 20, border: `1px solid ${C.rose}44`, background: `${C.rose}0a`, textAlign: "center", padding: 24 }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, marginBottom: 8 }}>Em crise agora?</div>
          <div style={{ color: C.muted, fontSize: 12, marginBottom: 16, fontWeight: 300 }}>Não precisa explicar. Só clique.</div>
          <Btn variant="rose" onClick={onCrisis} fullWidth style={{ fontSize: 16, padding: 16 }}>🆘 Preciso de ajuda agora</Btn>
        </Card>
        <SL style={{ marginBottom: 8 }}>Protocolo por tipo de crise</SL>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {Object.entries(PROTOCOLS).map(([k, p]) => (
            <Card key={k} onClick={() => onNav("tools")} style={{ cursor: "pointer", textAlign: "center", padding: 16 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{p.icon}</div>
              <div style={{ fontSize: 12, color: C.mutedLight, fontWeight: 500 }}>{p.label}</div>
            </Card>
          ))}
        </div>
        <Card violet style={{ textAlign: "center", padding: 24 }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontStyle: "italic", fontWeight: 300, lineHeight: 1.6 }}>"Pedir ajuda não é fraqueza. É o ato mais corajoso que existe."</div>
          <div style={{ color: C.muted, fontSize: 11, marginTop: 12, fontWeight: 300 }}>You're Not Alone</div>
        </Card>
      </div>
    </Screen>
  );
};

// ─────────────────────────────────────────────────────────────
// CHAT
// FIX #4 — capture input value before clearing to avoid race condition in async callback
// ─────────────────────────────────────────────────────────────
const ChatScreen = ({ userData, isCrisis = false }) => {
  const name = userData?.name || "você";
  const [msgs, setMsgs] = useState([{ role: "ai", text: isCrisis ? "Estou aqui. Você deu um passo importante. Pode me contar o que está acontecendo?" : `Olá, ${name}. Estou aqui. O que está passando pela sua cabeça agora?`, ts: Date.now() }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [rIdx, setRIdx] = useState(0);
  const [crisis, setCrisis] = useState(isCrisis);
  const [medDone, setMedDone] = useState(false);
  const bottomRef = useRef(null);
  const { isRec, ok: speechOk, toggle: toggleRec } = useVoice(t => setInput(t));

  const detectCrisis = (t) => CRISIS_KW.some(k => t.toLowerCase().includes(k));

  const send = () => {
    const text = input.trim(); // FIX: capture before clearing
    if (!text) return;
    const hasCrisis = detectCrisis(text);
    setMsgs(m => [...m, { role: "user", text, ts: Date.now() }]);
    setInput(""); // clear immediately for UX
    setTyping(true);
    if (hasCrisis) setCrisis(true);
    const checkMed = !medDone && userData?.meds && msgs.length >= 3;
    setTimeout(() => {
      const flow = hasCrisis ? CHAT_C : CHAT_N;
      const reply = checkMed
        ? `Antes de continuarmos — você tomou seu ${userData.meds} hoje? Às vezes quando estamos assim, é a primeira coisa que escapa.`
        : flow[rIdx % flow.length];
      if (checkMed) setMedDone(true);
      setMsgs(m => [...m, { role: "ai", text: reply, ts: Date.now(), crisis: hasCrisis }]);
      setRIdx(i => i + 1);
      setTyping(false);
    }, 1400 + Math.random() * 600);
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
      <Stars />
      <div style={{ padding: "52px 24px 16px", borderBottom: `1px solid ${C.cardBorder}`, position: "relative", zIndex: 1, background: `${C.deep}cc`, backdropFilter: "blur(10px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg,${C.violet},${C.violetLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🤍</div>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 400, fontSize: 15 }}>You're Not Alone</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: C.sage }} /><span style={{ color: C.muted, fontSize: 11 }}>Disponível agora</span></div>
          </div>
          {userData?.psychName && <div style={{ marginLeft: "auto", background: `${C.violet}22`, border: `1px solid ${C.violet}44`, borderRadius: 10, padding: "5px 10px", fontSize: 10, color: C.violetLight, fontWeight: 600 }}>🧠 {userData.psychName}</div>}
        </div>
      </div>
      {crisis && (
        <div className="slideUp" style={{ background: `${C.rose}22`, border: `1px solid ${C.rose}44`, padding: "12px 20px", zIndex: 1, position: "relative" }}>
          <div style={{ fontSize: 12, color: C.roseLight, fontWeight: 600, marginBottom: 8 }}>🆘 Protocolo de segurança ativado</div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>Se não responder em 5 minutos, {userData?.emergencyName || "seu contato"} será acionado. CVV: 188</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="ghost" onClick={() => setCrisis(false)} style={{ flex: 1, fontSize: 12, padding: 8 }}>Estou bem</Btn>
            <Btn variant="emergency" style={{ flex: 1, fontSize: 12, padding: 8 }}>Ligar CVV 188</Btn>
          </div>
        </div>
      )}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 0", position: "relative", zIndex: 1 }}>
        {msgs.map((msg, i) => (
          <div key={i} className="fadeUp" style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 14, animationDelay: `${i * .05}s` }}>
            {msg.role === "ai" && <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${C.violet},${C.violetLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0, marginRight: 10, marginTop: 2 }}>🤍</div>}
            <div style={{ maxWidth: "75%", padding: "12px 16px", borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: msg.role === "user" ? `linear-gradient(135deg,${C.violet},${C.violetLight})` : msg.crisis ? `${C.rose}22` : C.card, border: msg.crisis ? `1px solid ${C.rose}44` : msg.role === "ai" ? `1px solid ${C.cardBorder}` : "none", fontSize: 14, lineHeight: 1.6, color: C.cream, fontWeight: 300 }}>{msg.text}</div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${C.violet},${C.violetLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🤍</div>
            <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: "18px 18px 18px 4px", padding: "12px 18px", display: "flex", gap: 5, alignItems: "center" }}>
              {[0, 1, 2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.violetLight, animation: "typing 1.2s ease infinite", animationDelay: `${i * .2}s` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ padding: "12px 16px 100px", position: "relative", zIndex: 1, background: `${C.deep}cc`, backdropFilter: "blur(10px)", borderTop: `1px solid ${C.cardBorder}` }}>
        {isRec && <div className="fadeIn" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "8px 14px", background: `${C.rose}18`, border: `1px solid ${C.rose}44`, borderRadius: 12 }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: C.rose, animation: "pulse 1s infinite" }} /><span style={{ color: C.roseLight, fontSize: 12, fontWeight: 500 }}>Ouvindo... fale agora</span><span style={{ color: C.muted, fontSize: 11, marginLeft: "auto" }}>🎙 para parar</span></div>}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          {speechOk && <button onClick={() => toggleRec(() => setInput(""))} style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0, background: isRec ? `linear-gradient(135deg,${C.rose},${C.roseLight})` : C.card, border: `1px solid ${isRec ? C.rose : C.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, transition: "all .2s", boxShadow: isRec ? `0 0 16px ${C.rose}55` : "none" }}>🎙</button>}
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={isRec ? "Transcrevendo..." : "Escreva ou use o microfone 🎙"} rows={1}
            style={{ flex: 1, background: isRec ? `${C.violet}18` : C.card, border: `1px solid ${isRec ? C.violetLight + "66" : C.cardBorder}`, borderRadius: 16, padding: "12px 14px", color: C.cream, fontSize: 14, fontWeight: 300, lineHeight: 1.5, maxHeight: 100, overflowY: "auto", transition: "all .3s" }} />
          <button onClick={send} disabled={!input.trim()} style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0, background: input.trim() ? `linear-gradient(135deg,${C.violet},${C.violetLight})` : C.card, border: `1px solid ${input.trim() ? "transparent" : C.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, transition: "all .2s" }}>↑</button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// TOOLS
// FIX #5 — BackBtn now resets setTimerOn and setTimeLeft correctly
// ─────────────────────────────────────────────────────────────
const ToolsScreen = () => {
  const [active, setActive] = useState(null);
  const [step, setStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const [view, setView] = useState("home");
  const [futureMsg, setFutureMsg] = useState("");
  const [savedMsg, setSavedMsg] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const startTimer = (s) => {
    clearInterval(timerRef.current);
    setTimeLeft(s); setTimerOn(true);
    timerRef.current = setInterval(() => setTimeLeft(t => {
      if (t <= 1) { clearInterval(timerRef.current); setTimerOn(false); return 0; }
      return t - 1;
    }), 1000);
  };

  // FIX: full reset including timerOn
  const resetProtocol = () => {
    clearInterval(timerRef.current);
    setActive(null); setStep(0); setTimeLeft(0); setTimerOn(false);
  };

  const p = active ? PROTOCOLS[active] : null;
  const cs = p ? p.steps[step] : null;

  const BackBtn = ({ to = "home" }) => (
    <button onClick={() => { resetProtocol(); setView(to); }} style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: "8px 14px", color: C.cream, fontSize: 13, marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>← Voltar</button>
  );

  if (view === "future") return (
    <Screen><Stars />
      <div style={{ position: "relative", zIndex: 1, padding: "56px 24px 0" }}>
        <BackBtn />
        {!savedMsg ? (
          <>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, marginBottom: 6 }}>Carta para você mesma</div>
            <div style={{ color: C.muted, fontSize: 13, fontWeight: 300, lineHeight: 1.7, marginBottom: 20 }}>Escreva agora, estando bem, para a versão de você que vai precisar ler isso um dia. Ou escreva nos momentos difíceis para registrar o que está sentindo.</div>
            <textarea style={{ ...IS, minHeight: 200, lineHeight: 1.8 }} placeholder={"Querida eu,\n\nVocê está passando por algo difícil agora. Mas eu sei que você consegue, porque já passou por outras coisas e superou..."} value={futureMsg} onChange={e => setFutureMsg(e.target.value)} rows={8} />
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <Btn variant="outline" onClick={() => setView("home")} style={{ flex: 1 }}>Cancelar</Btn>
              <Btn onClick={() => futureMsg.trim() && setSavedMsg(futureMsg)} disabled={!futureMsg.trim()} style={{ flex: 1 }}>Guardar carta 💌</Btn>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center" }} className="fadeUp">
            <div style={{ fontSize: 64, marginBottom: 20, animation: "breathe 2s ease infinite" }}>💌</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, marginBottom: 12 }}>Carta guardada</div>
            <div style={{ color: C.muted, fontSize: 13, fontWeight: 300, lineHeight: 1.7, marginBottom: 28 }}>Quando você precisar, ela estará aqui esperando.</div>
            <Card warm style={{ textAlign: "left", marginBottom: 20 }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 14, fontStyle: "italic", fontWeight: 300, lineHeight: 1.8 }}>"{savedMsg.substring(0, 150)}{savedMsg.length > 150 ? "..." : ""}"</div>
            </Card>
            <Btn onClick={() => setView("home")} fullWidth>Voltar às ferramentas</Btn>
          </div>
        )}
      </div>
    </Screen>
  );

  if (view === "music") return (
    <Screen><Stars />
      <div style={{ position: "relative", zIndex: 1, padding: "56px 24px 0" }}>
        <BackBtn />
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, marginBottom: 6 }}>Playlist emocional</div>
        <div style={{ color: C.muted, fontSize: 13, fontWeight: 300, lineHeight: 1.7, marginBottom: 24 }}>Escolha o que você precisa agora. Abre o Spotify com a busca pronta.</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {PLAYLISTS.map((pl, i) => (
            <Card key={i} onClick={() => window.open(`https://open.spotify.com/search/${encodeURIComponent(pl.q)}`, "_blank")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 16, border: `1px solid ${pl.color}33` }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: `${pl.color}22`, border: `1px solid ${pl.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>{pl.emoji}</div>
              <div style={{ flex: 1 }}><div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 400, marginBottom: 4 }}>{pl.name}</div><div style={{ color: C.muted, fontSize: 12, fontWeight: 300 }}>{pl.desc}</div></div>
              <div style={{ color: pl.color, fontSize: 18 }}>▶</div>
            </Card>
          ))}
        </div>
        <Card style={{ padding: 16 }}>
          <SL>Ou cole um link direto</SL>
          <input style={{ ...IS, marginBottom: 12 }} placeholder="https://open.spotify.com/..." />
          <Btn fullWidth>Abrir música</Btn>
        </Card>
      </div>
    </Screen>
  );

  if (active && cs) return (
    <Screen><Stars />
      <div style={{ position: "relative", zIndex: 1, padding: "56px 24px 0" }}>
        <BackBtn />
        <div style={{ color: C.muted, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 8 }}>{p.label} · Passo {step + 1} de {p.steps.length}</div>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 400, marginBottom: 24, lineHeight: 1.3 }}>{cs.title}</div>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          {cs.timer > 0 ? (
            <div style={{ width: 140, height: 140, borderRadius: "50%", border: `3px solid ${p.color}44`, background: `${p.color}11`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: timerOn ? `0 0 40px ${p.color}33` : "none", transition: "box-shadow .3s" }}>
              {timerOn ? (<><div style={{ fontFamily: "'Fraunces', serif", fontSize: 40, fontWeight: 300, color: p.color }}>{timeLeft}</div><div style={{ fontSize: 11, color: C.muted }}>segundos</div></>) : <div style={{ fontSize: 42, animation: "breathe 3s ease infinite" }}>{p.icon}</div>}
            </div>
          ) : <div style={{ fontSize: 64, animation: "breathe 3s ease infinite" }}>{p.icon}</div>}
        </div>
        <Card style={{ marginBottom: 20 }}><div style={{ fontSize: 14, lineHeight: 1.8, color: C.mutedLight, fontWeight: 300 }}>{cs.content}</div></Card>
        <div style={{ display: "flex", gap: 12 }}>
          {cs.timer > 0 && !timerOn && timeLeft === 0 && <Btn onClick={() => startTimer(cs.timer)} variant="outline" style={{ flex: 1 }}>▶ {cs.action}</Btn>}
          {step < p.steps.length - 1
            ? <Btn onClick={() => { setStep(s => s + 1); setTimeLeft(0); setTimerOn(false); clearInterval(timerRef.current); }} style={{ flex: 1 }}>Próximo →</Btn>
            : <Btn onClick={resetProtocol} style={{ flex: 1 }}>Concluir ✓</Btn>}
        </div>
      </div>
    </Screen>
  );

  return (
    <Screen><Stars />
      <div style={{ position: "relative", zIndex: 1, padding: "56px 24px 0" }}>
        <SL>Ferramentas</SL>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 400, marginBottom: 24 }}>O que você precisa agora?</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          {Object.entries(PROTOCOLS).map(([k, p]) => (
            <Card key={k} onClick={() => setActive(k)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: `${p.color}22`, border: `1px solid ${p.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{p.icon}</div>
              <div style={{ flex: 1 }}><div style={{ fontFamily: "'Fraunces', serif", fontSize: 16, fontWeight: 400, marginBottom: 4 }}>{p.label}</div><div style={{ color: C.muted, fontSize: 12, fontWeight: 300 }}>{p.steps.length} passos · técnicas validadas</div></div>
              <div style={{ color: C.muted, fontSize: 18 }}>›</div>
            </Card>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Card onClick={() => setView("future")} style={{ cursor: "pointer", textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>💌</div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Carta para mim</div>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 300 }}>Mensagem do futuro</div>
          </Card>
          <Card onClick={() => setView("music")} style={{ cursor: "pointer", textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🎵</div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Playlist emocional</div>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 300 }}>Abre no Spotify</div>
          </Card>
          <Card onClick={() => setActive("panic")} style={{ cursor: "pointer", textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🫁</div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Respiração 4-4-6</div>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 300 }}>Para pânico e ansiedade</div>
          </Card>
          <Card onClick={() => setActive("anxiety")} style={{ cursor: "pointer", textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>🌿</div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Ancoragem 5-4-3-2-1</div>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 300 }}>Volta ao presente</div>
          </Card>
        </div>
      </div>
    </Screen>
  );
};

// ─────────────────────────────────────────────────────────────
// MEMORY CHEST
// FIX #2 — MOCK_MEMORIES renamed to MEMORIES_INIT (was crashing on mount)
// FIX #6 — Slideshow guards against empty filtered array
// FIX #7 — Remove contact also clears activeContact to avoid crash
// ─────────────────────────────────────────────────────────────
const MemoryChestScreen = ({ inboxMsgs, setInboxMsgs }) => {
  const [memories, setMemories] = useState(MEMORIES_INIT); // FIX #2
  const [contacts, setContacts] = useState(CONTACTS_INIT);
  const [view, setView] = useState("home");
  const [activeContact, setActiveContact] = useState(null);
  const [slideMode, setSlideMode] = useState(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [addStep, setAddStep] = useState(0);
  const [nm, setNm] = useState({ person: "", relation: "", emoji: "💛", love: "", userNote: "", color: "#F59E0B" });
  const [copied, setCopied] = useState(false);
  const [myCode] = useState("a7x9k2");
  const [addCode, setAddCode] = useState("");
  const [sendText, setSendText] = useState("");
  const [sendDone, setSendDone] = useState(false);

  const { isRec, ok: speechOk, toggle: toggleRec } = useVoice(t => setSendText(t));

  const EMOJIS = ["💛", "💜", "💙", "💚", "🧡", "❤️", "⭐", "🌸", "🦋", "🌟"];
  const COLORS = ["#F59E0B", "#8B5CF6", "#3B82F6", "#10B981", "#F97316", "#F43F5E", "#EAB308"];

  // FIX #6 — guard empty filtered list
  const filtered = slideMode?.filter ? memories.filter(m => slideMode.filter.includes(m.relation)) : memories;
  const safeFiltered = filtered.length > 0 ? filtered : memories; // fallback to all memories
  const cur = safeFiltered[slideIdx % safeFiltered.length];

  const unread = inboxMsgs.filter(m => !m.liked && !m.saved).length;

  const resetContact = () => { setView("home"); setSendDone(false); setSendText(""); };

  // INBOX
  if (view === "inbox") return (
    <Screen><Stars />
      <div style={{ position: "relative", zIndex: 1, padding: "56px 24px 0" }}>
        <button onClick={() => setView("home")} style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: "8px 14px", color: C.cream, fontSize: 13, marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>← Voltar</button>
        <SL>Entrada de mensagens</SL>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, marginBottom: 20 }}>Mensagens recebidas</div>
        {inboxMsgs.length === 0 && <Card style={{ textAlign: "center", padding: 32 }}><div style={{ fontSize: 48, marginBottom: 12 }}>📭</div><div style={{ color: C.muted, fontSize: 13, fontWeight: 300 }}>Nenhuma mensagem ainda.</div></Card>}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {inboxMsgs.map(msg => (
            <Card key={msg.id} style={{ border: `1px solid ${!msg.liked && !msg.saved ? C.violetLight + "44" : C.cardBorder}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: `${C.violet}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{msg.fromEmoji}</div>
                <div><div style={{ fontSize: 13, fontWeight: 600 }}>{msg.from}</div><div style={{ color: C.muted, fontSize: 11 }}>{msg.ts}</div></div>
                {!msg.liked && !msg.saved && <div style={{ marginLeft: "auto", background: `${C.violetLight}33`, borderRadius: 8, padding: "3px 8px", fontSize: 10, color: C.violetLight, fontWeight: 600 }}>Nova</div>}
              </div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15, fontStyle: "italic", fontWeight: 300, lineHeight: 1.7, marginBottom: 16 }}>"{msg.content}"</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setInboxMsgs(ms => ms.map(m => m.id === msg.id ? { ...m, liked: true } : m))} style={{ flex: 1, padding: "10px", borderRadius: 12, background: msg.liked ? `${C.rose}33` : C.card, border: `1px solid ${msg.liked ? C.rose : C.cardBorder}`, color: msg.liked ? C.roseLight : C.muted, fontSize: 13, fontFamily: "'Mulish', sans-serif", fontWeight: 500, transition: "all .2s" }}>{msg.liked ? "🤍 Curtido" : "🤍 Curtir"}</button>
                <button onClick={() => {
                  setInboxMsgs(ms => ms.map(m => m.id === msg.id ? { ...m, saved: true } : m));
                  const ct = contacts.find(c => c.id === msg.fromId);
                  if (ct && !memories.find(m => m.contactId === msg.fromId)) {
                    setMemories(ms => [...ms, { id: Date.now(), person: ct.name, emoji: ct.emoji, relation: "amiga", color: ct.color, message: msg.content, love: null, userNote: "Guardada da entrada de mensagens", contactId: ct.id }]);
                  }
                }} style={{ flex: 1, padding: "10px", borderRadius: 12, background: msg.saved ? `${C.sage}33` : C.card, border: `1px solid ${msg.saved ? C.sage : C.cardBorder}`, color: msg.saved ? C.sage : C.muted, fontSize: 12, fontFamily: "'Mulish', sans-serif", fontWeight: 500, transition: "all .2s" }}>{msg.saved ? "✓ No Baú" : "Guardar no Baú"}</button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Screen>
  );

  // ADD CONTACT
  if (view === "addContact") return (
    <Screen><Stars />
      <div style={{ position: "relative", zIndex: 1, padding: "56px 24px 0" }}>
        <button onClick={() => setView("home")} style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: "8px 14px", color: C.cream, fontSize: 13, marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>← Voltar</button>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, marginBottom: 6 }}>Adicionar contato</div>
        <div style={{ color: C.muted, fontSize: 13, fontWeight: 300, lineHeight: 1.7, marginBottom: 24 }}>A privacidade é prioridade. Amigos só podem ser adicionados por código ou link — nunca por busca pública.</div>
        <Card violet style={{ marginBottom: 20 }}>
          <SL>Meu código único</SL>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 300, color: C.violetLight, letterSpacing: 4, marginBottom: 12 }}>{myCode.toUpperCase()}</div>
          <div style={{ color: C.muted, fontSize: 11, fontWeight: 300, marginBottom: 12 }}>Compartilhe com quem você quer conectar:</div>
          <div style={{ background: C.deepLight, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: C.mutedLight, marginBottom: 14, wordBreak: "break-all" }}>youarenotalone.app/add/{myCode}</div>
          <Btn onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }} fullWidth variant="outline">{copied ? "✓ Copiado!" : "📋 Copiar link de conexão"}</Btn>
        </Card>
        <Card style={{ marginBottom: 16 }}>
          <SL>Adicionar pelo código de um amigo</SL>
          <input style={{ ...IS, marginBottom: 12, letterSpacing: 2, textTransform: "uppercase" }} placeholder="Cole o código aqui..." value={addCode} onChange={e => setAddCode(e.target.value.toUpperCase())} />
          <Btn onClick={() => {
            if (addCode.trim().length >= 6) {
              setContacts(cs => [...cs, { id: `c${Date.now()}`, name: "Novo amigo", code: addCode.toLowerCase(), emoji: "🌸", color: "#F43F5E", since: "agora", status: "online" }]);
              setAddCode(""); setView("home");
            }
          }} disabled={addCode.trim().length < 6} fullWidth>Enviar pedido de conexão</Btn>
        </Card>
        <div style={{ color: C.muted, fontSize: 11, fontWeight: 300, textAlign: "center", lineHeight: 1.7 }}>Nenhum dado seu é revelado até você aceitar a conexão.</div>
      </div>
    </Screen>
  );

  // CONTACT VIEW
  if (view === "contact" && activeContact) return (
    <Screen><Stars />
      <div style={{ position: "relative", zIndex: 1, padding: "56px 24px 0" }}>
        <button onClick={resetContact} style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: "8px 14px", color: C.cream, fontSize: 13, marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>← Voltar</button>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: `${activeContact.color}33`, border: `2px solid ${activeContact.color}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, margin: "0 auto 16px" }}>{activeContact.emoji}</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 400, marginBottom: 4 }}>{activeContact.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: activeContact.status === "online" ? C.sage : C.muted }} />
            <span style={{ color: C.muted, fontSize: 12 }}>{activeContact.status === "online" ? "Online agora" : "Visto recentemente"}</span>
          </div>
          <div style={{ color: C.muted, fontSize: 11 }}>Amiga desde {activeContact.since}</div>
        </div>
        {memories.filter(m => m.contactId === activeContact.id).length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <SL>Memórias com {activeContact.name}</SL>
            {memories.filter(m => m.contactId === activeContact.id).map((mem, i, arr) => (
              <div key={i} style={{ padding: "10px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.cardBorder}` : "none" }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{mem.person}</div>
                {mem.message && <div style={{ fontFamily: "'Fraunces', serif", fontSize: 12, fontStyle: "italic", color: C.muted, fontWeight: 300 }}>"{mem.message.substring(0, 60)}..."</div>}
              </div>
            ))}
          </Card>
        )}
        {!sendDone ? (
          <Card violet style={{ marginBottom: 16 }}>
            <SL>Enviar mensagem para {activeContact.name}</SL>
            <div style={{ color: C.muted, fontSize: 12, fontWeight: 300, marginBottom: 14, lineHeight: 1.6 }}>Ela receberá na entrada de mensagens e poderá guardar no baú dela.</div>
            {isRec && <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, padding: "8px 12px", background: `${C.rose}18`, border: `1px solid ${C.rose}44`, borderRadius: 10 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: C.rose, animation: "pulse 1s infinite" }} /><span style={{ color: C.roseLight, fontSize: 11 }}>Gravando áudio...</span></div>}
            <textarea style={{ ...IS, minHeight: 80, lineHeight: 1.6, marginBottom: 12 }} placeholder={`Escreva algo especial para ${activeContact.name}...`} value={sendText} onChange={e => setSendText(e.target.value)} rows={3} />
            <div style={{ display: "flex", gap: 8 }}>
              {speechOk && <button onClick={() => toggleRec(() => setSendText(""))} style={{ width: 44, height: 44, borderRadius: 12, background: isRec ? `${C.rose}33` : C.card, border: `1px solid ${isRec ? C.rose : C.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🎙</button>}
              <button style={{ width: 44, height: 44, borderRadius: 12, background: C.card, border: `1px solid ${C.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📷</button>
              <Btn onClick={() => sendText.trim() && setSendDone(true)} disabled={!sendText.trim()} style={{ flex: 1 }}>Enviar 🤍</Btn>
            </div>
          </Card>
        ) : (
          <Card style={{ textAlign: "center", padding: 24, border: `1px solid ${C.sage}44` }} className="fadeUp">
            <div style={{ fontSize: 40, marginBottom: 12 }}>🤍</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 400, marginBottom: 8 }}>Enviado para {activeContact.name}</div>
            <div style={{ color: C.muted, fontSize: 12, fontWeight: 300, marginBottom: 16 }}>Sua mensagem chegou na entrada de mensagens dela.</div>
            <Btn onClick={resetContact} fullWidth variant="ghost">Voltar ao Baú</Btn>
          </Card>
        )}
        {/* FIX #7 — clears activeContact after removing to prevent stale render */}
        <Btn variant="ghost" fullWidth onClick={() => { setContacts(cs => cs.filter(c => c.id !== activeContact.id)); setActiveContact(null); setView("home"); }} style={{ marginTop: 8 }}>Remover contato</Btn>
      </div>
    </Screen>
  );

  // SLIDESHOW — FIX #6: guards against empty filtered, uses safeFiltered
  if (view === "slideshow" && cur) return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: `radial-gradient(ellipse at 50% 30%,${cur.color}33 0%,${C.deep} 70%)`, position: "relative", overflow: "hidden" }}>
      <Stars />
      <button onClick={() => setView("home")} style={{ position: "absolute", top: 52, right: 24, zIndex: 10, background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: "8px 14px", color: C.cream, fontSize: 13 }}>✕ Fechar</button>
      {filtered.length === 0 && (
        <div style={{ position: "absolute", top: 52, left: 24, zIndex: 10 }}>
          <div style={{ color: C.muted, fontSize: 12, fontStyle: "italic" }}>Nenhuma memória nessa categoria ainda.</div>
        </div>
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 32px 40px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div className="fadeIn" style={{ width: 120, height: 120, borderRadius: "50%", background: `${cur.color}33`, border: `3px solid ${cur.color}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, marginBottom: 28, boxShadow: `0 0 60px ${cur.color}44`, animation: "breathe 3s ease infinite" }}>{cur.emoji}</div>
        <div className="fadeUp" style={{ fontFamily: "'Fraunces', serif", fontSize: 13, color: cur.color, fontWeight: 300, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>{cur.relation}</div>
        <div className="fadeUp" style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 400, marginBottom: 24, lineHeight: 1.3 }}>{cur.person}</div>
        {cur.message && <div className="fadeUp" style={{ background: `${cur.color}18`, border: `1px solid ${cur.color}33`, borderRadius: 20, padding: "20px 24px", marginBottom: 20, fontFamily: "'Fraunces', serif", fontSize: 16, fontStyle: "italic", fontWeight: 300, lineHeight: 1.7 }}>"{cur.message}"</div>}
        {cur.userNote && <div className="fadeIn" style={{ color: C.muted, fontSize: 13, fontWeight: 300, fontStyle: "italic", lineHeight: 1.6, maxWidth: 280 }}>{cur.userNote}</div>}
      </div>
      <div style={{ padding: "0 24px 48px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
          {safeFiltered.map((_, i) => <div key={i} style={{ width: i === slideIdx % safeFiltered.length ? 20 : 8, height: 8, borderRadius: 4, background: i === slideIdx % safeFiltered.length ? cur.color : `${C.muted}44`, transition: "all .3s" }} />)}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => setSlideIdx(i => Math.max(0, i - 1))} style={{ flex: 1, padding: 14, borderRadius: 16, background: C.card, border: `1px solid ${C.cardBorder}`, color: C.cream, fontSize: 14, fontFamily: "'Mulish', sans-serif" }}>← Anterior</button>
          <button onClick={() => setSlideIdx(i => (i + 1) % safeFiltered.length)} style={{ flex: 1, padding: 14, borderRadius: 16, background: cur.color, border: "none", color: C.deep, fontSize: 14, fontWeight: 700, fontFamily: "'Mulish', sans-serif" }}>Próxima →</button>
        </div>
      </div>
    </div>
  );

  // ADD MEMORY
  if (view === "add") return (
    <Screen><Stars />
      <div style={{ position: "relative", zIndex: 1, padding: "56px 24px 0" }}>
        <button onClick={() => { setView("home"); setAddStep(0); setNm({ person: "", relation: "", emoji: "💛", love: "", userNote: "", color: "#F59E0B" }); }} style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, padding: "8px 14px", color: C.cream, fontSize: 13, marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>← Voltar</button>
        <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>{[0, 1, 2, 3].map(i => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= addStep ? C.violetLight : `${C.violet}33`, transition: "all .3s" }} />)}</div>
        {addStep === 0 && <div className="fadeUp">
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, marginBottom: 20 }}>Quem é essa pessoa especial?</div>
          <input style={{ ...IS, marginBottom: 10 }} placeholder="Nome ou apelido..." value={nm.person} onChange={e => setNm(m => ({ ...m, person: e.target.value }))} />
          <input style={{ ...IS, marginBottom: 20 }} placeholder="Relação (mãe, melhor amiga, eu mesma...)" value={nm.relation} onChange={e => setNm(m => ({ ...m, relation: e.target.value }))} />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>{EMOJIS.map(em => <button key={em} onClick={() => setNm(m => ({ ...m, emoji: em }))} style={{ width: 42, height: 42, borderRadius: 12, fontSize: 22, background: nm.emoji === em ? `${C.violet}44` : C.card, border: `1px solid ${nm.emoji === em ? C.violetLight : C.cardBorder}` }}>{em}</button>)}</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>{COLORS.map(col => <button key={col} onClick={() => setNm(m => ({ ...m, color: col }))} style={{ width: 32, height: 32, borderRadius: "50%", background: col, flex: "none", border: `3px solid ${nm.color === col ? C.cream : "transparent"}`, transition: "all .2s" }} />)}</div>
          <Btn onClick={() => nm.person && setAddStep(1)} fullWidth disabled={!nm.person}>Continuar →</Btn>
        </div>}
        {addStep === 1 && <div className="fadeUp">
          <div style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}>{nm.emoji}</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400, textAlign: "center", marginBottom: 20 }}>{nm.person}</div>
          <SL>O que você mais ama nessa pessoa?</SL>
          <textarea style={{ ...IS, minHeight: 100, lineHeight: 1.6 }} placeholder="Escreva de coração..." value={nm.love} onChange={e => setNm(m => ({ ...m, love: e.target.value }))} rows={4} />
          <div style={{ color: C.muted, fontSize: 11, fontWeight: 300, marginTop: 8, marginBottom: 20 }}>Só você vê isso.</div>
          <Btn onClick={() => setAddStep(2)} fullWidth>Continuar →</Btn>
          <button onClick={() => setAddStep(2)} style={{ background: "none", color: C.muted, fontSize: 12, marginTop: 12, textAlign: "center", width: "100%" }}>Pular</button>
        </div>}
        {addStep === 2 && <div className="fadeUp">
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 400, marginBottom: 8 }}>Convide {nm.person} a te enviar uma mensagem especial</div>
          <div style={{ color: C.muted, fontSize: 13, fontWeight: 300, lineHeight: 1.7, marginBottom: 20 }}>Compartilhe este link. {nm.person} escreve uma mensagem que fica no seu Baú para sempre.</div>
          <Card violet style={{ marginBottom: 16, textAlign: "center", padding: 20 }}>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>Link personalizado</div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 13, color: C.violetLight, fontStyle: "italic" }}>youarenotalone.app/msg/{nm.person.toLowerCase().replace(/\s/g, "-")}</div>
          </Card>
          <Btn onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }} fullWidth variant="outline" style={{ marginBottom: 12 }}>{copied ? "✓ Copiado!" : "📋 Copiar link"}</Btn>
          <Btn onClick={() => setAddStep(3)} fullWidth>Continuar</Btn>
        </div>}
        {addStep === 3 && <div className="fadeUp" style={{ textAlign: "center" }}>
          <div style={{ fontSize: 72, marginBottom: 20, animation: "breathe 2s ease infinite" }}>✨</div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 400, marginBottom: 12 }}>{nm.person} está no seu Baú</div>
          <div style={{ color: C.muted, fontSize: 13, fontWeight: 300, lineHeight: 1.7, marginBottom: 32 }}>Nos momentos difíceis, essa memória estará esperando por você.</div>
          <Btn onClick={() => { setMemories(m => [...m, { ...nm, id: Date.now(), message: null, contactId: null }]); setView("home"); setAddStep(0); setNm({ person: "", relation: "", emoji: "💛", love: "", userNote: "", color: "#F59E0B" }); }} fullWidth>Ver meu Baú →</Btn>
        </div>}
      </div>
    </Screen>
  );

  // HOME
  return (
    <Screen><Stars />
      <div style={{ position: "relative", zIndex: 1, padding: "56px 24px 0" }}>
        <SL>Baú de Memórias</SL>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 400 }}>As pessoas que te amam</div>
          <button onClick={() => setView("inbox")} style={{ background: unread > 0 ? `${C.violet}33` : C.card, border: `1px solid ${unread > 0 ? C.violetLight : C.cardBorder}`, borderRadius: 12, padding: "8px 12px", color: unread > 0 ? C.violetLight : C.muted, fontSize: 11, fontWeight: 600, fontFamily: "'Mulish', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
            📬 {unread > 0 ? `${unread} nova${unread > 1 ? "s" : ""}` : "Entrada"}
            {unread > 0 && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.rose }} />}
          </button>
        </div>
        <div style={{ color: C.muted, fontSize: 13, fontWeight: 300, marginBottom: 20 }}>Para quando você esquecer o quanto é amada.</div>
        <Card style={{ marginBottom: 20 }}>
          <SL>Como você está agora?</SL>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {CRISIS_MODES.map(mode => (
              <button key={mode.id} onClick={() => { setSlideMode(mode); setSlideIdx(0); setView("slideshow"); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: C.cardViolet, border: `1px solid ${C.violet}33`, borderRadius: 14, color: C.cream, textAlign: "left", width: "100%", fontFamily: "'Mulish', sans-serif", transition: "all .2s" }}>
                <span style={{ fontSize: 22 }}>{mode.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 400 }}>{mode.label}</span>
                <span style={{ marginLeft: "auto", color: C.muted, fontSize: 12 }}>ver →</span>
              </button>
            ))}
          </div>
        </Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <SL style={{ marginBottom: 0 }}>Amigos conectados ({contacts.length})</SL>
          <button onClick={() => setView("addContact")} style={{ background: `${C.violet}22`, border: `1px solid ${C.violet}44`, borderRadius: 10, padding: "5px 12px", color: C.violetLight, fontSize: 11, fontWeight: 600, fontFamily: "'Mulish', sans-serif" }}>+ Adicionar</button>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
          {contacts.map(c => (
            <button key={c.id} onClick={() => { setActiveContact(c); setSendDone(false); setSendText(""); setView("contact"); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", flexShrink: 0 }}>
              <div style={{ position: "relative" }}>
                <div style={{ width: 56, height: 56, borderRadius: 18, background: `${c.color}33`, border: `2px solid ${c.color}66`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{c.emoji}</div>
                {c.status === "online" && <div style={{ position: "absolute", bottom: 2, right: 2, width: 12, height: 12, borderRadius: "50%", background: C.sage, border: `2px solid ${C.deep}` }} />}
              </div>
              <span style={{ fontSize: 10, color: C.muted, fontWeight: 500, maxWidth: 56, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
            </button>
          ))}
          <button onClick={() => setView("addContact")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, background: "none", border: "none", flexShrink: 0 }}>
            <div style={{ width: 56, height: 56, borderRadius: 18, background: C.card, border: `2px dashed ${C.cardBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: C.muted }}>+</div>
            <span style={{ fontSize: 10, color: C.muted }}>Adicionar</span>
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <SL style={{ marginBottom: 0 }}>Memórias ({memories.length})</SL>
          <button onClick={() => setView("add")} style={{ background: `${C.violet}22`, border: `1px solid ${C.violet}44`, borderRadius: 10, padding: "5px 12px", color: C.violetLight, fontSize: 11, fontWeight: 600, fontFamily: "'Mulish', sans-serif" }}>+ Nova</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {memories.map(mem => (
            <button key={mem.id} onClick={() => { setSlideMode({ id: "single", filter: null }); setSlideIdx(memories.findIndex(m => m.id === mem.id)); setView("slideshow"); }} style={{ background: `${mem.color}18`, border: `1px solid ${mem.color}44`, borderRadius: 20, padding: 18, textAlign: "center", cursor: "pointer", fontFamily: "'Mulish', sans-serif" }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>{mem.emoji}</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 13, fontWeight: 400, color: C.cream, marginBottom: 4, lineHeight: 1.3 }}>{mem.person}</div>
              <div style={{ fontSize: 10, color: mem.color, fontWeight: 600, textTransform: "uppercase", letterSpacing: .8 }}>{mem.relation}</div>
              {mem.message && <div style={{ marginTop: 8, width: 8, height: 8, borderRadius: "50%", background: C.sage, margin: "8px auto 0" }} />}
            </button>
          ))}
          <button onClick={() => setView("add")} style={{ background: C.card, border: `2px dashed ${C.cardBorder}`, borderRadius: 20, padding: 18, textAlign: "center", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 120 }}>
            <div style={{ fontSize: 28, color: C.muted }}>+</div>
            <div style={{ fontSize: 11, color: C.muted }}>Adicionar memória</div>
          </button>
        </div>
      </div>
    </Screen>
  );
};

// ─────────────────────────────────────────────────────────────
// NETWORK
// ─────────────────────────────────────────────────────────────
const NetworkScreen = () => (
  <Screen><Stars />
    <div style={{ position: "relative", zIndex: 1, padding: "56px 24px 0" }}>
      <SL>Rede de apoio</SL>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 400, marginBottom: 8 }}>Profissionais credenciados</div>
      <div style={{ color: C.muted, fontSize: 13, fontWeight: 300, marginBottom: 24 }}>Todos verificados e credenciados pelo CFP ou CFM.</div>
      <Card warm style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: C.roseLight, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>🆘 Emergência imediata</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[{ name: "CVV — Centro de Valorização da Vida", number: "188", desc: "24h · gratuito · sigilo total" }, { name: "SAMU", number: "192", desc: "Emergências médicas" }, { name: "Bombeiros", number: "193", desc: "Risco de vida imediato" }].map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div><div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div><div style={{ color: C.muted, fontSize: 11, fontWeight: 300 }}>{c.desc}</div></div>
              <button style={{ background: `${C.rose}22`, border: `1px solid ${C.rose}44`, borderRadius: 12, padding: "8px 14px", color: C.roseLight, fontFamily: "'Mulish', sans-serif", fontWeight: 700, fontSize: 16 }}>{c.number}</button>
            </div>
          ))}
        </div>
      </Card>
      <SL>Psicólogos disponíveis</SL>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
        {PROFESSIONALS.map((p, i) => (
          <Card key={i} style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}>
            <div style={{ width: 46, height: 46, borderRadius: 16, background: `linear-gradient(135deg,${C.violet},${C.violetLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, fontFamily: "'Fraunces', serif", fontWeight: 600, color: C.cream }}>{p.name.split(" ")[1][0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                {p.online && <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.sage }} />}
              </div>
              <div style={{ color: C.muted, fontSize: 11, fontWeight: 300, marginBottom: 4 }}>{p.spec}</div>
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{ fontSize: 11, color: C.amber }}>★ {p.rating}</span>
                <span style={{ fontSize: 11, color: C.violetLight }}>{p.price}</span>
              </div>
            </div>
            <div style={{ color: C.muted, fontSize: 18 }}>›</div>
          </Card>
        ))}
      </div>
    </div>
  </Screen>
);

// ─────────────────────────────────────────────────────────────
// PROFILE
// FIX #8 — restored days counter from v1
// ─────────────────────────────────────────────────────────────
const ProfileScreen = ({ userData, onLogout }) => {
  const [joinedDays] = useState(1); // simulated — would be calculated from account creation date

  return (
    <Screen><Stars />
      <div style={{ position: "relative", zIndex: 1, padding: "56px 24px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: `linear-gradient(135deg,${C.violet},${C.violetLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontSize: 28, color: C.cream }}>{(userData?.name || "V")[0].toUpperCase()}</div>
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 400 }}>{userData?.name || "Você"}</div>
            <div style={{ color: C.muted, fontSize: 12, fontWeight: 300 }}>Membro desde hoje</div>
          </div>
        </div>
        {/* Days counter restored from v1 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <Card violet style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 300, color: C.violetLight }}>{joinedDays}</div>
            <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>dia{joinedDays !== 1 ? "s" : ""} de jornada</div>
          </Card>
          <Card warm style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 32, fontWeight: 300, color: C.roseLight }}>0</div>
            <div style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>crises atravessadas</div>
          </Card>
        </div>
        {userData?.emergencyName && <Card warm style={{ marginBottom: 14 }}><SL>Contato de emergência</SL><div style={{ fontSize: 14, fontWeight: 500 }}>{userData.emergencyName}</div><div style={{ color: C.muted, fontSize: 12, fontWeight: 300 }}>{userData.emergencyPhone} · {userData.emergencyType}</div></Card>}
        {userData?.psychName && <Card violet style={{ marginBottom: 14 }}><SL>Psicólogo(a) de referência</SL><div style={{ fontSize: 14, fontWeight: 500 }}>{userData.psychName}</div><div style={{ color: C.muted, fontSize: 12, fontWeight: 300 }}>{userData.psychPhone}</div></Card>}
        {userData?.meds && <Card style={{ marginBottom: 14 }}><SL>Medicação registrada</SL><div style={{ fontSize: 14, color: C.mutedLight, fontWeight: 300 }}>{userData.meds}</div></Card>}
        {userData?.triggers && <Card style={{ marginBottom: 14 }}><SL>Gatilhos conhecidos</SL><div style={{ fontSize: 13, color: C.mutedLight, fontWeight: 300, lineHeight: 1.6 }}>{userData.triggers}</div></Card>}
        <div style={{ display: "flex", flexDirection: "column", gap: 1, marginBottom: 16 }}>
          {[{ icon: "🔔", l: "Notificações" }, { icon: "🔒", l: "Privacidade e dados" }, { icon: "✏️", l: "Editar perfil" }, { icon: "📋", l: "Termos de uso" }].map((it, i, arr) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px", background: C.card, borderRadius: i === 0 ? "14px 14px 4px 4px" : i === arr.length - 1 ? "4px 4px 14px 14px" : "4px", border: `1px solid ${C.cardBorder}`, marginBottom: 1, cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}><span>{it.icon}</span><span>{it.l}</span></div>
              <span style={{ color: C.muted }}>›</span>
            </div>
          ))}
        </div>
        <Card style={{ marginBottom: 16, textAlign: "center", padding: 20 }}><div style={{ color: C.muted, fontSize: 12, fontWeight: 300, lineHeight: 1.7 }}>Este app é apoio emocional. Não é terapia, não é diagnóstico. Em emergências: CVV 188.</div></Card>
        <Btn variant="ghost" onClick={onLogout} fullWidth>Sair</Btn>
      </div>
    </Screen>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("splash");
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [crisisMode, setCrisisMode] = useState(false);
  const [inboxMsgs, setInboxMsgs] = useState(INBOX_INIT);

  const unread = inboxMsgs.filter(m => !m.liked && !m.saved).length;
  const handleDone = (data) => { setUserData(data); setScreen("app"); };
  const handleCrisis = () => { setCrisisMode(true); setActiveTab("chat"); };
  const handleNav = (tab) => { if (tab === "chat") setCrisisMode(false); setActiveTab(tab); };

  const renderTab = () => {
    switch (activeTab) {
      case "home":    return <HomeScreen userData={userData} onNav={handleNav} onCrisis={handleCrisis} />;
      case "chat":    return <ChatScreen userData={userData} isCrisis={crisisMode} />;
      case "chest":   return <MemoryChestScreen inboxMsgs={inboxMsgs} setInboxMsgs={setInboxMsgs} />;
      case "tools":   return <ToolsScreen />;
      case "network": return <NetworkScreen />;
      case "profile": return <ProfileScreen userData={userData} onLogout={() => { setUserData(null); setScreen("onboarding"); }} />;
      default:        return <HomeScreen userData={userData} onNav={handleNav} onCrisis={handleCrisis} />;
    }
  };

  return (
    <>
      <GlobalStyle />
      <div style={{ height: "100vh", width: "100vw", display: "flex", justifyContent: "center", alignItems: "center", background: "#08060F" }}>
        <div style={{ width: "100%", maxWidth: 430, height: "100%", maxHeight: 860, background: C.deep, borderRadius: window.innerWidth > 480 ? 48 : 0, overflow: "hidden", position: "relative", boxShadow: window.innerWidth > 480 ? `0 40px 120px rgba(0,0,0,.9),0 0 60px ${C.violet}22` : "none" }}>
          {screen === "splash"     && <SplashScreen onDone={() => setScreen("onboarding")} />}
          {screen === "onboarding" && <OnboardingScreen onDone={handleDone} />}
          {screen === "app"        && <>{renderTab()}<BottomNav active={activeTab} onNav={handleNav} inboxCount={unread} /></>}
        </div>
      </div>
    </>
  );
}
