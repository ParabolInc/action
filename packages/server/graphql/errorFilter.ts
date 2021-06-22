// this is useful anytime you call `loadMany` on a dataloader
const errorFilter = <T>(obj: T | Error): obj is T => !(obj instanceof Error)
export default errorFilter
