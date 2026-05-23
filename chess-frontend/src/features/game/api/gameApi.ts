import { apiEndpoints } from "../../../config/apiEndpoints";
// import type { TSignInSchema, TSignUpSchema } from "../../../lib/validators/authvalidations";
import { apiService } from "../../../service/apiService";
import type { Game } from "../../../types/Game";
import type { GameMove } from "../../../types/GameMove";

// export interface CreateGamePayload {
//     variant : 'standard';
//     timeControl : 'unlimited';
//     visibility : 'public' | 'private';
// }
export const createGame = async (payload: Game): Promise<any> =>
    await apiService.post(apiEndpoints.games.create, payload);

export const getGameByUuid = async (uuid: string): Promise<any> =>
    await apiService.get(`${apiEndpoints.games.getByUuid}/${uuid}`);

export const movePiece = async (uuid: string, payload: GameMove): Promise<any> =>
    await apiService.patch(`${apiEndpoints.games.move}/${uuid}`, payload);