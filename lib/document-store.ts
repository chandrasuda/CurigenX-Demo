import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export interface Document {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt: string;
  userId: string;
  analysis?: {
    pageCount?: number;
    tableOfContents?: Array<{
      page: number;
      title: string;
      keywords: string[];
    }>;
  };
}

export interface UploadResponse {
  serverData: {
    document: Document;
  };
}

interface DocumentDB extends DBSchema {
  documents: {
    key: string;
    value: Document;
  };
}

const DB_NAME = 'pdf-indexer-db';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

class DocumentStoreClass {
  private db: IDBPDatabase<DocumentDB> | null = null;

  private async getDB(): Promise<IDBPDatabase<DocumentDB>> {
    if (!this.db) {
      this.db = await openDB<DocumentDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        },
      });
    }
    return this.db;
  }

  async getDocuments(): Promise<Document[]> {
    try {
      const db = await this.getDB();
      return await db.getAll(STORE_NAME);
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  }

  async addDocument(document: Document): Promise<void> {
    try {
      const db = await this.getDB();
      await db.put(STORE_NAME, document);
    } catch (error) {
      console.error('Error adding document:', error);
    }
  }

  async getDocument(id: string): Promise<Document | null> {
    try {
      const db = await this.getDB();
      const document = await db.get(STORE_NAME, id);
      return document || null;
    } catch (error) {
      console.error('Error fetching document:', error);
      return null;
    }
  }

  async updateDocumentAnalysis(id: string, analysis: Document['analysis']): Promise<void> {
    try {
      const db = await this.getDB();
      const document = await db.get(STORE_NAME, id);
      if (document) {
        document.analysis = analysis;
        await db.put(STORE_NAME, document);
      }
    } catch (error) {
      console.error('Error updating document analysis:', error);
    }
  }

  async deleteDocument(id: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      const document = await db.get(STORE_NAME, id);
      
      if (document) {
        // Delete from UploadThing first
        const response = await fetch('/api/delete-file', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileKey: document.id }),
        });

        if (!response.ok) {
          console.error('Failed to delete file from UploadThing');
          return false;
        }

        // Delete from IndexedDB
        await db.delete(STORE_NAME, id);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  }
}

export const DocumentStore = new DocumentStoreClass(); 