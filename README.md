

# outbound-webhooks

> A promise (async/await) based Outbound Webhooks framework for NodeJS

## Key Features

- **Event-driven** - Create webhooks that subscribe to events, then fire the events and all the corresponding webhooks fire.
- **Extensible backends** - Built-in backends for storing the webhook configurations but also easily extensible to any backend you prefer.
- **Webhook response handling** - While webhooks are fire-and-forget. You can still listen to the responses from them (without blocking) and do stuff retroactively. (maybe log the success/failures for instance!)

## Install

Install with npm or yarn into your project:

```bash
npm install outbound-webhooks

(or)

yarn add outbound-webhooks
```


## Usage

```js
const Webhooks = require('outbound-webhooks');

// We wrap into async function so we can use async/await
;(async () => {

  // create instance of the library
  const wh = new Webhooks({
    // pass a storage provider if you want your webhook configs stored persistently (optional)
    storageProvider: new Webhooks.LocalDiskStorageProvider()
  })

  // create a listener when errors occur on the fired webhooks
  wh.on('error', (err) => {
    console.log(err.msg)
  })

  // lets add a new webhook!
  await wh.add({
    url: 'https://localhost/definitely/a/remote/server',
    tags: ['ABC'],
    events: [
      'user.create',
      'user.update'
    ],
    meta: {
      key: 'value'
    }
  })

  // lets grab all hooks and look at the one we created
  const allHooks = await wh.getAll()

  // Will look something like this
  // [
  //   {
  //     id: 'c964ab8c-2ace-4113-9719-fd93df764af3',
  //     tags: [ 'ABC' ],
  //     meta: { key: 'value' }
  //     url: 'https://localhost/definitely/a/remote/server',
  //     events: [ 'user.create', 'user.update' ],
  //     authentication: true,
  //     authToken: '4f0e10c0cedcb0920acddba25bddfcbe543cce1d',
  //     created: '2019-11-30T02:16:07.387Z',
  //     modified: '2019-11-30T02:16:07.387Z'
  //   }
  // ]

  // We also have many convience lookup methods for the hooks that exist:

  const byOneEvent = await wh.getByEvents('user.create')

  const byMultipleEvents = await wh.getByEvents([
    'user.create',
    'user.update'
  ])

  const byTag = await wh.getByTag('ABC')


  // And finally, lets trigger an event and fire off our webhook(s)!
  // We can send arbitrary data via the second paramater
  await wh.triggerByEvent('user.create', {
    userId: 'rmann@realplace.real',
    name: 'Real Mann',
    password: 'PleaseDontSendPasswordsInWebhooks!1!!!!1',
    more: {
      nested: [
        'stuff',
        'and',
        'things'
      ]
    }
  })

  // this is what the webhook receiver gets:
  // {
  //   "event": "user.create",
  //   "webhookId": "bd56fb34-57c5-4b45-b370-13c25514ed25",
  //   "webhookSentAt": "2019-11-30T05:33:38.098Z",
  //   "data": {
  //     "userId": "rmann@realplace.real",
  //     "name": "Real Mann",
  //     "password": "PleaseDontSendPasswordsInWebhooks!1!!!!1",
  //     "more": {
  //       "nested": [
  //         "stuff",
  //         "and",
  //         "things"
  //       ]
  //     }
  //   }
})()
```

## Creating Your Own Backend

To create a connector to store your webhook data to your own database, simply create a class that implements the following example's schema and then supply an instance in the constructor to this library on the "storageProvider" key

#### Backend Connector Memory Example
```js
class MemoryStorageProvider {
  constructor () {
    this.db = []
  }

  async getAll () {
    return this.db
  }

  async getById (webhookId) {
    const webhook = this.db.find(e => e.id === webhookId)
    if (!webhook) return null
    return webhook
  }

  async getByTag (tag) {
    const webhooks = this.db.filter(e => e.tags.includes(tag))
    if (!webhooks.length) return null
    return webhooks
  }

  async getByEvent (eventType) {
    const webhooks = this.db.filter(e => e.events.includes(eventType))
    if (!webhooks.length) return null
    return webhooks
  }

  async add (webhook) {
    this.db.push(webhook)
    const result = this.db.find(e => e.id === webhook.id)
    if (!result) throw new Error('Error adding object to in-memory database')
    return result
  }

  async remove (webhookId) {
    const result = this.db.findIndex(e => e.id === webhookId)
    if (result === -1) throw new Error(`Unable to find webhook with id ${webhookId}`)
    this.db.splice(result, 1)
    return true
  }
}

module.exports = MemoryStorageProvider
```

Builtin providers can be found in the [src/providers](src/providers) directory for inspiration.

## API

### new Webhooks(options?)

#### input

Type: `string`

Lorem ipsum.

#### options

Type: `object`

##### postfix

Type: `string`\
Default: `rainbows`

Lorem ipsum.
