export const currencyToNumber = (value: string): number => {
  return parseFloat((value + '').replace(/[.]/g, '').replace(',', '.')) || 0
}
