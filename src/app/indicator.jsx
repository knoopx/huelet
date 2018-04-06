import classNames from 'classnames'
import React from 'react'

const Indicator = ({ status, size, ...props }) => (
  <span
    {...props}
    className={classNames('inline-block rounded cursor-pointer', {
      'bg-green': status,
      'bg-red': !status,
    })}
    style={{ width: size, height: size }}
  />
)

Indicator.defaultProps = { size: 16 }

export default Indicator
