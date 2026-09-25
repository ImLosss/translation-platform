'use client';

import { useEffect, useState } from 'react';
import { getProfileStatsAction, ProfileStats } from '@/app/actions/profile/getProfileStatsAction';
import { useLanguage } from '../client/LanguageProvider';

export default function StatsGrid() {
  const { t, intlLocale } = useLanguage();
  const [data, setData] = useState<ProfileStats | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      const result = await getProfileStatsAction();
      if (result.success && result.data && isMounted) {
        setData(result.data);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, []);

  const balance = data?.profile?.balance || 0;
  const totalCostToday = data?.statistics?.totalCostToday || 0;
  const totalTranslations = data?.statistics?.totalTranslations || 0;
  const processing = data?.statistics?.processing || 0;

  return (
    <section className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">
          <i className={`fas fa-coins`}></i>
        </div>
        <div className="stat-label">{t.dashboard.balance}</div>
        <div className="stat-value">
          <span className="currency">IDR</span>
          {balance.toLocaleString(intlLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        {totalCostToday !== 0 && (
          <div className={`stat-change down`}>
            <i className={`fas fa-arrow-down`}></i> -{totalCostToday.toFixed(2)}
          </div>
        )}
      </div>
      <div className="stat-card">
        <div className="stat-icon">
          <i className={`fas fa-file-alt`}></i>
        </div>
        <div className="stat-label">{t.dashboard.totalTranslations}</div>
        <div className="stat-value">
          {totalTranslations}
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">
          <i className={`fas fa-clock`}></i>
        </div>
        <div className="stat-label">{t.dashboard.processing}</div>
        <div className="stat-value">
          {processing}
        </div>
      </div>
    </section>
  );
}