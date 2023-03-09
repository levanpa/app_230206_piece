import $ from 'jquery'
import { dbRead, dbWrite, dbSubmitPassword } from './db.js'
import { Route } from './router.js'
let log = (...rest) => console.log(...rest)

// CONSTANTS
const HOST_URL = 'http://localhost:5173/'
//---//

const contentArea = $('#new-piece')
const createButton = $('.create-button')
const route = new Route()


function render(id) {
  log('render id: ', id)

  if (id < 0) {
    log('id < 0')
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
    if (data.passwordRequired) {
      $('.password-wrapper').removeClass('hidden')
      handlePassword(route.id)
      return
    }
    if (data.error) {
      $('.task-wrapper').removeClass('hidden')
      $('.piece-content').addClass('is-error').text(data.message)
      return
    }
    showTask(data)
  }

  function showTask(data) {
    $('.password-wrapper').addClass('hidden')
    $('.task-wrapper').removeClass('hidden')
    let content = ''
    try {
      content = JSON.parse(data.content)
    } catch (error) {
      log('unable to parse content:', error.message)
      content = data.content
    }
    $('.piece-content').text(content)
    $('.piece-created-date').text('Created at: ' + new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    }).format(data.created))
  }

  function handlePassword(id) {
    $('.password-button').on('click', (event) => {
      event.preventDefault()
      $('.notify-icon').removeClass('animating')
      let value = $('#input-password').val()
      dbSubmitPassword(id, value).then((response) => {
        if (response.ok) {
          response.json().then((data) => {
            afterSubmit(data, id)
          })
        } else { }
      })
    })

    function afterSubmit(data) {
      if (data.result === true) {
        afterRead(data.item)
      } else {
        $('.notify-icon').text(data.message).addClass('animating')
        $('.notify-icon').on('transitionend', (event) => {
          setTimeout(() => {
            $('.notify-icon').removeClass('animating')
          }, 5000)
        })
      }
    }

  }
}


function handleCreate() {
  createButton.on('click', (event) => {
    event.preventDefault()
    $('.notify-icon').removeClass('animating')
    let dbData = {
      content: JSON.stringify(contentArea.val()),
      created: Date.now(),
      password: $('#password-value').val(),
      expire: $('#expire-value').val()
    }
    log('dbData', dbData)

    dbWrite(dbData).then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          afterWrite(data)
        })
      } else { }
    })
  })

  function afterWrite(data) {
    contentArea.val('')
    $('.notify-icon').text(data.message).addClass('animating')
    $('.notify-icon').on('transitionend', (event) => {
      setTimeout(() => {
        $('.notify-icon').removeClass('animating')
      }, 5000)
    })
    if (data.status === 1) {
      window.location.href = `${HOST_URL}id/${data.nextID}`
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