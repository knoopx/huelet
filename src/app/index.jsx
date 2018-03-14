import React from 'react'
import classNames from 'classnames'
import { observer, inject } from 'mobx-react'
import pairImage from './pair.svg'
import { hot } from 'react-hot-loader'

const Indicator = ({ status, ...props }) => (
  <span
    {...props}
    className={classNames('dib w1 h1 br2 pointer', {
      'bg-green': status,
      'bg-red': !status,
    })}
  />
)

const Light = observer(({ light, onToggle, onBrightness }) => (
  <div
    className="flex lh-title items-center"
    key={light.id}
    style={{ opacity: light.reachable ? 1 : 0.2 }}
  >
    <div className="flex-auto mr3 truncate">{light.name}</div>
    <input
      className="mr3"
      type="range"
      value={light.brightness}
      min={0}
      max={254}
      onChange={e => onBrightness(light, e.target.valueAsNumber)}
    />
    <Indicator status={light.on} onClick={() => onToggle(light)} />
  </div>
))

const LightGroup = observer(({ group, onToggle, onBrightness }) => (
  <div className="bb b--moon-gray" key={group.id}>
    <div className="mh3 mv2">
      <div className="flex flex-auto items-center lh-title">
        <div className="flex-auto mr3 truncate b">{group.name}</div>
        <input
          className="mr3"
          type="range"
          value={group.brightness}
          min={0}
          max={254}
          onChange={e => onBrightness(group, e.target.valueAsNumber)}
        />
        <Indicator status={group.on} onClick={() => onToggle(group)} />
      </div>
      <div className="flex flex-column flex-none">
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

const Triangle = ({ size, color }) => (
  <div style={{ width: size * 2, height: size, overflow: 'hidden' }}>
    <div
      style={{
        height: 0,
        width: 0,
        borderStyle: 'solid',
        borderWidth: `0 ${size}px ${size}px ${size}px`,
        borderColor: `transparent transparent ${color} transparent`,
      }}
    />
  </div>
)

@inject('store')
@observer
class App extends React.Component {
  render() {
    return (
      <div className="system-sans-serif flex flex-column items-center">
        <Triangle size={10} color="white" />
        <div className="flex flex-auto flex-column br2 bg-white overflow-y-auto">
          {this.renderContent()}
        </div>
      </div>
    )
  }

  renderContent() {
    const { store } = this.props

    if (store.connection) {
      return (
        <React.Fragment>
          {store.groups.map(group => (
            <LightGroup
              group={group}
              onToggle={this.onToggle}
              onBrightness={this.onBrightness}
            />
          ))}
        </React.Fragment>
      )
    }

    return <img src={pairImage} with="200" height="200" />
  }

  async onToggle(target) {
    target.update({ on: !target.on })
  }

  onBrightness(target, value) {
    target.update({ brightness: value })
  }
}

export default hot(module)(App)
