import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';

interface CurrencyApiResponse {
  meta: {
    last_updated_at: string;
  };
  data: Record<
    string,
    {
      code: string;
      value: number;
    }
  >;
}

@Injectable()
export class CurrencyService {
  private readonly API_KEY = process.env.CURRENCY_API_KEY!;
  private readonly API_URL = 'https://api.currencyapi.com/v3/latest';

  /**
   * Cache selama 12 jam
   */
  private cache?: CurrencyApiResponse;
  private cacheExpiredAt = 0;

  /**
   * Mengambil seluruh kurs.
   * Default base USD.
   * Jika from != USD maka request menggunakan base_currency=from
   */
  private async getRates(base = 'USD'): Promise<CurrencyApiResponse> {
    base = base.toUpperCase();

    const now = Date.now();

    // gunakan cache jika belum expired dan base sama
    if (
      this.cache &&
      this.cacheExpiredAt > now &&
      this.cache.data[base] === undefined // cache hanya untuk base yang sama
    ) {
      return this.cache;
    }

    const params = new URLSearchParams({
      apikey: this.API_KEY,
    });

    if (base !== 'USD') {
      params.append('base_currency', base);
    }

    const response = await fetch(`${this.API_URL}?${params}`);

    if (!response.ok) {
      throw new InternalServerErrorException(
        `Currency API Error (${response.status})`,
      );
    }

    const data = (await response.json()) as CurrencyApiResponse;

    if (!data.data) {
      throw new InternalServerErrorException(
        'Currency API returned invalid response.',
      );
    }

    this.cache = data;
    this.cacheExpiredAt = now + 12 * 60 * 60 * 1000;

    return data;
  }

  /**
   * Convert mata uang
   */
  async convert(
    amount: number,
    from: string,
    to: string,
  ) {
    from = from.toUpperCase();
    to = to.toUpperCase();

    if (amount < 0) {
      throw new BadRequestException('Amount must be greater than 0.');
    }

    if (from === to) {
      return {
        amount,
        from,
        to,
        rate: 1,
        result: amount,
      };
    }

    /**
     * Base USD
     */
    if (from === 'USD') {
      const rates = await this.getRates();

      const target = rates.data[to];

      if (!target) {
        throw new BadRequestException(
          `Currency ${to} is not supported.`,
        );
      }

      return {
        amount,
        from,
        to,
        rate: target.value,
        result: amount * target.value,
        updatedAt: rates.meta.last_updated_at,
      };
    }

    /**
     * Base mengikuti FROM
     */
    const rates = await this.getRates(from);

    const target = rates.data[to];

    if (!target) {
      throw new BadRequestException(
        `Currency ${to} is not supported.`,
      );
    }

    return {
      amount,
      from,
      to,
      rate: target.value,
      result: amount * target.value,
      updatedAt: rates.meta.last_updated_at,
    };
  }
}