export interface TaskSet<ActionParams = any, ActionData = any> {
  uuid: string;
  type: string;
  params: ActionParams;
  data: ActionData;
}
