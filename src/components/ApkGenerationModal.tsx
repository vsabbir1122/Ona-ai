import React, { useState } from 'react';
import {
  X,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Code2,
  CheckCircle2
} from 'lucide-react';

interface ApkGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const ApkGenerationModal: React.FC<ApkGenerationModalProps> = ({
  isOpen,
  onClose,
  appUrl,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const flutterCodeSnippet = `// Ona AI Flutter Intent Receiver
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

void executeOnaAction(Map<String, dynamic> payload) async {
  final target = payload['target_app'];
  final query = payload['query'] ?? '';

  if (target == 'YouTube') {
    final uri = Uri.parse('vnd.youtube://results?search_query=\${Uri.encodeComponent(query)}');
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  } else if (target == 'Phone') {
    final telUri = Uri.parse('tel:\${payload['details']?['number'] ?? '+8801700000000'}');
    await launchUrl(telUri);
  }
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(flutterCodeSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                সহজে APK তৈরি ও ব্যবহার নির্দেশিকা
              </h2>
              <p className="text-xs text-cyan-300">
                মাত্র ২ মিনিটে আপনার ফোনের জন্য APK ডাউনলোড করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* Step 1: Copy Link */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <span className="font-bold text-white block mb-1.5 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                ১
              </span>
              আপনার অ্যাপের লিংক কপি করুন:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-cyan-300 font-mono text-xs select-all truncate"
              />
              <button
                onClick={handleCopyUrl}
                className="flex items-center gap-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-2 rounded-xl transition shrink-0"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'কপি হয়েছে' : 'কপি'}</span>
              </button>
            </div>
          </div>

          {/* Step 2: Open PWABuilder & Generate APK */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <span className="font-bold text-white block mb-1.5 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                ২
              </span>
              PWABuilder-এ গিয়ে APK ডাউনলোড করুন:
            </span>
            <p className="text-slate-400 mb-2">
              ১. নিচের লিংকে ক্লিক করে <strong>PWABuilder</strong> ওপেন করুন।<br />
              ২. ইনপুট বক্সে আপনার কপি করা লিঙ্কটি পেস্ট করে <strong>"Start"</strong> চাপুন।<br />
              ৩. <strong>"Package for Android"</strong> নির্বাচন করলেই আপনার ফোনের সাইন করা <code>.apk</code> ফাইল ডাউনলোড হয়ে যাবে।
            </p>
            <a
              href="https://www.pwabuilder.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-1.5 rounded-xl transition font-medium"
            >
              <span>PWABuilder ওপেন করুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Step 3: Phone Setup */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <span className="font-bold text-white block mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              APK ফোনে ইন্সটল করার পর করণীয়:
            </span>
            <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
              <li>ডাউনলোড করা APK ফাইলে ট্যাপ করে <strong>Install</strong> করুন।</li>
              <li>অ্যাপ খুলে মাইক্রোফোন ও কলের পারমিশন <strong>Allow</strong> দিন।</li>
              <li>ফোনের <strong>Settings &gt; Apps &gt; Ona AI &gt; Battery</strong> তে গিয়ে <strong>Unrestricted</strong> নির্বাচন করুন যাতে ওনা সবসময় ব্যাকগ্রাউন্ডে সক্রিয় থাকে।</li>
            </ul>
          </div>

          {/* Optional Developer Code Dropdown */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowCode(!showCode)}
              className="w-full bg-slate-950 px-3.5 py-2.5 flex items-center justify-between text-xs text-slate-400 hover:text-slate-200"
            >
              <span className="flex items-center gap-1.5 font-medium">
                <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                ডেভেলপারদের জন্য: Flutter Intent Handler কোড
              </span>
              {showCode ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showCode && (
              <div className="p-3 bg-slate-950 border-t border-slate-800">
                <div className="flex justify-end mb-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 text-[11px] text-cyan-300 bg-slate-900 px-2 py-1 rounded"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'কপি হয়েছে' : 'কোড কপি'}</span>
                  </button>
                </div>
                <pre className="font-mono text-[10px] text-emerald-300 leading-relaxed overflow-x-auto bg-slate-900 p-2.5 rounded-xl">
                  {flutterCodeSnippet}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            সহজ ও ১০০% কার্যকর
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition"
          >
            বুঝেছি
          </button>
        </div>
      </div>
    </div>
  );
};
