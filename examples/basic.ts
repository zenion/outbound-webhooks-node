// tslint:disable
import Webhooks from '../src/index'

;(async () => {
  try {
    let wh = new Webhooks({
      storageProvider: new Webhooks.LocalDiskStorageProvider()
    })

    wh.emitter.on('error', (ctx) => {
      console.log(ctx.msg)
    })


    // await wh.add({
    //   url: 'https://localhost/urmom',
    //   tags: ['ABC'],
    //   events: [
    //     'user.create',
    //     'user.update',
    //     'ur.mom'
    //   ]
    // })

    const all = await wh.getAll()
    console.log('All >>> ', all)

    const byOneEvent = await wh.getByEvents('ur.mom')
    console.log('By Event >>> ', byOneEvent)

    const byMultipleEvents = await wh.getByEvents([
      'ur.mom',
      'user.update'
    ])
    console.log('by Multiple Events >>> ', byMultipleEvents)

    const byTag = await wh.getByTag('ABC')
    console.log('By Tag >>> ', byTag)

    console.log('Trigger on user.create >>> ', await wh.triggerByEvent('user.create', {
      userId: 'joshstout@gmail.com',
      name: 'Josh Stout',
      password: 'jk... why would you have a password property you dummy'
    }))

  } catch (e) {
    console.log(e)
  }
})()
