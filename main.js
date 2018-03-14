const path = require('path')
const electron = require('electron')
const menubar = require('menubar')
const defaultMenu = require('electron-default-menu')

const { app, shell, Menu } = electron

if (process.env.NODE_ENV === 'development') {
  const webpack = require('webpack')
  const WebpackDevServer = require('webpack-dev-server')
  const config = require(path.resolve('./webpack.config.js'))

  config.output.publicPath = 'http://localhost:8080/'
  config.entry.unshift(
    'webpack-dev-server/client?http://localhost:8080/',
    'webpack/hot/dev-server',
  )
  config.plugins.unshift(new webpack.HotModuleReplacementPlugin())

  const compiler = webpack(config)
  const server = new WebpackDevServer(compiler, { hot: true, inline: true })
  server.listen(8080)
}

app.on('ready', () => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(defaultMenu(app, shell)))

  const { screen } = electron
  const { height } = screen.getPrimaryDisplay().workAreaSize

  let index = `file://${__dirname}/dist/renderer.html`
  if (process.env.NODE_ENV === 'development') {
    index = 'http://localhost:8080/renderer.html'
  }
  const mb = menubar({
    index,
    transparent: true,
    width: 320,
    height: 340,
    preloadWindow: true,
  })
  mb.on('ready', () => {
    if (process.env.DEBUG || process.env.NODE_ENV === 'development') {
      mb.window.webContents.openDevTools()
    }
  })
})
