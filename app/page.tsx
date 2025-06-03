"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UploadDropzone } from "@/lib/uploadthing";
import { DocumentStore, type Document, type UploadResponse } from "@/lib/document-store";
import { FileTextIcon, ListBulletIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import BackgroundPattern from "@/components/ui/background-pattern";

export default function Home() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleUploadComplete = async (res: UploadResponse[]) => {
    if (res?.[0]?.serverData?.document) {
      const newDocument = res[0].serverData.document;
      try {
        await DocumentStore.addDocument(newDocument);
        // Redirect to the newly uploaded document
        router.push(`/documents/${newDocument.id}`);
      } catch (error) {
        console.error('Error storing document:', error);
      }
    }
  };

  const handleUploadError = (error: Error) => {
    alert(`Upload failed: ${error.message}`);
  };  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white text-black font-mono page-transition relative">
      <BackgroundPattern className="z-0" />
      {/* Hero Section */}
      <section className="w-full flex flex-col items-center px-4 sm:px-8 pt-16 pb-20 relative z-10">
        <div className="w-full max-w-6xl flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-6">
            <Badge variant="outline" className="border-black text-xs px-6 py-2 tracking-widest uppercase bg-white shadow-lg hover:shadow-xl transition-all duration-300 animate-glow">
              For Pharma & Biotech
            </Badge>
            <div className="text-center">
              <div className="flex items-center justify-center gap-8 mb-6">
                <h1 className="text-7xl sm:text-8xl font-bold tracking-tight">
                  <span className="gradient-text">
                    CurigenX
                  </span>
                </h1>
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 animate-float">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 rounded-full opacity-60 animate-pulse"></div>
                  <div className="absolute inset-1 bg-gradient-to-br from-white to-gray-100 rounded-full"></div>
                  <img src="/globe.svg" alt="Technical Globe" className="relative w-full h-full object-contain opacity-90 z-10" />
                  <span className="sr-only">Technical globe accent</span>
                </div>
              </div>
              <div className="w-32 h-1.5 bg-gradient-to-r from-black to-gray-700 mx-auto mb-8 rounded-full shimmer"></div>
            </div>
            <div className="max-w-6xl text-center space-y-4">
              <p className="text-2xl sm:text-3xl text-gray-800 leading-relaxed font-medium">
                SaaS for regulatory, clinical, and medical writing teams.
              </p>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                Automate and streamline QC of Clinical Study Reports (CSRs) for regulatory dossier accuracy, consistency, and scientific integrity.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="flex flex-col items-center w-full px-4 sm:px-8 pb-20 relative z-10">
        <div className="w-full max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Upload Section */}
            <Card className="border-2 border-black shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 card-enhanced">
              <CardContent className="p-10">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-3 flex items-center gap-4">
                    <div className="p-3 bg-black text-white rounded-lg shadow-lg animate-glow">
                      <FileTextIcon className="w-7 h-7" />
                    </div>
                    Upload New Document
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Upload PDF files for AI-powered analysis and quality control review
                  </p>
                </div>
                <UploadDropzone
                  endpoint="pdfUploader"
                  onClientUploadComplete={handleUploadComplete}
                  onUploadError={handleUploadError}
                  appearance={{
                    container: "border-3 border-dashed border-gray-400 bg-gradient-to-br from-gray-50 to-white font-mono rounded-xl hover:border-black hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-50 transition-all duration-300 min-h-[200px]",
                    uploadIcon: "text-gray-600 mb-4",
                    label: "text-lg text-gray-800 font-semibold mb-2 tracking-wide",
                    allowedContent: "text-sm text-gray-600 mb-6",
                    button: "bg-black text-white border-black font-mono text-base font-semibold px-10 py-4 rounded-lg hover:bg-gray-800 hover:shadow-xl transition-all duration-300 transform hover:scale-105 btn-enhanced tracking-wide uppercase"
                  }}
                  content={{
                    label: ({ ready }) => (
                      <div className="text-center">
                        {ready ? "Drop PDF files here or click to browse" : "Getting ready..."}
                      </div>
                    ),
                    allowedContent: ({ ready, fileTypes, isUploading }) => {
                      if (!ready) return "Preparing uploader...";
                      if (isUploading) return "Uploading...";
                      return `Supported: ${fileTypes.join(", ")} • Max 16MB`;
                    },
                    button: ({ ready, isUploading }) => {
                      if (isUploading) return "Uploading...";
                      if (ready) return "Choose PDF";
                      return "Loading...";
                    }
                  }}
                />
              </CardContent>
            </Card>
            
            {/* Recent Documents Section */}
            <Card className="border-2 border-black shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 card-enhanced">
              <CardContent className="p-10">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-3 flex items-center gap-4">
                    <div className="p-3 bg-black text-white rounded-lg shadow-lg animate-glow">
                      <ListBulletIcon className="w-7 h-7" />
                    </div>
                    Recent Documents
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    Quick access to your recently uploaded files and analysis results
                  </p>
                </div>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="relative loading-enhanced">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-black"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 bg-black rounded-full animate-pulse"></div>
                      </div>
                    </div>
                    <span className="ml-4 text-gray-700 text-lg">Loading documents...</span>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <FileTextIcon className="w-10 h-10 text-gray-500" />
                    </div>
                    <p className="text-gray-700 text-lg mb-2 font-semibold">No documents uploaded yet</p>
                    <p className="text-gray-500 text-base">Upload your first PDF to get started with analysis</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-gray-800 font-semibold text-lg">
                        {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
                      </p>
                      <Button variant="outline" size="lg" asChild className="border-2 border-black hover:bg-black hover:text-white transition-all duration-300 btn-enhanced">
                        <Link href="/documents" className="text-sm font-semibold">View All →</Link>
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {documents.slice(0, 3).map((doc) => (
                        <Link
                          key={doc.id}
                          href={`/documents/${doc.id}`}
                          className="block border-2 border-gray-200 p-6 bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-white hover:border-black hover:shadow-lg transition-all duration-300 rounded-xl group transform hover:scale-[1.02] focus-enhanced"
                        >
                          <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center group-hover:from-black group-hover:to-gray-800 transition-all duration-300 shadow-lg">
                              <FileTextIcon className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors duration-300" />
                            </div>
                            <h4 className="font-bold text-lg truncate flex-1 group-hover:text-black transition-colors">{doc.name}</h4>
                          </div>
                          <p className="text-gray-600 ml-16 group-hover:text-gray-700 transition-colors">
                            Uploaded: {new Date(doc.uploadedAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Enhanced Footer */}
      <footer className="w-full bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200 py-12 px-4 sm:px-8 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-6">
            <div className="space-y-3">
              <p className="text-lg text-gray-800 font-bold font-mono">
                Ensuring scientific integrity & regulatory accuracy for every submission.
              </p>
              <div className="flex items-center justify-center gap-4 text-base text-gray-600 font-medium">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Powered by AI
                </span>
                <span className="text-gray-400">•</span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Built for Compliance
                </span>
                <span className="text-gray-400">•</span>
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  Trusted by Pharma
                </span>
              </div>
            </div>
            <div className="pt-6 border-t border-gray-300">
              <p className="text-sm text-gray-500 font-mono">
                © 2025 CurigenX. Advanced regulatory document analysis platform.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
