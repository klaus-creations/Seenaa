import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import {
  eq,
  and,
  desc,
  sql,
  or,
  ilike,
  InferSelectModel,
  SQL,
} from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../database/schema'; // Ensure this points to your schema file
import { v4 as uuidv4 } from 'uuid';

// Imports for DTOs and Types
import { CreateCommunityDto } from './dto/create-community.dto';
import { CommunityQueryDto } from './dto/community-query.dto';
import { JoinCommunityDto } from './dto/join-community.dto';
import { ReviewRequestDto } from './dto/review-request.dto';
import { UpdateMemberRoleDto } from './dto/manage-member.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CreateReportDto } from './dto/report.dto';
import { AdminPermissions } from './schema';

// Permission Keys Helper
type PermissionAction =
  | 'canManageInfo'
  | 'canManageMembers'
  | 'canManageRoles'
  | 'canVerifyPosts'
  | 'canDeletePosts';

@Injectable()
export class CommunityService {
  constructor(@Inject('DB') private db: NodePgDatabase<typeof schema>) {}

  /**
   * ==========================================================
   * 1. CREATE & DISCOVER
   * ==========================================================
   */

  async create(userId: string, dto: CreateCommunityDto) {
    const existing = await this.db.query.community.findFirst({
      where: eq(schema.community.slug, dto.slug),
    });

    if (existing) {
      throw new ConflictException('This Community Handle already exists');
    }

    const communityId = uuidv4();

    return await this.db.transaction(async (tx) => {
      // Create Community
      const [newCommunity] = await tx
        .insert(schema.community)
        .values({
          id: communityId,
          creatorId: userId,
          name: dto.name,
          slug: dto.slug,
          description: dto.description,
          isPrivate: dto.isPrivate ?? false,
          requireApproval: dto.requireApproval ?? false,
          requirePostApproval: false, // Default
          memberCount: 1,
        })
        .returning();

      // Create Creator (Admin/Owner)
      await tx.insert(schema.communityMember).values({
        id: uuidv4(),
        communityId: communityId,
        userId: userId,
        role: 'creator',
        status: 'active',
        permissions: {},
      });

      return newCommunity;
    });
  }

  async findAll(query: CommunityQueryDto) {
    const { limit = 20, offset = 0, search } = query;

    const whereClause = search
      ? or(
          ilike(schema.community.name, `%${search}%`),
          ilike(schema.community.description, `%${search}%`),
        )
      : undefined;

    return await this.db.query.community.findMany({
      where: whereClause,
      limit,
      offset,
      orderBy: [desc(schema.community.memberCount)],
      columns: {
        id: true,
        name: true,
        slug: true,
        description: true,
        avatar: true,
        memberCount: true,
        isPrivate: true,
      },
    });
  }

  async findOne(identifier: string, userId: string | null) {
    let community = await this.db.query.community.findFirst({
      where: eq(schema.community.slug, identifier),
    });

    if (!community) {
      community = await this.db.query.community.findFirst({
        where: eq(schema.community.id, identifier),
      });
    }

    if (!community) throw new NotFoundException('Community not found');

    let membership: InferSelectModel<typeof schema.communityMember> | undefined;
    let pendingRequest:
      | InferSelectModel<typeof schema.communityJoinRequest>
      | undefined;

    if (userId) {
      membership = await this.db.query.communityMember.findFirst({
        where: and(
          eq(schema.communityMember.communityId, community.id),
          eq(schema.communityMember.userId, userId),
        ),
      });

      if (!membership) {
        pendingRequest = await this.db.query.communityJoinRequest.findFirst({
          where: and(
            eq(schema.communityJoinRequest.communityId, community.id),
            eq(schema.communityJoinRequest.userId, userId),
            eq(schema.communityJoinRequest.status, 'pending'),
          ),
        });
      }
    }

    return {
      ...community,
      currentUser: {
        isMember: membership?.status === 'active',
        role: membership?.role || null,
        status: membership?.status || null,
        permissions: membership?.permissions || null,
        hasPendingRequest: !!pendingRequest,
      },
    };
  }

  /**
   * ==========================================================
   * 2. JOIN / LEAVE
   * ==========================================================
   */

  async join(communityId: string, userId: string, dto: JoinCommunityDto) {
    const community = await this.db.query.community.findFirst({
      where: eq(schema.community.id, communityId),
    });
    if (!community) throw new NotFoundException('Community not found');

    const existingMember = await this.db.query.communityMember.findFirst({
      where: and(
        eq(schema.communityMember.communityId, communityId),
        eq(schema.communityMember.userId, userId),
      ),
    });

    if (existingMember) {
      if (existingMember.status === 'active')
        throw new ConflictException('Already a member.');
      if (existingMember.status === 'banned')
        throw new ForbiddenException('You are banned.');
      // If 'left', allow rejoin below
    }

    // Approval Flow
    if (community.requireApproval) {
      const existingReq = await this.db.query.communityJoinRequest.findFirst({
        where: and(
          eq(schema.communityJoinRequest.communityId, communityId),
          eq(schema.communityJoinRequest.userId, userId),
          eq(schema.communityJoinRequest.status, 'pending'),
        ),
      });
      if (existingReq) throw new ConflictException('Join request pending.');

      await this.db.insert(schema.communityJoinRequest).values({
        id: uuidv4(),
        communityId,
        userId,
        message: dto.message,
        status: 'pending',
      });
      return { status: 'request_sent', message: 'Request sent.' };
    }

    // Direct Join or Re-Join
    if (existingMember && existingMember.status === 'left') {
      await this.db
        .update(schema.communityMember)
        .set({ status: 'active', joinedAt: new Date(), leftAt: null })
        .where(eq(schema.communityMember.id, existingMember.id));
    } else {
      await this.db.insert(schema.communityMember).values({
        id: uuidv4(),
        communityId,
        userId,
        role: 'member',
        status: 'active',
      });
    }

    await this.db
      .update(schema.community)
      .set({ memberCount: sql`${schema.community.memberCount} + 1` })
      .where(eq(schema.community.id, communityId));

    return { status: 'joined', message: 'Welcome to the community!' };
  }

  async leave(communityId: string, userId: string) {
    const member = await this.db.query.communityMember.findFirst({
      where: and(
        eq(schema.communityMember.communityId, communityId),
        eq(schema.communityMember.userId, userId),
        eq(schema.communityMember.status, 'active'),
      ),
    });

    if (!member) throw new BadRequestException('Not an active member.');
    if (member.role === 'creator')
      throw new ForbiddenException('Creator cannot leave.');

    await this.db
      .update(schema.communityMember)
      .set({ status: 'left', leftAt: new Date() })
      .where(eq(schema.communityMember.id, member.id));

    await this.db
      .update(schema.community)
      .set({ memberCount: sql`${schema.community.memberCount} - 1` })
      .where(eq(schema.community.id, communityId));

    return { message: 'You left the community.' };
  }

  /**
   * ==========================================================
   * 3. JOIN REQUEST REVIEW (Permissions: Members Management)
   * ==========================================================
   */

  async getPendingRequests(communityId: string, userId: string) {
    await this.checkPermission(communityId, userId, 'canManageMembers');

    return await this.db.query.communityJoinRequest.findMany({
      where: and(
        eq(schema.communityJoinRequest.communityId, communityId),
        eq(schema.communityJoinRequest.status, 'pending'),
      ),
      orderBy: [desc(schema.communityJoinRequest.createdAt)],
      with: {
          user: true,
      }
    });
  }

  async reviewJoinRequest(
    adminId: string,
    requestId: string,
    dto: ReviewRequestDto,
  ) {
    const request = await this.db.query.communityJoinRequest.findFirst({
      where: eq(schema.communityJoinRequest.id, requestId),
    });
    if (!request) throw new NotFoundException('Request not found');
    if (request.status !== 'pending')
      throw new BadRequestException('Already processed');

    await this.checkPermission(
      request.communityId,
      adminId,
      'canManageMembers',
    );

    if (dto.status === 'rejected') {
      await this.db
        .update(schema.communityJoinRequest)
        .set({
          status: 'rejected',
          reviewedBy: adminId,
          reviewedAt: new Date(),
        })
        .where(eq(schema.communityJoinRequest.id, requestId));
      return { message: 'Request rejected' };
    }

    // Approve
    await this.db.transaction(async (tx) => {
      await tx
        .update(schema.communityJoinRequest)
        .set({
          status: 'approved',
          reviewedBy: adminId,
          reviewedAt: new Date(),
        })
        .where(eq(schema.communityJoinRequest.id, requestId));

      const existing = await tx.query.communityMember.findFirst({
        where: and(
          eq(schema.communityMember.communityId, request.communityId),
          eq(schema.communityMember.userId, request.userId),
        ),
      });

      if (existing) {
        await tx
          .update(schema.communityMember)
          .set({ status: 'active', joinedAt: new Date() })
          .where(eq(schema.communityMember.id, existing.id));
      } else {
        await tx.insert(schema.communityMember).values({
          id: uuidv4(),
          communityId: request.communityId,
          userId: request.userId,
          role: 'member',
          status: 'active',
        });
      }

      await tx
        .update(schema.community)
        .set({ memberCount: sql`${schema.community.memberCount} + 1` })
        .where(eq(schema.community.id, request.communityId));
    });

    return { message: 'User approved' };
  }


  // Filter Members: 'all', 'banned', 'admin'
  async getMembers(
    communityId: string,
    userId: string,
    filter: 'all' | 'banned' | 'admin' | 'pending',
  ) {
    if (filter === 'banned' || filter === 'pending') {
      await this.checkPermission(communityId, userId, 'canManageMembers');
    }

    // FIX: Use an array of conditions for clean Drizzle usage
    const conditions: SQL[] = [
      eq(schema.communityMember.communityId, communityId),
    ];

    if (filter === 'banned') {
      conditions.push(eq(schema.communityMember.status, 'banned'));
    } else if (filter === 'admin') {
      conditions.push(eq(schema.communityMember.role, 'admin'));
    } else if (filter === 'all') {
      conditions.push(eq(schema.communityMember.status, 'active'));
    }

    // Pass the spread array to 'and()'
    return await this.db.query.communityMember.findMany({
      where: and(...conditions),
      limit: 50,
      orderBy: [desc(schema.communityMember.joinedAt)],
      with: {
          user: true,
      }
    });
  }

  // Promote/Demote & Assign Granular Permissions
  async updateMemberRole(
    actorId: string,
    communityId: string,
    targetUserId: string,
    dto: UpdateMemberRoleDto,
  ) {
    await this.checkPermission(communityId, actorId, 'canManageRoles');

    const target = await this.db.query.communityMember.findFirst({
      where: and(
        eq(schema.communityMember.communityId, communityId),
        eq(schema.communityMember.userId, targetUserId),
      ),
    });

    if (!target) throw new NotFoundException('Member not found');
    if (target.role === 'creator')
      throw new ForbiddenException('Cannot change Creator role.');
    if (target.userId === actorId)
      throw new BadRequestException('Cannot change your own role.');

    await this.db
      .update(schema.communityMember)
      .set({
        role: dto.role,
        permissions: dto.role === 'admin' ? dto.permissions : {},
      })
      .where(eq(schema.communityMember.id, target.id));

    return { message: `User updated to ${dto.role}` };
  }

  // Ban Logic
  async banMember(
    actorId: string,
    communityId: string,
    targetUserId: string,
    reason: string,
  ) {
    await this.checkPermission(communityId, actorId, 'canManageMembers');

    const target = await this.db.query.communityMember.findFirst({
      where: and(
        eq(schema.communityMember.communityId, communityId),
        eq(schema.communityMember.userId, targetUserId),
      ),
    });

    if (!target) throw new NotFoundException('Member not found');
    if (target.role === 'creator')
      throw new ForbiddenException('Cannot ban the Creator.');

    await this.db
      .update(schema.communityMember)
      .set({
        status: 'banned',
        bannedAt: new Date(),
        bannedBy: actorId,
        banReason: reason,
        permissions: {}, // Revoke permissions
      })
      .where(eq(schema.communityMember.id, target.id));

    // Decrement count
    await this.db
      .update(schema.community)
      .set({ memberCount: sql`${schema.community.memberCount} - 1` })
      .where(eq(schema.community.id, communityId));

    return { message: 'User has been banned.' };
  }

  // 5. SETTINGS & REPORTING
  async updateSettings(
    actorId: string,
    communityId: string,
    dto: UpdateSettingsDto,
  ) {
    await this.checkPermission(communityId, actorId, 'canManageInfo');

    await this.db
      .update(schema.community)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(schema.community.id, communityId));

    return { message: 'Settings updated' };
  }

  async createReport(
    reporterId: string,
    communityId: string,
    dto: CreateReportDto,
  ) {
    await this.db.insert(schema.communityReport).values({
      id: uuidv4(),
      communityId,
      reporterId,
      targetType: dto.targetType,
      targetId: dto.targetId,
      reason: dto.reason,
      status: 'pending',
    });
    return { message: 'Report submitted.' };
  }

  // Helper used by PostService to check if content needs approval
  async shouldPostBePending(
    communityId: string,
    userId: string,
  ): Promise<boolean> {
    const community = await this.db.query.community.findFirst({
      where: eq(schema.community.id, communityId),
      columns: { requirePostApproval: true },
    });

    if (!community?.requirePostApproval) return false;

    const member = await this.db.query.communityMember.findFirst({
      where: and(
        eq(schema.communityMember.communityId, communityId),
        eq(schema.communityMember.userId, userId),
      ),
    });

    // Admins and Creator bypass approval
    if (member?.role === 'creator' || member?.role === 'admin') return false;

    return true;
  }

  // PRIVATE HELPERS

  private async checkPermission(
    communityId: string,
    userId: string,
    action: PermissionAction,
  ) {
    const member = await this.db.query.communityMember.findFirst({
      where: and(
        eq(schema.communityMember.communityId, communityId),
        eq(schema.communityMember.userId, userId),
        eq(schema.communityMember.status, 'active'),
      ),
    });

    if (!member)
      throw new ForbiddenException('You are not a member of this community.');

    // 1. Creator has God Mode
    if (member.role === 'creator') return true;

    // 2. Members have no power
    if (member.role === 'member')
      throw new ForbiddenException('Insufficient permissions.');

    // 3. Admins check their JSON permissions
    const perms = member.permissions as AdminPermissions;
    if (member.role === 'admin' && perms && perms[action]) {
      return true;
    }

    throw new ForbiddenException(`You lack the ${action} permission.`);
  }
}
