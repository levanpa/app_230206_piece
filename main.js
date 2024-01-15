import $ from 'jquery'
import { dbRead, dbWrite } from './db.js'
import { Route } from './router.js'
let log = console.log

// CONSTANTS
const HOST_URL = 'http://localhost:5173/'
//---//

const contentArea = $('#new-piece')
const createButton = $('.create-button')
const route = new Route()

function render(id) {
  if (!id) {
    log('id is undefined')
    return
  }

  dbRead(id).then((response) => {
    if (response.ok) {
      response.json().then((data) => {
        afterRead(data)
      })
    } else { }
  })

  function afterRead(data) {
    // if (data.error) {
    //   $('.task-wrapper').removeClass('hidden')
    //   $('.piece-content').addClass('is-error').text(data.message)
    //   return
    // }

    $('.task-wrapper').removeClass('hidden')
    $('.piece-created-date').text('Created at: ' + new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }).format(data.created))

    let content = ''
    if (!isExpired(data)) {
      try {
        content = JSON.parse(data.content)
      } catch (error) {
        log('unable to parse content:', error.message)
        content = data.content
      }
    } else {
      $('.piece-created-date').text($('.piece-created-date').text() + ' - DELETED')
    }
    $('.piece-content').text(content)
  }

  function isExpired(data) {
    return data.isExpired
  }
}

function handleCreate() {
  createButton.on('click', (event) => {
    event.preventDefault()
    $('.notify-icon').removeClass('animating')
    let dbData = {
      content: JSON.stringify(contentArea.val()),
      created: Date.now(),
      expire: $('#expire-value').val()
    }
    // log('dbData', dbData)

    dbWrite(dbData).then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          // log('after write', data)
          afterWrite(data)
        })
      } else { }
    })
  })

  function afterWrite(data) {
    $('.notify-icon').text(data.message).addClass('animating')
    $('.notify-icon').on('transitionend', (event) => {
      setTimeout(() => {
        $('.notify-icon').removeClass('animating')
      }, 5000)
    })
    if (data.status === 1) {
      contentArea.val('')
      window.location.href = `${HOST_URL}id/${data.id}`
    }
  }
}



$(async () => {
  await route.init()
  // log('currentPage', route.currentPage)
  switch (route.currentPage) {
    case 'home':
      handleCreate()
      break
    case 'id':
      render(route.id)
      break
  }
  $('#app').removeAttr('style')
})