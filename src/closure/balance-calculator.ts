export interface MemberPayment {
  userId: string;
  name: string;
  paidAmount: number;
}

export interface MemberBalance {
  userId: string;
  name: string;
  paidAmount: number;
  shareAmount: number;
  balance: number;
}

export interface Transfer {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

function byUserId(a: { userId: string }, b: { userId: string }) {
  if (a.userId < b.userId) return -1;
  if (a.userId > b.userId) return 1;
  return 0;
}

// Part de chacun : division entière + 1 centime pour les `reste` premiers userId.
export function calculateBalances(
  totalAmount: number,
  members: MemberPayment[],
): { balances: MemberBalance[]; transfers: Transfer[] } {
  const sortedMembers = [...members].sort(byUserId);
  const baseShare = Math.floor(totalAmount / sortedMembers.length);
  const remainder = totalAmount % sortedMembers.length;

  const balances: MemberBalance[] = sortedMembers.map((member, index) => {
    const shareAmount = index < remainder ? baseShare + 1 : baseShare;

    return {
      userId: member.userId,
      name: member.name,
      paidAmount: member.paidAmount,
      shareAmount,
      balance: member.paidAmount - shareAmount,
    };
  });

  return { balances, transfers: computeTransfers(balances) };
}

function byAmountThenUserId(
  a: { userId: string; amount: number },
  b: { userId: string; amount: number },
) {
  if (a.amount !== b.amount) return b.amount - a.amount;
  return byUserId(a, b);
}

// FOURNIE — Algorithme glouton : le plus gros débiteur rembourse le plus gros
// créancier, et ainsi de suite. Au plus n - 1 virements, sans garantie de minimum.
export function computeTransfers(
  balances: { userId: string; balance: number }[],
): Transfer[] {
  const debtors = balances
    .filter((member) => member.balance < 0)
    .map((member) => ({ userId: member.userId, amount: -member.balance }));
  const creditors = balances
    .filter((member) => member.balance > 0)
    .map((member) => ({ userId: member.userId, amount: member.balance }));

  const transfers: Transfer[] = [];

  while (debtors.length > 0 && creditors.length > 0) {
    debtors.sort(byAmountThenUserId);
    creditors.sort(byAmountThenUserId);

    const debtor = debtors[0];
    const creditor = creditors[0];
    const amount = Math.min(debtor.amount, creditor.amount);

    transfers.push({
      fromUserId: debtor.userId,
      toUserId: creditor.userId,
      amount,
    });

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount === 0) debtors.shift();
    if (creditor.amount === 0) creditors.shift();
  }

  return transfers;
}
