import React, { useState, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  BatteryCharging,
  BatteryMedium,
  Bluetooth,
  Flashlight,
  Volume2,
  VolumeX,
  Bell,
  Sun,
  Camera,
  Phone,
  MessageSquare,
  Clock,
  Settings,
  Play,
  Pause,
  Home,
  ArrowLeft,
  Search,
  Sparkles,
  PhoneCall,
  PhoneOff,
  Mic,
  Music,
  CheckCircle2,
  ExternalLink,
  Code2,
  Image as ImageIcon,
  Palette
} from 'lucide-react';
import { DeviceState, ActionPayload } from '../types';
import { soundFx } from '../utils/soundEffects';

interface PhoneSimulatorProps {
  deviceState: DeviceState;
  onUpdateDevice: (updater: (prev: DeviceState) => DeviceState) => void;
  onSelectActionPayload?: (payload: ActionPayload) => void;
}

const WALLPAPERS = [
  { id: 'cosmos', name: 'কসমিক ব্লু', gradient: 'from-slate-950 via-cyan-950/40 to-slate-900' },
  { id: 'cyber', name: 'সাইবার অরোরা', gradient: 'from-slate-950 via-emerald-950/40 to-slate-900' },
  { id: 'violet', name: 'ভায়োলেট নিওন', gradient: 'from-slate-950 via-purple-950/40 to-slate-900' },
  { id: 'oled', name: 'পিওর ওলেড', gradient: 'from-black to-slate-950' },
];

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  deviceState,
  onUpdateDevice,
}) => {
  const [activeTab, setActiveTab] = useState<'screen' | 'payload'>('screen');
  const [currentTime, setCurrentTime] = useState<string>('12:45');
  const [photoFlash, setPhotoFlash] = useState(false);
  const [wallpaperIdx, setWallpaperIdx] = useState(0);
  const [notificationBanner, setNotificationBanner] = useState<{
    title: string;
    message: string;
    app: string;
    time: string;
  } | null>(null);

  // Keep phone clock updated
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Show notification banner whenever a new action is executed
  useEffect(() => {
    if (deviceState.lastAction && deviceState.lastAction.executed) {
      const p = deviceState.lastAction.payload;
      const now = new Date();
      setNotificationBanner({
        title: `ওনা এআই • ${p.target_app}`,
        message: `${p.action_type}: ${p.command} "${p.query || ''}"`,
        app: p.target_app,
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      // Play futuristic intent sound effect
      soundFx.playIntentDispatched();

      const timer = setTimeout(() => {
        setNotificationBanner(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [deviceState.lastAction]);

  // Handle active call timer
  useEffect(() => {
    if (deviceState.activeCall?.inCall) {
      const callTimer = setInterval(() => {
        onUpdateDevice((prev) => {
          if (!prev.activeCall) return prev;
          return {
            ...prev,
            activeCall: {
              ...prev.activeCall,
              duration: prev.activeCall.duration + 1,
            },
          };
        });
      }, 1000);
      return () => clearInterval(callTimer);
    }
  }, [deviceState.activeCall?.inCall, onUpdateDevice]);

  const formatCallDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    soundFx.playClick();
    onUpdateDevice((prev) => ({
      ...prev,
      activeCall: null,
      activeApp: 'home',
    }));
  };

  const handleSnapPhoto = () => {
    soundFx.playCameraShutter();
    setPhotoFlash(true);
    setTimeout(() => setPhotoFlash(false), 200);
  };

  const currentWallpaper = WALLPAPERS[wallpaperIdx];

  return (
    <div className="flex flex-col items-center">
      {/* Top Controller Sub-bar */}
      <div className="w-full max-w-[340px] flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-1 text-xs">
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('screen');
            }}
            className={`px-3 py-1 rounded-xl font-medium transition ${
              activeTab === 'screen'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ফোন ওএস
          </button>
          <button
            onClick={() => {
              soundFx.playClick();
              setActiveTab('payload');
            }}
            className={`px-3 py-1 rounded-xl font-medium transition flex items-center gap-1 ${
              activeTab === 'payload'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            ইন্টেন্ট পে-লোড
          </button>
        </div>

        {/* Wallpaper & Flashlight Badges */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              soundFx.playClick();
              setWallpaperIdx((prev) => (prev + 1) % WALLPAPERS.length);
            }}
            title="ওয়ালপেপার পরিবর্তন করুন"
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 transition"
          >
            <Palette className="w-3.5 h-3.5" />
          </button>

          {deviceState.flashlight && (
            <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] px-2 py-1 rounded-xl animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              <Flashlight className="w-3 h-3 text-amber-400" />
              <span>টর্চ চালু</span>
            </div>
          )}
        </div>
      </div>

      {/* Titanium-Chassis Mobile Smartphone Device Mockup */}
      <div className="relative w-[340px] h-[680px] bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 rounded-[48px] p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-4 border-slate-700/80 ring-2 ring-cyan-500/20 select-none overflow-hidden transition-all duration-300">
        {/* Physical Titanium Bevel highlights */}
        <div className="absolute top-0 left-12 right-12 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full pointer-events-none" />
        <div className="absolute -left-1 top-24 w-1 h-8 bg-slate-700 rounded-l-sm" />
        <div className="absolute -left-1 top-36 w-1 h-12 bg-slate-700 rounded-l-sm" />
        <div className="absolute -right-1 top-28 w-1 h-14 bg-slate-700 rounded-r-sm" />

        {/* Physical Flashlight LED Reflection Glow */}
        {deviceState.flashlight && (
          <div className="absolute -top-6 right-10 w-28 h-28 bg-amber-400/40 rounded-full blur-2xl pointer-events-none z-50 animate-pulse" />
        )}

        {/* Internal Screen Container with Brightness and Wallpaper */}
        <div
          className={`relative w-full h-full bg-gradient-to-b ${currentWallpaper.gradient} rounded-[36px] overflow-hidden flex flex-col transition-all duration-300 border border-white/5 shadow-inner`}
          style={{
            filter: `brightness(${Math.max(40, deviceState.brightness)}%)`,
          }}
        >
          {/* Status Bar */}
          <div className="h-10 bg-black/40 backdrop-blur-md px-5 flex items-center justify-between text-[11px] font-semibold text-slate-200 z-30">
            <span>{currentTime}</span>

            {/* Dynamic Island with Expansion animation */}
            <div
              className={`h-6 px-3 bg-black rounded-full flex items-center justify-center gap-1.5 border border-slate-800 shadow-inner transition-all duration-300 ${
                notificationBanner ? 'w-40 border-cyan-500/50' : 'w-24'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[9px] text-cyan-300 tracking-wider font-mono">
                {notificationBanner ? 'ONA INTENT' : 'ONA OS'}
              </span>
            </div>

            {/* Status Icons */}
            <div className="flex items-center gap-2">
              {deviceState.wifi ? (
                <Wifi className="w-3.5 h-3.5 text-slate-200" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
              )}
              {deviceState.bluetooth && <Bluetooth className="w-3 h-3 text-cyan-400" />}
              {deviceState.volume === 0 ? (
                <VolumeX className="w-3 h-3 text-rose-400" />
              ) : (
                <Volume2 className="w-3 h-3 text-slate-300" />
              )}
              <div className="flex items-center gap-0.5">
                <span className="text-[10px]">{deviceState.battery}%</span>
                {deviceState.isCharging ? (
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <BatteryMedium className="w-3.5 h-3.5 text-slate-300" />
                )}
              </div>
            </div>
          </div>

          {/* Real-time Automation Dropdown Notification Banner */}
          {notificationBanner && (
            <div className="absolute top-11 left-3 right-3 bg-slate-900/95 border border-cyan-400/60 shadow-2xl rounded-2xl p-2.5 z-40 animate-in slide-in-from-top-3 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/30">
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 truncate">
                      {notificationBanner.title}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {notificationBanner.time}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-200 truncate font-mono">
                    {notificationBanner.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN CONTENT AREA */}
          <div className="flex-1 relative overflow-y-auto overflow-x-hidden flex flex-col">
            {activeTab === 'payload' ? (
              /* Payload Inspector Screen */
              <div className="p-4 flex-1 bg-slate-950 flex flex-col text-xs font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Android Intent Payload
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Live Sync
                  </span>
                </div>
                <div className="flex-1 bg-slate-900/90 rounded-2xl p-3 border border-slate-800 overflow-auto">
                  <pre className="text-[11px] text-cyan-300 leading-relaxed whitespace-pre-wrap break-all">
                    {JSON.stringify(
                      deviceState.lastAction?.payload || {
                        status: 'ready',
                        message: 'ওনা এআই ডিভাইস কন্ট্রোলারের নির্দেশনার অপেক্ষায়...',
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
                <div className="mt-3 text-[10px] text-slate-400">
                  💡 এটি সরাসরি আপনার মোবাইল অ্যাপের Intent বা MethodChannel এ পাঠানো যায়।
                </div>
              </div>
            ) : (
              /* Dynamic Screen based on activeApp */
              <>
                {deviceState.activeApp === 'home' && (
                  <HomeScreen
                    currentTime={currentTime}
                    deviceState={deviceState}
                    onOpenApp={(app) => {
                      soundFx.playClick();
                      onUpdateDevice((prev) => ({ ...prev, activeApp: app as any }));
                    }}
                  />
                )}

                {deviceState.activeApp === 'YouTube' && (
                  <YouTubeScreen
                    query={deviceState.lastAction?.payload.query || 'Despacito'}
                    nowPlaying={deviceState.nowPlaying}
                    onTogglePlay={() => {
                      soundFx.playClick();
                      onUpdateDevice((prev) => ({
                        ...prev,
                        nowPlaying: prev.nowPlaying
                          ? { ...prev.nowPlaying, isPlaying: !prev.nowPlaying.isPlaying }
                          : {
                              title: 'জনপ্রিয় গান',
                              artist: 'YouTube Music',
                              isPlaying: true,
                              app: 'YouTube',
                            },
                      }));
                    }}
                  />
                )}

                {deviceState.activeApp === 'Phone' && (
                  <PhoneScreen
                    activeCall={deviceState.activeCall}
                    formatCallDuration={formatCallDuration}
                    onEndCall={handleEndCall}
                    onStartCall={(contact, number) => {
                      soundFx.playClick();
                      onUpdateDevice((prev) => ({
                        ...prev,
                        activeCall: {
                          contact,
                          number,
                          inCall: true,
                          duration: 0,
                        },
                      }));
                    }}
                  />
                )}

                {deviceState.activeApp === 'Clock' && (
                  <ClockScreen
                    activeAlarm={deviceState.activeAlarm}
                    currentTime={currentTime}
                    onToggleAlarm={() => {
                      soundFx.playClick();
                      onUpdateDevice((prev) => ({
                        ...prev,
                        activeAlarm: prev.activeAlarm
                          ? { ...prev.activeAlarm, enabled: !prev.activeAlarm.enabled }
                          : { time: '07:00 AM', label: 'সকালের ঘুম ভাঙানি', enabled: true },
                      }));
                    }}
                  />
                )}

                {deviceState.activeApp === 'Settings' && (
                  <SettingsScreen
                    deviceState={deviceState}
                    onUpdateDevice={onUpdateDevice}
                  />
                )}

                {deviceState.activeApp === 'Camera' && (
                  <CameraScreen
                    photoFlash={photoFlash}
                    onSnapPhoto={handleSnapPhoto}
                  />
                )}

                {deviceState.activeApp === 'Messages' && (
                  <MessagesScreen
                    lastAction={deviceState.lastAction}
                  />
                )}

                {deviceState.activeApp === 'Spotify' && (
                  <SpotifyScreen
                    nowPlaying={deviceState.nowPlaying}
                    onTogglePlay={() => {
                      soundFx.playClick();
                      onUpdateDevice((prev) => ({
                        ...prev,
                        nowPlaying: prev.nowPlaying
                          ? { ...prev.nowPlaying, isPlaying: !prev.nowPlaying.isPlaying }
                          : {
                              title: 'বাছাইকৃত বাংলা প্লেলিস্ট',
                              artist: 'Spotify Global',
                              isPlaying: true,
                              app: 'Spotify',
                            },
                      }));
                    }}
                  />
                )}
              </>
            )}
          </div>

          {/* Bottom Virtual Android Navigation Bar */}
          <div className="h-10 bg-black/60 backdrop-blur-md flex items-center justify-around px-8 z-30 border-t border-slate-800/60">
            <button
              onClick={() => {
                soundFx.playClick();
                onUpdateDevice((prev) => ({ ...prev, activeApp: 'home' }));
              }}
              title="Back"
              className="p-1 text-slate-400 hover:text-cyan-400 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onUpdateDevice((prev) => ({ ...prev, activeApp: 'home' }));
              }}
              title="Home"
              className="p-1.5 rounded-full bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-slate-700 transition shadow"
            >
              <Home className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setActiveTab(activeTab === 'screen' ? 'payload' : 'screen');
              }}
              title="Inspect Automation Payload"
              className="p-1 text-slate-400 hover:text-emerald-400 transition"
            >
              <Code2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB APPS ---

// 1. Home Screen
const HomeScreen: React.FC<{
  currentTime: string;
  deviceState: DeviceState;
  onOpenApp: (app: string) => void;
}> = ({ currentTime, deviceState, onOpenApp }) => {
  return (
    <div className="p-4 flex-1 flex flex-col justify-between">
      {/* Top Weather & Clock Widget */}
      <div className="mt-2 bg-slate-900/70 border border-cyan-500/20 rounded-3xl p-3.5 backdrop-blur-md shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">{currentTime}</div>
            <div className="text-xs text-cyan-300 font-medium mt-0.5">ঢাকা, বাংলাদেশ • ২৮° সে.</div>
          </div>
          <div className="text-right">
            <span className="text-2xl">☀️</span>
            <div className="text-[10px] text-slate-400 mt-1">রৌদ্রোজ্জ্বল দিন</div>
          </div>
        </div>
        {deviceState.activeAlarm?.enabled && (
          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-amber-300">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              অ্যালার্ম: {deviceState.activeAlarm.time}
            </span>
            <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300">
              চালু আছে
            </span>
          </div>
        )}
      </div>

      {/* Simulated Google Search Pill */}
      <div className="my-3 bg-slate-900/80 border border-slate-700/60 rounded-full px-3.5 py-2 flex items-center justify-between text-xs text-slate-400 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span>সার্চ বা ওনাকে ভয়েস দিন...</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Mic className="w-3.5 h-3.5 text-rose-400" />
          <Camera className="w-3.5 h-3.5 text-amber-400" />
        </div>
      </div>

      {/* App Grid */}
      <div className="grid grid-cols-4 gap-3 my-auto">
        <AppIcon
          name="ইউটিউব"
          icon="▶️"
          color="bg-red-600"
          onClick={() => onOpenApp('YouTube')}
          badge={deviceState.nowPlaying?.app === 'YouTube' ? 'Play' : undefined}
        />
        <AppIcon
          name="ফোন"
          icon="📞"
          color="bg-emerald-600"
          onClick={() => onOpenApp('Phone')}
          badge={deviceState.activeCall?.inCall ? 'Call' : undefined}
        />
        <AppIcon
          name="অ্যালার্ম"
          icon="⏰"
          color="bg-indigo-600"
          onClick={() => onOpenApp('Clock')}
          badge={deviceState.activeAlarm?.enabled ? 'On' : undefined}
        />
        <AppIcon
          name="ক্যামেরা"
          icon="📸"
          color="bg-amber-600"
          onClick={() => onOpenApp('Camera')}
        />
        <AppIcon
          name="সেটিংস"
          icon="⚙️"
          color="bg-slate-700"
          onClick={() => onOpenApp('Settings')}
        />
        <AppIcon
          name="মেসেজ"
          icon="💬"
          color="bg-blue-600"
          onClick={() => onOpenApp('Messages')}
        />
        <AppIcon
          name="স্পটিফাই"
          icon="🎵"
          color="bg-green-600"
          onClick={() => onOpenApp('Spotify')}
          badge={deviceState.nowPlaying?.app === 'Spotify' ? 'Play' : undefined}
        />
        <AppIcon
          name="ওনা অটো"
          icon="🤖"
          color="bg-gradient-to-tr from-cyan-600 to-blue-600"
          onClick={() => onOpenApp('Settings')}
          badge="Live"
        />
      </div>

      {/* Bottom Fixed Dock */}
      <div className="mt-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-2.5 flex items-center justify-around backdrop-blur-md shadow-lg">
        <button
          onClick={() => onOpenApp('Phone')}
          className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center hover:scale-105 transition"
        >
          <Phone className="w-5 h-5" />
        </button>
        <button
          onClick={() => onOpenApp('Messages')}
          className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center hover:scale-105 transition"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
        <button
          onClick={() => onOpenApp('YouTube')}
          className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center hover:scale-105 transition"
        >
          <Play className="w-5 h-5" />
        </button>
        <button
          onClick={() => onOpenApp('Camera')}
          className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center hover:scale-105 transition"
        >
          <Camera className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const AppIcon: React.FC<{
  name: string;
  icon: string;
  color: string;
  onClick: () => void;
  badge?: string;
}> = ({ name, icon, color, onClick, badge }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1 group focus:outline-none"
  >
    <div
      className={`relative w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-xl shadow-md group-hover:scale-105 group-active:scale-95 transition-all`}
    >
      <span>{icon}</span>
      {badge && (
        <span className="absolute -top-1 -right-1 bg-cyan-400 text-slate-950 text-[9px] font-bold px-1.5 py-0.2 rounded-full border border-slate-900 shadow">
          {badge}
        </span>
      )}
    </div>
    <span className="text-[11px] text-slate-300 font-medium truncate max-w-[60px]">
      {name}
    </span>
  </button>
);

// 2. YouTube Screen
const YouTubeScreen: React.FC<{
  query: string;
  nowPlaying: DeviceState['nowPlaying'];
  onTogglePlay: () => void;
}> = ({ query, nowPlaying, onTogglePlay }) => {
  const isPlaying = nowPlaying?.isPlaying ?? true;
  return (
    <div className="flex-1 bg-slate-950 flex flex-col">
      <div className="bg-red-700 px-3 py-2.5 flex items-center justify-between text-white shadow">
        <div className="flex items-center gap-1.5 font-bold text-sm">
          <span className="bg-white text-red-600 rounded px-1 text-xs">▶</span>
          <span>YouTube</span>
        </div>
        <span className="text-xs text-red-100 font-mono truncate max-w-[150px]">
          {query || 'Home'}
        </span>
      </div>

      <div className="relative aspect-video bg-black flex flex-col items-center justify-center overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none" />

        {isPlaying ? (
          <div className="flex items-center gap-1 mb-2">
            <span className="w-1 bg-red-500 rounded-full wave-bar" style={{ animationDelay: '0.1s' }} />
            <span className="w-1 bg-red-400 rounded-full wave-bar" style={{ animationDelay: '0.3s' }} />
            <span className="w-1 bg-red-500 rounded-full wave-bar" style={{ animationDelay: '0.2s' }} />
            <span className="w-1 bg-red-300 rounded-full wave-bar" style={{ animationDelay: '0.4s' }} />
          </div>
        ) : (
          <div className="text-slate-500 text-xs mb-2">পজ করা আছে</div>
        )}

        <button
          onClick={onTogglePlay}
          className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
          <div className={`h-full bg-red-600 ${isPlaying ? 'w-2/3 animate-pulse' : 'w-1/3'}`} />
        </div>
      </div>

      <div className="p-3">
        <h3 className="text-xs font-semibold text-white leading-snug">
          {query} (Official Music Video / Track)
        </h3>
        <p className="text-[10px] text-slate-400 mt-1">
          ওনা এআই দ্বারা স্বয়ংক্রিয়ভাবে চালু করা হয়েছে • ১.২ কোটি ভিউ
        </p>

        <div className="flex items-center gap-3 mt-3 border-y border-slate-800 py-2 text-xs text-slate-300">
          <span className="flex items-center gap-1">👍 ৪.৮ লাখ</span>
          <span className="flex items-center gap-1">💬 শেয়ার</span>
          <span className="flex items-center gap-1">⬇️ ডাউনলোড</span>
        </div>

        <div className="mt-3">
          <div className="text-[11px] font-bold text-slate-400 mb-2">পরবর্তী গান:</div>
          <div className="space-y-2">
            {['হাবিব ওয়াহিদ - দিন গেলো', 'তাহসান - আলো', 'অর্ণব - সে যে বসে আছে'].map(
              (song, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800/80 text-xs hover:border-red-500/30 cursor-pointer"
                >
                  <div className="w-10 h-7 bg-slate-800 rounded flex items-center justify-center text-[10px] text-slate-400">
                    🎵
                  </div>
                  <div className="flex-1 truncate">
                    <p className="text-[11px] text-white truncate">{song}</p>
                    <p className="text-[9px] text-slate-500">বাংলা গান • HD</p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Phone / Dialer Screen
const PhoneScreen: React.FC<{
  activeCall: DeviceState['activeCall'];
  formatCallDuration: (sec: number) => string;
  onEndCall: () => void;
  onStartCall: (contact: string, number: string) => void;
}> = ({ activeCall, formatCallDuration, onEndCall, onStartCall }) => {
  const [dialInput, setDialInput] = useState('');

  if (activeCall?.inCall) {
    return (
      <div className="flex-1 bg-gradient-to-b from-slate-900 to-slate-950 p-6 flex flex-col items-center justify-between">
        <div className="text-center mt-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-3xl mb-3 shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse">
            👤
          </div>
          <h2 className="text-lg font-bold text-white">{activeCall.contact}</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{activeCall.number}</p>
          <div className="mt-3 inline-block bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full border border-emerald-500/30 font-mono">
            কল চলছে • {formatCallDuration(activeCall.duration)}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full max-w-[240px]">
          {['মিউট', 'কী-প্যাড', 'স্পিকার', 'যোগ করুন', 'ভিডিও', 'হোল্ড'].map((action, i) => (
            <button
              key={i}
              className="flex flex-col items-center gap-1 text-[10px] text-slate-300 p-2 rounded-xl bg-slate-800/60 border border-slate-700/50 hover:bg-slate-700"
            >
              <div className="w-8 h-8 rounded-full bg-slate-700/80 flex items-center justify-center text-xs">
                {['🎤', '🔢', '🔊', '➕', '📹', '⏸️'][i]}
              </div>
              <span>{action}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onEndCall}
          className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-900/50 active:scale-95 transition"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-950 p-4 flex flex-col justify-between">
      <div>
        <div className="text-center py-2 border-b border-slate-800">
          <span className="text-xs font-semibold text-emerald-400">ডায়ালার ও কনট্যাক্টস</span>
        </div>

        <div className="mt-3 space-y-2">
          {[
            { name: 'আম্মু (Mom)', num: '+8801711223344' },
            { name: 'আব্বু (Dad)', num: '+8801722334455' },
            { name: 'দোস্ত সাকিব', num: '+8801833445566' },
          ].map((c, i) => (
            <div
              key={i}
              onClick={() => onStartCall(c.name, c.num)}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition"
            >
              <div>
                <p className="text-xs font-medium text-white">{c.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">{c.num}</p>
              </div>
              <button className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition">
                <PhoneCall className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-center font-mono text-base text-cyan-300 py-1 tracking-wider min-h-[28px]">
          {dialInput || 'নম্বর লিখুন...'}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((d) => (
            <button
              key={d}
              onClick={() => {
                soundFx.playClick();
                setDialInput((prev) => prev + d);
              }}
              className="h-10 rounded-xl bg-slate-900 border border-slate-800 text-sm font-semibold text-white hover:bg-slate-800 active:scale-95 transition"
            >
              {d}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-center gap-4 mt-3">
          <button
            onClick={() => onStartCall(dialInput || 'কাস্টম নম্বর', dialInput || '+8801700000000')}
            className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg hover:bg-emerald-400 active:scale-95 transition"
          >
            <Phone className="w-5 h-5" />
          </button>
          {dialInput && (
            <button
              onClick={() => setDialInput((prev) => prev.slice(0, -1))}
              className="text-xs text-slate-400 hover:text-rose-400 px-2 py-1"
            >
              মুছুন ⌫
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// 4. Clock / Alarm Screen
const ClockScreen: React.FC<{
  activeAlarm: DeviceState['activeAlarm'];
  currentTime: string;
  onToggleAlarm: () => void;
}> = ({ activeAlarm, currentTime, onToggleAlarm }) => {
  return (
    <div className="flex-1 bg-slate-950 p-4 flex flex-col">
      <div className="text-center border-b border-slate-800 pb-2">
        <span className="text-xs font-semibold text-indigo-400">অ্যালার্ম ও ঘড়ি</span>
      </div>

      <div className="my-4 text-center">
        <div className="text-3xl font-extrabold text-white tracking-wider">{currentTime}</div>
        <div className="text-[11px] text-slate-400 mt-1">ঢাকা সময় (GMT+6)</div>
      </div>

      <div className="space-y-3 mt-2">
        <div
          className={`p-3.5 rounded-2xl border transition ${
            activeAlarm?.enabled
              ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md'
              : 'bg-slate-900 border-slate-800 opacity-70'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-white">
                {activeAlarm?.time || '07:00 AM'}
              </div>
              <div className="text-[11px] text-indigo-300 font-medium">
                {activeAlarm?.label || 'সকালের ঘুম ভাঙানি'}
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">প্রতিদিন • ওনা এআই সেট করেছে</div>
            </div>
            <button
              onClick={onToggleAlarm}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 ${
                activeAlarm?.enabled ? 'bg-indigo-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  activeAlarm?.enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-bold text-slate-300">01:30 PM</div>
              <div className="text-[11px] text-slate-400">নামাজ ও দুপুরের খাবার</div>
            </div>
            <div className="w-10 h-5 rounded-full bg-slate-800 p-0.5">
              <div className="w-4 h-4 rounded-full bg-slate-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-2.5 text-[11px] text-slate-400 text-center">
        💡 আপনি চ্যাটে <span className="text-cyan-300">"কাল সকাল ৭টায় অ্যালার্ম দাও"</span> বললে ওনা নিজে এটি আপডেট করবে।
      </div>
    </div>
  );
};

// 5. Settings Screen
const SettingsScreen: React.FC<{
  deviceState: DeviceState;
  onUpdateDevice: (updater: (prev: DeviceState) => DeviceState) => void;
}> = ({ deviceState, onUpdateDevice }) => {
  return (
    <div className="flex-1 bg-slate-950 p-4 flex flex-col overflow-y-auto">
      <div className="text-center border-b border-slate-800 pb-2 mb-3">
        <span className="text-xs font-semibold text-slate-300">ডিভাইস কন্ট্রোল ও সেটিংস</span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                deviceState.wifi ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-500'
              }`}
            >
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-white">ওয়াই-ফাই (Wi-Fi)</p>
              <p className="text-[10px] text-slate-400">
                {deviceState.wifi ? 'Home_Fiber_5G (সংযুক্ত)' : 'বন্ধ রয়েছে'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onUpdateDevice((p) => ({ ...p, wifi: !p.wifi }));
            }}
            className={`w-10 h-5 rounded-full transition-colors p-0.5 ${
              deviceState.wifi ? 'bg-cyan-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                deviceState.wifi ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                deviceState.bluetooth
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              <Bluetooth className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-white">ব্লুটুথ (Bluetooth)</p>
              <p className="text-[10px] text-slate-400">
                {deviceState.bluetooth ? 'Ona Buds Pro Connected' : 'বন্ধ রয়েছে'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onUpdateDevice((p) => ({ ...p, bluetooth: !p.bluetooth }));
            }}
            className={`w-10 h-5 rounded-full transition-colors p-0.5 ${
              deviceState.bluetooth ? 'bg-blue-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                deviceState.bluetooth ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                deviceState.flashlight
                  ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              <Flashlight className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-white">টর্চ / ফ্ল্যাশলাইট</p>
              <p className="text-[10px] text-slate-400">
                {deviceState.flashlight ? 'জ্বলছে' : 'বন্ধ রয়েছে'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onUpdateDevice((p) => ({ ...p, flashlight: !p.flashlight }));
            }}
            className={`w-10 h-5 rounded-full transition-colors p-0.5 ${
              deviceState.flashlight ? 'bg-amber-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                deviceState.flashlight ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-white mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              ভলিউম লেভেল
            </span>
            <span className="font-mono text-cyan-400">{deviceState.volume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={deviceState.volume}
            onChange={(e) =>
              onUpdateDevice((p) => ({ ...p, volume: parseInt(e.target.value, 10) }))
            }
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-white mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              স্ক্রিন ব্রাইটনেস
            </span>
            <span className="font-mono text-amber-400">{deviceState.brightness}%</span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            value={deviceState.brightness}
            onChange={(e) =>
              onUpdateDevice((p) => ({ ...p, brightness: parseInt(e.target.value, 10) }))
            }
            className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

// 6. Camera Screen
const CameraScreen: React.FC<{
  photoFlash: boolean;
  onSnapPhoto: () => void;
}> = ({ photoFlash, onSnapPhoto }) => {
  return (
    <div className="relative flex-1 bg-black flex flex-col justify-between overflow-hidden">
      {photoFlash && <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-200" />}

      <div className="px-4 py-3 flex items-center justify-between text-white text-xs z-10 bg-black/40">
        <span className="bg-slate-800/80 px-2 py-0.5 rounded text-[10px]">HDR</span>
        <span className="text-[11px] font-mono">1x • 48MP</span>
        <span>⚙️</span>
      </div>

      <div className="relative flex-1 flex items-center justify-center">
        <div className="w-40 h-40 border border-white/20 rounded-2xl flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-amber-400/80 rounded" />
        </div>
        <div className="absolute bottom-4 bg-black/50 px-3 py-1 rounded-full text-[10px] text-white">
          AI ফোকাস ট্র্যাকিং চালু
        </div>
      </div>

      <div className="p-4 bg-black/80 flex items-center justify-around z-10">
        <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xs">
          🖼️
        </div>
        <button
          onClick={onSnapPhoto}
          className="w-14 h-14 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition shadow-lg"
        >
          <div className="w-11 h-11 rounded-full bg-white" />
        </button>
        <button className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs">
          🔄
        </button>
      </div>
    </div>
  );
};

// 7. Messages Screen
const MessagesScreen: React.FC<{
  lastAction: DeviceState['lastAction'];
}> = ({ lastAction }) => {
  return (
    <div className="flex-1 bg-slate-950 flex flex-col">
      <div className="bg-slate-900 border-b border-slate-800 p-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
          💬
        </div>
        <div>
          <h3 className="text-xs font-semibold text-white">মেসেঞ্জার ও এসএমএস</h3>
          <p className="text-[10px] text-emerald-400">সক্রিয় অটোমেশন সার্ভিস</p>
        </div>
      </div>

      <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-sm p-2.5 max-w-[80%] text-xs text-slate-200">
          আসসালামু আলাইকুম ভাইয়া! কেমন আছেন?
          <span className="block text-[9px] text-slate-500 mt-1">11:30 AM</span>
        </div>

        <div className="bg-blue-600 rounded-2xl rounded-br-sm p-2.5 max-w-[80%] ml-auto text-xs text-white">
          আলহামদুলিল্লাহ ভালো! তুমি কেমন আছো?
          <span className="block text-[9px] text-blue-200 mt-1">11:32 AM</span>
        </div>

        {lastAction?.payload.action_type === 'SEND_SMS' && (
          <div className="bg-blue-600 rounded-2xl rounded-br-sm p-2.5 max-w-[80%] ml-auto text-xs text-white border border-cyan-400 animate-in fade-in">
            {lastAction.payload.details?.message || lastAction.payload.query}
            <span className="block text-[9px] text-cyan-200 mt-1">
              ওনা এআই দ্বারা প্রেরিত • এইমাত্র
            </span>
          </div>
        )}
      </div>

      <div className="p-2 border-t border-slate-800 flex items-center gap-1.5">
        <input
          type="text"
          placeholder="মেসেজ লিখুন..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-full px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
        />
        <button className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
          ➤
        </button>
      </div>
    </div>
  );
};

// 8. Spotify Screen
const SpotifyScreen: React.FC<{
  nowPlaying: DeviceState['nowPlaying'];
  onTogglePlay: () => void;
}> = ({ nowPlaying, onTogglePlay }) => {
  const isPlaying = nowPlaying?.isPlaying ?? true;
  return (
    <div className="flex-1 bg-gradient-to-b from-green-950/70 to-slate-950 p-4 flex flex-col justify-between">
      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-2">
        <span className="font-bold text-green-400 flex items-center gap-1">
          <Music className="w-3.5 h-3.5" />
          Spotify
        </span>
        <span className="text-[10px]">ওনা এআই সংযুক্ত</span>
      </div>

      <div className="my-auto text-center">
        <div className="w-36 h-36 mx-auto rounded-3xl bg-gradient-to-tr from-green-500 to-emerald-800 flex items-center justify-center text-4xl shadow-xl shadow-green-950/50 mb-4 border border-green-400/30">
          🎧
        </div>
        <h3 className="text-sm font-bold text-white truncate">
          {nowPlaying?.title || 'বাছাইকৃত বাংলা প্লেলিস্ট'}
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">{nowPlaying?.artist || 'Spotify Hits'}</p>
      </div>

      <div>
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-3">
          <div className={`h-full bg-green-500 ${isPlaying ? 'w-1/2 animate-pulse' : 'w-1/4'}`} />
        </div>
        <div className="flex items-center justify-center gap-6">
          <button className="text-slate-400 hover:text-white">⏮️</button>
          <button
            onClick={onTogglePlay}
            className="w-12 h-12 rounded-full bg-green-500 text-slate-950 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button className="text-slate-400 hover:text-white">⏭️</button>
        </div>
      </div>
    </div>
  );
};
