import { AlertCircle, X } from "lucide-react";

type AuthErrorModalProps = {
  message: string;
  onClose: () => void;
};

export function AuthErrorModal({ message, onClose }: AuthErrorModalProps) {
  return (
    <div className="auth-error-modal" role="alertdialog" aria-modal="true" aria-labelledby="auth-error-title">
      <button className="auth-error-backdrop" type="button" onClick={onClose} aria-label="오류 안내 닫기" />
      <article>
        <button className="auth-error-close" type="button" onClick={onClose} aria-label="닫기">
          <X aria-hidden="true" />
        </button>
        <span className="auth-error-icon"><AlertCircle aria-hidden="true" /></span>
        <h2 id="auth-error-title">회원가입을 완료하지 못했어요</h2>
        <p>{message}</p>
        <button className="auth-error-confirm" type="button" onClick={onClose}>확인</button>
      </article>
    </div>
  );
}
