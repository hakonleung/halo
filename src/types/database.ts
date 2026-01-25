import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import * as schema from '@/db/schema';

type Simplify<T> = { [K in keyof T]: T[K] } & {};

export interface Database {
  public: {
    Tables: {
      neolog_user_settings: {
        Row: Simplify<InferSelectModel<typeof schema.neologUserSettings>>;
        Insert: Simplify<InferInsertModel<typeof schema.neologUserSettings>>;
        Update: Simplify<Partial<InferInsertModel<typeof schema.neologUserSettings>>>;
        Relationships: [];
      };
      neolog_behavior_definitions: {
        Row: Simplify<InferSelectModel<typeof schema.neologBehaviorDefinitions>>;
        Insert: Simplify<InferInsertModel<typeof schema.neologBehaviorDefinitions>>;
        Update: Simplify<Partial<InferInsertModel<typeof schema.neologBehaviorDefinitions>>>;
        Relationships: [];
      };
      neolog_behavior_records: {
        Row: Simplify<InferSelectModel<typeof schema.neologBehaviorRecords>>;
        Insert: Simplify<InferInsertModel<typeof schema.neologBehaviorRecords>>;
        Update: Simplify<Partial<InferInsertModel<typeof schema.neologBehaviorRecords>>>;
        Relationships: [
          {
            foreignKeyName: "neolog_behavior_records_definition_id_neolog_behavior_definitions_id_fk";
            columns: ["definition_id"];
            referencedRelation: "neolog_behavior_definitions";
            referencedColumns: ["id"];
          }
        ];
      };
      neolog_goals: {
        Row: Simplify<InferSelectModel<typeof schema.neologGoals>>;
        Insert: Simplify<InferInsertModel<typeof schema.neologGoals>>;
        Update: Simplify<Partial<InferInsertModel<typeof schema.neologGoals>>>;
        Relationships: [];
      };
      neolog_notes: {
        Row: Simplify<InferSelectModel<typeof schema.neologNotes>>;
        Insert: Simplify<InferInsertModel<typeof schema.neologNotes>>;
        Update: Simplify<Partial<InferInsertModel<typeof schema.neologNotes>>>;
        Relationships: [];
      };
      neolog_conversations: {
        Row: Simplify<InferSelectModel<typeof schema.neologConversations>>;
        Insert: Simplify<InferInsertModel<typeof schema.neologConversations>>;
        Update: Simplify<Partial<InferInsertModel<typeof schema.neologConversations>>>;
        Relationships: [];
      };
      neolog_messages: {
        Row: Simplify<InferSelectModel<typeof schema.neologMessages>>;
        Insert: Simplify<InferInsertModel<typeof schema.neologMessages>>;
        Update: Simplify<Partial<InferInsertModel<typeof schema.neologMessages>>>;
        Relationships: [
          {
            foreignKeyName: "neolog_messages_conversation_id_neolog_conversations_id_fk";
            columns: ["conversation_id"];
            referencedRelation: "neolog_conversations";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      increment_behavior_usage: {
        Args: {
          def_id: string;
        };
        Returns: void;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
