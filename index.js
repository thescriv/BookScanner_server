const express = require('express')
const cors = require('cors')
const Nightmare = require('nightmare')

const app = express()
let stack = {}

const port = process.env.PORT || '5000'

app.use(cors())

app.get('/getBarcode/:id', async (req, res) => {
  console.log('got a request')

  const { id } = req.params

  console.log(`received ` + id)

  console.log(stack)

  if (!stack[id]) {
    try {
      stack[id] = await validOrNot(id)
    } catch (err) {
      throw err
    }
  }

  res.send({ book_value: stack[id] })
})

async function validOrNot(barcode) {
  const nightmare = Nightmare()

  try {
    console.log('going to page...')

    let bookValueInfo

    await nightmare
      .goto(`https://www.gibert.com/sao`)
      .evaluate((barcode) => {
        document.querySelectorAll('.input-text')[1].value = barcode
      }, barcode)
      .click('#add_sao')
      .wait()
      .evaluate(() => {
        const bookList = document.querySelector('#product_list')

        return bookList ? bookList.innerText : null
      })
      .end()
      .then((res) => {
        bookValueInfo = res
      })

    const bookValue =
      bookValueInfo?.split('\n')[3] || `le livre n'est pas reconu`

    return bookValue
  } catch (err) {
    throw err
  } 
}

function revokeStack() {
  console.log('cleaning stack...')
  stack = {}
}

var dayInMilliseconds = 1000 * 60 * 60 * 24
setInterval(revokeStack, dayInMilliseconds)

app.listen(port, () => {
  console.log('Listening...')
})
