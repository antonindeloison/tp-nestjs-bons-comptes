import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { JwtAuthGuard } from '../auth/guards/auth.guard.js';
import {
  ApiErrors,
  ApiJwtAuth,
} from '../common/swagger/api-docs.decorators.js';
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

  // TODO étape 2 : route POST (déclarer une dépense). Utilisez @Body() avec CreateExpenseDto.

  // TODO étape 3 : route DELETE ':id' protégée par ExpenseOwnerGuard (@UseGuards).
  //   Répondre 204 (@HttpCode(HttpStatus.NO_CONTENT)).
  //   Refactorisez aussi les routes précédentes pour utiliser @CurrentUser('userId')
  //   à la place de @Req().
}
