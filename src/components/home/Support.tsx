import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';
import type { PaymentSettings, SiteSettings } from '@/types';
import { Link } from 'react-router-dom';

export function CommunityMessage({ settings }: { settings: SiteSettings | null }) {
  if (!settings?.communityMessage) return null;
  return (
    <section className="hairline">
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-20 text-center">
        <p className="eyebrow mb-5">A Word From MMR Youth Force</p>
        <p className="font-display italic text-xl sm:text-2xl text-ivory/90 leading-relaxed whitespace-pre-line">
          "{settings.communityMessage}"
        </p>
      </div>
    </section>
  );
}

export function Support({ payment }: { payment: PaymentSettings | null }) {
  const [copied, setCopied] = useState(false);

  async function copyUpi() {
    if (!payment?.upiId) return;
    await navigator.clipboard.writeText(payment.upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const upiLink = payment?.upiId
    ? `upi://pay?pa=${encodeURIComponent(payment.upiId)}&pn=${encodeURIComponent('MMR Youth Force')}&cu=INR`
    : undefined;

  return (
    <section id="support" className="max-w-4xl mx-auto px-5 sm:px-8 py-24">
      <div className="text-center mb-12">
        <p className="eyebrow mb-4">Support the Celebration</p>
        <h2 className="font-display text-3xl sm:text-4xl text-ivory">Contribute With Confidence</h2>
        <p className="mt-4 text-ivory/60 max-w-xl mx-auto text-sm sm:text-base">
          Every contribution is recorded and shown on our public{' '}
          <Link to="/transparency" className="text-saffron-light underline underline-offset-4">transparency ledger</Link> after our team verifies it.
        </p>
      </div>

      <div className="card-glass rounded-2xl p-8 sm:p-10 grid sm:grid-cols-2 gap-8 items-center">
        <div className="flex justify-center">
          {payment?.upiQrImageUrl ? (
            <img src={payment.upiQrImageUrl} alt="UPI QR code" className="w-48 h-48 rounded-xl object-contain bg-ivory p-3" />
          ) : (
            <div className="w-48 h-48 rounded-xl bg-charcoal-50 border border-dashed border-copper/30 flex items-center justify-center text-ivory/30 text-xs text-center px-4">
              QR will appear here once configured in Admin
            </div>
          )}
        </div>

        <div>
          <p className="eyebrow mb-2">UPI ID</p>
          <div className="flex items-center gap-2 mb-6">
            <code className="text-ivory bg-charcoal-50 px-3 py-2 rounded-lg text-sm flex-1 truncate">
              {payment?.upiId || 'Not configured yet'}
            </code>
            <button
              onClick={copyUpi}
              disabled={!payment?.upiId}
              aria-label="Copy UPI ID"
              className="p-2.5 rounded-lg border border-copper/30 text-copper-light hover:border-saffron hover:text-saffron transition-colors disabled:opacity-30"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>

          {upiLink && (
            <a
              href={upiLink}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-saffron text-charcoal text-sm font-semibold hover:bg-saffron-light transition-colors"
            >
              Open UPI App <ExternalLink size={15} />
            </a>
          )}

          <p className="mt-6 text-ivory/50 text-xs leading-relaxed">
            {payment?.instructions}
          </p>
        </div>
      </div>
    </section>
  );
}
