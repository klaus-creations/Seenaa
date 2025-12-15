import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { eq, and, desc, sql, or, ilike, InferSelectModel } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../database/schema'; // Adjust path
import { v4 as uuidv4 } from 'uuid';
import { CreateCommunityDto } from './dto/create-community.dto';
import { CommunityQueryDto } from './dto/community-query.dto';
import { JoinCommunityDto } from './dto/join-community.dto';
import { ReviewRequestDto } from './dto/review-request.dto';

@Injectable()
export class CommunityService {
  constructor(@Inject('DB') private db: NodePgDatabase<typeof schema>) {}

  /**
   * Create a new community
   * Wraps creation + member insertion in a transaction
   */
  async create(userId: string, dto: CreateCommunityDto) {
    // 1. Check Slug Uniqueness
    const existing = await this.db.query.community.findFirst({
      where: eq(schema.community.slug, dto.slug),
    });

    if (existing) {
      throw new ConflictException('Community URL (slug) is already taken.');
    }

    const communityId = uuidv4();

    // 2. Transaction: Create Community -> Add Creator -> Increment Count
    return await this.db.transaction(async (tx) => {
      // A. Insert Community
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
          memberCount: 1, // Start with 1 (the creator)
        })
        .returning();

      // B. Insert Creator as Admin/Owner
      await tx.insert(schema.communityMember).values({
        id: uuidv4(),
        communityId: communityId,
        userId: userId,
        role: 'creator',
        status: 'active',
      });

      return newCommunity;
    });
  }

  /**
   * Get all communities (Discovery)
   */
  async findAll(query: CommunityQueryDto) {
    const { limit = 20, offset = 0, search } = query;

    const whereClause = search
      ? or(
          ilike(schema.community.name, `%${search}%`),
          ilike(schema.community.description, `%${search}%`),
        )
      : undefined;

    const communities = await this.db.query.community.findMany({
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

    return communities;
  }

  /**
   * Get one community by Slug or ID
   * Includes the current user's membership status
   */
  /**
   * Get one community by Slug or ID
   * Includes the current user's membership status
   */
  async findOne(identifier: string, userId: string | null) {
    // identifier can be slug or UUID. Check slug first (common case)
    let community = await this.db.query.community.findFirst({
      where: eq(schema.community.slug, identifier),
    });

    if (!community) {
      community = await this.db.query.community.findFirst({
        where: eq(schema.community.id, identifier),
      });
    }

    if (!community) throw new NotFoundException('Community not found');

    // FIX: Explicitly type these variables to match Drizzle's return type
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
        hasPendingRequest: !!pendingRequest,
      },
    };
  }

  /**
   * Join a community
   * Handles: Public Join, Private Join (Error), Join Requests, Re-joining
   */
  async join(communityId: string, userId: string, dto: JoinCommunityDto) {
    const community = await this.db.query.community.findFirst({
      where: eq(schema.community.id, communityId),
    });

    if (!community) throw new NotFoundException('Community not found');

    // 1. Check existing membership
    const existingMember = await this.db.query.communityMember.findFirst({
      where: and(
        eq(schema.communityMember.communityId, communityId),
        eq(schema.communityMember.userId, userId),
      ),
    });

    if (existingMember) {
      if (existingMember.status === 'active') {
        throw new ConflictException('You are already a member.');
      }
      if (existingMember.status === 'banned') {
        throw new ForbiddenException('You are banned from this community.');
      }
      if (existingMember.status === 'pending') {
        throw new ConflictException(
          'You already have a pending invitation/status.',
        );
      }
      // If status is 'left', we allow re-joining below
    }

    // 2. Handle Logic based on Privacy/Approval
    // if (community.isPrivate && !existingMember) {
    //   // Private communities require an Invitation (handled in a separate service/method usually)
    //   throw new ForbiddenException(
    //     'This is a private community. You must be invited.',
    //   );
    // }

    if (community.requireApproval) {
      // Check if request already exists
      const existingReq = await this.db.query.communityJoinRequest.findFirst({
        where: and(
          eq(schema.communityJoinRequest.communityId, communityId),
          eq(schema.communityJoinRequest.userId, userId),
          eq(schema.communityJoinRequest.status, 'pending'),
        ),
      });
      if (existingReq)
        throw new ConflictException('Join request already pending.');

      // Create Request
      await this.db.insert(schema.communityJoinRequest).values({
        id: uuidv4(),
        communityId,
        userId,
        message: dto.message,
        status: 'pending',
      });
      return {
        status: 'request_sent',
        message: 'Your request to join has been sent.',
      };
    }

    // 3. Direct Join (Public + No Approval) OR Re-join ('left')
    if (existingMember && existingMember.status === 'left') {
      // Re-activate member
      await this.db
        .update(schema.communityMember)
        .set({ status: 'active', joinedAt: new Date(), leftAt: null })
        .where(eq(schema.communityMember.id, existingMember.id));
    } else {
      // New member
      await this.db.insert(schema.communityMember).values({
        id: uuidv4(),
        communityId,
        userId,
        role: 'member',
        status: 'active',
      });
    }

    // Atomically increment member count
    await this.db
      .update(schema.community)
      .set({ memberCount: sql`${schema.community.memberCount} + 1` })
      .where(eq(schema.community.id, communityId));

    return { status: 'joined', message: 'Successfully joined the community.' };
  }

  /**
   * Leave a community
   */
  async leave(communityId: string, userId: string) {
    const member = await this.db.query.communityMember.findFirst({
      where: and(
        eq(schema.communityMember.communityId, communityId),
        eq(schema.communityMember.userId, userId),
        eq(schema.communityMember.status, 'active'),
      ),
    });

    if (!member) throw new BadRequestException('You are not an active member.');
    if (member.role === 'creator')
      throw new ForbiddenException(
        'The creator cannot leave the community. Transfer ownership first.',
      );

    // Soft delete (change status)
    await this.db
      .update(schema.communityMember)
      .set({ status: 'left', leftAt: new Date() })
      .where(eq(schema.communityMember.id, member.id));

    // Decrement count
    await this.db
      .update(schema.community)
      .set({ memberCount: sql`${schema.community.memberCount} - 1` })
      .where(eq(schema.community.id, communityId));

    return { message: 'You have left the community.' };
  }

  /**
   * Review Join Request (Admin/Mod only)
   */
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
      throw new BadRequestException('Request already processed');

    // Verify Admin Permissions
    await this.verifyPermission(request.communityId, adminId, [
      'creator',
      'admin',
      'moderator',
    ]);

    const now = new Date();

    if (dto.status === 'rejected') {
      await this.db
        .update(schema.communityJoinRequest)
        .set({ status: 'rejected', reviewedBy: adminId, reviewedAt: now })
        .where(eq(schema.communityJoinRequest.id, requestId));
      return { message: 'Request rejected' };
    }

    // If Approved: Transaction needed to update request AND add member
    await this.db.transaction(async (tx) => {
      // 1. Update Request
      await tx
        .update(schema.communityJoinRequest)
        .set({ status: 'approved', reviewedBy: adminId, reviewedAt: now })
        .where(eq(schema.communityJoinRequest.id, requestId));

      // 2. Add Member (Check for 'left' status upsert logic if needed, but usually new row for requests)
      // We assume clean slate or unique index handles conflicts.
      // Better to check existence inside tx for robustness.
      const existing = await tx.query.communityMember.findFirst({
        where: and(
          eq(schema.communityMember.communityId, request.communityId),
          eq(schema.communityMember.userId, request.userId),
        ),
      });

      if (existing) {
        await tx
          .update(schema.communityMember)
          .set({ status: 'active', joinedAt: now })
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

      // 3. Increment Count
      await tx
        .update(schema.community)
        .set({ memberCount: sql`${schema.community.memberCount} + 1` })
        .where(eq(schema.community.id, request.communityId));
    });

    return { message: 'User approved and added to community' };
  }

  // Get pending requests (Admin/Mod only)
  async getPendingRequests(communityId: string, userId: string) {
    await this.verifyPermission(communityId, userId, [
      'creator',
      'admin',
      'moderator',
    ]);

    return await this.db.query.communityJoinRequest.findMany({
      where: and(
        eq(schema.communityJoinRequest.communityId, communityId),
        eq(schema.communityJoinRequest.status, 'pending'),
      ),
      orderBy: [desc(schema.communityJoinRequest.createdAt)],
      with: {
        // Assuming you have a relation defined in schema, otherwise fetch user details separately
        // For now returning raw IDs, in real app you join with User table
      },
    });
  }

  // ==============================
  // HELPERS
  // ==============================

  /**
   * Helper to verify if user has specific roles in a community
   */
  private async verifyPermission(
    communityId: string,
    userId: string,
    allowedRoles: string[],
  ) {
    const member = await this.db.query.communityMember.findFirst({
      where: and(
        eq(schema.communityMember.communityId, communityId),
        eq(schema.communityMember.userId, userId),
        eq(schema.communityMember.status, 'active'),
      ),
    });

    if (!member || !allowedRoles.includes(member.role)) {
      throw new ForbiddenException(
        'You do not have permission to perform this action.',
      );
    }
    return member;
  }
}
