const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    if (blogs.length === 0) {
        return 0
    } else {
        const reducer = (sum, item) => {
            return sum + item.likes
        }
        return blogs.reduce(reducer, 0)
    }
}

const favoriteBlog = (blogs) => {
    let max = 0
    let mostLiked = {
        _id: '',
        title: '',
        author: '',
        url: '',
        likes: 0,
        __v: 0
    }
    blogs.forEach(blog => {
        if (blog.likes > max) {
            max = blog.likes
            mostLiked = blog
        }
    });
    
    return ({
        title: mostLiked.title,
        author: mostLiked.author,
        likes: mostLiked.likes
    })
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) return null
    const _ = require('lodash')

    const blogsByAuthors = _.groupBy(blogs, 'author')
    const authorList = []
    _.each(blogsByAuthors, (value, key) => {
        const author = {
            author: key,
            blogs: Object.keys(value).length
        }
        authorList.push(author)
    })

    authorList.sort((a,b) => b.blogs - a.blogs)
    const manyBlogs = authorList.shift()

    return manyBlogs
}

const mostLikes = (blogs) => {
    if(blogs.length === 0) return null
    const _ = require('lodash')

    const blogsByAuthors = _.groupBy(blogs, 'author')
    const authorList = []
    _.each(blogsByAuthors, (value, key) => {
        const likes = _.sumBy(value, 'likes')
        const author = {
            author: key,
            likes: likes
        }
        authorList.push(author)
    })

    authorList.sort((a,b) => b.likes - a.likes)
    const manyLikes = authorList.shift()

    return manyLikes
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}