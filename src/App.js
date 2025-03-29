import React, { useState, useEffect } from 'react';
import ConsentModal from './components/ConsentModal';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('consentGiven')) {
      setShowConsent(true);
    }
  }, []);

  const handleConsent = () => {
    localStorage.setItem('consentGiven', 'true');
    setShowConsent(false);
  };

  const sendMessage = async () => {
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const res = await fetch('https://api-mebo.dev/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify({
          api_key: process.env.REACT_APP_MEBO_API_KEY,
          agent_id: process.env.REACT_APP_MEBO_AGENT_ID,
          utterance: input
        })
      });

      const data = await res.json();
      const aiText = data.bestResponse.utterance;
      const botMessage = { role: 'assistant', content: aiText };
      setMessages([...newMessages, botMessage]);
    } catch (error) {
      console.error('チャット送信エラー:', error);
      alert('通信に失敗しました');
    }
  };

  const sendFeedback = async (message, rating) => {
    try {
      // Supabaseに保存
      const res = await fetch('/.netlify/functions/submitFeedback', {
        method: 'POST',
        body: JSON.stringify({ message, rating }),
      });
      const result = await res.json();
      console.log('✅ Supabase保存結果:', result);

      // Supabaseの全レコードを取得
      const feedbackRes = await fetch('/.netlify/functions/getFeedbacks');
      const allFeedbacks = await feedbackRes.json();

      // フォーマット整形してMeboにアップロード
      const formatted = {
        metadata: {
          description: "このjsonファイルは、botの返答に対するユーザーの反応を蓄積しています。このデータを読み取って、ユーザーが好ましいと思う反応を強化し、好ましくないと思う反応を抑制するようにしてください。dataの中に、ratingの情報があるmessageがあります。これは、botが生成したmessageに対してユーザが返した反応を記録しています。ratingがlikeであればそのmessageは好ましいです。dislikeであればそのmessageは好ましくないです。",
          source: "feedbacks"
        },
        data: allFeedbacks.map((fb, i) => ({
          id: String(fb.id ?? i + 1),
          message: fb.message,
          rating: fb.rating
        }))
      };

      const datastoreRes = await fetch('https://api-mebo.dev/datastore', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          api_key: process.env.REACT_APP_MEBO_API_KEY,
          agent_id: process.env.REACT_APP_MEBO_AGENT_ID,
          label: 'user-feedback-batch',
          text: JSON.stringify(formatted)
        })
      });

      const responseData = await datastoreRes.json();
      console.log('📚 ナレッジストア送信結果:', responseData);

    } catch (error) {
      console.error('❌ フィードバック処理エラー:', error);
    }
  };

  return (
    <div className="app-container">
      <h1>いちまんくとぅば チャットボット</h1>

      {showConsent ? (
        <ConsentModal onConsent={handleConsent} />
      ) : (
        <>
          <div className="chat-history">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.role === 'user' ? 'user' : 'bot'}`}
              >
                {msg.content}
                {msg.role === 'assistant' && (
                  <div className="feedback-buttons">
                    <button onClick={() => sendFeedback(msg.content, 'like')}>👍</button>
                    <button onClick={() => sendFeedback(msg.content, 'dislike')}>👎</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="input-section">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="メッセージを入力..."
            />
            <button onClick={sendMessage}>送信</button>
          </div>
        </>
      )}
    </div>
  );
};

export default App;
