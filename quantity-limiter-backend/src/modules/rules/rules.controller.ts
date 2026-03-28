import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { DefaultResponse } from 'src/docs/default/default-response.swagger';
import { RulesService } from './rules.service';
import { CreateRuleDto, GetRulesDto, SeedRulesDto, UpdateRuleDto } from './dto/rules.dto';
import { GetRuleResponse, GetRulesResponse, SaveRuleResponse, SeedRulesResponse } from './response/rules.response';

@Controller('rules')
@ApiTags('Rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of rules with pagination' })
  @ApiOkResponse({ type: GetRulesResponse })
  getRules(@Query() query: GetRulesDto): Promise<GetRulesResponse> {
    return this.rulesService.getRules(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get rule by ID' })
  @ApiParam({ name: 'id', description: 'Rule ID', type: String })
  @ApiOkResponse({ type: GetRuleResponse })
  getRuleById(@Param('id') id: string, @Query('shop') shop: string): Promise<GetRuleResponse> {
    return this.rulesService.getRuleById(id, shop);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new rule' })
  @ApiOkResponse({ type: SaveRuleResponse })
  createRule(@Body() body: CreateRuleDto): Promise<SaveRuleResponse> {
    return this.rulesService.createRule(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing rule' })
  @ApiOkResponse({ type: SaveRuleResponse })
  updateRule(
    @Param('id') id: string,
    @Query('shop') shop: string,
    @Body() body: UpdateRuleDto,
  ): Promise<SaveRuleResponse> {
    return this.rulesService.updateRule(id, shop, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a rule by ID' })
  @ApiParam({ name: 'id', description: 'Rule ID', type: String })
  @ApiOkResponse({ type: DefaultResponse })
  deleteRule(@Param('id') id: string, @Query('shop') shop: string): Promise<DefaultResponse> {
    return this.rulesService.deleteRule(id, shop);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Seed rules for all types' })
  @ApiOkResponse({ type: SeedRulesResponse })
  seedRules(@Body() body: SeedRulesDto): Promise<SeedRulesResponse> {
    return this.rulesService.seedRules(body);
  }
}
