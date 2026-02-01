import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  jsonb,
  integer,
  time,
  pgPolicy,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// User Settings Table
export const neologUserSettings = pgTable(
  'neolog_user_settings',
  {
    id: uuid('id').primaryKey().notNull(), // References auth.users
    updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),

    // Profile fields
    username: text('username').unique(),
    full_name: text('full_name'),
    avatar_url: text('avatar_url'),
    website: text('website'),

    // Appearance settings
    theme: text('theme', { enum: ['dark', 'light', 'system'] }).default('dark'),
    accent_color: text('accent_color').default('#00FF41'),
    animation_level: text('animation_level', { enum: ['full', 'reduced', 'none'] }).default('full'),
    font_size: text('font_size', { enum: ['small', 'medium', 'large', 'xlarge'] }).default(
      'medium',
    ),
    code_font: text('code_font').default('JetBrains Mono'),

    // Notification settings
    notifications_in_app: boolean('notifications_in_app').default(true),
    notifications_push: boolean('notifications_push').default(false),
    notifications_email: boolean('notifications_email').default(false),
    goal_reminder_enabled: boolean('goal_reminder_enabled').default(true),
    record_reminder_enabled: boolean('record_reminder_enabled').default(false),
    insights_enabled: boolean('insights_enabled').default(true),
    do_not_disturb_start: time('do_not_disturb_start'),
    do_not_disturb_end: time('do_not_disturb_end'),
    do_not_disturb_weekends: boolean('do_not_disturb_weekends').default(false),

    // Locale settings
    language: text('language', { enum: ['en', 'zh-CN', 'zh-TW'] }).default('en'),
    timezone: text('timezone').default('UTC'),
    date_format: text('date_format', { enum: ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY'] }).default(
      'YYYY-MM-DD',
    ),
    currency: text('currency').default('CNY'),

    // AI Settings
    ai_settings: jsonb('ai_settings').default({
      useDefaultKey: true,
      selectedProvider: 'openai',
      selectedModel: 'gpt-4o',
      temperature: 0.7,
      streamEnabled: true,
      customKeys: [],
    }),
  },
  () => {
    return [
      pgPolicy('Public user settings are viewable by everyone.', {
        for: 'select',
        using: sql`true`,
      }),
      pgPolicy('Users can insert their own settings.', {
        for: 'insert',
        withCheck: sql`auth.uid() = id`,
      }),
      pgPolicy('Users can update their own settings.', {
        for: 'update',
        using: sql`auth.uid() = id`,
      }),
    ];
  },
);

// Behavior Definitions Table
export const neologBehaviorDefinitions = pgTable(
  'neolog_behavior_definitions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id'), // References auth.users
    name: text('name').notNull(),
    category: text('category', {
      enum: ['health', 'expense', 'income', 'habit', 'other'],
    }).notNull(),
    icon: text('icon'),
    metadata_schema: jsonb('metadata_schema').notNull().default([]),
    usage_count: integer('usage_count').default(0),
    created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  },
  () => {
    return [
      pgPolicy('System definitions are viewable by everyone.', {
        for: 'select',
        using: sql`user_id is null`,
      }),
      pgPolicy('Users can view their own definitions.', {
        for: 'select',
        using: sql`auth.uid() = user_id`,
      }),
      pgPolicy('Users can insert their own definitions.', {
        for: 'insert',
        withCheck: sql`auth.uid() = user_id`,
      }),
      pgPolicy('Users can update their own definitions.', {
        for: 'update',
        using: sql`auth.uid() = user_id`,
      }),
      pgPolicy('Users can delete their own definitions.', {
        for: 'delete',
        using: sql`auth.uid() = user_id`,
      }),
    ];
  },
);

// Behavior Records Table
export const neologBehaviorRecords = pgTable(
  'neolog_behavior_records',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').notNull(), // References auth.users
    definition_id: uuid('definition_id')
      .references(() => neologBehaviorDefinitions.id, { onDelete: 'cascade' })
      .notNull(),
    recorded_at: timestamp('recorded_at', { withTimezone: true, mode: 'string' })
      .defaultNow()
      .notNull(),
    metadata: jsonb('metadata').notNull().default({}),
    note: text('note'),
    created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  },
  () => {
    return [
      pgPolicy('Users can view their own records.', {
        for: 'select',
        using: sql`auth.uid() = user_id`,
      }),
      pgPolicy('Users can insert their own records.', {
        for: 'insert',
        withCheck: sql`auth.uid() = user_id`,
      }),
      pgPolicy('Users can update their own records.', {
        for: 'update',
        using: sql`auth.uid() = user_id`,
      }),
      pgPolicy('Users can delete their own records.', {
        for: 'delete',
        using: sql`auth.uid() = user_id`,
      }),
    ];
  },
);

// Goals Table
export const neologGoals = pgTable(
  'neolog_goals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').notNull(), // References auth.users
    name: text('name').notNull(),
    description: text('description'),
    category: text('category').notNull(),
    start_date: timestamp('start_date', { withTimezone: true, mode: 'string' }).notNull(),
    end_date: timestamp('end_date', { withTimezone: true, mode: 'string' }),
    criteria: jsonb('criteria').notNull().default([]),
    status: text('status', { enum: ['active', 'completed', 'abandoned'] }).default('active'),
    created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  },
  () => {
    return [
      pgPolicy('Users can view their own goals.', {
        for: 'select',
        using: sql`auth.uid() = user_id`,
      }),
      pgPolicy('Users can insert their own goals.', {
        for: 'insert',
        withCheck: sql`auth.uid() = user_id`,
      }),
      pgPolicy('Users can update their own goals.', {
        for: 'update',
        using: sql`auth.uid() = user_id`,
      }),
      pgPolicy('Users can delete their own goals.', {
        for: 'delete',
        using: sql`auth.uid() = user_id`,
      }),
    ];
  },
);

// Notes Table
export const neologNotes = pgTable(
  'neolog_notes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').notNull(), // References auth.users
    title: text('title'),
    content: text('content').notNull(),
    tags: text('tags').array().default([]),
    created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  },
  () => {
    return [
      pgPolicy('Users can view their own notes.', {
        for: 'select',
        using: sql`auth.uid() = user_id`,
      }),
      pgPolicy('Users can insert their own notes.', {
        for: 'insert',
        withCheck: sql`auth.uid() = user_id`,
      }),
      pgPolicy('Users can update their own notes.', {
        for: 'update',
        using: sql`auth.uid() = user_id`,
      }),
      pgPolicy('Users can delete their own notes.', {
        for: 'delete',
        using: sql`auth.uid() = user_id`,
      }),
    ];
  },
);

// Conversations Table
export const neologConversations = pgTable(
  'neolog_conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    user_id: uuid('user_id').notNull(), // References auth.users
    title: text('title'),
    created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  },
  () => {
    return [
      pgPolicy('Users can view their own conversations.', {
        for: 'select',
        using: sql`auth.uid() = user_id`,
      }),
      pgPolicy('Users can insert their own conversations.', {
        for: 'insert',
        withCheck: sql`auth.uid() = user_id`,
      }),
      pgPolicy('Users can update their own conversations.', {
        for: 'update',
        using: sql`auth.uid() = user_id`,
      }),
      pgPolicy('Users can delete their own conversations.', {
        for: 'delete',
        using: sql`auth.uid() = user_id`,
      }),
    ];
  },
);

// Messages Table
export const neologMessages = pgTable(
  'neolog_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversation_id: uuid('conversation_id')
      .references(() => neologConversations.id, { onDelete: 'cascade' })
      .notNull(),
    user_id: uuid('user_id').notNull(), // References auth.users
    role: text('role', { enum: ['user', 'assistant', 'system'] }).notNull(),
    content: text('content').notNull(),
    attachments: jsonb('attachments').default([]),
    metadata: jsonb('metadata').default({}),
    created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow(),
  },
  () => {
    return [
      pgPolicy('Users can view their own messages.', {
        for: 'select',
        using: sql`auth.uid() = user_id`,
      }),
      pgPolicy('Users can insert their own messages.', {
        for: 'insert',
        withCheck: sql`auth.uid() = user_id`,
      }),
    ];
  },
);
