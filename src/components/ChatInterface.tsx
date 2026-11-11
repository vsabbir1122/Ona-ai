import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Code2,
  Copy,
  Check,
  Sparkles,
  Play,
  RotateCcw,
  Zap,
  Info,
  Smartphone,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Terminal,
  Clock,
  Download,
  Flame,
  Volume1
} from 'lucide-react';
import { ChatMessage, ActionPayload, CodeSnippet } from '../types';
import { HolographicOrb, OrbState } from './HolographicOrb';
import { soundFx } from '../utils/soundEffects';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  onExecuteAction: (payload: ActionPayload) => void;
  onClearChat: () => void;
  onOpenIntegrationGuide: () => void;
  onOpenApkModal: () => void;
  isMobileDeviceView?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isLoading,
  onSendMessage,
  onExecuteAction,
  onClearChat,
  onOpenIntegrationGuide,
  onOpenApkModal,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechSynthesisActive, setSpeechSynthesisActive] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const { isInstallable, install } = usePWAInstall();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);

  // Determine current orb state
  let orbState: OrbState = 'idle';
  if (isListening) orbState = 'listening';
  else if (isLoading) orbState = 'thinking';
  else if (speechSynthesisActive) orbState = 'speaking';

  // Check speech recognition support once on mount
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleToggleMic = () => {
    soundFx.playClick();
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('আপনার ব্রাউজারে স্পিচ রিকগনিশন সক্রিয় নেই। দয়া করে লিখে পাঠান ভাই।');
      return;
    }

    // If currently listening, abort and stop immediately
    if (isListeningRef.current || isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
      isListeningRef.current = false;
      setIsListening(false);
      return;
    }

    // Always abort any lingering previous instance before starting fresh
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'bn-BD';

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        isListeningRef.current = false;
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.onerror = (err: any) => {
        if (err.error !== 'aborted' && err.error !== 'no-speech') {
          console.warn('Speech recognition error:', err.error);
        }
        isListeningRef.current = false;
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Could not start recognition:', err);
      isListeningRef.current = false;
      setIsListening(false);
      recognitionRef.current = null;
    }
  };

  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    soundFx.setEnabled(nextVal);
    if (nextVal) soundFx.playClick();
  };

  const handleSpeakText = async (text: string, msgId: string) => {
    if (speechSynthesisActive === msgId) {
      window.speechSynthesis.cancel();
      setSpeechSynthesisActive(null);
      return;
    }

    setSpeechSynthesisActive(msgId);

    // Try server TTS first
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audioData) {
          const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioData}`);
          audio.onended = () => setSpeechSynthesisActive(null);
          audio.onerror = () => fallbackBrowserSpeech(text, msgId);
          await audio.play();
          return;
        }
      }
    } catch {
      // Fallback
    }

    fallbackBrowserSpeech(text, msgId);
  };

  const fallbackBrowserSpeech = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) {
      setSpeechSynthesisActive(null);
      return;
    }
    window.speechSynthesis.cancel();

    const cleanToSpeak = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[#*_`]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanToSpeak);
    utterance.lang = 'bn-BD';
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const bnVoice = voices.find((v) => v.lang.includes('bn') || v.name.includes('Bangla'));
    if (bnVoice) utterance.voice = bnVoice;

    utterance.onend = () => setSpeechSynthesisActive(null);
    utterance.onerror = () => setSpeechSynthesisActive(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    soundFx.playClick();
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const quickPrompts = [
    { label: '🎵 গান বাজাও', text: 'ইউটিউবে হাবিব ওয়াহিদের জনপ্রিয় গানটি চালাও' },
    { label: '📞 আম্মুকে কল দাও', text: 'আম্মুকে এখনই কল লাগাও' },
    { label: '⏰ সকাল ৭টায় অ্যালার্ম', text: 'আগামীকাল সকাল ০৭:০০ টায় অ্যালার্ম সেট করো' },
    { label: '🔦 টর্চ জ্বালাও', text: 'ফোনের ফ্ল্যাশলাইট অন করো' },
    { label: '💻 Flutter কোড', text: 'Flutter-এ একটি সুন্দর আধুনিক লগইন পেজের কোড লিখে দাও' },
    { label: '❤️ কেমন আছো?', text: 'কেমন আছো ওনা? আজকে আমার মনটা বেশ ভালো!' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950/70 border-r border-slate-800/80 backdrop-blur-md relative overflow-hidden">
      {/* Ona AI Companion Holographic Header */}
      <div className="px-4 sm:px-6 py-3.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between backdrop-blur-md z-10 shadow-sm">
        {/* Left: Holographic Orb + Name */}
        <div className="flex items-center gap-3">
          <HolographicOrb
            state={orbState}
            onClick={handleToggleMic}
            size="md"
          />

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-white tracking-wide">
                ওনা এআই (Ona AI)
              </h1>
              <span className="text-[10px] bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
                Companion &amp; OS Agent
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              ঘনিষ্ঠ বন্ধু • প্রোগ্রামার • ফুল মোবাইল অটোমেশন
            </p>
          </div>
        </div>

        {/* Right: Controls & APK Action */}
        <div className="flex items-center gap-2">
          {/* APK Creation & Setup Button */}
          <button
            onClick={() => {
              soundFx.playClick();
              onOpenApkModal();
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-cyan-500/20 active:scale-95"
            title="APK ডাউনলোড ও গাইড"
          >
            <Smartphone className="w-3.5 h-3.5 fill-slate-950" />
            <span>APK তৈরি ও গাইড</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={handleToggleSound}
            title={soundEnabled ? 'সাউন্ড অন' : 'সাউন্ড অফ'}
            className={`p-2 rounded-xl border text-xs transition ${
              soundEnabled
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Clear Chat */}
          <button
            onClick={() => {
              soundFx.playClick();
              onClearChat();
            }}
            title="চ্যাট রিসেট"
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-rose-400 border border-slate-700/50 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isSpeaking={speechSynthesisActive === message.id}
            onSpeak={() => handleSpeakText(message.cleanText, message.id)}
            onExecuteAction={onExecuteAction}
          />
        ))}

        {isLoading && (
          <div className="flex items-start gap-3 animate-in fade-in">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-xs text-slate-950 font-bold shadow-md">
              🌸
            </div>
            <div className="bg-slate-900 border border-slate-800/90 rounded-3xl rounded-tl-sm px-4 py-3 text-slate-300 text-xs sm:text-sm flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-slate-400 ml-1 font-medium">
                ওনা আপনার নির্দেশনা প্রসেস করছে...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Streamlined Quick Bengali Prompts Bar */}
      <div className="bg-slate-900/60 border-t border-slate-800/70 px-3 py-2 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-slate-500 font-medium shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            দ্রুত নির্দেশ:
          </span>
          {quickPrompts.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                soundFx.playClick();
                onSendMessage(item.text);
              }}
              className="text-xs bg-slate-800/80 hover:bg-cyan-500/20 hover:border-cyan-500/50 text-slate-200 hover:text-cyan-200 border border-slate-700/60 px-3 py-1.5 rounded-full shrink-0 transition"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form Bar */}
      <form
        onSubmit={handleSubmit}
        className="p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2 backdrop-blur-md"
      >
        {/* Voice Input Mic Button */}
        <button
          type="button"
          onClick={handleToggleMic}
          className={`relative p-3 rounded-2xl border transition flex items-center justify-center ${
            isListening
              ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.6)]'
              : 'bg-slate-800/80 text-slate-300 border-slate-700/60 hover:text-cyan-300 hover:border-cyan-500/40'
          }`}
          title={isListening ? 'শোনা বন্ধ করুন' : 'বাংলায় কথা বলুন (Mic)'}
        >
          {isListening ? <Mic className="w-5 h-5 animate-bounce" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isListening
                ? 'আমি শুনছি, বলুন... (যেমন: ইউটিউবে গান চালাও)'
                : 'ওনাকে বাংলায় কিছু বলুন... (গান, কল, অ্যালার্ম, কোডিং বা আড্ডা)'
            }
            className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition shadow-inner"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold transition shadow-lg shadow-cyan-500/20 active:scale-95"
          title="পাঠান"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

// Message Bubble Component
const MessageBubble: React.FC<{
  message: ChatMessage;
  isSpeaking: boolean;
  onSpeak: () => void;
  onExecuteAction: (payload: ActionPayload) => void;
}> = ({ message, isSpeaking, onSpeak, onExecuteAction }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-2.5 sm:gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 shadow ${
          isUser
            ? 'bg-slate-800 text-cyan-300 border border-slate-700'
            : 'bg-gradient-to-tr from-cyan-500 to-emerald-500 text-slate-950 shadow-cyan-500/20'
        }`}
      >
        {isUser ? 'YOU' : '🌸'}
      </div>

      {/* Bubble Content */}
      <div className={`flex flex-col space-y-2 max-w-[85%] sm:max-w-[78%]`}>
        <div
          className={`rounded-3xl p-4 text-sm leading-relaxed ${
            isUser
              ? 'bg-cyan-600 text-white rounded-tr-sm shadow-md'
              : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-sm shadow-md'
          }`}
        >
          <div className="whitespace-pre-wrap">{message.cleanText}</div>

          <div
            className={`flex items-center justify-between mt-2 pt-2 border-t text-[10px] ${
              isUser ? 'border-cyan-500/30 text-cyan-200' : 'border-slate-800 text-slate-400'
            }`}
          >
            <span>
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>

            {!isUser && (
              <button
                onClick={onSpeak}
                className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full transition ${
                  isSpeaking
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse'
                    : 'hover:text-cyan-300 text-slate-400 bg-slate-800/60'
                }`}
                title="বাংলায় শুনুন"
              >
                <Volume2 className="w-3 h-3" />
                <span>{isSpeaking ? 'শোনাচ্ছে...' : 'শুনুন'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Structured Device Action Payload Card */}
        {message.actionPayload && (
          <ActionPayloadCard
            payload={message.actionPayload}
            onExecute={() => onExecuteAction(message.actionPayload!)}
          />
        )}

        {/* Code Snippets */}
        {message.codeSnippets && message.codeSnippets.length > 0 && (
          <div className="space-y-2">
            {message.codeSnippets.map((snippet, idx) => (
              <CodeBlockCard key={idx} snippet={snippet} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Automation Action Payload Card
const ActionPayloadCard: React.FC<{
  payload: ActionPayload;
  onExecute: () => void;
}> = ({ payload, onExecute }) => {
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyJson = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTargetIcon = (app: string) => {
    switch (app.toLowerCase()) {
      case 'youtube':
        return '▶️';
      case 'phone':
        return '📞';
      case 'clock':
        return '⏰';
      case 'settings':
        return '⚙️';
      case 'camera':
        return '📸';
      case 'spotify':
        return '🎵';
      case 'messages':
        return '💬';
      default:
        return '⚡';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-3.5 shadow-xl shadow-emerald-950/20 text-xs animate-in zoom-in-95">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xl">{getTargetIcon(payload.target_app)}</span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-xs">{payload.target_app}</span>
              <span className="text-[10px] text-emerald-400 font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                {payload.action_type}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">অটোমেশন ইন্টেন্ট প্রস্তুত</span>
          </div>
        </div>

        <button
          onClick={() => {
            soundFx.playIntentDispatched();
            onExecute();
          }}
          className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-3 py-1.5 rounded-xl font-bold transition shadow-md active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-slate-950" />
          <span>ফোনে রান করুন</span>
        </button>
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
        <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800">
          <span className="text-slate-500 block text-[9px] uppercase">Command</span>
          <span className="text-cyan-300 font-semibold">{payload.command}</span>
        </div>
        <div className="bg-slate-950/70 p-2 rounded-xl border border-slate-800 truncate">
          <span className="text-slate-500 block text-[9px] uppercase">Query / Parameter</span>
          <span className="text-amber-300 font-semibold truncate block">
            {payload.query || 'None'}
          </span>
        </div>
      </div>

      <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
        <button
          onClick={() => setShowJson(!showJson)}
          className="flex items-center gap-1 hover:text-cyan-300 transition"
        >
          <Terminal className="w-3 h-3" />
          <span>Action Payload (JSON) {showJson ? 'লুকান' : 'দেখুন'}</span>
          {showJson ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <button
          onClick={handleCopyJson}
          className="flex items-center gap-1 hover:text-emerald-300 transition"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'কপি হয়েছে!' : 'JSON কপি'}</span>
        </button>
      </div>

      {showJson && (
        <pre className="mt-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-[10px] text-cyan-300 font-mono overflow-x-auto leading-relaxed">
          {JSON.stringify(payload, null, 2)}
        </pre>
      )}
    </div>
  );
};

// Code Block Card
const CodeBlockCard: React.FC<{ snippet: CodeSnippet }> = ({ snippet }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    soundFx.playClick();
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
      <div className="bg-slate-900/90 px-3.5 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-400">
          <Code2 className="w-3.5 h-3.5" />
          <span>{snippet.title || snippet.language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg text-slate-300 transition"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'কপিকৃত!' : 'কপি করুন'}</span>
        </button>
      </div>
      <div className="p-3.5 overflow-x-auto max-h-72">
        <pre className="text-xs font-mono text-emerald-300/90 leading-relaxed whitespace-pre">
          {snippet.code}
        </pre>
      </div>
    </div>
  );
};
