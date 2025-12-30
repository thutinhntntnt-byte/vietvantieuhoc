
import React, { useState, useCallback, useEffect } from 'react';
import { Grade, EssayCategory, ParagraphCount, UserProfile, ChatMessage, AppStep } from './types';
import { geminiService } from './services/geminiService';
import { TOPICS } from './constants';
import ChatWindow from './components/ChatWindow';
import HamburgerProgress from './components/HamburgerProgress';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.SETUP);
  const [profile, setProfile] = useState<UserProfile>({
    grade: '3',
    category: 'miêu tả',
    length: '3',
    topic: ''
  });
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentHamburgerPart, setCurrentHamburgerPart] = useState<'intro' | 'body' | 'conclusion' | 'complete'>('intro');

  const startWriting = async () => {
    if (!profile.topic) return;
    setStep(AppStep.WRITING);
    setIsLoading(true);
    
    const initialPrompt = `Chào cô! Con học lớp ${profile.grade}. Con muốn viết bài văn thể loại ${profile.category} về chủ đề: "${profile.topic}". Bài văn của con dự định dài ${profile.length} đoạn. Cô hãy hướng dẫn con viết MỞ BÀI theo khung Bánh Hamburger nhé!`;
    
    setMessages([{ role: 'user', text: initialPrompt }]);
    
    try {
      let fullResponse = "";
      const stream = geminiService.sendMessageStream(initialPrompt);
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = fullResponse;
          return newMessages;
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    
    const userMsg = inputText;
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      let fullResponse = "";
      const stream = geminiService.sendMessageStream(userMsg);
      setMessages(prev => [...prev, { role: 'model', text: '' }]);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = fullResponse;
          return newMessages;
        });
      }

      // Detect progress based on keywords or context (simplified logic)
      if (fullResponse.toLowerCase().includes('thân bài')) setCurrentHamburgerPart('body');
      if (fullResponse.toLowerCase().includes('kết bài')) setCurrentHamburgerPart('conclusion');
      if (fullResponse.toLowerCase().includes('hoàn thành') || fullResponse.toLowerCase().includes('chúc mừng')) setCurrentHamburgerPart('complete');

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (step === AppStep.SETUP) {
    return (
      <div className="min-h-screen bg-[#FFF9F0] p-4 flex flex-col items-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl p-8 shadow-xl border-t-8 border-orange-400">
          <header className="text-center mb-8">
            <span className="text-6xl mb-4 block">🍔</span>
            <h1 className="text-3xl font-bold text-orange-600 mb-2">Bánh Hamburger Tập Viết Văn</h1>
            <p className="text-gray-500 font-medium">Cùng cô AI viết nên những bài văn thật hay nhé!</p>
          </header>

          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                Con học lớp mấy rồi?
              </h2>
              <div className="grid grid-cols-4 gap-3">
                {['2', '3', '4', '5'].map(g => (
                  <button 
                    key={g}
                    onClick={() => setProfile(p => ({ ...p, grade: g as Grade }))}
                    className={`py-3 rounded-2xl font-bold transition-all ${
                      profile.grade === g 
                        ? 'bg-orange-500 text-white scale-105' 
                        : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                    }`}
                  >
                    Lớp {g}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                Con muốn viết văn gì?
              </h2>
              <div className="flex flex-wrap gap-2">
                {['Kể chuyện', 'Miêu tả', 'Tả người', 'Tả cảnh', 'Tả đồ vật', 'Viết thư', 'Kể việc tốt'].map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setProfile(p => ({ ...p, category: cat.toLowerCase() as EssayCategory }))}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      profile.category === cat.toLowerCase()
                        ? 'bg-orange-500 text-white'
                        : 'bg-white border-2 border-orange-100 text-orange-600 hover:border-orange-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                Độ dài bài viết con mong muốn?
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { v: '1', l: '1 đoạn ngắn' },
                  { v: '3', l: '3 đoạn' },
                  { v: '5', l: '5 đoạn (dài)' }
                ].map(item => (
                  <button 
                    key={item.v}
                    onClick={() => setProfile(p => ({ ...p, length: item.v as ParagraphCount }))}
                    className={`py-3 rounded-2xl font-bold text-sm transition-all ${
                      profile.length === item.v 
                        ? 'bg-orange-500 text-white scale-105' 
                        : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                    }`}
                  >
                    {item.l}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                <span className="bg-orange-100 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
                Chủ đề con chọn là gì?
              </h2>
              <div className="space-y-4">
                {TOPICS.map(topicGroup => (
                  <div key={topicGroup.id}>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">{topicGroup.title}</p>
                    <div className="flex flex-wrap gap-2">
                      {topicGroup.items.map(item => (
                        <button 
                          key={item}
                          onClick={() => setProfile(p => ({ ...p, topic: item }))}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                            profile.topic === item
                              ? 'bg-blue-500 text-white'
                              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-500 mb-2">Hoặc tự viết chủ đề của riêng con:</p>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Chú mèo mướp nhà em..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-orange-100 focus:border-orange-400 outline-none transition-all"
                  value={profile.topic}
                  onChange={(e) => setProfile(p => ({ ...p, topic: e.target.value }))}
                />
              </div>
            </section>

            <button 
              disabled={!profile.topic}
              onClick={startWriting}
              className={`w-full py-4 rounded-2xl text-xl font-bold shadow-lg transition-all ${
                profile.topic 
                  ? 'bg-orange-500 text-white hover:bg-orange-600 active:scale-95' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Bắt đầu luyện viết thôi! 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F0] flex flex-col md:flex-row h-screen">
      {/* Sidebar - Progress & Stats */}
      <div className="w-full md:w-80 bg-white border-r border-orange-100 p-6 flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => setStep(AppStep.SETUP)}>
          <span className="text-3xl">🍔</span>
          <div>
            <h1 className="font-bold text-orange-600 leading-tight">Bánh Hamburger</h1>
            <p className="text-xs text-gray-400">Lớp {profile.grade} • {profile.category}</p>
          </div>
        </div>

        <HamburgerProgress currentStep={currentHamburgerPart} />

        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <h4 className="text-sm font-bold text-blue-800 mb-2">💡 Gợi ý cho con</h4>
            <p className="text-xs text-blue-600 leading-relaxed italic">
              "Hãy dùng các từ miêu tả màu sắc, âm thanh và cảm xúc để bài văn thêm sinh động nhé!"
            </p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
            <h4 className="text-sm font-bold text-orange-800 mb-2">📝 Chủ đề đang viết</h4>
            <p className="text-sm text-orange-700 font-medium">
              {profile.topic}
            </p>
          </div>
        </div>

        <button 
          onClick={() => {
            if (confirm('Con có chắc chắn muốn thoát và viết chủ đề mới không?')) {
              setStep(AppStep.SETUP);
            }
          }}
          className="mt-6 text-sm text-gray-400 font-bold hover:text-red-400 transition-colors"
        >
          ← Quay lại chủ đề mới
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col p-4 md:p-6 h-full min-h-0">
        <ChatWindow messages={messages} isTyping={isLoading} />
        
        <div className="mt-4 bg-white p-3 rounded-2xl shadow-lg border-2 border-orange-100">
          <div className="flex items-center gap-3">
            <textarea 
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Con viết bài của mình vào đây nhé..."
              className="flex-1 resize-none bg-gray-50 p-3 rounded-xl border-none focus:ring-2 focus:ring-orange-300 outline-none text-lg"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all ${
                inputText.trim() && !isLoading
                  ? 'bg-orange-500 text-white shadow-md active:scale-90'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
          <div className="flex justify-between items-center mt-2 px-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase">Mẹo: Nhấn Enter để gửi bài</span>
            <div className="flex gap-2">
              <span className="text-lg grayscale hover:grayscale-0 cursor-pointer transition-all">✨</span>
              <span className="text-lg grayscale hover:grayscale-0 cursor-pointer transition-all">📖</span>
              <span className="text-lg grayscale hover:grayscale-0 cursor-pointer transition-all">🎨</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
