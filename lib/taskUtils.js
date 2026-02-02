export const dedupeTasks = (tasks = []) => {
  if (!Array.isArray(tasks) || tasks.length === 0) return [];

  const manualByKey = new Map();
  const autoByKey = new Map();

  const normalizeTitle = (title) => (title || "").trim().toLowerCase();
  const buildKey = (task) =>
    `${task?.deliverable_id ?? "none"}::${task?.parent_task_id ?? "root"}::${normalizeTitle(task?.title)}`;

  for (const task of tasks) {
    const key = buildKey(task);
    const isAuto = !!task?.is_auto_generated;

    if (isAuto) {
      if (!autoByKey.has(key)) {
        autoByKey.set(key, task);
      }
      continue;
    }

    const list = manualByKey.get(key);
    if (list) {
      list.push(task);
    } else {
      manualByKey.set(key, [task]);
    }
  }

  const keepIds = new Set();
  for (const list of manualByKey.values()) {
    for (const task of list) {
      if (task?.id != null) keepIds.add(task.id);
    }
  }

  for (const [key, task] of autoByKey.entries()) {
    if (!manualByKey.has(key) && task?.id != null) {
      keepIds.add(task.id);
    }
  }

  return tasks.filter((task) => task?.id == null || keepIds.has(task.id));
};
