// a JSON based local disk storage provider for outbound-webhooks framework
// author: josh stout <joshstout@gmail.com>

import Conf from 'conf'

import { IWebhookObject } from '../index'

export class LocalDiskStorageProvider {
  db: Conf

  constructor () {
    this.db = new Conf({
      projectName: 'outbound-webhooks-localdisk-storage',
      schema: {
        webhooks: {
          type: 'array',
          items: {
            type: 'object'
          },
          default: []
        }
      }
    })
  }

  async getAll (): Promise<IWebhookObject[]> {
    return this.db.get('webhooks')
  }

  async getById (webhookId: string): Promise<IWebhookObject | null> {
    const webhooks: IWebhookObject[] = this.db.get('webhooks')
    const webhook = webhooks.find(e => e.id === webhookId)
    if (!webhook) return null
    return webhook
  }

  async getByTag (tag: string): Promise<IWebhookObject[] | null> {
    const webhooks: IWebhookObject[] = this.db.get('webhooks')
    const filteredWebhooks = webhooks.filter(e => e.tags.includes(tag))
    if (!filteredWebhooks.length) return null
    return filteredWebhooks
  }

  async getByEvent (eventType: string): Promise<IWebhookObject[] | null> {
    const webhooks: IWebhookObject[] = this.db.get('webhooks')
    const filteredWebhooks = webhooks.filter(e => e.events.includes(eventType))
    if (!filteredWebhooks.length) return null
    return filteredWebhooks
  }

  async add (webhook: IWebhookObject): Promise<IWebhookObject> {
    let webhooks: IWebhookObject[] = this.db.get('webhooks')
    webhooks.push(webhook)
    this.db.set('webhooks', webhooks)
    const updatedWebhooks: IWebhookObject[] = this.db.get('webhooks')
    const result = updatedWebhooks.find(e => e.id === webhook.id)
    if (!result) throw new Error('Error adding object to local disk database')
    return result
  }

  async remove (webhookId: string): Promise<boolean> {
    let webhooks: IWebhookObject[] = this.db.get('webhooks')
    const updatedWebhooks = webhooks.filter(e => e.id !== webhookId)
    this.db.set('webhooks', updatedWebhooks)
    return true
  }
}

export default LocalDiskStorageProvider
