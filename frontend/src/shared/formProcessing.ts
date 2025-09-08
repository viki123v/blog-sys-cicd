export const processUserRegisterFormData = (rawData:FormData): [Record<string,string>, File|undefined]=> { 
    let file:File|undefined  
    const data: Record<string,string> = {} 

    for(const [key, value] of rawData.entries()){
        if(key==='retype-password') continue
        else if(key === 'logo'){
            if(file) throw new Error("Multiple files are not supported")
            file = value as File 
        } 
        else if (key !== "logo" && typeof value === "string") {
            data[key] = value
        }
    }

    return [data,file]
} 