import { useEffect, useState, useRef } from "react"
import { supabase } from "../../config/supabase.js"
import { useAuth } from "../../context/AuthContext"

interface MediaAsset {
  id: string
  file_name: string
  storage_path: string
  bucket_name: string
  file_type: string | null
  file_size: number
  title: string
  alt_text: string
  is_public: boolean
  width: number | null
  height: number | null
  thumbnail_url: string | null
  created_at: string
  updated_at: string
  uploaded_by: string | null
}

interface UploadProgress {
  file: File
  progress: number
  error?: string
}

export default function MediaLibraryPage() {
  const { adminUser } = useAuth()
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<UploadProgress[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [folder, setFolder] = useState("uploads")
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const folders = [
    "uploads",
    "hero",
    "gallery",
    "packages",
    "addons",
    "team",
    "projects",
    "blog",
    "misc",
  ]

  useEffect(() => {
    fetchAssets()
  }, [folder, search])

  const fetchAssets = async () => {
    try {
      let query = supabase
        .from("media_assets")
        .select("*")
        .eq("bucket_name", "site-media")
        .order("created_at", { ascending: false })

      if (search) {
        query = query.or(
          `file_name.ilike.%${search}%,alt_text.ilike.%${search}%,title.ilike.%${search}%`,
        )
      }

      const { data, error } = await query
      if (error) throw error
      setAssets(data || [])
    } catch (error) {
      console.error("Error fetching media assets:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (files: FileList) => {
    const newUploads: UploadProgress[] = Array.from(files).map((file) => ({
      file,
      progress: 0,
    }))
    setUploading((prev) => [...prev, ...newUploads])
    uploadFiles(newUploads)
  }

  const uploadFiles = async (uploads: UploadProgress[]) => {
    for (const upload of uploads) {
      try {
        // Update progress to show starting
        setUploading((prev) =>
          prev.map((u) =>
            u.file === upload.file ? { ...u, progress: 10 } : u,
          ),
        )

        // Generate unique filename
        const timestamp = Date.now()
        const ext = upload.file.name.split(".").pop()
        const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`
        const storagePath = `${folder}/${filename}`

        // Upload to Supabase Storage (site-media bucket)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("site-media")
          .upload(storagePath, upload.file, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) throw uploadError

        setUploading((prev) =>
          prev.map((u) =>
            u.file === upload.file ? { ...u, progress: 60 } : u,
          ),
        )

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("site-media").getPublicUrl(storagePath)

        // Get image dimensions if it's an image
        let width: number | null = null
        let height: number | null = null
        if (upload.file.type.startsWith("image/")) {
          const img = new Image()
          await new Promise<void>((resolve, reject) => {
            img.onload = () => {
              width = img.width
              height = img.height
              resolve()
            }
            img.onerror = reject
            img.src = publicUrl
          })
        }

        // Create database record
        const { error: dbError } = await supabase.from("media_assets").insert([
          {
            file_name: filename,
            storage_path: storagePath,
            bucket_name: "site-media",
            file_type: upload.file.type,
            file_size: upload.file.size,
            title: upload.file.name,
            alt_text: "",
            is_public: true,
            width,
            height,
            uploaded_by: adminUser?.id,
          },
        ])

        if (dbError) throw dbError

        setUploading((prev) =>
          prev.map((u) =>
            u.file === upload.file ? { ...u, progress: 100 } : u,
          ),
        )

        // Refresh assets list
        fetchAssets()
      } catch (error: any) {
        setUploading((prev) =>
          prev.map((u) =>
            u.file === upload.file
              ? { ...u, progress: 100, error: error.message }
              : u,
          ),
        )
      }
    }

    // Clear completed uploads after delay
    setTimeout(() => {
      setUploading((prev) => prev.filter((u) => u.progress < 100))
    }, 3000)
  }

  const handleAssetUpdate = async (
    asset: MediaAsset,
    updates: Partial<MediaAsset>,
  ) => {
    try {
      const { error } = await supabase
        .from("media_assets")
        .update(updates)
        .eq("id", asset.id)
      if (error) throw error

      setAssets((prev) =>
        prev.map((a) => (a.id === asset.id ? { ...a, ...updates } : a)),
      )
    } catch (error) {
      console.error("Error updating asset:", error)
      alert("Failed to update asset")
    }
  }

  const handleDeleteAsset = async (asset: MediaAsset) => {
    if (!confirm(`Delete "${asset.title}"? This cannot be undone.`)) return

    try {
      // Delete from storage
      const path = asset.storage_path
      await supabase.storage.from("site-media").remove([path])

      // Delete from database
      const { error } = await supabase
        .from("media_assets")
        .delete()
        .eq("id", asset.id)
      if (error) throw error

      setAssets((prev) => prev.filter((a) => a.id !== asset.id))
      setSelectedAssets((prev) => prev.filter((id) => id !== asset.id))
    } catch (error) {
      console.error("Error deleting asset:", error)
      alert("Failed to delete asset")
    }
  }

  const handleBulkDelete = async () => {
    if (selectedAssets.length === 0) return
    if (
      !confirm(
        `Delete ${selectedAssets.length} selected assets? This cannot be undone.`,
      )
    )
      return

    try {
      const assetsToDelete = assets.filter((a) => selectedAssets.includes(a.id))
      const paths = assetsToDelete.map((a) => a.storage_path)

      await supabase.storage.from("site-media").remove(paths)
      await supabase.from("media_assets").delete().in("id", selectedAssets)

      setAssets((prev) => prev.filter((a) => !selectedAssets.includes(a.id)))
      setSelectedAssets([])
    } catch (error) {
      console.error("Error bulk deleting:", error)
      alert("Failed to delete assets")
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    )
  }

  const selectAll = () => {
    setSelectedAssets(assets.map((a) => a.id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const isImage = (mimeType: string | null) =>
    mimeType?.startsWith("image/") ?? false

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-gray-600 mt-1">
            Manage images and files for your website
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
            className="hidden"
          />
        </div>
      </div>

      {/* Folder Tabs & Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
          <div className="flex gap-1 overflow-x-auto pb-2">
            {folders.map((f) => (
              <button
                key={f}
                onClick={() => setFolder(f)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  folder === f
                    ? "bg-primary-100 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
            />
          </div>
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition-colors ${
                viewMode === "grid" ? "bg-white shadow-sm" : ""
              }`}
              title="Grid view"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded transition-colors ${
                viewMode === "list" ? "bg-white shadow-sm" : ""
              }`}
              title="List view"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Upload Progress */}
        {uploading.length > 0 && (
          <div className="border-t border-gray-200 pt-4 mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Uploading...
            </h3>
            <div className="space-y-2">
              {uploading.map((upload, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    {isImage(upload.file.type) ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-gray-500"
                      >
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <path d="M8 21l4-4 4 4 4-4 4 4" />
                      </svg>
                    ) : (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="text-gray-500"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {upload.file.name}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div
                        className="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">
                    {upload.progress}%
                  </span>
                  {upload.error && (
                    <span className="text-sm text-red-500">Failed</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assets Grid/List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {selectedAssets.length > 0 && (
            <div className="px-4 py-3 bg-blue-50 border-b border-gray-200 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {selectedAssets.length} selected
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={selectAll}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  {selectedAssets.length === assets.length
                    ? "Deselect all"
                    : "Select all"}
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 bg-red-50 rounded-lg"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading media...</p>
            </div>
          ) : assets.length === 0 ? (
            <div className="p-12 text-center">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="mx-auto text-gray-300 mb-4"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21l4-4 4 4 4-4 4 4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                No files in this folder
              </h3>
              <p className="text-gray-500 mb-4">
                Upload files or select a different folder
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Upload Files
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className={`relative group rounded-xl border transition-all ${
                      selectedAssets.includes(asset.id)
                        ? "border-primary-500 bg-primary-50 ring-2 ring-primary-500/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAssets.includes(asset.id)}
                      onChange={() => toggleSelect(asset.id)}
                      className="absolute top-2 left-2 z-10 w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div className="aspect-square relative overflow-hidden bg-gray-100">
                      {isImage(asset.file_type) ? (
                        <img
                          src={asset.thumbnail_url ?? asset.storage_path}
                          alt={asset.alt_text || asset.file_name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="text-gray-400"
                          >
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        </div>
                      )}
                      {!asset.is_public && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="px-2 py-1 text-xs text-white bg-red-600 rounded">
                            Private
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 min-h-[72px]">
                      <p className="text-xs font-medium text-gray-900 truncate title={asset.file_name}">
                        {asset.file_name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(asset.file_size)} •{" "}
                        {formatDate(asset.created_at)}
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-t-transparent bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(
                              asset.bucket_name === "site-media"
                                ? `${window.location.origin}/storage/v1/object/public/site-media/${asset.storage_path}`
                                : asset.storage_path,
                            )
                          }}
                          className="p-1.5 bg-white/90 rounded hover:bg-white text-gray-700"
                          title="Copy URL"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect x="9" y="9" width="13" height="13" rx="2" />
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAssetUpdate(asset, {
                              is_public: !asset.is_public,
                            })
                          }}
                          className={`p-1.5 rounded ${
                            asset.is_public
                              ? "bg-green-100 text-green-700"
                              : "bg-white/90 text-gray-700"
                          } hover:bg-opacity-100`}
                          title={
                            asset.is_public ? "Make private" : "Make public"
                          }
                        >
                          {asset.is_public ? (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          ) : (
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                              <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(asset)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 w-12">
                      <input
                        type="checkbox"
                        checked={
                          selectedAssets.length === assets.length &&
                          assets.length > 0
                        }
                        onChange={selectAll}
                        className="w-4 h-4 text-primary-600 rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Preview
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      File Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assets.map((asset) => (
                    <tr
                      key={asset.id}
                      className={
                        selectedAssets.includes(asset.id)
                          ? "bg-primary-50"
                          : "hover:bg-gray-50"
                      }
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedAssets.includes(asset.id)}
                          onChange={() => toggleSelect(asset.id)}
                          className="w-4 h-4 text-primary-600 rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        {isImage(asset.file_type) ? (
                          <img
                            src={asset.thumbnail_url ?? asset.storage_path}
                            alt=""
                            className="w-16 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              className="text-gray-400"
                            >
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="font-medium text-gray-900 truncate max-w-xs"
                          title={asset.file_name}
                        >
                          {asset.file_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {asset.alt_text || "No alt text"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {asset.file_type}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatFileSize(asset.file_size)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(asset.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            asset.is_public
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {asset.is_public ? "Public" : "Private"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(
                                asset.bucket_name === "site-media"
                                  ? `${window.location.origin}/storage/v1/object/public/site-media/${asset.storage_path}`
                                  : asset.storage_path,
                              )
                            }
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                            title="Copy URL"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect x="9" y="9" width="13" height="13" rx="2" />
                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              handleAssetUpdate(asset, {
                                is_public: !asset.is_public,
                              })
                            }
                            className={`p-1.5 rounded ${
                              asset.is_public
                                ? "text-green-600"
                                : "text-gray-500"
                            } hover:bg-gray-100`}
                            title={
                              asset.is_public ? "Make private" : "Make public"
                            }
                          >
                            {asset.is_public ? (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            ) : (
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteAsset(asset)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
