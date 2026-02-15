export type Todo = {
  id: number
  name: string
  status: string
}

export type ApiError = {
  message: string
  status?: number
}