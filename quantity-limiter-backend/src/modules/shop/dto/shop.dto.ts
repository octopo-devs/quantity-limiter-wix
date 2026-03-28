import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';
import { DefaultAuthRequest } from 'src/docs/default/default-request.swagger';

export class UpdateOnboardingDto extends DefaultAuthRequest {
  @IsEmail()
  email: string;
}

export class UpdateGeneralSettingDto extends DefaultAuthRequest {
  @IsOptional()
  @IsString()
  customCss?: string;

  @IsOptional()
  @IsNumber()
  enableApp?: number;

  @IsOptional()
  @IsString()
  dateFormat?: string;

  @IsOptional()
  @IsString()
  dateLocale?: string;

  @IsOptional()
  @IsBoolean()
  hasScript?: boolean;

  @IsOptional()
  @IsBoolean()
  displayOnboarding?: boolean;
}
