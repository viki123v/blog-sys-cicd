export const processUserRegisterFormData = (rawData:FormData, file_keys:string[], pass_keys:string[]): [Record<string,string>, File|undefined]=> { 
    let file:File|undefined  
    const data: Record<string,string> = {} 

    for(const [key, value] of rawData.entries()){
        if(key in pass_keys) continue
        // if(key==='retype-password') continue
        else if(key in file_keys){
            if(file) throw new Error("Multiple files are not supported")
            file = value as File 
        } 
        else if (typeof value === "string") {
            data[key] = value
        }
    }

    return [data,file]
} 

export const processTextForm = (formData:FormData) => processUserRegisterFormData(formData,[],[])[0] 