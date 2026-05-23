import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Req } from '@nestjs/common';
import { GamesService } from './games.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MoveDto } from './dto/move.dto';

@UseGuards(JwtAuthGuard)
@ApiTags('games') // Groups endpoints under the "games" tag in Swagger
@ApiBearerAuth('JWT-auth')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) { }

  @Get('game/:userId')
  async findOnGoingGame(@Param('userId') userId: string) {
    return this.gamesService.getGameByUserId(userId);
  }
  @Get('get-by-uuid/:uuid')
  async getGameByUuid(@Param('uuid') uuid: string) {
    return this.gamesService.getGameByUuid(uuid);
  }
  @Post('create')
  async create(@Request() req, @Body() createGameDto: CreateGameDto) {
    createGameDto.userId = req.user.id.toString();
    return this.gamesService.create(createGameDto);
  }
  @Patch('move/:uuid')
  async move(@Param('uuid') uuid: string, @Body() moveDto: MoveDto) {
    console.warn('moveDto', moveDto);
    return this.gamesService.move(uuid, moveDto);
  }
}
