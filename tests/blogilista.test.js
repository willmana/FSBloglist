const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')


describe('looking at blogs', () => {

    beforeEach(async () => {
        await Blog.deleteMany({})
        await Blog.insertMany(helper.initialBlogs)
    })

    test('returns a correct amount of blogs in json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const response = await api.get('/api/blogs')
        expect(response.body.length).toBe(helper.initialBlogs.length)
    })

    test('has field "id"', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToView = blogsAtStart[0]
        const resultBlog = await api
            .get(`/api/blogs/${blogToView.id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)
        expect(resultBlog.body.id).toBeDefined()
    })
})

describe('adding new blogs', () => {
    test('gives status code 401 without token', async () => {
        const newBlog = {
            title: "Very important blog",
            author: "Creator",
            url: "www.google.com",
            likes: 4
        }

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
            .expect('Content-Type', /application\/json/)
    })
    test('a valid blog can be added', async () => {
        await User.deleteMany({})
        const newUser = { username: 'testname', password: 'password' }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)

        const loginCredits = {
            username: newUser.username,
            password: newUser.password
        }
        const login = await api
            .post('/api/login')
            .send(loginCredits)
            .expect(200)

        const token = login.body.token

        const newBlog = {
            title: "Very important blog",
            author: "Creator",
            url: "www.google.com",
            likes: 4
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd.length).toBe(helper.initialBlogs.length + 1)

        const titles = blogsAtEnd.map(t => t.title)
        expect(titles).toContain('Very important blog')
    })

    test('"likes" is generated', async () => {
        await Blog.deleteMany({})
        await User.deleteMany({})
        const newUser = { username: 'testname', password: 'password' }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)

        const loginCredits = {
            username: newUser.username,
            password: newUser.password
        }
        const login = await api
            .post('/api/login')
            .send(loginCredits)
            .expect(200)

        const token = login.body.token

        const newBlog = {
            title: "Very important blog",
            author: "Creator",
            url: "www.google.com"
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd[0].likes).toBe(0)
    })

    test('blog needs title and url', async () => {
        await Blog.deleteMany({})
        await User.deleteMany({})
        const newUser = { username: 'testname', password: 'password' }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)

        const loginCredits = {
            username: newUser.username,
            password: newUser.password
        }
        const login = await api
            .post('/api/login')
            .send(loginCredits)
            .expect(200)

        const token = login.body.token

        const newBlog = {
            url: "www.google.com"
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(400)
            .expect('Content-Type', /application\/json/)

    })

})

describe('deletion of a blog', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
        await Blog.insertMany(helper.initialBlogs)
    })
    test('succeeds with status code 204 if id is valid', async () => {
        await User.deleteMany({})
        const newUser = { username: 'testname', password: 'password' }
        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)

        const loginCredits = {
            username: newUser.username,
            password: newUser.password
        }
        const login = await api
            .post('/api/login')
            .send(loginCredits)
            .expect(200)

        const token = login.body.token

        const newBlog = {
            title: "Very important blog",
            author: "Creator",
            url: "www.google.com",
            likes: 4
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAfterAdd = await helper.blogsInDb()
        expect(blogsAfterAdd.length).toBe(helper.initialBlogs.length + 1)

        const blogToDelete = blogsAfterAdd.find(blog => blog.title === newBlog.title)

        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd.length).toBe(
            blogsAfterAdd.length - 1
        )

        const titles = blogsAtEnd.map(r => r.titles)

        expect(titles).not.toContain(blogToDelete.title)
    })
})

describe('users', () => {
    beforeEach(async () => {
        await User.deleteMany({})
        const user = new User({ username: 'root', name: "Juuri Henkilö", password: 'sekret' })
        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd.length).toBe(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })
    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('`username` to be unique')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd.length).toBe(usersAtStart.length)
    })
    test('creation fails with proper statuscode and message if password is too short', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'rooter',
            name: 'Superuser',
            password: 'sa',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('Password missing or too short')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd.length).toBe(usersAtStart.length)
    })
})

afterAll(() => {
    mongoose.connection.close()
})