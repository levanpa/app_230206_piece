import $ from 'jquery'

let log = console.log


export class Route {
  constructor() {
    let currentPage = ''
    let id = 0
  }

  async init() {
    let path = location.pathname
    let id
    this.currentPage = 'home'
    if (path && path != '/') {
      let paths = path.split('/')
      this.id = id = paths[2]
      this.currentPage = path = paths[1]
    }
    switch (path) {
      case '/':
        // log('home page')
        break
      default:
        await fetchPage(path).then(html => {
          $('#app').html(html)
        })
    }
  }
}

async function fetchPage(pageName) {
  let response = await fetch(`/src/${pageName}/index.html`)
  if (response.ok) {
    return response.text()
  } else {
    return (await fetch(`/src/404/index.html`)).text()
  }
}