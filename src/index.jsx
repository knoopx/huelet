import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import { AppContainer } from 'react-hot-loader'
import { onSnapshot } from 'mobx-state-tree'
import { debounce } from 'lodash'

import App from './app'
import Store from './store'

const store = Store.create(localStorage.store ? JSON.parse(localStorage.store) : {})

ReactDOM.render(
  <AppContainer>
    <Provider store={store}>
      <App />
    </Provider>
  </AppContainer>,
  document.querySelector('#root'),
)

onSnapshot(
  store,
  debounce((snapshot) => {
    localStorage.store = JSON.stringify(snapshot)
  }, 1000),
)
