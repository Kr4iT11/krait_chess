import { Inject, Injectable } from '@nestjs/common';
import { CreateGameDto, GameStatus, GameResult, PlayerResult } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Game } from '../entities/Games';
import { v4 as uuidv4 } from 'uuid';
import { GamePlayer } from '../entities/GamePlayers';
import { DataSource } from 'typeorm';
import { MoveDto } from './dto/move.dto';
import { Chess } from 'chess.js';

@Injectable()
export class GamesService {

  constructor(
    @InjectRepository(Game) private gameRepository: Repository<Game>,
    @InjectRepository(GamePlayer) private gamePlayersRepository: Repository<GamePlayer>
    , private dataSource: DataSource,
  ) { }
  async create(createGameDto: CreateGameDto) {
    return await this.dataSource.transaction(async manager => {
      // check if user already has an ongoing game
      const exsitingGame = await manager
        .getRepository(GamePlayer)
        .createQueryBuilder('gp')
        .setLock('pessimistic_write')
        .where('gp.userId = :userId', {
          userId: createGameDto.userId,
        })
        .andWhere('gp.result = :result', {
          result: 'unknown',
        })
        .getOne();
      // if on going game, return it;
      if (exsitingGame) {
        return createGameDto.userId ? await this.getGameByUserIdTransaction(manager, createGameDto.userId) : null;
      }
      // if not, check if there is any ongoing game with status created, if yes then join the game instead of creating a new game
      // check if any ongoing game with status created , if yes then join the game instead of creating a new game
      const anyOngoingCreatedGame = await manager.getRepository(Game)
        .createQueryBuilder('g')
        .innerJoinAndSelect('g.gamePlayers', 'gp')
        .setLock('pessimistic_write')
        .where('g.status = :status', {
          status: GameStatus.CREATED,
        })
        .getOne();
      const alreadyJoined = anyOngoingCreatedGame?.gamePlayers.some(gp => gp.userId === createGameDto.userId);
      if (alreadyJoined) {
        throw new Error('User already joined this game');
      }
      if (anyOngoingCreatedGame) {
        const gamePlayer = manager.getRepository(GamePlayer).create({
          gameId: anyOngoingCreatedGame.id,
          userId: createGameDto.userId,
          side: anyOngoingCreatedGame.gamePlayers.find(gp => gp.userId !== createGameDto.userId)?.side === 'white' ? 'black' : 'white', // assign the opposite side
          isWinner: false,
          ratingBefore: null,
          ratingAfter: null,
          isBot: false,
          disconnectedAt: null,
          result: PlayerResult.UNKNOWN,
        });
        await manager.getRepository(GamePlayer).save(gamePlayer);
        return createGameDto.userId ? await this.getGameByUserIdTransaction(manager, createGameDto.userId) : null;
      }

      // if no ongoing game with status created, then create a new game
      // save game
      const game = manager.getRepository(Game).create({
        uuid: uuidv4(),
        variant: createGameDto.variant,
        timeControl: createGameDto.timeControl,
        status: createGameDto.status,
        result: createGameDto.result,
        movesCount: createGameDto.moves_count ?? 0,
        currentFen: createGameDto.current_fen,
        createdAt: new Date(),
        visibility: createGameDto.visibility,
        startedAt: null,
        finishedAt: null,
        terminationReason: null,
      });
      const savedGame = await manager.getRepository(Game).save(game);

      // save game player
      const gamePlayer = manager.getRepository(GamePlayer).create({
        gameId: savedGame.id,
        userId: createGameDto.userId,
        side: Math.random() < 0.5 ? 'white' : 'black', // randomly assign white or black
        isWinner: false,
        ratingBefore: null,
        ratingAfter: null,
        isBot: false,
        disconnectedAt: null,
        result: PlayerResult.UNKNOWN,
      });
      await manager.getRepository(GamePlayer).save(gamePlayer);
      if (gamePlayer && createGameDto.userId) {
        this.getGameByUserIdTransaction(manager, createGameDto.userId); // wont work because this is not part of transaction, need to move this inside transaction or use the same manager to query
      }
      const userGame = createGameDto.userId ? await this.getGameByUserIdTransaction(manager, createGameDto.userId) : null; // this is not working because this is not part of transaction
      return userGame;
    });
  }

  findAll() {
    return `This action returns all games`;
  }

  async getGameByUserId(userId: string) {
    return await this.gameRepository
      .createQueryBuilder('g')
      .innerJoin('g.gamePlayers', 'gp')
      .select(['g', 'gp'])
      .where('gp.userId = :userId', { userId })
      .andWhere('g.status = :status', {
        status: GameStatus.CREATED,
      })
      .andWhere('gp.isActive = :isActive', {
        isActive: true,
      })
      .andWhere('gp.result = :result', {
        result: PlayerResult.UNKNOWN,
      })
      .getOne();
  }
  async getGameByUserIdTransaction(
    manager: EntityManager,
    userId: string,
  ) {
    return manager
      .getRepository(Game)
      .createQueryBuilder('g')
      .innerJoinAndSelect('g.gamePlayers', 'gp')
      .where('gp.userId = :userId', { userId })
      .andWhere('g.status = :status', {
        status: GameStatus.CREATED,
      })
      .andWhere('gp.isActive = :isActive', {
        isActive: true,
      })
      .andWhere('gp.result = :result', {
        result: PlayerResult.UNKNOWN,
      })
      .getOne();
  }
  getGameByUuid(uuid: string) {
    return this.gameRepository
      .createQueryBuilder('g')
      .innerJoin('g.gamePlayers', 'gp')
      .select(['g', 'gp'])
      .where('g.uuid = :uuid', { uuid })
      .andWhere('g.status = :status', {
        status: GameStatus.CREATED,
      })
      .andWhere('gp.isActive = :isActive', {
        isActive: true,
      })
      .andWhere('gp.result = :result', {
        result: PlayerResult.UNKNOWN,
      })
      .getOne();
  }

  // we will need server side move validation and game state management here, but for now let's just consider from front end
  // here we would validate the move, update the game state, determine if the game is over, etc.
  // for simplicity, let's just increment the moves count and return the game state
  // send move and fen both and then calculate
  // we will also need to create move history table to store the move history for each game, but for now let's just keep it in memory or we can also store it in the game table as json array
  async move(uuid: string, userId: string, moveDto: MoveDto) {
    return await this.dataSource.transaction(async manager => {

      const gameRepo = manager.getRepository(Game);
      const gamePlayerRepo = manager.getRepository(GamePlayer);
      // lock the game row to prevent concurrent moves
      const game = await gameRepo
        .createQueryBuilder('g')
        .leftJoinAndSelect('g.gamePlayers', 'gp')
        .setLock('pessimistic_write')
        .where('g.uuid = :uuid', { uuid })
        .getOne();
      // get the players for the games
      const gamePlayer = await gamePlayerRepo.createQueryBuilder('gp')
        .setLock('pessimistic_write')
        .where('gp.gameId = :gameId', { gameId: game?.id })
        .andWhere('gp.isActive = :isActive', { isActive: true })
        .andWhere('gp.result = :result', { result: PlayerResult.UNKNOWN })
        .getMany();
      if (!game) {
        throw new Error('Game not found');
      }
      if (game.status !== GameStatus.ONGOING && game.status !== GameStatus.CREATED) {
        throw new Error('Game is not active');
      }
      if (!gamePlayer.length) {
        throw new Error('Player not found in this game');
      }
      const side = game.gamePlayers.find(gp => gp.userId === userId)?.side;

      const chess = new Chess(game.currentFen || undefined);
      const chessTurn = chess.turn();

      // if chess turn is white and player side is not white or chess turn is black and player side is not black, then it's not player's turn
      if ((side === 'white' && chessTurn !== 'w') || (side === 'black' && chessTurn !== 'b')) {
        throw new Error('Not your turn');
      }
      // validate the move
      const validateChessMove = chess.move({
        from: moveDto.from,
        to: moveDto.to,
        promotion: moveDto.promotion,
      });
      // we first validate the move using chess.js, if the move is invalid, chess.js will return null, if the move is valid, it will return the move object
      if (!validateChessMove) {
        throw new Error('Invalid move');
      }
      game.startedAt = game.startedAt || new Date();
      game.movesCount = (game.movesCount || 0) + 1;
      game.currentFen = chess.fen();

      if (chess.isCheckmate()) {
        this.updateAsWin(game, side, gamePlayer, userId);
      } else if (chess.isDraw()) {
        this.updateAsDraw(game, gamePlayer, userId);
      } else {
        // if the move is valid and the game is not over, just update the game state
        game.status = GameStatus.ONGOING;
      }
      await manager.save([game, gamePlayer]);
      return await gameRepo.findOne({
        where: { uuid },
      });
    });
  }

  private updateAsDraw(game: Game, gamePlayer: GamePlayer[], userId: string) {
    game.status = GameStatus.FINISHED;
    game.result = GameResult.DRAW;
    game.finishedAt = new Date();
    gamePlayer.find(gp => gp.userId === userId)!.result = PlayerResult.DRAW;
    gamePlayer.find(gp => gp.userId === userId)!.isActive = false;
    gamePlayer.find(gp => gp.userId !== userId)!.result = PlayerResult.DRAW;
    gamePlayer.find(gp => gp.userId !== userId)!.isActive = false;
  }

  private updateAsWin(game: Game, side: string | undefined, gamePlayer: GamePlayer[], userId: string) {
    game.status = GameStatus.FINISHED;
    game.result = side === 'white' ? GameResult.WHITE_WIN : GameResult.BLACK_WIN;
    game.finishedAt = new Date();
    gamePlayer.find(gp => gp.userId === userId)!.isWinner = true;
    gamePlayer.find(gp => gp.userId === userId)!.result = PlayerResult.WIN;
    gamePlayer.find(gp => gp.userId === userId)!.isActive = false;
    gamePlayer.find(gp => gp.userId !== userId)!.isWinner = false;
    gamePlayer.find(gp => gp.userId !== userId)!.result = PlayerResult.LOSS;
    gamePlayer.find(gp => gp.userId !== userId)!.isActive = false;
  }
}
