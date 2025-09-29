#!/usr/bin/env node

/**
 * PostgreSQL Backup Script
 * Creates automated backups of the Burnblack ITR database
 * Supports both local and S3 storage
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const { logger } = require('../src/utils/logger');
require('dotenv').config();

class DatabaseBackupService {
  constructor() {
    this.dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'burnblack_itr',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '123456'
    };

    this.s3Config = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: process.env.AWS_S3_BUCKET || 'burnblack-backups'
    };

    this.backupConfig = {
      retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30,
      compressionLevel: process.env.BACKUP_COMPRESSION_LEVEL || '9',
      s3Enabled: process.env.S3_BACKUP_ENABLED === 'true'
    };

    this.s3 = this.backupConfig.s3Enabled ? new AWS.S3(this.s3Config) : null;
  }

  /**
   * Create database backup
   */
  async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `burnblack_itr_backup_${timestamp}.sql`;
      const backupPath = path.join(__dirname, '..', 'backups', backupFileName);

      // Ensure backup directory exists
      const backupDir = path.dirname(backupPath);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      logger.info('Starting database backup', {
        database: this.dbConfig.database,
        backupPath,
        timestamp
      });

      // Create pg_dump command
      const pgDumpCommand = [
        'pg_dump',
        `--host=${this.dbConfig.host}`,
        `--port=${this.dbConfig.port}`,
        `--username=${this.dbConfig.user}`,
        `--dbname=${this.dbConfig.database}`,
        '--verbose',
        '--clean',
        '--if-exists',
        '--create',
        '--format=plain',
        '--no-password',
        `--file=${backupPath}`
      ].join(' ');

      // Set password environment variable
      const env = {
        ...process.env,
        PGPASSWORD: this.dbConfig.password
      };

      // Execute backup
      await this.executeCommand(pgDumpCommand, env);

      // Compress backup
      const compressedPath = await this.compressBackup(backupPath);

      // Upload to S3 if enabled
      if (this.backupConfig.s3Enabled) {
        await this.uploadToS3(compressedPath, backupFileName);
      }

      // Clean up old backups
      await this.cleanupOldBackups();

      logger.info('Database backup completed successfully', {
        backupPath: compressedPath,
        size: this.getFileSize(compressedPath)
      });

      return {
        success: true,
        backupPath: compressedPath,
        fileName: backupFileName,
        timestamp
      };

    } catch (error) {
      logger.error('Database backup failed', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Execute system command
   */
  executeCommand(command, env = process.env) {
    return new Promise((resolve, reject) => {
      exec(command, { env }, (error, stdout, stderr) => {
        if (error) {
          logger.error('Command execution failed', {
            command,
            error: error.message,
            stderr
          });
          reject(error);
        } else {
          logger.info('Command executed successfully', {
            command,
            stdout: stdout.substring(0, 500) // Log first 500 chars
          });
          resolve(stdout);
        }
      });
    });
  }

  /**
   * Compress backup file
   */
  async compressBackup(backupPath) {
    const compressedPath = `${backupPath}.gz`;
    const gzipCommand = `gzip -${this.backupConfig.compressionLevel} "${backupPath}"`;

    await this.executeCommand(gzipCommand);

    // Remove original file
    fs.unlinkSync(backupPath);

    return compressedPath;
  }

  /**
   * Upload backup to S3
   */
  async uploadToS3(filePath, fileName) {
    try {
      const fileContent = fs.readFileSync(filePath);
      const s3Key = `database-backups/${fileName}.gz`;

      const uploadParams = {
        Bucket: this.s3Config.bucket,
        Key: s3Key,
        Body: fileContent,
        ContentType: 'application/gzip',
        ServerSideEncryption: 'AES256',
        Metadata: {
          'backup-date': new Date().toISOString(),
          'database': this.dbConfig.database,
          'version': '1.0'
        }
      };

      const result = await this.s3.upload(uploadParams).promise();

      logger.info('Backup uploaded to S3 successfully', {
        s3Key,
        location: result.Location,
        size: fileContent.length
      });

      return result;

    } catch (error) {
      logger.error('S3 upload failed', {
        error: error.message,
        fileName
      });
      throw error;
    }
  }

  /**
   * Clean up old backups
   */
  async cleanupOldBackups() {
    try {
      const backupDir = path.join(__dirname, '..', 'backups');
      const files = fs.readdirSync(backupDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.backupConfig.retentionDays);

      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deletedCount++;
          logger.info('Deleted old backup', { file });
        }
      }

      // Clean up S3 backups
      if (this.backupConfig.s3Enabled) {
        await this.cleanupS3Backups(cutoffDate);
      }

      logger.info('Backup cleanup completed', {
        deletedLocalBackups: deletedCount,
        retentionDays: this.backupConfig.retentionDays
      });

    } catch (error) {
      logger.error('Backup cleanup failed', {
        error: error.message
      });
    }
  }

  /**
   * Clean up old S3 backups
   */
  async cleanupS3Backups(cutoffDate) {
    try {
      const listParams = {
        Bucket: this.s3Config.bucket,
        Prefix: 'database-backups/'
      };

      const objects = await this.s3.listObjectsV2(listParams).promise();
      let deletedCount = 0;

      for (const obj of objects.Contents || []) {
        if (obj.LastModified < cutoffDate) {
          await this.s3.deleteObject({
            Bucket: this.s3Config.bucket,
            Key: obj.Key
          }).promise();
          
          deletedCount++;
          logger.info('Deleted old S3 backup', { key: obj.Key });
        }
      }

      logger.info('S3 backup cleanup completed', {
        deletedS3Backups: deletedCount
      });

    } catch (error) {
      logger.error('S3 backup cleanup failed', {
        error: error.message
      });
    }
  }

  /**
   * Get file size in human readable format
   */
  getFileSize(filePath) {
    const stats = fs.statSync(filePath);
    const bytes = stats.size;
    
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Restore database from backup
   */
  async restoreFromBackup(backupPath) {
    try {
      logger.info('Starting database restore', { backupPath });

      // Check if backup file exists
      if (!fs.existsSync(backupPath)) {
        throw new Error(`Backup file not found: ${backupPath}`);
      }

      // Decompress if needed
      let sqlPath = backupPath;
      if (backupPath.endsWith('.gz')) {
        sqlPath = backupPath.replace('.gz', '');
        await this.executeCommand(`gunzip -c "${backupPath}" > "${sqlPath}"`);
      }

      // Create restore command
      const restoreCommand = [
        'psql',
        `--host=${this.dbConfig.host}`,
        `--port=${this.dbConfig.port}`,
        `--username=${this.dbConfig.user}`,
        `--dbname=${this.dbConfig.database}`,
        '--no-password',
        `--file=${sqlPath}`
      ].join(' ');

      const env = {
        ...process.env,
        PGPASSWORD: this.dbConfig.password
      };

      await this.executeCommand(restoreCommand, env);

      // Clean up temporary file
      if (sqlPath !== backupPath) {
        fs.unlinkSync(sqlPath);
      }

      logger.info('Database restore completed successfully');

      return { success: true };

    } catch (error) {
      logger.error('Database restore failed', {
        error: error.message,
        backupPath
      });
      throw error;
    }
  }
}

// CLI interface
if (require.main === module) {
  const backupService = new DatabaseBackupService();
  const command = process.argv[2];

  switch (command) {
    case 'backup':
      backupService.createBackup()
        .then(result => {
          console.log('Backup completed:', result);
          process.exit(0);
        })
        .catch(error => {
          console.error('Backup failed:', error.message);
          process.exit(1);
        });
      break;

    case 'restore':
      const backupPath = process.argv[3];
      if (!backupPath) {
        console.error('Please provide backup file path');
        process.exit(1);
      }
      
      backupService.restoreFromBackup(backupPath)
        .then(result => {
          console.log('Restore completed:', result);
          process.exit(0);
        })
        .catch(error => {
          console.error('Restore failed:', error.message);
          process.exit(1);
        });
      break;

    default:
      console.log('Usage: node backup.js [backup|restore] [backup-file-path]');
      process.exit(1);
  }
}

module.exports = DatabaseBackupService;
