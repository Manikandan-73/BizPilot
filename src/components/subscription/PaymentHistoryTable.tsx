import React from 'react';
import { PaymentRecord } from '../../types/business';
import { useLanguage } from '../../i18n/LanguageContext';
import { CheckCircle2, Receipt, RefreshCw } from 'lucide-react';

interface PaymentHistoryTableProps {
  payments: PaymentRecord[];
  loading?: boolean;
}

export const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({
  payments,
  loading = false,
}) => {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-purple-400" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
            {t('subscription.paymentHistory', 'Payment History & Receipts')}
          </h4>
        </div>
        <span className="text-[10px] text-slate-400">
          Razorpay Standard Checkout (Test Mode)
        </span>
      </div>

      {loading ? (
        <div className="py-8 flex items-center justify-center gap-2 text-xs text-slate-400">
          <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
          <span>Loading payment history...</span>
        </div>
      ) : payments.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          {t('subscription.noPaymentsYet', 'No payment transactions recorded yet.')}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Plan</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Payment ID</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {payments.map((p) => (
                <tr key={p.paymentId || p.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 text-slate-300">
                    {p.verifiedAt ? new Date(p.verifiedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-3 px-3 font-bold text-white uppercase">
                    {p.plan}
                  </td>
                  <td className="py-3 px-3 font-bold text-purple-300 font-mono">
                    ₹{p.amount}
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono text-[11px] truncate max-w-[140px]" title={p.paymentId}>
                    {p.paymentId}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      Captured
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
