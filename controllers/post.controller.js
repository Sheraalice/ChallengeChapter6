const {PrismaClient} = require ("@prisma/client")
const prisma = new PrismaClient()
const imagekit = require("../libs/imagekit")
const createPost = async (req,res,next) => {
    try {
        const {title, description} = req.body
        if (!req.file) return res.status(400).json({ success: false, message: 'Image is required', data: null });
        const image = req.file.buffer.toString("base64")
        const {url, fileId} =await imagekit.upload({
            file: image, 
            fileName: `${title}-${Date.now()}`,
            folder: "/challenge"
        })

        const post = await prisma.posts.create({
            data: {
                title,
                description,
                image: {
                  create: {
                    image_id: fileId,
                    url,
                  },
                },
              },
              include: {
                image: true,
              },
        })
        res.status(201).json({ success: true, message: 'Post created', data: post })
    } catch (error) {
        next(error)
    }
}

const getPosts = async (req,res,next) => {
  try { 
    const posts = await prisma.posts.findMany ({
      include: {
        image: true 
      }
    })
    res.status(200).json({ success: true, message: 'Posts Found', data: posts })
  } catch (error) {
    next(error)
  }
}

const getPostById = async (req,res,next) => {
  try { 
    const post = await prisma.posts.findFirst ({
      where: {
        id: Number (req.params.id)
      },
      include: {
        image: true 
      }
    })
    if (!post) return res.status(404).json({ success: false, message: 'Post not found', data: null });
    res.status(200).json({ success: true, message: 'Post Found', data: post })
  } catch (error) {
    next(error)
  }
}

const updatePost = async (req,res,next) => {
  try { 
    const {title, description} = req.body 
    const isPostExists = await prisma.posts.findFirst ({
      where: {
        id: Number (req.params.id)
      },
      include: {
        image: true 
      }
    })
    if (!isPostExists) return res.status(404).json({ success: false, message: 'Post not found', data: null });

    const post = await prisma.posts.update({
      where: {
        id: Number (req.params.id)
      },
      data: {title, description}
    })
    res.status(200).json({ success: true, message: 'Post Update', data: post })
  } catch (error) {
    next(error)
  }
}

const deletePost = async (req,res,next) => {
  try {
    const isPostExists = await prisma.posts.findFirst ({
      where: {
        id: Number (req.params.id)
      },
      include: {
        image: true 
      }
    })
    if (!isPostExists) return res.status(404).json({ success: false, message: 'Post not found', data: null });

    await imagekit.deleteFile(isPostExists.image.image_id)

    await prisma.images.delete({
      where: {
        post_id: Number (req.params.id)
      }
    })
    await prisma.posts.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.status(200).json({ success: true, message: 'Post Deleted'})
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createPost, getPostById, getPosts, updatePost, deletePost
}