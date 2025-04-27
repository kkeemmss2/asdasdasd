import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { insertPostSchema } from "@shared/schema";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, "../uploads");

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      return callback(new Error('Only JPEG, PNG and GIF images are allowed'));
    }
    callback(null, true);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from uploads directory
  app.use('/uploads', express.static(UPLOADS_DIR));

  // Get all posts
  app.get('/api/posts', async (req: Request, res: Response) => {
    try {
      const sort = req.query.sort === 'oldest' ? 'oldest' : 'latest';
      const posts = await storage.getAllPosts(sort);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch posts' });
    }
  });

  // Get a specific post
  app.get('/api/posts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }
      
      const post = await storage.getPost(id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch post' });
    }
  });

  // Create a new post
  app.post('/api/posts', upload.single('image'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded' });
      }

      const { title, description } = req.body;
      
      // Validate input
      const postData = insertPostSchema.omit({ imagePath: true }).parse({
        title,
        description: description || '',
        imageType: req.file.mimetype,
      });

      // Get file extension from mimetype
      const fileExt = req.file.mimetype.split('/')[1];
      
      // Create post in storage
      const post = await storage.createPost(
        postData,
        req.file.buffer,
        fileExt
      );
      
      res.status(201).json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: 'Invalid post data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create post' });
    }
  });
  
  // Like a post
  app.post('/api/posts/:id/like', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }
      
      const post = await storage.likePost(id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: 'Failed to like post' });
    }
  });
  
  // Dislike a post
  app.post('/api/posts/:id/dislike', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid post ID' });
      }
      
      const post = await storage.dislikePost(id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: 'Failed to dislike post' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import express from "express";
