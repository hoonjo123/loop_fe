import { useState, type FormEvent } from "react";
import { Flag, X } from "lucide-react";

type ReportModalProps = {
  targetLabel: string;
  onClose: () => void;
  onSubmit: (reason: string, description: string) => Promise<void>;
};

export function ReportModal({ targetLabel, onClose, onSubmit }: ReportModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSubmitting(true);
    setError("");
    try {
      await onSubmit(String(form.get("reason")), String(form.get("description")));
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "신고를 접수하지 못했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="report-modal" role="dialog" aria-modal="true" aria-labelledby="report-title">
      <button className="report-backdrop" type="button" onClick={onClose} aria-label="신고 닫기" />
      <form onSubmit={handleSubmit}>
        <button className="report-close" type="button" onClick={onClose} aria-label="닫기"><X /></button>
        <span className="report-icon"><Flag /></span>
        <h2 id="report-title">신고하기</h2>
        <p>{targetLabel}에 대한 신고 사유를 알려주세요.</p>
        <label>
          <span>신고 사유</span>
          <select name="reason" required>
            <option value="ABUSE">욕설 또는 괴롭힘</option>
            <option value="SEXUAL_CONTENT">성희롱 또는 부적절한 내용</option>
            <option value="FRAUD">사기 또는 금전 요구</option>
            <option value="PERSONAL_INFORMATION">개인정보 노출</option>
            <option value="SPAM">도배 또는 광고</option>
            <option value="OTHER">기타</option>
          </select>
        </label>
        <label>
          <span>상세 내용</span>
          <textarea name="description" maxLength={1000} rows={4} placeholder="운영자가 상황을 이해할 수 있도록 설명해주세요." />
        </label>
        {error && <p className="report-error" role="alert">{error}</p>}
        <button className="report-submit" type="submit" disabled={submitting}>{submitting ? "접수 중..." : "신고 접수"}</button>
      </form>
    </div>
  );
}
