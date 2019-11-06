import Webhooks from '../src/index'

;(async () => {
  try {
    let wh = new Webhooks({
      storageProvider: new Webhooks.LocalDiskStorageProvider()
    })
    await wh.add({
      url: 'https://localhost/urmom',
      tags: ['IMPORTANT'],
      events: [
        'user.create',
        'user.update',
        'ur.mom'
      ]
    })

    const all = await wh.getAll()
    console.log('All >>> ', all)

    const byOneEvent = await wh.getByEvents('ur.mom')
    console.log('By Event >>> ', byOneEvent)

    const byMultipleEvents = await wh.getByEvents([
      'ur.mom',
      'user.update'
    ])
    console.log('by Multiple Events >>> ', byMultipleEvents)

    const byTag = await wh.getByTag('ACP')
    console.log('By Tag >>> ', byTag)

    // const remove = await wh.remove('c96a2e7f-f930-4f58-8eea-b89dc693a678')
    // console.log(remove)

    console.log(await wh.triggerByEvent('user.create', {
      userId: 'joshstout@gmail.com',
      name: 'Josh Stout',
      password: 'jk... why would you have a password property you dummy'
    }))

  } catch (e) {
    console.log(e)
  }
})()
