import { api } from "@/app/lib/api";

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  prefix?: string; // misalnya "$"
  change: string;
  direction: 'up' | 'down';
}

const stats: StatCardProps[] = [
  {
    icon: '',
    label: 'Pending Review',
    value: '38',
    change: '-2.1%',
    direction: 'down',
  },
];

export default async function StatsGrid() {
  let data = null;
  let fetchError = false;

  try {
    data = await api<any>("/user/profile-stats");
  } catch (error) {
    console.error("Gagal mengambil data statistik:", error);
    fetchError = true;
  }

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
        <div className="stat-label">Balance</div>
        <div className="stat-value">
          <span className="currency">IDR</span>
          {balance.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
        <div className="stat-label">Total Translations</div>
        <div className="stat-value">
          {totalTranslations}
        </div>
        {/* <div className={`stat-change ${stat.direction}`}>
          <i className={`fas fa-arrow-${stat.direction}`}></i> {stat.change}
        </div> */}
      </div>
      <div className="stat-card">
        <div className="stat-icon">
          <i className={`fas fa-clock`}></i>
        </div>
        <div className="stat-label">Processing</div>
        <div className="stat-value">
          {processing}
        </div>
        {/* <div className={`stat-change ${stat.direction}`}>
          <i className={`fas fa-arrow-${stat.direction}`}></i> {stat.change}
        </div> */}
      </div>
    </section>
  );
}