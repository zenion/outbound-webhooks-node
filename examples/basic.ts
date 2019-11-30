// tslint:disable
import Webhooks from '../src/index'

;(async () => {
  try {
    let wh = new Webhooks({
      storageProvider: new Webhooks.LocalDiskStorageProvider()
    })

    wh.on('error', (err) => {
      console.log(err.msg)
    })



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

    // const all = await wh.getAll()
    // console.log('All >>> ', all)

    // const byOneEvent = await wh.getByEvents('ur.mom')
    // console.log('By Event >>> ', byOneEvent)

    // const byMultipleEvents = await wh.getByEvents([
    //   'ur.mom',
    //   'user.update'
    // ])
    // console.log('by Multiple Events >>> ', byMultipleEvents)

    // const byTag = await wh.getByTag('ABC')
    // console.log('By Tag >>> ', byTag)

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

  } catch (e) {
    console.log(e)
  }
})()
