import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot,
  Send,
  Trash2,
  User,
  AlertCircle,
  Loader2,
  MessageSquare,
  X,
  Maximize2,
  Minimize2,
  ChevronDown,
  GripHorizontal,
} from 'lucide-react';
import { sendChatMessage, createMessage } from '../services/chatbotService';
import type { ChatMessage } from '../services/chatbotService';

// ─── Suggestion chips ─────────────────────────────────────────────────────────
const SUGGESTIONS = [
  'What are common flu symptoms?',
  'Tips to manage blood pressure',
  'How much water per day?',
  'Signs of diabetes to watch',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTime = (d: Date) =>
  d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);

// ─── Message bubble ───────────────────────────────────────────────────────────
const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div
      className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      style={{ animation: 'chatFadeIn 0.25s ease both' }}
    >
      <div
        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-pink-500 to-purple-600'
            : 'bg-gradient-to-br from-blue-500 to-indigo-600'
        }`}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-white" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-white" />
        )}
      </div>

      <div className={`flex flex-col max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap break-words ${
            isUser
              ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-br-sm'
              : message.isError
              ? 'bg-red-50 text-red-800 border border-red-200 rounded-bl-sm'
              : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
          }`}
        >
          {message.isError && (
            <span className="flex items-center gap-1 mb-1 font-semibold text-red-700 text-xs">
              <AlertCircle className="w-3 h-3" /> Error
            </span>
          )}
          {message.content}
        </div>
        <span className="text-[10px] text-gray-400 mt-0.5 px-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
};

const TypingIndicator: React.FC = () => (
  <div className="flex items-end gap-2" style={{ animation: 'chatFadeIn 0.25s ease both' }}>
    <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
      <Bot className="w-3.5 h-3.5 text-white" />
    </div>
    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" />
      </div>
    </div>
  </div>
);

// ─── Main floating widget ─────────────────────────────────────────────────────
export function PatientChatbot() {
  const [open, setOpen] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // ── Drag state ──────────────────────────────────────────────────────────────
  // pos = {right, bottom} in px from viewport edges
  const [pos, setPos] = useState({ right: 24, bottom: 24 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, right: 0, bottom: 0 });
  const hasDragged = useRef(false); // distinguish click vs drag

  const bubbleRef = useRef<HTMLButtonElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ── Scroll helpers ──────────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, isLoading, open, scrollToBottom]);

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 80);
  };

  // ── Drag handlers ───────────────────────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    // only primary button, ignore clicks on action buttons
    if (e.button !== 0) return;
    dragging.current = true;
    hasDragged.current = false;
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      right: pos.right,
      bottom: pos.bottom,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;

    // mark as real drag if moved more than 4px
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) hasDragged.current = true;

    const newRight = clamp(dragStart.current.right - dx, 8, window.innerWidth - 64);
    const newBottom = clamp(dragStart.current.bottom - dy, 8, window.innerHeight - 64);
    setPos({ right: newRight, bottom: newBottom });
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    dragging.current = false;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    // if barely moved → treat as click (toggle open/close)
    if (!hasDragged.current) {
      open ? handleClose() : handleOpen();
    }
  };

  // ── Open / Close ────────────────────────────────────────────────────────────
  const handleOpen = () => {
    setOpen(true);
    setUnreadCount(0);
    setTimeout(() => inputRef.current?.focus(), 100);
  };
  const handleClose = () => {
    setOpen(false);
    setMaximized(false);
  };

  // ── Send ─────────────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg = createMessage('user', text);
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    if (inputRef.current) inputRef.current.style.height = 'auto';

    try {
      const reply = await sendChatMessage(text);
      const botMsg = createMessage('assistant', reply);
      setMessages((prev) => [...prev, botMsg]);
      if (!open) setUnreadCount((c) => c + 1);
    } catch (err: any) {
      const errorMsg = createMessage(
        'assistant',
        err?.message || 'Something went wrong. Please try again.',
        true
      );
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [input, isLoading, open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setMessages([]);
    setInput('');
  };

  const hasMessages = messages.length > 0;

  // ── Panel sizing ─────────────────────────────────────────────────────────────
  const panelW = maximized ? Math.min(820, window.innerWidth * 0.95) : 360;
  const panelH = maximized ? Math.min(700, window.innerHeight * 0.9) : 520;

  // Panel anchors to the same right/bottom as the bubble
  const panelRight = pos.right;
  const panelBottom = pos.bottom + 64 + 8; // bubble height (56) + gap (8)

  return (
    <>
      {/* ── Keyframes ──────────────────────────────────────────────────────── */}
      <style>{`
        @keyframes chatFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes chatPop {
          0%   { transform: scale(0.85); opacity: 0; }
          60%  { transform: scale(1.03); }
          100% { transform: scale(1);    opacity: 1; }
        }
        @keyframes bubblePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.45); }
          50%       { box-shadow: 0 0 0 10px rgba(99,102,241,0); }
        }
        #medbot-bubble-btn { touch-action: none; user-select: none; }
      `}</style>

      {/* ── Chat panel ─────────────────────────────────────────────────────── */}
      {open && (
        <div
          id="medbot-chat-panel"
          className="fixed z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-gray-50 transition-[width,height] duration-300"
          style={{
            width: panelW,
            height: panelH,
            right: panelRight,
            bottom: panelBottom,
            animation: 'chatPop 0.3s ease both',
            maxWidth: 'calc(100vw - 16px)',
            maxHeight: 'calc(100vh - 120px)',
          }}
        >
          {/* Header — also acts as drag hint */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">MedBot</p>
                <p className="text-blue-200 text-[11px] mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  AI Medical Assistant · Drag to move ↕
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {hasMessages && (
                <button
                  id="medbot-clear-btn"
                  onClick={handleClear}
                  title="Clear chat"
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                id="medbot-maximize-btn"
                onClick={() => setMaximized((m) => !m)}
                title={maximized ? 'Minimize' : 'Maximize'}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              >
                {maximized ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                id="medbot-close-btn"
                onClick={handleClose}
                title="Close"
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            id="medbot-messages"
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            style={{ scrollbarWidth: 'thin' }}
          >
            {!hasMessages && (
              <div className="flex flex-col items-center justify-center h-full min-h-[180px] text-center px-2">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-3 shadow-inner">
                  <MessageSquare className="w-7 h-7 text-blue-500" />
                </div>
                <p className="text-gray-700 font-semibold text-sm mb-1">
                  Hello! I&apos;m MedBot 👋
                </p>
                <p className="text-gray-400 text-xs max-w-[220px] leading-relaxed mb-4">
                  Ask me anything about symptoms, medications, or general health.
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSuggestion(s)}
                      className="text-[11px] bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 px-2.5 py-1.5 rounded-full transition-colors shadow-sm"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-[10px] text-gray-400 max-w-[220px]">
                  ⚕️ For general info only — always consult a doctor.
                </p>
              </div>
            )}

            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}

            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Scroll-to-bottom */}
          {showScrollBtn && (
            <div className="absolute bottom-[76px] right-4 z-10">
              <button
                onClick={scrollToBottom}
                className="bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-shadow"
              >
                <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>
          )}

          {/* Input */}
          <div className="shrink-0 bg-white border-t border-gray-100 px-3 py-2.5">
            <div className="flex items-end gap-2">
              <textarea
                id="medbot-input"
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask a health question… (Enter to send)"
                disabled={isLoading}
                rows={1}
                className="flex-1 resize-none bg-gray-50 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all max-h-28 leading-relaxed disabled:opacity-60"
                style={{ minHeight: '40px' }}
              />
              <button
                id="medbot-send-btn"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-200 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-1.5">
              Not a substitute for professional medical advice
            </p>
          </div>
        </div>
      )}

      {/* ── Draggable floating bubble ──────────────────────────────────────── */}
      <button
        id="medbot-bubble-btn"
        ref={bubbleRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        title="MedBot Chat — drag to reposition"
        className="fixed z-50 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center shadow-xl transition-colors duration-200"
        style={{
          right: pos.right,
          bottom: pos.bottom,
          animation: 'bubblePulse 3s ease-in-out infinite',
          cursor: dragging.current ? 'grabbing' : 'grab',
        }}
      >
        {/* Drag grip hint (top of bubble) */}
        <GripHorizontal
          className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 text-white/40 pointer-events-none"
        />

        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageSquare className="w-6 h-6 text-white" />
        )}

        {/* Unread badge */}
        {!open && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow pointer-events-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </>
  );
}
