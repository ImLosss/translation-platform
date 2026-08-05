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
  const data = await api<any>("/user/profile-stats");

  return (
    <section className="stats-grid">
      <div className="stat-card">
        <div className="stat-icon">
          <i className={`fas fa-coins`}></i>
        </div>
        <div className="stat-label">Balance</div>
        <div className="stat-value">
          <span className="currency">IDR</span>
          12000
        </div>
        {/* <div className={`stat-change ${stat.direction}`}>
          <i className={`fas fa-arrow-${stat.direction}`}></i> {stat.change}
        </div> */}
      </div>
      <div className="stat-card">
        <div className="stat-icon">
          <i className={`fas fa-file-alt`}></i>
        </div>
        <div className="stat-label">Total Translations</div>
        <div className="stat-value">
          {data.statistics.totalTranslations}
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
          {data.statistics.processing}
        </div>
        {/* <div className={`stat-change ${stat.direction}`}>
          <i className={`fas fa-arrow-${stat.direction}`}></i> {stat.change}
        </div> */}
      </div>
    </section>
  );
}