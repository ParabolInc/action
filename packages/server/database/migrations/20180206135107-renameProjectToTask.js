exports.up = async (r) => {
  // rename the Project/ProjectHistory tables
  await r
    .table('Project')
    .config()
    .update({name: 'Task'})
    .run()
  await r
    .table('ProjectHistory')
    .config()
    .update({name: 'TaskHistory'})
    .run()
  await r
    .table('TaskHistory')
    .indexDrop('projectIdUpdatedAt')
    .run()
  await r
    .table('TaskHistory')
    .indexCreate('taskIdUpdatedAt', (row) => [row('taskId'), row('updatedAt')])
    .run()
  await r.table('Task').wait()
  // replace Task.isSoftProject with Task.isSoftTask
  await r
    .table('Task')
    .update((task) => task.merge({isSoftTask: task('isSoftProject')}).without('isSoftProject'))
    .run()

  // replace TaskHistory.projectId with TaskHistory.taskId
  await r
    .table('TaskHistory')
    .filter(r.row.hasFields('projectId'))
    .update((taskHistory) =>
      taskHistory.merge({taskId: taskHistory('projectId')}).without('projectId')
    )
    .run()

  // replace Meeting.projects with Meeting.tasks
  await r
    .table('Meeting')
    .filter(r.row.hasFields('projects'))
    .update((meeting) => meeting.merge({tasks: meeting('projects')}).without('projects'))
    .run()

  // replace Meeting.invitees.projects with Meeting.invitees.tasks
  await r
    .table('Meeting')
    .filter(r.row.hasFields('invitees'))
    .update((meeting) =>
      meeting.merge({
        invitees: meeting('invitees').map((invitee) =>
          invitee.merge({tasks: invitee('projects')}).without('projects')
        )
      })
    )
    .run()

  // replace Notification.projectId wth Notification.taskId, and PROJECT_INVOLVES notification type to TASK_INVOLVES
  await r
    .table('Notification')
    .filter(
      r.row.hasFields('projectId').and((row) => {
        return row('type').eq('PROJECT_INVOLVES')
      })
    )
    .update((notification) =>
      notification
        .merge({
          taskId: notification('projectId'),
          type: 'TASK_INVOLVES'
        })
        .without('projectId')
    )
    .run()
}

exports.down = async (r) => {
  // rename the Task/TaskHistory tables
  await r
    .table('Task')
    .config()
    .update({name: 'Project'})
    .run()
  await r
    .table('TaskHistory')
    .config()
    .update({name: 'ProjectHistory'})
    .run()
  await r
    .table('ProjectHistory')
    .indexDrop('taskIdUpdatedAt')
    .run()
  await r
    .table('ProjectHistory')
    .indexCreate('projectIdUpdatedAt', (row) => [row('projectId'), row('updatedAt')])
    .run()

  // replace Project.isSoftTask with Project.isSoftProject
  await r
    .table('Project')
    .update((project) =>
      project.merge({isSoftProject: project('isSoftTask')}).without('isSoftTask')
    )
    .run()

  // replace ProjectHistory.taskId with ProjectHistory.projectId
  await r
    .table('ProjectHistory')
    .filter(r.row.hasFields('taskId'))
    .update((projectHistory) =>
      projectHistory.merge({projectId: projectHistory('taskId')}).without('taskId')
    )

  // replace Meeting.projects with Meeting.tasks
  await r
    .table('Meeting')
    .filter(r.row.hasFields('tasks'))
    .update((meeting) => meeting.merge({projects: meeting('tasks')}).without('tasks'))
    .run()

  // replace Meeting.invitees.projects with Meeting.invitees.tasks
  await r
    .table('Meeting')
    .filter(r.row.hasFields('invitees'))
    .update((meeting) =>
      meeting.merge({
        invitees: meeting('invitees').map((invitee) =>
          invitee.merge({projects: invitee('tasks')}).without('tasks')
        )
      })
    )
    .run()

  // replace Notification.projectId wth Notification.taskId, and PROJECT_INVOLVES notification type to TASK_INVOLVES
  await r
    .table('Notification')
    .filter(
      r.row.hasFields('taskId').and(function (row) {
        return row('type').eq('TASK_INVOLVES')
      })
    )
    .update((notification) =>
      notification
        .merge({
          projectId: notification('taskId'),
          type: 'PROJECT_INVOLVES'
        })
        .without('taskId')
    )
    .run()
}
