import React from 'react'
import { observer, inject } from 'mobx-react'
import Indicator from './indicator'
import Light from './light'

const LightGroup = observer(({ group, onToggle, onBrightness }) => (
  <div className="border-b border-grey-light" key={group.id}>
    <div className="mx-3 my-2">
      <div className="flex flex-auto items-center leading-tight">
        <div className="flex-auto mr-3 truncate font-bold">{group.name}</div>
        <input
          className="mr-3"
          type="range"
          value={group.brightness}
          min={0}
          max={254}
          onChange={e => onBrightness(group, e.target.valueAsNumber)}
        />
        <Indicator status={group.on} onClick={() => onToggle(group)} />
      </div>
      <div className="flex flex-col flex-none">
        {group.lights.map(light => (
          <Light
            light={light}
            onToggle={onToggle}
            onBrightness={onBrightness}
          />
        ))}
      </div>
    </div>
  </div>
))

export default LightGroup
