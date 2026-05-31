"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

type ImportantLinkEditorProps = {
  onClose: () => void;
  onSave: (input: { title: string; url: string }) => Promise<void>;
};

export function ImportantLinkEditor({ onClose, onSave }: ImportantLinkEditorProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!title.trim() || !url.trim()) {
      setError("제목과 URL을 입력해 주세요.");
      return;
    }

    setSaving(true);

    try {
      await onSave({ title, url });
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "링크를 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose} title="중요 링크 추가">
      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="link-title">제목</label>
          <Input id="link-title" onChange={(event) => setTitle(event.target.value)} value={title} />
        </div>
        <div className="field-group">
          <label htmlFor="link-url">URL</label>
          <Input id="link-url" onChange={(event) => setUrl(event.target.value)} placeholder="https://example.com" value={url} />
        </div>
        {error ? <p className="status-message">{error}</p> : null}
        <div className="form-footer">
          <Button onClick={onClose}>취소</Button>
          <Button disabled={saving} type="submit" variant="primary">
            저장
          </Button>
        </div>
      </form>
    </Modal>
  );
}
