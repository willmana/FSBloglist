const blogsRouter = require('express').Router()
const Blog = require('./../models/blog')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({})
    response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.post('/', async (request, response) => {
    const body = request.body
    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes === undefined ? 0 : body.likes
    })
    const savedBlog = await blog.save()
    response.json(savedBlog.toJSON())
})

blogsRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
        response.json(blog.toJSON())
    } else {
        response.status(404).end()
    }
})

blogsRouter.put('/:id', async (request, response) => {
    const blog1 = await Blog.findById(request.params.id)
    const body = request.body
    const blog2 = {
        title: body.title || blog1.title,
        author: body.author || blog1.author,
        url: body.url || blog1.url,
        likes: body.likes || 0
    }
    const update = await Blog.findByIdAndUpdate(request.params.id, blog2, {new: true})
    response.json(update.toJSON())

})

blogsRouter.delete('/:id', async (request, response) => {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
})

module.exports = blogsRouter