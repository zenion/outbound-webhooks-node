// an in-memory storage provider for outbound-webhooks framework (really just for testing i dont know why you'd use this otherwise)
// author: josh stout <joshstout@gmail.com>

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

export class MemoryStorageProvider {
  db: IWebhookObject[]

  constructor () {
    this.db = []
  }

  async getAll (): Promise<IWebhookObject[]> {
    return this.db
  }

  async getById (webhookId: string): Promise<IWebhookObject | null> {
    const webhook = this.db.find(e => e.id === webhookId)
    if (!webhook) return null
    return webhook
  }

  async getByTag (tag: string): Promise<IWebhookObject[] | null> {
    const webhooks = this.db.filter(e => e.tags.includes(tag))
    if (!webhooks.length) return null
    return webhooks
  }

  async getByEvent (eventType: string): Promise<IWebhookObject[] | null> {
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

export default MemoryStorageProvider
