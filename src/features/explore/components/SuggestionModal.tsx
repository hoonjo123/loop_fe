"use client";

import { CheckCircle2, Lightbulb, X } from "lucide-react";
import { FormEvent, useState } from "react";

type SuggestionModalProps = {
  onClose: () => void;
};

export function SuggestionModal({ onClose }: SuggestionModalProps) {
  const [submitted, setSubmitted] = useState(false);

  const submitSuggestion = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="suggestion-modal" role="dialog" aria-modal="true" aria-labelledby="suggestion-title">
      <button className="preview-backdrop" type="button" onClick={onClose} aria-label="건의함 닫기" />
      <article>
        <button className="create-room-close" type="button" onClick={onClose} aria-label="닫기">
          <X aria-hidden="true" />
        </button>

        {submitted ? (
          <div className="suggestion-complete">
            <CheckCircle2 aria-hidden="true" />
            <h2 id="suggestion-title">건의가 접수되었어요</h2>
            <p>보내주신 의견은 운영자가 확인한 뒤 서비스 개선에 참고할게요.</p>
            <button type="button" onClick={onClose}>확인</button>
          </div>
        ) : (
          <>
            <header>
              <span className="suggestion-icon"><Lightbulb aria-hidden="true" /></span>
              <div>
                <span>운영자에게 보내기</span>
                <h2 id="suggestion-title">건의함</h2>
                <p>loop를 더 좋게 만들 아이디어나 불편한 점을 알려주세요.</p>
              </div>
            </header>

            <form className="suggestion-form" onSubmit={submitSuggestion}>
              <label className="create-room-field">
                <span>건의 유형</span>
                <select name="category" defaultValue="개선 제안" required>
                  <option>개선 제안</option>
                  <option>불편 신고</option>
                  <option>새 기능 요청</option>
                  <option>기타</option>
                </select>
              </label>
              <label className="create-room-field">
                <span>제목</span>
                <input name="title" maxLength={60} placeholder="건의 내용을 간단히 적어주세요" required />
              </label>
              <label className="create-room-field">
                <span>내용</span>
                <textarea name="content" maxLength={500} placeholder="운영자에게 전하고 싶은 내용을 자세히 적어주세요" required />
                <small>최대 500자</small>
              </label>
              <p className="suggestion-notice">작성한 내용은 서비스 운영 및 개선 목적으로 사용됩니다.</p>
              <button className="suggestion-submit" type="submit">운영자에게 보내기</button>
            </form>
          </>
        )}
      </article>
    </div>
  );
}
