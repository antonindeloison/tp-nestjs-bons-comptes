import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { JwtAuthGuard } from '../auth/guards/auth.guard.js';
import {
  ApiErrors,
  ApiJwtAuth,
} from '../common/swagger/api-docs.decorators.js';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { ExpensesService } from './expenses.service.js';

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
    @Req() request: AuthenticatedRequest,
  ) {
    return this.expensesService.findAll(walletId, request.user.userId);
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
    @Req() request: AuthenticatedRequest,
  ) {
    return this.expensesService.create(walletId, request.user.userId, dto);
  }

  // TODO étape 3 : route DELETE ':id' protégée par ExpenseOwnerGuard (@UseGuards).
  //   Répondre 204 (@HttpCode(HttpStatus.NO_CONTENT)).
  //   Refactorisez aussi les routes précédentes pour utiliser @CurrentUser('userId')
  //   à la place de @Req().
}
