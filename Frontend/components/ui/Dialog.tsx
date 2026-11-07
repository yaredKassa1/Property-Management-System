'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from './Button';

// ── Confirm Dialog ────────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Overlay onClose={onCancel}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onCancel}>{cancelLabel}</Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Overlay>
  );
}

// ── Input Dialog (replaces prompt()) ─────────────────────────────────────────

interface InputDialogProps {
  title: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export function InputDialog({
  title,
  label,
  placeholder = '',
  required = false,
  multiline = false,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: InputDialogProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (required && !value.trim()) return;
    onConfirm(value.trim());
  };

  return (
    <Overlay onClose={onCancel}>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}{required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {multiline ? (
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={placeholder}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <Button type="button" variant="outline" onClick={onCancel}>{cancelLabel}</Button>
          <Button type="submit" disabled={required && !value.trim()}>{confirmLabel}</Button>
        </div>
      </form>
    </Overlay>
  );
}

// ── Two-field Input Dialog (for approve with notes + amount) ──────────────────

interface TwoFieldDialogProps {
  title: string;
  field1Label: string;
  field1Placeholder?: string;
  field2Label: string;
  field2Placeholder?: string;
  field2Type?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: (field1: string, field2: string) => void;
  onCancel: () => void;
}

export function TwoFieldDialog({
  title,
  field1Label,
  field1Placeholder = '',
  field2Label,
  field2Placeholder = '',
  field2Type = 'text',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: TwoFieldDialogProps) {
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');

  return (
    <Overlay onClose={onCancel}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{field1Label}</label>
            <textarea
              value={val1}
              onChange={e => setVal1(e.target.value)}
              placeholder={field1Placeholder}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{field2Label}</label>
            <input
              type={field2Type}
              value={val2}
              onChange={e => setVal2(e.target.value)}
              placeholder={field2Placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="outline" onClick={onCancel}>{cancelLabel}</Button>
          <Button onClick={() => onConfirm(val1, val2)}>{confirmLabel}</Button>
        </div>
      </div>
    </Overlay>
  );
}

// ── Shared overlay ────────────────────────────────────────────────────────────

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ── Approval Dialog (comments + permitted amount + signature) ─────────────────

interface ApprovalDialogProps {
  title: string;
  showPermittedAmount?: boolean;
  currentQuantity?: number;
  confirmLabel?: string;
  onConfirm: (comments: string, permittedAmount: string, signature: string) => void;
  onCancel: () => void;
}

export function ApprovalDialog({
  title,
  showPermittedAmount = true,
  currentQuantity,
  confirmLabel = 'Approve',
  onConfirm,
  onCancel,
}: ApprovalDialogProps) {
  const [comments, setComments] = useState('');
  const [permittedAmount, setPermittedAmount] = useState('');
  const [signature, setSignature] = useState('');

  return (
    <Overlay onClose={onCancel}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comments (Optional)</label>
            <textarea
              value={comments}
              onChange={e => setComments(e.target.value)}
              placeholder="Add any notes or conditions..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          {showPermittedAmount && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Permitted Amount
                {currentQuantity && <span className="text-gray-400 font-normal ml-1">(requested: {currentQuantity})</span>}
              </label>
              <input
                type="number"
                min="1"
                max={currentQuantity}
                value={permittedAmount}
                onChange={e => setPermittedAmount(e.target.value)}
                placeholder={`Leave blank to approve full quantity${currentQuantity ? ` (${currentQuantity})` : ''}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Full Name (Digital Signature) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={signature}
              onChange={e => setSignature(e.target.value)}
              placeholder="Type your full name to sign..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button
            disabled={!signature.trim()}
            onClick={() => onConfirm(comments, permittedAmount, signature)}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Overlay>
  );
}

// ── Rejection Dialog (reason + signature) ────────────────────────────────────

interface RejectionDialogProps {
  title: string;
  onConfirm: (reason: string, signature: string) => void;
  onCancel: () => void;
}

export function RejectionDialog({ title, onConfirm, onCancel }: RejectionDialogProps) {
  const [reason, setReason] = useState('');
  const [signature, setSignature] = useState('');

  return (
    <Overlay onClose={onCancel}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Please provide a clear reason for rejection..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Full Name (Digital Signature) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={signature}
              onChange={e => setSignature(e.target.value)}
              placeholder="Type your full name to sign..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button
            variant="danger"
            disabled={!reason.trim() || !signature.trim()}
            onClick={() => onConfirm(reason, signature)}
          >
            Reject
          </Button>
        </div>
      </div>
    </Overlay>
  );
}
