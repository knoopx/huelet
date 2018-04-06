import React from 'react'
import { observer, inject } from 'mobx-react'
import { hot } from 'react-hot-loader'

import pairImage from './pair.svg'

import LightGroup from './light-group'

@inject('store')
@observer
class App extends React.Component {
  render() {
    return (
      <div className="flex-auto rounded bg-white overflow-y-scroll">
        {this.renderContent()}
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
