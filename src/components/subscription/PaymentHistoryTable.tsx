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
    <div className="rounded-2xl bg-[#121722] border border-[#222936] p-4 sm:p-6 shadow-sm space-y-4 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#222936] min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Receipt className="w-4 h-4 text-violet-400 shrink-0" />
          <h4 className="text-xs sm:text-sm font-bold text-[#F8FAFC] uppercase tracking-wider truncate">
            {t('subscription.paymentHistory', 'Payment History & Receipts')}
          </h4>
        </div>
        <span className="text-[10px] text-[#707A8C]">
          Razorpay Standard Checkout (Test Mode)
        </span>
      </div>

      {loading ? (
        <div className="py-8 flex items-center justify-center gap-2 text-xs text-[#707A8C]">
          <RefreshCw className="w-4 h-4 animate-spin text-violet-400" />
          <span>Loading payment history...</span>
        </div>
      ) : payments.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#707A8C]">
          {t('subscription.noPaymentsYet', 'No payment transactions recorded yet.')}
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[500px] text-left text-xs">
            <thead>
              <tr className="border-b border-[#222936] text-[10px] font-bold text-[#707A8C] uppercase tracking-wider">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Plan</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Payment ID</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222936]">
              {payments.map((p) => (
                <tr key={p.paymentId || p.id} className="hover:bg-[#161C27] transition-colors">
                  <td className="py-3 px-3 text-[#A7B0C0]">
                    {p.verifiedAt ? new Date(p.verifiedAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-3 px-3 font-bold text-[#F8FAFC] uppercase">
                    {p.plan}
                  </td>
                  <td className="py-3 px-3 font-bold text-violet-400 font-mono">
                    ₹{p.amount}
                  </td>
                  <td className="py-3 px-3 text-[#707A8C] font-mono text-[11px] truncate max-w-[140px]" title={p.paymentId}>
                    {p.paymentId}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-[10px] font-semibold">
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
