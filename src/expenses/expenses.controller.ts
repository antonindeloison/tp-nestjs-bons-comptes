import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/auth.guard.js';
import {
  ApiErrors,
  ApiJwtAuth,
} from '../common/swagger/api-docs.decorators.js';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { ExpensesService } from './expenses.service.js';
import { ExpenseOwnerGuard } from './guards/expense-owner.guard.js';

@Controller('wallets/:walletId/expenses')
@ApiTags('expenses')
@UseGuards(JwtAuthGuard)
@ApiJwtAuth()
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les dépenses et leur total' })
  @ApiOkResponse({ description: 'Dépenses du porte-monnaie et montant total.' })
  @ApiErrors({
    403: 'L’utilisateur n’est pas membre du porte-monnaie.',
    404: 'Porte-monnaie introuvable.',
  })
  findAll(
    @Param('walletId') walletId: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.expensesService.findAll(walletId, userId);
  }

  @Post()
  @ApiOperation({
    summary: 'Déclarer une dépense',
    description:
      'Le dépenseur est l’utilisateur connecté, sauf si `paidById` désigne un autre membre.',
  })
  @ApiCreatedResponse({ description: 'Dépense créée.' })
  @ApiErrors({
    400: 'Données invalides.',
    403: 'L’utilisateur ou le dépenseur n’est pas membre du porte-monnaie.',
    404: 'Porte-monnaie introuvable.',
    409: 'Le porte-monnaie est clôturé.',
  })
  create(
    @Param('walletId') walletId: string,
    @Body() dto: CreateExpenseDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.expensesService.create(walletId, userId, dto);
  }

  @Delete(':id')
  @UseGuards(ExpenseOwnerGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprimer une dépense' })
  @ApiNoContentResponse({ description: 'Dépense supprimée.' })
  @ApiErrors({
    403: 'Seul le dépenseur ou le créateur de la dépense peut la supprimer.',
    404: 'Dépense introuvable.',
    409: 'Le porte-monnaie est clôturé.',
  })
  remove(@Param('walletId') walletId: string, @Param('id') id: string) {
    return this.expensesService.remove(walletId, id);
  }
}
