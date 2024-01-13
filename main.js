import $ from 'jquery'
import { Route } from './router.js'
import { dbRead, dbWrite } from './firebase.js'
let log = console.log

// CONSTANTS
const HOST_URL = 'http://localhost:5173/'
//---//

const contentArea = $('#new-piece')
const createButton = $('.create-button')
const route = new Route()


async function render(id) {
  // log('render id: ', id)
  if (!id) {
    log('id is null')
    return
  }

  await dbRead(id).then((snapshot) => {
    let data = snapshot.val()
    afterRead(data)
  })

  function afterRead(data) {
    // validate and check for errors
    // if (data.password) {
    //   $('.password-wrapper').removeClass('hidden')
    //   handlePassword(route.id)
    //   return
    // }
    // if (data.error) {
    //   $('.task-wrapper').removeClass('hidden')
    //   $('.piece-content').addClass('is-error').text(data.message)
    //   return
    // }

    // actually show content
    // $('.password-wrapper').addClass('hidden')
    $('.task-wrapper').removeClass('hidden')
    let content = ''
    if (!data.deleted) {
      try {
        content = JSON.parse(data.content)
      } catch (error) {
        log('unable to parse content:', error.message)
        content = data.content
      }
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
    if (data.deleted) {
      $('.piece-created-date').text($('.piece-created-date').text() + ' - deleted')
    }
  }

  // function handlePassword(id) {
  //   $('.password-button').on('click', (event) => {
  //     event.preventDefault()
  //     $('.notify-icon').removeClass('animating')
  //     let value = $('#input-password').val()
  //     dbSubmitPassword(id, value).then((response) => {
  //       if (response.ok) {
  //         response.json().then((data) => {
  //           afterSubmit(data)
  //         })
  //       } else { }
  //     })
  //   })

  //   function afterSubmit(data) {
  //     if (data.result === true) {
  //       afterRead(data.item)
  //     } else {
  //       $('.notify-icon').text(data.message).addClass('animating')
  //       $('.notify-icon').on('transitionend', (event) => {
  //         setTimeout(() => {
  //           $('.notify-icon').removeClass('animating')
  //         }, 5000)
  //       })
  //     }
  //   }
  // }
}


function handleCreate() {
  createButton.on('click', (event) => {
    event.preventDefault()
    $('.notify-icon').removeClass('animating')
    let dbData = {
      content: JSON.stringify(contentArea.val()),
      created: Date.now(),
      // password: $('#password-value').val(),
      expire: $('#expire-value').val()
    }
    // log('dbData', dbData)

    dbWrite(dbData).then((response) => {
      if (response.status === 1) {
        afterWrite(response)
      } else { /* todo */ }
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
      await render(route.id)
      break
  }
  $('#app').removeAttr('style')
})