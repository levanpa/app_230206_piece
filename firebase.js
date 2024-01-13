import { initializeApp } from 'firebase/app'
import { getDatabase, ref, get, set, child } from 'firebase/database'
import { md5 } from 'js-md5'
let log = console.log

const firebaseConfig = {
  databaseURL: "https://piece-0001-default-rtdb.asia-southeast1.firebasedatabase.app/",
}

const dbApp = initializeApp(firebaseConfig)
const db = getDatabase(dbApp)

async function dbRead(id) {
  return await get(child(ref(db), `pieces/${id}`))
}

async function dbWrite(data) {
  let id = md5(data.content)
  let returnData = {
    message: 'Saved successfully!',
    status: 1,
    id
  }

  await set(ref(db, `pieces/${id}`), {
    content: data.content,
    // password: data.password || '',
    expire: data.expire || 0,
    created: data.created || '',
  }).catch((error) => {
    returnData = {
      message: error.message,
      status: 0
    }
  })

  return returnData
}

export {
  dbRead,
  dbWrite
}