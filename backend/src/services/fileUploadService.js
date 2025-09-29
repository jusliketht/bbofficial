// =====================================================
// FILE UPLOAD SERVICE
// =====================================================

const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const enterpriseLogger = require('../utils/logger');
const { AppError } = require('../middleware/errorHandler');

class FileUploadService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedTypes = {
      'application/pdf': '.pdf',
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'application/vnd.ms-excel': '.xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx'
    };
    
    this.initializeUploadDir();
    this.setupMulter();
  }

  initializeUploadDir() {
    try {
      fs.ensureDirSync(this.uploadDir);
      fs.ensureDirSync(path.join(this.uploadDir, 'documents'));
      fs.ensureDirSync(path.join(this.uploadDir, 'temp'));
      enterpriseLogger.info('Upload directories initialized');
    } catch (error) {
      enterpriseLogger.error('Failed to initialize upload directories', { error: error.message });
      throw new AppError('File upload service initialization failed', 500);
    }
  }

  setupMulter() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.join(this.uploadDir, 'temp');
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });

    const fileFilter = (req, file, cb) => {
      if (this.allowedTypes[file.mimetype]) {
        cb(null, true);
      } else {
        cb(new AppError(`File type ${file.mimetype} is not allowed`, 400), false);
      }
    };

    this.upload = multer({
      storage: storage,
      limits: {
        fileSize: this.maxFileSize,
        files: 10 // Max 10 files per request
      },
      fileFilter: fileFilter
    });
  }

  async uploadFile(file, userId, documentType, filingId = null) {
    try {
      // Validate file
      this.validateFile(file);

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const uniqueFilename = `${uuidv4()}-${Date.now()}${fileExtension}`;
      
      // Create user-specific directory
      const userDir = path.join(this.uploadDir, 'documents', userId);
      await fs.ensureDir(userDir);

      // Move file from temp to final location
      const tempPath = file.path;
      const finalPath = path.join(userDir, uniqueFilename);
      
      await fs.move(tempPath, finalPath);

      // Create file metadata
      const fileMetadata = {
        id: uuidv4(),
        originalName: file.originalname,
        filename: uniqueFilename,
        filePath: finalPath,
        mimeType: file.mimetype,
        size: file.size,
        documentType: documentType,
        userId: userId,
        filingId: filingId,
        uploadedAt: new Date().toISOString(),
        status: 'uploaded'
      };

      enterpriseLogger.info('File uploaded successfully', {
        fileId: fileMetadata.id,
        userId,
        documentType,
        fileName: file.originalname,
        fileSize: file.size
      });

      return fileMetadata;
    } catch (error) {
      enterpriseLogger.error('File upload failed', {
        error: error.message,
        userId,
        documentType,
        fileName: file.originalname
      });
      throw error;
    }
  }

  validateFile(file) {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new AppError(`File size exceeds maximum limit of ${this.maxFileSize / (1024 * 1024)}MB`, 400);
    }

    // Check file type
    if (!this.allowedTypes[file.mimetype]) {
      throw new AppError(`File type ${file.mimetype} is not supported`, 400);
    }

    // Check file extension
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = Object.values(this.allowedTypes);
    if (!allowedExtensions.includes(fileExtension)) {
      throw new AppError(`File extension ${fileExtension} is not allowed`, 400);
    }
  }

  async getFile(fileId, userId) {
    try {
      // In a real implementation, you would query the database for file metadata
      // For now, we'll simulate this
      const fileMetadata = {
        id: fileId,
        userId: userId,
        filePath: path.join(this.uploadDir, 'documents', userId, 'sample-file.pdf'),
        originalName: 'sample-file.pdf',
        mimeType: 'application/pdf'
      };

      if (!fs.existsSync(fileMetadata.filePath)) {
        throw new AppError('File not found', 404);
      }

      return fileMetadata;
    } catch (error) {
      enterpriseLogger.error('Failed to get file', { error: error.message, fileId, userId });
      throw error;
    }
  }

  async deleteFile(fileId, userId) {
    try {
      // In a real implementation, you would query the database for file metadata
      const fileMetadata = await this.getFile(fileId, userId);
      
      if (fs.existsSync(fileMetadata.filePath)) {
        await fs.remove(fileMetadata.filePath);
        enterpriseLogger.info('File deleted successfully', { fileId, userId });
      }

      return { success: true };
    } catch (error) {
      enterpriseLogger.error('Failed to delete file', { error: error.message, fileId, userId });
      throw error;
    }
  }

  async listUserFiles(userId, documentType = null) {
    try {
      const userDir = path.join(this.uploadDir, 'documents', userId);
      
      if (!fs.existsSync(userDir)) {
        return [];
      }

      const files = await fs.readdir(userDir);
      const fileList = [];

      for (const file of files) {
        const filePath = path.join(userDir, file);
        const stats = await fs.stat(filePath);
        
        fileList.push({
          id: file.split('-')[0], // Extract UUID from filename
          filename: file,
          originalName: file, // In real implementation, get from database
          size: stats.size,
          uploadedAt: stats.birthtime,
          documentType: documentType || 'general'
        });
      }

      return fileList;
    } catch (error) {
      enterpriseLogger.error('Failed to list user files', { error: error.message, userId });
      throw error;
    }
  }

  getMulterMiddleware() {
    return this.upload;
  }

  getFileStream(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new AppError('File not found', 404);
      }
      return fs.createReadStream(filePath);
    } catch (error) {
      enterpriseLogger.error('Failed to create file stream', { error: error.message, filePath });
      throw error;
    }
  }
}

module.exports = new FileUploadService();
