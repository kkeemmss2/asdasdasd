import { posts, type Post, type InsertPost } from "@shared/schema";
import { nanoid } from "nanoid";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, "../uploads");

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export interface IStorage {
  getAllPosts(sort?: 'latest' | 'oldest'): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: Omit<InsertPost, "imagePath">, imageData: Buffer, fileExtension: string): Promise<Post>;
  likePost(id: number): Promise<Post | undefined>;
  dislikePost(id: number): Promise<Post | undefined>;
}

export class MemStorage implements IStorage {
  private posts: Map<number, Post>;
  currentId: number;

  constructor() {
    this.posts = new Map();
    this.currentId = 1;
  }

  async getAllPosts(sort: 'latest' | 'oldest' = 'latest'): Promise<Post[]> {
    const allPosts = Array.from(this.posts.values());
    
    return sort === 'latest' 
      ? allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      : allPosts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async createPost(post: Omit<InsertPost, "imagePath">, imageData: Buffer, fileExtension: string): Promise<Post> {
    const id = this.currentId++;
    const filename = `${nanoid()}.${fileExtension}`;
    const imagePath = `/uploads/${filename}`;
    const filePath = path.join(UPLOADS_DIR, filename);
    
    // Save the image to the file system
    await fs.promises.writeFile(filePath, imageData);
    
    const newPost: Post = {
      id,
      title: post.title,
      description: post.description || '',
      imagePath,
      imageType: post.imageType,
      likes: 0,
      dislikes: 0,
      createdAt: new Date(),
    };
    
    this.posts.set(id, newPost);
    return newPost;
  }
  
  async likePost(id: number): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = {
      ...post,
      likes: post.likes + 1
    };
    
    this.posts.set(id, updatedPost);
    return updatedPost;
  }
  
  async dislikePost(id: number): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = {
      ...post,
      dislikes: post.dislikes + 1
    };
    
    this.posts.set(id, updatedPost);
    return updatedPost;
  }
}

export const storage = new MemStorage();
