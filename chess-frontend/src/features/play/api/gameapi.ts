import { apiEndpoints } from "../../../config/apiEndpoints";
// import type { TSignInSchema, TSignUpSchema } from "../../../lib/validators/authvalidations";
import { apiService } from "../../../service/apiService";


export const create = async (): Promise<any> =>
    await apiService.post(apiEndpoints.games.create)  ;