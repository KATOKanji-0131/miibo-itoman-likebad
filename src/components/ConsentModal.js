import React from 'react';

const ConsentModal = ({ onConsent }) => {
  console.log("ConsentModal rendered");

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>利用規約とプライバシーポリシー</h2>
        <p>このチャットボットを使用するには、同意が必要です。</p>
        <button onClick={() => {
          console.log("Consent button clicked");
          onConsent();
        }}>
          同意して使う
        </button>
      </div>
    </div>
  );
};

export default ConsentModal;
