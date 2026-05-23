import { Inject, Injectable } from '@nestjs/common';
import { CreateGameDto, GameStatus, GameResult, PlayerResult } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
        return createGameDto.userId ? await this.getGameByUserId(createGameDto.userId) : null;
      }

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
        result: 'unknown',
      });
      await manager.getRepository(GamePlayer).save(gamePlayer);
      if (gamePlayer && createGameDto.userId) {
        this.getGameByUserId(createGameDto.userId);
      }
      const userGame = createGameDto.userId ? await this.getGameByUserId(createGameDto.userId) : null;

      return userGame;
    });
  }

  findAll() {
    return `This action returns all games`;
  }

  getGameByUserId(userId: string) {
    return this.gameRepository
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
  async move(uuid: string, moveDto: MoveDto) {
    return await this.dataSource.transaction(async manager => {

      const gameRepo = manager.getRepository(Game);
      // lock the game row to prevent concurrent moves
      const game = await gameRepo
        .createQueryBuilder('g')
        .setLock('pessimistic_write')
        .where('g.uuid = :uuid', { uuid })
        .getOne();

      if (!game) {
        throw new Error('Game not found');
      }

      const chess = new Chess(game.currentFen || undefined);
      // validate the move
      const result = chess.move({
        from: moveDto.from,
        to: moveDto.to,
        promotion: moveDto.promotion,
      });

      if (!result) {
        throw new Error('Invalid move');
      }

      game.movesCount += 1;
      game.currentFen = chess.fen();

      await gameRepo.save(game);

      return await gameRepo.findOne({
        where: { uuid },
      });
    });
  }
}
