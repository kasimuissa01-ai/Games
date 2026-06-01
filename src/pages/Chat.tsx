import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  CheckCheck, 
  Plus, 
  ArrowLeft, 
  MessageSquare, 
  Info, 
  Trash2, 
  Camera, 
  Loader2, 
  Sparkles, 
  Hash, 
  Users, 
  Gamepad2, 
  Bot, 
  Share2,
  Search,
  X,
  Compass,
  Menu,
  Bell,
  Settings,
  HelpCircle,
  Users2,
  MessageCircle,
  Clock,
  Copy,
  Smartphone,
  Tv,
  Flame,
  Trophy,
  Activity,
  Shield,
  Pin,
  BellOff,
  Eye,
  Check
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { db, auth } from '../lib/firebase';
import { collection, doc, query, orderBy, onSnapshot, addDoc, deleteDoc, setDoc, updateDoc } from 'firebase/firestore';
import { trackGAEvent } from '../services/googleAnalytics';


interface Kijiwe {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  createdBy: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  kijiweId: string;
  sender: string;
  senderId: string;
  avatar: string;
  content: string;
  timestamp: string;
  createdAt: string;
  channel?: string; // Partitioned sub-channels
  isMe?: boolean;
}

interface TypingUser {
  id: string;
  sender: string;
}

interface RoomCodeEntry {
  id: string;
  hostName: string;
  gameType: string; // e.g., "eFootball Mobile", "EA FC Mobile", "PES PSP Co-op", "Custom Match"
  code: string;
  platform: string; // "Mobile Only", "PS5/Xbox/PC", "Crossplay"
  expiredInMinutes: number;
  isFull: boolean;
  createdAt: string;
  expireTime: number; // timestamp in ms when code dies
}

// Beautiful default Bongo gaming servers for bulletproof offline & slow network loading
export const DEFAULT_VIJIWE: Kijiwe[] = [
  {
    id: 'lounge',
    name: 'GAMES HOME Lounge',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=300',
    description: 'Kijiwe kikuu cha wachezaji wote Tanzania. Soga, mechi, na kubadilishana magemu zote hapa.',
    createdBy: 'Hub Bot',
    createdAt: new Date('2026-01-01').toISOString()
  },
  {
    id: 'fifabongo',
    name: 'FIFA & EA FC Tz',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=300',
    description: 'Kijiwe maalum cha wachezaji wa soka ya kielektroniki - EA FC Mobile, eFootball, na FIFA console/PC.',
    createdBy: 'Ben_FIFA',
    createdAt: new Date('2026-01-05').toISOString()
  },
  {
    id: 'gtabongo',
    name: 'GTA Bongo Crew',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=300',
    description: 'Kijiwe cha wazee wa GTA V Online, San Andreas, na michezo yote ya adventure na mission bongo.',
    createdBy: 'Bongo_Pro_GT',
    createdAt: new Date('2026-01-10').toISOString()
  }
];

// Rich fallback conversations to represent life instantly inside the channels 
export const DEFAULT_MESSAGES: Record<string, ChatMessage[]> = {
  'lounge': [
    {
      id: 'm_l1',
      kijiweId: 'lounge',
      sender: 'Ben_FIFA',
      senderId: 'm2',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ben',
      content: 'Oya wadau, msimu mpya wa eFootball umeanza nani ameshaingia?',
      timestamp: 'Saa 3:15 Jioni',
      createdAt: new Date('2026-05-29T10:15:00Z').toISOString(),
      channel: 'general-stori'
    },
    {
      id: 'm_l2',
      kijiweId: 'lounge',
      sender: 'Dida_Playz',
      senderId: 'm1',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dida',
      content: 'Nipo hapa mzee! EA FC Mobile nao wameweka event kali sana leo.',
      timestamp: 'Saa 3:16 Jioni',
      createdAt: new Date('2026-05-29T10:16:00Z').toISOString(),
      channel: 'general-stori'
    },
    {
      id: 'm_l3',
      kijiweId: 'lounge',
      sender: 'Kaka_Gamer',
      senderId: 'm3',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kaka',
      content: 'Kuna ligi yoyote ya eFootball leo? Nataka nimuonyeshe mtu kazi hapa!',
      timestamp: 'Saa 3:18 Jioni',
      createdAt: new Date('2026-05-29T10:18:00Z').toISOString(),
      channel: 'league-mechi'
    },
    {
      id: 'm_l4',
      kijiweId: 'lounge',
      sender: 'Chacha_eFoot',
      senderId: 'm4',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chacha',
      content: 'Mimi nipo tayari kwa mechi, njoo chumba tupige co-op au 1v1!',
      timestamp: 'Saa 3:20 Jioni',
      createdAt: new Date('2026-05-29T10:20:00Z').toISOString(),
      channel: 'league-mechi'
    }
  ],
  'fifabongo': [
    {
      id: 'm_f1',
      kijiweId: 'fifabongo',
      sender: 'Ben_FIFA',
      senderId: 'm2',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ben',
      content: 'Wapenzi wa EA FC, leo kuna mshindi wa 50k kwenye mechi zetu. Jiandaeni!',
      timestamp: 'Saa 2:10 Asubuhi',
      createdAt: new Date('2026-05-29T07:10:00Z').toISOString(),
      channel: 'general-stori'
    },
    {
      id: 'm_f2',
      kijiweId: 'fifabongo',
      sender: 'Dida_Playz',
      senderId: 'm1',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=dida',
      content: 'Nimesajili striker mpya leo mwenye finishing ya hatari, mtaongea Kiswahili leo!',
      timestamp: 'Saa 2:12 Asubuhi',
      createdAt: new Date('2026-05-29T07:12:00Z').toISOString(),
      channel: 'general-stori'
    },
    {
      id: 'm_f3',
      kijiweId: 'fifabongo',
      sender: 'Ben_FIFA',
      senderId: 'm2',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ben',
      content: 'Ratiba ya mechi zote za leo ipo tayari. Tutaanza saa 4:00 kamili.',
      timestamp: 'Saa 2:15 Asubuhi',
      createdAt: new Date('2026-05-29T07:15:00Z').toISOString(),
      channel: 'league-mechi'
    }
  ],
  'gtabongo': [
    {
      id: 'm_g1',
      kijiweId: 'gtabongo',
      sender: 'Bongo_Pro_GT',
      senderId: 'm7',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gtpro',
      content: 'Oya, heist ya wiki hii tunapiga Diamond Casino au Cayo Perico? Maoni yenu wadau.',
      timestamp: 'Saa 1:30 Jioni',
      createdAt: new Date('2026-05-29T16:30:00Z').toISOString(),
      channel: 'general-stori'
    },
    {
      id: 'm_g2',
      kijiweId: 'gtabongo',
      sender: 'Kaka_Gamer',
      senderId: 'm3',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kaka',
      content: 'Me nipo tayari kwa Diamond Casino heist, niko vizuri kwenye kukata fingerprints!',
      timestamp: 'Saa 1:35 Jioni',
      createdAt: new Date('2026-05-29T16:35:00Z').toISOString(),
      channel: 'general-stori'
    }
  ]
};

export default function Chat({ user }: { user: any }) {
  // Preload DEFAULT_VIJIWE combined with user custom ones stored locally as fallback state
  const [vijiwe, setVijiwe] = useState<Kijiwe[]>(() => {
    const saved = localStorage.getItem('gamers_genge_custom_vijiwe');
    const localCustoms = saved ? JSON.parse(saved) : [];
    return [...DEFAULT_VIJIWE, ...localCustoms];
  });
  
  const [activeKijiweId, setActiveKijiweId] = useState<string | null>(() => {
    // Look at URL parameters first (e.g., #chat?kijiweId=fifabongo or ?kijiweId=fifabongo)
    const hashPart = window.location.hash || '';
    const queryPart = hashPart.includes('?') ? hashPart.substring(hashPart.indexOf('?')) : window.location.search;
    const searchParams = new URLSearchParams(queryPart);
    const urlKijiweId = searchParams.get('kijiweId');
    if (urlKijiweId) {
      return urlKijiweId;
    }
    const saved = localStorage.getItem('gamers_genge_custom_vijiwe');
    const localCustoms = saved ? JSON.parse(saved) : [];
    const all = [...DEFAULT_VIJIWE, ...localCustoms];
    return all.length > 0 ? all[0].id : 'lounge';
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Custom localStorage message cache so we have real-time feel if Firestore is temporarily offline
  const [localMessages, setLocalMessages] = useState<Record<string, ChatMessage[]>>(() => {
    const saved = localStorage.getItem('gamers_genge_custom_messages');
    return saved ? JSON.parse(saved) : {};
  });

  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Persist guestName on the client side gracefully so they keep their identity
  const [guestName, setGuestName] = useState<string>(() => {
    const existing = localStorage.getItem('gamers_genge_guest_name');
    if (existing) return existing;
    const generated = `Gamer_${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem('gamers_genge_guest_name', generated);
    return generated;
  });

  // Track dynamic mock unread notification badge counts for different servers
  const [unreadNotifications, setUnreadNotifications] = useState<Record<string, number>>({
    'lounge': 0,
    'fifabongo': 3,
    'gtabongo': 1
  });

  // Top header bar interactive states
  const [searchBarOpen, setSearchBarOpen] = useState(false);
  const [notificationsMuted, setNotificationsMuted] = useState(false);
  const [showPinnedMsgs, setShowPinnedMsgs] = useState(false);
  const [showMemberList, setShowMemberList] = useState(true); // Defaults to open for beautiful layout structure
  const [myActiveGame, setMyActiveGame] = useState(() => localStorage.getItem('gamers_genge_user_active_game') || 'eFootball Mobile');
  const [editingPresence, setEditingPresence] = useState(false);

  // Drawer slider state for mobile layouts - defaulted to true to show the sidebar immediately on mount
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(true);

  // Custom Create Kijiwe Form States
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKijiweName, setNewKijiweName] = useState('');
  const [newKijiweDesc, setNewKijiweDesc] = useState('');
  const [newKijiweImage, setNewKijiweImage] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [imageError, setImageError] = useState('');
  const [justInvited, setJustInvited] = useState(false);

  // Bottom Navigation Bar Extra Tabs states
  const [showNotificationsPopover, setShowNotificationsPopover] = useState(false);
  const [showYouPopover, setShowYouPopover] = useState(false);
  const [nicknameInputVal, setNicknameInputVal] = useState('');

  // Active sub-channel in Discord view
  const [selectedChannel, setSelectedChannel] = useState<string>('general-stori');

  // Interactive Live Match Room Codes custom state system
  const [roomCodes, setRoomCodes] = useState<RoomCodeEntry[]>([]);
  const [localRoomCodes, setLocalRoomCodes] = useState<Record<string, RoomCodeEntry[]>>(() => {
    const saved = localStorage.getItem('gamers_genge_custom_room_codes');
    return saved ? JSON.parse(saved) : {};
  });
  const [tickTime, setTickTime] = useState<number>(Date.now());
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Post room code form inputs
  const [showPostCodeForm, setShowPostCodeForm] = useState(false);
  const [postGameType, setPostGameType] = useState('eFootball Mobile');
  const [postCodeVal, setPostCodeVal] = useState('');
  const [postPlatform, setPostPlatform] = useState('Mobile Only');
  const [postExpiryMinutes, setPostExpiryMinutes] = useState(10);

  // Pre-seed mock codes so the app looks alive instantly
  const DEFAULT_ROOM_CODES: Record<string, RoomCodeEntry[]> = {
    'lounge': [
      {
        id: 'rc1',
        hostName: 'Dida_Playz',
        gameType: 'eFootball Mobile',
        code: '8294-0193',
        platform: 'Mobile Only',
        expiredInMinutes: 10,
        isFull: false,
        createdAt: new Date().toISOString(),
        expireTime: Date.now() + 8 * 60 * 1000 // Expires in 8 minutes
      },
      {
        id: 'rc2',
        hostName: 'Ben_FIFA',
        gameType: 'EA FC 25 Mobile',
        code: '772-FC-BONGO',
        platform: 'Crossplay',
        expiredInMinutes: 15,
        isFull: false,
        createdAt: new Date(Date.now() - 3 * 105000).toISOString(),
        expireTime: Date.now() + 12 * 60 * 1000 // Expires in 12 minutes
      }
    ],
    'fifabongo': [
      {
        id: 'fc1',
        hostName: 'Kaka_Gamer',
        gameType: 'EA FC (PS5)',
        code: 'FC-8812-B',
        platform: 'PS5/Xbox/PC',
        expiredInMinutes: 15,
        isFull: false,
        createdAt: new Date().toISOString(),
        expireTime: Date.now() + 10 * 60 * 1000
      }
    ]
  };

  // Live countdown update ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setTickTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync / listen to match room codes in real-time
  useEffect(() => {
    if (!activeKijiweId) {
      setRoomCodes([]);
      return;
    }

    let active = true;
    let unsubscribe: (() => void) | null = null;

    const timer = setTimeout(() => {
      const codesRef = collection(db, 'vijiwe', activeKijiweId, 'room_codes');
      const q = query(codesRef, orderBy('createdAt', 'desc'));

      unsubscribe = onSnapshot(q, (snapshot) => {
        if (!active) return;
        const list: RoomCodeEntry[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            hostName: data.hostName || 'Anonymous',
            gameType: data.gameType || 'eFootball Mobile',
            code: data.code || '',
            platform: data.platform || 'Mobile Only',
            expiredInMinutes: data.expiredInMinutes || 10,
            isFull: data.isFull || false,
            createdAt: data.createdAt || new Date().toISOString(),
            expireTime: data.expireTime || (Date.now() + 10 * 60 * 1000)
          });
        });
        setRoomCodes(list);
      }, (error) => {
        console.warn('Realtime room codes subscription offline fallback:', error);
      });
    }, 100);

    return () => {
      active = false;
      clearTimeout(timer);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [activeKijiweId]);

  // Handler to post a new room code
  const handlePostRoomCode = async () => {
    if (!postCodeVal.trim() || !activeKijiweId) return;

    const codeStr = postCodeVal.trim();
    const authorNickname = user ? (user.displayName || 'Gamer') : (guestName || 'Gamer');
    const newCodeId = `code_${Date.now()}`;
    const generatedExpireTime = Date.now() + postExpiryMinutes * 60 * 1000;

    const newCodeEntry: RoomCodeEntry = {
      id: newCodeId,
      hostName: authorNickname,
      gameType: postGameType,
      code: codeStr,
      platform: postPlatform,
      expiredInMinutes: postExpiryMinutes,
      isFull: false,
      createdAt: new Date().toISOString(),
      expireTime: generatedExpireTime
    };

    // Save locally
    setLocalRoomCodes(prev => {
      const serverCodes = prev[activeKijiweId] || [];
      const updated = {
        ...prev,
        [activeKijiweId]: [newCodeEntry, ...serverCodes]
      };
      localStorage.setItem('gamers_genge_custom_room_codes', JSON.stringify(updated));
      return updated;
    });

    trackGAEvent('post_room_code', 'Matchmaking', `${postGameType} - ${postPlatform}`);

    setPostCodeVal('');
    setShowPostCodeForm(false);

    try {
      // Add to Firestore database
      const codesRef = collection(db, 'vijiwe', activeKijiweId, 'room_codes');
      await setDoc(doc(codesRef, newCodeId), {
        hostName: newCodeEntry.hostName,
        gameType: newCodeEntry.gameType,
        code: newCodeEntry.code,
        platform: newCodeEntry.platform,
        expiredInMinutes: newCodeEntry.expiredInMinutes,
        isFull: false,
        createdAt: newCodeEntry.createdAt,
        expireTime: newCodeEntry.expireTime
      });

      // Notify the active channel so others know a code was posted
      const messagesRef = collection(db, 'vijiwe', activeKijiweId, 'messages');
      await addDoc(messagesRef, {
        kijiweId: activeKijiweId,
        sender: 'Genge Bot',
        senderId: 'system',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=matchcode',
        content: `🚨 WANAMICHEZO: @${authorNickname} ametupa msimbo mpya wa vyumba! Game: ${postGameType} | Msimbo: ${codeStr} | Jiunge haraka kabla ya dakika ${postExpiryMinutes} kuisha! ⚽`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: 'room-codes',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Real-time database offline, saved code locally', err);
    }
  };

  // Handler to toggle "Closed/Full" status
  const handleToggleCodeFull = async (codeId: string, currentFull: boolean) => {
    // Toggle in local Room Codes state
    setLocalRoomCodes(prev => {
      const serverCodes = prev[activeKijiweId || 'lounge'] || [];
      const updatedCodes = serverCodes.map(c => c.id === codeId ? { ...c, isFull: !currentFull } : c);
      const updated = {
        ...prev,
        [activeKijiweId || 'lounge']: updatedCodes
      };
      localStorage.setItem('gamers_genge_custom_room_codes', JSON.stringify(updated));
      return updated;
    });

    // Toggle in base roomCodes state 
    setRoomCodes(prev => prev.map(c => c.id === codeId ? { ...c, isFull: !currentFull } : c));

    try {
      if (activeKijiweId) {
        const docRef = doc(db, 'vijiwe', activeKijiweId, 'room_codes', codeId);
        await updateDoc(docRef, { isFull: !currentFull });
      }
    } catch (err) {
      console.warn('Realtime database sync failed, only updated in local state:', err);
    }
  };

  const copyRoomCodeToClipboard = (codeId: string, txtCode: string) => {
    navigator.clipboard.writeText(txtCode);
    setCopiedCodeId(codeId);
    trackGAEvent('copy_room_code', 'Matchmaking', txtCode);
    setTimeout(() => {
      setCopiedCodeId(null);
    }, 2000);
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Default initial vijiwe data to seed in real-time or fall back to
  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | null = null;

    const timer = setTimeout(() => {
      const q = query(collection(db, 'vijiwe'), orderBy('createdAt', 'desc'));
      unsubscribe = onSnapshot(q, (snapshot) => {
        if (!active) return;
        const list: Kijiwe[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            name: data.name || '',
            imageUrl: data.imageUrl || '',
            description: data.description || '',
            createdBy: data.createdBy || '',
            createdAt: data.createdAt || '',
          });
        });
        
        setVijiwe(() => {
          const combined = [...DEFAULT_VIJIWE, ...list];
          const unique: Kijiwe[] = [];
          const seen = new Set();
          combined.forEach(item => {
            if (!seen.has(item.id)) {
              seen.add(item.id);
              unique.push(item);
            }
          });
          return unique;
        });
      }, (error) => {
        console.warn('Firestore subscription failed, keeping robust local list:', error);
      });
    }, 100);

    return () => {
      active = false;
      clearTimeout(timer);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Sync / listen to messages
  useEffect(() => {
    if (!activeKijiweId) {
      setMessages([]);
      return;
    }

    let active = true;
    let unsubscribe: (() => void) | null = null;

    const timer = setTimeout(() => {
      const messagesRef = collection(db, 'vijiwe', activeKijiweId, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'asc'));

      unsubscribe = onSnapshot(q, (snapshot) => {
        if (!active) return;
        const list: ChatMessage[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            kijiweId: activeKijiweId,
            sender: data.sender || 'Anonymous',
            senderId: data.senderId || '',
            avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.sender}`,
            content: data.content || '',
            timestamp: data.timestamp || '',
            channel: data.channel || 'general-stori',
            createdAt: data.createdAt || '',
          });
        });
        setMessages(list);
      }, (error) => {
        console.warn('Realtime messages load offline fallback helper alert:', error);
      });
    }, 100);

    return () => {
      active = false;
      clearTimeout(timer);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [activeKijiweId]);

  // Clean or write typing indicators
  useEffect(() => {
    if (!activeKijiweId) {
      setTypingUsers([]);
      return;
    }

    let active = true;
    let unsubscribe: (() => void) | null = null;

    const timer = setTimeout(() => {
      const typingRef = collection(db, 'vijiwe', activeKijiweId, 'typing');
      unsubscribe = onSnapshot(typingRef, (snapshot) => {
        if (!active) return;
        const list: TypingUser[] = [];
        const currentUserId = user ? user.uid : guestName;
        const now = Date.now();

        snapshot.forEach((doc) => {
          if (doc.id === currentUserId) return;
          const data = doc.data();
          if (data.lastTypedAt && now - data.lastTypedAt < 6000) {
            list.push({
              id: doc.id,
              sender: data.sender || 'Gamer'
            });
          }
        });
        setTypingUsers(list);
      }, (error) => {
        // Offline mode silent console warning
      });
    }, 100);

    return () => {
      active = false;
      clearTimeout(timer);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [activeKijiweId, user?.uid, guestName]);

  // Typing action trigger
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputVal(val);

    if (!activeKijiweId) return;

    const currentUserId = user ? user.uid : guestName;
    const nickname = user ? (user.displayName || 'Gamer') : (guestName || 'Gamer');

    const typingDocRef = doc(db, 'vijiwe', activeKijiweId, 'typing', currentUserId);
    setDoc(typingDocRef, {
      sender: nickname,
      lastTypedAt: Date.now()
    }).catch(() => {});

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      deleteDoc(typingDocRef).catch(() => {});
    }, 3000);
  };

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChannel]);

  // Send message
  const handleSendMessage = async () => {
    if (!inputVal.trim() || !activeKijiweId) return;

    const currentTimeStamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nickname = user ? (user.displayName || 'Gamer') : (guestName || 'Gamer');
    const senderUid = user ? user.uid : guestName;
    const profileAvatar = user ? (user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`) : `https://api.dicebear.com/7.x/avataaars/svg?seed=${nickname}`;
    const txt = inputVal.trim();

    setInputVal('');

    // Optimistic / Instant local cache for full offline capability
    const clientMsgId = `client_${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: clientMsgId,
      kijiweId: activeKijiweId,
      sender: nickname,
      senderId: senderUid,
      avatar: profileAvatar,
      content: txt,
      channel: selectedChannel,
      timestamp: currentTimeStamp,
      createdAt: new Date().toISOString()
    };

    setLocalMessages(prev => {
      const serverMsgs = prev[activeKijiweId] || [];
      const updated = {
        ...prev,
        [activeKijiweId]: [...serverMsgs, optimisticMsg]
      };
      localStorage.setItem('gamers_genge_custom_messages', JSON.stringify(updated));
      return updated;
    });

    try {
      const messagesRef = collection(db, 'vijiwe', activeKijiweId, 'messages');
      await addDoc(messagesRef, {
        kijiweId: activeKijiweId,
        sender: nickname,
        senderId: senderUid,
        avatar: profileAvatar,
        content: txt,
        channel: selectedChannel,
        timestamp: currentTimeStamp,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Live FireStore connection offline. Preserved locally in cache:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Switch server helper
  const selectServer = (serverId: string) => {
    setActiveKijiweId(serverId);
    setSelectedChannel('general-stori');
    // Clear notification metrics for this specific server
    setUnreadNotifications(prev => ({
      ...prev,
      [serverId]: 0
    }));
  };

  // Invite creator trigger
  const triggerInviteClipboard = () => {
    setJustInvited(true);
    const kijiweName = activeKijiwe?.name || 'Kijiwe chetu cha Magemu';
    // Generate clean trustworthy WhatsApp-style short link e.g. https://gameshome.vercel.app/#join-fifabongo
    const inviteUrl = `${window.location.origin}/#join-${activeKijiweId || 'lounge'}`;
    navigator.clipboard.writeText(`🎮 Karibu kwenye kijiwe cha "${kijiweName}" cha Gamers Genge Tanzania! Bofya kujiunga sasa hivi ucheze nasi: ${inviteUrl}`);
    trackGAEvent('share_kijiwe_link', 'Viral Sharing', kijiweName);
    setTimeout(() => setJustInvited(false), 2000);
  };

  // Image Upload convertor
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setImageError('');
    
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `kijiwe_${Date.now()}.${fileExt}`;
      const filePath = `kijiwe/${fileName}`;

      const { data, error } = await supabase.storage
        .from('game-assets')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('game-assets')
        .getPublicUrl(filePath);

      setNewKijiweImage(publicUrl);
    } catch (err: any) {
      // Offline fallback
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewKijiweImage(reader.result as string);
        setImageError('Saved locally for simulation preview');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingFile(false);
    }
  };

  // Submit creator form
  const handleCreateKijiwe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKijiweName.trim()) return;

    // Pick a superb high-quality random gaming illustration/avatar for the Kijiwe
    const fallbackImages = [
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=300&q=80'
    ];
    const finalImg = fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
    const authorNickname = user ? (user.displayName || 'Gamer') : (guestName || 'Gamer');
    const authorUid = user ? user.uid : guestName;

    const newServerId = `custom_${Date.now()}`;
    const customNewKijiwe: Kijiwe = {
      id: newServerId,
      name: newKijiweName.trim(),
      imageUrl: finalImg,
      description: newKijiweDesc.trim() || 'Kijiwe kipya cha wasanii wa magemu.',
      createdBy: authorNickname,
      createdAt: new Date().toISOString()
    };

    // Save to local custom vijiwe map instantly
    const saved = localStorage.getItem('gamers_genge_custom_vijiwe');
    const existingCustoms = saved ? JSON.parse(saved) : [];
    const updatedCustoms = [...existingCustoms, customNewKijiwe];
    localStorage.setItem('gamers_genge_custom_vijiwe', JSON.stringify(updatedCustoms));

    trackGAEvent('create_kijiwe', 'Engagement', customNewKijiwe.name);

    setVijiwe([...DEFAULT_VIJIWE, ...updatedCustoms]);
    setActiveKijiweId(newServerId);
    setSelectedChannel('general-stori');

    setNewKijiweName('');
    setNewKijiweDesc('');
    setNewKijiweImage('');
    setShowCreateForm(false);
    setMobileDrawerOpen(false); // Close mobile drawer to yield perfect view

    try {
      const vijiweRef = collection(db, 'vijiwe');
      const docRef = await addDoc(vijiweRef, {
        name: customNewKijiwe.name,
        imageUrl: customNewKijiwe.imageUrl,
        description: customNewKijiwe.description,
        createdBy: customNewKijiwe.createdBy,
        createdById: authorUid,
        createdAt: customNewKijiwe.createdAt
      });

      // System welcome message
      const messagesRef = collection(db, 'vijiwe', docRef.id, 'messages');
      await addDoc(messagesRef, {
        kijiweId: docRef.id,
        sender: 'Genge Bot',
        senderId: 'system',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=welcome',
        content: `Karibu kwenye kijiwe kipya cha "${customNewKijiwe.name}" kilichoanzishwa na @${authorNickname}! Let's start typing custom chats below!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        channel: 'general-stori',
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Real-time database offline, saved server locally', err);
    }
  };

  // Up-to-date nicknames
  const userNick = user ? (user.displayName || 'Genge Gamer') : guestName;

  // Setup active indices
  const activeKijiwe = vijiwe.find(v => v.id === activeKijiweId) || DEFAULT_VIJIWE[0];

  // Merge Firestore-loaded messages with fallback dialogue and user optimistic entries
  const activeChannelMessages = [
    ...(DEFAULT_MESSAGES[activeKijiweId || 'lounge'] || []),
    ...messages,
    ...(localMessages[activeKijiweId || 'lounge'] || [])
  ]
  .filter(msg => (msg.channel || 'general-stori') === selectedChannel)
  .filter(msg => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return msg.content.toLowerCase().includes(q) || msg.sender.toLowerCase().includes(q);
  })
  // De-duplicate on ID
  .filter((msg, idx, self) => self.findIndex(m => m.id === msg.id) === idx)
  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Merge lists and filter out stale active countdown indicators safely
  const activeRoomCodesList = [
    ...(roomCodes),
    ...(localRoomCodes[activeKijiweId || 'lounge'] || []),
    ...(DEFAULT_ROOM_CODES[activeKijiweId || 'lounge'] || [])
  ]
  .filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.gameType.toLowerCase().includes(q) || item.hostName.toLowerCase().includes(q) || item.code.toLowerCase().includes(q);
  })
  // De-duplicate on ID or room code
  .filter((item, idx, self) => self.findIndex(c => c.id === item.id || c.code === item.code) === idx)
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Members list structure for the Discord-like far-right premium info bar
  interface GengeMember {
    id: string;
    name: string;
    role: 'Admin' | 'Moderator' | 'Online' | 'Offline';
    status: 'online' | 'idle' | 'offline';
    presence?: string;
    avatarSeed: string;
  }

  const getStaticKijiweMembers = (kijiweId: string): GengeMember[] => {
    const baseMembers: GengeMember[] = [
      { id: 'm1', name: 'Dida_Playz', role: 'Admin', status: 'online', presence: 'eFootball Mobile', avatarSeed: 'dida' },
      { id: 'm2', name: 'Ben_FIFA', role: 'Moderator', status: 'online', presence: 'EA FC Mobile', avatarSeed: 'ben' },
      { id: 'm3', name: 'Kaka_Gamer', role: 'Moderator', status: 'idle', presence: 'PES PSP (Co-Op)', avatarSeed: 'kaka' },
      { id: 'm4', name: 'Chacha_eFoot', role: 'Online', status: 'online', presence: 'eFootball Mobile', avatarSeed: 'chacha' },
      { id: 'm5', name: 'Mgeni_839', role: 'Online', status: 'online', presence: 'Wazi kulamba dume...', avatarSeed: 'mgeni' },
      { id: 'm6', name: 'Soka_Master', role: 'Offline', status: 'offline', avatarSeed: 'soka' },
      { id: 'm7', name: 'Bongo_Pro_GT', role: 'Offline', status: 'offline', avatarSeed: 'gtpro' },
      { id: 'm8', name: 'Tigo_FIFA_Kingly', role: 'Offline', status: 'offline', avatarSeed: 'tigo' }
    ];

    if (kijiweId === 'fifabongo') {
      return baseMembers.map(m => {
        if (m.name === 'Ben_FIFA') return { ...m, role: 'Admin', presence: 'Mzee wa Maelekezo' };
        if (m.name === 'Dida_Playz') return { ...m, role: 'Moderator', status: 'idle', presence: 'EA FC 25 Mobile' };
        return m;
      });
    }

    if (kijiweId === 'gtabongo') {
      return baseMembers.map(m => {
        if (m.name === 'Bongo_Pro_GT') return { ...m, role: 'Admin', status: 'online', presence: 'GTA V Online Crew' };
        if (m.presence) return { ...m, presence: 'Streaming Cheat Code 🎮' };
        return m;
      });
    }

    return baseMembers;
  };

  const rawMembers = getStaticKijiweMembers(activeKijiweId || 'lounge');
  const hasMe = rawMembers.some(m => m.name.toLowerCase() === userNick.toLowerCase());

  const activeKijiweMembers: GengeMember[] = hasMe
    ? rawMembers.map(m => m.name.toLowerCase() === userNick.toLowerCase() ? { ...m, presence: myActiveGame } : m)
    : [
        {
          id: 'me_current',
          name: userNick,
          role: activeKijiwe?.createdBy === userNick ? 'Admin' : 'Online',
          status: 'online',
          presence: myActiveGame,
          avatarSeed: userNick
        },
        ...rawMembers
      ];

  // Group members neatly by roles for premium sidebar look
  const adminsGroup = activeKijiweMembers.filter(m => m.role === 'Admin');
  const modsGroup = activeKijiweMembers.filter(m => m.role === 'Moderator');
  const onlineGroup = activeKijiweMembers.filter(m => m.role === 'Online' && m.status !== 'offline');
  const offlineGroup = activeKijiweMembers.filter(m => m.status === 'offline');

  return (
    <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-[#04060f] text-slate-300 overflow-hidden flex z-[40]">
      {/* 
        NATIVE DISCORD DOUBLE SIDEBAR DRAWER 
        On desktop, it is locked side-by-side. On mobile, it slides in from the left over the screen.
      */}
      <AnimatePresence>
        {(mobileDrawerOpen || window.innerWidth > 768) && (
          <motion.div
            initial={{ x: -350, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -350, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed md:relative inset-y-0 left-0 z-50 flex w-[310px] md:w-[320px] h-full shrink-0 select-none bg-[#0a0f21]"
          >
            {/* ========================================================
               1. THE LEFT-DOCKED STRIP (SERVER RAIL)
               ======================================================== */}
            <div className="w-[76px] shrink-0 bg-[#060914] flex flex-col items-center py-4 justify-between h-full relative border-r border-[#ffffff05]">
              
              {/* Guild Servers Container */}
              <div className="w-full flex-1 flex flex-col items-center gap-2 overflow-y-auto no-scrollbar pt-1 px-2">
                {/* Global Static Gamers Genge Home Accent */}
                <div className="relative group/home mb-2 flex flex-col items-center">
                  <div 
                    onClick={() => {
                      window.location.hash = '#home';
                      window.location.reload();
                    }}
                    className="w-12 h-12 rounded-full bg-[#1b254a] hover:bg-blue-600 transition-all duration-300 flex items-center justify-center text-white cursor-pointer group-hover/home:rounded-2xl"
                    title="Genge Home"
                  >
                    <Gamepad2 size={22} className="text-blue-400 group-hover/home:text-white" />
                  </div>
                  <span className="text-[7.5px] font-black uppercase text-slate-500 mt-1 tracking-wider">Home</span>
                  <div className="absolute top-4 -right-1 w-2 h-2 bg-blue-500 rounded-full scale-0 group-hover/home:scale-100 transition-all"></div>
                </div>

                <div className="w-8 h-[2px] bg-white/5 rounded-full mb-3 shrink-0"></div>

                {/* Firestore-loaded server list loops */}
                {vijiwe.map((k) => {
                  const isActive = k.id === activeKijiweId;
                  const unreadCount = unreadNotifications[k.id] || 0;
                  return (
                    <div key={k.id} className="relative group flex items-center justify-center w-full py-1">
                      
                      {/* Active pill shape: grows larger on active server */}
                      <div className={`absolute left-0 w-[4px] rounded-r-full bg-white transition-all duration-300 ${
                        isActive 
                          ? 'h-8' 
                          : 'h-2 scale-0 group-hover:scale-100 group-hover:h-5'
                      }`} />

                      {/* Circular avatar optimized for thumb reach that morphs into a squircle if active */}
                      <div className="relative">
                        <img
                          src={k.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=150'}
                          alt={k.name}
                          onClick={() => selectServer(k.id)}
                          className={`w-12 h-12 object-cover cursor-pointer transition-all duration-300 shadow-md ${
                            isActive 
                              ? 'rounded-[14px] ring-2 ring-blue-500/80 scale-102' 
                              : 'rounded-full group-hover:rounded-[14px] hover:scale-105 border border-white/5'
                          }`}
                        />

                        {/* Top-right notification dots badge */}
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white font-sans font-black text-[9px] w-[18px] h-[18px] flex items-center justify-center rounded-full border border-[#060914] animate-pulse shadow-lg">
                            {unreadCount}
                          </span>
                        )}
                      </div>

                    </div>
                  );
                })}

                {/* Dynamic Creator Plus icon */}
                <div className="relative group mt-3">
                  <button
                    onClick={() => {
                      setShowCreateForm(true);
                      setMobileDrawerOpen(false);
                    }}
                    className="w-12 h-12 rounded-full bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 hover:border-emerald-400 text-emerald-400 hover:text-white transition-all duration-300 flex items-center justify-center cursor-pointer group-hover:rounded-[14px]"
                    title="Anzisha Kijiwe kipya"
                  >
                    <Plus size={20} />
                  </button>
                  <div className="absolute top-4 -right-1 w-2 h-2 bg-emerald-400 rounded-full scale-0 group-hover:scale-100 transition-all"></div>
                </div>

              </div>

              {/* Bot Info indicator in rail */}
              <div className="flex flex-col items-center gap-1.5 pt-4 border-t border-white/5 w-full">
                <span className="text-[8px] font-black text-slate-500 tracking-wider">GENGE</span>
              </div>

            </div>

            {/* ========================================================
               2. CHANNELS LIST RAIL 
               ======================================================== */}
            <div className="flex-1 bg-[#0a0f21] flex flex-col justify-between h-full select-none overflow-hidden">
              
              <div className="flex flex-col h-full overflow-hidden">
                {/* Active server title layout */}
                <div className="p-4 border-b border-white/5 bg-[#0d152e]/55 flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-[9px] font-black tracking-widest text-orange-400 uppercase">KIJIWE CHETU LIVE</span>
                    <h2 className="text-xs font-black text-white uppercase tracking-tight truncate mt-0.5">
                      {activeKijiwe?.name || 'Vijiwe Space'}
                    </h2>
                  </div>
                  <Sparkles size={12} className="text-blue-400 animate-pulse" />
                </div>

                {/* Channel List Menu */}
                <div className="p-3 flex-1 overflow-y-auto space-y-4 no-scrollbar">
                  <div>
                    <span className="block text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 pl-2">
                      TEXT CHANNELS
                    </span>

                    <div className="space-y-1">
                      {[
                        { id: 'general-stori', label: 'soga-bongo 💬', desc: 'Mjadala na michapo ya magemu' },
                        { id: 'league-mechi', label: 'mechi-na-ligi 🏆', desc: 'Ligi na michuano ya soka (EA FC / eFootball)' },
                        { id: 'room-codes', label: 'vyumba-vya-codes 🔑', desc: 'Daka msimbo wa chumba sasa!' }
                      ].map((ch) => {
                        const isChActive = selectedChannel === ch.id;
                        return (
                          <button
                            key={ch.id}
                            onClick={() => {
                              setSelectedChannel(ch.id);
                              // CLOSE mobile drawer when user taps on channel
                              setMobileDrawerOpen(false);
                            }}
                            className={`w-full flex flex-col px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                              isChActive 
                                ? 'bg-blue-600/10 border-l-[3px] border-blue-500 text-blue-400' 
                                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 text-xs font-black">
                              <Hash size={13} className="text-blue-500" /> {ch.label}
                            </span>
                            <span className="text-[9px] text-slate-500 ml-5 font-medium truncate">
                              {ch.desc}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic members list for this active Server */}
                  <div className="pt-2 border-t border-white/5">
                    <span className="block text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2.5 pl-2">
                      ONLINE NOW
                    </span>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <p className="text-[10px] font-bold text-emerald-400">Genge Bot (Mod)</p>
                      </div>

                      <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white/[0.02] rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <p className="text-[10px] font-bold text-slate-300">@{activeKijiwe?.createdBy || 'Host'}</p>
                      </div>
                    </div>
                  </div>

                  {/* High fidelity interactive Create Kijiwe Call-to-Action Card */}
                  <div className="pt-2 border-t border-white/5">
                    <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-xl border border-emerald-500/10 hover:border-emerald-500/25 transition-all text-left">
                      <div className="flex items-center gap-1.5 mb-1 text-emerald-400">
                        <Sparkles size={11} className="animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-wider">Kijiwe Chako Pekee</span>
                      </div>
                      <p className="text-[9px] text-slate-400 leading-normal mb-2.5 font-sans">
                        Tengeneza kijiwe chako ukipendacho ili kualika washiriki na kuweka vyumba au soga za siri!
                      </p>
                      <button
                        onClick={() => {
                          setShowCreateForm(true);
                          setMobileDrawerOpen(false);
                        }}
                        className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-black text-[9.5px] rounded-lg shadow-lg uppercase transition-all duration-300 text-center cursor-pointer active:scale-95"
                      >
                        Anzisha Kijiwe +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Persist Guest profile card block at the bottom list */}
                <div className="p-3 bg-[#050814] border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-[11px] font-black text-blue-400 uppercase shrink-0">
                      {user ? (user.displayName ? user.displayName.slice(0, 2) : 'GM') : guestName.slice(6, 8)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-white truncate leading-none">
                        @{user ? (user.displayName || 'Genge Gamer') : guestName}
                      </p>
                      <span className="text-[7.5px] text-emerald-500 font-extrabold tracking-widest uppercase mt-0.5 block flex items-center gap-0.5">
                        <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></span> ONLINE
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BACKDROP SHIELD on mobile layout when drawer is open */}
      {mobileDrawerOpen && (
        <div 
          onClick={() => setMobileDrawerOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* ========================================================
         3. DEDICATED STREAM MESSAGES SCREEN (SAVES 100% OF MOBILE VIEW)
         ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative bg-[#04060f]">
        
        {/* CHATROOM BAR CONTAINER HEADER */}
        <div className="px-4 py-3 md:px-5 md:py-4 bg-[#070b16] border-b border-white/10 flex items-center justify-between gap-3 shrink-0 relative z-30 shadow-lg">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Hamburger button on mobile structure ONLY to reveal or slide drawer */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="p-2 bg-white/5 hover:bg-white/10 text-slate-200 rounded-xl cursor-pointer md:hidden active:scale-95 transition-transform shrink-0"
              title="Open channels sidebar"
            >
              <Menu size={16} />
            </button>

            {/* Sub-channel visual status metadata */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-base font-mono font-black text-blue-500 hover:scale-110 transition-transform">#</span>
              <h1 className="text-xs md:text-sm font-black text-white uppercase tracking-tight truncate pl-0.5">
                {selectedChannel}
              </h1>
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse ml-1.5 hidden sm:inline-block"></span>
              <span className="text-[8.5px] text-slate-500 font-bold tracking-wider uppercase truncate hidden lg:inline-block bg-white/5 px-2 py-0.5 rounded-full">
                Server: {activeKijiwe?.name || 'Lounge'}
              </span>
            </div>

            {/* Collapsible search zone for sleek filtering */}
            <div className="hidden sm:flex items-center ml-4 relative max-w-[180px] md:max-w-[245px] w-full">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tafuta gumzo..."
                  className="w-full bg-black/45 hover:bg-black/60 focus:bg-black/75 border border-white/5 focus:border-blue-500/50 focus:outline-none text-[10px] text-slate-200 pl-8 pr-7 py-1.5 rounded-lg transition-all font-mono"
                />
                <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile search toggle button */}
            <button
              onClick={() => setSearchBarOpen(prev => !prev)}
              className={`p-2 rounded-xl transition-all cursor-pointer sm:hidden ${
                searchBarOpen ? 'bg-blue-600/20 text-blue-400' : 'bg-white/5 hover:bg-white/10 text-slate-400'
              }`}
              title="Tafuta"
            >
              <Search size={14} />
            </button>

            {/* Pinned Messages Trigger */}
            <button
              onClick={() => {
                setShowPinnedMsgs(prev => !prev);
              }}
              className={`p-2 rounded-xl transition-all cursor-pointer relative ${
                showPinnedMsgs ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20' : 'bg-white/5 hover:bg-white/10 text-slate-400'
              }`}
              title="Ujumbe uliobandikwa"
            >
              <Pin size={14} className={showPinnedMsgs ? 'rotate-45 transition-transform' : 'transition-transform'} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
            </button>

            {/* Togglable Genge Members Panel button */}
            <button
              onClick={() => setShowMemberList(prev => !prev)}
              className={`p-2 rounded-xl transition-all cursor-pointer relative ${
                showMemberList ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 'bg-white/5 hover:bg-white/10 text-slate-400'
              }`}
              title="Washiriki wa Genge (Members Live Status)"
            >
              <Users size={14} className={showMemberList ? 'scale-110 text-orange-400' : 'text-slate-400'} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </button>

            {/* Notification sound settings toggler */}
            <button
              onClick={() => setNotificationsMuted(prev => !prev)}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                notificationsMuted ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-white/5 hover:bg-white/10 text-slate-400'
              }`}
              title={notificationsMuted ? 'Washa sauti (Notifications Off)' : 'Zima sauti (Notifications On)'}
            >
              {notificationsMuted ? <BellOff size={14} /> : <Bell size={14} />}
            </button>

            {/* Deep-link Share Action Button */}
            <button
              onClick={triggerInviteClipboard}
              className="px-3 py-2 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 hover:from-blue-600/20 hover:to-indigo-600/20 border border-blue-500/20 text-blue-400 text-[8.5px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Share2 size={11} className="text-blue-400 animate-pulse" />
              <span>{justInvited ? 'KIMEKOPIWA!' : 'SHARE LINK'}</span>
            </button>

            {/* Back to Home page redirection trigger icon */}
            <button
              onClick={() => {
                window.location.hash = '#home';
                window.location.reload();
              }}
              className="p-2 sm:p-2.5 bg-white/5 hover:bg-white/10 hover:text-white rounded-xl text-slate-400 transition-all cursor-pointer opacity-90 hover:opacity-100"
              title="Rudi Magemu"
            >
              <ArrowLeft size={14} />
            </button>
          </div>

          {/* ABSOLUTE FLOATING PINNED MESSAGES DROPDOWN */}
          <AnimatePresence>
            {showPinnedMsgs && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-4 top-[105%] w-72 sm:w-80 bg-[#080d19]/95 border border-white/10 rounded-2xl p-4 text-slate-300 shadow-2xl backdrop-blur-md z-50 text-left"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                  <span className="text-[9px] font-mono font-black text-blue-400 uppercase tracking-widest flex items-center gap-1">
                    <Pin size={10} className="rotate-45" /> PINNED MESSAGES / MAJALIZO MAPYA
                  </span>
                  <button
                    onClick={() => setShowPinnedMsgs(false)}
                    className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-white transition-colors cursor-pointer"
                  >
                    <X size={10} />
                  </button>
                </div>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  <div className="p-2.5 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[8.5px] font-extrabold text-white">@Genge_Bot</span>
                      <span className="text-[7.5px] text-slate-500 font-mono font-bold">RASMI</span>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-normal font-sans">
                      {selectedChannel === 'general-stori' && "Karibu kwenye Genge! Simu, Playstation na PC setups zote zinaruhusiwa humu. Sheria: Heshimu wadau wetu wote mapambanoni!"}
                      {selectedChannel === 'league-mechi' && "Ratiba ya Kiswahili Cup wiki hii kupitia EA FC 25 na eFootball Mobile inatolewa kila Ijumaa usiku na ma-admin!"}
                      {selectedChannel === 'room-codes' && "Ukipachika Room Code tafadhali chagua mchezo na jukwaa ili wadau wanaocheza kwenye platform husika wadake haraka!"}
                    </p>
                  </div>
                  
                  <div className="p-2 bg-blue-500/5 rounded-xl border border-blue-500/10">
                    <span className="text-[8px] font-black text-blue-400 uppercase tracking-wider font-mono">Maelekezo ya Programu</span>
                    <p className="text-[9.5px] text-slate-400 mt-1 font-sans">
                      Tumia kitufe cha <span className="text-white font-bold">SHARE LINK</span> hapo juu kualika washindani au marafiki zako waje kupiga mechi hapa!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ABSOLUTE MOBILE ANIMATING SEARCH PANEL */}
          <AnimatePresence>
            {searchBarOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="absolute left-0 right-0 top-full bg-[#070b16] border-b border-white/10 px-4 py-2.5 sm:hidden flex items-center gap-2 z-40 shadow-xl"
              >
                <div className="relative w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tafuta gumzo (e.g. eFootball)..."
                    className="w-full bg-black/45 focus:bg-black/60 border border-white/5 focus:border-blue-500 focus:outline-none text-xs text-slate-200 pl-8 pr-7 py-2 rounded-xl"
                  />
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSearchBarOpen(false);
                    setSearchQuery('');
                  }}
                  className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 px-1 shrink-0 cursor-pointer"
                >
                  Funga
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* TOP DESCRIPTION TAPE BAR ACCUSED */}
        <div className="px-5 py-2.5 bg-[#0c142b]/20 border-b border-white/5 text-[9.5px] text-slate-400 font-bold shrink-0 flex items-center gap-2 select-none">
          <Info size={11} className="text-blue-500/70" />
          <p className="truncate">
            {selectedChannel === 'general-stori' && "Mjadala, soga na michapo moto kuhusu magemu yote Tanzania."}
            {selectedChannel === 'league-mechi' && "Michuano ya EA FC & eFootball, ratiba, matokeo na nani mbabe wa mtaani."}
            {selectedChannel === 'room-codes' && "Chumba maalum cha kushare Room Codes. Weka yako au nakili ya wenzako ucheze sasa hivi!"}
          </p>
        </div>

        {/* FEED MESSAGES SCROLL PANELS */}
        <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 scroll-smooth relative select-text custom-scroll-genge">
          
          {selectedChannel === 'room-codes' && (
             <div className="mb-6 p-4 bg-[#0a1124] rounded-2xl border border-blue-500/20 shadow-xl space-y-4">
               {/* Dashboard header with a 'Tupa Msimbo' button */}
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                 <div>
                   <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5 font-mono">
                     <Flame size={14} className="text-orange-500 animate-pulse" /> Vyumba vya Mechi (Room Codes Feed)
                   </h3>
                   <p className="text-[10px] text-slate-400 mt-1 leading-normal font-sans">
                     Msimbo inafutika yenyewe ikizidi muda kuzuia kupoteza muda. Gonga Nakili (Copy) kujiunga haraka!
                   </p>
                 </div>
                 
                 <button
                   onClick={() => setShowPostCodeForm(prev => !prev)}
                   className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 self-start sm:self-auto shrink-0 select-none cursor-pointer"
                 >
                   <Plus size={12} /> {showPostCodeForm ? 'Funga Fomu' : 'Anzisha Chumba (Post Code)'}
                 </button>
               </div>
               
               {/* Expandable inline creator form to add codes easily */}
               {showPostCodeForm && (
                 <motion.div 
                   initial={{ opacity: 0, y: -10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="p-4 bg-[#050812]/90 border border-white/10 rounded-xl space-y-3 shadow-2xl"
                 >
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
                     {/* Game Selector */}
                     <div className="space-y-1">
                       <label className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-widest pl-1 font-mono">Mchezo (Game)</label>
                       <select 
                         value={postGameType}
                         onChange={(e) => setPostGameType(e.target.value)}
                         className="w-full bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none transition-all text-xs text-white p-2.5 rounded-lg select-none cursor-pointer"
                       >
                         <option value="eFootball Mobile" className="bg-[#0a0f21]">eFootball Mobile</option>
                         <option value="EA FC Mobile" className="bg-[#0a0f21]">EA FC Mobile</option>
                         <option value="EA FC 25 (Console/PC)" className="bg-[#0a0f21]">EA FC 25 (Console/PC)</option>
                         <option value="PES PSP (Co-Op)" className="bg-[#0a0f21]">PES PSP (Co-Op)</option>
                         <option value="eFootball Co-Op" className="bg-[#0a0f21]">eFootball Co-Op</option>
                         <option value="Custom Game Match" className="bg-[#0a0f21]">Mchezo Mwingine</option>
                       </select>
                     </div>
                     
                     {/* Room Code */}
                     <div className="space-y-1">
                       <label className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-widest pl-1 font-mono">Msimbo (Room Code) *</label>
                       <input 
                         type="text"
                         required
                         value={postCodeVal}
                         onChange={(e) => setPostCodeVal(e.target.value)}
                         placeholder="e.g. 8294-0193 au FC839"
                         maxLength={25}
                         className="w-full bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none transition-all text-xs text-white p-2.5 rounded-lg font-mono uppercase"
                       />
                     </div>
                     
                     {/* Platform */}
                     <div className="space-y-1">
                       <label className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-widest pl-1 font-mono">Jukwaa (Platform)</label>
                       <select 
                         value={postPlatform}
                         onChange={(e) => setPostPlatform(e.target.value)}
                         className="w-full bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none transition-all text-xs text-white p-2.5 rounded-lg select-none cursor-pointer"
                       >
                         <option value="Mobile Only" className="bg-[#0a0f21]">Simu Tu (Mobile)</option>
                         <option value="PS5/Xbox/PC" className="bg-[#0a0f21]">Console / PC</option>
                         <option value="Crossplay" className="bg-[#0a0f21]">Crossplay (Yote)</option>
                       </select>
                     </div>
                     
                     {/* Expiry period */}
                     <div className="space-y-1">
                       <label className="block text-[8px] text-slate-400 font-extrabold uppercase tracking-widest pl-1 font-mono">Muda wa Vyumba (Expiry)</label>
                       <select 
                         value={postExpiryMinutes}
                         onChange={(e) => setPostExpiryMinutes(Number(e.target.value))}
                         className="w-full bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none transition-all text-xs text-white p-2.5 rounded-lg select-none cursor-pointer"
                       >
                         <option value={5} className="bg-[#0a0f21]">Dakika 5 (Fast Match)</option>
                         <option value={10} className="bg-[#0a0f21]">Dakika 10 (Urgent)</option>
                         <option value={15} className="bg-[#0a0f21]">Dakika 15 (Standard)</option>
                         <option value={30} className="bg-[#0a0f21]">Dakika 30 (Extended)</option>
                       </select>
                     </div>
                   </div>
                   
                   <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                     <button
                       type="button"
                       onClick={() => setShowPostCodeForm(false)}
                       className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-400 text-[9px] font-extrabold uppercase tracking-wider rounded-lg cursor-pointer"
                     >
                       Ghairi
                     </button>
                     <button
                       type="button"
                       onClick={handlePostRoomCode}
                       disabled={!postCodeVal.trim()}
                       className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all shadow-md ${
                         postCodeVal.trim()
                           ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer active:scale-95'
                           : 'bg-[#1b254a]/30 text-slate-500 cursor-not-allowed'
                       }`}
                     >
                       Post Code Sasa
                     </button>
                   </div>
                 </motion.div>
               )}
               
               {/* Render Grid array cards of active room codes */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                 {activeRoomCodesList.length === 0 ? (
                   <div className="col-span-full py-8 text-center text-slate-500 text-[10px] font-mono leading-relaxed bg-black/20 rounded-xl border border-dashed border-white/5">
                     Hakuna vyumba vilivyowekwa msimbo kwa sasa hivi. <br />
                     <span className="text-blue-400 font-extrabold cursor-pointer hover:underline" onClick={() => setShowPostCodeForm(true)}>Bofya hapa</span> kutupa msimbo wako wa kwanza wa mechi kucheza na wadau! ⚽
                   </div>
                 ) : (
                   activeRoomCodesList.map((codeItem) => {
                     // Calculate seconds countdown remaining on timer tick
                     const remainingMs = codeItem.expireTime - tickTime;
                     const isExpired = remainingMs <= 0;
                     
                     let minutesLeft = 0;
                     let secondsLeft = 0;
                     if (remainingMs > 0) {
                       minutesLeft = Math.floor(remainingMs / 60000);
                       secondsLeft = Math.floor((remainingMs % 60000) / 1000);
                     }
                     
                     const isFastEnding = remainingMs > 0 && remainingMs < 120000; // less than 2 minutes left
                     
                     return (
                       <div 
                         key={codeItem.id} 
                         className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between text-left ${
                           isExpired 
                             ? 'bg-black/40 border-white/5 opacity-55' 
                             : codeItem.isFull 
                             ? 'bg-emerald-950/20 border-emerald-500/20 shadow-inner'
                             : 'bg-[#0f1832] hover:bg-[#121d3e] border-white/10 hover:border-blue-500/25 shadow-lg'
                         }`}
                       >
                         {/* Card glowing gradient */}
                         {!isExpired && !codeItem.isFull && (
                           <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/[0.03] rounded-full filter blur-xl pointer-events-none" />
                         )}
                         
                         <div className="flex justify-between items-start gap-2 mb-2">
                           <div className="min-w-0">
                             <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest font-mono block">
                               {codeItem.gameType}
                             </span>
                             <span className="text-[8.5px] text-slate-500 font-bold font-mono">
                               Platform: {codeItem.platform}
                             </span>
                           </div>
                           
                           {/* Expiry countdown tag */}
                           <div className="shrink-0 text-right">
                             {isExpired ? (
                               <span className="px-2 py-0.5 bg-red-950/30 border border-red-900/40 rounded text-[7.5px] font-mono text-red-400 uppercase font-black">
                                 Muda Umeisha
                               </span>
                             ) : (
                               <span className={`px-2 py-0.5 rounded text-[8.5px] font-mono font-black flex items-center gap-1.5 ${
                                 isFastEnding 
                                   ? 'bg-red-500/20 border border-red-500/35 text-red-400 animate-pulse'
                                   : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                               }`}>
                                 <Clock size={10} className={isFastEnding ? 'text-red-400' : 'text-emerald-400'} />
                                 {String(minutesLeft).padStart(2, '0')}:{String(secondsLeft).padStart(2, '0')}
                               </span>
                             )}
                           </div>
                         </div>
                         
                         {/* Large Game Code display box */}
                         <div className="my-2 p-2 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between gap-2.5">
                           <span className="text-xs md:text-sm font-black font-mono tracking-widest text-white truncate px-1 select-text">
                             {codeItem.code}
                           </span>
                           
                           <button
                             onClick={() => copyRoomCodeToClipboard(codeItem.id, codeItem.code)}
                             className={`px-3 py-1.5 text-[8.5px] font-black uppercase tracking-widest rounded-lg cursor-pointer select-none transition-all flex items-center gap-1 shrink-0 ${
                               copiedCodeId === codeItem.id 
                                 ? 'bg-emerald-600 text-white' 
                                 : 'bg-white/10 hover:bg-white/20 text-slate-200'
                             }`}
                           >
                             {copiedCodeId === codeItem.id ? (
                               <>
                                 <Check size={9} /> copied
                               </>
                             ) : (
                               <>
                                 <Copy size={9} /> Copy
                               </>
                             )}
                           </button>
                         </div>
                         
                         {/* Card Footer: Host and full button switcher */}
                         <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-2 mt-1.5 text-[9.5px]">
                           <div className="flex items-center gap-1.5 truncate">
                             <div className="w-5 h-5 rounded-lg bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-[8.5px] font-extrabold text-blue-400 uppercase select-none font-mono shrink-0">
                               {codeItem.hostName.slice(0, 2).toUpperCase()}
                             </div>
                             <span className="text-slate-400 font-extrabold truncate">@{codeItem.hostName}</span>
                           </div>
                           
                           {/* Mark Full button toggle */}
                           {!isExpired && (
                             <button
                               onClick={() => handleToggleCodeFull(codeItem.id, codeItem.isFull)}
                               className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase font-mono tracking-wider transition-all cursor-pointer ${
                                 codeItem.isFull 
                                   ? 'bg-red-500/10 text-red-400 border border-red-500/25 hover:bg-white/5' 
                                   : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20'
                               }`}
                             >
                               {codeItem.isFull ? '● KIMEJAA' : '● WAZI'}
                             </button>
                           )}
                         </div>
                       </div>
                     );
                   })
                 )}
               </div>
             </div>
          )}

          {activeChannelMessages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-24 select-none">
              <div className="p-4 bg-white/5 rounded-full text-slate-600 mb-3 border border-white/5">
                <Hash size={24} className="text-blue-400" />
              </div>
              <h3 className="font-bold text-white text-xs uppercase tracking-widest">Kijiwe Kiko Tayari!</h3>
              <p className="text-[10px] text-slate-500 mt-1 max-w-[260px] leading-relaxed">Kuwa wa kwanza kuanza real-time stori na wajumbe humu ndani sasa hivi!</p>
            </div>
          ) : (
            activeChannelMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${msg.isMe ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                {!msg.isMe && (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 bg-[#16203a] shrink-0 select-none">
                    <img src={msg.avatar} alt={msg.sender} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex flex-col">
                  {!msg.isMe && (
                    <span className="text-[9.5px] font-black text-slate-400 mb-1 pl-1 select-none">
                      @{msg.sender}
                    </span>
                  )}

                  <div className={`px-4 py-3 rounded-2xl text-[11.5px] leading-relaxed break-all select-text ${
                    msg.isMe 
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/10'
                      : msg.sender === 'Genge Bot'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-tl-none'
                      : 'bg-white/5 text-slate-200 border border-white/5 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>

                  <div className={`flex items-center gap-1.5 mt-1 select-none ${msg.isMe ? 'justify-end pr-1' : 'justify-startpl-1'}`}>
                    <span className="text-[7.5px] text-slate-500 font-bold font-mono">
                      {msg.timestamp}
                    </span>
                    {msg.isMe && <CheckCheck size={9} className="text-blue-400" />}
                  </div>
                </div>
              </div>
            ))
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* TYPING LOOPS */}
        <div className="h-5 px-5 flex items-center select-none overflow-hidden pb-1">
          <AnimatePresence>
            {typingUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="flex items-center gap-1 text-[9px] text-slate-400 font-bold"
              >
                <span className="text-slate-100 truncate max-w-[150px]">
                  @{typingUsers.map(u => u.sender).join(', ')}
                </span>
                <span>anaandika ujumbe...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM MESSAGE INPUT ROW */}
        <div className="p-4 bg-[#050812] border-t border-white/5 flex gap-2 w-full items-center shrink-0 pb-32">
          <input
            type="text"
            value={inputVal}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Ujumbe kwenda #${selectedChannel}...`}
            maxLength={500}
            className="flex-1 bg-white/5 border border-white/10 hover:border-white/15 focus:border-blue-500 focus:outline-none transition-all duration-200 text-xs text-white px-4 py-3.5 rounded-2xl placeholder:text-slate-500"
          />
          
          <button
            onClick={handleSendMessage}
            disabled={!inputVal.trim()}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer ${
              inputVal.trim()
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:scale-102'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-40'
            }`}
            title="Send chat code"
          >
            <Send size={14} />
          </button>
        </div>

      </div>

      {/* ========================================================
         6. THE DISCORD-STYLE MEMBERS SIDEBAR (RIGHT SIDEBAR)
         ======================================================== */}
      <AnimatePresence>
        {showMemberList && (
          <>
            {/* Backdrop overlay on mobile/tablet */}
            <div 
              onClick={() => setShowMemberList(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            />
            
            <motion.div
              initial={{ x: 280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 280, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed lg:relative inset-y-0 right-0 z-40 lg:z-10 flex flex-col w-64 h-full bg-[#060a16] border-l border-white/10 shrink-0 select-none pb-20 lg:pb-0"
            >
              {/* Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-mono font-black text-slate-200 uppercase tracking-widest">
                    WASHIRIKI ({activeKijiweMembers.length})
                  </span>
                </div>
                
                {/* Mobile Close Button */}
                <button
                  onClick={() => setShowMemberList(false)}
                  className="lg:hidden p-1.5 bg-white/5 hover:bg-white/10 rounded mr-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Funga"
                >
                  <X size={10} />
                </button>
              </div>

              {/* Interactive User Presencing Panel */}
              <div className="p-3 bg-black/30 border-b border-white/5 shrink-0 select-none text-left">
                <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest block mb-1.5">Weka Game Unayocheza Sasa</span>
                
                <div className="flex flex-col gap-1.5">
                  <select
                    value={myActiveGame}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMyActiveGame(val);
                      localStorage.setItem('gamers_genge_user_active_game', val);
                    }}
                    className="w-full bg-[#0c142b]/80 border border-white/10 text-[10px] text-orange-400 font-extrabold focus:outline-none p-2 rounded-xl cursor-pointer"
                  >
                    <option value="eFootball Mobile">🎮 eFootball Mobile</option>
                    <option value="EA FC Mobile">⚽ EA FC Mobile</option>
                    <option value="PES PSP (Co-Op)">🔥 PES PSP Co-Op</option>
                    <option value="GTA San Andreas Bongo">🚗 GTA Bongo</option>
                    <option value="Kupiga soga tu">💬 Kupiga Soga...</option>
                  </select>
                  <p className="text-[7.5px] text-slate-500 font-sans italic pl-1 leading-normal">
                    Kubali presence yako ionekane kwa wadau wote live!
                  </p>
                </div>
              </div>

              {/* Scrollable Members Feed list */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-4 no-scrollbar pb-32">
                
                {/* Group 1: Admins */}
                {adminsGroup.length > 0 && (
                  <div className="space-y-1.5 text-left">
                    <h4 className="text-[8.5px] font-mono font-black text-slate-500 uppercase tracking-widest pl-1 block">
                      VIONGOZI (ADMINS) — {adminsGroup.length}
                    </h4>
                    {adminsGroup.map(member => (
                      <div key={member.id} className="group flex items-center gap-2.5 p-1.5 hover:bg-white/5 rounded-xl transition-all">
                        <div className="relative w-8 h-8 shrink-0 rounded-lg overflow-hidden bg-orange-500/10 border border-orange-500/20">
                          <img 
                            src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${member.avatarSeed}`}
                            alt={member.name} 
                            className="w-full h-full object-cover" 
                          />
                          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-black rounded-full" />
                        </div>
                        
                        <div className="min-w-0">
                          <span className="text-[10px] font-black text-orange-400 block truncate flex items-center gap-1">
                            @{member.name}
                            <Shield size={10} className="text-orange-400 shrink-0" />
                          </span>
                          {member.presence && (
                            <span className="text-[8px] text-slate-400 font-sans truncate block leading-tight">
                              {member.presence}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Group 2: Moderators */}
                {modsGroup.length > 0 && (
                  <div className="space-y-1.5 text-left">
                    <h4 className="text-[8.5px] font-mono font-black text-slate-500 uppercase tracking-widest pl-1 block">
                      MA-MODS (MODERATORS) — {modsGroup.length}
                    </h4>
                    {modsGroup.map(member => (
                      <div key={member.id} className="group flex items-center gap-2.5 p-1.5 hover:bg-white/5 rounded-xl transition-all">
                        <div className="relative w-8 h-8 shrink-0 rounded-lg overflow-hidden bg-blue-500/10 border border-blue-500/25">
                          <img 
                            src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${member.avatarSeed}`}
                            alt={member.name} 
                            className="w-full h-full object-cover" 
                          />
                          <span className={`absolute bottom-0 right-0 w-2 h-2 border border-black rounded-full ${
                            member.status === 'idle' ? 'bg-amber-500' : 'bg-green-500'
                          }`} />
                        </div>
                        
                        <div className="min-w-0">
                          <span className="text-[10px] font-black text-blue-400 block truncate flex items-center gap-1">
                            @{member.name}
                            <Check size={9} className="text-blue-400 shrink-0" />
                          </span>
                          {member.presence && (
                            <span className="text-[8px] text-slate-400 font-sans truncate block leading-tight">
                              {member.presence}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Group 3: Online */}
                {onlineGroup.length > 0 && (
                  <div className="space-y-1.5 text-left">
                    <h4 className="text-[8.5px] font-mono font-black text-slate-500 uppercase tracking-widest pl-1 block">
                      MTANDAONI (ONLINE) — {onlineGroup.length}
                    </h4>
                    {onlineGroup.map(member => (
                      <div key={member.id} className="group flex items-center gap-2.5 p-1.5 hover:bg-white/5 rounded-xl transition-all">
                        <div className="relative w-8 h-8 shrink-0 rounded-lg overflow-hidden bg-emerald-500/5 border border-white/5">
                          <img 
                            src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${member.avatarSeed}`}
                            alt={member.name} 
                            className="w-full h-full object-cover" 
                          />
                          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border border-black rounded-full animate-pulse z-10" />
                        </div>
                        
                        <div className="min-w-0">
                          <span className="text-[10px] font-extrabold text-slate-200 block truncate">
                            @{member.name}
                          </span>
                          {member.presence && (
                            <span className="text-[8.5px] text-slate-400 font-sans truncate block leading-tight">
                              {member.presence}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Group 4: Offline */}
                {offlineGroup.length > 0 && (
                  <div className="space-y-1.5 text-left">
                    <h4 className="text-[8.5px] font-mono font-black text-slate-500 uppercase tracking-widest pl-1 block">
                      NJE YA MTANDAO (OFFLINE) — {offlineGroup.length}
                    </h4>
                    {offlineGroup.map(member => (
                      <div key={member.id} className="group flex items-center gap-2.5 p-1.5 opacity-60 hover:opacity-100 hover:bg-white/5 rounded-xl transition-all text-left">
                        <div className="relative w-8 h-8 shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/5">
                          <img 
                            src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${member.avatarSeed}`}
                            alt={member.name} 
                            className="w-full h-full object-cover grayscale" 
                          />
                          <span className="absolute bottom-0 right-0 w-2 h-2 bg-slate-600 border border-black rounded-full" />
                        </div>
                        
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-slate-500 block truncate">
                            @{member.name}
                          </span>
                          <span className="text-[7.5px] text-slate-600 font-mono block">
                            Nje ya kijiwe
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================
         4. OVERLAY SHEET: SERVER CREATOR DIALOGUE
         ======================================================== */}
      <AnimatePresence>
        {showCreateForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-[#070b16] border border-white/10 rounded-[2rem] p-6 text-slate-300 relative shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
                <div>
                  <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">Tengeneza Kijiwe Chako</h2>
                  <p className="text-[9px] text-blue-400 font-bold uppercase mt-0.5">MICHUANO YA MAGEMU YA GENGE tanzania</p>
                </div>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-transform cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateKijiwe} className="space-y-4">
                
                {/* Auto Avatar notice */}
                <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-left">
                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-1">🎮 COVER PROFILE KIOTOMATIKI</p>
                  <p className="text-[9.5px] text-slate-400 leading-normal">
                    Kijiwe chako kitapokea picha nzuri ya avatar ya michezo kiotomatiki mara tu unapoanzisha. Huna haja ya kupakia faili lolote!
                  </p>
                </div>

                {/* Kijiwe Title */}
                <div className="space-y-1">
                  <label className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-widest pl-1">
                    Jina la Kijiwe (Server Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newKijiweName}
                    onChange={(e) => setNewKijiweName(e.target.value)}
                    placeholder="Mano FIFA Group, Bongo GT7, etc..."
                    maxLength={30}
                    className="w-full bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none transition-all text-xs text-white px-3 py-3 rounded-lg placeholder:text-slate-600"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-widest pl-1">
                    Maelezo (Description)
                  </label>
                  <textarea
                    value={newKijiweDesc}
                    onChange={(e) => setNewKijiweDesc(e.target.value)}
                    placeholder="Weka maelezo ya server yako kwa ufupi hapa..."
                    rows={3}
                    maxLength={150}
                    className="w-full bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none transition-all text-xs text-white px-3 py-3 rounded-lg placeholder:text-slate-600 resize-none"
                  />
                </div>

                {/* Submit Action */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-400 font-black text-[10px] uppercase tracking-widest rounded-lg transition-all cursor-pointer"
                  >
                    Ghairi
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest rounded-lg transition-all cursor-pointer shadow-lg shadow-blue-500/25"
                  >
                    Anzisha Sasa
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
         5. PERSISTENT MOBILE BOTTOM NAVIGATION BAR
         ======================================================== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#070b16] border-t border-white/10 flex items-center justify-around px-6 z-40 pb-safe shadow-[0_-8px_24px_rgba(0,0,0,0.7)]">
        {/* TAB 1: HOME */}
        <button
          onClick={() => {
            window.location.hash = '#home';
            window.location.reload();
          }}
          className="flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-white transition-all cursor-pointer active:scale-95"
          id="btn-nav-home"
        >
          <Gamepad2 size={18} />
          <span className="text-[9px] font-black uppercase tracking-wider">Home</span>
        </button>

        {/* TAB 2: VIJIWE */}
        <button
          onClick={() => setMobileDrawerOpen(prev => !prev)}
          className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 ${
            mobileDrawerOpen ? 'text-blue-500 font-extrabold' : 'text-slate-400 hover:text-white'
          }`}
          id="btn-nav-vijiwe"
        >
          <Menu size={18} />
          <span className="text-[9px] font-black uppercase tracking-wider">Vijiwe</span>
        </button>

        {/* TAB 3: NOTIFICATIONS */}
        <button
          onClick={() => {
            setShowNotificationsPopover(true);
            setShowYouPopover(false);
          }}
          className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 relative ${
            showNotificationsPopover ? 'text-blue-500 font-extrabold' : 'text-slate-400 hover:text-white'
          }`}
          id="btn-nav-notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-4 w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
          <span className="text-[9px] font-black uppercase tracking-wider">Arifu</span>
        </button>

        {/* TAB 4: YOU */}
        <button
          onClick={() => {
            setShowYouPopover(true);
            setShowNotificationsPopover(false);
            setNicknameInputVal(userNick);
          }}
          className={`flex flex-col items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 ${
            showYouPopover ? 'text-blue-500 font-extrabold' : 'text-slate-400 hover:text-white'
          }`}
          id="btn-nav-you"
        >
          <div className="w-5 h-5 rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center text-[8px] font-black text-blue-400 uppercase">
            {userNick.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider">You</span>
        </button>
      </div>

      {/* ========================================================
         6. MOBILE POPUP: NOTIFICATIONS PANEL (ARIFU TABS)
         ======================================================== */}
      <AnimatePresence>
        {showNotificationsPopover && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-4" id="popup-notifications">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="w-full max-w-sm bg-[#080d19] border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] p-5 text-slate-300 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Bell size={15} className="text-blue-400" />
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Arifu za Genge</h3>
                </div>
                <button
                  onClick={() => setShowNotificationsPopover(false)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-lg cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-3 mb-5">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/[0.08] transition-colors">
                  <span className="text-[8.5px] font-black text-blue-400 uppercase tracking-widest block font-mono">EA FC 24 Swahili Cup</span>
                  <p className="text-[10.5px] text-white mt-1 leading-normal font-bold">Usajili upo wazi! Kaa mkao wa kula kuanza leo usiku.</p>
                  <span className="text-[8px] text-slate-500 font-mono block mt-1">Saa 1 iliyopita</span>
                </div>

                <div className="p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/[0.08] transition-colors">
                  <span className="text-[8.5px] font-black text-emerald-400 uppercase tracking-widest block font-mono font-mono">GTA Bongo Crew</span>
                  <p className="text-[10.5px] text-slate-300 mt-1 leading-normal font-mono">@Dida_Playz amekuongeza katika kijiwe kipya cha GT7.</p>
                  <span className="text-[8px] text-slate-500 font-mono block mt-1">Saa 3 zilizopita</span>
                </div>

                <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10">
                  <span className="text-[8.5px] font-black text-blue-400 uppercase tracking-widest block font-mono">System Offline Sync</span>
                  <p className="text-[10.5px] text-slate-300 mt-1 leading-normal">Meseji zako zote zitahifadhiwa hapa sasa bila kupotea hata kama mtandao ukiwa hafifu.</p>
                  <span className="text-[8px] text-slate-500 font-mono block mt-1">Saa 4 zilizopita</span>
                </div>
              </div>

              <button
                onClick={() => setShowNotificationsPopover(false)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-extrabold uppercase tracking-widest rounded-xl transition-all cursor-pointer font-mono"
              >
                Funga
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================
         7. MOBILE POPUP: YOU PROFILE MANAGER (YOU TABS)
         ======================================================== */}
      <AnimatePresence>
        {showYouPopover && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-4" id="popup-profile">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="w-full max-w-sm bg-[#080d19] border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] p-5 text-slate-300 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Settings size={15} className="text-blue-400" />
                  <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Wasifu Wako (You)</h3>
                </div>
                <button
                  onClick={() => setShowYouPopover(false)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-lg cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex flex-col items-center text-center gap-2 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-white/15 flex items-center justify-center text-lg font-black text-white uppercase shadow-lg shadow-blue-500/20">
                  {userNick.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-tight">@{userNick}</h4>
                  <p className="text-[8px] text-blue-400 font-bold uppercase tracking-widest mt-0.5">Genge Premium Member</p>
                </div>
              </div>

              {/* Guest Nickname Editor Inline for Instant persistence */}
              <div className="space-y-1 mb-4 text-left">
                <label className="block text-[8.5px] text-slate-400 font-extrabold uppercase tracking-widest pl-1">
                  Badilisha Nickname (Kiswahili Jina)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nicknameInputVal}
                    onChange={(e) => setNicknameInputVal(e.target.value.replace(/\s+/g, '_'))}
                    placeholder="Weka jina lako jipya..."
                    maxLength={15}
                    className="flex-1 bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none transition-all text-xs text-white px-3 py-2.5 rounded-lg font-mono"
                  />
                  <button
                    onClick={() => {
                      if (nicknameInputVal.trim()) {
                        const trimmed = nicknameInputVal.trim();
                        localStorage.setItem('gamers_genge_guest_name', trimmed);
                        setGuestName(trimmed);
                        setShowYouPopover(false);
                      }
                    }}
                    className="px-3 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg cursor-pointer transition-colors"
                  >
                    Okoa
                  </button>
                </div>
              </div>

              {/* User Gamified Statistics Dashboard */}
              <div className="bg-white/5 rounded-xl border border-white/5 p-3 space-y-2 mb-5 text-left text-xs text-slate-300 font-mono">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 font-bold">Ligi Ulizochat:</span>
                  <span className="text-white font-extrabold">{vijiwe.length}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 font-bold">Hali ya Neti:</span>
                  <span className="text-emerald-400 font-extrabold uppercase tracking-widest">Active Cache</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 font-bold">Mjumbe Rank:</span>
                  <span className="text-yellow-500 font-extrabold">GOLD MASTER</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    localStorage.removeItem('gamers_genge_guest_name');
                    localStorage.removeItem('gamers_genge_custom_vijiwe');
                    localStorage.removeItem('gamers_genge_custom_messages');
                    window.location.reload();
                  }}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-[9px] text-white font-extrabold uppercase tracking-widest rounded-xl transition-all cursor-pointer font-bold border border-red-500/20"
                >
                  Reset Profile
                </button>
                <button
                  onClick={() => setShowYouPopover(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-[9px] text-slate-300 font-extrabold uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Funga
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
