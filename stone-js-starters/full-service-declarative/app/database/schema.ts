import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'

// User Table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  password: text('password'),
  avatar: text('avatar'),
  email: text('email').unique().notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdAt: integer('created_at').notNull() // Store timestamps as integers (Unix timestamp)
})

export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey(),
  ip: text('ip').notNull(),
  userAgent: text('user_agent'),
  closedAt: integer('closed_at'),
  uuid: text('uuid').unique().notNull(),
  createdAt: integer('created_at').notNull(),
  expiresAt: integer('expires_at').notNull(),
  lastActivityAt: integer('last_activity_at').notNull(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' })
})

// Post Table
export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  authorId: integer('author_id').notNull().references(() => users.id, { onDelete: 'cascade' })
})

// Comment Table
export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey(),
  content: text('content').notNull(),
  createdAt: integer('created_at').notNull(),
  authorId: integer('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  postId: integer('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' })
})
