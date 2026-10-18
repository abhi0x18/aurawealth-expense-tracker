import { db } from "@/lib/db";
import { addWeeks, addMonths, addYears, isBefore } from "date-fns";

export async function processDueRecurringRules(userId: string) {
  const now = new Date();

  // Find all active rules where nextDueDate <= now
  const dueRules = await db.recurringRule.findMany({
    where: {
      userId,
      isActive: true,
      nextDueDate: {
        lte: now,
      },
    },
  });

  const generatedList = [];

  for (const rule of dueRules) {
    const currentDue = new Date(rule.nextDueDate);

    // Stop if rule has ended
    if (rule.endDate && isBefore(new Date(rule.endDate), currentDue)) {
      await db.recurringRule.update({
        where: { id: rule.id },
        data: { isActive: false },
      });
      continue;
    }

    // Check if transaction already generated for this rule and this date
    const existing = await db.transaction.findFirst({
      where: {
        recurringRuleId: rule.id,
        date: currentDue,
      },
    });

    if (!existing) {
      const tx = await db.transaction.create({
        data: {
          userId,
          type: rule.type,
          amountPaise: rule.amountPaise,
          date: currentDue,
          accountId: rule.accountId,
          categoryId: rule.categoryId,
          merchant: rule.merchant || "Recurring payment",
          notes: rule.description || `Generated from recurring rule (${rule.frequency})`,
          paymentMethod: "OTHER",
          recurringRuleId: rule.id,
        },
      });
      generatedList.push(tx);
    }

    // Compute next due date based on frequency
    let nextDue = new Date(currentDue);
    switch (rule.frequency) {
      case "WEEKLY":
        nextDue = addWeeks(nextDue, 1);
        break;
      case "MONTHLY":
        nextDue = addMonths(nextDue, 1);
        break;
      case "QUARTERLY":
        nextDue = addMonths(nextDue, 3);
        break;
      case "YEARLY":
        nextDue = addYears(nextDue, 1);
        break;
      default:
        nextDue = addMonths(nextDue, 1);
    }

    // If nextDue is past endDate, deactivate
    const shouldDeactivate = rule.endDate && isBefore(new Date(rule.endDate), nextDue);

    await db.recurringRule.update({
      where: { id: rule.id },
      data: {
        lastProcessedDate: currentDue,
        nextDueDate: nextDue,
        isActive: shouldDeactivate ? false : rule.isActive,
      },
    });
  }

  return generatedList;
}
