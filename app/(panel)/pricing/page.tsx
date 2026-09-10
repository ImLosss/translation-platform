import styles from './pricing.module.css';
import { api } from '@/app/lib/api'; 

export interface ProviderPricing {
  id: number;
  name: string;
  inputPricing: number;
  inputCachePricing: number;
  outputPricing: number;
  inputPricingIDR: number;
  inputCachePricingIDR: number;
  outputPricingIDR: number;
  status: string;
}

export default async function ModelPricingPage() {
  let providers: ProviderPricing[] = [];
  let error: string | null = null;

  try {
    providers = await api<ProviderPricing[]>('/provider');
  } catch (err: any) {
    error = err.message || 'Something Error.';
  }

  const formatIDR = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (error) {
    return (
      <section className="card">
        <p style={{ color: 'var(--red)', textAlign: 'center', padding: '20px 0', margin: 0 }}>
          <i className="fas fa-exclamation-triangle" style={{ marginRight: 8 }}></i>
          {error}
        </p>
      </section>
    );
  }

  return (

      <div className={styles.pricingGrid}>
        {providers.map((provider) => (
          <div key={provider.id} className={styles.pricingCard}>
            <div className={styles.header}>
              <div className={styles.title}>
                {provider.name}
              </div>
              <span className={`${styles.statusBadge} ${provider.status === 'ACTIVE' ? styles.badgeSuccess : styles.badgeDanger}`}>
                {provider.status}
              </span>
            </div>

            <ul className={styles.priceList}>
              <li className={styles.priceItem}>
                <span className={styles.label}>
                  <i className="fas fa-sign-in-alt text-muted"></i> Input
                </span>
                <div className={styles.valueContainer}>
                  <span className={styles.valueIdr}>{formatIDR(provider.inputPricingIDR)}</span>
                  <span className={styles.valueUsd}>${provider.inputPricing} / 1M token</span>
                </div>
              </li>

              {provider.inputCachePricing > 0 && (
                <li className={styles.priceItem}>
                  <span className={styles.label}>
                    <i className="fas fa-bolt text-muted"></i> Input (Cache)
                  </span>
                  <div className={styles.valueContainer}>
                    <span className={styles.valueIdr}>{formatIDR(provider.inputCachePricingIDR)}</span>
                    <span className={styles.valueUsd}>${provider.inputCachePricing} / 1M token</span>
                  </div>
                </li>
              )}

              <li className={styles.priceItem}>
                <span className={styles.label}>
                  <i className="fas fa-sign-out-alt text-muted"></i> Output
                </span>
                <div className={styles.valueContainer}>
                  <span className={styles.valueIdr}>{formatIDR(provider.outputPricingIDR)}</span>
                  <span className={styles.valueUsd}>${provider.outputPricing} / 1M token</span>
                </div>
              </li>
            </ul>
          </div>
        ))}
      </div>
  );
}