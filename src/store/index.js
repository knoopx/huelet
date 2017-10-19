import { debounce } from 'lodash'
import { observe } from 'mobx'
import { types, getParent } from 'mobx-state-tree'
import huejay from 'huejay'

const Connection = types.model('Connection', {
  host: types.string,
  username: types.string,
})

let isQuering = false

function controllable(target) {
  return target
    .views(self => ({
      get store() {
        return getParent(self, 2)
      },
      get state() {
        const {
          on, brightness, hue, colorTemp,
        } = self
        return {
          on, brightness, hue, colorTemp,
        }
      },
      async reference() {
        return self.collection.getById(self.id)
      },
    }))
    .actions((self) => {
      const disposables = []

      return {
        afterCreate() {
          disposables.push(observe(self, (e) => {
            if (e.type === 'update' && !isQuering) {
              const value = e.object[e.name]
              if (value !== undefined) {
                self.change(e.name, value)
              }
            }
          }))
        },
        beforeDestroy() {
          disposables.forEach((dispose) => { dispose() })
        },
        update(props) {
          Object.assign(self, props)
        },
        change: debounce(async (prop, value) => {
          const ref = await self.reference()
          if (prop in ref) {
            ref[prop] = value
            await self.collection.save(ref)
            await self.store.query()
          }
        }, 200),
      }
    })
}

const Light = controllable(types.model('Light', {
  id: types.identifier(types.string),
  name: types.string,
  on: types.boolean,
  reachable: types.boolean,
  brightness: types.number,
  hue: types.maybe(types.number),
  colorTemp: types.maybe(types.number),
  manufacturer: types.string,
  type: types.string,
  modelId: types.string,
  softwareVersion: types.string,
})).views(self => ({
  get collection() {
    return self.store.client.lights
  },
}))

const Group = controllable(types.model('Group', {
  id: types.identifier(types.string),
  name: types.string,
  on: types.boolean,
  brightness: types.number,
  hue: types.maybe(types.number),
  colorTemp: types.maybe(types.number),
  type: types.string,
  lights: types.optional(types.array(types.reference(Light)), []),
})).views(self => ({
  get collection() {
    return self.store.client.groups
  },
}))

export default types.model('Store', {
  connection: types.maybe(Connection),
  lights: types.optional(types.array(Light), []),
  groups: types.optional(types.array(Group), []),
})
  .preProcessSnapshot(({ lights, groups, ...snapshot }) => ({
    ...snapshot,
  }))
  .views(self => ({
    get client() {
      if (self.connection) {
        return new huejay.Client({
          host: self.connection.host,
          username: self.connection.username,
        })
      }
    },
  }))
  .actions(self => ({
    afterCreate() {
      if (self.connection) {
        self.query()
      } else {
        self.discover()
      }
    },

    async discover() {
      const bridges = await huejay.discover({ strategy: 'nupnp' })
      if (bridges.length === 1) {
        self.connect(bridges[0].ip)
      }
    },

    async connect(host) {
      try {
        const client = new huejay.Client({ host })
        const user = await client.users.create(new client.users.User())
        self.setConnection({ host, username: user.username })
        self.query()
      } catch (error) {
        if (error instanceof huejay.Error && error.type === 101) {
          setTimeout(() => { self.connect(host) }, 2000)
        }
        throw error
      }
    },

    async query() {
      isQuering = true
      const lights = await self.client.lights.getAll()
      self.setLights(lights.map(({
        id, name, on, reachable, brightness, hue, colorTemp, manufacturer, modelId, softwareVersion, type,
      }) => ({
        id, name, on, reachable, brightness, hue, colorTemp, manufacturer, modelId, softwareVersion, type,
      })))
      const groups = await self.client.groups.getAll()
      self.setGroups(groups.map(({
        id, name, on, brightness, lightIds, type,
      }) => ({
        id, name, on, brightness, lights: lightIds, type,
      })))
      isQuering = false
    },

    setLights(lights) {
      self.lights = lights
    },

    setGroups(groups) {
      self.groups = groups
    },

    setConnection(props) {
      self.connection = props
    },

    setBridges(bridges) {
      self.bridges = bridges
    },
  }))
