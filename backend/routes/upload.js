var express = require('express');
var router = express.Router();

const { writeFileSync } = require('fs');

const db = require('../models')

/* GET users listing. */
router.get('/', (req, res, next) => {
  res.json({
    type: 'success'
  });
});

router.post('/', async (req, res) => {

  try {
    if (!req.files.file)
      throw new Error('no file')
    const files = []

    async function addFile({ name, size, mimetype, mv }) {
      console.log(name, size, mimetype)
      const file = await db.test.findOrCreate({ where: { name }, defaults: { name, size, mimetype } })
      files.push(file[0])
      mv(`./uploads/${name}`);
    }

    if (Array.isArray(req.files.file))
      for (let i = 0; i < req.files.file.length; i++)
        await addFile(req.files.file[i])
    else
      await addFile(req.files.file)

    return res.json({
      type: 'success',
      data: { files }
    });
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      result: 'error',
      message: e.message
    });
  }
});

module.exports = router;
