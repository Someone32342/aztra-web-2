export interface ReactionAddEventCondition {
  channel: string
  message: string
}

export interface AddRolesTaskData {
  members: string[] | null
  roles: string[]
}


export interface Task {
  taskcode: string
  data: any
}

export interface TaskSet {
  uuid: string
  event: string
  params: any
  task: Task[]
}