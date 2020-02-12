require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const notesRouter = require('./controllers/blogs')


app.use(cors())
app.use(express.json())

app.use('/api/blogs', notesRouter)

module.exports = app