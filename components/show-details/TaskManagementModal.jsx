"use client"
import { useState, useMemo, useEffect } from "react"
import { ListTodo, X, Plus, Trash2, UserPlus, ChevronDown, ChevronRight, Mic, Play } from "lucide-react"

// --- Sub-Component: Assignee Modal (Nested inside the main modal) ---
const AssigneeModal = ({ isOpen, onClose, teamMembers, currentAssignees, onSave }) => {
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(currentAssignees);
    }
  }, [isOpen, currentAssignees]);

  if (!isOpen) return null;

  const handleSelect = (memberId) => {
    setSelectedIds((prev) => (prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]))
  }


  return (
    <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">Assign Team Members</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select members to assign to this task</p>
        </div>
        <div className="p-4 max-h-80 overflow-y-auto">
          {teamMembers.map((member) => {
            const isSelected = selectedIds.includes(member.id)
            return (
              <label
                key={member.id}
                className="flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleSelect(member.id)}
                    className="peer sr-only"
                    id={`member-${member.id}`}
                  />
                  <div
                    className={`w-4 h-4 rounded border transition-colors duration-150 flex items-center justify-center ${
                      isSelected ? "border-blue-500 bg-blue-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              <div className="ml-3">
    <span className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</span>
    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        {member.roles.filter(role => role.code === 2).map(role => role.role).join(', ') || member.primaryRole || 'No relevant roles'}
    </span>
</div>
                
              </label>
            )
          })}
        </div>
        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(selectedIds)}
            className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-150"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Sub-Component: A single, fully-interactive Task Item ---
const TaskItem = ({ task, onUpdate, onDelete, onAssign, onVoiceNote, onAddSubtask, isSubtask = false, teamMembers = [] }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(task.title)

  const handleTitleBlur = () => {
    if (title.trim() !== "" && title !== task.title) {
      onUpdate(task.id, { title })
    }
    setIsEditing(false)
  }

  const handleCheckboxChange = (e) => {
    onUpdate(task.id, { status: e.target.checked ? "completed" : "to_do" })
  }

  const assignedNames = (task.assignments || []).join(", ")
  const isCompleted = task.status === "completed"

  return (
    <div
      className={`flex items-center py-3 group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors duration-150 ${isSubtask ? "pl-8" : "pl-4"}`}
    >
      {/* Checkbox */}
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={handleCheckboxChange}
          className="peer sr-only"
          id={`task-${task.id}`}
        />
        <label
          htmlFor={`task-${task.id}`}
          className={`relative flex items-center justify-center w-5 h-5 border-2 rounded-full cursor-pointer transition-all duration-150 ${
            isCompleted
              ? "border-green-500 bg-green-500"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }`}
        >
          {isCompleted && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </label>
      </div>

      {/* Task Content */}
      <div className="flex-grow ml-3 min-w-0">
        <div onDoubleClick={() => setIsEditing(true)}>
          {isEditing ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyPress={(e) => e.key === "Enter" && handleTitleBlur()}
              autoFocus
              className="w-full bg-transparent p-1 border-b border-blue-500 text-gray-900 dark:text-white focus:outline-none"
            />
          ) : (
            <p
              className={`text-gray-900 dark:text-white transition-all duration-150 ${
                isCompleted ? "line-through text-gray-500 dark:text-gray-400" : ""
              }`}
            >
              {task.title}
            </p>
          )}

          {/* Assigned members - simple text display */}
          {assignedNames && (
            <div className="mt-1">
              <span className="text-xs text-gray-500 dark:text-gray-400">Assigned to: {assignedNames}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-100 group-hover:opacity-80 transition-opacity duration-150 ml-2">
        <button
          onClick={() => onAssign(task)}
          title="Assign members"
          className="p-1.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-150"
        >
          <UserPlus size={16} />
        </button>
        <button
    onClick={() => onVoiceNote(task)}
    title={task.voice_note_url ? "Play Voice Note" : "Add Voice Note"}
    className={`p-1.5 rounded transition-colors duration-150 ${
        task.voice_note_url 
        ? 'text-blue-500 hover:text-blue-600' 
        : 'text-gray-400 hover:text-gray-600'
    }`}
>
    {/* --- THE FIX: Conditionally render the icon based on the presence of a URL --- */}
    {task.voice_note_url ? <Play size={16} /> : <Mic size={16} />}
</button>

        {!isSubtask && (
          <button
            onClick={() => onAddSubtask(task.id)}
            title="Add subtask"
            className="p-1.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-150"
          >
            <Plus size={16} />
          </button>
        )}

        <button
          onClick={() => onDelete(task.id)}
          title="Delete task"
          className="p-1.5 rounded text-gray-400 hover:text-red-500 transition-colors duration-150"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}

// --- Sub-Component: Task Group with Subtasks ---
const TaskGroup = ({
  task,
  onUpdate,
  onDelete,
  onAssign,
  onAddSubtask,
  subtaskParentId,
  setSubtaskParentId,
  newTaskTitle,
  setNewTaskTitle,
  onVoiceNote,
  handleCreateTask,
  teamMembers,
}) => {
  const [showSubtasks, setShowSubtasks] = useState(true)
  const hasSubtasks = task.children && task.children.length > 0
  const completedSubtasks = hasSubtasks ? task.children.filter((child) => child.status === "completed").length : 0

  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-b-0">
      {/* Main Task */}
      <TaskItem
        task={task}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onAssign={onAssign}
        onVoiceNote={onVoiceNote}  
        onAddSubtask={setSubtaskParentId}
        teamMembers={teamMembers}
      />

      {/* Subtasks Section */}
      {hasSubtasks && (
        <div className="pl-4">
          {/* Subtasks Header */}
          <button
            onClick={() => setShowSubtasks(!showSubtasks)}
            className="flex items-center gap-2 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-150"
          >
            {showSubtasks ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span>
              Sub-tasks {completedSubtasks}/{task.children.length}
            </span>
          </button>

          {/* Subtasks List */}
          {showSubtasks && (
            <div>
              {task.children.map((subtask) => (
                <TaskItem
                  key={subtask.id}
                  task={subtask}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onAssign={onAssign}
                  onVoiceNote={onVoiceNote}
                  isSubtask={true}
                  teamMembers={teamMembers}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Subtask Input */}
      {subtaskParentId === task.id && (
        <div className="pl-8 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full flex-shrink-0"></div>
            <input
              type="text"
              autoFocus
              placeholder="Add a subtask..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleCreateTask(task.id)}
              onBlur={() => setSubtaskParentId(null)}
              className="flex-1 p-1 text-sm bg-transparent border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors duration-150"
            />
          </div>
        </div>
      )}

      {/* Add Subtask Button */}
      {!subtaskParentId && (hasSubtasks ? showSubtasks : true) && (
        <div className="pl-8 pb-3">
          <button
            onClick={() => setSubtaskParentId(task.id)}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 transition-colors duration-150"
          >
            <Plus size={16} />
            Add sub-task
          </button>
        </div>
      )}
    </div>
  )
}

// --- The Main, Fully-Featured Task Management Modal ---
export const TaskManagementModal = ({
  isOpen,
  onClose,
  deliverable,
  initialTasks = [],
  teamMembers = [],
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
  onTaskAssign,
  onTaskVoiceNote,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [subtaskParentId, setSubtaskParentId] = useState(null)
  const [assigningTask, setAssigningTask] = useState(null)

  const taskTree = useMemo(() => {
    const tasks = [...initialTasks]
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
  }, [initialTasks])

  if (!isOpen) return null

  const handleCreateTask = (parentId = null) => {
    const title = newTaskTitle.trim()
    if (title === "") return

    onTaskCreate({ title, deliverable_id: deliverable.id, parent_task_id: parentId })

    setNewTaskTitle("")
    setSubtaskParentId(null)
  }

  const handleAssignSave = (assigneeIds) => {
    onTaskAssign(assigningTask.id, assigneeIds)
    setAssigningTask(null)
  }

  // Convert assigned names back to IDs for the modal
  const getAssigneeIdsForTask = (task) => {
    return (task.assignments || []).map((name) => teamMembers.find((m) => m.name === name)?.id).filter(Boolean)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl flex flex-col border border-gray-200 dark:border-gray-700"
        style={{ height: "90vh", maxHeight: "800px" }}
      >
        {/* Nested Assignee Modal */}
        <AssigneeModal
          isOpen={!!assigningTask}
          onClose={() => setAssigningTask(null)}
          teamMembers={teamMembers}
          currentAssignees={assigningTask ? getAssigneeIdsForTask(assigningTask) : []}
          onSave={handleAssignSave}
        />

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <ListTodo size={20} className="text-blue-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{deliverable.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Task Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150"
          >
            <X size={20} />
          </button>
        </div>

        {/* Task List */}
        <div className="flex-grow overflow-y-auto">
          {taskTree.length > 0 ? (
            <div>
              {taskTree.map((task) => (
                <TaskGroup
                  key={task.id}
                  task={task}
                  onUpdate={onTaskUpdate}
                  onDelete={onTaskDelete}
                  onAssign={setAssigningTask}
                  onAddSubtask={setSubtaskParentId}
                  subtaskParentId={subtaskParentId}
                  setSubtaskParentId={setSubtaskParentId}
                  newTaskTitle={newTaskTitle}
                  setNewTaskTitle={setNewTaskTitle}
                  handleCreateTask={handleCreateTask}
                  onVoiceNote={onTaskVoiceNote}
                  teamMembers={teamMembers}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <ListTodo size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks yet</h4>
              <p className="text-gray-500 dark:text-gray-400">Create your first task to start organizing your work.</p>
            </div>
          )}
        </div>

        {/* Add Task Input */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 px-4 py-3 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150 placeholder-gray-500 dark:placeholder-gray-400"
              onKeyPress={(e) => e.key === "Enter" && handleCreateTask(null)}
            />
            <button
              onClick={() => handleCreateTask(null)}
              disabled={!newTaskTitle.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors duration-150"
            >
              <Plus size={16} />
              Add Task
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
