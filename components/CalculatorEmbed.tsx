import { BudgetCalculator, EmergencyFundCalculator, LoanCalculator, SavingsGoalCalculator } from "./Calculators";

export function CalculatorEmbed({ id }: { id: string }) {
  switch (id) {
    case "budget-calculator": return <BudgetCalculator n={0} />;
    case "emergency-fund-calculator": return <EmergencyFundCalculator n={0} />;
    case "savings-goal-calculator": return <SavingsGoalCalculator n={0} />;
    case "loan-calculator": return <LoanCalculator n={0} />;
    default: return null;
  }
}
