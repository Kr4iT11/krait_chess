import { apiEndpoints } from "../../../config/apiEndpoints";
// import type { TSignInSchema, TSignUpSchema } from "../../../lib/validators/authvalidations";
import { apiService } from "../../../service/apiService";

export interface CreateGamePayload {
    variant : 'standard';
    timeControl : 'unlimited';
    visibility : 'public' | 'private';
}
export const createGame = async (payload: CreateGamePayload): Promise<any> =>
    await apiService.post(apiEndpoints.games.create, payload)  ;