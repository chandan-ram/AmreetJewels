import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, MessageSquare, Bot, ArrowRight, ArrowRightCircle } from 'lucide-react';
import { Product, Message } from '../types';

interface AISearchAdvisorProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

export default function AISearchAdvisor({ products, onProductClick }: AISearchAdvisorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Namaste! I am **Sona**, your personal AI Jewellery Stylist. 🌸\n\nTell me what outfit you're wearing, its color, and the occasion (e.g. Saree for Sangeet prep or Lehenga for a wedding), and I will style you with the perfect matching accessories from our collection!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Styling Prefs State
  const [dressType, setDressType] = useState('Saree');
  const [dressColor, setDressColor] = useState('Crimson Red');
  const [occasion, setOccasion] = useState('Festive Night');
  const [budget, setBudget] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = customText || inputMsg;
    if (!textToSend.trim() && !customText) return;

    // Add user message
    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMsg('');
    setIsLoading(true);

    try {
      // API request to the server-side Gemini proxy '/api/gemini/advisor'
      const response = await fetch('https://amreetjewels.onrender.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          history: messages,
          dressType,
          dressColor,
          occasion,
          budget,
          products
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Server error');
      }

      const botMsg: Message = {
        id: 'msg-bot-' + Date.now(),
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedProducts: data.recommendedProductIds
      };

      setMessages(prev => [...prev, botMsg]);

    } catch (err: any) {
      console.error(err);
      // Fallback response for offline/local sandbox environments
      const fallbackText = `I apologize, our online Gemini AI engine is preparing. Let me recommend something beautiful based on your preferences:

Since you are attending a **${occasion}** wearing a lovely **${dressColor} ${dressType}**, here are our recommended designer pairs:

- Try our **Vandana Royal Kundan Choker Set** (prod-1) which contrasts incredibly with warm shades.
- Add our **Meera Peacock Kundan Jhumka** (prod-2) for rich ears framing.

Feel free to browse our categories or restock items in the Admin portal!`;

      // Extract mock IDs
      const botMsg: Message = {
        id: 'msg-bot-err-' + Date.now(),
        sender: 'assistant',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedProducts: ['prod-1', 'prod-2']
      };

      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStylingCoordsSubmit = () => {
    const promptText = `Recommend a complete jewellery styling guide for a ${dressColor} ${dressType} designed for a ${occasion}. ${budget ? `My budget is around ₹${budget}.` : ''}`;
    handleSendMessage(undefined, promptText);
  };

  // Custom JSX rich text formatter to parse markdown links [Title](prod-id) and bold text **text**
  const renderMessageContent = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(prod-\d+\))/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-charcoal">{part.slice(2, -2)}</strong>;
      }

      const matchLink = part.match(/\[(.*?)\]\((prod-\d+)\)/);
      if (matchLink) {
        const title = matchLink[1];
        const prodId = matchLink[2];
        const linkedProduct = products.find(p => p.id === prodId);

        return (
          <button
            key={index}
            onClick={() => linkedProduct && onProductClick(linkedProduct)}
            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-gold/10 border border-gold/30 hover:bg-gold hover:text-white rounded-md text-[11px] font-bold text-gold-dark transition-all mx-1 my-0.5 shadow-2xs cursor-pointer"
          >
            <span>✨ {title}</span>
            <ArrowRight size={10} />
          </button>
        );
      }

      return <span key={index} className="whitespace-pre-line">{part}</span>;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Sparkle Bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-linear-to-r from-charcoal to-[#2E2E2E] hover:from-gold hover:to-gold-dark text-gold hover:text-white p-4 rounded-full shadow-2xl flex items-center justify-center space-x-2 transition-all duration-300 scale-100 hover:scale-105 active:scale-95 group border border-gold/40"
        >
          <Sparkles className="animate-spin text-gold group-hover:text-white duration-3000" size={20} />
          <span className="text-xs uppercase tracking-widest font-bold pr-1">AI Stylist Sona</span>
        </button>
      )}

      {/* Expanded Widget Interface */}
      {isOpen && (
        <div className="w-96 max-w-[calc(100vw-32px)] h-[550px] bg-white border border-gold/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col justify-between animate-in fade-in zoom-in-95 duration-300">
          
          {/* Header Panel */}
          <div className="bg-charcoal text-white p-4 flex items-center justify-between border-b border-gold/20">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 bg-gold/15 rounded-full flex items-center justify-center border border-gold/30">
                <Bot className="text-gold" size={18} />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold tracking-wide text-gold">Sona — AI Jewellery Advisor</h4>
                <p className="text-[10px] text-gray-400">Powered by Gemini 3.5 Flash</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Coordinate selectors (only shown at initial or optional top tab) */}
          <div className="bg-beige-soft/80 border-b border-gold/10 p-3 grid grid-cols-2 gap-2 text-[10px] font-semibold">
            <div className="space-y-1">
              <label className="text-gray-500 block uppercase tracking-wide">Dress Style</label>
              <select
                value={dressType}
                onChange={(e) => setDressType(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-sm p-1 text-[10px]"
              >
                <option value="Saree">Saree (Traditional)</option>
                <option value="Lehenga">Lehenga (Bridal/Party)</option>
                <option value="Western Gown">Western Gown / Cocktail</option>
                <option value="Anarkali Suit">Anarkali Suit</option>
                <option value="Salwar Kameez">Salwar Kameez</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-gray-500 block uppercase tracking-wide">Outfit Color</label>
              <select
                value={dressColor}
                onChange={(e) => setDressColor(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-sm p-1 text-[10px]"
              >
                <option value="Crimson Red">Crimson Red</option>
                <option value="Emerald Green">Emerald Green</option>
                <option value="Royal Blue">Royal Blue</option>
                <option value="Pastel Pink">Pastel Pink</option>
                <option value="Sage Green">Sage Green</option>
                <option value="Ivory White">Ivory / Beige</option>
                <option value="Marigold Yellow">Marigold Yellow</option>
                <option value="Classic Black">Classic Black</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-gray-500 block uppercase tracking-wide">Festive Occasion</label>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value)}
                className="w-full bg-white border border-gray-100 rounded-sm p-1 text-[10px]"
              >
                <option value="Festive Night">Festive / Diwali</option>
                <option value="Wedding Bridal">Wedding (Bridal)</option>
                <option value="Wedding Guest">Wedding Guest</option>
                <option value="Sangeet Party">Sangeet / Mehendi</option>
                <option value="Daily Glam">Daily Glam / Office</option>
                <option value="Cocktail Dinner">Cocktail Dinner</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleStylingCoordsSubmit}
                className="w-full bg-gold hover:bg-gold-dark text-white font-bold py-1.5 rounded-md text-[10px] uppercase tracking-wider transition-colors flex items-center justify-center space-x-1"
              >
                <span>Style Coordinates</span>
                <Sparkles size={10} />
              </button>
            </div>
          </div>

          {/* Chat Bubbles List */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/50 scrollbar-thin">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                }`}
              >
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed font-sans ${
                    msg.sender === 'user'
                      ? 'bg-charcoal text-white rounded-tr-none'
                      : 'bg-white text-gray-700 rounded-tl-none border border-gold/10 shadow-xs'
                  }`}
                >
                  {msg.sender === 'assistant' ? (
                    <div className="space-y-2">
                      <p>{renderMessageContent(msg.text)}</p>
                    </div>
                  ) : (
                    <p>{msg.text}</p>
                  )}
                </div>
                <span className="text-[9px] text-gray-400 mt-1 font-sans">{msg.timestamp}</span>
              </div>
            ))}

            {/* Simulated typing dot bubble */}
            {isLoading && (
              <div className="flex space-x-1 mr-auto bg-white p-3 border border-gold/10 rounded-2xl rounded-tl-none shadow-xs items-center text-xs text-gold">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold animate-bounce" />
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold animate-bounce delay-100" />
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold animate-bounce delay-200" />
                <span className="text-[10px] text-gray-400 font-sans ml-2">Sona is searching the royal trunk...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Text Input Panel */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gold/15 bg-white flex items-center space-x-2">
            <input
              type="text"
              placeholder="Ask Sona: 'What earrings go with an ivory Saree?'"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              disabled={isLoading}
              className="flex-grow bg-slate-50 text-charcoal text-xs p-3.5 rounded-full border border-gray-100 focus:outline-hidden focus:border-gold/50 focus:bg-white font-sans transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMsg.trim()}
              className="p-3 bg-charcoal hover:bg-gold text-gold hover:text-white rounded-full transition-all shrink-0 active:scale-90 disabled:opacity-40 disabled:hover:bg-charcoal disabled:hover:text-gold"
            >
              <Send size={14} />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
