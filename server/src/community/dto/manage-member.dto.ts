import { IsEnum, IsOptional, IsString, IsBoolean, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminPermissionsDto {
  @IsBoolean()
  canManageInfo: boolean;

  @IsBoolean()
  canManageMembers: boolean;

  @IsBoolean()
  canManageRoles: boolean;

  @IsBoolean()
  canVerifyPosts: boolean;

  @IsBoolean()
  canDeletePosts: boolean;
}

export class UpdateMemberRoleDto {
  @IsEnum(['admin', 'member'])
  role: 'admin' | 'member';
  @IsOptional()
  @ValidateNested()
  @Type(() => AdminPermissionsDto)
  permissions?: AdminPermissionsDto;
}

export class BanMemberDto {
  @IsString()
  @IsNotEmpty()
  reason: string;
}
