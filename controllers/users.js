const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({})
        .populate('blogs', {title:1, author: 1})
    response.json(users.map(u => u.toJSON()))
  })

usersRouter.post('/', async (request, response) => {
  const body = request.body
  if(body.password && body.password.length > 2) {
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)
  
    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash,
    })
  
    const savedUser = await user.save()
  
    response.status(201).json(savedUser)
  } else {
    response.status(400).json({ error: 'Password missing or too short (minimum length 3 characters)!' })
  }
  
})

module.exports = usersRouter