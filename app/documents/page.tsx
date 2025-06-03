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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white text-black font-mono">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <Breadcrumb className="mb-8">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="flex items-center gap-2 hover:text-gray-700 transition-colors">
                  <HomeIcon className="w-4 h-4" />
                  Home
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-gray-700">Documents</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <main className="flex flex-col w-full">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">Document Library</h1>
                <p className="text-gray-600">
                  Manage and analyze your regulatory documents
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" asChild>
                  <Link href="/" className="flex items-center gap-2">
                    <FileTextIcon className="w-4 h-4" />
                    Upload New Document
                  </Link>
                </Button>
              </div>
            </div>
          </div>

            {documents.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileTextIcon className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">No documents found</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Upload your first PDF document to begin AI-powered analysis and quality control
                </p>
                <Button asChild className="bg-black text-white hover:bg-gray-800">
                  <Link href="/" className="flex items-center gap-2">
                    <FileTextIcon className="w-4 h-4" />
                    Upload Document
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-gray-600">
                    {documents.length} document{documents.length !== 1 ? 's' : ''} in your library
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {documents.map((doc) => (
                    <div key={doc.id} className="group bg-white border-2 border-gray-200 hover:border-black hover:shadow-lg transition-all duration-300 rounded-lg overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-gray-100 group-hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                            <FileTextIcon className="w-6 h-6 text-gray-700" />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
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
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <h3 className="font-semibold text-lg mb-2 truncate group-hover:text-gray-900 transition-colors">
                          {doc.name}
                        </h3>
                        <div className="text-sm text-gray-500 space-y-1">
                          <p className="flex items-center justify-between">
                            <span>Size:</span>
                            <span className="font-mono">{formatFileSize(doc.size)}</span>
                          </p>
                          <p className="flex items-center justify-between">
                            <span>Uploaded:</span>
                            <span className="font-mono">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
        </main>
      </div>
    </div>
  );
} 