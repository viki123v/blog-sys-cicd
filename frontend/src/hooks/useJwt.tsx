import { useMemo } from "react"
import {jwtDecode} from 'jwt-decode'

export class UnAuthorizedError extends Error{}


const useJwt = (strict:boolean) => { 
    const username = useMemo(() => { 
        const jwt = localStorage.getItem("jwt")
        if(jwt) 
            return jwtDecode<{username:string}>(jwt)['username'] 
        return undefined 
    },[])

    if(strict && !username)
        throw new UnAuthorizedError("No jwt provided")

    return username
}

export default useJwt