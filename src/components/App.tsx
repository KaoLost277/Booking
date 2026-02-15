import { useMemo, useState } from "react"

import {
  useGetPostsQuery,
  useAddPostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} from "../features/todo/todoSlice"

export default function TodoPage() {
  const { data: todos, isLoading, error } = useGetPostsQuery()
  const [addPost, { isLoading: isAdding }] = useAddPostMutation()
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation()
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation()

  const [newName, setNewName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  const disableAll = isAdding || isUpdating || isDeleting

  const count = useMemo(() => todos?.length ?? 0, [todos])

  const onAdd = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const name = newName.trim()
    if (!name) return
    await addPost({ name, status: "pending" }).unwrap()
    setNewName("")
  }

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id)
    setEditingName(currentName)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingName("")
  }

  const onSave = async () => {
    if (!editingId) return
    const name = editingName.trim()
    if (!name) return
    await updatePost({ id: Number(editingId), name }).unwrap()
    cancelEdit()
  }

  const onDelete = async (id: string) => {
    await deletePost(id).unwrap()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Todo List
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              ทั้งหมด <span className="font-medium text-slate-900">{count}</span> รายการ
            </p>
          </div>

          <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
            RTK Query + Tailwind
          </span>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          {/* Create */}
          <form
            onSubmit={onAdd}
            className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center"
          >
            <div className="flex-1">
              <label className="sr-only">New todo</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="เพิ่มงานใหม่ เช่น อ่านหนังสือ 30 นาที"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                disabled={disableAll}
              />
            </div>

            <button
              type="submit"
              disabled={disableAll || !newName.trim()}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAdding ? "กำลังเพิ่ม..." : "Add"}
            </button>
          </form>

          {/* States */}
          {isLoading && (
            <div className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-2/3 rounded bg-slate-100" />
                <div className="h-4 w-1/2 rounded bg-slate-100" />
                <div className="h-4 w-3/5 rounded bg-slate-100" />
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="p-4">
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                โหลดข้อมูลไม่สำเร็จ ลองรีเฟรชหน้าใหม่อีกครั้งนะ
              </div>
            </div>
          )}

          {/* List */}
          {!isLoading && !error && (
            <ul className="divide-y divide-slate-100">
              {todos?.length ? (
                todos.map((t) => (
                  <li key={t.id} className="p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      {/* Left */}
                      <div className="min-w-0 flex-1">
                        {editingId === String(t.id) ? (
                          <input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                            disabled={disableAll}
                          />
                        ) : (
                          <p className="truncate text-base font-medium text-slate-900">
                            {t.name}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-slate-500">
                          id: <span className="font-mono">{t.id}</span>
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 sm:justify-end">
                        {editingId === String(t.id) ? (
                          <>
                            <button
                              onClick={onSave}
                              disabled={disableAll || !editingName.trim()}
                              className="rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isUpdating ? "Saving..." : "Save"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={disableAll}
                              className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(String(t.id), t.name)}
                              disabled={disableAll}
                              className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => onDelete(String(t.id))}
                              disabled={disableAll}
                              className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="p-8 text-center">
                  <div className="mx-auto max-w-sm">
                    <div className="text-sm font-semibold text-slate-900">
                      ยังไม่มีรายการ
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      ลองเพิ่มงานแรกของคุณด้านบนได้เลย
                    </p>
                  </div>
                </li>
              )}
            </ul>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 p-4 text-xs text-slate-500">
            <span>
              {disableAll ? "กำลังทำงานกับเซิร์ฟเวอร์..." : "พร้อมใช้งาน"}
            </span>
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-white px-3 py-1.5 font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
              type="button"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
