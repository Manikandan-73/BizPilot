/**
 * Realistic Organization representations for default MSME Demo Profiles.
 *
 * This allows both user-created organizations from Firestore and demo profiles
 * to pass through the EXACT SAME Central Financial Analysis Engine.
 */

import { Organization } from '../types/business';

export const DEMO_ORGANIZATIONS: Organization[] = [
  {
    id: 'shree-ganesh-agro',
    name: 'Shree Ganesh Agro Foods',
    businessProfile: {
      businessName: 'Shree Ganesh Agro Foods',
      businessType: 'Partnership',
      industry: 'Food Processing & Spices',
      location: 'Nashik, Maharashtra',
      yearEstablished: 2018,
      numberOfEmployees: 28,
      annualTurnover: 48500000, // ₹4.85 Cr
    },
    financialProfile: {
      monthlyRevenue: 4040000, // ~₹40.4 Lakhs/mo
      monthlyOperatingExpenses: 620000, // ₹6.2L OPEX
      monthlyMaterialCost: 2020000, // ₹20.2L raw materials (COGS)
      monthlySalaryCost: 560000, // ₹5.6L payroll
      currentCashBalance: 5200000, // ₹52 Lakhs
      accountsReceivable: 5500000, // ₹55 Lakhs
      accountsPayable: 3100000, // ₹31 Lakhs
      inventoryValue: 3800000, // ₹38 Lakhs
    },
    debtProfile: {
      hasLoans: true,
      loanDetails: {
        outstandingLoanAmount: 7500000, // ₹75 Lakhs
        monthlyEMI: 180000, // ₹1.80 Lakhs
        interestRate: 10.5,
        remainingTenureMonths: 48,
      },
      gstRegistered: true,
      itrAvailable: true,
      hasBusinessBankAccount: true,
    },
    complianceProfile: {
      gstRegistered: true,
      itrAvailable: true,
      hasBusinessBankAccount: true,
    },
    goals: {
      goals: ['Improve Cash Flow', 'Get Business Funding', 'Expand Business'],
      biggestChallenge: 'Cash Flow',
    },
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: 'apex-precision',
    name: 'Apex Precision Engineering Pvt Ltd',
    businessProfile: {
      businessName: 'Apex Precision Engineering Pvt Ltd',
      businessType: 'Private Limited',
      industry: 'Automotive & CNC Components',
      location: 'Bhosari MIDC, Pune',
      yearEstablished: 2015,
      numberOfEmployees: 45,
      annualTurnover: 94000000, // ₹9.40 Cr
    },
    financialProfile: {
      monthlyRevenue: 7830000, // ~₹78.3 Lakhs/mo
      monthlyOperatingExpenses: 1180000, // ₹11.8L OPEX
      monthlyMaterialCost: 3910000, // ₹39.1L materials
      monthlySalaryCost: 1220000, // ₹12.2L staff
      currentCashBalance: 12000000, // ₹1.2 Cr
      accountsReceivable: 9200000, // ₹92 Lakhs
      accountsPayable: 5200000, // ₹52 Lakhs
      inventoryValue: 7000000, // ₹70 Lakhs
    },
    debtProfile: {
      hasLoans: true,
      loanDetails: {
        outstandingLoanAmount: 14000000, // ₹1.40 Cr
        monthlyEMI: 320000, // ₹3.20 Lakhs
        interestRate: 9.75,
        remainingTenureMonths: 60,
      },
      gstRegistered: true,
      itrAvailable: true,
      hasBusinessBankAccount: true,
    },
    complianceProfile: {
      gstRegistered: true,
      itrAvailable: true,
      hasBusinessBankAccount: true,
    },
    goals: {
      goals: ['Expand Business', 'Manage Inventory', 'Increase Profit'],
      biggestChallenge: 'Growth',
    },
    createdAt: '2024-01-10T00:00:00.000Z',
    updatedAt: '2024-01-10T00:00:00.000Z',
  },
  {
    id: 'kavita-textiles',
    name: 'Kavita Handlooms & Apparels',
    businessProfile: {
      businessName: 'Kavita Handlooms & Apparels',
      businessType: 'Sole Proprietorship',
      industry: 'Organic Cotton & Sustainable Apparel',
      location: 'Tiruppur, Tamil Nadu',
      yearEstablished: 2020,
      numberOfEmployees: 19,
      annualTurnover: 29000000, // ₹2.90 Cr
    },
    financialProfile: {
      monthlyRevenue: 2410000, // ~₹24.1 Lakhs/mo
      monthlyOperatingExpenses: 420000, // ₹4.2L OPEX
      monthlyMaterialCost: 1250000, // ₹12.5L yarn & fabric
      monthlySalaryCost: 380000, // ₹3.8L weavers
      currentCashBalance: 2200000, // ₹22 Lakhs
      accountsReceivable: 3800000, // ₹38 Lakhs
      accountsPayable: 2200000, // ₹22 Lakhs
      inventoryValue: 2900000, // ₹29 Lakhs
    },
    debtProfile: {
      hasLoans: true,
      loanDetails: {
        outstandingLoanAmount: 4500000, // ₹45 Lakhs
        monthlyEMI: 120000, // ₹1.20 Lakhs
        interestRate: 11.2,
        remainingTenureMonths: 36,
      },
      gstRegistered: true,
      itrAvailable: true,
      hasBusinessBankAccount: true,
    },
    complianceProfile: {
      gstRegistered: true,
      itrAvailable: true,
      hasBusinessBankAccount: true,
    },
    goals: {
      goals: ['Improve Creditworthiness', 'Increase Sales', 'Reduce Expenses'],
      biggestChallenge: 'Sales',
    },
    createdAt: '2024-02-01T00:00:00.000Z',
    updatedAt: '2024-02-01T00:00:00.000Z',
  },
];

/**
 * Returns a demo organization by id, or the first default demo organization.
 */
export function getDemoOrganization(id?: string): Organization {
  const match = DEMO_ORGANIZATIONS.find((demo) => demo.id === id);
  return match ?? DEMO_ORGANIZATIONS[0];
}
