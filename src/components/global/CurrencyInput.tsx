import React from 'react'
import NumberFormat, { NumberFormatProps } from 'react-number-format'
import { Input } from 'antd'

interface Props {}

const CurrencyInput: React.FC<Props & NumberFormatProps> = props => {
  return (
    <NumberFormat
      customInput={Input}
      thousandSeparator='.'
      decimalSeparator=','
      decimalScale={2}
      allowNegative={false}
      allowLeadingZeros={false}
      {...props}
    />
  )
}

export default CurrencyInput
