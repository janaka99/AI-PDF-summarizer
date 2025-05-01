// Function to calculate token count based on dollar amount
export function getTokenCount(dollarAmount: number) {
  try {
    // 30k tokens for $5 means 6,000 tokens per dollar
    const TOKENS_PER_DOLLAR = 6000;
    return Math.floor(dollarAmount * TOKENS_PER_DOLLAR);
  } catch (error) {
    return null;
  }
}
