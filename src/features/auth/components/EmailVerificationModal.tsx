import { X } from "lucide-react";

type EmailVerificationModalProps = {
  email: string;
  code: string;
  codeSent: boolean;
  codeRemaining: number;
  resendRemaining: number;
  loading: boolean;
  notice: string;
  onCodeChange: (code: string) => void;
  onSendCode: () => void;
  onVerifyCode: () => void;
  onClose: () => void;
};

export function EmailVerificationModal({
  email,
  code,
  codeSent,
  codeRemaining,
  resendRemaining,
  loading,
  notice,
  onCodeChange,
  onSendCode,
  onVerifyCode,
  onClose,
}: EmailVerificationModalProps) {
  const canVerify = code.length === 6 && codeRemaining > 0 && !loading;
  const canSend = !loading && resendRemaining === 0;
  const codeExpired = codeSent && codeRemaining === 0;

  return (
    <div className="email-verification-modal" role="dialog" aria-modal="true" aria-labelledby="email-verification-title">
      <button className="email-verification-backdrop" type="button" onClick={onClose} aria-label="이메일 인증 닫기" />
      <article>
        <button className="email-verification-close" type="button" onClick={onClose} aria-label="닫기">
          <X aria-hidden="true" />
        </button>
        <header>
          <p>EMAIL VERIFICATION</p>
          <h2 id="email-verification-title">이메일을 인증해주세요</h2>
          <span>{email}</span>
        </header>

        <div className="email-verification-content">
          {!codeSent || codeExpired ? (
            <button className="email-code-send" type="button" onClick={onSendCode} disabled={!canSend}>
              {loading ? "발송 중..." : codeExpired ? "인증번호 다시 받기" : "인증번호 받기"}
            </button>
          ) : (
            <>
              <div className="email-code-heading">
                <span>인증번호</span>
                <button type="button" onClick={onSendCode} disabled={!canSend}>
                  {resendRemaining > 0 ? `${resendRemaining}초 후 재전송` : "인증번호 재전송"}
                </button>
              </div>
              <div className="email-code-field">
                <input
                  aria-label="이메일 인증번호"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(event) => onCodeChange(event.target.value.replace(/\D/g, ""))}
                  placeholder="6자리 인증번호"
                />
                <time>{formatTime(codeRemaining)}</time>
              </div>
              <button className="email-code-confirm" type="button" onClick={onVerifyCode} disabled={!canVerify}>
                {loading ? "확인 중..." : "확인"}
              </button>
            </>
          )}
          {notice && <p className="email-verification-notice" role="status">{notice}</p>}
        </div>
      </article>
    </div>
  );
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
