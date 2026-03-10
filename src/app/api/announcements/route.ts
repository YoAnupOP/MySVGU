import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { announcementSchema } from '@/lib/validations';

// GET all announcements
export async function GET() {
    try {
        const announcements = await prisma.announcement.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                postedBy: {
                    select: { name: true, role: true }
                }
            }
        });

        return NextResponse.json({
            success: true,
            announcements
        });

    } catch (error) {
        console.error('Error fetching announcements:', error);
        return NextResponse.json(
            { error: 'Failed to fetch announcements' },
            { status: 500 }
        );
    }
}

// POST - Create announcement (Faculty/Admin only)
export async function POST(request: NextRequest) {
    try {
        const authUser = await getCurrentUser();

        if (!authUser) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Check role - only Faculty and Admin can create announcements
        if (authUser.role !== 'FACULTY' && authUser.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Only faculty and admin can create announcements' },
                { status: 403 }
            );
        }

        const body = await request.json();

        // Validate input
        const result = announcementSchema.safeParse(body);
        if (!result.success) {
            const errors = result.error.issues.map((e) => ({
                field: e.path.join('.'),
                message: e.message
            }));
            return NextResponse.json(
                { error: 'Validation failed', errors },
                { status: 400 }
            );
        }

        const { title, content, priority, department, targetProgram, targetSemester } = result.data;

        // Create announcement
        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                priority: priority || 'normal',
                department,
                targetProgram,
                targetSemester,
                postedById: authUser.userId
            },
            include: {
                postedBy: {
                    select: { name: true, role: true }
                }
            }
        });

        return NextResponse.json({
            success: true,
            announcement
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating announcement:', error);
        return NextResponse.json(
            { error: 'Failed to create announcement' },
            { status: 500 }
        );
    }
}
