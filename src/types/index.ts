export interface ActionPayload {
  status: 'success' | 'pending' | 'failed';
  action_type: 'EXECUTE_INTENT' | 'CALL_CONTACT' | 'SEND_SMS' | 'SET_ALARM' | 'SET_SETTING' | 'OPEN_APP' | string;
  target_app: string;
  command: string;
  query: string;
  details?: {
    intent_uri?: string;
    package?: string;
    parameter?: string;
    contact_name?: string;
    number?: string;
    recipient?: string;
    message?: string;
    time?: string;
    label?: string;
    days?: string[];
    setting?: string;
    value?: any;
    [key: string]: any;
  };
}

export interface CodeSnippet {
  language: string;
  code: string;
  title?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  cleanText: string;
  timestamp: number;
  actionPayload?: ActionPayload | null;
  codeSnippets: CodeSnippet[];
  status?: 'sending' | 'completed' | 'error';
  audioUrl?: string;
}

export interface DeviceState {
  battery: number;
  isCharging: boolean;
  wifi: boolean;
  bluetooth: boolean;
  flashlight: boolean;
  volume: number;
  brightness: number;
  dnd: boolean;
  activeApp: 'home' | 'YouTube' | 'Phone' | 'Clock' | 'Settings' | 'Camera' | 'Messages' | 'Spotify';
  activeAlarm: {
    time: string;
    label: string;
    enabled: boolean;
  } | null;
  activeCall: {
    contact: string;
    number: string;
    inCall: boolean;
    duration: number;
  } | null;
  nowPlaying: {
    title: string;
    artist: string;
    isPlaying: boolean;
    app: 'YouTube' | 'Spotify';
  } | null;
  lastAction: {
    payload: ActionPayload;
    timestamp: number;
    executed: boolean;
  } | null;
}
