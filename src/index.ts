import crypto from 'crypto'
import { EventEmitter } from 'events'
import got from 'got'
import uuidv4 from 'uuid/v4'

import MemoryStorageProvider from './providers/memory'
import LocalDiskStorageProvider from './providers/localDisk'

interface IConfig {
  storageProvider?: IStorageProvider
}

interface IStorageProvider {
  getAll: () => Promise<IWebhookObject[]>,
  getById: (webhookId: string) => Promise<IWebhookObject | null>,
  getByEvent: (eventType: string) => Promise<IWebhookObject[] | null>,
  getByTag: (tag: string) => Promise<IWebhookObject[] | null>,
  add: (webhook: IWebhookObject) => Promise<IWebhookObject>,
  remove: (webhookId: string) => Promise<boolean>
}

interface IWebhookObjectCreate {
  id?: string,
  tags?: string[],
  meta?: object
  url: string,
  events: string[],
  authentication?: boolean,
  authToken?: string
}

interface IWebhookObject {
  id: string,
  tags: string[],
  url: string,
  events: string[],
  authentication: boolean,
  authToken: string,
  created: string,
  modified: string
}

class Webhooks {
  private config: IConfig
  private db: IStorageProvider
  emitter: EventEmitter
  static MemoryStorageProvider = MemoryStorageProvider
  static LocalDiskStorageProvider = LocalDiskStorageProvider

  constructor (_config?: IConfig) {
    this.config = _config || {}
    this.db = this.config.storageProvider || new MemoryStorageProvider()
    this.emitter = new EventEmitter()
  }

  on (str: string, cb: (ctx: any) => void) {
    return this.emitter.on(str, cb)
  }

  async getAll () {
    return this.db.getAll()
  }

  async getById (webhookId: string): Promise<IWebhookObject | null> {
    const webhook = await this.db.getById(webhookId)
    if (!webhook) return null
    return webhook
  }

  async getByTag (tag: string): Promise<IWebhookObject[] | null> {
    const webhooks = await this.db.getByTag(tag)
    if (!webhooks) return null
    return webhooks
  }

  async getByEvents (events: string | string[]): Promise<IWebhookObject[] | null> {
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
    if (!webhookObject.url) throw new Error('Missing url parameter on webhook object')
    if (!webhookObject.events || !Array.isArray(webhookObject.events)) throw new Error('Missing events parameter or is not an array')
    if (!webhookObject.events.length) throw new Error('events parameter requires at least one event')
    const id = uuidv4()
    const createdDate = new Date()
    const objectToAdd = {
      id: id,
      tags: webhookObject.tags || [],
      meta: webhookObject.meta || {},
      url: webhookObject.url,
      events: webhookObject.events,
      authentication: webhookObject.authentication || true,
      authToken: this._generateAuthToken(),
      created: createdDate.toJSON(),
      modified: createdDate.toJSON()
    }
    await this.db.add(objectToAdd)
    return this.db.getById(id)
  }

  async remove (webhookId: string): Promise<boolean> {
    await this.db.remove(webhookId)
    return true
  }

  async triggerByEvent (eventType: string, data: any, tagFilter?: string) {
    let webhooks = await this.db.getByEvent(eventType)
    if (!webhooks) return null
    if (tagFilter) webhooks = webhooks.filter(e => e.tags.includes(tagFilter))

    for (let hook of webhooks) {
      // tslint:disable-next-line:no-floating-promises
      this._httpPost(hook, eventType, data)
        .then(res => {
          this.emitter.emit('response', {
            webhookId: hook.id,
            type: 'HTTP_SEND_RESPONSE',
            msg: `Received response from server for webhook with ID: ${hook.id}`,
            response: res
          })
        })
        .catch(err => {
          this.emitter.emit('error', {
            webhookId: hook.id,
            type: 'HTTP_SEND_ERROR',
            msg: `Error triggering webhook with ID: ${hook.id}`,
            error: err
          })
        })
    }
    return {
      msg: `Triggered ${webhooks.length} webhook(s)`,
      webhookIds: webhooks.map(e => e.id)
    }
  }

  private _generateAuthToken () {
    const randomNum = Math.random() * 100000
    return crypto.createHash('sha1').update(randomNum.toString()).digest('hex')
  }

  private async _httpPost (webhookObject: IWebhookObject, eventType: string, data: any) {
    let url = webhookObject.url
    const jsonBody: any = {
      event: eventType,
      webhookId: webhookObject.id,
      webhookSentAt: new Date().toJSON(),
      data: data
    }
    const gotConfig = {
      followRedirect: false,
      rejectUnauthorized: false,
      json: true,
      body: jsonBody,
      headers: {}
    }

    if (webhookObject.authentication) {
      gotConfig.headers = {
        Authorization: `WH ${webhookObject.authToken}`
      }
    }
    return got.post(url, gotConfig)
  }
}

export = Webhooks
