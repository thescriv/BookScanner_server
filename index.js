const express = require('express')
const cors = require('cors')
const Nightmare = require('nightmare')

const app = express()
let stack = {}

app.use(cors())

app.get('/getBarcode/:id', async (req, res) => {
  const { id } = req.params

  console.log(`received ` + id)

  console.log(stack)

  if (process.env.URL_BOOK && !stack[id]) {

    try {

      stack[id] = await validOrNot(id)

    } catch (err) {
      throw err
    }
  }

  res.send({ body: stack[id] })
})

async function validOrNot(barcode) {
  const nightmare = Nightmare()

  try {
    console.log('going to page...')

    let bookValueInfo

    await nightmare
      .goto(process.env.URL_BOOK)
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
  stack = {}
}

var dayInMilliseconds = 1000 * 60 * 60 * 24
setInterval(revokeStack, dayInMilliseconds)

app.listen(process.env.PORT || '5000', () => {
  console.log('Listening...')
})
