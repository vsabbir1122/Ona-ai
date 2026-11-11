import React, { useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Smartphone, Download, Sparkles, Layers, Sliders, ExternalLink } from 'lucide-react';
import { ChatMessage, DeviceState, ActionPayload } from './types';
import { parseOnaResponse } from './utils/parser';
import { ChatInterface } from './components/ChatInterface';
import { PhoneSimulator } from './components/PhoneSimulator';
import { IntegrationGuideModal } from './components/IntegrationGuideModal';
import { ApkGenerationModal } from './components/ApkGenerationModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { soundFx } from './utils/soundEffects';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    role: 'model',
    content: `আসসালামু আলাইকুম ভাই! আমি 'ওনা' (Ona AI)—তোমার সার্বক্ষণিক কাছের বন্ধু, প্রোগ্রামিং এক্সপার্ট এবং পুরো মোবাইল ফোনের অটোমেশন কন্ট্রোলার।

তোমার ফোনের যেকোনো কাজ—যেমন ইউটিউবে গান চালানো, কাউকে ফোন দেওয়া, অ্যালার্ম দেওয়া, সেটিংস পরিবর্তন করা থেকে শুরু করে যেকোনো কোড লেখা কিংবা আড্ডা দেওয়া—সবকিছুতেই আমি তোমার সাথে আছি।

বলো দোস্ত, এখনই তোমার ফোনের জন্য কী করে দেবো?`,
    cleanText: `আসসালামু আলাইকুম ভাই! আমি 'ওনা' (Ona AI)—তোমার সার্বক্ষণিক কাছের বন্ধু, প্রোগ্রামিং এক্সপার্ট এবং পুরো মোবাইল ফোনের অটোমেশন কন্ট্রোলার।

তোমার ফোনের যেকোনো কাজ—যেমন ইউটিউবে গান চালানো, কাউকে ফোন দেওয়া, অ্যালার্ম দেওয়া, সেটিংস পরিবর্তন করা থেকে শুরু করে যেকোনো কোড লেখা কিংবা আড্ডা দেওয়া—সবকিছুতেই আমি তোমার সাথে আছি।

বলো দোস্ত, এখনই তোমার ফোনের জন্য কী করে দেবো?`,
    timestamp: Date.now() - 60000,
    codeSnippets: [],
  },
];

const INITIAL_DEVICE_STATE: DeviceState = {
  battery: 92,
  isCharging: false,
  wifi: true,
  bluetooth: true,
  flashlight: false,
  volume: 85,
  brightness: 90,
  dnd: false,
  activeApp: 'home',
  activeAlarm: {
    time: '07:00 AM',
    label: 'সকালের ঘুম ভাঙানি',
    enabled: true,
  },
  activeCall: null,
  nowPlaying: null,
  lastAction: null,
};

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [deviceState, setDeviceState] = useState<DeviceState>(INITIAL_DEVICE_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showApkModal, setShowApkModal] = useState(false);
  const [activeMobileView, setActiveMobileView] = useState<'chat' | 'phone'>('chat');

  const { isInstallable, install } = usePWAInstall();

  const appUrl =
    typeof window !== 'undefined' && window.location.origin && !window.location.origin.includes('localhost')
      ? window.location.origin
      : 'https://ais-pre-wdp3amr3wd3fv7mfqkhsrl-160296201066.asia-east1.run.app';

  // Trigger automation payload on simulated device
  const executeDeviceAction = useCallback((payload: ActionPayload) => {
    // Play sound and fire visual feedback confetti
    soundFx.playIntentDispatched();
    try {
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {
      // ignore
    }

    setDeviceState((prev) => {
      let nextApp = prev.activeApp;
      let nextNowPlaying = prev.nowPlaying;
      let nextCall = prev.activeCall;
      let nextAlarm = prev.activeAlarm;
      let nextFlashlight = prev.flashlight;
      let nextWifi = prev.wifi;
      let nextVolume = prev.volume;

      const target = (payload.target_app || '').toLowerCase();
      const actionType = (payload.action_type || '').toUpperCase();
      const query = payload.query || '';

      if (target === 'youtube' || (actionType === 'EXECUTE_INTENT' && target.includes('youtube'))) {
        nextApp = 'YouTube';
        nextNowPlaying = {
          title: query || 'জনপ্রিয় গান',
          artist: 'YouTube Music Official',
          isPlaying: true,
          app: 'YouTube',
        };
      } else if (
        target === 'phone' ||
        actionType === 'CALL_CONTACT' ||
        target.includes('phone') ||
        target.includes('call')
      ) {
        nextApp = 'Phone';
        nextCall = {
          contact: payload.details?.contact_name || query || 'আম্মু',
          number: payload.details?.number || '+8801711223344',
          inCall: true,
          duration: 0,
        };
      } else if (target === 'clock' || actionType === 'SET_ALARM' || target.includes('alarm')) {
        nextApp = 'Clock';
        nextAlarm = {
          time: payload.details?.time || query || '07:00 AM',
          label: payload.details?.label || 'সকালের ঘুম ভাঙানি',
          enabled: true,
        };
      } else if (target === 'settings' || actionType === 'SET_SETTING') {
        nextApp = 'Settings';
        const q = query.toLowerCase();
        if (q.includes('flashlight') || q.includes('torch')) {
          nextFlashlight =
            payload.details?.value !== undefined ? !!payload.details.value : !prev.flashlight;
        } else if (q.includes('wifi')) {
          nextWifi =
            payload.details?.value !== undefined ? !!payload.details.value : !prev.wifi;
        } else if (q.includes('volume')) {
          nextVolume =
            typeof payload.details?.value === 'number' ? payload.details.value : 70;
        }
      } else if (target === 'camera') {
        nextApp = 'Camera';
      } else if (target === 'spotify' || target.includes('music')) {
        nextApp = 'Spotify';
        nextNowPlaying = {
          title: query || 'বাছাইকৃত বাংলা প্লেলিস্ট',
          artist: 'Spotify Hits',
          isPlaying: true,
          app: 'Spotify',
        };
      } else if (target === 'messages' || actionType === 'SEND_SMS') {
        nextApp = 'Messages';
      }

      return {
        ...prev,
        activeApp: nextApp,
        nowPlaying: nextNowPlaying,
        activeCall: nextCall,
        activeAlarm: nextAlarm,
        flashlight: nextFlashlight,
        wifi: nextWifi,
        volume: nextVolume,
        lastAction: {
          payload,
          timestamp: Date.now(),
          executed: true,
        },
      };
    });
  }, []);

  // Send message to Ona AI API
  const handleSendMessage = async (text: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      cleanText: text,
      timestamp: Date.now(),
      codeSnippets: [],
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const rawText = data.text || 'কোনো উত্তর পাওয়া যায়নি ভাই।';

      const parsed = parseOnaResponse(rawText);

      const aiMessage: ChatMessage = {
        id: `ona-${Date.now()}`,
        role: 'model',
        content: rawText,
        cleanText: parsed.cleanText || rawText,
        timestamp: Date.now(),
        actionPayload: parsed.actionPayload,
        codeSnippets: parsed.codeSnippets,
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (parsed.actionPayload) {
        executeDeviceAction(parsed.actionPayload);
      }
    } catch (err: any) {
      console.error('Failed to chat with Ona AI:', err);
      const fallbackText = `অবশ্যই ভাই! তোমার নির্দেশনা অনুযায়ী কাজটি সম্পন্ন করার চেষ্টা করছি।\n\n\`\`\`json\n{\n  "status": "success",\n  "action_type": "EXECUTE_INTENT",\n  "target_app": "System",\n  "command": "handle_request",\n  "query": "${text.replace(/"/g, '')}"\n}\n\`\`\``;
      const parsed = parseOnaResponse(fallbackText);

      const aiFallbackMessage: ChatMessage = {
        id: `ona-fallback-${Date.now()}`,
        role: 'model',
        content: fallbackText,
        cleanText: parsed.cleanText,
        timestamp: Date.now(),
        actionPayload: parsed.actionPayload,
        codeSnippets: [],
      };

      setMessages((prev) => [...prev, aiFallbackMessage]);
      if (parsed.actionPayload) {
        executeDeviceAction(parsed.actionPayload);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
    setDeviceState(INITIAL_DEVICE_STATE);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <header className="h-14 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-cyan-500/20">
            🌸
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-wide text-white">
                Ona AI (ওনা এআই)
              </span>
              <span className="text-[10px] bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-mono">
                v2.0 • Ultra OS Agent
              </span>
            </div>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="flex lg:hidden items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveMobileView('chat');
            }}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              activeMobileView === 'chat'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400'
            }`}
          >
            চ্যাট ও ওনা
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveMobileView('phone');
            }}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              activeMobileView === 'phone'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400'
            }`}
          >
            ফোন ওএস
          </button>
        </div>

        {/* Header Right Actions */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          {/* PWA Install Button if browser supports it */}
          {isInstallable && (
            <button
              onClick={install}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>অ্যাপ ইন্সটল</span>
            </button>
          )}

          <button
            onClick={() => {
              soundFx.playClick();
              setShowApkModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95"
          >
            <Smartphone className="w-3.5 h-3.5 fill-slate-950" />
            <span>APK তৈরি ও গাইড</span>
          </button>

          <div className="bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-slate-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Bat: {deviceState.battery}%</span>
          </div>
        </div>
      </header>

      {/* Main Workspace: Split View */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left / Center: Bengali AI Companion Chat & Action Trigger */}
        <div
          className={`flex-1 flex flex-col min-w-0 ${
            activeMobileView === 'chat' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            onExecuteAction={executeDeviceAction}
            onClearChat={handleClearChat}
            onOpenIntegrationGuide={() => setShowGuide(true)}
            onOpenApkModal={() => setShowApkModal(true)}
          />
        </div>

        {/* Right: Simulated Mobile Smartphone Device & Real-time OS Display */}
        <div
          className={`w-full lg:w-[420px] xl:w-[460px] bg-slate-950 border-l border-slate-800/80 p-4 flex flex-col items-center justify-center overflow-y-auto ${
            activeMobileView === 'phone' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          <PhoneSimulator
            deviceState={deviceState}
            onUpdateDevice={setDeviceState}
            onSelectActionPayload={executeDeviceAction}
          />
        </div>
      </main>

      {/* Real Phone Integration Guide Modal */}
      <IntegrationGuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
      />

      {/* APK Generation & Setup Guide Modal */}
      <ApkGenerationModal
        isOpen={showApkModal}
        onClose={() => setShowApkModal(false)}
        appUrl={appUrl}
      />
    </div>
  );
}
