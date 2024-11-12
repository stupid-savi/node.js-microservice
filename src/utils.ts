export const discountedPrice = (price: number, discount: number) => {
  if (price <= 0 || discount < 0) {
    throw new Error('Invalid parameters')
  }
  return price * (discount / 100)
}
