import uuidv4 from 'uuid/v4'

interface IConfig {
  storageProvider?: IStorageProvider
}

interface IStorageProvider {
  getAll: () => Promise<IWebhookObject[]>,
  getById: (webhookId: string) => Promise<IWebhookObject|null>,
  getByEvent: (eventType: string) => Promise<IWebhookObject[]|null>
  add: (webhook: IWebhookObject) => Promise<IWebhookObject>,
  remove: (webhookId: string) => Promise<boolean>
}

interface IWebhookObjectCreate {
  id?: string,
  url: string,
  events: string[],
  authToken?: string
}

interface IWebhookObject {
  id: string,
  url: string,
  events: string[],
  authToken: string,
  created: string,
  modified: string
}

class Webhooks {
  private config: IConfig
  private db: IStorageProvider

  constructor (_config?: IConfig) {
    this.config = _config || {}
    this.db = this.config.storageProvider || new MemoryStorageProvider()
  }

  async getAll () {
    return this.db.getAll()
  }

  async getById (webhookId: string): Promise<IWebhookObject|null> {
    const webhook = await this.db.getById(webhookId)
    if (!webhook) return null
    return webhook
  }

  async getByEvents (events: string | string[]): Promise<IWebhookObject[]|null> {
    if (typeof events === 'string') events = [events]
    const webhooks: IWebhookObject[] = []
    for (const event of events) {
      const results = await this.db.getByEvent(event)
      if (!results) continue
      for (const result of results) {
        if (!webhooks.find(e => e.id === result.id)) webhooks.push(result)
      }
    }
    if (!webhooks.length) return null
    return webhooks
  }

  async add (webhookObject: IWebhookObjectCreate) {
    if (!webhookObject || typeof webhookObject !== 'object') throw new Error('Invalid input to add function')
    if (!webhookObject.url) throw new Error('Missing url parameter on webhook object')
    if (!webhookObject.events || !Array.isArray(webhookObject.events)) throw new Error('Missing events parameter or is not an array')
    if (!webhookObject.events.length) throw new Error('events parameter requires at least one event')
    if (webhookObject.authToken && typeof webhookObject.authToken !== 'string') throw new Error('authToken parameter must be of type string')
    const id = uuidv4()
    const createdDate = new Date()
    const objectToAdd = {
      id: id,
      url: webhookObject.url,
      created: createdDate.toJSON(),
      modified: createdDate.toJSON(),
      events: webhookObject.events,
      authToken: webhookObject.authToken || ''
    }
    await this.db.add(objectToAdd)
    // we will do the event listener registration here
    return this.db.getById(id)
  }

  async remove (webhookId: string): Promise<boolean> {
    await this.db.remove(webhookId)
    // deregister the event listener here
    return true
  }
}

class MemoryStorageProvider {
  db: IWebhookObject[]

  constructor () {
    this.db = []
  }

  async getAll (): Promise<IWebhookObject[]> {
    return this.db
  }

  async getById (webhookId: string): Promise<IWebhookObject|null> {
    const webhook = this.db.find(e => e.id === webhookId)
    if (!webhook) return null
    return webhook
  }

  async getByEvent (eventType: string): Promise<IWebhookObject[]|null> {
      const webhooks = this.db.filter(e => e.events.includes(eventType))
      if (!webhooks.length) return null
      return webhooks
  }

  async add (webhook: IWebhookObject): Promise<IWebhookObject> {
    this.db.push(webhook)
    const result = this.db.find(e => e.id === webhook.id)
    if (!result) throw new Error('Error adding object to in-memory database')
    return result
  }

  async remove (): Promise<boolean> {
    // do some removals
    return true
  }
}

;(async () => {
  try {
    let wh = new Webhooks()
    await wh.add({
      url: 'https://localhost/urmom',
      events: ['sup']
    })
    const all = await wh.getAll()
    console.log(all)
  } catch (e) {
    console.log(e)
  }
})()
