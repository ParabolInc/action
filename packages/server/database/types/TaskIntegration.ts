import generateUID from '../../generateUID'
import {TaskServiceEnum} from './Task'

interface Input {
  service: TaskServiceEnum
}

export default class TaskIntegration {
  id = generateUID()
  service: TaskServiceEnum
  constructor(input: Input) {
    const {service} = input
    this.service = service
  }
}
