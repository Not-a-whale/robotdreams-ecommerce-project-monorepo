export function paymentStatusToLabel(status: number): string {
  const labels: Record<number, string> = {
    0: 'PAYMENT_STATUS_UNSPECIFIED',
    1: 'AUTHORIZED',
    2: 'CAPTURED',
    3: 'REFUNDED',
    4: 'FAILED',
  };
  return labels[status] ?? `UNKNOWN(${status})`;
}
