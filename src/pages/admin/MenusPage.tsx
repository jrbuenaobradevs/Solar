import { useEffect, useState } from "react"
import { supabase } from "../../config/supabase.js"
import { useAuth } from "../../context/AuthContext"

interface Menu {
  id: string
  name: string
  slug: string
  description: string | null
  location: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

interface MenuItem {
  id: string
  menu_id: string
  parent_id: string | null
  label: string
  url: string
  target: "_self" | "_blank"
  icon: string | null
  css_classes: string | null
  is_active: boolean
  sort_order: number
  children?: MenuItem[]
  created_at: string
  updated_at: string
}

interface MenuFormData {
  name: string
  slug: string
  description: string
  location: string
  is_active: boolean
  sort_order: number
}

const menuLocations = [
  { value: "header", label: "Header Navigation" },
  { value: "footer", label: "Footer Navigation" },
  { value: "mobile", label: "Mobile Menu" },
  { value: "sidebar", label: "Sidebar Menu" },
  { value: "utility", label: "Utility Links" },
]

export default function MenusPage() {
  const { adminUser } = useAuth()
  const [menus, setMenus] = useState<Menu[]>([])
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem[]>>({})
  const [loading, setLoading] = useState(true)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [showMenuForm, setShowMenuForm] = useState(false)
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null)
  const [menuFormData, setMenuFormData] = useState<MenuFormData>({
    name: "",
    slug: "",
    description: "",
    location: "header",
    is_active: true,
    sort_order: 0,
  })
  const [showItemForm, setShowItemForm] = useState(false)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [itemParentId, setItemParentId] = useState<string | null>(null)
  const [itemFormData, setItemFormData] = useState<Partial<MenuItem>>({
    label: "",
    url: "",
    target: "_self",
    icon: "",
    css_classes: "",
    is_active: true,
    sort_order: 0,
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchMenus()
  }, [])

  const fetchMenus = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("menus")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })

      if (error) throw error
      setMenus(data || [])

      // Fetch items for all menus
      if (data && data.length > 0) {
        const { data: itemsData, error: itemsError } = await supabase
          .from("menu_items")
          .select("*")
          .in(
            "menu_id",
            data.map((m) => m.id),
          )
          .order("sort_order", { ascending: true })

        if (itemsError) throw itemsError

        const itemsMap: Record<string, MenuItem[]> = {}
        ;(itemsData || []).forEach((item) => {
          if (!itemsMap[item.menu_id]) itemsMap[item.menu_id] = []
          itemsMap[item.menu_id].push(item)
        })
        setMenuItems(itemsMap)

        // Set first menu as active if none selected
        if (!activeMenuId && data.length > 0) {
          setActiveMenuId(data[0].id)
        }
      }
    } catch (error) {
      console.error("Error fetching menus:", error)
    } finally {
      setLoading(false)
    }
  }

  const buildTree = (
    items: MenuItem[],
    parentId: string | null = null,
  ): MenuItem[] => {
    return items
      .filter((item) => item.parent_id === parentId)
      .map((item) => ({
        ...item,
        children: buildTree(items, item.id),
      }))
  }

  const getActiveMenuItems = () => {
    if (!activeMenuId) return []
    return buildTree(menuItems[activeMenuId] || [])
  }

  const resetMenuForm = () => {
    setMenuFormData({
      name: "",
      slug: "",
      description: "",
      location: "header",
      is_active: true,
      sort_order: menus.length,
    })
    setEditingMenu(null)
  }

  const handleNewMenu = () => {
    resetMenuForm()
    setShowMenuForm(true)
  }

  const handleEditMenu = (menu: Menu) => {
    setMenuFormData({
      name: menu.name,
      slug: menu.slug,
      description: menu.description || "",
      location: menu.location,
      is_active: menu.is_active,
      sort_order: menu.sort_order,
    })
    setEditingMenu(menu)
    setShowMenuForm(true)
  }

  const validateMenuForm = () => {
    if (!menuFormData.name.trim()) return "Name is required"
    if (!menuFormData.slug.trim()) return "Slug is required"
    return null
  }

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const error = validateMenuForm()
    if (error) {
      alert(error)
      return
    }

    setSubmitting(true)
    try {
      const menuData = {
        name: menuFormData.name,
        slug: menuFormData.slug,
        description: menuFormData.description || null,
        location: menuFormData.location,
        is_active: menuFormData.is_active,
        sort_order: menuFormData.sort_order,
      }

      if (editingMenu) {
        const { error } = await supabase
          .from("menus")
          .update(menuData)
          .eq("id", editingMenu.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("menus").insert([menuData])
        if (error) throw error
      }

      await fetchMenus()
      setShowMenuForm(false)
      resetMenuForm()
    } catch (error: any) {
      if (error.code === "23505") {
        alert("A menu with this slug already exists")
      } else {
        console.error("Error saving menu:", error)
        alert("Failed to save menu: " + error.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteMenu = async (menu: Menu) => {
    if (
      !confirm(
        `Are you sure you want to delete "${menu.name}" and all its items?`,
      )
    )
      return

    try {
      // Delete menu items first (due to foreign key)
      await supabase.from("menu_items").delete().eq("menu_id", menu.id)
      const { error } = await supabase.from("menus").delete().eq("id", menu.id)
      if (error) throw error

      await fetchMenus()
      if (activeMenuId === menu.id) {
        setActiveMenuId(menus.find((m) => m.id !== menu.id)?.id || null)
      }
    } catch (error) {
      console.error("Error deleting menu:", error)
      alert("Failed to delete menu")
    }
  }

  const handleDeleteItem = async (item: MenuItem) => {
    if (!confirm(`Are you sure you want to delete "${item.label}"?`)) return

    try {
      // Delete children first
      const deleteChildren = async (parentId: string) => {
        const children = (menuItems[activeMenuId!] || []).filter(
          (i) => i.parent_id === parentId,
        )
        for (const child of children) {
          await deleteChildren(child.id)
        }
        await supabase.from("menu_items").delete().eq("id", parentId)
      }

      await deleteChildren(item.id)
      await fetchMenus()
    } catch (error) {
      console.error("Error deleting menu item:", error)
      alert("Failed to delete menu item")
    }
  }

  const resetItemForm = () => {
    setItemFormData({
      label: "",
      url: "",
      target: "_self",
      icon: "",
      css_classes: "",
      is_active: true,
      sort_order: (menuItems[activeMenuId!] || []).filter(
        (i) => i.parent_id === itemParentId,
      ).length,
    })
    setEditingItem(null)
  }

  const handleNewItem = (parentId: string | null = null) => {
    setItemParentId(parentId)
    resetItemForm()
    setShowItemForm(true)
  }

  const handleEditItem = (item: MenuItem) => {
    setItemParentId(item.parent_id)
    setItemFormData({
      label: item.label,
      url: item.url,
      target: item.target,
      icon: item.icon || "",
      css_classes: item.css_classes || "",
      is_active: item.is_active,
      sort_order: item.sort_order,
    })
    setEditingItem(item)
    setShowItemForm(true)
  }

  const validateItemForm = () => {
    if (!itemFormData.label?.trim()) return "Label is required"
    if (!itemFormData.url?.trim()) return "URL is required"
    return null
  }

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const error = validateItemForm()
    if (error) {
      alert(error)
      return
    }
    if (!activeMenuId) return

    setSubmitting(true)
    try {
      const itemData = {
        menu_id: activeMenuId,
        parent_id: itemParentId,
        label: itemFormData.label!,
        url: itemFormData.url!,
        target: itemFormData.target!,
        icon: itemFormData.icon || null,
        css_classes: itemFormData.css_classes || null,
        is_active: itemFormData.is_active!,
        sort_order: itemFormData.sort_order!,
      }

      if (editingItem) {
        const { error } = await supabase
          .from("menu_items")
          .update(itemData)
          .eq("id", editingItem.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("menu_items").insert([itemData])
        if (error) throw error
      }

      await fetchMenus()
      setShowItemForm(false)
      resetItemForm()
    } catch (error) {
      console.error("Error saving menu item:", error)
      alert("Failed to save menu item")
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleMenuActive = async (menu: Menu) => {
    try {
      const { error } = await supabase
        .from("menus")
        .update({ is_active: !menu.is_active })
        .eq("id", menu.id)
      if (error) throw error
      await fetchMenus()
    } catch (error) {
      console.error("Error toggling menu:", error)
    }
  }

  const handleToggleItemActive = async (item: MenuItem) => {
    try {
      const { error } = await supabase
        .from("menu_items")
        .update({ is_active: !item.is_active })
        .eq("id", item.id)
      if (error) throw error
      await fetchMenus()
    } catch (error) {
      console.error("Error toggling menu item:", error)
    }
  }

  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const hasChildren = item.children && item.children.length > 0

    return (
      <div key={item.id} style={{ marginLeft: `${depth * 24}px` }}>
        <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg">
          {hasChildren && (
            <span
              className="text-gray-400 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              ▼
            </span>
          )}
          {!hasChildren && <span className="w-5" />}

          {item.icon && <span className="text-gray-400">{item.icon}</span>}
          <span className="font-medium text-gray-900 flex-1 truncate">
            {item.label}
          </span>
          <span className="text-xs text-gray-500 font-mono truncate max-w-[200px]">
            {item.url}
          </span>
          <span
            className={`px-2 py-0.5 text-xs rounded-full ${
              item.is_active
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {item.is_active ? "Active" : "Inactive"}
          </span>
          <span className="text-xs text-gray-400">#{item.sort_order}</span>

          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleEditItem(item)
              }}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              title="Edit"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleToggleItemActive(item)
              }}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
              title={item.is_active ? "Deactivate" : "Activate"}
            >
              {item.is_active ? (
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
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteItem(item)
              }}
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
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleNewItem(item.id)
                }}
                className="p-1.5 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded"
                title="Add Child"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {hasChildren &&
          item.children!.map((child) => renderMenuItem(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menus</h1>
          <p className="text-gray-600 mt-1">
            Manage navigation menus and menu items
          </p>
        </div>
        <button
          onClick={handleNewMenu}
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
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Menu
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Menus Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Menus</h2>
            </div>
            <div className="p-3 space-y-1 max-h-[600px] overflow-y-auto">
              {loading && menus.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Loading menus...
                </div>
              ) : menus.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No menus yet. Create your first menu.
                </div>
              ) : (
                menus.map((menu) => (
                  <button
                    key={menu.id}
                    onClick={() => setActiveMenuId(menu.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center gap-2 ${
                      activeMenuId === menu.id
                        ? "bg-primary-100 text-primary-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {menu.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate capitalize">
                        {menu.location}
                      </p>
                    </div>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        menu.is_active ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                  </button>
                ))
              )}
            </div>
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={handleNewMenu}
                className="w-full px-3 py-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Menu
              </button>
            </div>
          </div>
        </div>

        {/* Menu Items Editor */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {activeMenuId ? (
              (() => {
                const activeMenu = menus.find((m) => m.id === activeMenuId)
                return (
                  <>
                    <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h2 className="font-semibold text-gray-900">
                          {activeMenu?.name}
                        </h2>
                        <p className="text-sm text-gray-500">
                          {activeMenu?.description || "No description"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditMenu(activeMenu!)}
                          className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Edit Menu
                        </button>
                        <button
                          onClick={() => handleDeleteMenu(activeMenu!)}
                          className="px-3 py-1.5 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleNewItem()}
                          className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Add Item
                        </button>
                      </div>
                    </div>

                    <div className="p-4 max-h-[600px] overflow-y-auto">
                      {getActiveMenuItems().length === 0 ? (
                        <div className="text-center py-12">
                          <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            className="mx-auto text-gray-300 mb-4"
                          >
                            <line x1="4" y1="12" x2="20" y2="12" />
                            <line x1="4" y1="6" x2="20" y2="6" />
                            <line x1="4" y1="18" x2="20" y2="18" />
                          </svg>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            No menu items
                          </h3>
                          <p className="text-gray-500 mb-4">
                            Add your first menu item
                          </p>
                          <button
                            onClick={() => handleNewItem()}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                          >
                            Add Item
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {getActiveMenuItems().map((item) =>
                            renderMenuItem(item),
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )
              })()
            ) : (
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
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Select a menu
                </h3>
                <p className="text-gray-500">
                  Choose a menu from the sidebar to manage its items
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Menu Form Modal */}
      {showMenuForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowMenuForm(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingMenu ? "Edit Menu" : "New Menu"}
              </h2>
              <button
                onClick={() => setShowMenuForm(false)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleMenuSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={menuFormData.name}
                  onChange={(e) =>
                    setMenuFormData({ ...menuFormData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Main Navigation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  value={menuFormData.slug}
                  onChange={(e) =>
                    setMenuFormData({ ...menuFormData, slug: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="main-navigation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={menuFormData.description}
                  onChange={(e) =>
                    setMenuFormData({
                      ...menuFormData,
                      description: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <select
                  value={menuFormData.location}
                  onChange={(e) =>
                    setMenuFormData({
                      ...menuFormData,
                      location: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {menuLocations.map((loc) => (
                    <option key={loc.value} value={loc.value}>
                      {loc.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={menuFormData.sort_order}
                    onChange={(e) =>
                      setMenuFormData({
                        ...menuFormData,
                        sort_order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={menuFormData.is_active}
                      onChange={(e) =>
                        setMenuFormData({
                          ...menuFormData,
                          is_active: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowMenuForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting
                    ? "Saving..."
                    : editingMenu
                      ? "Update Menu"
                      : "Create Menu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu Item Form Modal */}
      {showItemForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowItemForm(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingItem ? "Edit Menu Item" : "New Menu Item"}
              </h2>
              <button
                onClick={() => setShowItemForm(false)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleItemSubmit} className="p-6 space-y-4">
              {itemParentId && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                  Adding as child item
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label *
                </label>
                <input
                  type="text"
                  value={itemFormData.label || ""}
                  onChange={(e) =>
                    setItemFormData({
                      ...itemFormData,
                      label: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Home"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL *
                </label>
                <input
                  type="text"
                  value={itemFormData.url || ""}
                  onChange={(e) =>
                    setItemFormData({ ...itemFormData, url: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="/ or https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target
                </label>
                <select
                  value={itemFormData.target}
                  onChange={(e) =>
                    setItemFormData({
                      ...itemFormData,
                      target: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="_self">Same Window (_self)</option>
                  <option value="_blank">New Window (_blank)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon (optional)
                </label>
                <input
                  type="text"
                  value={itemFormData.icon || ""}
                  onChange={(e) =>
                    setItemFormData({ ...itemFormData, icon: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="home, menu, user, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CSS Classes (optional)
                </label>
                <input
                  type="text"
                  value={itemFormData.css_classes || ""}
                  onChange={(e) =>
                    setItemFormData({
                      ...itemFormData,
                      css_classes: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="custom-class another-class"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={itemFormData.sort_order || 0}
                    onChange={(e) =>
                      setItemFormData({
                        ...itemFormData,
                        sort_order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={itemFormData.is_active}
                      onChange={(e) =>
                        setItemFormData({
                          ...itemFormData,
                          is_active: e.target.checked,
                        })
                      }
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowItemForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting
                    ? "Saving..."
                    : editingItem
                      ? "Update Item"
                      : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
