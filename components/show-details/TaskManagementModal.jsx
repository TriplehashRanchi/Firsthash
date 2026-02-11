"use client"
import { useState, useMemo, useEffect } from "react"
import { ListTodo, X, Plus, Trash2, UserPlus, ChevronDown, ChevronRight, Mic, Play, CheckCircle2, CornerDownRight } from "lucide-react"
import { dedupeTasks } from "@/lib/taskUtils"

const getInitials = (name) => {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase()
}

const getAssigneeIdsForTask = (task, teamMembers) => {
  return (task.assignments || []).map((name) => teamMembers.find((m) => m.name === name)?.id).filter(Boolean)
}

const getDateInputValue = (task) => {
  const value = task?.due_date || task?.dueDate || task?.due_at || task?.deadline
  if (!value) return ""
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ""
  return parsed.toISOString().slice(0, 10)
}

const DEFAULT_STATUSES = ["to_do", "in_progress", "completed", "finalize"]

const normalizeStatus = (status) => String(status || "").toLowerCase().trim()

const getStatusValue = (status) => {
  const trimmed = String(status || "").trim()
  return trimmed || "to_do"
}

const statusLabel = (status) => {
  const safe = getStatusValue(status)
  if (safe.includes("_")) {
    return safe
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }
  return safe
}

const STATUS_BADGE_STYLES = {
  to_do: "bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-900/20 dark:border-amber-900 dark:text-amber-400",
  in_progress: "bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-900/20 dark:border-blue-900 dark:text-blue-400",
  completed: "bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-900 dark:text-emerald-400",
  finalize: "bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300",
}

const UserAvatar = ({ name, size = "sm" }) => {
  const colors = [
    "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
  ]
  const safeName = name || "unknown"
  const colorClass = colors[safeName.length % colors.length]
  const sizeClass = size === "xs" ? "w-5 h-5 text-[9px]" : "w-7 h-7 text-[10px]"

  return (
    <div
      className={`${sizeClass} rounded-full flex items-center justify-center font-bold ring-2 ring-white dark:ring-gray-900 ${colorClass}`}
      title={name}
    >
      {getInitials(name)}
    </div>
  )
}

const AssigneeModal = ({ isOpen, onClose, teamMembers, currentAssignees, onSave }) => {
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => {
    if (isOpen) setSelectedIds(currentAssignees)
  }, [isOpen, currentAssignees])

  if (!isOpen) return null

  const handleSelect = (memberId) => {
    setSelectedIds((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]))
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Assign Members</h4>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={16} />
          </button>
        </div>

        <div className="p-2 max-h-[360px] overflow-y-auto">
          {teamMembers.map((member) => {
            const isSelected = selectedIds.includes(member.id)
            return (
              <div
                key={member.id}
                onClick={() => handleSelect(member.id)}
                className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors duration-150 ${
                  isSelected ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-colors ${
                    isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  {isSelected && <CheckCircle2 size={10} className="text-white" />}
                </div>
                <UserAvatar name={member.name} size="xs" />
                <p
                  className={`ml-3 text-sm font-medium ${
                    isSelected ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {member.name}
                </p>
              </div>
            )
          })}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(selectedIds)}
            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20"
          >
            Apply Assignments
          </button>
        </div>
      </div>
    </div>
  )
}

const ActionButton = ({ onClick, icon, label, tooltip, color, active = false, disabled = false }) => (
  <button
    onClick={onClick}
    title={tooltip}
    disabled={disabled}
    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${color} ${
      active ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800" : ""
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
)

const TaskRow = ({
  task,
  depth = 0,
  onUpdate,
  onDelete,
  onAssign,
  onVoiceNote,
  onAddSubtask,
  onToggleSubtasks,
  showSubtasks,
  hasSubtasks,
  isReadOnly,
  statusOptions = [],
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [statusDraft, setStatusDraft] = useState(getStatusValue(task.status))

  const handleTitleBlur = () => {
    if (title.trim() !== "" && title !== task.title) {
      onUpdate(task.id, { title })
    }
    setIsEditing(false)
  }

  useEffect(() => {
    setStatusDraft(getStatusValue(task.status))
  }, [task.id, task.status])

  const assignedNames = Array.from(new Set(task.assignments || []))
  const currentStatusValue = getStatusValue(task.status)
  const normalizedStatus = normalizeStatus(currentStatusValue)
  const isCompleted = normalizedStatus === "completed"

  const handleStatusCommit = () => {
    const nextStatus = getStatusValue(statusDraft)
    if (normalizeStatus(nextStatus) === normalizeStatus(currentStatusValue)) {
      setStatusDraft(currentStatusValue)
      return
    }
    onUpdate(task.id, { status: nextStatus })
  }

  const gridTemplate = "32px minmax(180px, 1fr) 170px 110px 160px 290px"

  return (
    <div className="group relative border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div
        className="grid items-center py-2 relative z-10"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        <div
          className="flex justify-center pr-2 border-r border-gray-200 dark:border-slate-700"
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
        >
          <button
            onClick={() => !isReadOnly && onUpdate(task.id, { status: isCompleted ? "to_do" : "completed" })}
            disabled={isReadOnly}
            className={`w-5 h-5 min-w-5 min-h-5 aspect-square shrink-0 rounded-full border-2 flex items-center justify-center leading-none transition-all duration-200 ${
              isCompleted
                ? "bg-emerald-500 border-emerald-500 text-white"
                : "border-gray-300 dark:border-gray-600 hover:border-emerald-400"
            }`}
          >
            {isCompleted && <CheckCircle2 size={12} />}
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 overflow-hidden border-r border-gray-200 dark:border-slate-700">
          {hasSubtasks && (
            <button
              onClick={onToggleSubtasks}
              className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"
            >
              {showSubtasks ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          {!hasSubtasks && depth > 0 && <div className="w-4" />}

          <div className="flex-1 min-w-0" onDoubleClick={() => !isReadOnly && setIsEditing(true)}>
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={(e) => e.key === "Enter" && handleTitleBlur()}
                autoFocus
                className="w-full bg-transparent border-b-2 border-blue-500 text-sm py-0.5 focus:outline-none text-gray-900 dark:text-white"
              />
            ) : (
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm truncate cursor-text ${
                    isCompleted
                      ? "text-gray-400 line-through decoration-gray-300"
                      : "text-gray-800 dark:text-gray-200 font-medium"
                  }`}
                >
                  {task.title}
                </span>
                {task.voice_note_url && <Mic size={12} className="text-blue-500 flex-shrink-0" />}
              </div>
            )}
          </div>
        </div>

        <div className="px-3 border-r border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between gap-2">
            <div className="flex -space-x-2 overflow-hidden">
            {assignedNames.length > 0 ? (
              assignedNames.slice(0, 3).map((name) => <UserAvatar key={`${task.id}-${name}`} name={name} size="sm" />)
            ) : (
              <span className="text-[11px] text-gray-400 italic">Unassigned</span>
            )}
            {assignedNames.length > 3 && (
              <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 flex items-center justify-center text-[9px] text-gray-500 font-bold">
                +{assignedNames.length - 3}
              </div>
            )}
            </div>
            <button
              onClick={() => onAssign(task)}
              disabled={isReadOnly}
              title="Assign members"
              className="p-1 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-40"
            >
              <UserPlus size={14} />
            </button>
          </div>
        </div>
        <div className="px-3 border-r border-gray-200 dark:border-slate-700">
          {isReadOnly ? (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide border ${
                STATUS_BADGE_STYLES[normalizedStatus] || "bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
              }`}
            >
              {statusLabel(currentStatusValue)}
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                list={`task-status-options-${task.id}`}
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value)}
                onBlur={handleStatusCommit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleStatusCommit()
                  }
                }}
                placeholder="Set status..."
                className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {normalizedStatus === "finalize" && (
                <button
                  onClick={() => onUpdate(task.id, { status: "completed" })}
                  className="px-2.5 py-1.5 text-[10px] font-semibold rounded-md bg-emerald-600 text-white hover:bg-emerald-700 whitespace-nowrap"
                  title="Approve and mark completed"
                >
                  Approve
                </button>
              )}
              <datalist id={`task-status-options-${task.id}`}>
                {statusOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>
          )}
        </div>

        <div className="px-3 border-r border-gray-200 dark:border-slate-700">
          <input
            type="date"
            value={getDateInputValue(task)}
            onChange={(e) => onUpdate(task.id, { due_date: e.target.value || null })}
            disabled={isReadOnly}
            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>

        <div className="flex items-center justify-end gap-0.5 px-2">
          <ActionButton
            onClick={() => onVoiceNote(task)}
            icon={task.voice_note_url ? <Play size={14} /> : <Mic size={14} />}
            label={task.voice_note_url ? "Play" : "Record"}
            tooltip="Voice Note"
            active={!!task.voice_note_url}
            color="text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            disabled={isReadOnly}
          />
          <ActionButton
            onClick={() => onAddSubtask(task.id)}
            icon={<CornerDownRight size={14} />}
            label="Subtask"
            tooltip="Add Subtask"
            color="text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            disabled={isReadOnly}
          />
          <ActionButton
            onClick={() => onDelete(task.id)}
            icon={<Trash2 size={14} />}
            label="Delete"
            tooltip="Delete"
            color="text-rose-500 border border-rose-200 dark:border-rose-800 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
            disabled={isReadOnly}
          />
        </div>
      </div>
    </div>
  )
}

const TaskTreeRenderer = ({ task, depth = 0, ...rest }) => {
  const [showSubtasks, setShowSubtasks] = useState(false)
  const hasSubtasks = task.children && task.children.length > 0

  return (
    <>
      <TaskRow
        {...rest}
        task={task}
        depth={depth}
        showSubtasks={showSubtasks}
        onToggleSubtasks={() => setShowSubtasks((prev) => !prev)}
        hasSubtasks={hasSubtasks}
      />

      {hasSubtasks && showSubtasks && (
        <div>
          {task.children.map((child) => (
            <TaskTreeRenderer key={child.id} task={child} depth={depth + 1} {...rest} />
          ))}
        </div>
      )}

      {rest.subtaskParentId === task.id && !rest.isReadOnly && (
        <div className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/20">
          <div className="grid items-center py-2 px-4" style={{ gridTemplateColumns: "36px 1fr" }}>
            <div className="flex justify-end pr-2" style={{ paddingLeft: `${(depth + 1) * 24}px` }}>
              <CornerDownRight size={14} className="text-gray-400" />
            </div>
            <input
              autoFocus
              placeholder="Type subtask name and press Enter..."
              value={rest.newTaskTitle}
              onChange={(e) => rest.setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && rest.handleCreateTask(task.id)}
              onBlur={() => rest.setSubtaskParentId(null)}
              className="w-full bg-transparent text-sm p-1 placeholder-gray-400 focus:outline-none text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      )}
    </>
  )
}

const TaskManagementContent = ({
  deliverable,
  initialTasks = [],
  teamMembers = [],
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
  onTaskAssign,
  onTaskVoiceNote,
  showTaskListLabel = true,
  unifiedMode = false,
  hideTableHeader = false,
  showAddTaskButton = true,
  isReadOnly = false,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [subtaskParentId, setSubtaskParentId] = useState(null)
  const [assigningTask, setAssigningTask] = useState(null)

  const dedupedTasks = useMemo(() => dedupeTasks(initialTasks), [initialTasks])
  const statusOptions = useMemo(() => {
    const options = []
    const seen = new Set()

    for (const status of DEFAULT_STATUSES) {
      const value = getStatusValue(status)
      const key = normalizeStatus(value)
      if (!seen.has(key)) {
        seen.add(key)
        options.push(value)
      }
    }

    for (const task of dedupedTasks) {
      const rawStatus = String(task?.status || "").trim()
      if (!rawStatus) continue
      const key = normalizeStatus(rawStatus)
      if (!seen.has(key)) {
        seen.add(key)
        options.push(rawStatus)
      }
    }

    return options
  }, [dedupedTasks])

  const taskTree = useMemo(() => {
    const tasks = [...dedupedTasks]
    const taskMap = new Map(tasks.map((t) => [t.id, { ...t, children: [] }]))
    const tree = []

    for (const task of tasks) {
      if (task.parent_task_id && taskMap.has(task.parent_task_id)) {
        taskMap.get(task.parent_task_id).children.push(taskMap.get(task.id))
      } else {
        tree.push(taskMap.get(task.id))
      }
    }
    return tree
  }, [dedupedTasks])

  const handleCreateTask = (parentId = null) => {
    const sourceTitle = parentId ? newTaskTitle : window.prompt("Enter task name")
    const title = (sourceTitle || "").trim()
    if (title === "" || isReadOnly) return

    onTaskCreate({ title, deliverable_id: deliverable.id, parent_task_id: parentId })
    setNewTaskTitle("")
    setSubtaskParentId(null)
  }

  const handleAssignSave = (assigneeIds) => {
    onTaskAssign(assigningTask.id, assigneeIds)
    setAssigningTask(null)
  }

  const gridTemplate = "32px minmax(180px, 1fr) 170px 110px 160px 290px"

  return (
    <div
      className={`relative flex flex-col h-full max-h-[800px] overflow-hidden ${
        unifiedMode
          ? "bg-transparent border-0 rounded-none shadow-none"
          : "bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm"
      }`}
    >
      <AssigneeModal
        isOpen={!!assigningTask}
        onClose={() => setAssigningTask(null)}
        teamMembers={teamMembers}
        currentAssignees={assigningTask ? getAssigneeIdsForTask(assigningTask, teamMembers) : []}
        onSave={handleAssignSave}
      />

      {(showTaskListLabel || !unifiedMode) && (
        <div
          className={`px-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between ${
            unifiedMode ? "bg-slate-50/60 dark:bg-slate-900/40" : "bg-white dark:bg-slate-900"
          } ${showTaskListLabel ? "py-4" : "py-2.5"}`}
        >
          {showTaskListLabel ? (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                <ListTodo size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Task List</h3>
                <p className="text-xs text-gray-500 font-medium dark:text-gray-400">{deliverable.title}</p>
              </div>
            </div>
          ) : (
            <div />
          )}
          <div />
        </div>
      )}

     

      <div className={`${unifiedMode ? "border-b border-gray-200 dark:border-slate-700" : "mx-4 mb-3 border border-gray-200 dark:border-slate-700 rounded-lg"} overflow-hidden`}>
        {!hideTableHeader && (
        <div
          className="grid py-2 bg-gray-50/80 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-800 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 select-none"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          <div className="pl-4 pr-2 border-r border-gray-200 dark:border-slate-700">#</div>
          <div className="px-3 border-r border-gray-200 dark:border-slate-700">Tasks To Be Done</div>
          <div className="px-3 border-r border-gray-200 dark:border-slate-700">Assignees</div>
          <div className="px-3 border-r border-gray-200 dark:border-slate-700">Task Status</div>
          <div className="px-3 border-r border-gray-200 dark:border-slate-700">Due Date</div>
          <div className="px-2 text-right">Actions</div>
        </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {taskTree.length > 0 ? (
            <div>
              {taskTree.map((task) => (
                <TaskTreeRenderer
                  key={task.id}
                  task={task}
                  onUpdate={onTaskUpdate}
                  onDelete={onTaskDelete}
                  onAssign={setAssigningTask}
                  onVoiceNote={onTaskVoiceNote}
                  onAddSubtask={setSubtaskParentId}
                  subtaskParentId={subtaskParentId}
                  setSubtaskParentId={setSubtaskParentId}
                  newTaskTitle={newTaskTitle}
                  setNewTaskTitle={setNewTaskTitle}
                  handleCreateTask={handleCreateTask}
                  statusOptions={statusOptions}
                  isReadOnly={isReadOnly}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500">
              <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <ListTodo size={32} className="opacity-50" />
              </div>
              <p className="text-sm font-medium">No tasks found</p>
              <p className="text-xs opacity-70 mt-1">Add a task below to get started</p>
            </div>
          )}
        </div>
      </div>
      {!isReadOnly && showAddTaskButton && (
        <div className="px-6 py-2 border-b border-gray-200 dark:border-gray-800 flex justify-end bg-white dark:bg-slate-900">
          <button
            onClick={() => handleCreateTask(null)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            Add New Task
          </button>
        </div>
      )}

    </div>
  )
}

export const TaskManagementPanel = (props) => {
  return <TaskManagementContent {...props} />
}

export const TaskManagementModal = ({ isOpen, onClose, ...props }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm p-4 flex items-center justify-center">
      <div className="relative w-full max-w-6xl h-[90vh] max-h-[860px]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-lg bg-white/90 dark:bg-slate-900/90 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <X size={18} />
        </button>
        <TaskManagementContent {...props} />
      </div>
    </div>
  )
}
