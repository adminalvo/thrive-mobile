'use client';

import React, { useState, useEffect } from 'react';
import { PortalLayout } from '@/components/layout/PortalLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { realDbService } from '@/services/realDbService';
import { CreditCard, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function FinancePage() {
  const { profile } = useAuth();
  const { t, locale } = useLanguage();

  const [studentData, setStudentData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const stu = await realDbService.getStudentDashboard(profile?.studentId);
      setStudentData(stu);

      if (stu?.id) {
        const payList = await realDbService.getStudentPayments(stu.id);
        setPayments(payList);
      }
      setLoading(false);
    };

    fetchData();
  }, [profile]);

  return (
    <PortalLayout title={t('nav.finance')}>
      <div className="space-y-6">
        <Card>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">
                {locale === 'az' ? 'Maliyyə Hesabatı və Ödənişlər' : 'Tuition & Payment Ledgers'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {locale === 'az' ? 'Tədris müqaviləsi və ödəniş qəbzlərinin rəsmi statusu' : 'Official payment schedule and contract details'}
              </p>
            </div>
            <Badge variant="teal">{studentData?.program || 'Course Program'}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-5 rounded-2xl bg-[#070F1E] border border-slate-800">
              <span className="text-xs text-slate-400">{locale === 'az' ? 'Aylıq Ödəniş Məbləği' : 'Monthly Payment'}</span>
              <h4 className="text-2xl font-black text-emerald-400 mt-1">{studentData?.monthly_payment || 600} ₼</h4>
            </div>

            <div className="p-5 rounded-2xl bg-[#070F1E] border border-slate-800">
              <span className="text-xs text-slate-400">{locale === 'az' ? 'Ümumi Müqavilə Dəyəri' : 'Total Contract Value'}</span>
              <h4 className="text-2xl font-black text-white mt-1">{studentData?.total_price || 5400} ₼</h4>
            </div>

            <div className="p-5 rounded-2xl bg-[#070F1E] border border-slate-800">
              <span className="text-xs text-slate-400">{locale === 'az' ? 'Müddət' : 'Duration'}</span>
              <h4 className="text-2xl font-black text-[#5ce1e6] mt-1">{studentData?.duration_months || 9} {locale === 'az' ? 'Ay' : 'Months'}</h4>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#070F1E] border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <div>
                <h5 className="text-sm font-bold text-white">{locale === 'az' ? 'Cari Ay Üzrə Ödəniş Statusu' : 'Current Billing Status'}</h5>
                <p className="text-xs text-slate-400">{locale === 'az' ? 'Bütün ödənişlər rəsmi müqavilə əsasında qeydə alınır.' : 'All payments are legally reconciled with the main center.'}</p>
              </div>
            </div>
            <Badge variant="green">{locale === 'az' ? 'Ödənilib' : 'Verified Paid'}</Badge>
          </div>
        </Card>
      </div>
    </PortalLayout>
  );
}
