if(import.meta.env.VITE_HOST === undefined){
    throw new Error("HOST is not defined")
}

export const API_HOST = `http://${import.meta.env.VITE_HOST}:8000`

export type ApiResponseError = {
    message: string
}

export type JwtBearerResponse = {
    bearer: string 
}

export type ApiResponse<T> = T | ApiResponseError

export const hasResponseError = <T,>(response: Response, data: T | ApiResponseError): data is ApiResponseError => {
    return !response.ok
}
