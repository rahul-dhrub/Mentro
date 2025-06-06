/**
 * @swagger
 * /api/assignments:
 *   get:
 *     summary: Get assignments
 *     description: Retrieve all assignments or filter by course/lesson
 *     tags: [Assignments]
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter assignments by course ID
 *       - in: query
 *         name: lessonId
 *         schema:
 *           type: string
 *         description: Filter assignments by lesson ID
 *     responses:
 *       200:
 *         description: Successfully retrieved assignments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Assignment'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Create a new assignment
 *     description: Create a new assignment for a course or lesson
 *     tags: [Assignments]
 *     security:
 *       - ClerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - dueDate
 *               - totalMarks
 *               - courseId
 *             properties:
 *               title:
 *                 type: string
 *                 description: Assignment title
 *                 example: "Chapter 5 Quiz"
 *               description:
 *                 type: string
 *                 description: Assignment description
 *                 example: "Complete the quiz on data structures"
 *               content:
 *                 type: string
 *                 description: Assignment content/instructions
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: Assignment due date
 *                 example: "2024-12-31T23:59:59Z"
 *               totalMarks:
 *                 type: integer
 *                 minimum: 1
 *                 description: Total marks for the assignment
 *                 example: 100
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of attachment URLs
 *               courseId:
 *                 type: string
 *                 description: Course ID this assignment belongs to
 *               lessonId:
 *                 type: string
 *                 description: Lesson ID this assignment belongs to (optional)
 *               isPublished:
 *                 type: boolean
 *                 default: false
 *                 description: Whether the assignment is published
 *               createdBy:
 *                 type: string
 *                 description: ID of the user who created the assignment
 *     responses:
 *       201:
 *         description: Assignment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Assignment'
 *       400:
 *         description: Bad request - Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Assignment from '@/models/Assignment';

// GET /api/assignments - Get all assignments or filter by course/lesson
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const lessonId = searchParams.get('lessonId');
    
    let filter: any = {};
    
    if (courseId) {
      filter.courseId = courseId;
    }
    
    if (lessonId) {
      filter.lessonId = lessonId;
    }
    
    const assignments = await Assignment
      .find(filter)
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

// POST /api/assignments - Create new assignment
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const {
      title,
      description,
      content,
      dueDate,
      totalMarks,
      attachments,
      courseId,
      lessonId,
      isPublished,
      createdBy
    } = body;
    
    // Validation
    if (!title || !dueDate || !totalMarks || !courseId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const assignment = new Assignment({
      title,
      description: description || '',
      content: content || '',
      dueDate: new Date(dueDate),
      totalMarks: parseInt(totalMarks),
      attachments: attachments || [],
      courseId,
      lessonId,
      isPublished: isPublished || false,
      createdBy: createdBy || 'system',
    });
    
    const savedAssignment = await assignment.save();
    
    return NextResponse.json({
      success: true,
      data: savedAssignment
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
} 