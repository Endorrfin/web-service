const QRService = require('../services/qr.service');
const { successResponse, errorResponse } = require('../../shared/utils/response');
const { body, param, query, validationResult } = require('express-validator');
const logger = require('../../shared/utils/logger');


class QrController {
  static createValidation = [
    body('name').notEmpty().isLength({ min: 1, max: 255}). withMessage('Name is required and must be 1-255 characters'),
    body('destinationType').isIn(['url', 'webpage']).withMessage('Destination type must be url or webpage'),
    body('destinationUrl').optional().isURL().withMessage('Invalid destination URL'),
    body('pageContent').optional().isObject().withMessage('Page content must be an object'),
    body('customDesign').optional().isObject().withMessage('Custom design must be an object')
  ];

  async createQRCode(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const userId = req.user._id;

      const quota = await QRService.checkQRQuota(userId);
      if (!quota.canCreateMore) {
        return errorResponse(res, 'QR code quota exceeded', 403, {
          quota
        });
      }

      const qrCode = await QRService.createQRCode(userId, req.body);

      return successResponse(res, 'QR code created successfully', {
        qrCode,
        quota: {
          ...quota,
          used: quota.used + 1,
          remaining: quota.remaining - 1
        }
      }, 201);
    } catch (error) {
      logger.error('QR creation controller error:', error);

      if (error.message === 'QR_CREATION_FAILED') {
        return errorResponse(res, 'Failed to create QR code', 500);
      }

      return errorResponse(res, 'Internal server error', 500);
    }
  }

  async getQRCode(req, res) {
    try {
      const userId = req.user._id;
      const { page, limit, search, isActive } = req.query;

      const result = await QRService.getUserQRCodes(userId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        search,
        isActive: isActive !== undefined ? isActive === 'true' : undefined
      });

      return successResponse(res, 'QR codes retrieved successfully', result);

    } catch (error) {
      logger.error('QR fetch controller error:', error);
      return errorResponse(res, 'Failed to fetch QR codes', 500);
    }
  }


  async getQRCode(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const qrCode = await QRService.getQRCodeById(id, userId);
      if (!qrCode) {
        return errorResponse(res, 'QR code not found', 404);
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const analytics = await QRService.getQRAnalytics(id, userId, {
        startDate: thirtyDaysAgo.toISOString(),
        endDate: new Date().toISOString()
      });

      return successResponse(res, 'QR code retrieved successfully', {
        qrCode,
        analytics
      });

    } catch (error) {
      logger.error('QR fetch single controller error:', error);
      return errorResponse(res, 'Failed to fetch QR code', 500);
    }
  }

  async trackScan(req, res) {
    try {
      const { id } = req.params;
      const scanData = {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        referer: req.get('Referer'),
        locationData: req.body.locationData
      };

      await QRService.trackQRScan(id, scanData);

      return successResponse(res, 'Scan tracked successfully');

    } catch (error) {
      logger.error('QR scan tracking error:', error);
      return successResponse(res, 'Scan processed');
    }
  }


  async updateQRCode(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const userId = req.user.id;

      const updatedQRCode = await QRService.updateQRCode(id, userId, req.body);

      return successResponse(res, 'QR code updated successfully', {
        qrCode: updatedQRCode
      });

    } catch (error) {
      logger.error('QR update controller error:', error);

      if (error.message === 'QR_NOT_FOUND') {
        return errorResponse(res, 'QR code not found', 404);
      }

      return errorResponse(res, 'Failed to update QR code', 500);
    }
  }


  async deleteQRCode(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await QRService.deleteQRCode(id, userId);

      return successResponse(res, 'QR code deleted successfully');

    } catch (error) {
      logger.error('QR delete controller error:', error);

      if (error.message === 'QR_NOT_FOUND') {
        return errorResponse(res, 'QR code not found', 404);
      }

      return errorResponse(res, 'Failed to delete QR code', 500);
    }
  }


  async getAnalytics(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { startDate, endDate } = req.query;

      const analytics = await QRService.getQRAnalytics(id, userId, {
        startDate,
        endDate
      });

      return successResponse(res, 'Analytics retrieved successfully', analytics);

    } catch (error) {
      logger.error('Analytics controller error:', error);

      if (error.message === 'QR_NOT_FOUND') {
        return errorResponse(res, 'QR code not found', 404);
      }

      return errorResponse(res, 'Failed to fetch analytics', 500);
    }
  }

}


module.exports = new QrController();






