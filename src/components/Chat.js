import React from 'react';

const Chat = ({ messages, onFeedback }) => (
  <div className="chat-window">
    {messages.map((msg, i) => (
      <div key={i} className={`message ${msg.role}`}>
        <p>{msg.content}</p>
        {msg.role === 'assistant' && (
          <div className="feedback">
            <button onClick={() => onFeedback(msg.content, 'like')}>👍</button>
            <button onClick={() => onFeedback(msg.content, 'dislike')}>👎</button>
          </div>
        )}
      </div>
    ))}
  </div>
);

export default Chat;