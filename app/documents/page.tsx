"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { DocumentStore, type Document } from "@/lib/document-store";
import { FileTextIcon, HomeIcon, TrashIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const docs = await DocumentStore.getDocuments();
        setDocuments(docs);
      } catch (error) {
        console.error('Error loading documents:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    setDeletingIds(prev => new Set(prev).add(documentId));

    try {
      const success = await DocumentStore.deleteDocument(documentId);
      if (success) {
        const updatedDocs = await DocumentStore.getDocuments();
        setDocuments(updatedDocs);
      } else {
        alert('Failed to delete document. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('An error occurred while deleting the document.');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen items-center bg-white text-black font-mono p-4 sm:p-8">
        <div className="w-full max-w-6xl">
          <div className="flex items-center justify-center h-64">
            <p className="text-lg">Loading documents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen items-center bg-white text-black font-mono p-4 sm:p-8">
      <div className="w-full max-w-6xl">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center gap-1">
                  <HomeIcon className="w-4 h-4" />
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Documents</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <main className="flex flex-col items-center w-full gap-6">
          <div className="w-full max-w-6xl">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-semibold">Your Documents</h1>
              <Button asChild>
                <Link href="/">Upload New Document</Link>
              </Button>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300">
                <FileTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No documents found</h3>
                <p className="text-gray-600 mb-6">Upload your first PDF to get started</p>
                <Button asChild>
                  <Link href="/">Upload Document</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="border border-black p-4 bg-white">
                    <div className="flex items-start justify-between mb-3">
                      <FileTextIcon className="w-6 h-6 text-gray-700 flex-shrink-0 mt-1" />
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <Link href={`/documents/${doc.id}`}>
                            <EyeOpenIcon className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteDocument(doc.id)}
                          disabled={deletingIds.has(doc.id)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <h3 className="font-medium text-sm mb-2 truncate">{doc.name}</h3>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>Size: {formatFileSize(doc.size)}</p>
                      <p>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 