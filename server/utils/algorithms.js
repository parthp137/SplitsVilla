// Best Deal Algorithm: Combines rating, affordability, amenities, votes, capacity
export const calculateBestDeal = (properties) => {
  return properties.map((p) => {
    const affordability = Math.max(0, 1 - p.pricePerNight / 50000); // Normalize to 50k max
    const rating = p.rating / 5;
    const amenities = Math.min(p.amenities.length / 20, 1); // Max 20 amenities
    const votes = p.upVotes ? Math.min(p.upVotes / 50, 1) : 0; // Normalize votes
    const capacity = Math.min(p.maxGuests / 20, 1); // Max 20 guests

    const score = affordability * 0.3 + rating * 0.25 + amenities * 0.2 + votes * 0.15 + capacity * 0.1;
    return { ...p, dealScore: score };
  });
};

// Greedy settlement algorithm: Minimizes number of transactions
export const settleExpenses = (expenses, members) => {
  const balances = {};
  members.forEach((m) => (balances[m] = 0));

  expenses.forEach((e) => {
    const perPerson = e.amount / e.splitAmong.length;
    balances[e.paidBy] += e.amount;
    e.splitAmong.forEach((m) => (balances[m] -= perPerson));
  });

  const settlements = [];
  const creditors = Object.entries(balances)
    .filter(([, bal]) => bal > 0)
    .sort(([, a], [, b]) => b - a);
  const debtors = Object.entries(balances)
    .filter(([, bal]) => bal < 0)
    .sort(([, a], [, b]) => a - b);

  let i = 0,
    j = 0;
  while (i < creditors.length && j < debtors.length) {
    const [creditor, creditAmount] = creditors[i];
    const [debtor, debtAmount] = debtors[j];
    const amount = Math.min(creditAmount, Math.abs(debtAmount));

    settlements.push({ from: debtor, to: creditor, amount });
    creditors[i][1] -= amount;
    debtors[j][1] += amount;

    if (creditors[i][1] === 0) i++;
    if (debtors[j][1] === 0) j++;
  }

  return settlements;
};
