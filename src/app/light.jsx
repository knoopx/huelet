import React from 'react'
import { observer } from 'mobx-react'

import Indicator from './indicator'

const Light = observer(({ light, onToggle, onBrightness }) => (
  <div
    className="flex leading-tight items-center"
    key={light.id}
    style={{ opacity: light.reachable ? 1 : 0.2 }}
  >
    <div className="flex-auto mr-3 truncate">{light.name}</div>
    <input
      className="mr-3"
      type="range"
      value={light.brightness}
      min={0}
      max={254}
      onChange={e => onBrightness(light, e.target.valueAsNumber)}
    />
    <Indicator status={light.on} onClick={() => onToggle(light)} />
  </div>
))

export default Light
