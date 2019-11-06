import { Webhooks, MemoryStorageProvider } from '../src/index'

;(async () => {
  try {
    let wh = new Webhooks()
    await wh.add({
      url: 'https://localhost/urmom',
      events: [
        'user.create',
        'user.update',
        'ur.mom'
      ]
    })
    const all = await wh.getAll()
    console.log('All >>> ', all)
    const byEvent = await wh.getByEvents('ur.mom')
    console.log('By Event >>> ', byEvent)
  } catch (e) {
    console.log(e)
  }
})()
