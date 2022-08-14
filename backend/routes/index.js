var express = require('express');
var router = express.Router();

const db = require('../models')

const { unlinkSync, mkdirSync } = require('fs');

/* GET home page. */
router.get('/', function (req, res, next) {
  return res.json({
    data: {
      version: '0.0.1'
    },
    result: 'success',
    message: 'Welcome to the API'
  });
});

router.get('/files', async (req, res, next) => {
  try {
    const files = await db.test.findAll()
    res.json({
      data: {
        files
      },
      result: 'success'
    });
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      result: 'error',
      message: 'servor error'
    });
  }
});

router.post('/directory', async (req, res, next) => {
  try {
    const { name } = req.body
    const [test, created] = await db.test.findOrCreate({ where: { name }, defaults: { name, size: 0, mimetype: 'folder' } })

    if (created)
      mkdirSync(`./uploads/${name}`)

    res.json({
      data: {
        directory: test,
      },
      result: 'success'
    });
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      result: 'error',
      message: 'servor error'
    });
  }
});

router.get('/download/:id', async (req, res, next) => {

  try {
    if (req.params.id === 'undefined')
      throw new Error('coucou')

    const file = await db.test.findByPk(req.params.id)

    if (!file)
      return res.status(500).json({
        result: 'error',
        message: 'not found'
      });

    return res.download(`./uploads/${file.name}`, file.name);
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      result: 'error',
      message: e.message
    });
  }
});

router.delete('/file/:id', async (req, res, next) => {

  try {
    if (req.params.id === 'undefined')
      throw new Error('coucou')

    const file = await db.test.findByPk(req.params.id)

    if (!file)
      return res.status(500).json({
        result: 'error',
        message: 'not found'
      });

    file.destroy()

    unlinkSync(`./uploads/${file.name}`)

    return res.json({
      result: 'success',
      message: 'deleted'
    })
  } catch (e) {
    console.log(e)
    return res.status(500).json({
      result: 'error',
      message: e.message
    });
  }
});

module.exports = router;
