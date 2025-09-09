import { UnAuthorizedError } from "@hooks/useJwt";
import { redirect, useRouteError } from "react-router";

const UnathorizedErrorBoundary = () => {
    const error = useRouteError()

    if(!(error instanceof UnAuthorizedError))
        throw error 

    return redirect("/login")
}
 
export default UnathorizedErrorBoundary;