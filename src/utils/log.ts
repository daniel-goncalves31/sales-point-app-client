export const log = (value: any, error?: boolean) => {
  if (process.env.NODE_ENV === 'development') {
    if (error) {
      console.error(value)
    } else {
      console.log(value)
    }
  }
}
