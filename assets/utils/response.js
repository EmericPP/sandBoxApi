export const success = (result, status = 200) => ({status: status, result: result})
export const error = (message, status) => ({status: status, message: message})
