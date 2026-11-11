import React, { useState } from 'react';
import { X, Smartphone, Copy, Check, Terminal, ExternalLink, ShieldCheck, Zap } from 'lucide-react';

interface IntegrationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IntegrationGuideModal: React.FC<IntegrationGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeLang, setActiveLang] = useState<'flutter' | 'kotlin' | 'adb'>('flutter');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const flutterCode = `// lib/ona_automation_handler.dart
import 'dart:convert';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';

class OnaAutomationHandler {
  static const platform = MethodChannel('com.ona.ai/device_control');

  // Executes action payload received from Ona AI
  static Future<void> executeOnaPayload(Map<String, dynamic> payload) async {
    final actionType = payload['action_type'];
    final targetApp = payload['target_app'];
    final command = payload['command'];
    final query = payload['query'];
    final details = payload['details'] ?? {};

    switch (actionType) {
      case 'EXECUTE_INTENT':
        if (targetApp == 'YouTube') {
          final uri = Uri.parse('vnd.youtube://results?search_query=\${Uri.encodeComponent(query)}');
          if (await canLaunchUrl(uri)) {
            await launchUrl(uri);
          } else {
            await launchUrl(Uri.parse('https://www.youtube.com/results?search_query=\${Uri.encodeComponent(query)}'));
          }
        }
        break;

      case 'CALL_CONTACT':
        final telUri = Uri.parse('tel:\${details['number'] ?? query}');
        await launchUrl(telUri);
        break;

      case 'SET_ALARM':
        await platform.invokeMethod('setAlarm', {
          'time': details['time'] ?? '07:00',
          'label': details['label'] ?? 'Ona AI Alarm',
        });
        break;

      case 'SET_SETTING':
        if (query == 'flashlight') {
          await platform.invokeMethod('toggleTorch', {'enabled': details['value']});
        }
        break;
    }
  }
}`;

  const kotlinCode = `// MainActivity.kt (Android Native Intent Dispatcher)
package com.ona.ai

import android.content.Intent
import android.net.Uri
import android.provider.AlarmClock
import android.hardware.camera2.CameraManager
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity: FlutterActivity() {
    private val CHANNEL = "com.ona.ai/device_control"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "setAlarm" -> {
                    val time = call.argument<String>("time") ?: "07:00"
                    val parts = time.split(":")
                    val intent = Intent(AlarmClock.ACTION_SET_ALARM).apply {
                        putExtra(AlarmClock.EXTRA_HOUR, parts[0].toInt())
                        putExtra(AlarmClock.EXTRA_MINUTES, parts[1].toInt())
                        putExtra(AlarmClock.EXTRA_MESSAGE, "Ona AI Alarm")
                        putExtra(AlarmClock.EXTRA_SKIP_UI, true)
                    }
                    startActivity(intent)
                    result.success(true)
                }
                "toggleTorch" -> {
                    val enabled = call.argument<Boolean>("enabled") ?: true
                    val cameraManager = getSystemService(CAMERA_SERVICE) as CameraManager
                    val cameraId = cameraManager.cameraIdList[0]
                    cameraManager.setTorchMode(cameraId, enabled)
                    result.success(true)
                }
                else -> result.notImplemented()
            }
        }
    }
}`;

  const adbCode = `# Ona AI Android ADB Automation CLI Commands
# 1. Play song on YouTube:
adb shell am start -a android.intent.action.VIEW -d "vnd.youtube://results?search_query=Despacito"

# 2. Make Call:
adb shell am start -a android.intent.action.CALL -d "tel:+8801700000000"

# 3. Set Alarm:
adb shell am start -a android.intent.action.SET_ALARM --ei android.intent.extra.alarm.HOUR 7 --ei android.intent.extra.alarm.MINUTES 0

# 4. Toggle Flashlight:
adb shell "su -c 'echo 1 > /sys/class/leds/flashlight/brightness'"`;

  const getActiveCode = () => {
    switch (activeLang) {
      case 'flutter':
        return flutterCode;
      case 'kotlin':
        return kotlinCode;
      case 'adb':
        return adbCode;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                বাস্তব মোবাইল ডিভাইসের সাথে যুক্ত করার নিয়ম
              </h2>
              <p className="text-xs text-slate-400">
                Ona AI Action Payload &amp; Android Intent Architecture
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

        {/* Explanation */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 text-xs text-slate-300 leading-relaxed">
          <p>
            ওনা এআই কেবল একটি চ্যাটবট নয়—এটি একটি <strong className="text-cyan-400">সম্পূর্ণ মোবাইল ওএস অটোমেশন এজেন্ট</strong>।
            ব্যবহারকারী যখন বাংলায় কিছু বলেন (যেমন: "ইউটিউবে গান চালাও" বা "অ্যালার্ম দাও"), ওনা একটি
            স্ট্যান্ডার্ড <code className="text-emerald-400 bg-slate-800 px-1 py-0.5 rounded">Action Payload (JSON)</code> তৈরি করে।
            আপনার মোবাইল অ্যাপের ব্যাকগ্রাউন্ড সার্ভিস সেই পে-লোড গ্রহণ করে সরাসরি অ্যান্ড্রয়েড ইন্টেন্ট রান করায়।
          </p>
        </div>

        {/* Language Tabs */}
        <div className="px-5 pt-3 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveLang('flutter')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeLang === 'flutter'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Flutter (Dart)
            </button>
            <button
              onClick={() => setActiveLang('kotlin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeLang === 'kotlin'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Android (Kotlin)
            </button>
            <button
              onClick={() => setActiveLang('adb')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeLang === 'adb'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ADB CLI Commands
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl text-slate-200 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'কপি হয়েছে' : 'কোড কপি'}</span>
          </button>
        </div>

        {/* Code View */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto bg-slate-950 font-mono text-xs">
          <pre className="text-emerald-300 leading-relaxed whitespace-pre overflow-x-auto">
            {getActiveCode()}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            100% Android SDK &amp; Flutter Compatible
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
