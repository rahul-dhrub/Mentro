import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Mentro API Documentation',
    version: '1.0.0',
    description: 'Comprehensive API documentation for the Mentro learning platform',
    contact: {
      name: 'Mentro Team',
      email: 'support@mentro.com',
    },
  },
  servers: [
    {
      url: process.env.NODE_ENV === 'production' 
        ? 'https://your-domain.com' 
        : 'http://localhost:3000',
      description: process.env.NODE_ENV === 'production' 
        ? 'Production server' 
        : 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      ClerkAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Clerk authentication token',
      },
    },
    schemas: {
      Post: {
        type: 'object',
        required: ['userId', 'content'],
        properties: {
          id: {
            type: 'string',
            description: 'Post ID',
          },
          userId: {
            type: 'string',
            description: 'ID of the user who created the post',
          },
          content: {
            type: 'string',
            description: 'Post content',
          },
          media: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Media',
            },
            description: 'Media attachments',
          },
          likes: {
            type: 'number',
            description: 'Number of likes',
          },
          likedBy: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Array of user IDs who liked the post',
          },
          comments: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Comment',
            },
            description: 'Post comments',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp',
          },
        },
      },
      Comment: {
        type: 'object',
        required: ['userId', 'postId', 'content'],
        properties: {
          id: {
            type: 'string',
            description: 'Comment ID',
          },
          userId: {
            type: 'string',
            description: 'ID of the user who created the comment',
          },
          userEmail: {
            type: 'string',
            description: 'Email of the comment author',
          },
          userName: {
            type: 'string',
            description: 'Name of the comment author',
          },
          postId: {
            type: 'string',
            description: 'ID of the post this comment belongs to',
          },
          content: {
            type: 'string',
            description: 'Comment content',
          },
          media: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Media',
            },
            description: 'Media attachments',
          },
          parentCommentId: {
            type: 'string',
            nullable: true,
            description: 'ID of parent comment for replies',
          },
          replies: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Array of reply comment IDs',
          },
          likedBy: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Array of user IDs who liked the comment',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
        },
      },
      Media: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['image', 'video', 'pdf', 'document', 'emoji'],
            description: 'Type of media',
          },
          url: {
            type: 'string',
            description: 'Media URL',
          },
          thumbnail: {
            type: 'string',
            description: 'Thumbnail URL for videos',
          },
          title: {
            type: 'string',
            description: 'Media title/filename',
          },
          size: {
            type: 'string',
            description: 'File size',
          },
          duration: {
            type: 'string',
            description: 'Video duration',
          },
          pageCount: {
            type: 'number',
            description: 'Number of pages for PDFs',
          },
          code: {
            type: 'string',
            description: 'Emoji code',
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'User ID',
          },
          clerkId: {
            type: 'string',
            description: 'Clerk authentication ID',
          },
          name: {
            type: 'string',
            description: 'User full name',
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email',
          },
          profilePicture: {
            type: 'string',
            description: 'Profile picture URL',
          },
          title: {
            type: 'string',
            description: 'User title/position',
          },
          department: {
            type: 'string',
            description: 'User department',
          },
        },
      },
      Assignment: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Assignment ID',
          },
          title: {
            type: 'string',
            description: 'Assignment title',
          },
          description: {
            type: 'string',
            description: 'Assignment description',
          },
          courseId: {
            type: 'string',
            description: 'Course ID this assignment belongs to',
          },
          dueDate: {
            type: 'string',
            format: 'date-time',
            description: 'Assignment due date',
          },
          totalPoints: {
            type: 'number',
            description: 'Total points for the assignment',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Creation timestamp',
          },
        },
      },
      Submission: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Submission ID',
          },
          assignmentId: {
            type: 'string',
            description: 'Assignment ID',
          },
          studentId: {
            type: 'string',
            description: 'Student user ID',
          },
          content: {
            type: 'string',
            description: 'Submission content',
          },
          attachments: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Attachment URLs',
          },
          grade: {
            type: 'number',
            nullable: true,
            description: 'Assigned grade',
          },
          feedback: {
            type: 'string',
            description: 'Instructor feedback',
          },
          submittedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Submission timestamp',
          },
          gradedAt: {
            type: 'string',
            format: 'date-time',
            nullable: true,
            description: 'Grading timestamp',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Error message',
          },
        },
      },
    },
  },
  security: [
    {
      ClerkAuth: [],
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/app/api/**/*.ts'], // Paths to files containing OpenAPI definitions
};

export const swaggerSpec = swaggerJSDoc(options); 