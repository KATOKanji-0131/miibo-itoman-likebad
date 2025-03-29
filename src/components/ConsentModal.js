import React from 'react';

const ConsentModal = ({ onAgree }) => (
  <div className="consent-modal">
    <div className="modal-content">
      <p>このアプリはフィードバックを収集します。同意のうえでご利用ください。</p>
      <button onClick={onAgree}>同意して使う</button>
    </div>
  </div>
);

export default ConsentModal;