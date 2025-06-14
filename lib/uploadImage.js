const fetch = require('node-fetch')
const FormData = require('form-data')
const { fromBuffer } = require('file-type')

/**
 * Upload image to telegra.ph
 * Supported mimetype:
 * - image/jpeg
 * - image/jpg
 * - image/png
 * 
 * @param {Buffer} buffer Image Buffer
 * @returns {Promise<string>}
 * 
 * @author GiftedDave
 * @bot Dave-Md-V1
 * @github https://github.com/gifteddaves
 */
module.exports = async buffer => {
  const { ext } = await fromBuffer(buffer)
  let form = new FormData
  form.append('file', buffer, 'tmp.' + ext)
  let res = await fetch('https://telegra.ph/upload', {
    method: 'POST',
    body: form
  })
  let img = await res.json()
  if (img.error) throw img.error
  return 'https://telegra.ph' + img[0].src
}