import {
  aggregateByCurrency,
  formatCurrency,
  getCurrencyLocale,
  Loan,
  Obligation,
} from '../../../client/src/utils/currencyAggregator';

describe('currencyAggregator', () => {
  describe('getCurrencyLocale', () => {
    it('should return pl-PL for PLN', () => {
      expect(getCurrencyLocale('PLN')).toBe('pl-PL');
    });

    it('should return de-DE for EUR', () => {
      expect(getCurrencyLocale('EUR')).toBe('de-DE');
    });

    it('should return en-US for USD', () => {
      expect(getCurrencyLocale('USD')).toBe('en-US');
    });

    it('should fall back to en-US for unknown currency codes', () => {
      expect(getCurrencyLocale('GBP')).toBe('en-US');
      expect(getCurrencyLocale('JPY')).toBe('en-US');
      expect(getCurrencyLocale('CHF')).toBe('en-US');
    });
  });

  describe('formatCurrency', () => {
    it('should format PLN amounts with pl-PL locale', () => {
      const result = formatCurrency(1000, 'PLN');
      // pl-PL formats PLN as "1 000,00 zł" or similar
      expect(result).toContain('1');
      expect(result).toContain('000');
    });

    it('should format EUR amounts with de-DE locale', () => {
      const result = formatCurrency(2500.5, 'EUR');
      expect(result).toContain('2');
      expect(result).toContain('500');
    });

    it('should format USD amounts with en-US locale', () => {
      const result = formatCurrency(1234.56, 'USD');
      expect(result).toContain('1');
      expect(result).toContain('234');
      expect(result).toContain('56');
    });

    it('should use en-US locale for unknown currencies', () => {
      const result = formatCurrency(100, 'GBP');
      // Should still format correctly using en-US locale with GBP symbol
      expect(result).toContain('100');
    });

    it('should handle zero amounts', () => {
      const result = formatCurrency(0, 'PLN');
      expect(result).toContain('0');
    });

    it('should handle negative amounts', () => {
      const result = formatCurrency(-500, 'USD');
      expect(result).toContain('500');
    });
  });

  describe('aggregateByCurrency', () => {
    const plnLoan: Loan = {
      id: '1',
      borrowerName: 'Jan Kowalski',
      currentBalance: 5000,
      currency: 'PLN',
    };

    const plnLoan2: Loan = {
      id: '2',
      borrowerName: 'Anna Nowak',
      currentBalance: 3000,
      currency: 'PLN',
    };

    const eurLoan: Loan = {
      id: '3',
      borrowerName: 'Hans Müller',
      currentBalance: 2000,
      currency: 'EUR',
    };

    const plnObligation: Obligation = {
      id: '4',
      creditorName: 'Bank ABC',
      currentBalance: 2000,
      currency: 'PLN',
    };

    const eurObligation: Obligation = {
      id: '5',
      creditorName: 'EU Bank',
      currentBalance: 1000,
      currency: 'EUR',
    };

    const usdLoan: Loan = {
      id: '6',
      borrowerName: 'John Smith',
      currentBalance: 1500,
      currency: 'USD',
    };

    it('should return empty array for empty inputs', () => {
      const result = aggregateByCurrency([], []);
      expect(result).toEqual([]);
    });

    it('should group loans by currency', () => {
      const result = aggregateByCurrency([plnLoan, plnLoan2, eurLoan], []);

      expect(result).toHaveLength(2);
      expect(result[0].currency).toBe('EUR');
      expect(result[1].currency).toBe('PLN');
    });

    it('should calculate totalLoanBalance correctly per group', () => {
      const result = aggregateByCurrency([plnLoan, plnLoan2, eurLoan], []);

      const plnGroup = result.find((g) => g.currency === 'PLN')!;
      expect(plnGroup.totalLoanBalance).toBe(8000); // 5000 + 3000

      const eurGroup = result.find((g) => g.currency === 'EUR')!;
      expect(eurGroup.totalLoanBalance).toBe(2000);
    });

    it('should calculate totalObligationBalance correctly per group', () => {
      const result = aggregateByCurrency([], [plnObligation, eurObligation]);

      const plnGroup = result.find((g) => g.currency === 'PLN')!;
      expect(plnGroup.totalObligationBalance).toBe(2000);

      const eurGroup = result.find((g) => g.currency === 'EUR')!;
      expect(eurGroup.totalObligationBalance).toBe(1000);
    });

    it('should calculate netBalance as totalLoanBalance - totalObligationBalance', () => {
      const result = aggregateByCurrency(
        [plnLoan, plnLoan2, eurLoan],
        [plnObligation, eurObligation]
      );

      const plnGroup = result.find((g) => g.currency === 'PLN')!;
      expect(plnGroup.netBalance).toBe(6000); // 8000 - 2000

      const eurGroup = result.find((g) => g.currency === 'EUR')!;
      expect(eurGroup.netBalance).toBe(1000); // 2000 - 1000
    });

    it('should handle negative netBalance when obligations exceed loans', () => {
      const bigObligation: Obligation = {
        id: '10',
        creditorName: 'Big Bank',
        currentBalance: 10000,
        currency: 'PLN',
      };

      const result = aggregateByCurrency([plnLoan], [bigObligation]);
      const plnGroup = result.find((g) => g.currency === 'PLN')!;
      expect(plnGroup.netBalance).toBe(-5000); // 5000 - 10000
    });

    it('should sort groups alphabetically by currency code', () => {
      const result = aggregateByCurrency(
        [plnLoan, eurLoan, usdLoan],
        [plnObligation, eurObligation]
      );

      expect(result[0].currency).toBe('EUR');
      expect(result[1].currency).toBe('PLN');
      expect(result[2].currency).toBe('USD');
    });

    it('should include correct loans in each group', () => {
      const result = aggregateByCurrency(
        [plnLoan, plnLoan2, eurLoan],
        []
      );

      const plnGroup = result.find((g) => g.currency === 'PLN')!;
      expect(plnGroup.loans).toHaveLength(2);
      expect(plnGroup.loans[0].id).toBe('1');
      expect(plnGroup.loans[1].id).toBe('2');

      const eurGroup = result.find((g) => g.currency === 'EUR')!;
      expect(eurGroup.loans).toHaveLength(1);
      expect(eurGroup.loans[0].id).toBe('3');
    });

    it('should include correct obligations in each group', () => {
      const result = aggregateByCurrency(
        [],
        [plnObligation, eurObligation]
      );

      const plnGroup = result.find((g) => g.currency === 'PLN')!;
      expect(plnGroup.obligations).toHaveLength(1);
      expect(plnGroup.obligations[0].id).toBe('4');

      const eurGroup = result.find((g) => g.currency === 'EUR')!;
      expect(eurGroup.obligations).toHaveLength(1);
      expect(eurGroup.obligations[0].id).toBe('5');
    });

    it('should handle currency with only obligations and no loans', () => {
      const gbpObligation: Obligation = {
        id: '7',
        creditorName: 'UK Bank',
        currentBalance: 500,
        currency: 'GBP',
      };

      const result = aggregateByCurrency([], [gbpObligation]);

      expect(result).toHaveLength(1);
      expect(result[0].currency).toBe('GBP');
      expect(result[0].totalLoanBalance).toBe(0);
      expect(result[0].totalObligationBalance).toBe(500);
      expect(result[0].netBalance).toBe(-500);
      expect(result[0].loans).toHaveLength(0);
      expect(result[0].obligations).toHaveLength(1);
    });

    it('should handle currency with only loans and no obligations', () => {
      const result = aggregateByCurrency([usdLoan], []);

      expect(result).toHaveLength(1);
      expect(result[0].currency).toBe('USD');
      expect(result[0].totalLoanBalance).toBe(1500);
      expect(result[0].totalObligationBalance).toBe(0);
      expect(result[0].netBalance).toBe(1500);
      expect(result[0].loans).toHaveLength(1);
      expect(result[0].obligations).toHaveLength(0);
    });
  });
});
