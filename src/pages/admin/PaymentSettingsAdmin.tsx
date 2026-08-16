import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { subscribeToPaymentSettings, savePaymentSettings } from '@/services/settings';
import { uploadBrandingImage } from '@/services/content';
import type { PaymentSettings } from '@/types';
import { useAuth } from '@/hooks/useAuth';

export default function PaymentSettingsAdmin() {
  const { admin } = useAuth();
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [upiId, setUpiId] = useState('');
  const [instructions, setInstructions] = useState('');
  const [qrPreview, setQrPreview] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => subscribeToPaymentSettings((s) => {
    setSettings(s);
    setUpiId(s.upiId);
    setInstructions(s.instructions);
    setQrPreview(s.upiQrImageUrl ?? '');
  }), []);

  function onFileChange(f: File | null) {
    setFile(f);
    if (f) setQrPreview(URL.createObjectURL(f));
  }

  async function handleSave() {
    if (!admin) return;
    setSaving(true);
    try {
      let upiQrImageUrl = settings?.upiQrImageUrl;
      if (file) {
        upiQrImageUrl = await uploadBrandingImage(file, `branding/upi-qr-${Date.now()}-${file.name}`);
      }
      await savePaymentSettings({ upiId: upiId.trim(), instructions: instructions.trim(), upiQrImageUrl }, admin.email);
      toast.success('Payment settings saved — the public site updates automatically');
      setFile(null);
    } catch {
      toast.error('Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl text-ivory mb-1">Payment Settings</h1>
      <p className="text-ivory/45 text-sm mb-8">Changes here appear instantly on the public "Support the Celebration" section.</p>

      <div className="card-glass rounded-2xl p-6 space-y-5">
        <div>
          <label className="block text-xs text-ivory/50 mb-1.5">UPI ID</label>
          <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="mmryouthforce@upi" className="input" />
        </div>

        <div>
          <label className="block text-xs text-ivory/50 mb-1.5">UPI QR Code</label>
          {qrPreview && <img src={qrPreview} alt="QR preview" className="w-32 h-32 object-contain bg-ivory rounded-lg p-2 mb-3" />}
          <input type="file" accept="image/*" onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} className="input" />
        </div>

        <div>
          <label className="block text-xs text-ivory/50 mb-1.5">Donation Instructions</label>
          <textarea rows={3} value={instructions} onChange={(e) => setInstructions(e.target.value)} className="input" />
          <p className="text-ivory/30 text-xs mt-1.5">
            Reminder: the site never claims automatic payment verification — donations are recorded in the ledger only after your team verifies them.
          </p>
        </div>

        <button onClick={handleSave} disabled={saving} className="w-full bg-saffron text-charcoal font-semibold rounded-lg py-2.5 text-sm hover:bg-saffron-light disabled:opacity-60">
          {saving ? 'Saving...' : 'Save Payment Settings'}
        </button>
      </div>
    </div>
  );
}
